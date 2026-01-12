/**
 * Investor Portal Pro Store
 *
 * Manages state for Investor Portal including:
 * - Deal pipeline management
 * - Team management
 * - Billing and subscriptions
 * - White-label branding
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Deal,
  DealStatus,
  InvestorAccount,
  TeamMember,
  TeamInvitation,
  BillingAccount,
  EnhancedBranding,
  AuditLogEntry,
} from '@/types/investor-portal'

// ============================================================================
// Store Interface
// ============================================================================

interface InvestorPortalStore {
  // State - Account
  currentAccount: InvestorAccount | null
  isAuthenticated: boolean

  // State - Deals
  deals: Deal[]
  currentDealId: string | null

  // State - Team
  teamMembers: TeamMember[]
  invitations: TeamInvitation[]

  // State - Billing
  billingAccount: BillingAccount | null

  // State - Branding
  branding: EnhancedBranding | null

  // State - Audit
  auditLog: AuditLogEntry[]

  // State - UI
  isLoading: boolean
  error: string | null

  // Computed
  currentDeal: () => Deal | undefined
  dealsByStatus: (status: DealStatus) => Deal[]
  activeTeamMembers: () => TeamMember[]
  pendingInvitations: () => TeamInvitation[]

  // Actions - Account
  setAccount: (account: InvestorAccount) => void
  updateAccount: (updates: Partial<InvestorAccount>) => void
  clearAccount: () => void

  // Actions - Deals
  createDeal: (deal: Omit<Deal, 'id' | 'requestedAt' | 'documents' | 'assessmentIds' | 'notes' | 'metadata'>) => string
  updateDeal: (id: string, updates: Partial<Deal>) => void
  deleteDeal: (id: string) => void
  setCurrentDeal: (id: string | null) => void
  updateDealStatus: (id: string, status: DealStatus, note?: string) => void
  addDealDocument: (dealId: string, document: Deal['documents'][0]) => void
  removeDealDocument: (dealId: string, documentId: string) => void
  addDealNote: (dealId: string, note: Omit<Deal['notes'][0], 'id' | 'createdAt'>) => void

  // Actions - Team
  addTeamMember: (member: Omit<TeamMember, 'id'>) => string
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void
  createInvitation: (invitation: Omit<TeamInvitation, 'id' | 'invitedAt' | 'status' | 'token'>) => string
  cancelInvitation: (id: string) => void
  acceptInvitation: (id: string) => void

  // Actions - Billing
  setBillingAccount: (billing: BillingAccount) => void
  updateBillingAccount: (updates: Partial<BillingAccount>) => void
  updateUsage: (usage: Partial<BillingAccount['usage']>) => void

  // Actions - Branding
  setBranding: (branding: EnhancedBranding) => void
  updateBranding: (updates: Partial<EnhancedBranding>) => void
  resetBranding: () => void

  // Actions - Audit
  logActivity: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void
  clearAuditLog: () => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// ============================================================================
// Default Branding
// ============================================================================

const defaultBranding: EnhancedBranding = {
  logoUrl: undefined,
  primaryColor: '#00D4AA',
  secondaryColor: '#1e293b',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
  companyName: 'Clean Energy Platform',
  theme: {
    mode: 'dark',
    primaryColor: '#00D4AA',
    secondaryColor: '#1e293b',
    accentColor: '#3b82f6',
    successColor: '#22c55e',
    warningColor: '#eab308',
    errorColor: '#ef4444',
    backgroundColor: '#0a0a0f',
    surfaceColor: '#1a1a24',
    textColor: '#e4e4e7',
    mutedTextColor: '#71717a',
    borderColor: '#27272a',
    borderRadius: 'medium',
  },
  typography: {
    fontFamily: 'Inter',
    baseFontSize: 14,
    headingScale: 1.25,
    lineHeight: 1.5,
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  components: {
    buttons: {
      borderRadius: 8,
      textTransform: 'none',
      fontWeight: 500,
    },
    cards: {
      borderRadius: 12,
      shadow: 'small',
      borderWidth: 1,
    },
    inputs: {
      borderRadius: 8,
      borderWidth: 1,
      focusRingColor: '#00D4AA',
    },
  },
  emailTemplates: {
    headerBackgroundColor: '#0a0a0f',
    footerBackgroundColor: '#1a1a24',
    buttonColor: '#00D4AA',
    buttonTextColor: '#0a0a0f',
  },
  reportTemplates: {
    coverPage: {
      showLogo: true,
      logoPosition: 'top-center',
      titleColor: '#e4e4e7',
      subtitleColor: '#71717a',
      showDate: true,
      showConfidentiality: true,
    },
    headerConfig: {
      showLogo: true,
      showDate: true,
      showConfidentiality: false,
    },
    footerConfig: {
      showPageNumbers: true,
      showDisclaimer: true,
      showBranding: true,
    },
    tableOfContents: true,
    appendixStyle: 'numbered',
    chartColors: ['#00D4AA', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
  },
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useInvestorPortalStore = create<InvestorPortalStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentAccount: null,
      isAuthenticated: false,
      deals: [],
      currentDealId: null,
      teamMembers: [],
      invitations: [],
      billingAccount: null,
      branding: defaultBranding,
      auditLog: [],
      isLoading: false,
      error: null,

      // Computed
      currentDeal: () => {
        const { deals, currentDealId } = get()
        return deals.find((d) => d.id === currentDealId)
      },

      dealsByStatus: (status: DealStatus) => {
        return get().deals.filter((d) => d.status === status)
      },

      activeTeamMembers: () => {
        return get().teamMembers.filter((m) => m.status === 'active')
      },

      pendingInvitations: () => {
        return get().invitations.filter((i) => i.status === 'pending')
      },

      // Account
      setAccount: (account: InvestorAccount) => {
        set({ currentAccount: account, isAuthenticated: true })
      },

      updateAccount: (updates: Partial<InvestorAccount>) => {
        set((state) => ({
          currentAccount: state.currentAccount
            ? { ...state.currentAccount, ...updates, updatedAt: new Date().toISOString() }
            : null,
        }))
      },

      clearAccount: () => {
        set({
          currentAccount: null,
          isAuthenticated: false,
          deals: [],
          teamMembers: [],
          invitations: [],
          billingAccount: null,
        })
      },

      // Deals
      createDeal: (deal: Omit<Deal, 'id' | 'requestedAt' | 'documents' | 'assessmentIds' | 'notes' | 'metadata'>) => {
        const id = crypto.randomUUID()
        const newDeal: Deal = {
          ...deal,
          id,
          requestedAt: new Date().toISOString(),
          documents: [],
          assessmentIds: [],
          notes: [],
          metadata: {},
        }

        set((state) => ({
          deals: [newDeal, ...state.deals],
          currentDealId: id,
        }))

        // Log activity
        get().logActivity({
          investorAccountId: deal.investorAccountId,
          actor: { type: 'user' },
          action: 'create',
          resource: { type: 'deal', id, name: deal.name },
          metadata: {},
        })

        return id
      },

      updateDeal: (id: string, updates: Partial<Deal>) => {
        set((state) => ({
          deals: state.deals.map((d) => (d.id === id ? { ...d, ...updates } : d)),
        }))
      },

      deleteDeal: (id: string) => {
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== id),
          currentDealId: state.currentDealId === id ? null : state.currentDealId,
        }))
      },

      setCurrentDeal: (id: string | null) => {
        set({ currentDealId: id })
      },

      updateDealStatus: (id: string, status: DealStatus, note?: string) => {
        set((state) => ({
          deals: state.deals.map((d) => {
            if (d.id !== id) return d

            const statusUpdate = {
              status,
              updatedAt: new Date().toISOString(),
              updatedBy: 'current-user',
              note,
            }

            const notes = note
              ? [
                  ...d.notes,
                  {
                    id: crypto.randomUUID(),
                    author: 'System',
                    content: `Status changed to ${status}${note ? `: ${note}` : ''}`,
                    createdAt: new Date().toISOString(),
                    isInternal: true,
                  },
                ]
              : d.notes

            return {
              ...d,
              status,
              notes,
              deliveredAt: status === 'delivered' ? new Date().toISOString() : d.deliveredAt,
            }
          }),
        }))
      },

      addDealDocument: (dealId: string, document: Deal['documents'][0]) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId
              ? { ...d, documents: [...d.documents, document] }
              : d
          ),
        }))
      },

      removeDealDocument: (dealId: string, documentId: string) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId
              ? { ...d, documents: d.documents.filter((doc) => doc.id !== documentId) }
              : d
          ),
        }))
      },

      addDealNote: (dealId: string, note: Omit<Deal['notes'][0], 'id' | 'createdAt'>) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  notes: [
                    ...d.notes,
                    { ...note, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
                  ],
                }
              : d
          ),
        }))
      },

      // Team
      addTeamMember: (member: Omit<TeamMember, 'id'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          teamMembers: [...state.teamMembers, { ...member, id }],
        }))
        return id
      },

      updateTeamMember: (id: string, updates: Partial<TeamMember>) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }))
      },

      removeTeamMember: (id: string) => {
        set((state) => ({
          teamMembers: state.teamMembers.map((m) =>
            m.id === id ? { ...m, status: 'removed' } : m
          ),
        }))
      },

      createInvitation: (invitation: Omit<TeamInvitation, 'id' | 'invitedAt' | 'status' | 'token'>) => {
        const id = crypto.randomUUID()
        const token = crypto.randomUUID()

        const newInvitation: TeamInvitation = {
          ...invitation,
          id,
          invitedAt: new Date().toISOString(),
          status: 'pending',
          token,
        }

        set((state) => ({
          invitations: [...state.invitations, newInvitation],
        }))

        return id
      },

      cancelInvitation: (id: string) => {
        set((state) => ({
          invitations: state.invitations.map((i) =>
            i.id === id ? { ...i, status: 'revoked' } : i
          ),
        }))
      },

      acceptInvitation: (id: string) => {
        const invitation = get().invitations.find((i) => i.id === id)
        if (!invitation || invitation.status !== 'pending') return

        // Create team member from invitation
        const memberId = crypto.randomUUID()
        const member: TeamMember = {
          id: memberId,
          investorAccountId: invitation.investorAccountId,
          userId: memberId,
          email: invitation.email,
          name: invitation.email.split('@')[0],
          role: invitation.role,
          permissions: invitation.permissions,
          status: 'active',
          invitedAt: invitation.invitedAt,
          invitedBy: invitation.invitedBy,
          acceptedAt: new Date().toISOString(),
        }

        set((state) => ({
          invitations: state.invitations.map((i) =>
            i.id === id ? { ...i, status: 'accepted' } : i
          ),
          teamMembers: [...state.teamMembers, member],
        }))
      },

      // Billing
      setBillingAccount: (billing: BillingAccount) => {
        set({ billingAccount: billing })
      },

      updateBillingAccount: (updates: Partial<BillingAccount>) => {
        set((state) => ({
          billingAccount: state.billingAccount
            ? { ...state.billingAccount, ...updates }
            : null,
        }))
      },

      updateUsage: (usage: Partial<BillingAccount['usage']>) => {
        set((state) => ({
          billingAccount: state.billingAccount
            ? {
                ...state.billingAccount,
                usage: { ...state.billingAccount.usage, ...usage },
              }
            : null,
        }))
      },

      // Branding
      setBranding: (branding: EnhancedBranding) => {
        set({ branding })
      },

      updateBranding: (updates: Partial<EnhancedBranding>) => {
        set((state) => ({
          branding: state.branding ? { ...state.branding, ...updates } : defaultBranding,
        }))
      },

      resetBranding: () => {
        set({ branding: defaultBranding })
      },

      // Audit
      logActivity: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          auditLog: [
            { ...entry, id, timestamp: new Date().toISOString() },
            ...state.auditLog.slice(0, 999), // Keep last 1000 entries
          ],
        }))
      },

      clearAuditLog: () => {
        set({ auditLog: [] })
      },

      // UI State
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'clean-energy-investor-portal',
      partialize: (state) => ({
        currentAccount: state.currentAccount,
        deals: state.deals,
        teamMembers: state.teamMembers,
        invitations: state.invitations.filter((i) => i.status === 'pending'),
        billingAccount: state.billingAccount,
        branding: state.branding,
        auditLog: state.auditLog.slice(0, 100), // Persist only recent audit entries
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectDealStats = () => {
  const deals = useInvestorPortalStore.getState().deals
  return {
    total: deals.length,
    received: deals.filter((d) => d.status === 'received').length,
    inProgress: deals.filter((d) =>
      ['in_review', 'assessment_in_progress'].includes(d.status)
    ).length,
    pendingReview: deals.filter((d) => d.status === 'pending_review').length,
    delivered: deals.filter((d) => d.status === 'delivered').length,
    archived: deals.filter((d) => d.status === 'archived').length,
  }
}

export const selectDealsByPriority = (priority: Deal['priority']) => {
  return useInvestorPortalStore.getState().deals.filter((d) => d.priority === priority)
}

export const selectTeamStats = () => {
  const state = useInvestorPortalStore.getState()
  return {
    total: state.teamMembers.length,
    active: state.teamMembers.filter((m) => m.status === 'active').length,
    pending: state.invitations.filter((i) => i.status === 'pending').length,
    byRole: state.teamMembers.reduce(
      (acc, m) => {
        acc[m.role] = (acc[m.role] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    ),
  }
}
