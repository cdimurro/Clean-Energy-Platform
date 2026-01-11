/**
 * Base Assessment Agent
 *
 * Abstract base class for all assessment component agents.
 * Provides shared utilities for:
 * - AI generation via Gemini 3 Flash
 * - Literature search
 * - Benchmark retrieval
 * - Claim validation
 * - Progress reporting
 *
 * All agents use Gemini 3 Flash Preview for cost efficiency.
 */

import { generateText, type GeminiOptions, type ThinkingLevel } from '@/lib/ai/gemini'
import {
  type DomainId,
  type DomainCategory,
  DOMAIN_CATEGORY_MAP,
  CATEGORY_PRIMARY_METRICS,
} from '@/lib/domains/base'
import type { EnhancedAssessmentPlan } from '@/types/tea'
import {
  type StandardizedMetricsOutput,
  type StandardizedMetric,
  type MetricsValidationStatus,
  STANDARDIZED_METRICS_PROMPT_SCHEMA,
  createEmptyMetricsOutput,
  createMetric,
  REQUIRED_METRICS_BY_DOMAIN,
  STANDARD_UNITS,
} from './metrics-interface'

// ============================================================================
// Types
// ============================================================================

export interface AssessmentInput {
  assessmentId: string
  title: string
  description: string
  technologyType: string
  domainId: DomainId
  claims: ExtractedClaim[]
  parameters: Record<string, string>
  documents?: UploadedDocument[]
  // Enhanced plan with user-modified assumptions and methodology
  enhancedPlan?: EnhancedAssessmentPlan
}

export interface ExtractedClaim {
  id: string
  claim: string
  source: string
  validationMethod: string
  confidence: 'high' | 'medium' | 'low'
}

export interface UploadedDocument {
  id: string
  name: string
  type: string
  extractedData?: Record<string, unknown>
}

export interface ComponentOutput<T = unknown> {
  componentId: string
  componentName: string
  status: 'complete' | 'error'
  content: T
  sections: ReportSection[]
  error?: string
  duration: number
  tokensUsed?: number
}

export interface ReportSection {
  id: string
  title: string
  level: 1 | 2 | 3
  content: string
  tables?: ReportTable[]
  charts?: ReportChart[]
  citations?: Citation[]
}

export interface ReportTable {
  id: string
  title: string
  headers: string[]
  rows: string[][]
  footnotes?: string[]
}

export interface ReportChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'tornado' | 'waterfall' | 'scatter' | 'histogram'
  data: Record<string, unknown>
}

export interface Citation {
  id: string
  text: string
  source: string
  url?: string
  year?: number
}

export interface ValidationResult {
  claim: string
  validated: boolean
  confidence: 'high' | 'medium' | 'low' | 'unvalidatable'
  evidence: string[]
  sources: Citation[]
  notes: string
}

export interface LiteratureResult {
  title: string
  authors: string[]
  year: number
  source: string
  abstract: string
  relevance: number
  url?: string
  doi?: string
}

export interface BenchmarkData {
  metric: string
  value: number
  unit: string
  source: string
  year: number
  category: 'commercial' | 'lab' | 'theoretical' | 'projected'
  range?: { min: number; max: number }
}

export type ProgressCallback = (progress: number, message: string) => void

// ============================================================================
// Agent Configuration
// ============================================================================

export interface AgentConfig {
  name: string
  description: string
  thinkingLevel: ThinkingLevel
  maxOutputTokens: number
  temperature: number
}

// Default configurations for each component type
export const AGENT_CONFIGS: Record<string, AgentConfig> = {
  'technology-deep-dive': {
    name: 'Technology Deep Dive',
    description: 'Researches technology, competitive landscape, and core innovations',
    thinkingLevel: 'medium',
    maxOutputTokens: 8192,
    temperature: 0.7,
  },
  'claims-validation': {
    name: 'Claims Validation',
    description: 'Validates key claims against literature and benchmarks',
    thinkingLevel: 'medium', // Reduced from high for performance
    maxOutputTokens: 8192,
    temperature: 0.3,
  },
  'performance-simulation': {
    name: 'Performance Simulation',
    description: 'Runs physics-based simulation models',
    thinkingLevel: 'medium', // Reduced from high for performance
    maxOutputTokens: 8192,
    temperature: 0.3,
  },
  'system-integration': {
    name: 'System Integration',
    description: 'Analyzes market fit and infrastructure dependencies',
    thinkingLevel: 'medium',
    maxOutputTokens: 8192,
    temperature: 0.5,
  },
  'tea-analysis': {
    name: 'Techno-Economic Analysis',
    description: 'Builds financial model and calculates LCOE, NPV, IRR',
    thinkingLevel: 'medium', // Reduced from high for performance
    maxOutputTokens: 8192,
    temperature: 0.2,
  },
  'improvement-opportunities': {
    name: 'Improvement Opportunities',
    description: 'Identifies optimization pathways and R&D directions',
    thinkingLevel: 'low', // Reduced from medium for performance
    maxOutputTokens: 8192,
    temperature: 0.7,
  },
  'final-synthesis': {
    name: 'Final Synthesis',
    description: 'Generates executive summary and final recommendation',
    thinkingLevel: 'medium', // Reduced from high for performance
    maxOutputTokens: 8192,
    temperature: 0.5,
  },
}

