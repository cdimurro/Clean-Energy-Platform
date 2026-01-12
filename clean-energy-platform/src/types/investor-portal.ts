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

// ============================================================================
// Team Management (Enhancement 6)
// ============================================================================

export interface TeamMember {
  id: string
  investorAccountId: string
  userId: string
  email: string
  name: string
  role: TeamRole
  permissions: TeamPermission[]
  status: TeamMemberStatus
  invitedAt: string
  invitedBy: string
  acceptedAt?: string
  lastActiveAt?: string
  avatar?: string
}

export type TeamRole =
  | 'owner'
  | 'admin'
  | 'analyst'
  | 'viewer'
  | 'external-reviewer'

export type TeamPermission =
  | 'deals:create'
  | 'deals:edit'
  | 'deals:delete'
  | 'deals:view'
  | 'assessments:request'
  | 'assessments:view'
  | 'assessments:review'
  | 'documents:upload'
  | 'documents:download'
  | 'documents:delete'
  | 'team:invite'
  | 'team:manage'
  | 'team:remove'
  | 'billing:view'
  | 'billing:manage'
  | 'branding:edit'
  | 'api:manage'
  | 'settings:edit'

export type TeamMemberStatus =
  | 'invited'
  | 'active'
  | 'suspended'
  | 'removed'

export interface TeamInvitation {
  id: string
  investorAccountId: string
  email: string
  role: TeamRole
  permissions: TeamPermission[]
  invitedBy: string
  invitedAt: string
  expiresAt: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  token: string
}

export interface TeamActivityLog {
  id: string
  investorAccountId: string
  memberId: string
  memberName: string
  action: TeamAction
  resourceType: 'deal' | 'assessment' | 'document' | 'team' | 'settings' | 'billing'
  resourceId?: string
  resourceName?: string
  details?: Record<string, unknown>
  timestamp: string
  ipAddress?: string
}

export type TeamAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'viewed'
  | 'downloaded'
  | 'uploaded'
  | 'invited'
  | 'removed'
  | 'approved'
  | 'rejected'

// ============================================================================
// Billing & Subscription (Enhancement 6)
// ============================================================================

export interface BillingAccount {
  id: string
  investorAccountId: string
  plan: BillingPlan
  status: BillingStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  paymentMethod?: PaymentMethod
  billingContact: BillingContact
  usage: BillingUsage
  invoices: Invoice[]
  credits: BillingCredit[]
}

export type BillingPlan =
  | 'starter'
  | 'professional'
  | 'enterprise'
  | 'custom'

export type BillingStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'trialing'
  | 'paused'

export interface PaymentMethod {
  type: 'card' | 'bank_transfer' | 'invoice'
  last4?: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
}

export interface BillingContact {
  name: string
  email: string
  phone?: string
  address: BillingAddress
  taxId?: string
}

export interface BillingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface BillingUsage {
  assessmentsThisPeriod: number
  assessmentsLimit: number
  apiCallsThisPeriod: number
  apiCallsLimit: number
  storageUsedMb: number
  storageLimitMb: number
  teamMembersCount: number
  teamMembersLimit: number
}

export interface Invoice {
  id: string
  number: string
  amount: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  paidAt?: string
  periodStart: string
  periodEnd: string
  lineItems: InvoiceLineItem[]
  pdfUrl?: string
}

export type InvoiceStatus =
  | 'draft'
  | 'open'
  | 'paid'
  | 'void'
  | 'uncollectible'

export interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  type: 'subscription' | 'assessment' | 'overage' | 'credit' | 'discount'
}

export interface BillingCredit {
  id: string
  amount: number
  currency: string
  reason: string
  expiresAt?: string
  usedAmount: number
  createdAt: string
}

export interface PlanFeatures {
  plan: BillingPlan
  displayName: string
  monthlyPrice: number
  annualPrice: number
  features: PlanFeature[]
  limits: PlanLimits
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated'
}

export interface PlanFeature {
  name: string
  included: boolean
  limit?: string
}

export interface PlanLimits {
  assessmentsPerMonth: number | 'unlimited'
  apiCallsPerHour: number | 'unlimited'
  storageMb: number | 'unlimited'
  teamMembers: number | 'unlimited'
  customBranding: boolean
  whiteLabel: boolean
  ssoEnabled: boolean
  auditLogs: boolean
  customIntegrations: boolean
}

// ============================================================================
// Enhanced White-Label Branding (Enhancement 6)
// ============================================================================

export interface EnhancedBranding extends InvestorBranding {
  theme: BrandingTheme
  typography: BrandingTypography
  components: ComponentBranding
  emailTemplates: EmailTemplateBranding
  reportTemplates: ReportTemplateBranding
  customCss?: string
  faviconUrl?: string
  loginPageConfig?: LoginPageConfig
}

export interface BrandingTheme {
  mode: 'light' | 'dark' | 'system'
  primaryColor: string
  secondaryColor: string
  accentColor: string
  successColor: string
  warningColor: string
  errorColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  mutedTextColor: string
  borderColor: string
  borderRadius: 'none' | 'small' | 'medium' | 'large'
}

