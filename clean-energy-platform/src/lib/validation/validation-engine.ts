/**
 * Physics-Based Validation Engine
 *
 * A 4-tier validation stack for verifying clean energy technology claims:
 *
 * Tier 1: Rules & Benchmarks - Thermodynamic limits, TRL bounds (<100ms, free)
 * Tier 2: Analytical Calculations - CoolProp, efficiency calcs (<1s, free)
 * Tier 3: Physics Simulations - PyBaMM, electrochemical models (10-60s, $0.01-0.50)
 * Tier 4: ML Inference - PhysicsNeMo surrogates, CFD proxies (1-5s, $0.01-0.10)
 */

import { selectValidationTier, type TierSelectionCriteria } from './tier-selector'
import { checkThermodynamicLimits, checkBenchmarks } from './tier1-rules/thermodynamic-limits'
import { PreloadedBenchmarks } from './preload/benchmark-preloader'
import { CoolPropCache } from './preload/coolprop-cache'

// ============================================================================
// Types
// ============================================================================

export type ValidationTier = 'tier1-rules' | 'tier2-calc' | 'tier3-sim' | 'tier4-ml'

export type ClaimType =
  | 'efficiency'
  | 'lifetime'
  | 'cost'
  | 'performance'
  | 'capacity'
  | 'degradation'
  | 'energy_intensity'

export type ValidationStatus = 'pass' | 'warn' | 'fail' | 'skip' | 'pending'
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain'

export interface ValidationRequest {
  claimId: string
  claimType: ClaimType
  claimText: string
  value: number
  unit: string
  technology: string
  domain: string
  context?: Record<string, unknown>
  maxTier?: ValidationTier
  budgetCents?: number
  maxLatencyMs?: number
}

export interface PhysicsCheckResult {
  thermodynamicLimit?: number
  limitType?: string // e.g., "Carnot", "Betz", "Shockley-Queisser"
  claimedValue: number
  withinLimits: boolean
  margin?: number // How close to limit (0-100%)
  explanation: string
}

export interface CalculatedValue {
  value: number
  unit: string
  method: string // e.g., "CoolProp isentropic", "Butler-Volmer"
  inputs: Record<string, number>
  formula?: string
}

export interface SimulationResult {
  predictedValue: number
  uncertainty: number // +/- X%
  modelId: string
  modelType: string // e.g., "PyBaMM DFN", "PhysicsNeMo CFD"
  computeTimeMs: number
  gpuUsed: boolean
}

export interface BenchmarkComparison {
  source: string // e.g., "IEA 2024", "NREL ATB"
  range: { min: number; max: number; unit: string }
  percentile?: number // Where claim falls in distribution
  isOutlier: boolean
  dataYear?: number
}

export interface ValidationResult {
  claimId: string
  claimText: string
  tier: ValidationTier
  status: ValidationStatus
  confidence: ConfidenceLevel

  // Physics validation
  physicsCheck?: PhysicsCheckResult

  // Calculated value (Tier 2)
  calculatedValue?: CalculatedValue

  // Simulation result (Tier 3)
  simulationResult?: SimulationResult

  // Benchmark comparison
  benchmarkComparison?: BenchmarkComparison

  // Metadata
  sources: string[]
  computeTimeMs: number
  computeCostCents: number
  explanation: string
  recommendations?: string[]
}

export interface ValidationBatch {
  assessmentId: string
  claims: ValidationRequest[]
  results: ValidationResult[]
  totalComputeTimeMs: number
  totalCostCents: number
  summary: {
    passed: number
    warned: number
    failed: number
    skipped: number
  }
}

// ============================================================================
// Cost Constants
// ============================================================================

const TIER_COSTS_CENTS: Record<ValidationTier, number> = {
  'tier1-rules': 0,
  'tier2-calc': 0.1, // Minimal Modal cost for CoolProp
  'tier3-sim': 5, // ~$0.05 per simulation (GPU time)
  'tier4-ml': 2, // ~$0.02 per inference
}

const TIER_LATENCIES_MS: Record<ValidationTier, number> = {
  'tier1-rules': 50,
  'tier2-calc': 500,
  'tier3-sim': 30000,
  'tier4-ml': 2000,
}

// ============================================================================
// Validation Engine Class
// ============================================================================

export class ValidationEngine {
  private benchmarkCache: PreloadedBenchmarks
  private propertyCache: CoolPropCache
  private budgetUsedCents = 0
  private budgetLimitCents: number
  private initialized = false

  constructor(budgetCents: number = 100) {
    this.budgetLimitCents = budgetCents
    this.benchmarkCache = PreloadedBenchmarks.getInstance()
    this.propertyCache = CoolPropCache.getInstance()
  }

  /**
   * Initialize caches (call once at startup for best performance)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    console.time('[ValidationEngine] Initialization')
    await Promise.all([
      this.benchmarkCache.initialize(),
      this.propertyCache.preloadCommonFluids(),
    ])
    this.initialized = true
    console.timeEnd('[ValidationEngine] Initialization')
  }

  /**
   * Validate a single claim
   */
  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now()

