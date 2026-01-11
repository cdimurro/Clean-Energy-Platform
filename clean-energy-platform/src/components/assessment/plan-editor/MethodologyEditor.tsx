/**
 * MethodologyEditor Component
 *
 * Displays and allows editing of the assessment methodology:
 * - AI-generated overview
 * - Toggle individual analyses on/off
 * - Show limitations
 */

'use client'

import * as React from 'react'
import {
  Lightbulb,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAssessmentPlan, MethodologyConfig } from '@/types/tea'

interface MethodologyEditorProps {
  methodology: EnhancedAssessmentPlan['methodology']
  onToggleAnalysis: (analysisId: string, enabled: boolean) => void
  className?: string
}

export function MethodologyEditor({
  methodology,
  onToggleAnalysis,
  className,
}: MethodologyEditorProps) {
  const [showLimitations, setShowLimitations] = React.useState(false)

  const enabledCount = methodology.analyses.filter((a) => a.enabled).length
  const totalCount = methodology.analyses.length

  // Calculate estimated total time
  const estimatedTime = methodology.analyses
    .filter((a) => a.enabled)
    .reduce((acc, a) => {
      const match = a.estimatedDuration.match(/(\d+)-(\d+)/)
      if (match) {
        return acc + (parseInt(match[1]) + parseInt(match[2])) / 2
      }
      return acc + 3
    }, 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Methodology</h3>
        <div className="flex items-center gap-2 text-sm text-foreground-muted">
          <Clock className="w-4 h-4" />
          <span>~{Math.round(estimatedTime)} min</span>
        </div>
      </div>

      {/* AI Overview Card */}
      <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground mb-1">Assessment Approach</h4>
            <p className="text-sm text-foreground-muted">{methodology.overview}</p>
          </div>
        </div>
      </div>

      {/* Analyses Toggle List */}
      <div className="space-y-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Analyses to Run</span>
          <span className="text-xs text-foreground-muted">
            {enabledCount}/{totalCount} enabled
          </span>
        </div>

        {methodology.analyses.map((analysis) => (
          <AnalysisToggle
            key={analysis.id}
            analysis={analysis}
            onToggle={(enabled) => onToggleAnalysis(analysis.id, enabled)}
          />
        ))}
      </div>

      {/* Limitations */}
      {methodology.limitations.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setShowLimitations(!showLimitations)}
            className="w-full flex items-center justify-between px-4 py-3 bg-warning/5 hover:bg-warning/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-foreground">
                Known Limitations ({methodology.limitations.length})
              </span>
            </div>
            {showLimitations ? (
              <ChevronUp className="w-4 h-4 text-foreground-muted" />
            ) : (
              <ChevronDown className="w-4 h-4 text-foreground-muted" />
            )}
          </button>

          {showLimitations && (
            <div className="px-4 py-3 bg-background-surface border-t">
              <ul className="space-y-2">
                {methodology.limitations.map((limitation, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-foreground-muted"
                  >
                    <span className="text-warning mt-0.5">-</span>
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface AnalysisToggleProps {
  analysis: MethodologyConfig
  onToggle: (enabled: boolean) => void
}

function AnalysisToggle({ analysis, onToggle }: AnalysisToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
        analysis.enabled
          ? 'bg-background-surface border-border hover:border-primary/30'
          : 'bg-background border-border/50 opacity-60 hover:opacity-80'
      )}
      onClick={() => onToggle(!analysis.enabled)}
    >
      {/* Toggle indicator */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(!analysis.enabled)
        }}
        className="flex-shrink-0"
      >
        {analysis.enabled ? (
          <CheckCircle2 className="w-5 h-5 text-success" />
        ) : (
          <Circle className="w-5 h-5 text-foreground-muted" />
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              analysis.enabled ? 'text-foreground' : 'text-foreground-muted'
            )}
          >
            {analysis.name}
          </span>
        </div>
        <p className="text-xs text-foreground-muted mt-0.5 line-clamp-1">
          {analysis.description}
        </p>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-1 text-xs text-foreground-muted flex-shrink-0">
        <Clock className="w-3 h-3" />
        <span>{analysis.estimatedDuration}</span>
      </div>
    </div>
  )
}

export default MethodologyEditor
