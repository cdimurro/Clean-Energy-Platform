/**
 * Deal Pipeline Component
 *
 * Displays investor deal pipeline with status tracking,
 * filtering, and quick actions for due diligence assessments.
 *
 * Phase 5 of investor due diligence market enhancement
 */

'use client'

import { useState, useMemo } from 'react'
import type {
  Deal,
  DealStatus,
  AssessmentType,
} from '@/types/investor-portal'

// ============================================================================
// Types
// ============================================================================

interface DealPipelineProps {
  deals: Deal[]
  onDealClick?: (deal: Deal) => void
  onStatusChange?: (dealId: string, newStatus: DealStatus) => void
  onNewDeal?: () => void
  showFilters?: boolean
  compactMode?: boolean
}

interface FilterState {
  status: DealStatus | 'all'
  type: AssessmentType | 'all'
  priority: 'all' | 'urgent' | 'high' | 'normal' | 'low'
  search: string
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<
  DealStatus,
  { label: string; color: string; bgColor: string; icon: string }
> = {
  received: {
    label: 'Received',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: 'inbox',
  },
  in_review: {
    label: 'In Review',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'eye',
  },
  assessment_in_progress: {
    label: 'Assessment',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: 'cog',
  },
  pending_review: {
    label: 'Pending Review',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'check',
  },
  delivered: {
    label: 'Delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'check-circle',
  },
  archived: {
    label: 'Archived',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    icon: 'archive',
  },
}

const TYPE_CONFIG: Record<AssessmentType, { label: string; color: string }> = {
  'quick-trl': { label: 'Quick TRL', color: 'text-blue-600' },
  'physics-validation': { label: 'Physics Validation', color: 'text-purple-600' },
  'climate-diligence': { label: 'Climate Diligence', color: 'text-green-600' },
  custom: { label: 'Custom', color: 'text-gray-600' },
}

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgent', color: 'text-red-600' },
  high: { label: 'High', color: 'text-orange-600' },
  normal: { label: 'Normal', color: 'text-gray-600' },
  low: { label: 'Low', color: 'text-gray-400' },
}

// ============================================================================
// Component
// ============================================================================

