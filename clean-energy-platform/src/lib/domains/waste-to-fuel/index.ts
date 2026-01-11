/**
 * Waste-to-Fuel Domain Module (v0.0.1)
 *
 * Domain-specific calculators, limits, and validation for waste-to-fuel technologies.
 * Focuses on Hydrothermal Liquefaction (HTL), pyrolysis, and gasification processes.
 *
 * Primary target: EDEN Energy EEP technology assessment
 *
 * @see lib/domains/base.ts - Base interfaces
 */

import {
  BaseDomainModule,
  type DomainCalculator,
  type PhysicalLimit,
  type IndustryBenchmark,
  type ValidationRule,
  type SimulationTemplate,
  type CalculatorResult,
  type DomainFormConfig,
} from '../base'

// ============================================================================
// Physical Limits
// ============================================================================

/**
 * Thermodynamic and process limits for waste-to-fuel technologies
 */
export const WASTE_TO_FUEL_PHYSICAL_LIMITS: PhysicalLimit[] = [
  // HTL Process Limits
  {
    id: 'htl_temp_min',
    name: 'HTL Minimum Temperature',
    value: 250,
    unit: '°C',
    description: 'Minimum temperature for subcritical HTL operation',
    citation: 'PNNL HTL Technology Brief 2024',
  },
  {
    id: 'htl_temp_max',
    name: 'HTL Maximum Temperature',
    value: 400,
    unit: '°C',
    description: 'Maximum practical temperature (supercritical region)',
    citation: 'PNNL HTL Technology Brief 2024',
  },
  {
    id: 'htl_pressure_min',
    name: 'HTL Minimum Pressure',
    value: 10,
    unit: 'MPa',
    description: 'Minimum pressure to maintain water in liquid/supercritical state',
    citation: 'Water saturation pressure requirements',
  },
  {
    id: 'htl_pressure_max',
    name: 'HTL Maximum Pressure',
    value: 35,
    unit: 'MPa',
    description: 'Maximum practical operating pressure',
    citation: 'Process engineering limits',
  },
  {
    id: 'biocrude_yield_max',
    name: 'Maximum Biocrude Yield',
    value: 60,
    unit: 'wt%',
    description: 'Upper limit for biocrude yield from wet waste feedstocks',
    citation: 'PNNL HTL studies - optimized conditions',
  },
  {
    id: 'energy_recovery_max',
    name: 'Maximum Energy Recovery',
    value: 85,
    unit: '%',
    description: 'Second-law limit for HTL processes (feedstock to products)',
    citation: 'Thermodynamic analysis of HTL processes',
  },
  // Feedstock Properties
  {
    id: 'biocrude_hhv_min',
    name: 'Biocrude HHV Minimum',
    value: 30,
    unit: 'MJ/kg',
    description: 'Minimum heating value for viable biocrude',
    citation: 'Biocrude specifications',
  },
  {
    id: 'biocrude_hhv_max',
    name: 'Biocrude HHV Maximum',
    value: 40,
    unit: 'MJ/kg',
    description: 'Maximum heating value (approaches petroleum)',
    citation: 'Biocrude specifications',
  },
  {
    id: 'water_critical_point',
    name: 'Water Critical Point',
    value: 374,
    unit: '°C',
    description: 'Critical temperature of water (22.1 MPa)',
    citation: 'Thermodynamic reference',
  },
  // Mass Balance Limits
  {
    id: 'mass_balance_closure',
    name: 'Mass Balance Closure Requirement',
    value: 98,
    unit: '%',
    description: 'Minimum mass balance closure for valid process',
    citation: 'Process engineering standards',
  },
]

// ============================================================================
// Industry Benchmarks
// ============================================================================

/**
 * Current state-of-art benchmarks for waste-to-fuel technologies
 */
