/**
 * Hydrothermal Liquefaction (HTL) Technology Model
 *
 * TEA model for waste-to-fuel production via HTL, supporting multi-output products:
 * - Biocrude (primary product)
 * - Biochar (carbon sink / soil amendment)
 * - Syngas (process energy or sale)
 * - Aqueous phase (fertilizer value or treatment cost)
 *
 * Based on PNNL HTL studies, NREL TEA, and IEA Bioenergy Task 39
 */

import type { TEAInput_v2 } from '@/types/tea'

// ============================================================================
// Types and Interfaces
// ============================================================================

export type FeedstockType =
  | 'msw'
  | 'food-waste'
  | 'agricultural'
  | 'algae'
  | 'sewage-sludge'
  | 'woody-biomass'
  | 'mixed-organic'

export type ProductId = 'biocrude' | 'biochar' | 'syngas' | 'fertilizer' | 'electricity'

export type AllocationBasis = 'mass' | 'energy' | 'market-value'

export interface HTLProductSpec {
  id: ProductId
  yieldPerTonneFeedstock: number // kg or kWh per tonne dry feedstock
  pricePerUnit: number // $/kg or $/kWh
  unit: string
  energyContent?: number // MJ/kg for products (for allocation)
  allocationBasis: AllocationBasis
}

export interface HTLSpecs {
  // Feedstock
  feedstock: {
    type: FeedstockType
    costPerTonne: number // $/tonne wet (negative = tipping fee revenue)
    capacityWet: number // tonnes/day wet feedstock
    moisture: number // % wet basis
    ash: number // % dry basis
    hhv: number // MJ/kg dry basis (Higher Heating Value)
  }

  // Process parameters
  process: {
    reactorTemperature: number // C (typically 300-350)
    reactorPressure: number // MPa (typically 15-25)
    residenceTime: number // minutes (typically 15-60)
    waterRecycleRate: number // 0-0.95 (fraction recycled)
    heatingEfficiency: number // % (heat recovery efficiency)
  }

  // Product specifications
  products: HTLProductSpec[]

  // Utilities
  utilities: {
    steamCostPerMJ: number // $/MJ
    electricityCostPerKWh: number // $/kWh
    waterCostPerM3: number // $/m3
    naturalGasCostPerGJ: number // $/GJ (for supplemental heating)
  }

  // System parameters
  system: {
    lifetime: number // years
    capacityFactor: number // %
    trl: number // Technology Readiness Level
  }

  // Cost parameters
  costs: {
    capexPerTonneYr: number // $/tonne-yr capacity
    omCostsPercent: number // % of CAPEX per year
    laborCostPerYear: number // $/year
    insuranceRate: number // % of CAPEX
    maintenanceRate: number // % of CAPEX
  }

  // Carbon accounting
  carbon: {
    biogenicFraction: number // % of carbon from biogenic sources
    gridIntensity: number // gCO2e/kWh
    naturalGasIntensity: number // gCO2e/MJ
    biocharCarbonSequestration: number // kg CO2e sequestered per kg biochar
  }
}

export interface HTLMassBalance {
  inputs: {
    wetFeedstock: number // kg/day
    dryFeedstock: number // kg/day
    water: number // kg/day (process water)
  }
  outputs: {
    biocrude: number // kg/day
    biochar: number // kg/day
    aqueousPhase: number // kg/day
    gasPhase: number // kg/day
    water: number // kg/day (separated)
  }
  yields: {
    biocrude: number // wt% dry feedstock
    biochar: number // wt% dry feedstock
    aqueousPhase: number // wt% dry feedstock
    gasPhase: number // wt% dry feedstock
  }
  closureError: number // % (should be <2%)
}

export interface HTLEnergyBalance {
  inputs: {
    feedstockEnergy: number // MJ/day (HHV basis)
    steamEnergy: number // MJ/day
    electricityEnergy: number // MJ/day
    naturalGasEnergy: number // MJ/day (supplemental)
    total: number // MJ/day
  }
  outputs: {
    biocrudeEnergy: number // MJ/day
    biocharEnergy: number // MJ/day
    syngasEnergy: number // MJ/day
    thermalLosses: number // MJ/day
    total: number // MJ/day
  }
  efficiency: {
    gross: number // % (product energy / feedstock energy)
    net: number // % (product energy / total input energy)
    energyRatio: number // MJ out / MJ in
  }
}

export interface ProductEconomics {
  productId: ProductId
  annualProduction: number // kg or kWh
  annualRevenue: number // $
  allocatedCost: number // $ (using selected allocation basis)
  unitCost: number // $/kg or $/kWh
  marginPerUnit: number // $/kg or $/kWh
  contributionMargin: number // %
}

