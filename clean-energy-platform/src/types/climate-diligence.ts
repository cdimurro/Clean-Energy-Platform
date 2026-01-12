/**
 * Climate Diligence Platform Types
 *
 * Type definitions for comprehensive climate compliance including
 * SBTi, TCFD, CDP, ISSB, and TNFD standards.
 *
 * Enhancement 5 of investor due diligence market enhancement
 */

// ============================================================================
// SBTi (Science Based Targets Initiative)
// ============================================================================

export type SBTiPathway = '1.5C' | 'well-below-2C' | '2C'

export type SBTiTargetType = 'absolute' | 'intensity'

export type SBTiScope = 'scope1' | 'scope2' | 'scope3'

export interface SBTiTarget {
  id: string
  scope: SBTiScope
  targetType: SBTiTargetType
  baselineYear: number
  baselineEmissions: number // tCO2e
  targetYear: number
  reductionPercent: number
  pathway: SBTiPathway
  status: SBTiTargetStatus
  validatedAt?: string
  validatedBy?: string
  expiresAt?: string
}

export type SBTiTargetStatus =
  | 'draft'
  | 'submitted'
  | 'under-review'
  | 'validated'
  | 'expired'
  | 'rejected'

export interface SBTiValidation {
  companyId: string
  targets: SBTiTarget[]
  overallStatus: SBTiValidationStatus
  validationDate?: string
  validationType: 'near-term' | 'net-zero' | 'both'
  sectorGuidance?: string
  issues: SBTiIssue[]
  recommendations: string[]
  pathwayAnalysis: PathwayAnalysis
}

export type SBTiValidationStatus =
  | 'not-started'
  | 'committed'
  | 'targets-set'
  | 'validated'
  | 'removed'

export interface SBTiIssue {
  targetId?: string
  category: 'scope-coverage' | 'ambition' | 'timeline' | 'methodology' | 'data-quality'
  severity: 'critical' | 'major' | 'minor'
  description: string
  remediation: string
}

export interface PathwayAnalysis {
  currentEmissions: number
  projectedEmissions: YearlyEmission[]
  requiredReduction: number
  gapToTarget: number
  onTrack: boolean
  interventionsNeeded: DecarbonizationIntervention[]
}

export interface YearlyEmission {
  year: number
  projected: number
  target: number
  gap: number
}

export interface DecarbonizationIntervention {
  name: string
  category: InterventionCategory
  reductionPotential: number // tCO2e
  cost: number
  implementationYear: number
  confidence: 'high' | 'medium' | 'low'
}

export type InterventionCategory =
  | 'renewable-energy'
  | 'energy-efficiency'
  | 'electrification'
  | 'process-change'
  | 'supplier-engagement'
  | 'product-redesign'
  | 'carbon-removal'

// ============================================================================
// TCFD (Task Force on Climate-Related Financial Disclosures)
// ============================================================================

export interface TCFDDisclosure {
  companyId: string
  reportingYear: number
  governance: TCFDGovernance
  strategy: TCFDStrategy
  riskManagement: TCFDRiskManagement
  metricsAndTargets: TCFDMetrics
  overallScore: number // 0-100
  maturityLevel: TCFDMaturityLevel
  gaps: TCFDGap[]
  recommendations: string[]
}

export type TCFDMaturityLevel =
  | 'initial'
  | 'developing'
  | 'defined'
  | 'managed'
  | 'optimized'

export interface TCFDGovernance {
  boardOversight: GovernanceElement
  managementRole: GovernanceElement
  score: number
}

export interface GovernanceElement {
  exists: boolean
  description: string
  frequency?: string
  evidence?: string[]
  gaps: string[]
}

export interface TCFDStrategy {
  climateRisksOpportunities: RiskOpportunity[]
  impactOnBusiness: BusinessImpact
  scenarioAnalysis: ScenarioAnalysis | null
  resilienceAssessment: string
  score: number
}

