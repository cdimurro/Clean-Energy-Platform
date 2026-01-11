/**
 * System Integration Agent
 *
 * Analyzes market fit and integration requirements including:
 * - Market positioning and fit analysis
 * - Infrastructure requirements
 * - Supply chain analysis
 * - Regulatory landscape
 * - Integration challenges and solutions
 * - Deployment scenarios
 *
 * Output: 10-15 pages of system integration analysis
 */

import {
  BaseAssessmentAgent,
  type AssessmentInput,
  type ComponentOutput,
  type ReportSection,
  type ReportTable,
  type Citation,
  type ProgressCallback,
} from './base-agent'

// ============================================================================
// Types
// ============================================================================

interface MarketPositioning {
  targetMarkets: Array<{
    segment: string
    size: string
    growth: string
    fit: 'excellent' | 'good' | 'moderate' | 'limited'
    rationale: string
  }>
  valueProposition: string
  customerSegments: Array<{
    segment: string
    needs: string[]
    willingness: string
    barriers: string[]
  }>
  competitiveAdvantages: string[]
  goToMarketStrategy: string
}

interface InfrastructureRequirements {
  physicalInfrastructure: Array<{
    component: string
    requirement: string
    availability: 'existing' | 'modification_needed' | 'new_build'
    cost: string
    timeline: string
  }>
  energyInfrastructure: Array<{
    requirement: string
    specification: string
    availability: string
    notes: string
  }>
  digitalInfrastructure: Array<{
    system: string
    requirement: string
    integration: string
  }>
  landAndPermitting: {
    landRequirement: string
    permits: string[]
    timeline: string
    challenges: string[]
  }
}

interface SupplyChainAnalysis {
  criticalMaterials: Array<{
    material: string
    source: string
    supplyRisk: 'high' | 'medium' | 'low'
    alternatives: string[]
    priceTrend: string
  }>
  keySuppliers: Array<{
    component: string
    suppliers: string[]
    concentration: 'high' | 'medium' | 'low'
    geographicRisk: string
  }>
  manufacturingCapacity: {
    currentCapacity: string
    requiredCapacity: string
    gapAnalysis: string
    scaleUpTimeline: string
  }
  logisticsConsiderations: string[]
  supplyChainRisks: Array<{
    risk: string
    probability: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    mitigation: string
  }>
}

interface RegulatoryLandscape {
  applicableRegulations: Array<{
    regulation: string
    jurisdiction: string
    requirement: string
    status: 'compliant' | 'in_progress' | 'gap' | 'not_applicable'
    timeline: string
  }>
  permittingRequirements: Array<{
    permit: string
    authority: string
    timeline: string
    complexity: 'high' | 'medium' | 'low'
  }>
  incentivesAndSubsidies: Array<{
    program: string
    jurisdiction: string
    value: string
    eligibility: string
    status: 'available' | 'pending' | 'expired'
  }>
  regulatoryRisks: string[]
  policyTrends: string
}

interface IntegrationChallenge {
  challenge: string
  category: 'technical' | 'operational' | 'commercial' | 'regulatory'
  severity: 'high' | 'medium' | 'low'
  solution: string
  timeline: string
  cost: string
}

interface DeploymentScenario {
  name: string
  description: string
  scale: string
  timeline: string
  capitalRequired: string
  keyAssumptions: string[]
  expectedOutcomes: string[]
  risks: string[]
  suitability: 'primary' | 'secondary' | 'exploratory'
}

