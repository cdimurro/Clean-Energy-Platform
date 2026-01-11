/**
 * Industry Benchmarks Database (2024-2025)
 *
 * Comprehensive benchmark data from authoritative sources:
 * - NREL (National Renewable Energy Laboratory)
 * - IEA (International Energy Agency)
 * - BloombergNEF
 * - DOE (Department of Energy)
 * - IRENA (International Renewable Energy Agency)
 *
 * Used for: Physics Simulation Validation product ($25K-$75K)
 */

// ============================================================================
// Types
// ============================================================================

export interface Benchmark {
  metric: string
  technology: string
  domain: string
  values: {
    min: number
    median: number
    max: number
    unit: string
  }
  categories: {
    commercial?: number
    demonstration?: number
    lab?: number
    theoretical?: number
  }
  learningRate?: number // % cost reduction per doubling of capacity
  source: string
  year: number
  notes?: string
}

export interface CostProjection {
  technology: string
  currentCost: number
  unit: string
  projections: Array<{
    year: number
    low: number
    mid: number
    high: number
  }>
  learningRate: number
  source: string
}

// ============================================================================
// Solar PV Benchmarks
// ============================================================================

export const SOLAR_BENCHMARKS: Benchmark[] = [
  {
    metric: 'efficiency',
    technology: 'c-Si solar cell',
    domain: 'solar',
    values: { min: 20, median: 22.5, max: 26.8, unit: '%' },
    categories: {
      commercial: 22.5,
      lab: 26.8,
      theoretical: 33.7,
    },
    source: 'NREL Best Research-Cell Efficiency Chart 2024',
    year: 2024,
    notes: 'Monocrystalline silicon, IBC architecture for lab record',
  },
  {
    metric: 'efficiency',
    technology: 'perovskite solar cell',
    domain: 'solar',
    values: { min: 18, median: 23, max: 26.1, unit: '%' },
    categories: {
      commercial: 18,
      demonstration: 23,
      lab: 26.1,
      theoretical: 33.7,
    },
    source: 'NREL Best Research-Cell Efficiency Chart 2024',
    year: 2024,
    notes: 'Single junction perovskite, stability remains key challenge',
  },
  {
    metric: 'efficiency',
    technology: 'perovskite-silicon tandem',
    domain: 'solar',
    values: { min: 25, median: 30, max: 33.9, unit: '%' },
    categories: {
      demonstration: 28,
      lab: 33.9,
      theoretical: 45,
    },
    source: 'NREL Best Research-Cell Efficiency Chart 2024',
    year: 2024,
    notes: 'LONGi record 33.9% certified December 2024',
  },
  {
    metric: 'lcoe',
    technology: 'utility-scale solar pv',
    domain: 'solar',
    values: { min: 24, median: 36, max: 96, unit: '$/MWh' },
    categories: { commercial: 36 },
    learningRate: 23,
    source: 'Lazard LCOE+ 2024',
    year: 2024,
  },
  {
    metric: 'capex',
    technology: 'utility-scale solar pv',
    domain: 'solar',
    values: { min: 700, median: 900, max: 1200, unit: '$/kW' },
    categories: { commercial: 900 },
    learningRate: 23,
    source: 'NREL ATB 2024',
    year: 2024,
  },
  {
    metric: 'degradation_rate',
    technology: 'solar pv module',
    domain: 'solar',
    values: { min: 0.3, median: 0.5, max: 0.8, unit: '%/year' },
    categories: { commercial: 0.5 },
    source: 'NREL PV Lifetime and Degradation Science 2024',
    year: 2024,
    notes: 'Premium modules achieve 0.3%/year',
  },
]

// ============================================================================
// Wind Benchmarks
// ============================================================================