export interface RiskOpportunity {
  id: string
  type: 'risk' | 'opportunity'
  category: RiskOpportunityCategory
  timeHorizon: 'short-term' | 'medium-term' | 'long-term'
  likelihood: 'high' | 'medium' | 'low'
  magnitude: 'high' | 'medium' | 'low'
  description: string
  financialImpact?: string
  mitigationStrategy?: string
}

export type RiskOpportunityCategory =
  | 'policy-legal'
  | 'technology'
  | 'market'
  | 'reputation'
  | 'acute-physical'
  | 'chronic-physical'
  | 'resource-efficiency'
  | 'energy-source'
  | 'products-services'
  | 'markets'
  | 'resilience'

export interface BusinessImpact {
  strategy: string
  financialPlanning: string
  products: string
  operations: string
  supplyChain: string
}

export interface ScenarioAnalysis {
  scenariosUsed: ClimateScenario[]
  methodology: string
  keyFindings: string[]
  strategicImplications: string[]
}

export interface ClimateScenario {
  name: string
  source: string // e.g., 'IPCC SSP1-1.9', 'IEA NZE'
  temperatureOutcome: string
  assumptions: string[]
  timeHorizon: number
}

export interface TCFDRiskManagement {
  identificationProcess: ProcessElement
  assessmentProcess: ProcessElement
  managementProcess: ProcessElement
  integrationWithERM: boolean
  score: number
}

export interface ProcessElement {
  exists: boolean
  description: string
  scope?: string
  frequency?: string
  evidence?: string[]
}

export interface TCFDMetrics {
  scope1Emissions: number | null
  scope2Emissions: number | null
  scope3Emissions: number | null
  emissionsMethodology: string
  climateTargets: string[]
  otherMetrics: TCFDMetric[]
  score: number
}

export interface TCFDMetric {
  name: string
  value: string | number
  unit: string
  year: number
  trend?: 'improving' | 'stable' | 'declining'
}

export interface TCFDGap {
  pillar: 'governance' | 'strategy' | 'risk-management' | 'metrics-targets'
  element: string
  severity: 'critical' | 'major' | 'minor'
  description: string
  recommendation: string
  effort: 'low' | 'medium' | 'high'
}

// ============================================================================
// CDP (Carbon Disclosure Project)
// ============================================================================

export type CDPQuestionnaire = 'climate' | 'water' | 'forests'

export type CDPScore = 'A' | 'A-' | 'B' | 'B-' | 'C' | 'C-' | 'D' | 'D-' | 'F'

export interface CDPResponse {
  companyId: string
  questionnaire: CDPQuestionnaire
  reportingYear: number
  status: CDPResponseStatus
  score?: CDPScore
  sections: CDPSection[]
  completionPercentage: number
  gaps: CDPGap[]
  recommendations: string[]
}

export type CDPResponseStatus =
  | 'not-started'
  | 'in-progress'
  | 'submitted'
  | 'scored'

export interface CDPSection {
  code: string
  name: string
  questions: CDPQuestion[]
  completionStatus: 'complete' | 'partial' | 'not-started'
  score?: number
}

export interface CDPQuestion {
  code: string
  text: string
  responseType: 'text' | 'number' | 'select' | 'multi-select' | 'table'
  response?: string | number | string[]
  dataPoints?: Record<string, unknown>
  isAnswered: boolean
  isRequired: boolean
  guidance?: string
}

export interface CDPGap {
  sectionCode: string
  questionCode: string
  description: string
  impact: 'score' | 'disclosure' | 'both'
  recommendation: string
}

export interface CDPBenchmark {
  questionnaire: CDPQuestionnaire
  sector: string
  region: string
  averageScore: CDPScore
  topPerformerScore: CDPScore
  sampleSize: number
  year: number
}

// ============================================================================
// ISSB (International Sustainability Standards Board)
// ============================================================================

