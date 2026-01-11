/**
 * Domain Benchmarks
 *
 * Industry benchmark data for constraining AI-generated cost estimates.
 * These benchmarks are used to:
 * 1. Inject realistic ranges into TEA agent prompts
 * 2. Validate AI outputs against known industry values
 * 3. Apply correction factors when outputs are unrealistic
 *
 * Sources:
 * - IEA (International Energy Agency)
 * - IRENA (International Renewable Energy Agency)
 * - DOE (US Department of Energy)
 * - NREL (National Renewable Energy Laboratory)
 * - BloombergNEF
 * - Industry reports
 */

// ============================================================================
// Types
// ============================================================================

export interface BenchmarkRange {
  min: number
  max: number
  median: number
  unit: string
  source: string
  year: number
}

export interface DomainBenchmarks {
  // Capital costs
  capex: BenchmarkRange
  capexUnit: string // $/kW, $/kWh, $/tonne-yr capacity

  // Operating costs
  opexFixed: BenchmarkRange // % of CAPEX or $/year
  opexVariable?: BenchmarkRange

  // Primary cost metric
  primaryCost: BenchmarkRange

  // Efficiency
  efficiency: BenchmarkRange

  // Lifetime
  lifetime: BenchmarkRange

  // Other domain-specific benchmarks
  secondary?: Record<string, BenchmarkRange>
}

// ============================================================================
// Benchmark Data
// ============================================================================

