/**
 * Benchmark Preloader
 *
 * Pre-loads industry benchmark data at server startup to avoid
 * repeated API calls during validation. Data is cached in memory
 * and refreshed periodically.
 *
 * Sources:
 * - NREL ATB (Annual Technology Baseline)
 * - IEA Hydrogen Report
 * - IRENA Renewable Statistics
 * - DOE Hydrogen Shot targets
 * - BloombergNEF (if available)
 */

// ============================================================================
// Types
// ============================================================================

export interface BenchmarkRange {
  min: number
  max: number
  median?: number
  unit: string
  source: string
  year?: number
}

export interface TechnologyBenchmarks {
  efficiency?: BenchmarkRange
  cost?: BenchmarkRange
  lifetime?: BenchmarkRange
  capacity?: BenchmarkRange
  energyIntensity?: BenchmarkRange
  capex?: BenchmarkRange
  opex?: BenchmarkRange
  lcoe?: BenchmarkRange
  lcoh?: BenchmarkRange
  lcoc?: BenchmarkRange
  cycleLife?: BenchmarkRange
  degradation?: BenchmarkRange
}

export interface DomainBenchmarks {
  technologies: Record<string, TechnologyBenchmarks>
  lastUpdated: string
  source: string
}

// ============================================================================
// Static Benchmark Data (Pre-compiled from authoritative sources)
// ============================================================================

/**
 * Hydrogen domain benchmarks (IEA, IRENA, DOE)
 */
const HYDROGEN_BENCHMARKS: DomainBenchmarks = {
  technologies: {
    'pem-electrolyzer': {
      efficiency: {
        min: 60,
        max: 82,
        median: 70,
        unit: '%',
        source: 'IEA Global Hydrogen Review 2024',
        year: 2024,
      },
      capex: {
        min: 600,
        max: 1400,
        median: 900,
        unit: '$/kW',
        source: 'IRENA Green Hydrogen 2023',
        year: 2023,
      },
      lifetime: {
        min: 40000,
        max: 90000,
        median: 60000,
        unit: 'hours',
        source: 'DOE Hydrogen Program 2024',
        year: 2024,
      },
      energyIntensity: {
        min: 4.0,
        max: 5.5,
        median: 4.8,
        unit: 'kWh/Nm3',
        source: 'IEA 2024',
        year: 2024,
      },
      lcoh: {
        min: 3.5,
        max: 8.0,
        median: 5.0,
        unit: '$/kg',
        source: 'IEA Global Hydrogen Review 2024',
        year: 2024,
      },
    },
    'alkaline-electrolyzer': {
      efficiency: {
        min: 55,
        max: 75,
        median: 65,
        unit: '%',
        source: 'IEA 2024',
        year: 2024,
      },
      capex: {
        min: 400,
        max: 1000,
        median: 600,
        unit: '$/kW',
        source: 'IRENA 2023',
        year: 2023,
      },
      lifetime: {
        min: 60000,
        max: 100000,
        median: 80000,
        unit: 'hours',
        source: 'DOE 2024',
        year: 2024,
      },
    },
    soec: {
      efficiency: {
        min: 75,
        max: 95,
        median: 85,
        unit: '%',
        source: 'DOE Hydrogen Program 2024',
        year: 2024,
      },
      capex: {
        min: 2000,
        max: 5000,
        median: 3000,
        unit: '$/kW',
        source: 'DOE 2024',
        year: 2024,
      },
      lifetime: {
        min: 20000,
        max: 50000,
        median: 30000,
        unit: 'hours',
        source: 'DOE 2024',
        year: 2024,
      },
    },
  },
  lastUpdated: '2024-12-01',
  source: 'IEA, IRENA, DOE Hydrogen Program',
}

/**
 * Energy storage benchmarks (NREL, DOE, BloombergNEF)
 */