export const WASTE_TO_FUEL_BENCHMARKS: IndustryBenchmark[] = [
  // HTL Biocrude Yields
  {
    id: 'htl_msw_yield',
    name: 'HTL Biocrude Yield (MSW)',
    description: 'Biocrude yield from municipal solid waste via HTL',
    value: 30,
    unit: 'wt% dry feedstock',
    year: 2024,
    source: 'PNNL HTL Research Program',
    category: 'commercial',
  },
  {
    id: 'htl_food_waste_yield',
    name: 'HTL Biocrude Yield (Food Waste)',
    description: 'Biocrude yield from food waste - higher lipid content',
    value: 40,
    unit: 'wt% dry feedstock',
    year: 2024,
    source: 'PNNL HTL Research Program',
    category: 'lab_record',
  },
  {
    id: 'htl_algae_yield',
    name: 'HTL Biocrude Yield (Algae)',
    description: 'Biocrude yield from microalgae',
    value: 45,
    unit: 'wt% dry feedstock',
    year: 2024,
    source: 'NREL Algae Biofuels Program',
    category: 'lab_record',
  },
  {
    id: 'htl_sewage_yield',
    name: 'HTL Biocrude Yield (Sewage Sludge)',
    description: 'Biocrude yield from wastewater sludge',
    value: 35,
    unit: 'wt% dry feedstock',
    year: 2024,
    source: 'Genifuel pilot data',
    category: 'commercial',
  },
  // Energy Efficiency
  {
    id: 'htl_energy_efficiency',
    name: 'HTL Energy Efficiency',
    description: 'Energy in products vs energy in feedstock + utilities',
    value: 70,
    unit: '%',
    year: 2024,
    source: 'IEA Bioenergy Task 39',
    category: 'commercial',
  },
  {
    id: 'htl_steam_requirement',
    name: 'HTL Steam Requirement',
    description: 'Steam energy input per kg feedstock',
    value: 1.3,
    unit: 'MJ/kg feedstock',
    year: 2024,
    source: 'PNNL process engineering',
    category: 'commercial',
  },
  // Cost Benchmarks
  {
    id: 'lcof_pilot_scale',
    name: 'LCOF (Pilot Scale)',
    description: 'Levelized cost of fuel at pilot/demo scale',
    value: 10,
    unit: '$/liter biocrude',
    year: 2024,
    source: 'NREL HTL TEA 2024',
    category: 'commercial',
  },
  {
    id: 'lcof_commercial_target',
    name: 'LCOF (Commercial Target)',
    description: 'Target levelized cost at commercial scale',
    value: 3.5,
    unit: '$/liter biocrude',
    year: 2030,
    source: 'DOE Bioenergy Technologies Office',
    category: 'projected',
  },
  {
    id: 'htl_capex_pilot',
    name: 'HTL CAPEX (Pilot Scale)',
    description: 'Capital cost at pilot scale (<100 tpd)',
    value: 6000,
    unit: '$/tonne-yr capacity',
    year: 2024,
    source: 'NREL HTL TEA',
    category: 'commercial',
  },
  {
    id: 'htl_capex_commercial',
    name: 'HTL CAPEX (Commercial Target)',
    description: 'Target capital cost at commercial scale (>1000 tpd)',
    value: 2000,
    unit: '$/tonne-yr capacity',
    year: 2030,
    source: 'DOE BETO projections',
    category: 'projected',
  },
  // Revenue Streams
  {
    id: 'tipping_fee_us',
    name: 'MSW Tipping Fee (US Average)',
    description: 'Average gate fee for municipal solid waste',
    value: 55,
    unit: '$/tonne',
    year: 2024,
    source: 'EPA Waste Management Economics',
    category: 'commercial',
  },
  {
    id: 'biochar_price',
    name: 'Biochar Market Price',
    description: 'Market price for quality biochar',
    value: 400,
    unit: '$/tonne',
    year: 2024,
    source: 'IBI Biochar Market Report',
    category: 'commercial',
  },
  // TRL Reference
  {
    id: 'htl_trl_msw',
    name: 'HTL TRL (MSW Feedstock)',
    description: 'Technology readiness level for MSW HTL',
    value: 6,
    unit: 'TRL',
    year: 2024,
    source: 'IEA Bioenergy',
    category: 'commercial',
  },
]

// ============================================================================
// Calculator Functions
// ============================================================================

/**
 * Calculate HTL mass balance and product yields
 */
