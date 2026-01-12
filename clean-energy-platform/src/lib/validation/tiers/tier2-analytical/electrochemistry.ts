/**
 * Tier 2 Analytical Electrochemistry Calculations
 *
 * Butler-Volmer kinetics, Nernst equation, and electrolyzer/fuel cell models.
 */

// ============================================================================
// Physical Constants
// ============================================================================

export const FARADAY = 96485.33212 // C/mol
export const GAS_CONSTANT = 8.314462618 // J/(mol·K)
export const PLANCK = 6.62607015e-34 // J·s
export const AVOGADRO = 6.02214076e23 // mol^-1
export const BOLTZMANN = 1.380649e-23 // J/K
export const STANDARD_TEMP = 298.15 // K
export const STANDARD_PRESSURE = 101325 // Pa

// ============================================================================
// Types
// ============================================================================

export interface ElectrochemicalResult {
  value: number
  unit: string
  components: Record<string, number>
  assumptions: string[]
  uncertainty: number
}

export interface OverpotentialBreakdown {
  activation: number
  ohmic: number
  concentration: number
  total: number
}

export interface ElectrolyzerPerformance {
  voltage: number // V
  currentDensity: number // A/cm2
  efficiency: number // 0-1
  hydrogenProduction: number // kg/h per m2
  heatGeneration: number // W/m2
  overpotentials: OverpotentialBreakdown
}

export interface FuelCellPerformance {
  voltage: number // V
  currentDensity: number // A/cm2
  powerDensity: number // W/cm2
  efficiency: number // 0-1
  waterProduction: number // kg/h per m2
  overpotentials: OverpotentialBreakdown
}

// ============================================================================
// Fundamental Equations
// ============================================================================

/**
 * Nernst equation for equilibrium potential
 * @param E0 Standard electrode potential (V)
 * @param n Number of electrons transferred
 * @param Q Reaction quotient
 * @param T Temperature (K)
 * @returns Equilibrium potential (V)
 */
export function nernstEquation(
  E0: number,
  n: number,
  Q: number,
  T: number = STANDARD_TEMP
): number {
  const RT_nF = (GAS_CONSTANT * T) / (n * FARADAY)
  return E0 - RT_nF * Math.log(Q)
}

/**
 * Butler-Volmer equation for electrode kinetics
 * @param j0 Exchange current density (A/cm2)
 * @param eta Overpotential (V)
 * @param alpha Charge transfer coefficient (typically 0.5)
 * @param n Number of electrons
 * @param T Temperature (K)
 * @returns Current density (A/cm2)
 */
export function butlerVolmer(
  j0: number,
  eta: number,
  alpha: number = 0.5,
  n: number = 2,
  T: number = STANDARD_TEMP
): number {
  const f = FARADAY / (GAS_CONSTANT * T)
  const anodicTerm = Math.exp(alpha * n * f * eta)
  const cathodicTerm = Math.exp(-(1 - alpha) * n * f * eta)
  return j0 * (anodicTerm - cathodicTerm)
}

/**
 * Inverse Butler-Volmer: calculate overpotential from current density
 * Uses Tafel approximation for high overpotentials
 * @param j Current density (A/cm2)
 * @param j0 Exchange current density (A/cm2)
 * @param alpha Charge transfer coefficient
 * @param n Number of electrons
 * @param T Temperature (K)
 * @returns Overpotential (V)
 */
export function butlerVolmerInverse(
  j: number,
  j0: number,
  alpha: number = 0.5,
  n: number = 2,
  T: number = STANDARD_TEMP
): number {
  if (Math.abs(j) < j0 * 0.1) {
    // Linear approximation for small currents
    const f = FARADAY / (GAS_CONSTANT * T)
    return j / (j0 * n * f)
  }
  // Tafel equation for higher currents
  const tafelSlope = (GAS_CONSTANT * T) / (alpha * n * FARADAY)
  return tafelSlope * Math.log(Math.abs(j) / j0) * Math.sign(j)
}

/**
 * Tafel equation (simplified Butler-Volmer for high overpotentials)
 * @param j Current density (A/cm2)
 * @param j0 Exchange current density (A/cm2)
 * @param b Tafel slope (V/decade)
 * @returns Overpotential (V)
 */
