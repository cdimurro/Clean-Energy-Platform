/**
 * Assessment Plan Generation API
 *
 * POST: Generate an enhanced assessment plan with:
 * - AI-generated methodology overview
 * - Assumptions with source attribution (extracted from docs, defaults, calculated)
 * - Identified claims from documents
 * - Missing data warnings
 */

import { NextRequest, NextResponse } from 'next/server'
import { aiRouter } from '@/lib/ai/model-router'
import { TECHNOLOGY_DEFAULTS } from '@/lib/tea/defaults-database'
import type {
  EnhancedAssessmentPlan,
  PlanAssumption,
  AssumptionCategory,
  MethodologyConfig,
  TechnologyType,
} from '@/types/tea'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface GeneratePlanRequest {
  title: string
  description: string
  technologyType: TechnologyType
  documents?: Array<{
    id: string
    name: string
    type: string
    extractedData?: {
      text?: string
      tables?: Array<Record<string, string>>
      pageContent?: Array<{ page: number; text: string }>
    }
  }>
}

/**
 * POST /api/assessments/[id]/generate-plan
 * Generate an enhanced assessment plan
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as GeneratePlanRequest

    // Validate required fields
    if (!body.title || !body.description || !body.technologyType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, technologyType' },
        { status: 400 }
      )
    }

    // Step 1: Generate methodology overview using AI
    const methodology = await generateMethodology(
      body.title,
      body.description,
      body.technologyType
    )

    // Step 2: Extract claims from documents
    const identifiedClaims = await extractClaims(body.description, body.documents)

    // Step 3: Build assumptions with source attribution
    const assumptions = await buildAssumptions(
      body.technologyType,
      body.description,
      body.documents
    )

    // Step 4: Identify missing data
    const missingData = identifyMissingData(assumptions, body.documents)

    // Step 5: Build default sections
    const sections = buildDefaultSections()

    // Build the enhanced plan
    const plan: EnhancedAssessmentPlan = {
      id: crypto.randomUUID(),
      version: 1,
      status: 'review',
      technologyType: body.technologyType,
      domainId: mapTechnologyToDomain(body.technologyType),
      methodology,
      assumptions,
      identifiedClaims,
      sections,
      missingData,
      modifications: [],
      createdAt: new Date(),
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Plan generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Plan generation failed' },
      { status: 500 }
    )
  }
}

/**
 * Generate methodology overview using AI
 */
async function generateMethodology(
  title: string,
  description: string,
  technologyType: TechnologyType
): Promise<EnhancedAssessmentPlan['methodology']> {
  const prompt = `You are a techno-economic analysis expert. Generate a brief methodology overview for assessing this clean energy technology.

Project: ${title}
Technology Type: ${technologyType}
Description: ${description}

Return a JSON object with:
{
  "overview": "2-3 sentences describing the assessment approach",
  "limitations": ["list of 2-3 known limitations of this analysis"]
}

Return ONLY valid JSON, no additional text.`

  let overview = `This assessment will evaluate the ${technologyType} technology using industry-standard techno-economic analysis methods. The analysis includes technology validation, financial modeling (LCOE, NPV, IRR), risk assessment, and market positioning.`
  let limitations: string[] = [
    'Analysis relies on provided data and industry benchmarks',
    'Market conditions may vary from assumptions',
    'Technology maturity may affect actual performance',
  ]

  try {
    const aiResponse = await aiRouter.execute('tea-insights', prompt, {
      temperature: 0.3,
    })

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      overview = parsed.overview || overview
      limitations = parsed.limitations || limitations
    }
  } catch (error) {
    console.error('Methodology generation error:', error)
  }

  // Build default analyses configuration
  const analyses: MethodologyConfig[] = [
    {
      id: 'technology-deep-dive',
      name: 'Technology Deep Dive',
      description: 'Research competitive landscape, core innovations, and technology maturity',
      enabled: true,
      approach: 'Literature review, patent analysis, and competitive benchmarking',
      estimatedDuration: '2-3 minutes',
    },
    {
      id: 'claims-validation',
      name: 'Claims Validation',
      description: 'Validate key claims against literature and industry benchmarks',
      enabled: true,
      approach: 'Cross-reference claims with peer-reviewed sources and physics limits',
      estimatedDuration: '2-3 minutes',
    },
    {
      id: 'performance-simulation',
      name: 'Performance Simulation',
      description: 'Run physics-based simulation models',
      enabled: true,
      approach: 'First-principles modeling with sensitivity analysis',
      estimatedDuration: '3-5 minutes',
    },
    {
      id: 'system-integration',
      name: 'System Integration',
      description: 'Analyze market fit and infrastructure dependencies',
      enabled: true,
      approach: 'Supply chain analysis and infrastructure assessment',
      estimatedDuration: '2-3 minutes',
    },
    {
      id: 'tea-analysis',
      name: 'Techno-Economic Analysis',
      description: 'Build financial model and calculate LCOE, NPV, IRR',
      enabled: true,
      approach: 'Discounted cash flow analysis with Monte Carlo simulation',
      estimatedDuration: '3-5 minutes',
    },
    {
      id: 'improvement-opportunities',
      name: 'Improvement Opportunities',
      description: 'Identify optimization pathways and R&D directions',
      enabled: true,
      approach: 'Gap analysis and roadmap development',
      estimatedDuration: '2-3 minutes',
    },
    {
      id: 'final-synthesis',
      name: 'Final Synthesis',
      description: 'Generate executive summary and investment recommendation',
      enabled: true,
      approach: 'Synthesize all findings into actionable recommendations',
      estimatedDuration: '1-2 minutes',
    },
  ]

  return { overview, analyses, limitations }
}

