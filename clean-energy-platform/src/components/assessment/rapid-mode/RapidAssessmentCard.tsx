/**
 * RapidAssessmentCard Component
 *
 * Displays the result of a rapid TRL assessment including:
 * - Traffic light rating (GREEN/YELLOW/RED)
 * - TRL score with justification
 * - Top 5 risks
 * - Go/No-Go recommendation
 *
 * For investor due diligence Quick TRL Assessment product
 */

'use client'

import * as React from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Zap,
  Shield,
  TrendingUp,
  AlertOctagon,
  Info,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type {
  RapidAssessmentResult,
  TrafficLightRating,
  TechnicalRisk,
} from '@/lib/ai/agents/assessment/rapid-orchestrator'

// ============================================================================
// Traffic Light Component
// ============================================================================

interface TrafficLightProps {
  rating: TrafficLightRating
  size?: 'sm' | 'md' | 'lg'
}

function TrafficLight({ rating, size = 'md' }: TrafficLightProps) {
  const sizeClasses = {
    sm: 'w-8 h-24',
    md: 'w-12 h-36',
    lg: 'w-16 h-48',
  }

  const lightSizes = {
    sm: 'w-6 h-6',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between py-2 rounded-full bg-zinc-900',
        sizeClasses[size]
      )}
    >
      {/* Red */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          rating === 'RED'
            ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)]'
            : 'bg-red-900/30'
        )}
      />
      {/* Yellow */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          rating === 'YELLOW'
            ? 'bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]'
            : 'bg-yellow-900/30'
        )}
      />
      {/* Green */}
      <div
        className={cn(
          'rounded-full transition-all duration-300',
          lightSizes[size],
          rating === 'GREEN'
            ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
            : 'bg-green-900/30'
        )}
      />
    </div>
  )
}

// ============================================================================
// TRL Gauge Component
// ============================================================================

interface TRLGaugeProps {
  trl: number
  confidence: 'high' | 'medium' | 'low'
}