function calculateHTLMassBalance(
  feedstockMoisture: number,
  feedstockAsh: number,
  reactorTemp: number,
  residenceTime: number,
  feedstockType: string = 'msw'
): CalculatorResult {
  // Base yields by feedstock type (wt% of dry feedstock)
  const baseYields: Record<string, { biocrude: number; biochar: number; aqueous: number; gas: number }> = {
    msw: { biocrude: 30, biochar: 15, aqueous: 45, gas: 10 },
    'food-waste': { biocrude: 40, biochar: 12, aqueous: 38, gas: 10 },
    algae: { biocrude: 45, biochar: 10, aqueous: 35, gas: 10 },
    'sewage-sludge': { biocrude: 35, biochar: 18, aqueous: 37, gas: 10 },
    agricultural: { biocrude: 28, biochar: 20, aqueous: 42, gas: 10 },
  }

  const yields = baseYields[feedstockType] || baseYields.msw

  // Temperature adjustment (optimal around 300-350C)
  const tempFactor = reactorTemp >= 300 && reactorTemp <= 350
    ? 1.0
    : reactorTemp < 300
      ? 0.85 + (reactorTemp - 250) * 0.003
      : 1.0 - (reactorTemp - 350) * 0.003

  // Residence time adjustment (optimal 15-45 min)
  const timeFactor = residenceTime >= 15 && residenceTime <= 45
    ? 1.0
    : residenceTime < 15
      ? 0.7 + residenceTime * 0.02
      : 1.0 - (residenceTime - 45) * 0.005

  // Calculate adjusted yields
  const dryFraction = 1 - feedstockMoisture / 100
  const organicFraction = 1 - feedstockAsh / 100

  const biocrudeYield = yields.biocrude * tempFactor * timeFactor * organicFraction
  const biocharYield = yields.biochar + feedstockAsh * 0.8 // Ash concentrates in char
  const gasYield = yields.gas * (1 + (reactorTemp - 300) * 0.002)
  const aqueousYield = 100 - biocrudeYield - biocharYield - gasYield

  // Mass balance closure
  const totalYield = biocrudeYield + biocharYield + aqueousYield + gasYield
  const closureError = Math.abs(100 - totalYield)

  const warnings: string[] = []
  if (closureError > 2) {
    warnings.push(`Mass balance closure error: ${closureError.toFixed(1)}%`)
  }
  if (reactorTemp < 250 || reactorTemp > 400) {
    warnings.push('Temperature outside typical HTL operating range (250-400C)')
  }
  if (feedstockMoisture > 90) {
    warnings.push('Very high moisture content - consider dewatering')
  }

  return {
    outputs: {
      biocrudeYield: Number(biocrudeYield.toFixed(1)),
      biocharYield: Number(biocharYield.toFixed(1)),
      aqueousYield: Number(aqueousYield.toFixed(1)),
      gasYield: Number(gasYield.toFixed(1)),
      dryBasis: Number((dryFraction * 100).toFixed(1)),
      massBalanceClosure: Number((100 - closureError).toFixed(1)),
    },
    isValid: closureError < 5,
    warnings,
    notes: [
      `Feedstock: ${feedstockType}`,
      `Biocrude yield: ${biocrudeYield.toFixed(1)} wt% (dry basis)`,
      `Operating at ${reactorTemp}C for ${residenceTime} minutes`,
    ],
    references: ['PNNL HTL Program', 'IEA Bioenergy Task 39'],
  }
}

/**
 * Calculate HTL energy balance
 */
function calculateHTLEnergyBalance(
  feedstockHHV: number, // MJ/kg dry
  biocrudeYield: number, // wt%
  biocrudeHHV: number, // MJ/kg
  biocharYield: number, // wt%
  biocharHHV: number, // MJ/kg
  steamInput: number, // MJ/kg feedstock
  electricityInput: number // kWh/kg feedstock
): CalculatorResult {
  // Calculate energy in products
  const biocrudeEnergy = (biocrudeYield / 100) * biocrudeHHV
  const biocharEnergy = (biocharYield / 100) * biocharHHV
  const gasEnergy = 0.5 // Assume minimal gas energy recovery
  const totalProductEnergy = biocrudeEnergy + biocharEnergy + gasEnergy

  // Calculate total input energy
  const electricityMJ = electricityInput * 3.6 // Convert kWh to MJ
  const totalInputEnergy = feedstockHHV + steamInput + electricityMJ

  // Calculate efficiencies
  const grossEfficiency = (totalProductEnergy / feedstockHHV) * 100
  const netEfficiency = (totalProductEnergy / totalInputEnergy) * 100
  const energyRatio = totalProductEnergy / (steamInput + electricityMJ)

  const warnings: string[] = []
  if (netEfficiency > 85) {
    warnings.push('Net efficiency exceeds typical HTL limits - verify inputs')
  }
  if (netEfficiency < 50) {
    warnings.push('Low net efficiency - process optimization needed')
  }
  if (energyRatio < 2) {
    warnings.push('Energy ratio <2 indicates poor energy return')
  }

  return {
    outputs: {
      totalProductEnergy: Number(totalProductEnergy.toFixed(2)),
      totalInputEnergy: Number(totalInputEnergy.toFixed(2)),
      grossEfficiency: Number(grossEfficiency.toFixed(1)),
      netEfficiency: Number(netEfficiency.toFixed(1)),
      energyRatio: Number(energyRatio.toFixed(2)),
      biocrudeEnergy: Number(biocrudeEnergy.toFixed(2)),
      biocharEnergy: Number(biocharEnergy.toFixed(2)),
    },
    isValid: netEfficiency > 40 && netEfficiency < 90,
    warnings,
    notes: [
      `Gross efficiency: ${grossEfficiency.toFixed(1)}% (product/feedstock energy)`,
      `Net efficiency: ${netEfficiency.toFixed(1)}% (product/total input energy)`,
      `Energy ratio: ${energyRatio.toFixed(2)} (output/utility input)`,
    ],
    references: ['IEA Bioenergy Task 39', 'NREL HTL TEA'],
  }
}

