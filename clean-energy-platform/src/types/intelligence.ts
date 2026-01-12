/**
 * Intelligence Platform Types
 *
 * Type definitions for competitive intelligence and patent analysis
 * with real data source integrations (Crunchbase, USPTO, EPO, etc.).
 *
 * Enhancements 3 & 4 of investor due diligence market enhancement
 */

// ============================================================================
// Data Sources
// ============================================================================

export type DataSource =
  | 'crunchbase'
  | 'sec-edgar'
  | 'newsapi'
  | 'eia'
  | 'uspto'
  | 'epo'
  | 'wipo'
  | 'google-patents'
  | 'lens-org'
  | 'manual'

export interface DataSourceConfig {
  source: DataSource
  apiKey?: string
  enabled: boolean
  rateLimit: number // requests per minute
  cacheTtl: number // seconds
  lastSync?: string
  status: 'connected' | 'error' | 'rate-limited' | 'disabled'
  errorMessage?: string
}

// ============================================================================
// Competitive Intelligence
// ============================================================================

export interface Competitor {
  id: string
  name: string
  description: string
  website?: string
  logo?: string
  foundedYear?: number
  headquarters: Location
  employees?: EmployeeRange
  stage: CompanyStage
  status: 'active' | 'acquired' | 'shutdown' | 'merged'
  technologyApproach: string
  technologyCategory: string[]
  fundingHistory: FundingRound[]
  totalFunding: number
  lastFundingDate?: string
  keyPeople: KeyPerson[]
  patents: PatentSummary
  news: NewsItem[]
  socialMetrics?: SocialMetrics
  competitivePosition?: CompetitivePosition
  swot?: SWOTAnalysis
  lastUpdated: string
  dataSources: DataSource[]
}

export interface Location {
  city?: string
  state?: string
  country: string
  region?: string
}

export interface EmployeeRange {
  min: number
  max: number
  source: string
  asOf: string
}

export type CompanyStage =
  | 'pre-seed'
  | 'seed'
  | 'series-a'
  | 'series-b'
  | 'series-c'
  | 'series-d-plus'
  | 'growth'
  | 'public'
  | 'acquired'

export interface FundingRound {
  id: string
  date: string
  stage: CompanyStage
  amount: number
  currency: string
  investors: Investor[]
  leadInvestor?: string
  valuation?: number
  source: DataSource
  sourceUrl?: string
}

export interface Investor {
  id: string
  name: string
  type: 'vc' | 'pe' | 'corporate' | 'angel' | 'government' | 'family-office' | 'other'
  website?: string
  logo?: string
  portfolioCount?: number
  focusAreas?: string[]
}

export interface KeyPerson {
  id: string
  name: string
  title: string
  linkedinUrl?: string
  bio?: string
  previousCompanies?: string[]
  expertise?: string[]
}

export interface PatentSummary {
  totalPatents: number
  grantedPatents: number
  pendingApplications: number
  patentFamilies: number
  keyTechnologies: string[]
  lastFiled?: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: string
  sentiment: 'positive' | 'neutral' | 'negative'
  relevance: number // 0-1
  categories: string[]
}

export interface SocialMetrics {
  linkedinFollowers?: number
  twitterFollowers?: number
  websiteTraffic?: WebsiteTraffic
  employeeGrowth?: GrowthMetric
}

export interface WebsiteTraffic {
  monthlyVisits: number
  trend: 'up' | 'down' | 'stable'
  source: string
  asOf: string
}

export interface GrowthMetric {
  current: number
  previous: number
  periodMonths: number
  percentChange: number
}

// ============================================================================
// Competitive Analysis
// ============================================================================

export interface CompetitiveLandscape {
  id: string
  name: string
  description: string
  technology: string
  marketSegment: string
  createdAt: string
  updatedAt: string
  competitors: Competitor[]
  targetCompany?: Competitor
  positioningChart?: PositioningData
  fundingTimeline: FundingTimelineData
  technologyMatrix: TechnologyMatrix
  marketShare?: MarketShareData
  keyInsights: string[]
}

export interface PositioningData {
  xAxis: {
    label: string
    metric: string
  }
  yAxis: {
    label: string
    metric: string
  }
  bubbleSize: {
    label: string
    metric: string
  }
  dataPoints: PositioningPoint[]
}

