/**
 * TRL Assessment Store
 *
 * Manages state for TRL Assessment Pro including:
 * - Multi-reviewer workflow
 * - Evidence collection
 * - Historical tracking
 * - Technology comparison
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  TRLAssessment,
  TRLAssessmentStatus,
  TRLScore,
  TRLDomain,
  TRLLevel,
  ReviewSession,
  Reviewer,
  IndividualScore,
  AssessmentEvidence,
  TRLMilestone,
  TRLProgressPoint,
  TechnologyComparison,
  ConsensusMethod,
} from '@/types/trl'

// ============================================================================
// Store Interface
// ============================================================================

interface TRLStore {
  // State
  assessments: TRLAssessment[]
  currentAssessmentId: string | null
  reviewers: Reviewer[]
  isLoading: boolean
  error: string | null

  // Computed
  currentAssessment: () => TRLAssessment | undefined
  getAssessmentById: (id: string) => TRLAssessment | undefined

  // Actions - Assessment CRUD
  createAssessment: (
    technologyName: string,
    description: string,
    domain: TRLDomain,
    targetTRL?: TRLLevel
  ) => string
  updateAssessment: (id: string, updates: Partial<TRLAssessment>) => void
  deleteAssessment: (id: string) => void
  setCurrentAssessment: (id: string | null) => void
  updateAssessmentStatus: (id: string, status: TRLAssessmentStatus) => void

  // Actions - Evidence
  addEvidence: (assessmentId: string, evidence: Omit<AssessmentEvidence, 'id' | 'assessmentId'>) => void
  updateEvidence: (assessmentId: string, evidenceId: string, updates: Partial<AssessmentEvidence>) => void
  removeEvidence: (assessmentId: string, evidenceId: string) => void

  // Actions - Review Sessions
  createReviewSession: (
    assessmentId: string,
    reviewerIds: string[],
    consensusMethod: ConsensusMethod
  ) => string
  submitReviewScore: (
    assessmentId: string,
    sessionId: string,
    reviewerId: string,
    score: IndividualScore
  ) => void
  setConsensusScore: (assessmentId: string, sessionId: string, score: TRLScore) => void
  resolveDisagreement: (
    assessmentId: string,
    sessionId: string,
    disagreementId: string,
    resolution: string
  ) => void

  // Actions - Reviewers
  addReviewer: (reviewer: Omit<Reviewer, 'id'>) => string
  updateReviewer: (reviewerId: string, updates: Partial<Reviewer>) => void
  removeReviewer: (reviewerId: string) => void

  // Actions - Milestones
  addMilestone: (assessmentId: string, milestone: Omit<TRLMilestone, 'id' | 'assessmentId'>) => void
  updateMilestone: (assessmentId: string, milestoneId: string, updates: Partial<TRLMilestone>) => void
  removeMilestone: (assessmentId: string, milestoneId: string) => void

  // Actions - Progress Tracking
  recordProgress: (assessmentId: string, progressPoint: TRLProgressPoint) => void

  // Actions - Technology Comparison
  addComparison: (
    assessmentId: string,
    comparison: Omit<TechnologyComparison, 'id' | 'assessmentId' | 'createdAt'>
  ) => void
  removeComparison: (assessmentId: string, comparisonId: string) => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useTRLStore = create<TRLStore>()(
  persist(
    (set, get) => ({
      // Initial State
      assessments: [],
      currentAssessmentId: null,
      reviewers: [],
      isLoading: false,
      error: null,

      // Computed
      currentAssessment: () => {
        const { assessments, currentAssessmentId } = get()
        return assessments.find((a) => a.id === currentAssessmentId)
      },

      getAssessmentById: (id: string) => {
        return get().assessments.find((a) => a.id === id)
      },

      // Assessment CRUD
      createAssessment: (
        technologyName: string,
        description: string,
        domain: TRLDomain,
        targetTRL?: TRLLevel
      ) => {
        const id = crypto.randomUUID()
        const now = new Date().toISOString()

        const newAssessment: TRLAssessment = {
          id,
          technologyId: crypto.randomUUID(),
          technologyName,
          description,
          domain,
          createdAt: now,
          updatedAt: now,
          status: 'draft',
          currentScore: null,
          targetTRL: targetTRL || 9,
          reviewSessions: [],
          evidence: [],
          history: [],
          milestones: [],
          comparisons: [],
          metadata: {},
        }

        set((state) => ({
          assessments: [newAssessment, ...state.assessments],
          currentAssessmentId: id,
        }))

        return id
      },

      updateAssessment: (id: string, updates: Partial<TRLAssessment>) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }))
      },

      deleteAssessment: (id: string) => {
        set((state) => ({
          assessments: state.assessments.filter((a) => a.id !== id),
          currentAssessmentId:
            state.currentAssessmentId === id ? null : state.currentAssessmentId,
        }))
      },

      setCurrentAssessment: (id: string | null) => {
        set({ currentAssessmentId: id })
      },

      updateAssessmentStatus: (id: string, status: TRLAssessmentStatus) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === id ? { ...a, status, updatedAt: new Date().toISOString() } : a
          ),
        }))
      },

      // Evidence
      addEvidence: (assessmentId: string, evidence: Omit<AssessmentEvidence, 'id' | 'assessmentId'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  evidence: [...a.evidence, { ...evidence, id, assessmentId }],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      updateEvidence: (assessmentId: string, evidenceId: string, updates: Partial<AssessmentEvidence>) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  evidence: a.evidence.map((e) =>
                    e.id === evidenceId ? { ...e, ...updates } : e
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      removeEvidence: (assessmentId: string, evidenceId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  evidence: a.evidence.filter((e) => e.id !== evidenceId),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      // Review Sessions
      createReviewSession: (
        assessmentId: string,
        reviewerIds: string[],
        consensusMethod: ConsensusMethod
      ) => {
        const sessionId = crypto.randomUUID()
        const reviewers = get().reviewers.filter((r) => reviewerIds.includes(r.id))

        const session: ReviewSession = {
          id: sessionId,
          assessmentId,
          createdAt: new Date().toISOString(),
          status: 'pending',
          reviewers,
          individualScores: [],
          disagreements: [],
          consensusMethod,
          notes: [],
        }

        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  reviewSessions: [...a.reviewSessions, session],
                  status: 'under-review',
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))

        return sessionId
      },

      submitReviewScore: (
        assessmentId: string,
        sessionId: string,
        reviewerId: string,
        score: IndividualScore
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId) return a

            const updatedSessions = a.reviewSessions.map((s) => {
              if (s.id !== sessionId) return s

              const scoresArray = s.individualScores as IndividualScore[]
              const existingScoreIndex = scoresArray.findIndex(
                (is: IndividualScore) => is.reviewerId === reviewerId
              )
              const updatedScores =
                existingScoreIndex >= 0
                  ? scoresArray.map((is: IndividualScore, idx: number) =>
                      idx === existingScoreIndex ? score : is
                    )
                  : [...scoresArray, score]

              return {
                ...s,
                individualScores: updatedScores,
                status:
                  updatedScores.length === s.reviewers.length
                    ? ('awaiting-consensus' as const)
                    : ('in-progress' as const),
              }
            })

            return {
              ...a,
              reviewSessions: updatedSessions,
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      setConsensusScore: (assessmentId: string, sessionId: string, score: TRLScore) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId) return a

            const updatedSessions = a.reviewSessions.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    consensusScore: score,
                    status: 'completed' as const,
                    completedAt: new Date().toISOString(),
                  }
                : s
            )

            // Record progress point
            const progressPoint: TRLProgressPoint = {
              timestamp: new Date().toISOString(),
              score,
              milestone: 'Review completed',
            }

            return {
              ...a,
              reviewSessions: updatedSessions,
              currentScore: score,
              history: [...a.history, progressPoint],
              status: 'completed',
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      resolveDisagreement: (
        assessmentId: string,
        sessionId: string,
        disagreementId: string,
        resolution: string
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId) return a

            return {
              ...a,
              reviewSessions: a.reviewSessions.map((s) =>
                s.id === sessionId
                  ? {
                      ...s,
                      disagreements: (s.disagreements || []).map((d) =>
                        d.id === disagreementId
                          ? {
                              ...d,
                              resolution,
                              resolvedAt: new Date().toISOString(),
                            }
                          : d
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          }),
        }))
      },

      // Reviewers
      addReviewer: (reviewer: Omit<Reviewer, 'id'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          reviewers: [...state.reviewers, { ...reviewer, id }],
        }))
        return id
      },

      updateReviewer: (reviewerId: string, updates: Partial<Reviewer>) => {
        set((state) => ({
          reviewers: state.reviewers.map((r) =>
            r.id === reviewerId ? { ...r, ...updates } : r
          ),
        }))
      },

      removeReviewer: (reviewerId: string) => {
        set((state) => ({
          reviewers: state.reviewers.filter((r) => r.id !== reviewerId),
        }))
      },

      // Milestones
      addMilestone: (assessmentId: string, milestone: Omit<TRLMilestone, 'id' | 'assessmentId'>) => {
        const id = crypto.randomUUID()
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  milestones: [...a.milestones, { ...milestone, id, assessmentId }],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      updateMilestone: (assessmentId: string, milestoneId: string, updates: Partial<TRLMilestone>) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  milestones: a.milestones.map((m) =>
                    m.id === milestoneId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      removeMilestone: (assessmentId: string, milestoneId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  milestones: a.milestones.filter((m) => m.id !== milestoneId),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      // Progress Tracking
      recordProgress: (assessmentId: string, progressPoint: TRLProgressPoint) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  history: [...a.history, progressPoint],
                  currentScore: progressPoint.score,
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      // Technology Comparison
      addComparison: (
        assessmentId: string,
        comparison: Omit<TechnologyComparison, 'id' | 'assessmentId' | 'createdAt'>
      ) => {
        const id = crypto.randomUUID()
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  comparisons: [
                    ...a.comparisons,
                    { ...comparison, id, assessmentId, createdAt: new Date().toISOString() },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
        }))
      },

      removeComparison: (assessmentId: string, comparisonId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  comparisons: a.comparisons.filter((c) => c.id !== comparisonId),
                  updatedAt: new Date().toISOString(),
                }
              : a
          ),
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
      name: 'clean-energy-trl-assessments',
      partialize: (state) => ({
        assessments: state.assessments,
        reviewers: state.reviewers,
        currentAssessmentId: state.currentAssessmentId,
      }),
    }
  )
)

// ============================================================================
// Selectors
// ============================================================================

export const selectTRLAssessmentsByStatus = (status: TRLAssessmentStatus) => {
  return useTRLStore.getState().assessments.filter((a) => a.status === status)
}

export const selectTRLAssessmentsByDomain = (domain: TRLDomain) => {
  return useTRLStore.getState().assessments.filter((a) => a.domain === domain)
}

export const selectTRLStats = () => {
  const assessments = useTRLStore.getState().assessments
  return {
    total: assessments.length,
    draft: assessments.filter((a) => a.status === 'draft').length,
    underReview: assessments.filter((a) => a.status === 'under-review').length,
    completed: assessments.filter((a) => a.status === 'completed').length,
    averageTRL:
      assessments.filter((a) => a.currentScore).reduce((acc, a) => acc + (a.currentScore?.level || 0), 0) /
        assessments.filter((a) => a.currentScore).length || 0,
  }
}