export const DOMAIN_BENCHMARKS: Record<string, DomainBenchmarks> = {
  // ---------------------------------------------------------------------------
  // Hydrogen / Electrolysis
  // ---------------------------------------------------------------------------
  hydrogen: {
    capex: {
      min: 600,
      max: 1200,
      median: 850,
      unit: '$/kW',
      source: 'IEA Global Hydrogen Review 2024',
      year: 2024,
    },
    capexUnit: '$/kW',
    opexFixed: {
      min: 2,
      max: 4,
      median: 3,
      unit: '% of CAPEX',
      source: 'IRENA Green Hydrogen Cost Reduction 2023',
      year: 2023,
    },
    primaryCost: {
      min: 4,
      max: 7,
      median: 5.5,
      unit: '$/kg H2',
      source: 'DOE Hydrogen Shot 2024',
      year: 2024,
    },
    efficiency: {
      min: 65,
      max: 80,
      median: 72,
      unit: '%',
      source: 'IRENA 2023',
      year: 2023,
    },
    lifetime: {
      min: 60000,
      max: 90000,
      median: 80000,
      unit: 'hours',
      source: 'DOE Electrolyzer Targets',
      year: 2024,
    },
    secondary: {
      specificConsumption: {
        min: 4.2,
        max: 5.5,
        median: 4.8,
        unit: 'kWh/Nm3',
        source: 'IEA 2024',
        year: 2024,
      },
      stackCost: {
        min: 200,
        max: 400,
        median: 300,
        unit: '$/kW',
        source: 'BloombergNEF 2024',
        year: 2024,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Energy Storage / Batteries
  // ---------------------------------------------------------------------------
  'energy-storage': {
    capex: {
      min: 150,
      max: 350,
      median: 250,
      unit: '$/kWh',
      source: 'BloombergNEF Battery Price Survey 2024',
      year: 2024,
    },
    capexUnit: '$/kWh',
    opexFixed: {
      min: 1,
      max: 3,
      median: 2,
      unit: '% of CAPEX',
      source: 'NREL ATB 2024',
      year: 2024,
    },
    primaryCost: {
      min: 0.05,
      max: 0.15,
      median: 0.10,
      unit: '$/kWh',
      source: 'NREL 2024',
      year: 2024,
    },
    efficiency: {
      min: 85,
      max: 95,
      median: 90,
      unit: '%',
      source: 'DOE VTO 2024',
      year: 2024,
    },
    lifetime: {
      min: 3000,
      max: 8000,
      median: 5000,
      unit: 'cycles',
      source: 'DOE VTO Targets',
      year: 2024,
    },
    secondary: {
      energyDensity: {
        min: 200,
        max: 500,
        median: 300,
        unit: 'Wh/kg',
        source: 'DOE VTO 2024',
        year: 2024,
      },
      cycleLife: {
        min: 500,
        max: 5000,
        median: 2000,
        unit: 'cycles',
        source: 'Industry data',
        year: 2024,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Industrial / Carbon Capture (DAC)
  // ---------------------------------------------------------------------------
  industrial: {
    capex: {
      min: 1000,
      max: 3000,
      median: 2000,
      unit: '$/tonne-yr',
      source: 'IEA CCUS Report 2024',
      year: 2024,
    },
    capexUnit: '$/tonne-yr',
    opexFixed: {
      min: 100,
      max: 300,
      median: 200,
      unit: '$/tonne',
      source: 'IEA 2024',
      year: 2024,
    },
    primaryCost: {
      min: 400,
      max: 1000,
      median: 600,
      unit: '$/tonne CO2',
      source: 'National Academies DAC Report',
      year: 2024,
    },
    efficiency: {
      min: 80,
      max: 95,
      median: 90,
      unit: '%',
      source: 'IEA 2024',
      year: 2024,
    },
    lifetime: {
      min: 20,
      max: 30,
      median: 25,
      unit: 'years',
      source: 'Industry estimates',
      year: 2024,
    },
    secondary: {
      energyIntensity: {
        min: 1500,
        max: 3000,
        median: 2000,
        unit: 'kWh/tonne',
        source: 'IEA 2024',
        year: 2024,
      },
      captureRate: {
        min: 85,
        max: 95,
        median: 90,
        unit: '%',
        source: 'IEA 2024',
        year: 2024,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Clean Energy / Solar
  // ---------------------------------------------------------------------------
  'clean-energy': {
    capex: {
      min: 800,
      max: 1500,
      median: 1100,
      unit: '$/kW',
      source: 'NREL ATB 2024',
      year: 2024,
    },
    capexUnit: '$/kW',
    opexFixed: {
      min: 10,
      max: 25,
      median: 18,
      unit: '$/kW-yr',
      source: 'NREL 2024',
      year: 2024,
    },
    primaryCost: {
      min: 25,
      max: 60,
      median: 40,
      unit: '$/MWh',
      source: 'IEA WEO 2024',
      year: 2024,
    },
    efficiency: {
      min: 18,
      max: 25,
      median: 22,
      unit: '%',
      source: 'NREL 2024',
      year: 2024,
    },
    lifetime: {
      min: 25,
      max: 35,
      median: 30,
      unit: 'years',
      source: 'NREL ATB 2024',
      year: 2024,
    },
    secondary: {
      capacityFactor: {
        min: 15,
        max: 30,
        median: 22,
        unit: '%',
        source: 'NREL 2024',
        year: 2024,
      },
      degradationRate: {
        min: 0.3,
        max: 0.7,
        median: 0.5,
        unit: '%/year',
        source: 'NREL 2024',
        year: 2024,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // Transportation / EVs
  // ---------------------------------------------------------------------------
  transportation: {
    capex: {
      min: 100,
      max: 200,
      median: 140,
      unit: '$/kWh',
      source: 'BloombergNEF 2024',
      year: 2024,
    },
    capexUnit: '$/kWh',
    opexFixed: {
      min: 0.02,
      max: 0.05,
      median: 0.03,
      unit: '$/km',
      source: 'Industry data',
      year: 2024,
    },
    primaryCost: {
      min: 0.08,
      max: 0.15,
      median: 0.12,
      unit: '$/km',
      source: 'DOE 2024',
      year: 2024,
    },
    efficiency: {
      min: 85,
      max: 95,
      median: 90,
      unit: '%',
      source: 'DOE VTO 2024',
      year: 2024,
    },
    lifetime: {
      min: 150000,
      max: 300000,
      median: 200000,
      unit: 'km',
      source: 'Industry data',
      year: 2024,
    },
  },

  // ---------------------------------------------------------------------------
  // Waste-to-Fuel / HTL
  // ---------------------------------------------------------------------------
  'waste-to-fuel': {
    capex: {
      min: 3000,
      max: 8000,
      median: 5000,
      unit: '$/tonne-yr capacity',
      source: 'NREL Waste-to-Energy Reviews 2024',
      year: 2024,
    },
    capexUnit: '$/tonne-yr',
    opexFixed: {
      min: 150,
      max: 350,
      median: 220,
      unit: '$/tonne feedstock',
      source: 'PNNL HTL Pilot Data',
      year: 2024,
    },
    opexVariable: {
      min: 30,
      max: 80,
      median: 50,
      unit: '$/tonne feedstock',
      source: 'HTL process engineering',
      year: 2024,
    },
    primaryCost: {
      min: 5,
      max: 15,
      median: 10,
      unit: '$/liter biocrude',
      source: 'NREL TEA for Hydrothermal Liquefaction',
      year: 2024,
    },
    efficiency: {
      min: 55,
      max: 80,
      median: 70,
      unit: '% energy recovery',
      source: 'IEA Bioenergy Task 39',
      year: 2024,
    },
    lifetime: {
      min: 15,
      max: 25,
      median: 20,
      unit: 'years',
      source: 'Industrial process plant estimates',
      year: 2024,
    },
    secondary: {
      biocrudeYield: {
        min: 20,
        max: 45,
        median: 30,
        unit: 'wt% dry feedstock',
        source: 'PNNL HTL Literature Review',
        year: 2024,
      },
      biocrudeHHV: {
        min: 30,
        max: 38,
        median: 34,
        unit: 'MJ/kg',
        source: 'Biocrude specifications',
        year: 2024,
      },
      biocharYield: {
        min: 10,
        max: 25,
        median: 15,
        unit: 'wt% dry feedstock',
        source: 'PNNL HTL studies',
        year: 2024,
      },
      steamRequirement: {
        min: 0.8,
        max: 2.0,
        median: 1.3,
        unit: 'MJ steam/kg feedstock',
        source: 'HTL process engineering',
        year: 2024,
      },
      tippingFeeRevenue: {
        min: 30,
        max: 80,
        median: 55,
        unit: '$/tonne (revenue)',
        source: 'MSW gate fees US average',
        year: 2024,
      },
    },
  },

  // ---------------------------------------------------------------------------
  // General / Fallback
  // ---------------------------------------------------------------------------
  general: {
    capex: {
      min: 500,
      max: 2000,
      median: 1000,
      unit: '$/kW',
      source: 'General estimates',
      year: 2024,
    },
    capexUnit: '$/kW',
    opexFixed: {
      min: 2,
      max: 5,
      median: 3,
      unit: '% of CAPEX',
      source: 'General estimates',
      year: 2024,
    },
    primaryCost: {
      min: 30,
      max: 100,
      median: 60,
      unit: '$/MWh',
      source: 'General estimates',
      year: 2024,
    },
    efficiency: {
      min: 70,
      max: 95,
      median: 85,
      unit: '%',
      source: 'General estimates',
      year: 2024,
    },
    lifetime: {
      min: 15,
      max: 30,
      median: 20,
      unit: 'years',
      source: 'General estimates',
      year: 2024,
    },
  },
}

// ============================================================================
// TRL Benchmarks by Technology Type
// ============================================================================

export interface TRLBenchmark {
  min: number
  max: number
  typical: number
  description: string
}

/**
 * Technology Readiness Level (TRL) benchmarks by domain and technology type.
 * Used to validate and constrain AI-generated TRL assessments.
 *
 * TRL Scale:
 * 1-3: Research (basic principles, concept formulation)
 * 4-5: Development (lab validation, relevant environment)
 * 6-7: Demonstration (prototype in operational environment)
 * 8-9: Deployment (qualified system, proven in operations)
 */
export const TRL_BENCHMARKS: Record<string, Record<string, TRLBenchmark>> = {
  hydrogen: {
    alkaline: { min: 8, max: 9, typical: 9, description: 'Mature commercial technology' },
    pem: { min: 7, max: 9, typical: 8, description: 'Commercial, scaling rapidly' },
    soec: { min: 5, max: 7, typical: 6, description: 'Pilot/demo stage, few MW systems deployed' },
    aem: { min: 4, max: 6, typical: 5, description: 'Lab to pilot scale' },
    generic: { min: 6, max: 8, typical: 7, description: 'Default for unknown electrolyzer type' },
  },
  'energy-storage': {
    'lithium-ion': { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    'sodium-ion': { min: 6, max: 8, typical: 7, description: 'Early commercial, pilot production' },
    lfp: { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    nmc: { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    'flow-battery': { min: 6, max: 8, typical: 7, description: 'Commercial but limited deployment' },
    'solid-state': { min: 4, max: 6, typical: 5, description: 'Pilot production, limited demos' },
    'iron-air': { min: 5, max: 7, typical: 6, description: 'Pilot scale demonstration' },
    generic: { min: 7, max: 9, typical: 8, description: 'Default for unknown battery type' },
  },
  industrial: {
    'h2-dri': { min: 5, max: 7, typical: 6, description: 'Pilot scale, HYBRIT demo operational' },
    'green-steel': { min: 5, max: 7, typical: 6, description: 'Pilot to demo scale' },
    'carbon-capture': { min: 6, max: 8, typical: 7, description: 'Commercial at some scales' },
    dac: { min: 5, max: 7, typical: 6, description: 'Pilot to early commercial' },
    'green-ammonia': { min: 6, max: 8, typical: 7, description: 'Early commercial projects' },
    'green-methanol': { min: 5, max: 7, typical: 6, description: 'Pilot to demo scale' },
    'green-cement': { min: 4, max: 6, typical: 5, description: 'Pilot demonstrations' },
    generic: { min: 5, max: 7, typical: 6, description: 'Default for industrial decarbonization' },
  },
  'clean-energy': {
    solar: { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    wind: { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    'offshore-wind': { min: 8, max: 9, typical: 8, description: 'Commercial, expanding' },
    'floating-offshore': { min: 6, max: 8, typical: 7, description: 'Demo to early commercial' },
    geothermal: { min: 8, max: 9, typical: 8, description: 'Commercial for conventional' },
    nuclear: { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    smr: { min: 5, max: 7, typical: 6, description: 'First commercial projects underway' },
    fusion: { min: 2, max: 4, typical: 3, description: 'Research/early development' },
    generic: { min: 7, max: 9, typical: 8, description: 'Default for clean energy' },
  },
  transportation: {
    'battery-ev': { min: 9, max: 9, typical: 9, description: 'Mature commercial technology' },
    'hydrogen-fcev': { min: 7, max: 9, typical: 8, description: 'Commercial, limited scale' },
    'e-fuels': { min: 5, max: 7, typical: 6, description: 'Pilot to demo scale' },
    saf: { min: 6, max: 8, typical: 7, description: 'Early commercial production' },
    generic: { min: 7, max: 8, typical: 7, description: 'Default for transportation' },
  },
  'waste-to-fuel': {
    'htl-msw': { min: 5, max: 7, typical: 6, description: 'MSW HTL at demo scale' },
    'htl-food-waste': { min: 5, max: 7, typical: 6, description: 'Food waste HTL at demo scale' },
    'htl-algae': { min: 4, max: 6, typical: 5, description: 'Algae HTL, pilot stage' },
    'htl-sewage': { min: 6, max: 8, typical: 7, description: 'Sewage sludge HTL, more mature' },
    pyrolysis: { min: 7, max: 9, typical: 8, description: 'Commercial for some feedstocks' },
    gasification: { min: 7, max: 9, typical: 8, description: 'Commercial for biomass' },
    'thermal-cracking': { min: 8, max: 9, typical: 9, description: 'Mature refinery technology' },
    'biocrude-upgrading': { min: 6, max: 8, typical: 7, description: 'Hydrotreatment for biocrude' },
    generic: { min: 5, max: 7, typical: 6, description: 'Default for waste-to-fuel' },
  },
  general: {
    generic: { min: 5, max: 8, typical: 6, description: 'Default for unknown technology' },
  },
}

/**
 * Get TRL benchmark for a specific domain and technology type
 */
export function getTRLBenchmark(
  domainId: string,
  technologyType?: string
): TRLBenchmark | null {
  const normalizedDomain = domainId.toLowerCase().replace(/[^a-z-]/g, '')
  const normalizedTech = (technologyType || 'generic').toLowerCase().replace(/[^a-z-]/g, '')

  // Try exact domain match
  const domainBenchmarks = TRL_BENCHMARKS[normalizedDomain]
  if (domainBenchmarks) {
    // Try exact tech match
    if (domainBenchmarks[normalizedTech]) {
      return domainBenchmarks[normalizedTech]
    }
    // Try partial tech match
    for (const [key, benchmark] of Object.entries(domainBenchmarks)) {
      if (normalizedTech.includes(key) || key.includes(normalizedTech)) {
        return benchmark
      }
    }
    // Return generic for domain
    return domainBenchmarks.generic || null
  }

  // Fallback to general
  return TRL_BENCHMARKS.general?.generic || null
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get benchmarks for a specific domain, with fallback to general
 */
export function getBenchmarksForDomain(domainId: string): DomainBenchmarks {
  // Normalize domain ID
  const normalized = domainId.toLowerCase().replace(/[^a-z-]/g, '')

  // Direct match
  if (DOMAIN_BENCHMARKS[normalized]) {
    return DOMAIN_BENCHMARKS[normalized]
  }

  // Alias matching
  const aliases: Record<string, string> = {
    'electrolyzer': 'hydrogen',
    'electrolysis': 'hydrogen',
    'pem': 'hydrogen',
    'battery': 'energy-storage',
    'batteries': 'energy-storage',
    'storage': 'energy-storage',
    'dac': 'industrial',
    'ccs': 'industrial',
    'carbon': 'industrial',
    'solar': 'clean-energy',
    'wind': 'clean-energy',
    'pv': 'clean-energy',
    'ev': 'transportation',
    'vehicle': 'transportation',
    'htl': 'waste-to-fuel',
    'hydrothermal': 'waste-to-fuel',
    'pyrolysis': 'waste-to-fuel',
    'gasification': 'waste-to-fuel',
    'biocrude': 'waste-to-fuel',
    'biofuel': 'waste-to-fuel',
    'waste': 'waste-to-fuel',
    'msw': 'waste-to-fuel',
  }

  for (const [alias, domain] of Object.entries(aliases)) {
    if (normalized.includes(alias)) {
      return DOMAIN_BENCHMARKS[domain]
    }
  }

  return DOMAIN_BENCHMARKS['general']
}

/**
 * Get a specific benchmark range
 */
export function getBenchmarkRange(
  domainId: string,
  metricName: string
): BenchmarkRange | null {
  const benchmarks = getBenchmarksForDomain(domainId)

  // Check primary fields
  const primaryFields: Record<string, keyof DomainBenchmarks> = {
    capex: 'capex',
    opex: 'opexFixed',
    primaryCost: 'primaryCost',
    efficiency: 'efficiency',
    lifetime: 'lifetime',
    lcoh: 'primaryCost',
    lcoe: 'primaryCost',
    lcos: 'primaryCost',
    lcoc: 'primaryCost',
    lcof: 'primaryCost',
  }

  const normalizedMetric = metricName.toLowerCase().replace(/[^a-z]/g, '')

  for (const [key, field] of Object.entries(primaryFields)) {
    if (normalizedMetric.includes(key)) {
      const value = benchmarks[field]
      if (value && typeof value === 'object' && 'min' in value) {
        return value as BenchmarkRange
      }
    }
  }

  // Check secondary fields
  if (benchmarks.secondary) {
    for (const [key, range] of Object.entries(benchmarks.secondary)) {
      if (normalizedMetric.includes(key.toLowerCase())) {
        return range
      }
    }
  }

  return null
}

/**
 * Validate a value against benchmark range
 */
export function validateAgainstBenchmark(
  value: number,
  benchmarkRange: BenchmarkRange,
  tolerance: number = 2.0 // Allow 2x the range by default
): {
  valid: boolean
  deviation: number
  correctedValue: number | null
  message: string
} {
  const { min, max, median } = benchmarkRange

  // Check if within tolerance range
  const toleranceMin = min / tolerance
  const toleranceMax = max * tolerance

  if (value >= toleranceMin && value <= toleranceMax) {
    return {
      valid: true,
      deviation: 0,
      correctedValue: null,
      message: 'Value within acceptable range',
    }
  }

  // Calculate deviation
  let deviation: number
  if (value < toleranceMin) {
    deviation = ((toleranceMin - value) / toleranceMin) * -100
  } else {
    deviation = ((value - toleranceMax) / toleranceMax) * 100
  }

  return {
    valid: false,
    deviation,
    correctedValue: median, // Suggest using median as correction
    message: `Value ${value} outside range [${toleranceMin.toFixed(1)}, ${toleranceMax.toFixed(1)}] (benchmark: ${min}-${max})`,
  }
}

/**
 * Format benchmarks as a string for AI prompts
 */
export function formatBenchmarksForPrompt(domainId: string): string {
  const benchmarks = getBenchmarksForDomain(domainId)

  let prompt = `INDUSTRY BENCHMARKS (use these to constrain your estimates):\n\n`

  prompt += `CAPEX: ${benchmarks.capex.min}-${benchmarks.capex.max} ${benchmarks.capex.unit} (median: ${benchmarks.capex.median})\n`
  prompt += `  Source: ${benchmarks.capex.source} (${benchmarks.capex.year})\n\n`

  prompt += `OPEX: ${benchmarks.opexFixed.min}-${benchmarks.opexFixed.max} ${benchmarks.opexFixed.unit} (median: ${benchmarks.opexFixed.median})\n`
  prompt += `  Source: ${benchmarks.opexFixed.source} (${benchmarks.opexFixed.year})\n\n`

  prompt += `PRIMARY COST METRIC: ${benchmarks.primaryCost.min}-${benchmarks.primaryCost.max} ${benchmarks.primaryCost.unit} (median: ${benchmarks.primaryCost.median})\n`
  prompt += `  Source: ${benchmarks.primaryCost.source} (${benchmarks.primaryCost.year})\n\n`

  prompt += `EFFICIENCY: ${benchmarks.efficiency.min}-${benchmarks.efficiency.max}${benchmarks.efficiency.unit} (median: ${benchmarks.efficiency.median}%)\n`
  prompt += `  Source: ${benchmarks.efficiency.source} (${benchmarks.efficiency.year})\n\n`

  prompt += `LIFETIME: ${benchmarks.lifetime.min}-${benchmarks.lifetime.max} ${benchmarks.lifetime.unit} (median: ${benchmarks.lifetime.median})\n`
  prompt += `  Source: ${benchmarks.lifetime.source} (${benchmarks.lifetime.year})\n\n`

  if (benchmarks.secondary && Object.keys(benchmarks.secondary).length > 0) {
    prompt += `ADDITIONAL BENCHMARKS:\n`
    for (const [name, range] of Object.entries(benchmarks.secondary)) {
      prompt += `- ${name}: ${range.min}-${range.max} ${range.unit} (median: ${range.median})\n`
    }
    prompt += `\n`
  }

  prompt += `IMPORTANT: Your estimates should fall within or near these benchmark ranges. If your calculated values are significantly outside these ranges, verify your assumptions.\n`

  return prompt
}
