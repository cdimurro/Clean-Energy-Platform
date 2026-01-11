/**
 * Tier Selection Logic
 *
 * Determines which validation tier to use based on:
 * - Claim type and technology
 * - Required confidence level
 * - Latency and cost constraints
 * - Available analytical models or simulations
 */

import type { ValidationRequest, ValidationTier } from './validation-engine'

// ============================================================================
// Types
// ============================================================================

export interface TierSelectionCriteria {
  claimType: string
  technology: string
  requiredConfidence: 'high' | 'medium' | 'low'
  maxLatencyMs: number
  maxCostCents: number
}

export interface TierCapabilities {
  hasAnalyticalModel: boolean
  hasSimulation: boolean
  hasSurrogate: boolean
  estimatedLatencyMs: number
  estimatedCostCents: number
}

// ============================================================================
// Technology-Claim Mappings
// ============================================================================

/**
 * Technologies that have closed-form analytical models (Tier 2)
 */
const ANALYTICAL_MODEL_SUPPORT: Record<string, string[]> = {
  // Electrochemistry
  'pem-electrolyzer': ['efficiency', 'energy_intensity', 'performance'],
  'soec': ['efficiency', 'energy_intensity', 'performance'],
  'alkaline-electrolyzer': ['efficiency', 'energy_intensity', 'performance'],
  'fuel-cell': ['efficiency', 'performance'],

  // Thermodynamics
  'heat-exchanger': ['efficiency', 'performance'],
  'heat-pump': ['efficiency', 'performance'],
  'steam-turbine': ['efficiency', 'performance'],
  'gas-turbine': ['efficiency', 'performance'],
  'rankine-cycle': ['efficiency', 'performance'],
  'brayton-cycle': ['efficiency', 'performance'],

  // Renewables
  'solar-pv': ['efficiency', 'capacity', 'performance'],
  'wind-turbine': ['efficiency', 'capacity', 'performance'],
  'csp': ['efficiency', 'performance'],

  // Storage
  'battery': ['efficiency', 'degradation', 'lifetime', 'capacity'],
  'flow-battery': ['efficiency', 'degradation', 'lifetime'],
  'thermal-storage': ['efficiency', 'capacity'],

  // Industrial
  'dac': ['energy_intensity', 'cost', 'performance'],
  'ccs': ['efficiency', 'energy_intensity', 'cost'],
  'ammonia-synthesis': ['efficiency', 'energy_intensity'],
}

/**
 * Technologies that have physics simulation support (Tier 3)
 */
const SIMULATION_SUPPORT: Record<string, string[]> = {
  // Battery - PyBaMM support
  'battery': ['degradation', 'lifetime', 'performance', 'capacity'],
  'solid-state-battery': ['degradation', 'lifetime', 'performance'],
  'flow-battery': ['degradation', 'lifetime'],

  // Electrochemistry - Butler-Volmer kinetics
  'pem-electrolyzer': ['degradation', 'lifetime'],
  'soec': ['degradation', 'lifetime'],
  'fuel-cell': ['degradation', 'lifetime'],

  // Thermal - CFD surrogates
  'heat-exchanger': ['performance'],
  'csp': ['performance'],
}

/**
 * Technologies that have pre-trained ML surrogates (Tier 4)
 */
const SURROGATE_SUPPORT: Record<string, string[]> = {
  // PhysicsNeMo trained models
  'heat-exchanger': ['performance'],
  'csp': ['performance'],

  // Materials Project integration
  'battery': ['capacity'],
  'catalyst': ['performance'],
}

// ============================================================================
// Tier Selection Functions
// ============================================================================

/**
 * Normalize technology name for matching
 */
