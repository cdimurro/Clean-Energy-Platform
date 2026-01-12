/**
 * Tier 2 Analytical Efficiency Calculators
 *
 * Physics-based efficiency calculations for various clean energy technologies.
 * All calculations include theoretical limits and uncertainty bounds.
 */

// ============================================================================
// Types
// ============================================================================

export interface EfficiencyResult {
  value: number
  theoreticalMax: number
  uncertainty: number // +/- percentage
  components: EfficiencyComponent[]
  limitingFactors: string[]
  assumptions: string[]
}

export interface EfficiencyComponent {
  name: string
  value: number
  description: string
}

export interface TemperatureRange {
  hot: number // Kelvin
  cold: number // Kelvin
  ambient?: number // Kelvin
}

// ============================================================================
// Thermodynamic Efficiency Limits
// ============================================================================

/**
 * Carnot efficiency - maximum theoretical efficiency for a heat engine
 * @param temps Temperature range in Kelvin
 * @returns Maximum efficiency (0-1)
 */
export function carnotEfficiency(temps: TemperatureRange): number {
  if (temps.hot <= temps.cold) {
    throw new Error('Hot temperature must be greater than cold temperature')
  }
  return 1 - temps.cold / temps.hot
}

/**
 * Shockley-Queisser limit for single-junction solar cells
 * Based on detailed balance limit
 * @param bandgapEv Bandgap energy in electron volts
 * @param solarConcentration Concentration factor (1 = no concentration)
 * @returns Maximum theoretical efficiency
 */
export function shockleyQueisserLimit(
  bandgapEv: number,
  solarConcentration: number = 1
): number {
  // Simplified model - optimal bandgap ~1.1-1.4 eV for single junction
  // Peak efficiency at 1.34 eV is ~33.7% for 1 sun
  const optimalBandgap = 1.34
  const peakEfficiency = 0.337

  // Adjust for concentration (max ~45% at max concentration)
  const concentrationBoost = Math.log10(Math.max(1, solarConcentration)) * 0.05
  const basePeakEfficiency = Math.min(0.45, peakEfficiency + concentrationBoost)

  // Gaussian approximation of efficiency vs bandgap curve
  const sigma = 0.4
  const bandgapFactor = Math.exp(
    -Math.pow(bandgapEv - optimalBandgap, 2) / (2 * sigma * sigma)
  )

  return basePeakEfficiency * bandgapFactor
}

/**
 * Betz limit for wind turbines
 * Maximum power extraction from wind
 * @returns Maximum power coefficient (0.593)
 */
export function betzLimit(): number {
  return 16 / 27 // ~0.593
}

// ============================================================================
// Heat Engine Efficiencies
// ============================================================================

/**
 * Rankine cycle efficiency (steam power plants)
 */
export function rankineEfficiency(
  boilerTemp: number, // K
  condenserTemp: number, // K
  boilerPressure: number, // MPa
  reheats: number = 0,
  isentropicEffTurbine: number = 0.9,
  isentropicEffPump: number = 0.85
): EfficiencyResult {
  const carnotMax = carnotEfficiency({ hot: boilerTemp, cold: condenserTemp })

  // Typical Rankine is 60-75% of Carnot
  const rankineFactor = 0.65 + 0.02 * reheats // Reheat improves efficiency
  const componentEfficiency = isentropicEffTurbine * isentropicEffPump

  const actualEfficiency = carnotMax * rankineFactor * componentEfficiency

  return {
    value: actualEfficiency,
    theoreticalMax: carnotMax,
    uncertainty: 0.03,
    components: [
      { name: 'Carnot Factor', value: carnotMax, description: 'Theoretical maximum' },
      {
        name: 'Rankine Factor',
        value: rankineFactor,
        description: 'Cycle losses vs Carnot',
      },
      {
        name: 'Component Efficiency',
        value: componentEfficiency,
        description: 'Turbine and pump losses',
      },
    ],
    limitingFactors: [
      'Heat rejection temperature',
      'Moisture at turbine outlet',
      'Pump work',
      'Heat exchanger effectiveness',
    ],
    assumptions: [
      `Boiler temperature: ${boilerTemp} K`,
      `Condenser temperature: ${condenserTemp} K`,
      `Turbine isentropic efficiency: ${isentropicEffTurbine * 100}%`,
      `Pump isentropic efficiency: ${isentropicEffPump * 100}%`,
      `Number of reheats: ${reheats}`,
    ],
  }
}

