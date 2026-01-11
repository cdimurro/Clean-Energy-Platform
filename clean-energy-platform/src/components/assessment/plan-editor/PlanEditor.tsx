/**
 * PlanEditor Component
 *
 * Main container for the editable assessment plan.
 * Layout: 3/4 content + 1/4 sidebar
 */

'use client'

import * as React from 'react'
import { CheckCircle2, Download, RotateCcw, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { MethodologyEditor } from './MethodologyEditor'
import { AssumptionEditor } from './AssumptionEditor'
import { PlanSummary } from './PlanSummary'
import type { EnhancedAssessmentPlan, AssumptionCategory } from '@/types/tea'

interface PlanEditorProps {
  plan: EnhancedAssessmentPlan
  onUpdateAssumption: (
    category: AssumptionCategory,
    assumptionId: string,
    value: string | number
  ) => void
  onResetAssumption: (category: AssumptionCategory, assumptionId: string) => void
  onToggleAnalysis: (analysisId: string, enabled: boolean) => void
  onApprove: () => void
  onExport?: () => void
  onResetAll?: () => void
  isApproving?: boolean
  className?: string
}

export function PlanEditor({
  plan,
  onUpdateAssumption,
  onResetAssumption,
  onToggleAnalysis,
  onApprove,
  onExport,
  onResetAll,
  isApproving = false,
  className,
}: PlanEditorProps) {
  // Calculate if plan is ready for approval
  const enabledAnalyses = plan.methodology.analyses.filter((a) => a.enabled).length
  const criticalMissing = plan.missingData.filter((m) => m.impact === 'critical').length
  const canApprove = enabledAnalyses > 0 && criticalMissing === 0

  return (
    <div className={cn('flex gap-6', className)}>
      {/* Main Content - 3/4 width */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Methodology Section */}
        <section>
          <MethodologyEditor
            methodology={plan.methodology}
            onToggleAnalysis={onToggleAnalysis}
          />
        </section>

        {/* Divider */}
        <hr className="border-border" />

        {/* Assumptions Section */}
        <section>
          <AssumptionEditor
            assumptions={plan.assumptions}
            onUpdateAssumption={onUpdateAssumption}
            onResetAssumption={onResetAssumption}
          />
        </section>

        {/* Action Bar */}
        <div className="sticky bottom-0 py-4 bg-background border-t -mx-4 px-4 mt-6">
          <div className="flex items-center justify-between gap-4">
            {/* Left actions */}
            <div className="flex items-center gap-2">
              {onResetAll && plan.modifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetAll}
                  className="text-foreground-muted"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Reset All ({plan.modifications.length})
                </Button>
              )}

              {onExport && (
                <Button variant="ghost" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 mr-1.5" />
                  Export
                </Button>
              )}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {!canApprove && (
                <span className="text-xs text-warning">
                  {criticalMissing > 0
                    ? `${criticalMissing} critical items missing`
                    : enabledAnalyses === 0
                      ? 'Enable at least one analysis'
                      : ''}
                </span>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={onApprove}
                disabled={!canApprove || isApproving}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve & Execute
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - 1/4 width */}
      <aside className="w-72 flex-shrink-0 hidden lg:block">
        <div className="sticky top-4">
          <PlanSummary plan={plan} />
        </div>
      </aside>
    </div>
  )
}

/**
 * Mobile-friendly version with bottom sheet sidebar
 */
export function PlanEditorMobile({
  plan,
  onUpdateAssumption,
  onResetAssumption,
  onToggleAnalysis,
  onApprove,
  onExport,
  onResetAll,
  isApproving = false,
  className,
}: PlanEditorProps) {
  const [showSummary, setShowSummary] = React.useState(false)

  const enabledAnalyses = plan.methodology.analyses.filter((a) => a.enabled).length
  const criticalMissing = plan.missingData.filter((m) => m.impact === 'critical').length
  const canApprove = enabledAnalyses > 0 && criticalMissing === 0

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary toggle for mobile */}
      <button
        onClick={() => setShowSummary(!showSummary)}
        className="w-full p-3 rounded-lg border bg-background-surface flex items-center justify-between lg:hidden"
      >
        <span className="text-sm font-medium text-foreground">View Summary</span>
        <span className="text-xs text-foreground-muted">
          {plan.modifications.length} modifications
        </span>
      </button>

      {/* Mobile summary panel */}
      {showSummary && (
        <div className="lg:hidden">
          <PlanSummary plan={plan} />
        </div>
      )}

      {/* Methodology */}
      <MethodologyEditor
        methodology={plan.methodology}
        onToggleAnalysis={onToggleAnalysis}
      />

      <hr className="border-border" />

      {/* Assumptions */}
      <AssumptionEditor
        assumptions={plan.assumptions}
        onUpdateAssumption={onUpdateAssumption}
        onResetAssumption={onResetAssumption}
      />

      {/* Action Bar */}
      <div className="sticky bottom-0 py-4 bg-background border-t">
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            onClick={onApprove}
            disabled={!canApprove || isApproving}
            className="w-full"
          >
            {isApproving ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve & Execute
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4">
            {onResetAll && plan.modifications.length > 0 && (
              <button
                onClick={onResetAll}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                Reset All
              </button>
            )}
            {onExport && (
              <button
                onClick={onExport}
                className="text-xs text-foreground-muted hover:text-foreground"
              >
                Export
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlanEditor
