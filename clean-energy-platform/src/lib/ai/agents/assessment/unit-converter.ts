/**
 * Unit Converter
 *
 * Provides conversions between common units used in energy technology assessments.
 * Handles conversions for:
 * - Energy costs (LCOE, LCOH, LCOS, LCOC)
 * - Efficiency metrics
 * - Physical quantities (pressure, temperature, etc.)
 * - Financial metrics
 */

// ============================================================================
// Types
// ============================================================================

export interface ConversionRule {
  from: string
  to: string
  factor?: number
  formula?: (value: number, params?: Record<string, number>) => number
  reversible: boolean
}

// ============================================================================
// Conversion Constants
// ============================================================================

/**
 * Physical constants for calculations
 */
export const CONSTANTS = {
  // Hydrogen
  H2_LHV: 120.0, // MJ/kg (Lower Heating Value)
  H2_HHV: 141.8, // MJ/kg (Higher Heating Value)
  H2_DENSITY_STP: 0.08988, // kg/Nm³ at STP
  H2_ENERGY_CONTENT_LHV: 33.33, // kWh/kg LHV
  H2_ENERGY_CONTENT_HHV: 39.39, // kWh/kg HHV

  // Energy
  KWH_TO_MJ: 3.6,
  MWH_TO_KWH: 1000,
  GJ_TO_MWH: 277.78,

  // CO2
  CO2_DENSITY_STP: 1.977, // kg/Nm³ at STP

  // Pressure
  BAR_TO_PSI: 14.5038,
  ATM_TO_BAR: 1.01325,

  // Temperature
  KELVIN_OFFSET: 273.15,
}

// ============================================================================
// Conversion Rules
// ============================================================================

/**
 * All supported conversion rules
 */
export const CONVERSION_RULES: ConversionRule[] = [
  // -------------------------------------------------------------------------
  // Hydrogen Cost Conversions
  // -------------------------------------------------------------------------

  // LCOE ($/MWh) to LCOH ($/kg H2) - requires efficiency
  {
    from: '$/MWh',
    to: '$/kg',
    formula: (lcoe, params) => {
      // LCOH = LCOE * kWh per kg / 1000
      // Assuming electrolyzer efficiency, typical 50-60 kWh/kg
      const kwhPerKg = params?.kwhPerKg || 50 // Default 50 kWh/kg
      return (lcoe * kwhPerKg) / 1000
    },
    reversible: true,
  },

  // kWh/Nm³ to kWh/kg (hydrogen)
  {
    from: 'kWh/Nm3',
    to: 'kWh/kg',
    formula: (kwhPerNm3) => kwhPerNm3 / CONSTANTS.H2_DENSITY_STP,
    reversible: true,
  },

  // kWh/Nm³ to efficiency % (LHV basis)
  {
    from: 'kWh/Nm3',
    to: '%',
    formula: (kwhPerNm3) => {
      // Theoretical minimum: 3.00 kWh/Nm³ (HHV), 2.54 kWh/Nm³ (LHV)
      // Efficiency = Theoretical / Actual * 100
      const theoreticalLHV = 2.54 // kWh/Nm³
      return (theoreticalLHV / kwhPerNm3) * 100
    },
    reversible: true,
  },

  // kWh/kg to efficiency % (LHV basis)
  {
    from: 'kWh/kg',
    to: '%',
    formula: (kwhPerKg) => {
      // H2 LHV = 33.33 kWh/kg, so efficiency = 33.33 / actual
      return (CONSTANTS.H2_ENERGY_CONTENT_LHV / kwhPerKg) * 100
    },
    reversible: true,
  },

  // -------------------------------------------------------------------------
  // Energy Unit Conversions
  // -------------------------------------------------------------------------

  { from: 'MWh', to: 'kWh', factor: 1000, reversible: true },
  { from: 'GWh', to: 'MWh', factor: 1000, reversible: true },
  { from: 'GJ', to: 'MWh', factor: 1 / 3.6, reversible: true },
  { from: 'MJ', to: 'kWh', factor: 1 / 3.6, reversible: true },
  { from: 'kWh', to: 'MJ', factor: 3.6, reversible: true },

  // -------------------------------------------------------------------------
  // Cost Unit Conversions
  // -------------------------------------------------------------------------

  { from: '$/MWh', to: '$/kWh', factor: 0.001, reversible: true },
  { from: '$/GJ', to: '$/MWh', factor: 3.6, reversible: true },
  { from: 'EUR/MWh', to: '$/MWh', factor: 1.08, reversible: true }, // Approximate
  { from: '$/kW', to: '$/MW', factor: 1000, reversible: true },

  // -------------------------------------------------------------------------
  // Pressure Conversions
  // -------------------------------------------------------------------------

  { from: 'bar', to: 'psi', factor: CONSTANTS.BAR_TO_PSI, reversible: true },
  { from: 'atm', to: 'bar', factor: CONSTANTS.ATM_TO_BAR, reversible: true },
  { from: 'MPa', to: 'bar', factor: 10, reversible: true },

  // -------------------------------------------------------------------------
  // Temperature Conversions
  // -------------------------------------------------------------------------

  {
    from: 'C',
    to: 'K',
    formula: (celsius) => celsius + CONSTANTS.KELVIN_OFFSET,
    reversible: true,
  },
  {
    from: 'F',
    to: 'C',
    formula: (fahrenheit) => (fahrenheit - 32) * (5 / 9),
    reversible: true,
  },

  // -------------------------------------------------------------------------
  // Time Conversions
  // -------------------------------------------------------------------------

  { from: 'hours', to: 'years', factor: 1 / 8760, reversible: true },
  { from: 'days', to: 'hours', factor: 24, reversible: true },
  { from: 'years', to: 'hours', factor: 8760, reversible: true },

  // -------------------------------------------------------------------------
  // Mass/Volume Conversions
  // -------------------------------------------------------------------------

  { from: 'kg', to: 'tonne', factor: 0.001, reversible: true },
  { from: 'Nm3', to: 'kg', factor: CONSTANTS.H2_DENSITY_STP, reversible: true }, // For H2

  // -------------------------------------------------------------------------
  // Financial Conversions
  // -------------------------------------------------------------------------

  { from: 'M$', to: '$', factor: 1e6, reversible: true },
  { from: 'B$', to: '$', factor: 1e9, reversible: true },
  { from: '%', to: 'decimal', factor: 0.01, reversible: true },
]

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Find a conversion rule between two units
 */
