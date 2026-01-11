/**
 * Investor Portal Types
 *
 * Type definitions for the investor due diligence portal,
 * including deal pipeline, white-label reporting, and API access.
 *
 * Phase 5 of investor due diligence market enhancement
 */

// ============================================================================
// Investor Account
// ============================================================================

export interface InvestorAccount {
  id: string
  name: string
  type: 'vc' | 'pe' | 'corporate' | 'family_office' | 'accelerator' | 'other'
  contacts: InvestorContact[]
  branding: InvestorBranding
  subscription: SubscriptionTier
  apiAccess: boolean
  createdAt: string
  updatedAt: string
}

export interface InvestorContact {
  id: string
  name: string
  email: string
  role: string
  isPrimary: boolean
  notifications: NotificationPreferences
}

export interface NotificationPreferences {
  assessmentComplete: boolean
  statusUpdates: boolean
  weeklyDigest: boolean
  apiAlerts: boolean
}

export type SubscriptionTier =
  | 'quick-trl' // $5K-$15K assessments only
  | 'professional' // + Physics validation
  | 'enterprise' // Full platform + API
  | 'custom' // Accelerator/custom deals

// ============================================================================
// Deal Pipeline
// ============================================================================

export type DealStatus =
  | 'received'
  | 'in_review'
  | 'assessment_in_progress'
  | 'pending_review'
  | 'delivered'
  | 'archived'

export type AssessmentType =
  | 'quick-trl'
  | 'physics-validation'
  | 'climate-diligence'
  | 'custom'

export interface Deal {
  id: string
  investorAccountId: string
  name: string
  technology: string
  description: string
  domainId: string
  status: DealStatus
  priority: 'urgent' | 'high' | 'normal' | 'low'
  assessmentType: AssessmentType
  requestedAt: string
  dueDate?: string
  deliveredAt?: string
  assignee?: string
  documents: DealDocument[]
  assessmentIds: string[]
  notes: DealNote[]
  metadata: Record<string, unknown>
}

export interface DealDocument {
  id: string
  name: string
  type: 'pitch_deck' | 'technical_spec' | 'research_paper' | 'financial_model' | 'other'
  uploadedAt: string
  size: number
  url?: string
  extractedData?: Record<string, unknown>
}

export interface DealNote {
  id: string
  author: string
  content: string
  createdAt: string
  isInternal: boolean
}

export interface DealStatusUpdate {
  status: DealStatus
  updatedAt: string
  updatedBy: string
  note?: string
}

// ============================================================================
// White-Label Branding
// ============================================================================

export interface InvestorBranding {
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  companyName: string
  tagline?: string
  footerText?: string
  reportHeader?: ReportHeaderConfig
  reportFooter?: ReportFooterConfig
}

export interface ReportHeaderConfig {
  showLogo: boolean
  showDate: boolean
  showConfidentiality: boolean
  customText?: string
}

export interface ReportFooterConfig {
  showPageNumbers: boolean
  showDisclaimer: boolean
  customDisclaimer?: string
  showBranding: boolean
}

// ============================================================================
// API Access
// ============================================================================

export interface APIKey {
  id: string
  investorAccountId: string
  name: string
  keyPrefix: string // First 8 chars for display
  permissions: APIPermission[]
  rateLimit: number // requests per hour
  createdAt: string
  lastUsedAt?: string
  expiresAt?: string
  isActive: boolean
}

export type APIPermission =
  | 'assessments:create'
  | 'assessments:read'
  | 'assessments:list'
  | 'documents:upload'
  | 'intelligence:competitors'
  | 'intelligence:patents'
  | 'reports:download'
  | 'webhooks:manage'

export interface WebhookConfig {
  id: string
  investorAccountId: string
  url: string
  secret: string
  events: WebhookEvent[]
  isActive: boolean
  createdAt: string
  lastTriggeredAt?: string
  failureCount: number
}

export type WebhookEvent =
  | 'assessment.started'
  | 'assessment.completed'
  | 'assessment.failed'
  | 'deal.status_changed'
  | 'document.processed'

export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: Record<string, unknown>
  signature: string
}

// ============================================================================
// Dashboard & Analytics
// ============================================================================

export interface PortalDashboard {
  investorAccountId: string
  stats: DashboardStats
  recentDeals: Deal[]
  upcomingDeliveries: Deal[]
  alerts: DashboardAlert[]
}

export interface DashboardStats {
  totalDeals: number
  activeAssessments: number
  completedThisMonth: number
  averageTurnaround: number // hours
  byStatus: Record<DealStatus, number>
  byType: Record<AssessmentType, number>
}

export interface DashboardAlert {
  id: string
  type: 'overdue' | 'review_needed' | 'document_missing' | 'info'
  severity: 'critical' | 'warning' | 'info'
  message: string
  dealId?: string
  createdAt: string
  dismissedAt?: string
}

// ============================================================================
// Batch Operations
// ============================================================================

export interface BatchAssessmentRequest {
  investorAccountId: string
  deals: Array<{
    name: string
    technology: string
    description: string
    domainId: string
    assessmentType: AssessmentType
    priority?: 'urgent' | 'high' | 'normal' | 'low'
    documents?: DealDocument[]
  }>
  webhookUrl?: string
}

export interface BatchAssessmentResponse {
  batchId: string
  totalDeals: number
  createdDeals: Deal[]
  estimatedCompletionDate: string
  webhookConfigured: boolean
}

// ============================================================================
// Report Templates
// ============================================================================

export interface ReportTemplate {
  id: string
  name: string
  description: string
  sections: ReportSection[]
  branding: InvestorBranding
  isDefault: boolean
}

export interface ReportSection {
  id: string
  title: string
  type:
    | 'executive_summary'
    | 'technology_assessment'
    | 'claims_validation'
    | 'competitive_analysis'
    | 'patent_landscape'
    | 'carbon_analysis'
    | 'risk_matrix'
    | 'recommendation'
    | 'custom'
  order: number
  includeByDefault: boolean
  customContent?: string
}
