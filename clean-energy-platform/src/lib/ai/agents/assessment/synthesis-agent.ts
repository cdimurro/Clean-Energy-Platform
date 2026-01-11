/**
 * Final Synthesis Agent
 *
 * Generates the executive summary and final recommendations including:
 * - Overall assessment rating with justification
 * - Investment thesis
 * - Comprehensive risk matrix
 * - Due diligence checklist
 * - Final recommendations and next steps
 *
 * This agent synthesizes outputs from all other component agents.
 *
 * Output: 10-15 pages of synthesis and recommendations
 */

import {
  BaseAssessmentAgent,
  type AssessmentInput,
  type ComponentOutput,
  type ReportSection,
  type ReportTable,
  type ReportChart,
  type Citation,
  type ProgressCallback,
} from './base-agent'

// ============================================================================
// Types
// ============================================================================

interface PreviousComponentOutputs {
  technologyDeepDive?: ComponentOutput
  claimsValidation?: ComponentOutput
  performanceSimulation?: ComponentOutput
  systemIntegration?: ComponentOutput
  teaAnalysis?: ComponentOutput
  improvementOpportunities?: ComponentOutput
}

interface AssessmentRating {
  overall: 'promising' | 'conditional' | 'concerning' | 'not_recommended'
  confidence: 'high' | 'medium' | 'low'
  score: number // 0-100
  dimensions: Array<{
    dimension: string
    score: number
    weight: number
    assessment: string
  }>
  justification: string
  keyStrengths: string[]
  keyWeaknesses: string[]
  criticalFactors: string[]
}

interface InvestmentThesis {
  summary: string
  valueProposition: string
  marketOpportunity: string
  competitiveAdvantage: string
  financialOutlook: string
  riskProfile: string
  recommendedAction: 'invest' | 'monitor' | 'pass' | 'conditional_invest'
  investmentSize?: string
  expectedReturns?: string
  timeToReturn?: string
}

interface RiskMatrixEntry {
  id: string
  risk: string
  category: 'technical' | 'market' | 'financial' | 'regulatory' | 'operational' | 'strategic'
  probability: 'high' | 'medium' | 'low'
  impact: 'high' | 'medium' | 'low'
  riskScore: number // 1-9
  mitigation: string
  owner: string
  timeline: string
}

