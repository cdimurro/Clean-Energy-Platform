/**
 * Output Validator
 *
 * Validates agent outputs against expected schemas and benchmarks.
 * Provides detailed validation reports for debugging and quality assurance.
 */

import type {
  StandardizedMetricsOutput,
  StandardizedMetric,
  MetricsValidationStatus,
} from './metrics-interface'
import type { ComponentOutput } from './base-agent'
import { extractAllMetrics, extractStandardizedMetrics } from './metrics-extractor'

// ============================================================================
// Types
// ============================================================================

export interface ValidationReport {
  /** Overall validation passed */
  passed: boolean

  /** Validation score (0-100) */
  score: number

  /** Component that was validated */
  componentId: string

  /** Timestamp of validation */
  timestamp: string

  /** Detailed results */
  details: {
    hasStandardizedMetrics: boolean
    metricsValidation: MetricsValidationStatus
    extractionResults: Record<string, ExtractionValidation>
    benchmarkValidation: BenchmarkValidation[]
    structuralValidation: StructuralValidation
  }

  /** Warnings (non-fatal issues) */
  warnings: string[]

  /** Errors (fatal issues) */
  errors: string[]

  /** Suggestions for improvement */
  suggestions: string[]
}

export interface ExtractionValidation {
  metricName: string
  found: boolean
  value: number | null
  expectedRange?: { min: number; max: number }
  inRange: boolean
  extractionMethod: string
}

export interface BenchmarkValidation {
  metric: string
  actualValue: number
  benchmarkMin: number
  benchmarkMax: number
  benchmarkSource: string
  withinRange: boolean
  deviation: number // Percentage deviation from nearest benchmark edge
}

export interface StructuralValidation {
  hasRequiredFields: boolean
  missingFields: string[]
  hasReportSections: boolean
  sectionCount: number
  hasValidJSON: boolean
}

// ============================================================================
// Benchmark Databases
// ============================================================================

/**
 * Industry benchmark ranges by technology and metric
 */