/**
 * Brayton cycle efficiency (gas turbines)
 */
export function braytonEfficiency(
  turbineInletTemp: number, // K
  compressorInletTemp: number, // K
  pressureRatio: number,
  gamma: number = 1.4, // Specific heat ratio (air)
  isentropicEffCompressor: number = 0.88,
  isentropicEffTurbine: number = 0.9
): EfficiencyResult {
  const carnotMax = carnotEfficiency({
    hot: turbineInletTemp,
    cold: compressorInletTemp,
  })

  // Ideal Brayton efficiency
  const idealBrayton = 1 - Math.pow(pressureRatio, -(gamma - 1) / gamma)

  // Component losses
  const componentEfficiency = isentropicEffCompressor * isentropicEffTurbine

  // Real cycle typically 70-85% of ideal
  const realFactor = 0.75

  const actualEfficiency = idealBrayton * componentEfficiency * realFactor

  return {
    value: actualEfficiency,
    theoreticalMax: carnotMax,
    uncertainty: 0.04,
    components: [
      { name: 'Ideal Brayton', value: idealBrayton, description: 'Ideal cycle efficiency' },
      {
        name: 'Component Efficiency',
        value: componentEfficiency,
        description: 'Compressor and turbine losses',
      },
      { name: 'Real Factor', value: realFactor, description: 'Additional real-world losses' },
    ],
    limitingFactors: [
      'Turbine inlet temperature limit',
      'Pressure ratio optimization',
      'Blade cooling requirements',
      'Combustor efficiency',
    ],
    assumptions: [
      `Turbine inlet temperature: ${turbineInletTemp} K`,
      `Compressor inlet temperature: ${compressorInletTemp} K`,
      `Pressure ratio: ${pressureRatio}`,
      `Specific heat ratio: ${gamma}`,
    ],
  }
}

/**
 * Combined cycle efficiency (gas turbine + steam)
 */
export function combinedCycleEfficiency(
  braytonEff: number,
  rankineEff: number,
  wasteheatRecovery: number = 0.9
): EfficiencyResult {
  // Combined cycle: η_cc = η_brayton + (1 - η_brayton) * η_rankine * η_recovery
  const combinedEff =
    braytonEff + (1 - braytonEff) * rankineEff * wasteheatRecovery

  return {
    value: combinedEff,
    theoreticalMax: 0.65, // Best available combined cycles
    uncertainty: 0.02,
    components: [
      { name: 'Brayton Cycle', value: braytonEff, description: 'Gas turbine efficiency' },
      { name: 'Rankine Cycle', value: rankineEff, description: 'Steam cycle efficiency' },
      {
        name: 'Heat Recovery',
        value: wasteheatRecovery,
        description: 'HRSG effectiveness',
      },
    ],
    limitingFactors: [
      'Gas turbine inlet temperature',
      'Heat recovery steam generator efficiency',
      'Steam cycle parameters',
      'Auxiliary power consumption',
    ],
    assumptions: [
      'Modern combined cycle configuration',
      `Waste heat recovery: ${wasteheatRecovery * 100}%`,
    ],
  }
}

/**
 * Organic Rankine Cycle efficiency (low-grade heat)
 */