function normalizeTechnology(technology: string): string {
  return technology
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Check if technology has analytical model for claim type
 */
export function hasAnalyticalModel(technology: string, claimType: string): boolean {
  const normalized = normalizeTechnology(technology)

  // Direct match
  if (ANALYTICAL_MODEL_SUPPORT[normalized]?.includes(claimType)) {
    return true
  }

  // Partial match (e.g., "pem electrolyzer" matches "pem-electrolyzer")
  for (const [tech, claims] of Object.entries(ANALYTICAL_MODEL_SUPPORT)) {
    if (normalized.includes(tech) || tech.includes(normalized)) {
      if (claims.includes(claimType)) return true
    }
  }

  return false
}

/**
 * Check if technology has physics simulation support
 */
export function needsPhysicsSimulation(technology: string): boolean {
  const normalized = normalizeTechnology(technology)

  for (const tech of Object.keys(SIMULATION_SUPPORT)) {
    if (normalized.includes(tech) || tech.includes(normalized)) {
      return true
    }
  }

  return false
}

/**
 * Check if technology has pre-trained surrogate models
 */
export function hasSurrogateModel(technology: string): boolean {
  const normalized = normalizeTechnology(technology)

  for (const tech of Object.keys(SURROGATE_SUPPORT)) {
    if (normalized.includes(tech) || tech.includes(normalized)) {
      return true
    }
  }

  return false
}

/**
 * Get tier capabilities for a technology/claim combination
 */
export function getTierCapabilities(
  technology: string,
  claimType: string
): TierCapabilities {
  return {
    hasAnalyticalModel: hasAnalyticalModel(technology, claimType),
    hasSimulation: needsPhysicsSimulation(technology),
    hasSurrogate: hasSurrogateModel(technology),
    estimatedLatencyMs: estimateLatency(technology, claimType),
    estimatedCostCents: estimateCost(technology, claimType),
  }
}

/**
 * Estimate latency for highest available tier
 */
function estimateLatency(technology: string, claimType: string): number {
  if (hasSurrogateModel(technology)) return 2000 // 2s for ML inference
  if (needsPhysicsSimulation(technology)) return 30000 // 30s for simulation
  if (hasAnalyticalModel(technology, claimType)) return 500 // 500ms for calc
  return 50 // 50ms for Tier 1 only
}

/**
 * Estimate cost (in cents) for highest available tier
 */
function estimateCost(technology: string, claimType: string): number {
  if (needsPhysicsSimulation(technology)) return 5 // $0.05 GPU time
  if (hasSurrogateModel(technology)) return 2 // $0.02 inference
  if (hasAnalyticalModel(technology, claimType)) return 0.1 // $0.001 Modal
  return 0 // Free for Tier 1
}

// ============================================================================
// Main Tier Selection
// ============================================================================

/**
 * Select the appropriate validation tier based on request and constraints
 */
export function selectValidationTier(
  request: ValidationRequest,
  criteria: TierSelectionCriteria
): ValidationTier {
  const { technology, claimType } = request
  const { requiredConfidence, maxLatencyMs, maxCostCents } = criteria

  // Get capabilities
  const caps = getTierCapabilities(technology, claimType)

  // Always start with Tier 1 (free, fast) as baseline
  // The actual validation will run Tier 1 first regardless

  // For low confidence requirements, Tier 1 may suffice
  if (requiredConfidence === 'low') {
    return 'tier1-rules'
  }

  // Check if we can afford higher tiers
  const canAffordTier2 = maxLatencyMs >= 500 && maxCostCents >= 0.1
  const canAffordTier3 = maxLatencyMs >= 30000 && maxCostCents >= 5
  const canAffordTier4 = maxLatencyMs >= 2000 && maxCostCents >= 2

  // For high confidence, try to use the highest tier available
  if (requiredConfidence === 'high') {
    // Prefer physics simulation for high confidence
    if (caps.hasSimulation && canAffordTier3) {
      return 'tier3-sim'
    }

    // ML surrogate is faster but still high quality
    if (caps.hasSurrogate && canAffordTier4) {
      return 'tier4-ml'
    }

    // Analytical calculations are good for efficiency claims
    if (caps.hasAnalyticalModel && canAffordTier2) {
      return 'tier2-calc'
    }
  }

  // For medium confidence, analytical is usually sufficient
  if (requiredConfidence === 'medium') {
    if (caps.hasAnalyticalModel && canAffordTier2) {
      return 'tier2-calc'
    }

    // Fall back to ML if available and faster
    if (caps.hasSurrogate && canAffordTier4) {
      return 'tier4-ml'
    }
  }

  // Claim-type specific logic
  switch (claimType) {
    case 'efficiency':
      // Efficiency claims benefit from physics-based validation
      if (caps.hasAnalyticalModel && canAffordTier2) {
        return 'tier2-calc'
      }
      break

    case 'lifetime':
    case 'degradation':
      // Lifetime/degradation really needs simulation
      if (caps.hasSimulation && canAffordTier3) {
        return 'tier3-sim'
      }
      break

    case 'cost':
      // Cost claims are primarily benchmark-based
      return 'tier1-rules'

    case 'capacity':
    case 'performance':
      // Can use analytical or simulation
      if (caps.hasAnalyticalModel && canAffordTier2) {
        return 'tier2-calc'
      }
      break
  }

  // Default to Tier 1
  return 'tier1-rules'
}

/**
 * Get recommended tier for a batch of claims (for planning)
 */
export function getRecommendedTiers(
  requests: ValidationRequest[],
  budgetCents: number,
  maxLatencyMs: number
): Map<string, ValidationTier> {
  const result = new Map<string, ValidationTier>()
  let remainingBudget = budgetCents

  // Sort by potential value - prioritize efficiency/performance claims
  const prioritized = [...requests].sort((a, b) => {
    const priority: Record<string, number> = {
      efficiency: 1,
      performance: 2,
      lifetime: 3,
      degradation: 4,
      capacity: 5,
      cost: 6,
      energy_intensity: 7,
    }
    return (priority[a.claimType] || 10) - (priority[b.claimType] || 10)
  })

  for (const request of prioritized) {
    const tier = selectValidationTier(request, {
      claimType: request.claimType,
      technology: request.technology,
      requiredConfidence: 'high',
      maxLatencyMs,
      maxCostCents: remainingBudget,
    })

    result.set(request.claimId, tier)

    // Deduct cost from budget
    const cost = estimateCost(request.technology, request.claimType)
    remainingBudget = Math.max(0, remainingBudget - cost)
  }

  return result
}