export function tafelEquation(j: number, j0: number, b: number): number {
  return b * Math.log10(j / j0)
}

/**
 * Ohmic resistance overpotential
 * @param j Current density (A/cm2)
 * @param R Area-specific resistance (Ohm·cm2)
 * @returns Ohmic overpotential (V)
 */
export function ohmicOverpotential(j: number, R: number): number {
  return j * R
}

/**
 * Concentration overpotential (mass transport limitation)
 * @param j Current density (A/cm2)
 * @param jL Limiting current density (A/cm2)
 * @param n Number of electrons
 * @param T Temperature (K)
 * @returns Concentration overpotential (V)
 */
export function concentrationOverpotential(
  j: number,
  jL: number,
  n: number = 2,
  T: number = STANDARD_TEMP
): number {
  if (j >= jL) {
    return Infinity // Mass transport limited
  }
  const RT_nF = (GAS_CONSTANT * T) / (n * FARADAY)
  return RT_nF * Math.log(jL / (jL - j))
}

// ============================================================================
// Electrolyzer Models
// ============================================================================

/**
 * Reversible (thermodynamic) voltage for water electrolysis
 * @param T Temperature (K)
 * @param p Pressure (Pa)
 * @returns Reversible voltage (V)
 */
export function electrolyzerReversibleVoltage(
  T: number = STANDARD_TEMP,
  p: number = STANDARD_PRESSURE
): number {
  // Standard potential at 25°C
  const E0 = 1.229

  // Temperature dependence (simplified)
  const dE_dT = -0.00085 // V/K
  const tempCorrection = dE_dT * (T - STANDARD_TEMP)

  // Pressure dependence (Nernst)
  const pressureRatio = p / STANDARD_PRESSURE
  const pressureCorrection =
    ((GAS_CONSTANT * T) / (2 * FARADAY)) * Math.log(pressureRatio)

  return E0 + tempCorrection + pressureCorrection
}

/**
 * Thermoneutral voltage (enthalpy-based)
 * @param T Temperature (K)
 * @returns Thermoneutral voltage (V)
 */
export function electrolyzerThermoneutralVoltage(
  T: number = STANDARD_TEMP
): number {
  // Based on enthalpy of water splitting
  // HHV of H2: 286 kJ/mol -> 1.481 V at standard conditions
  const E_tn_standard = 1.481

  // Slight temperature dependence
  const dE_dT = 0.00003 // V/K
  return E_tn_standard + dE_dT * (T - STANDARD_TEMP)
}

/**
 * PEM Electrolyzer model
 */
export function pemElectrolyzerPerformance(
  currentDensity: number, // A/cm2
  T: number = 353, // K (80°C typical)
  p: number = 3000000, // Pa (30 bar typical)
  membraneThickness: number = 0.018, // cm (Nafion 117)
  catalystLoading: number = 0.5, // mg/cm2 PGM
  options: {
    anodeJ0?: number // Exchange current density anode
    cathodeJ0?: number // Exchange current density cathode
    membraneResistivity?: number // Ohm·cm
  } = {}
): ElectrolyzerPerformance {
  const {
    anodeJ0 = 1e-7, // OER is slow
    cathodeJ0 = 1e-3, // HER is fast
    membraneResistivity = 12, // Ohm·cm for Nafion at 80°C
  } = options

  const E_rev = electrolyzerReversibleVoltage(T, p)
  const E_tn = electrolyzerThermoneutralVoltage(T)

  // Activation overpotentials
  const etaAnode = butlerVolmerInverse(currentDensity, anodeJ0, 0.5, 2, T)
  const etaCathode = butlerVolmerInverse(currentDensity, cathodeJ0, 0.5, 2, T)

  // Ohmic overpotential
  const R_membrane = membraneResistivity * membraneThickness
  const R_contact = 0.01 // Ohm·cm2 typical
  const R_total = R_membrane + R_contact
  const etaOhmic = ohmicOverpotential(currentDensity, R_total)

  // Concentration overpotential (limiting current ~4 A/cm2 for PEM)
  const jL = 4.0
  const etaConc = currentDensity < jL ? concentrationOverpotential(currentDensity, jL, 2, T) : 0.5

  // Total cell voltage
  const totalOverpotential = etaAnode + etaCathode + etaOhmic + etaConc
  const cellVoltage = E_rev + totalOverpotential

  // Efficiency (based on HHV)
  const efficiency = E_tn / cellVoltage

  // Hydrogen production: 1 A = 0.0374 g/h H2 (Faraday's law)
  const faradaicRate = 0.0374e-3 // kg/(A·h)
  const faradaicEfficiency = 0.99 // Nearly 100% for PEM
  const h2Production = currentDensity * 10000 * faradaicRate * faradaicEfficiency // per m2

  // Heat generation
  const heatPerCell = currentDensity * (cellVoltage - E_tn) * 10000 // W/m2

  return {
    voltage: cellVoltage,
    currentDensity,
    efficiency,
    hydrogenProduction: h2Production,
    heatGeneration: heatPerCell,
    overpotentials: {
      activation: etaAnode + etaCathode,
      ohmic: etaOhmic,
      concentration: etaConc,
      total: totalOverpotential,
    },
  }
}