export interface PositioningPoint {
  competitorId: string
  competitorName: string
  x: number
  y: number
  size: number
  color?: string
  isTarget?: boolean
}

export interface FundingTimelineData {
  events: FundingTimelineEvent[]
  cumulative: CumulativeFunding[]
}

export interface FundingTimelineEvent {
  competitorId: string
  competitorName: string
  date: string
  amount: number
  stage: CompanyStage
  investors: string[]
}

export interface CumulativeFunding {
  competitorId: string
  competitorName: string
  data: { date: string; total: number }[]
}

export interface TechnologyMatrix {
  categories: string[]
  competitors: {
    competitorId: string
    competitorName: string
    capabilities: Record<string, TechnologyCapability>
  }[]
}

export interface TechnologyCapability {
  level: 'none' | 'basic' | 'intermediate' | 'advanced' | 'leading'
  description?: string
  evidence?: string[]
}

export interface MarketShareData {
  total: number
  unit: string
  year: number
  shares: {
    competitorId: string
    competitorName: string
    share: number
    trend: 'up' | 'down' | 'stable'
  }[]
  source: string
}

export interface CompetitivePosition {
  overallRating: 'leader' | 'challenger' | 'niche' | 'emerging'
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  differentiators: string[]
  riskFactors: string[]
}

export interface SWOTAnalysis {
  strengths: SWOTItem[]
  weaknesses: SWOTItem[]
  opportunities: SWOTItem[]
  threats: SWOTItem[]
  generatedAt: string
  confidence: number
}

export interface SWOTItem {
  description: string
  category: string
  importance: 'high' | 'medium' | 'low'
  evidence?: string[]
}

// ============================================================================
// Monitoring & Alerts
// ============================================================================

export interface Watchlist {
  id: string
  name: string
  description?: string
  competitorIds: string[]
  createdAt: string
  updatedAt: string
  createdBy: string
  alertRules: AlertRule[]
  sharedWith: string[]
}

export interface AlertRule {
  id: string
  watchlistId: string
  name: string
  type: AlertType
  conditions: AlertCondition[]
  channels: AlertChannel[]
  enabled: boolean
  frequency: AlertFrequency
  lastTriggered?: string
  createdAt: string
}

export type AlertType =
  | 'funding'
  | 'patent'
  | 'news'
  | 'executive-change'
  | 'product-launch'
  | 'partnership'
  | 'acquisition'
  | 'custom'

export interface AlertCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: string | number | string[]
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'in-app'
  config: Record<string, string>
  enabled: boolean
}

export type AlertFrequency =
  | 'immediate'
  | 'daily-digest'
  | 'weekly-digest'

export interface Alert {
  id: string
  ruleId: string
  watchlistId: string
  type: AlertType
  title: string
  summary: string
  competitorId: string
  competitorName: string
  triggeredAt: string
  data: Record<string, unknown>
  read: boolean
  actioned: boolean
}

// ============================================================================
// Patent Intelligence
// ============================================================================

export interface Patent {
  id: string
  patentNumber: string
  title: string
  abstract: string
  claims: PatentClaim[]
  applicant: PatentHolder
  inventors: PatentInventor[]
  filingDate: string
  publicationDate: string
  grantDate?: string
  status: PatentStatus
  jurisdiction: PatentJurisdiction
  classifications: PatentClassification[]
  citations: PatentCitation[]
  citedBy: PatentCitation[]
  family: PatentFamily | null
  fullText?: string
  figures?: PatentFigure[]
  source: DataSource
  sourceUrl: string
}

export type PatentStatus =
  | 'pending'
  | 'published'
  | 'granted'
  | 'abandoned'
  | 'expired'
  | 'lapsed'

export type PatentJurisdiction =
  | 'US'
  | 'EP'
  | 'WO'
  | 'CN'
  | 'JP'
  | 'KR'
  | 'DE'
  | 'FR'
  | 'GB'
  | 'other'

export interface PatentClaim {
  number: number
  text: string
  type: 'independent' | 'dependent'
  dependsOn?: number[]
}

export interface PatentHolder {
  name: string
  type: 'company' | 'individual' | 'university' | 'government' | 'other'
  country: string
}

