/**
 * Assessment Orchestrator
 *
 * Coordinates the execution of all 7 assessment agents in sequence,
 * managing progress reporting, error handling, and result aggregation.
 *
 * Execution Order:
 * 1. Technology Deep Dive
 * 2. Claims Validation
 * 3. Performance Simulation
 * 4. System Integration
 * 5. Techno-Economic Analysis
 * 6. Improvement Opportunities
 * 7. Final Synthesis (uses all previous outputs)
 */

import { TechnologyDeepDiveAgent } from './technology-agent'
import { ClaimsValidationAgent } from './claims-agent'
import { PerformanceSimulationAgent } from './simulation-agent'
import { SystemIntegrationAgent } from './integration-agent'
import { TEAAgent } from './tea-agent'
import { ImprovementOpportunitiesAgent } from './improvement-agent'
import { FinalSynthesisAgent } from './synthesis-agent'
import type {
  AssessmentInput,
  ComponentOutput,
  ReportSection,
  ProgressCallback,
} from './base-agent'

// ============================================================================
// Types
// ============================================================================

export interface OrchestratorConfig {
  /** Run components in parallel where possible (not recommended for accuracy) */
  parallelExecution?: boolean
  /** Skip specific components */
  skipComponents?: string[]
  /** Continue on component error */
  continueOnError?: boolean
  /** Maximum retries per component */
  maxRetries?: number
}

export interface AssessmentProgress {
  currentComponent: string
  componentProgress: number
  overallProgress: number
  completedComponents: string[]
  errors: Array<{ component: string; error: string }>
  startTime: number
  estimatedTimeRemaining?: number
}

export interface AssessmentResult {
  assessmentId: string
  status: 'complete' | 'partial' | 'failed'
  rating?: 'promising' | 'conditional' | 'concerning' | 'not_recommended'
  ratingScore?: number
  components: ComponentOutput[]
  sections: ReportSection[]
  summary?: {
    keyStrengths: string[]
    keyRisks: string[]
    nextSteps: string[]
  }
  errors: Array<{ component: string; error: string }>
  duration: number
  metadata: {
    startTime: string
    endTime: string
    componentsRun: number
    componentsSuccessful: number
    componentsFailed: number
  }
}

export type StreamCallback = (event: AssessmentStreamEvent) => void

export type AssessmentStreamEvent =
  | { type: 'start'; assessmentId: string; totalComponents: number }
  | { type: 'component_start'; component: string; index: number }
  | { type: 'component_progress'; component: string; progress: number; message: string }
  | { type: 'component_complete'; component: string; output: ComponentOutput }
  | { type: 'component_error'; component: string; error: string }
  | { type: 'overall_progress'; progress: number; estimatedTimeRemaining: number }
  | { type: 'complete'; result: AssessmentResult }
  | { type: 'error'; error: string }

// ============================================================================
// Orchestrator Class
// ============================================================================

export class AssessmentOrchestrator {
  private config: OrchestratorConfig
  private input: AssessmentInput
  private outputs: Map<string, ComponentOutput> = new Map()
  private errors: Array<{ component: string; error: string }> = []
  private startTime: number = 0

  constructor(input: AssessmentInput, config: OrchestratorConfig = {}) {
    this.input = input
    this.config = {
      parallelExecution: false,
      continueOnError: true,
      maxRetries: 1,
      ...config,
    }
  }

