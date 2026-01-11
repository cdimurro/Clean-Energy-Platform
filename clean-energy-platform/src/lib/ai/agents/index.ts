/**
 * AI Agents Module
 *
 * Specialized AI agents for the institutional-grade assessment platform.
 *
 * Assessment Agents (7 components, 100+ pages output):
 * - TechnologyDeepDiveAgent: Technology research and TRL assessment
 * - ClaimsValidationAgent: Literature validation and benchmark comparison
 * - PerformanceSimulationAgent: Physics-based modeling and sensitivity analysis
 * - SystemIntegrationAgent: Market fit and infrastructure analysis
 * - TEAAgent: Techno-economic analysis with NETL QGESS methodology
 * - ImprovementOpportunitiesAgent: R&D roadmap and cost reduction pathways
 * - FinalSynthesisAgent: Executive summary and investment thesis
 */

// Assessment Agents Module
export * from './assessment'

// Re-export key types for convenience
export type {
  AssessmentInput,
  ComponentOutput,
  ReportSection,
  AssessmentResult,
  ProgressCallback,
} from './assessment'