/**
 * Extract claims from description and documents
 */
async function extractClaims(
  description: string,
  documents?: GeneratePlanRequest['documents']
): Promise<EnhancedAssessmentPlan['identifiedClaims']> {
  const claims: EnhancedAssessmentPlan['identifiedClaims'] = []

  // Extract claims from description using regex patterns
  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*%\s*(?:efficiency|efficient)/gi, type: 'efficiency' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:kg|tonnes?|tons?)\s*(?:per|\/)\s*(?:day|hour|year)/gi, type: 'production' },
    { regex: /\$[\d,]+(?:\.\d+)?\s*(?:per|\/)\s*(?:kg|tonne|ton|kW|MW)/gi, type: 'cost' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:years?|yr)\s*(?:lifetime|life\s*span)/gi, type: 'lifetime' },
    { regex: /(\d+(?:\.\d+)?)\s*(?:MW|kW|GW)\s*(?:capacity|output|power)/gi, type: 'capacity' },
  ]

  patterns.forEach((pattern) => {
    const matches = description.matchAll(pattern.regex)
    for (const match of matches) {
      claims.push({
        id: crypto.randomUUID(),
        claim: match[0],
        source: 'User description',
        validationMethod: `Compare ${pattern.type} claim against industry benchmarks`,
        confidence: 'medium',
      })
    }
  })

  // Extract claims from documents if available
  if (documents) {
    for (const doc of documents) {
      const text = doc.extractedData?.text || ''
      patterns.forEach((pattern) => {
        const matches = text.matchAll(pattern.regex)
        for (const match of matches) {
          // Find page number if available
          let pageNumber: number | undefined
          if (doc.extractedData?.pageContent) {
            const page = doc.extractedData.pageContent.find((p) =>
              p.text.includes(match[0])
            )
            pageNumber = page?.page
          }

          claims.push({
            id: crypto.randomUUID(),
            claim: match[0],
            source: pageNumber ? `${doc.name} (page ${pageNumber})` : doc.name,
            validationMethod: `Compare ${pattern.type} claim against industry benchmarks`,
            confidence: 'medium',
          })
        }
      })
    }
  }

  // Deduplicate claims
  const uniqueClaims = claims.reduce((acc, claim) => {
    if (!acc.find((c) => c.claim === claim.claim)) {
      acc.push(claim)
    }
    return acc
  }, [] as typeof claims)

  return uniqueClaims.slice(0, 10) // Limit to 10 claims
}

/**
 * Build assumptions with source attribution
 */