export const WIND_BENCHMARKS: Benchmark[] = [
  {
    metric: 'capacity_factor',
    technology: 'onshore wind',
    domain: 'wind',
    values: { min: 25, median: 35, max: 52, unit: '%' },
    categories: { commercial: 35 },
    source: 'IEA Wind Energy Outlook 2024',
    year: 2024,
    notes: 'Location-dependent, best sites in US Great Plains',
  },
  {
    metric: 'capacity_factor',
    technology: 'offshore wind',
    domain: 'wind',
    values: { min: 35, median: 45, max: 60, unit: '%' },
    categories: { commercial: 45 },
    source: 'IEA Offshore Wind Outlook 2024',
    year: 2024,
    notes: 'Floating offshore can achieve 50%+',
  },
  {
    metric: 'lcoe',
    technology: 'onshore wind',
    domain: 'wind',
    values: { min: 24, median: 37, max: 75, unit: '$/MWh' },
    categories: { commercial: 37 },
    learningRate: 17,
    source: 'Lazard LCOE+ 2024',
    year: 2024,
  },
  {
    metric: 'lcoe',
    technology: 'offshore wind',
    domain: 'wind',
    values: { min: 72, median: 114, max: 140, unit: '$/MWh' },
    categories: { commercial: 114 },
    learningRate: 10,
    source: 'Lazard LCOE+ 2024',
    year: 2024,
    notes: 'Fixed bottom, floating adds 20-40%',
  },
  {
    metric: 'capex',
    technology: 'onshore wind',
    domain: 'wind',
    values: { min: 1000, median: 1400, max: 1800, unit: '$/kW' },
    categories: { commercial: 1400 },
    source: 'NREL ATB 2024',
    year: 2024,
  },
  {
    metric: 'capex',
    technology: 'offshore wind',
    domain: 'wind',
    values: { min: 2800, median: 3500, max: 5500, unit: '$/kW' },
    categories: { commercial: 3500 },
    source: 'NREL ATB 2024',
    year: 2024,
    notes: 'Fixed bottom, floating adds 50-100%',
  },
]

// ============================================================================
// Battery Storage Benchmarks
// ============================================================================

export const BATTERY_BENCHMARKS: Benchmark[] = [
  {
    metric: 'round_trip_efficiency',
    technology: 'lithium-ion battery',
    domain: 'battery',
    values: { min: 85, median: 90, max: 95, unit: '%' },
    categories: { commercial: 90 },
    source: 'NREL Grid Energy Storage Technology Cost and Performance 2024',
    year: 2024,
  },
  {
    metric: 'round_trip_efficiency',
    technology: 'vanadium flow battery',
    domain: 'battery',
    values: { min: 65, median: 75, max: 80, unit: '%' },
    categories: { commercial: 75 },
    source: 'DOE Energy Storage Grand Challenge 2024',
    year: 2024,
  },
  {
    metric: 'cycle_life',
    technology: 'lithium-ion battery',
    domain: 'battery',
    values: { min: 3000, median: 6000, max: 10000, unit: 'cycles' },
    categories: { commercial: 6000 },
    source: 'BloombergNEF Battery Price Survey 2024',
    year: 2024,
    notes: 'LFP chemistry achieves 10,000+ cycles',
  },
  {
    metric: 'cycle_life',
    technology: 'vanadium flow battery',
    domain: 'battery',
    values: { min: 10000, median: 20000, max: 25000, unit: 'cycles' },
    categories: { commercial: 20000 },
    source: 'DOE Long Duration Energy Storage 2024',
    year: 2024,
  },
  {
    metric: 'energy_density',
    technology: 'lithium-ion battery',
    domain: 'battery',
    values: { min: 200, median: 270, max: 350, unit: 'Wh/kg' },
    categories: {
      commercial: 270,
      lab: 350,
      theoretical: 500,
    },
    source: 'BloombergNEF Battery Price Survey 2024',
    year: 2024,
  },
  {
    metric: 'capex',
    technology: 'lithium-ion battery storage',
    domain: 'battery',
    values: { min: 150, median: 185, max: 250, unit: '$/kWh' },
    categories: { commercial: 185 },
    learningRate: 18,
    source: 'BloombergNEF Battery Price Survey 2024',
    year: 2024,
    notes: 'Pack-level pricing, DC system',
  },
  {
    metric: 'lcos',
    technology: '4-hour lithium-ion storage',
    domain: 'battery',
    values: { min: 80, median: 140, max: 210, unit: '$/MWh' },
    categories: { commercial: 140 },
    source: 'Lazard LCOS+ 2024',
    year: 2024,
  },
]