    // Determine which tier to use
    const criteria: TierSelectionCriteria = {
      claimType: request.claimType,
      technology: request.technology,
      requiredConfidence: 'high',
      maxLatencyMs: request.maxLatencyMs ?? 60000,
      maxCostCents: Math.min(
        request.budgetCents ?? 50,
        this.budgetLimitCents - this.budgetUsedCents
      ),
    }

    const tier = selectValidationTier(request, criteria)

    // Check budget
    const tierCost = TIER_COSTS_CENTS[tier]
    if (this.budgetUsedCents + tierCost > this.budgetLimitCents) {
      // Downgrade to Tier 1
      return this.runTier1(request, startTime)
    }

    this.budgetUsedCents += tierCost

    // Run appropriate tier
    switch (tier) {
      case 'tier1-rules':
        return this.runTier1(request, startTime)
      case 'tier2-calc':
        return this.runTier2(request, startTime)
      case 'tier3-sim':
        return this.runTier3(request, startTime)
      case 'tier4-ml':
        return this.runTier4(request, startTime)
      default:
        return this.runTier1(request, startTime)
    }
  }

  /**
   * Validate multiple claims with parallel execution
   */
  async validateBatch(
    assessmentId: string,
    claims: ValidationRequest[]
  ): Promise<ValidationBatch> {
    const startTime = Date.now()

    // PARALLEL: Run Tier 1 on all claims simultaneously
    const tier1Results = await Promise.all(
      claims.map((c) => this.runTier1(c, Date.now()))
    )

    // Filter claims that need deeper validation
    const needsMoreValidation: Array<{
      index: number
      claim: ValidationRequest
      tier1Result: ValidationResult
    }> = []

    tier1Results.forEach((result, index) => {
      if (result.status === 'pass' && result.confidence !== 'high') {
        needsMoreValidation.push({
          index,
          claim: claims[index],
          tier1Result: result,
        })
      }
    })

    // PARALLEL: Run Tier 2 on claims that need it
    const tier2Promises = needsMoreValidation.map(async ({ index, claim }) => {
      const result = await this.runTier2(claim, Date.now())
      return { index, result }
    })

    const tier2Results = await Promise.all(tier2Promises)

    // Merge results
    const results = [...tier1Results]
    for (const { index, result } of tier2Results) {
      results[index] = result
    }

    // Calculate summary
    const summary = {
      passed: results.filter((r) => r.status === 'pass').length,
      warned: results.filter((r) => r.status === 'warn').length,
      failed: results.filter((r) => r.status === 'fail').length,
      skipped: results.filter((r) => r.status === 'skip').length,
    }

    return {
      assessmentId,
      claims,
      results,
      totalComputeTimeMs: Date.now() - startTime,
      totalCostCents: this.budgetUsedCents,
      summary,
    }
  }

  // --------------------------------------------------------------------------
  // Tier Implementations
  // --------------------------------------------------------------------------

  private async runTier1(
    request: ValidationRequest,
    startTime: number
  ): Promise<ValidationResult> {
    // Check thermodynamic limits
    const physicsCheck = await checkThermodynamicLimits(request)

    // Check benchmarks
    const benchmarkComparison = await checkBenchmarks(
      request,
      this.benchmarkCache
    ) ?? undefined

    // Determine status
    let status: ValidationStatus = 'pass'
    let confidence: ConfidenceLevel = 'medium'

    if (!physicsCheck.withinLimits) {
      status = 'fail'
      confidence = 'high'
    } else if (benchmarkComparison?.isOutlier) {
      status = 'warn'
      confidence = 'medium'
    } else if (physicsCheck.margin && physicsCheck.margin > 90) {
      status = 'warn'
      confidence = 'medium'
    }

    const sources: string[] = []
    if (physicsCheck.limitType) {
      sources.push(`Physics: ${physicsCheck.limitType} limit`)
    }
    if (benchmarkComparison?.source) {
      sources.push(benchmarkComparison.source)
    }

    return {
      claimId: request.claimId,
      claimText: request.claimText,
      tier: 'tier1-rules',
      status,
      confidence,
      physicsCheck,
      benchmarkComparison,
      sources,
      computeTimeMs: Date.now() - startTime,
      computeCostCents: TIER_COSTS_CENTS['tier1-rules'],
      explanation: this.generateExplanation(physicsCheck, benchmarkComparison),
    }
  }

  private async runTier2(
    request: ValidationRequest,
    startTime: number
  ): Promise<ValidationResult> {
    // Start with Tier 1 checks
    const tier1Result = await this.runTier1(request, startTime)

    // If Tier 1 failed, no need for Tier 2
    if (tier1Result.status === 'fail') {
      return tier1Result
    }

    // Run analytical calculations based on technology/claim type
    let calculatedValue: CalculatedValue | undefined

    try {
      calculatedValue = await this.runAnalyticalCalculation(request)
    } catch (error) {
      console.warn(`[Tier2] Calculation failed for ${request.claimId}:`, error)
    }

    // Compare calculated vs claimed
    let status: ValidationStatus = tier1Result.status
    let confidence: ConfidenceLevel = 'high'

    if (calculatedValue) {
      const difference = Math.abs(calculatedValue.value - request.value)
      const percentDiff = (difference / calculatedValue.value) * 100

      if (percentDiff > 20) {
        status = 'warn'
        confidence = 'medium'
      } else if (percentDiff > 50) {
        status = 'fail'
        confidence = 'high'
      }
    }

    return {
      ...tier1Result,
      tier: 'tier2-calc',
      status,
      confidence,
      calculatedValue,
      computeTimeMs: Date.now() - startTime,
      computeCostCents: TIER_COSTS_CENTS['tier2-calc'],
      sources: [
        ...tier1Result.sources,
        calculatedValue?.method ?? 'Analytical calculation',
      ],
    }
  }

  private async runTier3(
    request: ValidationRequest,
    startTime: number
  ): Promise<ValidationResult> {
    // Start with Tier 2 checks
    const tier2Result = await this.runTier2(request, startTime)

    // If Tier 2 gave high confidence, no need for simulation
    if (tier2Result.confidence === 'high') {
      return tier2Result
    }

    // Run physics simulation
    let simulationResult: SimulationResult | undefined

    try {
      simulationResult = await this.runPhysicsSimulation(request)
    } catch (error) {
      console.warn(`[Tier3] Simulation failed for ${request.claimId}:`, error)
    }

    // Compare simulation vs claimed
    let status: ValidationStatus = tier2Result.status
    let confidence: ConfidenceLevel = 'high'

    if (simulationResult) {
      const difference = Math.abs(simulationResult.predictedValue - request.value)
      const percentDiff = (difference / simulationResult.predictedValue) * 100

      if (percentDiff <= simulationResult.uncertainty) {
        status = 'pass'
      } else if (percentDiff <= simulationResult.uncertainty * 2) {
        status = 'warn'
        confidence = 'medium'
      } else {
        status = 'fail'
      }
    }

    return {
      ...tier2Result,
      tier: 'tier3-sim',
      status,
      confidence,
      simulationResult,
      computeTimeMs: Date.now() - startTime,
      computeCostCents:
        TIER_COSTS_CENTS['tier2-calc'] + TIER_COSTS_CENTS['tier3-sim'],
      sources: [
        ...tier2Result.sources,
        simulationResult?.modelType ?? 'Physics simulation',
      ],
    }
  }

  private async runTier4(
    request: ValidationRequest,
    startTime: number
  ): Promise<ValidationResult> {
    // Tier 4 uses ML surrogates for fast inference
    // Implementation would use pre-trained PhysicsNeMo models
    // For now, fall back to Tier 2
    return this.runTier2(request, startTime)
  }

  // --------------------------------------------------------------------------
  // Calculation Methods (stubs for now, will be implemented)
  // --------------------------------------------------------------------------

  private async runAnalyticalCalculation(
    request: ValidationRequest
  ): Promise<CalculatedValue | undefined> {
    // Will be implemented with CoolProp integration
    // For now, return undefined
    return undefined
  }

  private async runPhysicsSimulation(
    request: ValidationRequest
  ): Promise<SimulationResult | undefined> {
    // Will be implemented with PyBaMM/Modal integration
    // For now, return undefined
    return undefined
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private generateExplanation(
    physicsCheck: PhysicsCheckResult,
    benchmark?: BenchmarkComparison | null
  ): string {
    const parts: string[] = []

    if (!physicsCheck.withinLimits) {
      parts.push(
        `Claim violates ${physicsCheck.limitType} limit of ${physicsCheck.thermodynamicLimit}${physicsCheck.explanation ? `. ${physicsCheck.explanation}` : ''}`
      )
    } else if (physicsCheck.margin && physicsCheck.margin > 80) {
      parts.push(
        `Claim is ${physicsCheck.margin.toFixed(0)}% of ${physicsCheck.limitType} theoretical maximum`
      )
    }

    if (benchmark?.isOutlier) {
      parts.push(
        `Value is outside typical range (${benchmark.range.min}-${benchmark.range.max} ${benchmark.range.unit}) per ${benchmark.source}`
      )
    } else if (benchmark) {
      parts.push(
        `Within ${benchmark.source} range (${benchmark.range.min}-${benchmark.range.max} ${benchmark.range.unit})`
      )
    }

    return parts.join('. ') || 'Validation complete.'
  }

  /**
   * Get budget usage
   */
  getBudgetUsage(): { usedCents: number; limitCents: number; remainingCents: number } {
    return {
      usedCents: this.budgetUsedCents,
      limitCents: this.budgetLimitCents,
      remainingCents: this.budgetLimitCents - this.budgetUsedCents,
    }
  }

  /**
   * Reset budget for new assessment
   */
  resetBudget(): void {
    this.budgetUsedCents = 0
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let globalEngine: ValidationEngine | null = null

export function getValidationEngine(budgetCents?: number): ValidationEngine {
  if (!globalEngine) {
    globalEngine = new ValidationEngine(budgetCents)
  }
  return globalEngine
}

export async function initializeValidationEngine(): Promise<ValidationEngine> {
  const engine = getValidationEngine()
  await engine.initialize()
  return engine
}