async function buildAssumptions(
  technologyType: TechnologyType,
  description: string,
  documents?: GeneratePlanRequest['documents']
): Promise<EnhancedAssessmentPlan['assumptions']> {
  const defaults = TECHNOLOGY_DEFAULTS[technologyType] || TECHNOLOGY_DEFAULTS.generic

  // Try to extract values from documents
  const extractedValues = await extractValuesFromDocuments(description, documents)

  // Financial assumptions
  const financial: PlanAssumption[] = [
    createAssumption('discount_rate', 'Discount Rate (WACC)', '%', 'financial',
      extractedValues.discount_rate ?? 8, extractedValues.discount_rate ? 'extracted' : 'default',
      technologyType, { min: 3, max: 15 }, 'Weighted average cost of capital'),
    createAssumption('debt_ratio', 'Debt Ratio', '%', 'financial',
      extractedValues.debt_ratio ?? 60, extractedValues.debt_ratio ? 'extracted' : 'default',
      technologyType, { min: 0, max: 90 }, 'Proportion of project financed by debt'),
    createAssumption('interest_rate', 'Interest Rate', '%', 'financial',
      extractedValues.interest_rate ?? 6, extractedValues.interest_rate ? 'extracted' : 'default',
      technologyType, { min: 2, max: 12 }, 'Cost of debt financing'),
    createAssumption('tax_rate', 'Corporate Tax Rate', '%', 'financial',
      extractedValues.tax_rate ?? 21, extractedValues.tax_rate ? 'extracted' : 'default',
      technologyType, { min: 0, max: 40 }, 'Federal + state corporate tax rate'),
    createAssumption('depreciation_years', 'Depreciation Period', 'years', 'financial',
      extractedValues.depreciation_years ?? defaults.depreciation_years ?? 10,
      extractedValues.depreciation_years ? 'extracted' : 'default',
      technologyType, { min: 5, max: 30 }, 'Period over which assets are depreciated'),
    createAssumption('inflation_rate', 'Inflation Rate', '%', 'financial',
      extractedValues.inflation_rate ?? 2.5, extractedValues.inflation_rate ? 'extracted' : 'default',
      technologyType, { min: 0, max: 10 }, 'Expected annual inflation rate'),
  ]

  // Technical assumptions
  const technical: PlanAssumption[] = [
    createAssumption('capacity_factor', 'Capacity Factor', '%', 'technical',
      extractedValues.capacity_factor ?? defaults.capacity_factor ?? 50,
      extractedValues.capacity_factor ? 'extracted' : 'default',
      technologyType, { min: 10, max: 98 }, 'Average operating output vs nameplate capacity'),
    createAssumption('efficiency', 'System Efficiency', '%', 'technical',
      extractedValues.efficiency ?? 45, extractedValues.efficiency ? 'extracted' : 'default',
      technologyType, { min: 20, max: 95 }, 'Overall system energy efficiency'),
    createAssumption('lifetime_years', 'Project Lifetime', 'years', 'technical',
      extractedValues.lifetime_years ?? defaults.project_lifetime_years ?? 25,
      extractedValues.lifetime_years ? 'extracted' : 'default',
      technologyType, { min: 10, max: 50 }, 'Expected operational lifetime'),
    createAssumption('degradation_rate', 'Annual Degradation', '%', 'technical',
      extractedValues.degradation_rate ?? 0.5, extractedValues.degradation_rate ? 'extracted' : 'default',
      technologyType, { min: 0, max: 3 }, 'Annual performance decline'),
    createAssumption('availability', 'Availability', '%', 'technical',
      extractedValues.availability ?? 95, extractedValues.availability ? 'extracted' : 'default',
      technologyType, { min: 80, max: 99 }, 'Percentage of time system is operational'),
  ]

  // Capital costs
  const capital_costs: PlanAssumption[] = [
    createAssumption('capex_per_kw', 'CAPEX per kW', '$/kW', 'capital_costs',
      extractedValues.capex_per_kw ?? defaults.capex_per_kw ?? 1500,
      extractedValues.capex_per_kw ? 'extracted' : 'default',
      technologyType, { min: 100, max: 10000 }, 'Total capital expenditure per kW installed'),
    createAssumption('installation_factor', 'Installation Factor', 'x', 'capital_costs',
      extractedValues.installation_factor ?? defaults.installation_factor ?? 1.3,
      extractedValues.installation_factor ? 'extracted' : 'default',
      technologyType, { min: 1.1, max: 2.0 }, 'Multiplier for installation costs'),
    createAssumption('contingency', 'Contingency', '%', 'capital_costs',
      extractedValues.contingency ?? 15, extractedValues.contingency ? 'extracted' : 'default',
      technologyType, { min: 5, max: 30 }, 'Budget reserve for unforeseen costs'),
    createAssumption('land_cost', 'Land Cost', '$/acre', 'capital_costs',
      extractedValues.land_cost ?? 50000, extractedValues.land_cost ? 'extracted' : 'default',
      technologyType, { min: 1000, max: 500000 }, 'Cost of land acquisition'),
  ]

  // Operating costs
  const operating_costs: PlanAssumption[] = [
    createAssumption('opex_per_kw_year', 'OPEX per kW/year', '$/kW/yr', 'operating_costs',
      extractedValues.opex_per_kw_year ?? defaults.opex_per_kw_year ?? 30,
      extractedValues.opex_per_kw_year ? 'extracted' : 'default',
      technologyType, { min: 5, max: 300 }, 'Annual operating costs per kW installed'),
    createAssumption('maintenance', 'Maintenance', '% of CAPEX', 'operating_costs',
      extractedValues.maintenance ?? 2.5, extractedValues.maintenance ? 'extracted' : 'default',
      technologyType, { min: 1, max: 5 }, 'Annual maintenance as percentage of capital cost'),
    createAssumption('insurance_rate', 'Insurance', '% of CAPEX', 'operating_costs',
      extractedValues.insurance_rate ?? defaults.insurance_rate ?? 0.5,
      extractedValues.insurance_rate ? 'extracted' : 'default',
      technologyType, { min: 0.3, max: 1.5 }, 'Annual insurance premium'),
  ]

  // Revenue assumptions
  const revenue: PlanAssumption[] = [
    createAssumption('electricity_price', 'Electricity Price', '$/MWh', 'revenue',
      extractedValues.electricity_price ?? 65, extractedValues.electricity_price ? 'extracted' : 'default',
      technologyType, { min: 30, max: 150 }, 'Expected wholesale electricity price'),
    createAssumption('carbon_credit', 'Carbon Credit', '$/tCO2', 'revenue',
      extractedValues.carbon_credit ?? 50, extractedValues.carbon_credit ? 'extracted' : 'default',
      technologyType, { min: 0, max: 200 }, 'Value of carbon credits if applicable'),
    createAssumption('price_escalation', 'Price Escalation', '%/year', 'revenue',
      extractedValues.price_escalation ?? 2, extractedValues.price_escalation ? 'extracted' : 'default',
      technologyType, { min: 0, max: 5 }, 'Expected annual price increase'),
  ]

  // Environmental assumptions (if applicable)
  const environmental: PlanAssumption[] = [
    createAssumption('carbon_intensity', 'Carbon Intensity', 'gCO2/kWh', 'environmental',
      extractedValues.carbon_intensity ?? 0, extractedValues.carbon_intensity ? 'extracted' : 'default',
      technologyType, { min: 0, max: 1000 }, 'Carbon emissions per unit of energy'),
    createAssumption('water_usage', 'Water Usage', 'L/MWh', 'environmental',
      extractedValues.water_usage ?? 100, extractedValues.water_usage ? 'extracted' : 'default',
      technologyType, { min: 0, max: 10000 }, 'Water consumption per unit of energy'),
  ]

  return {
    financial,
    technical,
    capital_costs,
    operating_costs,
    revenue,
    environmental,
  }
}

