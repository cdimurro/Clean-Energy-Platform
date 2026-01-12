/**
 * Patent Intelligence Page
 *
 * USPTO/EPO/WIPO integration, FTO analysis, and prior art search.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  ScrollText,
  Plus,
  Search,
  Shield,
  Map,
  FileSearch,
  AlertTriangle,
  Globe,
  Building2,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { StatCard, StatGrid } from '@/components/ui/stat-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useIntelligenceStore } from '@/lib/store/intelligence-store'
import type { FTOAnalysis, PatentLandscape, FTOStatus } from '@/types/intelligence'

const FTO_STATUS_CONFIG: Record<FTOStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-500' },
  'search-in-progress': { label: 'Searching', color: 'bg-blue-500/10 text-blue-500' },
  'analysis-in-progress': { label: 'Analyzing', color: 'bg-amber-500/10 text-amber-500' },
  review: { label: 'In Review', color: 'bg-purple-500/10 text-purple-500' },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500' },
}

const RISK_COLORS = {
  critical: 'text-red-500 bg-red-500/10',
  high: 'text-orange-500 bg-orange-500/10',
  medium: 'text-amber-500 bg-amber-500/10',
  low: 'text-green-500 bg-green-500/10',
}

function FTOCard({ fto }: { fto: FTOAnalysis }) {
  const statusConfig = FTO_STATUS_CONFIG[fto.status]
  const riskColor = RISK_COLORS[fto.riskAssessment.overallRisk]

  return (
    <Link href={`/patent-intelligence/fto/${fto.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground truncate">{fto.name}</h3>
              <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
            </div>
            <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
              {fto.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                {fto.jurisdictions.join(', ')}
              </span>
              <span className="flex items-center gap-1">
                <ScrollText className="h-3 w-3" />
                {fto.relevantPatents.length} relevant patents
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {fto.riskAssessment.blockingPatents} blocking
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={riskColor}>
              {fto.riskAssessment.overallRisk.toUpperCase()} Risk
            </Badge>
            <span className="text-xs text-foreground-muted">
              {fto.recommendations.length} recommendations
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

function LandscapeCard({ landscape }: { landscape: PatentLandscape }) {
  return (
    <Link href={`/patent-intelligence/landscape/${landscape.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <div className="flex items-start gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Map className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">{landscape.name}</h3>
            <p className="text-xs text-foreground-muted">{landscape.technology}</p>
          </div>
        </div>
        <p className="text-sm text-foreground-muted line-clamp-2 mb-3">
          {landscape.description}
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
          <span className="flex items-center gap-1">
            <ScrollText className="h-3 w-3" />
            {landscape.totalPatents} patents
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3 w-3" />
            {landscape.topApplicants.length} applicants
          </span>
        </div>
      </Card>
    </Link>
  )
}

export default function PatentIntelligencePage() {
  const { patents, patentLandscapes, ftoAnalyses, priorArtSearches } = useIntelligenceStore()
  const [searchQuery, setSearchQuery] = React.useState('')
  const [activeTab, setActiveTab] = React.useState<'fto' | 'landscapes' | 'prior-art'>('fto')

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={ScrollText}
        title="Patent Intelligence"
        description="USPTO, EPO, WIPO integration with FTO analysis and prior art search"
        actions={
          <div className="flex items-center gap-2">
            <Link href="/patent-intelligence/search">
              <Button variant="outline" leftIcon={<Search className="h-4 w-4" />}>
                Patent Search
              </Button>
            </Link>
            <Link href="/patent-intelligence/fto/new">
              <Button leftIcon={<Shield className="h-4 w-4" />}>
                New FTO Analysis
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
              title="FTO Analyses"
              value={ftoAnalyses.length}
              icon={<Shield className="h-5 w-5 text-primary" />}
            />
            <StatCard
              title="Patent Landscapes"
              value={patentLandscapes.length}
              icon={<Map className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              title="Prior Art Searches"
              value={priorArtSearches.length}
              icon={<FileSearch className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Patents Indexed"
              value={patents.length}
              icon={<ScrollText className="h-5 w-5 text-green-500" />}
            />
          </StatGrid>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-border">
            {([
              { key: 'fto', label: 'FTO Analysis', count: ftoAnalyses.length },
              { key: 'landscapes', label: 'Landscapes', count: patentLandscapes.length },
              { key: 'prior-art', label: 'Prior Art', count: priorArtSearches.length },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-foreground-muted hover:text-foreground'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Content */}
          {activeTab === 'fto' && (
            <>
              {ftoAnalyses.length === 0 ? (
                <EmptyState
                  title="No FTO Analyses"
                  description="Create a Freedom to Operate analysis to assess patent infringement risk."
                  icon={<Shield className="h-12 w-12" />}
                  action={{
                    label: 'New FTO Analysis',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="space-y-4">
                  {ftoAnalyses.map((fto) => (
                    <FTOCard key={fto.id} fto={fto} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'landscapes' && (
            <>
              {patentLandscapes.length === 0 ? (
                <EmptyState
                  title="No Patent Landscapes"
                  description="Create a landscape to analyze patent activity in a technology area."
                  icon={<Map className="h-12 w-12" />}
                  action={{
                    label: 'Create Landscape',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patentLandscapes.map((landscape) => (
                    <LandscapeCard key={landscape.id} landscape={landscape} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'prior-art' && (
            <>
              {priorArtSearches.length === 0 ? (
                <EmptyState
                  title="No Prior Art Searches"
                  description="Search for prior art to validate novelty of your invention."
                  icon={<FileSearch className="h-12 w-12" />}
                  action={{
                    label: 'New Prior Art Search',
                    onClick: () => {},
                  }}
                  variant="card"
                />
              ) : (
                <div className="space-y-4">
                  {priorArtSearches.map((search) => (
                    <Link key={search.id} href={`/patent-intelligence/prior-art/${search.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-foreground mb-1">{search.name}</h3>
                            <p className="text-sm text-foreground-muted line-clamp-2">
                              {search.inventionDescription}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              className={
                                search.status === 'completed'
                                  ? 'bg-green-500/10 text-green-500'
                                  : 'bg-blue-500/10 text-blue-500'
                              }
                            >
                              {search.status === 'completed' ? 'Completed' : 'In Progress'}
                            </Badge>
                            <span className="text-xs text-foreground-muted">
                              {search.results.length} results
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/patent-intelligence/search" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Patent Search</p>
                    <p className="text-xs text-foreground-muted">USPTO, EPO, WIPO</p>
                  </div>
                </div>
              </Link>
              <Link href="/patent-intelligence/fto/new" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">FTO Analysis</p>
                    <p className="text-xs text-foreground-muted">Freedom to Operate</p>
                  </div>
                </div>
              </Link>
              <Link href="/patent-intelligence/landscape/new" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Map className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Patent Landscape</p>
                    <p className="text-xs text-foreground-muted">Technology mapping</p>
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
