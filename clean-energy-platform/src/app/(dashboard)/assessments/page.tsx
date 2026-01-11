/**
 * Assessments List Page
 *
 * Shows all assessments with filtering and sorting
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ClipboardList,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Zap,
  Search,
  Filter,
} from 'lucide-react'
import { Card, Button, Badge, Input } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { useAssessmentStore, useHydration, type AssessmentStatus } from '@/lib/store'

const STATUS_CONFIG: Record<AssessmentStatus | 'plan_generating', { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
  plan_generating: { label: 'Generating Plan', color: 'bg-amber-500', icon: Clock },
  plan_review: { label: 'Plan Review', color: 'bg-amber-500', icon: Clock },
  executing: { label: 'In Progress', color: 'bg-blue-500', icon: Zap },
  complete: { label: 'Complete', color: 'bg-green-500', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-500', icon: AlertCircle },
}

const RATING_CONFIG: Record<string, { label: string; color: string }> = {
  promising: { label: 'Promising', color: 'text-green-500 bg-green-500/10' },
  conditional: { label: 'Conditional', color: 'text-amber-500 bg-amber-500/10' },
  concerning: { label: 'Concerning', color: 'text-red-500 bg-red-500/10' },
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AssessmentsPage() {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<AssessmentStatus | 'all'>('all')

  // Get assessments from store
  const assessments = useAssessmentStore((state) => state.assessments)
  const isHydrated = useHydration()

  // Wait for hydration before rendering
  if (!isHydrated) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Zap className="w-8 h-8 text-foreground-muted animate-pulse" />
        <p className="mt-2 text-sm text-foreground-muted">Loading...</p>
      </div>
    )
  }

  // Filter assessments
  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={ClipboardList}
        title="Assessments"
        description="All technology assessments"
        actions={
          <Link href="/assessments/new">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Assessment
            </Button>
          </Link>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Filters */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
                <Input
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-foreground-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AssessmentStatus | 'all')}
                  className="px-3 py-2 rounded-lg bg-background-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="plan_review">Plan Review</option>
                  <option value="executing">In Progress</option>
                  <option value="complete">Complete</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Assessments List */}
          {filteredAssessments.length === 0 ? (
            <Card className="text-center py-12">
              <FileText className="w-12 h-12 text-foreground-subtle mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-1">No assessments found</h3>
              <p className="text-foreground-muted mb-4">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Create your first technology assessment'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Link href="/assessments/new">
                  <Button>Create Assessment</Button>
                </Link>
              )}
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAssessments.map((assessment) => {
                const statusConfig = STATUS_CONFIG[assessment.status]
                const StatusIcon = statusConfig.icon
                const ratingConfig = assessment.rating ? RATING_CONFIG[assessment.rating] : null

                return (
                  <Link
                    key={assessment.id}
                    href={`/assessments/${assessment.id}`}
                    className="block"
                  >
                    <Card className="hover:bg-background-hover transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate">
                              {assessment.title}
                            </h3>
                            {ratingConfig && (
                              <Badge className={ratingConfig.color}>
                                {ratingConfig.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-foreground-muted line-clamp-2">
                            {assessment.description}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                          <span className="text-xs text-foreground-subtle">
                            {formatDate(assessment.createdAt)}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