// ============================================================================
// Hydrogen & Electrolyzer Benchmarks
// ============================================================================

export const HYDROGEN_BENCHMARKS: Benchmark[] = [
  {
    metric: 'efficiency',
    technology: 'pem electrolyzer',
    domain: 'hydrogen',
    values: { min: 60, median: 70, max: 80, unit: '%' },
    categories: {
      commercial: 70,
      demonstration: 75,
      theoretical: 100,
    },
    source: 'IEA Global Hydrogen Review 2024',
    year: 2024,
    notes: 'LHV basis, system level',
  },
  {
    metric: 'efficiency',
    technology: 'alkaline electrolyzer',
    domain: 'hydrogen',
    values: { min: 63, median: 68, max: 75, unit: '%' },
    categories: { commercial: 68 },
    source: 'IEA Global Hydrogen Review 2024',
    year: 2024,
    notes: 'LHV basis, system level',
  },
  {
    metric: 'efficiency',
    technology: 'soec electrolyzer',
    domain: 'hydrogen',
    values: { min: 80, median: 85, max: 95, unit: '%' },
    categories: {
      demonstration: 85,
      lab: 95,
    },
    source: 'DOE Hydrogen Shot 2024 Update',
    year: 2024,
    notes: 'Can exceed 100% electrical efficiency with thermal input',
  },
  {
    metric: 'specific_consumption',
    technology: 'pem electrolyzer',
    domain: 'hydrogen',
    values: { min: 50, median: 55, max: 65, unit: 'kWh/kg' },
    categories: { commercial: 55 },
    source: 'IEA Global Hydrogen Review 2024',
    year: 2024,
  },
  {
    metric: 'capex',
    technology: 'pem electrolyzer',
    domain: 'hydrogen',
    values: { min: 400, median: 700, max: 1400, unit: '$/kW' },
    categories: { commercial: 700 },
    learningRate: 12,
    source: 'BloombergNEF Hydrogen Economy Outlook 2024',
    year: 2024,
  },
  {
    metric: 'capex',
    technology: 'alkaline electrolyzer',
    domain: 'hydrogen',
    values: { min: 300, median: 500, max: 800, unit: '$/kW' },
    categories: { commercial: 500 },
    learningRate: 10,
    source: 'BloombergNEF Hydrogen Economy Outlook 2024',
    year: 2024,
  },
  {
    metric: 'lcoh',
    technology: 'green hydrogen',
    domain: 'hydrogen',
    values: { min: 3.0, median: 5.5, max: 10, unit: '$/kg' },
    categories: { commercial: 5.5 },
    source: 'IEA Global Hydrogen Review 2024',
    year: 2024,
    notes: 'Highly dependent on electricity cost',
  },
  {
    metric: 'lifetime',
    technology: 'pem electrolyzer stack',
    domain: 'hydrogen',
    values: { min: 60000, median: 80000, max: 100000, unit: 'hours' },
    categories: { commercial: 80000 },
    source: 'DOE Hydrogen Shot 2024 Update',
    year: 2024,
  },
]

// ============================================================================
// Fuel Cell Benchmarks
// ============================================================================

