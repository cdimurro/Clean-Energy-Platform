'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

// ============================================================================
// Types
// ============================================================================

export interface KanbanColumn<T> {
  id: string
  title: string
  items: T[]
  color?: string
  maxItems?: number
}

export interface KanbanProps<T extends { id: string }> {
  columns: KanbanColumn<T>[]
  onDragEnd: (
    itemId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newIndex: number
  ) => void
  renderCard: (item: T, isDragging: boolean) => React.ReactNode
  renderColumnHeader?: (column: KanbanColumn<T>) => React.ReactNode
  renderColumnFooter?: (column: KanbanColumn<T>) => React.ReactNode
  className?: string
  columnClassName?: string
  cardClassName?: string
  emptyColumnMessage?: string
}

// ============================================================================
// Sortable Card
// ============================================================================

interface SortableCardProps {
  id: string
  children: React.ReactNode
  className?: string
}

function SortableCard({ id, children, className }: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative',
        isDragging && 'opacity-50',
        className
      )}
      {...attributes}
    >
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100"
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-foreground-muted" />
      </div>
      {children}
    </div>
  )
}

// ============================================================================
// Kanban Column
// ============================================================================

interface KanbanColumnComponentProps<T extends { id: string }> {
  column: KanbanColumn<T>
  renderCard: (item: T, isDragging: boolean) => React.ReactNode
  renderColumnHeader?: (column: KanbanColumn<T>) => React.ReactNode
  renderColumnFooter?: (column: KanbanColumn<T>) => React.ReactNode
  className?: string
  cardClassName?: string
  emptyMessage?: string
}

function KanbanColumnComponent<T extends { id: string }>({
  column,
  renderCard,
  renderColumnHeader,
  renderColumnFooter,
  className,
  cardClassName,
  emptyMessage = 'No items',
}: KanbanColumnComponentProps<T>) {
  const itemIds = column.items.map((item) => item.id)

  return (
    <div
      className={cn(
        'flex w-80 flex-shrink-0 flex-col rounded-xl bg-background-surface border border-border',
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        {renderColumnHeader ? (
          renderColumnHeader(column)
        ) : (
          <div className="flex items-center gap-2">
            {column.color && (
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
            )}
            <h3 className="font-medium text-foreground">{column.title}</h3>
            <span className="rounded-full bg-background px-2 py-0.5 text-xs text-foreground-muted">
              {column.items.length}
              {column.maxItems && ` / ${column.maxItems}`}
            </span>
          </div>
        )}
      </div>

      {/* Column Content */}
      <div className="flex-1 overflow-y-auto p-2">
        <SortableContext
          items={itemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-2">
            {column.items.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-sm text-foreground-muted">
                {emptyMessage}
              </div>
            ) : (
              column.items.map((item) => (
                <SortableCard
                  key={item.id}
                  id={item.id}
                  className={cardClassName}
                >
                  {renderCard(item, false)}
                </SortableCard>
              ))
            )}
          </div>
        </SortableContext>
      </div>

      {/* Column Footer */}
      {renderColumnFooter && (
        <div className="border-t border-border px-4 py-3">
          {renderColumnFooter(column)}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main Kanban Component
// ============================================================================

export function Kanban<T extends { id: string }>({
  columns,
  onDragEnd,
  renderCard,
  renderColumnHeader,
  renderColumnFooter,
  className,
  columnClassName,
  cardClassName,
  emptyColumnMessage,
}: KanbanProps<T>) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [activeItem, setActiveItem] = React.useState<T | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const findColumnByItemId = (itemId: string): KanbanColumn<T> | undefined => {
    return columns.find((col) => col.items.some((item) => item.id === itemId))
  }

  const findItemById = (itemId: string): T | undefined => {
    for (const column of columns) {
      const item = column.items.find((i) => i.id === itemId)
      if (item) return item
    }
    return undefined
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const item = findItemById(active.id as string)
    setActiveItem(item || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over for cross-column movement
    // This is handled in onDragEnd for simplicity
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    setActiveItem(null)

    if (!over) return

    const activeItemId = active.id as string
    const overId = over.id as string

    const sourceColumn = findColumnByItemId(activeItemId)
    if (!sourceColumn) return

    // Check if dropped over a column or an item
    const targetColumn = columns.find((col) => col.id === overId) || findColumnByItemId(overId)
    if (!targetColumn) return

    // Calculate new index
    let newIndex = 0
    if (overId !== targetColumn.id) {
      // Dropped over an item
      const overIndex = targetColumn.items.findIndex((item) => item.id === overId)
      newIndex = overIndex >= 0 ? overIndex : targetColumn.items.length
    } else {
      // Dropped directly on column
      newIndex = targetColumn.items.length
    }

    onDragEnd(activeItemId, sourceColumn.id, targetColumn.id, newIndex)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          'flex gap-4 overflow-x-auto pb-4',
          className
        )}
      >
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            renderCard={renderCard}
            renderColumnHeader={renderColumnHeader}
            renderColumnFooter={renderColumnFooter}
            className={columnClassName}
            cardClassName={cardClassName}
            emptyMessage={emptyColumnMessage}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId && activeItem ? (
          <div className="rotate-3 scale-105 shadow-lg">
            {renderCard(activeItem, true)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

// ============================================================================
// Kanban Card (Base styling)
// ============================================================================

export interface KanbanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean
  priority?: 'urgent' | 'high' | 'normal' | 'low'
}

export const KanbanCard = React.forwardRef<HTMLDivElement, KanbanCardProps>(
  ({ className, selected, priority, children, ...props }, ref) => {
    const priorityColors = {
      urgent: 'border-l-4 border-l-error',
      high: 'border-l-4 border-l-warning',
      normal: '',
      low: 'border-l-4 border-l-foreground-muted',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg bg-card-background border border-border p-3 pl-4 shadow-sm transition-all hover:border-border-subtle hover:shadow-md',
          selected && 'ring-2 ring-primary',
          priority && priorityColors[priority],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
KanbanCard.displayName = 'KanbanCard'
