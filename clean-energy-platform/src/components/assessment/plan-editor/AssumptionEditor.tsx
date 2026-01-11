/**
 * AssumptionEditor Component
 *
 * Grouped assumption editing with collapsible category sections.
 * Shows completion status for each category.
 */

'use client'

import * as React from 'react'
import {
  ChevronDown,
  ChevronRight,
  DollarSign,
  Settings,
  Factory,
  TrendingUp,
  Leaf,
  Wrench,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AssumptionCard } from './AssumptionCard'
import type { PlanAssumption, AssumptionCategory, EnhancedAssessmentPlan } from '@/types/tea'

interface AssumptionEditorProps {
  assumptions: EnhancedAssessmentPlan['assumptions']
  onUpdateAssumption: (
    category: AssumptionCategory,
    assumptionId: string,
    value: string | number
  ) => void
  onResetAssumption: (category: AssumptionCategory, assumptionId: string) => void
  onAddAssumption?: (category: AssumptionCategory) => void
  className?: string
}

// Category configuration
const CATEGORY_CONFIG: Record<
  AssumptionCategory,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    description: string
  }
> = {
  financial: {
    label: 'Financial Parameters',
    icon: DollarSign,
    description: 'Discount rate, debt, taxes, depreciation',
  },
  technical: {
    label: 'Technical Parameters',
    icon: Settings,
    description: 'Capacity factor, efficiency, lifetime',
  },
  capital_costs: {
    label: 'Capital Costs',
    icon: Factory,
    description: 'CAPEX, installation, contingency',
  },
  operating_costs: {
    label: 'Operating Costs',
    icon: Wrench,
    description: 'OPEX, maintenance, insurance',
  },
  revenue: {
    label: 'Revenue Assumptions',
    icon: TrendingUp,
    description: 'Prices, credits, escalation',
  },
  environmental: {
    label: 'Environmental',
    icon: Leaf,
    description: 'Emissions, water usage',
  },
}

// Order of categories
const CATEGORY_ORDER: AssumptionCategory[] = [
  'financial',
  'technical',
  'capital_costs',
  'operating_costs',
  'revenue',
  'environmental',
]

export function AssumptionEditor({
  assumptions,
  onUpdateAssumption,
  onResetAssumption,
  onAddAssumption,
  className,
}: AssumptionEditorProps) {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<AssumptionCategory>>(
    new Set(['financial', 'technical']) // Start with these expanded
  )

  const toggleCategory = (category: AssumptionCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const expandAll = () => {
    setExpandedCategories(new Set(CATEGORY_ORDER))
  }

  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with expand/collapse controls */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">Assumptions</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            Expand all
          </button>
          <span className="text-foreground-muted">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-foreground-muted hover:text-foreground transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORY_ORDER.map((category) => {
        const config = CATEGORY_CONFIG[category]
        const categoryAssumptions = assumptions[category] || []
        const isExpanded = expandedCategories.has(category)
        const filledCount = categoryAssumptions.filter(
          (a) => a.value !== '' && a.value !== null && a.value !== undefined
        ).length
        const modifiedCount = categoryAssumptions.filter(
          (a) => a.source.type === 'user'
        ).length

        return (
          <CategorySection
            key={category}
            category={category}
            config={config}
            assumptions={categoryAssumptions}
            isExpanded={isExpanded}
            filledCount={filledCount}
            totalCount={categoryAssumptions.length}
            modifiedCount={modifiedCount}
            onToggle={() => toggleCategory(category)}
            onUpdateAssumption={(id, value) => onUpdateAssumption(category, id, value)}
            onResetAssumption={(id) => onResetAssumption(category, id)}
            onAddAssumption={onAddAssumption ? () => onAddAssumption(category) : undefined}
          />
        )
      })}
    </div>
  )
}

interface CategorySectionProps {
  category: AssumptionCategory
  config: (typeof CATEGORY_CONFIG)[AssumptionCategory]
  assumptions: PlanAssumption[]
  isExpanded: boolean
  filledCount: number
  totalCount: number
  modifiedCount: number
  onToggle: () => void
  onUpdateAssumption: (id: string, value: string | number) => void
  onResetAssumption: (id: string) => void
  onAddAssumption?: () => void
}

function CategorySection({
  category,
  config,
  assumptions,
  isExpanded,
  filledCount,
  totalCount,
  modifiedCount,
  onToggle,
  onUpdateAssumption,
  onResetAssumption,
  onAddAssumption,
}: CategorySectionProps) {
  const Icon = config.icon
  const isComplete = filledCount === totalCount

  return (
    <div className="border rounded-lg bg-background-surface overflow-hidden">
      {/* Header */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-background-hover'
        )}
      >
        {/* Expand/Collapse icon */}
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 text-foreground-muted flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-foreground-muted flex-shrink-0" />
        )}

        {/* Category icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            isComplete ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'
          )}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Title and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{config.label}</span>
            {modifiedCount > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                {modifiedCount} modified
              </span>
            )}
          </div>
          <p className="text-xs text-foreground-muted truncate">{config.description}</p>
        </div>

        {/* Completion badge */}
        <div
          className={cn(
            'px-2 py-1 rounded text-xs font-medium flex-shrink-0',
            isComplete
              ? 'bg-success/10 text-success'
              : 'bg-foreground-muted/10 text-foreground-muted'
          )}
        >
          {filledCount}/{totalCount}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 space-y-2 border-t">
          {assumptions.length === 0 ? (
            <p className="text-sm text-foreground-muted py-4 text-center">
              No assumptions in this category
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {assumptions.map((assumption) => (
                <AssumptionCard
                  key={assumption.id}
                  assumption={assumption}
                  onUpdate={(value) => onUpdateAssumption(assumption.id, value)}
                  onReset={() => onResetAssumption(assumption.id)}
                />
              ))}
            </div>
          )}

          {/* Add custom assumption button */}
          {onAddAssumption && (
            <button
              onClick={onAddAssumption}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2
                         text-sm text-foreground-muted hover:text-foreground
                         border border-dashed rounded-lg hover:border-foreground-muted
                         transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add custom assumption
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default AssumptionEditor
