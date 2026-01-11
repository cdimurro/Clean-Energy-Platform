/**
 * Red Flag Detector
 *
 * Fast pre-screening for physics violations and implausible claims.
 * Runs before full assessment to quickly identify dealbreakers.
 *
 * Checks:
 * - Thermodynamic impossibilities (Carnot, Betz, Shockley-Queisser)
 * - TRL/funding stage mismatches
 * - Efficiency claims exceeding benchmarks by >20%
 * - Missing critical data indicators
 * - Economic impossibilities
 *
 * Target: <500ms execution time
 */

import type { AssessmentInput, ExtractedClaim } from '../ai/agents/assessment/base-agent'
import {
  PHYSICS_CONSTANTS,
  getPhysicsLimits,
  calculateCarnotEfficiency,
} from './tier1-rules/thermodynamic-limits'

// ============================================================================
// Types
// ============================================================================

export type RedFlagSeverity = 'critical' | 'high' | 'medium'

export type RedFlagCategory =
  | 'thermodynamic'
  | 'trl_mismatch'
  | 'benchmark_outlier'
  | 'missing_data'
  | 'economic'
  | 'timeline'

export interface RedFlag {
  id: string
  category: RedFlagCategory
  severity: RedFlagSeverity
  description: string
  explanation: string
  claimId?: string
  value?: number
  limit?: number
  recommendation: string
}

export interface RedFlagReport {
  hasRedFlags: boolean
  flags: RedFlag[]
  summary: string
  executionTimeMs: number
}

// ============================================================================
// Physics Limits Database
// ============================================================================

const EFFICIENCY_LIMITS: Record<string, { limit: number; type: string; description: string }> = {
  // Solar
  'solar_single': { limit: 33.7, type: 'Shockley-Queisser', description: 'Single junction solar cell' },
  'solar_tandem': { limit: 47, type: 'Shockley-Queisser', description: 'Tandem/multi-junction solar' },
  'solar_perovskite': { limit: 33.7, type: 'Shockley-Queisser', description: 'Single junction perovskite' },
  'solar_perovskite_tandem': { limit: 47, type: 'Thermodynamic', description: 'Perovskite-silicon tandem' },

  // Wind
  'wind': { limit: 59.3, type: 'Betz', description: 'Wind turbine power coefficient' },

  // Electrolysis
  'electrolyzer_pem': { limit: 100, type: 'Thermoneutral', description: 'PEM electrolyzer (HHV basis)' },
  'electrolyzer_alkaline': { limit: 100, type: 'Thermoneutral', description: 'Alkaline electrolyzer (HHV basis)' },
  'electrolyzer_soec': { limit: 120, type: 'Thermoneutral', description: 'SOEC with thermal input' },

  // Batteries
  'battery_lithium': { limit: 99, type: 'Coulombic', description: 'Li-ion round-trip efficiency' },
  'battery_flow': { limit: 85, type: 'Practical', description: 'Flow battery (pumping losses)' },
  'battery_solid_state': { limit: 99, type: 'Coulombic', description: 'Solid-state battery' },

  // Thermal
  'csp': { limit: 45, type: 'Carnot', description: 'CSP power block' },
  'geothermal': { limit: 25, type: 'Carnot', description: 'Geothermal power' },
  'nuclear': { limit: 45, type: 'Carnot', description: 'Nuclear steam cycle' },

  // Fuel cells
  'fuel_cell_pem': { limit: 83, type: 'Thermodynamic', description: 'PEM fuel cell (LHV)' },
  'fuel_cell_sofc': { limit: 90, type: 'Thermodynamic', description: 'Solid oxide fuel cell' },

  // Generic
  'generic': { limit: 100, type: 'Second Law', description: 'Generic efficiency limit' },
}

const ENERGY_INTENSITY_LIMITS: Record<string, { min: number; unit: string; description: string }> = {
  'hydrogen_electrolysis': { min: 39.4, unit: 'kWh/kg', description: 'Hydrogen production (HHV)' },
  'hydrogen_electrolysis_nm3': { min: 3.54, unit: 'kWh/Nm3', description: 'Hydrogen production (HHV)' },
  'dac': { min: 178, unit: 'kWh/tonne', description: 'Direct air capture (Gibbs minimum)' },
  'ammonia': { min: 7400, unit: 'kWh/tonne', description: 'Green ammonia synthesis' },
  'steel_dri': { min: 3000, unit: 'kWh/tonne', description: 'Direct reduced iron' },
}