export interface HTLTEAResult {
  // Primary economic metrics
  lcof: number // $/liter biocrude (primary metric)
  lcofPerGJ: number // $/GJ energy equivalent
  npv: number // $ Net Present Value
  irr: number // % Internal Rate of Return
  paybackYears: number // Simple payback period

  // Per-product economics
  productEconomics: ProductEconomics[]

  // Capital and operating costs
  capex: {
    equipment: number
    installation: number
    indirect: number
    contingency: number
    total: number
    perTonneYrCapacity: number
  }
  opex: {
    feedstock: number // Annual (may be negative for tipping fees)
    utilities: number // Annual
    labor: number // Annual
    maintenance: number // Annual
    insurance: number // Annual
    total: number // Annual
  }

  // Revenue breakdown
  revenue: {
    biocrude: number // Annual
    biochar: number // Annual
    tippingFees: number // Annual
    otherProducts: number // Annual
    carbonCredits: number // Annual
    total: number // Annual
  }

  // Mass and energy balances
  massBalance: HTLMassBalance
  energyBalance: HTLEnergyBalance

  // Carbon metrics
  carbonIntensity: number // g CO2e/MJ biocrude
  netCarbonBalance: number // tonnes CO2e/year (negative = carbon negative)

  // Sensitivity indicators
  breakEvenBiocrudePrice: number // $/liter to achieve NPV=0
  breakEvenTippingFee: number // $/tonne to achieve NPV=0
}

// ============================================================================
// Default Values and Feedstock Database
// ============================================================================

const FEEDSTOCK_DEFAULTS: Record<FeedstockType, {
  moisture: number
  ash: number
  hhv: number
  biocrudeYieldFactor: number
  biocharYieldFactor: number
}> = {
  'msw': { moisture: 60, ash: 15, hhv: 18, biocrudeYieldFactor: 1.0, biocharYieldFactor: 1.0 },
  'food-waste': { moisture: 75, ash: 5, hhv: 20, biocrudeYieldFactor: 1.2, biocharYieldFactor: 0.8 },
  'agricultural': { moisture: 30, ash: 8, hhv: 17, biocrudeYieldFactor: 0.9, biocharYieldFactor: 1.2 },
  'algae': { moisture: 80, ash: 8, hhv: 22, biocrudeYieldFactor: 1.4, biocharYieldFactor: 0.6 },
  'sewage-sludge': { moisture: 75, ash: 25, hhv: 15, biocrudeYieldFactor: 1.1, biocharYieldFactor: 1.0 },
  'woody-biomass': { moisture: 40, ash: 3, hhv: 19, biocrudeYieldFactor: 0.8, biocharYieldFactor: 1.4 },
  'mixed-organic': { moisture: 55, ash: 12, hhv: 17, biocrudeYieldFactor: 1.0, biocharYieldFactor: 1.0 },
}

const TRL_CAPEX_MULTIPLIERS: Record<number, number> = {
  4: 2.0,
  5: 1.5,
  6: 1.3,
  7: 1.1,
  8: 1.0,
  9: 0.85,
}

// ============================================================================
// HTL Model Class
// ============================================================================

export class HTLModel {
  private specs: HTLSpecs

  constructor(specs: Partial<HTLSpecs>) {
    this.specs = this.mergeWithDefaults(specs)
  }

