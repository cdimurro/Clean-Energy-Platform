'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ReactNode
  iconBackground?: string
  action?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'compact' | 'featured'
  loading?: boolean
  className?: string
}

// ============================================================================
// Trend Indicator
// ============================================================================

interface TrendIndicatorProps {
  value: number
  direction: 'up' | 'down' | 'neutral'
  label?: string
}

function TrendIndicator({ value, direction, label }: TrendIndicatorProps) {
  const colors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-foreground-muted',
  }

  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    neutral: Minus,
  }

  const Icon = icons[direction]
  const formattedValue = direction === 'neutral' ? '0' : `${value > 0 ? '+' : ''}${value}`

  return (
    <div className={cn('flex items-center gap-1 text-xs', colors[direction])}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{formattedValue}%</span>
      {label && <span className="text-foreground-muted">{label}</span>}
    </div>
  )
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function StatCardSkeleton({ variant }: { variant: StatCardProps['variant'] }) {
  if (variant === 'compact') {
    return (
      <div className="animate-pulse">
        <div className="h-4 w-24 rounded bg-background-surface" />
        <div className="mt-2 h-6 w-16 rounded bg-background-surface" />
      </div>
    )
  }

  return (
    <div className="animate-pulse">
      <div className="h-4 w-32 rounded bg-background-surface" />
      <div className="mt-3 h-8 w-24 rounded bg-background-surface" />
      <div className="mt-2 h-3 w-20 rounded bg-background-surface" />
    </div>
  )
}

// ============================================================================
// Main StatCard Component
// ============================================================================

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconBackground = 'bg-primary/10',
  action,
  variant = 'default',
  loading = false,
  className,
}: StatCardProps) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center justify-between rounded-lg bg-card-background border border-border p-4',
          className
        )}
      >
        {loading ? (
          <StatCardSkeleton variant={variant} />
        ) : (
          <>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                {title}
              </p>
              <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
            </div>
            {icon && (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  iconBackground
                )}
              >
                {icon}
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  if (variant === 'featured') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-hover p-6 text-primary-foreground',
          className
        )}
      >
        {loading ? (
          <StatCardSkeleton variant={variant} />
        ) : (
          <>
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-90">{title}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
              {subtitle && (
                <p className="mt-1 text-sm opacity-80">{subtitle}</p>
              )}
              {trend && (
                <div className="mt-3">
                  <TrendIndicator {...trend} />
                </div>
              )}
              {action && (
                <button
                  type="button"
                  onClick={action.onClick}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:underline"
                >
                  {action.label}
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            {icon && (
              <div className="absolute right-4 top-4 opacity-20">
                <div className="h-24 w-24">{icon}</div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        'rounded-xl bg-card-background border border-border p-6',
        className
      )}
    >
      {loading ? (
        <StatCardSkeleton variant={variant} />
      ) : (
        <>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-foreground-muted">{title}</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
              {subtitle && (
                <p className="mt-1 text-xs text-foreground-muted">{subtitle}</p>
              )}
            </div>
            {icon && (
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg',
                  iconBackground
                )}
              >
                {icon}
              </div>
            )}
          </div>
          {trend && (
            <div className="mt-4">
              <TrendIndicator {...trend} />
            </div>
          )}
          {action && (
            <button
              type="button"
              onClick={action.onClick}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-hover"
            >
              {action.label}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ============================================================================
// Stat Grid
// ============================================================================

interface StatGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}

export function StatGrid({ children, columns = 4, className }: StatGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {children}
    </div>
  )
}