const STORAGE_BENCHMARKS: DomainBenchmarks = {
  technologies: {
    'li-ion-battery': {
      efficiency: {
        min: 85,
        max: 95,
        median: 90,
        unit: '%',
        source: 'NREL ATB 2024',
        year: 2024,
      },
      capex: {
        min: 150,
        max: 400,
        median: 250,
        unit: '$/kWh',
        source: 'BloombergNEF 2024',
        year: 2024,
      },
      cycleLife: {
        min: 3000,
        max: 8000,
        median: 5000,
        unit: 'cycles',
        source: 'DOE Vehicle Technologies 2024',
        year: 2024,
      },
      capacity: {
        min: 150,
        max: 280,
        median: 220,
        unit: 'Wh/kg',
        source: 'DOE 2024',
        year: 2024,
      },
    },
    'solid-state-battery': {
      efficiency: {
        min: 88,
        max: 96,
        median: 92,
        unit: '%',
        source: 'DOE Vehicle Technologies 2024',
        year: 2024,
      },
      capacity: {
        min: 300,
        max: 500,
        median: 400,
        unit: 'Wh/kg',
        source: 'DOE Targets',
        year: 2024,
      },
      cycleLife: {
        min: 500,
        max: 1500,
        median: 800,
        unit: 'cycles',
        source: 'Industry data',
        year: 2024,
      },
    },
    'vanadium-flow-battery': {
      efficiency: {
        min: 70,
        max: 82,
        median: 75,
        unit: '%',
        source: 'Sandia GESDB 2024',
        year: 2024,
      },
      capex: {
        min: 300,
        max: 600,
        median: 450,
        unit: '$/kWh',
        source: 'NREL 2024',
        year: 2024,
      },
      cycleLife: {
        min: 10000,
        max: 25000,
        median: 15000,
        unit: 'cycles',
        source: 'Sandia GESDB 2024',
        year: 2024,
      },
      lifetime: {
        min: 20,
        max: 30,
        median: 25,
        unit: 'years',
        source: 'Industry data',
        year: 2024,
      },
    },
  },
  lastUpdated: '2024-12-01',
  source: 'NREL ATB, DOE, BloombergNEF',
}

/**
 * Industrial decarbonization benchmarks (IEA, National Academies)
 */
const INDUSTRIAL_BENCHMARKS: DomainBenchmarks = {
  technologies: {
    dac: {
      energyIntensity: {
        min: 1200,
        max: 2500,
        median: 1800,
        unit: 'kWh/tonne',
        source: 'IEA CCUS 2024',
        year: 2024,
      },
      lcoc: {
        min: 400,
        max: 1000,
        median: 600,
        unit: '$/tonne',
        source: 'National Academies 2023',
        year: 2023,
      },
      capex: {
        min: 1000,
        max: 3000,
        median: 2000,
        unit: '$/tonne-yr',
        source: 'IEA 2024',
        year: 2024,
      },
    },
    ccs: {
      efficiency: {
        min: 85,
        max: 95,
        median: 90,
        unit: '%',
        source: 'IEA CCUS 2024',
        year: 2024,
      },
      lcoc: {
        min: 50,
        max: 120,
        median: 80,
        unit: '$/tonne',
        source: 'IEA 2024',
        year: 2024,
      },
    },
    'green-ammonia': {
      energyIntensity: {
        min: 9.0,
        max: 12.0,
        median: 10.0,
        unit: 'MWh/tonne',
        source: 'IRENA 2024',
        year: 2024,
      },
      cost: {
        min: 600,
        max: 1200,
        median: 800,
        unit: '$/tonne',
        source: 'IRENA 2024',
        year: 2024,
      },
    },
  },
  lastUpdated: '2024-12-01',
  source: 'IEA CCUS, National Academies, IRENA',
}

/**
 * Clean energy generation benchmarks (NREL, IEA)
 */