export function orcEfficiency(
  heatSourceTemp: number, // K
  heatSinkTemp: number, // K
  workingFluid: 'r245fa' | 'r134a' | 'isobutane' | 'pentane' = 'r245fa'
): EfficiencyResult {
  const carnotMax = carnotEfficiency({ hot: heatSourceTemp, cold: heatSinkTemp })

  // ORC typically achieves 50-65% of Carnot for low-temp sources
  const fluidFactors: Record<string, number> = {
    r245fa: 0.60,
    r134a: 0.55,
    isobutane: 0.58,
    pentane: 0.62,
  }

  const fluidFactor = fluidFactors[workingFluid]
  const actualEfficiency = carnotMax * fluidFactor

  return {
    value: actualEfficiency,
    theoreticalMax: carnotMax,
    uncertainty: 0.05,
    components: [
      { name: 'Carnot Efficiency', value: carnotMax, description: 'Theoretical maximum' },
      { name: 'ORC Factor', value: fluidFactor, description: 'Cycle losses for ORC' },
    ],
    limitingFactors: [
      'Heat source temperature',
      'Working fluid selection',
      'Pinch point temperature difference',
      'Expander efficiency',
    ],
    assumptions: [
      `Heat source: ${heatSourceTemp} K`,
      `Heat sink: ${heatSinkTemp} K`,
      `Working fluid: ${workingFluid}`,
    ],
  }
}

// ============================================================================
// Renewable Energy Efficiencies
// ============================================================================

/**
 * Solar PV efficiency with temperature and irradiance effects
 */
export function solarPVEfficiency(
  stcEfficiency: number, // Standard Test Conditions efficiency
  cellTemperature: number, // Celsius
  irradiance: number, // W/m2
  tempCoefficient: number = -0.004, // per degree C
  technology: 'mono-si' | 'poly-si' | 'thin-film' | 'perovskite' = 'mono-si'
): EfficiencyResult {
  const stcTemperature = 25 // Celsius
  const stcIrradiance = 1000 // W/m2

  // Bandgaps for different technologies
  const bandgaps: Record<string, number> = {
    'mono-si': 1.12,
    'poly-si': 1.12,
    'thin-film': 1.45, // CdTe
    perovskite: 1.55,
  }

  const theoreticalMax = shockleyQueisserLimit(bandgaps[technology])

  // Temperature derating
  const tempDerating = 1 + tempCoefficient * (cellTemperature - stcTemperature)

  // Low-light performance (logarithmic relationship)
  const irradianceDerating =
    irradiance >= 200
      ? (Math.log10(irradiance) / Math.log10(stcIrradiance)) * 0.95 + 0.05
      : irradiance / stcIrradiance

  const actualEfficiency = stcEfficiency * tempDerating * irradianceDerating

  return {
    value: Math.max(0, actualEfficiency),
    theoreticalMax,
    uncertainty: 0.02,
    components: [
      { name: 'STC Efficiency', value: stcEfficiency, description: 'Rated efficiency at STC' },
      {
        name: 'Temperature Derating',
        value: tempDerating,
        description: 'Loss due to temperature',
      },
      {
        name: 'Irradiance Derating',
        value: irradianceDerating,
        description: 'Low-light losses',
      },
    ],
    limitingFactors: [
      'Cell temperature',
      'Shading',
      'Soiling',
      'Module mismatch',
      'Inverter efficiency',
    ],
    assumptions: [
      `Cell temperature: ${cellTemperature}C`,
      `Irradiance: ${irradiance} W/m2`,
      `Temperature coefficient: ${tempCoefficient * 100}%/C`,
    ],
  }
}

/**
 * Wind turbine efficiency
 */
