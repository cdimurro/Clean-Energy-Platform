/**
 * Claims Validation Agent
 *
 * Validates technology claims against:
 * - Published literature and research
 * - Industry benchmarks and standards
 * - Physical and thermodynamic limits
 * - Independent third-party data
 *
 * Output: 10-15 pages with claims validation matrix and evidence
 */

import {
  BaseAssessmentAgent,
  type AssessmentInput,
  type ComponentOutput,
  type ReportSection,
  type ReportTable,
  type Citation,
  type ProgressCallback,
  type ValidationResult,
  type BenchmarkData,
  type ExtractedClaim,
} from './base-agent'
import {
  ValidationEngine,
  getValidationEngine,
  type ValidationRequest,
  type ValidationResult as PhysicsValidationResult,
} from '@/lib/validation/validation-engine'
import { PreloadedBenchmarks } from '@/lib/validation/preload/benchmark-preloader'

// ============================================================================
// Types
// ============================================================================

interface ClaimValidationResult extends ValidationResult {
  claimId: string
  category: 'performance' | 'cost' | 'lifetime' | 'efficiency' | 'other'
  benchmarkComparison?: {
    metric: string
    claimedValue: number
    benchmarkValue: number
    benchmarkSource: string
    deviation: number
    assessment: 'within_range' | 'above_average' | 'exceptional' | 'unrealistic'
  }
  physicsCheck?: {
    limit: string
    limitValue: number
    unit: string
    claimedValue: number
    margin: number
    passes: boolean
  }
}

interface ValidationMethodology {
  approach: string
  dataSources: string[]
  limitations: string[]
  confidenceFactors: string[]
}

interface ClaimsValidationAnalysis {
  methodology: ValidationMethodology
  validatedClaims: ClaimValidationResult[]
  overallAssessment: {
    totalClaims: number
    validated: number
    partiallyValidated: number
    unvalidated: number
    concerning: number
    overallConfidence: 'high' | 'medium' | 'low'
    summary: string
  }
  benchmarks: BenchmarkData[]
  keyFindings: string[]
  recommendations: string[]
  citations: Citation[]
}

// ============================================================================
// Agent Implementation
// ============================================================================

export class ClaimsValidationAgent extends BaseAssessmentAgent {
  constructor(input: AssessmentInput) {
    super('claims-validation', input)
  }

  async execute(onProgress?: ProgressCallback): Promise<ComponentOutput> {
    const startTime = Date.now()

    try {
      onProgress?.(5, 'Starting claims validation...')

      // Step 1: Define methodology
      onProgress?.(10, 'Establishing validation methodology...')
      const methodology = await this.defineMethodology()

      // Step 2: Get industry benchmarks
      onProgress?.(20, 'Retrieving industry benchmarks...')
      const benchmarks = await this.getBenchmarks()

      // Step 3: Validate claims in parallel batches for performance
      const validatedClaims: ClaimValidationResult[] = []
      const claimsCount = this.input.claims.length
      const BATCH_SIZE = 3 // Process 3 claims concurrently to respect API rate limits

      // Split claims into batches
      const batches: typeof this.input.claims[] = []
      for (let i = 0; i < claimsCount; i += BATCH_SIZE) {
        batches.push(this.input.claims.slice(i, i + BATCH_SIZE))
      }

      // Process batches in parallel
      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex]
        const batchStart = batchIndex * BATCH_SIZE
        const progress = 30 + Math.round((batchStart / claimsCount) * 50)
        onProgress?.(progress, `Validating claims ${batchStart + 1}-${Math.min(batchStart + BATCH_SIZE, claimsCount)}/${claimsCount}...`)

        // Validate all claims in batch concurrently
        const batchResults = await Promise.all(
          batch.map(claim => this.validateClaimComprehensively(claim, benchmarks))
        )
        validatedClaims.push(...batchResults)
      }

      // Step 4: Generate overall assessment
      onProgress?.(85, 'Generating overall assessment...')
      const overallAssessment = this.generateOverallAssessment(validatedClaims)

      // Step 5: Generate key findings and recommendations
      onProgress?.(90, 'Compiling findings and recommendations...')
      const { keyFindings, recommendations } = await this.generateFindingsAndRecommendations(
        validatedClaims,
        overallAssessment
      )

      // Step 6: Gather citations
      onProgress?.(95, 'Compiling citations...')
      const citations = this.extractCitations(validatedClaims)

