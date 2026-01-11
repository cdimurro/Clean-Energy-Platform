/**
 * Competitor Intelligence API
 *
 * POST: Generate competitive landscape analysis for a technology
 * GET: Get API info
 *
 * Phase 3 of investor due diligence market enhancement
 */

import { NextRequest } from 'next/server'
import {
  generateCompetitiveLandscape,
  type CompetitorMapperConfig,
} from '@/lib/intelligence/competitor-mapper'

// Force Node.js runtime
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CompetitorAnalysisRequestBody {
  technology: string
  description: string
  targetCompanyName?: string
  config?: CompetitorMapperConfig
}

/**
 * POST: Generate competitive landscape analysis
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompetitorAnalysisRequestBody

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

    // Generate competitive landscape
    const landscape = await generateCompetitiveLandscape(
      body.technology,
      body.description,
      body.targetCompanyName,
      body.config
    )

    return new Response(JSON.stringify(landscape), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Analysis-Type': 'competitive-landscape',
      },
    })
  } catch (error) {
    console.error('[Competitor Intelligence API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        error: 'Failed to generate competitive landscape',
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * GET: API info
 */
export async function GET() {
  return new Response(
    JSON.stringify({
      name: 'Competitor Intelligence API',
      version: '1.0.0',
      description: 'LLM-powered competitive landscape analysis for investor due diligence',
      endpoints: {
        analyze: 'POST /api/intelligence/competitors',
      },
      requiredFields: {
        technology: 'string - Technology category (e.g., "perovskite solar cells")',
        description: 'string - Detailed technology description',
      },
      optionalFields: {
        targetCompanyName: 'string - Name of the company being evaluated',
        config: {
          maxCompetitors: 'number - Maximum competitors to identify (default: 10)',
          includePublicCompanies: 'boolean - Include public companies (default: true)',
          includeAcquired: 'boolean - Include acquired companies (default: false)',
          focusRegions: 'string[] - Geographic regions to focus on (default: ["global"])',
        },
      },
      output: {
        technology: 'Technology analyzed',
        marketOverview: 'Executive summary of competitive landscape',
        totalAddressableMarket: 'TAM estimate',
        competitors: 'Array of competitor profiles with funding, strengths, weaknesses',
        comparisonMatrix: 'Side-by-side comparison on key metrics',
        marketPositioning: 'Market segment analysis',
        competitiveAdvantages: 'Potential advantages for target company',
        competitiveThreats: 'Key competitive threats',
        barrierToEntry: 'high/medium/low',
        consolidationRisk: 'high/medium/low',
        recommendations: 'Strategic recommendations',
      },
      exampleRequest: {
        technology: 'perovskite tandem solar cells',
        description:
          'High-efficiency perovskite-silicon tandem solar cells targeting >30% efficiency',
        targetCompanyName: 'NextGen Solar Inc.',
        config: {
          maxCompetitors: 8,
          includePublicCompanies: true,
        },
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
