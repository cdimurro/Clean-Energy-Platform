/**
 * Standardized Metrics Interface
 *
 * Defines a unified metrics output structure that ALL assessment agents must populate.
 * This ensures consistent extraction and validation across all components.
 *
 * Design Goals:
 * - Every numeric metric has a known location in the output
 * - All units are explicit
 * - Confidence and source tracking for data quality
 * - Supports domain-specific metrics through secondary array
 */

// ============================================================================
// Core Metric Types
// ============================================================================

/**
 * A single standardized metric with full metadata
 */
export interface StandardizedMetric {
  /** Unique identifier (e.g., 'lcoh', 'efficiency', 'capex') */
  id: string

  /** Human-readable name */
  name: string

  /** Numeric value (ALWAYS a number, never null) */
  value: number

  /** Unit of measurement (SI units preferred) */
  unit: string

  /** Confidence level in this value */
  confidence: 'high' | 'medium' | 'low'

  /** Source of the value (publication, calculation, estimate) */
  source: string

  /** If calculated, show the derivation */
  derivedFrom?: string

  /** Industry benchmark range for comparison */
  benchmarkRange?: {
    min: number
    max: number
    source: string
    year: number
  }
}

/**
 * Range metric for values with uncertainty
 */
export interface StandardizedRangeMetric extends StandardizedMetric {
  /** Lower bound of range */
  min: number

  /** Upper bound of range */
  max: number

  /** P50 (median) value if known */
  p50?: number

  /** P95 value if known */
  p95?: number
}

// ============================================================================
// Standardized Output Structure
// ============================================================================

/**
 * The standardized metrics block that ALL agents must output
 */
export interface StandardizedMetricsOutput {
  // --------------------------------------------------------------------------
  // PRIMARY METRICS (Required for all assessments)
  // --------------------------------------------------------------------------

  /**
   * Primary cost metric for the technology
   * Examples: LCOH (hydrogen), LCOS (storage), LCOC (carbon capture), LCOE (energy)
   */
  primaryCostMetric: StandardizedMetric

  /**
   * System efficiency as percentage (0-100)
   */
  efficiency: StandardizedMetric

  /**
   * Technology Readiness Level (1-9)
   */
  trl: number

  /**
   * Overall technology rating
   */
  rating: 'BREAKTHROUGH' | 'PROMISING' | 'CONDITIONAL' | 'NOT_RECOMMENDED'

  // --------------------------------------------------------------------------
  // ECONOMIC METRICS
  // --------------------------------------------------------------------------

  /**
   * Capital expenditure
   */
  capex: StandardizedMetric

  /**
   * Operating expenditure (annual or per unit)
   */
  opex: StandardizedMetric

  /**
   * Net Present Value
   */
  npv?: StandardizedMetric

  /**
   * Internal Rate of Return (as decimal, e.g., 0.15 for 15%)
   */
  irr?: StandardizedMetric

  /**
   * Payback period in years
   */
  paybackPeriod?: StandardizedMetric

  // --------------------------------------------------------------------------
  // PERFORMANCE METRICS
  // --------------------------------------------------------------------------

  /**
   * Expected lifetime in operating hours or years
   */
  lifetime?: StandardizedMetric

  /**
   * Degradation rate per year (as percentage)
   */
  degradationRate?: StandardizedMetric

  /**
   * Capacity factor (for power generation)
   */
  capacityFactor?: StandardizedMetric

  // --------------------------------------------------------------------------
  // DOMAIN-SPECIFIC METRICS
  // --------------------------------------------------------------------------

  /**
   * Array of additional domain-specific metrics
   * Examples for hydrogen: output pressure, specific consumption, ramp rate
   * Examples for batteries: cycle life, energy density, power density
   */
  secondaryMetrics: StandardizedMetric[]

  // --------------------------------------------------------------------------
  // PROJECTIONS
  // --------------------------------------------------------------------------

  /**
   * Projected cost at scale (future)
   */
  projectedCost?: StandardizedMetric

  /**
   * Cost reduction rate (% per year)
   */
  costReductionRate?: StandardizedMetric

