/**
 * TRL Assessment Pro Page
 *
 * NASA TRL framework with multi-reviewer workflow, evidence collection,
 * and historical tracking.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Gauge,
  Plus,
  Search,
  Filter,
  ArrowRight,
  Users,
  FileText,
  History,
  Target,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useTRLStore, selectTRLStats } from '@/lib/store/trl-store'
import type { TRLAssessment, TRLAssessmentStatus, TRLDomain } from '@/types/trl'

const STATUS_CONFIG: Record<TRLAssessmentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-500' },
  'evidence-collection': { label: 'Evidence Collection', color: 'bg-blue-500/10 text-blue-500' },
  'under-review': { label: 'Under Review', color: 'bg-amber-500/10 text-amber-500' },
  'consensus-building': { label: 'Consensus', color: 'bg-purple-500/10 text-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
  archived: { label: 'Archived', color: 'bg-gray-400/10 text-gray-400' },
}

const DOMAIN_LABELS: Record<TRLDomain, string> = {
  aerospace: 'Aerospace',
  energy: 'Energy',
  biotech: 'Biotech',
  materials: 'Materials',
  industrial: 'Industrial',
  software: 'Software',
  'clean-tech': 'Clean Tech',
  hardware: 'Hardware',
}

function TRLGauge({ level, sublevel }: { level: number; sublevel?: string }) {
  const percentage = ((level - 1 + (sublevel === 'b' ? 0.33 : sublevel === 'c' ? 0.66 : 0)) / 9) * 100

  return (
    <div className="relative h-2 w-24 rounded-full bg-background-surface overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all"
        style={{ width: `${percentage}%` }}
      />
      <span className="absolute right-0 -top-5 text-xs font-semibold text-foreground">
        TRL {level}
        {sublevel}
      </span>
    </div>
  )
}

function AssessmentCard({ assessment }: { assessment: TRLAssessment }) {
  const status = STATUS_CONFIG[assessment.status]

  return (
    <Link href={`/trl-assessment/${assessment.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">
                {assessment.technologyName}
              </h3>
              <Badge className={status.color}>{status.label}</Badge>
            </div>
            <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
              {assessment.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {DOMAIN_LABELS[assessment.domain]}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {assessment.reviewSessions.length} reviews
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {assessment.evidence.length} evidence
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {assessment.currentScore ? (
              <TRLGauge
                level={assessment.currentScore.level}
                sublevel={assessment.currentScore.sublevel}
              />
            ) : (
              <span className="text-xs text-foreground-muted">Not scored</span>
            )}
            <span className="text-xs text-foreground-muted">
              Target: TRL {assessment.targetTRL}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default function TRLAssessmentPage() {
  const { assessments, createAssessment } = useTRLStore()
  const stats = selectTRLStats()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<TRLAssessmentStatus | 'all'>('all')

  const filteredAssessments = React.useMemo(() => {
    return assessments.filter((a) => {
      const matchesSearch =
        searchQuery === '' ||
        a.technologyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [assessments, searchQuery, statusFilter])

  const handleCreateNew = () => {
    createAssessment(
      'New Technology Assessment',
      'Describe the technology being assessed',
      'clean-tech',
      6
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Gauge}
        title="TRL Assessment Pro"
        description="NASA TRL framework with multi-reviewer workflow"
        actions={
          <Link href="/trl-assessment/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              New Assessment
            </Button>
          </Link>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <StatGrid columns={4}>
            <StatCard
              title="Total Assessments"
              value={stats.total}
              icon={<Gauge className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Under Review"
              value={stats.underReview}
              icon={<Users className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Completed"
              value={stats.completed}
              icon={<FileText className="h-5 w-5 text-green-500" />}
            />
            <StatCard
              title="Average TRL"
              value={stats.averageTRL.toFixed(1)}
              icon={<Target className="h-5 w-5 text-blue-500" />}
            />
          </StatGrid>

          {/* Filters */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
                <input
                  type="text"
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-foreground-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TRLAssessmentStatus | 'all')}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Status</option>
                  {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Assessments List */}
          {filteredAssessments.length === 0 ? (
            <EmptyState
              title="No TRL Assessments"
              description="Start by creating your first TRL assessment to evaluate technology readiness."
              iconType="folder"
              action={{
                label: 'Create Assessment',
                onClick: handleCreateNew,
              }}
              variant="card"
            />
          ) : (
            <div className="space-y-4">
              {filteredAssessments.map((assessment) => (
                <AssessmentCard key={assessment.id} assessment={assessment} />
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/trl-assessment/new" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">New Assessment</p>
                    <p className="text-xs text-foreground-muted">Start from scratch</p>
                  </div>
                </div>
              </Link>
              <Link href="/trl-assessment/reviewers" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Manage Reviewers</p>
                    <p className="text-xs text-foreground-muted">Add or edit reviewers</p>
                  </div>
                </div>
              </Link>
              <Link href="/trl-assessment/benchmarks" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <History className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">View Benchmarks</p>
                    <p className="text-xs text-foreground-muted">Industry comparisons</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
