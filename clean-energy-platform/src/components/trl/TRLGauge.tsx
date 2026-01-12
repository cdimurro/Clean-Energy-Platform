/**
 * TRL Gauge Component
 *
 * Visual gauge displaying TRL level 1-9 with sub-levels (a, b, c).
 * Shows current TRL, target TRL, and confidence level.
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { TRLLevel, TRLSublevel } from '@/types/trl'

interface TRLGaugeProps {
  level: TRLLevel
  sublevel: TRLSublevel
  targetLevel?: TRLLevel
  confidence?: number
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

const TRL_COLORS: Record<TRLLevel, { bg: string; text: string; ring: string }> = {
  1: { bg: 'bg-gray-500', text: 'text-gray-500', ring: 'ring-gray-500/20' },
  2: { bg: 'bg-gray-600', text: 'text-gray-600', ring: 'ring-gray-600/20' },
  3: { bg: 'bg-blue-500', text: 'text-blue-500', ring: 'ring-blue-500/20' },
  4: { bg: 'bg-blue-600', text: 'text-blue-600', ring: 'ring-blue-600/20' },
  5: { bg: 'bg-indigo-500', text: 'text-indigo-500', ring: 'ring-indigo-500/20' },
  6: { bg: 'bg-purple-500', text: 'text-purple-500', ring: 'ring-purple-500/20' },
  7: { bg: 'bg-amber-500', text: 'text-amber-500', ring: 'ring-amber-500/20' },
  8: { bg: 'bg-orange-500', text: 'text-orange-500', ring: 'ring-orange-500/20' },
  9: { bg: 'bg-green-500', text: 'text-green-500', ring: 'ring-green-500/20' },
}

const TRL_PHASES: Record<number, string> = {
  1: 'Research',
  2: 'Research',
  3: 'Research',
  4: 'Development',
  5: 'Development',
  6: 'Demonstration',
  7: 'Demonstration',
  8: 'Deployment',
  9: 'Deployment',
}

const SIZE_CONFIG = {
  sm: {
    container: 'w-24 h-24',
    text: 'text-xl',
    sublevel: 'text-sm',
    label: 'text-xs',
  },
  md: {
    container: 'w-32 h-32',
    text: 'text-3xl',
    sublevel: 'text-base',
    label: 'text-sm',
  },
  lg: {
    container: 'w-40 h-40',
    text: 'text-4xl',
    sublevel: 'text-lg',
    label: 'text-base',
  },
}

export function TRLGauge({
  level,
  sublevel,
  targetLevel,
  confidence,
  size = 'md',
  showLabels = true,
  className,
}: TRLGaugeProps) {
  const colors = TRL_COLORS[level]
  const sizeConfig = SIZE_CONFIG[size]
  const phase = TRL_PHASES[level]

  // Calculate progress through current level (a=0, b=33, c=66)
  const sublevelProgress = sublevel === 'a' ? 0 : sublevel === 'b' ? 33 : 66

  // Overall progress 1a=0 to 9c=100
  const overallProgress = ((level - 1) * 3 + (sublevel === 'a' ? 0 : sublevel === 'b' ? 1 : 2)) / 26 * 100

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Main Gauge */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center ring-4',
          sizeConfig.container,
          colors.ring
        )}
      >
        {/* Background arc showing overall progress */}
        <svg
          className="absolute inset-0 -rotate-90"
          viewBox="0 0 100 100"
        >
          {/* Background track */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-background-elevated"
          />
          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${overallProgress * 2.83} 283`}
            className={colors.text}
          />
          {/* Target indicator */}
          {targetLevel && targetLevel > level && (
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 4"
              strokeDashoffset={-((targetLevel - 1) / 8) * 283}
              className="text-foreground-muted"
            />
          )}
        </svg>

        {/* Center content */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-baseline">
            <span className={cn('font-bold', sizeConfig.text, colors.text)}>
              {level}
            </span>
            <span className={cn('font-medium', sizeConfig.sublevel, colors.text)}>
              {sublevel}
            </span>
          </div>
          {showLabels && (
            <span className={cn('text-foreground-muted', sizeConfig.label)}>
              TRL
            </span>
          )}
        </div>
      </div>

      {/* Labels below gauge */}
      {showLabels && (
        <div className="mt-2 text-center">
          <p className={cn('font-medium text-foreground', sizeConfig.label)}>
            {phase}
          </p>
          {confidence !== undefined && (
            <p className={cn('text-foreground-muted', sizeConfig.label)}>
              {confidence}% confidence
            </p>
          )}
          {targetLevel && targetLevel > level && (
            <p className={cn('text-foreground-muted', sizeConfig.label)}>
              Target: TRL {targetLevel}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Compact horizontal TRL indicator bar
 */
interface TRLBarProps {
  level: TRLLevel
  sublevel: TRLSublevel
  showAllLevels?: boolean
  className?: string
}

export function TRLBar({
  level,
  sublevel,
  showAllLevels = true,
  className,
}: TRLBarProps) {
  const levels: TRLLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const currentIndex = (level - 1) * 3 + (sublevel === 'a' ? 0 : sublevel === 'b' ? 1 : 2)

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {levels.map((l) => {
        const levelIndex = (l - 1) * 3
        const isComplete = levelIndex + 2 < currentIndex
        const isCurrent = l === level
        const colors = TRL_COLORS[l]

        return (
          <div key={l} className="flex flex-col items-center">
            <div className="flex gap-0.5">
              {(['a', 'b', 'c'] as TRLSublevel[]).map((sl, idx) => {
                const sublevelIndex = levelIndex + idx
                const isActive = sublevelIndex <= currentIndex

                return (
                  <div
                    key={sl}
                    className={cn(
                      'w-2 h-4 rounded-sm transition-colors',
                      isActive ? colors.bg : 'bg-background-elevated',
                      isCurrent && sl === sublevel && 'ring-1 ring-foreground'
                    )}
                  />
                )
              })}
            </div>
            {showAllLevels && (
              <span
                className={cn(
                  'text-xs mt-1',
                  isCurrent ? colors.text + ' font-medium' : 'text-foreground-muted'
                )}
              >
                {l}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * TRL Level selector for forms
 */
interface TRLSelectorProps {
  value: { level: TRLLevel; sublevel: TRLSublevel } | null
  onChange: (value: { level: TRLLevel; sublevel: TRLSublevel }) => void
  disabled?: boolean
  className?: string
}

export function TRLSelector({
  value,
  onChange,
  disabled = false,
  className,
}: TRLSelectorProps) {
  const levels: TRLLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  const sublevels: TRLSublevel[] = ['a', 'b', 'c']

  return (
    <div className={cn('space-y-3', className)}>
      {/* Level selector */}
      <div className="grid grid-cols-9 gap-1">
        {levels.map((l) => {
          const colors = TRL_COLORS[l]
          const isSelected = value?.level === l

          return (
            <button
              key={l}
              type="button"
              disabled={disabled}
              onClick={() =>
                onChange({ level: l, sublevel: value?.sublevel || 'a' })
              }
              className={cn(
                'h-10 rounded-lg font-medium transition-all',
                isSelected
                  ? cn(colors.bg, 'text-white')
                  : 'bg-background-elevated text-foreground-muted hover:bg-background-hover',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {l}
            </button>
          )
        })}
      </div>

      {/* Sublevel selector */}
      {value && (
        <div className="flex gap-2 justify-center">
          {sublevels.map((sl) => {
            const colors = TRL_COLORS[value.level]
            const isSelected = value.sublevel === sl

            return (
              <button
                key={sl}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, sublevel: sl })}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-all',
                  isSelected
                    ? cn(colors.bg, 'text-white')
                    : 'bg-background-elevated text-foreground-muted hover:bg-background-hover',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                TRL {value.level}
                {sl}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