export interface BrandingTypography {
  fontFamily: string
  headingFontFamily?: string
  baseFontSize: number
  headingScale: number
  lineHeight: number
  fontWeights: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
}

export interface ComponentBranding {
  buttons: {
    borderRadius: number
    textTransform: 'none' | 'uppercase' | 'capitalize'
    fontWeight: number
  }
  cards: {
    borderRadius: number
    shadow: 'none' | 'small' | 'medium' | 'large'
    borderWidth: number
  }
  inputs: {
    borderRadius: number
    borderWidth: number
    focusRingColor: string
  }
}

export interface EmailTemplateBranding {
  headerLogoUrl?: string
  footerLogoUrl?: string
  headerBackgroundColor: string
  footerBackgroundColor: string
  buttonColor: string
  buttonTextColor: string
  socialLinks?: {
    linkedin?: string
    twitter?: string
    website?: string
  }
}

export interface ReportTemplateBranding {
  coverPage: CoverPageConfig
  headerConfig: ReportHeaderConfig
  footerConfig: ReportFooterConfig
  tableOfContents: boolean
  appendixStyle: 'numbered' | 'lettered'
  chartColors: string[]
  watermark?: {
    text: string
    opacity: number
  }
}

export interface CoverPageConfig {
  showLogo: boolean
  logoPosition: 'top-left' | 'top-center' | 'top-right' | 'center'
  backgroundImage?: string
  backgroundColor?: string
  titleColor: string
  subtitleColor: string
  showDate: boolean
  showConfidentiality: boolean
  confidentialityText?: string
}

export interface LoginPageConfig {
  backgroundImage?: string
  backgroundColor?: string
  showCompanyName: boolean
  welcomeMessage?: string
  termsUrl?: string
  privacyUrl?: string
}

// ============================================================================
// Audit Trail (Enhancement 6)
// ============================================================================

export interface AuditLogEntry {
  id: string
  investorAccountId: string
  timestamp: string
  actor: AuditActor
  action: AuditAction
  resource: AuditResource
  changes?: AuditChange[]
  metadata: AuditMetadata
}

export interface AuditActor {
  type: 'user' | 'api' | 'system' | 'webhook'
  id?: string
  name?: string
  email?: string
  apiKeyId?: string
}

export type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'export'
  | 'import'
  | 'login'
  | 'logout'
  | 'invite'
  | 'accept_invite'
  | 'revoke_invite'
  | 'permission_change'
  | 'api_key_create'
  | 'api_key_revoke'
  | 'webhook_trigger'
  | 'payment_success'
  | 'payment_failed'

export interface AuditResource {
  type: 'deal' | 'assessment' | 'document' | 'team_member' | 'api_key' | 'webhook' | 'billing' | 'branding' | 'settings'
  id: string
  name?: string
}

export interface AuditChange {
  field: string
  oldValue: unknown
  newValue: unknown
}

export interface AuditMetadata {
  ipAddress?: string
  userAgent?: string
  location?: string
  sessionId?: string
  requestId?: string
}

export interface AuditLogQuery {
  investorAccountId: string
  startDate?: string
  endDate?: string
  actors?: string[]
  actions?: AuditAction[]
  resourceTypes?: AuditResource['type'][]
  resourceIds?: string[]
  page?: number
  pageSize?: number
}

export interface AuditLogResponse {
  entries: AuditLogEntry[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// SSO Configuration (Enhancement 6)
// ============================================================================

export interface SSOConfig {
  id: string
  investorAccountId: string
  provider: SSOProvider
  enabled: boolean
  config: SSOProviderConfig
  domains: string[]
  defaultRole: TeamRole
  autoProvision: boolean
  createdAt: string
  updatedAt: string
}

export type SSOProvider =
  | 'google'
  | 'microsoft'
  | 'okta'
  | 'onelogin'
  | 'auth0'
  | 'saml'
  | 'oidc'

export interface SSOProviderConfig {
  clientId?: string
  clientSecret?: string
  tenantId?: string
  domain?: string
  issuer?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  samlMetadataUrl?: string
  samlCertificate?: string
  attributeMapping?: Record<string, string>
}

// ============================================================================
// API Types for Portal Pro
// ============================================================================

export interface InviteTeamMemberRequest {
  investorAccountId: string
  email: string
  name: string
  role: TeamRole
  permissions?: TeamPermission[]
  message?: string
}

export interface UpdateTeamMemberRequest {
  memberId: string
  role?: TeamRole
  permissions?: TeamPermission[]
  status?: TeamMemberStatus
}

export interface UpdateBillingRequest {
  investorAccountId: string
  plan?: BillingPlan
  paymentMethod?: Omit<PaymentMethod, 'isDefault'>
  billingContact?: BillingContact
}

export interface UpdateBrandingRequest {
  investorAccountId: string
  branding: Partial<EnhancedBranding>
}

export interface GenerateInvoiceRequest {
  investorAccountId: string
  lineItems: Omit<InvoiceLineItem, 'amount'>[]
  dueDate: string
  notes?: string
}

export interface ExportAuditLogRequest {
  query: AuditLogQuery
  format: 'csv' | 'json' | 'pdf'
  includeDetails: boolean
}