/**
 * Calculate Levelized Cost of Fuel (LCOF)
 */
function calculateLCOF(
  capex: number, // $/tonne-yr capacity
  opexFixed: number, // $/tonne feedstock
  feedstockCost: number, // $/tonne (negative = tipping fee revenue)
  biocrudeYield: number, // liters per tonne feedstock
  biocharYield: number, // kg per tonne feedstock
  biocharPrice: number, // $/kg
  capacityFactor: number, // 0-1
  lifetime: number, // years
  discountRate: number // 0-1
): CalculatorResult {
  // Annualized capital cost
  const crf = (discountRate * Math.pow(1 + discountRate, lifetime)) /
    (Math.pow(1 + discountRate, lifetime) - 1)
  const annualizedCapex = capex * crf

  // Annual costs per tonne feedstock
  const totalAnnualCost = annualizedCapex + opexFixed + feedstockCost

  // Revenue from biochar (per tonne feedstock)
  const biocharRevenue = biocharYield * biocharPrice / 1000 // kg to tonnes

  // Net cost per tonne feedstock
  const netCost = totalAnnualCost - biocharRevenue

  // LCOF ($/liter biocrude)
  const lcof = netCost / biocrudeYield

  // Breakeven analysis
  const breakevenBiocrude = (totalAnnualCost - biocharRevenue) > 0
    ? (totalAnnualCost - biocharRevenue) / biocrudeYield
    : 0

  const warnings: string[] = []
  if (lcof > 15) {
    warnings.push('LCOF exceeds pilot-scale benchmark - verify cost assumptions')
  }
  if (lcof < 2) {
    warnings.push('LCOF below commercial target - verify assumptions')
  }
  if (capacityFactor < 0.3) {
    warnings.push('Low capacity factor significantly impacts economics')
  }

  return {
    outputs: {
      lcof: Number(lcof.toFixed(2)),
      annualizedCapex: Number(annualizedCapex.toFixed(0)),
      netCostPerTonne: Number(netCost.toFixed(0)),
      biocharRevenue: Number(biocharRevenue.toFixed(0)),
      breakevenBiocrude: Number(breakevenBiocrude.toFixed(2)),
      crf: Number(crf.toFixed(4)),
    },
    isValid: lcof > 0,
    warnings,
    notes: [
      `LCOF: $${lcof.toFixed(2)}/liter biocrude`,
      `Net cost: $${netCost.toFixed(0)}/tonne feedstock`,
      `Biochar revenue offset: $${biocharRevenue.toFixed(0)}/tonne feedstock`,
    ],
    references: ['NREL HTL TEA 2024', 'DOE BETO Cost Analysis'],
  }
}

/**
 * Validate HTL efficiency claims against physics
 */
function validateEfficiencyClaim(
  claimedEfficiency: number,
  efficiencyType: string = 'mass' // mass, energy, carbon
): CalculatorResult {
  const limits: Record<string, { max: number; typical: { min: number; max: number }; description: string }> = {
    mass: {
      max: 95,
      typical: { min: 60, max: 85 },
      description: 'Mass conversion (waste to products excl. water)',
    },
    energy: {
      max: 85,
      typical: { min: 50, max: 75 },
      description: 'Energy conversion (feedstock energy to product energy)',
    },
    carbon: {
      max: 90,
      typical: { min: 65, max: 85 },
      description: 'Carbon conversion (feedstock carbon to product carbon)',
    },
  }

  const limit = limits[efficiencyType] || limits.mass

  const exceedsPhysics = claimedEfficiency > limit.max
  const exceedsTypical = claimedEfficiency > limit.typical.max
  const belowTypical = claimedEfficiency < limit.typical.min

  let verdict: string
  let confidence: string
  if (exceedsPhysics) {
    verdict = 'INVALID - exceeds physical limits'
    confidence = 'high'
  } else if (exceedsTypical) {
    verdict = 'SKEPTICAL - above typical range, requires validation'
    confidence = 'low'
  } else if (belowTypical) {
    verdict = 'PLAUSIBLE - below typical but possible'
    confidence = 'medium'
  } else {
    verdict = 'PLAUSIBLE - within typical range'
    confidence = 'high'
  }

  const warnings: string[] = []
  if (exceedsPhysics) {
    warnings.push(`Claimed ${efficiencyType} efficiency ${claimedEfficiency}% exceeds physical limit of ${limit.max}%`)
  }
  if (exceedsTypical && !exceedsPhysics) {
    warnings.push(`Claimed efficiency is ${(claimedEfficiency - limit.typical.max).toFixed(1)}% above typical maximum`)
  }

  return {
    outputs: {
      verdict,
      confidence,
      physicalLimit: limit.max,
      typicalMin: limit.typical.min,
      typicalMax: limit.typical.max,
      deviation: Number((claimedEfficiency - limit.typical.max).toFixed(1)),
      isValidClaim: exceedsPhysics ? 0 : 1,
    },
    isValid: !exceedsPhysics,
    warnings,
    notes: [
      `Efficiency type: ${limit.description}`,
      `Physical limit: ${limit.max}%`,
      `Typical range: ${limit.typical.min}-${limit.typical.max}%`,
      `Assessment: ${verdict}`,
    ],
    references: ['PNNL HTL Benchmarks', 'Thermodynamic limits for HTL'],
  }
}

