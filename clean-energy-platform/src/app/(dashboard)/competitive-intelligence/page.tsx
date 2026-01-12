/**
 * Competitive Intelligence Page
 *
 * Real-time competitor tracking, market analysis, and alerts.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Bell,
  TrendingUp,
  Eye,
  Building2,
  DollarSign,
  ArrowUpRight,
  MapPin,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useIntelligenceStore, selectIntelligenceStats } from '@/lib/store/intelligence-store'
import type { Competitor, CompanyStage } from '@/types/intelligence'

const STAGE_LABELS: Record<CompanyStage, { label: string; color: string }> = {
  'pre-seed': { label: 'Pre-Seed', color: 'bg-gray-500/10 text-gray-500' },
  seed: { label: 'Seed', color: 'bg-blue-500/10 text-blue-500' },
  'series-a': { label: 'Series A', color: 'bg-green-500/10 text-green-500' },
  'series-b': { label: 'Series B', color: 'bg-purple-500/10 text-purple-500' },
  'series-c': { label: 'Series C', color: 'bg-orange-500/10 text-orange-500' },
  'series-d-plus': { label: 'Series D+', color: 'bg-red-500/10 text-red-500' },
  growth: { label: 'Growth', color: 'bg-teal-500/10 text-teal-500' },
  public: { label: 'Public', color: 'bg-indigo-500/10 text-indigo-500' },
  acquired: { label: 'Acquired', color: 'bg-pink-500/10 text-pink-500' },
}

function formatFunding(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(1)}B`
  }
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`
  }
  return `$${amount}`
}

function CompetitorCard({ competitor }: { competitor: Competitor }) {
  const stageConfig = STAGE_LABELS[competitor.stage]

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-4">
        {competitor.logo ? (
          <img
            src={competitor.logo}
            alt={competitor.name}
            className="h-12 w-12 rounded-lg object-cover"
          />
        ) : (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{competitor.name}</h3>
            <Badge className={stageConfig.color}>{stageConfig.label}</Badge>
            {competitor.status === 'acquired' && (
              <Badge variant="secondary">Acquired</Badge>
            )}
          </div>
          <p className="text-sm text-foreground-muted line-clamp-2 mb-2">
            {competitor.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
            <span className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              {formatFunding(competitor.totalFunding)} raised
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {competitor.headquarters.city}, {competitor.headquarters.country}
            </span>
            {competitor.employees && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {competitor.employees.min}-{competitor.employees.max} employees
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {competitor.website && (
            <a
              href={competitor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-hover"
            >
              <ArrowUpRight className="h-4 w-4" />
            </a>
          )}
          <span className="text-xs text-foreground-muted">
            {competitor.fundingHistory.length} rounds
          </span>
        </div>
      </div>
    </Card>
  )
}

export default function CompetitiveIntelligencePage() {
  const { competitors, landscapes, watchlists, alerts } = useIntelligenceStore()
  const stats = selectIntelligenceStats()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'competitors' | 'landscapes' | 'watchlists'>('competitors')

  const unreadAlertsCount = alerts.filter((a) => !a.read).length

  const filteredCompetitors = React.useMemo(() => {
    if (searchQuery === '') return competitors
    return competitors.filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.technologyApproach.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [competitors, searchQuery])

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Users}
        title="Competitive Intelligence"
        description="Track competitors, monitor market activity, and receive alerts"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/competitive-intelligence/alerts">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-error text-xs text-white flex items-center justify-center">
                    {unreadAlertsCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/competitive-intelligence/new">
              <Button leftIcon={<Plus className="h-4 w-4" />}>
                Add Competitor
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
              title="Competitors Tracked"
              value={stats.competitors}
              icon={<Building2 className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Landscapes"
              value={stats.landscapes}
              icon={<Eye className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              title="Watchlists"
              value={stats.watchlists}
              icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Unread Alerts"
              value={stats.unreadAlerts}
              icon={<Bell className="h-5 w-5 text-red-500" />}
            />
          </StatGrid>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {(['competitors', 'landscapes', 'watchlists'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'competitors' && ` (${competitors.length})`}
                {tab === 'landscapes' && ` (${landscapes.length})`}
                {tab === 'watchlists' && ` (${watchlists.length})`}
              </button>
            ))}
          </div>

          {/* Search */}
          {activeTab === 'competitors' && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                type="text"
                placeholder="Search competitors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          {/* Content */}
          {activeTab === 'competitors' && (
            <>
              {filteredCompetitors.length === 0 ? (
                <EmptyState
                  title="No Competitors Tracked"
                  description="Start by adding competitors to track their funding, patents, and news."
                  iconType="folder"
                  action={{
                    label: 'Add Competitor',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="space-y-4">
                  {filteredCompetitors.map((competitor) => (
                    <CompetitorCard key={competitor.id} competitor={competitor} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'landscapes' && (
            <>
              {landscapes.length === 0 ? (
                <EmptyState
                  title="No Competitive Landscapes"
                  description="Create a landscape to compare competitors in a specific market segment."
                  iconType="folder"
                  action={{
                    label: 'Create Landscape',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {landscapes.map((landscape) => (
                    <Link key={landscape.id} href={`/competitive-intelligence/landscape/${landscape.id}`}>
                      <Card className="hover:border-primary/50 transition-colors h-full">
                        <h3 className="font-medium text-foreground mb-1">{landscape.name}</h3>
                        <p className="text-sm text-foreground-muted mb-3">{landscape.description}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground-muted">
                          <span>{landscape.competitors.length} competitors</span>
                          <span>{landscape.technology}</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'watchlists' && (
            <>
              {watchlists.length === 0 ? (
                <EmptyState
                  title="No Watchlists"
                  description="Create a watchlist to monitor specific competitors and receive alerts."
                  iconType="folder"
                  action={{
                    label: 'Create Watchlist',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {watchlists.map((watchlist) => (
                    <Link key={watchlist.id} href={`/competitive-intelligence/watchlist/${watchlist.id}`}>
                      <Card className="hover:border-primary/50 transition-colors h-full">
                        <h3 className="font-medium text-foreground mb-1">{watchlist.name}</h3>
                        {watchlist.description && (
                          <p className="text-sm text-foreground-muted mb-3">{watchlist.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-foreground-muted">
                          <span>{watchlist.competitorIds.length} competitors</span>
                          <span>{watchlist.alertRules.length} alert rules</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
