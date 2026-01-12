'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Loader2,
} from 'lucide-react'
import { Button } from './button'

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  key: string
  header: string | React.ReactNode
  accessor: (row: T) => React.ReactNode
  sortable?: boolean
  sortKey?: string
  width?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  headerClassName?: string
}

export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  key: string
  direction: SortDirection
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (row: T) => string
  // Sorting
  sortable?: boolean
  sortState?: SortState
  onSort?: (sortState: SortState) => void
  // Pagination
  pagination?: PaginationState
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
  // Selection
  selectable?: boolean
  selectedKeys?: Set<string>
  onSelectionChange?: (selectedKeys: Set<string>) => void
  // Search
  searchable?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  // Loading & Empty states
  loading?: boolean
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  // Styling
  className?: string
  headerClassName?: string
  rowClassName?: string | ((row: T, index: number) => string)
  // Row actions
  onRowClick?: (row: T) => void
  rowHover?: boolean
  // Expandable rows
  expandable?: boolean
  renderExpandedRow?: (row: T) => React.ReactNode
  expandedKeys?: Set<string>
  onExpandChange?: (expandedKeys: Set<string>) => void
}

// ============================================================================
// Sort Header
// ============================================================================

interface SortHeaderProps {
  children: React.ReactNode
  sortable?: boolean
  sortDirection: SortDirection
  onSort: () => void
  className?: string
}

function SortHeader({
  children,
  sortable,
  sortDirection,
  onSort,
  className,
}: SortHeaderProps) {
  if (!sortable) {
    return <>{children}</>
  }

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-1 hover:text-foreground transition-colors',
        className
      )}
      onClick={onSort}
    >
      {children}
      {sortDirection === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : sortDirection === 'desc' ? (
        <ChevronDown className="h-4 w-4" />
      ) : (
        <ChevronsUpDown className="h-4 w-4 opacity-50" />
      )}
    </button>
  )
}

// ============================================================================
// Pagination
// ============================================================================

interface PaginationControlsProps {
  pagination: PaginationState
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
}: PaginationControlsProps) {
  const { page, pageSize, total } = pagination
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3">
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-foreground-muted">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
        <span className="text-sm text-foreground-muted">
          {total === 0 ? '0 items' : `${startItem}-${endItem} of ${total}`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {generatePageNumbers(page, totalPages).map((pageNum, idx) =>
            pageNum === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 text-foreground-muted"
              >
                ...
              </span>
            ) : (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum as number)}
                className={cn(
                  'h-8 w-8 rounded-md text-sm transition-colors',
                  page === pageNum
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-background-surface text-foreground-muted hover:text-foreground'
                )}
              >
                {pageNum}
              </button>
            )
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function generatePageNumbers(
  current: number,
  total: number
): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | '...')[] = []

  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total)
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total)
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total)
  }

  return pages
}

// ============================================================================
// Main DataTable Component
// ============================================================================

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  sortable = false,
  sortState,
  onSort,
  pagination,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions,
  selectable = false,
  selectedKeys = new Set(),
  onSelectionChange,
  searchable = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  loading = false,
  emptyMessage = 'No data found',
  emptyIcon,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  rowHover = true,
  expandable = false,
  renderExpandedRow,
  expandedKeys = new Set(),
  onExpandChange,
}: DataTableProps<T>) {
  const allKeys = data.map(keyExtractor)
  const allSelected = allKeys.length > 0 && allKeys.every((key) => selectedKeys.has(key))
  const someSelected = allKeys.some((key) => selectedKeys.has(key))

  const handleSelectAll = () => {
    if (!onSelectionChange) return

    if (allSelected) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(allKeys))
    }
  }

  const handleSelectRow = (key: string) => {
    if (!onSelectionChange) return

    const newSelected = new Set(selectedKeys)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    onSelectionChange(newSelected)
  }

  const handleSort = (key: string) => {
    if (!onSort) return

    let newDirection: SortDirection = 'asc'
    if (sortState?.key === key) {
      if (sortState.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortState.direction === 'desc') {
        newDirection = null
      }
    }

    onSort({ key, direction: newDirection })
  }

  const handleExpand = (key: string) => {
    if (!onExpandChange) return

    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    onExpandChange(newExpanded)
  }

  const getRowClassName = (row: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index)
    }
    return rowClassName || ''
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card-background overflow-hidden', className)}>
      {/* Search */}
      {searchable && (
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className={cn('bg-background-surface', headerClassName)}>
            <tr>
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected && !allSelected
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
              )}
              {expandable && <th className="w-12 px-4 py-3" />}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-foreground-muted',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right',
                    column.headerClassName
                  )}
                  style={{ width: column.width }}
                >
                  <SortHeader
                    sortable={sortable && column.sortable}
                    sortDirection={
                      sortState?.key === (column.sortKey || column.key)
                        ? sortState.direction
                        : null
                    }
                    onSort={() => handleSort(column.sortKey || column.key)}
                  >
                    {column.header}
                  </SortHeader>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex items-center justify-center gap-2 text-foreground-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2 text-foreground-muted">
                    {emptyIcon}
                    <span>{emptyMessage}</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row)
                const isExpanded = expandedKeys.has(key)

                return (
                  <React.Fragment key={key}>
                    <tr
                      className={cn(
                        'transition-colors',
                        rowHover && 'hover:bg-background-surface',
                        onRowClick && 'cursor-pointer',
                        selectedKeys.has(key) && 'bg-primary/5',
                        getRowClassName(row, index)
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedKeys.has(key)}
                            onChange={() => handleSelectRow(key)}
                            className="h-4 w-4 rounded border-border"
                          />
                        </td>
                      )}
                      {expandable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleExpand(key)}
                            className="text-foreground-muted hover:text-foreground"
                          >
                            <ChevronRight
                              className={cn(
                                'h-4 w-4 transition-transform',
                                isExpanded && 'rotate-90'
                              )}
                            />
                          </button>
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-4 py-3 text-sm',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right',
                            column.className
                          )}
                        >
                          {column.accessor(row)}
                        </td>
                      ))}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow && (
                      <tr>
                        <td
                          colSpan={columns.length + (selectable ? 1 : 0) + 1}
                          className="bg-background-surface px-4 py-4"
                        >
                          {renderExpandedRow(row)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && (
        <PaginationControls
          pagination={pagination}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={pageSizeOptions}
        />
      )}
    </div>
  )
}
