/**
 * Investor Portal Pro Page
 *
 * Deal pipeline, team management, billing, and white-label branding.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Briefcase,
  Plus,
  Users,
  CreditCard,
  Palette,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Timeline, type TimelineItem } from '@/components/ui/timeline'
import { useInvestorPortalStore, selectDealStats } from '@/lib/store/investor-portal-store'
import type { Deal, DealStatus } from '@/types/investor-portal'

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string }> = {
  received: { label: 'Received', color: 'bg-gray-500' },
  in_review: { label: 'In Review', color: 'bg-blue-500' },
  assessment_in_progress: { label: 'Assessment', color: 'bg-amber-500' },
  pending_review: { label: 'Pending Review', color: 'bg-purple-500' },
  delivered: { label: 'Delivered', color: 'bg-green-500' },
  archived: { label: 'Archived', color: 'bg-gray-400' },
}

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', color: 'text-red-500 bg-red-500/10' },
  high: { label: 'High', color: 'text-orange-500 bg-orange-500/10' },
  normal: { label: 'Normal', color: 'text-blue-500 bg-blue-500/10' },
  low: { label: 'Low', color: 'text-gray-500 bg-gray-500/10' },
}

function DealCard({ deal }: { deal: Deal }) {
  const statusConfig = STATUS_CONFIG[deal.status]
  const priorityConfig = PRIORITY_CONFIG[deal.priority]

  return (
    <Link href={`/investor-portal/deals/${deal.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{deal.name}</h3>
              <Badge className={priorityConfig.color}>{priorityConfig.label}</Badge>
            </div>
            <p className="text-sm text-foreground-muted line-clamp-1 mb-2">
              {deal.technology}
            </p>
            <div className="flex items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {deal.documents.length} documents
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(deal.requestedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${statusConfig.color}`} />
              <span className="text-sm text-foreground">{statusConfig.label}</span>
            </div>
            {deal.dueDate && (
              <span className="text-xs text-foreground-muted">
                Due: {new Date(deal.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

function PipelineSummary() {
  const stats = selectDealStats()

  const pipelineStages = [
    { status: 'received', count: stats.received, label: 'Received' },
    { status: 'in_review', count: stats.inProgress, label: 'In Progress' },
    { status: 'pending_review', count: stats.pendingReview, label: 'Pending Review' },
    { status: 'delivered', count: stats.delivered, label: 'Delivered' },
  ]

  return (
    <Card>
      <h3 className="font-semibold text-foreground mb-4">Pipeline Overview</h3>
      <div className="flex items-center justify-between">
        {pipelineStages.map((stage, index) => (
          <React.Fragment key={stage.status}>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-foreground">{stage.count}</div>
              <div className="text-xs text-foreground-muted">{stage.label}</div>
            </div>
            {index < pipelineStages.length - 1 && (
              <div className="h-0.5 flex-1 mx-4 bg-border" />
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

export default function InvestorPortalPage() {
  const { deals, teamMembers, billingAccount, currentAccount } = useInvestorPortalStore()
  const stats = selectDealStats()
  const [activeTab, setActiveTab] = React.useState<'deals' | 'activity'>('deals')

  const recentDeals = deals.slice(0, 5)

  const recentActivity: TimelineItem[] = [
    {
      id: '1',
      title: 'Assessment Completed',
      description: 'Perovskite Solar Technology assessment delivered',
      timestamp: '2 hours ago',
      status: 'completed',
    },
    {
      id: '2',
      title: 'New Deal Submitted',
      description: 'Green Hydrogen Electrolyzer added to pipeline',
      timestamp: '5 hours ago',
      status: 'current',
    },
    {
      id: '3',
      title: 'Team Member Joined',
      description: 'Sarah Chen accepted invitation',
      timestamp: '1 day ago',
      status: 'completed',
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Briefcase}
        title="Investor Portal"
        description="Deal pipeline, team management, and analytics"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/investor-portal/settings">
              <Button variant="outline" leftIcon={<Palette className="h-4 w-4" />}>
                Branding
              </Button>
            </Link>
            <Link href="/investor-portal/deals/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                New Deal
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats */}
          <StatGrid columns={4}>
            <StatCard
              title="Total Deals"
              value={stats.total}
              icon={<Briefcase className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="In Progress"
              value={stats.inProgress}
              icon={<Clock className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Delivered"
              value={stats.delivered}
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              trend={{ value: 15, direction: 'up', label: 'this month' }}
            />
            <StatCard
              title="Team Members"
              value={teamMembers.filter((m) => m.status === 'active').length}
              icon={<Users className="h-5 w-5 text-blue-500" />}
            />
          </StatGrid>

          {/* Pipeline Summary */}
          <PipelineSummary />

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deals Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Recent Deals</h3>
                  <Link
                    href="/investor-portal/deals"
                    className="text-sm text-primary hover:text-primary-hover"
                  >
                    View All
                  </Link>
                </div>

                {recentDeals.length === 0 ? (
                  <EmptyState
                    title="No Deals Yet"
                    description="Submit your first deal to get started with assessments."
                    iconType="folder"
                    action={{
                      label: 'Submit Deal',
                      onClick: () => {},
                    }}
                    variant="compact"
                  />
                ) : (
                  <div className="space-y-4">
                    {recentDeals.map((deal) => (
                      <DealCard key={deal.id} deal={deal} />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                <Timeline items={recentActivity} variant="compact" />
              </Card>

              {/* Quick Links */}
              <Card>
                <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link href="/investor-portal/deals" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">Deal Pipeline</span>
                    </div>
                  </Link>
                  <Link href="/investor-portal/team" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-foreground">Team Management</span>
                    </div>
                  </Link>
                  <Link href="/investor-portal/billing" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                      <CreditCard className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-foreground">Billing & Usage</span>
                    </div>
                  </Link>
                  <Link href="/investor-portal/api" className="block">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-foreground">API Access</span>
                    </div>
                  </Link>
                </div>
              </Card>

              {/* Subscription Info */}
              {billingAccount && (
                <Card>
                  <h3 className="font-semibold text-foreground mb-3">Subscription</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Plan</span>
                      <Badge variant="secondary" className="capitalize">
                        {billingAccount.plan}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">Assessments</span>
                      <span className="text-sm text-foreground">
                        {billingAccount.usage.assessmentsThisPeriod} /{' '}
                        {billingAccount.usage.assessmentsLimit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground-muted">API Calls</span>
                      <span className="text-sm text-foreground">
                        {billingAccount.usage.apiCallsThisPeriod} /{' '}
                        {billingAccount.usage.apiCallsLimit}
                      </span>
                    </div>
                    <Link href="/investor-portal/billing">
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        Manage Subscription
                      </Button>
                    </Link>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
