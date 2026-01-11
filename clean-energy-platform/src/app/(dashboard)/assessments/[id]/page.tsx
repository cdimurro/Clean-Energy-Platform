/**
 * Unified Assessment Detail Page
 *
 * Shows different views based on assessment status:
 * - plan_review: Plan review and approval
 * - executing: Real-time progress
 * - complete: Results and downloads
 */

'use client'

import * as React from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  Shield,
  BarChart3,
  Globe,
  Lightbulb,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  ArrowRight,
  ClipboardCheck,
  Zap,
  Minus,
  Edit,
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { PageHeader } from '@/components/shared'
import { PlanEditor } from '@/components/assessment/plan-editor'
import { useAssessmentStore, useHydration } from '@/lib/store'
import type { AssessmentRating, ClaimConfidence, ComponentStatus } from '@/lib/store'
import type { AssumptionCategory } from '@/types/tea'

// Configuration objects
const RATING_CONFIG: Record<AssessmentRating, { label: string; color: string; textColor: string }> = {
  promising: { label: 'Promising', color: 'bg-green-500', textColor: 'text-green-500' },
  conditional: { label: 'Conditional', color: 'bg-amber-500', textColor: 'text-amber-500' },
  concerning: { label: 'Concerning', color: 'bg-red-500', textColor: 'text-red-500' },
}

const CONFIDENCE_CONFIG: Record<ClaimConfidence, { label: string; color: string }> = {
  high: { label: 'High', color: 'text-green-500 bg-green-500/10' },
  medium: { label: 'Medium', color: 'text-amber-500 bg-amber-500/10' },
  low: { label: 'Low', color: 'text-orange-500 bg-orange-500/10' },
  unvalidatable: { label: 'Cannot Validate', color: 'text-red-500 bg-red-500/10' },
}

const STATUS_CONFIG: Record<ComponentStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'text-foreground-muted' },
  running: { label: 'Running', color: 'text-blue-500' },
  complete: { label: 'Complete', color: 'text-green-500' },
  error: { label: 'Error', color: 'text-red-500' },
}

const COMPONENT_ICONS: Record<string, React.ElementType> = {
  'Technology Deep Dive': Target,
  'Claims Validation': Shield,
  'Performance Simulation': BarChart3,
  'System Integration': Globe,
  'Techno-Economic Analysis': TrendingUp,
  'Improvement Opportunities': Lightbulb,
  'Final Synthesis': FileText,
}

// Mock data for demo
const mockPlan = {
  technologyType: 'Solar PV - Perovskite Tandem',
  identifiedClaims: [
    { id: '1', claim: '30% cell efficiency in lab conditions', source: 'pitch_deck.pdf', validationMethod: 'Literature comparison', confidence: 'high' as ClaimConfidence },
    { id: '2', claim: 'Path to 35% efficiency by 2026', source: 'whitepaper.pdf', validationMethod: 'Technology roadmap analysis', confidence: 'medium' as ClaimConfidence },
    { id: '3', claim: '$0.15/W manufacturing cost at scale', source: 'financial_model.xlsx', validationMethod: 'Bottom-up cost modeling', confidence: 'low' as ClaimConfidence },
  ],
  extractedParameters: {
    capacity: '100 MW',
    capitalCost: '$85 million',
    operatingCost: '$1.2M/year',
    lifetime: '25 years',
  },
  sections: [
    { id: '1', name: 'Technology Deep Dive', enabled: true, pages: '5-7' },
    { id: '2', name: 'Claims Validation', enabled: true, pages: '2-3' },
    { id: '3', name: 'Performance Simulation', enabled: true, pages: '10-15' },
    { id: '4', name: 'Energy System Integration', enabled: true, pages: '5-7' },
    { id: '5', name: 'Techno-Economic Analysis', enabled: true, pages: '8-10' },
    { id: '6', name: 'Improvement Opportunities', enabled: true, pages: '5-10' },
    { id: '7', name: 'Final Assessment', enabled: true, pages: '3-5' },
  ],
  missingData: ['Detailed bill of materials', 'Long-term stability test data'],
  assumptions: [{ key: 'Module efficiency', value: '22%' }, { key: 'Installation cost', value: '$0.30/W' }],
}

