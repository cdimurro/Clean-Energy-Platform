/**
 * Thermodynamic Limits - Tier 1 Physics Validation
 *
 * Implements fundamental physics limits that cannot be exceeded:
 * - Carnot efficiency for heat engines
 * - Betz limit for wind turbines (59.3%)
 * - Shockley-Queisser limit for solar cells
 * - Faraday efficiency for electrolysis (100%)
 * - Thermoneutral voltage for electrolyzers
 *
 * These checks are fast (<50ms), free, and provide high-confidence
 * rejection of physically impossible claims.
 */

import type {
  ValidationRequest,
  PhysicsCheckResult,
  BenchmarkComparison,
} from '../validation-engine'
import type { PreloadedBenchmarks } from '../preload/benchmark-preloader'

// ============================================================================
// Physical Constants
// ============================================================================

export const PHYSICS_CONSTANTS = {
  // Standard conditions
  STANDARD_TEMP_K: 298.15, // 25°C in Kelvin
  STANDARD_PRESSURE_PA: 101325, // 1 atm in Pa

  // Thermodynamics
  BOLTZMANN_K: 1.380649e-23, // J/K
  PLANCK_H: 6.62607015e-34, // J·s
  SPEED_OF_LIGHT: 2.998e8, // m/s

  // Electrochemistry
  FARADAY_CONSTANT: 96485.33, // C/mol
  GAS_CONSTANT: 8.314462, // J/(mol·K)

  // Water electrolysis
  WATER_ENTHALPY_HHV: 285.83e3, // J/mol (Higher Heating Value)
  WATER_ENTHALPY_LHV: 241.82e3, // J/mol (Lower Heating Value)
  REVERSIBLE_VOLTAGE: 1.229, // V at 25°C, 1 atm
  THERMONEUTRAL_VOLTAGE_HHV: 1.481, // V (HHV basis)
  THERMONEUTRAL_VOLTAGE_LHV: 1.253, // V (LHV basis)

  // Hydrogen
  H2_MOLAR_MASS: 2.016e-3, // kg/mol
  H2_ENERGY_HHV: 141.86e6, // J/kg (39.4 kWh/kg)
  H2_ENERGY_LHV: 119.96e6, // J/kg (33.3 kWh/kg)
  H2_VOLUME_STP: 0.0224, // m³/mol at STP
  H2_KWH_PER_NM3_MIN: 3.54, // kWh/Nm³ (thermoneutral, HHV)

  // Wind
  BETZ_LIMIT: 16 / 27, // ~0.593 or 59.3%

  // Solar
  SOLAR_CONSTANT: 1361, // W/m² (AM0)
  AM15_IRRADIANCE: 1000, // W/m² (standard test conditions)
  SHOCKLEY_QUEISSER_LIMIT: 0.337, // 33.7% for single junction

  // Nuclear
  NUCLEAR_ENERGY_U235: 8.2e13, // J/kg (fission)
}

// ============================================================================
// Limit Type Definitions
// ============================================================================

export type LimitType =
  | 'carnot'
  | 'betz'
  | 'shockley-queisser'
  | 'faraday'
  | 'thermoneutral'
  | 'thermodynamic-minimum'
  | 'second-law'
  | 'material-limit'
  | 'economic-bound'

interface PhysicsLimit {
  type: LimitType
  maxValue: number
  unit: string
  description: string
  formula?: string
}

// ============================================================================
// Technology-Specific Limits
// ============================================================================

/**
 * Get physics limits for a technology
 */
