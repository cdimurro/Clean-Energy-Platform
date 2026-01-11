/**
 * Assessment Store
 *
 * Manages state for the assessment workflow:
 * Step 1: Create assessment (title, description, documents)
 * Step 2-3: Review and approve plan
 * Step 4: Monitor execution progress
 * Step 5: View and download results
 */

import * as React from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  EnhancedAssessmentPlan,
  PlanAssumption,
  AssumptionCategory,
} from '@/types/tea'

// ============================================================================
// Types
// ============================================================================

export type AssessmentStatus =
  | 'draft'
  | 'plan_generating'
  | 'plan_review'
  | 'executing'
  | 'complete'
  | 'failed'

export type AssessmentRating = 'promising' | 'conditional' | 'concerning'

export type ClaimConfidence = 'high' | 'medium' | 'low' | 'unvalidatable'

export type ComponentStatus = 'pending' | 'running' | 'complete' | 'error'

export interface UploadedDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  extractedData?: Record<string, unknown>
}

export interface IdentifiedClaim {
  id: string
  claim: string
  source: string
  validationMethod: string
  confidence: ClaimConfidence
}

export interface AssessmentComponent {
  id: string
  name: string
  description: string
  status: ComponentStatus
  progress: number
  startedAt?: Date
  completedAt?: Date
  error?: string
  output?: Record<string, unknown>
}

export interface AssessmentPlan {
  id: string
  version: number
  technologyType: string
  identifiedClaims: IdentifiedClaim[]
  extractedParameters: Record<string, string>
  sections: Array<{
    id: string
    name: string
    enabled: boolean
    estimatedPages: string
  }>
  missingData: string[]
  assumptions: Array<{ key: string; value: string }>
  createdAt: Date
  approvedAt?: Date
}

export interface AssessmentResult {
  componentId: string
  componentName: string
  content: Record<string, unknown>
  charts?: string[] // Base64 chart images
  createdAt: Date
}

export interface Assessment {
  id: string
  title: string
  description: string
  status: AssessmentStatus
  rating?: AssessmentRating
  documents: UploadedDocument[]
  plan?: AssessmentPlan
  enhancedPlan?: EnhancedAssessmentPlan // New editable plan with source attribution
  components: AssessmentComponent[]
  results: AssessmentResult[]
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

// Default assessment components (7-component framework)
const DEFAULT_COMPONENTS: Omit<AssessmentComponent, 'id'>[] = [
  {
    name: 'Technology Deep Dive',
    description: 'Researching technology, competitive landscape, and core innovations',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'Claims Validation',
    description: 'Validating key claims against literature and benchmarks',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'Performance Simulation',
    description: 'Running physics-based simulation models',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'System Integration',
    description: 'Analyzing market fit and infrastructure dependencies',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'Techno-Economic Analysis',
    description: 'Building financial model and calculating LCOE, NPV, IRR',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'Improvement Opportunities',
    description: 'Identifying optimization pathways and R&D directions',
    status: 'pending',
    progress: 0,
  },
  {
    name: 'Final Synthesis',
    description: 'Generating executive summary and final recommendation',
    status: 'pending',
    progress: 0,
  },
]

// ============================================================================
// Store Interface
// ============================================================================

interface AssessmentStore {
  // State
  assessments: Assessment[]
  currentAssessmentId: string | null
  isLoading: boolean
  error: string | null
  isHydrated: boolean

  // Computed
  currentAssessment: () => Assessment | undefined
  getAssessmentById: (id: string) => Assessment | undefined

  // Actions - Assessment CRUD
  createAssessment: (title: string, description: string) => string
  updateAssessment: (id: string, updates: Partial<Assessment>) => void
  deleteAssessment: (id: string) => void
  setCurrentAssessment: (id: string | null) => void

  // Actions - Documents
  addDocument: (assessmentId: string, document: UploadedDocument) => void
  removeDocument: (assessmentId: string, documentId: string) => void

  // Actions - Plan (Legacy)
  setPlan: (assessmentId: string, plan: AssessmentPlan) => void
  approvePlan: (assessmentId: string) => void
  updatePlanSection: (assessmentId: string, sectionId: string, enabled: boolean) => void

