/**
 * Rapid Assessment Orchestrator
 *
 * Streamlined orchestrator for Quick TRL Assessment product.
 * Runs only 3 agents (Technology, Claims, Synthesis) to produce
 * a 2-page executive summary in 48-72 hours turnaround.
 *
 * Target: $5K-$15K investor due diligence for emerging managers
 *
 * Output:
 * - Traffic light rating (GREEN / YELLOW / RED)
 * - Top 5 technical risks
 * - TRL assessment with justification
 * - Go/No-Go recommendation
 */

import { TechnologyDeepDiveAgent } from './technology-agent'
import { ClaimsValidationAgent } from './claims-agent'
import { FinalSynthesisAgent } from './synthesis-agent'
import type {
  AssessmentInput,
  ComponentOutput,
  ReportSection,
  ProgressCallback,
} from './base-agent'
import { detectRedFlags, type RedFlagReport } from '@/lib/validation/red-flags'

// ============================================================================
// Types
// ============================================================================

export type TrafficLightRating = 'GREEN' | 'YELLOW' | 'RED'

export interface RapidAssessmentConfig {
  /** Continue on component error */
  continueOnError?: boolean
  /** Maximum retries per component */
  maxRetries?: number
  /** Skip red flag detection (not recommended) */
  skipRedFlags?: boolean
}

export interface RapidAssessmentProgress {
  currentComponent: string
  componentProgress: number
  overallProgress: number
  completedComponents: string[]
  errors: Array<{ component: string; error: string }>
  startTime: number
}

export interface TechnicalRisk {
  id: string
  risk: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: 'thermodynamic' | 'trl' | 'benchmark' | 'data' | 'market'
  explanation: string
  mitigation?: string
}

export interface RapidAssessmentResult {
  assessmentId: string
  status: 'complete' | 'partial' | 'failed'

  // Traffic light rating
  rating: TrafficLightRating
  ratingJustification: string

  // TRL Assessment
  trl: number
  trlJustification: string
  trlConfidence: 'high' | 'medium' | 'low'

  // Top risks
  topRisks: TechnicalRisk[]

  // Red flag detection
  redFlags: RedFlagReport

  // Recommendation
  recommendation: 'PROCEED' | 'PROCEED_WITH_CAUTION' | 'DO_NOT_PROCEED'
  recommendationRationale: string

  // Executive summary
  executiveSummary: string

  // Key metrics extracted
  keyMetrics: Array<{
    name: string
    value: string
    benchmark?: string
    status: 'within_range' | 'above_benchmark' | 'below_benchmark' | 'no_benchmark'
  }>

  // Component outputs for detailed review
  components: ComponentOutput[]
  sections: ReportSection[]

  // Errors
  errors: Array<{ component: string; error: string }>

  // Timing
  duration: number
  metadata: {
    startTime: string
    endTime: string
    componentsRun: number
    componentsSuccessful: number
    componentsFailed: number
    mode: 'rapid'
  }
}

export type RapidStreamCallback = (event: RapidAssessmentStreamEvent) => void

export type RapidAssessmentStreamEvent =
  | { type: 'start'; assessmentId: string; totalComponents: number }
  | { type: 'component_start'; component: string; index: number }
  | { type: 'component_progress'; component: string; progress: number; message: string }
  | { type: 'component_complete'; component: string; output: ComponentOutput }
  | { type: 'component_error'; component: string; error: string }
  | { type: 'red_flags_detected'; redFlags: RedFlagReport }
  | { type: 'overall_progress'; progress: number }
  | { type: 'complete'; result: RapidAssessmentResult }
  | { type: 'error'; error: string }

// ============================================================================
// Rapid Orchestrator Class
// ============================================================================

export class RapidAssessmentOrchestrator {
  private config: RapidAssessmentConfig
  private input: AssessmentInput
  private outputs: Map<string, ComponentOutput> = new Map()
  private errors: Array<{ component: string; error: string }> = []
  private startTime: number = 0

  constructor(input: AssessmentInput, config: RapidAssessmentConfig = {}) {
    this.input = input
    this.config = {
      continueOnError: true,
      maxRetries: 1,
      skipRedFlags: false,
      ...config,
    }
  }

