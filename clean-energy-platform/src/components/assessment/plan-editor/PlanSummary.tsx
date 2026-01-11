/**
 * PlanSummary Component
 *
 * Sidebar showing:
 * - Technology type and domain
 * - Completeness progress
 * - Modification count
 * - Missing data warnings
 */

'use client'

import * as React from 'react'
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  FileWarning,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnhancedAssessmentPlan, AssumptionCategory } from '@/types/tea'

interface PlanSummaryProps {
  plan: EnhancedAssessmentPlan
  className?: string
}

export function PlanSummary({ plan, className }: PlanSummaryProps) {
  // Calculate completeness
  const allAssumptions = Object.values(plan.assumptions).flat()
  const filledAssumptions = allAssumptions.filter(
    (a) => a.value !== '' && a.value !== null && a.value !== undefined
  )
  const completeness = Math.round((filledAssumptions.length / allAssumptions.length) * 100)

  // Count modifications
  const modificationCount = plan.modifications.length

  // Count enabled analyses
  const enabledAnalyses = plan.methodology.analyses.filter((a) => a.enabled).length
  const totalAnalyses = plan.methodology.analyses.length

  // Count warnings
  const criticalMissing = plan.missingData.filter((m) => m.impact === 'critical').length
  const significantMissing = plan.missingData.filter((m) => m.impact === 'significant').length

  return (
    <div className={cn('space-y-4', className)}>
      {/* Technology Badge */}
      <div className="p-4 rounded-lg border bg-background-surface">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground capitalize">
              {plan.technologyType.replace(/-/g, ' ').replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-foreground-muted">
              Domain: {plan.domainId.replace(/-/g, ' ')}
            </p>
          </div>
        </div>
      </div>

      {/* Completeness */}
      <div className="p-4 rounded-lg border bg-background-surface">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Completeness</span>
          <span
            className={cn(
              'text-sm font-bold',
              completeness >= 80 ? 'text-success' : completeness >= 50 ? 'text-warning' : 'text-error'
            )}
          >
            {completeness}%
          </span>
        </div>
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              completeness >= 80 ? 'bg-success' : completeness >= 50 ? 'bg-warning' : 'bg-error'
            )}
            style={{ width: `${completeness}%` }}
          />
        </div>
        <p className="text-xs text-foreground-muted mt-2">
          {filledAssumptions.length}/{allAssumptions.length} assumptions filled
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Modifications */}
        <div className="p-3 rounded-lg border bg-background-surface">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 className="w-4 h-4 text-green-600" />
            <span className="text-xs text-foreground-muted">Modified</span>
          </div>
          <p className="text-lg font-bold text-foreground">{modificationCount}</p>
        </div>

        {/* Enabled Analyses */}
        <div className="p-3 rounded-lg border bg-background-surface">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground-muted">Analyses</span>
          </div>
          <p className="text-lg font-bold text-foreground">
            {enabledAnalyses}/{totalAnalyses}
          </p>
        </div>
      </div>

      {/* Missing Data Warnings */}
      {plan.missingData.length > 0 && (
        <div className="p-4 rounded-lg border bg-background-surface">
          <div className="flex items-center gap-2 mb-3">
            <FileWarning className="w-4 h-4 text-warning" />
            <span className="text-sm font-medium text-foreground">Missing Data</span>
          </div>

          <ul className="space-y-2">
            {plan.missingData.slice(0, 5).map((item, index) => (
              <li key={index} className="flex items-start gap-2">
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                    item.impact === 'critical'
                      ? 'bg-error'
                      : item.impact === 'significant'
                        ? 'bg-warning'
                        : 'bg-foreground-muted'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{item.item}</p>
                  {item.suggestion && (
                    <p className="text-[10px] text-foreground-muted truncate">
                      {item.suggestion}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {plan.missingData.length > 5 && (
            <p className="text-xs text-foreground-muted mt-2">
              +{plan.missingData.length - 5} more items
            </p>
          )}

          {/* Impact summary */}
          <div className="flex items-center gap-3 mt-3 pt-3 border-t">
            {criticalMissing > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-error">
                <AlertTriangle className="w-3 h-3" />
                {criticalMissing} critical
              </span>
            )}
            {significantMissing > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-warning">
                <Info className="w-3 h-3" />
                {significantMissing} significant
              </span>
            )}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="p-4 rounded-lg border bg-background-surface">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">Plan Status</span>
        </div>
        <div
          className={cn(
            'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium',
            plan.status === 'approved'
              ? 'bg-success/10 text-success'
              : plan.status === 'review'
                ? 'bg-primary/10 text-primary'
                : 'bg-foreground-muted/10 text-foreground-muted'
          )}
        >
          {plan.status === 'approved' ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <Edit3 className="w-3 h-3" />
          )}
          <span className="capitalize">{plan.status}</span>
        </div>

        {plan.approvedAt && (
          <p className="text-xs text-foreground-muted mt-2">
            Approved: {new Date(plan.approvedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}

export default PlanSummary