export function windTurbineEfficiency(
  windSpeed: number, // m/s
  ratedPower: number, // kW
  rotorDiameter: number, // m
  airDensity: number = 1.225, // kg/m3
  cpMax: number = 0.48, // Maximum power coefficient (typical ~0.45-0.50)
  cutInSpeed: number = 3, // m/s
  ratedSpeed: number = 12, // m/s
  cutOutSpeed: number = 25 // m/s
): EfficiencyResult {
  const betzMax = betzLimit()

  // Available wind power
  const sweptArea = Math.PI * Math.pow(rotorDiameter / 2, 2)
  const availablePower = (0.5 * airDensity * sweptArea * Math.pow(windSpeed, 3)) / 1000 // kW

  let powerCoefficient = 0
  let extractedPower = 0

  if (windSpeed < cutInSpeed || windSpeed > cutOutSpeed) {
    powerCoefficient = 0
    extractedPower = 0
  } else if (windSpeed >= ratedSpeed) {
    extractedPower = ratedPower
    powerCoefficient = ratedPower / availablePower
  } else {
    // Partial load - follow Cp curve
    const normalizedSpeed = (windSpeed - cutInSpeed) / (ratedSpeed - cutInSpeed)
    powerCoefficient = cpMax * Math.pow(normalizedSpeed, 0.5)
    extractedPower = availablePower * powerCoefficient
  }

  return {
    value: powerCoefficient,
    theoreticalMax: betzMax,
    uncertainty: 0.05,
    components: [
      {
        name: 'Power Coefficient',
        value: powerCoefficient,
        description: 'Fraction of wind energy captured',
      },
      {
        name: 'Betz Efficiency',
        value: cpMax / betzMax,
        description: 'Fraction of Betz limit achieved',
      },
    ],
    limitingFactors: [
      'Wind speed variability',
      'Aerodynamic losses',
      'Generator efficiency',
      'Gearbox losses (if applicable)',
      'Wake effects',
    ],
    assumptions: [
      `Wind speed: ${windSpeed} m/s`,
      `Rotor diameter: ${rotorDiameter} m`,
      `Air density: ${airDensity} kg/m3`,
      `Maximum Cp: ${cpMax}`,
    ],
  }
}

// ============================================================================
// Energy Storage Efficiencies
// ============================================================================

/**
 * Battery round-trip efficiency
 */
export function batteryRoundTripEfficiency(
  chargeEfficiency: number = 0.95,
  dischargeEfficiency: number = 0.95,
  selfDischargeRate: number = 0.02, // per month
  storageDuration: number = 1, // hours
  chemistry: 'li-ion' | 'lfp' | 'nas' | 'vrfb' | 'lead-acid' = 'li-ion'
): EfficiencyResult {
  // Chemistry-specific base efficiencies
  const chemistryFactors: Record<string, { charge: number; discharge: number; selfDis: number }> = {
    'li-ion': { charge: 0.98, discharge: 0.98, selfDis: 0.02 },
    lfp: { charge: 0.97, discharge: 0.97, selfDis: 0.015 },
    nas: { charge: 0.92, discharge: 0.92, selfDis: 0.15 }, // high temp sodium-sulfur
    vrfb: { charge: 0.85, discharge: 0.85, selfDis: 0.01 },
    'lead-acid': { charge: 0.90, discharge: 0.90, selfDis: 0.05 },
  }

  const factors = chemistryFactors[chemistry]

  // Self-discharge for storage duration (convert to hourly)
  const hourlySelfdischarge = Math.pow(1 - factors.selfDis, 1 / (30 * 24))
  const storageLoss = Math.pow(hourlySelfdischarge, storageDuration)

  const roundTrip = factors.charge * factors.discharge * storageLoss

  return {
    value: roundTrip,
    theoreticalMax: 0.98, // Best possible electrochemical
    uncertainty: 0.02,
    components: [
      { name: 'Charge Efficiency', value: factors.charge, description: 'Energy in' },
      { name: 'Discharge Efficiency', value: factors.discharge, description: 'Energy out' },
      {
        name: 'Storage Retention',
        value: storageLoss,
        description: 'Self-discharge losses',
      },
    ],
    limitingFactors: [
      'Internal resistance (I2R losses)',
      'Side reactions',
      'Temperature effects',
      'State of charge',
      'Charge/discharge rate',
    ],
    assumptions: [
      `Chemistry: ${chemistry}`,
      `Storage duration: ${storageDuration} hours`,
    ],
  }
}

/**
 * Pumped hydro storage efficiency
 */