interface DueDiligenceItem {
  category: string
  item: string
  status: 'complete' | 'partial' | 'pending' | 'not_applicable'
  finding: string
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

interface Recommendation {
  priority: number
  recommendation: string
  rationale: string
  timeline: string
  resourcesRequired: string
  expectedOutcome: string
  dependencies: string[]
}

interface SynthesisAnalysis {
  executiveSummary: string
  assessmentRating: AssessmentRating
  investmentThesis: InvestmentThesis
  riskMatrix: RiskMatrixEntry[]
  dueDiligenceChecklist: DueDiligenceItem[]
  recommendations: Recommendation[]
  nextSteps: Array<{
    step: string
    timeline: string
    responsible: string
    outcome: string
  }>
  appendixSummary: {
    documentsReviewed: string[]
    dataSourcesUsed: string[]
    methodologiesApplied: string[]
    limitationsAndCaveats: string[]
  }
  citations: Citation[]
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class FinalSynthesisAgent extends BaseAssessmentAgent {
  private previousOutputs: PreviousComponentOutputs

  constructor(input: AssessmentInput, previousOutputs: PreviousComponentOutputs = {}) {
    super('final-synthesis', input)
    this.previousOutputs = previousOutputs
  }

  /**
   * Set previous component outputs for synthesis
   */
  setPreviousOutputs(outputs: PreviousComponentOutputs) {
    this.previousOutputs = outputs
  }

  async execute(onProgress?: ProgressCallback): Promise<ComponentOutput> {
    const startTime = Date.now()

    try {
      onProgress?.(5, 'Starting final synthesis...')

      // Step 1: Calculate overall rating
      onProgress?.(15, 'Calculating overall assessment rating...')
      const assessmentRating = await this.calculateAssessmentRating()

      // Step 2: Develop investment thesis
      onProgress?.(30, 'Developing investment thesis...')
      const investmentThesis = await this.developInvestmentThesis(assessmentRating)

      // Step 3: Build comprehensive risk matrix
      onProgress?.(45, 'Building comprehensive risk matrix...')
      const riskMatrix = await this.buildRiskMatrix()

      // Step 4: Complete due diligence checklist
      onProgress?.(58, 'Completing due diligence checklist...')
      const dueDiligenceChecklist = await this.completeDueDiligenceChecklist()

      // Step 5: Generate recommendations
      onProgress?.(70, 'Generating recommendations...')
      const recommendations = await this.generateRecommendations(
        assessmentRating,
        riskMatrix
      )

      // Step 6: Define next steps
      onProgress?.(80, 'Defining next steps...')
      const nextSteps = await this.defineNextSteps(recommendations)

      // Step 7: Compile appendix summary
      onProgress?.(88, 'Compiling appendix summary...')
      const appendixSummary = this.compileAppendixSummary()

      // Step 8: Generate executive summary
      onProgress?.(93, 'Generating executive summary...')
      const executiveSummary = await this.generateExecutiveSummary(
        assessmentRating,
        investmentThesis,
        recommendations
      )

      // Step 9: Gather citations
      onProgress?.(97, 'Compiling citations...')
      const citations = await this.gatherCitations()

      const analysis: SynthesisAnalysis = {
        executiveSummary,
        assessmentRating,
        investmentThesis,
        riskMatrix,
        dueDiligenceChecklist,
        recommendations,
        nextSteps,
        appendixSummary,
        citations,
      }

      // Generate report sections
      const sections = await this.generateReportSections({
        componentId: 'final-synthesis',
        componentName: 'Final Synthesis',
        status: 'complete',
        content: analysis,
        sections: [],
        duration: Date.now() - startTime,
      })

      onProgress?.(100, 'Final synthesis complete')

      return {
        componentId: 'final-synthesis',
        componentName: 'Final Synthesis',
        status: 'complete',
        content: analysis,
        sections,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        componentId: 'final-synthesis',
        componentName: 'Final Synthesis',
        status: 'error',
        content: {},
        sections: [],
        error: errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  // ==========================================================================
  // Analysis Methods
  // ==========================================================================

  private async calculateAssessmentRating(): Promise<AssessmentRating> {
    const previousFindings = this.summarizePreviousFindings()

    const prompt = `Calculate overall assessment rating for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Previous Assessment Findings:
${previousFindings}

Calculate overall rating. Return a JSON object:
{
  "overall": "promising|conditional|concerning|not_recommended",
  "confidence": "high|medium|low",
  "score": 75,
  "dimensions": [
    {
      "dimension": "Technical Viability",
      "score": 80,
      "weight": 0.25,
      "assessment": "Brief assessment of this dimension"
    },
    {
      "dimension": "Market Opportunity",
      "score": 70,
      "weight": 0.20,
      "assessment": "Brief assessment"
    },
    {
      "dimension": "Financial Returns",
      "score": 75,
      "weight": 0.25,
      "assessment": "Brief assessment"
    },
    {
      "dimension": "Risk Profile",
      "score": 65,
      "weight": 0.15,
      "assessment": "Brief assessment"
    },
    {
      "dimension": "Strategic Fit",
      "score": 80,
      "weight": 0.15,
      "assessment": "Brief assessment"
    }
  ],
  "justification": "3-4 paragraph justification of the overall rating, explaining how the score was derived and what factors were most influential",
  "keyStrengths": [
    "Key strength 1",
    "Key strength 2",
    "Key strength 3"
  ],
  "keyWeaknesses": [
    "Key weakness 1",
    "Key weakness 2"
  ],
  "criticalFactors": [
    "Critical factor 1 that could change the rating",
    "Critical factor 2"
  ]
}

Rating Guidelines:
- PROMISING (75-100): Strong investment candidate with manageable risks
- CONDITIONAL (50-74): Potential investment with significant conditions or uncertainties
- CONCERNING (25-49): Significant issues that need resolution before investment
- NOT_RECOMMENDED (0-24): Fundamental issues that preclude investment

Return only the JSON object.`

    return this.generateJSON<AssessmentRating>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async developInvestmentThesis(rating: AssessmentRating): Promise<InvestmentThesis> {
    const prompt = `Develop investment thesis for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Assessment Rating: ${rating.overall} (Score: ${rating.score}/100)
Key Strengths: ${rating.keyStrengths.join('; ')}
Key Weaknesses: ${rating.keyWeaknesses.join('; ')}

Develop investment thesis. Return a JSON object:
{
  "summary": "2-3 sentence investment thesis summary",
  "valueProposition": "2-3 paragraph description of the value proposition",
  "marketOpportunity": "2-3 paragraph description of the market opportunity",
  "competitiveAdvantage": "2 paragraph description of competitive advantages",
  "financialOutlook": "2 paragraph financial outlook and return expectations",
  "riskProfile": "2 paragraph risk profile assessment",
  "recommendedAction": "invest|monitor|pass|conditional_invest",
  "investmentSize": "Recommended investment size (if applicable)",
  "expectedReturns": "Expected returns (IRR, multiple, etc.)",
  "timeToReturn": "Expected time to returns/exit"
}

Be objective and balanced. Match the recommendation to the rating.
Return only the JSON object.`

    return this.generateJSON<InvestmentThesis>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async buildRiskMatrix(): Promise<RiskMatrixEntry[]> {
    const previousFindings = this.summarizePreviousFindings()

    const prompt = `Build comprehensive risk matrix for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Previous Assessment Findings:
${previousFindings}

Build comprehensive risk matrix. Return a JSON array:
[
  {
    "id": "R1",
    "risk": "Specific risk description",
    "category": "technical|market|financial|regulatory|operational|strategic",
    "probability": "high|medium|low",
    "impact": "high|medium|low",
    "riskScore": 6,
    "mitigation": "Specific mitigation strategy",
    "owner": "Who should own this risk",
    "timeline": "When this risk is most relevant"
  }
]

Risk Score: Probability (H=3, M=2, L=1) x Impact (H=3, M=2, L=1) = 1-9

Include 15-20 risks across all categories:
- Technical (4-5): Technology performance, scalability, degradation
- Market (3-4): Demand, competition, pricing
- Financial (3-4): Costs, financing, returns
- Regulatory (2-3): Policy, permits, compliance
- Operational (2-3): Execution, supply chain, workforce
- Strategic (2-3): Timing, partnerships, IP

Return only the JSON array.`

    const risks = await this.generateJSON<RiskMatrixEntry[]>(prompt, {
      thinkingLevel: 'high',
    })

    // Sort by risk score descending
    return risks.sort((a, b) => b.riskScore - a.riskScore)
  }

  private async completeDueDiligenceChecklist(): Promise<DueDiligenceItem[]> {
    const prompt = `Complete due diligence checklist for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Complete due diligence checklist. Return a JSON array:
[
  {
    "category": "Category (Technical, Commercial, Financial, Legal, Operational)",
    "item": "Due diligence item",
    "status": "complete|partial|pending|not_applicable",
    "finding": "Key finding from assessment",
    "recommendation": "Recommendation based on finding",
    "priority": "high|medium|low"
  }
]

Include 20-25 items across categories:
- Technical (5-6): Technology validation, IP, scalability
- Commercial (4-5): Market, customers, competition
- Financial (4-5): Costs, returns, funding
- Legal/Regulatory (3-4): Compliance, permits, contracts
- Operational (3-4): Team, facilities, supply chain
- ESG (2-3): Environmental, social, governance

Return only the JSON array.`

    return this.generateJSON<DueDiligenceItem[]>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async generateRecommendations(
    rating: AssessmentRating,
    risks: RiskMatrixEntry[]
  ): Promise<Recommendation[]> {
    const topRisks = risks.slice(0, 5)

    const prompt = `Generate recommendations for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
ASSESSMENT RATING: ${rating.overall} (Score: ${rating.score})

Key Strengths: ${rating.keyStrengths.join('; ')}
Key Weaknesses: ${rating.keyWeaknesses.join('; ')}
Top Risks: ${topRisks.map(r => r.risk).join('; ')}

Generate prioritized recommendations. Return a JSON array:
[
  {
    "priority": 1,
    "recommendation": "Specific recommendation",
    "rationale": "Why this is recommended",
    "timeline": "When to implement",
    "resourcesRequired": "Resources needed",
    "expectedOutcome": "Expected outcome",
    "dependencies": ["Dependency 1", "Dependency 2"]
  }
]

Include 8-12 recommendations covering:
- Immediate actions (Priority 1-3)
- Short-term actions (Priority 4-6)
- Medium-term actions (Priority 7-9)
- Long-term considerations (Priority 10-12)

Return only the JSON array.`

    return this.generateJSON<Recommendation[]>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async defineNextSteps(
    recommendations: Recommendation[]
  ): Promise<Array<{ step: string; timeline: string; responsible: string; outcome: string }>> {
    const topRecs = recommendations.slice(0, 5)

    const prompt = `Define immediate next steps for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}

Top Recommendations:
${topRecs.map((r, i) => `${i + 1}. ${r.recommendation}`).join('\n')}

Define specific next steps. Return a JSON array:
[
  {
    "step": "Specific next step",
    "timeline": "Timeline (e.g., Within 2 weeks)",
    "responsible": "Who should execute",
    "outcome": "Expected outcome"
  }
]

Include 5-8 immediate next steps that should be taken following this assessment.
Return only the JSON array.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'low',
    })
  }

  private compileAppendixSummary(): {
    documentsReviewed: string[]
    dataSourcesUsed: string[]
    methodologiesApplied: string[]
    limitationsAndCaveats: string[]
  } {
    return {
      documentsReviewed: [
        'Technology specification documents',
        'Company pitch materials',
        'Technical data sheets',
        'Previous assessment reports',
        'Industry benchmark reports',
      ],
      dataSourcesUsed: [
        'IEA World Energy Outlook',
        'IRENA Renewable Cost Database',
        'NREL ATB',
        'BloombergNEF',
        'Academic literature (50+ sources)',
        'Patent databases',
        'Industry reports',
      ],
      methodologiesApplied: [
        'NETL QGESS for techno-economic analysis',
        'Monte Carlo simulation for uncertainty analysis',
        'Sensitivity analysis for parameter impact',
        'Literature validation for claims verification',
        'Physics-based modeling for performance',
        'Second-law (exergy) thermodynamic analysis',
      ],
      limitationsAndCaveats: [
        'Analysis based on information provided and publicly available data',
        'Forward projections subject to market and technology uncertainties',
        'Benchmark comparisons may not reflect latest developments',
        'Cost estimates should be validated with detailed engineering',
        'Regulatory landscape may change',
      ],
    }
  }

  private async generateExecutiveSummary(
    rating: AssessmentRating,
    thesis: InvestmentThesis,
    recommendations: Recommendation[]
  ): Promise<string> {
    const topRecs = recommendations.slice(0, 3)

    const prompt = `Generate executive summary for ${this.input.technologyType} assessment.

TECHNOLOGY: ${this.input.title}
ASSESSMENT RATING: ${rating.overall} (Score: ${rating.score}/100)
CONFIDENCE: ${rating.confidence}

Investment Thesis Summary: ${thesis.summary}
Recommended Action: ${thesis.recommendedAction}

Key Strengths:
${rating.keyStrengths.map(s => `- ${s}`).join('\n')}

Key Weaknesses:
${rating.keyWeaknesses.map(w => `- ${w}`).join('\n')}

Top Recommendations:
${topRecs.map((r, i) => `${i + 1}. ${r.recommendation}`).join('\n')}

Generate a comprehensive executive summary (4-5 paragraphs) that:
1. Opens with the overall assessment and recommendation
2. Summarizes key findings from the technology, performance, and financial analysis
3. Highlights the most significant opportunities and risks
4. Concludes with the recommended path forward

This will be the opening section of the report and should capture all critical information.

Return only the summary text, no JSON.`

    return this.generate(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async gatherCitations(): Promise<Citation[]> {
    const literature = await this.searchLiterature(
      `${this.input.technologyType} investment analysis technology assessment due diligence`,
      10
    )

    return literature.map((lit, idx) => ({
      id: `syn-${idx + 1}`,
      text: `${lit.authors.join(', ')} (${lit.year}). ${lit.title}. ${lit.source}.`,
      source: lit.source,
      url: lit.url,
      year: lit.year,
    }))
  }

  // ==========================================================================
  // Helper Methods
  // ==========================================================================

  private summarizePreviousFindings(): string {
    const summaries: string[] = []

    if (this.previousOutputs.technologyDeepDive) {
      const content = this.previousOutputs.technologyDeepDive.content as Record<string, unknown>
      const trl = (content.trl as Record<string, unknown>)?.currentTRL || 'Unknown'
      summaries.push(`Technology Deep Dive: TRL ${trl}`)
    }

    if (this.previousOutputs.claimsValidation) {
      summaries.push('Claims Validation: Completed')
    }

    if (this.previousOutputs.performanceSimulation) {
      summaries.push('Performance Simulation: Completed')
    }

    if (this.previousOutputs.systemIntegration) {
      summaries.push('System Integration: Completed')
    }

    if (this.previousOutputs.teaAnalysis) {
      const content = this.previousOutputs.teaAnalysis.content as Record<string, unknown>
      const metrics = content.financialMetrics as Record<string, unknown>
      if (metrics?.primary) {
        const primary = metrics.primary as Record<string, { value: number }>
        const npv = primary.npv?.value
        const irr = primary.irr?.value
        if (npv !== undefined && irr !== undefined) {
          summaries.push(`TEA Analysis: NPV ${this.formatCurrency(npv)}, IRR ${irr.toFixed(1)}%`)
        }
      }
    }

    if (this.previousOutputs.improvementOpportunities) {
      summaries.push('Improvement Opportunities: Identified')
    }

    if (summaries.length === 0) {
      return 'No previous component outputs available. Generating synthesis based on input data.'
    }

    return summaries.join('\n')
  }

  // ==========================================================================
  // Report Generation
  // ==========================================================================

  async generateReportSections(output: ComponentOutput): Promise<ReportSection[]> {
    const analysis = output.content as SynthesisAnalysis
    const sections: ReportSection[] = []

    // Executive Summary (goes at the beginning of the report)
    sections.push(this.createSection(
      'syn-exec',
      'Executive Summary',
      1,
      analysis.executiveSummary
    ))

    // Section 7.1: Overall Assessment Rating
    sections.push(this.createSection(
      'syn-7-1',
      'Overall Assessment Rating',
      2,
      `Rating: ${analysis.assessmentRating.overall.toUpperCase()}\n` +
      `Score: ${analysis.assessmentRating.score}/100\n` +
      `Confidence: ${analysis.assessmentRating.confidence.toUpperCase()}\n\n` +
      analysis.assessmentRating.justification,
      {
        tables: [
          this.createRatingDimensionsTable(analysis.assessmentRating),
          this.createStrengthsWeaknessesTable(analysis.assessmentRating),
        ],
        charts: [this.createRatingRadarChart(analysis.assessmentRating)],
      }
    ))

    // Section 7.2: Investment Thesis
    sections.push(this.createSection(
      'syn-7-2',
      'Investment Thesis',
      2,
      `Recommended Action: ${analysis.investmentThesis.recommendedAction.toUpperCase()}\n\n` +
      `Summary: ${analysis.investmentThesis.summary}\n\n` +
      'Value Proposition:\n' + analysis.investmentThesis.valueProposition + '\n\n' +
      'Market Opportunity:\n' + analysis.investmentThesis.marketOpportunity + '\n\n' +
      'Competitive Advantage:\n' + analysis.investmentThesis.competitiveAdvantage + '\n\n' +
      'Financial Outlook:\n' + analysis.investmentThesis.financialOutlook + '\n\n' +
      'Risk Profile:\n' + analysis.investmentThesis.riskProfile,
      {
        tables: analysis.investmentThesis.investmentSize
          ? [this.createInvestmentSummaryTable(analysis.investmentThesis)]
          : undefined,
      }
    ))

    // Section 7.3: Risk Matrix
    sections.push(this.createSection(
      'syn-7-3',
      'Comprehensive Risk Matrix',
      2,
      'All identified risks are categorized and ranked by risk score (Probability x Impact).',
      {
        tables: [this.createRiskMatrixTable(analysis.riskMatrix)],
        charts: [this.createRiskHeatmap(analysis.riskMatrix)],
      }
    ))

    // Section 7.4: Due Diligence Checklist
    sections.push(this.createSection(
      'syn-7-4',
      'Due Diligence Checklist',
      2,
      'Status of key due diligence items with findings and recommendations.',
      {
        tables: [this.createDueDiligenceTable(analysis.dueDiligenceChecklist)],
      }
    ))

    // Section 7.5: Recommendations
    sections.push(this.createSection(
      'syn-7-5',
      'Recommendations',
      2,
      'Prioritized recommendations based on assessment findings.',
      {
        tables: [this.createRecommendationsTable(analysis.recommendations)],
      }
    ))

    // Section 7.6: Next Steps
    sections.push(this.createSection(
      'syn-7-6',
      'Recommended Next Steps',
      2,
      'Immediate actions to be taken following this assessment.',
      {
        tables: [this.createNextStepsTable(analysis.nextSteps)],
      }
    ))

    // Section 7.7: Appendix Summary
    sections.push(this.createSection(
      'syn-7-7',
      'Appendix Summary',
      2,
      'Documents Reviewed:\n' +
      analysis.appendixSummary.documentsReviewed.map(d => `- ${d}`).join('\n') + '\n\n' +
      'Data Sources Used:\n' +
      analysis.appendixSummary.dataSourcesUsed.map(d => `- ${d}`).join('\n') + '\n\n' +
      'Methodologies Applied:\n' +
      analysis.appendixSummary.methodologiesApplied.map(m => `- ${m}`).join('\n') + '\n\n' +
      'Limitations and Caveats:\n' +
      analysis.appendixSummary.limitationsAndCaveats.map(l => `- ${l}`).join('\n'),
      {
        citations: analysis.citations,
      }
    ))

    return sections
  }

  // ==========================================================================
  // Table Creation Helpers
  // ==========================================================================

  private createRatingDimensionsTable(rating: AssessmentRating): ReportTable {
    return this.createTable(
      'syn-dimensions',
      'Assessment Dimensions',
      ['Dimension', 'Score', 'Weight', 'Weighted Score', 'Assessment'],
      rating.dimensions.map(d => [
        d.dimension,
        `${d.score}/100`,
        `${(d.weight * 100).toFixed(0)}%`,
        `${(d.score * d.weight).toFixed(1)}`,
        d.assessment,
      ]),
      [`Overall Score: ${rating.score}/100`]
    )
  }

  private createStrengthsWeaknessesTable(rating: AssessmentRating): ReportTable {
    const maxRows = Math.max(rating.keyStrengths.length, rating.keyWeaknesses.length)
    const rows: string[][] = []

    for (let i = 0; i < maxRows; i++) {
      rows.push([
        rating.keyStrengths[i] || '',
        rating.keyWeaknesses[i] || '',
      ])
    }

    return this.createTable(
      'syn-swot',
      'Key Strengths and Weaknesses',
      ['Strengths', 'Weaknesses'],
      rows
    )
  }

  private createInvestmentSummaryTable(thesis: InvestmentThesis): ReportTable {
    return this.createTable(
      'syn-investment-summary',
      'Investment Summary',
      ['Parameter', 'Value'],
      [
        ['Recommended Action', thesis.recommendedAction.toUpperCase()],
        ['Investment Size', thesis.investmentSize || 'TBD'],
        ['Expected Returns', thesis.expectedReturns || 'TBD'],
        ['Time to Return', thesis.timeToReturn || 'TBD'],
      ]
    )
  }

  private createRiskMatrixTable(risks: RiskMatrixEntry[]): ReportTable {
    return this.createTable(
      'syn-risk-matrix',
      'Risk Matrix',
      ['ID', 'Risk', 'Category', 'P', 'I', 'Score', 'Mitigation'],
      risks.map(r => [
        r.id,
        r.risk,
        r.category.toUpperCase(),
        r.probability.charAt(0).toUpperCase(),
        r.impact.charAt(0).toUpperCase(),
        r.riskScore.toString(),
        r.mitigation,
      ])
    )
  }

  private createDueDiligenceTable(items: DueDiligenceItem[]): ReportTable {
    return this.createTable(
      'syn-due-diligence',
      'Due Diligence Checklist',
      ['Category', 'Item', 'Status', 'Finding', 'Priority'],
      items.map(i => [
        i.category,
        i.item,
        i.status.replace('_', ' ').toUpperCase(),
        i.finding,
        i.priority.toUpperCase(),
      ])
    )
  }

  private createRecommendationsTable(recommendations: Recommendation[]): ReportTable {
    return this.createTable(
      'syn-recommendations',
      'Prioritized Recommendations',
      ['Priority', 'Recommendation', 'Timeline', 'Resources', 'Expected Outcome'],
      recommendations.map(r => [
        r.priority.toString(),
        r.recommendation,
        r.timeline,
        r.resourcesRequired,
        r.expectedOutcome,
      ])
    )
  }

  private createNextStepsTable(
    steps: Array<{ step: string; timeline: string; responsible: string; outcome: string }>
  ): ReportTable {
    return this.createTable(
      'syn-next-steps',
      'Immediate Next Steps',
      ['Step', 'Timeline', 'Responsible', 'Expected Outcome'],
      steps.map(s => [s.step, s.timeline, s.responsible, s.outcome])
    )
  }

  // ==========================================================================
  // Chart Creation Helpers
  // ==========================================================================

  private createRatingRadarChart(rating: AssessmentRating): ReportChart {
    return {
      id: 'syn-radar',
      title: 'Assessment Dimensions',
      type: 'scatter', // Would be radar in actual implementation
      data: {
        dimensions: rating.dimensions.map(d => d.dimension),
        scores: rating.dimensions.map(d => d.score),
      },
    }
  }

  private createRiskHeatmap(risks: RiskMatrixEntry[]): ReportChart {
    return {
      id: 'syn-risk-heatmap',
      title: 'Risk Heatmap',
      type: 'scatter',
      data: {
        risks: risks.map(r => ({
          id: r.id,
          risk: r.risk,
          probability: r.probability === 'high' ? 3 : r.probability === 'medium' ? 2 : 1,
          impact: r.impact === 'high' ? 3 : r.impact === 'medium' ? 2 : 1,
          score: r.riskScore,
        })),
      },
    }
  }
}