/**
 * Alkaline Electrolyzer model
 */
export function alkalineElectrolyzerPerformance(
  currentDensity: number, // A/cm2
  T: number = 353, // K (80°C typical)
  p: number = 1013250, // Pa (10 bar typical)
  electrodeGap: number = 0.25, // cm
  kohConcentration: number = 30 // wt% KOH
): ElectrolyzerPerformance {
  const E_rev = electrolyzerReversibleVoltage(T, p)
  const E_tn = electrolyzerThermoneutralVoltage(T)

  // Alkaline has higher activation overpotentials
  const anodeJ0 = 1e-8
  const cathodeJ0 = 1e-4

  const etaAnode = butlerVolmerInverse(currentDensity, anodeJ0, 0.5, 2, T)
  const etaCathode = butlerVolmerInverse(currentDensity, cathodeJ0, 0.5, 2, T)

  // KOH conductivity (S/cm) - temperature and concentration dependent
  const kohConductivity =
    0.5 + 0.01 * (T - 298) * (kohConcentration / 30) * 0.5
  const R_electrolyte = electrodeGap / kohConductivity
  const R_membrane = 0.3 // Zirfon-type separator
  const R_total = R_electrolyte + R_membrane

  const etaOhmic = ohmicOverpotential(currentDensity, R_total)

  // Bubble coverage reduces effective area at high current
  const bubbleCoverage = 0.1 + 0.2 * currentDensity
  const jL = 1.0 / (1 + bubbleCoverage)
  const etaConc = currentDensity < jL ? concentrationOverpotential(currentDensity, jL, 2, T) : 0.5

  const totalOverpotential = etaAnode + etaCathode + etaOhmic + etaConc
  const cellVoltage = E_rev + totalOverpotential
  const efficiency = E_tn / cellVoltage

  const faradaicRate = 0.0374e-3 // kg/(A·h)
  const faradaicEfficiency = 0.98 // Slightly lower for alkaline
  const h2Production = currentDensity * 10000 * faradaicRate * faradaicEfficiency

  const heatPerCell = currentDensity * (cellVoltage - E_tn) * 10000

  return {
    voltage: cellVoltage,
    currentDensity,
    efficiency,
    hydrogenProduction: h2Production,
    heatGeneration: heatPerCell,
    overpotentials: {
      activation: etaAnode + etaCathode,
      ohmic: etaOhmic,
      concentration: etaConc,
      total: totalOverpotential,
    },
  }
}

/**
 * Solid Oxide Electrolyzer (SOEC) model
 */