export interface ISSBCompliance {
  companyId: string
  reportingPeriod: string
  s1Compliance: ISSBS1Compliance
  s2Compliance: ISSBS2Compliance
  overallReadiness: number // 0-100
  gaps: ISSBGap[]
  implementationPlan: ISSBImplementationStep[]
}

export interface ISSBS1Compliance {
  // IFRS S1: General Requirements
  governanceDisclosures: ComplianceElement
  strategyDisclosures: ComplianceElement
  riskManagementDisclosures: ComplianceElement
  metricsTargetsDisclosures: ComplianceElement
  connectedInformation: ComplianceElement
  score: number
}

export interface ISSBS2Compliance {
  // IFRS S2: Climate-Related Disclosures
  climateGovernance: ComplianceElement
  climateStrategy: ComplianceElement
  climateRiskManagement: ComplianceElement
  climateMetrics: ComplianceElement
  transitionPlans: ComplianceElement
  industrySpecific: ComplianceElement
  score: number
}

export interface ComplianceElement {
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-applicable'
  evidence?: string
  gaps: string[]
  actions: string[]
}

export interface ISSBGap {
  standard: 'S1' | 'S2'
  requirement: string
  currentState: string
  targetState: string
  effort: 'low' | 'medium' | 'high'
  priority: 'critical' | 'high' | 'medium' | 'low'
}

export interface ISSBImplementationStep {
  phase: number
  name: string
  description: string
  requirements: string[]
  deliverables: string[]
  dependencies: string[]
  estimatedEffort: string
}

// ============================================================================
// TNFD (Taskforce on Nature-related Financial Disclosures)
// ============================================================================

export interface TNFDAssessment {
  companyId: string
  reportingYear: number
  leapApproach: LEAPAssessment
  disclosures: TNFDDisclosures
  natureDependencies: NatureDependency[]
  natureImpacts: NatureImpact[]
  risks: NatureRisk[]
  opportunities: NatureOpportunity[]
  overallReadiness: number
  gaps: TNFDGap[]
}

export interface LEAPAssessment {
  // Locate, Evaluate, Assess, Prepare
  locate: LEAPLocate
  evaluate: LEAPEvaluate
  assess: LEAPAssess
  prepare: LEAPPrepare
}

export interface LEAPLocate {
  operationalLocations: Location[]
  supplyChainLocations: Location[]
  sensitiveAreas: SensitiveArea[]
  completeness: number
}

export interface Location {
  name: string
  coordinates?: { lat: number; lng: number }
  country: string
  biome?: string
  ecosystemType?: string
  protectedAreaProximity?: string
}

export interface SensitiveArea {
  name: string
  type: 'protected-area' | 'key-biodiversity-area' | 'ramsar-site' | 'world-heritage' | 'other'
  proximity: 'within' | 'adjacent' | 'nearby' | 'none'
  relevance: string
}

export interface LEAPEvaluate {
  dependencies: NatureDependency[]
  impacts: NatureImpact[]
  completeness: number
}

export interface NatureDependency {
  id: string
  service: EcosystemService
  dependency: 'high' | 'medium' | 'low'
  businessRelevance: string
  locations: string[]
}

export type EcosystemService =
  | 'water-provision'
  | 'water-quality'
  | 'climate-regulation'
  | 'pollination'
  | 'soil-quality'
  | 'flood-protection'
  | 'raw-materials'
  | 'genetic-resources'

export interface NatureImpact {
  id: string
  driver: ImpactDriver
  magnitude: 'high' | 'medium' | 'low'
  reversibility: 'reversible' | 'partially-reversible' | 'irreversible'
  locations: string[]
  mitigationMeasures: string[]
}

export type ImpactDriver =
  | 'land-use-change'
  | 'resource-exploitation'
  | 'climate-change'
  | 'pollution'
  | 'invasive-species'

