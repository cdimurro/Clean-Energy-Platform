/**
 * Climate Diligence Page
 *
 * SBTi, TCFD, CDP, ISSB, TNFD compliance and decarbonization pathways.
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Leaf,
  Target,
  FileText,
  BarChart3,
  TreePine,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { StatCard, StatGrid } from '@/components/ui/stat-card'

const COMPLIANCE_MODULES = [
  {
    id: 'sbti',
    name: 'SBTi Targets',
    description: 'Science-based target validation and pathway tracking',
    icon: Target,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    href: '/climate-diligence/sbti',
    status: 'ready',
  },
  {
    id: 'tcfd',
    name: 'TCFD Compliance',
    description: 'Task Force on Climate-related Financial Disclosures',
    icon: FileText,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    href: '/climate-diligence/tcfd',
    status: 'ready',
  },
  {
    id: 'cdp',
    name: 'CDP Response',
    description: 'Carbon Disclosure Project questionnaire mapping',
    icon: BarChart3,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    href: '/climate-diligence/cdp',
    status: 'ready',
  },
  {
    id: 'scope3',
    name: 'Scope 3 Mapping',
    description: 'Supply chain emissions tracking and supplier engagement',
    icon: TreePine,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    href: '/climate-diligence/scope3',
    status: 'ready',
  },
  {
    id: 'tnfd',
    name: 'TNFD Assessment',
    description: 'Taskforce on Nature-related Financial Disclosures',
    icon: Leaf,
    color: 'text-teal-500',
    bgColor: 'bg-teal-500/10',
    href: '/climate-diligence/tnfd',
    status: 'coming-soon',
  },
  {
    id: 'pathway',
    name: 'Decarbonization Pathway',
    description: 'Net-zero roadmap planning and milestone tracking',
    icon: Target,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    href: '/climate-diligence/pathway',
    status: 'ready',
  },
]

function ModuleCard({
  module,
}: {
  module: (typeof COMPLIANCE_MODULES)[0]
}) {
  const Icon = module.icon

  return (
    <Link href={module.href}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-xl ${module.bgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${module.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground">{module.name}</h3>
              {module.status === 'coming-soon' && (
                <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
              )}
            </div>
            <p className="text-sm text-foreground-muted">{module.description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-foreground-muted flex-shrink-0" />
        </div>
      </Card>
    </Link>
  )
}

function ComplianceScoreCard({
  framework,
  score,
  status,
  lastUpdated,
}: {
  framework: string
  score: number
  status: 'compliant' | 'partial' | 'non-compliant' | 'not-started'
  lastUpdated?: string
}) {
  const statusConfig = {
    compliant: { label: 'Compliant', color: 'text-green-500', icon: CheckCircle },
    partial: { label: 'Partial', color: 'text-amber-500', icon: AlertTriangle },
    'non-compliant': { label: 'Non-Compliant', color: 'text-red-500', icon: AlertTriangle },
    'not-started': { label: 'Not Started', color: 'text-gray-500', icon: Clock },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-foreground">{framework}</h4>
        <Badge className={`${config.color} bg-opacity-10`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {config.label}
        </Badge>
      </div>
      <div className="relative h-2 rounded-full bg-background-surface overflow-hidden mb-2">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all"
          style={{ width: `${score}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-foreground-muted">
        <span>{score}% complete</span>
        {lastUpdated && <span>Updated {lastUpdated}</span>}
      </div>
    </Card>
  )
}

export default function ClimateDiligencePage() {
  return (
    <div className="flex flex-col h-full">
      <PageHeader
        icon={Leaf}
        title="Climate Diligence"
        description="SBTi, TCFD, CDP, ISSB, TNFD compliance and decarbonization pathways"
        actions={
          <Link href="/climate-diligence/assessment/new">
            <Button leftIcon={<Target className="h-4 w-4" />}>
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
              title="Overall Readiness"
              value="72%"
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
              trend={{ value: 8, direction: 'up', label: 'vs last quarter' }}
            />
            <StatCard
              title="Frameworks Covered"
              value="4/6"
              icon={<FileText className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              title="Open Gaps"
              value="12"
              icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            />
            <StatCard
              title="Days to Deadline"
              value="45"
              icon={<Clock className="h-5 w-5 text-red-500" />}
            />
          </StatGrid>

          {/* Compliance Scores */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Compliance Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <ComplianceScoreCard
                framework="TCFD"
                score={85}
                status="compliant"
                lastUpdated="2 days ago"
              />
              <ComplianceScoreCard
                framework="SBTi"
                score={60}
                status="partial"
                lastUpdated="1 week ago"
              />
              <ComplianceScoreCard
                framework="CDP"
                score={45}
                status="partial"
                lastUpdated="3 weeks ago"
              />
              <ComplianceScoreCard
                framework="ISSB"
                score={0}
                status="not-started"
              />
            </div>
          </div>

          {/* Modules */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Assessment Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMPLIANCE_MODULES.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/climate-diligence/sbti" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Validate SBTi Targets</p>
                    <p className="text-xs text-foreground-muted">Check target alignment</p>
                  </div>
                </div>
              </Link>
              <Link href="/climate-diligence/tcfd/scenario" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Scenario Analysis</p>
                    <p className="text-xs text-foreground-muted">TCFD climate scenarios</p>
                  </div>
                </div>
              </Link>
              <Link href="/climate-diligence/pathway" className="block">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-background-surface hover:bg-background-hover transition-colors">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <ArrowRight className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Plan Pathway</p>
                    <p className="text-xs text-foreground-muted">Net-zero roadmap</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* Resources */}
          <Card>
            <h3 className="font-semibold text-foreground mb-4">Standards and Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="https://sciencebasedtargets.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors text-sm"
              >
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-foreground">SBTi Framework</span>
              </a>
              <a
                href="https://www.fsb-tcfd.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors text-sm"
              >
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-foreground">TCFD Recommendations</span>
              </a>
              <a
                href="https://www.cdp.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors text-sm"
              >
                <BarChart3 className="h-4 w-4 text-amber-500" />
                <span className="text-foreground">CDP Guidance</span>
              </a>
              <a
                href="https://tnfd.global/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-background-surface hover:bg-background-hover transition-colors text-sm"
              >
                <Leaf className="h-4 w-4 text-teal-500" />
                <span className="text-foreground">TNFD Framework</span>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
