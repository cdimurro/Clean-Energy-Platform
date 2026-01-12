/**
 * TRL Assessment Pro Types
 *
 * Type definitions for comprehensive Technology Readiness Level assessment
 * following NASA TRL framework with 27 sub-levels and multi-reviewer workflow.
 *
 * Enhancement 1 of investor due diligence market enhancement
 */

// ============================================================================
// NASA TRL Framework (27 Sub-levels)
// ============================================================================

export type TRLLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type TRLSublevel = 'a' | 'b' | 'c'

export interface TRLDefinition {
  level: TRLLevel
  sublevel: TRLSublevel
  name: string
  description: string
  evidenceRequirements: EvidenceRequirement[]
  exitCriteria: string[]
  typicalDuration: {
    min: number
    max: number
    unit: 'months' | 'years'
  }
  fundingRange: {
    min: number
    max: number
    unit: 'K' | 'M'
  }
}

export interface EvidenceRequirement {
  id?: string
  type?: 'document' | 'data' | 'publication' | 'video' | 'prototype'
  category?: EvidenceCategory
  description: string
  required: boolean
  weight?: number // 0-1, contribution to score
  acceptedFormats?: string[]
  examples?: string[]
}

// Alias for compatibility with framework implementation
export type TechnologyDomain = 'energy' | 'aerospace' | 'biotech' | 'materials' | 'industrial' | 'software'

// Review status for workflow
export type ReviewStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled'

export type EvidenceCategory =
  | 'scientific-literature'
  | 'laboratory-results'
  | 'prototype-demonstration'
  | 'test-reports'
  | 'engineering-documentation'
  | 'operational-data'
  | 'certification'
  | 'market-validation'
  | 'customer-feedback'

// ============================================================================
// Domain-Specific TRL Mappings
// ============================================================================

export type TRLDomain =
  | 'aerospace'
  | 'energy'
  | 'biotech'
  | 'materials'
  | 'industrial'
  | 'software'
  | 'clean-tech'
  | 'hardware'

export interface DomainTRLMapping {
  domain: TRLDomain
  levelMappings: DomainLevelMapping[]
  specificCriteria: Record<TRLLevel, string[]>
  benchmarkCompanies: BenchmarkCompany[]
}

export interface DomainLevelMapping {
  level: TRLLevel
  domainSpecificName: string
  domainSpecificDescription: string
  domainSpecificEvidence: string[]
  typicalMilestones: string[]
}

export interface BenchmarkCompany {
  name: string
  technology: string
  trlAtFunding: TRLLevel
  fundingStage: string
  fundingAmount: number
  outcome?: 'success' | 'failed' | 'acquired' | 'ongoing'
}

// ============================================================================
// TRL Assessment
// ============================================================================

export interface TRLAssessment {
  id: string
  technologyId: string
  technologyName: string
  description: string
  domain: TRLDomain
  createdAt: string
  updatedAt: string
  status: TRLAssessmentStatus
  currentScore: TRLScore | null
  targetTRL: TRLLevel
  reviewSessions: ReviewSession[]
  evidence: AssessmentEvidence[]
  history: TRLProgressPoint[]
  milestones: TRLMilestone[]
  comparisons: TechnologyComparison[]
  metadata: Record<string, unknown>
}

export type TRLAssessmentStatus =
  | 'draft'
  | 'evidence-collection'
  | 'under-review'
  | 'consensus-building'
  | 'completed'
  | 'archived'

export interface TRLScore {
  level: TRLLevel
  sublevel: TRLSublevel
  numericScore?: number // 1.0 - 9.3 for granular tracking
  confidence: number // 0-100%
  justification: string
  strengths?: string[]
  gaps?: string[]
  recommendations?: string[]
  scoredAt?: string
  scoredBy?: string
  // Alternative field names for framework compatibility
  assessedAt?: string
  assessedBy?: string
}

// ============================================================================
// Multi-Reviewer Workflow
// ============================================================================

export interface Reviewer {
  id: string
  name: string
  email: string
  expertise: string[]
  domain: TRLDomain[]
  role: ReviewerRole
  organization?: string
  credentials?: string[]
}

export type ReviewerRole =
  | 'lead'
  | 'technical'
  | 'domain-expert'
  | 'external'
  // Framework compatibility roles
  | 'domain_expert'
  | 'technical_reviewer'
  | 'general_reviewer'
  | 'observer'

export interface ReviewSession {
  id: string
  assessmentId: string
  createdAt?: string
  startedAt?: string
  completedAt?: string
  status: ReviewSessionStatus | ReviewStatus
  reviewers: Reviewer[]
  // Can be array (for storage) or Map (for runtime)
  individualScores: IndividualScore[] | Map<string, TRLScore>
  consensusScore?: TRLScore
  disagreements?: TRLDisagreement[]
  consensusMethod?: ConsensusMethod
  notes?: ReviewNote[]
}

export type ReviewSessionStatus =
  | 'pending'
  | 'in-progress'
  | 'awaiting-consensus'
  | 'completed'
  | 'disputed'

export interface IndividualScore {
  reviewerId: string
  score: TRLScore
  submittedAt: string
  dimensionScores: DimensionScore[]
  comments: string
  confidenceLevel: 'high' | 'medium' | 'low'
}

export interface DimensionScore {
  dimension: TRLDimension
  score: number // 1-9
  weight: number
  justification: string
}

export type TRLDimension =
  | 'scientific-foundation'
  | 'proof-of-concept'
  | 'component-validation'
  | 'system-integration'
  | 'operational-performance'
  | 'manufacturing-readiness'
  | 'market-readiness'

export type ConsensusMethod =
  | 'delphi'
  | 'weighted-average'
  | 'median'
  | 'lowest-score'
  | 'majority-vote'
  | 'conservative'