export function getPhysicsLimits(technology: string): Map<string, PhysicsLimit> {
  const normalized = technology.toLowerCase()
  const limits = new Map<string, PhysicsLimit>()

  // Electrolyzer limits
  if (
    normalized.includes('electrolyzer') ||
    normalized.includes('electrolysis') ||
    normalized.includes('pem') ||
    normalized.includes('soec')
  ) {
    // Efficiency cannot exceed 100% on HHV basis at thermoneutral
    limits.set('efficiency', {
      type: 'thermoneutral',
      maxValue: 100, // At thermoneutral voltage
      unit: '%',
      description: 'Maximum efficiency at thermoneutral voltage (HHV basis)',
      formula: 'η = V_tn / V_cell × 100% (where V_tn = 1.481V)',
    })

    // Practical efficiency limit accounting for overpotentials
    limits.set('efficiency_practical', {
      type: 'second-law',
      maxValue: 95, // Practical limit with minimal overpotentials
      unit: '%',
      description: 'Practical efficiency limit with minimal overpotentials',
    })

    // Specific consumption cannot be below thermoneutral
    limits.set('specific_consumption', {
      type: 'thermodynamic-minimum',
      maxValue: Infinity, // No upper limit
      unit: 'kWh/Nm³',
      description: `Minimum ${PHYSICS_CONSTANTS.H2_KWH_PER_NM3_MIN} kWh/Nm³ at thermoneutral`,
    })

    // SOEC can go below thermoneutral with heat input
    if (normalized.includes('soec') || normalized.includes('solid oxide')) {
      limits.set('specific_consumption_thermal', {
        type: 'thermodynamic-minimum',
        maxValue: Infinity,
        unit: 'kWh/Nm³',
        description: 'SOEC can achieve <3.54 kWh/Nm³ with thermal input',
      })
    }
  }

  // Wind turbine limits
  if (normalized.includes('wind')) {
    limits.set('efficiency', {
      type: 'betz',
      maxValue: PHYSICS_CONSTANTS.BETZ_LIMIT * 100,
      unit: '%',
      description: 'Betz limit: maximum power extraction from wind',
      formula: 'C_p ≤ 16/27 ≈ 59.3%',
    })

    limits.set('power_coefficient', {
      type: 'betz',
      maxValue: PHYSICS_CONSTANTS.BETZ_LIMIT,
      unit: '',
      description: 'Power coefficient cannot exceed Betz limit',
    })
  }

  // Solar PV limits
  if (
    normalized.includes('solar') ||
    normalized.includes('pv') ||
    normalized.includes('photovoltaic')
  ) {
    limits.set('efficiency', {
      type: 'shockley-queisser',
      maxValue: PHYSICS_CONSTANTS.SHOCKLEY_QUEISSER_LIMIT * 100,
      unit: '%',
      description: 'Shockley-Queisser limit for single junction',
      formula: 'η ≤ 33.7% for single junction at AM1.5',
    })

    // Multi-junction cells can exceed S-Q
    if (normalized.includes('multi') || normalized.includes('tandem')) {
      limits.set('efficiency', {
        type: 'shockley-queisser',
        maxValue: 47, // Practical limit for 2-junction
        unit: '%',
        description: 'Multi-junction practical limit',
      })
    }
  }

  // CSP limits (Carnot)
  if (normalized.includes('csp') || normalized.includes('concentrated solar')) {
    limits.set('efficiency', {
      type: 'carnot',
      maxValue: 45, // Typical hot side 565°C, cold 40°C
      unit: '%',
      description: 'Carnot-limited efficiency for CSP power block',
    })
  }

  // Heat engine limits
  if (
    normalized.includes('turbine') ||
    normalized.includes('engine') ||
    normalized.includes('rankine') ||
    normalized.includes('brayton')
  ) {
    // Will be calculated dynamically based on temperatures
    limits.set('efficiency', {
      type: 'carnot',
      maxValue: 70, // Placeholder - needs temperature data
      unit: '%',
      description: 'Carnot efficiency limit η = 1 - T_cold/T_hot',
    })
  }

  // Battery limits
  if (
    normalized.includes('battery') ||
    normalized.includes('storage') ||
    normalized.includes('cell')
  ) {
    limits.set('efficiency', {
      type: 'second-law',
      maxValue: 100, // Coulombic efficiency
      unit: '%',
      description: 'Round-trip efficiency cannot exceed 100%',
    })

    // Energy density limits by chemistry
    if (normalized.includes('lithium') || normalized.includes('li-ion')) {
      limits.set('energy_density', {
        type: 'material-limit',
        maxValue: 500, // Theoretical for Li-ion cathodes
        unit: 'Wh/kg',
        description: 'Theoretical energy density limit for Li-ion',
      })
    }

    if (normalized.includes('solid-state') || normalized.includes('solid state')) {
      limits.set('energy_density', {
        type: 'material-limit',
        maxValue: 700, // Theoretical for Li-metal anode
        unit: 'Wh/kg',
        description: 'Theoretical energy density for solid-state with Li-metal',
      })
    }
  }

  // DAC limits
  if (
    normalized.includes('dac') ||
    normalized.includes('direct air') ||
    normalized.includes('carbon capture')
  ) {
    limits.set('energy_intensity', {
      type: 'thermodynamic-minimum',
      maxValue: Infinity,
      unit: 'kWh/tonne',
      description: 'Thermodynamic minimum ~178 kWh/tonne (Gibbs)',
    })
  }

  // Nuclear limits
  if (normalized.includes('nuclear') || normalized.includes('reactor')) {
    limits.set('efficiency', {
      type: 'carnot',
      maxValue: 50, // PWR: ~320°C steam, 35°C condenser
      unit: '%',
      description: 'Carnot limit for nuclear steam cycle',
    })
  }

  return limits
}