  private mergeWithDefaults(partial: Partial<HTLSpecs>): HTLSpecs {
    const feedstockType = partial.feedstock?.type || 'msw'
    const feedstockDefaults = FEEDSTOCK_DEFAULTS[feedstockType]

    return {
      feedstock: {
        type: feedstockType,
        costPerTonne: -50, // Tipping fee revenue by default
        capacityWet: 100, // tonnes/day
        moisture: feedstockDefaults.moisture,
        ash: feedstockDefaults.ash,
        hhv: feedstockDefaults.hhv,
        ...partial.feedstock,
      },
      process: {
        reactorTemperature: 320, // C
        reactorPressure: 18, // MPa
        residenceTime: 30, // minutes
        waterRecycleRate: 0.85, // 85% water recycling
        heatingEfficiency: 0.75, // 75% heat recovery
        ...partial.process,
      },
      products: partial.products || [
        { id: 'biocrude', yieldPerTonneFeedstock: 280, pricePerUnit: 0.7, unit: 'kg', energyContent: 35, allocationBasis: 'energy' },
        { id: 'biochar', yieldPerTonneFeedstock: 150, pricePerUnit: 0.3, unit: 'kg', energyContent: 25, allocationBasis: 'energy' },
        { id: 'syngas', yieldPerTonneFeedstock: 80, pricePerUnit: 0.05, unit: 'kg', energyContent: 18, allocationBasis: 'energy' },
        { id: 'fertilizer', yieldPerTonneFeedstock: 20, pricePerUnit: 0.4, unit: 'kg', allocationBasis: 'mass' },
      ],
      utilities: {
        steamCostPerMJ: 0.008, // $/MJ
        electricityCostPerKWh: 0.08, // $/kWh
        waterCostPerM3: 1.5, // $/m3
        naturalGasCostPerGJ: 8, // $/GJ
        ...partial.utilities,
      },
      system: {
        lifetime: 20, // years
        capacityFactor: 85, // %
        trl: 6,
        ...partial.system,
      },
      costs: {
        capexPerTonneYr: 5000, // $/tonne-yr at TRL 7-8
        omCostsPercent: 4, // % of CAPEX
        laborCostPerYear: 500000, // $
        insuranceRate: 0.5, // % of CAPEX
        maintenanceRate: 3, // % of CAPEX
        ...partial.costs,
      },
      carbon: {
        biogenicFraction: 90, // % (MSW is mostly biogenic)
        gridIntensity: 400, // gCO2e/kWh
        naturalGasIntensity: 56, // gCO2e/MJ
        biocharCarbonSequestration: 2.8, // kg CO2e per kg biochar
        ...partial.carbon,
      },
    }
  }

  /**
   * Calculate daily dry feedstock from wet capacity
   */
  private getDryFeedstockDaily(): number {
    const { capacityWet, moisture } = this.specs.feedstock
    return capacityWet * (1 - moisture / 100)
  }

  /**
   * Calculate annual dry feedstock
   */
  private getDryFeedstockAnnual(): number {
    return this.getDryFeedstockDaily() * 365 * (this.specs.system.capacityFactor / 100)
  }

  /**
   * Calculate product yields based on feedstock type and process conditions
   */
  private calculateYields(): { biocrude: number; biochar: number; aqueous: number; gas: number } {
    const { type } = this.specs.feedstock
    const { reactorTemperature, residenceTime } = this.specs.process
    const feedstockFactors = FEEDSTOCK_DEFAULTS[type]

    // Base yields (wt% of dry feedstock)
    let baseYieldBiocrude = 30 * feedstockFactors.biocrudeYieldFactor
    let baseYieldBiochar = 20 * feedstockFactors.biocharYieldFactor

    // Temperature effect (higher temp = more biocrude, less biochar)
    const tempFactor = (reactorTemperature - 300) / 50 // normalized around 300C
    baseYieldBiocrude += tempFactor * 5
    baseYieldBiochar -= tempFactor * 3

    // Residence time effect (longer = more conversion)
    const timeFactor = Math.min((residenceTime - 15) / 45, 1) // 0-1 scale
    baseYieldBiocrude += timeFactor * 3
    baseYieldBiochar += timeFactor * 2

    // Ensure bounds
    baseYieldBiocrude = Math.min(Math.max(baseYieldBiocrude, 15), 55)
    baseYieldBiochar = Math.min(Math.max(baseYieldBiochar, 10), 30)

    const gas = 10 + tempFactor * 2 // 8-12%
    const aqueous = 100 - baseYieldBiocrude - baseYieldBiochar - gas

    return {
      biocrude: baseYieldBiocrude,
      biochar: baseYieldBiochar,
      aqueous: Math.max(aqueous, 20),
      gas: Math.max(gas, 5),
    }
  }

  /**
   * Calculate mass balance
   */
  calculateMassBalance(): HTLMassBalance {
    const { capacityWet, moisture, ash } = this.specs.feedstock
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Daily inputs
    const wetFeedstock = capacityWet * 1000 // kg/day
    const dryFeedstock = wetFeedstock * (1 - moisture / 100)
    const feedstockWater = wetFeedstock - dryFeedstock

    // Get yields
    const yields = this.calculateYields()

    // Daily outputs (kg/day)
    const biocrude = dryFeedstock * (yields.biocrude / 100)
    const biochar = dryFeedstock * (yields.biochar / 100)
    const aqueousPhase = dryFeedstock * (yields.aqueous / 100)
    const gasPhase = dryFeedstock * (yields.gas / 100)

    // Mass balance
    const totalIn = dryFeedstock
    const totalOut = biocrude + biochar + aqueousPhase + gasPhase
    const closureError = Math.abs((totalIn - totalOut) / totalIn) * 100

    return {
      inputs: {
        wetFeedstock,
        dryFeedstock,
        water: feedstockWater * (1 - this.specs.process.waterRecycleRate),
      },
      outputs: {
        biocrude,
        biochar,
        aqueousPhase,
        gasPhase,
        water: feedstockWater * this.specs.process.waterRecycleRate,
      },
      yields: {
        biocrude: yields.biocrude,
        biochar: yields.biochar,
        aqueousPhase: yields.aqueous,
        gasPhase: yields.gas,
      },
      closureError,
    }
  }

