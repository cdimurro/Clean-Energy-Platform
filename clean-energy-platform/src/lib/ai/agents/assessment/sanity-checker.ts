/**
 * Sanity Checker
 *
 * Domain-specific validation for extracted metric values.
 * Ensures values fall within reasonable ranges based on
 * physics, industry data, and common sense.
 *
 * Actions:
 * - 'pass': Value is within expected range
 * - 'warn': Value is outside expected but may be valid
 * - 'reject': Value is clearly wrong (e.g., 1 cycle for battery)
 */

import { getTRLBenchmark, TRLBenchmark } from './domain-benchmarks'

// ============================================================================
// Types
// ============================================================================

export interface SanityRange {
  min: number
  max: number
  unit: string
  failAction: 'warn' | 'reject'
  description?: string
}

export interface SanityCheckResult {
  metricId: string
  value: number
  valid: boolean
  expectedRange: SanityRange | null
  action: 'pass' | 'warn' | 'reject'
  message: string
  suggestedValue?: number
}

// ============================================================================
// Sanity Ranges by Domain
// ============================================================================

/**
 * Domain-agnostic sanity ranges
 */
export const COMMON_SANITY_RANGES: Record<string, SanityRange> = {
  // Technology Readiness Level
  trl: {
    min: 1,
    max: 9,
    unit: '',
    failAction: 'reject',
    description: 'TRL must be integer 1-9',
  },

  // Financial metrics
  irr: {
    min: -50,
    max: 100,
    unit: '%',
    failAction: 'warn',
    description: 'IRR typically -50% to 100%',
  },

  payback: {
    min: 0.5,
    max: 30,
    unit: 'years',
    failAction: 'warn',
    description: 'Payback typically 0.5-30 years',
  },
}

/**
 * Hydrogen domain sanity ranges
 */
export const HYDROGEN_SANITY_RANGES: Record<string, SanityRange> = {
  lcoh: {
    min: 1,
    max: 50,
    unit: '$/kg',
    failAction: 'warn',
    description: 'LCOH typically $1-50/kg (current tech)',
  },

  efficiency: {
    min: 50,
    max: 95,
    unit: '%',
    failAction: 'warn',
    description: 'Electrolyzer efficiency 50-95% (HHV)',
  },

  specificConsumption: {
    min: 3.5,
    max: 8,
    unit: 'kWh/Nm3',
    failAction: 'warn',
    description: 'Specific consumption 3.5-8 kWh/Nm3',
  },

  lifetime: {
    min: 20000,
    max: 150000,
    unit: 'hours',
    failAction: 'warn',
    description: 'Stack lifetime 20k-150k hours',
  },

  capex: {
    min: 200,
    max: 3000,
    unit: '$/kW',
    failAction: 'warn',
    description: 'CAPEX typically $200-3000/kW',
  },
}

/**
 * Energy storage domain sanity ranges
 */
export const STORAGE_SANITY_RANGES: Record<string, SanityRange> = {
  lcos: {
    min: 0.02,
    max: 0.50,
    unit: '$/kWh',
    failAction: 'warn',
    description: 'LCOS typically $0.02-0.50/kWh',
  },

  efficiency: {
    min: 70,
    max: 98,
    unit: '%',
    failAction: 'warn',
    description: 'Round-trip efficiency 70-98%',
  },

  cycleLife: {
    min: 100,
    max: 50000,
    unit: 'cycles',
    failAction: 'reject',
    description: 'Cycle life must be at least 100 cycles',
  },

  energyDensity: {
    min: 50,
    max: 1000,
    unit: 'Wh/kg',
    failAction: 'reject',
    description: 'Energy density 50-1000 Wh/kg',
  },

  capex: {
    min: 50,
    max: 1000,
    unit: '$/kWh',
    failAction: 'warn',
    description: 'Battery CAPEX $50-1000/kWh',
  },
}

/**
 * Industrial/DAC domain sanity ranges
 */
export const INDUSTRIAL_SANITY_RANGES: Record<string, SanityRange> = {
  lcoc: {
    min: 50,
    max: 2000,
    unit: '$/tonne',
    failAction: 'warn',
    description: 'Carbon capture cost $50-2000/tonne',
  },

  captureEfficiency: {
    min: 50,
    max: 99,
    unit: '%',
    failAction: 'warn',
    description: 'Capture efficiency 50-99%',
  },

  energyIntensity: {
    min: 500,
    max: 5000,
    unit: 'kWh/tonne',
    failAction: 'warn',
    description: 'Energy use 500-5000 kWh/tonne CO2',
  },

  lifetime: {
    min: 15,
    max: 40,
    unit: 'years',
    failAction: 'warn',
    description: 'Plant lifetime 15-40 years',
  },
}