/**
 * Create a single assumption with metadata
 */
function createAssumption(
  key: string,
  label: string,
  unit: string,
  category: AssumptionCategory,
  value: number | string,
  sourceType: 'extracted' | 'default' | 'calculated',
  technologyType: TechnologyType,
  validRange?: { min: number; max: number },
  description?: string
): PlanAssumption {
  return {
    id: crypto.randomUUID(),
    category,
    key,
    label,
    value,
    unit,
    source: {
      type: sourceType,
      technologyType: sourceType === 'default' ? technologyType : undefined,
    },
    validRange,
    description,
    isRequired: true,
    isEditable: true,
  }
}

/**
 * Extract values from documents using AI
 */
async function extractValuesFromDocuments(
  description: string,
  documents?: GeneratePlanRequest['documents']
): Promise<Record<string, number | undefined>> {
  const extracted: Record<string, number | undefined> = {}

  // Combine all document text
  let allText = description
  if (documents) {
    for (const doc of documents) {
      allText += '\n\n' + (doc.extractedData?.text || '')
    }
  }

  // Use regex to extract common values
  const patterns: Array<{ key: string; regex: RegExp; multiplier?: number }> = [
    { key: 'discount_rate', regex: /discount\s*rate[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { key: 'capacity_factor', regex: /capacity\s*factor[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { key: 'efficiency', regex: /(?:system\s+)?efficiency[:\s]+(\d+(?:\.\d+)?)\s*%/i },
    { key: 'capex_per_kw', regex: /capex[:\s]+\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:\/kW|per\s*kW)/i },
    { key: 'lifetime_years', regex: /(?:project\s+)?lifetime[:\s]+(\d+)\s*years?/i },
  ]

  patterns.forEach(({ key, regex, multiplier = 1 }) => {
    const match = allText.match(regex)
    if (match) {
      const value = parseFloat(match[1].replace(/,/g, '')) * multiplier
      if (!isNaN(value)) {
        extracted[key] = value
      }
    }
  })

  return extracted
}

/**
 * Identify missing data based on assumptions
 */
function identifyMissingData(
  assumptions: EnhancedAssessmentPlan['assumptions'],
  documents?: GeneratePlanRequest['documents']
): EnhancedAssessmentPlan['missingData'] {
  const missingData: EnhancedAssessmentPlan['missingData'] = []

  // Check for critical missing items
  const hasDocuments = documents && documents.length > 0

  if (!hasDocuments) {
    missingData.push({
      category: 'Documents',
      item: 'Supporting documents',
      impact: 'significant',
      suggestion: 'Upload pitch deck, technical specifications, or financial projections',
    })
  }

  // Check if all assumptions are using defaults
  const categories = Object.keys(assumptions) as AssumptionCategory[]
  categories.forEach((category) => {
    const categoryAssumptions = assumptions[category]
    const allDefaults = categoryAssumptions.every((a) => a.source.type === 'default')

    if (allDefaults && category !== 'environmental') {
      missingData.push({
        category: category.replace('_', ' '),
        item: `${category.replace('_', ' ')} data`,
        impact: 'minor',
        suggestion: `Provide specific ${category.replace('_', ' ')} from your project data`,
      })
    }
  })

  return missingData
}

/**
 * Build default report sections
 */
function buildDefaultSections(): EnhancedAssessmentPlan['sections'] {
  return [
    { id: 'tech-deep-dive', name: 'Technology Deep Dive', enabled: true, estimatedPages: '5-7' },
    { id: 'claims-validation', name: 'Claims Validation', enabled: true, estimatedPages: '2-3' },
    { id: 'performance-sim', name: 'Performance Simulation', enabled: true, estimatedPages: '10-15' },
    { id: 'system-integration', name: 'System Integration', enabled: true, estimatedPages: '5-7' },
    { id: 'tea-analysis', name: 'Techno-Economic Analysis', enabled: true, estimatedPages: '8-10' },
    { id: 'improvements', name: 'Improvement Opportunities', enabled: true, estimatedPages: '5-10' },
    { id: 'final-assessment', name: 'Final Assessment', enabled: true, estimatedPages: '3-5' },
  ]
}

/**
 * Map technology type to domain ID
 */
function mapTechnologyToDomain(technologyType: TechnologyType): string {
  const mapping: Record<TechnologyType, string> = {
    solar: 'clean-energy',
    wind: 'clean-energy',
    offshore_wind: 'clean-energy',
    hydrogen: 'clean-energy',
    storage: 'energy-storage',
    nuclear: 'clean-energy',
    geothermal: 'clean-energy',
    hydro: 'clean-energy',
    biomass: 'clean-energy',
    'waste-to-fuel': 'waste-to-fuel',
    generic: 'general',
  }
  return mapping[technologyType] || 'general'
}