// ============================================================================
// Carnot Efficiency Calculator
// ============================================================================

/**
 * Calculate Carnot efficiency limit
 * @param T_hot Hot reservoir temperature (K)
 * @param T_cold Cold reservoir temperature (K)
 * @returns Maximum thermodynamic efficiency (0-1)
 */
export function calculateCarnotEfficiency(T_hot: number, T_cold: number): number {
  if (T_hot <= T_cold) {
    throw new Error('Hot temperature must be greater than cold temperature')
  }
  if (T_hot <= 0 || T_cold <= 0) {
    throw new Error('Temperatures must be positive (Kelvin)')
  }
  return 1 - T_cold / T_hot
}

/**
 * Extract temperatures from context and calculate Carnot limit
 */
function extractTemperaturesAndCalculateLimit(
  context: Record<string, unknown> | undefined,
  technology: string
): { limit: number; T_hot?: number; T_cold?: number } {
  // Try to extract from context
  const T_hot =
    (context?.['operatingTemperature'] as number) ||
    (context?.['hotTemperature'] as number) ||
    (context?.['T_hot'] as number)

  const T_cold =
    (context?.['ambientTemperature'] as number) ||
    (context?.['coldTemperature'] as number) ||
    (context?.['T_cold'] as number) ||
    313 // Default 40°C condenser

  if (T_hot) {
    // Convert to Kelvin if appears to be Celsius
    const T_hot_K = T_hot > 200 ? T_hot : T_hot + 273.15
    const T_cold_K = T_cold > 200 ? T_cold : T_cold + 273.15

    return {
      limit: calculateCarnotEfficiency(T_hot_K, T_cold_K) * 100,
      T_hot: T_hot_K,
      T_cold: T_cold_K,
    }
  }

  // Use default limits based on technology
  const normalized = technology.toLowerCase()

  if (normalized.includes('csp')) {
    return { limit: 45 } // 565°C / 40°C typical
  }
  if (normalized.includes('nuclear')) {
    return { limit: 40 } // PWR conditions
  }
  if (normalized.includes('gas')) {
    return { limit: 55 } // Combined cycle
  }
  if (normalized.includes('steam') || normalized.includes('rankine')) {
    return { limit: 45 }
  }

  return { limit: 60 } // Generic heat engine
}

// ============================================================================
// Electrolyzer Efficiency Validation
// ============================================================================

/**
 * Validate electrolyzer efficiency claim
 */
