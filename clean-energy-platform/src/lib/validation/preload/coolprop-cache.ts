/**
 * CoolProp Property Cache
 *
 * Pre-generates and caches thermodynamic property tables for common fluids
 * to avoid repeated API calls to the CoolProp service. Uses bilinear
 * interpolation for fast property lookups.
 *
 * Cached properties:
 * - Density (D) - kg/m³
 * - Enthalpy (H) - J/kg
 * - Entropy (S) - J/(kg·K)
 * - Specific Heat (C) - J/(kg·K)
 * - Viscosity (V) - Pa·s
 */

// ============================================================================
// Types
// ============================================================================

export interface FluidProperties {
  density: number // kg/m³
  enthalpy: number // J/kg
  entropy: number // J/(kg·K)
  specificHeat?: number // J/(kg·K)
  viscosity?: number // Pa·s
}

export interface PropertyTable {
  fluid: string
  temperatures: number[] // K
  pressures: number[] // Pa
  density: number[][] // [T_index][P_index]
  enthalpy: number[][] // [T_index][P_index]
  entropy: number[][] // [T_index][P_index]
  specificHeat?: number[][]
  viscosity?: number[][]
  generatedAt: string
}

export interface PropertyRange {
  T_min: number
  T_max: number
  T_steps: number
  P_min: number
  P_max: number
  P_steps: number
}

// ============================================================================
// Pre-computed Property Tables (Static Data)
// ============================================================================

/**
 * Default property ranges for common fluids
 */
const FLUID_RANGES: Record<string, PropertyRange> = {
  Hydrogen: {
    T_min: 250, // K
    T_max: 450, // K
    T_steps: 41,
    P_min: 1e5, // Pa (1 bar)
    P_max: 1e7, // Pa (100 bar)
    P_steps: 25,
  },
  Water: {
    T_min: 280,
    T_max: 650,
    T_steps: 75,
    P_min: 1e5,
    P_max: 5e7, // 500 bar
    P_steps: 50,
  },
  Oxygen: {
    T_min: 250,
    T_max: 450,
    T_steps: 41,
    P_min: 1e5,
    P_max: 1e7,
    P_steps: 25,
  },
  Nitrogen: {
    T_min: 250,
    T_max: 450,
    T_steps: 41,
    P_min: 1e5,
    P_max: 1e7,
    P_steps: 25,
  },
  CO2: {
    T_min: 250,
    T_max: 600,
    T_steps: 71,
    P_min: 1e5,
    P_max: 2e7, // Supercritical
    P_steps: 40,
  },
  Methane: {
    T_min: 150,
    T_max: 450,
    T_steps: 61,
    P_min: 1e5,
    P_max: 1e7,
    P_steps: 25,
  },
  Ammonia: {
    T_min: 250,
    T_max: 500,
    T_steps: 51,
    P_min: 1e5,
    P_max: 5e7,
    P_steps: 30,
  },
}

/**
 * Simplified property correlations for when full tables aren't available
 * These are engineering approximations, not exact CoolProp data
 */
const SIMPLIFIED_CORRELATIONS: Record<
  string,
  {
    density: (T: number, P: number) => number
    enthalpy: (T: number, P: number) => number
    entropy: (T: number, P: number) => number
  }