  // --------------------------------------------------------------------------
  // METADATA
  // --------------------------------------------------------------------------

  /**
   * Timestamp when metrics were generated
   */
  generatedAt: string

  /**
   * Component that generated these metrics
   */
  sourceComponent: string

  /**
   * Any warnings or data quality notes
   */
  warnings?: string[]
}

// ============================================================================
// Helper Types
// ============================================================================

/**
 * Metric extraction result with validation status
 */
export interface MetricExtractionResult {
  metric: StandardizedMetric | null
  found: boolean
  path: string[]
  extractionMethod: 'direct' | 'search' | 'calculated' | 'fallback'
}

/**
 * Validation status for a metrics output
 */
export interface MetricsValidationStatus {
  isValid: boolean
  score: number // 0-100
  missingRequired: string[]
  invalidValues: Array<{ field: string; reason: string }>
  warnings: string[]
}

// ============================================================================
// Domain-Specific Metric Templates
// ============================================================================

/**
 * Required metric IDs by domain category
 */
export const REQUIRED_METRICS_BY_DOMAIN: Record<string, string[]> = {
  hydrogen: ['lcoh', 'efficiency', 'specific_consumption', 'output_pressure', 'stack_lifetime'],
  'energy-storage': ['lcos', 'efficiency', 'cycle_life', 'energy_density', 'power_density'],
  'clean-energy': ['lcoe', 'efficiency', 'capacity_factor', 'lifetime'],
  industrial: ['lcoc', 'efficiency', 'capture_rate', 'energy_penalty'],
  transportation: ['tco', 'efficiency', 'range', 'charging_time'],
  agriculture: ['yield_cost', 'efficiency', 'water_use', 'land_use'],
  materials: ['production_cost', 'purity', 'supply_risk'],
  biotech: ['cogs', 'efficacy', 'yield'],
  computing: ['performance_per_watt', 'error_rate', 'cost_per_operation'],
  general: ['npv', 'irr', 'payback'],
}

/**
 * Standard metric units by ID
 */
