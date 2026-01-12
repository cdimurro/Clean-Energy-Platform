'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Circle, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export type TimelineItemStatus = 'completed' | 'current' | 'pending' | 'error' | 'warning'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp?: string
  status?: TimelineItemStatus
  icon?: React.ReactNode
  content?: React.ReactNode
  metadata?: Record<string, string | number>
}

export interface TimelineProps {
  items: TimelineItem[]
  variant?: 'default' | 'compact' | 'detailed'
  orientation?: 'vertical' | 'horizontal'
  showConnector?: boolean
  className?: string
}

// ============================================================================
// Status Icons
// ============================================================================

const statusIcons: Record<TimelineItemStatus, React.ReactNode> = {
  completed: <CheckCircle className="h-5 w-5" />,
  current: <Circle className="h-5 w-5 fill-current" />,
  pending: <Clock className="h-5 w-5" />,
  error: <XCircle className="h-5 w-5" />,
  warning: <AlertCircle className="h-5 w-5" />,
}

const statusColors: Record<TimelineItemStatus, string> = {
  completed: 'text-success border-success bg-success/10',
  current: 'text-primary border-primary bg-primary/10',
  pending: 'text-foreground-muted border-border bg-background-surface',
  error: 'text-error border-error bg-error/10',
  warning: 'text-warning border-warning bg-warning/10',
}

const connectorColors: Record<TimelineItemStatus, string> = {
  completed: 'bg-success',
  current: 'bg-primary',
  pending: 'bg-border',
  error: 'bg-error',
  warning: 'bg-warning',
}

// ============================================================================
// Timeline Item Component
// ============================================================================

interface TimelineItemComponentProps {
  item: TimelineItem
  isLast: boolean
  variant: 'default' | 'compact' | 'detailed'
  showConnector: boolean
}

function TimelineItemComponent({
  item,
  isLast,
  variant,
  showConnector,
}: TimelineItemComponentProps) {
  const status = item.status || 'pending'
  const icon = item.icon || statusIcons[status]

  if (variant === 'compact') {
    return (
      <div className="flex gap-3">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-full border',
              statusColors[status]
            )}
          >
            <div className="scale-75">{icon}</div>
          </div>
          {!isLast && showConnector && (
            <div
              className={cn('w-0.5 flex-1 min-h-4', connectorColors[status])}
            />
          )}
        </div>
        <div className="pb-4">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {item.timestamp && (
            <p className="text-xs text-foreground-muted">{item.timestamp}</p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full border-2',
              statusColors[status]
            )}
          >
            {icon}
          </div>
          {!isLast && showConnector && (
            <div
              className={cn('w-0.5 flex-1 min-h-8', connectorColors[status])}
            />
          )}
        </div>
        <div className="flex-1 pb-8">
          <div className="rounded-lg border border-border bg-card-background p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-foreground">{item.title}</p>
                {item.description && (
                  <p className="mt-1 text-sm text-foreground-muted">
                    {item.description}
                  </p>
                )}
              </div>
              {item.timestamp && (
                <span className="text-xs text-foreground-muted whitespace-nowrap">
                  {item.timestamp}
                </span>
              )}
            </div>
            {item.content && <div className="mt-3">{item.content}</div>}
            {item.metadata && Object.keys(item.metadata).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {Object.entries(item.metadata).map(([key, value]) => (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 rounded-full bg-background-surface px-2 py-0.5 text-xs"
                  >
                    <span className="text-foreground-muted">{key}:</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            statusColors[status]
          )}
        >
          {icon}
        </div>
        {!isLast && showConnector && (
          <div className={cn('w-0.5 flex-1 min-h-6', connectorColors[status])} />
        )}
      </div>
      <div className="flex-1 pb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-foreground">{item.title}</p>
            {item.description && (
              <p className="mt-1 text-sm text-foreground-muted">
                {item.description}
              </p>
            )}
          </div>
          {item.timestamp && (
            <span className="text-xs text-foreground-muted">{item.timestamp}</span>
          )}
        </div>
        {item.content && <div className="mt-2">{item.content}</div>}
      </div>
    </div>
  )
}

// ============================================================================
// Horizontal Timeline Item
// ============================================================================

interface HorizontalTimelineItemProps {
  item: TimelineItem
  isLast: boolean
  showConnector: boolean
}

function HorizontalTimelineItem({
  item,
  isLast,
  showConnector,
}: HorizontalTimelineItemProps) {
  const status = item.status || 'pending'
  const icon = item.icon || statusIcons[status]

  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex w-full items-center">
        {showConnector && (
          <div
            className={cn(
              'h-0.5 flex-1',
              status === 'pending' ? 'bg-border' : connectorColors[status]
            )}
          />
        )}
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border-2 flex-shrink-0',
            statusColors[status]
          )}
        >
          {icon}
        </div>
        {!isLast && showConnector && (
          <div
            className={cn(
              'h-0.5 flex-1',
              status === 'completed' ? connectorColors[status] : 'bg-border'
            )}
          />
        )}
      </div>
      <div className="mt-3 text-center max-w-32">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.timestamp && (
          <p className="mt-1 text-xs text-foreground-muted">{item.timestamp}</p>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Main Timeline Component
// ============================================================================

export function Timeline({
  items,
  variant = 'default',
  orientation = 'vertical',
  showConnector = true,
  className,
}: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={cn('flex items-start', className)}>
        {items.map((item, index) => (
          <HorizontalTimelineItem
            key={item.id}
            item={item}
            isLast={index === items.length - 1}
            showConnector={showConnector}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item, index) => (
        <TimelineItemComponent
          key={item.id}
          item={item}
          isLast={index === items.length - 1}
          variant={variant}
          showConnector={showConnector}
        />
      ))}
    </div>
  )
}

// ============================================================================
// Activity Feed (Specialized Timeline)
// ============================================================================

export interface ActivityFeedItem {
  id: string
  actor: {
    name: string
    avatar?: string
  }
  action: string
  target?: string
  timestamp: string
  icon?: React.ReactNode
  iconColor?: string
}

interface ActivityFeedProps {
  items: ActivityFeedItem[]
  className?: string
  maxItems?: number
}

export function ActivityFeed({ items, className, maxItems }: ActivityFeedProps) {
  const displayItems = maxItems ? items.slice(0, maxItems) : items

  return (
    <div className={cn('space-y-4', className)}>
      {displayItems.map((item) => (
        <div key={item.id} className="flex gap-3">
          {item.icon ? (
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                item.iconColor || 'bg-background-surface text-foreground-muted'
              )}
            >
              {item.icon}
            </div>
          ) : item.actor.avatar ? (
            <img
              src={item.actor.avatar}
              alt={item.actor.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
              {item.actor.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium text-foreground">
                {item.actor.name}
              </span>{' '}
              <span className="text-foreground-muted">{item.action}</span>
              {item.target && (
                <>
                  {' '}
                  <span className="font-medium text-foreground">
                    {item.target}
                  </span>
                </>
              )}
            </p>
            <p className="text-xs text-foreground-muted">{item.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