interface SystemIntegrationAnalysis {
  marketPositioning: MarketPositioning
  infrastructureRequirements: InfrastructureRequirements
  supplyChainAnalysis: SupplyChainAnalysis
  regulatoryLandscape: RegulatoryLandscape
  integrationChallenges: IntegrationChallenge[]
  deploymentScenarios: DeploymentScenario[]
  integrationRisks: Array<{
    risk: string
    probability: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    mitigation: string
  }>
  citations: Citation[]
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class SystemIntegrationAgent extends BaseAssessmentAgent {
  constructor(input: AssessmentInput) {
    super('system-integration', input)
  }

  async execute(onProgress?: ProgressCallback): Promise<ComponentOutput> {
    const startTime = Date.now()

    try {
      onProgress?.(5, 'Starting system integration analysis...')

      // Step 1: Analyze market positioning
      onProgress?.(10, 'Analyzing market positioning...')
      const marketPositioning = await this.analyzeMarketPositioning()

      // Step 2: Assess infrastructure requirements
      onProgress?.(25, 'Assessing infrastructure requirements...')
      const infrastructureRequirements = await this.assessInfrastructure()

      // Step 3: Analyze supply chain
      onProgress?.(40, 'Analyzing supply chain...')
      const supplyChainAnalysis = await this.analyzeSupplyChain()

      // Step 4: Map regulatory landscape
      onProgress?.(55, 'Mapping regulatory landscape...')
      const regulatoryLandscape = await this.mapRegulatoryLandscape()

      // Step 5: Identify integration challenges
      onProgress?.(70, 'Identifying integration challenges...')
      const integrationChallenges = await this.identifyIntegrationChallenges(
        infrastructureRequirements,
        supplyChainAnalysis,
        regulatoryLandscape
      )

      // Step 6: Develop deployment scenarios
      onProgress?.(82, 'Developing deployment scenarios...')
      const deploymentScenarios = await this.developDeploymentScenarios()

      // Step 7: Assess integration risks
      onProgress?.(92, 'Assessing integration risks...')
      const integrationRisks = await this.assessIntegrationRisks(
        supplyChainAnalysis,
        regulatoryLandscape,
        integrationChallenges
      )

      // Step 8: Gather citations
      onProgress?.(97, 'Compiling citations...')
      const citations = await this.gatherCitations()

      const analysis: SystemIntegrationAnalysis = {
        marketPositioning,
        infrastructureRequirements,
        supplyChainAnalysis,
        regulatoryLandscape,
        integrationChallenges,
        deploymentScenarios,
        integrationRisks,
        citations,
      }

      // Generate report sections
      const sections = await this.generateReportSections({
        componentId: 'system-integration',
        componentName: 'System Integration',
        status: 'complete',
        content: analysis,
        sections: [],
        duration: Date.now() - startTime,
      })

      onProgress?.(100, 'System integration analysis complete')

      return {
        componentId: 'system-integration',
        componentName: 'System Integration',
        status: 'complete',
        content: analysis,
        sections,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        componentId: 'system-integration',
        componentName: 'System Integration',
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

  private async analyzeMarketPositioning(): Promise<MarketPositioning> {
    const prompt = `Analyze market positioning for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Domain guidance: ${this.getDomainGuidance()}

Analyze market fit and positioning. Return a JSON object:
{
  "targetMarkets": [
    {
      "segment": "Market segment name",
      "size": "$X billion by 20XX",
      "growth": "X% CAGR",
      "fit": "excellent|good|moderate|limited",
      "rationale": "Why this market is a good fit"
    }
  ],
  "valueProposition": "2-3 paragraph value proposition statement",
  "customerSegments": [
    {
      "segment": "Customer segment name",
      "needs": ["Need 1", "Need 2"],
      "willingness": "Willingness to pay and adopt",
      "barriers": ["Adoption barrier 1"]
    }
  ],
  "competitiveAdvantages": [
    "Competitive advantage 1",
    "Competitive advantage 2"
  ],
  "goToMarketStrategy": "Recommended go-to-market approach (2 paragraphs)"
}

Include 3-5 target markets and 3-4 customer segments.
Be specific with market sizing and growth rates.
Return only the JSON object.`

    return this.generateJSON<MarketPositioning>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async assessInfrastructure(): Promise<InfrastructureRequirements> {
    const prompt = `Assess infrastructure requirements for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Identify infrastructure needs. Return a JSON object:
{
  "physicalInfrastructure": [
    {
      "component": "Infrastructure component",
      "requirement": "Specific requirement",
      "availability": "existing|modification_needed|new_build",
      "cost": "Estimated cost",
      "timeline": "Implementation timeline"
    }
  ],
  "energyInfrastructure": [
    {
      "requirement": "Power/energy requirement",
      "specification": "Technical specification",
      "availability": "Current availability status",
      "notes": "Additional considerations"
    }
  ],
  "digitalInfrastructure": [
    {
      "system": "System type (SCADA, IoT, etc.)",
      "requirement": "Specific requirement",
      "integration": "Integration complexity"
    }
  ],
  "landAndPermitting": {
    "landRequirement": "Land area and characteristics needed",
    "permits": ["Permit 1", "Permit 2"],
    "timeline": "Overall permitting timeline",
    "challenges": ["Permitting challenge 1"]
  }
}

Include 4-6 physical infrastructure components, 3-4 energy requirements, 2-3 digital systems.
Return only the JSON object.`

    return this.generateJSON<InfrastructureRequirements>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async analyzeSupplyChain(): Promise<SupplyChainAnalysis> {
    const prompt = `Analyze supply chain for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Perform supply chain analysis. Return a JSON object:
{
  "criticalMaterials": [
    {
      "material": "Material name",
      "source": "Primary sources/regions",
      "supplyRisk": "high|medium|low",
      "alternatives": ["Alternative 1", "Alternative 2"],
      "priceTrend": "Price trend and volatility"
    }
  ],
  "keySuppliers": [
    {
      "component": "Component type",
      "suppliers": ["Supplier 1", "Supplier 2"],
      "concentration": "high|medium|low",
      "geographicRisk": "Geographic concentration risk"
    }
  ],
  "manufacturingCapacity": {
    "currentCapacity": "Current global manufacturing capacity",
    "requiredCapacity": "Capacity needed for target deployment",
    "gapAnalysis": "Analysis of capacity gap",
    "scaleUpTimeline": "Time to close capacity gap"
  },
  "logisticsConsiderations": [
    "Logistics consideration 1",
    "Logistics consideration 2"
  ],
  "supplyChainRisks": [
    {
      "risk": "Supply chain risk description",
      "probability": "high|medium|low",
      "impact": "high|medium|low",
      "mitigation": "Risk mitigation strategy"
    }
  ]
}

Include 4-6 critical materials, 3-5 key supplier categories, 4-6 supply chain risks.
Return only the JSON object.`

    return this.generateJSON<SupplyChainAnalysis>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async mapRegulatoryLandscape(): Promise<RegulatoryLandscape> {
    const prompt = `Map the regulatory landscape for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Analyze regulatory requirements. Return a JSON object:
{
  "applicableRegulations": [
    {
      "regulation": "Regulation name",
      "jurisdiction": "US/EU/Global/State-specific",
      "requirement": "Key requirements",
      "status": "compliant|in_progress|gap|not_applicable",
      "timeline": "Compliance timeline"
    }
  ],
  "permittingRequirements": [
    {
      "permit": "Permit type",
      "authority": "Issuing authority",
      "timeline": "Expected timeline",
      "complexity": "high|medium|low"
    }
  ],
  "incentivesAndSubsidies": [
    {
      "program": "Program name (IRA, ITC, PTC, etc.)",
      "jurisdiction": "Jurisdiction",
      "value": "Incentive value/rate",
      "eligibility": "Eligibility requirements",
      "status": "available|pending|expired"
    }
  ],
  "regulatoryRisks": [
    "Regulatory risk 1",
    "Regulatory risk 2"
  ],
  "policyTrends": "2-3 paragraph analysis of policy trends and outlook"
}

Include relevant regulations for ${this.domainCategory}.
Focus on US and EU regulations, note global standards.
Include IRA, ITC, PTC, and other relevant incentives.
Return only the JSON object.`

    return this.generateJSON<RegulatoryLandscape>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async identifyIntegrationChallenges(
    infrastructure: InfrastructureRequirements,
    supplyChain: SupplyChainAnalysis,
    regulatory: RegulatoryLandscape
  ): Promise<IntegrationChallenge[]> {
    const prompt = `Identify integration challenges for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}

Infrastructure needs: ${infrastructure.physicalInfrastructure.map(i => i.component).join(', ')}
Critical materials: ${supplyChain.criticalMaterials.map(m => m.material).join(', ')}
Regulatory complexity: ${regulatory.permittingRequirements.length} permits required

Identify integration challenges. Return a JSON array:
[
  {
    "challenge": "Challenge description",
    "category": "technical|operational|commercial|regulatory",
    "severity": "high|medium|low",
    "solution": "Proposed solution",
    "timeline": "Time to resolve",
    "cost": "Estimated cost to resolve"
  }
]

Include 8-12 integration challenges across all categories.
Be specific about solutions and timelines.
Return only the JSON array.`

    return this.generateJSON<IntegrationChallenge[]>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async developDeploymentScenarios(): Promise<DeploymentScenario[]> {
    const prompt = `Develop deployment scenarios for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DESCRIPTION: ${this.input.description}
DOMAIN: ${this.domainCategory}

Create deployment scenarios. Return a JSON array:
[
  {
    "name": "Scenario name (e.g., Pilot Project, Commercial Scale)",
    "description": "2-3 sentence scenario description",
    "scale": "Deployment scale (MW, units, etc.)",
    "timeline": "Implementation timeline",
    "capitalRequired": "Capital requirement",
    "keyAssumptions": [
      "Assumption 1",
      "Assumption 2"
    ],
    "expectedOutcomes": [
      "Expected outcome 1",
      "Expected outcome 2"
    ],
    "risks": [
      "Scenario-specific risk 1"
    ],
    "suitability": "primary|secondary|exploratory"
  }
]

Include 3-4 deployment scenarios:
1. Pilot/demonstration scale
2. First commercial deployment
3. Full commercial scale
4. (Optional) International expansion or niche application

Return only the JSON array.`

    return this.generateJSON<DeploymentScenario[]>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async assessIntegrationRisks(
    supplyChain: SupplyChainAnalysis,
    regulatory: RegulatoryLandscape,
    challenges: IntegrationChallenge[]
  ): Promise<Array<{
    risk: string
    probability: 'high' | 'medium' | 'low'
    impact: 'high' | 'medium' | 'low'
    mitigation: string
  }>> {
    const highSeverityChallenges = challenges.filter(c => c.severity === 'high')

    const prompt = `Assess integration risks for ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}

Supply chain risks: ${supplyChain.supplyChainRisks.map(r => r.risk).join('; ')}
Regulatory risks: ${regulatory.regulatoryRisks.join('; ')}
High-severity challenges: ${highSeverityChallenges.map(c => c.challenge).join('; ')}

Provide integration risk assessment. Return a JSON array:
[
  {
    "risk": "Integration risk description",
    "probability": "high|medium|low",
    "impact": "high|medium|low",
    "mitigation": "Risk mitigation strategy"
  }
]

Include 8-12 integration risks covering:
- Infrastructure integration
- Supply chain disruption
- Regulatory/policy changes
- Market adoption barriers
- Operational complexity
- Financial/funding risks

Return only the JSON array.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async gatherCitations(): Promise<Citation[]> {
    const literature = await this.searchLiterature(
      `${this.input.technologyType} market analysis supply chain regulatory policy deployment`,
      12
    )

    return literature.map((lit, idx) => ({
      id: `int-${idx + 1}`,
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
    const analysis = output.content as SystemIntegrationAnalysis
    const sections: ReportSection[] = []

    // Section 4.1: Market Positioning
    sections.push(this.createSection(
      'int-4-1',
      'Market Positioning',
      2,
      analysis.marketPositioning.valueProposition + '\n\n' +
      'Competitive Advantages:\n' +
      analysis.marketPositioning.competitiveAdvantages.map((a, i) => `${i + 1}. ${a}`).join('\n') + '\n\n' +
      'Go-to-Market Strategy:\n' + analysis.marketPositioning.goToMarketStrategy,
      {
        tables: [
          this.createTargetMarketsTable(analysis.marketPositioning),
          this.createCustomerSegmentsTable(analysis.marketPositioning),
        ],
      }
    ))

    // Section 4.2: Infrastructure Requirements
    sections.push(this.createSection(
      'int-4-2',
      'Infrastructure Requirements',
      2,
      `Land Requirements: ${analysis.infrastructureRequirements.landAndPermitting.landRequirement}\n\n` +
      `Required Permits: ${analysis.infrastructureRequirements.landAndPermitting.permits.join(', ')}\n\n` +
      `Permitting Timeline: ${analysis.infrastructureRequirements.landAndPermitting.timeline}\n\n` +
      'Permitting Challenges:\n' +
      analysis.infrastructureRequirements.landAndPermitting.challenges.map((c, i) => `${i + 1}. ${c}`).join('\n'),
      {
        tables: [
          this.createPhysicalInfrastructureTable(analysis.infrastructureRequirements),
          this.createEnergyInfrastructureTable(analysis.infrastructureRequirements),
        ],
      }
    ))

    // Section 4.3: Supply Chain Analysis
    sections.push(this.createSection(
      'int-4-3',
      'Supply Chain Analysis',
      2,
      `Manufacturing Capacity:\n` +
      `- Current Capacity: ${analysis.supplyChainAnalysis.manufacturingCapacity.currentCapacity}\n` +
      `- Required Capacity: ${analysis.supplyChainAnalysis.manufacturingCapacity.requiredCapacity}\n` +
      `- Gap Analysis: ${analysis.supplyChainAnalysis.manufacturingCapacity.gapAnalysis}\n` +
      `- Scale-up Timeline: ${analysis.supplyChainAnalysis.manufacturingCapacity.scaleUpTimeline}\n\n` +
      'Logistics Considerations:\n' +
      analysis.supplyChainAnalysis.logisticsConsiderations.map((l, i) => `${i + 1}. ${l}`).join('\n'),
      {
        tables: [
          this.createCriticalMaterialsTable(analysis.supplyChainAnalysis),
          this.createKeySuppliersTable(analysis.supplyChainAnalysis),
          this.createSupplyChainRisksTable(analysis.supplyChainAnalysis),
        ],
      }
    ))

    // Section 4.4: Regulatory Landscape
    sections.push(this.createSection(
      'int-4-4',
      'Regulatory Landscape',
      2,
      analysis.regulatoryLandscape.policyTrends + '\n\n' +
      'Key Regulatory Risks:\n' +
      analysis.regulatoryLandscape.regulatoryRisks.map((r, i) => `${i + 1}. ${r}`).join('\n'),
      {
        tables: [
          this.createRegulationsTable(analysis.regulatoryLandscape),
          this.createPermitsTable(analysis.regulatoryLandscape),
          this.createIncentivesTable(analysis.regulatoryLandscape),
        ],
      }
    ))

    // Section 4.5: Integration Challenges and Solutions
    sections.push(this.createSection(
      'int-4-5',
      'Integration Challenges and Solutions',
      2,
      'The following challenges must be addressed for successful system integration. Each challenge includes a proposed solution, timeline, and estimated cost.',
      {
        tables: [this.createIntegrationChallengesTable(analysis.integrationChallenges)],
      }
    ))

    // Section 4.6: Deployment Scenarios
    sections.push(this.createSection(
      'int-4-6',
      'Deployment Scenarios',
      2,
      'Multiple deployment scenarios have been developed to illustrate the path from pilot to commercial scale.',
      {
        tables: [this.createDeploymentScenariosTable(analysis.deploymentScenarios)],
      }
    ))

    // Section 4.7: Integration Risk Assessment
    sections.push(this.createSection(
      'int-4-7',
      'Integration Risk Assessment',
      2,
      'Key risks that could impact system integration are identified below with probability, impact, and mitigation strategies.',
      {
        tables: [this.createIntegrationRisksTable(analysis.integrationRisks)],
        citations: analysis.citations,
      }
    ))

    return sections
  }

  // ==========================================================================
  // Table Creation Helpers
  // ==========================================================================

  private createTargetMarketsTable(market: MarketPositioning): ReportTable {
    return this.createTable(
      'int-target-markets',
      'Target Markets',
      ['Market Segment', 'Size', 'Growth', 'Fit', 'Rationale'],
      market.targetMarkets.map(m => [
        m.segment,
        m.size,
        m.growth,
        m.fit.toUpperCase(),
        m.rationale,
      ])
    )
  }

  private createCustomerSegmentsTable(market: MarketPositioning): ReportTable {
    return this.createTable(
      'int-customers',
      'Customer Segments',
      ['Segment', 'Key Needs', 'Willingness to Pay', 'Adoption Barriers'],
      market.customerSegments.map(c => [
        c.segment,
        c.needs.slice(0, 2).join('; '),
        c.willingness,
        c.barriers.slice(0, 2).join('; '),
      ])
    )
  }

  private createPhysicalInfrastructureTable(infra: InfrastructureRequirements): ReportTable {
    return this.createTable(
      'int-physical-infra',
      'Physical Infrastructure Requirements',
      ['Component', 'Requirement', 'Availability', 'Cost', 'Timeline'],
      infra.physicalInfrastructure.map(i => [
        i.component,
        i.requirement,
        i.availability.replace('_', ' '),
        i.cost,
        i.timeline,
      ])
    )
  }

  private createEnergyInfrastructureTable(infra: InfrastructureRequirements): ReportTable {
    return this.createTable(
      'int-energy-infra',
      'Energy Infrastructure Requirements',
      ['Requirement', 'Specification', 'Availability', 'Notes'],
      infra.energyInfrastructure.map(e => [
        e.requirement,
        e.specification,
        e.availability,
        e.notes,
      ])
    )
  }

  private createCriticalMaterialsTable(supply: SupplyChainAnalysis): ReportTable {
    return this.createTable(
      'int-materials',
      'Critical Materials',
      ['Material', 'Source', 'Supply Risk', 'Alternatives', 'Price Trend'],
      supply.criticalMaterials.map(m => [
        m.material,
        m.source,
        m.supplyRisk.toUpperCase(),
        m.alternatives.slice(0, 2).join(', '),
        m.priceTrend,
      ])
    )
  }

  private createKeySuppliersTable(supply: SupplyChainAnalysis): ReportTable {
    return this.createTable(
      'int-suppliers',
      'Key Suppliers',
      ['Component', 'Suppliers', 'Concentration', 'Geographic Risk'],
      supply.keySuppliers.map(s => [
        s.component,
        s.suppliers.slice(0, 3).join(', '),
        s.concentration.toUpperCase(),
        s.geographicRisk,
      ])
    )
  }

  private createSupplyChainRisksTable(supply: SupplyChainAnalysis): ReportTable {
    return this.createTable(
      'int-supply-risks',
      'Supply Chain Risks',
      ['Risk', 'Probability', 'Impact', 'Mitigation'],
      supply.supplyChainRisks.map(r => [
        r.risk,
        r.probability.toUpperCase(),
        r.impact.toUpperCase(),
        r.mitigation,
      ])
    )
  }

  private createRegulationsTable(regulatory: RegulatoryLandscape): ReportTable {
    return this.createTable(
      'int-regulations',
      'Applicable Regulations',
      ['Regulation', 'Jurisdiction', 'Status', 'Timeline'],
      regulatory.applicableRegulations.map(r => [
        r.regulation,
        r.jurisdiction,
        r.status.replace('_', ' ').toUpperCase(),
        r.timeline,
      ])
    )
  }

  private createPermitsTable(regulatory: RegulatoryLandscape): ReportTable {
    return this.createTable(
      'int-permits',
      'Permitting Requirements',
      ['Permit', 'Authority', 'Complexity', 'Timeline'],
      regulatory.permittingRequirements.map(p => [
        p.permit,
        p.authority,
        p.complexity.toUpperCase(),
        p.timeline,
      ])
    )
  }

  private createIncentivesTable(regulatory: RegulatoryLandscape): ReportTable {
    return this.createTable(
      'int-incentives',
      'Available Incentives and Subsidies',
      ['Program', 'Jurisdiction', 'Value', 'Eligibility', 'Status'],
      regulatory.incentivesAndSubsidies.map(i => [
        i.program,
        i.jurisdiction,
        i.value,
        i.eligibility,
        i.status.toUpperCase(),
      ])
    )
  }

  private createIntegrationChallengesTable(challenges: IntegrationChallenge[]): ReportTable {
    return this.createTable(
      'int-challenges',
      'Integration Challenges and Solutions',
      ['Challenge', 'Category', 'Severity', 'Solution', 'Timeline', 'Cost'],
      challenges.map(c => [
        c.challenge,
        c.category.toUpperCase(),
        c.severity.toUpperCase(),
        c.solution,
        c.timeline,
        c.cost,
      ])
    )
  }

  private createDeploymentScenariosTable(scenarios: DeploymentScenario[]): ReportTable {
    return this.createTable(
      'int-scenarios',
      'Deployment Scenarios',
      ['Scenario', 'Scale', 'Timeline', 'Capital Required', 'Suitability'],
      scenarios.map(s => [
        s.name,
        s.scale,
        s.timeline,
        s.capitalRequired,
        s.suitability.toUpperCase(),
      ]),
      scenarios.map(s => `${s.name}: ${s.description}`)
    )
  }

  private createIntegrationRisksTable(
    risks: Array<{
      risk: string
      probability: string
      impact: string
      mitigation: string
    }>
  ): ReportTable {
    return this.createTable(
      'int-risks',
      'Integration Risk Assessment',
      ['Risk', 'Probability', 'Impact', 'Mitigation'],
      risks.map(r => [r.risk, r.probability.toUpperCase(), r.impact.toUpperCase(), r.mitigation])
    )
  }
}
