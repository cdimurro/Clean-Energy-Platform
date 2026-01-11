/**
 * Carbon and Climate Types
 *
 * Type definitions for carbon accounting, avoided emissions,
 * LCA validation, and climate claims assessment.
 *
 * Phase 4 of investor due diligence market enhancement
 */

// ============================================================================
// Emission Scopes
// ============================================================================

export type EmissionScope = 'scope1' | 'scope2' | 'scope3'

export interface ScopedEmissions {
  scope1: number // Direct emissions (tCO2e)
  scope2: number // Indirect from purchased energy (tCO2e)
  scope3: number // All other indirect emissions (tCO2e)
  total: number
  unit: 'tCO2e' | 'kgCO2e' | 'MtCO2e'
}

export interface Scope3Categories {
  purchasedGoods: number
  capitalGoods: number
  fuelAndEnergy: number
  upstreamTransport: number
  wasteGenerated: number
  businessTravel: number
  employeeCommuting: number
  upstreamLeasedAssets: number
  downstreamTransport: number
  processingOfSold: number
  useOfSold: number
  endOfLifeTreatment: number
  downstreamLeasedAssets: number
  franchises: number
  investments: number
}

// ============================================================================
// Avoided Emissions
// ============================================================================

export type AvoidedEmissionsMethodology =
  | 'project-frame'
  | 'wbcsd-guidance'
  | 'ghg-protocol'
  | 'icma-principles'
  | 'custom'

export interface BaselineScenario {
  name: string
  description: string
  emissionsFactor: number // tCO2e per unit
  unit: string
  source: string
  year: number
  region: string
  justification: string
}

export interface CounterfactualScenario {
  name: string
  description: string
  emissionsFactor: number
  unit: string
  source: string
  assumptions: string[]
  limitations: string[]
}

export interface AvoidedEmissionsInput {
  technology: string
  description: string
  deploymentScale: number
  deploymentUnit: string
  operatingLife: number // years
  baseline: BaselineScenario
  counterfactual?: CounterfactualScenario
  methodology: AvoidedEmissionsMethodology
  region: string
  sector: string
}

export interface AvoidedEmissionsResult {
  annualAvoided: number // tCO2e/year
  lifetimeAvoided: number // tCO2e
  avoidedIntensity: number // tCO2e per unit
  methodology: AvoidedEmissionsMethodology
  baseline: BaselineScenario
  counterfactual?: CounterfactualScenario
  assumptions: string[]
  limitations: string[]
  confidence: 'high' | 'medium' | 'low'
  dataQuality: DataQualityScore
  validatedAt: string
}

// ============================================================================
// LCA (Life Cycle Assessment)
// ============================================================================

export type LCAStandard =
  | 'ISO-14040'
  | 'ISO-14044'
  | 'ISO-14064'
  | 'GHG-Protocol'
  | 'PAS-2050'
  | 'PCAF'

export type LCABoundary =
  | 'cradle-to-gate'
  | 'cradle-to-grave'
  | 'gate-to-gate'
  | 'well-to-wheel'
  | 'well-to-tank'
  | 'tank-to-wheel'

export interface LCAInput {
  productOrService: string
  functionalUnit: string
  systemBoundary: LCABoundary
  stages: LCAStage[]
  standards: LCAStandard[]
  dataYear: number
  region: string
}

export interface LCAStage {
  name: string
  description: string
  emissions: number // kgCO2e
  percentage: number // of total
  dataSource: string
  dataQuality: DataQualityScore
  subcategories?: Array<{
    name: string
    emissions: number
    source: string
  }>
}

export interface LCAResult {
  totalEmissions: number // kgCO2e per functional unit
  emissionsBreakdown: LCAStage[]
  hotspots: string[]
  carbonIntensity: number
  carbonIntensityUnit: string
  benchmark?: {
    industry: number
    source: string
    comparison: 'better' | 'similar' | 'worse'
  }
  dataQualityOverall: DataQualityScore
  complianceStatus: ComplianceStatus
  recommendations: string[]
}

// ============================================================================
// Data Quality (PCAF Methodology)
// ============================================================================

