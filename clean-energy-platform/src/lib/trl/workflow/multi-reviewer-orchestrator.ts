/**
 * Multi-Reviewer Workflow Orchestrator
 *
 * Manages the lifecycle of TRL assessments with multiple reviewers,
 * from assignment through consensus scoring.
 */

import type {
  TRLAssessment,
  ReviewSession,
  Reviewer,
  ReviewerRole,
  TRLScore,
  TRLLevel,
  TRLSublevel,
  ConsensusMethod,
  TRLDisagreement,
  ReviewStatus,
  IndividualScore,
} from '@/types/trl'
import {
  calculateConsensus,
  identifyDisagreements,
  calculateAssessmentQuality,
} from '../framework/trl-calculation-engine'

/**
 * Helper to convert individualScores to Map format
 */
function toScoresMap(
  scores: Map<string, TRLScore> | IndividualScore[] | undefined
): Map<string, TRLScore> {
  if (!scores) return new Map()
  if (scores instanceof Map) return new Map(scores)
  // Convert array to Map
  const map = new Map<string, TRLScore>()
  for (const item of scores as IndividualScore[]) {
    map.set(item.reviewerId, item.score)
  }
  return map
}

/**
 * Get the size of scores (works for both Map and array)
 */
function getScoresCount(
  scores: Map<string, TRLScore> | IndividualScore[] | undefined
): number {
  if (!scores) return 0
  if (scores instanceof Map) return scores.size
  return (scores as IndividualScore[]).length
}

/**
 * Workflow state machine states
 */
export type WorkflowState =
  | 'draft'
  | 'awaiting_reviewers'
  | 'review_in_progress'
  | 'pending_consensus'
  | 'disagreement_resolution'
  | 'finalized'
  | 'archived'

/**
 * Workflow transition actions
 */
export type WorkflowAction =
  | 'assign_reviewers'
  | 'start_review'
  | 'submit_score'
  | 'request_revision'
  | 'resolve_disagreement'
  | 'calculate_consensus'
  | 'finalize'
  | 'archive'
  | 'reopen'

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS: Record<WorkflowState, WorkflowAction[]> = {
  draft: ['assign_reviewers'],
  awaiting_reviewers: ['start_review', 'assign_reviewers'],
  review_in_progress: ['submit_score', 'request_revision'],
  pending_consensus: ['calculate_consensus', 'request_revision'],
  disagreement_resolution: ['resolve_disagreement', 'request_revision'],
  finalized: ['archive', 'reopen'],
  archived: ['reopen'],
}

/**
 * Next state based on action
 */
const STATE_TRANSITIONS: Record<WorkflowAction, WorkflowState> = {
  assign_reviewers: 'awaiting_reviewers',
  start_review: 'review_in_progress',
  submit_score: 'review_in_progress', // Stays in progress until all submitted
  request_revision: 'review_in_progress',
  resolve_disagreement: 'pending_consensus',
  calculate_consensus: 'finalized', // May go to disagreement_resolution
  finalize: 'finalized',
  archive: 'archived',
  reopen: 'review_in_progress',
}

/**
 * Check if a workflow action is valid for the current state
 */
export function canPerformAction(
  currentState: WorkflowState,
  action: WorkflowAction
): boolean {
  return VALID_TRANSITIONS[currentState]?.includes(action) || false
}

/**
 * Get the next state after performing an action
 */
export function getNextState(action: WorkflowAction): WorkflowState {
  return STATE_TRANSITIONS[action]
}

/**
 * Reviewer assignment configuration
 */
interface ReviewerAssignment {
  reviewerId: string
  role: ReviewerRole
  deadline?: string
  notificationSent: boolean
}

/**
 * Workflow context containing all review state
 */
export interface WorkflowContext {
  assessmentId: string
  state: WorkflowState
  assignments: ReviewerAssignment[]
  session: ReviewSession
  consensusMethod: ConsensusMethod
  minimumReviewers: number
  requireAllScores: boolean
  deadlineDate?: string
  createdAt: string
  updatedAt: string
  history: Array<{
    action: WorkflowAction
    fromState: WorkflowState
    toState: WorkflowState
    performedBy: string
    timestamp: string
    notes?: string
  }>
}

/**
 * Create a new workflow context for an assessment
 */
export function createWorkflowContext(
  assessmentId: string,
  options: {
    consensusMethod?: ConsensusMethod
    minimumReviewers?: number
    requireAllScores?: boolean
    deadlineDate?: string
  } = {}
): WorkflowContext {
  const now = new Date().toISOString()
  return {
    assessmentId,
    state: 'draft',
    assignments: [],
    session: {
      id: `session-${Date.now()}`,
      assessmentId,
      reviewers: [],
      individualScores: new Map(),
      status: 'scheduled',
      startedAt: now,
    },
    consensusMethod: options.consensusMethod || 'weighted-average',
    minimumReviewers: options.minimumReviewers || 2,
    requireAllScores: options.requireAllScores ?? true,
    deadlineDate: options.deadlineDate,
    createdAt: now,
    updatedAt: now,
    history: [],
  }
}