  /**
   * Calculate energy balance
   */
  calculateEnergyBalance(): HTLEnergyBalance {
    const massBalance = this.calculateMassBalance()
    const { hhv } = this.specs.feedstock
    const { heatingEfficiency } = this.specs.process

    // Feedstock energy (MJ/day)
    const feedstockEnergy = massBalance.inputs.dryFeedstock * hhv

    // Heating requirement (MJ/day) - to reach reaction temperature
    // Assume water needs heating from 25C to 300+C
    const waterMass = massBalance.inputs.wetFeedstock - massBalance.inputs.dryFeedstock
    const cpWater = 4.18 // kJ/kg-K
    const deltaT = this.specs.process.reactorTemperature - 25
    const heatingRequired = (waterMass * cpWater * deltaT) / 1000 // MJ/day
    const steamEnergy = heatingRequired / heatingEfficiency

    // Electricity for pumping, mixing, etc. (estimate 50 kWh/tonne wet feedstock)
    const electricityKWh = (massBalance.inputs.wetFeedstock / 1000) * 50
    const electricityEnergy = electricityKWh * 3.6 // MJ/day

    // Natural gas supplement (if needed)
    const naturalGasEnergy = steamEnergy * 0.2 // 20% from NG typically

    // Product energies (MJ/day)
    const biocrudeHHV = 35 // MJ/kg
    const biocharHHV = 25 // MJ/kg
    const syngasHHV = 18 // MJ/kg

    const biocrudeEnergy = massBalance.outputs.biocrude * biocrudeHHV
    const biocharEnergy = massBalance.outputs.biochar * biocharHHV
    const syngasEnergy = massBalance.outputs.gasPhase * syngasHHV

    const totalInputEnergy = feedstockEnergy + steamEnergy + electricityEnergy + naturalGasEnergy
    const totalProductEnergy = biocrudeEnergy + biocharEnergy + syngasEnergy
    const thermalLosses = feedstockEnergy - totalProductEnergy + steamEnergy * (1 - heatingEfficiency)

    return {
      inputs: {
        feedstockEnergy,
        steamEnergy,
        electricityEnergy,
        naturalGasEnergy,
        total: totalInputEnergy,
      },
      outputs: {
        biocrudeEnergy,
        biocharEnergy,
        syngasEnergy,
        thermalLosses,
        total: totalProductEnergy,
      },
      efficiency: {
        gross: (totalProductEnergy / feedstockEnergy) * 100,
        net: (totalProductEnergy / totalInputEnergy) * 100,
        energyRatio: totalProductEnergy / totalInputEnergy,
      },
    }
  }

  /**
   * Calculate CAPEX
   */
  calculateCAPEX(): HTLTEAResult['capex'] {
    const annualCapacity = this.specs.feedstock.capacityWet * 365 // tonnes/year wet
    const trlMultiplier = TRL_CAPEX_MULTIPLIERS[this.specs.system.trl] || 1.0

    const baseCapex = annualCapacity * this.specs.costs.capexPerTonneYr * trlMultiplier

    const equipment = baseCapex * 0.65 // 65% equipment
    const installation = baseCapex * 0.20 // 20% installation
    const indirect = baseCapex * 0.10 // 10% indirect costs
    const contingency = baseCapex * 0.05 // 5% contingency

    return {
      equipment,
      installation,
      indirect,
      contingency,
      total: equipment + installation + indirect + contingency,
      perTonneYrCapacity: this.specs.costs.capexPerTonneYr * trlMultiplier,
    }
  }

