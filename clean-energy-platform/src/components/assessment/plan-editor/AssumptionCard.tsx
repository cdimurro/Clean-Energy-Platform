/**
 * AssumptionCard Component
 *
 * Editable card for a single assumption with:
 * - Input field with unit suffix
 * - Source badge showing attribution
 * - Validation warning if out of range
 * - Reset button if modified
 */

'use client'

import * as React from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourceBadge } from './SourceBadge'
import type { PlanAssumption } from '@/types/tea'

interface AssumptionCardProps {
  assumption: PlanAssumption
  onUpdate: (value: string | number) => void
  onReset: () => void
  className?: string
}

export function AssumptionCard({
  assumption,
  onUpdate,
  onReset,
  className,
}: AssumptionCardProps) {
  const [inputValue, setInputValue] = React.useState(String(assumption.value))
  const [isFocused, setIsFocused] = React.useState(false)

  // Sync with external value changes
  React.useEffect(() => {
    setInputValue(String(assumption.value))
  }, [assumption.value])

  // Validation
  const numericValue = parseFloat(inputValue)
  const isValid = !isNaN(numericValue)
  const isOutOfRange =
    isValid &&
    assumption.validRange &&
    (numericValue < assumption.validRange.min || numericValue > assumption.validRange.max)

  const isModified = assumption.source.type === 'user'

  const handleBlur = () => {
    setIsFocused(false)
    if (isValid && inputValue !== String(assumption.value)) {
      onUpdate(numericValue)
    } else if (!isValid) {
      // Reset to last valid value
      setInputValue(String(assumption.value))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setInputValue(String(assumption.value))
      e.currentTarget.blur()
    }
  }

  return (
    <div
      className={cn(
        'group p-3 rounded-lg border bg-background-surface transition-all',
        isFocused && 'ring-2 ring-primary/20 border-primary',
        isModified && 'bg-green-50/50 border-green-200',
        isOutOfRange && 'bg-warning/5 border-warning/30',
        className
      )}
    >
      {/* Header: Label and Source */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-foreground truncate">
            {assumption.label}
          </label>
          {assumption.description && (
            <p className="text-xs text-foreground-muted mt-0.5 line-clamp-2">
              {assumption.description}
            </p>
          )}
        </div>
        <SourceBadge
          source={assumption.source}
          showReset={isModified}
          onReset={onReset}
        />
      </div>

      {/* Input Field */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={!assumption.isEditable}
            className={cn(
              'w-full px-3 py-2 pr-12 rounded-md border bg-background text-sm font-mono',
              'transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
              !assumption.isEditable && 'opacity-50 cursor-not-allowed bg-background-surface',
              !isValid && 'border-error text-error',
              isOutOfRange && 'border-warning'
            )}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-foreground-muted font-medium">
            {assumption.unit}
          </span>
        </div>
      </div>

      {/* Validation Messages */}
      {isOutOfRange && assumption.validRange && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-warning">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Typical range: {assumption.validRange.min} - {assumption.validRange.max}{' '}
            {assumption.unit}
          </span>
        </div>
      )}

      {!isValid && inputValue !== '' && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-error">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Please enter a valid number</span>
        </div>
      )}

      {/* Valid range hint on focus */}
      {isFocused && assumption.validRange && !isOutOfRange && isValid && (
        <div className="flex items-center gap-1.5 mt-2 text-xs text-foreground-muted">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Range: {assumption.validRange.min} - {assumption.validRange.max} {assumption.unit}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Compact inline version for tables or grids
 */
export function AssumptionCardInline({
  assumption,
  onUpdate,
  onReset,
  className,
}: AssumptionCardProps) {
  const [inputValue, setInputValue] = React.useState(String(assumption.value))

  React.useEffect(() => {
    setInputValue(String(assumption.value))
  }, [assumption.value])

  const numericValue = parseFloat(inputValue)
  const isValid = !isNaN(numericValue)
  const isModified = assumption.source.type === 'user'

  const handleBlur = () => {
    if (isValid && inputValue !== String(assumption.value)) {
      onUpdate(numericValue)
    } else if (!isValid) {
      setInputValue(String(assumption.value))
    }
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1.5',
        isModified && 'bg-green-50/50',
        className
      )}
    >
      <span className="flex-1 text-sm text-foreground truncate" title={assumption.label}>
        {assumption.label}
      </span>
      <div className="flex items-center gap-1">
        <input
          type="text"
          inputMode="decimal"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          disabled={!assumption.isEditable}
          className={cn(
            'w-20 px-2 py-1 rounded border bg-background text-sm font-mono text-right',
            'focus:outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary',
            !assumption.isEditable && 'opacity-50 cursor-not-allowed'
          )}
        />
        <span className="text-xs text-foreground-muted w-12">{assumption.unit}</span>
      </div>
    </div>
  )
}

export default AssumptionCard