/**
 * Assign reviewers to the assessment
 */
export function assignReviewers(
  context: WorkflowContext,
  reviewers: Array<{ reviewer: Reviewer; deadline?: string }>,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'assign_reviewers')) {
    throw new Error(`Cannot assign reviewers in state: ${context.state}`)
  }

  const newAssignments: ReviewerAssignment[] = reviewers.map((r) => ({
    reviewerId: r.reviewer.id,
    role: r.reviewer.role,
    deadline: r.deadline || context.deadlineDate,
    notificationSent: false,
  }))

  const allReviewers = [
    ...context.session.reviewers,
    ...reviewers.map((r) => r.reviewer),
  ]

  const now = new Date().toISOString()
  const previousState = context.state
  const nextState = getNextState('assign_reviewers')

  return {
    ...context,
    state: nextState,
    assignments: [...context.assignments, ...newAssignments],
    session: {
      ...context.session,
      reviewers: allReviewers,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'assign_reviewers',
        fromState: previousState,
        toState: nextState,
        performedBy,
        timestamp: now,
        notes: `Assigned ${reviewers.length} reviewer(s)`,
      },
    ],
  }
}

/**
 * Start the review process
 */
export function startReview(
  context: WorkflowContext,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'start_review')) {
    throw new Error(`Cannot start review in state: ${context.state}`)
  }

  if (context.session.reviewers.length < context.minimumReviewers) {
    throw new Error(
      `Minimum ${context.minimumReviewers} reviewers required, only ${context.session.reviewers.length} assigned`
    )
  }

  const now = new Date().toISOString()
  const previousState = context.state
  const nextState = getNextState('start_review')

  return {
    ...context,
    state: nextState,
    session: {
      ...context.session,
      status: 'in_progress',
      startedAt: now,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'start_review',
        fromState: previousState,
        toState: nextState,
        performedBy,
        timestamp: now,
      },
    ],
  }
}

/**
 * Submit a reviewer's score
 */
export function submitScore(
  context: WorkflowContext,
  reviewerId: string,
  score: TRLScore,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'submit_score')) {
    throw new Error(`Cannot submit score in state: ${context.state}`)
  }

  const reviewer = context.session.reviewers.find((r) => r.id === reviewerId)
  if (!reviewer) {
    throw new Error(`Reviewer ${reviewerId} not found in session`)
  }

  const newScores = toScoresMap(context.session.individualScores)
  newScores.set(reviewerId, score)

  const now = new Date().toISOString()
  const allScoresSubmitted = context.requireAllScores
    ? newScores.size === context.session.reviewers.length
    : newScores.size >= context.minimumReviewers

  // Determine next state
  let nextState: WorkflowState = 'review_in_progress'
  if (allScoresSubmitted) {
    nextState = 'pending_consensus'
  }

  return {
    ...context,
    state: nextState,
    session: {
      ...context.session,
      individualScores: newScores,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'submit_score',
        fromState: context.state,
        toState: nextState,
        performedBy,
        timestamp: now,
        notes: `${reviewer.name} submitted TRL ${score.level}${score.sublevel}`,
      },
    ],
  }
}

/**
 * Request revision from a reviewer
 */
export function requestRevision(
  context: WorkflowContext,
  reviewerId: string,
  reason: string,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'request_revision')) {
    throw new Error(`Cannot request revision in state: ${context.state}`)
  }

  const newScores = toScoresMap(context.session.individualScores)
  newScores.delete(reviewerId)

  const now = new Date().toISOString()

  return {
    ...context,
    state: 'review_in_progress',
    session: {
      ...context.session,
      individualScores: newScores,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'request_revision',
        fromState: context.state,
        toState: 'review_in_progress',
        performedBy,
        timestamp: now,
        notes: `Requested revision from reviewer ${reviewerId}: ${reason}`,
      },
    ],
  }
}

/**
 * Calculate consensus and finalize or identify disagreements
 */