function TRLGauge({ trl, confidence }: TRLGaugeProps) {
  const stages = [
    { range: [1, 2], label: 'Research', color: 'bg-purple-500' },
    { range: [3, 4], label: 'Development', color: 'bg-blue-500' },
    { range: [5, 6], label: 'Demonstration', color: 'bg-cyan-500' },
    { range: [7, 8], label: 'Pre-Commercial', color: 'bg-emerald-500' },
    { range: [9, 9], label: 'Commercial', color: 'bg-green-500' },
  ]

  const currentStage = stages.find(s => trl >= s.range[0] && trl <= s.range[1]) || stages[0]

  return (
    <div className="space-y-3">
      {/* TRL Number */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground">{trl}</span>
        <span className="text-lg text-foreground-muted">/9</span>
      </div>

      {/* Stage Label */}
      <div className="flex items-center gap-2">
        <div className={cn('w-3 h-3 rounded-full', currentStage.color)} />
        <span className="text-sm font-medium text-foreground">{currentStage.label}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-background rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', currentStage.color)}
          style={{ width: `${(trl / 9) * 100}%` }}
        />
      </div>

      {/* Confidence */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-foreground-muted">Confidence:</span>
        <span
          className={cn(
            'font-medium',
            confidence === 'high'
              ? 'text-green-600'
              : confidence === 'medium'
                ? 'text-yellow-600'
                : 'text-red-600'
          )}
        >
          {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Risk Card Component
// ============================================================================

interface RiskCardProps {
  risk: TechnicalRisk
  index: number
}

function RiskCard({ risk, index }: RiskCardProps) {
  const [expanded, setExpanded] = React.useState(false)

  const severityConfig = {
    critical: { color: 'border-red-500 bg-red-500/5', badge: 'bg-red-500 text-white', icon: XCircle },
    high: { color: 'border-orange-500 bg-orange-500/5', badge: 'bg-orange-500 text-white', icon: AlertOctagon },
    medium: { color: 'border-yellow-500 bg-yellow-500/5', badge: 'bg-yellow-500 text-black', icon: AlertTriangle },
    low: { color: 'border-blue-500 bg-blue-500/5', badge: 'bg-blue-500 text-white', icon: Info },
  }

  const config = severityConfig[risk.severity]
  const Icon = config.icon

  return (
    <div className={cn('rounded-lg border-l-4 p-4', config.color)}>
      <div
        className="flex items-start justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-background flex items-center justify-center text-sm font-bold text-foreground-muted">
            {index + 1}
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn('px-2 py-0.5 rounded text-xs font-bold', config.badge)}>
                {risk.severity.toUpperCase()}
              </span>
              <span className="text-xs text-foreground-muted capitalize">{risk.category}</span>
            </div>
            <p className="text-sm font-medium text-foreground">{risk.risk}</p>
          </div>
        </div>
        <button className="text-foreground-muted hover:text-foreground transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pl-9 space-y-3">
          <div>
            <p className="text-xs font-medium text-foreground-muted mb-1">Explanation</p>
            <p className="text-sm text-foreground">{risk.explanation}</p>
          </div>
          {risk.mitigation && (
            <div>
              <p className="text-xs font-medium text-foreground-muted mb-1">Mitigation</p>
              <p className="text-sm text-foreground">{risk.mitigation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Recommendation Badge Component
// ============================================================================

interface RecommendationBadgeProps {
  recommendation: RapidAssessmentResult['recommendation']
}

function RecommendationBadge({ recommendation }: RecommendationBadgeProps) {
  const config = {
    PROCEED: {
      icon: CheckCircle2,
      label: 'Proceed to Full Diligence',
      color: 'bg-green-100 border-green-500 text-green-800',
      iconColor: 'text-green-600',
    },
    PROCEED_WITH_CAUTION: {
      icon: AlertTriangle,
      label: 'Proceed with Caution',
      color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
      iconColor: 'text-yellow-600',
    },
    DO_NOT_PROCEED: {
      icon: XCircle,
      label: 'Do Not Proceed',
      color: 'bg-red-100 border-red-500 text-red-800',
      iconColor: 'text-red-600',
    },
  }

  const { icon: Icon, label, color, iconColor } = config[recommendation]

  return (
    <div className={cn('flex items-center gap-3 px-4 py-3 rounded-lg border-2', color)}>
      <Icon className={cn('w-6 h-6', iconColor)} />
      <span className="font-bold text-lg">{label}</span>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

interface RapidAssessmentCardProps {
  result: RapidAssessmentResult
  onDownloadPdf?: () => void
  className?: string
}

export function RapidAssessmentCard({
  result,
  onDownloadPdf,
  className,
}: RapidAssessmentCardProps) {
  const [showAllRisks, setShowAllRisks] = React.useState(false)

  const displayedRisks = showAllRisks ? result.topRisks : result.topRisks.slice(0, 3)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Quick TRL Assessment</h2>
          <p className="text-sm text-foreground-muted mt-1">
            Assessment ID: {result.assessmentId}
          </p>
        </div>
        {onDownloadPdf && (
          <button
            onClick={onDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        )}
      </div>

      {/* Main Rating Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Traffic Light */}
        <div className="p-6 rounded-xl border bg-background-surface flex flex-col items-center">
          <h3 className="text-sm font-medium text-foreground-muted mb-4">Assessment Rating</h3>
          <TrafficLight rating={result.rating} size="md" />
          <p className="text-lg font-bold text-foreground mt-4">{result.rating}</p>
          <p className="text-xs text-foreground-muted text-center mt-2 max-w-[200px]">
            {result.ratingJustification}
          </p>
        </div>

        {/* TRL Gauge */}
        <div className="p-6 rounded-xl border bg-background-surface">
          <h3 className="text-sm font-medium text-foreground-muted mb-4">
            Technology Readiness Level
          </h3>
          <TRLGauge trl={result.trl} confidence={result.trlConfidence} />
          <p className="text-xs text-foreground-muted mt-4">{result.trlJustification}</p>
        </div>

        {/* Recommendation */}
        <div className="p-6 rounded-xl border bg-background-surface">
          <h3 className="text-sm font-medium text-foreground-muted mb-4">Recommendation</h3>
          <RecommendationBadge recommendation={result.recommendation} />
          <p className="text-sm text-foreground mt-4">{result.recommendationRationale}</p>
        </div>
      </div>

      {/* Red Flags Alert */}
      {result.redFlags.hasRedFlags && (
        <div className="p-4 rounded-xl border-2 border-red-500 bg-red-500/5">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-red-500" />
            <div>
              <h3 className="font-bold text-red-700">Physics Violations Detected</h3>
              <p className="text-sm text-red-600">{result.redFlags.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Risks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Top Technical Risks</h3>
          <span className="text-sm text-foreground-muted">
            {result.topRisks.length} identified
          </span>
        </div>

        <div className="space-y-3">
          {displayedRisks.map((risk, index) => (
            <RiskCard key={risk.id} risk={risk} index={index} />
          ))}
        </div>

        {result.topRisks.length > 3 && (
          <button
            onClick={() => setShowAllRisks(!showAllRisks)}
            className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
          >
            {showAllRisks ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show All {result.topRisks.length} Risks
              </>
            )}
          </button>
        )}
      </div>

      {/* Key Metrics */}
      {result.keyMetrics.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-foreground">Key Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {result.keyMetrics.map((metric, index) => (
              <div key={index} className="p-4 rounded-lg border bg-background-surface">
                <p className="text-xs text-foreground-muted mb-1">{metric.name}</p>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                {metric.benchmark && (
                  <p className="text-xs text-foreground-muted mt-1">
                    Benchmark: {metric.benchmark}
                  </p>
                )}
                <div
                  className={cn(
                    'mt-2 px-2 py-0.5 rounded text-xs inline-block',
                    metric.status === 'within_range'
                      ? 'bg-green-100 text-green-800'
                      : metric.status === 'above_benchmark'
                        ? 'bg-blue-100 text-blue-800'
                        : metric.status === 'below_benchmark'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                  )}
                >
                  {metric.status.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Executive Summary */}
      <div className="p-6 rounded-xl border bg-background-surface space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Executive Summary</h3>
        </div>
        <div className="prose prose-sm max-w-none text-foreground">
          <pre className="whitespace-pre-wrap font-sans text-sm">{result.executiveSummary}</pre>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center justify-between text-xs text-foreground-muted border-t pt-4">
        <div className="flex items-center gap-4">
          <span>Duration: {(result.duration / 1000).toFixed(1)}s</span>
          <span>Components: {result.metadata.componentsSuccessful}/{result.metadata.componentsRun}</span>
        </div>
        <span>Generated: {new Date(result.metadata.endTime).toLocaleString()}</span>
      </div>
    </div>
  )
}

export default RapidAssessmentCard