  /**
   * Execute rapid assessment (3 agents only)
   */
  async execute(onProgress?: ProgressCallback): Promise<RapidAssessmentResult> {
    this.startTime = Date.now()
    this.outputs.clear()
    this.errors = []

    const components = this.getComponentsToRun()
    const totalComponents = components.length

    onProgress?.(0, 'Starting rapid assessment...')

    // Step 1: Run red flag detection first (fast, synchronous)
    onProgress?.(5, 'Checking for physics violations...')
    const redFlags = this.config.skipRedFlags
      ? { hasRedFlags: false, flags: [], summary: 'Skipped', executionTimeMs: 0 }
      : await detectRedFlags(this.input)

    if (redFlags.hasRedFlags && redFlags.flags.some((f: { severity: string }) => f.severity === 'critical')) {
      onProgress?.(10, 'Critical red flags detected - proceeding with caution...')
    }

    // Step 2: Run 3 agents sequentially
    for (let i = 0; i < components.length; i++) {
      const { id, name, createAgent } = components[i]

      const componentStartTime = Date.now()
      // Red flags take 10%, remaining 90% split among 3 components
      const baseProgress = 10 + (i / totalComponents) * 85
      const componentWeight = 85 / totalComponents

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
          return this.buildResult('failed', redFlags)
        }
      }
    }

    onProgress?.(100, 'Rapid assessment complete')
    return this.buildResult(this.errors.length === 0 ? 'complete' : 'partial', redFlags)
  }

  /**
   * Execute with streaming events
   */
  async executeWithStreaming(onEvent: RapidStreamCallback): Promise<RapidAssessmentResult> {
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

    // Step 1: Red flag detection
    const redFlags = this.config.skipRedFlags
      ? { hasRedFlags: false, flags: [], summary: 'Skipped', executionTimeMs: 0 }
      : await detectRedFlags(this.input)

    onEvent({
      type: 'red_flags_detected',
      redFlags,
    })

    // Step 2: Run agents
    for (let i = 0; i < components.length; i++) {
      const { id, name, createAgent } = components[i]

      onEvent({
        type: 'component_start',
        component: id,
        index: i,
      })

      try {
        const agent = createAgent(this.input, this.outputs)

        const componentProgress: ProgressCallback = (progress, message) => {
          onEvent({
            type: 'component_progress',
            component: id,
            progress,
            message,
          })

          const baseProgress = 10 + (i / totalComponents) * 85
          const componentWeight = 85 / totalComponents
          const overallProgress = baseProgress + (progress / 100) * componentWeight

          onEvent({
            type: 'overall_progress',
            progress: overallProgress,
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
            const result = this.buildResult('failed', redFlags)
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
          const result = this.buildResult('failed', redFlags)
          onEvent({ type: 'complete', result })
          return result
        }
      }
    }

    const result = this.buildResult(this.errors.length === 0 ? 'complete' : 'partial', redFlags)
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
        name: 'Technology Analysis',
        createAgent: (input) => new TechnologyDeepDiveAgent(input),
      },
      {
        id: 'claims-validation',
        name: 'Claims Validation',
        createAgent: (input) => new ClaimsValidationAgent(input),
      },
      {
        id: 'rapid-synthesis',
        name: 'Rapid Synthesis',
        createAgent: (input, outputs) => {
          const agent = new FinalSynthesisAgent(input)
          agent.setPreviousOutputs({
            technologyDeepDive: outputs.get('technology-deep-dive'),
            claimsValidation: outputs.get('claims-validation'),
            // Other components not run in rapid mode
          })
          return agent
        },
      },
    ]
  }

  private buildResult(
    status: 'complete' | 'partial' | 'failed',
    redFlags: RedFlagReport
  ): RapidAssessmentResult {
    const endTime = Date.now()
    const duration = endTime - this.startTime

    // Collect all sections from component outputs
    const allSections: ReportSection[] = []
    for (const output of this.outputs.values()) {
      allSections.push(...output.sections)
    }

    // Extract data from component outputs
    const technologyOutput = this.outputs.get('technology-deep-dive')
    const claimsOutput = this.outputs.get('claims-validation')
    const synthesisOutput = this.outputs.get('rapid-synthesis')

    // Extract TRL from technology output
    const techContent = technologyOutput?.content as Record<string, unknown> | undefined
    const trlAssessment = techContent?.trlAssessment as {
      currentTRL: number
      justification: string
      confidence: 'high' | 'medium' | 'low'
    } | undefined

    const trl = trlAssessment?.currentTRL || 3
    const trlJustification = trlAssessment?.justification || 'Unable to determine TRL'
    const trlConfidence = trlAssessment?.confidence || 'low'

    // Extract risks from claims validation and synthesis
    const topRisks = this.extractTopRisks(claimsOutput, synthesisOutput, redFlags)

    // Calculate traffic light rating
    const { rating, justification } = this.calculateTrafficLight(
      redFlags,
      topRisks,
      trl,
      synthesisOutput
    )

    // Generate recommendation
    const { recommendation, rationale } = this.generateRecommendation(
      rating,
      redFlags,
      topRisks
    )

    // Generate executive summary
    const executiveSummary = this.generateExecutiveSummary(
      rating,
      trl,
      topRisks,
      recommendation,
      synthesisOutput
    )

    // Extract key metrics
    const keyMetrics = this.extractKeyMetrics(technologyOutput, claimsOutput)

    return {
      assessmentId: this.input.assessmentId,
      status,
      rating,
      ratingJustification: justification,
      trl,
      trlJustification,
      trlConfidence,
      topRisks: topRisks.slice(0, 5), // Top 5 only
      redFlags,
      recommendation,
      recommendationRationale: rationale,
      executiveSummary,
      keyMetrics,
      components: Array.from(this.outputs.values()),
      sections: allSections,
      errors: this.errors,
      duration,
      metadata: {
        startTime: new Date(this.startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        componentsRun: this.outputs.size + this.errors.length,
        componentsSuccessful: this.outputs.size,
        componentsFailed: this.errors.length,
        mode: 'rapid',
      },
    }
  }

  private extractTopRisks(
    claimsOutput: ComponentOutput | undefined,
    synthesisOutput: ComponentOutput | undefined,
    redFlags: RedFlagReport
  ): TechnicalRisk[] {
    const risks: TechnicalRisk[] = []

    // Add red flags as critical/high risks
    for (const flag of redFlags.flags) {
      risks.push({
        id: `rf-${flag.id}`,
        risk: flag.description,
        severity: flag.severity === 'critical' ? 'critical' : 'high',
        category: 'thermodynamic',
        explanation: flag.explanation,
        mitigation: flag.recommendation,
      })
    }

    // Extract risks from claims validation
    const claimsContent = claimsOutput?.content as Record<string, unknown> | undefined
    const validationResults = claimsContent?.validationResults as Array<{
      claim: string
      validated: boolean
      confidence: string
      notes: string
    }> | undefined

    if (validationResults) {
      for (const result of validationResults) {
        if (!result.validated || result.confidence === 'low') {
          risks.push({
            id: `claim-${risks.length}`,
            risk: `Unvalidated claim: ${result.claim}`,
            severity: result.validated ? 'medium' : 'high',
            category: 'data',
            explanation: result.notes,
          })
        }
      }
    }

    // Extract risks from synthesis
    const synthesisContent = synthesisOutput?.content as Record<string, unknown> | undefined
    const riskMatrix = synthesisContent?.riskMatrix as Array<{
      risk: string
      probability: string
      impact: string
      mitigation: string
      category: string
    }> | undefined

    if (riskMatrix) {
      for (const risk of riskMatrix) {
        const severity = this.mapRiskSeverity(risk.probability, risk.impact)
        risks.push({
          id: `synth-${risks.length}`,
          risk: risk.risk,
          severity,
          category: risk.category as TechnicalRisk['category'],
          explanation: `Probability: ${risk.probability}, Impact: ${risk.impact}`,
          mitigation: risk.mitigation,
        })
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return risks.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
  }

  private mapRiskSeverity(probability: string, impact: string): TechnicalRisk['severity'] {
    const probScore = probability === 'high' ? 3 : probability === 'medium' ? 2 : 1
    const impactScore = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1
    const combined = probScore * impactScore

    if (combined >= 9) return 'critical'
    if (combined >= 6) return 'high'
    if (combined >= 3) return 'medium'
    return 'low'
  }

  private calculateTrafficLight(
    redFlags: RedFlagReport,
    risks: TechnicalRisk[],
    trl: number,
    synthesisOutput: ComponentOutput | undefined
  ): { rating: TrafficLightRating; justification: string } {
    // RED: Critical red flags or multiple high-severity issues
    const criticalFlags = redFlags.flags.filter((f: { severity: string }) => f.severity === 'critical')
    const criticalRisks = risks.filter(r => r.severity === 'critical')
    const highRisks = risks.filter(r => r.severity === 'high')

    if (criticalFlags.length > 0) {
      return {
        rating: 'RED',
        justification: `Critical physics violations detected: ${criticalFlags.map((f: { description: string }) => f.description).join('; ')}`,
      }
    }

    if (criticalRisks.length > 0 || highRisks.length >= 3) {
      return {
        rating: 'RED',
        justification: `${criticalRisks.length} critical and ${highRisks.length} high-severity risks identified`,
      }
    }

    // YELLOW: Some concerns but no dealbreakers
    if (highRisks.length > 0 || redFlags.hasRedFlags) {
      return {
        rating: 'YELLOW',
        justification: `${highRisks.length} high-severity risks require further investigation. ${redFlags.summary}`,
      }
    }

    // TRL-based concerns
    if (trl <= 3) {
      return {
        rating: 'YELLOW',
        justification: `Technology at TRL ${trl} - early stage with significant development risk`,
      }
    }

    // Check synthesis rating if available
    const synthesisContent = synthesisOutput?.content as Record<string, unknown> | undefined
    const assessmentRating = synthesisContent?.assessmentRating as {
      overall: string
      score: number
    } | undefined

    if (assessmentRating?.overall === 'concerning' || assessmentRating?.overall === 'not_recommended') {
      return {
        rating: 'RED',
        justification: `Assessment rating: ${assessmentRating.overall} (score: ${assessmentRating.score}/100)`,
      }
    }

    if (assessmentRating?.overall === 'conditional') {
      return {
        rating: 'YELLOW',
        justification: `Assessment rating: conditional (score: ${assessmentRating.score}/100)`,
      }
    }

    // GREEN: No major issues
    return {
      rating: 'GREEN',
      justification: 'No critical issues identified. Technology claims are plausible and within physical limits.',
    }
  }

  private generateRecommendation(
    rating: TrafficLightRating,
    redFlags: RedFlagReport,
    risks: TechnicalRisk[]
  ): { recommendation: RapidAssessmentResult['recommendation']; rationale: string } {
    if (rating === 'RED') {
      const criticalIssues = [
        ...redFlags.flags.filter((f: { severity: string }) => f.severity === 'critical').map((f: { description: string }) => f.description),
        ...risks.filter(r => r.severity === 'critical').map(r => r.risk),
      ]
      return {
        recommendation: 'DO_NOT_PROCEED',
        rationale: `Critical issues prevent investment: ${criticalIssues.slice(0, 3).join('; ')}. Recommend passing on this opportunity.`,
      }
    }

    if (rating === 'YELLOW') {
      const concerns = risks.filter(r => r.severity === 'high').map(r => r.risk)
      return {
        recommendation: 'PROCEED_WITH_CAUTION',
        rationale: `Technology shows promise but requires deeper diligence on: ${concerns.slice(0, 3).join('; ')}. Recommend full technical assessment before investment decision.`,
      }
    }

    return {
      recommendation: 'PROCEED',
      rationale: 'Technology claims are validated within physical limits. Recommend proceeding to full due diligence and commercial evaluation.',
    }
  }

  private generateExecutiveSummary(
    rating: TrafficLightRating,
    trl: number,
    risks: TechnicalRisk[],
    recommendation: RapidAssessmentResult['recommendation'],
    synthesisOutput: ComponentOutput | undefined
  ): string {
    const ratingEmoji = rating === 'GREEN' ? 'PASS' : rating === 'YELLOW' ? 'CONDITIONAL' : 'FAIL'
    const criticalCount = risks.filter(r => r.severity === 'critical').length
    const highCount = risks.filter(r => r.severity === 'high').length

    let summary = `**Quick TRL Assessment: ${ratingEmoji}**\n\n`
    summary += `**Technology:** ${this.input.title}\n`
    summary += `**TRL:** ${trl}/9\n`
    summary += `**Rating:** ${rating}\n\n`

    summary += `**Risk Summary:** ${criticalCount} critical, ${highCount} high-severity risks identified.\n\n`

    if (risks.length > 0) {
      summary += `**Top Risks:**\n`
      for (const risk of risks.slice(0, 3)) {
        summary += `- [${risk.severity.toUpperCase()}] ${risk.risk}\n`
      }
      summary += '\n'
    }

    summary += `**Recommendation:** ${recommendation.replace(/_/g, ' ')}\n\n`

    // Add synthesis insights if available
    const synthesisContent = synthesisOutput?.content as Record<string, unknown> | undefined
    const thesis = synthesisContent?.investmentThesis as { summary: string } | undefined
    if (thesis?.summary) {
      summary += `**Investment Thesis:** ${thesis.summary}\n`
    }

    return summary
  }

  private extractKeyMetrics(
    technologyOutput: ComponentOutput | undefined,
    claimsOutput: ComponentOutput | undefined
  ): RapidAssessmentResult['keyMetrics'] {
    const metrics: RapidAssessmentResult['keyMetrics'] = []

    // Extract from technology output
    const techContent = technologyOutput?.content as Record<string, unknown> | undefined
    const performanceMetrics = techContent?.performanceMetrics as Record<string, {
      value: number
      unit: string
      benchmark?: { value: number; source: string }
    }> | undefined

    if (performanceMetrics) {
      for (const [name, data] of Object.entries(performanceMetrics)) {
        let status: RapidAssessmentResult['keyMetrics'][0]['status'] = 'no_benchmark'
        let benchmark: string | undefined

        if (data.benchmark) {
          benchmark = `${data.benchmark.value} ${data.unit} (${data.benchmark.source})`
          if (data.value > data.benchmark.value * 1.1) {
            status = 'above_benchmark'
          } else if (data.value < data.benchmark.value * 0.9) {
            status = 'below_benchmark'
          } else {
            status = 'within_range'
          }
        }

        metrics.push({
          name,
          value: `${data.value} ${data.unit}`,
          benchmark,
          status,
        })
      }
    }

    return metrics
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Run a rapid assessment (3 agents only)
 */
export async function runRapidAssessment(
  input: AssessmentInput,
  config?: RapidAssessmentConfig,
  onProgress?: ProgressCallback
): Promise<RapidAssessmentResult> {
  const orchestrator = new RapidAssessmentOrchestrator(input, config)
  return orchestrator.execute(onProgress)
}

/**
 * Run rapid assessment with streaming events
 */
export async function runRapidAssessmentWithStreaming(
  input: AssessmentInput,
  config: RapidAssessmentConfig,
  onEvent: RapidStreamCallback
): Promise<RapidAssessmentResult> {
  const orchestrator = new RapidAssessmentOrchestrator(input, config)
  return orchestrator.executeWithStreaming(onEvent)
}

/**
 * Estimate rapid assessment duration
 */
export function estimateRapidAssessmentDuration(input: AssessmentInput): {
  minMinutes: number
  maxMinutes: number
  components: number
} {
  const components = 3
  const claimsCount = input.claims?.length || 3

  // Base time per component: 1-3 minutes (faster than full assessment)
  const baseMinPerComponent = 1
  const maxMinPerComponent = 3

  // Add time for claims validation
  const claimsMultiplier = 1 + (claimsCount - 3) * 0.05

  return {
    minMinutes: Math.ceil(components * baseMinPerComponent * claimsMultiplier),
    maxMinutes: Math.ceil(components * maxMinPerComponent * claimsMultiplier),
    components,
  }
}