  /**
   * Calculate annual OPEX
   */
  calculateOPEX(): HTLTEAResult['opex'] {
    const capex = this.calculateCAPEX()
    const massBalance = this.calculateMassBalance()
    const energyBalance = this.calculateEnergyBalance()
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Feedstock cost (may be negative for tipping fees)
    const annualWetFeedstock = (massBalance.inputs.wetFeedstock / 1000) * operatingDays // tonnes/year
    const feedstockCost = annualWetFeedstock * this.specs.feedstock.costPerTonne

    // Utilities
    const annualSteam = energyBalance.inputs.steamEnergy * operatingDays // MJ/year
    const annualElectricity = (energyBalance.inputs.electricityEnergy / 3.6) * operatingDays // kWh/year
    const annualNaturalGas = energyBalance.inputs.naturalGasEnergy * operatingDays / 1000 // GJ/year
    const annualWater = (massBalance.inputs.water / 1000) * operatingDays // m3/year

    const steamCost = annualSteam * this.specs.utilities.steamCostPerMJ
    const electricityCost = annualElectricity * this.specs.utilities.electricityCostPerKWh
    const naturalGasCost = annualNaturalGas * this.specs.utilities.naturalGasCostPerGJ
    const waterCost = annualWater * this.specs.utilities.waterCostPerM3

    const utilityCost = steamCost + electricityCost + naturalGasCost + waterCost

    const laborCost = this.specs.costs.laborCostPerYear
    const maintenanceCost = capex.total * (this.specs.costs.maintenanceRate / 100)
    const insuranceCost = capex.total * (this.specs.costs.insuranceRate / 100)

    return {
      feedstock: feedstockCost,
      utilities: utilityCost,
      labor: laborCost,
      maintenance: maintenanceCost,
      insurance: insuranceCost,
      total: feedstockCost + utilityCost + laborCost + maintenanceCost + insuranceCost,
    }
  }

  /**
   * Calculate annual revenues
   */
  calculateRevenue(): HTLTEAResult['revenue'] {
    const massBalance = this.calculateMassBalance()
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Annual production
    const annualBiocrude = massBalance.outputs.biocrude * operatingDays // kg/year
    const annualBiochar = massBalance.outputs.biochar * operatingDays // kg/year

    // Find product prices from specs
    const biocrudeSpec = this.specs.products.find(p => p.id === 'biocrude')
    const biocharSpec = this.specs.products.find(p => p.id === 'biochar')
    const fertilizerSpec = this.specs.products.find(p => p.id === 'fertilizer')

    const biocrudeRevenue = annualBiocrude * (biocrudeSpec?.pricePerUnit || 0.7)
    const biocharRevenue = annualBiochar * (biocharSpec?.pricePerUnit || 0.3)

    // Tipping fees (if feedstock cost is negative, it's revenue)
    const annualWetFeedstock = (massBalance.inputs.wetFeedstock / 1000) * operatingDays
    const tippingFeeRevenue = this.specs.feedstock.costPerTonne < 0
      ? annualWetFeedstock * Math.abs(this.specs.feedstock.costPerTonne)
      : 0

    // Carbon credits from biochar
    const carbonCredits = annualBiochar * this.specs.carbon.biocharCarbonSequestration / 1000 * 50 // $50/tonne CO2

    // Other products (fertilizer, syngas)
    const aqueousFertilizerValue = massBalance.outputs.aqueousPhase * operatingDays * 0.05 // $0.05/kg

    return {
      biocrude: biocrudeRevenue,
      biochar: biocharRevenue,
      tippingFees: tippingFeeRevenue,
      otherProducts: aqueousFertilizerValue,
      carbonCredits,
      total: biocrudeRevenue + biocharRevenue + tippingFeeRevenue + aqueousFertilizerValue + carbonCredits,
    }
  }

  /**
   * Allocate costs by product
   */
  allocateCostsByProduct(totalCost: number): Record<ProductId, number> {
    const massBalance = this.calculateMassBalance()
    const energyBalance = this.calculateEnergyBalance()

    // Calculate allocation weights based on energy content
    const biocrudeEnergy = massBalance.outputs.biocrude * 35 // MJ
    const biocharEnergy = massBalance.outputs.biochar * 25 // MJ
    const syngasEnergy = massBalance.outputs.gasPhase * 18 // MJ
    const totalEnergy = biocrudeEnergy + biocharEnergy + syngasEnergy

    return {
      biocrude: totalCost * (biocrudeEnergy / totalEnergy),
      biochar: totalCost * (biocharEnergy / totalEnergy),
      syngas: totalCost * (syngasEnergy / totalEnergy),
      fertilizer: 0, // Aqueous phase cost not allocated to fertilizer
      electricity: 0,
    }
  }

  /**
   * Calculate per-product economics
   */
  calculateProductEconomics(): ProductEconomics[] {
    const massBalance = this.calculateMassBalance()
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)
    const capex = this.calculateCAPEX()
    const opex = this.calculateOPEX()

    // Total annual cost (annualized CAPEX + OPEX)
    const annualizedCapex = capex.total / this.specs.system.lifetime
    const totalAnnualCost = annualizedCapex + opex.total