export interface DataQualityScore {
  score: 1 | 2 | 3 | 4 | 5 // 1 = highest quality, 5 = lowest
  description: string
  category: DataQualityCategory
  improvements: string[]
}

export type DataQualityCategory =
  | 'verified-primary' // Score 1
  | 'unverified-primary' // Score 2
  | 'sector-specific' // Score 3
  | 'proxy-data' // Score 4
  | 'estimated' // Score 5

// ============================================================================
// Climate Claims
// ============================================================================

export type ClaimType =
  | 'carbon-neutral'
  | 'net-zero'
  | 'carbon-negative'
  | 'climate-positive'
  | 'carbon-free'
  | 'renewable'
  | 'sustainable'
  | 'green'
  | 'low-carbon'
  | 'decarbonized'

export interface ClimateClaimInput {
  claim: string
  claimType: ClaimType
  scope: EmissionScope[]
  boundaryDescription: string
  offsetsUsed: boolean
  offsetDetails?: OffsetDetails
  verificationStatus: VerificationStatus
  targetYear?: number
  baselineYear?: number
}

export interface OffsetDetails {
  volumeUsed: number // tCO2e
  registryUsed: string
  projectTypes: string[]
  vintageYears: number[]
  additionality: 'verified' | 'claimed' | 'unknown'
  permanence: 'permanent' | 'temporary' | 'unknown'
}

export interface VerificationStatus {
  verified: boolean
  verifier?: string
  standard?: string
  lastVerified?: string
  scope?: string
}

export interface ClimateClaimAssessment {
  claim: ClimateClaimInput
  isValid: boolean
  issues: ClaimIssue[]
  recommendations: string[]
  riskLevel: 'high' | 'medium' | 'low'
  greenwashingRisk: GreenwashingRisk
  complianceStatus: ComplianceStatus
}

export interface ClaimIssue {
  category: 'scope' | 'boundary' | 'offset' | 'verification' | 'methodology' | 'communication'
  severity: 'critical' | 'major' | 'minor'
  description: string
  regulation?: string
  recommendation: string
}

export interface GreenwashingRisk {
  level: 'high' | 'medium' | 'low'
  indicators: string[]
  mitigations: string[]
}

// ============================================================================
// Carbon Removal / CDR
// ============================================================================

export type CDRType =
  | 'afforestation'
  | 'reforestation'
  | 'soil-carbon'
  | 'biochar'
  | 'enhanced-weathering'
  | 'ocean-alkalinity'
  | 'beccs'
  | 'dac'
  | 'other'

export interface CDRProject {
  type: CDRType
  location: string
  capacity: number // tCO2/year
  permanence: number // years
  additionality: 'verified' | 'claimed' | 'unknown'
  mrvMethod: string
  registry?: string
  vintage: number
  price: number // $/tCO2
}

export interface CDRAssessment {
  project: CDRProject
  isCredible: boolean
  permanenceRisk: 'high' | 'medium' | 'low'
  additionalityAssessment: string
  reversalRisk: 'high' | 'medium' | 'low'
  cobenefits: string[]
  concerns: string[]
  recommendations: string[]
}

// ============================================================================
// Compliance & Reporting
// ============================================================================

export interface ComplianceStatus {
  isCompliant: boolean
  standards: Array<{
    name: string
    compliant: boolean
    gaps: string[]
  }>
  overallScore: number // 0-100
  recommendations: string[]
}

export interface CarbonReportingRequirements {
  jurisdiction: string
  requirements: Array<{
    name: string
    description: string
    deadline?: string
    mandatory: boolean
    applies: boolean
  }>
  recommendations: string[]
}

// ============================================================================
// Carbon Pricing & Economics
// ============================================================================

export interface CarbonPriceScenario {
  name: string
  price: number // $/tCO2e
  year: number
  source: string
  probability?: 'high' | 'medium' | 'low'
}

export interface CarbonCostExposure {
  scope1Exposure: number // $
  scope2Exposure: number // $
  scope3Exposure: number // $
  totalExposure: number // $
  priceScenario: CarbonPriceScenario
  mitigationOpportunities: Array<{
    description: string
    reductionPotential: number // tCO2e
    cost: number // $
    paybackYears: number
  }>
}