export function calculateConsensusAndFinalize(
  context: WorkflowContext,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'calculate_consensus')) {
    throw new Error(`Cannot calculate consensus in state: ${context.state}`)
  }

  const consensusScore = calculateConsensus(context.session, context.consensusMethod)
  const disagreements = identifyDisagreements(context.session)
  const quality = calculateAssessmentQuality(context.session, consensusScore)

  const now = new Date().toISOString()

  // If there are significant disagreements, go to resolution
  const significantDisagreements = disagreements.filter((d) => (d.levelDifference ?? 0) >= 2)
  const hasSignificantDisagreements = significantDisagreements.length > 0

  const nextState: WorkflowState = hasSignificantDisagreements
    ? 'disagreement_resolution'
    : 'finalized'

  return {
    ...context,
    state: nextState,
    session: {
      ...context.session,
      consensusScore,
      disagreements,
      status: hasSignificantDisagreements ? 'in_progress' : 'completed',
      completedAt: hasSignificantDisagreements ? undefined : now,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'calculate_consensus',
        fromState: context.state,
        toState: nextState,
        performedBy,
        timestamp: now,
        notes: hasSignificantDisagreements
          ? `${significantDisagreements.length} significant disagreement(s) require resolution`
          : `Consensus reached: TRL ${consensusScore.level}${consensusScore.sublevel} (quality: ${quality.score}%)`,
      },
    ],
  }
}

/**
 * Resolve a disagreement between reviewers
 */
export function resolveDisagreement(
  context: WorkflowContext,
  disagreementId: string,
  resolution: string,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'resolve_disagreement')) {
    throw new Error(`Cannot resolve disagreement in state: ${context.state}`)
  }

  const updatedDisagreements =
    context.session.disagreements?.map((d) =>
      d.id === disagreementId ? { ...d, resolved: true, resolution } : d
    ) || []

  const allResolved = updatedDisagreements.every((d) => d.resolved)

  const now = new Date().toISOString()
  const nextState: WorkflowState = allResolved ? 'pending_consensus' : 'disagreement_resolution'

  return {
    ...context,
    state: nextState,
    session: {
      ...context.session,
      disagreements: updatedDisagreements,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'resolve_disagreement',
        fromState: context.state,
        toState: nextState,
        performedBy,
        timestamp: now,
        notes: `Resolved disagreement: ${resolution}`,
      },
    ],
  }
}

/**
 * Archive a finalized assessment
 */
export function archiveAssessment(
  context: WorkflowContext,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'archive')) {
    throw new Error(`Cannot archive in state: ${context.state}`)
  }

  const now = new Date().toISOString()

  return {
    ...context,
    state: 'archived',
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'archive',
        fromState: context.state,
        toState: 'archived',
        performedBy,
        timestamp: now,
      },
    ],
  }
}

/**
 * Reopen an archived or finalized assessment
 */
export function reopenAssessment(
  context: WorkflowContext,
  reason: string,
  performedBy: string
): WorkflowContext {
  if (!canPerformAction(context.state, 'reopen')) {
    throw new Error(`Cannot reopen in state: ${context.state}`)
  }

  const now = new Date().toISOString()

  // Clear consensus when reopening
  return {
    ...context,
    state: 'review_in_progress',
    session: {
      ...context.session,
      consensusScore: undefined,
      status: 'in_progress',
      completedAt: undefined,
    },
    updatedAt: now,
    history: [
      ...context.history,
      {
        action: 'reopen',
        fromState: context.state,
        toState: 'review_in_progress',
        performedBy,
        timestamp: now,
        notes: `Assessment reopened: ${reason}`,
      },
    ],
  }
}

/**
 * Get review progress summary
 */
export function getReviewProgress(context: WorkflowContext): {
  totalReviewers: number
  scoresSubmitted: number
  percentComplete: number
  pending: string[]
  submitted: Array<{ reviewerId: string; name: string; score: TRLScore }>
} {
  const totalReviewers = context.session.reviewers.length
  const scoresMap = toScoresMap(context.session.individualScores)
  const scoresSubmitted = scoresMap.size
  const percentComplete =
    totalReviewers > 0 ? Math.round((scoresSubmitted / totalReviewers) * 100) : 0

  const submittedIds = new Set(scoresMap.keys())
  const pending = context.session.reviewers
    .filter((r) => !submittedIds.has(r.id))
    .map((r) => r.name)

  const submitted = Array.from(scoresMap.entries()).map(
    ([reviewerId, score]) => ({
      reviewerId,
      name: context.session.reviewers.find((r) => r.id === reviewerId)?.name || 'Unknown',
      score,
    })
  )

  return { totalReviewers, scoresSubmitted, percentComplete, pending, submitted }
}

/**
 * Check if deadline has passed
 */
export function isDeadlinePassed(context: WorkflowContext): boolean {
  if (!context.deadlineDate) return false
  return new Date() > new Date(context.deadlineDate)
}

/**
 * Get overdue assignments
 */
export function getOverdueAssignments(
  context: WorkflowContext
): ReviewerAssignment[] {
  const now = new Date()
  const scoresMap = toScoresMap(context.session.individualScores)
  const submittedIds = new Set(scoresMap.keys())

  return context.assignments.filter((a) => {
    if (submittedIds.has(a.reviewerId)) return false
    if (!a.deadline) return false
    return new Date(a.deadline) < now
  })
}