export function pumpedHydroEfficiency(
  pumpEfficiency: number = 0.92,
  turbineEfficiency: number = 0.93,
  motorEfficiency: number = 0.97,
  generatorEfficiency: number = 0.98,
  headLoss: number = 0.02 // Friction losses
): EfficiencyResult {
  const pumpingLoss = pumpEfficiency * motorEfficiency * (1 - headLoss)
  const generatingLoss = turbineEfficiency * generatorEfficiency * (1 - headLoss)
  const roundTrip = pumpingLoss * generatingLoss

  return {
    value: roundTrip,
    theoreticalMax: 0.90,
    uncertainty: 0.02,
    components: [
      { name: 'Pumping', value: pumpingLoss, description: 'Pump and motor efficiency' },
      {
        name: 'Generating',
        value: generatingLoss,
        description: 'Turbine and generator efficiency',
      },
    ],
    limitingFactors: [
      'Pump/turbine design',
      'Head height',
      'Penstock friction',
      'Part-load operation',
    ],
    assumptions: ['Reversible Francis turbine design', 'Fixed-speed operation'],
  }
}

/**
 * Compressed air energy storage efficiency
 */
export function caesEfficiency(
  isAdiabatic: boolean = false, // ACAES vs conventional
  compressorEfficiency: number = 0.85,
  expanderEfficiency: number = 0.88,
  thermalStoreEfficiency: number = 0.90 // Only for ACAES
): EfficiencyResult {
  let roundTrip: number
  let components: EfficiencyComponent[]

  if (isAdiabatic) {
    roundTrip =
      compressorEfficiency * expanderEfficiency * thermalStoreEfficiency
    components = [
      { name: 'Compressor', value: compressorEfficiency, description: 'Compression efficiency' },
      { name: 'Expander', value: expanderEfficiency, description: 'Expansion efficiency' },
      {
        name: 'Thermal Store',
        value: thermalStoreEfficiency,
        description: 'Heat recovery',
      },
    ]
  } else {
    // Conventional uses natural gas for reheating
    const fuelEnergy = 0.4 // ~40% of input comes from fuel
    roundTrip = (compressorEfficiency * expanderEfficiency) / (1 + fuelEnergy)
    components = [
      { name: 'Compressor', value: compressorEfficiency, description: 'Compression efficiency' },
      { name: 'Expander', value: expanderEfficiency, description: 'Expansion efficiency' },
      { name: 'Fuel Penalty', value: 1 / (1 + fuelEnergy), description: 'Natural gas input' },
    ]
  }

  return {
    value: roundTrip,
    theoreticalMax: isAdiabatic ? 0.75 : 0.55,
    uncertainty: 0.04,
    components,
    limitingFactors: [
      'Compression heat management',
      'Cavern pressure limits',
      'Thermal storage losses',
      'Intercooler effectiveness',
    ],
    assumptions: [
      isAdiabatic ? 'Adiabatic (ACAES) with thermal store' : 'Conventional with gas reheat',
    ],
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if a claimed efficiency is physically plausible
 */
export function validateEfficiencyClaim(
  claimedEfficiency: number,
  calculatedResult: EfficiencyResult,
  marginOfError: number = 0.1 // 10% margin
): {
  valid: boolean
  reason: string
  maxPlausible: number
} {
  const maxPlausible = Math.min(
    1,
    calculatedResult.theoreticalMax * (1 + marginOfError)
  )

  if (claimedEfficiency > maxPlausible) {
    return {
      valid: false,
      reason: `Claimed efficiency ${(claimedEfficiency * 100).toFixed(1)}% exceeds theoretical maximum of ${(calculatedResult.theoreticalMax * 100).toFixed(1)}%`,
      maxPlausible,
    }
  }

  if (claimedEfficiency > calculatedResult.value * 1.5) {
    return {
      valid: false,
      reason: `Claimed efficiency is ${((claimedEfficiency / calculatedResult.value - 1) * 100).toFixed(0)}% higher than typical for this technology`,
      maxPlausible,
    }
  }

  return {
    valid: true,
    reason: 'Claimed efficiency is within plausible range',
    maxPlausible,
  }
}