function validateElectrolyzerEfficiency(
  value: number,
  technology: string,
  context?: Record<string, unknown>
): PhysicsCheckResult {
  const normalized = technology.toLowerCase()
  const isSOEC = normalized.includes('soec') || normalized.includes('solid oxide')

  // Get operating conditions
  const operatingVoltage = (context?.['voltage'] as number) || 1.8 // Default 1.8V

  // Calculate theoretical efficiency
  const thermoneutralVoltage = PHYSICS_CONSTANTS.THERMONEUTRAL_VOLTAGE_HHV
  const theoreticalEfficiency = (thermoneutralVoltage / operatingVoltage) * 100

  // SOEC at high temperature can exceed 100% electrical efficiency
  // because thermal energy supplements electrical energy
  const maxEfficiency = isSOEC ? 120 : 100

  if (value > maxEfficiency) {
    return {
      thermodynamicLimit: maxEfficiency,
      limitType: 'thermoneutral',
      claimedValue: value,
      withinLimits: false,
      margin: undefined,
      explanation: `Electrolyzer efficiency cannot exceed ${maxEfficiency}% (${isSOEC ? 'SOEC with thermal input' : 'HHV basis at thermoneutral voltage'})`,
    }
  }

  // Check if claim is realistic given typical voltage
  if (value > 95 && !isSOEC) {
    return {
      thermodynamicLimit: 95,
      limitType: 'second-law',
      claimedValue: value,
      withinLimits: true,
      margin: (value / 95) * 100,
      explanation: `Efficiency of ${value}% is very high. Typical PEM electrolyzers achieve 70-85% at operating voltages of 1.7-2.0V`,
    }
  }

  return {
    thermodynamicLimit: maxEfficiency,
    limitType: 'thermoneutral',
    claimedValue: value,
    withinLimits: true,
    margin: (value / maxEfficiency) * 100,
    explanation: `Efficiency of ${value}% is within thermodynamic limits`,
  }
}

/**
 * Validate specific energy consumption (kWh/Nm³)
 */
function validateSpecificConsumption(
  value: number,
  technology: string,
  context?: Record<string, unknown>
): PhysicsCheckResult {
  const minConsumption = PHYSICS_CONSTANTS.H2_KWH_PER_NM3_MIN // 3.54 kWh/Nm³

  const normalized = technology.toLowerCase()
  const isSOEC = normalized.includes('soec') || normalized.includes('solid oxide')

  // SOEC with thermal integration can go below thermoneutral
  const effectiveMin = isSOEC ? 2.5 : minConsumption

  if (value < effectiveMin) {
    return {
      thermodynamicLimit: effectiveMin,
      limitType: 'thermodynamic-minimum',
      claimedValue: value,
      withinLimits: false,
      explanation: `Specific consumption of ${value} kWh/Nm³ is below thermodynamic minimum of ${effectiveMin} kWh/Nm³${isSOEC ? ' (even with thermal input)' : ''}`,
    }
  }

  // Typical ranges
  if (value > 6.0) {
    return {
      thermodynamicLimit: effectiveMin,
      limitType: 'thermodynamic-minimum',
      claimedValue: value,
      withinLimits: true,
      margin: (effectiveMin / value) * 100,
      explanation: `Specific consumption of ${value} kWh/Nm³ is valid but indicates older/less efficient technology`,
    }
  }

  return {
    thermodynamicLimit: effectiveMin,
    limitType: 'thermodynamic-minimum',
    claimedValue: value,
    withinLimits: true,
    margin: (effectiveMin / value) * 100,
    explanation: `Specific consumption of ${value} kWh/Nm³ is within expected range for modern electrolyzers`,
  }
}

// ============================================================================
// Main Validation Functions
// ============================================================================

/**
 * Check thermodynamic limits for a validation request
 */