function findConversionRule(from: string, to: string): ConversionRule | null {
  // Direct match
  const direct = CONVERSION_RULES.find(
    (r) => r.from.toLowerCase() === from.toLowerCase() && r.to.toLowerCase() === to.toLowerCase()
  )
  if (direct) return direct

  // Reverse match
  const reverse = CONVERSION_RULES.find(
    (r) =>
      r.reversible &&
      r.from.toLowerCase() === to.toLowerCase() &&
      r.to.toLowerCase() === from.toLowerCase()
  )
  if (reverse) {
    // Create reversed rule
    return {
      from: reverse.to,
      to: reverse.from,
      factor: reverse.factor ? 1 / reverse.factor : undefined,
      formula: reverse.formula
        ? (value, params) => {
            // For reversible formulas, we need to solve for the input
            // This is a simplification - complex formulas may need explicit reverse
            if (reverse.factor) {
              return value / reverse.factor
            }
            // For formula-based conversions, attempt numerical inversion
            // This is imprecise but works for monotonic functions
            return value // Placeholder - needs specific reverse formulas
          }
        : undefined,
      reversible: true,
    }
  }

  return null
}

/**
 * Convert a value from one unit to another
 */
export function convertUnit(
  value: number,
  from: string,
  to: string,
  params?: Record<string, number>
): number {
  // Same unit, no conversion needed
  if (from.toLowerCase() === to.toLowerCase()) {
    return value
  }

  const rule = findConversionRule(from, to)

  if (!rule) {
    console.warn(`[UnitConverter] No conversion rule found: ${from} -> ${to}`)
    return value // Return original value if no conversion available
  }

  if (rule.factor !== undefined) {
    return value * rule.factor
  }

  if (rule.formula) {
    return rule.formula(value, params)
  }

  return value
}

/**
 * Convert LCOE to LCOH using electrolyzer efficiency
 *
 * LCOH ($/kg H2) = LCOE ($/MWh) * energy_consumption_per_kg (kWh/kg) / 1000
 *
 * For electrolyzers:
 * - Typical consumption: 50-55 kWh/kg H2 (at 65-70% efficiency)
 * - Best-in-class PEM: 45-50 kWh/kg (75-80% efficiency)
 * - SOEC with heat integration: 35-40 kWh/kg (85%+ efficiency)
 *
 * Example: $60/MWh * 50 kWh/kg / 1000 = $3.00/kg H2
 */
export function lcoeToLcoh(
  lcoe: number, // $/MWh
  energyConsumptionKwhPerKg: number = 50, // kWh/kg H2 (electrolyzer consumption)
  efficiency: number = 1.0 // Optional additional efficiency factor
): number {
  // LCOH = LCOE * energy_consumption / 1000 / efficiency
  // Using energy consumption (how much electricity needed), not energy content
  return (lcoe * energyConsumptionKwhPerKg / 1000) / efficiency
}

/**
 * Convert specific consumption to efficiency
 */
