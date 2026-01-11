/**
 * Patent Landscape Analyzer
 *
 * Provides automated patent analysis for investor due diligence.
 * Identifies prior art, freedom-to-operate risks, and patent family mapping.
 *
 * Features:
 * - Prior art identification for target technology
 * - Freedom-to-operate (FTO) risk assessment
 * - Patent family mapping and jurisdiction analysis
 * - Key player identification by patent portfolio
 * - Technology trend analysis from patent filings
 *
 * Phase 3 of investor due diligence market enhancement
 */

import { generateText, type GeminiOptions } from '@/lib/ai/gemini'

// ============================================================================
// Types
// ============================================================================

export interface Patent {
  id: string
  title: string
  abstract: string
  publicationNumber: string
  publicationDate: string
  filingDate: string
  applicants: string[]
  inventors: string[]
  jurisdictions: string[]
  classifications: PatentClassification[]
  claims: number
  status: 'pending' | 'granted' | 'expired' | 'abandoned'
  citations: number
  familyId?: string
  relevanceScore: number
}

export interface PatentClassification {
  code: string
  description: string
  type: 'IPC' | 'CPC' | 'USPC'
}

export interface PatentHolder {
  name: string
  patentCount: number
  keyPatents: string[]
  jurisdictions: string[]
  technologyFocus: string[]
  filingTrend: 'increasing' | 'stable' | 'decreasing'
  assessment: 'major_player' | 'active_filer' | 'niche' | 'emerging'
}

export interface FTORisk {
  level: 'high' | 'medium' | 'low'
  description: string
  blockingPatents: Array<{
    patentNumber: string
    holder: string
    expirationDate: string
    relevance: string
    workaroundPossible: boolean
  }>
  recommendations: string[]
}

export interface PatentTrend {
  year: number
  filings: number
  grants: number
  topApplicants: string[]
  emergingTopics: string[]
}

export interface PatentLandscape {
  technology: string
  analysisDate: string
  overview: string
  totalPatentsFound: number
  keyPatents: Patent[]
  topHolders: PatentHolder[]
  ftoRisk: FTORisk
  patentTrends: PatentTrend[]
  technologyClusters: Array<{
    name: string
    patentCount: number
    keyPlayers: string[]
    maturity: 'emerging' | 'growing' | 'mature' | 'declining'
  }>
  whitespaceOpportunities: string[]
  strategicRecommendations: string[]
}

export interface PatentAnalyzerConfig {
  maxPatents?: number
  yearsBack?: number
  jurisdictions?: string[]
  includeExpired?: boolean
}

// ============================================================================
// Patent Analyzer Class
// ============================================================================

export class PatentAnalyzer {
  private config: PatentAnalyzerConfig

  constructor(config: PatentAnalyzerConfig = {}) {
    this.config = {
      maxPatents: 50,
      yearsBack: 10,
      jurisdictions: ['US', 'EP', 'WO', 'CN', 'JP', 'KR'],
      includeExpired: false,
      ...config,
    }
  }

  /**
   * Generate complete patent landscape analysis
   */
  async analyzeLandscape(
    technology: string,
    description: string,
    targetCompanyPatents?: string[]
  ): Promise<PatentLandscape> {
    // Step 1: Identify key patents in the space
    const keyPatents = await this.identifyKeyPatents(technology, description)

    // Step 2: Analyze top patent holders
    const topHolders = await this.analyzePatentHolders(technology, keyPatents)

    // Step 3: Assess freedom-to-operate risk
    const ftoRisk = await this.assessFTORisk(
      technology,
      keyPatents,
      targetCompanyPatents
    )

    // Step 4: Analyze filing trends
    const patentTrends = await this.analyzeFilingTrends(technology)

    // Step 5: Identify technology clusters and whitespace
    const { clusters, whitespace, recommendations } =
      await this.analyzeStrategicPosition(technology, keyPatents, topHolders)

    // Generate overview
    const overview = await this.generateOverview(
      technology,
      keyPatents.length,
      topHolders,
      ftoRisk
    )

    return {
      technology,
      analysisDate: new Date().toISOString(),
      overview,
      totalPatentsFound: keyPatents.length,
      keyPatents: keyPatents.slice(0, 20), // Top 20 most relevant
      topHolders,
      ftoRisk,
      patentTrends,
      technologyClusters: clusters,
      whitespaceOpportunities: whitespace,
      strategicRecommendations: recommendations,
    }
  }

