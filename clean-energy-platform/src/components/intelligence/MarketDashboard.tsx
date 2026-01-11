/**
 * Market Intelligence Dashboard
 *
 * Displays competitive landscape and patent intelligence
 * for investor due diligence on technology investments.
 *
 * Features:
 * - Competitor funding timeline
 * - Patent filing trends
 * - Technology approach comparison
 * - Market positioning map
 *
 * Phase 5 of investor due diligence market enhancement
 */

'use client'

import { useState } from 'react'
import type { CompetitiveLandscape, CompetitorProfile } from '@/lib/intelligence/competitor-mapper'
import type { PatentLandscape, PatentHolder, PatentTrend } from '@/lib/intelligence/patent-analyzer'

// ============================================================================
// Types
// ============================================================================

interface MarketDashboardProps {
  competitiveLandscape?: CompetitiveLandscape
  patentLandscape?: PatentLandscape
  isLoading?: boolean
  onRefresh?: () => void
}

type TabId = 'overview' | 'competitors' | 'patents' | 'trends'

// ============================================================================
// Component
// ============================================================================

export function MarketDashboard({
  competitiveLandscape,
  patentLandscape,
  isLoading = false,
  onRefresh,
}: MarketDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview')

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'competitors', label: 'Competitors' },
    { id: 'patents', label: 'Patents' },
    { id: 'trends', label: 'Trends' },
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!competitiveLandscape && !patentLandscape) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No market intelligence data available.</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Generate Analysis
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Market Intelligence</h2>
            <p className="text-sm text-gray-500">
              {competitiveLandscape?.technology || patentLandscape?.technology}
            </p>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mt-4 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <OverviewTab
            competitive={competitiveLandscape}
            patents={patentLandscape}
          />
        )}
        {activeTab === 'competitors' && competitiveLandscape && (
          <CompetitorsTab landscape={competitiveLandscape} />
        )}
        {activeTab === 'patents' && patentLandscape && (
          <PatentsTab landscape={patentLandscape} />
        )}
        {activeTab === 'trends' && (
          <TrendsTab
            competitive={competitiveLandscape}
            patents={patentLandscape}
          />
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({
  competitive,
  patents,
}: {
  competitive?: CompetitiveLandscape
  patents?: PatentLandscape
}) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Competitors"
          value={competitive?.competitors.length || 0}
          subtitle="Identified"
        />
        <MetricCard
          label="TAM"
          value={competitive?.totalAddressableMarket || 'N/A'}
          subtitle="Market Size"
        />
        <MetricCard
          label="Patents"
          value={patents?.totalPatentsFound || 0}
          subtitle="Relevant"
        />
        <MetricCard
          label="FTO Risk"
          value={patents?.ftoRisk.level || 'Unknown'}
          subtitle="Assessment"
          valueColor={
            patents?.ftoRisk.level === 'high'
              ? 'text-red-600'
              : patents?.ftoRisk.level === 'medium'
                ? 'text-amber-600'
                : 'text-green-600'
          }
        />
      </div>

      {/* Market Overview */}
      {competitive?.marketOverview && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Market Overview</h3>
          <p className="text-sm text-gray-600">{competitive.marketOverview}</p>
        </div>
      )}

      {/* Patent Overview */}
      {patents?.overview && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-700 mb-2">Patent Landscape</h3>
          <p className="text-sm text-blue-600">{patents.overview}</p>
        </div>
      )}

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitive && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Competitive Position</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Barrier to Entry</span>
                <RiskBadge level={competitive.barrierToEntry} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Consolidation Risk</span>
                <RiskBadge level={competitive.consolidationRisk} />
              </div>
            </div>
          </div>
        )}

        {patents?.ftoRisk && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">IP Risk</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">FTO Risk</span>
                <RiskBadge level={patents.ftoRisk.level} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Blocking Patents</span>
                <span className="font-medium">
                  {patents.ftoRisk.blockingPatents.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {competitive?.recommendations && competitive.recommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Competitive Recommendations
            </h3>
            <ul className="space-y-1">
              {competitive.recommendations.slice(0, 4).map((rec, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-blue-500">-</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {patents?.strategicRecommendations && patents.strategicRecommendations.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">IP Recommendations</h3>
            <ul className="space-y-1">
              {patents.strategicRecommendations.slice(0, 4).map((rec, i) => (
                <li key={i} className="text-sm text-gray-600 flex gap-2">
                  <span className="text-purple-500">-</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Competitors Tab
// ============================================================================

function CompetitorsTab({ landscape }: { landscape: CompetitiveLandscape }) {
  const [selectedCompetitor, setSelectedCompetitor] = useState<CompetitorProfile | null>(null)

  return (
    <div className="space-y-6">
      {/* Competitor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {landscape.competitors.map((competitor) => (
          <CompetitorCard
            key={competitor.name}
            competitor={competitor}
            isSelected={selectedCompetitor?.name === competitor.name}
            onClick={() =>
              setSelectedCompetitor(
                selectedCompetitor?.name === competitor.name ? null : competitor
              )
            }
          />
        ))}
      </div>

      {/* Selected Competitor Detail */}
      {selectedCompetitor && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium text-gray-900">{selectedCompetitor.name}</h3>
              {selectedCompetitor.website && (
                <a
                  href={selectedCompetitor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {selectedCompetitor.website}
                </a>
              )}
            </div>
            <button
              onClick={() => setSelectedCompetitor(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              x
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Strengths</h4>
              <ul className="space-y-1">
                {selectedCompetitor.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700">
                    + {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Weaknesses</h4>
              <ul className="space-y-1">
                {selectedCompetitor.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-red-700">
                    - {w}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                Differentiators
              </h4>
              <ul className="space-y-1">
                {selectedCompetitor.differentiators.map((d, i) => (
                  <li key={i} className="text-sm text-gray-700">
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Matrix */}
      {landscape.comparisonMatrix.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Comparison Matrix</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Metric
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Target
                  </th>
                  {landscape.competitors.slice(0, 4).map((c) => (
                    <th
                      key={c.name}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    >
                      {c.name.substring(0, 15)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {landscape.comparisonMatrix.slice(0, 6).map((row) => (
                  <tr key={row.metric}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {row.metric}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{row.target}</td>
                    {row.competitors.slice(0, 4).map((comp) => (
                      <td key={comp.name} className="px-4 py-3 text-sm">
                        <span
                          className={
                            comp.assessment === 'better'
                              ? 'text-green-600'
                              : comp.assessment === 'worse'
                                ? 'text-red-600'
                                : 'text-gray-600'
                          }
                        >
                          {comp.value}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Patents Tab
// ============================================================================

function PatentsTab({ landscape }: { landscape: PatentLandscape }) {
  return (
    <div className="space-y-6">
      {/* Top Patent Holders */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Top Patent Holders</h3>
        <div className="space-y-3">
          {landscape.topHolders.slice(0, 6).map((holder) => (
            <PatentHolderRow key={holder.name} holder={holder} />
          ))}
        </div>
      </div>

      {/* FTO Risk Details */}
      {landscape.ftoRisk.blockingPatents.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 mb-3">Potentially Blocking Patents</h3>
          <div className="space-y-2">
            {landscape.ftoRisk.blockingPatents.map((patent) => (
              <div key={patent.patentNumber} className="text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-red-700">{patent.patentNumber}</span>
                  <span className="text-red-600">Expires: {patent.expirationDate}</span>
                </div>
                <div className="text-red-600">{patent.holder}</div>
                <div className="text-red-500 text-xs mt-1">{patent.relevance}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Whitespace Opportunities */}
      {landscape.whitespaceOpportunities.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-3">Patent Whitespace</h3>
          <ul className="space-y-1">
            {landscape.whitespaceOpportunities.map((opp, i) => (
              <li key={i} className="text-sm text-green-700 flex gap-2">
                <span>+</span>
                {opp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technology Clusters */}
      {landscape.technologyClusters.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Technology Clusters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {landscape.technologyClusters.map((cluster) => (
              <div
                key={cluster.name}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <span className="font-medium text-gray-900">{cluster.name}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      cluster.maturity === 'emerging'
                        ? 'bg-purple-100 text-purple-700'
                        : cluster.maturity === 'growing'
                          ? 'bg-green-100 text-green-700'
                          : cluster.maturity === 'mature'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cluster.maturity}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {cluster.patentCount} patents | {cluster.keyPlayers.slice(0, 3).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Trends Tab
// ============================================================================

function TrendsTab({
  competitive,
  patents,
}: {
  competitive?: CompetitiveLandscape
  patents?: PatentLandscape
}) {
  return (
    <div className="space-y-6">
      {/* Patent Filing Trends */}
      {patents?.patentTrends && patents.patentTrends.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Patent Filing Trends</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-end gap-2 h-32">
              {patents.patentTrends.slice(-8).map((trend) => (
                <PatentTrendBar key={trend.year} trend={trend} />
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{patents.patentTrends[patents.patentTrends.length - 8]?.year}</span>
              <span>{patents.patentTrends[patents.patentTrends.length - 1]?.year}</span>
            </div>
          </div>
        </div>
      )}

      {/* Emerging Topics */}
      {patents?.patentTrends && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Emerging Topics</h3>
          <div className="flex flex-wrap gap-2">
            {patents.patentTrends
              .slice(-3)
              .flatMap((t) => t.emergingTopics)
              .filter((topic, i, arr) => arr.indexOf(topic) === i)
              .slice(0, 10)
              .map((topic) => (
                <span
                  key={topic}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                >
                  {topic}
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Market Positioning */}
      {competitive?.marketPositioning && competitive.marketPositioning.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Market Segments</h3>
          <div className="space-y-3">
            {competitive.marketPositioning.map((segment) => (
              <div
                key={segment.segment}
                className="border border-gray-200 rounded-lg p-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium text-gray-900">{segment.segment}</span>
                    <div className="text-sm text-gray-500">{segment.size}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      segment.positioning === 'leader'
                        ? 'bg-green-100 text-green-700'
                        : segment.positioning === 'challenger'
                          ? 'bg-blue-100 text-blue-700'
                          : segment.positioning === 'niche'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {segment.positioning}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Growth: {segment.growth}
                </div>
                <div className="text-xs text-gray-500">
                  Key players: {segment.competitors.slice(0, 3).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Threats */}
      {competitive?.competitiveThreats && competitive.competitiveThreats.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Competitive Threats</h3>
          <ul className="space-y-1">
            {competitive.competitiveThreats.map((threat, i) => (
              <li key={i} className="text-sm text-amber-700 flex gap-2">
                <span>!</span>
                {threat}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Competitive Advantages */}
      {competitive?.competitiveAdvantages && competitive.competitiveAdvantages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Potential Advantages</h3>
          <ul className="space-y-1">
            {competitive.competitiveAdvantages.map((adv, i) => (
              <li key={i} className="text-sm text-green-700 flex gap-2">
                <span>+</span>
                {adv}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function MetricCard({
  label,
  value,
  subtitle,
  valueColor = 'text-gray-900',
}: {
  label: string
  value: string | number
  subtitle: string
  valueColor?: string
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold ${valueColor} mt-1`}>{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  )
}

function RiskBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-red-100', text: 'text-red-700' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-700' },
    low: { bg: 'bg-green-100', text: 'text-green-700' },
  }

  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium ${config[level].bg} ${config[level].text}`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  )
}

function CompetitorCard({
  competitor,
  isSelected,
  onClick,
}: {
  competitor: CompetitorProfile
  isSelected: boolean
  onClick: () => void
}) {
  const stageColors: Record<string, string> = {
    seed: 'bg-purple-100 text-purple-700',
    early: 'bg-blue-100 text-blue-700',
    growth: 'bg-green-100 text-green-700',
    late: 'bg-teal-100 text-teal-700',
    public: 'bg-gray-100 text-gray-700',
    acquired: 'bg-gray-100 text-gray-500',
  }

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="font-medium text-gray-900">{competitor.name}</div>
        <span className={`text-xs px-2 py-0.5 rounded ${stageColors[competitor.stage] || 'bg-gray-100'}`}>
          {competitor.stage}
        </span>
      </div>
      <div className="text-sm text-gray-600 mt-1 line-clamp-2">{competitor.description}</div>
      {competitor.fundingTotal && (
        <div className="text-sm text-gray-500 mt-2">
          Funding: {competitor.fundingTotal}
        </div>
      )}
    </div>
  )
}

function PatentHolderRow({ holder }: { holder: PatentHolder }) {
  const assessmentColors: Record<string, string> = {
    major_player: 'text-red-600',
    active_filer: 'text-amber-600',
    niche: 'text-blue-600',
    emerging: 'text-green-600',
  }

  const trendIcons: Record<string, string> = {
    increasing: '\u2191',
    stable: '\u2194',
    decreasing: '\u2193',
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900">{holder.name}</div>
        <div className="text-sm text-gray-500">
          {holder.technologyFocus.slice(0, 2).join(', ')}
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold text-gray-900">{holder.patentCount}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 justify-end">
          <span className={assessmentColors[holder.assessment] || ''}>
            {holder.assessment.replace('_', ' ')}
          </span>
          <span>{trendIcons[holder.filingTrend]}</span>
        </div>
      </div>
    </div>
  )
}

function PatentTrendBar({ trend }: { trend: PatentTrend }) {
  const maxFilings = 500 // Normalize against reasonable max
  const height = Math.min((trend.filings / maxFilings) * 100, 100)

  return (
    <div className="flex-1 flex flex-col items-center">
      <div
        className="w-full bg-blue-500 rounded-t transition-all"
        style={{ height: `${height}%` }}
        title={`${trend.year}: ${trend.filings} filings`}
      />
      <div className="text-xs text-gray-500 mt-1">{trend.year.toString().slice(-2)}</div>
    </div>
  )
}

export default MarketDashboard
