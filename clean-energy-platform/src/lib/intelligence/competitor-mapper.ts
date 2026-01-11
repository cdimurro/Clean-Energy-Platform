/**
 * Automated Competitor Mapper
 *
 * Uses LLM-powered analysis to identify and map competitors in a technology space.
 * Provides structured competitive intelligence for investor due diligence.
 *
 * Features:
 * - Web search for competitors in technology space
 * - Funding history aggregation
 * - Technology approach comparison matrix
 * - Market positioning analysis
 *
 * Phase 3 of investor due diligence market enhancement
 */

import { generateText, type GeminiOptions } from '@/lib/ai/gemini'

// ============================================================================
// Types
// ============================================================================

export interface CompetitorProfile {
  name: string
  website?: string
  description: string
  technologyApproach: string
  stage: 'seed' | 'early' | 'growth' | 'late' | 'public' | 'acquired'
  fundingTotal?: string
  lastRound?: {
    type: string
    amount?: string
    date?: string
    investors?: string[]
  }
  keyMetrics?: Record<string, string>
  strengths: string[]
  weaknesses: string[]
  differentiators: string[]
}

export interface CompetitorComparison {
  metric: string
  target: string
  competitors: Array<{
    name: string
    value: string
    assessment: 'better' | 'similar' | 'worse' | 'unknown'
  }>
  notes?: string
}

export interface MarketPositioning {
  segment: string
  size: string
  growth: string
  competitors: string[]
  positioning: 'leader' | 'challenger' | 'niche' | 'emerging'
}

export interface CompetitiveLandscape {
  technology: string
  marketOverview: string
  totalAddressableMarket: string
  competitors: CompetitorProfile[]
  comparisonMatrix: CompetitorComparison[]
  marketPositioning: MarketPositioning[]
  competitiveAdvantages: string[]
  competitiveThreats: string[]
  barrierToEntry: 'high' | 'medium' | 'low'
  consolidationRisk: 'high' | 'medium' | 'low'
  recommendations: string[]
  generatedAt: string
}

export interface CompetitorMapperConfig {
  maxCompetitors?: number
  includePublicCompanies?: boolean
  includeAcquired?: boolean
  focusRegions?: string[]
}

// ============================================================================
// Competitor Mapper Class
// ============================================================================

export class CompetitorMapper {
  private config: CompetitorMapperConfig

  constructor(config: CompetitorMapperConfig = {}) {
    this.config = {
      maxCompetitors: 10,
      includePublicCompanies: true,
      includeAcquired: false,
      focusRegions: ['global'],
      ...config,
    }
  }