export interface TRLDisagreement {
  id: string
  reviewerIds: string[]
  dimension?: TRLDimension
  scoreDifference?: number
  levelDifference?: number // Alternative name
  description: string
  resolution?: string
  resolved?: boolean
  resolvedAt?: string
  resolvedBy?: string
}

export interface ReviewNote {
  id: string
  reviewerId: string
  content: string
  createdAt: string
  isPrivate: boolean
  referencedEvidence?: string[]
}

// ============================================================================
// Evidence Collection
// ============================================================================

export interface AssessmentEvidence {
  id: string
  assessmentId: string
  category: EvidenceCategory
  title: string
  description: string
  documentId?: string
  documentUrl?: string
  extractedContent?: string
  uploadedAt: string
  uploadedBy: string
  verificationStatus: EvidenceVerificationStatus
  mappedRequirements: string[]
  reviewerComments: EvidenceComment[]
  metadata: Record<string, unknown>
}

export type EvidenceVerificationStatus =
  | 'pending'
  | 'verified'
  | 'insufficient'
  | 'rejected'

export interface EvidenceComment {
  id: string
  reviewerId: string
  content: string
  createdAt: string
  sentiment: 'positive' | 'neutral' | 'concern'
}

// ============================================================================
// Historical Tracking
// ============================================================================

export interface TRLProgressPoint {
  timestamp: string
  score: TRLScore
  milestone?: string
  triggeringEvent?: string
  notes?: string
}

export interface TRLMilestone {
  id: string
  assessmentId: string
  name: string
  description: string
  targetTRL: TRLLevel
  targetDate?: string
  completedAt?: string
  status: 'planned' | 'in-progress' | 'completed' | 'delayed' | 'cancelled'
  deliverables: string[]
  dependencies: string[]
  budget?: number
  actualSpend?: number
}

// ============================================================================
// Technology Comparison
// ============================================================================

export interface TechnologyComparison {
  id: string
  assessmentId: string
  comparedTechnologyId: string
  comparedTechnologyName: string
  comparedTRL: TRLScore
  relationship: 'competitor' | 'comparable' | 'predecessor' | 'derivative'
  comparisonNotes: string
  advantages: string[]
  disadvantages: string[]
  createdAt: string
}

export interface PeerBenchmark {
  domain: TRLDomain
  trlLevel: TRLLevel
  averageTimeToNextLevel: number // months
  averageFundingRequired: number
  successRate: number // percentage that reached next TRL
  commonBlockers: string[]
  sampleSize: number
  dataSource: string
  lastUpdated: string
}

// ============================================================================
// Report Generation
// ============================================================================

export interface TRLReportConfig {
  format: 'pdf' | 'pptx'
  template: TRLReportTemplate
  includeSections: TRLReportSection[]
  branding?: {
    logoUrl?: string
    primaryColor?: string
    companyName?: string
  }
  appendices: TRLReportAppendix[]
}

export type TRLReportTemplate =
  | 'executive-summary'
  | 'detailed-technical'
  | 'investor-focused'
  | 'progress-report'
  | 'custom'

export type TRLReportSection =
  | 'executive-summary'
  | 'trl-score-breakdown'
  | 'evidence-summary'
  | 'reviewer-consensus'
  | 'gap-analysis'
  | 'roadmap'
  | 'peer-comparison'
  | 'historical-progress'
  | 'recommendations'
  | 'appendices'

export type TRLReportAppendix =
  | 'full-evidence-list'
  | 'reviewer-comments'
  | 'methodology-description'
  | 'benchmark-data'

// ============================================================================
// TRL Calculation Engine
// ============================================================================

export interface TRLCalculationInput {
  domain: TRLDomain
  evidenceScores: Record<EvidenceCategory, number>
  dimensionScores: DimensionScore[]
  reviewerScores: IndividualScore[]
  consensusMethod: ConsensusMethod
  weights?: TRLWeightConfig
}

export interface TRLWeightConfig {
  evidenceWeight: number // 0-1
  dimensionWeight: number // 0-1
  reviewerWeight: number // 0-1
  // Evidence category weights
  categoryWeights: Record<EvidenceCategory, number>
  // Dimension weights
  dimensionWeights: Record<TRLDimension, number>
}

export interface TRLCalculationResult {
  score: TRLScore
  breakdown: {
    evidenceContribution: number
    dimensionContribution: number
    reviewerContribution: number
  }
  confidenceFactors: {
    evidenceCompleteness: number
    reviewerAgreement: number
    dataQuality: number
  }
  sensitivityAnalysis: {
    dimension: TRLDimension
    impact: number // How much score would change if this dimension varied
  }[]
}

// ============================================================================
// API Types
// ============================================================================

export interface CreateTRLAssessmentRequest {
  technologyName: string
  description: string
  domain: TRLDomain
  targetTRL?: TRLLevel
  initialEvidence?: Omit<AssessmentEvidence, 'id' | 'assessmentId' | 'uploadedAt' | 'uploadedBy' | 'verificationStatus'>[]
}

export interface TRLAssessmentListResponse {
  assessments: TRLAssessment[]
  total: number
  page: number
  pageSize: number
}

export interface StartReviewSessionRequest {
  assessmentId: string
  reviewerIds: string[]
  consensusMethod: ConsensusMethod
  deadline?: string
}

export interface SubmitReviewScoreRequest {
  sessionId: string
  reviewerId: string
  score: Omit<TRLScore, 'scoredAt' | 'scoredBy'>
  dimensionScores: Omit<DimensionScore, 'weight'>[]
  comments: string
  confidenceLevel: 'high' | 'medium' | 'low'
}