> = {
  Hydrogen: {
    // Ideal gas approximation for hydrogen
    density: (T: number, P: number) => {
      const R = 4124 // J/(kg·K) for H2
      return P / (R * T)
    },
    enthalpy: (T: number, _P: number) => {
      const cp = 14300 // J/(kg·K) approximate for H2
      return cp * (T - 298.15)
    },
    entropy: (T: number, P: number) => {
      const cp = 14300
      const R = 4124
      const T0 = 298.15
      const P0 = 101325
      return cp * Math.log(T / T0) - R * Math.log(P / P0)
    },
  },
  Water: {
    // Simplified water/steam properties
    density: (T: number, P: number) => {
      if (T < 373.15) {
        // Liquid water (incompressible approximation)
        return 1000 - 0.1 * (T - 273.15)
      } else {
        // Steam (ideal gas approximation)
        const R = 461.5 // J/(kg·K) for H2O
        return P / (R * T)
      }
    },
    enthalpy: (T: number, _P: number) => {
      if (T < 373.15) {
        return 4186 * (T - 273.15) // Liquid
      } else {
        return 2.5e6 + 2000 * (T - 373.15) // Steam
      }
    },
    entropy: (T: number, P: number) => {
      const cp = T < 373.15 ? 4186 : 2000
      const T0 = 298.15
      return cp * Math.log(T / T0)
    },
  },
  Oxygen: {
    density: (T: number, P: number) => {
      const R = 259.8 // J/(kg·K) for O2
      return P / (R * T)
    },
    enthalpy: (T: number, _P: number) => {
      const cp = 920 // J/(kg·K)
      return cp * (T - 298.15)
    },
    entropy: (T: number, P: number) => {
      const cp = 920
      const R = 259.8
      const T0 = 298.15
      const P0 = 101325
      return cp * Math.log(T / T0) - R * Math.log(P / P0)
    },
  },
  Nitrogen: {
    density: (T: number, P: number) => {
      const R = 296.8 // J/(kg·K) for N2
      return P / (R * T)
    },
    enthalpy: (T: number, _P: number) => {
      const cp = 1040 // J/(kg·K)
      return cp * (T - 298.15)
    },
    entropy: (T: number, P: number) => {
      const cp = 1040
      const R = 296.8
      const T0 = 298.15
      const P0 = 101325
      return cp * Math.log(T / T0) - R * Math.log(P / P0)
    },
  },
  CO2: {
    density: (T: number, P: number) => {
      const R = 188.9 // J/(kg·K) for CO2
      // Simplified compressibility correction for high pressure
      const Z = T > 304 && P > 7.4e6 ? 0.8 : 1.0 // Supercritical
      return P / (Z * R * T)
    },
    enthalpy: (T: number, _P: number) => {
      const cp = 840 // J/(kg·K) at low pressure
      return cp * (T - 298.15)
    },
    entropy: (T: number, P: number) => {
      const cp = 840
      const R = 188.9
      const T0 = 298.15
      const P0 = 101325
      return cp * Math.log(T / T0) - R * Math.log(P / P0)
    },
  },
  Ammonia: {
    density: (T: number, P: number) => {
      if (T < 240) {
        return 681 // Liquid ammonia at -33°C
      }
      const R = 488.2 // J/(kg·K) for NH3
      return P / (R * T)
    },
    enthalpy: (T: number, _P: number) => {
      const cp = 2060 // J/(kg·K) for gas
      if (T < 240) {
        return 4600 * (T - 200) // Liquid
      }
      return 1.37e6 + cp * (T - 240) // Gas with latent heat
    },
    entropy: (T: number, P: number) => {
      const cp = 2060
      const R = 488.2
      const T0 = 298.15
      const P0 = 101325
      return cp * Math.log(T / T0) - R * Math.log(P / P0)
    },
  },
}

// ============================================================================
// CoolProp Cache Class
// ============================================================================

export class CoolPropCache {
  private static instance: CoolPropCache
  private tables: Map<string, PropertyTable> = new Map()
  private initialized = false
  private useSimplified = true // Use simplified correlations by default

  private constructor() {}

  static getInstance(): CoolPropCache {
    if (!CoolPropCache.instance) {
      CoolPropCache.instance = new CoolPropCache()
    }
    return CoolPropCache.instance
  }

  /**
   * Pre-load property tables for common fluids
   */
  async preloadCommonFluids(): Promise<void> {
    if (this.initialized) return

    console.time('[Preload] CoolProp tables')

    const fluids = Object.keys(FLUID_RANGES)

    // In production, this would call Modal to generate full tables
    // For now, we use simplified correlations
    // TODO: Implement Modal integration for accurate CoolProp data
    // const tables = await Promise.all(
    //   fluids.map(fluid => this.generatePropertyTable(fluid))
    // )

    // Mark as initialized (using simplified correlations)
    this.initialized = true
    this.useSimplified = true

    console.timeEnd('[Preload] CoolProp tables')
    console.log(
      `[CoolProp] Loaded simplified correlations for ${fluids.length} fluids`
    )
  }

