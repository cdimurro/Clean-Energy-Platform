/**
 * Assessment Agents Module
 *
 * Exports all assessment agent classes and utilities for the
 * institutional-grade technology assessment platform.
 *
 * Components:
 * 1. Technology Deep Dive (15-20 pages)
 * 2. Claims Validation (10-15 pages)
 * 3. Performance Simulation (15-20 pages)
 * 4. System Integration (10-15 pages)
 * 5. Techno-Economic Analysis (20-25 pages)
 * 6. Improvement Opportunities (10-15 pages)
 * 7. Final Synthesis (10-15 pages)
 *
 * Total: 100+ pages of institutional-grade analysis
 */

// Base Agent
export {
  BaseAssessmentAgent,
  AGENT_CONFIGS,
  type AssessmentInput,
  type ExtractedClaim,
  type UploadedDocument,
  type ComponentOutput,
  type ReportSection,
  type ReportTable,
  type ReportChart,
  type Citation,
  type ValidationResult,
  type LiteratureResult,
  type BenchmarkData,
  type ProgressCallback,
  type AgentConfig,
  type GeminiOptions,
  type ThinkingLevel,
  // New standardized metrics exports
  type StandardizedMetricsOutput,
  type StandardizedMetric,
  type MetricsValidationStatus,
  STANDARDIZED_METRICS_PROMPT_SCHEMA,
  createMetric,
  createEmptyMetricsOutput,
  REQUIRED_METRICS_BY_DOMAIN,
  STANDARD_UNITS,
} from './base-agent'

// Metrics Interface (direct exports)
export type {
  StandardizedRangeMetric,
  MetricExtractionResult,
} from './metrics-interface'

// Metrics Extractor
export {
  extractMetric,
  extractAllMetrics,
  extractStandardizedMetrics,
  AGENT_EXTRACTION_PATHS,
  deepSearchValue,
  toNumber,
} from './metrics-extractor'

// Unit Converter
export {
  convertUnit,
  lcoeToLcoh,
  specificConsumptionToEfficiency,
  efficiencyToSpecificConsumption,
  kwhPerKgToEfficiency,
  calculateLCOS,
  convertEnergyDensity,
  convertCO2Cost,
  parseValueWithUnit,
  normalizeUnit,
  unitsEquivalent,
  CONSTANTS,
  CONVERSION_RULES,
} from './unit-converter'

// Output Validator
export {
  validateComponentOutput,
  validateAssessmentOutputs,
  validateStandardizedMetrics,
  validateStructure,
  INDUSTRY_BENCHMARKS,
  type ValidationReport,
  type ExtractionValidation,
  type BenchmarkValidation,
  type StructuralValidation,
} from './output-validator'

// Debug Logger
export {
  AssessmentDebugLogger,
  getDebugLogger,
  resetDebugLogger,
  type DebugEvent,
  type EventType,
  type ExtractionAttempt,
  type SanityCheckResult as DebugSanityCheckResult,
  type ValidationResult as DebugValidationResult,
  type AICallMetrics,
  type ComponentDebugInfo,
  type PerformanceMetrics,
  type DebugReport,
} from './debug-logger'

// Domain Benchmarks
export {
  DOMAIN_BENCHMARKS,
  getBenchmarksForDomain,
  getBenchmarkRange,
  validateAgainstBenchmark,
  formatBenchmarksForPrompt,
  type BenchmarkRange,
  type DomainBenchmarks,
} from './domain-benchmarks'

// Extraction Paths
export {
  EXTRACTION_PATHS,
  extractMetric as extractMetricByPath,
  extractMetrics as extractMetricsByPath,
  getMetricIdsForComponent,
  deepSearchForValue,
  createExtractionAttempt,
  type ExtractionPath,
  type PathSegment,
  type ExtractionResult,
} from './extraction-paths'

// Sanity Checker
export {
  COMMON_SANITY_RANGES,
  HYDROGEN_SANITY_RANGES,
  STORAGE_SANITY_RANGES,
  INDUSTRIAL_SANITY_RANGES,
  CLEAN_ENERGY_SANITY_RANGES,
  getSanityRange,
  validateMetric as validateMetricSanity,
  validateMetrics as validateMetricsSanity,
  getRangesForDomain,
  isObviouslyWrong,
  suggestCorrectedValue,
  formatSanityCheckResults,
  getSanityCheckSummary,
  type SanityRange,
  type SanityCheckResult,
} from './sanity-checker'

// Component Agents
export { TechnologyDeepDiveAgent } from './technology-agent'
export { ClaimsValidationAgent } from './claims-agent'
export { PerformanceSimulationAgent } from './simulation-agent'
export { SystemIntegrationAgent } from './integration-agent'
export { TEAAgent } from './tea-agent'
export { ImprovementOpportunitiesAgent } from './improvement-agent'
export { FinalSynthesisAgent } from './synthesis-agent'

// Orchestrator
export {
  AssessmentOrchestrator,
  runAssessment,
  runAssessmentWithStreaming,
  estimateAssessmentDuration,
  type OrchestratorConfig,
  type AssessmentProgress,
  type AssessmentResult,
  type StreamCallback,
  type AssessmentStreamEvent,
} from './orchestrator'

// ============================================================================
// Quick Start
// ============================================================================

/**
 * Example usage:
 *
 * ```typescript
 * import { runAssessment, type AssessmentInput } from '@/lib/ai/agents/assessment'
 *
 * const input: AssessmentInput = {
 *   assessmentId: 'asmt_123',
 *   title: 'PEM Electrolyzer Assessment',
 *   description: '5 MW PEM electrolyzer for green hydrogen production',
 *   technologyType: 'PEM Electrolysis',
 *   domainId: 'hydrogen',
 *   claims: [
 *     {
 *       id: 'claim_1',
 *       claim: '4.4 kWh/Nm³ specific energy consumption',
 *       source: 'Vendor datasheet',
 *       validationMethod: 'benchmark',
 *       confidence: 'medium',
 *     },
 *   ],
 *   parameters: {
 *     capacity: '5 MW',
 *     efficiency: '75%',
 *   },
 * }
 *
 * const result = await runAssessment(input, {}, (progress, message) => {
 *   console.log(`[${progress.toFixed(0)}%] ${message}`)
 * })
 *
 * console.log(`Rating: ${result.rating}`)
 * console.log(`Sections: ${result.sections.length}`)
 * ```
 */
