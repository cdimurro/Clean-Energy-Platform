/**
 * Dashboard Page
 *
 * Clean Energy Technology Assessment Platform
 * AI-powered due diligence in 2 weeks, not 3 months
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Home,
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  TrendingUp,
  Shield,
  Lightbulb,
  BarChart3,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'

// Assessment status type
type AssessmentStatus = 'draft' | 'plan_review' | 'executing' | 'complete' | 'failed'

// Mock data for assessments (will be replaced with real data from store/API)
const mockAssessments = [
  {
    id: '1',
    title: 'Perovskite Solar Cells',
    description: 'Novel tandem cell architecture with 30% efficiency claims',
    status: 'complete' as AssessmentStatus,
    rating: 'promising',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: '2',
    title: 'Vanadium Flow Battery',
    description: 'Grid-scale storage with 20-year lifespan',
    status: 'plan_review' as AssessmentStatus,
    rating: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    title: 'Green Hydrogen Electrolyzer',
    description: 'PEM electrolyzer with novel catalyst reducing platinum usage',
    status: 'executing' as AssessmentStatus,
    rating: null,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const STATUS_CONFIG: Record<AssessmentStatus, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
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

const PLATFORM_FEATURES = [
  {
    icon: Target,
    title: 'Technology Deep Dive',
    description: 'Exhaustive research on the technology, competitive landscape, and core claims',
  },
  {
    icon: Shield,
    title: 'Claims Validation',
    description: 'Structured framework to validate claims with confidence levels',
  },
  {
    icon: BarChart3,
    title: 'Performance Simulation',
    description: 'Physics-based modeling under real-world conditions',
  },
  {
    icon: TrendingUp,
    title: 'Techno-Economic Analysis',
    description: 'Bottom-up financial model with LCOE, NPV, and IRR',
  },
  {
    icon: Lightbulb,
    title: 'Improvement Opportunities',
    description: 'AI-discovered optimizations and R&D directions',
  },
  {
    icon: FileText,
    title: 'Professional Report',
    description: '30-50 page investor-grade PDF with executive summary',
  },
]

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate stats
  const stats = {
    total: mockAssessments.length,
    complete: mockAssessments.filter(a => a.status === 'complete').length,
    inProgress: mockAssessments.filter(a => ['draft', 'plan_review', 'executing'].includes(a.status)).length,
  }

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <PageHeader
          icon={Home}
          title="Dashboard"
          description="Clean Energy Technology Assessment"
        />
        <div className="flex-1 overflow-auto p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-background-elevated rounded-xl" />
            <div className="h-64 bg-background-elevated rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Home}
        title="Dashboard"
        description="Clean Energy Technology Assessment"
        actions={
          <span className="text-sm text-foreground-muted hidden sm:block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        }
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Hero CTA */}
          <Card className="bg-gradient-to-br from-primary/10 via-background-elevated to-background-surface border-primary/20">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">
                  AI-Powered Technology Assessment
                </h2>
                <p className="text-foreground-muted">
                  Comprehensive due diligence in 2 weeks, not 3 months. Get investor-grade reports with validated claims and real-world performance analysis.
                </p>
              </div>
              <Link href="/assessments/new">
                <Button size="lg" className="shrink-0 gap-2">
                  <PlusCircle className="w-5 h-5" />
                  Start New Assessment
                </Button>
              </Link>
            </div>
          </Card>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-foreground">{stats.total}</div>
              <div className="text-sm text-foreground-muted">Total Assessments</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-green-500">{stats.complete}</div>
              <div className="text-sm text-foreground-muted">Completed</div>
            </Card>
            <Card className="text-center py-4">
              <div className="text-3xl font-bold text-blue-500">{stats.inProgress}</div>
              <div className="text-sm text-foreground-muted">In Progress</div>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Recent Assessments (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Recent Assessments</h3>
                  <Link
                    href="/assessments"
                    className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {mockAssessments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-foreground-subtle mx-auto mb-3" />
                    <p className="text-foreground-muted mb-4">No assessments yet</p>
                    <Link href="/assessments/new">
                      <Button variant="outline" size="sm">
                        Create Your First Assessment
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mockAssessments.map((assessment) => {
                      const statusConfig = STATUS_CONFIG[assessment.status]
                      const StatusIcon = statusConfig.icon
                      const ratingConfig = assessment.rating ? RATING_CONFIG[assessment.rating] : null

                      return (
                        <Link
                          key={assessment.id}
                          href={`/assessments/${assessment.id}`}
                          className="block p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors border border-border/50"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-foreground truncate">
                                  {assessment.title}
                                </h4>
                                {ratingConfig && (
                                  <Badge className={ratingConfig.color}>
                                    {ratingConfig.label}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-foreground-muted line-clamp-1">
                                {assessment.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </Badge>
                              <span className="text-xs text-foreground-subtle">
                                {formatRelativeTime(assessment.createdAt)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>

            {/* Right Column - What You Get */}
            <div className="space-y-6">
              <Card>
                <h3 className="font-semibold text-foreground mb-4">What You Get</h3>
                <div className="space-y-4">
                  {PLATFORM_FEATURES.map((feature) => {
                    const Icon = feature.icon
                    return (
                      <div key={feature.title} className="flex gap-3">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-foreground-muted">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Deliverables */}
              <Card>
                <h3 className="font-semibold text-foreground mb-3">Deliverables</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-foreground-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    30-50 page PDF report
                  </li>
                  <li className="flex items-center gap-2 text-foreground-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    2-page executive summary
                  </li>
                  <li className="flex items-center gap-2 text-foreground-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Claims validation matrix
                  </li>
                  <li className="flex items-center gap-2 text-foreground-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Full economic model (Excel)
                  </li>
                  <li className="flex items-center gap-2 text-foreground-muted">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Risk assessment matrix
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