  /**
   * Execute all assessment components
   */
  async execute(onProgress?: ProgressCallback): Promise<AssessmentResult> {
    this.startTime = Date.now()
    this.outputs.clear()
    this.errors = []

    const components = this.getComponentsToRun()
    const totalComponents = components.length

    onProgress?.(0, 'Starting assessment...')

    for (let i = 0; i < components.length; i++) {
      const { id, name, createAgent } = components[i]

      if (this.config.skipComponents?.includes(id)) {
        continue
      }

      const componentStartTime = Date.now()
      const baseProgress = (i / totalComponents) * 100
      const componentWeight = 100 / totalComponents

      onProgress?.(baseProgress, `Starting ${name}...`)

      try {
        const agent = createAgent(this.input, this.outputs)

        // Create progress callback for component
        const componentProgress: ProgressCallback = (progress, message) => {
          const overallProgress = baseProgress + (progress / 100) * componentWeight
          onProgress?.(overallProgress, `[${name}] ${message}`)
        }

        // Execute with retries
        let output: ComponentOutput | null = null
        let lastError: Error | null = null

        for (let attempt = 0; attempt <= (this.config.maxRetries || 0); attempt++) {
          try {
            output = await agent.execute(componentProgress)
            break
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
            if (attempt < (this.config.maxRetries || 0)) {
              onProgress?.(baseProgress, `[${name}] Retrying... (attempt ${attempt + 2})`)
            }
          }
        }

        if (output && output.status === 'complete') {
          this.outputs.set(id, output)
        } else if (output && output.status === 'error') {
          this.errors.push({ component: id, error: output.error || 'Unknown error' })
          if (!this.config.continueOnError) {
            throw new Error(`Component ${name} failed: ${output.error}`)
          }
        } else if (lastError) {
          this.errors.push({ component: id, error: lastError.message })
          if (!this.config.continueOnError) {
            throw lastError
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.errors.push({ component: id, error: errorMessage })

        if (!this.config.continueOnError) {
          return this.buildResult('failed')
        }
      }
    }

    onProgress?.(100, 'Assessment complete')
    return this.buildResult(this.errors.length === 0 ? 'complete' : 'partial')
  }

  /**
   * Execute with streaming events
   */
  async executeWithStreaming(onEvent: StreamCallback): Promise<AssessmentResult> {
    this.startTime = Date.now()
    this.outputs.clear()
    this.errors = []

    const components = this.getComponentsToRun()
    const totalComponents = components.length

    onEvent({
      type: 'start',
      assessmentId: this.input.assessmentId,
      totalComponents,
    })

    for (let i = 0; i < components.length; i++) {
      const { id, name, createAgent } = components[i]

      if (this.config.skipComponents?.includes(id)) {
        continue
      }

      onEvent({
        type: 'component_start',
        component: id,
        index: i,
      })

      try {
        const agent = createAgent(this.input, this.outputs)

        // Create progress callback for streaming
        const componentProgress: ProgressCallback = (progress, message) => {
          onEvent({
            type: 'component_progress',
            component: id,
            progress,
            message,
          })

          // Calculate overall progress
          const baseProgress = (i / totalComponents) * 100
          const componentWeight = 100 / totalComponents
          const overallProgress = baseProgress + (progress / 100) * componentWeight

          // Estimate time remaining
          const elapsed = Date.now() - this.startTime
          const rate = overallProgress / elapsed
          const remaining = rate > 0 ? (100 - overallProgress) / rate : 0

          onEvent({
            type: 'overall_progress',
            progress: overallProgress,
            estimatedTimeRemaining: remaining,
          })
        }

        const output = await agent.execute(componentProgress)

        if (output.status === 'complete') {
          this.outputs.set(id, output)
          onEvent({
            type: 'component_complete',
            component: id,
            output,
          })
        } else {
          this.errors.push({ component: id, error: output.error || 'Unknown error' })
          onEvent({
            type: 'component_error',
            component: id,
            error: output.error || 'Unknown error',
          })

          if (!this.config.continueOnError) {
            const result = this.buildResult('failed')
            onEvent({ type: 'complete', result })
            return result
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        this.errors.push({ component: id, error: errorMessage })
        onEvent({
          type: 'component_error',
          component: id,
          error: errorMessage,
        })

        if (!this.config.continueOnError) {
          const result = this.buildResult('failed')
          onEvent({ type: 'complete', result })
          return result
        }
      }
    }

    const result = this.buildResult(this.errors.length === 0 ? 'complete' : 'partial')
    onEvent({ type: 'complete', result })
    return result
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private getComponentsToRun(): Array<{
    id: string
    name: string
    createAgent: (input: AssessmentInput, outputs: Map<string, ComponentOutput>) => {
      execute: (onProgress?: ProgressCallback) => Promise<ComponentOutput>
    }
  }> {
    return [
      {
        id: 'technology-deep-dive',
        name: 'Technology Deep Dive',
        createAgent: (input) => new TechnologyDeepDiveAgent(input),
      },
      {
        id: 'claims-validation',
        name: 'Claims Validation',
        createAgent: (input) => new ClaimsValidationAgent(input),
      },
      {
        id: 'performance-simulation',
        name: 'Performance Simulation',
        createAgent: (input) => new PerformanceSimulationAgent(input),
      },
      {
        id: 'system-integration',
        name: 'System Integration',
        createAgent: (input) => new SystemIntegrationAgent(input),
      },
      {
        id: 'tea-analysis',
        name: 'Techno-Economic Analysis',
        createAgent: (input) => new TEAAgent(input),
      },
      {
        id: 'improvement-opportunities',
        name: 'Improvement Opportunities',
        createAgent: (input) => new ImprovementOpportunitiesAgent(input),
      },
      {
        id: 'final-synthesis',
        name: 'Final Synthesis',
        createAgent: (input, outputs) => {
          const agent = new FinalSynthesisAgent(input)
          agent.setPreviousOutputs({
            technologyDeepDive: outputs.get('technology-deep-dive'),
            claimsValidation: outputs.get('claims-validation'),
            performanceSimulation: outputs.get('performance-simulation'),
            systemIntegration: outputs.get('system-integration'),
            teaAnalysis: outputs.get('tea-analysis'),
            improvementOpportunities: outputs.get('improvement-opportunities'),
          })
          return agent
        },
      },
    ]
  }

  private buildResult(status: 'complete' | 'partial' | 'failed'): AssessmentResult {
    const endTime = Date.now()
    const duration = endTime - this.startTime

    // Collect all sections from component outputs
    const allSections: ReportSection[] = []
    for (const output of this.outputs.values()) {
      allSections.push(...output.sections)
    }

    // Extract rating from synthesis output
    const synthesisOutput = this.outputs.get('final-synthesis')
    let rating: AssessmentResult['rating']
    let ratingScore: number | undefined
    let summary: AssessmentResult['summary']

    if (synthesisOutput) {
      const content = synthesisOutput.content as Record<string, unknown>
      const assessmentRating = content.assessmentRating as {
        overall: string
        score: number
        keyStrengths: string[]
      } | undefined

      if (assessmentRating) {
        rating = assessmentRating.overall as AssessmentResult['rating']
        ratingScore = assessmentRating.score
      }

      const recommendations = content.recommendations as Array<{ recommendation: string }> | undefined
      const ratingData = content.assessmentRating as {
        keyStrengths: string[]
        keyWeaknesses: string[]
      } | undefined

      summary = {
        keyStrengths: ratingData?.keyStrengths || [],
        keyRisks: ratingData?.keyWeaknesses || [],
        nextSteps: recommendations?.slice(0, 5).map(r => r.recommendation) || [],
      }
    }

    return {
      assessmentId: this.input.assessmentId,
      status,
      rating,
      ratingScore,
      components: Array.from(this.outputs.values()),
      sections: allSections,
      summary,
      errors: this.errors,
      duration,
      metadata: {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        componentsRun: this.outputs.size + this.errors.length,
        componentsSuccessful: this.outputs.size,
        componentsFailed: this.errors.length,
      },
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Run a complete assessment
 */
export async function runAssessment(
  input: AssessmentInput,
  config?: OrchestratorConfig,
  onProgress?: ProgressCallback
): Promise<AssessmentResult> {
  const orchestrator = new AssessmentOrchestrator(input, config)
  return orchestrator.execute(onProgress)
}

/**
 * Run assessment with streaming events
 */
export async function runAssessmentWithStreaming(
  input: AssessmentInput,
  config: OrchestratorConfig,
  onEvent: StreamCallback
): Promise<AssessmentResult> {
  const orchestrator = new AssessmentOrchestrator(input, config)
  return orchestrator.executeWithStreaming(onEvent)
}

/**
 * Estimate assessment duration based on complexity
 */
export function estimateAssessmentDuration(input: AssessmentInput): {
  minMinutes: number
  maxMinutes: number
  components: number
} {
  const components = 7
  const claimsCount = input.claims?.length || 3
  const documentsCount = input.documents?.length || 0

  // Base time per component: 2-5 minutes
  const baseMinPerComponent = 2
  const maxMinPerComponent = 5

  // Add time for claims validation
  const claimsMultiplier = 1 + (claimsCount - 3) * 0.1

  // Add time for document processing
  const docsMultiplier = 1 + documentsCount * 0.15

  const totalMultiplier = claimsMultiplier * docsMultiplier

  return {
    minMinutes: Math.ceil(components * baseMinPerComponent * totalMultiplier),
    maxMinutes: Math.ceil(components * maxMinPerComponent * totalMultiplier),
    components,
  }
}