const COST_BENCHMARKS_2024: Record<string, { min: number; max: number; unit: string }> = {
  'solar_utility': { min: 20, max: 60, unit: '$/MWh' },
  'wind_onshore': { min: 25, max: 55, unit: '$/MWh' },
  'wind_offshore': { min: 60, max: 120, unit: '$/MWh' },
  'battery_lithium': { min: 100, max: 200, unit: '$/kWh' },
  'hydrogen_green': { min: 3, max: 8, unit: '$/kg' },
  'electrolyzer_pem': { min: 400, max: 1200, unit: '$/kW' },
  'electrolyzer_alkaline': { min: 300, max: 800, unit: '$/kW' },
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect red flags in assessment input
 */
export async function detectRedFlags(input: AssessmentInput): Promise<RedFlagReport> {
  const startTime = performance.now()
  const flags: RedFlag[] = []

  // Run all checks
  flags.push(...checkThermodynamicViolations(input))
  flags.push(...checkTRLMismatches(input))
  flags.push(...checkBenchmarkOutliers(input))
  flags.push(...checkMissingCriticalData(input))
  flags.push(...checkEconomicImpossibilities(input))

  const executionTimeMs = performance.now() - startTime

  // Generate summary
  const criticalCount = flags.filter(f => f.severity === 'critical').length
  const highCount = flags.filter(f => f.severity === 'high').length
  const mediumCount = flags.filter(f => f.severity === 'medium').length

  let summary = ''
  if (flags.length === 0) {
    summary = 'No red flags detected. All claims appear within physical and economic bounds.'
  } else {
    const parts: string[] = []
    if (criticalCount > 0) parts.push(`${criticalCount} critical`)
    if (highCount > 0) parts.push(`${highCount} high`)
    if (mediumCount > 0) parts.push(`${mediumCount} medium`)
    summary = `Detected ${parts.join(', ')} severity red flag(s). Review required before proceeding.`
  }

  return {
    hasRedFlags: flags.length > 0,
    flags,
    summary,
    executionTimeMs,
  }
}

/**
 * Check for thermodynamic impossibilities
 */
function checkThermodynamicViolations(input: AssessmentInput): RedFlag[] {
  const flags: RedFlag[] = []
  const technology = input.technologyType.toLowerCase()

  for (const claim of input.claims || []) {
    const claimLower = claim.claim.toLowerCase()

    // Extract numeric values from claim
    const efficiencyMatch = claimLower.match(/(\d+(?:\.\d+)?)\s*%?\s*(?:efficiency|conversion|yield)/i)
    const energyMatch = claimLower.match(/(\d+(?:\.\d+)?)\s*(?:kwh|mwh)\/(?:kg|nm3|tonne)/i)

    if (efficiencyMatch) {
      const value = parseFloat(efficiencyMatch[1])
      const limit = getEfficiencyLimit(technology, claimLower)

      if (limit && value > limit.limit) {
        flags.push({
          id: `thermo-eff-${claim.id}`,
          category: 'thermodynamic',
          severity: value > limit.limit * 1.5 ? 'critical' : 'high',
          description: `Efficiency claim (${value}%) exceeds ${limit.type} limit (${limit.limit}%)`,
          explanation: `The claimed efficiency of ${value}% for ${limit.description} exceeds the fundamental ${limit.type} limit of ${limit.limit}%. This is physically impossible.`,
          claimId: claim.id,
          value,
          limit: limit.limit,
          recommendation: 'Clarify the metric definition (e.g., thermal vs electrical efficiency) or reject the claim.',
        })
      } else if (limit && value > limit.limit * 0.95) {
        flags.push({
          id: `thermo-eff-high-${claim.id}`,
          category: 'thermodynamic',
          severity: 'medium',
          description: `Efficiency claim (${value}%) is very close to theoretical limit (${limit.limit}%)`,
          explanation: `Claimed ${value}% efficiency is within 5% of the ${limit.type} limit. This is achievable only under ideal lab conditions.`,
          claimId: claim.id,
          value,
          limit: limit.limit,
          recommendation: 'Request experimental data and test conditions. Verify this is achievable at scale.',
        })
      }
    }

    if (energyMatch) {
      const value = parseFloat(energyMatch[1])
      const limit = getEnergyIntensityLimit(technology, claimLower)

      if (limit && value < limit.min) {
        flags.push({
          id: `thermo-energy-${claim.id}`,
          category: 'thermodynamic',
          severity: 'critical',
          description: `Energy intensity (${value} ${limit.unit}) below thermodynamic minimum (${limit.min} ${limit.unit})`,
          explanation: `The claimed energy consumption of ${value} ${limit.unit} for ${limit.description} is below the theoretical minimum of ${limit.min} ${limit.unit} required by thermodynamics.`,
          claimId: claim.id,
          value,
          limit: limit.min,
          recommendation: 'This claim violates thermodynamics. Reject or request clarification on measurement methodology.',
        })
      }
    }

    // Check for impossible combined claims
    if (claimLower.includes('100%') && claimLower.includes('efficiency') && !technology.includes('electrolyzer')) {
      flags.push({
        id: `thermo-100-${claim.id}`,
        category: 'thermodynamic',
        severity: 'high',
        description: '100% efficiency claim requires scrutiny',
        explanation: 'Claims of 100% efficiency are only valid for specific metrics (e.g., Faradaic efficiency). Most processes have inherent losses.',
        claimId: claim.id,
        recommendation: 'Clarify which efficiency metric is being claimed (electrical, thermal, Faradaic, etc.).',
      })
    }
  }

  return flags
}

/**
 * Check for TRL/funding stage mismatches
 */
function checkTRLMismatches(input: AssessmentInput): RedFlag[] {
  const flags: RedFlag[] = []

  // Extract TRL indicators from claims and description
  const allText = [
    input.description,
    ...input.claims?.map(c => c.claim) || [],
  ].join(' ').toLowerCase()

  // Check for TRL indicators
  const labIndicators = ['lab scale', 'bench scale', 'proof of concept', 'laboratory', 'research stage']
  const pilotIndicators = ['pilot', 'demonstration', 'prototype', 'first-of-a-kind']
  const commercialIndicators = ['commercial', 'production scale', 'deployed', 'operational', 'in operation']

  const hasLabIndicators = labIndicators.some(i => allText.includes(i))
  const hasPilotIndicators = pilotIndicators.some(i => allText.includes(i))
  const hasCommercialIndicators = commercialIndicators.some(i => allText.includes(i))

  // Check for conflicting indicators
  if (hasLabIndicators && hasCommercialIndicators) {
    flags.push({
      id: 'trl-conflict-1',
      category: 'trl_mismatch',
      severity: 'medium',
      description: 'Conflicting TRL indicators: lab-scale AND commercial claims',
      explanation: 'The technology is described as both lab-scale and commercially deployed, which is contradictory.',
      recommendation: 'Clarify the current development stage and deployment status.',
    })
  }

  // Check for premature commercial claims
  const costClaims = input.claims?.filter(c =>
    c.claim.toLowerCase().includes('cost') ||
    c.claim.toLowerCase().includes('$/') ||
    c.claim.toLowerCase().includes('price')
  ) || []

  if (hasLabIndicators && costClaims.length > 0) {
    const hasAggressiveCost = costClaims.some(c => {
      const match = c.claim.match(/\$(\d+(?:\.\d+)?)/);
      return match && parseFloat(match[1]) < 50; // Aggressive cost target
    });

    if (hasAggressiveCost) {
      flags.push({
        id: 'trl-cost-mismatch',
        category: 'trl_mismatch',
        severity: 'high',
        description: 'Aggressive cost claims for lab-scale technology',
        explanation: 'Cost projections for early-stage technologies often underestimate scale-up challenges by 2-5x.',
        recommendation: 'Request detailed cost breakdown with contingencies appropriate for TRL level.',
      })
    }
  }

  // Check for unrealistic timeline claims
  const timelineMatch = allText.match(/(\d+)\s*(?:year|yr)s?\s*(?:to|until|before)\s*(?:commercial|deployment|production)/i)
  if (timelineMatch && hasLabIndicators) {
    const years = parseInt(timelineMatch[1])
    if (years < 3) {
      flags.push({
        id: 'trl-timeline',
        category: 'timeline',
        severity: 'medium',
        description: `Aggressive timeline: ${years} years from lab to commercial for early-stage tech`,
        explanation: 'Lab-to-commercial transitions typically take 5-10+ years for hardware technologies.',
        recommendation: 'Request detailed development roadmap with milestones and risk assessment.',
      })
    }
  }

  return flags
}

/**
 * Check for benchmark outliers
 */
function checkBenchmarkOutliers(input: AssessmentInput): RedFlag[] {
  const flags: RedFlag[] = []
  const technology = input.technologyType.toLowerCase()

  for (const claim of input.claims || []) {
    const claimLower = claim.claim.toLowerCase()

    // Check cost claims against benchmarks
    for (const [key, benchmark] of Object.entries(COST_BENCHMARKS_2024)) {
      if (technology.includes(key.replace('_', ' ')) || technology.includes(key.replace('_', ''))) {
        const costMatch = claimLower.match(/\$?(\d+(?:\.\d+)?)\s*(?:\/|\s*per\s*)(?:mwh|kwh|kg|kw)/i)

        if (costMatch) {
          const value = parseFloat(costMatch[1])

          // Check if significantly below benchmark minimum
          if (value < benchmark.min * 0.5) {
            flags.push({
              id: `benchmark-cost-${claim.id}`,
              category: 'benchmark_outlier',
              severity: 'high',
              description: `Cost claim ($${value}/${benchmark.unit.split('/')[1]}) is 50%+ below industry benchmarks`,
              explanation: `Industry benchmark range is ${benchmark.min}-${benchmark.max} ${benchmark.unit}. A claim of $${value} requires extraordinary evidence.`,
              claimId: claim.id,
              value,
              limit: benchmark.min,
              recommendation: 'Request detailed cost breakdown, supplier quotes, and learning curve assumptions.',
            })
          } else if (value < benchmark.min * 0.8) {
            flags.push({
              id: `benchmark-cost-low-${claim.id}`,
              category: 'benchmark_outlier',
              severity: 'medium',
              description: `Cost claim ($${value}/${benchmark.unit.split('/')[1]}) is 20%+ below industry benchmarks`,
              explanation: `This cost is optimistic relative to industry benchmarks of ${benchmark.min}-${benchmark.max} ${benchmark.unit}.`,
              claimId: claim.id,
              value,
              limit: benchmark.min,
              recommendation: 'Verify cost assumptions and request sensitivity analysis.',
            })
          }
        }
      }
    }

    // Check for "best in class" or "industry leading" without specifics
    if (
      (claimLower.includes('best in class') ||
       claimLower.includes('industry leading') ||
       claimLower.includes('world record') ||
       claimLower.includes('breakthrough')) &&
      !claimLower.match(/\d+/)
    ) {
      flags.push({
        id: `benchmark-vague-${claim.id}`,
        category: 'benchmark_outlier',
        severity: 'medium',
        description: 'Superlative claim without specific metrics',
        explanation: `Claims of "${claimLower.includes('best') ? 'best in class' : 'breakthrough'}" performance should be backed by specific, verifiable metrics.`,
        claimId: claim.id,
        recommendation: 'Request specific performance metrics and third-party validation.',
      })
    }
  }

  return flags
}

/**
 * Check for missing critical data
 */
function checkMissingCriticalData(input: AssessmentInput): RedFlag[] {
  const flags: RedFlag[] = []
  const technology = input.technologyType.toLowerCase()

  // Critical data requirements by technology type
  const criticalDataRequirements: Record<string, string[]> = {
    'solar': ['efficiency', 'degradation', 'temperature coefficient', 'LCOE'],
    'wind': ['capacity factor', 'availability', 'LCOE'],
    'battery': ['cycle life', 'round-trip efficiency', 'energy density', 'degradation'],
    'electrolyzer': ['efficiency', 'lifetime', 'stack cost', 'hydrogen purity'],
    'hydrogen': ['production cost', 'purity', 'storage', 'delivery'],
    'fuel cell': ['efficiency', 'lifetime', 'power density', 'degradation'],
    'dac': ['energy consumption', 'cost per tonne', 'sorbent lifetime'],
    'default': ['efficiency', 'cost', 'lifetime', 'scalability'],
  }

  // Determine which requirements apply
  let requirements = criticalDataRequirements['default']
  for (const [key, reqs] of Object.entries(criticalDataRequirements)) {
    if (key !== 'default' && technology.includes(key)) {
      requirements = reqs
      break
    }
  }

  // Check which requirements are addressed in claims
  const allClaimText = input.claims?.map(c => c.claim.toLowerCase()).join(' ') || ''
  const missingData: string[] = []

  for (const req of requirements) {
    const variations = [req, req.replace(' ', '-'), req.replace(' ', '_')]
    if (!variations.some(v => allClaimText.includes(v))) {
      missingData.push(req)
    }
  }

  if (missingData.length > 0) {
    const severity = missingData.length >= 3 ? 'high' : 'medium'
    flags.push({
      id: 'missing-data',
      category: 'missing_data',
      severity,
      description: `Missing critical data: ${missingData.join(', ')}`,
      explanation: `For ${input.technologyType}, the following metrics are typically critical for evaluation but were not found in claims: ${missingData.join(', ')}.`,
      recommendation: 'Request data for missing critical parameters before proceeding with assessment.',
    })
  }

  // Check for claims without sources
  const unsourcedClaims = input.claims?.filter(c =>
    c.source === 'unknown' || c.source === '' || !c.source
  ) || []

  if (unsourcedClaims.length > 0 && input.claims && unsourcedClaims.length / input.claims.length > 0.5) {
    flags.push({
      id: 'missing-sources',
      category: 'missing_data',
      severity: 'medium',
      description: `${unsourcedClaims.length} of ${input.claims?.length} claims lack source attribution`,
      explanation: 'More than half of the claims cannot be traced to a source document.',
      recommendation: 'Request source documentation for key technical claims.',
    })
  }

  return flags
}

/**
 * Check for economic impossibilities
 */
function checkEconomicImpossibilities(input: AssessmentInput): RedFlag[] {
  const flags: RedFlag[] = []

  for (const claim of input.claims || []) {
    const claimLower = claim.claim.toLowerCase()

    // Check for negative costs or unrealistic economics
    if (claimLower.includes('negative') && claimLower.includes('cost')) {
      if (!claimLower.includes('carbon') && !claimLower.includes('externality')) {
        flags.push({
          id: `econ-negative-${claim.id}`,
          category: 'economic',
          severity: 'high',
          description: 'Negative cost claim requires clarification',
          explanation: 'Negative production costs are unusual outside of carbon credit or externality contexts.',
          claimId: claim.id,
          recommendation: 'Clarify the economic model and revenue sources.',
        })
      }
    }

    // Check for unrealistic learning rates
    const learningMatch = claimLower.match(/(\d+)\s*%?\s*(?:learning rate|cost reduction|decline)/i)
    if (learningMatch) {
      const learningRate = parseFloat(learningMatch[1])
      if (learningRate > 30) {
        flags.push({
          id: `econ-learning-${claim.id}`,
          category: 'economic',
          severity: 'medium',
          description: `Learning rate of ${learningRate}% is above historical norms`,
          explanation: 'Historical technology learning rates typically range from 10-25%. A rate above 30% is exceptional.',
          claimId: claim.id,
          value: learningRate,
          recommendation: 'Request justification for learning rate assumptions with comparable technology examples.',
        })
      }
    }

    // Check for unrealistic payback periods
    const paybackMatch = claimLower.match(/(\d+)\s*(?:month|year)s?\s*payback/i)
    if (paybackMatch) {
      const payback = parseFloat(paybackMatch[1])
      const isMonths = claimLower.includes('month')
      const paybackYears = isMonths ? payback / 12 : payback

      if (paybackYears < 1) {
        flags.push({
          id: `econ-payback-${claim.id}`,
          category: 'economic',
          severity: 'medium',
          description: `Payback period of ${isMonths ? payback + ' months' : payback + ' years'} is unusually short`,
          explanation: 'Sub-1-year payback for capital-intensive clean energy projects is unusual without subsidies.',
          claimId: claim.id,
          recommendation: 'Verify payback calculation includes all capital costs and realistic revenue assumptions.',
        })
      }
    }
  }

  return flags
}

// ============================================================================
// Helper Functions
// ============================================================================

function getEfficiencyLimit(technology: string, claim: string): {
  limit: number
  type: string
  description: string
} | null {
  // Solar
  if (technology.includes('solar') || technology.includes('pv') || technology.includes('photovoltaic')) {
    if (technology.includes('tandem') || claim.includes('tandem') || technology.includes('multi')) {
      return EFFICIENCY_LIMITS['solar_tandem']
    }
    if (technology.includes('perovskite')) {
      if (claim.includes('tandem') || claim.includes('silicon')) {
        return EFFICIENCY_LIMITS['solar_perovskite_tandem']
      }
      return EFFICIENCY_LIMITS['solar_perovskite']
    }
    return EFFICIENCY_LIMITS['solar_single']
  }

  // Wind
  if (technology.includes('wind')) {
    return EFFICIENCY_LIMITS['wind']
  }

  // Electrolysis
  if (technology.includes('electrolyzer') || technology.includes('electrolysis')) {
    if (technology.includes('soec') || technology.includes('solid oxide')) {
      return EFFICIENCY_LIMITS['electrolyzer_soec']
    }
    if (technology.includes('alkaline')) {
      return EFFICIENCY_LIMITS['electrolyzer_alkaline']
    }
    return EFFICIENCY_LIMITS['electrolyzer_pem']
  }

  // Battery
  if (technology.includes('battery') || technology.includes('storage')) {
    if (technology.includes('flow') || technology.includes('vanadium') || technology.includes('redox')) {
      return EFFICIENCY_LIMITS['battery_flow']
    }
    if (technology.includes('solid')) {
      return EFFICIENCY_LIMITS['battery_solid_state']
    }
    return EFFICIENCY_LIMITS['battery_lithium']
  }

  // Thermal
  if (technology.includes('csp') || technology.includes('concentrated solar')) {
    return EFFICIENCY_LIMITS['csp']
  }
  if (technology.includes('geothermal')) {
    return EFFICIENCY_LIMITS['geothermal']
  }
  if (technology.includes('nuclear')) {
    return EFFICIENCY_LIMITS['nuclear']
  }

  // Fuel cells
  if (technology.includes('fuel cell')) {
    if (technology.includes('sofc') || technology.includes('solid oxide')) {
      return EFFICIENCY_LIMITS['fuel_cell_sofc']
    }
    return EFFICIENCY_LIMITS['fuel_cell_pem']
  }

  return EFFICIENCY_LIMITS['generic']
}

function getEnergyIntensityLimit(technology: string, claim: string): {
  min: number
  unit: string
  description: string
} | null {
  if (technology.includes('electrolyzer') || technology.includes('electrolysis') || technology.includes('hydrogen')) {
    if (claim.includes('nm3') || claim.includes('nm³')) {
      return ENERGY_INTENSITY_LIMITS['hydrogen_electrolysis_nm3']
    }
    return ENERGY_INTENSITY_LIMITS['hydrogen_electrolysis']
  }

  if (technology.includes('dac') || technology.includes('direct air')) {
    return ENERGY_INTENSITY_LIMITS['dac']
  }

  if (technology.includes('ammonia')) {
    return ENERGY_INTENSITY_LIMITS['ammonia']
  }

  if (technology.includes('steel') || technology.includes('iron')) {
    return ENERGY_INTENSITY_LIMITS['steel_dri']
  }

  return null
}

// ============================================================================
// Exports
// ============================================================================

export {
  EFFICIENCY_LIMITS,
  ENERGY_INTENSITY_LIMITS,
  COST_BENCHMARKS_2024,
}