// ============================================================================
// Calculator Definitions
// ============================================================================

export const WASTE_TO_FUEL_CALCULATORS: DomainCalculator[] = [
  {
    id: 'htl_mass_balance',
    name: 'HTL Mass Balance',
    description: 'Calculate product yields from HTL process parameters',
    category: 'process',
    inputs: [
      {
        id: 'feedstockMoisture',
        name: 'Feedstock Moisture',
        description: 'Water content of feedstock (wet basis)',
        type: 'number',
        unit: '%',
        min: 50,
        max: 95,
        defaultValue: 75,
        required: true,
      },
      {
        id: 'feedstockAsh',
        name: 'Feedstock Ash Content',
        description: 'Inorganic content (dry basis)',
        type: 'number',
        unit: '%',
        min: 0,
        max: 30,
        defaultValue: 10,
        required: true,
      },
      {
        id: 'reactorTemp',
        name: 'Reactor Temperature',
        description: 'HTL reactor operating temperature',
        type: 'number',
        unit: '°C',
        min: 250,
        max: 400,
        defaultValue: 320,
        required: true,
      },
      {
        id: 'residenceTime',
        name: 'Residence Time',
        description: 'Time in reactor',
        type: 'number',
        unit: 'minutes',
        min: 5,
        max: 120,
        defaultValue: 30,
        required: true,
      },
      {
        id: 'feedstockType',
        name: 'Feedstock Type',
        description: 'Type of waste feedstock',
        type: 'select',
        unit: '',
        options: [
          { value: 'msw', label: 'Municipal Solid Waste' },
          { value: 'food-waste', label: 'Food Waste' },
          { value: 'algae', label: 'Algae/Microalgae' },
          { value: 'sewage-sludge', label: 'Sewage Sludge' },
          { value: 'agricultural', label: 'Agricultural Residues' },
        ],
        defaultValue: 'msw',
        required: true,
      },
    ],
    outputs: [
      { id: 'biocrudeYield', name: 'Biocrude Yield', description: 'Biocrude yield', unit: 'wt%' },
      { id: 'biocharYield', name: 'Biochar Yield', description: 'Biochar yield', unit: 'wt%' },
      { id: 'aqueousYield', name: 'Aqueous Phase Yield', description: 'Aqueous phase yield', unit: 'wt%' },
      { id: 'gasYield', name: 'Gas Phase Yield', description: 'Gas phase yield', unit: 'wt%' },
    ],
    calculate: (inputs) =>
      calculateHTLMassBalance(
        Number(inputs.feedstockMoisture),
        Number(inputs.feedstockAsh),
        Number(inputs.reactorTemp),
        Number(inputs.residenceTime),
        String(inputs.feedstockType)
      ),
    citation: 'PNNL HTL Program, IEA Bioenergy Task 39',
  },
  {
    id: 'htl_energy_balance',
    name: 'HTL Energy Balance',
    description: 'Calculate energy efficiency and energy ratio for HTL process',
    category: 'efficiency',
    inputs: [
      {
        id: 'feedstockHHV',
        name: 'Feedstock HHV',
        description: 'Higher heating value of dry feedstock',
        type: 'number',
        unit: 'MJ/kg',
        min: 10,
        max: 25,
        defaultValue: 18,
        required: true,
      },
      {
        id: 'biocrudeYield',
        name: 'Biocrude Yield',
        description: 'Biocrude yield (dry basis)',
        type: 'number',
        unit: 'wt%',
        min: 10,
        max: 60,
        defaultValue: 30,
        required: true,
      },
      {
        id: 'biocrudeHHV',
        name: 'Biocrude HHV',
        description: 'Higher heating value of biocrude',
        type: 'number',
        unit: 'MJ/kg',
        min: 28,
        max: 42,
        defaultValue: 35,
        required: true,
      },
      {
        id: 'biocharYield',
        name: 'Biochar Yield',
        description: 'Biochar yield (dry basis)',
        type: 'number',
        unit: 'wt%',
        min: 5,
        max: 30,
        defaultValue: 15,
        required: true,
      },
      {
        id: 'biocharHHV',
        name: 'Biochar HHV',
        description: 'Higher heating value of biochar',
        type: 'number',
        unit: 'MJ/kg',
        min: 15,
        max: 30,
        defaultValue: 22,
        required: true,
      },
      {
        id: 'steamInput',
        name: 'Steam Input',
        description: 'Steam energy per kg feedstock',
        type: 'number',
        unit: 'MJ/kg',
        min: 0.5,
        max: 3,
        defaultValue: 1.3,
        required: true,
      },
      {
        id: 'electricityInput',
        name: 'Electricity Input',
        description: 'Electricity per kg feedstock',
        type: 'number',
        unit: 'kWh/kg',
        min: 0.05,
        max: 0.5,
        defaultValue: 0.15,
        required: true,
      },
    ],
    outputs: [
      { id: 'grossEfficiency', name: 'Gross Efficiency', description: 'Product/feedstock energy', unit: '%' },
      { id: 'netEfficiency', name: 'Net Efficiency', description: 'Product/total input energy', unit: '%' },
      { id: 'energyRatio', name: 'Energy Ratio', description: 'Output/utility input', unit: 'ratio' },
    ],
    calculate: (inputs) =>
      calculateHTLEnergyBalance(
        Number(inputs.feedstockHHV),
        Number(inputs.biocrudeYield),
        Number(inputs.biocrudeHHV),
        Number(inputs.biocharYield),
        Number(inputs.biocharHHV),
        Number(inputs.steamInput),
        Number(inputs.electricityInput)
      ),
    citation: 'IEA Bioenergy Task 39, NREL HTL TEA',
  },
  {
    id: 'htl_lcof',
    name: 'Levelized Cost of Fuel (LCOF)',
    description: 'Calculate LCOF for HTL biocrude production',
    category: 'economics',
    inputs: [
      {
        id: 'capex',
        name: 'CAPEX',
        description: 'Capital cost per tonne-year capacity',
        type: 'number',
        unit: '$/tonne-yr',
        min: 1000,
        max: 10000,
        defaultValue: 5000,
        required: true,
      },
      {
        id: 'opexFixed',
        name: 'Fixed OPEX',
        description: 'Fixed operating cost per tonne feedstock',
        type: 'number',
        unit: '$/tonne',
        min: 50,
        max: 500,
        defaultValue: 200,
        required: true,
      },
      {
        id: 'feedstockCost',
        name: 'Feedstock Cost',
        description: 'Cost per tonne (negative for tipping fee revenue)',
        type: 'number',
        unit: '$/tonne',
        min: -100,
        max: 200,
        defaultValue: -55,
        required: true,
      },
      {
        id: 'biocrudeYield',
        name: 'Biocrude Yield',
        description: 'Liters of biocrude per tonne feedstock',
        type: 'number',
        unit: 'L/tonne',
        min: 50,
        max: 400,
        defaultValue: 200,
        required: true,
      },
      {
        id: 'biocharYield',
        name: 'Biochar Yield',
        description: 'Kg of biochar per tonne feedstock',
        type: 'number',
        unit: 'kg/tonne',
        min: 50,
        max: 300,
        defaultValue: 150,
        required: true,
      },
      {
        id: 'biocharPrice',
        name: 'Biochar Price',
        description: 'Market price for biochar',
        type: 'number',
        unit: '$/kg',
        min: 0.1,
        max: 1.0,
        defaultValue: 0.4,
        required: true,
      },
      {
        id: 'capacityFactor',
        name: 'Capacity Factor',
        description: 'Annual utilization rate',
        type: 'number',
        unit: 'fraction',
        min: 0.3,
        max: 0.95,
        defaultValue: 0.8,
        required: true,
      },
      {
        id: 'lifetime',
        name: 'Project Lifetime',
        description: 'Operating lifetime',
        type: 'number',
        unit: 'years',
        min: 10,
        max: 30,
        defaultValue: 20,
        required: true,
      },
      {
        id: 'discountRate',
        name: 'Discount Rate',
        description: 'WACC or discount rate',
        type: 'number',
        unit: 'fraction',
        min: 0.05,
        max: 0.15,
        defaultValue: 0.08,
        required: true,
      },
    ],
    outputs: [
      { id: 'lcof', name: 'LCOF', description: 'Levelized cost of fuel', unit: '$/liter' },
      { id: 'annualizedCapex', name: 'Annualized CAPEX', description: 'Annual capital cost', unit: '$/tonne-yr' },
      { id: 'netCostPerTonne', name: 'Net Cost', description: 'Net cost per tonne feedstock', unit: '$/tonne' },
    ],
    calculate: (inputs) =>
      calculateLCOF(
        Number(inputs.capex),
        Number(inputs.opexFixed),
        Number(inputs.feedstockCost),
        Number(inputs.biocrudeYield),
        Number(inputs.biocharYield),
        Number(inputs.biocharPrice),
        Number(inputs.capacityFactor),
        Number(inputs.lifetime),
        Number(inputs.discountRate)
      ),
    citation: 'NREL HTL TEA 2024, DOE BETO',
  },
  {
    id: 'efficiency_claim_validator',
    name: 'Efficiency Claim Validator',
    description: 'Validate efficiency claims against physical limits and benchmarks',
    category: 'validation',
    inputs: [
      {
        id: 'claimedEfficiency',
        name: 'Claimed Efficiency',
        description: 'Efficiency value being claimed',
        type: 'number',
        unit: '%',
        min: 0,
        max: 100,
        defaultValue: 90,
        required: true,
      },
      {
        id: 'efficiencyType',
        name: 'Efficiency Type',
        description: 'Type of efficiency being claimed',
        type: 'select',
        unit: '',
        options: [
          { value: 'mass', label: 'Mass Conversion' },
          { value: 'energy', label: 'Energy Conversion' },
          { value: 'carbon', label: 'Carbon Conversion' },
        ],
        defaultValue: 'mass',
        required: true,
      },
    ],
    outputs: [
      { id: 'verdict', name: 'Verdict', description: 'Assessment of claim validity', unit: '' },
      { id: 'confidence', name: 'Confidence', description: 'Confidence in assessment', unit: '' },
      { id: 'isValidClaim', name: 'Is Valid', description: 'Whether claim is physically possible (1=yes, 0=no)', unit: '' },
    ],
    calculate: (inputs) =>
      validateEfficiencyClaim(
        Number(inputs.claimedEfficiency),
        String(inputs.efficiencyType)
      ),
    citation: 'PNNL HTL Benchmarks, Thermodynamic limits',
  },
]