export function soecPerformance(
  currentDensity: number, // A/cm2
  T: number = 1073, // K (800°C typical)
  p: number = 101325, // Pa
  electrolyteThickness: number = 0.001 // cm (10 micron YSZ)
): ElectrolyzerPerformance {
  const E_rev = electrolyzerReversibleVoltage(T, p)
  const E_tn = electrolyzerThermoneutralVoltage(T)

  // High temperature enables fast kinetics
  const anodeJ0 = 0.01
  const cathodeJ0 = 0.1

  const etaAnode = butlerVolmerInverse(currentDensity, anodeJ0, 0.5, 2, T)
  const etaCathode = butlerVolmerInverse(currentDensity, cathodeJ0, 0.5, 2, T)

  // YSZ ionic conductivity (Arrhenius)
  const yszConductivity = 0.1 * Math.exp(-10300 / T) * 100 // S/cm at 800°C ~0.1 S/cm
  const R_electrolyte = electrolyteThickness / Math.max(0.01, yszConductivity)
  const R_electrodes = 0.05 // Contact resistance

  const etaOhmic = ohmicOverpotential(currentDensity, R_electrolyte + R_electrodes)

  // High temp means less concentration polarization
  const jL = 3.0
  const etaConc = concentrationOverpotential(currentDensity, jL, 2, T)

  const totalOverpotential = etaAnode + etaCathode + etaOhmic + etaConc
  const cellVoltage = E_rev + totalOverpotential

  // SOEC can be thermoneutral or even endothermic at high T
  const efficiency = E_tn / cellVoltage

  const faradaicRate = 0.0374e-3
  const h2Production = currentDensity * 10000 * faradaicRate * 0.99

  // Can be negative (endothermic) at high current
  const heatPerCell = currentDensity * (cellVoltage - E_tn) * 10000

  return {
    voltage: cellVoltage,
    currentDensity,
    efficiency,
    hydrogenProduction: h2Production,
    heatGeneration: heatPerCell,
    overpotentials: {
      activation: etaAnode + etaCathode,
      ohmic: etaOhmic,
      concentration: etaConc,
      total: totalOverpotential,
    },
  }
}

// ============================================================================
// Fuel Cell Models
// ============================================================================

/**
 * PEM Fuel Cell model
 */
export function pemfcPerformance(
  currentDensity: number, // A/cm2
  T: number = 353, // K (80°C)
  p_h2: number = 150000, // Pa
  p_o2: number = 50000, // Pa (air)
  options: {
    membraneThickness?: number
    humidity?: number // 0-1
    catalystLoading?: number // mg/cm2
  } = {}
): FuelCellPerformance {
  const {
    membraneThickness = 0.005, // 50 micron
    humidity = 0.8,
    catalystLoading = 0.4,
  } = options

  // Open circuit voltage (ideal Nernst)
  const E0 = 1.229
  const Q = 1 / (Math.sqrt(p_h2 / STANDARD_PRESSURE) * Math.sqrt(p_o2 / STANDARD_PRESSURE))
  const E_ocv = nernstEquation(E0, 2, Q, T)

  // Exchange current densities
  const anodeJ0 = 0.1 * (catalystLoading / 0.4) // HOR is fast
  const cathodeJ0 = 1e-4 * (catalystLoading / 0.4) // ORR is slow

  // Activation losses (ORR dominates)
  const etaAnode = butlerVolmerInverse(currentDensity, anodeJ0, 0.5, 2, T)
  const etaCathode = butlerVolmerInverse(currentDensity, cathodeJ0, 0.5, 4, T) // 4e- for O2

  // Ohmic losses
  const nafionResistivity = 15 / humidity // Increases as membrane dries
  const R_membrane = nafionResistivity * membraneThickness
  const R_contact = 0.02
  const etaOhmic = ohmicOverpotential(currentDensity, R_membrane + R_contact)

  // Concentration losses
  const jL = 2.0 * (p_o2 / 50000) // Proportional to O2 pressure
  const etaConc = currentDensity < jL ? concentrationOverpotential(currentDensity, jL, 4, T) : 0.5

  // Cell voltage
  const totalOverpotential = etaAnode + etaCathode + etaOhmic + etaConc
  const cellVoltage = E_ocv - totalOverpotential

  // Power density
  const powerDensity = cellVoltage * currentDensity

  // Efficiency (based on LHV of H2: 1.25V equivalent)
  const E_lhv = 1.25
  const efficiency = cellVoltage / E_lhv

  // Water production: 1 A = 0.336 g/h H2O
  const waterRate = 0.336e-3 // kg/(A·h)
  const waterProduction = currentDensity * 10000 * waterRate

  return {
    voltage: cellVoltage,
    currentDensity,
    powerDensity,
    efficiency,
    waterProduction,
    overpotentials: {
      activation: etaAnode + etaCathode,
      ohmic: etaOhmic,
      concentration: etaConc,
      total: totalOverpotential,
    },
  }
}

/**
 * Solid Oxide Fuel Cell (SOFC) model
 */