export interface LEAPAssess {
  risks: NatureRisk[]
  opportunities: NatureOpportunity[]
  materialityAssessment: MaterialityResult[]
  completeness: number
}

export interface NatureRisk {
  id: string
  type: 'physical' | 'transition' | 'systemic'
  description: string
  likelihood: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  timeHorizon: 'short-term' | 'medium-term' | 'long-term'
  financialImpact?: string
  mitigationStrategy?: string
}

export interface NatureOpportunity {
  id: string
  category: 'resource-efficiency' | 'products-services' | 'markets' | 'capital'
  description: string
  potential: 'high' | 'medium' | 'low'
  timeHorizon: 'short-term' | 'medium-term' | 'long-term'
  financialBenefit?: string
}

export interface MaterialityResult {
  topic: string
  financialMateriality: 'material' | 'potentially-material' | 'not-material'
  impactMateriality: 'material' | 'potentially-material' | 'not-material'
  doubleMateriality: boolean
  rationale: string
}

export interface LEAPPrepare {
  responseStrategies: ResponseStrategy[]
  targetSetting: NatureTarget[]
  disclosureReadiness: number
  completeness: number
}

export interface ResponseStrategy {
  riskOrOpportunityId: string
  strategy: 'avoid' | 'reduce' | 'restore' | 'transform' | 'accept'
  actions: string[]
  timeline: string
  investment?: number
}

export interface NatureTarget {
  id: string
  type: 'outcome' | 'commitment' | 'action'
  description: string
  metric: string
  baseline: number
  target: number
  targetYear: number
  alignedWith?: string[] // e.g., 'GBF Target 3', 'SBTN'
}

export interface TNFDDisclosures {
  governance: TCFDGovernance // Reuses TCFD structure
  strategy: TNFDStrategy
  riskManagement: TCFDRiskManagement
  metricsAndTargets: TNFDMetrics
}

export interface TNFDStrategy {
  natureDependenciesDisclosed: boolean
  natureImpactsDisclosed: boolean
  locationDisclosures: boolean
  scenarioAnalysis: boolean
  resilienceAssessment: boolean
  score: number
}

export interface TNFDMetrics {
  dependencyMetrics: TNFDMetric[]
  impactMetrics: TNFDMetric[]
  riskMetrics: TNFDMetric[]
  targets: NatureTarget[]
  score: number
}

export interface TNFDMetric {
  category: 'dependency' | 'impact' | 'risk'
  name: string
  value: number
  unit: string
  trend?: 'improving' | 'stable' | 'declining'
  benchmark?: number
}

export interface TNFDGap {
  leapPhase: 'locate' | 'evaluate' | 'assess' | 'prepare'
  element: string
  description: string
  priority: 'high' | 'medium' | 'low'
  recommendation: string
}

// ============================================================================
// Scope 3 Mapping
// ============================================================================

export interface Scope3Assessment {
  companyId: string
  reportingYear: number
  methodology: 'ghg-protocol' | 'pcaf' | 'custom'
  categories: Scope3Category[]
  totalEmissions: number
  dataQuality: number // 1-5 PCAF score
  hotspots: Scope3Hotspot[]
  supplierEngagement: SupplierEngagementStatus
  reductionOpportunities: Scope3ReductionOpportunity[]
}

export interface Scope3Category {
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15
  name: string
  emissions: number | null
  percentage: number
  dataQuality: number
  methodology: string
  isRelevant: boolean
  isReported: boolean
  exclusionRationale?: string
}

export interface Scope3Hotspot {
  categoryNumber: number
  subcategory?: string
  emissions: number
  percentage: number
  driver: string
  reductionPotential: 'high' | 'medium' | 'low'
}

export interface SupplierEngagementStatus {
  totalSuppliers: number
  engagedSuppliers: number
  suppliersWithSBT: number
  suppliersReportingEmissions: number
  tierCoverage: Record<1 | 2 | 3, number>
}