export async function checkThermodynamicLimits(
  request: ValidationRequest
): Promise<PhysicsCheckResult> {
  const { claimType, value, technology, context } = request

  // Route to appropriate validator
  switch (claimType) {
    case 'efficiency':
      return validateEfficiencyLimit(value, technology, context, request.claimText)

    case 'energy_intensity':
      return validateEnergyIntensity(value, technology, context)

    case 'capacity':
      return validateCapacity(value, technology, context)

    case 'performance':
      return validatePerformance(value, technology, context, request.claimText)

    default:
      // For claim types without physics limits, pass with uncertainty
      return {
        claimedValue: value,
        withinLimits: true,
        explanation: `No specific thermodynamic limit for ${claimType} claims`,
      }
  }
}

/**
 * Validate efficiency claims against physics limits
 */
function validateEfficiencyLimit(
  value: number,
  technology: string,
  context?: Record<string, unknown>,
  claimText?: string
): PhysicsCheckResult {
  const normalized = technology.toLowerCase()
  const claimLower = claimText?.toLowerCase() || ''

  // Electrolyzer
  if (
    normalized.includes('electrolyzer') ||
    normalized.includes('electrolysis') ||
    normalized.includes('pem') ||
    normalized.includes('soec')
  ) {
    return validateElectrolyzerEfficiency(value, technology, context)
  }

  // Wind turbine - Betz limit
  if (normalized.includes('wind')) {
    const betzLimit = PHYSICS_CONSTANTS.BETZ_LIMIT * 100

    if (value > betzLimit) {
      return {
        thermodynamicLimit: betzLimit,
        limitType: 'Betz',
        claimedValue: value,
        withinLimits: false,
        explanation: `Power coefficient of ${value}% exceeds Betz limit of ${betzLimit.toFixed(1)}% (16/27)`,
      }
    }

    return {
      thermodynamicLimit: betzLimit,
      limitType: 'Betz',
      claimedValue: value,
      withinLimits: true,
      margin: (value / betzLimit) * 100,
      explanation: `Power coefficient of ${value}% is within Betz limit`,
    }
  }

  // Solar PV - Shockley-Queisser
  if (
    normalized.includes('solar') ||
    normalized.includes('pv') ||
    normalized.includes('photovoltaic')
  ) {
    const isMultiJunction =
      normalized.includes('multi') ||
      normalized.includes('tandem') ||
      normalized.includes('perovskite')
    const sqLimit = isMultiJunction ? 47 : PHYSICS_CONSTANTS.SHOCKLEY_QUEISSER_LIMIT * 100

    if (value > sqLimit) {
      return {
        thermodynamicLimit: sqLimit,
        limitType: 'Shockley-Queisser',
        claimedValue: value,
        withinLimits: false,
        explanation: `Solar cell efficiency of ${value}% exceeds ${isMultiJunction ? 'multi-junction practical' : 'Shockley-Queisser'} limit of ${sqLimit.toFixed(1)}%`,
      }
    }

    return {
      thermodynamicLimit: sqLimit,
      limitType: 'Shockley-Queisser',
      claimedValue: value,
      withinLimits: true,
      margin: (value / sqLimit) * 100,
      explanation: `Solar cell efficiency of ${value}% is within ${isMultiJunction ? 'multi-junction' : 'single junction'} limits`,
    }
  }

  // Heat engines - Carnot limit (but not for thermal/receiver efficiency)
  const isHeatEngine = normalized.includes('turbine') ||
    normalized.includes('engine') ||
    normalized.includes('rankine') ||
    normalized.includes('brayton') ||
    normalized.includes('csp') ||
    normalized.includes('nuclear') ||
    normalized.includes('geothermal')

  // Skip Carnot check for thermal/receiver efficiency claims
  // Check both technology name and claim text
  const isReceiverOrThermal = normalized.includes('receiver') ||
    normalized.includes('thermal') ||
    normalized.includes('collector') ||
    claimLower.includes('receiver') ||
    claimLower.includes('thermal receiver') ||
    claimLower.includes('collector')

  if (isHeatEngine && !isReceiverOrThermal) {
    const { limit, T_hot, T_cold } = extractTemperaturesAndCalculateLimit(
      context,
      technology
    )

    if (value > limit) {
      return {
        thermodynamicLimit: limit,
        limitType: 'Carnot',
        claimedValue: value,
        withinLimits: false,
        explanation: `Thermal efficiency of ${value}% exceeds Carnot limit of ${limit.toFixed(1)}%${T_hot ? ` (T_hot=${T_hot.toFixed(0)}K, T_cold=${T_cold?.toFixed(0)}K)` : ''}`,
      }
    }

    return {
      thermodynamicLimit: limit,
      limitType: 'Carnot',
      claimedValue: value,
      withinLimits: true,
      margin: (value / limit) * 100,
      explanation: `Thermal efficiency of ${value}% is within Carnot limit`,
    }
  }

  // Battery - round-trip efficiency
  if (
    normalized.includes('battery') ||
    normalized.includes('storage') ||
    normalized.includes('flow')
  ) {
    if (value > 100) {
      return {
        thermodynamicLimit: 100,
        limitType: 'second-law',
        claimedValue: value,
        withinLimits: false,
        explanation: `Round-trip efficiency cannot exceed 100%`,
      }
    }

    // Practical limits by technology - stricter for flow batteries
    let practicalLimit = 98 // Li-ion best case
    if (normalized.includes('flow') || normalized.includes('vanadium')) {
      practicalLimit = 85 // Flow batteries have significant pumping losses
      if (value > 95) {
        // 95%+ is impossible due to pumping parasitic
        return {
          thermodynamicLimit: practicalLimit,
          limitType: 'second-law',
          claimedValue: value,
          withinLimits: false,
          explanation: `Flow battery efficiency of ${value}% is impossible - pumping losses alone exceed ${100 - value}%`,
        }
      }
    } else if (normalized.includes('lead')) {
      practicalLimit = 90
    }

    return {
      thermodynamicLimit: 100,
      limitType: 'second-law',
      claimedValue: value,
      withinLimits: true,
      margin: (value / practicalLimit) * 100,
      explanation: `Round-trip efficiency of ${value}% is ${value > practicalLimit ? 'optimistic but theoretically possible' : 'within typical range'}`,
    }
  }

  // Generic efficiency limit
  if (value > 100) {
    return {
      thermodynamicLimit: 100,
      limitType: 'second-law',
      claimedValue: value,
      withinLimits: false,
      explanation: `Efficiency cannot exceed 100%`,
    }
  }

  return {
    claimedValue: value,
    withinLimits: true,
    explanation: `Efficiency of ${value}% appears reasonable (no specific physics model)`,
  }
}

