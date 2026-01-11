/**
 * Improvement Opportunities Agent
 *
 * Identifies optimization pathways and R&D directions including:
 * - Cost reduction pathways
 * - Performance optimization opportunities
 * - Manufacturing scale-up strategies
 * - R&D priorities and roadmap
 * - Timeline and milestones
 *
 * Output: 10-15 pages of improvement analysis
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

interface CostReductionPathway {
  area: string
  currentCost: string
  targetCost: string
  reductionPotential: string
  strategies: Array<{
    strategy: string
    impact: 'high' | 'medium' | 'low'
    feasibility: 'high' | 'medium' | 'low'
    timeline: string
    investment: string
  }>
  barriers: string[]
  enablers: string[]
}

interface PerformanceOptimization {
  metric: string
  currentValue: string
  targetValue: string
  improvementPotential: string
  approaches: Array<{
    approach: string
    expectedImprovement: string
    maturity: 'proven' | 'emerging' | 'research'
    riskLevel: 'high' | 'medium' | 'low'
    timeline: string
  }>
  tradeoffs: string[]
}

interface ManufacturingScaleUp {
  currentScale: string
  targetScale: string
  scalingFactor: number
  challenges: Array<{
    challenge: string
    severity: 'high' | 'medium' | 'low'
    solution: string
    timeline: string
  }>
  economies: Array<{
    factor: string
    currentCost: string
    scaledCost: string
    learningRate: string
  }>
  supplyChainRequirements: string[]
  investmentRequired: string
}

interface RDPriority {
  priority: number
  area: string
  objective: string
  currentState: string
  targetState: string
  approach: string
  timeline: string
  investment: string
  expectedImpact: string
  successMetrics: string[]
  risks: string[]
}

interface Milestone {
  id: string
  name: string
  category: 'technical' | 'commercial' | 'regulatory' | 'manufacturing'
  targetDate: string
  dependencies: string[]
  deliverables: string[]
  successCriteria: string
  status: 'not_started' | 'in_progress' | 'complete'
}

interface ImprovementAnalysis {
  executiveSummary: string
  costReductionPathways: CostReductionPathway[]
  performanceOptimizations: PerformanceOptimization[]
  manufacturingScaleUp: ManufacturingScaleUp
  rdPriorities: RDPriority[]
  roadmap: {
    shortTerm: Milestone[]
    mediumTerm: Milestone[]
    longTerm: Milestone[]
  }
  investmentSummary: {
    totalRequired: string
    byCategory: Array<{ category: string; amount: string; percentage: number }>
    expectedReturns: string
  }
  citations: Citation[]
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class ImprovementOpportunitiesAgent extends BaseAssessmentAgent {
  constructor(input: AssessmentInput) {
    super('improvement-opportunities', input)
  }

  async execute(onProgress?: ProgressCallback): Promise<ComponentOutput> {
    const startTime = Date.now()

    try {
      onProgress?.(5, 'Starting improvement analysis...')

      // Step 1: Identify cost reduction pathways
      onProgress?.(15, 'Identifying cost reduction pathways...')
      const costReductionPathways = await this.identifyCostReductionPathways()

      // Step 2: Identify performance optimization opportunities
      onProgress?.(30, 'Identifying performance optimizations...')
      const performanceOptimizations = await this.identifyPerformanceOptimizations()

      // Step 3: Analyze manufacturing scale-up
      onProgress?.(45, 'Analyzing manufacturing scale-up...')
      const manufacturingScaleUp = await this.analyzeManufacturingScaleUp()

      // Step 4: Define R&D priorities
      onProgress?.(60, 'Defining R&D priorities...')
      const rdPriorities = await this.defineRDPriorities(
        costReductionPathways,
        performanceOptimizations
      )

      // Step 5: Build development roadmap
      onProgress?.(75, 'Building development roadmap...')
      const roadmap = await this.buildRoadmap(rdPriorities)

      // Step 6: Summarize investment requirements
      onProgress?.(85, 'Summarizing investment requirements...')
      const investmentSummary = await this.summarizeInvestment(
        rdPriorities,
        manufacturingScaleUp
      )

      // Step 7: Generate executive summary
      onProgress?.(92, 'Generating executive summary...')
      const executiveSummary = await this.generateExecutiveSummary(
        costReductionPathways,
        performanceOptimizations,
        rdPriorities
      )

      // Step 8: Gather citations
      onProgress?.(97, 'Compiling citations...')
      const citations = await this.gatherCitations()

      const analysis: ImprovementAnalysis = {
        executiveSummary,
        costReductionPathways,
        performanceOptimizations,
        manufacturingScaleUp,
        rdPriorities,
        roadmap,
        investmentSummary,
        citations,
      }

      // Generate report sections
      const sections = await this.generateReportSections({
        componentId: 'improvement-opportunities',
        componentName: 'Improvement Opportunities',
        status: 'complete',
        content: analysis,
        sections: [],
        duration: Date.now() - startTime,
      })

      onProgress?.(100, 'Improvement analysis complete')

      return {
        componentId: 'improvement-opportunities',
        componentName: 'Improvement Opportunities',
        status: 'complete',
        content: analysis,
        sections,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        componentId: 'improvement-opportunities',
        componentName: 'Improvement Opportunities',
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

  private async identifyCostReductionPathways(): Promise<CostReductionPathway[]> {
    const prompt = `Identify cost reduction pathways for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Identify major cost reduction opportunities. Return a JSON array:
[
  {
    "area": "Cost area (e.g., Stack/Reactor, BOP, Manufacturing, Installation)",
    "currentCost": "Current cost level",
    "targetCost": "Target cost level",
    "reductionPotential": "X% reduction potential",
    "strategies": [
      {
        "strategy": "Specific cost reduction strategy",
        "impact": "high|medium|low",
        "feasibility": "high|medium|low",
        "timeline": "Timeline to implement",
        "investment": "Investment required"
      }
    ],
    "barriers": ["Barrier to cost reduction 1", "Barrier 2"],
    "enablers": ["Enabler 1", "Enabler 2"]
  }
]

Include 4-6 cost reduction pathways covering:
- Materials and components
- Manufacturing processes
- Installation and balance of plant
- Operating costs

Return only the JSON array.`

    return this.generateJSON<CostReductionPathway[]>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async identifyPerformanceOptimizations(): Promise<PerformanceOptimization[]> {
    const primaryMetrics = this.getPrimaryMetrics()

    const prompt = `Identify performance optimization opportunities for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}
PRIMARY METRICS: ${primaryMetrics.join(', ')}

Identify performance improvement opportunities. Return a JSON array:
[
  {
    "metric": "Performance metric name",
    "currentValue": "Current value with unit",
    "targetValue": "Target value with unit",
    "improvementPotential": "X% improvement",
    "approaches": [
      {
        "approach": "Specific optimization approach",
        "expectedImprovement": "X% improvement in metric",
        "maturity": "proven|emerging|research",
        "riskLevel": "high|medium|low",
        "timeline": "Timeline to achieve"
      }
    ],
    "tradeoffs": ["Tradeoff 1 (e.g., cost vs performance)", "Tradeoff 2"]
  }
]

Include 4-6 performance optimizations covering key metrics.
Return only the JSON array.`

    return this.generateJSON<PerformanceOptimization[]>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async analyzeManufacturingScaleUp(): Promise<ManufacturingScaleUp> {
    const prompt = `Analyze manufacturing scale-up for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Analyze manufacturing scale-up requirements. Return a JSON object:
{
  "currentScale": "Current manufacturing scale (units/year or MW/year)",
  "targetScale": "Target commercial scale",
  "scalingFactor": 10,
  "challenges": [
    {
      "challenge": "Scale-up challenge",
      "severity": "high|medium|low",
      "solution": "Proposed solution",
      "timeline": "Timeline to resolve"
    }
  ],
  "economies": [
    {
      "factor": "Economy of scale factor",
      "currentCost": "Current cost at pilot scale",
      "scaledCost": "Projected cost at commercial scale",
      "learningRate": "Expected learning rate (%)"
    }
  ],
  "supplyChainRequirements": [
    "Supply chain requirement 1",
    "Supply chain requirement 2"
  ],
  "investmentRequired": "Total investment for scale-up"
}

Include 4-6 scale-up challenges and 3-4 economy factors.
Return only the JSON object.`

    return this.generateJSON<ManufacturingScaleUp>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async defineRDPriorities(
    costPathways: CostReductionPathway[],
    perfOpts: PerformanceOptimization[]
  ): Promise<RDPriority[]> {
    const prompt = `Define R&D priorities for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Cost reduction opportunities:
${costPathways.map(c => `- ${c.area}: ${c.reductionPotential}`).join('\n')}

Performance optimization opportunities:
${perfOpts.map(p => `- ${p.metric}: ${p.improvementPotential}`).join('\n')}

Define prioritized R&D areas. Return a JSON array:
[
  {
    "priority": 1,
    "area": "R&D focus area",
    "objective": "Specific objective",
    "currentState": "Current state of technology",
    "targetState": "Target state after R&D",
    "approach": "Technical approach",
    "timeline": "Timeline to achieve",
    "investment": "Investment required",
    "expectedImpact": "Expected impact on cost/performance",
    "successMetrics": ["Metric 1", "Metric 2"],
    "risks": ["Risk 1", "Risk 2"]
  }
]

Include 5-8 R&D priorities ranked by impact and feasibility.
Return only the JSON array.`

    return this.generateJSON<RDPriority[]>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async buildRoadmap(
    rdPriorities: RDPriority[]
  ): Promise<{ shortTerm: Milestone[]; mediumTerm: Milestone[]; longTerm: Milestone[] }> {
    const prompt = `Build development roadmap for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DOMAIN: ${this.domainCategory}

R&D Priorities:
${rdPriorities.map(r => `${r.priority}. ${r.area}: ${r.objective}`).join('\n')}

Build development roadmap. Return a JSON object:
{
  "shortTerm": [
    {
      "id": "m1",
      "name": "Milestone name",
      "category": "technical|commercial|regulatory|manufacturing",
      "targetDate": "Q2 2025",
      "dependencies": ["Dependency 1"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "successCriteria": "Specific success criteria",
      "status": "not_started"
    }
  ],
  "mediumTerm": [...],
  "longTerm": [...]
}

Timeframes:
- Short-term: 0-2 years (3-5 milestones)
- Medium-term: 2-5 years (3-5 milestones)
- Long-term: 5-10 years (2-4 milestones)

Return only the JSON object.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async summarizeInvestment(
    rdPriorities: RDPriority[],
    scaleUp: ManufacturingScaleUp
  ): Promise<{
    totalRequired: string
    byCategory: Array<{ category: string; amount: string; percentage: number }>
    expectedReturns: string
  }> {
    const prompt = `Summarize investment requirements for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}

R&D Investments: ${rdPriorities.map(r => r.investment).join(', ')}
Scale-up Investment: ${scaleUp.investmentRequired}

Summarize investment requirements. Return a JSON object:
{
  "totalRequired": "$XXM total investment required",
  "byCategory": [
    { "category": "R&D", "amount": "$XXM", "percentage": 30 },
    { "category": "Manufacturing Scale-up", "amount": "$XXM", "percentage": 40 },
    { "category": "Commercialization", "amount": "$XXM", "percentage": 30 }
  ],
  "expectedReturns": "2-3 sentence description of expected returns and payback from these investments"
}

Return only the JSON object.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'low',
    })
  }

  private async generateExecutiveSummary(
    costPathways: CostReductionPathway[],
    perfOpts: PerformanceOptimization[],
    rdPriorities: RDPriority[]
  ): Promise<string> {
    const prompt = `Generate executive summary of improvement opportunities for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}

Key cost reduction opportunities:
${costPathways.map(c => `- ${c.area}: ${c.reductionPotential}`).join('\n')}

Key performance improvements:
${perfOpts.map(p => `- ${p.metric}: ${p.improvementPotential}`).join('\n')}

Top R&D priorities:
${rdPriorities.slice(0, 3).map(r => `- ${r.area}: ${r.objective}`).join('\n')}

Generate a 3-4 paragraph executive summary highlighting:
1. Overall improvement potential
2. Key pathways to cost reduction
3. Critical R&D investments needed
4. Timeline and investment requirements

Return only the summary text, no JSON.`

    return this.generate(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async gatherCitations(): Promise<Citation[]> {
    const literature = await this.searchLiterature(
      `${this.input.technologyType} cost reduction roadmap technology improvement R&D`,
      12
    )

    return literature.map((lit, idx) => ({
      id: `imp-${idx + 1}`,
      text: `${lit.authors.join(', ')} (${lit.year}). ${lit.title}. ${lit.source}.`,
      source: lit.source,
      url: lit.url,
      year: lit.year,
    }))
  }

  // ==========================================================================
  // Report Generation
  // ==========================================================================

  async generateReportSections(output: ComponentOutput): Promise<ReportSection[]> {
    const analysis = output.content as ImprovementAnalysis
    const sections: ReportSection[] = []

    // Executive Summary
    sections.push(this.createSection(
      'imp-6-0',
      'Improvement Opportunities - Executive Summary',
      2,
      analysis.executiveSummary
    ))

    // Section 6.1: Cost Reduction Pathways
    sections.push(this.createSection(
      'imp-6-1',
      'Cost Reduction Pathways',
      2,
      'Key pathways for reducing technology costs are identified below, with strategies ranked by impact and feasibility.',
      {
        tables: analysis.costReductionPathways.map((pathway, idx) =>
          this.createCostPathwayTable(pathway, idx + 1)
        ),
      }
    ))

    // Section 6.2: Performance Optimization
    sections.push(this.createSection(
      'imp-6-2',
      'Performance Optimization',
      2,
      'Opportunities for improving key performance metrics through technical innovation.',
      {
        tables: [this.createPerformanceOptimizationTable(analysis.performanceOptimizations)],
      }
    ))

    // Section 6.3: Manufacturing Scale-Up
    sections.push(this.createSection(
      'imp-6-3',
      'Manufacturing Scale-Up',
      2,
      `Current Scale: ${analysis.manufacturingScaleUp.currentScale}\n` +
      `Target Scale: ${analysis.manufacturingScaleUp.targetScale}\n` +
      `Scaling Factor: ${analysis.manufacturingScaleUp.scalingFactor}x\n` +
      `Investment Required: ${analysis.manufacturingScaleUp.investmentRequired}\n\n` +
      'Supply Chain Requirements:\n' +
      analysis.manufacturingScaleUp.supplyChainRequirements.map((r, i) => `${i + 1}. ${r}`).join('\n'),
      {
        tables: [
          this.createScaleUpChallengesTable(analysis.manufacturingScaleUp),
          this.createEconomiesTable(analysis.manufacturingScaleUp),
        ],
      }
    ))

    // Section 6.4: R&D Priorities
    sections.push(this.createSection(
      'imp-6-4',
      'R&D Priorities',
      2,
      'Prioritized research and development areas to achieve cost and performance targets.',
      {
        tables: [this.createRDPrioritiesTable(analysis.rdPriorities)],
      }
    ))

    // Section 6.5: Development Roadmap
    sections.push(this.createSection(
      'imp-6-5',
      'Timeline and Milestones',
      2,
      'Development roadmap with key milestones across short, medium, and long-term horizons.',
      {
        tables: [
          this.createMilestonesTable('Short-Term (0-2 years)', analysis.roadmap.shortTerm),
          this.createMilestonesTable('Medium-Term (2-5 years)', analysis.roadmap.mediumTerm),
          this.createMilestonesTable('Long-Term (5-10 years)', analysis.roadmap.longTerm),
        ],
        charts: [this.createRoadmapChart(analysis.roadmap)],
      }
    ))

    // Section 6.6: Investment Summary
    sections.push(this.createSection(
      'imp-6-6',
      'Investment Summary',
      2,
      `Total Investment Required: ${analysis.investmentSummary.totalRequired}\n\n` +
      analysis.investmentSummary.expectedReturns,
      {
        tables: [this.createInvestmentTable(analysis.investmentSummary)],
        citations: analysis.citations,
      }
    ))

    return sections
  }

  // ==========================================================================
  // Table Creation Helpers
  // ==========================================================================

  private createCostPathwayTable(pathway: CostReductionPathway, index: number): ReportTable {
    return this.createTable(
      `imp-cost-${index}`,
      `Cost Reduction: ${pathway.area}`,
      ['Strategy', 'Impact', 'Feasibility', 'Timeline', 'Investment'],
      pathway.strategies.map(s => [
        s.strategy,
        s.impact.toUpperCase(),
        s.feasibility.toUpperCase(),
        s.timeline,
        s.investment,
      ]),
      [
        `Current: ${pathway.currentCost} | Target: ${pathway.targetCost} | Potential: ${pathway.reductionPotential}`,
      ]
    )
  }

  private createPerformanceOptimizationTable(optimizations: PerformanceOptimization[]): ReportTable {
    const rows: string[][] = []
    for (const opt of optimizations) {
      for (const approach of opt.approaches) {
        rows.push([
          opt.metric,
          `${opt.currentValue} -> ${opt.targetValue}`,
          approach.approach,
          approach.expectedImprovement,
          approach.maturity.toUpperCase(),
          approach.timeline,
        ])
      }
    }

    return this.createTable(
      'imp-perf-opt',
      'Performance Optimization Opportunities',
      ['Metric', 'Current -> Target', 'Approach', 'Improvement', 'Maturity', 'Timeline'],
      rows
    )
  }

  private createScaleUpChallengesTable(scaleUp: ManufacturingScaleUp): ReportTable {
    return this.createTable(
      'imp-scaleup-challenges',
      'Scale-Up Challenges',
      ['Challenge', 'Severity', 'Solution', 'Timeline'],
      scaleUp.challenges.map(c => [
        c.challenge,
        c.severity.toUpperCase(),
        c.solution,
        c.timeline,
      ])
    )
  }

  private createEconomiesTable(scaleUp: ManufacturingScaleUp): ReportTable {
    return this.createTable(
      'imp-economies',
      'Economies of Scale',
      ['Factor', 'Current Cost', 'Scaled Cost', 'Learning Rate'],
      scaleUp.economies.map(e => [
        e.factor,
        e.currentCost,
        e.scaledCost,
        e.learningRate,
      ])
    )
  }

  private createRDPrioritiesTable(priorities: RDPriority[]): ReportTable {
    return this.createTable(
      'imp-rd-priorities',
      'R&D Priorities',
      ['Priority', 'Area', 'Objective', 'Timeline', 'Investment', 'Expected Impact'],
      priorities.map(p => [
        p.priority.toString(),
        p.area,
        p.objective,
        p.timeline,
        p.investment,
        p.expectedImpact,
      ])
    )
  }

  private createMilestonesTable(title: string, milestones: Milestone[]): ReportTable {
    return this.createTable(
      `imp-milestones-${title.toLowerCase().replace(/[^a-z]/g, '')}`,
      title,
      ['Milestone', 'Category', 'Target Date', 'Deliverables', 'Success Criteria'],
      milestones.map(m => [
        m.name,
        m.category.toUpperCase(),
        m.targetDate,
        m.deliverables.slice(0, 2).join('; '),
        m.successCriteria,
      ])
    )
  }

  private createInvestmentTable(
    investment: { byCategory: Array<{ category: string; amount: string; percentage: number }> }
  ): ReportTable {
    return this.createTable(
      'imp-investment',
      'Investment Breakdown',
      ['Category', 'Amount', 'Percentage'],
      investment.byCategory.map(c => [
        c.category,
        c.amount,
        `${c.percentage}%`,
      ])
    )
  }

  // ==========================================================================
  // Chart Creation Helpers
  // ==========================================================================

  private createRoadmapChart(roadmap: {
    shortTerm: Milestone[]
    mediumTerm: Milestone[]
    longTerm: Milestone[]
  }): ReportChart {
    return {
      id: 'imp-roadmap',
      title: 'Development Roadmap',
      type: 'bar', // Gantt-style
      data: {
        milestones: [
          ...roadmap.shortTerm.map(m => ({ ...m, phase: 'Short-term' })),
          ...roadmap.mediumTerm.map(m => ({ ...m, phase: 'Medium-term' })),
          ...roadmap.longTerm.map(m => ({ ...m, phase: 'Long-term' })),
        ],
      },
    }
  }
}