      const analysis: ClaimsValidationAnalysis = {
        methodology,
        validatedClaims,
        overallAssessment,
        benchmarks,
        keyFindings,
        recommendations,
        citations,
      }

      // Generate report sections
      const sections = await this.generateReportSections({
        componentId: 'claims-validation',
        componentName: 'Claims Validation',
        status: 'complete',
        content: analysis,
        sections: [],
        duration: Date.now() - startTime,
      })

      onProgress?.(100, 'Claims validation complete')

      return {
        componentId: 'claims-validation',
        componentName: 'Claims Validation',
        status: 'complete',
        content: analysis,
        sections,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        componentId: 'claims-validation',
        componentName: 'Claims Validation',
        status: 'error',
        content: {},
        sections: [],
        error: errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  // ==========================================================================
  // Validation Methods
  // ==========================================================================

  private async defineMethodology(): Promise<ValidationMethodology> {
    const prompt = `Define the validation methodology for assessing claims about ${this.input.technologyType}.

TECHNOLOGY: ${this.input.title}
DOMAIN: ${this.domainCategory}
CLAIMS TO VALIDATE:
${this.input.claims.map(c => `- ${c.claim}`).join('\n')}

Return a JSON object describing the validation approach:
{
  "approach": "Description of the overall validation methodology (2-3 paragraphs)",
  "dataSources": [
    "Data source 1 (e.g., IEA reports)",
    "Data source 2 (e.g., peer-reviewed literature)",
    "Data source 3 (e.g., industry benchmarks)"
  ],
  "limitations": [
    "Limitation 1 of the validation approach",
    "Limitation 2"
  ],
  "confidenceFactors": [
    "Factor that increases confidence (e.g., multiple independent sources)",
    "Factor that decreases confidence (e.g., limited public data)"
  ]
}

Return only the JSON object.`

    return this.generateJSON<ValidationMethodology>(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private async validateClaimComprehensively(
    claim: ExtractedClaim,
    benchmarks: BenchmarkData[]
  ): Promise<ClaimValidationResult> {
    // First, get basic validation
    const baseValidation = await this.validateClaim(claim)

    // Then, enhance with benchmark comparison and physics check
    const category = this.categorizeClaim(claim.claim)
    const benchmarkComparison = this.compareToBenchmark(claim, benchmarks)
    const physicsCheck = await this.checkPhysicsLimits(claim)

    // Adjust confidence based on all factors
    const adjustedConfidence = this.adjustConfidence(
      baseValidation.confidence,
      benchmarkComparison,
      physicsCheck
    )

    return {
      ...baseValidation,
      claimId: claim.id,
      category,
      confidence: adjustedConfidence,
      benchmarkComparison,
      physicsCheck,
    }
  }

  private categorizeClaim(claim: string): ClaimValidationResult['category'] {
    const claimLower = claim.toLowerCase()

    if (claimLower.includes('efficiency') || claimLower.includes('%')) {
      return 'efficiency'
    }
    if (claimLower.includes('cost') || claimLower.includes('$') || claimLower.includes('price')) {
      return 'cost'
    }
    if (claimLower.includes('lifetime') || claimLower.includes('hours') || claimLower.includes('cycles') || claimLower.includes('years')) {
      return 'lifetime'
    }
    if (claimLower.includes('capacity') || claimLower.includes('power') || claimLower.includes('energy') || claimLower.includes('output')) {
      return 'performance'
    }
    return 'other'
  }

  private compareToBenchmark(
    claim: ExtractedClaim,
    benchmarks: BenchmarkData[]
  ): ClaimValidationResult['benchmarkComparison'] | undefined {
    // Extract numeric value from claim
    const numericMatch = claim.claim.match(/(\d+(?:\.\d+)?)\s*(%|kW|MW|kg|hours?|years?|\$)/i)
    if (!numericMatch) return undefined

    const claimedValue = parseFloat(numericMatch[1])
    const unit = numericMatch[2].toLowerCase()

    // Find relevant benchmark
    const relevantBenchmark = benchmarks.find(b => {
      const benchmarkUnit = b.unit.toLowerCase()
      return benchmarkUnit.includes(unit) || unit.includes(benchmarkUnit.charAt(0))
    })

    if (!relevantBenchmark) return undefined

    const deviation = ((claimedValue - relevantBenchmark.value) / relevantBenchmark.value) * 100

    let assessment: 'within_range' | 'above_average' | 'exceptional' | 'unrealistic'
    if (relevantBenchmark.range) {
      if (claimedValue >= relevantBenchmark.range.min && claimedValue <= relevantBenchmark.range.max) {
        assessment = 'within_range'
      } else if (claimedValue > relevantBenchmark.range.max && deviation < 30) {
        assessment = 'above_average'
      } else if (deviation > 50) {
        assessment = 'unrealistic'
      } else {
        assessment = 'exceptional'
      }
    } else {
      if (Math.abs(deviation) < 15) {
        assessment = 'within_range'
      } else if (Math.abs(deviation) < 30) {
        assessment = 'above_average'
      } else if (Math.abs(deviation) < 50) {
        assessment = 'exceptional'
      } else {
        assessment = 'unrealistic'
      }
    }

    return {
      metric: relevantBenchmark.metric,
      claimedValue,
      benchmarkValue: relevantBenchmark.value,
      benchmarkSource: relevantBenchmark.source,
      deviation,
      assessment,
    }
  }

  private async checkPhysicsLimits(
    claim: ExtractedClaim
  ): Promise<ClaimValidationResult['physicsCheck'] | undefined> {
    // Extract numeric value and determine claim type
    const numericMatch = claim.claim.match(/(\d+(?:\.\d+)?)\s*(%|kWh|MW|kg|hours?|years?|cycles?|Wh|Nm3)/i)
    if (!numericMatch) {
      // Fall back to AI for non-numeric claims
      return this.checkPhysicsLimitsWithAI(claim)
    }

    const value = parseFloat(numericMatch[1])
    const unit = numericMatch[2].toLowerCase()

    // Determine claim type from text and unit
    let claimType: 'efficiency' | 'lifetime' | 'cost' | 'performance' | 'capacity' | 'degradation' | 'energy_intensity' = 'performance'

    if (unit === '%' || claim.claim.toLowerCase().includes('efficiency')) {
      claimType = 'efficiency'
    } else if (unit.includes('hour') || unit.includes('year') || unit.includes('cycle')) {
      claimType = 'lifetime'
    } else if (unit.includes('kwh') && claim.claim.toLowerCase().includes('nm3')) {
      claimType = 'energy_intensity'
    } else if (unit.includes('wh') && claim.claim.toLowerCase().includes('kg')) {
      claimType = 'capacity'
    }

    try {
      // Use the physics validation engine
      const engine = getValidationEngine()
      const request: ValidationRequest = {
        claimId: claim.id,
        claimType,
        claimText: claim.claim,
        value,
        unit,
        technology: this.input.technologyType,
        domain: this.domainCategory,
        maxTier: 'tier2-calc',
        budgetCents: 10,
      }

      const result = await engine.validate(request)

      if (result.physicsCheck) {
        return {
          limit: result.physicsCheck.limitType || 'Thermodynamic limit',
          limitValue: result.physicsCheck.thermodynamicLimit || 0,
          unit,
          claimedValue: value,
          margin: result.physicsCheck.margin || 0,
          passes: result.physicsCheck.withinLimits,
        }
      }

      return undefined
    } catch (error) {
      console.warn('[ClaimsAgent] Physics validation failed, falling back to AI:', error)
      return this.checkPhysicsLimitsWithAI(claim)
    }
  }

  private async checkPhysicsLimitsWithAI(
    claim: ExtractedClaim
  ): Promise<ClaimValidationResult['physicsCheck'] | undefined> {
    const prompt = `Check if this claim violates any fundamental physical or thermodynamic limits.

CLAIM: "${claim.claim}"
TECHNOLOGY: ${this.input.technologyType}
DOMAIN: ${this.domainCategory}

Known limits for reference:
- Carnot efficiency: 1 - T_cold/T_hot
- Betz limit (wind): 59.3%
- Shockley-Queisser limit (solar): ~33.7% single junction
- Electrolysis minimum voltage: 1.23V (reversible)
- Fuel cell theoretical efficiency: ~83%

If the claim involves a measurable quantity, check against relevant physical limits.
Return a JSON object or null if not applicable:
{
  "limit": "Name of the physical limit",
  "limitValue": 59.3,
  "unit": "%",
  "claimedValue": 45,
  "margin": 14.3,
  "passes": true
}

If no physics check is applicable, return: null`

    try {
      const result = await this.generate(prompt, {
        temperature: 0.2,
        thinkingLevel: 'high',
      })

      if (result.toLowerCase().includes('null') || result.trim() === 'null') {
        return undefined
      }

      return JSON.parse(result.trim())
    } catch {
      return undefined
    }
  }

  private adjustConfidence(
    baseConfidence: ValidationResult['confidence'],
    benchmarkComparison?: ClaimValidationResult['benchmarkComparison'],
    physicsCheck?: ClaimValidationResult['physicsCheck']
  ): ValidationResult['confidence'] {
    // Start with base confidence
    let confidenceScore = {
      high: 3,
      medium: 2,
      low: 1,
      unvalidatable: 0,
    }[baseConfidence]

    // Adjust based on benchmark comparison
    if (benchmarkComparison) {
      if (benchmarkComparison.assessment === 'unrealistic') {
        confidenceScore -= 2
      } else if (benchmarkComparison.assessment === 'exceptional') {
        confidenceScore -= 1
      } else if (benchmarkComparison.assessment === 'within_range') {
        confidenceScore += 0.5
      }
    }

    // Adjust based on physics check
    if (physicsCheck) {
      if (!physicsCheck.passes) {
        confidenceScore -= 2
      } else if (physicsCheck.margin < 10) {
        confidenceScore -= 0.5
      }
    }

    // Convert back to confidence level
    if (confidenceScore >= 2.5) return 'high'
    if (confidenceScore >= 1.5) return 'medium'
    if (confidenceScore >= 0.5) return 'low'
    return 'unvalidatable'
  }

  private generateOverallAssessment(
    validatedClaims: ClaimValidationResult[]
  ): ClaimsValidationAnalysis['overallAssessment'] {
    const total = validatedClaims.length
    const validated = validatedClaims.filter(c => c.validated && c.confidence === 'high').length
    const partiallyValidated = validatedClaims.filter(
      c => c.validated && (c.confidence === 'medium' || c.confidence === 'low')
    ).length
    const unvalidated = validatedClaims.filter(c => !c.validated || c.confidence === 'unvalidatable').length
    const concerning = validatedClaims.filter(
      c => c.benchmarkComparison?.assessment === 'unrealistic' || c.physicsCheck?.passes === false
    ).length

    // Calculate overall confidence
    const avgConfidence = validatedClaims.reduce((sum, c) => {
      const score = { high: 3, medium: 2, low: 1, unvalidatable: 0 }[c.confidence]
      return sum + score
    }, 0) / total

    let overallConfidence: 'high' | 'medium' | 'low'
    if (avgConfidence >= 2.5 && concerning === 0) {
      overallConfidence = 'high'
    } else if (avgConfidence >= 1.5 && concerning <= 1) {
      overallConfidence = 'medium'
    } else {
      overallConfidence = 'low'
    }

    // Generate summary
    let summary = ''
    if (overallConfidence === 'high') {
      summary = `The technology claims are well-supported by available evidence. ${validated} of ${total} claims were validated with high confidence against published literature and industry benchmarks.`
    } else if (overallConfidence === 'medium') {
      summary = `The technology claims are partially supported by available evidence. While ${validated + partiallyValidated} of ${total} claims could be validated, some require additional verification or have limited supporting data.`
    } else {
      summary = `Several technology claims require additional scrutiny. ${unvalidated} of ${total} claims could not be adequately validated, and ${concerning} claims appear to exceed industry norms or physical limits.`
    }

    return {
      totalClaims: total,
      validated,
      partiallyValidated,
      unvalidated,
      concerning,
      overallConfidence,
      summary,
    }
  }

  private async generateFindingsAndRecommendations(
    validatedClaims: ClaimValidationResult[],
    overallAssessment: ClaimsValidationAnalysis['overallAssessment']
  ): Promise<{ keyFindings: string[]; recommendations: string[] }> {
    const prompt = `Based on the claims validation results, generate key findings and recommendations.

TECHNOLOGY: ${this.input.title}
OVERALL CONFIDENCE: ${overallAssessment.overallConfidence}
SUMMARY: ${overallAssessment.summary}

Validated Claims:
${validatedClaims.map(c => `- ${c.claim}: ${c.validated ? 'VALIDATED' : 'NOT VALIDATED'} (${c.confidence} confidence)${c.benchmarkComparison ? ` - ${c.benchmarkComparison.assessment}` : ''}`).join('\n')}

Return a JSON object:
{
  "keyFindings": [
    "Key finding 1 with specific evidence",
    "Key finding 2",
    "Key finding 3",
    "Key finding 4",
    "Key finding 5"
  ],
  "recommendations": [
    "Recommendation 1 for investors/evaluators",
    "Recommendation 2 (specific data to request)",
    "Recommendation 3 (additional validation needed)"
  ]
}

Be specific and actionable. Focus on what matters for investment/adoption decisions.
Return only the JSON object.`

    return this.generateJSON(prompt, {
      thinkingLevel: 'medium',
    })
  }

  private extractCitations(validatedClaims: ClaimValidationResult[]): Citation[] {
    const citations: Citation[] = []
    const seenSources = new Set<string>()

    validatedClaims.forEach((claim, idx) => {
      claim.sources.forEach(source => {
        if (!seenSources.has(source.text)) {
          seenSources.add(source.text)
          citations.push({
            ...source,
            id: `claims-${idx + 1}-${citations.length + 1}`,
          })
        }
      })
    })

    return citations
  }

  // ==========================================================================
  // Report Generation
  // ==========================================================================

  async generateReportSections(output: ComponentOutput): Promise<ReportSection[]> {
    const analysis = output.content as ClaimsValidationAnalysis
    const sections: ReportSection[] = []

    // Section 2.1: Methodology
    sections.push(this.createSection(
      'claims-2-1',
      'Validation Methodology',
      2,
      analysis.methodology.approach + '\n\n' +
      'Data Sources:\n' + analysis.methodology.dataSources.map(s => `- ${s}`).join('\n') + '\n\n' +
      'Limitations:\n' + analysis.methodology.limitations.map(l => `- ${l}`).join('\n')
    ))

    // Section 2.2: Claims Validation Matrix
    sections.push(this.createSection(
      'claims-2-2',
      'Claims Validation Matrix',
      2,
      `Overall Assessment: ${analysis.overallAssessment.overallConfidence.toUpperCase()} CONFIDENCE\n\n` +
      analysis.overallAssessment.summary,
      {
        tables: [this.createClaimsMatrixTable(analysis.validatedClaims)],
      }
    ))

    // Section 2.3: Literature Cross-Reference
    sections.push(this.createSection(
      'claims-2-3',
      'Literature Cross-Reference',
      2,
      this.formatLiteratureAnalysis(analysis.validatedClaims),
      {
        citations: analysis.citations.slice(0, 20),
      }
    ))

    // Section 2.4: Benchmark Comparison
    sections.push(this.createSection(
      'claims-2-4',
      'Benchmark Comparison',
      2,
      this.formatBenchmarkAnalysis(analysis.validatedClaims),
      {
        tables: [this.createBenchmarkComparisonTable(analysis.validatedClaims)],
      }
    ))

    // Section 2.5: Independent Data Verification
    sections.push(this.createSection(
      'claims-2-5',
      'Independent Data Verification',
      2,
      this.formatPhysicsAnalysis(analysis.validatedClaims),
      {
        tables: analysis.validatedClaims.some(c => c.physicsCheck)
          ? [this.createPhysicsCheckTable(analysis.validatedClaims)]
          : undefined,
      }
    ))

    // Section 2.6: Confidence Assessment
    sections.push(this.createSection(
      'claims-2-6',
      'Confidence Assessment',
      2,
      'Key Findings:\n' + analysis.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n\n') + '\n\n' +
      'Recommendations:\n' + analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n\n'),
      {
        tables: [this.createConfidenceSummaryTable(analysis.overallAssessment)],
      }
    ))

    return sections
  }

  // ==========================================================================
  // Table Creation Helpers
  // ==========================================================================

  private createClaimsMatrixTable(claims: ClaimValidationResult[]): ReportTable {
    return this.createTable(
      'claims-matrix',
      'Claims Validation Matrix',
      ['Claim', 'Category', 'Validated', 'Confidence', 'Key Evidence'],
      claims.map(c => [
        c.claim.length > 60 ? c.claim.substring(0, 57) + '...' : c.claim,
        c.category.charAt(0).toUpperCase() + c.category.slice(1),
        c.validated ? 'Yes' : 'No',
        c.confidence.toUpperCase(),
        c.evidence[0] || 'See detailed analysis',
      ])
    )
  }

  private createBenchmarkComparisonTable(claims: ClaimValidationResult[]): ReportTable {
    const claimsWithBenchmarks = claims.filter(c => c.benchmarkComparison)
    return this.createTable(
      'benchmark-comparison',
      'Benchmark Comparison',
      ['Claim', 'Claimed Value', 'Benchmark', 'Deviation', 'Assessment'],
      claimsWithBenchmarks.map(c => {
        const b = c.benchmarkComparison!
        return [
          c.claim.length > 40 ? c.claim.substring(0, 37) + '...' : c.claim,
          String(b.claimedValue),
          `${b.benchmarkValue} (${b.benchmarkSource})`,
          `${b.deviation > 0 ? '+' : ''}${b.deviation.toFixed(1)}%`,
          b.assessment.replace('_', ' ').toUpperCase(),
        ]
      })
    )
  }

  private createPhysicsCheckTable(claims: ClaimValidationResult[]): ReportTable {
    const claimsWithPhysics = claims.filter(c => c.physicsCheck)
    return this.createTable(
      'physics-check',
      'Physical Limits Verification',
      ['Claim', 'Physical Limit', 'Limit Value', 'Claimed', 'Margin', 'Status'],
      claimsWithPhysics.map(c => {
        const p = c.physicsCheck!
        return [
          c.claim.length > 30 ? c.claim.substring(0, 27) + '...' : c.claim,
          p.limit,
          `${p.limitValue} ${p.unit}`,
          `${p.claimedValue} ${p.unit}`,
          `${p.margin.toFixed(1)} ${p.unit}`,
          p.passes ? 'PASS' : 'FAIL',
        ]
      })
    )
  }

  private createConfidenceSummaryTable(
    assessment: ClaimsValidationAnalysis['overallAssessment']
  ): ReportTable {
    return this.createTable(
      'confidence-summary',
      'Validation Summary',
      ['Metric', 'Count', 'Percentage'],
      [
        ['Total Claims', String(assessment.totalClaims), '100%'],
        ['Fully Validated', String(assessment.validated), this.formatPercent(assessment.validated / assessment.totalClaims)],
        ['Partially Validated', String(assessment.partiallyValidated), this.formatPercent(assessment.partiallyValidated / assessment.totalClaims)],
        ['Unvalidated', String(assessment.unvalidated), this.formatPercent(assessment.unvalidated / assessment.totalClaims)],
        ['Concerning', String(assessment.concerning), this.formatPercent(assessment.concerning / assessment.totalClaims)],
      ]
    )
  }

  // ==========================================================================
  // Formatting Helpers
  // ==========================================================================

  private formatLiteratureAnalysis(claims: ClaimValidationResult[]): string {
    let content = 'The following claims were cross-referenced against published literature:\n\n'

    claims.forEach((claim, idx) => {
      content += `${idx + 1}. ${claim.claim}\n`
      content += `   Status: ${claim.validated ? 'Validated' : 'Not Validated'} (${claim.confidence} confidence)\n`
      if (claim.sources.length > 0) {
        content += `   Sources: ${claim.sources.map(s => s.source).join('; ')}\n`
      }
      content += '\n'
    })

    return content
  }

  private formatBenchmarkAnalysis(claims: ClaimValidationResult[]): string {
    const withBenchmarks = claims.filter(c => c.benchmarkComparison)

    if (withBenchmarks.length === 0) {
      return 'No claims with numeric values could be compared to industry benchmarks.'
    }

    let content = 'Claims with quantifiable metrics were compared against industry benchmarks:\n\n'

    withBenchmarks.forEach(claim => {
      const b = claim.benchmarkComparison!
      content += `- ${claim.claim}\n`
      content += `  Claimed: ${b.claimedValue} | Benchmark: ${b.benchmarkValue} (${b.benchmarkSource})\n`
      content += `  Deviation: ${b.deviation > 0 ? '+' : ''}${b.deviation.toFixed(1)}% | Assessment: ${b.assessment.replace('_', ' ')}\n\n`
    })

    return content
  }

  private formatPhysicsAnalysis(claims: ClaimValidationResult[]): string {
    const withPhysics = claims.filter(c => c.physicsCheck)

    if (withPhysics.length === 0) {
      return 'Physical limits verification was performed where applicable. No claims were found to violate fundamental physical or thermodynamic constraints.'
    }

    let content = 'Claims were checked against fundamental physical and thermodynamic limits:\n\n'

    withPhysics.forEach(claim => {
      const p = claim.physicsCheck!
      content += `- ${claim.claim}\n`
      content += `  Physical Limit: ${p.limit} = ${p.limitValue} ${p.unit}\n`
      content += `  Claimed Value: ${p.claimedValue} ${p.unit} | Margin: ${p.margin.toFixed(1)} ${p.unit}\n`
      content += `  Status: ${p.passes ? 'Within physical limits' : 'EXCEEDS PHYSICAL LIMITS'}\n\n`
    })

    return content
  }
}