export function DealPipeline({
  deals,
  onDealClick,
  onStatusChange,
  onNewDeal,
  showFilters = true,
  compactMode = false,
}: DealPipelineProps) {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: '',
  })

  const [sortField, setSortField] = useState<'requestedAt' | 'dueDate' | 'name'>('requestedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    let result = [...deals]

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter((d) => d.status === filters.status)
    }
    if (filters.type !== 'all') {
      result = result.filter((d) => d.assessmentType === filters.type)
    }
    if (filters.priority !== 'all') {
      result = result.filter((d) => d.priority === filters.priority)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.technology.toLowerCase().includes(search)
      )
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: string | undefined
      let bVal: string | undefined

      if (sortField === 'requestedAt') {
        aVal = a.requestedAt
        bVal = b.requestedAt
      } else if (sortField === 'dueDate') {
        aVal = a.dueDate
        bVal = b.dueDate
      } else {
        aVal = a.name
        bVal = b.name
      }

      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      const comparison = aVal.localeCompare(bVal)
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [deals, filters, sortField, sortDirection])

  // Status counts for summary
  const statusCounts = useMemo(() => {
    const counts: Record<DealStatus, number> = {
      received: 0,
      in_review: 0,
      assessment_in_progress: 0,
      pending_review: 0,
      delivered: 0,
      archived: 0,
    }
    for (const deal of deals) {
      counts[deal.status]++
    }
    return counts
  }, [deals])

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getDaysUntilDue = (dueDate?: string) => {
    if (!dueDate) return null
    const due = new Date(dueDate)
    const now = new Date()
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Deal Pipeline</h2>
          <p className="text-sm text-gray-500">
            {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
            {filters.status !== 'all' && ` (${STATUS_CONFIG[filters.status].label})`}
          </p>
        </div>
        {onNewDeal && (
          <button
            onClick={onNewDeal}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Assessment
          </button>
        )}
      </div>

      {/* Status Summary */}
      {!compactMode && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {(Object.keys(STATUS_CONFIG) as DealStatus[]).map((status) => (
            <button
              key={status}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  status: f.status === status ? 'all' : status,
                }))
              }
              className={`p-3 rounded-lg border ${
                filters.status === status
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              } ${STATUS_CONFIG[status].bgColor}`}
            >
              <div className={`text-2xl font-bold ${STATUS_CONFIG[status].color}`}>
                {statusCounts[status]}
              </div>
              <div className="text-xs text-gray-600">{STATUS_CONFIG[status].label}</div>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap gap-3 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Search deals..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filters.type}
            onChange={(e) =>
              setFilters((f) => ({ ...f, type: e.target.value as AssessmentType | 'all' }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            {(Object.keys(TYPE_CONFIG) as AssessmentType[]).map((type) => (
              <option key={type} value={type}>
                {TYPE_CONFIG[type].label}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                priority: e.target.value as FilterState['priority'],
              }))
            }
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priorities</option>
            {Object.keys(PRIORITY_CONFIG).map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_CONFIG[priority].label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Deal List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <button
            onClick={() => handleSort('name')}
            className="col-span-4 text-left hover:text-gray-700 flex items-center gap-1"
          >
            Deal
            {sortField === 'name' && (
              <span>{sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>
            )}
          </button>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <button
            onClick={() => handleSort('requestedAt')}
            className="col-span-2 text-left hover:text-gray-700 flex items-center gap-1"
          >
            Requested
            {sortField === 'requestedAt' && (
              <span>{sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>
            )}
          </button>
          <button
            onClick={() => handleSort('dueDate')}
            className="col-span-2 text-left hover:text-gray-700 flex items-center gap-1"
          >
            Due
            {sortField === 'dueDate' && (
              <span>{sortDirection === 'asc' ? '\u2191' : '\u2193'}</span>
            )}
          </button>
        </div>

        {/* Deal Rows */}
        {filteredDeals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {deals.length === 0
              ? 'No deals yet. Create your first assessment.'
              : 'No deals match the current filters.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDeals.map((deal) => {
              const daysUntilDue = getDaysUntilDue(deal.dueDate)
              const isOverdue = daysUntilDue !== null && daysUntilDue < 0
              const isDueSoon = daysUntilDue !== null && daysUntilDue <= 2 && daysUntilDue >= 0

              return (
                <div
                  key={deal.id}
                  onClick={() => onDealClick?.(deal)}
                  className="grid grid-cols-12 gap-4 px-4 py-4 hover:bg-gray-50 cursor-pointer items-center"
                >
                  {/* Deal Name & Technology */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${PRIORITY_CONFIG[deal.priority].color}`}>
                        {deal.priority === 'urgent' && '\u25CF'}
                        {deal.priority === 'high' && '\u25CB'}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{deal.name}</div>
                        <div className="text-sm text-gray-500">{deal.technology}</div>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2">
                    <span className={`text-sm ${TYPE_CONFIG[deal.assessmentType].color}`}>
                      {TYPE_CONFIG[deal.assessmentType].label}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[deal.status].bgColor} ${STATUS_CONFIG[deal.status].color}`}
                    >
                      {STATUS_CONFIG[deal.status].label}
                    </span>
                  </div>

                  {/* Requested Date */}
                  <div className="col-span-2 text-sm text-gray-500">
                    {formatDate(deal.requestedAt)}
                  </div>

                  {/* Due Date */}
                  <div className="col-span-2">
                    {deal.dueDate ? (
                      <span
                        className={`text-sm ${
                          isOverdue
                            ? 'text-red-600 font-medium'
                            : isDueSoon
                              ? 'text-amber-600 font-medium'
                              : 'text-gray-500'
                        }`}
                      >
                        {isOverdue && 'Overdue: '}
                        {isDueSoon && !isOverdue && 'Due: '}
                        {formatDate(deal.dueDate)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">--</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DealPipeline