  // Actions - Enhanced Plan (Editable with source attribution)
  setEnhancedPlan: (assessmentId: string, plan: EnhancedAssessmentPlan) => void
  approveEnhancedPlan: (assessmentId: string) => void
  updatePlanAssumption: (
    assessmentId: string,
    category: AssumptionCategory,
    assumptionId: string,
    value: string | number
  ) => void
  resetAssumptionToDefault: (
    assessmentId: string,
    category: AssumptionCategory,
    assumptionId: string
  ) => void
  addCustomAssumption: (
    assessmentId: string,
    category: AssumptionCategory,
    assumption: Omit<PlanAssumption, 'id'>
  ) => void
  removeAssumption: (
    assessmentId: string,
    category: AssumptionCategory,
    assumptionId: string
  ) => void
  toggleMethodologyAnalysis: (
    assessmentId: string,
    analysisId: string,
    enabled: boolean
  ) => void
  getModificationCount: (assessmentId: string) => number

  // Actions - Execution
  startExecution: (assessmentId: string) => void
  updateComponentStatus: (
    assessmentId: string,
    componentId: string,
    status: ComponentStatus,
    progress?: number
  ) => void
  setComponentError: (assessmentId: string, componentId: string, error: string) => void
  completeComponent: (
    assessmentId: string,
    componentId: string,
    output: Record<string, unknown>
  ) => void

  // Actions - Results
  addResult: (assessmentId: string, result: AssessmentResult) => void
  setRating: (assessmentId: string, rating: AssessmentRating) => void
  completeAssessment: (assessmentId: string) => void

  // Actions - UI State
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useAssessmentStore = create<AssessmentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      assessments: [],
      currentAssessmentId: null,
      isLoading: false,
      error: null,
      isHydrated: false,

      // Computed
      currentAssessment: () => {
        const { assessments, currentAssessmentId } = get()
        return assessments.find((a) => a.id === currentAssessmentId)
      },

      getAssessmentById: (id: string) => {
        return get().assessments.find((a) => a.id === id)
      },

      // Assessment CRUD
      createAssessment: (title: string, description: string) => {
        const id = crypto.randomUUID()
        const now = new Date()

        const newAssessment: Assessment = {
          id,
          title,
          description,
          status: 'draft',
          documents: [],
          components: DEFAULT_COMPONENTS.map((c, index) => ({
            ...c,
            id: `component-${index + 1}`,
          })),
          results: [],
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          assessments: [newAssessment, ...state.assessments],
          currentAssessmentId: id,
        }))

