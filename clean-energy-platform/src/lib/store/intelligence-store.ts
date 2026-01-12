/**
 * Intelligence Platform Store
 *
 * Manages state for Competitive Intelligence and Patent Analysis:
 * - Competitor tracking and watchlists
 * - Patent landscapes and FTO analysis
 * - Alerts and monitoring
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Competitor,
  CompetitiveLandscape,
  Watchlist,
  Alert,
  AlertRule,
  Patent,
  PatentLandscape,
  FTOAnalysis,
  PriorArtSearch,
} from '@/types/intelligence'

// ============================================================================
// Store Interface
// ============================================================================

interface IntelligenceStore {
  // State - Competitive Intelligence
  competitors: Competitor[]
  landscapes: CompetitiveLandscape[]
  watchlists: Watchlist[]
  alerts: Alert[]

  // State - Patent Intelligence
  patents: Patent[]
  patentLandscapes: PatentLandscape[]
  ftoAnalyses: FTOAnalysis[]
  priorArtSearches: PriorArtSearch[]

  // State - UI
  currentLandscapeId: string | null
  currentFTOId: string | null
  isLoading: boolean
  error: string | null

  // Computed
  currentLandscape: () => CompetitiveLandscape | undefined
  currentFTO: () => FTOAnalysis | undefined
  unreadAlerts: () => Alert[]

  // Actions - Competitors
  addCompetitor: (competitor: Omit<Competitor, 'id' | 'lastUpdated'>) => string
  updateCompetitor: (id: string, updates: Partial<Competitor>) => void
  removeCompetitor: (id: string) => void

  // Actions - Competitive Landscapes
  createLandscape: (
    name: string,
    description: string,
    technology: string,
    marketSegment: string
  ) => string
  updateLandscape: (id: string, updates: Partial<CompetitiveLandscape>) => void
  deleteLandscape: (id: string) => void
  setCurrentLandscape: (id: string | null) => void
  addCompetitorToLandscape: (landscapeId: string, competitor: Competitor) => void
  removeCompetitorFromLandscape: (landscapeId: string, competitorId: string) => void

  // Actions - Watchlists
  createWatchlist: (name: string, description?: string, competitorIds?: string[]) => string
  updateWatchlist: (id: string, updates: Partial<Watchlist>) => void
  deleteWatchlist: (id: string) => void
  addToWatchlist: (watchlistId: string, competitorId: string) => void
  removeFromWatchlist: (watchlistId: string, competitorId: string) => void
  addAlertRule: (watchlistId: string, rule: Omit<AlertRule, 'id' | 'watchlistId' | 'createdAt'>) => void
  removeAlertRule: (watchlistId: string, ruleId: string) => void
  toggleAlertRule: (watchlistId: string, ruleId: string, enabled: boolean) => void

  // Actions - Alerts
  addAlert: (alert: Omit<Alert, 'id'>) => void
  markAlertRead: (alertId: string) => void
  markAlertActioned: (alertId: string) => void
  dismissAlert: (alertId: string) => void
  clearAllAlerts: () => void

  // Actions - Patents
  addPatent: (patent: Patent) => void
  updatePatent: (id: string, updates: Partial<Patent>) => void
  removePatent: (id: string) => void

  // Actions - Patent Landscapes
  createPatentLandscape: (
    name: string,
    description: string,
    technology: string
  ) => string
  updatePatentLandscape: (id: string, updates: Partial<PatentLandscape>) => void
  deletePatentLandscape: (id: string) => void
  addPatentToLandscape: (landscapeId: string, patent: Patent) => void

  // Actions - FTO Analysis
  createFTOAnalysis: (
    name: string,
    technology: string,
    description: string,
    jurisdictions: string[]
  ) => string
  updateFTOAnalysis: (id: string, updates: Partial<FTOAnalysis>) => void
  deleteFTOAnalysis: (id: string) => void
  setCurrentFTO: (id: string | null) => void

  // Actions - Prior Art
  createPriorArtSearch: (
    name: string,
    inventionDescription: string
  ) => string
  updatePriorArtSearch: (id: string, updates: Partial<PriorArtSearch>) => void
  deletePriorArtSearch: (id: string) => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useIntelligenceStore = create<IntelligenceStore>()(
  persist(
    (set, get) => ({
      // Initial State
      competitors: [],
      landscapes: [],
      watchlists: [],
      alerts: [],
      patents: [],
      patentLandscapes: [],
      ftoAnalyses: [],
      priorArtSearches: [],
      currentLandscapeId: null,
      currentFTOId: null,
      isLoading: false,
      error: null,

      // Computed
      currentLandscape: () => {
        const { landscapes, currentLandscapeId } = get()
        return landscapes.find((l) => l.id === currentLandscapeId)
      },

      currentFTO: () => {
        const { ftoAnalyses, currentFTOId } = get()
        return ftoAnalyses.find((f) => f.id === currentFTOId)
      },

      unreadAlerts: () => {
        return get().alerts.filter((a) => !a.read)
      },

      // Competitors
      addCompetitor: (competitor: Omit<Competitor, 'id' | 'lastUpdated'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          competitors: [
            ...state.competitors,
            { ...competitor, id, lastUpdated: new Date().toISOString() },
          ],
        }))
        return id
      },

      updateCompetitor: (id: string, updates: Partial<Competitor>) => {
        set((state) => ({
          competitors: state.competitors.map((c) =>
            c.id === id ? { ...c, ...updates, lastUpdated: new Date().toISOString() } : c
          ),
        }))
      },

      removeCompetitor: (id: string) => {
        set((state) => ({
          competitors: state.competitors.filter((c) => c.id !== id),
          watchlists: state.watchlists.map((w) => ({
            ...w,
            competitorIds: w.competitorIds.filter((cId) => cId !== id),
          })),
        }))
      },

      // Competitive Landscapes
      createLandscape: (
        name: string,
        description: string,
        technology: string,
        marketSegment: string
      ) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const landscape: CompetitiveLandscape = {
          id,
          name,
          description,
          technology,
          marketSegment,
          createdAt: now,
          updatedAt: now,
          competitors: [],
          fundingTimeline: { events: [], cumulative: [] },
          technologyMatrix: { categories: [], competitors: [] },
          keyInsights: [],
        }

        set((state) => ({
          landscapes: [landscape, ...state.landscapes],
          currentLandscapeId: id,
        }))

        return id
      },

      updateLandscape: (id: string, updates: Partial<CompetitiveLandscape>) => {
        set((state) => ({
          landscapes: state.landscapes.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          ),
        }))
      },

      deleteLandscape: (id: string) => {
        set((state) => ({
          landscapes: state.landscapes.filter((l) => l.id !== id),
          currentLandscapeId:
            state.currentLandscapeId === id ? null : state.currentLandscapeId,
        }))
      },

      setCurrentLandscape: (id: string | null) => {
        set({ currentLandscapeId: id })
      },

      addCompetitorToLandscape: (landscapeId: string, competitor: Competitor) => {
        set((state) => ({
          landscapes: state.landscapes.map((l) =>
            l.id === landscapeId
              ? {
                  ...l,
                  competitors: [...l.competitors, competitor],
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }))
      },

      removeCompetitorFromLandscape: (landscapeId: string, competitorId: string) => {
        set((state) => ({
          landscapes: state.landscapes.map((l) =>
            l.id === landscapeId
              ? {
                  ...l,
                  competitors: l.competitors.filter((c) => c.id !== competitorId),
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }))
      },

      // Watchlists
      createWatchlist: (name: string, description?: string, competitorIds?: string[]) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const watchlist: Watchlist = {
          id,
          name,
          description,
          competitorIds: competitorIds || [],
          createdAt: now,
          updatedAt: now,
          createdBy: 'current-user',
          alertRules: [],
          sharedWith: [],
        }

        set((state) => ({
          watchlists: [watchlist, ...state.watchlists],
        }))

        return id
      },

      updateWatchlist: (id: string, updates: Partial<Watchlist>) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date().toISOString() } : w
          ),
        }))
      },

      deleteWatchlist: (id: string) => {
        set((state) => ({
          watchlists: state.watchlists.filter((w) => w.id !== id),
        }))
      },

      addToWatchlist: (watchlistId: string, competitorId: string) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId && !w.competitorIds.includes(competitorId)
              ? {
                  ...w,
                  competitorIds: [...w.competitorIds, competitorId],
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }))
      },

      removeFromWatchlist: (watchlistId: string, competitorId: string) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId
              ? {
                  ...w,
                  competitorIds: w.competitorIds.filter((id) => id !== competitorId),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }))
      },

      addAlertRule: (
        watchlistId: string,
        rule: Omit<AlertRule, 'id' | 'watchlistId' | 'createdAt'>
      ) => {
        const id = crypto.randomUUID()
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId
              ? {
                  ...w,
                  alertRules: [
                    ...w.alertRules,
                    { ...rule, id, watchlistId, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }))
      },

      removeAlertRule: (watchlistId: string, ruleId: string) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId
              ? {
                  ...w,
                  alertRules: w.alertRules.filter((r) => r.id !== ruleId),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }))
      },

      toggleAlertRule: (watchlistId: string, ruleId: string, enabled: boolean) => {
        set((state) => ({
          watchlists: state.watchlists.map((w) =>
            w.id === watchlistId
              ? {
                  ...w,
                  alertRules: w.alertRules.map((r) =>
                    r.id === ruleId ? { ...r, enabled } : r
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : w
          ),
        }))
      },

      // Alerts
      addAlert: (alert: Omit<Alert, 'id'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          alerts: [{ ...alert, id }, ...state.alerts],
        }))
      },

      markAlertRead: (alertId: string) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, read: true } : a
          ),
        }))
      },

      markAlertActioned: (alertId: string) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, actioned: true } : a
          ),
        }))
      },

      dismissAlert: (alertId: string) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
        }))
      },

      clearAllAlerts: () => {
        set({ alerts: [] })
      },

      // Patents
      addPatent: (patent: Patent) => {
        set((state) => ({
          patents: [patent, ...state.patents],
        }))
      },

      updatePatent: (id: string, updates: Partial<Patent>) => {
        set((state) => ({
          patents: state.patents.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }))
      },

      removePatent: (id: string) => {
        set((state) => ({
          patents: state.patents.filter((p) => p.id !== id),
        }))
      },

      // Patent Landscapes
      createPatentLandscape: (
        name: string,
        description: string,
        technology: string
      ) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const landscape: PatentLandscape = {
          id,
          name,
          description,
          technology,
          createdAt: now,
          updatedAt: now,
          searchQuery: { keywords: [] },
          totalPatents: 0,
          patents: [],
          topApplicants: [],
          technologyClusters: [],
          filingTrends: [],
          geographicDistribution: { byJurisdiction: {} as Partial<Record<string, number>>, byApplicantCountry: {} } as PatentLandscape['geographicDistribution'],
        }

        set((state) => ({
          patentLandscapes: [landscape, ...state.patentLandscapes],
        }))

        return id
      },

      updatePatentLandscape: (id: string, updates: Partial<PatentLandscape>) => {
        set((state) => ({
          patentLandscapes: state.patentLandscapes.map((l) =>
            l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
          ),
        }))
      },

      deletePatentLandscape: (id: string) => {
        set((state) => ({
          patentLandscapes: state.patentLandscapes.filter((l) => l.id !== id),
        }))
      },

      addPatentToLandscape: (landscapeId: string, patent: Patent) => {
        set((state) => ({
          patentLandscapes: state.patentLandscapes.map((l) =>
            l.id === landscapeId
              ? {
                  ...l,
                  patents: [...l.patents, patent],
                  totalPatents: l.totalPatents + 1,
                  updatedAt: new Date().toISOString(),
                }
              : l
          ),
        }))
      },

      // FTO Analysis
      createFTOAnalysis: (
        name: string,
        technology: string,
        description: string,
        jurisdictions: string[]
      ) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const fto: FTOAnalysis = {
          id,
          name,
          technology,
          description,
          createdAt: now,
          updatedAt: now,
          status: 'draft',
          jurisdictions: jurisdictions as FTOAnalysis['jurisdictions'],
          technologyClaims: [],
          relevantPatents: [],
          riskAssessment: {
            overallRisk: 'low',
            risksByJurisdiction: {} as FTOAnalysis['riskAssessment']['risksByJurisdiction'],
            blockingPatents: 0,
            potentiallyBlockingPatents: 0,
            designAroundOptions: 0,
          },
          recommendations: [],
        }

        set((state) => ({
          ftoAnalyses: [fto, ...state.ftoAnalyses],
          currentFTOId: id,
        }))

        return id
      },

      updateFTOAnalysis: (id: string, updates: Partial<FTOAnalysis>) => {
        set((state) => ({
          ftoAnalyses: state.ftoAnalyses.map((f) =>
            f.id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
          ),
        }))
      },

      deleteFTOAnalysis: (id: string) => {
        set((state) => ({
          ftoAnalyses: state.ftoAnalyses.filter((f) => f.id !== id),
          currentFTOId: state.currentFTOId === id ? null : state.currentFTOId,
        }))
      },

      setCurrentFTO: (id: string | null) => {
        set({ currentFTOId: id })
      },

      // Prior Art
      createPriorArtSearch: (name: string, inventionDescription: string) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const search: PriorArtSearch = {
          id,
          name,
          inventionDescription,
          createdAt: now,
          updatedAt: now,
          status: 'searching',
          searchScope: {
            dateRange: { start: '1990-01-01', end: now },
            sources: ['patents', 'publications'],
            jurisdictions: ['US', 'EP', 'WO'],
            languages: ['en'],
          },
          results: [],
        }

        set((state) => ({
          priorArtSearches: [search, ...state.priorArtSearches],
        }))

        return id
      },

      updatePriorArtSearch: (id: string, updates: Partial<PriorArtSearch>) => {
        set((state) => ({
          priorArtSearches: state.priorArtSearches.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }))
      },

      deletePriorArtSearch: (id: string) => {
        set((state) => ({
          priorArtSearches: state.priorArtSearches.filter((s) => s.id !== id),
        }))
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
      name: 'clean-energy-intelligence',
      partialize: (state) => ({
        competitors: state.competitors,
        landscapes: state.landscapes,
        watchlists: state.watchlists,
        alerts: state.alerts.slice(0, 100), // Keep only recent alerts
        patentLandscapes: state.patentLandscapes,
        ftoAnalyses: state.ftoAnalyses,
        priorArtSearches: state.priorArtSearches,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectCompetitorsByStage = (stage: Competitor['stage']) => {
  return useIntelligenceStore.getState().competitors.filter((c) => c.stage === stage)
}

export const selectWatchlistCompetitors = (watchlistId: string) => {
  const state = useIntelligenceStore.getState()
  const watchlist = state.watchlists.find((w) => w.id === watchlistId)
  if (!watchlist) return []
  return state.competitors.filter((c) => watchlist.competitorIds.includes(c.id))
}

export const selectIntelligenceStats = () => {
  const state = useIntelligenceStore.getState()
  return {
    competitors: state.competitors.length,
    landscapes: state.landscapes.length,
    watchlists: state.watchlists.length,
    unreadAlerts: state.alerts.filter((a) => !a.read).length,
    patentLandscapes: state.patentLandscapes.length,
    ftoAnalyses: state.ftoAnalyses.length,
  }
}
