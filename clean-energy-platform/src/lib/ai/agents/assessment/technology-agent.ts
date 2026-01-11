/**
 * Technology Deep Dive Agent
 *
 * Generates comprehensive technology analysis including:
 * - Technology overview and working principles
 * - Core innovation analysis
 * - Competitive landscape mapping
 * - Intellectual property assessment
 * - Technology Readiness Level (TRL) evaluation
 * - Key technical differentiators
 *
 * Output: 15-20 pages of detailed technical analysis
 */

import {
  BaseAssessmentAgent,
  type AssessmentInput,
  type ComponentOutput,
  type ReportSection,
  type ReportTable,
  type Citation,
  type ProgressCallback,
  type LiteratureResult,
} from './base-agent'

// ============================================================================
// Types
// ============================================================================

interface TechnologyOverview {
  summary: string
  workingPrinciple: string
  keyComponents: string[]
  performanceMetrics: Array<{
    metric: string
    value: string
    unit: string
    context: string
  }>
  maturityStage: string
  primaryApplications: string[]
}

interface InnovationAnalysis {
  coreInnovations: Array<{
    name: string
    description: string
    novelty: 'breakthrough' | 'incremental' | 'derivative'
    impact: string
  }>
  technicalAdvantages: string[]
  technicalChallenges: string[]
  differentiatingFactors: string[]
}

interface Competitor {
  name: string
  technology: string
  stage: string
  strengths: string[]
  weaknesses: string[]
  marketPosition: string
  funding?: string
}

interface CompetitiveLandscape {
  marketOverview: string
  totalAddressableMarket: string
  keyPlayers: Competitor[]
  technologyApproaches: Array<{
    approach: string
    players: string[]
    maturity: string
    advantages: string
    disadvantages: string
  }>
  competitivePosition: string
  barriers: string[]
}

interface IPAssessment {
  patentLandscape: string
  keyPatents: Array<{
    title: string
    holder: string
    year: number
    relevance: string
  }>
  freedomToOperate: 'clear' | 'moderate_risk' | 'high_risk' | 'unknown'
  ipStrengths: string[]
  ipRisks: string[]
}

interface TRLAssessment {
  currentTRL: number
  trlJustification: string
  evidencePoints: string[]
  nextMilestones: Array<{
    milestone: string
    targetTRL: number
    requirements: string[]
  }>
  timeToCommercial: string
}