const CLEAN_ENERGY_BENCHMARKS: DomainBenchmarks = {
  technologies: {
    'solar-pv': {
      efficiency: {
        min: 18,
        max: 24,
        median: 21,
        unit: '%',
        source: 'NREL Best Research Cell',
        year: 2024,
      },
      capex: {
        min: 800,
        max: 1500,
        median: 1000,
        unit: '$/kW',
        source: 'NREL ATB 2024',
        year: 2024,
      },
      lcoe: {
        min: 25,
        max: 50,
        median: 35,
        unit: '$/MWh',
        source: 'NREL ATB 2024',
        year: 2024,
      },
    },
    csp: {
      efficiency: {
        min: 15,
        max: 25,
        median: 18,
        unit: '%',
        source: 'NREL 2024',
        year: 2024,
      },
      capex: {
        min: 4000,
        max: 8000,
        median: 5500,
        unit: '$/kW',
        source: 'NREL ATB 2024',
        year: 2024,
      },
      lcoe: {
        min: 80,
        max: 150,
        median: 100,
        unit: '$/MWh',
        source: 'NREL ATB 2024',
        year: 2024,
      },
    },
    'wind-turbine': {
      efficiency: {
        min: 35,
        max: 50,
        median: 45,
        unit: '%',
        source: 'NREL 2024',
        year: 2024,
      },
      capex: {
        min: 1200,
        max: 2000,
        median: 1500,
        unit: '$/kW',
        source: 'NREL ATB 2024',
        year: 2024,
      },
      lcoe: {
        min: 25,
        max: 55,
        median: 35,
        unit: '$/MWh',
        source: 'NREL ATB 2024',
        year: 2024,
      },
    },
    smr: {
      efficiency: {
        min: 30,
        max: 35,
        median: 32,
        unit: '%',
        source: 'DOE Nuclear 2024',
        year: 2024,
      },
      capex: {
        min: 5000,
        max: 8000,
        median: 6000,
        unit: '$/kW',
        source: 'DOE 2024',
        year: 2024,
      },
      lcoe: {
        min: 50,
        max: 100,
        median: 70,
        unit: '$/MWh',
        source: 'DOE estimates',
        year: 2024,
      },
    },
  },
  lastUpdated: '2024-12-01',
  source: 'NREL ATB, IEA WEO, DOE',
}

// ============================================================================
// Domain Mapping
// ============================================================================

const DOMAIN_DATA: Record<string, DomainBenchmarks> = {
  hydrogen: HYDROGEN_BENCHMARKS,
  'energy-storage': STORAGE_BENCHMARKS,
  storage: STORAGE_BENCHMARKS,
  industrial: INDUSTRIAL_BENCHMARKS,
  'clean-energy': CLEAN_ENERGY_BENCHMARKS,
  solar: CLEAN_ENERGY_BENCHMARKS,
  wind: CLEAN_ENERGY_BENCHMARKS,
  nuclear: CLEAN_ENERGY_BENCHMARKS,
}

const TECHNOLOGY_ALIASES: Record<string, string> = {
  'pem electrolysis': 'pem-electrolyzer',
  'pem electrolyzer': 'pem-electrolyzer',
  electrolyzer: 'pem-electrolyzer',
  'solid oxide electrolyzer': 'soec',
  'alkaline electrolysis': 'alkaline-electrolyzer',
  battery: 'li-ion-battery',
  'lithium ion': 'li-ion-battery',
  'lithium-ion': 'li-ion-battery',
  'solid state battery': 'solid-state-battery',
  'solid-state': 'solid-state-battery',
  'flow battery': 'vanadium-flow-battery',
  vrfb: 'vanadium-flow-battery',
  'direct air capture': 'dac',
  'carbon capture': 'ccs',
  ammonia: 'green-ammonia',
  solar: 'solar-pv',
  photovoltaic: 'solar-pv',
  'concentrated solar': 'csp',
  wind: 'wind-turbine',
  'small modular reactor': 'smr',
  nuclear: 'smr',
}

// ============================================================================
// Preloader Class
// ============================================================================

export class PreloadedBenchmarks {
  private static instance: PreloadedBenchmarks
  private data: Map<string, DomainBenchmarks> = new Map()
  private initialized = false

  private constructor() {}

  static getInstance(): PreloadedBenchmarks {
    if (!PreloadedBenchmarks.instance) {
      PreloadedBenchmarks.instance = new PreloadedBenchmarks()
    }
    return PreloadedBenchmarks.instance
  }

  /**
   * Initialize benchmark data (call once at startup)
   */
  async initialize(): Promise<void> {
    if (this.initialized) return

    console.time('[Preload] Benchmarks')

    // In production, this would fetch from APIs in parallel
    // For now, load static data synchronously (already fast)
    await this.loadStaticBenchmarks()

    // TODO: In future, fetch live data from APIs
    // await Promise.all([
    //   this.fetchNRELATB(),
    //   this.fetchIEAData(),
    //   this.fetchIRENAStats(),
    //   this.fetchDOETargets(),
    // ])

    this.initialized = true
    console.timeEnd('[Preload] Benchmarks')
  }