export interface PatentInventor {
  name: string
  country?: string
  affiliation?: string
}

export interface PatentClassification {
  system: 'IPC' | 'CPC' | 'USPC'
  code: string
  description: string
}

export interface PatentCitation {
  patentId: string
  patentNumber: string
  title: string
  applicant: string
  relevance?: 'high' | 'medium' | 'low'
}

export interface PatentFamily {
  id: string
  size: number
  jurisdictions: PatentJurisdiction[]
  earliestPriority: string
  members: PatentFamilyMember[]
}

export interface PatentFamilyMember {
  patentNumber: string
  jurisdiction: PatentJurisdiction
  status: PatentStatus
  filingDate: string
}

export interface PatentFigure {
  number: number
  description?: string
  url: string
}

// ============================================================================
// Patent Landscape Analysis
// ============================================================================

export interface PatentLandscape {
  id: string
  name: string
  description: string
  technology: string
  createdAt: string
  updatedAt: string
  searchQuery: PatentSearchQuery
  totalPatents: number
  patents: Patent[]
  topApplicants: ApplicantAnalysis[]
  technologyClusters: TechnologyCluster[]
  filingTrends: FilingTrend[]
  geographicDistribution: GeographicDistribution
  citationNetwork?: CitationNetwork
  whitespaceAnalysis?: WhitespaceAnalysis
}

export interface PatentSearchQuery {
  keywords: string[]
  classifications?: string[]
  applicants?: string[]
  dateRange?: {
    start: string
    end: string
  }
  jurisdictions?: PatentJurisdiction[]
  status?: PatentStatus[]
}

export interface ApplicantAnalysis {
  name: string
  patentCount: number
  grantedCount: number
  pendingCount: number
  filingTrend: 'increasing' | 'stable' | 'decreasing'
  topTechnologies: string[]
  averageCitations: number
}

export interface TechnologyCluster {
  id: string
  name: string
  description: string
  patentCount: number
  keyClassifications: string[]
  topApplicants: string[]
  growth: 'high' | 'medium' | 'low' | 'declining'
}

export interface FilingTrend {
  year: number
  filings: number
  grants: number
  byApplicant?: Record<string, number>
  byTechnology?: Record<string, number>
}

export interface GeographicDistribution {
  byJurisdiction: Record<PatentJurisdiction, number>
  byApplicantCountry: Record<string, number>
}

export interface CitationNetwork {
  nodes: CitationNode[]
  edges: CitationEdge[]
}

export interface CitationNode {
  id: string
  patentNumber: string
  title: string
  applicant: string
  year: number
  citations: number
}

export interface CitationEdge {
  source: string
  target: string
  type: 'cites' | 'cited-by'
}

export interface WhitespaceAnalysis {
  opportunities: WhitespaceOpportunity[]
  coverageMap: CoverageMapData
}

export interface WhitespaceOpportunity {
  id: string
  description: string
  technologyArea: string
  classifications: string[]
  competitorCoverage: 'none' | 'low' | 'medium' | 'high'
  marketPotential: 'high' | 'medium' | 'low'
  filingRecommendation: string
}

export interface CoverageMapData {
  dimensions: string[]
  cells: CoverageCell[]
}

export interface CoverageCell {
  x: string
  y: string
  coverage: number // 0-1
  patentCount: number
  topApplicant?: string
}

// ============================================================================
// Freedom to Operate (FTO)
// ============================================================================

export interface FTOAnalysis {
  id: string
  name: string
  technology: string
  description: string
  createdAt: string
  updatedAt: string
  status: FTOStatus
  jurisdictions: PatentJurisdiction[]
  technologyClaims: TechnologyClaim[]
  relevantPatents: FTOPatent[]
  riskAssessment: FTORiskAssessment
  recommendations: FTORecommendation[]
  opinions?: LegalOpinion[]
}

export type FTOStatus =
  | 'draft'
  | 'search-in-progress'
  | 'analysis-in-progress'
  | 'review'
  | 'completed'

export interface TechnologyClaim {
  id: string
  description: string
  features: string[]
  relevantClassifications: string[]
}

export interface FTOPatent {
  patent: Patent
  relevance: 'high' | 'medium' | 'low'
  claimMapping: ClaimMapping[]
  infringementRisk: InfringementRisk
  expirationDate?: string
  designAroundPossibility: 'easy' | 'moderate' | 'difficult' | 'unlikely'
  notes?: string
}