export const STANDARD_UNITS: Record<string, string> = {
  // Cost metrics
  lcoh: '$/kg',
  lcos: '$/kWh',
  lcoe: '$/MWh',
  lcoc: '$/tonne',
  tco: '$/km',
  capex: '$/kW',
  opex: '$/year',
  npv: '$',
  irr: '%',
  payback: 'years',
  cogs: '$/unit',
  production_cost: '$/kg',

  // Performance metrics
  efficiency: '%',
  capacity_factor: '%',
  degradation_rate: '%/year',
  cost_reduction_rate: '%/year',

  // Time metrics
  lifetime: 'hours',
  cycle_life: 'cycles',
  charging_time: 'minutes',

  // Physical metrics
  specific_consumption: 'kWh/Nm3',
  output_pressure: 'bar',
  energy_density: 'Wh/kg',
  power_density: 'W/kg',
  capture_rate: '%',
  range: 'km',

  // Agricultural
  yield_cost: '$/kg',
  water_use: 'L/kg',
  land_use: 'm2/kg',

  // Computing
  performance_per_watt: 'FLOPS/W',
  error_rate: '%',
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a StandardizedMetric with defaults
 */
export function createMetric(
  id: string,
  value: number,
  options?: Partial<Omit<StandardizedMetric, 'id' | 'value'>>
): StandardizedMetric {
  return {
    id,
    name: options?.name || id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    unit: options?.unit || STANDARD_UNITS[id] || '',
    confidence: options?.confidence || 'medium',
    source: options?.source || 'AI analysis',
    derivedFrom: options?.derivedFrom,
    benchmarkRange: options?.benchmarkRange,
  }
}

/**
 * Create an empty StandardizedMetricsOutput with defaults
 */
export function createEmptyMetricsOutput(sourceComponent: string): StandardizedMetricsOutput {
  return {
    primaryCostMetric: createMetric('primary_cost', 0, {
      name: 'Primary Cost Metric',
      confidence: 'low',
      source: 'Not calculated',
    }),
    efficiency: createMetric('efficiency', 0, {
      unit: '%',
      confidence: 'low',
      source: 'Not calculated',
    }),
    trl: 0,
    rating: 'NOT_RECOMMENDED',
    capex: createMetric('capex', 0, {
      unit: '$/kW',
      confidence: 'low',
      source: 'Not calculated',
    }),
    opex: createMetric('opex', 0, {
      unit: '$/year',
      confidence: 'low',
      source: 'Not calculated',
    }),
    secondaryMetrics: [],
    generatedAt: new Date().toISOString(),
    sourceComponent,
    warnings: ['Metrics not yet calculated'],
  }
}

// ============================================================================
// Prompt Template for AI
// ============================================================================

/**
 * The schema that agents must include in their prompts to get standardized output
 */
export const STANDARDIZED_METRICS_PROMPT_SCHEMA = `
CRITICAL REQUIREMENT: You MUST include a "standardizedMetrics" object in your JSON response with this EXACT structure:

{
  "standardizedMetrics": {
    "primaryCostMetric": {
      "id": "lcoh",                    // Metric ID (lcoh, lcos, lcoe, lcoc, etc.)
      "name": "Levelized Cost of Hydrogen",
      "value": 5.5,                    // ALWAYS a number, never null or string
      "unit": "$/kg",
      "confidence": "high",            // high | medium | low
      "source": "IEA Hydrogen Report 2024",
      "benchmarkRange": {
        "min": 4.0,
        "max": 6.5,
        "source": "IEA 2024",
        "year": 2024
      }
    },
    "efficiency": {
      "id": "system_efficiency",
      "name": "System Efficiency (LHV)",
      "value": 75,                     // Percentage (0-100)
      "unit": "%",
      "confidence": "high",
      "source": "Manufacturer specifications"
    },
    "trl": 9,                          // Integer 1-9
    "rating": "PROMISING",             // BREAKTHROUGH | PROMISING | CONDITIONAL | NOT_RECOMMENDED
    "capex": {
      "id": "capex",
      "name": "Capital Expenditure",
      "value": 850,
      "unit": "$/kW",
      "confidence": "medium",
      "source": "Industry reports"
    },
    "opex": {
      "id": "opex",
      "name": "Operating Expenditure",
      "value": 25000,
      "unit": "$/year",
      "confidence": "medium",
      "source": "Calculated"
    },
    "lifetime": {
      "id": "lifetime",
      "name": "Expected Stack Lifetime",
      "value": 80000,
      "unit": "hours",
      "confidence": "medium",
      "source": "Manufacturer warranty"
    },
    "secondaryMetrics": [
      {
        "id": "specific_consumption",
        "name": "Specific Energy Consumption",
        "value": 4.5,
        "unit": "kWh/Nm3",
        "confidence": "high",
        "source": "Technical specifications"
      },
      {
        "id": "output_pressure",
        "name": "Output Pressure",
        "value": 30,
        "unit": "bar",
        "confidence": "high",
        "source": "Technical specifications"
      }
    ],
    "projectedCost": {
      "id": "projected_lcoh",
      "name": "Projected LCOH (2030)",
      "value": 2.5,
      "unit": "$/kg",
      "confidence": "medium",
      "source": "DOE Hydrogen Shot targets"
    },
    "generatedAt": "2026-01-09T12:00:00Z",
    "sourceComponent": "tea-analysis"
  }
}

VALIDATION RULES:
1. primaryCostMetric.value MUST be a positive number
2. efficiency.value MUST be between 0 and 100
3. trl MUST be an integer between 1 and 9
4. rating MUST be one of: BREAKTHROUGH, PROMISING, CONDITIONAL, NOT_RECOMMENDED
5. All StandardizedMetric objects MUST have: id, name, value, unit, confidence, source
6. confidence MUST be one of: high, medium, low

If you cannot calculate a metric, use a reasonable estimate with confidence: "low" and explain in source.
`

// ============================================================================
// Exports
// ============================================================================

export type {
  StandardizedMetric as Metric,
}