export function sofcPerformance(
  currentDensity: number, // A/cm2
  T: number = 1073, // K (800°C)
  p_h2: number = 101325, // Pa
  p_o2: number = 21000 // Pa (air)
): FuelCellPerformance {
  // High temperature OCV
  const E0 = 1.229 - 0.00085 * (T - 298)
  const Q = 1 / (Math.sqrt(p_h2 / STANDARD_PRESSURE) * Math.sqrt(p_o2 / STANDARD_PRESSURE))
  const E_ocv = nernstEquation(E0, 2, Q, T)

  // Fast kinetics at high T
  const anodeJ0 = 0.5
  const cathodeJ0 = 0.1

  const etaAnode = butlerVolmerInverse(currentDensity, anodeJ0, 0.5, 2, T)
  const etaCathode = butlerVolmerInverse(currentDensity, cathodeJ0, 0.5, 4, T)

  // YSZ electrolyte resistance
  const yszConductivity = 0.1 * Math.exp(-10300 * (1 / T - 1 / 1073))
  const R_electrolyte = 0.001 / Math.max(0.01, yszConductivity) // 10 micron electrolyte
  const etaOhmic = ohmicOverpotential(currentDensity, R_electrolyte + 0.05)

  const jL = 3.0
  const etaConc = concentrationOverpotential(currentDensity, jL, 4, T)

  const totalOverpotential = etaAnode + etaCathode + etaOhmic + etaConc
  const cellVoltage = E_ocv - totalOverpotential

  const powerDensity = cellVoltage * currentDensity
  const E_lhv = 1.25
  const efficiency = cellVoltage / E_lhv

  const waterRate = 0.336e-3
  const waterProduction = currentDensity * 10000 * waterRate

  return {
    voltage: cellVoltage,
    currentDensity,
    powerDensity,
    efficiency,
    waterProduction,
    overpotentials: {
      activation: etaAnode + etaCathode,
      ohmic: etaOhmic,
      concentration: etaConc,
      total: totalOverpotential,
    },
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate electrolyzer efficiency claim
 */
export function validateElectrolyzerEfficiency(
  claimedEfficiency: number, // kWh/kg H2 or %
  technology: 'pem' | 'alkaline' | 'soec',
  currentDensity: number,
  temperature: number
): { valid: boolean; reason: string; typical: number } {
  let performance: ElectrolyzerPerformance

  switch (technology) {
    case 'pem':
      performance = pemElectrolyzerPerformance(currentDensity, temperature)
      break
    case 'alkaline':
      performance = alkalineElectrolyzerPerformance(currentDensity, temperature)
      break
    case 'soec':
      performance = soecPerformance(currentDensity, temperature)
      break
  }

  // Convert to kWh/kg if needed
  const efficiencyAsKwhPerKg = 39.4 / performance.efficiency // HHV of H2 is 39.4 kWh/kg

  if (claimedEfficiency < 0.5) {
    // Assume it's in fraction form
    const maxTheoreticalEff = electrolyzerThermoneutralVoltage(temperature) /
      electrolyzerReversibleVoltage(temperature)

    if (claimedEfficiency > maxTheoreticalEff) {
      return {
        valid: false,
        reason: `Claimed ${(claimedEfficiency * 100).toFixed(1)}% exceeds thermodynamic maximum of ${(maxTheoreticalEff * 100).toFixed(1)}%`,
        typical: performance.efficiency,
      }
    }

    if (claimedEfficiency > performance.efficiency * 1.2) {
      return {
        valid: false,
        reason: `Claimed efficiency is ${((claimedEfficiency / performance.efficiency - 1) * 100).toFixed(0)}% higher than model prediction for ${technology}`,
        typical: performance.efficiency,
      }
    }

    return {
      valid: true,
      reason: 'Efficiency claim is within plausible range',
      typical: performance.efficiency,
    }
  } else {
    // kWh/kg format (lower is better)
    const theoretical = 39.4 // HHV basis minimum
    if (claimedEfficiency < theoretical) {
      return {
        valid: false,
        reason: `Claimed ${claimedEfficiency.toFixed(1)} kWh/kg is below thermodynamic minimum of ${theoretical} kWh/kg`,
        typical: efficiencyAsKwhPerKg,
      }
    }

    return {
      valid: true,
      reason: 'Energy consumption claim is within plausible range',
      typical: efficiencyAsKwhPerKg,
    }
  }
}