export interface ClaimMapping {
  technologyClaimId: string
  patentClaimNumber: number
  overlap: 'full' | 'partial' | 'none'
  analysis: string
}

export interface InfringementRisk {
  level: 'critical' | 'high' | 'medium' | 'low' | 'none'
  type: 'literal' | 'doctrine-of-equivalents' | 'contributory' | 'induced'
  analysis: string
  mitigationOptions: string[]
}

export interface FTORiskAssessment {
  overallRisk: 'critical' | 'high' | 'medium' | 'low'
  risksByJurisdiction: Record<PatentJurisdiction, 'critical' | 'high' | 'medium' | 'low'>
  blockingPatents: number
  potentiallyBlockingPatents: number
  designAroundOptions: number
  estimatedLicensingCost?: {
    min: number
    max: number
    currency: string
  }
}

export interface FTORecommendation {
  id: string
  type: 'proceed' | 'proceed-with-caution' | 'design-around' | 'license' | 'challenge' | 'wait' | 'avoid'
  jurisdiction?: PatentJurisdiction
  patentIds?: string[]
  description: string
  rationale: string
  cost?: {
    min: number
    max: number
    currency: string
  }
  timeline?: string
  priority: 'high' | 'medium' | 'low'
}

export interface LegalOpinion {
  id: string
  type: 'non-infringement' | 'invalidity' | 'fto'
  patentId?: string
  author: string
  date: string
  summary: string
  conclusion: 'favorable' | 'unfavorable' | 'mixed'
  documentUrl?: string
}

// ============================================================================
// Prior Art Search
// ============================================================================

export interface PriorArtSearch {
  id: string
  name: string
  targetPatent?: Patent
  inventionDescription: string
  createdAt: string
  updatedAt: string
  status: 'searching' | 'analyzing' | 'completed'
  searchScope: PriorArtSearchScope
  results: PriorArtResult[]
  summary?: PriorArtSummary
}

export interface PriorArtSearchScope {
  dateRange: {
    start: string
    end: string
  }
  sources: ('patents' | 'publications' | 'products' | 'standards')[]
  jurisdictions: PatentJurisdiction[]
  languages: string[]
}

export interface PriorArtResult {
  id: string
  type: 'patent' | 'publication' | 'product' | 'standard'
  title: string
  date: string
  source: string
  sourceUrl: string
  abstract?: string
  relevance: number // 0-1
  relevantSections?: string[]
  anticipatesClaimsNumbers?: number[]
  analysis?: string
}

export interface PriorArtSummary {
  totalResults: number
  highlyRelevant: number
  potentiallyAnticipating: number
  keyFindings: string[]
  claimVulnerabilities: {
    claimNumber: number
    vulnerability: 'high' | 'medium' | 'low'
    priorArtIds: string[]
  }[]
}

// ============================================================================
// API Types
// ============================================================================

export interface SearchCompetitorsRequest {
  technology: string
  keywords?: string[]
  stage?: CompanyStage[]
  fundingRange?: {
    min?: number
    max?: number
  }
  location?: {
    countries?: string[]
    regions?: string[]
  }
  limit?: number
}

export interface SearchPatentsRequest {
  query: PatentSearchQuery
  page?: number
  pageSize?: number
  sortBy?: 'relevance' | 'date' | 'citations'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateFTOAnalysisRequest {
  name: string
  technology: string
  description: string
  jurisdictions: PatentJurisdiction[]
  technologyClaims: Omit<TechnologyClaim, 'id'>[]
}

export interface CreateWatchlistRequest {
  name: string
  description?: string
  competitorIds: string[]
  alertRules?: Omit<AlertRule, 'id' | 'watchlistId' | 'createdAt'>[]
}

export interface CompetitorSearchResponse {
  competitors: Competitor[]
  total: number
  page: number
  pageSize: number
}

export interface PatentSearchResponse {
  patents: Patent[]
  total: number
  page: number
  pageSize: number
  facets?: {
    jurisdictions: Record<PatentJurisdiction, number>
    years: Record<string, number>
    applicants: Record<string, number>
    classifications: Record<string, number>
  }
}