/**
 * Validate energy intensity claims
 */
function validateEnergyIntensity(
  value: number,
  technology: string,
  context?: Record<string, unknown>
): PhysicsCheckResult {
  const normalized = technology.toLowerCase()

  // Electrolysis specific consumption
  if (
    normalized.includes('electrolyzer') ||
    normalized.includes('electrolysis') ||
    normalized.includes('hydrogen')
  ) {
    return validateSpecificConsumption(value, technology, context)
  }

  // DAC energy intensity
  if (normalized.includes('dac') || normalized.includes('direct air')) {
    const thermodynamicMin = 178 // kWh/tonne (Gibbs free energy)
    const practicalMin = 300 // Entropy-limited

    if (value < thermodynamicMin) {
      return {
        thermodynamicLimit: thermodynamicMin,
        limitType: 'thermodynamic-minimum',
        claimedValue: value,
        withinLimits: false,
        explanation: `Energy intensity of ${value} kWh/tonne is below thermodynamic minimum of ${thermodynamicMin} kWh/tonne (Gibbs free energy)`,
      }
    }

    if (value < practicalMin) {
      return {
        thermodynamicLimit: thermodynamicMin,
        limitType: 'thermodynamic-minimum',
        claimedValue: value,
        withinLimits: true,
        margin: (thermodynamicMin / value) * 100,
        explanation: `Energy intensity of ${value} kWh/tonne is below practical minimum of ${practicalMin} kWh/tonne (may require breakthrough advances)`,
      }
    }

    return {
      thermodynamicLimit: thermodynamicMin,
      limitType: 'thermodynamic-minimum',
      claimedValue: value,
      withinLimits: true,
      margin: (thermodynamicMin / value) * 100,
      explanation: `Energy intensity of ${value} kWh/tonne is within expected range for current DAC technology`,
    }
  }

  // Ammonia synthesis
  if (normalized.includes('ammonia')) {
    const thermodynamicMin = 7.4 // MWh/tonne NH3 (theoretical)
    const practicalMin = 8.5 // MWh/tonne (best Haber-Bosch)

    const valueMWh = value > 100 ? value / 1000 : value // Convert if kWh

    if (valueMWh < thermodynamicMin) {
      return {
        thermodynamicLimit: thermodynamicMin,
        limitType: 'thermodynamic-minimum',
        claimedValue: valueMWh,
        withinLimits: false,
        explanation: `Energy intensity below theoretical minimum of ${thermodynamicMin} MWh/tonne NH3`,
      }
    }

    return {
      thermodynamicLimit: thermodynamicMin,
      limitType: 'thermodynamic-minimum',
      claimedValue: valueMWh,
      withinLimits: true,
      margin: (thermodynamicMin / valueMWh) * 100,
      explanation: `Energy intensity of ${valueMWh.toFixed(1)} MWh/tonne is ${valueMWh < 10 ? 'excellent' : 'typical'} for green ammonia`,
    }
  }

  return {
    claimedValue: value,
    withinLimits: true,
    explanation: `No specific energy intensity limit for ${technology}`,
  }
}