/**
 * Clean energy domain sanity ranges
 */
export const CLEAN_ENERGY_SANITY_RANGES: Record<string, SanityRange> = {
  lcoe: {
    min: 10,
    max: 200,
    unit: '$/MWh',
    failAction: 'warn',
    description: 'LCOE typically $10-200/MWh',
  },

  efficiency: {
    min: 10,
    max: 50,
    unit: '%',
    failAction: 'warn',
    description: 'Solar efficiency 10-50%',
  },

  capacityFactor: {
    min: 10,
    max: 60,
    unit: '%',
    failAction: 'warn',
    description: 'Solar/wind capacity factor 10-60%',
  },

  lifetime: {
    min: 20,
    max: 40,
    unit: 'years',
    failAction: 'warn',
    description: 'Plant lifetime 20-40 years',
  },
}

/**
 * Waste-to-fuel (HTL) domain sanity ranges
 */
export const WASTE_TO_FUEL_SANITY_RANGES: Record<string, SanityRange> = {
  lcof: {
    min: 2,
    max: 20,
    unit: '$/liter',
    failAction: 'warn',
    description: 'LCOF typically $2-20/liter biocrude',
  },

  biocrudeYield: {
    min: 15,
    max: 60,
    unit: 'wt%',
    failAction: 'reject',
    description: 'Biocrude yield must be 15-60 wt% (physical limit)',
  },

  biocharYield: {
    min: 5,
    max: 35,
    unit: 'wt%',
    failAction: 'warn',
    description: 'Biochar yield typically 5-35 wt%',
  },

  energyRecovery: {
    min: 40,
    max: 85,
    unit: '%',
    failAction: 'reject',
    description: 'Energy recovery must be 40-85% (thermodynamic limit)',
  },

  efficiency: {
    min: 40,
    max: 85,
    unit: '%',
    failAction: 'reject',
    description: 'HTL efficiency cannot exceed 85% (second law limit)',
  },

  massConversion: {
    min: 50,
    max: 95,
    unit: '%',
    failAction: 'reject',
    description: 'Mass conversion typically 50-95%',
  },

  carbonConversion: {
    min: 50,
    max: 90,
    unit: '%',
    failAction: 'warn',
    description: 'Carbon conversion typically 50-90%',
  },

  reactorTemp: {
    min: 250,
    max: 400,
    unit: '°C',
    failAction: 'reject',
    description: 'HTL reactor temperature must be 250-400°C',
  },

  reactorPressure: {
    min: 10,
    max: 35,
    unit: 'MPa',
    failAction: 'reject',
    description: 'HTL pressure must be 10-35 MPa',
  },

  capex: {
    min: 1000,
    max: 12000,
    unit: '$/tonne-yr',
    failAction: 'warn',
    description: 'HTL CAPEX typically $1000-12000/tonne-yr capacity',
  },

  lifetime: {
    min: 10,
    max: 30,
    unit: 'years',
    failAction: 'warn',
    description: 'Plant lifetime typically 10-30 years',
  },

  biocrudeHHV: {
    min: 28,
    max: 42,
    unit: 'MJ/kg',
    failAction: 'warn',
    description: 'Biocrude HHV typically 28-42 MJ/kg',
  },
}

// ============================================================================
// Domain Mapping
// ============================================================================

const DOMAIN_RANGES: Record<string, Record<string, SanityRange>> = {
  hydrogen: HYDROGEN_SANITY_RANGES,
  'energy-storage': STORAGE_SANITY_RANGES,
  industrial: INDUSTRIAL_SANITY_RANGES,
  'clean-energy': CLEAN_ENERGY_SANITY_RANGES,
  'waste-to-fuel': WASTE_TO_FUEL_SANITY_RANGES,
  general: {},
}