// ============================================================================
// Validation Rules
// ============================================================================

export const WASTE_TO_FUEL_VALIDATION_RULES: ValidationRule[] = [
  {
    id: 'htl_temperature_range',
    name: 'HTL Temperature Range',
    description: 'HTL operating temperature must be within subcritical to supercritical range',
    severity: 'error',
    check: (value) => value >= 250 && value <= 400,
    message: 'HTL temperature must be between 250-400C for effective operation',
  },
  {
    id: 'htl_pressure_adequacy',
    name: 'HTL Pressure Adequacy',
    description: 'Pressure must be sufficient to maintain water state',
    severity: 'error',
    check: (value) => value >= 10 && value <= 35,
    message: 'HTL pressure must be 10-35 MPa to maintain liquid/supercritical water',
  },
  {
    id: 'biocrude_yield_bounds',
    name: 'Biocrude Yield Physical Bounds',
    description: 'Biocrude yield cannot exceed physical limits',
    severity: 'error',
    check: (value) => value <= 60,
    message: 'Biocrude yield exceeding 60 wt% is not achievable with current HTL technology',
  },
  {
    id: 'energy_efficiency_bounds',
    name: 'Energy Efficiency Physical Bounds',
    description: 'Energy efficiency cannot exceed thermodynamic limits',
    severity: 'error',
    check: (value) => value <= 85,
    message: 'Energy efficiency exceeding 85% violates second-law limits for HTL',
  },
  {
    id: 'mass_balance_closure',
    name: 'Mass Balance Closure',
    description: 'Mass balance should close within acceptable tolerance',
    severity: 'warning',
    check: (value) => value >= 95,
    message: 'Mass balance closure below 95% indicates measurement or process issues',
  },
  {
    id: 'biocrude_hhv_range',
    name: 'Biocrude HHV Range',
    description: 'Biocrude heating value must be within characteristic range',
    severity: 'warning',
    check: (value) => value >= 28 && value <= 42,
    message: 'Biocrude HHV outside typical range (28-42 MJ/kg) - verify feedstock/process',
  },
  {
    id: 'lcof_reasonableness',
    name: 'LCOF Reasonableness Check',
    description: 'LCOF should be within plausible range for HTL technology',
    severity: 'warning',
    check: (value) => value >= 2 && value <= 20,
    message: 'LCOF outside typical range ($2-20/L) - verify cost assumptions',
  },
]