/**
 * Validate capacity claims
 */
function validateCapacity(
  value: number,
  technology: string,
  context?: Record<string, unknown>
): PhysicsCheckResult {
  const normalized = technology.toLowerCase()

  // Battery energy density
  if (normalized.includes('battery')) {
    let maxDensity = 500 // Wh/kg for conventional Li-ion

    if (normalized.includes('solid-state') || normalized.includes('solid state')) {
      maxDensity = 700 // Theoretical with Li-metal anode
    } else if (normalized.includes('sodium') || normalized.includes('na-ion')) {
      maxDensity = 200 // Sodium-ion is lower
    }

    // Assume value might be energy density
    if (value > maxDensity && value < 2000) {
      return {
        thermodynamicLimit: maxDensity,
        limitType: 'material-limit',
        claimedValue: value,
        withinLimits: false,
        explanation: `Energy density of ${value} Wh/kg exceeds theoretical maximum of ${maxDensity} Wh/kg for ${technology}`,
      }
    }
  }

  return {
    claimedValue: value,
    withinLimits: true,
    explanation: `Capacity claim appears reasonable`,
  }
}

/**
 * Validate performance claims
 */
function validatePerformance(
  value: number,
  technology: string,
  context?: Record<string, unknown>,
  claimText?: string
): PhysicsCheckResult {
  // Most performance claims route through efficiency validation
  return validateEfficiencyLimit(value, technology, context, claimText)
}

// ============================================================================
// Benchmark Validation
// ============================================================================

/**
 * Check claim against industry benchmarks
 */
export async function checkBenchmarks(
  request: ValidationRequest,
  benchmarkCache: PreloadedBenchmarks
): Promise<BenchmarkComparison | null> {
  const { claimType, value, technology, domain } = request

  // Get benchmark data
  const benchmark = benchmarkCache.getBenchmark(domain, technology, claimType)

  if (!benchmark) {
    return null
  }

  const isOutlier = value < benchmark.min || value > benchmark.max

  // Calculate percentile if within range
  let percentile: number | undefined
  if (!isOutlier && benchmark.max > benchmark.min) {
    percentile = ((value - benchmark.min) / (benchmark.max - benchmark.min)) * 100
  }

  return {
    source: benchmark.source,
    range: {
      min: benchmark.min,
      max: benchmark.max,
      unit: benchmark.unit,
    },
    percentile,
    isOutlier,
    dataYear: benchmark.year,
  }
}
