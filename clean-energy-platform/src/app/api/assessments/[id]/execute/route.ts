/**
 * Assessment Execution API (SSE)
 *
 * POST: Execute assessment with real-time progress streaming
 *
 * Returns Server-Sent Events (SSE) with progress updates for each component.
 */

import { NextRequest } from 'next/server'
import {
  runAssessmentWithStreaming,
  type AssessmentInput,
  type AssessmentStreamEvent,
} from '@/lib/ai/agents/assessment'
import { type DomainId } from '@/lib/domains/base'
import type { EnhancedAssessmentPlan } from '@/types/tea'

// Force Node.js runtime for streaming
export const runtime = 'nodejs'

// Disable response buffering for SSE
export const dynamic = 'force-dynamic'

interface ExecuteRequestBody {
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
  parameters: Record<string, string>
  documents?: Array<{
    id: string
    name: string
    type: string
    extractedData?: Record<string, unknown>
  }>
  config?: {
    skipComponents?: string[]
    continueOnError?: boolean
  }
  // Enhanced plan with user-modified assumptions
  enhancedPlan?: EnhancedAssessmentPlan
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = (await request.json()) as ExecuteRequestBody

    // Validate required fields
    if (!body.title || !body.description || !body.technologyType || !body.domainId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, description, technologyType, domainId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Extract assumptions from enhanced plan if available
    const planAssumptions: Record<string, string | number> = {}
    if (body.enhancedPlan?.assumptions) {
      const allAssumptions = Object.values(body.enhancedPlan.assumptions).flat()
      allAssumptions.forEach((assumption) => {
        planAssumptions[assumption.key] = assumption.value
      })
    }

    // Merge plan assumptions with explicit parameters
    const mergedParameters = {
      ...planAssumptions,
      ...body.parameters,
    }

    // Build assessment input
    const input: AssessmentInput = {
      assessmentId: id,
      title: body.title,
      description: body.description,
      technologyType: body.technologyType,
      domainId: body.domainId,
      claims: body.claims || [],
      parameters: Object.fromEntries(
        Object.entries(mergedParameters).map(([k, v]) => [k, String(v)])
      ),
      documents: body.documents,
      // Pass enhanced plan for methodology configuration
      enhancedPlan: body.enhancedPlan,
    }

    // Create SSE stream
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Helper to send SSE events
        const sendEvent = (event: AssessmentStreamEvent) => {
          const data = JSON.stringify(event)
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }

        try {
          // Run assessment with streaming
          const result = await runAssessmentWithStreaming(
            input,
            {
              continueOnError: body.config?.continueOnError ?? true,
              skipComponents: body.config?.skipComponents,
            },
            (event) => {
              sendEvent(event)
            }
          )

          // Send final result
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
        'X-Assessment-Id': id,
      },
    })
  } catch (error) {
    console.error('[Execute API] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: 'Failed to execute assessment', details: errorMessage }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

/**
 * GET: Check execution status (for polling fallback)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // This could be enhanced to check a database/cache for execution status
  // For now, return a simple status endpoint
  return new Response(
    JSON.stringify({
      assessmentId: id,
      message: 'Use POST to start execution with SSE streaming',
      endpoints: {
        execute: `POST /api/assessments/${id}/execute`,
        status: `GET /api/assessments/${id}/execute`,
        pdf: `POST /api/assessments/${id}/pdf`,
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  )
}
