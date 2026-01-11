/**
 * Debug Logger for Assessment System
 *
 * Provides structured event logging for:
 * - Agent execution tracking
 * - Metric extraction attempts
 * - Validation results
 * - Performance metrics
 *
 * Outputs debug files for analysis and troubleshooting.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// ============================================================================
// Types
// ============================================================================

export type EventType =
  | 'start'
  | 'progress'
  | 'complete'
  | 'error'
  | 'extraction'
  | 'validation'
  | 'sanity_check'
  | 'benchmark_check'
  | 'ai_call'
  | 'ai_response'

export interface DebugEvent {
  timestamp: string
  assessmentId: string
  componentId: string
  eventType: EventType
  message: string
  data: Record<string, unknown>
}

export interface ExtractionAttempt {
  metricId: string
  componentId: string
  paths: string[][]
  foundAt: string[] | null
  rawValue: unknown
  transformedValue: number | null
  success: boolean
  error?: string
}

export interface SanityCheckResult {
  metricId: string
  value: number
  valid: boolean
  expectedRange?: { min: number; max: number }
  action?: 'pass' | 'warn' | 'reject'
  message?: string
}

export interface ValidationResult {
  componentId: string
  isValid: boolean
  score: number
  missingFields: string[]
  invalidValues: Array<{ field: string; reason: string }>
  warnings: string[]
}

export interface AICallMetrics {
  componentId: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  latencyMs: number
  model: string
  success: boolean
  error?: string
}

export interface ComponentDebugInfo {
  componentId: string
  componentName: string
  startTime: number
  endTime: number
  duration: number
  tokensUsed: number
  promptTokens: number
  completionTokens: number
  retries: number
  aiCalls: AICallMetrics[]
  extractionAttempts: ExtractionAttempt[]
  sanityChecks: SanityCheckResult[]
  validationResult?: ValidationResult
  status: 'success' | 'error' | 'partial'
  error?: string
}

export interface PerformanceMetrics {
  totalDuration: number
  componentDurations: Record<string, number>
  tokenUsage: {
    total: number
    byComponent: Record<string, number>
    estimatedCost: number
  }
  extractionStats: {
    totalAttempts: number
    successful: number
    failed: number
    successRate: number
    byMetric: Record<string, { attempts: number; successes: number }>
  }
  sanityCheckStats: {
    passed: number
    warned: number
    rejected: number
  }
}

export interface DebugReport {
  assessmentId: string
  timestamp: string
  events: DebugEvent[]
  components: ComponentDebugInfo[]
  performance: PerformanceMetrics
  summary: {
    totalEvents: number
    totalComponents: number
    successfulComponents: number
    failedComponents: number
    totalExtractions: number
    successfulExtractions: number
    overallStatus: 'success' | 'partial' | 'failure'
  }
}

// ============================================================================
// Debug Logger Class
// ============================================================================

export class AssessmentDebugLogger {
  private assessmentId: string
  private events: DebugEvent[] = []
  private componentInfo: Map<string, ComponentDebugInfo> = new Map()
  private extractionAttempts: ExtractionAttempt[] = []
  private sanityChecks: SanityCheckResult[] = []
  private aiCalls: AICallMetrics[] = []
  private startTime: number

  constructor(assessmentId: string) {
    this.assessmentId = assessmentId
    this.startTime = Date.now()
  }

  // --------------------------------------------------------------------------
  // Event Logging
  // --------------------------------------------------------------------------

  private log(
    eventType: EventType,
    componentId: string,
    message: string,
    data: Record<string, unknown> = {}
  ): void {
    const event: DebugEvent = {
      timestamp: new Date().toISOString(),
      assessmentId: this.assessmentId,
      componentId,
      eventType,
      message,
      data,
    }
    this.events.push(event)

    // Console output for real-time debugging
    const prefix = `[${eventType.toUpperCase()}][${componentId}]`
    console.log(`${prefix} ${message}`)
  }

  // --------------------------------------------------------------------------
  // Component Lifecycle
  // --------------------------------------------------------------------------

  logComponentStart(componentId: string, componentName: string): void {
    this.log('start', componentId, `Starting ${componentName}`)

    this.componentInfo.set(componentId, {
      componentId,
      componentName,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      tokensUsed: 0,
      promptTokens: 0,
      completionTokens: 0,
      retries: 0,
      aiCalls: [],
      extractionAttempts: [],
      sanityChecks: [],
      status: 'success',
    })
  }

  logComponentProgress(componentId: string, progress: number, message: string): void {
    this.log('progress', componentId, `${progress}% - ${message}`, { progress })
  }

  logComponentComplete(componentId: string, status: 'success' | 'error' | 'partial', error?: string): void {
    const info = this.componentInfo.get(componentId)
    if (info) {
      info.endTime = Date.now()
      info.duration = info.endTime - info.startTime
      info.status = status
      if (error) info.error = error

      // Aggregate AI call metrics
      const componentAICalls = this.aiCalls.filter(c => c.componentId === componentId)
      info.aiCalls = componentAICalls
      info.tokensUsed = componentAICalls.reduce((sum, c) => sum + c.totalTokens, 0)
      info.promptTokens = componentAICalls.reduce((sum, c) => sum + c.promptTokens, 0)
      info.completionTokens = componentAICalls.reduce((sum, c) => sum + c.completionTokens, 0)

      // Aggregate extraction attempts
      info.extractionAttempts = this.extractionAttempts.filter(e => e.componentId === componentId)
      info.sanityChecks = this.sanityChecks.filter(s =>
        info.extractionAttempts.some(e => e.metricId === s.metricId)
      )
    }

    this.log('complete', componentId, `Completed with status: ${status}`, {
      duration: info?.duration,
      tokensUsed: info?.tokensUsed,
      error,
    })
  }

  // --------------------------------------------------------------------------
  // Extraction Logging
  // --------------------------------------------------------------------------

  logExtractionAttempt(attempt: ExtractionAttempt): void {
    this.extractionAttempts.push(attempt)

    this.log('extraction', attempt.componentId,
      `Extraction ${attempt.success ? 'SUCCESS' : 'FAILED'}: ${attempt.metricId}`,
      {
        metricId: attempt.metricId,
        success: attempt.success,
        foundAt: attempt.foundAt,
        rawValue: attempt.rawValue,
        transformedValue: attempt.transformedValue,
        error: attempt.error,
      }
    )
  }

  logSanityCheck(result: SanityCheckResult): void {
    this.sanityChecks.push(result)

    this.log('sanity_check', '',
      `Sanity check ${result.action}: ${result.metricId} = ${result.value}`,
      { ...result }
    )
  }

  // --------------------------------------------------------------------------
  // Validation Logging
  // --------------------------------------------------------------------------

  logValidation(componentId: string, result: ValidationResult): void {
    const info = this.componentInfo.get(componentId)
    if (info) {
      info.validationResult = result
    }

    this.log('validation', componentId,
      `Validation ${result.isValid ? 'PASSED' : 'FAILED'} (score: ${result.score})`,
      { ...result }
    )
  }

  // --------------------------------------------------------------------------
  // AI Call Logging
  // --------------------------------------------------------------------------

  logAICall(metrics: AICallMetrics): void {
    this.aiCalls.push(metrics)

    this.log('ai_call', metrics.componentId,
      `AI call ${metrics.success ? 'completed' : 'failed'} in ${metrics.latencyMs}ms`,
      {
        model: metrics.model,
        tokens: metrics.totalTokens,
        latency: metrics.latencyMs,
        error: metrics.error,
      }
    )
  }

  logBenchmarkCheck(
    componentId: string,
    metricName: string,
    value: number,
    benchmark: { min: number; max: number },
    valid: boolean
  ): void {
    this.log('benchmark_check', componentId,
      `Benchmark check ${valid ? 'PASSED' : 'FAILED'}: ${metricName} = ${value}`,
      { metricName, value, benchmark, valid }
    )
  }

  // --------------------------------------------------------------------------
  // Report Generation
  // --------------------------------------------------------------------------

  generatePerformanceMetrics(): PerformanceMetrics {
    const componentDurations: Record<string, number> = {}
    const tokensByComponent: Record<string, number> = {}
    let totalTokens = 0

    for (const [id, info] of this.componentInfo) {
      componentDurations[id] = info.duration
      tokensByComponent[id] = info.tokensUsed
      totalTokens += info.tokensUsed
    }

    // Extraction stats
    const metricStats: Record<string, { attempts: number; successes: number }> = {}
    let successfulExtractions = 0
    let failedExtractions = 0

    for (const attempt of this.extractionAttempts) {
      if (!metricStats[attempt.metricId]) {
        metricStats[attempt.metricId] = { attempts: 0, successes: 0 }
      }
      metricStats[attempt.metricId].attempts++
      if (attempt.success) {
        metricStats[attempt.metricId].successes++
        successfulExtractions++
      } else {
        failedExtractions++
      }
    }

    // Sanity check stats
    let passed = 0, warned = 0, rejected = 0
    for (const check of this.sanityChecks) {
      if (check.action === 'pass' || check.valid) passed++
      else if (check.action === 'warn') warned++
      else if (check.action === 'reject') rejected++
    }

    // Estimate cost (Gemini Flash pricing approximation)
    const costPer1MTokens = 0.075 // $0.075 per 1M tokens
    const estimatedCost = (totalTokens / 1_000_000) * costPer1MTokens

    return {
      totalDuration: Date.now() - this.startTime,
      componentDurations,
      tokenUsage: {
        total: totalTokens,
        byComponent: tokensByComponent,
        estimatedCost,
      },
      extractionStats: {
        totalAttempts: this.extractionAttempts.length,
        successful: successfulExtractions,
        failed: failedExtractions,
        successRate: this.extractionAttempts.length > 0
          ? (successfulExtractions / this.extractionAttempts.length) * 100
          : 0,
        byMetric: metricStats,
      },
      sanityCheckStats: {
        passed,
        warned,
        rejected,
      },
    }
  }

  generateReport(): DebugReport {
    const components = Array.from(this.componentInfo.values())
    const performance = this.generatePerformanceMetrics()

    const successfulComponents = components.filter(c => c.status === 'success').length
    const failedComponents = components.filter(c => c.status === 'error').length

    let overallStatus: 'success' | 'partial' | 'failure'
    if (failedComponents === 0) {
      overallStatus = 'success'
    } else if (successfulComponents > 0) {
      overallStatus = 'partial'
    } else {
      overallStatus = 'failure'
    }

    return {
      assessmentId: this.assessmentId,
      timestamp: new Date().toISOString(),
      events: this.events,
      components,
      performance,
      summary: {
        totalEvents: this.events.length,
        totalComponents: components.length,
        successfulComponents,
        failedComponents,
        totalExtractions: this.extractionAttempts.length,
        successfulExtractions: this.extractionAttempts.filter(e => e.success).length,
        overallStatus,
      },
    }
  }

  // --------------------------------------------------------------------------
  // File Output
  // --------------------------------------------------------------------------

  saveToFile(directory: string = 'reports'): string {
    const report = this.generateReport()
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `debug-${this.assessmentId}-${timestamp}.json`

    // Ensure directory exists
    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true })
    }

    const filepath = join(directory, filename)
    writeFileSync(filepath, JSON.stringify(report, null, 2))

    console.log(`[DEBUG] Report saved to: ${filepath}`)
    return filepath
  }

  saveExtractionLog(directory: string = 'reports'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `extraction-${this.assessmentId}-${timestamp}.json`

    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true })
    }

    const filepath = join(directory, filename)
    writeFileSync(filepath, JSON.stringify({
      assessmentId: this.assessmentId,
      timestamp: new Date().toISOString(),
      extractions: this.extractionAttempts,
      sanityChecks: this.sanityChecks,
      stats: {
        total: this.extractionAttempts.length,
        successful: this.extractionAttempts.filter(e => e.success).length,
        failed: this.extractionAttempts.filter(e => !e.success).length,
      },
    }, null, 2))

    return filepath
  }

  savePerformanceLog(directory: string = 'reports'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `performance-${this.assessmentId}-${timestamp}.json`

    if (!existsSync(directory)) {
      mkdirSync(directory, { recursive: true })
    }

    const filepath = join(directory, filename)
    const performance = this.generatePerformanceMetrics()
    writeFileSync(filepath, JSON.stringify({
      assessmentId: this.assessmentId,
      timestamp: new Date().toISOString(),
      performance,
    }, null, 2))

    return filepath
  }

  // --------------------------------------------------------------------------
  // Utility Methods
  // --------------------------------------------------------------------------

  getExtractionSuccessRate(): number {
    if (this.extractionAttempts.length === 0) return 0
    const successful = this.extractionAttempts.filter(e => e.success).length
    return (successful / this.extractionAttempts.length) * 100
  }

  getComponentStatus(componentId: string): 'success' | 'error' | 'partial' | 'not_found' {
    const info = this.componentInfo.get(componentId)
    return info?.status || 'not_found'
  }

  getTotalTokensUsed(): number {
    return this.aiCalls.reduce((sum, c) => sum + c.totalTokens, 0)
  }
}

// ============================================================================
// Singleton Instance (optional)
// ============================================================================

let globalLogger: AssessmentDebugLogger | null = null

export function getDebugLogger(assessmentId: string): AssessmentDebugLogger {
  if (!globalLogger || globalLogger['assessmentId'] !== assessmentId) {
    globalLogger = new AssessmentDebugLogger(assessmentId)
  }
  return globalLogger
}

export function resetDebugLogger(): void {
  globalLogger = null
}