export function specificConsumptionToEfficiency(
  kwhPerNm3: number,
  basis: 'LHV' | 'HHV' = 'LHV'
): number {
  // Theoretical minimum (100% efficiency):
  // LHV: 2.54 kWh/Nm³
  // HHV: 3.00 kWh/Nm³
  const theoretical = basis === 'LHV' ? 2.54 : 3.0
  return (theoretical / kwhPerNm3) * 100
}

/**
 * Convert efficiency to specific consumption
 */
export function efficiencyToSpecificConsumption(
  efficiency: number, // as percentage (0-100)
  basis: 'LHV' | 'HHV' = 'LHV'
): number {
  const theoretical = basis === 'LHV' ? 2.54 : 3.0
  return (theoretical / efficiency) * 100
}

/**
 * Convert kWh/kg to system efficiency
 */
export function kwhPerKgToEfficiency(
  kwhPerKg: number,
  basis: 'LHV' | 'HHV' = 'LHV'
): number {
  const energyContent = basis === 'LHV' ? CONSTANTS.H2_ENERGY_CONTENT_LHV : CONSTANTS.H2_ENERGY_CONTENT_HHV
  return (energyContent / kwhPerKg) * 100
}

// ============================================================================
// Battery/Storage Conversions
// ============================================================================

/**
 * Convert LCOS components
 */
export function calculateLCOS(
  capex: number, // $/kWh
  cycles: number,
  roundTripEfficiency: number, // as decimal (0-1)
  electricityCost: number = 0.05, // $/kWh
  omCost: number = 0 // $/kWh-year
): number {
  // LCOS = (CAPEX / (cycles * efficiency)) + (electricity / efficiency) + O&M
  const capitalComponent = capex / (cycles * roundTripEfficiency)
  const energyComponent = electricityCost / roundTripEfficiency
  const omComponent = omCost / cycles

  return capitalComponent + energyComponent + omComponent
}

/**
 * Convert energy density units
 */
export function convertEnergyDensity(
  value: number,
  from: 'Wh/kg' | 'Wh/L' | 'kWh/kg' | 'kWh/L',
  to: 'Wh/kg' | 'Wh/L' | 'kWh/kg' | 'kWh/L'
): number {
  // Convert to Wh/kg first
  let whPerKg = value
  if (from === 'kWh/kg') whPerKg = value * 1000
  if (from === 'kWh/L') whPerKg = value * 1000 // Assumes density ~1
  if (from === 'Wh/L') whPerKg = value // Assumes density ~1

  // Convert to target
  switch (to) {
    case 'Wh/kg':
      return whPerKg
    case 'kWh/kg':
      return whPerKg / 1000
    case 'Wh/L':
      return whPerKg // Assumes density ~1
    case 'kWh/L':
      return whPerKg / 1000
    default:
      return value
  }
}

// ============================================================================
// Carbon Capture Conversions
// ============================================================================

/**
 * Convert CO2 capture cost units
 */
export function convertCO2Cost(
  value: number,
  from: '$/tonne' | '$/kg' | '$/Nm3',
  to: '$/tonne' | '$/kg' | '$/Nm3'
): number {
  // Convert to $/tonne first
  let perTonne = value
  if (from === '$/kg') perTonne = value * 1000
  if (from === '$/Nm3') perTonne = value * 1000 / CONSTANTS.CO2_DENSITY_STP

  // Convert to target
  switch (to) {
    case '$/tonne':
      return perTonne
    case '$/kg':
      return perTonne / 1000
    case '$/Nm3':
      return (perTonne / 1000) * CONSTANTS.CO2_DENSITY_STP
    default:
      return value
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Parse a value with unit string like "4.5 kWh/Nm³"
 */
export function parseValueWithUnit(text: string): { value: number; unit: string } | null {
  const match = text.match(/^([\d.,]+)\s*(.*)$/)
  if (!match) return null

  const value = parseFloat(match[1].replace(',', ''))
  const unit = match[2].trim()

  if (isNaN(value)) return null

  return { value, unit }
}

/**
 * Normalize unit string for comparison
 */
export function normalizeUnit(unit: string): string {
  return unit
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('³', '3')
    .replace('²', '2')
    .replace('μ', 'u')
}

/**
 * Check if two units are equivalent
 */
export function unitsEquivalent(unit1: string, unit2: string): boolean {
  const equivalences: Record<string, string[]> = {
    'kwh/nm3': ['kwh/nm³', 'kwh/m3', 'kwhpernm3'],
    '$/kg': ['usd/kg', 'dollars/kg'],
    '$/mwh': ['usd/mwh', 'dollars/mwh'],
    '%': ['percent', 'pct'],
  }

  const n1 = normalizeUnit(unit1)
  const n2 = normalizeUnit(unit2)

  if (n1 === n2) return true

  for (const equivalentSet of Object.values(equivalences)) {
    if (equivalentSet.includes(n1) && equivalentSet.includes(n2)) {
      return true
    }
  }

  return false
}