        return id
      },

      updateAssessment: (id: string, updates: Partial<Assessment>) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date() } : a
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

      // Documents
      addDocument: (assessmentId: string, document: UploadedDocument) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  documents: [...a.documents, document],
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      removeDocument: (assessmentId: string, documentId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  documents: a.documents.filter((d) => d.id !== documentId),
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      // Plan
      setPlan: (assessmentId: string, plan: AssessmentPlan) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  plan,
                  status: 'plan_review' as AssessmentStatus,
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      approvePlan: (assessmentId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId && a.plan
              ? {
                  ...a,
                  plan: { ...a.plan, approvedAt: new Date() },
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      updatePlanSection: (assessmentId: string, sectionId: string, enabled: boolean) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId && a.plan
              ? {
                  ...a,
                  plan: {
                    ...a.plan,
                    sections: a.plan.sections.map((s) =>
                      s.id === sectionId ? { ...s, enabled } : s
                    ),
                  },
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      // Enhanced Plan Actions
      setEnhancedPlan: (assessmentId: string, plan: EnhancedAssessmentPlan) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  enhancedPlan: plan,
                  status: 'plan_review' as AssessmentStatus,
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      approveEnhancedPlan: (assessmentId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId && a.enhancedPlan
              ? {
                  ...a,
                  enhancedPlan: {
                    ...a.enhancedPlan,
                    status: 'approved' as const,
                    approvedAt: new Date(),
                  },
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      updatePlanAssumption: (
        assessmentId: string,
        category: AssumptionCategory,
        assumptionId: string,
        value: string | number
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.enhancedPlan) return a

            const assumptions = a.enhancedPlan.assumptions[category]
            const assumptionIndex = assumptions.findIndex((as) => as.id === assumptionId)
            if (assumptionIndex === -1) return a

            const assumption = assumptions[assumptionIndex]
            const originalValue = assumption.source.originalValue ?? assumption.value

            // Create modification record
            const modification = {
              fieldPath: `assumptions.${category}.${assumption.key}`,
              originalValue: originalValue,
              newValue: value,
              modifiedAt: new Date(),
            }

            // Update the assumption
            const updatedAssumptions = [...assumptions]
            updatedAssumptions[assumptionIndex] = {
              ...assumption,
              value,
              source: {
                ...assumption.source,
                type: 'user' as const,
                originalValue: originalValue,
                modifiedAt: new Date(),
              },
            }

            // Update modifications list (replace if exists, add if new)
            const existingModIndex = a.enhancedPlan.modifications.findIndex(
              (m) => m.fieldPath === modification.fieldPath
            )
            const updatedModifications =
              existingModIndex >= 0
                ? a.enhancedPlan.modifications.map((m, i) =>
                    i === existingModIndex ? modification : m
                  )
                : [...a.enhancedPlan.modifications, modification]

            return {
              ...a,
              enhancedPlan: {
                ...a.enhancedPlan,
                assumptions: {
                  ...a.enhancedPlan.assumptions,
                  [category]: updatedAssumptions,
                },
                modifications: updatedModifications,
              },
              updatedAt: new Date(),
            }
          }),
        }))
      },

      resetAssumptionToDefault: (
        assessmentId: string,
        category: AssumptionCategory,
        assumptionId: string
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.enhancedPlan) return a

            const assumptions = a.enhancedPlan.assumptions[category]
            const assumptionIndex = assumptions.findIndex((as) => as.id === assumptionId)
            if (assumptionIndex === -1) return a

            const assumption = assumptions[assumptionIndex]
            const originalValue = assumption.source.originalValue

            if (originalValue === undefined) return a // No original to reset to

            // Reset the assumption
            const updatedAssumptions = [...assumptions]
            updatedAssumptions[assumptionIndex] = {
              ...assumption,
              value: originalValue,
              source: {
                ...assumption.source,
                type: assumption.source.technologyType ? 'default' : 'extracted',
                originalValue: undefined,
                modifiedAt: undefined,
              },
            }

            // Remove modification record
            const fieldPath = `assumptions.${category}.${assumption.key}`
            const updatedModifications = a.enhancedPlan.modifications.filter(
              (m) => m.fieldPath !== fieldPath
            )

            return {
              ...a,
              enhancedPlan: {
                ...a.enhancedPlan,
                assumptions: {
                  ...a.enhancedPlan.assumptions,
                  [category]: updatedAssumptions,
                },
                modifications: updatedModifications,
              },
              updatedAt: new Date(),
            }
          }),
        }))
      },

      addCustomAssumption: (
        assessmentId: string,
        category: AssumptionCategory,
        assumption: Omit<PlanAssumption, 'id'>
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.enhancedPlan) return a

            const newAssumption: PlanAssumption = {
              ...assumption,
              id: crypto.randomUUID(),
            }

            return {
              ...a,
              enhancedPlan: {
                ...a.enhancedPlan,
                assumptions: {
                  ...a.enhancedPlan.assumptions,
                  [category]: [...a.enhancedPlan.assumptions[category], newAssumption],
                },
              },
              updatedAt: new Date(),
            }
          }),
        }))
      },

      removeAssumption: (
        assessmentId: string,
        category: AssumptionCategory,
        assumptionId: string
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.enhancedPlan) return a

            const assumption = a.enhancedPlan.assumptions[category].find(
              (as) => as.id === assumptionId
            )

            // Don't allow removing required assumptions
            if (assumption?.isRequired) return a

            return {
              ...a,
              enhancedPlan: {
                ...a.enhancedPlan,
                assumptions: {
                  ...a.enhancedPlan.assumptions,
                  [category]: a.enhancedPlan.assumptions[category].filter(
                    (as) => as.id !== assumptionId
                  ),
                },
              },
              updatedAt: new Date(),
            }
          }),
        }))
      },

      toggleMethodologyAnalysis: (
        assessmentId: string,
        analysisId: string,
        enabled: boolean
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId || !a.enhancedPlan) return a

            return {
              ...a,
              enhancedPlan: {
                ...a.enhancedPlan,
                methodology: {
                  ...a.enhancedPlan.methodology,
                  analyses: a.enhancedPlan.methodology.analyses.map((analysis) =>
                    analysis.id === analysisId ? { ...analysis, enabled } : analysis
                  ),
                },
              },
              updatedAt: new Date(),
            }
          }),
        }))
      },

      getModificationCount: (assessmentId: string) => {
        const assessment = get().assessments.find((a) => a.id === assessmentId)
        return assessment?.enhancedPlan?.modifications.length ?? 0
      },

      // Execution
      startExecution: (assessmentId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  status: 'executing' as AssessmentStatus,
                  components: a.components.map((c, index) =>
                    index === 0
                      ? { ...c, status: 'running' as ComponentStatus, startedAt: new Date() }
                      : c
                  ),
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      updateComponentStatus: (
        assessmentId: string,
        componentId: string,
        status: ComponentStatus,
        progress?: number
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  components: a.components.map((c) =>
                    c.id === componentId
                      ? {
                          ...c,
                          status,
                          progress: progress ?? c.progress,
                          startedAt: status === 'running' ? new Date() : c.startedAt,
                        }
                      : c
                  ),
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      setComponentError: (assessmentId: string, componentId: string, error: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  components: a.components.map((c) =>
                    c.id === componentId
                      ? { ...c, status: 'error' as ComponentStatus, error }
                      : c
                  ),
                  status: 'failed' as AssessmentStatus,
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      completeComponent: (
        assessmentId: string,
        componentId: string,
        output: Record<string, unknown>
      ) => {
        set((state) => ({
          assessments: state.assessments.map((a) => {
            if (a.id !== assessmentId) return a

            const componentIndex = a.components.findIndex((c) => c.id === componentId)
            const updatedComponents = a.components.map((c, index) => {
              if (c.id === componentId) {
                return {
                  ...c,
                  status: 'complete' as ComponentStatus,
                  progress: 100,
                  completedAt: new Date(),
                  output,
                }
              }
              // Start next component
              if (index === componentIndex + 1 && c.status === 'pending') {
                return {
                  ...c,
                  status: 'running' as ComponentStatus,
                  startedAt: new Date(),
                }
              }
              return c
            })

            return {
              ...a,
              components: updatedComponents,
              updatedAt: new Date(),
            }
          }),
        }))
      },

      // Results
      addResult: (assessmentId: string, result: AssessmentResult) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  results: [...a.results, result],
                  updatedAt: new Date(),
                }
              : a
          ),
        }))
      },

      setRating: (assessmentId: string, rating: AssessmentRating) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId ? { ...a, rating, updatedAt: new Date() } : a
          ),
        }))
      },

      completeAssessment: (assessmentId: string) => {
        set((state) => ({
          assessments: state.assessments.map((a) =>
            a.id === assessmentId
              ? {
                  ...a,
                  status: 'complete' as AssessmentStatus,
                  completedAt: new Date(),
                  updatedAt: new Date(),
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
      name: 'exergy-assessments',
      partialize: (state) => ({
        assessments: state.assessments,
        currentAssessmentId: state.currentAssessmentId,
      }),
      onRehydrateStorage: () => () => {
        // Use setState to properly trigger re-renders
        console.log('[AssessmentStore] Rehydration complete, setting isHydrated: true')
        useAssessmentStore.setState({ isHydrated: true })
      },
    }
  )
)

// ============================================================================
// Hydration Hook - Reliable pattern for Next.js SSR
// ============================================================================

export const useHydration = () => {
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    // Set hydrated to true on client mount
    // This ensures we only render the full UI on the client
    setHydrated(true)
  }, [])

  return hydrated
}


// ============================================================================
// Selectors
// ============================================================================

export const selectAssessmentsByStatus = (status: AssessmentStatus) => {
  return useAssessmentStore.getState().assessments.filter((a) => a.status === status)
}

export const selectRecentAssessments = (limit = 5) => {
  return useAssessmentStore
    .getState()
    .assessments.slice(0, limit)
}

export const selectAssessmentStats = () => {
  const assessments = useAssessmentStore.getState().assessments
  return {
    total: assessments.length,
    draft: assessments.filter((a) => a.status === 'draft').length,
    inProgress: assessments.filter((a) =>
      ['plan_generating', 'plan_review', 'executing'].includes(a.status)
    ).length,
    complete: assessments.filter((a) => a.status === 'complete').length,
    failed: assessments.filter((a) => a.status === 'failed').length,
  }
}