// ============================================================================
// Base Agent Class
// ============================================================================

export abstract class BaseAssessmentAgent {
  protected config: AgentConfig
  protected domainCategory: DomainCategory

  constructor(
    protected componentId: string,
    protected input: AssessmentInput
  ) {
    this.config = AGENT_CONFIGS[componentId] || AGENT_CONFIGS['technology-deep-dive']
    this.domainCategory = DOMAIN_CATEGORY_MAP[input.domainId] || 'general'
  }

  /**
   * Execute the agent's main task
   */
  abstract execute(onProgress?: ProgressCallback): Promise<ComponentOutput>

  /**
   * Generate report sections from the component output
   */
  abstract generateReportSections(output: ComponentOutput): Promise<ReportSection[]>

  // ==========================================================================
  // AI Generation Utilities
  // ==========================================================================

  /**
   * Generate text using Gemini 3 Flash
   */
  protected async generate(
    prompt: string,
    options: Partial<GeminiOptions> = {}
  ): Promise<string> {
    const geminiOptions: GeminiOptions = {
      model: 'flash', // Always use Gemini 3 Flash Preview
      thinkingLevel: options.thinkingLevel || this.config.thinkingLevel,
      maxOutputTokens: options.maxOutputTokens || this.config.maxOutputTokens,
      temperature: options.temperature ?? this.config.temperature,
      ...options,
    }

    return generateText(prompt, geminiOptions)
  }