// Alias mapping
const DOMAIN_ALIASES: Record<string, string> = {
  electrolyzer: 'hydrogen',
  electrolysis: 'hydrogen',
  pem: 'hydrogen',
  battery: 'energy-storage',
  batteries: 'energy-storage',
  storage: 'energy-storage',
  dac: 'industrial',
  ccs: 'industrial',
  carbon: 'industrial',
  solar: 'clean-energy',
  wind: 'clean-energy',
  pv: 'clean-energy',
  htl: 'waste-to-fuel',
  hydrothermal: 'waste-to-fuel',
  pyrolysis: 'waste-to-fuel',
  gasification: 'waste-to-fuel',
  biocrude: 'waste-to-fuel',
  biofuel: 'waste-to-fuel',
  waste: 'waste-to-fuel',
  msw: 'waste-to-fuel',
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Get sanity range for a metric in a domain
 */
export function getSanityRange(
  metricId: string,
  domain: string
): SanityRange | null {
  // Normalize metric ID
  const normalizedMetric = metricId.toLowerCase().replace(/[^a-z]/g, '')

  // Normalize domain
  let normalizedDomain = domain.toLowerCase().replace(/[^a-z-]/g, '')
  if (DOMAIN_ALIASES[normalizedDomain]) {
    normalizedDomain = DOMAIN_ALIASES[normalizedDomain]
  }

  // Check domain-specific ranges first
  const domainRanges = DOMAIN_RANGES[normalizedDomain] || {}
  for (const [key, range] of Object.entries(domainRanges)) {
    if (normalizedMetric.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedMetric)) {
      return range
    }
  }

  // Check common ranges
  for (const [key, range] of Object.entries(COMMON_SANITY_RANGES)) {
    if (normalizedMetric.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedMetric)) {
      return range
    }
  }

  return null
}

/**
 * Validate a metric value against sanity checks
 */
export function validateMetric(
  metricId: string,
  value: number,
  domain: string
): SanityCheckResult {
  const range = getSanityRange(metricId, domain)

  // No range defined - pass by default
  if (!range) {
    return {
      metricId,
      value,
      valid: true,
      expectedRange: null,
      action: 'pass',
      message: 'No sanity range defined for this metric',
    }
  }

  // Check if value is within range
  if (value >= range.min && value <= range.max) {
    return {
      metricId,
      value,
      valid: true,
      expectedRange: range,
      action: 'pass',
      message: `Value ${value} is within expected range [${range.min}, ${range.max}] ${range.unit}`,
    }
  }

  // Value is outside range
  const median = (range.min + range.max) / 2

  return {
    metricId,
    value,
    valid: false,
    expectedRange: range,
    action: range.failAction,
    message: `Value ${value} is outside expected range [${range.min}, ${range.max}] ${range.unit}. ${range.description || ''}`,
    suggestedValue: median,
  }
}

/**
 * Validate multiple metrics at once
 */
export function validateMetrics(
  metrics: Record<string, number>,
  domain: string
): Record<string, SanityCheckResult> {
  const results: Record<string, SanityCheckResult> = {}

  for (const [metricId, value] of Object.entries(metrics)) {
    results[metricId] = validateMetric(metricId, value, domain)
  }

  return results
}

/**
 * Get all sanity ranges for a domain
 */
export function getRangesForDomain(domain: string): Record<string, SanityRange> {
  let normalizedDomain = domain.toLowerCase().replace(/[^a-z-]/g, '')
  if (DOMAIN_ALIASES[normalizedDomain]) {
    normalizedDomain = DOMAIN_ALIASES[normalizedDomain]
  }

  return {
    ...COMMON_SANITY_RANGES,
    ...(DOMAIN_RANGES[normalizedDomain] || {}),
  }
}

/**
 * Check if a value is obviously wrong (for early rejection)
 */
export function isObviouslyWrong(
  metricId: string,
  value: number,
  domain: string
): boolean {
  const result = validateMetric(metricId, value, domain)
  return result.action === 'reject'
}

/**
 * Suggest a corrected value based on benchmarks
 */
export function suggestCorrectedValue(
  metricId: string,
  value: number,
  domain: string
): number | null {
  const result = validateMetric(metricId, value, domain)

  if (result.valid) {
    return null // No correction needed
  }

  if (result.expectedRange) {
    // Return median of range
    return (result.expectedRange.min + result.expectedRange.max) / 2
  }

  return null
}

// ============================================================================
// TRL Validation with Domain Benchmarks
// ============================================================================

export interface TRLValidationResult {
  trl: number
  valid: boolean
  benchmark: TRLBenchmark | null
  action: 'pass' | 'warn' | 'correct'
  message: string
  suggestedTRL?: number
}