export const FUEL_CELL_BENCHMARKS: Benchmark[] = [
  {
    metric: 'efficiency',
    technology: 'pem fuel cell',
    domain: 'fuel-cell',
    values: { min: 50, median: 60, max: 68, unit: '%' },
    categories: { commercial: 60, theoretical: 83 },
    source: 'DOE Hydrogen and Fuel Cell Technologies Office 2024',
    year: 2024,
    notes: 'Electrical efficiency, LHV basis',
  },
  {
    metric: 'efficiency',
    technology: 'sofc fuel cell',
    domain: 'fuel-cell',
    values: { min: 55, median: 65, max: 70, unit: '%' },
    categories: { commercial: 65, theoretical: 90 },
    source: 'DOE Hydrogen and Fuel Cell Technologies Office 2024',
    year: 2024,
  },
  {
    metric: 'lifetime',
    technology: 'pem fuel cell',
    domain: 'fuel-cell',
    values: { min: 5000, median: 8000, max: 25000, unit: 'hours' },
    categories: { commercial: 8000 },
    source: 'DOE Hydrogen and Fuel Cell Technologies Office 2024',
    year: 2024,
    notes: 'Heavy-duty applications target 25,000 hours',
  },
  {
    metric: 'capex',
    technology: 'pem fuel cell system',
    domain: 'fuel-cell',
    values: { min: 800, median: 1200, max: 2000, unit: '$/kW' },
    categories: { commercial: 1200 },
    learningRate: 15,
    source: 'BloombergNEF Hydrogen Economy Outlook 2024',
    year: 2024,
  },
]

// ============================================================================
// Carbon Capture Benchmarks
// ============================================================================

export const CARBON_CAPTURE_BENCHMARKS: Benchmark[] = [
  {
    metric: 'energy_consumption',
    technology: 'direct air capture',
    domain: 'carbon-capture',
    values: { min: 1500, median: 2500, max: 4000, unit: 'kWh/tonne' },
    categories: {
      commercial: 2500,
      theoretical: 178,
    },
    source: 'IEA Direct Air Capture Report 2024',
    year: 2024,
    notes: 'Theoretical minimum is Gibbs free energy',
  },
  {
    metric: 'cost',
    technology: 'direct air capture',
    domain: 'carbon-capture',
    values: { min: 250, median: 600, max: 1000, unit: '$/tonne' },
    categories: { commercial: 600 },
    learningRate: 20,
    source: 'IEA Direct Air Capture Report 2024',
    year: 2024,
    notes: 'DOE target: $100/tonne by 2030',
  },
  {
    metric: 'capture_rate',
    technology: 'point source carbon capture',
    domain: 'carbon-capture',
    values: { min: 85, median: 90, max: 95, unit: '%' },
    categories: { commercial: 90 },
    source: 'Global CCS Institute Status Report 2024',
    year: 2024,
  },
]

// ============================================================================
// Cost Projections
// ============================================================================

export const COST_PROJECTIONS: CostProjection[] = [
  {
    technology: 'utility-scale solar pv',
    currentCost: 36,
    unit: '$/MWh',
    projections: [
      { year: 2025, low: 28, mid: 33, high: 40 },
      { year: 2030, low: 18, mid: 25, high: 35 },
      { year: 2040, low: 12, mid: 18, high: 28 },
      { year: 2050, low: 8, mid: 14, high: 22 },
    ],
    learningRate: 23,
    source: 'NREL ATB 2024',
  },
  {
    technology: 'onshore wind',
    currentCost: 37,
    unit: '$/MWh',
    projections: [
      { year: 2025, low: 30, mid: 35, high: 42 },
      { year: 2030, low: 24, mid: 30, high: 38 },
      { year: 2040, low: 20, mid: 26, high: 34 },
      { year: 2050, low: 18, mid: 24, high: 32 },
    ],
    learningRate: 17,
    source: 'NREL ATB 2024',
  },
  {
    technology: 'lithium-ion battery',
    currentCost: 185,
    unit: '$/kWh',
    projections: [
      { year: 2025, low: 140, mid: 160, high: 185 },
      { year: 2030, low: 80, mid: 100, high: 130 },
      { year: 2040, low: 50, mid: 70, high: 100 },
      { year: 2050, low: 40, mid: 55, high: 80 },
    ],
    learningRate: 18,
    source: 'BloombergNEF Battery Price Survey 2024',
  },
  {
    technology: 'pem electrolyzer',
    currentCost: 700,
    unit: '$/kW',
    projections: [
      { year: 2025, low: 500, mid: 600, high: 750 },
      { year: 2030, low: 200, mid: 350, high: 500 },
      { year: 2040, low: 100, mid: 200, high: 350 },
      { year: 2050, low: 75, mid: 150, high: 280 },
    ],
    learningRate: 12,
    source: 'IEA Global Hydrogen Review 2024',
  },
  {
    technology: 'green hydrogen',
    currentCost: 5.5,
    unit: '$/kg',
    projections: [
      { year: 2025, low: 3.5, mid: 4.5, high: 6 },
      { year: 2030, low: 1.5, mid: 2.5, high: 4 },
      { year: 2040, low: 1.0, mid: 1.8, high: 3 },
      { year: 2050, low: 0.8, mid: 1.4, high: 2.5 },
    ],
    learningRate: 15,
    source: 'IEA Global Hydrogen Review 2024',
  },
]