    // Allocate costs
    const allocatedCosts = this.allocateCostsByProduct(totalAnnualCost)

    const results: ProductEconomics[] = []

    for (const product of this.specs.products) {
      let annualProduction: number
      let annualRevenue: number

      switch (product.id) {
        case 'biocrude':
          annualProduction = massBalance.outputs.biocrude * operatingDays
          annualRevenue = annualProduction * product.pricePerUnit
          break
        case 'biochar':
          annualProduction = massBalance.outputs.biochar * operatingDays
          annualRevenue = annualProduction * product.pricePerUnit
          break
        case 'syngas':
          annualProduction = massBalance.outputs.gasPhase * operatingDays
          annualRevenue = annualProduction * product.pricePerUnit
          break
        case 'fertilizer':
          annualProduction = massBalance.outputs.aqueousPhase * operatingDays * 0.1 // 10% nutrient recovery
          annualRevenue = annualProduction * product.pricePerUnit
          break
        default:
          annualProduction = 0
          annualRevenue = 0
      }

      const allocatedCost = allocatedCosts[product.id] || 0
      const unitCost = annualProduction > 0 ? allocatedCost / annualProduction : 0
      const marginPerUnit = product.pricePerUnit - unitCost
      const contributionMargin = annualRevenue > 0
        ? ((annualRevenue - allocatedCost) / annualRevenue) * 100
        : 0

      results.push({
        productId: product.id,
        annualProduction,
        annualRevenue,
        allocatedCost,
        unitCost,
        marginPerUnit,
        contributionMargin,
      })
    }