/**
 * Validate TRL against domain-specific benchmarks.
 * More accurate than generic 1-9 validation.
 *
 * @param trl - The TRL value to validate
 * @param domain - Domain ID (e.g., 'hydrogen', 'energy-storage', 'industrial')
 * @param technologyType - Optional specific technology type (e.g., 'soec', 'sodium-ion')
 * @returns Validation result with suggested correction if needed
 */
export function validateTRL(
  trl: number,
  domain: string,
  technologyType?: string
): TRLValidationResult {
  // Basic validation
  if (!Number.isInteger(trl) || trl < 1 || trl > 9) {
    return {
      trl,
      valid: false,
      benchmark: null,
      action: 'correct',
      message: `TRL ${trl} is invalid (must be integer 1-9)`,
      suggestedTRL: Math.round(Math.min(9, Math.max(1, trl))),
    }
  }

  // Get domain-specific benchmark
  const benchmark = getTRLBenchmark(domain, technologyType)

  if (!benchmark) {
    // No benchmark available - use basic validation
    return {
      trl,
      valid: true,
      benchmark: null,
      action: 'pass',
      message: `TRL ${trl} accepted (no domain benchmark available)`,
    }
  }

  // Check against benchmark
  if (trl >= benchmark.min && trl <= benchmark.max) {
    return {
      trl,
      valid: true,
      benchmark,
      action: 'pass',
      message: `TRL ${trl} is within expected range [${benchmark.min}-${benchmark.max}] for ${domain}/${technologyType || 'generic'}: ${benchmark.description}`,
    }
  }

  // TRL is outside benchmark range
  if (trl > benchmark.max + 1) {
    // TRL is significantly over-estimated - correct to typical
    return {
      trl,
      valid: false,
      benchmark,
      action: 'correct',
      message: `TRL ${trl} is over-estimated for ${domain}/${technologyType || 'generic'}. Expected range: [${benchmark.min}-${benchmark.max}]. ${benchmark.description}`,
      suggestedTRL: benchmark.typical,
    }
  }

  if (trl < benchmark.min - 1) {
    // TRL is significantly under-estimated - correct to typical
    return {
      trl,
      valid: false,
      benchmark,
      action: 'correct',
      message: `TRL ${trl} is under-estimated for ${domain}/${technologyType || 'generic'}. Expected range: [${benchmark.min}-${benchmark.max}]. ${benchmark.description}`,
      suggestedTRL: benchmark.typical,
    }
  }

  // TRL is slightly outside range - warn but allow
  return {
    trl,
    valid: true,
    benchmark,
    action: 'warn',
    message: `TRL ${trl} is slightly outside expected range [${benchmark.min}-${benchmark.max}] for ${domain}/${technologyType || 'generic'}`,
  }
}

/**
 * Correct TRL if it's outside domain benchmarks.
 * Returns original TRL if valid, otherwise returns suggested TRL.
 */
export function correctTRLIfNeeded(
  trl: number,
  domain: string,
  technologyType?: string
): number {
  const result = validateTRL(trl, domain, technologyType)

  if (result.action === 'correct' && result.suggestedTRL !== undefined) {
    console.warn(`[Sanity] ${result.message}. Correcting TRL ${trl} to ${result.suggestedTRL}`)
    return result.suggestedTRL
  }

  if (result.action === 'warn') {
    console.warn(`[Sanity] ${result.message}`)
  }

  return trl
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format sanity check results for logging
 */
export function formatSanityCheckResults(
  results: Record<string, SanityCheckResult>
): string {
  const lines: string[] = ['Sanity Check Results:']

  for (const [metricId, result] of Object.entries(results)) {
    const status = result.valid ? 'PASS' : result.action.toUpperCase()
    lines.push(`  ${metricId}: ${result.value} - ${status}`)
    if (!result.valid) {
      lines.push(`    ${result.message}`)
    }
  }

  return lines.join('\n')
}

/**
 * Get summary statistics for sanity check results
 */
export function getSanityCheckSummary(
  results: Record<string, SanityCheckResult>
): {
  passed: number
  warned: number
  rejected: number
  total: number
} {
  let passed = 0
  let warned = 0
  let rejected = 0

  for (const result of Object.values(results)) {
    if (result.action === 'pass') passed++
    else if (result.action === 'warn') warned++
    else if (result.action === 'reject') rejected++
  }

  return {
    passed,
    warned,
    rejected,
    total: Object.keys(results).length,
  }
}
