/**
 * SourceBadge Component
 *
 * Visual indicator showing where an assumption value came from:
 * - Extracted (blue): Value extracted from uploaded document
 * - Default (gray): Industry default for technology type
 * - Calculated (purple): Derived from other values
 * - User (green): Modified by user
 */

'use client'

import * as React from 'react'
import { FileText, Settings, Calculator, User, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AssumptionSource, AssumptionSourceType } from '@/types/tea'

interface SourceBadgeProps {
  source: AssumptionSource
  showReset?: boolean
  onReset?: () => void
  className?: string
}

const SOURCE_CONFIG: Record<
  AssumptionSourceType,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    bgColor: string
    textColor: string
    borderColor: string
  }
> = {
  extracted: {
    label: 'Extracted',
    icon: FileText,
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
  },
  default: {
    label: 'Default',
    icon: Settings,
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
  calculated: {
    label: 'Calculated',
    icon: Calculator,
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
  },
  user: {
    label: 'Modified',
    icon: User,
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
  },
}

export function SourceBadge({
  source,
  showReset = false,
  onReset,
  className,
}: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source.type]
  const Icon = config.icon

  // Build the display text
  const getDisplayText = () => {
    switch (source.type) {
      case 'extracted':
        if (source.documentName && source.pageNumber) {
          return `From ${source.documentName} p.${source.pageNumber}`
        }
        if (source.documentName) {
          return `From ${source.documentName}`
        }
        return 'Extracted from document'

      case 'default':
        if (source.technologyType) {
          return `${source.technologyType} default`
        }
        return 'Industry default'

      case 'calculated':
        if (source.calculation) {
          return source.calculation
        }
        return 'Derived value'

      case 'user':
        return 'User modified'
    }
  }

  const displayText = getDisplayText()

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
          config.bgColor,
          config.textColor,
          config.borderColor
        )}
        title={displayText}
      >
        <Icon className="w-3 h-3" />
        <span className="max-w-[150px] truncate">{displayText}</span>
      </span>

      {showReset && source.type === 'user' && source.originalValue !== undefined && (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium
                     bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200
                     transition-colors"
          title={`Reset to original: ${source.originalValue}`}
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

/**
 * Compact version for inline use
 */
export function SourceBadgeCompact({
  source,
  className,
}: {
  source: AssumptionSource
  className?: string
}) {
  const config = SOURCE_CONFIG[source.type]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border',
        config.bgColor,
        config.textColor,
        config.borderColor,
        className
      )}
      title={`Source: ${config.label}`}
    >
      <Icon className="w-2.5 h-2.5" />
      <span>{config.label}</span>
    </span>
  )
}

export default SourceBadge
