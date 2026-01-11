/**
 * Patent Intelligence API
 *
 * POST: Generate patent landscape analysis for a technology
 * GET: Get API info or quick prior art search
 *
 * Phase 3 of investor due diligence market enhancement
 */

import { NextRequest } from 'next/server'
import {
  analyzePatentLandscape,
  findPriorArt,
  type PatentAnalyzerConfig,
} from '@/lib/intelligence/patent-analyzer'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface PatentAnalysisRequestBody {
  technology: string
  description: string
  targetCompanyPatents?: string[]
  config?: PatentAnalyzerConfig
}

/**
 * POST: Generate patent landscape analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PatentAnalysisRequestBody

    // Validate required fields
    if (!body.technology || !body.description) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['technology', 'description'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate patent landscape
    const landscape = await analyzePatentLandscape(
      body.technology,
      body.description,
      body.targetCompanyPatents,
      body.config
    )

    return new Response(JSON.stringify(landscape), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Analysis-Type': 'patent-landscape',
      },
    })
  } catch (error) {
    console.error('[Patent Intelligence API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        error: 'Failed to generate patent landscape',
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * GET: API info or quick prior art search
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // If claim is provided, run quick prior art search
  const claim = searchParams.get('claim')
  const context = searchParams.get('context')

  if (claim && context) {
    try {
      const priorArt = await findPriorArt(claim, context)

      return new Response(
        JSON.stringify({
          mode: 'prior-art-search',
          claim,
          context,
          results: priorArt,
          resultCount: priorArt.length,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      return new Response(
        JSON.stringify({ error: 'Prior art search failed', details: errorMessage }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Default: return API info
  return new Response(
    JSON.stringify({
      name: 'Patent Intelligence API',
      version: '1.0.0',
      description: 'LLM-powered patent landscape analysis for investor due diligence',
      endpoints: {
        analyze: 'POST /api/intelligence/patents',
        priorArt: 'GET /api/intelligence/patents?claim=<claim>&context=<context>',
      },
      requiredFields: {
        technology: 'string - Technology category',
        description: 'string - Detailed technology description',
      },
      optionalFields: {
        targetCompanyPatents: 'string[] - Patent numbers owned by target company',
        config: {
          maxPatents: 'number - Maximum patents to analyze (default: 50)',
          yearsBack: 'number - Years of history to analyze (default: 10)',
          jurisdictions: 'string[] - Patent jurisdictions (default: US, EP, WO, CN, JP, KR)',
          includeExpired: 'boolean - Include expired patents for prior art (default: false)',
        },
      },
      output: {
        technology: 'Technology analyzed',
        overview: 'Executive summary of patent landscape',
        totalPatentsFound: 'Number of relevant patents identified',
        keyPatents: 'Array of key patents with metadata',
        topHolders: 'Major patent holders with portfolio analysis',
        ftoRisk: 'Freedom-to-operate risk assessment',
        patentTrends: 'Filing trends over time',
        technologyClusters: 'Technology areas and their maturity',
        whitespaceOpportunities: 'Areas with low patent coverage',
        strategicRecommendations: 'IP strategy recommendations',
      },
      exampleRequest: {
        technology: 'solid-state batteries',
        description: 'Sulfide-based solid electrolyte batteries for EVs',
        targetCompanyPatents: ['US10123456B2', 'US10234567B2'],
        config: {
          maxPatents: 30,
          yearsBack: 5,
        },
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
