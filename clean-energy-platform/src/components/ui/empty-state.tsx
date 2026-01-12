'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { FolderOpen, Search, FileQuestion, Plus, RefreshCw } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  iconType?: 'folder' | 'search' | 'file' | 'custom'
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
    variant?: 'primary' | 'secondary' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  variant?: 'default' | 'card' | 'compact' | 'illustration'
  className?: string
  children?: React.ReactNode
}

// ============================================================================
// Default Icons
// ============================================================================

const defaultIcons = {
  folder: <FolderOpen className="h-12 w-12" />,
  search: <Search className="h-12 w-12" />,
  file: <FileQuestion className="h-12 w-12" />,
  custom: null,
}

// ============================================================================
// Main EmptyState Component
// ============================================================================

export function EmptyState({
  title,
  description,
  icon,
  iconType = 'folder',
  action,
  secondaryAction,
  variant = 'default',
  className,
  children,
}: EmptyStateProps) {
  const IconComponent = icon || defaultIcons[iconType]

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-8 text-center',
          className
        )}
      >
        {IconComponent && (
          <div className="text-foreground-muted/50">{IconComponent}</div>
        )}
        <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-xs text-foreground-muted">{description}</p>
        )}
        {action && (
          <Button
            variant={action.variant || 'primary'}
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
            className="mt-4"
          >
            {action.label}
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border bg-card-background/50 p-8',
          className
        )}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {IconComponent && (
            <div className="rounded-full bg-background-surface p-4 text-foreground-muted">
              {IconComponent}
            </div>
          )}
          <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="mt-2 max-w-sm text-sm text-foreground-muted">
              {description}
            </p>
          )}
          {children}
          <div className="mt-6 flex items-center gap-3">
            {action && (
              <Button
                variant={action.variant || 'primary'}
                onClick={action.onClick}
                leftIcon={action.icon || <Plus className="h-4 w-4" />}
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="ghost" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'illustration') {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center py-16 text-center',
          className
        )}
      >
        {IconComponent && (
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-primary/5" />
            <div className="relative rounded-full bg-background-surface p-6 text-primary">
              {IconComponent}
            </div>
          </div>
        )}
        <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="mt-2 max-w-md text-sm text-foreground-muted">
            {description}
          </p>
        )}
        {children}
        <div className="mt-8 flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
              leftIcon={action.icon || <Plus className="h-4 w-4" />}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 text-center',
        className
      )}
    >
      {IconComponent && (
        <div className="text-foreground-muted/40">{IconComponent}</div>
      )}
      <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-foreground-muted">
          {description}
        </p>
      )}
      {children}
      <div className="mt-6 flex items-center gap-3">
        {action && (
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            leftIcon={action.icon || <Plus className="h-4 w-4" />}
          >
            {action.label}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Preset Empty States
// ============================================================================

interface PresetEmptyStateProps {
  onAction?: () => void
  className?: string
}

export function NoResultsEmptyState({ onAction, className }: PresetEmptyStateProps) {
  return (
    <EmptyState
      title="No results found"
      description="Try adjusting your search or filter criteria to find what you're looking for."
      iconType="search"
      action={
        onAction
          ? {
              label: 'Clear filters',
              onClick: onAction,
              icon: <RefreshCw className="h-4 w-4" />,
              variant: 'outline',
            }
          : undefined
      }
      variant="compact"
      className={className}
    />
  )
}

export function NoDataEmptyState({
  title = 'No data yet',
  description = 'Get started by creating your first item.',
  actionLabel = 'Create new',
  onAction,
  className,
}: PresetEmptyStateProps & {
  title?: string
  description?: string
  actionLabel?: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      iconType="folder"
      action={
        onAction
          ? {
              label: actionLabel,
              onClick: onAction,
            }
          : undefined
      }
      variant="card"
      className={className}
    />
  )
}

export function ErrorEmptyState({
  title = 'Something went wrong',
  description = 'We encountered an error loading this content. Please try again.',
  onAction,
  className,
}: PresetEmptyStateProps & {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      iconType="file"
      action={
        onAction
          ? {
              label: 'Try again',
              onClick: onAction,
              icon: <RefreshCw className="h-4 w-4" />,
              variant: 'outline',
            }
          : undefined
      }
      variant="default"
      className={className}
    />
  )
}