  /**
   * Generate structured JSON output
   */
  protected async generateJSON<T>(
    prompt: string,
    options: Partial<GeminiOptions> = {}
  ): Promise<T> {
    const result = await this.generate(prompt, {
      ...options,
      responseMimeType: 'application/json',
    })

    try {
      // Clean up common JSON formatting issues
      let cleaned = result.trim()
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7)
      }
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3)
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3)
      }
      return JSON.parse(cleaned.trim())
    } catch (error) {
      console.error('[BaseAgent] Failed to parse JSON response:', result.substring(0, 500))
      throw new Error(`Failed to parse AI response as JSON: ${error}`)
    }
  }

  // ==========================================================================
  // Literature Search
  // ==========================================================================

  /**
   * Search for relevant literature
   */
  protected async searchLiterature(
    query: string,
    maxResults: number = 10
  ): Promise<LiteratureResult[]> {
    // Generate search-optimized query
    const searchPrompt = `You are a research assistant. Given the following query about ${this.input.technologyType}, generate a list of ${maxResults} relevant academic papers, reports, and industry publications.

Query: ${query}

Technology Context: ${this.input.description}

Return a JSON array of literature results with this structure:
[
  {
    "title": "Paper title",
    "authors": ["Author 1", "Author 2"],
    "year": 2024,
    "source": "Journal/Conference/Organization name",
    "abstract": "Brief summary of key findings relevant to the query",
    "relevance": 0.95,
    "url": "https://example.com/paper",
    "doi": "10.1234/example"
  }
]

Focus on:
1. Peer-reviewed publications from the last 5 years
2. DOE, IEA, NREL, IRENA reports for energy technologies
3. Industry white papers from established companies
4. Patents for novel innovations

Return only the JSON array, no additional text.`

    try {
      const results = await this.generateJSON<LiteratureResult[]>(searchPrompt, {
        temperature: 0.3,
        thinkingLevel: 'low',
      })
      return results.sort((a, b) => b.relevance - a.relevance)
    } catch (error) {
      console.error('[BaseAgent] Literature search failed:', error)
      return []
    }
  }

  // ==========================================================================
  // Benchmark Retrieval
  // ==========================================================================

  /**
   * Get industry benchmarks for the technology
   */
  protected async getBenchmarks(): Promise<BenchmarkData[]> {
    const metrics = CATEGORY_PRIMARY_METRICS[this.domainCategory]

    const benchmarkPrompt = `You are an energy/technology analyst. Provide current industry benchmarks for ${this.input.technologyType}.

Technology Description: ${this.input.description}

Domain Category: ${this.domainCategory}
Primary Metrics: ${metrics.join(', ')}

Return a JSON array of benchmark data with this structure:
[
  {
    "metric": "LCOE",
    "value": 45,
    "unit": "$/MWh",
    "source": "IEA World Energy Outlook 2024",
    "year": 2024,
    "category": "commercial",
    "range": { "min": 30, "max": 60 }
  }
]

Include benchmarks for:
1. Current commercial performance (commercial)
2. Lab/research records (lab)
3. Theoretical limits (theoretical)
4. Projected future performance (projected)

Use authoritative sources: IEA, IRENA, NREL, DOE, BloombergNEF, industry reports.
Return only the JSON array, no additional text.`

    try {
      return await this.generateJSON<BenchmarkData[]>(benchmarkPrompt, {
        temperature: 0.2,
        thinkingLevel: 'medium',
      })
    } catch (error) {
      console.error('[BaseAgent] Benchmark retrieval failed:', error)
      return []
    }
  }

  // ==========================================================================
  // Claim Validation
  // ==========================================================================

  /**
   * Validate a specific claim against literature and benchmarks
   */
  protected async validateClaim(claim: ExtractedClaim): Promise<ValidationResult> {
    const validationPrompt = `You are a technical reviewer validating a claim about ${this.input.technologyType}.

CLAIM: "${claim.claim}"
SOURCE: ${claim.source}
VALIDATION METHOD: ${claim.validationMethod}

Technology Context: ${this.input.description}

Analyze this claim and provide:
1. Whether it can be validated (true/false)
2. Confidence level (high/medium/low/unvalidatable)
3. Supporting evidence from literature
4. Specific sources that support or contradict the claim
5. Any caveats or conditions

Return a JSON object with this structure:
{
  "claim": "${claim.claim}",
  "validated": true,
  "confidence": "medium",
  "evidence": [
    "Evidence point 1 with specific data",
    "Evidence point 2 with comparison to benchmarks"
  ],
  "sources": [
    {
      "id": "1",
      "text": "IEA Hydrogen Report 2024",
      "source": "International Energy Agency",
      "url": "https://www.iea.org/reports/global-hydrogen-review-2024",
      "year": 2024
    }
  ],
  "notes": "Additional context about the validation"
}

Be rigorous and cite specific data points. If the claim cannot be fully validated, explain why.
Return only the JSON object, no additional text.`

    try {
      return await this.generateJSON<ValidationResult>(validationPrompt, {
        temperature: 0.2,
        thinkingLevel: 'high',
      })
    } catch (error) {
      console.error('[BaseAgent] Claim validation failed:', error)
      return {
        claim: claim.claim,
        validated: false,
        confidence: 'unvalidatable',
        evidence: [],
        sources: [],
        notes: `Validation failed: ${error}`,
      }
    }
  }

  // ==========================================================================
  // Domain Utilities
  // ==========================================================================

  /**
   * Get primary metrics for the technology's domain
   */
  protected getPrimaryMetrics(): string[] {
    return CATEGORY_PRIMARY_METRICS[this.domainCategory] || CATEGORY_PRIMARY_METRICS['general']
  }

  /**
   * Get domain-specific analysis guidance
   */
  protected getDomainGuidance(): string {
    const guidanceMap: Record<DomainCategory, string> = {
      'clean-energy': 'Focus on LCOE, capacity factor, grid integration, and policy incentives.',
      'energy-storage': 'Focus on LCOS, round-trip efficiency, cycle life, and discharge duration.',
      'industrial': 'Focus on carbon abatement cost, energy intensity, and retrofit potential.',
      'transportation': 'Focus on TCO, range, charging/refueling infrastructure, and emissions.',
      'agriculture': 'Focus on yield per unit area, water/energy efficiency, and scalability.',
      'materials': 'Focus on production cost, purity, supply chain risk, and alternatives.',
      'biotech': 'Focus on COGS, efficacy, regulatory pathway, and manufacturing scale-up.',
      'computing': 'Focus on performance per watt, error rates, and system integration.',
      'waste-to-fuel': 'Focus on LCOF ($/liter biocrude), biocrude yield (wt%), energy recovery (%), carbon intensity (g CO2e/MJ), and multi-product revenue streams (biocrude, biochar, tipping fees).',
      'general': 'Focus on NPV, IRR, payback period, and risk factors.',
    }
    return guidanceMap[this.domainCategory]
  }

  // ==========================================================================
  // Report Utilities
  // ==========================================================================

  /**
   * Create a standard report section
   */
  protected createSection(
    id: string,
    title: string,
    level: 1 | 2 | 3,
    content: string,
    options?: {
      tables?: ReportTable[]
      charts?: ReportChart[]
      citations?: Citation[]
    }
  ): ReportSection {
    return {
      id,
      title,
      level,
      content,
      tables: options?.tables,
      charts: options?.charts,
      citations: options?.citations,
    }
  }

  /**
   * Create a report table
   */
  protected createTable(
    id: string,
    title: string,
    headers: string[],
    rows: string[][],
    footnotes?: string[]
  ): ReportTable {
    return { id, title, headers, rows, footnotes }
  }

  /**
   * Format a number for display
   */
  protected formatNumber(value: number, precision: number = 2): string {
    if (Math.abs(value) >= 1e9) {
      return `${(value / 1e9).toFixed(precision)}B`
    }
    if (Math.abs(value) >= 1e6) {
      return `${(value / 1e6).toFixed(precision)}M`
    }
    if (Math.abs(value) >= 1e3) {
      return `${(value / 1e3).toFixed(precision)}K`
    }
    return value.toFixed(precision)
  }

  /**
   * Format currency
   */
  protected formatCurrency(value: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  /**
   * Format percentage
   */
  protected formatPercent(value: number, precision: number = 1): string {
    return `${(value * 100).toFixed(precision)}%`
  }

  // ==========================================================================
  // Standardized Metrics Support
  // ==========================================================================

  /**
   * Get the standardized metrics prompt schema to include in prompts
   */
  protected getMetricsPromptSchema(): string {
    return STANDARDIZED_METRICS_PROMPT_SCHEMA
  }

  /**
   * Generate JSON with standardized metrics validation and retry
   */
  protected async generateWithMetrics<T extends { standardizedMetrics?: StandardizedMetricsOutput }>(
    prompt: string,
    options: Partial<GeminiOptions> = {},
    maxRetries: number = 2 // Reduced from 3 for performance
  ): Promise<T> {
    // Add metrics schema to prompt
    const promptWithSchema = `${prompt}\n\n${STANDARDIZED_METRICS_PROMPT_SCHEMA}`

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const output = await this.generateJSON<T>(promptWithSchema, options)

        // Validate the standardized metrics
        const validation = this.validateMetricsOutput(output.standardizedMetrics)

        if (validation.isValid) {
          return output
        }

        // If not valid and more retries available, try again with correction prompt
        if (attempt < maxRetries - 1) {
          const correctionPrompt = this.buildCorrectionPrompt(prompt, validation)
          console.log(`[${this.componentId}] Metrics validation failed (attempt ${attempt + 1}), retrying...`)
          console.log(`[${this.componentId}] Issues: ${validation.missingRequired.join(', ')} | ${validation.invalidValues.map(v => v.reason).join(', ')}`)

          // Continue with correction prompt on next iteration
          prompt = correctionPrompt
        } else {
          // Last attempt - return with warnings
          console.warn(`[${this.componentId}] Returning output with validation warnings after ${maxRetries} attempts`)
          if (output.standardizedMetrics) {
            output.standardizedMetrics.warnings = [
              ...(output.standardizedMetrics.warnings || []),
              ...validation.warnings,
              ...validation.missingRequired.map(f => `Missing: ${f}`),
              ...validation.invalidValues.map(v => `Invalid ${v.field}: ${v.reason}`),
            ]
          }
          return output
        }
      } catch (error) {
        if (attempt < maxRetries - 1) {
          console.log(`[${this.componentId}] Generation failed (attempt ${attempt + 1}), retrying: ${error}`)
          continue
        }
        throw error
      }
    }

    throw new Error(`Failed to generate valid output after ${maxRetries} retries`)
  }

  /**
   * Validate a standardized metrics output
   */
  protected validateMetricsOutput(
    metrics: StandardizedMetricsOutput | undefined
  ): MetricsValidationStatus {
    const result: MetricsValidationStatus = {
      isValid: true,
      score: 100,
      missingRequired: [],
      invalidValues: [],
      warnings: [],
    }

    if (!metrics) {
      return {
        isValid: false,
        score: 0,
        missingRequired: ['standardizedMetrics (entire block missing)'],
        invalidValues: [],
        warnings: [],
      }
    }

    // Check required fields
    const requiredFields = [
      'primaryCostMetric',
      'efficiency',
      'trl',
      'rating',
      'capex',
      'opex',
      'secondaryMetrics',
      'generatedAt',
      'sourceComponent',
    ]

    for (const field of requiredFields) {
      if (!(field in metrics) || metrics[field as keyof StandardizedMetricsOutput] === undefined) {
        result.missingRequired.push(field)
        result.score -= 10
      }
    }

    // Validate TRL is 1-9
    if (typeof metrics.trl === 'number') {
      if (metrics.trl < 1 || metrics.trl > 9 || !Number.isInteger(metrics.trl)) {
        result.invalidValues.push({ field: 'trl', reason: 'Must be integer 1-9' })
        result.score -= 10
      }
    }

    // Validate efficiency is 0-100
    if (metrics.efficiency?.value !== undefined) {
      if (metrics.efficiency.value < 0 || metrics.efficiency.value > 100) {
        result.invalidValues.push({ field: 'efficiency', reason: 'Must be 0-100%' })
        result.score -= 10
      }
    }

    // Validate rating enum
    const validRatings = ['BREAKTHROUGH', 'PROMISING', 'CONDITIONAL', 'NOT_RECOMMENDED']
    if (metrics.rating && !validRatings.includes(metrics.rating)) {
      result.invalidValues.push({ field: 'rating', reason: `Must be one of: ${validRatings.join(', ')}` })
      result.score -= 10
    }

    // Validate metric objects have required fields
    const metricFields = ['primaryCostMetric', 'efficiency', 'capex', 'opex'] as const
    for (const field of metricFields) {
      const metric = metrics[field]
      if (metric) {
        if (typeof metric.value !== 'number') {
          result.invalidValues.push({ field: `${field}.value`, reason: 'Must be a number' })
          result.score -= 5
        }
        if (!metric.id || !metric.name || !metric.unit || !metric.source) {
          result.warnings.push(`${field} missing some optional fields`)
          result.score -= 2
        }
      }
    }

    // Check domain-specific required metrics
    const domainMetrics = REQUIRED_METRICS_BY_DOMAIN[this.input.domainId] || REQUIRED_METRICS_BY_DOMAIN['general']
    const allMetricIds = [
      metrics.primaryCostMetric?.id,
      metrics.efficiency?.id,
      ...(metrics.secondaryMetrics || []).map(m => m.id),
    ].filter(Boolean)

    for (const requiredMetric of domainMetrics.slice(0, 3)) { // Check first 3 key metrics
      if (!allMetricIds.some(id => id?.toLowerCase().includes(requiredMetric.toLowerCase()))) {
        result.warnings.push(`Domain metric '${requiredMetric}' not found`)
        result.score -= 3
      }
    }

    // Determine overall validity
    result.score = Math.max(0, result.score)
    result.isValid = result.missingRequired.length === 0 && result.invalidValues.length === 0 && result.score >= 60

    return result
  }

  /**
   * Build a correction prompt for retry
   */
  private buildCorrectionPrompt(
    originalPrompt: string,
    validation: MetricsValidationStatus
  ): string {
    const issues: string[] = []

    if (validation.missingRequired.length > 0) {
      issues.push(`Missing required fields: ${validation.missingRequired.join(', ')}`)
    }

    if (validation.invalidValues.length > 0) {
      issues.push(`Invalid values: ${validation.invalidValues.map(v => `${v.field} (${v.reason})`).join(', ')}`)
    }

    if (validation.warnings.length > 0) {
      issues.push(`Warnings: ${validation.warnings.join(', ')}`)
    }

    return `IMPORTANT: Your previous response had validation issues that must be fixed:

${issues.map(i => `- ${i}`).join('\n')}

Please regenerate your response ensuring ALL standardizedMetrics fields are properly populated.

${originalPrompt}`
  }

  /**
   * Create a standardized metric with defaults
   */
  protected createStandardizedMetric(
    id: string,
    value: number,
    options?: Partial<Omit<StandardizedMetric, 'id' | 'value'>>
  ): StandardizedMetric {
    return createMetric(id, value, options)
  }

  /**
   * Create empty metrics output for initialization
   */
  protected createEmptyMetrics(): StandardizedMetricsOutput {
    return createEmptyMetricsOutput(this.componentId)
  }

  /**
   * Get standard unit for a metric ID
   */
  protected getStandardUnit(metricId: string): string {
    return STANDARD_UNITS[metricId] || ''
  }
}

// ============================================================================
// Exports
// ============================================================================

export type {
  GeminiOptions,
  ThinkingLevel,
}

// Re-export metrics types for convenience
export type {
  StandardizedMetricsOutput,
  StandardizedMetric,
  MetricsValidationStatus,
} from './metrics-interface'

export {
  STANDARDIZED_METRICS_PROMPT_SCHEMA,
  createMetric,
  createEmptyMetricsOutput,
  REQUIRED_METRICS_BY_DOMAIN,
  STANDARD_UNITS,
} from './metrics-interface'