  /**
   * Load static benchmark data
   */
  private async loadStaticBenchmarks(): Promise<void> {
    for (const [domain, benchmarks] of Object.entries(DOMAIN_DATA)) {
      this.data.set(domain, benchmarks)
    }
  }

  /**
   * Get benchmark for a specific technology and metric
   */
  getBenchmark(
    domain: string,
    technology: string,
    metricType: string
  ): BenchmarkRange | null {
    // Normalize inputs
    const normalizedDomain = domain.toLowerCase().replace(/[^a-z-]/g, '')
    let normalizedTech = technology.toLowerCase().replace(/[^a-z0-9-\s]/g, '')

    // Apply technology aliases
    if (TECHNOLOGY_ALIASES[normalizedTech]) {
      normalizedTech = TECHNOLOGY_ALIASES[normalizedTech]
    }

    // Find domain data
    const domainData = this.data.get(normalizedDomain)
    if (!domainData) {
      // Try alternative domain mappings
      for (const [key, data] of this.data.entries()) {
        if (
          normalizedDomain.includes(key) ||
          key.includes(normalizedDomain)
        ) {
          return this.findBenchmarkInDomain(data, normalizedTech, metricType)
        }
      }
      return null
    }

    return this.findBenchmarkInDomain(domainData, normalizedTech, metricType)
  }

  /**
   * Find benchmark within a domain
   */
  private findBenchmarkInDomain(
    domainData: DomainBenchmarks,
    technology: string,
    metricType: string
  ): BenchmarkRange | null {
    // Direct match
    const techData = domainData.technologies[technology]
    if (techData) {
      const benchmark = techData[metricType as keyof TechnologyBenchmarks]
      if (benchmark) return benchmark
    }

    // Partial match
    for (const [techKey, techBenchmarks] of Object.entries(
      domainData.technologies
    )) {
      if (technology.includes(techKey) || techKey.includes(technology)) {
        const benchmark = techBenchmarks[metricType as keyof TechnologyBenchmarks]
        if (benchmark) return benchmark
      }
    }

    return null
  }

  /**
   * Get all benchmarks for a technology
   */
  getTechnologyBenchmarks(
    domain: string,
    technology: string
  ): TechnologyBenchmarks | null {
    const normalizedDomain = domain.toLowerCase().replace(/[^a-z-]/g, '')
    let normalizedTech = technology.toLowerCase().replace(/[^a-z0-9-\s]/g, '')

    if (TECHNOLOGY_ALIASES[normalizedTech]) {
      normalizedTech = TECHNOLOGY_ALIASES[normalizedTech]
    }

    const domainData = this.data.get(normalizedDomain)
    if (!domainData) return null

    return domainData.technologies[normalizedTech] || null
  }

  /**
   * Get available domains
   */
  getAvailableDomains(): string[] {
    return Array.from(this.data.keys())
  }

  /**
   * Get available technologies for a domain
   */
  getAvailableTechnologies(domain: string): string[] {
    const domainData = this.data.get(domain.toLowerCase())
    if (!domainData) return []
    return Object.keys(domainData.technologies)
  }

  /**
   * Check if benchmarks are loaded
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get benchmark range formatted for display
 */
export function formatBenchmarkRange(benchmark: BenchmarkRange): string {
  if (benchmark.median) {
    return `${benchmark.min}-${benchmark.max} (median: ${benchmark.median}) ${benchmark.unit}`
  }
  return `${benchmark.min}-${benchmark.max} ${benchmark.unit}`
}

/**
 * Check if value is within benchmark range
 */
export function isWithinBenchmark(
  value: number,
  benchmark: BenchmarkRange
): boolean {
  return value >= benchmark.min && value <= benchmark.max
}

/**
 * Calculate percentile within benchmark range
 */
export function calculatePercentile(
  value: number,
  benchmark: BenchmarkRange
): number {
  if (value < benchmark.min) return 0
  if (value > benchmark.max) return 100
  return ((value - benchmark.min) / (benchmark.max - benchmark.min)) * 100
}