// ============================================================================
// Lookup Functions
// ============================================================================

const ALL_BENCHMARKS = [
  ...SOLAR_BENCHMARKS,
  ...WIND_BENCHMARKS,
  ...BATTERY_BENCHMARKS,
  ...HYDROGEN_BENCHMARKS,
  ...FUEL_CELL_BENCHMARKS,
  ...CARBON_CAPTURE_BENCHMARKS,
]

/**
 * Get benchmark for a specific technology and metric
 */
export function getBenchmark(
  technology: string,
  metric: string
): Benchmark | undefined {
  const normalizedTech = technology.toLowerCase()
  const normalizedMetric = metric.toLowerCase().replace(/\s+/g, '_')

  return ALL_BENCHMARKS.find(b => {
    const techMatch = normalizedTech.includes(b.technology.toLowerCase()) ||
                      b.technology.toLowerCase().includes(normalizedTech)
    const metricMatch = b.metric === normalizedMetric ||
                        b.metric.replace(/_/g, ' ') === metric.toLowerCase()
    return techMatch && metricMatch
  })
}

/**
 * Get all benchmarks for a technology
 */
export function getBenchmarksForTechnology(technology: string): Benchmark[] {
  const normalizedTech = technology.toLowerCase()
  return ALL_BENCHMARKS.filter(b =>
    normalizedTech.includes(b.technology.toLowerCase()) ||
    b.technology.toLowerCase().includes(normalizedTech)
  )
}

/**
 * Get all benchmarks for a domain
 */
export function getBenchmarksForDomain(domain: string): Benchmark[] {
  return ALL_BENCHMARKS.filter(b => b.domain === domain)
}

/**
 * Get cost projection for a technology
 */
export function getCostProjection(technology: string): CostProjection | undefined {
  const normalizedTech = technology.toLowerCase()
  return COST_PROJECTIONS.find(p =>
    normalizedTech.includes(p.technology.toLowerCase()) ||
    p.technology.toLowerCase().includes(normalizedTech)
  )
}

/**
 * Compare a value against benchmark
 */
export function compareToBenchmark(
  technology: string,
  metric: string,
  value: number
): {
  benchmark: Benchmark
  percentile: number
  position: 'leading' | 'competitive' | 'lagging' | 'unknown'
  gap: string
} | null {
  const benchmark = getBenchmark(technology, metric)
  if (!benchmark) return null

  const { min, median, max } = benchmark.values

  // Calculate percentile
  let percentile: number
  if (value <= min) {
    percentile = 0
  } else if (value >= max) {
    percentile = 100
  } else {
    percentile = ((value - min) / (max - min)) * 100
  }

  // Determine position (for metrics where higher is better)
  let position: 'leading' | 'competitive' | 'lagging' | 'unknown'
  if (value >= median * 1.1) {
    position = 'leading'
  } else if (value >= median * 0.9) {
    position = 'competitive'
  } else if (value >= min) {
    position = 'lagging'
  } else {
    position = 'unknown'
  }

  // Calculate gap to best-in-class
  const gap = value < max
    ? `${((max - value) / value * 100).toFixed(1)}% below best-in-class`
    : `${((value - max) / max * 100).toFixed(1)}% above current best`

  return { benchmark, percentile, position, gap }
}