// ============================================================================
// Simulation Templates
// ============================================================================

export const WASTE_TO_FUEL_SIMULATION_TEMPLATES: SimulationTemplate[] = [
  {
    id: 'htl_process_optimization',
    name: 'HTL Process Optimization',
    description: 'Optimize HTL operating parameters for maximum biocrude yield and quality',
    provider: 'modal',
    parameters: {
      temperatureRange: [280, 380],
      pressureRange: [15, 30],
      residenceTimeRange: [10, 60],
      feedstockTypes: ['msw', 'food-waste', 'sewage-sludge'],
      optimizationTarget: 'biocrude_yield',
    },
    estimatedCost: 0.30,
    estimatedDuration: 400,
  },
  {
    id: 'htl_tea_sensitivity',
    name: 'HTL TEA Sensitivity Analysis',
    description: 'Analyze LCOF sensitivity to key economic parameters',
    provider: 'modal',
    parameters: {
      capexRange: [2000, 8000],
      feedstockCostRange: [-80, 50],
      biocrudeYieldRange: [150, 300],
      capacityFactorRange: [0.5, 0.9],
      biocharPriceRange: [0.2, 0.8],
    },
    estimatedCost: 0.25,
    estimatedDuration: 300,
  },
  {
    id: 'htl_mass_energy_balance',
    name: 'HTL Mass/Energy Balance Validation',
    description: 'Validate mass and energy balance for given process conditions',
    provider: 'analytical',
    parameters: {
      validateMassClosure: true,
      validateEnergyClosure: true,
      tolerancePercent: 2,
    },
    estimatedCost: 0,
    estimatedDuration: 5,
  },
  {
    id: 'eden_eep_assessment',
    name: 'EDEN EEP Technology Assessment',
    description: 'Full assessment of EDEN Energy EEP waste-to-fuel technology',
    provider: 'modal',
    parameters: {
      processStages: ['Prepare', 'Reduce', 'Convert', 'Refine', 'Generate', 'Expand'],
      claimsToValidate: ['>90% conversion', 'carbon neutral', 'no harmful byproducts'],
      products: ['biocrude', 'biochar', 'fertilizer'],
      assessmentType: 'comprehensive',
    },
    estimatedCost: 0.50,
    estimatedDuration: 600,
  },
]