  /**
   * Generate property table for a fluid (would call Modal in production)
   */
  private async generatePropertyTable(fluid: string): Promise<PropertyTable> {
    const range = FLUID_RANGES[fluid]
    if (!range) {
      throw new Error(`No range defined for fluid: ${fluid}`)
    }

    // Generate temperature and pressure arrays
    const temperatures: number[] = []
    const pressures: number[] = []

    for (let i = 0; i < range.T_steps; i++) {
      temperatures.push(
        range.T_min + (i * (range.T_max - range.T_min)) / (range.T_steps - 1)
      )
    }

    for (let i = 0; i < range.P_steps; i++) {
      pressures.push(
        range.P_min + (i * (range.P_max - range.P_min)) / (range.P_steps - 1)
      )
    }

    // Initialize 2D arrays
    const density: number[][] = []
    const enthalpy: number[][] = []
    const entropy: number[][] = []

    // TODO: In production, call Modal with CoolProp
    // For now, use simplified correlations
    const correlations = SIMPLIFIED_CORRELATIONS[fluid]
    if (!correlations) {
      throw new Error(`No correlations for fluid: ${fluid}`)
    }

    for (let ti = 0; ti < temperatures.length; ti++) {
      const T = temperatures[ti]
      density[ti] = []
      enthalpy[ti] = []
      entropy[ti] = []

      for (let pi = 0; pi < pressures.length; pi++) {
        const P = pressures[pi]
        density[ti][pi] = correlations.density(T, P)
        enthalpy[ti][pi] = correlations.enthalpy(T, P)
        entropy[ti][pi] = correlations.entropy(T, P)
      }
    }

    return {
      fluid,
      temperatures,
      pressures,
      density,
      enthalpy,
      entropy,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Get fluid properties at given T and P
   */
  getProperties(fluid: string, T: number, P: number): FluidProperties {
    // Use simplified correlations if available
    if (this.useSimplified) {
      const correlations = SIMPLIFIED_CORRELATIONS[fluid]
      if (correlations) {
        return {
          density: correlations.density(T, P),
          enthalpy: correlations.enthalpy(T, P),
          entropy: correlations.entropy(T, P),
        }
      }
    }

    // Use cached table with interpolation
    const table = this.tables.get(fluid)
    if (table) {
      return {
        density: this.interpolate(table, T, P, 'density'),
        enthalpy: this.interpolate(table, T, P, 'enthalpy'),
        entropy: this.interpolate(table, T, P, 'entropy'),
      }
    }

    // Fall back to ideal gas
    console.warn(`[CoolProp] No data for ${fluid}, using ideal gas approximation`)
    return this.idealGasApproximation(fluid, T, P)
  }

  /**
   * Get single property
   */
  getProperty(
    fluid: string,
    T: number,
    P: number,
    prop: 'density' | 'enthalpy' | 'entropy'
  ): number {
    const props = this.getProperties(fluid, T, P)
    return props[prop]
  }

  /**
   * Bilinear interpolation from table
   */
  private interpolate(
    table: PropertyTable,
    T: number,
    P: number,
    property: 'density' | 'enthalpy' | 'entropy'
  ): number {
    const { temperatures, pressures } = table
    const data = table[property] as number[][]

    // Find bounding indices
    let ti = 0
    while (ti < temperatures.length - 1 && temperatures[ti + 1] < T) ti++

    let pi = 0
    while (pi < pressures.length - 1 && pressures[pi + 1] < P) pi++

    // Handle edge cases
    if (ti >= temperatures.length - 1) ti = temperatures.length - 2
    if (pi >= pressures.length - 1) pi = pressures.length - 2
    if (ti < 0) ti = 0
    if (pi < 0) pi = 0

    // Get corner values
    const T1 = temperatures[ti]
    const T2 = temperatures[ti + 1]
    const P1 = pressures[pi]
    const P2 = pressures[pi + 1]

    const Q11 = data[ti][pi]
    const Q12 = data[ti][pi + 1]
    const Q21 = data[ti + 1][pi]
    const Q22 = data[ti + 1][pi + 1]

    // Bilinear interpolation
    const dT = T2 - T1
    const dP = P2 - P1

    if (dT === 0 || dP === 0) {
      return Q11 // Degenerate case
    }

    const tFrac = (T - T1) / dT
    const pFrac = (P - P1) / dP

    return (
      Q11 * (1 - tFrac) * (1 - pFrac) +
      Q21 * tFrac * (1 - pFrac) +
      Q12 * (1 - tFrac) * pFrac +
      Q22 * tFrac * pFrac
    )
  }

  /**
   * Ideal gas approximation for unknown fluids
   */
  private idealGasApproximation(
    fluid: string,
    T: number,
    P: number
  ): FluidProperties {
    // Estimate molar mass from fluid name
    const molarMasses: Record<string, number> = {
      Hydrogen: 2.016,
      Water: 18.015,
      Oxygen: 32.0,
      Nitrogen: 28.0,
      CO2: 44.01,
      Methane: 16.04,
      Ammonia: 17.03,
    }

    const M = molarMasses[fluid] || 28.97 // Default to air
    const R = 8314.46 / M // Specific gas constant J/(kg·K)

    return {
      density: P / (R * T),
      enthalpy: (7 / 2) * R * (T - 298.15), // Diatomic ideal gas
      entropy: (7 / 2) * R * Math.log(T / 298.15) - R * Math.log(P / 101325),
    }
  }

  /**
   * Check if fluid is cached
   */
  has(fluid: string): boolean {
    return (
      this.tables.has(fluid) || SIMPLIFIED_CORRELATIONS[fluid] !== undefined
    )
  }

  /**
   * Get list of available fluids
   */
  getAvailableFluids(): string[] {
    const cached = Array.from(this.tables.keys())
    const simplified = Object.keys(SIMPLIFIED_CORRELATIONS)
    return [...new Set([...cached, ...simplified])]
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get hydrogen density at given conditions
 */
export function getHydrogenDensity(T: number, P: number): number {
  return CoolPropCache.getInstance().getProperty('Hydrogen', T, P, 'density')
}

/**
 * Get water/steam properties
 */
export function getWaterProperties(T: number, P: number): FluidProperties {
  return CoolPropCache.getInstance().getProperties('Water', T, P)
}

/**
 * Calculate electrolyzer hydrogen production rate
 * @param power_kW Electrical power input (kW)
 * @param efficiency System efficiency (0-1)
 * @param T_K Temperature (K)
 * @param P_Pa Pressure (Pa)
 * @returns Hydrogen mass flow rate (kg/hr)
 */
export function calculateH2ProductionRate(
  power_kW: number,
  efficiency: number,
  T_K: number = 353.15, // 80°C default
  P_Pa: number = 3e6 // 30 bar default
): number {
  const H2_HHV = 39.4 // kWh/kg

  // Mass flow rate from energy balance
  const massFlowRate = (power_kW * efficiency) / H2_HHV // kg/hr

  // Get density for volumetric flow
  const density = getHydrogenDensity(T_K, P_Pa)

  return massFlowRate
}

/**
 * Calculate required power for hydrogen production
 * @param targetFlow_kghr Target hydrogen flow (kg/hr)
 * @param efficiency System efficiency (0-1)
 * @returns Required electrical power (kW)
 */
export function calculateRequiredPower(
  targetFlow_kghr: number,
  efficiency: number
): number {
  const H2_HHV = 39.4 // kWh/kg
  return (targetFlow_kghr * H2_HHV) / efficiency
}