    return results
  }

  /**
   * Calculate LCOF (Levelized Cost of Fuel)
   */
  calculateLCOF(discountRate: number = 10): number {
    const massBalance = this.calculateMassBalance()
    const capex = this.calculateCAPEX()
    const opex = this.calculateOPEX()
    const revenue = this.calculateRevenue()
    const lifetime = this.specs.system.lifetime
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Annual biocrude production (liters)
    const biocrudeDensity = 0.95 // kg/L
    const annualBiocrudeKg = massBalance.outputs.biocrude * operatingDays
    const annualBiocrudeLiters = annualBiocrudeKg / biocrudeDensity

    // NPV of costs (excluding feedstock cost if it's revenue)
    let npvCosts = capex.total
    const annualOpexExFeedstock = opex.total - opex.feedstock + (opex.feedstock > 0 ? opex.feedstock : 0)

    // Subtract co-product revenues from costs
    const coProductRevenue = revenue.biochar + revenue.otherProducts + revenue.carbonCredits

    for (let year = 1; year <= lifetime; year++) {
      const netAnnualCost = annualOpexExFeedstock - coProductRevenue
      npvCosts += netAnnualCost / Math.pow(1 + discountRate / 100, year)
    }

    // NPV of biocrude production
    let npvProduction = 0
    for (let year = 1; year <= lifetime; year++) {
      npvProduction += annualBiocrudeLiters / Math.pow(1 + discountRate / 100, year)
    }

    return npvCosts / npvProduction
  }

  /**
   * Calculate carbon intensity
   */
  calculateCarbonIntensity(): { intensity: number; netBalance: number } {
    const energyBalance = this.calculateEnergyBalance()
    const massBalance = this.calculateMassBalance()
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Process emissions (from electricity and natural gas)
    const annualElectricityKWh = (energyBalance.inputs.electricityEnergy / 3.6) * operatingDays
    const annualNaturalGasMJ = energyBalance.inputs.naturalGasEnergy * operatingDays
    const gridEmissions = annualElectricityKWh * this.specs.carbon.gridIntensity / 1000 // kg CO2e
    const ngEmissions = annualNaturalGasMJ * this.specs.carbon.naturalGasIntensity / 1000 // kg CO2e

    // Biochar carbon sequestration (negative emissions)
    const annualBiocharKg = massBalance.outputs.biochar * operatingDays
    const sequesteredCarbon = annualBiocharKg * this.specs.carbon.biocharCarbonSequestration // kg CO2e

    // Net emissions
    const totalProcessEmissions = gridEmissions + ngEmissions
    const netEmissions = totalProcessEmissions - sequesteredCarbon // kg CO2e/year

    // Carbon intensity (g CO2e/MJ of biocrude)
    const annualBiocrude = massBalance.outputs.biocrude * operatingDays
    const annualBiocrudeEnergy = annualBiocrude * 35 // MJ (HHV)
    const carbonIntensity = (netEmissions * 1000) / annualBiocrudeEnergy // g CO2e/MJ

    return {
      intensity: carbonIntensity,
      netBalance: netEmissions / 1000, // tonnes CO2e/year
    }
  }

  /**
   * Calculate NPV and IRR
   */
  calculateFinancials(discountRate: number = 10): { npv: number; irr: number; payback: number } {
    const capex = this.calculateCAPEX()
    const opex = this.calculateOPEX()
    const revenue = this.calculateRevenue()
    const lifetime = this.specs.system.lifetime

    const annualNetCashFlow = revenue.total - opex.total
    const cashFlows = [-capex.total]
    for (let i = 0; i < lifetime; i++) {
      cashFlows.push(annualNetCashFlow)
    }

    // NPV calculation
    let npv = -capex.total
    for (let year = 1; year <= lifetime; year++) {
      npv += annualNetCashFlow / Math.pow(1 + discountRate / 100, year)
    }

    // IRR calculation (iterative)
    let irr = 0
    for (let rate = -50; rate <= 100; rate += 0.5) {
      let testNpv = -capex.total
      for (let year = 1; year <= lifetime; year++) {
        testNpv += annualNetCashFlow / Math.pow(1 + rate / 100, year)
      }
      if (testNpv < 0) {
        irr = rate - 0.5
        break
      }
    }

    // Simple payback
    const payback = annualNetCashFlow > 0 ? capex.total / annualNetCashFlow : Infinity

    return { npv, irr, payback }
  }

  /**
   * Calculate full TEA result
   */
  calculateTEA(discountRate: number = 10): HTLTEAResult {
    const massBalance = this.calculateMassBalance()
    const energyBalance = this.calculateEnergyBalance()
    const capex = this.calculateCAPEX()
    const opex = this.calculateOPEX()
    const revenue = this.calculateRevenue()
    const productEconomics = this.calculateProductEconomics()
    const lcof = this.calculateLCOF(discountRate)
    const carbonMetrics = this.calculateCarbonIntensity()
    const financials = this.calculateFinancials(discountRate)

    // LCOF in energy terms
    const biocrudeHHV = 35 // MJ/kg
    const biocrudeDensity = 0.95 // kg/L
    const lcofPerGJ = lcof / (biocrudeHHV * biocrudeDensity / 1000)

    // Break-even calculations
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)
    const annualBiocrude = massBalance.outputs.biocrude * operatingDays / biocrudeDensity // liters
    const annualWetFeedstock = (massBalance.inputs.wetFeedstock / 1000) * operatingDays // tonnes

    // Break-even biocrude price for NPV=0
    const totalAnnualCost = (capex.total / this.specs.system.lifetime) + opex.total
    const coProductRevenue = revenue.biochar + revenue.otherProducts + revenue.carbonCredits + revenue.tippingFees
    const breakEvenBiocrudePrice = (totalAnnualCost - coProductRevenue) / annualBiocrude

    // Break-even tipping fee for NPV=0
    const biocrudeRevenue = revenue.biocrude
    const netCostAfterBiocrude = totalAnnualCost - biocrudeRevenue - (revenue.biochar + revenue.otherProducts + revenue.carbonCredits)
    const breakEvenTippingFee = netCostAfterBiocrude / annualWetFeedstock

    return {
      lcof,
      lcofPerGJ,
      npv: financials.npv,
      irr: financials.irr,
      paybackYears: financials.payback,
      productEconomics,
      capex,
      opex,
      revenue,
      massBalance,
      energyBalance,
      carbonIntensity: carbonMetrics.intensity,
      netCarbonBalance: carbonMetrics.netBalance,
      breakEvenBiocrudePrice,
      breakEvenTippingFee,
    }
  }

  /**
   * Convert to standard TEAInput_v2 format
   */
  toTEAInput(projectName: string): TEAInput_v2 {
    const capex = this.calculateCAPEX()
    const opex = this.calculateOPEX()
    const energyBalance = this.calculateEnergyBalance()
    const operatingDays = 365 * (this.specs.system.capacityFactor / 100)

    // Convert biocrude energy to MW equivalent
    const annualBiocrudeEnergyMWh = (energyBalance.outputs.biocrudeEnergy * operatingDays) / 3600

    return {
      project_name: projectName,
      technology_type: 'waste-to-fuel',
      capacity_mw: annualBiocrudeEnergyMWh / 8760,
      capacity_factor: this.specs.system.capacityFactor,
      annual_production_mwh: annualBiocrudeEnergyMWh,
      capex_per_kw: capex.total / (annualBiocrudeEnergyMWh / 8760) / 1000,
      installation_factor: 1.2,
      land_cost: 200000,
      grid_connection_cost: 100000,
      opex_per_kw_year: opex.total / (annualBiocrudeEnergyMWh / 8760) / 1000,
      fixed_opex_annual: opex.labor + opex.maintenance + opex.insurance,
      variable_opex_per_mwh: opex.utilities / annualBiocrudeEnergyMWh,
      insurance_rate: this.specs.costs.insuranceRate,
      project_lifetime_years: this.specs.system.lifetime,
      discount_rate: 10,
      debt_ratio: 0.6,
      interest_rate: 7,
      tax_rate: 25,
      depreciation_years: 10,
      electricity_price_per_mwh: 80, // Biocrude value equivalent
      price_escalation_rate: 2,
      carbon_credit_per_ton: 50,
      carbon_intensity_avoided: this.specs.carbon.biocharCarbonSequestration * 0.1,
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createHTLModel(specs: Partial<HTLSpecs>): HTLModel {
  return new HTLModel(specs)
}

export function calculateHTLTEA(specs: Partial<HTLSpecs>, discountRate?: number): HTLTEAResult {
  const model = new HTLModel(specs)
  return model.calculateTEA(discountRate)
}

export function calculateMultiProductLCOF(specs: Partial<HTLSpecs>, discountRate?: number): number {
  const model = new HTLModel(specs)
  return model.calculateLCOF(discountRate)
}

export function allocateCostsByProduct(
  totalCost: number,
  products: HTLProductSpec[],
  basis: AllocationBasis = 'energy'
): Record<string, number> {
  if (basis === 'mass') {
    const totalMass = products.reduce((sum, p) => sum + p.yieldPerTonneFeedstock, 0)
    const allocation: Record<string, number> = {}
    for (const product of products) {
      allocation[product.id] = totalCost * (product.yieldPerTonneFeedstock / totalMass)
    }
    return allocation
  }

  if (basis === 'market-value') {
    const totalValue = products.reduce(
      (sum, p) => sum + p.yieldPerTonneFeedstock * p.pricePerUnit,
      0
    )
    const allocation: Record<string, number> = {}
    for (const product of products) {
      const productValue = product.yieldPerTonneFeedstock * product.pricePerUnit
      allocation[product.id] = totalCost * (productValue / totalValue)
    }
    return allocation
  }

  // Default: energy basis
  const totalEnergy = products.reduce(
    (sum, p) => sum + p.yieldPerTonneFeedstock * (p.energyContent || 0),
    0
  )
  const allocation: Record<string, number> = {}
  for (const product of products) {
    const productEnergy = product.yieldPerTonneFeedstock * (product.energyContent || 0)
    allocation[product.id] = totalEnergy > 0 ? totalCost * (productEnergy / totalEnergy) : 0
  }
  return allocation
}

// ============================================================================
// EDEN-Specific Configuration
// ============================================================================

export const EDEN_EEP_CONFIG: Partial<HTLSpecs> = {
  feedstock: {
    type: 'msw',
    costPerTonne: -60, // Strong tipping fee
    capacityWet: 200, // 200 tonnes/day wet
    moisture: 55,
    ash: 12,
    hhv: 18,
  },
  process: {
    reactorTemperature: 340,
    reactorPressure: 22,
    residenceTime: 45,
    waterRecycleRate: 0.90,
    heatingEfficiency: 0.80,
  },
  products: [
    { id: 'biocrude', yieldPerTonneFeedstock: 320, pricePerUnit: 0.75, unit: 'kg', energyContent: 36, allocationBasis: 'energy' },
    { id: 'biochar', yieldPerTonneFeedstock: 180, pricePerUnit: 0.35, unit: 'kg', energyContent: 26, allocationBasis: 'energy' },
    { id: 'syngas', yieldPerTonneFeedstock: 90, pricePerUnit: 0.06, unit: 'kg', energyContent: 20, allocationBasis: 'energy' },
    { id: 'fertilizer', yieldPerTonneFeedstock: 25, pricePerUnit: 0.45, unit: 'kg', allocationBasis: 'mass' },
  ],
  system: {
    lifetime: 25,
    capacityFactor: 88,
    trl: 6,
  },
  costs: {
    capexPerTonneYr: 4500,
    omCostsPercent: 3.5,
    laborCostPerYear: 600000,
    insuranceRate: 0.5,
    maintenanceRate: 2.5,
  },
  carbon: {
    biogenicFraction: 92,
    gridIntensity: 350,
    naturalGasIntensity: 52,
    biocharCarbonSequestration: 3.0,
  },
}

export function createEDENModel(): HTLModel {
  return new HTLModel(EDEN_EEP_CONFIG)
}