// ============================================================================
// Form Configuration
// ============================================================================

export const WASTE_TO_FUEL_FORM_CONFIG: DomainFormConfig = {
  sections: [
    {
      id: 'feedstock',
      title: 'Feedstock Characteristics',
      fields: [
        WASTE_TO_FUEL_CALCULATORS[0].inputs[0], // moisture
        WASTE_TO_FUEL_CALCULATORS[0].inputs[1], // ash
        WASTE_TO_FUEL_CALCULATORS[0].inputs[4], // type
      ],
    },
    {
      id: 'process',
      title: 'Process Parameters',
      fields: [
        WASTE_TO_FUEL_CALCULATORS[0].inputs[2], // temp
        WASTE_TO_FUEL_CALCULATORS[0].inputs[3], // residence time
      ],
    },
    {
      id: 'economics',
      title: 'Economic Parameters',
      fields: WASTE_TO_FUEL_CALCULATORS[2].inputs.slice(0, 6),
    },
  ],
  presets: [
    {
      id: 'msw_pilot',
      name: 'MSW Pilot Plant',
      values: {
        feedstockType: 'msw',
        feedstockMoisture: 75,
        feedstockAsh: 12,
        reactorTemp: 320,
        residenceTime: 30,
        capex: 6000,
        feedstockCost: -55,
      },
    },
    {
      id: 'food_waste_demo',
      name: 'Food Waste Demo',
      values: {
        feedstockType: 'food-waste',
        feedstockMoisture: 80,
        feedstockAsh: 5,
        reactorTemp: 300,
        residenceTime: 25,
        capex: 5500,
        feedstockCost: -40,
      },
    },
    {
      id: 'eden_eep',
      name: 'EDEN Energy EEP',
      values: {
        feedstockType: 'msw',
        feedstockMoisture: 70,
        feedstockAsh: 10,
        reactorTemp: 330,
        residenceTime: 35,
        capex: 5000,
        feedstockCost: -60,
      },
    },
  ],
}

// ============================================================================
// Module Export
// ============================================================================

class WasteToFuelDomain extends BaseDomainModule {
  id = 'waste-to-fuel' as const
  name = 'Waste-to-Fuel (HTL)'
  description = 'Hydrothermal liquefaction and thermal cracking for waste-to-fuel conversion'
  icon = 'recycle'
  physicalLimits = WASTE_TO_FUEL_PHYSICAL_LIMITS
  industryBenchmarks = WASTE_TO_FUEL_BENCHMARKS
  calculators = WASTE_TO_FUEL_CALCULATORS
  validationRules = WASTE_TO_FUEL_VALIDATION_RULES
  simulationTemplates = WASTE_TO_FUEL_SIMULATION_TEMPLATES
  inputFormConfig = WASTE_TO_FUEL_FORM_CONFIG
}

export const WasteToFuelDomainModule = new WasteToFuelDomain()

export default WasteToFuelDomainModule