export const INDUSTRY_BENCHMARKS: Record<string, Record<string, { min: number; max: number; source: string }>> = {
  hydrogen: {
    lcoh: { min: 3.0, max: 8.0, source: 'IEA Hydrogen Report 2024' },
    efficiency: { min: 55, max: 80, source: 'IRENA Green Hydrogen 2023' },
    specific_consumption: { min: 4.0, max: 6.0, source: 'DOE Electrolyzer Targets' },
    capex: { min: 400, max: 1500, source: 'BloombergNEF 2024' },
    lifetime: { min: 40000, max: 100000, source: 'DOE Targets' },
    trl: { min: 7, max: 9, source: 'Commercial PEM' },
  },
  'energy-storage': {
    lcos: { min: 0.1, max: 0.5, source: 'Lazard LCOS 2024' },
    efficiency: { min: 80, max: 95, source: 'NREL Storage' },
    cycle_life: { min: 3000, max: 10000, source: 'DOE Targets' },
    energy_density: { min: 150, max: 500, source: 'BloombergNEF' },
    capex: { min: 100, max: 400, source: 'BloombergNEF 2024' },
  },
  'clean-energy': {
    lcoe: { min: 20, max: 100, source: 'Lazard LCOE 2024' },
    efficiency: { min: 15, max: 25, source: 'NREL Solar' },
    capacity_factor: { min: 15, max: 35, source: 'EIA' },
    capex: { min: 800, max: 2000, source: 'NREL ATB' },
  },
  industrial: {
    lcoc: { min: 100, max: 800, source: 'IEA CCUS 2024' },
    capture_rate: { min: 85, max: 99, source: 'DOE Targets' },
    energy_penalty: { min: 10, max: 40, source: 'NETL' },
    capex: { min: 500, max: 2000, source: 'GCCSI' },
  },
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a complete component output
 */
export function validateComponentOutput(
  output: ComponentOutput,
  domainId: string
): ValidationReport {
  const report: ValidationReport = {
    passed: false,
    score: 0,
    componentId: output.componentId,
    timestamp: new Date().toISOString(),
    details: {
      hasStandardizedMetrics: false,
      metricsValidation: {
        isValid: false,
        score: 0,
        missingRequired: [],
        invalidValues: [],
        warnings: [],
      },
      extractionResults: {},
      benchmarkValidation: [],
      structuralValidation: {
        hasRequiredFields: false,
        missingFields: [],
        hasReportSections: false,
        sectionCount: 0,
        hasValidJSON: false,
      },
    },
    warnings: [],
    errors: [],
    suggestions: [],
  }

  let totalScore = 0
  let maxScore = 0

  // 1. Check structural validity
  const structuralResult = validateStructure(output)
  report.details.structuralValidation = structuralResult
  maxScore += 30
  if (structuralResult.hasRequiredFields) totalScore += 10
  if (structuralResult.hasReportSections) totalScore += 10
  if (structuralResult.hasValidJSON) totalScore += 10

  if (!structuralResult.hasRequiredFields) {
    report.errors.push(`Missing required fields: ${structuralResult.missingFields.join(', ')}`)
  }

  // 2. Check for standardized metrics
  const standardizedMetrics = extractStandardizedMetrics(output)
  report.details.hasStandardizedMetrics = standardizedMetrics !== null
  maxScore += 20
  if (standardizedMetrics) {
    totalScore += 20
  } else {
    report.warnings.push('No standardizedMetrics block found - using fallback extraction')
    report.suggestions.push('Update agent to output standardizedMetrics block for better accuracy')
  }

  // 3. Validate metrics if present
  if (standardizedMetrics) {
    const metricsValidation = validateStandardizedMetrics(standardizedMetrics)
    report.details.metricsValidation = metricsValidation
    maxScore += 30
    totalScore += (metricsValidation.score / 100) * 30

    if (!metricsValidation.isValid) {
      report.warnings.push(...metricsValidation.warnings)
      for (const field of metricsValidation.missingRequired) {
        report.errors.push(`Missing required metric: ${field}`)
      }
      for (const invalid of metricsValidation.invalidValues) {
        report.errors.push(`Invalid value for ${invalid.field}: ${invalid.reason}`)
      }
    }
  }

  // 4. Extract and validate individual metrics
  const extractionResults = extractAllMetrics(output.componentId, output)
  report.details.extractionResults = {}

  for (const [metricName, result] of Object.entries(extractionResults)) {
    const expectedRange = INDUSTRY_BENCHMARKS[domainId]?.[metricName]
    const inRange = result.found && expectedRange
      ? result.metric!.value >= expectedRange.min && result.metric!.value <= expectedRange.max
      : true // No range to check

    report.details.extractionResults[metricName] = {
      metricName,
      found: result.found,
      value: result.metric?.value ?? null,
      expectedRange,
      inRange,
      extractionMethod: result.extractionMethod,
    }

    maxScore += 5
    if (result.found) {
      totalScore += 3
      if (inRange) totalScore += 2
      else {
        report.warnings.push(
          `${metricName} value ${result.metric?.value} outside expected range ${expectedRange?.min}-${expectedRange?.max}`
        )
      }
    } else {
      report.warnings.push(`Could not extract ${metricName}`)
    }
  }

  // 5. Benchmark validation for key metrics
  const benchmarks = INDUSTRY_BENCHMARKS[domainId] || {}
  for (const [metric, range] of Object.entries(benchmarks)) {
    const extracted = extractionResults[metric]
    if (extracted?.found && extracted.metric?.value !== undefined) {
      const value = extracted.metric.value
      const withinRange = value >= range.min && value <= range.max
      const deviation = withinRange
        ? 0
        : value < range.min
          ? ((range.min - value) / range.min) * 100
          : ((value - range.max) / range.max) * 100

      report.details.benchmarkValidation.push({
        metric,
        actualValue: value,
        benchmarkMin: range.min,
        benchmarkMax: range.max,
        benchmarkSource: range.source,
        withinRange,
        deviation,
      })
    }
  }

  // Calculate final score
  report.score = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
  report.passed = report.score >= 70 && report.errors.length === 0

  // Add suggestions based on issues
  if (report.score < 70) {
    report.suggestions.push('Review agent prompts to ensure consistent metric output')
  }
  if (!report.details.hasStandardizedMetrics) {
    report.suggestions.push('Implement standardizedMetrics output in agent')
  }

  return report
}

/**
 * Validate structure of component output
 */
function validateStructure(output: ComponentOutput): StructuralValidation {
  const result: StructuralValidation = {
    hasRequiredFields: true,
    missingFields: [],
    hasReportSections: false,
    sectionCount: 0,
    hasValidJSON: false,
  }

  // Check required fields
  const requiredFields = ['componentId', 'componentName', 'status', 'content']
  for (const field of requiredFields) {
    if (!(field in output) || output[field as keyof ComponentOutput] === undefined) {
      result.hasRequiredFields = false
      result.missingFields.push(field)
    }
  }

  // Check report sections
  if (output.sections && Array.isArray(output.sections)) {
    result.hasReportSections = output.sections.length > 0
    result.sectionCount = output.sections.length
  }

  // Check content is valid
  try {
    if (output.content) {
      const contentStr = typeof output.content === 'string' ? output.content : JSON.stringify(output.content)
      JSON.parse(contentStr)
      result.hasValidJSON = true
    }
  } catch {
    result.hasValidJSON = typeof output.content === 'object' && output.content !== null
  }

  return result
}

/**
 * Validate standardized metrics output
 */
function validateStandardizedMetrics(metrics: StandardizedMetricsOutput): MetricsValidationStatus {
  const result: MetricsValidationStatus = {
    isValid: true,
    score: 100,
    missingRequired: [],
    invalidValues: [],
    warnings: [],
  }

  // Check required fields
  if (!metrics.primaryCostMetric) {
    result.missingRequired.push('primaryCostMetric')
    result.score -= 15
  }
  if (!metrics.efficiency) {
    result.missingRequired.push('efficiency')
    result.score -= 15
  }
  if (typeof metrics.trl !== 'number') {
    result.missingRequired.push('trl')
    result.score -= 10
  }
  if (!metrics.rating) {
    result.missingRequired.push('rating')
    result.score -= 10
  }

  // Validate TRL
  if (typeof metrics.trl === 'number') {
    if (metrics.trl < 1 || metrics.trl > 9 || !Number.isInteger(metrics.trl)) {
      result.invalidValues.push({ field: 'trl', reason: 'Must be integer 1-9' })
      result.score -= 10
    }
  }

  // Validate efficiency
  if (metrics.efficiency?.value !== undefined) {
    if (metrics.efficiency.value < 0 || metrics.efficiency.value > 100) {
      result.invalidValues.push({ field: 'efficiency', reason: 'Must be 0-100%' })
      result.score -= 10
    }
  }

  // Validate rating
  const validRatings = ['BREAKTHROUGH', 'PROMISING', 'CONDITIONAL', 'NOT_RECOMMENDED']
  if (metrics.rating && !validRatings.includes(metrics.rating)) {
    result.invalidValues.push({ field: 'rating', reason: `Must be one of: ${validRatings.join(', ')}` })
    result.score -= 10
  }

  // Check metric objects have required fields
  const validateMetric = (metric: StandardizedMetric | undefined, fieldName: string) => {
    if (metric) {
      if (typeof metric.value !== 'number') {
        result.invalidValues.push({ field: `${fieldName}.value`, reason: 'Must be a number' })
        result.score -= 5
      }
      if (!metric.id) result.warnings.push(`${fieldName}.id missing`)
      if (!metric.unit) result.warnings.push(`${fieldName}.unit missing`)
    }
  }

  validateMetric(metrics.primaryCostMetric, 'primaryCostMetric')
  validateMetric(metrics.efficiency, 'efficiency')
  validateMetric(metrics.capex, 'capex')
  validateMetric(metrics.opex, 'opex')

  // Final score calculation
  result.score = Math.max(0, result.score)
  result.isValid = result.missingRequired.length === 0 && result.invalidValues.length === 0

  return result
}

// ============================================================================
// Batch Validation
// ============================================================================

/**
 * Validate all component outputs from an assessment
 */
export function validateAssessmentOutputs(
  outputs: ComponentOutput[],
  domainId: string
): {
  overallPassed: boolean
  overallScore: number
  componentReports: ValidationReport[]
  summary: {
    passedCount: number
    failedCount: number
    warningCount: number
    errorCount: number
  }
} {
  const componentReports = outputs.map((output) => validateComponentOutput(output, domainId))

  const passedCount = componentReports.filter((r) => r.passed).length
  const failedCount = componentReports.filter((r) => !r.passed).length
  const warningCount = componentReports.reduce((acc, r) => acc + r.warnings.length, 0)
  const errorCount = componentReports.reduce((acc, r) => acc + r.errors.length, 0)

  const overallScore = componentReports.length > 0
    ? Math.round(componentReports.reduce((acc, r) => acc + r.score, 0) / componentReports.length)
    : 0

  return {
    overallPassed: failedCount === 0 && overallScore >= 70,
    overallScore,
    componentReports,
    summary: {
      passedCount,
      failedCount,
      warningCount,
      errorCount,
    },
  }
}

// ============================================================================
// Exports
// ============================================================================

export {
  validateStandardizedMetrics,
  validateStructure,
}