interface TechnologyAnalysis {
  overview: TechnologyOverview
  innovation: InnovationAnalysis
  competitive: CompetitiveLandscape
  ip: IPAssessment
  trl: TRLAssessment
  keyDifferentiators: string[]
  technicalRisks: Array<{
    risk: string
    likelihood: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    mitigation: string
  }>
  citations: Citation[]
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class TechnologyDeepDiveAgent extends BaseAssessmentAgent {
  constructor(input: AssessmentInput) {
    super('technology-deep-dive', input)
  }

  async execute(onProgress?: ProgressCallback): Promise<ComponentOutput> {
    const startTime = Date.now()

    try {
      onProgress?.(5, 'Starting technology analysis...')

      // Step 1: Generate technology overview
      onProgress?.(10, 'Analyzing technology fundamentals...')
      const overview = await this.analyzeTechnologyOverview()

      // Step 2: Analyze core innovations
      onProgress?.(25, 'Evaluating core innovations...')
      const innovation = await this.analyzeInnovations()

      // Step 3: Map competitive landscape
      onProgress?.(40, 'Mapping competitive landscape...')
      const competitive = await this.analyzeCompetitiveLandscape()

      // Step 4: Assess intellectual property
      onProgress?.(55, 'Assessing intellectual property...')
      const ip = await this.assessIP()

      // Step 5: Evaluate TRL
      onProgress?.(70, 'Evaluating technology readiness...')
      const trl = await this.assessTRL()

      // Step 6: Identify differentiators and risks
      onProgress?.(85, 'Identifying differentiators and risks...')
      const { differentiators, risks } = await this.analyzeDifferentiatorsAndRisks(
        overview,
        innovation,
        competitive
      )

      // Step 7: Gather citations
      onProgress?.(95, 'Compiling citations...')
      const citations = await this.gatherCitations()

      const analysis: TechnologyAnalysis = {
        overview,
        innovation,
        competitive,
        ip,
        trl,
        keyDifferentiators: differentiators,
        technicalRisks: risks,
        citations,
      }

      // Generate report sections
      const sections = await this.generateReportSections({
        componentId: 'technology-deep-dive',
        componentName: 'Technology Deep Dive',
        status: 'complete',
        content: analysis,
        sections: [],
        duration: Date.now() - startTime,
      })

      onProgress?.(100, 'Technology analysis complete')

      return {
        componentId: 'technology-deep-dive',
        componentName: 'Technology Deep Dive',
        status: 'complete',
        content: analysis,
        sections,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        componentId: 'technology-deep-dive',
        componentName: 'Technology Deep Dive',
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

  private async analyzeTechnologyOverview(): Promise<TechnologyOverview> {
    const prompt = `You are a senior technology analyst conducting due diligence on ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Provide a comprehensive technology overview. Return a JSON object with this structure:
{
  "summary": "2-3 paragraph executive summary of the technology",
  "workingPrinciple": "Detailed explanation of how the technology works (3-4 paragraphs)",
  "keyComponents": ["Component 1", "Component 2", ...],
  "performanceMetrics": [
    {
      "metric": "Efficiency",
      "value": "75",
      "unit": "%",
      "context": "System efficiency under standard operating conditions"
    }
  ],
  "maturityStage": "Commercial/Pre-commercial/Pilot/Lab-scale/Concept",
  "primaryApplications": ["Application 1", "Application 2", ...]
}

Be specific and technical. Include relevant performance data from the description.
Return only the JSON object.`

    return this.generateJSON<TechnologyOverview>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async analyzeInnovations(): Promise<InnovationAnalysis> {
    const prompt = `Analyze the core innovations of ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}

Claims to validate:
${this.input.claims.map(c => `- ${c.claim}`).join('\n')}

Identify and analyze the key innovations. Return a JSON object:
{
  "coreInnovations": [
    {
      "name": "Innovation name",
      "description": "Detailed technical description (2-3 sentences)",
      "novelty": "breakthrough|incremental|derivative",
      "impact": "How this innovation improves performance or reduces cost"
    }
  ],
  "technicalAdvantages": [
    "Advantage 1 with specific benefit",
    "Advantage 2 with quantified improvement"
  ],
  "technicalChallenges": [
    "Challenge 1 and its implications",
    "Challenge 2 and potential solutions"
  ],
  "differentiatingFactors": [
    "What makes this approach unique vs alternatives"
  ]
}

Focus on what's technically novel and defensible. Be specific about performance improvements.
Return only the JSON object.`

    return this.generateJSON<InnovationAnalysis>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async analyzeCompetitiveLandscape(): Promise<CompetitiveLandscape> {
    const prompt = `Map the competitive landscape for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Domain guidance: ${this.getDomainGuidance()}

Provide comprehensive competitive analysis. Return a JSON object:
{
  "marketOverview": "Current state of the market (2-3 paragraphs)",
  "totalAddressableMarket": "$X billion by 20XX",
  "keyPlayers": [
    {
      "name": "Company name",
      "technology": "Their technology approach",
      "stage": "Commercial/Pilot/Development",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1"],
      "marketPosition": "Market leader/Challenger/Emerging",
      "funding": "$XXM Series X (if startup)"
    }
  ],
  "technologyApproaches": [
    {
      "approach": "Approach name (e.g., PEM vs Alkaline for electrolyzers)",
      "players": ["Company 1", "Company 2"],
      "maturity": "Commercial/Emerging/R&D",
      "advantages": "Key advantages of this approach",
      "disadvantages": "Key limitations"
    }
  ],
  "competitivePosition": "Where this technology fits in the landscape",
  "barriers": ["Barrier to entry 1", "Barrier 2"]
}

Include real companies and realistic market data. Be objective and balanced.
Return only the JSON object.`

    return this.generateJSON<CompetitiveLandscape>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async assessIP(): Promise<IPAssessment> {
    const prompt = `Assess the intellectual property landscape for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}

Analyze the patent and IP situation. Return a JSON object:
{
  "patentLandscape": "Overview of the patent landscape (2-3 paragraphs)",
  "keyPatents": [
    {
      "title": "Patent title",
      "holder": "Company/Institution",
      "year": 2020,
      "relevance": "How this patent relates to the technology"
    }
  ],
  "freedomToOperate": "clear|moderate_risk|high_risk|unknown",
  "ipStrengths": [
    "IP strength 1",
    "IP strength 2"
  ],
  "ipRisks": [
    "IP risk 1 with potential impact",
    "IP risk 2"
  ]
}

Focus on patents that are most relevant to the core technology claims.
Return only the JSON object.`

    return this.generateJSON<IPAssessment>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async assessTRL(): Promise<TRLAssessment> {
    const prompt = `Assess the Technology Readiness Level (TRL) for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}

TRL Scale:
1: Basic principles observed
2: Technology concept formulated
3: Proof of concept (analytical/experimental)
4: Component validation (lab environment)
5: System validation (relevant environment)
6: System demonstration (relevant environment)
7: System prototype (operational environment)
8: System complete and qualified
9: System proven in operational environment

Assess the current TRL. Return a JSON object:
{
  "currentTRL": 7,
  "trlJustification": "Detailed justification for the TRL rating (2-3 paragraphs)",
  "evidencePoints": [
    "Evidence point 1 supporting the TRL",
    "Evidence point 2",
    "Evidence point 3"
  ],
  "nextMilestones": [
    {
      "milestone": "Milestone description",
      "targetTRL": 8,
      "requirements": ["Requirement 1", "Requirement 2"]
    }
  ],
  "timeToCommercial": "X-Y years to full commercial deployment"
}

Be rigorous in your assessment. Use specific evidence from the description.
Return only the JSON object.`

    return this.generateJSON<TRLAssessment>(prompt, {
      thinkingLevel: 'high',
    })
  }

  private async analyzeDifferentiatorsAndRisks(
    overview: TechnologyOverview,
    innovation: InnovationAnalysis,
    competitive: CompetitiveLandscape
  ): Promise<{
    differentiators: string[]
    risks: Array<{
      risk: string
      likelihood: 'high' | 'medium' | 'low'
      impact: 'high' | 'medium' | 'low'
      mitigation: string
    }>
  }> {
    const prompt = `Based on the technology analysis, identify key differentiators and technical risks.

TECHNOLOGY: ${this.input.title}

Key findings:
- Maturity: ${overview.maturityStage}
- Core innovations: ${innovation.coreInnovations.map(i => i.name).join(', ')}
- Technical advantages: ${innovation.technicalAdvantages.join('; ')}
- Technical challenges: ${innovation.technicalChallenges.join('; ')}
- Competitive position: ${competitive.competitivePosition}

Return a JSON object:
{
  "differentiators": [
    "Key differentiator 1 (specific and defensible)",
    "Key differentiator 2",
    "Key differentiator 3"
  ],
  "risks": [
    {
      "risk": "Technical risk description",
      "likelihood": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "How to mitigate this risk"
    }
  ]
}

Include 3-5 differentiators and 5-8 technical risks.
Return only the JSON object.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async gatherCitations(): Promise<Citation[]> {
    // Search for relevant literature
    const literature = await this.searchLiterature(
      `${this.input.technologyType} technology review performance analysis`,
      15
    )

    return literature.map((lit, idx) => ({
      id: `tech-${idx + 1}`,
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
    const analysis = output.content as TechnologyAnalysis
    const sections: ReportSection[] = []

    // Section 1.1: Technology Overview
    sections.push(this.createSection(
      'tech-1-1',
      'Technology Overview',
      2,
      analysis.overview.summary + '\n\n' + analysis.overview.workingPrinciple,
      {
        tables: [this.createPerformanceMetricsTable(analysis.overview)],
      }
    ))

    // Section 1.2: Core Innovation Analysis
    sections.push(this.createSection(
      'tech-1-2',
      'Core Innovation Analysis',
      2,
      this.formatInnovationContent(analysis.innovation),
      {
        tables: [this.createInnovationsTable(analysis.innovation)],
      }
    ))

    // Section 1.3: Competitive Landscape
    sections.push(this.createSection(
      'tech-1-3',
      'Competitive Landscape',
      2,
      analysis.competitive.marketOverview + '\n\n' +
      `Total Addressable Market: ${analysis.competitive.totalAddressableMarket}\n\n` +
      analysis.competitive.competitivePosition,
      {
        tables: [
          this.createCompetitorsTable(analysis.competitive),
          this.createTechnologyApproachesTable(analysis.competitive),
        ],
      }
    ))

    // Section 1.4: Intellectual Property Assessment
    sections.push(this.createSection(
      'tech-1-4',
      'Intellectual Property Assessment',
      2,
      analysis.ip.patentLandscape + '\n\n' +
      `Freedom to Operate: ${this.formatFreedomToOperate(analysis.ip.freedomToOperate)}`,
      {
        tables: [this.createIPTable(analysis.ip)],
      }
    ))

    // Section 1.5: Technology Readiness Level
    sections.push(this.createSection(
      'tech-1-5',
      'Technology Readiness Level (TRL)',
      2,
      `Current TRL: ${analysis.trl.currentTRL}\n\n` +
      analysis.trl.trlJustification + '\n\n' +
      `Time to Commercial: ${analysis.trl.timeToCommercial}`,
      {
        tables: [this.createTRLMilestonesTable(analysis.trl)],
      }
    ))

    // Section 1.6: Key Technical Differentiators
    sections.push(this.createSection(
      'tech-1-6',
      'Key Technical Differentiators',
      2,
      analysis.keyDifferentiators.map((d, i) => `${i + 1}. ${d}`).join('\n\n'),
      {
        tables: [this.createTechnicalRisksTable(analysis.technicalRisks)],
        citations: analysis.citations,
      }
    ))

    return sections
  }

  // ==========================================================================
  // Table Creation Helpers
  // ==========================================================================

  private createPerformanceMetricsTable(overview: TechnologyOverview): ReportTable {
    return this.createTable(
      'tech-metrics',
      'Key Performance Metrics',
      ['Metric', 'Value', 'Unit', 'Context'],
      overview.performanceMetrics.map(m => [m.metric, m.value, m.unit, m.context])
    )
  }

  private createInnovationsTable(innovation: InnovationAnalysis): ReportTable {
    return this.createTable(
      'tech-innovations',
      'Core Innovations',
      ['Innovation', 'Novelty', 'Description', 'Impact'],
      innovation.coreInnovations.map(i => [
        i.name,
        i.novelty.charAt(0).toUpperCase() + i.novelty.slice(1),
        i.description,
        i.impact,
      ])
    )
  }

  private createCompetitorsTable(competitive: CompetitiveLandscape): ReportTable {
    return this.createTable(
      'tech-competitors',
      'Key Competitors',
      ['Company', 'Technology', 'Stage', 'Market Position', 'Key Strengths'],
      competitive.keyPlayers.map(p => [
        p.name,
        p.technology,
        p.stage,
        p.marketPosition,
        p.strengths.slice(0, 2).join('; '),
      ])
    )
  }

  private createTechnologyApproachesTable(competitive: CompetitiveLandscape): ReportTable {
    return this.createTable(
      'tech-approaches',
      'Technology Approaches Comparison',
      ['Approach', 'Maturity', 'Key Players', 'Advantages', 'Disadvantages'],
      competitive.technologyApproaches.map(a => [
        a.approach,
        a.maturity,
        a.players.slice(0, 3).join(', '),
        a.advantages,
        a.disadvantages,
      ])
    )
  }

  private createIPTable(ip: IPAssessment): ReportTable {
    return this.createTable(
      'tech-ip',
      'Key Patents',
      ['Patent Title', 'Holder', 'Year', 'Relevance'],
      ip.keyPatents.map(p => [p.title, p.holder, String(p.year), p.relevance])
    )
  }

  private createTRLMilestonesTable(trl: TRLAssessment): ReportTable {
    return this.createTable(
      'tech-trl-milestones',
      'Technology Development Milestones',
      ['Milestone', 'Target TRL', 'Key Requirements'],
      trl.nextMilestones.map(m => [
        m.milestone,
        String(m.targetTRL),
        m.requirements.join('; '),
      ])
    )
  }

  private createTechnicalRisksTable(
    risks: Array<{
      risk: string
      likelihood: string
      impact: string
      mitigation: string
    }>
  ): ReportTable {
    return this.createTable(
      'tech-risks',
      'Technical Risk Assessment',
      ['Risk', 'Likelihood', 'Impact', 'Mitigation Strategy'],
      risks.map(r => [r.risk, r.likelihood, r.impact, r.mitigation])
    )
  }

  // ==========================================================================
  // Formatting Helpers
  // ==========================================================================

  private formatInnovationContent(innovation: InnovationAnalysis): string {
    let content = 'Technical Advantages:\n'
    innovation.technicalAdvantages.forEach((a, i) => {
      content += `${i + 1}. ${a}\n`
    })

    content += '\nTechnical Challenges:\n'
    innovation.technicalChallenges.forEach((c, i) => {
      content += `${i + 1}. ${c}\n`
    })

    return content
  }

  private formatFreedomToOperate(fto: string): string {
    const formats: Record<string, string> = {
      clear: 'Clear - No significant IP barriers identified',
      moderate_risk: 'Moderate Risk - Some overlapping patents may require licensing',
      high_risk: 'High Risk - Significant IP barriers require careful navigation',
      unknown: 'Unknown - Further IP analysis recommended',
    }
    return formats[fto] || fto
  }
}