const mockResults = {
  rating: 'promising' as AssessmentRating,
  ratingJustification: 'The technology demonstrates strong efficiency gains with a clear path to commercialization.',
  summary: {
    keyStrengths: ['Lab efficiency validated at 28.5%', 'Novel encapsulation approach', 'Strong IP portfolio'],
    keyRisks: ['Long-term stability unproven', 'Manufacturing scale-up pending', 'Regulatory uncertainty'],
    nextSteps: ['Request extended stability data', 'Site visit to pilot facility', 'Review detailed BOM'],
  },
  metrics: {
    lcoe: { value: '$42/MWh', benchmark: '$45-55/MWh' },
    npv: { value: '$18.5M', benchmark: '>$10M' },
    irr: { value: '14.2%', benchmark: '>12%' },
    payback: { value: '6.2 years', benchmark: '<8 years' },
  },
  claimsMatrix: [
    { claim: '30% efficiency', validated: true, confidence: 'high', note: 'Validated at 28.5%' },
    { claim: '35% by 2026', validated: true, confidence: 'medium', note: 'Plausible roadmap' },
    { claim: '$0.15/W cost', validated: true, confidence: 'low', note: 'Aggressive but possible' },
  ],
}

function formatDuration(startDate: Date, endDate?: Date): string {
  const end = endDate || new Date()
  const diffMs = end.getTime() - startDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000)
  if (diffMins > 0) return `${diffMins}m ${diffSecs}s`
  return `${diffSecs}s`
}

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  console.log('[AssessmentDetail] Rendering with ID:', assessmentId)

  // Get assessment from store - use a selector that subscribes to assessments changes
  const assessment = useAssessmentStore((state) =>
    state.assessments.find(a => a.id === assessmentId)
  )
  const updateComponentStatus = useAssessmentStore((state) => state.updateComponentStatus)
  const completeComponent = useAssessmentStore((state) => state.completeComponent)
  const completeAssessment = useAssessmentStore((state) => state.completeAssessment)
  const setRating = useAssessmentStore((state) => state.setRating)
  const approvePlan = useAssessmentStore((state) => state.approvePlan)
  const startExecution = useAssessmentStore((state) => state.startExecution)

  // Enhanced plan actions
  const updatePlanAssumption = useAssessmentStore((state) => state.updatePlanAssumption)
  const resetAssumptionToDefault = useAssessmentStore((state) => state.resetAssumptionToDefault)
  const toggleMethodologyAnalysis = useAssessmentStore((state) => state.toggleMethodologyAnalysis)
  const approveEnhancedPlan = useAssessmentStore((state) => state.approveEnhancedPlan)

  const isHydrated = useHydration()
  console.log('[AssessmentDetail] Assessment found:', assessment ? 'yes' : 'no', assessment?.status, 'hydrated:', isHydrated)

  // Local state
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['claims', 'sections'])
  const [isApproving, setIsApproving] = React.useState(false)

  // Build display plan from assessment data or fall back to mock
  const displayPlan = React.useMemo(() => {
    if (assessment?.plan) {
      return {
        technologyType: assessment.plan.technologyType || assessment.title,
        identifiedClaims: assessment.plan.identifiedClaims.map(c => ({
          id: c.id,
          claim: c.claim,
          source: c.source,
          validationMethod: c.validationMethod,
          confidence: c.confidence as ClaimConfidence
        })),
        extractedParameters: assessment.plan.extractedParameters || {
          capacity: 'N/A',
          capitalCost: 'N/A',
          operatingCost: 'N/A',
          lifetime: 'N/A'
        },
        sections: assessment.plan.sections.map(s => ({
          id: s.id,
          name: s.name,
          enabled: s.enabled,
          pages: s.estimatedPages || '3-5'
        })),
        missingData: assessment.plan.missingData || [],
        assumptions: assessment.plan.assumptions || [],
      }
    }
    return mockPlan
  }, [assessment?.plan, assessment?.title])

  const [localPlan, setLocalPlan] = React.useState(displayPlan)

  // Sync local plan when assessment plan changes
  React.useEffect(() => {
    setLocalPlan(displayPlan)
  }, [displayPlan])

  // Simulate progress updates when executing
  React.useEffect(() => {
    console.log('[Progress] Effect running, status:', assessment?.status, 'hydrated:', isHydrated)
    if (!isHydrated || assessment?.status !== 'executing') {
      console.log('[Progress] Not executing, skipping')
      return
    }

    console.log('[Progress] Setting up interval, components:', assessment.components.map(c => ({ id: c.id, status: c.status, progress: c.progress })))

    const interval = setInterval(() => {
      // Get fresh assessment data from store
      const freshAssessment = useAssessmentStore.getState().getAssessmentById(assessmentId)
      if (!freshAssessment) {
        console.log('[Progress] No fresh assessment found')
        return
      }

      const runningComponent = freshAssessment.components.find(c => c.status === 'running')
      console.log('[Progress] Running component:', runningComponent?.name, 'progress:', runningComponent?.progress)

      if (runningComponent) {
        if (runningComponent.progress < 100) {
          const newProgress = Math.min(runningComponent.progress + Math.random() * 15 + 5, 100)
          console.log('[Progress] Updating progress to:', newProgress)
          updateComponentStatus(assessmentId, runningComponent.id, 'running', newProgress)
        } else {
          console.log('[Progress] Component complete, moving to next')
          completeComponent(assessmentId, runningComponent.id, { completed: true })
        }
      } else {
        console.log('[Progress] No running component found')
      }
    }, 1000)

    return () => {
      console.log('[Progress] Clearing interval')
      clearInterval(interval)
    }
  }, [isHydrated, assessment?.status, assessmentId, updateComponentStatus, completeComponent])

  // Check if all components are complete
  React.useEffect(() => {
    if (!isHydrated || assessment?.status !== 'executing') return

    // Check periodically if all components are complete
    const checkInterval = setInterval(() => {
      const freshAssessment = useAssessmentStore.getState().getAssessmentById(assessmentId)
      if (!freshAssessment || freshAssessment.status !== 'executing') {
        clearInterval(checkInterval)
        return
      }

      const allComplete = freshAssessment.components.every(c => c.status === 'complete')
      if (allComplete) {
        console.log('[Progress] All components complete, finishing assessment')
        setRating(assessmentId, 'promising')
        completeAssessment(assessmentId)
        clearInterval(checkInterval)
      }
    }, 500)

    return () => clearInterval(checkInterval)
  }, [isHydrated, assessment?.status, assessmentId, setRating, completeAssessment])

  // Wait for hydration before rendering (AFTER all hooks)
  if (!isHydrated) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-foreground-muted animate-spin" />
        <p className="mt-2 text-sm text-foreground-muted">Loading assessment...</p>
      </div>
    )
  }

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId) ? prev.filter(id => id !== sectionId) : [...prev, sectionId]
    )
  }

  const toggleReportSection = (sectionId: string) => {
    setLocalPlan(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }))
  }

  const handleApprove = async () => {
    console.log('[AssessmentDetail] handleApprove called, assessment:', assessment?.id)
    if (!assessment) {
      console.log('[AssessmentDetail] No assessment found, returning')
      return
    }
    setIsApproving(true)
    console.log('[AssessmentDetail] Starting approval process...')
    try {
      console.log('[AssessmentDetail] Calling approvePlan...')
      approvePlan(assessmentId)
      console.log('[AssessmentDetail] approvePlan done, waiting...')
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('[AssessmentDetail] Calling startExecution...')
      startExecution(assessmentId)
      console.log('[AssessmentDetail] startExecution done')
    } catch (error) {
      console.error('[AssessmentDetail] Error in handleApprove:', error)
      setIsApproving(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessment, results: mockResults }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `assessment-${assessment?.title || assessmentId}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
    }
  }

  // Loading/not found state
  if (!assessment) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <p className="text-foreground-muted">Assessment not found</p>
        <Button variant="outline" onClick={() => router.push('/assessments/new')} className="mt-4">
          Create New Assessment
        </Button>
      </div>
    )
  }

  const status = assessment.status
  const enabledSections = localPlan.sections.filter(s => s.enabled).length
  const completedCount = assessment.components.filter(c => c.status === 'complete').length
  const overallProgress = Math.round((completedCount / assessment.components.length) * 100)

  // ==================== PLAN REVIEW VIEW ====================
  if (status === 'plan_review' || status === 'plan_generating') {
    // Use enhanced plan editor if available
    if (assessment.enhancedPlan) {
      const handleUpdateAssumption = (
        category: AssumptionCategory,
        assumptionId: string,
        value: string | number
      ) => {
        updatePlanAssumption(assessmentId, category, assumptionId, value)
      }

      const handleResetAssumption = (category: AssumptionCategory, assumptionId: string) => {
        resetAssumptionToDefault(assessmentId, category, assumptionId)
      }

      const handleToggleAnalysis = (analysisId: string, enabled: boolean) => {
        toggleMethodologyAnalysis(assessmentId, analysisId, enabled)
      }

      const handleApproveEnhanced = async () => {
        setIsApproving(true)
        try {
          approveEnhancedPlan(assessmentId)
          await new Promise((resolve) => setTimeout(resolve, 500))
          startExecution(assessmentId)
        } catch (error) {
          console.error('Error approving enhanced plan:', error)
          setIsApproving(false)
        }
      }

      return (
        <div className="flex flex-col h-full">
          <PageHeader
            icon={ClipboardCheck}
            title="Review Assessment Plan"
            description={assessment.title}
          />

          <div className="flex-1 overflow-auto p-6">
            <PlanEditor
              plan={assessment.enhancedPlan}
              onUpdateAssumption={handleUpdateAssumption}
              onResetAssumption={handleResetAssumption}
              onToggleAnalysis={handleToggleAnalysis}
              onApprove={handleApproveEnhanced}
              isApproving={isApproving}
            />
          </div>
        </div>
      )
    }

    // Fall back to legacy plan review UI
    return (
      <div className="flex flex-col h-full">
        <PageHeader icon={ClipboardCheck} title="Review Assessment Plan" description={assessment.title} />

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Technology Type */}
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground-muted">Detected Technology Type</p>
                  <p className="text-lg font-medium text-foreground">{localPlan.technologyType}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2"><Edit className="w-4 h-4" />Edit</Button>
              </div>
            </Card>

            {/* Claims */}
            <Card>
              <button onClick={() => toggleSection('claims')} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Claims to Validate</h3>
                  <Badge variant="secondary">{localPlan.identifiedClaims.length}</Badge>
                </div>
                {expandedSections.includes('claims') ? <ChevronDown className="w-5 h-5 text-foreground-muted" /> : <ChevronRight className="w-5 h-5 text-foreground-muted" />}
              </button>
              {expandedSections.includes('claims') && (
                <div className="mt-4 space-y-3">
                  {localPlan.identifiedClaims.map(claim => {
                    const config = CONFIDENCE_CONFIG[claim.confidence]
                    return (
                      <div key={claim.id} className="p-4 rounded-lg bg-background-surface border border-border">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="font-medium text-foreground">{claim.claim}</p>
                          <Badge className={config.color}>{config.label}</Badge>
                        </div>
                        <div className="text-sm text-foreground-muted">
                          <p><span className="text-foreground-subtle">Source:</span> {claim.source}</p>
                          <p><span className="text-foreground-subtle">Validation:</span> {claim.validationMethod}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* Parameters */}
            <Card>
              <button onClick={() => toggleSection('parameters')} className="w-full flex items-center justify-between">
                <h3 className="font-medium text-foreground">Extracted Parameters</h3>
                {expandedSections.includes('parameters') ? <ChevronDown className="w-5 h-5 text-foreground-muted" /> : <ChevronRight className="w-5 h-5 text-foreground-muted" />}
              </button>
              {expandedSections.includes('parameters') && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(localPlan.extractedParameters).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-background-surface">
                      <p className="text-xs text-foreground-muted capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                      <p className="font-medium text-foreground">{value}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Report Sections */}
            <Card>
              <button onClick={() => toggleSection('sections')} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground">Report Sections</h3>
                  <Badge variant="secondary">{enabledSections}/{localPlan.sections.length}</Badge>
                </div>
                {expandedSections.includes('sections') ? <ChevronDown className="w-5 h-5 text-foreground-muted" /> : <ChevronRight className="w-5 h-5 text-foreground-muted" />}
              </button>
              {expandedSections.includes('sections') && (
                <div className="mt-4 space-y-2">
                  {localPlan.sections.map((section, index) => (
                    <div key={section.id} className="flex items-center justify-between p-3 rounded-lg bg-background-surface">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleReportSection(section.id)}
                          className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${section.enabled ? 'bg-accent text-white' : 'bg-background-hover text-foreground-muted'}`}
                        >
                          {section.enabled ? <CheckCircle2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                        </button>
                        <span className={section.enabled ? 'text-foreground' : 'text-foreground-muted'}>{index + 1}. {section.name}</span>
                      </div>
                      <span className="text-sm text-foreground-muted">{section.pages} pages</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Missing Data */}
            {localPlan.missingData.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <h3 className="font-medium text-foreground mb-2">Missing Information</h3>
                    <ul className="space-y-1">
                      {localPlan.missingData.map((item, i) => (
                        <li key={i} className="text-sm text-foreground-muted flex items-start gap-2"><span className="text-amber-500">-</span>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleApprove} disabled={isApproving || enabledSections === 0} className="gap-2">
                {isApproving ? <><Loader2 className="w-4 h-4 animate-spin" />Starting...</> : <>Approve & Start<ArrowRight className="w-4 h-4" /></>}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==================== EXECUTING VIEW ====================
  if (status === 'executing') {
    return (
      <div className="flex flex-col h-full">
        <PageHeader icon={Zap} title="Assessment in Progress" description={assessment.title} />

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Overall Progress */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-foreground">Overall Progress</h3>
                  <p className="text-sm text-foreground-muted">{completedCount} of {assessment.components.length} complete</p>
                </div>
                <span className="text-2xl font-bold text-accent">{overallProgress}%</span>
              </div>
              <div className="h-3 bg-background-surface rounded-full overflow-hidden">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
            </Card>

            {/* Components */}
            <div className="space-y-3">
              {assessment.components.map(component => {
                const Icon = COMPONENT_ICONS[component.name] || FileText
                const statusConfig = STATUS_CONFIG[component.status]
                return (
                  <Card key={component.id} className={component.status === 'running' ? 'border-accent/30' : ''}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${component.status === 'complete' ? 'bg-green-500/10' : component.status === 'running' ? 'bg-accent/10' : 'bg-background-surface'}`}>
                        {component.status === 'running' ? <Loader2 className="w-5 h-5 text-accent animate-spin" /> : component.status === 'complete' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Icon className="w-5 h-5 text-foreground-muted" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-foreground">{component.name}</h4>
                          <Badge variant="secondary" className={statusConfig.color}>{statusConfig.label}</Badge>
                        </div>
                        <p className="text-sm text-foreground-muted mb-2">{component.description}</p>
                        {(component.status === 'running' || component.status === 'complete') && (
                          <div className="space-y-2">
                            <div className="h-1.5 bg-background-surface rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-300 ${component.status === 'complete' ? 'bg-green-500' : 'bg-accent'}`} style={{ width: `${component.progress}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-xs text-foreground-muted">
                              <span>{Math.round(component.progress)}%</span>
                              {component.startedAt && <span>{component.status === 'complete' ? 'Completed in ' : 'Running for '}{formatDuration(new Date(component.startedAt), component.completedAt ? new Date(component.completedAt) : undefined)}</span>}
                            </div>
                          </div>
                        )}
                        {component.status === 'pending' && <div className="flex items-center gap-2 text-xs text-foreground-subtle"><Clock className="w-3 h-3" /><span>Waiting</span></div>}
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {/* Info */}
            <Card className="bg-background-elevated/50">
              <div className="flex gap-3">
                <Zap className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <h4 className="font-medium text-foreground mb-1">AI Analysis in Progress</h4>
                  <p className="text-sm text-foreground-muted">Analyzing across 7 key dimensions.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ==================== COMPLETE VIEW (Results) ====================
  if (status === 'complete') {
    const ratingConfig = assessment.rating ? RATING_CONFIG[assessment.rating] : RATING_CONFIG.promising

    return (
      <div className="flex flex-col h-full">
        <PageHeader
          icon={FileText}
          title="Assessment Results"
          description={assessment.title}
          actions={<Button variant="outline" className="gap-2" onClick={handleDownloadPDF}><Download className="w-4 h-4" />Download PDF</Button>}
        />

        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Rating */}
            <Card className={`border-2 ${ratingConfig.color.replace('bg-', 'border-')}/30`}>
              <div className="flex items-start gap-4">
                <div className={`w-16 h-16 rounded-xl ${ratingConfig.color}/20 flex items-center justify-center shrink-0`}>
                  <span className={`text-2xl font-bold ${ratingConfig.textColor}`}>{ratingConfig.label.charAt(0)}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-semibold text-foreground">Assessment Rating:</h2>
                    <Badge className={`${ratingConfig.color} text-white text-lg px-3`}>{ratingConfig.label}</Badge>
                  </div>
                  <p className="text-foreground-muted">{mockResults.ratingJustification}</p>
                </div>
              </div>
            </Card>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(mockResults.metrics).map(([key, metric]) => (
                <Card key={key} className="text-center">
                  <p className="text-xs text-foreground-muted uppercase mb-1">{key}</p>
                  <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-green-500">vs. {metric.benchmark}</p>
                </Card>
              ))}
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-green-500" /><h3 className="font-medium text-foreground">Key Strengths</h3></div>
                <ul className="space-y-2">{mockResults.summary.keyStrengths.map((s, i) => <li key={i} className="text-sm text-foreground-muted flex items-start gap-2"><span className="text-green-500">+</span>{s}</li>)}</ul>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5 text-amber-500" /><h3 className="font-medium text-foreground">Key Risks</h3></div>
                <ul className="space-y-2">{mockResults.summary.keyRisks.map((r, i) => <li key={i} className="text-sm text-foreground-muted flex items-start gap-2"><span className="text-amber-500">!</span>{r}</li>)}</ul>
              </Card>
              <Card>
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-5 h-5 text-accent" /><h3 className="font-medium text-foreground">Next Steps</h3></div>
                <ul className="space-y-2">{mockResults.summary.nextSteps.map((step, i) => <li key={i} className="text-sm text-foreground-muted flex items-start gap-2"><Badge variant="secondary" className="shrink-0 px-1.5 py-0 text-xs">{i + 1}</Badge>{step}</li>)}</ul>
              </Card>
            </div>

            {/* Claims Matrix */}
            <Card>
              <h3 className="font-medium text-foreground mb-4">Claims Validation Matrix</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-foreground-muted font-medium">Claim</th>
                      <th className="text-center py-2 px-3 text-foreground-muted font-medium">Validated</th>
                      <th className="text-center py-2 px-3 text-foreground-muted font-medium">Confidence</th>
                      <th className="text-left py-2 px-3 text-foreground-muted font-medium">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockResults.claimsMatrix.map((claim, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 px-3 text-foreground">{claim.claim}</td>
                        <td className="py-3 px-3 text-center">{claim.validated ? <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /> : <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto" />}</td>
                        <td className="py-3 px-3 text-center"><Badge variant="secondary" className={claim.confidence === 'high' ? 'text-green-500 bg-green-500/10' : claim.confidence === 'medium' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10'}>{claim.confidence}</Badge></td>
                        <td className="py-3 px-3 text-foreground-muted">{claim.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Download */}
            <Card className="bg-accent/5 border-accent/20">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">Download Your Report</h3>
                  <p className="text-sm text-foreground-muted">Full assessment with analysis and recommendations</p>
                </div>
                <Button className="gap-2" onClick={handleDownloadPDF}><Download className="w-4 h-4" />Download PDF</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Draft/Failed state
  return (
    <div className="flex flex-col h-full items-center justify-center">
      <p className="text-foreground-muted">Assessment status: {status}</p>
      <Button variant="outline" onClick={() => router.push('/assessments/new')} className="mt-4">Continue Setup</Button>
    </div>
  )
}
