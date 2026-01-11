/**
 * Rapid Assessment API (SSE)
 *
 * POST: Execute rapid 3-agent assessment with real-time progress streaming
 *
 * This endpoint runs a streamlined assessment using only:
 * 1. Technology Analysis
 * 2. Claims Validation
 * 3. Rapid Synthesis
 *
 * Target turnaround: 48-72 hours
 * Target price point: $5K-$15K
 *
 * Returns Server-Sent Events (SSE) with progress updates.
 */

import { NextRequest } from 'next/server'
import {
  runRapidAssessmentWithStreaming,
  estimateRapidAssessmentDuration,
  type RapidAssessmentConfig,
  type RapidAssessmentStreamEvent,
} from '@/lib/ai/agents/assessment/rapid-orchestrator'
import type { AssessmentInput } from '@/lib/ai/agents/assessment/base-agent'
import { type DomainId } from '@/lib/domains/base'
import { detectRedFlags } from '@/lib/validation/red-flags'

// Force Node.js runtime for streaming
export const runtime = 'nodejs'

// Disable response buffering for SSE
export const dynamic = 'force-dynamic'

interface RapidAssessmentRequestBody {
  assessmentId?: string
  title: string
  description: string
  technologyType: string
  domainId: DomainId
  claims: Array<{
    id: string
    claim: string
    source: string
    validationMethod: string
    confidence: 'high' | 'medium' | 'low'
  }>
  parameters?: Record<string, string>
  documents?: Array<{
    id: string
    name: string
    type: string
    extractedData?: Record<string, unknown>
  }>
  config?: {
    skipRedFlags?: boolean
    continueOnError?: boolean
  }
}

/**
 * POST: Execute rapid assessment
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RapidAssessmentRequestBody

    // Validate required fields
    if (!body.title || !body.description || !body.technologyType || !body.domainId) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['title', 'description', 'technologyType', 'domainId'],
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Validate claims
    if (!body.claims || body.claims.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'At least one claim is required for assessment',
          hint: 'Provide claims extracted from pitch deck, technical specs, or research papers',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Generate assessment ID if not provided
    const assessmentId = body.assessmentId || `rapid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    // Build assessment input
    const input: AssessmentInput = {
      assessmentId,
      title: body.title,
      description: body.description,
      technologyType: body.technologyType,
      domainId: body.domainId,
      claims: body.claims,
      parameters: body.parameters || {},
      documents: body.documents,
    }

    // Config for rapid assessment
    const config: RapidAssessmentConfig = {
      skipRedFlags: body.config?.skipRedFlags ?? false,
      continueOnError: body.config?.continueOnError ?? true,
      maxRetries: 1,
    }

    // Estimate duration
    const estimate = estimateRapidAssessmentDuration(input)

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send SSE events
        const sendEvent = (event: RapidAssessmentStreamEvent | { type: 'estimate'; data: typeof estimate }) => {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        try {
          // Send estimate first
          sendEvent({ type: 'estimate', data: estimate })

          // Run rapid assessment with streaming
          const result = await runRapidAssessmentWithStreaming(
            input,
            config,
            (event) => {
              sendEvent(event)
            }
          )

          // Send final result (already sent by orchestrator, but ensure it's sent)
          sendEvent({ type: 'complete', result })

          // Close stream
          controller.close()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          sendEvent({ type: 'error', error: errorMessage })
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Assessment-Id': assessmentId,
        'X-Assessment-Mode': 'rapid',
      },
    })
  } catch (error) {
    console.error('[Rapid Assessment API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({
        error: 'Failed to execute rapid assessment',
        details: errorMessage,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * GET: Get rapid assessment info and run red flag pre-check
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  // If claims are provided as query params, run quick red flag check
  const technology = searchParams.get('technology')
  const claimsJson = searchParams.get('claims')

  if (technology && claimsJson) {
    try {
      const claims = JSON.parse(claimsJson) as Array<{
        id: string
        claim: string
        source: string
        validationMethod: string
        confidence: 'high' | 'medium' | 'low'
      }>

      // Quick red flag detection (no full assessment)
      const input: AssessmentInput = {
        assessmentId: 'precheck',
        title: 'Pre-check',
        description: '',
        technologyType: technology,
        domainId: 'general',
        claims,
        parameters: {},
      }

      const redFlags = await detectRedFlags(input)

      return new Response(
        JSON.stringify({
          mode: 'precheck',
          technology,
          claimsCount: claims.length,
          redFlags,
          recommendation: redFlags.hasRedFlags
            ? 'Review red flags before proceeding with full assessment'
            : 'No immediate red flags detected',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid claims JSON format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  // Default: return API info
  return new Response(
    JSON.stringify({
      name: 'Quick TRL Assessment API',
      version: '1.0.0',
      description: 'Rapid 3-agent assessment for investor due diligence',
      targetTurnaround: '48-72 hours',
      priceRange: '$5K-$15K',
      agents: [
        'Technology Analysis',
        'Claims Validation',
        'Rapid Synthesis',
      ],
      outputs: {
        rating: 'Traffic light (GREEN/YELLOW/RED)',
        trl: 'Technology Readiness Level (1-9)',
        topRisks: 'Top 5 technical risks',
        recommendation: 'PROCEED / PROCEED_WITH_CAUTION / DO_NOT_PROCEED',
        executiveSummary: '2-page summary',
      },
      endpoints: {
        execute: 'POST /api/assessments/rapid',
        precheck: 'GET /api/assessments/rapid?technology=<type>&claims=<json>',
      },
      requiredFields: {
        title: 'string - Technology or company name',
        description: 'string - Technology description',
        technologyType: 'string - e.g., "perovskite solar cell", "PEM electrolyzer"',
        domainId: 'string - Domain ID (solar, hydrogen, battery, etc.)',
        claims: 'array - Claims to validate',
      },
      exampleRequest: {
        title: 'NextGen Solar Inc.',
        description: 'Perovskite-silicon tandem solar cell technology',
        technologyType: 'perovskite tandem solar cell',
        domainId: 'solar',
        claims: [
          {
            id: 'eff-1',
            claim: 'Achieved 32% power conversion efficiency',
            source: 'pitch_deck.pdf',
            validationMethod: 'benchmark_comparison',
            confidence: 'medium',
          },
        ],
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
