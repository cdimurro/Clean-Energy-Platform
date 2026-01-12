/**
 * Reviewer Scorecard Component
 *
 * Displays individual reviewer scores and facilitates multi-reviewer workflow.
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui'
import { TRLGauge, TRLBar } from './TRLGauge'
import {
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import type {
  Reviewer,
  TRLScore,
  IndividualScore,
  ReviewSession,
  TRLDisagreement,
  TRLLevel,
  TRLSublevel,
} from '@/types/trl'

// ============================================================================
// Individual Reviewer Card
// ============================================================================

interface ReviewerCardProps {
  reviewer: Reviewer
  score?: IndividualScore | TRLScore
  status: 'pending' | 'submitted' | 'reviewing'
  isExpanded?: boolean
  onToggleExpand?: () => void
  className?: string
}

const ROLE_LABELS: Record<string, string> = {
  lead: 'Lead Reviewer',
  technical: 'Technical',
  'domain-expert': 'Domain Expert',
  external: 'External',
  domain_expert: 'Domain Expert',
  technical_reviewer: 'Technical',
  general_reviewer: 'General',
  observer: 'Observer',
}

const ROLE_COLORS: Record<string, string> = {
  lead: 'bg-purple-500/10 text-purple-500',
  technical: 'bg-blue-500/10 text-blue-500',
  'domain-expert': 'bg-green-500/10 text-green-500',
  external: 'bg-amber-500/10 text-amber-500',
  domain_expert: 'bg-green-500/10 text-green-500',
  technical_reviewer: 'bg-blue-500/10 text-blue-500',
  general_reviewer: 'bg-gray-500/10 text-gray-500',
  observer: 'bg-gray-400/10 text-gray-400',
}

export function ReviewerCard({
  reviewer,
  score,
  status,
  isExpanded = false,
  onToggleExpand,
  className,
}: ReviewerCardProps) {
  // Handle both IndividualScore and TRLScore types
  const trlScore = score && 'score' in score ? (score as IndividualScore).score : (score as TRLScore | undefined)

  return (
    <Card className={cn('transition-all', className)}>
      {/* Header */}
      <div
        className={cn(
          'flex items-center gap-3',
          onToggleExpand && 'cursor-pointer'
        )}
        onClick={onToggleExpand}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-background-elevated flex items-center justify-center">
          <User className="w-5 h-5 text-foreground-muted" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">
              {reviewer.name}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                ROLE_COLORS[reviewer.role] || ROLE_COLORS.general_reviewer
              )}
            >
              {ROLE_LABELS[reviewer.role] || reviewer.role}
            </span>
          </div>
          {reviewer.organization && (
            <p className="text-sm text-foreground-muted truncate">
              {reviewer.organization}
            </p>
          )}
        </div>

        {/* Status / Score */}
        <div className="flex items-center gap-2">
          {status === 'pending' && (
            <div className="flex items-center gap-1 text-foreground-muted">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Pending</span>
            </div>
          )}
          {status === 'reviewing' && (
            <div className="flex items-center gap-1 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm">In Review</span>
            </div>
          )}
          {status === 'submitted' && trlScore && (
            <div className="flex items-center gap-2">
              <TRLGauge
                level={trlScore.level}
                sublevel={trlScore.sublevel}
                confidence={trlScore.confidence}
                size="sm"
                showLabels={false}
              />
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
          )}
        </div>

        {/* Expand toggle */}
        {onToggleExpand && (
          <button className="p-1 rounded hover:bg-background-hover">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-foreground-muted" />
            ) : (
              <ChevronDown className="w-5 h-5 text-foreground-muted" />
            )}
          </button>
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && trlScore && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {/* Score details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-foreground-muted mb-1">Score</p>
              <p className="text-lg font-medium text-foreground">
                TRL {trlScore.level}
                {trlScore.sublevel}
              </p>
            </div>
            <div>
              <p className="text-sm text-foreground-muted mb-1">Confidence</p>
              <p className="text-lg font-medium text-foreground">
                {trlScore.confidence}%
              </p>
            </div>
          </div>

          {/* Justification */}
          {trlScore.justification && (
            <div>
              <p className="text-sm text-foreground-muted mb-1">Justification</p>
              <p className="text-sm text-foreground">{trlScore.justification}</p>
            </div>
          )}

          {/* Strengths */}
          {trlScore.strengths && trlScore.strengths.length > 0 && (
            <div>
              <p className="text-sm text-foreground-muted mb-1">Strengths</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                {trlScore.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gaps */}
          {trlScore.gaps && trlScore.gaps.length > 0 && (
            <div>
              <p className="text-sm text-foreground-muted mb-1">Gaps</p>
              <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                {trlScore.gaps.map((g, i) => (
                  <li key={i}>{g}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// Consensus Panel
// ============================================================================

interface ConsensusPanelProps {
  session: ReviewSession
  onResolveDisagreement?: (disagreementId: string, resolution: string) => void
  className?: string
}

export function ConsensusPanel({
  session,
  onResolveDisagreement,
  className,
}: ConsensusPanelProps) {
  const [resolutionText, setResolutionText] = React.useState<Record<string, string>>({})

  const scores = session.individualScores
  const scoresArray = scores instanceof Map
    ? Array.from(scores.values())
    : (scores as IndividualScore[]).map((s) => s.score)

  const disagreements = session.disagreements || []
  const unresolvedDisagreements = disagreements.filter((d) => !d.resolved)

  // Calculate statistics
  const numericScores = scoresArray.map((s) => {
    const sublevelValue = s.sublevel === 'a' ? 0 : s.sublevel === 'b' ? 0.33 : 0.67
    return s.level + sublevelValue
  })

  const avgScore = numericScores.length > 0
    ? numericScores.reduce((a, b) => a + b, 0) / numericScores.length
    : 0
  const minScore = numericScores.length > 0 ? Math.min(...numericScores) : 0
  const maxScore = numericScores.length > 0 ? Math.max(...numericScores) : 0
  const spread = maxScore - minScore

  return (
    <Card className={cn('', className)}>
      <h3 className="font-semibold text-foreground mb-4">Consensus Overview</h3>

      {/* Score Distribution */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-foreground-muted">Average</p>
          <p className="text-2xl font-bold text-foreground">
            {avgScore.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-foreground-muted">Range</p>
          <p className="text-2xl font-bold text-foreground">
            {minScore.toFixed(1)} - {maxScore.toFixed(1)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-foreground-muted">Agreement</p>
          <p
            className={cn(
              'text-2xl font-bold',
              spread < 1 ? 'text-green-500' : spread < 2 ? 'text-amber-500' : 'text-red-500'
            )}
          >
            {spread < 1 ? 'High' : spread < 2 ? 'Medium' : 'Low'}
          </p>
        </div>
      </div>

      {/* Visual comparison */}
      <div className="mb-6">
        <p className="text-sm text-foreground-muted mb-2">Score Comparison</p>
        <TRLBar
          level={Math.round(avgScore) as TRLLevel}
          sublevel={
            avgScore % 1 < 0.33 ? 'a' : avgScore % 1 < 0.67 ? 'b' : 'c'
          }
        />
      </div>

      {/* Disagreements */}
      {unresolvedDisagreements.length > 0 && (
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Disagreements to Resolve ({unresolvedDisagreements.length})
          </h4>

          <div className="space-y-4">
            {unresolvedDisagreements.map((disagreement) => (
              <div
                key={disagreement.id}
                className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20"
              >
                <p className="text-sm text-foreground mb-2">
                  {disagreement.description}
                </p>
                <p className="text-xs text-foreground-muted mb-2">
                  Difference: {(disagreement.levelDifference || disagreement.scoreDifference || 0).toFixed(1)} TRL levels
                </p>

                {onResolveDisagreement && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter resolution..."
                      value={resolutionText[disagreement.id] || ''}
                      onChange={(e) =>
                        setResolutionText((prev) => ({
                          ...prev,
                          [disagreement.id]: e.target.value,
                        }))
                      }
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => {
                        if (resolutionText[disagreement.id]) {
                          onResolveDisagreement(
                            disagreement.id,
                            resolutionText[disagreement.id]
                          )
                        }
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50"
                      disabled={!resolutionText[disagreement.id]}
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Consensus Score */}
      {session.consensusScore && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Consensus Score</h4>
              <p className="text-sm text-foreground-muted">
                {session.consensusMethod || 'weighted-average'} method
              </p>
            </div>
            <TRLGauge
              level={session.consensusScore.level}
              sublevel={session.consensusScore.sublevel}
              confidence={session.consensusScore.confidence}
              size="md"
            />
          </div>
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// Review Session Summary
// ============================================================================

interface ReviewSessionSummaryProps {
  session: ReviewSession
  className?: string
}

export function ReviewSessionSummary({
  session,
  className,
}: ReviewSessionSummaryProps) {
  const totalReviewers = session.reviewers.length
  const scores = session.individualScores
  const submittedCount = scores instanceof Map ? scores.size : (scores as IndividualScore[]).length
  const pendingCount = totalReviewers - submittedCount
  const progressPercent = totalReviewers > 0 ? (submittedCount / totalReviewers) * 100 : 0

  return (
    <Card className={cn('', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Review Progress</h3>
        <span
          className={cn(
            'px-2 py-1 rounded-full text-xs font-medium',
            session.status === 'completed'
              ? 'bg-green-500/10 text-green-500'
              : session.status === 'in_progress' || session.status === 'in-progress'
                ? 'bg-blue-500/10 text-blue-500'
                : 'bg-gray-500/10 text-gray-500'
          )}
        >
          {session.status}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-foreground-muted">
            {submittedCount} of {totalReviewers} reviews submitted
          </span>
          <span className="font-medium text-foreground">
            {progressPercent.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-background-elevated overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-foreground">{totalReviewers}</p>
          <p className="text-xs text-foreground-muted">Reviewers</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-500">{submittedCount}</p>
          <p className="text-xs text-foreground-muted">Submitted</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-500">{pendingCount}</p>
          <p className="text-xs text-foreground-muted">Pending</p>
        </div>
      </div>
    </Card>
  )
}