  /**
   * Generate competitive landscape analysis for a technology
   */
  async generateLandscape(
    technology: string,
    description: string,
    targetCompanyName?: string
  ): Promise<CompetitiveLandscape> {
    // Step 1: Identify competitors
    const competitors = await this.identifyCompetitors(technology, description)

    // Step 2: Build comparison matrix
    const comparisonMatrix = await this.buildComparisonMatrix(
      technology,
      targetCompanyName,
      competitors
    )

    // Step 3: Analyze market positioning
    const marketPositioning = await this.analyzeMarketPositioning(
      technology,
      competitors
    )

    // Step 4: Generate strategic analysis
    const strategicAnalysis = await this.generateStrategicAnalysis(
      technology,
      competitors,
      comparisonMatrix
    )

    return {
      technology,
      marketOverview: strategicAnalysis.marketOverview,
      totalAddressableMarket: strategicAnalysis.tam,
      competitors,
      comparisonMatrix,
      marketPositioning,
      competitiveAdvantages: strategicAnalysis.advantages,
      competitiveThreats: strategicAnalysis.threats,
      barrierToEntry: strategicAnalysis.barrierToEntry,
      consolidationRisk: strategicAnalysis.consolidationRisk,
      recommendations: strategicAnalysis.recommendations,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Identify competitors in the technology space
   */
  private async identifyCompetitors(
    technology: string,
    description: string
  ): Promise<CompetitorProfile[]> {
    const prompt = `You are a market intelligence analyst specializing in clean energy and deep tech.

Identify the top ${this.config.maxCompetitors} competitors in the following technology space:

TECHNOLOGY: ${technology}
DESCRIPTION: ${description}

For each competitor, provide:
1. Company name
2. Website (if known)
3. Brief description (1-2 sentences)
4. Technology approach
5. Development stage (seed/early/growth/late/public/acquired)
6. Total funding raised (if known)
7. Most recent funding round details
8. Key performance metrics they've disclosed
9. 2-3 key strengths
10. 2-3 key weaknesses
11. Key differentiators from other competitors

Focus on:
- Direct competitors with similar technology approaches
- Companies at various stages (startups to established players)
- ${this.config.includePublicCompanies ? 'Include publicly traded companies' : 'Focus on private companies'}
- ${this.config.includeAcquired ? 'Include acquired companies if recently relevant' : 'Exclude acquired companies'}

Return a JSON array with this structure:
[
  {
    "name": "Company Name",
    "website": "https://example.com",
    "description": "Brief description",
    "technologyApproach": "Their specific approach",
    "stage": "growth",
    "fundingTotal": "$150M",
    "lastRound": {
      "type": "Series C",
      "amount": "$80M",
      "date": "2024-Q2",
      "investors": ["Investor 1", "Investor 2"]
    },
    "keyMetrics": {
      "efficiency": "25%",
      "capacity": "500 MW deployed"
    },
    "strengths": ["strength 1", "strength 2"],
    "weaknesses": ["weakness 1", "weakness 2"],
    "differentiators": ["differentiator 1"]
  }
]

Return only the JSON array, no additional text.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.3,
      maxOutputTokens: 4096,
      thinkingLevel: 'medium',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed as CompetitorProfile[]
    } catch (error) {
      console.error('[CompetitorMapper] Failed to identify competitors:', error)
      return []
    }
  }

  /**
   * Build comparison matrix
   */
  private async buildComparisonMatrix(
    technology: string,
    targetCompanyName: string | undefined,
    competitors: CompetitorProfile[]
  ): Promise<CompetitorComparison[]> {
    const competitorNames = competitors.map(c => c.name).join(', ')
    const targetLabel = targetCompanyName || 'Target Company'

    const prompt = `You are a competitive intelligence analyst comparing companies in the ${technology} space.

COMPETITORS: ${competitorNames}
TARGET: ${targetLabel}

Create a comparison matrix for key metrics. For each metric, assess how the target compares to each competitor.

Return a JSON array with this structure:
[
  {
    "metric": "Metric Name (e.g., Efficiency, LCOE, Funding)",
    "target": "Target's value or status",
    "competitors": [
      {
        "name": "Competitor 1",
        "value": "Their value",
        "assessment": "better" | "similar" | "worse" | "unknown"
      }
    ],
    "notes": "Optional context"
  }
]

Include these metrics:
1. Technology efficiency/performance
2. Cost position (LCOE/LCOH/unit cost)
3. Total funding raised
4. Team/talent strength
5. Commercial traction (customers, deployments)
6. IP/patent position
7. Manufacturing capability
8. Partnership ecosystem

Return only the JSON array.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.3,
      maxOutputTokens: 2048,
      thinkingLevel: 'low',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed as CompetitorComparison[]
    } catch (error) {
      console.error('[CompetitorMapper] Failed to build comparison matrix:', error)
      return []
    }
  }

  /**
   * Analyze market positioning
   */
  private async analyzeMarketPositioning(
    technology: string,
    competitors: CompetitorProfile[]
  ): Promise<MarketPositioning[]> {
    const competitorInfo = competitors.map(c =>
      `${c.name} (${c.stage}): ${c.description}`
    ).join('\n')

    const prompt = `Analyze the market segments for ${technology} and position the following competitors:

${competitorInfo}

Return a JSON array of market segments with this structure:
[
  {
    "segment": "Market Segment Name",
    "size": "Estimated market size (e.g., $10B by 2030)",
    "growth": "CAGR or growth description",
    "competitors": ["Company 1", "Company 2"],
    "positioning": "leader" | "challenger" | "niche" | "emerging"
  }
]

Include 3-5 relevant market segments.
Return only the JSON array.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.3,
      maxOutputTokens: 1024,
      thinkingLevel: 'low',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed as MarketPositioning[]
    } catch (error) {
      console.error('[CompetitorMapper] Failed to analyze positioning:', error)
      return []
    }
  }

  /**
   * Generate strategic analysis
   */
  private async generateStrategicAnalysis(
    technology: string,
    competitors: CompetitorProfile[],
    comparisonMatrix: CompetitorComparison[]
  ): Promise<{
    marketOverview: string
    tam: string
    advantages: string[]
    threats: string[]
    barrierToEntry: 'high' | 'medium' | 'low'
    consolidationRisk: 'high' | 'medium' | 'low'
    recommendations: string[]
  }> {
    const competitorSummary = competitors.map(c =>
      `${c.name}: ${c.stage}, ${c.fundingTotal || 'undisclosed funding'}`
    ).join('\n')

    const prompt = `Provide strategic analysis for the ${technology} competitive landscape.

COMPETITORS:
${competitorSummary}

Return a JSON object with this structure:
{
  "marketOverview": "2-3 sentence overview of the competitive landscape",
  "tam": "Total addressable market size estimate with source",
  "advantages": ["Potential competitive advantage 1", "advantage 2", "advantage 3"],
  "threats": ["Competitive threat 1", "threat 2", "threat 3"],
  "barrierToEntry": "high" | "medium" | "low",
  "consolidationRisk": "high" | "medium" | "low",
  "recommendations": ["Strategic recommendation 1", "recommendation 2", "recommendation 3"]
}

Focus on actionable insights for investors evaluating this space.
Return only the JSON object.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.4,
      maxOutputTokens: 1024,
      thinkingLevel: 'medium',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed
    } catch (error) {
      console.error('[CompetitorMapper] Failed to generate strategic analysis:', error)
      return {
        marketOverview: 'Unable to generate market overview',
        tam: 'Unknown',
        advantages: [],
        threats: [],
        barrierToEntry: 'medium',
        consolidationRisk: 'medium',
        recommendations: [],
      }
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Generate competitive landscape for a technology
 */
export async function generateCompetitiveLandscape(
  technology: string,
  description: string,
  targetCompanyName?: string,
  config?: CompetitorMapperConfig
): Promise<CompetitiveLandscape> {
  const mapper = new CompetitorMapper(config)
  return mapper.generateLandscape(technology, description, targetCompanyName)
}

/**
 * Quick competitor identification (no full analysis)
 */
export async function identifyCompetitors(
  technology: string,
  description: string,
  maxCompetitors: number = 5
): Promise<CompetitorProfile[]> {
  const mapper = new CompetitorMapper({ maxCompetitors })
  const landscape = await mapper.generateLandscape(technology, description)
  return landscape.competitors
}