  /**
   * Identify key patents in the technology space
   */
  private async identifyKeyPatents(
    technology: string,
    description: string
  ): Promise<Patent[]> {
    const prompt = `You are a patent analyst specializing in clean energy and deep tech.

Identify the ${this.config.maxPatents} most important patents in the following technology space:

TECHNOLOGY: ${technology}
DESCRIPTION: ${description}

SEARCH CRITERIA:
- Years: Last ${this.config.yearsBack} years
- Jurisdictions: ${this.config.jurisdictions?.join(', ')}
- ${this.config.includeExpired ? 'Include expired patents for prior art' : 'Focus on active patents'}

For each patent, provide:
1. Publication number (e.g., US10123456B2, EP3456789A1, WO2022123456A1)
2. Title
3. Brief abstract (1-2 sentences)
4. Publication date
5. Filing date
6. Applicants/assignees
7. Key inventors
8. Jurisdictions where filed/granted
9. IPC/CPC classifications
10. Number of claims
11. Status (pending/granted/expired/abandoned)
12. Forward citation count (estimate)
13. Patent family ID (if known)
14. Relevance score (1-100) for the target technology

Focus on:
- Foundational patents that define the technology space
- Recent high-citation patents
- Patents from major players (corporations, universities, startups)
- Patents with broad claims that could block competitors

Return a JSON array with this structure:
[
  {
    "id": "unique-id",
    "title": "Patent Title",
    "abstract": "Brief description",
    "publicationNumber": "US10123456B2",
    "publicationDate": "2023-06-15",
    "filingDate": "2021-03-20",
    "applicants": ["Company Inc."],
    "inventors": ["John Doe", "Jane Smith"],
    "jurisdictions": ["US", "EP", "CN"],
    "classifications": [
      {"code": "H01M10/052", "description": "Lithium batteries", "type": "IPC"}
    ],
    "claims": 25,
    "status": "granted",
    "citations": 45,
    "familyId": "FAMILY123",
    "relevanceScore": 95
  }
]

Return only the JSON array, no additional text.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.2,
      maxOutputTokens: 8192,
      thinkingLevel: 'medium',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed as Patent[]
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to identify patents:', error)
      return []
    }
  }

  /**
   * Analyze top patent holders in the space
   */
  private async analyzePatentHolders(
    technology: string,
    patents: Patent[]
  ): Promise<PatentHolder[]> {
    const patentSummary = patents
      .slice(0, 30)
      .map((p) => `${p.publicationNumber}: ${p.applicants.join(', ')} - ${p.title}`)
      .join('\n')

    const prompt = `Analyze the top patent holders in the ${technology} space based on these patents:

${patentSummary}

Identify the top 10 patent holders and for each provide:
1. Organization name
2. Estimated patent count in this space
3. Key patent numbers (top 3-5)
4. Geographic jurisdictions where they file
5. Technology focus areas within this space
6. Filing trend (increasing/stable/decreasing in recent years)
7. Assessment (major_player/active_filer/niche/emerging)

Return a JSON array:
[
  {
    "name": "Company Name",
    "patentCount": 150,
    "keyPatents": ["US10123456B2", "EP3456789A1"],
    "jurisdictions": ["US", "EP", "CN"],
    "technologyFocus": ["electrode materials", "cell design"],
    "filingTrend": "increasing",
    "assessment": "major_player"
  }
]

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
      return parsed as PatentHolder[]
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to analyze holders:', error)
      return []
    }
  }

  /**
   * Assess freedom-to-operate risk
   */
  private async assessFTORisk(
    technology: string,
    patents: Patent[],
    targetCompanyPatents?: string[]
  ): Promise<FTORisk> {
    const activePatents = patents.filter((p) => p.status === 'granted')
    const patentList = activePatents
      .slice(0, 20)
      .map((p) => `${p.publicationNumber} (${p.applicants[0]}): ${p.title}`)
      .join('\n')

    const ownPatentsNote = targetCompanyPatents?.length
      ? `\nThe target company owns these patents: ${targetCompanyPatents.join(', ')}`
      : ''

    const prompt = `Assess the freedom-to-operate (FTO) risk for a company developing ${technology}.

ACTIVE PATENTS IN SPACE:
${patentList}
${ownPatentsNote}

Provide an FTO risk assessment including:
1. Overall risk level (high/medium/low)
2. Description of the risk landscape
3. Potentially blocking patents (up to 5 most concerning)
4. Strategic recommendations

For blocking patents, include:
- Patent number
- Holder
- Estimated expiration date
- Relevance to the technology
- Whether a workaround appears possible

Return a JSON object:
{
  "level": "medium",
  "description": "The technology space has several active patents...",
  "blockingPatents": [
    {
      "patentNumber": "US10123456B2",
      "holder": "Company Inc.",
      "expirationDate": "2035-03-20",
      "relevance": "Covers core electrode manufacturing process",
      "workaroundPossible": true
    }
  ],
  "recommendations": [
    "Monitor Patent X expiration in 2025",
    "Consider licensing from Company Y"
  ]
}

Return only the JSON object.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.3,
      maxOutputTokens: 2048,
      thinkingLevel: 'medium',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      const parsed = JSON.parse(result.trim())
      return parsed as FTORisk
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to assess FTO risk:', error)
      return {
        level: 'medium',
        description: 'Unable to complete FTO assessment',
        blockingPatents: [],
        recommendations: ['Conduct manual FTO analysis with patent counsel'],
      }
    }
  }

  /**
   * Analyze patent filing trends
   */
  private async analyzeFilingTrends(technology: string): Promise<PatentTrend[]> {
    const currentYear = new Date().getFullYear()
    const yearsToAnalyze = this.config.yearsBack || 10

    const prompt = `Analyze patent filing trends for ${technology} over the past ${yearsToAnalyze} years (${currentYear - yearsToAnalyze} to ${currentYear}).

For each year, provide:
1. Estimated number of new filings
2. Estimated number of grants
3. Top 3-5 applicants that year
4. Emerging topics or focus areas

Return a JSON array:
[
  {
    "year": 2024,
    "filings": 450,
    "grants": 320,
    "topApplicants": ["Company A", "University B", "Startup C"],
    "emergingTopics": ["solid-state electrolytes", "silicon anodes"]
  }
]

Return only the JSON array, ordered by year descending.`

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
      return parsed as PatentTrend[]
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to analyze trends:', error)
      return []
    }
  }

  /**
   * Analyze strategic position, clusters, and whitespace
   */
  private async analyzeStrategicPosition(
    technology: string,
    patents: Patent[],
    holders: PatentHolder[]
  ): Promise<{
    clusters: Array<{
      name: string
      patentCount: number
      keyPlayers: string[]
      maturity: 'emerging' | 'growing' | 'mature' | 'declining'
    }>
    whitespace: string[]
    recommendations: string[]
  }> {
    const holderSummary = holders
      .slice(0, 10)
      .map((h) => `${h.name}: ${h.patentCount} patents, ${h.technologyFocus.join(', ')}`)
      .join('\n')

    const prompt = `Analyze the strategic patent landscape for ${technology}.

TOP PATENT HOLDERS:
${holderSummary}

Provide:
1. Technology clusters (3-6 distinct areas with patent activity)
2. Whitespace opportunities (areas with low patent coverage)
3. Strategic recommendations for a new entrant

Return a JSON object:
{
  "clusters": [
    {
      "name": "Cluster Name",
      "patentCount": 500,
      "keyPlayers": ["Company A", "Company B"],
      "maturity": "growing"
    }
  ],
  "whitespace": [
    "Manufacturing process optimization",
    "Integration with grid storage"
  ],
  "recommendations": [
    "File patents in whitespace area X before competitors",
    "Consider cross-licensing with Company Y"
  ]
}

Return only the JSON object.`

    const options: Partial<GeminiOptions> = {
      temperature: 0.4,
      maxOutputTokens: 2048,
      thinkingLevel: 'medium',
    }

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        ...options,
      })

      return JSON.parse(result.trim())
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to analyze strategic position:', error)
      return {
        clusters: [],
        whitespace: [],
        recommendations: ['Conduct detailed patent landscape study'],
      }
    }
  }

  /**
   * Generate executive overview
   */
  private async generateOverview(
    technology: string,
    patentCount: number,
    holders: PatentHolder[],
    ftoRisk: FTORisk
  ): Promise<string> {
    const topHolders = holders
      .slice(0, 3)
      .map((h) => h.name)
      .join(', ')

    const prompt = `Write a 2-3 sentence executive overview of the patent landscape for ${technology}.

Key facts:
- Approximately ${patentCount} relevant patents identified
- Top holders: ${topHolders}
- FTO risk level: ${ftoRisk.level}
- Blocking patents: ${ftoRisk.blockingPatents.length}

The overview should be suitable for investor due diligence.
Return only the overview text, no JSON.`

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        temperature: 0.4,
        maxOutputTokens: 256,
      })

      return result.trim()
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to generate overview:', error)
      return `Patent landscape analysis identified ${patentCount} relevant patents with ${ftoRisk.level} FTO risk.`
    }
  }

  /**
   * Quick prior art search for a specific claim
   */
  async searchPriorArt(
    claim: string,
    technologyContext: string
  ): Promise<Array<{ patent: Patent; relevance: string }>> {
    const prompt = `Find prior art patents that may be relevant to this claim:

CLAIM: ${claim}
TECHNOLOGY CONTEXT: ${technologyContext}

Identify 5-10 patents that could constitute prior art, ordered by relevance.

Return a JSON array:
[
  {
    "patent": {
      "id": "prior-art-1",
      "title": "Patent Title",
      "abstract": "Brief description",
      "publicationNumber": "US10123456B2",
      "publicationDate": "2020-06-15",
      "filingDate": "2018-03-20",
      "applicants": ["Company Inc."],
      "inventors": ["John Doe"],
      "jurisdictions": ["US"],
      "classifications": [],
      "claims": 20,
      "status": "granted",
      "citations": 30,
      "relevanceScore": 85
    },
    "relevance": "Describes similar electrode structure in claim 3"
  }
]

Return only the JSON array.`

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 4096,
      })

      return JSON.parse(result.trim())
    } catch (error) {
      console.error('[PatentAnalyzer] Failed to search prior art:', error)
      return []
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Generate full patent landscape analysis
 */
export async function analyzePatentLandscape(
  technology: string,
  description: string,
  targetCompanyPatents?: string[],
  config?: PatentAnalyzerConfig
): Promise<PatentLandscape> {
  const analyzer = new PatentAnalyzer(config)
  return analyzer.analyzeLandscape(technology, description, targetCompanyPatents)
}

/**
 * Quick prior art search for a specific claim
 */
export async function findPriorArt(
  claim: string,
  technologyContext: string
): Promise<Array<{ patent: Patent; relevance: string }>> {
  const analyzer = new PatentAnalyzer()
  return analyzer.searchPriorArt(claim, technologyContext)
}

/**
 * Assess FTO risk for a technology
 */
export async function assessFreedomToOperate(
  technology: string,
  description: string,
  ownPatents?: string[]
): Promise<FTORisk> {
  const analyzer = new PatentAnalyzer()
  const landscape = await analyzer.analyzeLandscape(technology, description, ownPatents)
  return landscape.ftoRisk
}