export interface Scope3ReductionOpportunity {
  categoryNumber: number
  intervention: string
  reductionPotential: number
  implementationCost: number
  paybackPeriod: number
  feasibility: 'high' | 'medium' | 'low'
  cobenefits: string[]
}

// ============================================================================
// Decarbonization Pathway
// ============================================================================

export interface DecarbonizationPathway {
  companyId: string
  createdAt: string
  updatedAt: string
  baselineYear: number
  targetYear: number
  baselineEmissions: ScopedEmissions
  targetEmissions: ScopedEmissions
  pathway: PathwayScenario
  milestones: DecarbonizationMilestone[]
  interventions: DecarbonizationIntervention[]
  investmentRequired: number
  roi: number
  riskAssessment: PathwayRisk[]
}

export interface ScopedEmissions {
  scope1: number
  scope2: number
  scope3: number
  total: number
}

export interface PathwayScenario {
  name: string
  description: string
  assumptions: string[]
  yearlyProjections: YearlyProjection[]
}

export interface YearlyProjection {
  year: number
  scope1: number
  scope2: number
  scope3: number
  total: number
  cumulativeInvestment: number
  interventionsActive: string[]
}

export interface DecarbonizationMilestone {
  id: string
  year: number
  description: string
  targetEmissions: number
  keyActions: string[]
  investmentRequired: number
  status: 'planned' | 'in-progress' | 'achieved' | 'at-risk'
}

export interface PathwayRisk {
  id: string
  description: string
  likelihood: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  mitigationStrategy: string
}

// ============================================================================
// Climate Litigation Risk
// ============================================================================

export interface LitigationRiskAssessment {
  companyId: string
  assessmentDate: string
  overallRisk: 'high' | 'medium' | 'low'
  riskFactors: LitigationRiskFactor[]
  jurisdictionalExposure: JurisdictionalRisk[]
  caseTypesExposure: CaseTypeRisk[]
  mitigationRecommendations: string[]
}

export interface LitigationRiskFactor {
  factor: string
  riskLevel: 'high' | 'medium' | 'low'
  description: string
  evidence: string[]
}

export interface JurisdictionalRisk {
  jurisdiction: string
  riskLevel: 'high' | 'medium' | 'low'
  activeCases: number
  relevantLegislation: string[]
}

export interface CaseTypeRisk {
  caseType: 'greenwashing' | 'duty-of-care' | 'securities' | 'human-rights' | 'fiduciary'
  riskLevel: 'high' | 'medium' | 'low'
  precedentCases: string[]
  companyExposure: string
}

// ============================================================================
// API Types
// ============================================================================

export interface ValidateSBTiRequest {
  companyId: string
  targets: Omit<SBTiTarget, 'id' | 'status' | 'validatedAt' | 'validatedBy' | 'expiresAt'>[]
  sectorGuidance?: string
}

export interface AssessTCFDRequest {
  companyId: string
  reportingYear: number
  disclosureDocuments?: string[]
  existingDisclosures?: Partial<TCFDDisclosure>
}

export interface MapCDPResponseRequest {
  companyId: string
  questionnaire: CDPQuestionnaire
  reportingYear: number
  existingData?: Partial<CDPResponse>
}

export interface AssessScope3Request {
  companyId: string
  reportingYear: number
  methodology: 'ghg-protocol' | 'pcaf' | 'custom'
  supplierData?: SupplierEmissionData[]
}

export interface SupplierEmissionData {
  supplierId: string
  supplierName: string
  category: number
  emissions: number
  dataQuality: number
  source: string
}

export interface CreateDecarbonizationPathwayRequest {
  companyId: string
  baselineYear: number
  baselineEmissions: ScopedEmissions
  targetYear: number
  pathway: SBTiPathway
  constraints?: {
    maxAnnualInvestment?: number
    excludedInterventions?: string[]
    priorityAreas?: InterventionCategory[]
  }
}
