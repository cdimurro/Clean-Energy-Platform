/**
 * EDEN Claims Validation Framework
 *
 * Physics-based validation for HTL (Hydrothermal Liquefaction) claims.
 * Provides structured validation rules for waste-to-fuel technology claims,
 * specifically designed for EDEN Energy's EEP (EDEN Energy Process).
 *
 * Based on PNNL HTL studies, NREL TEA, and IEA Bioenergy Task 39
 */

// ============================================================================
// Types
// ============================================================================

export type ClaimCategory =
  | 'efficiency'
  | 'environmental'
  | 'technical'
  | 'economic'
  | 'scale'
  | 'safety'

export type ValidationMethod =
  | 'physics-check'
  | 'lifecycle-analysis'
  | 'regulatory-check'
  | 'process-engineering'
  | 'benchmark-comparison'
  | 'mass-balance'
  | 'energy-balance'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type ConfidenceLevel = 'very-low' | 'low' | 'medium' | 'high' | 'very-high'

export interface BenchmarkRange {
  min?: number
  max?: number
  typical?: number
  unit: string
  notes?: string
}

export interface ClaimValidationRule {
  id: string
  claimPattern: string | RegExp
  claimType: ClaimCategory
  validationMethod: ValidationMethod
  benchmarks: Record<string, BenchmarkRange>
  interpretation: string
  validationSteps: string[]
  riskLevel: RiskLevel
  confidenceRequired: ConfidenceLevel
  physicsLimit?: {
    metric: string
    maxValue: number
    unit: string
    source: string
  }
  redFlags?: string[]
  dataRequests?: string[]
}

export interface ClaimValidationResult {
  claimId: string
  originalClaim: string
  matchedRule: string
  validated: boolean
  confidence: ConfidenceLevel
  riskLevel: RiskLevel
  interpretation: string
  findings: string[]
  dataGaps: string[]
  recommendations: string[]
  physicsCheck?: {
    passed: boolean
    limit: string
    claimedValue?: number
    limitValue: number
    margin?: number
  }
}

// ============================================================================
// EDEN Claims Validation Rules
// ============================================================================

export const EDEN_CLAIMS_VALIDATION: Record<string, ClaimValidationRule> = {
  'efficiency-90-percent': {
    id: 'efficiency-90-percent',
    claimPattern: /(?:>?\s*90|90\s*\+|over\s*90|above\s*90|90%?\s*or\s*higher)\s*%?\s*(?:conversion|efficiency)/i,
    claimType: 'efficiency',
    validationMethod: 'physics-check',
    benchmarks: {
      htlMassConversion: {
        min: 60, max: 85, typical: 75,
        unit: '%',
        notes: 'Mass conversion from dry feedstock to products'
      },
      htlEnergyConversion: {
        min: 50, max: 75, typical: 65,
        unit: '%',
        notes: 'Energy recovery from feedstock to products'
      },
      htlCarbonConversion: {
        min: 65, max: 85, typical: 75,
        unit: '%',
        notes: 'Carbon transferred to liquid/solid products'
      },
      secondLawLimit: {
        max: 85,
        unit: '%',
        notes: 'Thermodynamic limit for HTL energy recovery'
      }
    },
    interpretation: `
      "90% conversion" is an ambiguous claim that requires clarification:

      1. Mass Conversion (waste to products):
         - Industry typical: 60-85%
         - 90%+ requires exceptional conditions or non-standard accounting
         - May exclude ash, non-reactive materials

      2. Energy Conversion (input energy to product energy):
         - Industry typical: 50-75%
         - 90% EXCEEDS thermodynamic limits for wet feedstock HTL
         - Second-law efficiency limit ~85% for HTL

      3. Carbon Conversion:
         - Industry typical: 65-85%
         - 90% possible for highly optimized feedstocks

      ASSESSMENT: If claiming 90%+ energy efficiency, this likely violates
      thermodynamic principles. If mass conversion, need mass balance data.

      RECOMMENDATION: Request explicit definition and supporting mass/energy balance.
    `,
    validationSteps: [
      'Request explicit definition: mass, energy, or carbon conversion?',
      'Request complete mass balance data (all inputs and outputs)',
      'Calculate energy balance (feedstock HHV vs product HHV)',
      'Compare to PNNL/NREL benchmark studies',
      'Check if claim excludes certain streams (ash, water, etc.)',
      'Flag if exceeds 85% net energy recovery (physics limit)'
    ],
    riskLevel: 'high',
    confidenceRequired: 'high',
    physicsLimit: {
      metric: 'Net Energy Efficiency',
      maxValue: 85,
      unit: '%',
      source: 'Second-law thermodynamic limit for HTL processes'
    },
    redFlags: [
      'No mass balance data provided',
      'Efficiency definition not clarified',
      'Excludes process energy inputs',
      'Claims apply to all feedstock types'
    ],
    dataRequests: [
      'Complete mass balance for representative run',
      'Energy balance including all utilities',
      'Definition of "conversion" being used',
      'Third-party verification of efficiency claims'
    ]
  },

  'carbon-neutral': {
    id: 'carbon-neutral',
    claimPattern: /carbon\s*(?:neutral|negative|zero|free)|net[\s-]*zero\s*(?:carbon|emissions?)/i,
    claimType: 'environmental',
    validationMethod: 'lifecycle-analysis',
    benchmarks: {
      biogenicCarbonFraction: {
        min: 85, max: 100,
        unit: '%',
        notes: 'Fraction of feedstock carbon from biogenic sources'
      },
      processEmissions: {
        max: 50,
        unit: 'kg CO2e/tonne feedstock',
        notes: 'Direct process emissions (excluding biogenic)'
      },
      gridElectricityEmissions: {
        typical: 400,
        unit: 'gCO2e/kWh',
        notes: 'Varies by region and grid mix'
      },
      biocharSequestration: {
        min: 2.0, max: 3.5, typical: 2.8,
        unit: 'kg CO2e/kg biochar',
        notes: 'Carbon sequestered in stable biochar'
      }
    },
    interpretation: `
      Carbon neutrality for HTL depends on multiple factors:

      1. Biogenic Carbon:
         - If feedstock is 100% biogenic waste, combustion of biocrude
           releases carbon that was recently atmospheric
         - This is legitimate carbon accounting per IPCC

      2. Process Emissions:
         - Electricity consumption (grid-dependent)
         - Steam/heat generation (if from fossil sources)
         - Fugitive emissions (methane, VOCs)
         - Transportation of feedstock/products

      3. Carbon Sequestration:
         - Biochar production can sequester carbon long-term
         - Reduces net emissions if biochar is land-applied

      4. System Boundary:
         - Gate-to-gate: Just the HTL process
         - Cradle-to-gate: Includes feedstock collection
         - Cradle-to-grave: Includes product end-use

      ASSESSMENT: Carbon neutral is plausible if:
      - Feedstock is 100% biogenic
      - Process energy is renewable
      - Biochar is sequestered
      - Complete LCA supports the claim

      RECOMMENDATION: Request full lifecycle assessment with clear boundaries.
    `,
    validationSteps: [
      'Verify biogenic carbon fraction of feedstock',
      'Request LCA study with stated system boundaries',
      'Calculate process emissions from electricity and heat',
      'Check for fugitive emissions data (methane)',
      'Verify carbon credit methodology for biochar',
      'Compare to IPCC bioenergy carbon accounting guidelines'
    ],
    riskLevel: 'medium',
    confidenceRequired: 'medium',
    redFlags: [
      'No LCA study provided',
      'System boundary not defined',
      'Fossil fuel used for process heat',
      'No accounting for fugitive emissions',
      'Carbon credit assumptions unclear'
    ],
    dataRequests: [
      'Complete lifecycle assessment (ISO 14044 compliant)',
      'System boundary definition',
      'Grid electricity emissions factor for location',
      'Biochar carbon stability test results',
      'Third-party carbon accounting verification'
    ]
  },

  'no-harmful-byproducts': {
    id: 'no-harmful-byproducts',
    claimPattern: /no\s*(?:harmful|toxic|hazardous)\s*(?:byproducts?|waste|emissions?|outputs?)|zero\s*waste/i,
    claimType: 'environmental',
    validationMethod: 'regulatory-check',
    benchmarks: {
      aqueousPhaseOrganics: {
        max: 5000,
        unit: 'mg/L COD',
        notes: 'Chemical oxygen demand of aqueous phase'
      },
      biocharPAH: {
        max: 16,
        unit: 'mg/kg (EPA PAH16)',
        notes: 'Polycyclic aromatic hydrocarbons in biochar'
      },
      heavyMetals: {
        notes: 'Varies by regulation (EPA, EU limits)',
        unit: 'mg/kg'
      },
      nitrogenOxides: {
        max: 200,
        unit: 'ppm',
        notes: 'Stack emissions NOx'
      },
      sulfurCompounds: {
        max: 50,
        unit: 'ppm',
        notes: 'Stack emissions SO2'
      }
    },
    interpretation: `
      HTL processes inherently produce streams requiring treatment:

      1. Aqueous Phase:
         - Contains dissolved organics (COD typically 5,000-50,000 mg/L)
         - Contains ammonia and nutrients
         - Requires wastewater treatment before discharge
         - May have value as liquid fertilizer with proper treatment

      2. Biocrude:
         - Contains heteroatoms (N, S, O) requiring upgrading
         - May contain trace heavy metals from feedstock
         - Requires hydrotreating for fuel specification

      3. Biochar:
         - May concentrate heavy metals from feedstock
         - Possible PAH formation at high temperatures
         - Quality varies significantly with process conditions

      4. Gas Phase:
         - Contains CO2, CH4, H2, small organics
         - May require treatment before venting/use

      ASSESSMENT: "No harmful byproducts" is likely an overstatement.
      All HTL processes produce streams requiring treatment.

      RECOMMENDATION: Request environmental permits and emissions data.
    `,
    validationSteps: [
      'Request environmental permits (air, water, waste)',
      'Request stack emissions test data',
      'Request aqueous phase characterization and treatment plan',
      'Request biochar quality analysis (PAH, heavy metals)',
      'Compare to EPA/state discharge standards',
      'Review waste handling procedures'
    ],
    riskLevel: 'medium',
    confidenceRequired: 'high',
    redFlags: [
      'No environmental permits referenced',
      'No emissions data provided',
      'Aqueous phase not addressed',
      'Biochar quality not tested',
      'No waste handling plan'
    ],
    dataRequests: [
      'Environmental permits and compliance records',
      'Stack emissions test results',
      'Aqueous phase COD/BOD and treatment method',
      'Biochar analysis (PAH, metals, carbon content)',
      'Waste management plan',
      'MSDS for all products'
    ]
  },

  'handles-mixed-waste': {
    id: 'handles-mixed-waste',
    claimPattern: /(?:mixed|unsorted|any|all|diverse)\s*(?:waste|feedstock)|no\s*(?:sorting|preprocessing|separation)/i,
    claimType: 'technical',
    validationMethod: 'process-engineering',
    benchmarks: {
      feedstockFlexibility: {
        notes: 'HTL handles diverse organics but composition affects yield',
        unit: 'qualitative'
      },
      contaminantTolerance: {
        notes: 'Glass, metal, PVC require removal; chlorine problematic',
        unit: 'qualitative'
      },
      ashTolerance: {
        max: 25,
        unit: '% dry basis',
        notes: 'High ash reduces yield and may cause fouling'
      },
      moistureTolerance: {
        min: 50, max: 90,
        unit: '%',
        notes: 'HTL handles wet waste well'
      }
    },
    interpretation: `
      HTL can process diverse organic feedstocks, but with caveats:

      1. Composition Variability:
         - Biocrude yield varies with feedstock composition
         - High-lipid feedstocks give higher yields
         - Lignocellulosic materials give lower yields
         - Mixed waste gives variable, often lower yields

      2. Contaminants:
         - Glass: Inert but causes wear
         - Metals: Can catalyze unwanted reactions
         - PVC/chlorinated plastics: Releases HCl, damages equipment
         - Batteries, electronics: Hazardous, must be removed

      3. Pretreatment Typically Required:
         - Size reduction (shredding)
         - Foreign object removal (tramp metal)
         - Hazardous material screening
         - Moisture adjustment (for some feedstocks)

      ASSESSMENT: "No preprocessing" for raw MSW is unlikely.
      Some sorting/preparation is standard practice.

      RECOMMENDATION: Clarify what preprocessing is actually included.
    `,
    validationSteps: [
      'Request feedstock specification tolerances',
      'Identify pretreatment equipment included in system',
      'Review yield variability data by feedstock type',
      'Compare to proven HTL feedstock acceptance ranges',
      'Check for feedstock quality control procedures',
      'Verify system handles seasonal waste variability'
    ],
    riskLevel: 'low',
    confidenceRequired: 'medium',
    redFlags: [
      'No feedstock specification provided',
      'No pretreatment mentioned',
      'Claims identical yields for all feedstocks',
      'No quality control procedure',
      'Ignores contaminant issues'
    ],
    dataRequests: [
      'Feedstock specification with tolerances',
      'Pretreatment equipment list',
      'Yield data for different feedstock types',
      'Feedstock quality control procedures',
      'Contaminant handling protocol'
    ]
  },

  'modular-scalable': {
    id: 'modular-scalable',
    claimPattern: /modular|scalable|containerized|mobile|transportable|plug[\s-]*and[\s-]*play/i,
    claimType: 'scale',
    validationMethod: 'process-engineering',
    benchmarks: {
      moduleSize: {
        min: 10, max: 100, typical: 50,
        unit: 'tonnes/day wet feedstock',
        notes: 'Typical containerized module capacity'
      },
      scaleUpFactor: {
        max: 100,
        unit: 'x',
        notes: 'Maximum proven scale-up from lab to commercial'
      },
      installationTime: {
        min: 1, max: 6, typical: 3,
        unit: 'months',
        notes: 'Modular system installation time'
      }
    },
    interpretation: `
      Modular HTL systems are technically feasible:

      1. Containerized Units:
         - Typical capacity: 10-50 tonnes/day
         - Factory-built for quality control
         - Reduced site construction time
         - Easier permitting (in some jurisdictions)

      2. Scale-Up Considerations:
         - Heat transfer becomes challenging at scale
         - Pressure vessel costs don't scale linearly
         - Utility requirements scale with capacity
         - Multiple modules may be more practical than large single unit

      3. Modular Benefits:
         - Faster deployment
         - Capital efficiency (staged investment)
         - Flexibility for different sites
         - Easier maintenance (module swap-out)

      ASSESSMENT: Modular design is a reasonable claim.
      Verify actual module capacity and deployment track record.

      RECOMMENDATION: Request module specifications and deployment history.
    `,
    validationSteps: [
      'Request module capacity and dimensions',
      'Verify units deployed at scale',
      'Review installation timeline from previous projects',
      'Check if utilities are truly self-contained',
      'Verify regulatory acceptance of modular design',
      'Assess economics at module vs. full-scale'
    ],
    riskLevel: 'low',
    confidenceRequired: 'medium',
    redFlags: [
      'No modules actually deployed',
      'Only lab-scale demonstration',
      'Module capacity unclear',
      'Hidden on-site construction requirements',
      'No timeline for installation'
    ],
    dataRequests: [
      'Module dimensions and weight',
      'Utility connection requirements',
      'Installation timeline from previous deployments',
      'List of deployed units with capacities',
      'Operating history of modular units'
    ]
  },

  'economic-viability': {
    id: 'economic-viability',
    claimPattern: /economic|profitable|cost[\s-]*effective|competitive|break[\s-]*even|payback|ROI|return\s*on\s*investment/i,
    claimType: 'economic',
    validationMethod: 'benchmark-comparison',
    benchmarks: {
      lcofPilot: {
        min: 5, max: 15, typical: 10,
        unit: '$/liter biocrude',
        notes: 'LCOF at pilot scale (TRL 5-6)'
      },
      lcofCommercial: {
        min: 2, max: 5, typical: 3.5,
        unit: '$/liter biocrude',
        notes: 'LCOF target at commercial scale (TRL 9)'
      },
      capexRange: {
        min: 3000, max: 8000, typical: 5000,
        unit: '$/tonne-yr capacity',
        notes: 'Capital cost at TRL 6-7'
      },
      paybackPeriod: {
        min: 3, max: 10, typical: 6,
        unit: 'years',
        notes: 'Typical project payback with tipping fees'
      },
      tippingFeeRequired: {
        min: 30, max: 80, typical: 50,
        unit: '$/tonne',
        notes: 'Tipping fee needed for viability'
      }
    },
    interpretation: `
      HTL economics depend on multiple factors:

      1. Revenue Streams:
         - Tipping fees: $30-80/tonne (critical for viability)
         - Biocrude: $0.50-1.00/liter (depends on quality)
         - Biochar: $200-500/tonne (market developing)
         - Carbon credits: $20-100/tonne CO2 (if certified)

      2. Cost Drivers:
         - CAPEX: High for early stage (TRL 5-6)
         - Utilities: Steam and electricity significant
         - Labor: Higher for smaller facilities
         - Maintenance: 3-5% of CAPEX annually

      3. Break-Even Analysis:
         - With strong tipping fees ($60+), can be profitable
         - Without tipping fees, challenging economics
         - Scale matters: unit costs decrease with capacity

      ASSESSMENT: Economics are site and scale dependent.
      Strong tipping fees are typically required for profitability.

      RECOMMENDATION: Request detailed TEA with all revenue streams.
    `,
    validationSteps: [
      'Request complete TEA with stated assumptions',
      'Verify tipping fee assumptions are realistic for location',
      'Compare CAPEX to industry benchmarks for TRL level',
      'Check if all revenue streams are included',
      'Verify product pricing assumptions',
      'Calculate sensitivity to key variables'
    ],
    riskLevel: 'medium',
    confidenceRequired: 'high',
    redFlags: [
      'No detailed TEA provided',
      'Unrealistic tipping fee assumptions',
      'CAPEX below industry benchmarks',
      'Missing revenue streams',
      'No sensitivity analysis',
      'Ignoring scale effects'
    ],
    dataRequests: [
      'Complete techno-economic analysis',
      'CAPEX breakdown by category',
      'OPEX breakdown (utilities, labor, maintenance)',
      'Revenue assumptions with sources',
      'Sensitivity analysis on key variables',
      'Comparison to industry benchmarks'
    ]
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Find matching validation rule for a claim
 */
export function matchClaimToRule(claim: string): ClaimValidationRule | undefined {
  for (const rule of Object.values(EDEN_CLAIMS_VALIDATION)) {
    if (rule.claimPattern instanceof RegExp) {
      if (rule.claimPattern.test(claim)) {
        return rule
      }
    } else {
      if (claim.toLowerCase().includes(rule.claimPattern.toLowerCase())) {
        return rule
      }
    }
  }
  return undefined
}

/**
 * Validate a single claim against HTL physics and benchmarks
 */
export function validateHTLClaim(
  claim: string,
  providedData?: Record<string, number | string>
): ClaimValidationResult {
  const rule = matchClaimToRule(claim)

  if (!rule) {
    return {
      claimId: 'unknown',
      originalClaim: claim,
      matchedRule: 'none',
      validated: false,
      confidence: 'very-low',
      riskLevel: 'medium',
      interpretation: 'No validation rule matches this claim. Manual review required.',
      findings: ['Claim does not match known HTL claim patterns'],
      dataGaps: ['No benchmarks available for comparison'],
      recommendations: ['Manual expert review recommended']
    }
  }

  const findings: string[] = []
  const dataGaps: string[] = []
  const recommendations: string[] = []
  let validated = true
  let confidence: ConfidenceLevel = 'medium'

  // Check physics limit if applicable
  let physicsCheck: ClaimValidationResult['physicsCheck'] | undefined
  if (rule.physicsLimit && providedData) {
    const claimedValue = extractNumericValue(claim)
    if (claimedValue !== undefined) {
      const passed = claimedValue <= rule.physicsLimit.maxValue
      physicsCheck = {
        passed,
        limit: `${rule.physicsLimit.metric}: ${rule.physicsLimit.maxValue}${rule.physicsLimit.unit}`,
        claimedValue,
        limitValue: rule.physicsLimit.maxValue,
        margin: rule.physicsLimit.maxValue - claimedValue
      }

      if (!passed) {
        validated = false
        confidence = 'high' // High confidence it's invalid
        findings.push(
          `PHYSICS VIOLATION: Claimed ${claimedValue}${rule.physicsLimit.unit} exceeds ` +
          `thermodynamic limit of ${rule.physicsLimit.maxValue}${rule.physicsLimit.unit} ` +
          `(Source: ${rule.physicsLimit.source})`
        )
      } else {
        findings.push(
          `Physics check passed: ${claimedValue}${rule.physicsLimit.unit} is within ` +
          `limit of ${rule.physicsLimit.maxValue}${rule.physicsLimit.unit}`
        )
      }
    }
  }

  // Check for red flags
  if (rule.redFlags) {
    for (const flag of rule.redFlags) {
      if (!providedData || Object.keys(providedData).length === 0) {
        dataGaps.push(flag)
      }
    }
  }

  // Add data requests
  if (rule.dataRequests) {
    recommendations.push(...rule.dataRequests.map(req => `Request: ${req}`))
  }

  // Add validation steps as recommendations
  recommendations.push(...rule.validationSteps)

  // Adjust confidence based on data availability
  if (dataGaps.length > 3) {
    confidence = 'very-low'
  } else if (dataGaps.length > 1) {
    confidence = 'low'
  }

  return {
    claimId: rule.id,
    originalClaim: claim,
    matchedRule: rule.id,
    validated,
    confidence,
    riskLevel: rule.riskLevel,
    interpretation: rule.interpretation.trim(),
    findings,
    dataGaps,
    recommendations,
    physicsCheck
  }
}

/**
 * Validate multiple claims
 */
export function validateHTLClaims(
  claims: string[],
  providedData?: Record<string, number | string>
): ClaimValidationResult[] {
  return claims.map(claim => validateHTLClaim(claim, providedData))
}

/**
 * Extract numeric value from claim string
 */
function extractNumericValue(claim: string): number | undefined {
  // Match patterns like "90%", ">90%", "90+%", "90 percent"
  const patterns = [
    /(?:>?\s*)(\d+(?:\.\d+)?)\s*(?:\+\s*)?%/,
    /(?:>?\s*)(\d+(?:\.\d+)?)\s*(?:\+\s*)?percent/i,
    /over\s*(\d+(?:\.\d+)?)/i,
    /above\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*or\s*(?:more|higher)/i
  ]

  for (const pattern of patterns) {
    const match = claim.match(pattern)
    if (match && match[1]) {
      return parseFloat(match[1])
    }
  }

  return undefined
}

/**
 * Generate claims validation summary for assessment report
 */
export function generateClaimsSummary(results: ClaimValidationResult[]): {
  totalClaims: number
  validated: number
  invalidated: number
  highRisk: number
  dataGapsCount: number
  keyFindings: string[]
  priorityDataRequests: string[]
} {
  const validated = results.filter(r => r.validated).length
  const invalidated = results.filter(r => !r.validated).length
  const highRisk = results.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length

  const allDataGaps = results.flatMap(r => r.dataGaps)
  const uniqueDataGaps = [...new Set(allDataGaps)]

  const allFindings = results.flatMap(r => r.findings)
  const physicsViolations = allFindings.filter(f => f.includes('PHYSICS VIOLATION'))

  const allRecommendations = results.flatMap(r => r.recommendations)
  const dataRequests = allRecommendations.filter(r => r.startsWith('Request:'))
  const uniqueDataRequests = [...new Set(dataRequests)]

  return {
    totalClaims: results.length,
    validated,
    invalidated,
    highRisk,
    dataGapsCount: uniqueDataGaps.length,
    keyFindings: [
      ...physicsViolations,
      `${validated} of ${results.length} claims validated`,
      `${highRisk} claims flagged as high risk`
    ],
    priorityDataRequests: uniqueDataRequests.slice(0, 5)
  }
}

// ============================================================================
// EDEN-Specific Helpers
// ============================================================================

/**
 * Validate EDEN Energy's standard claims
 */
export function validateEDENClaims(edenData?: Record<string, number | string>): {
  results: ClaimValidationResult[]
  summary: ReturnType<typeof generateClaimsSummary>
} {
  const edenClaims = [
    '>90% conversion efficiency',
    'Carbon neutral operation',
    'No harmful byproducts',
    'Handles mixed/unsorted waste',
    'Modular and scalable design'
  ]

  const results = validateHTLClaims(edenClaims, edenData)
  const summary = generateClaimsSummary(results)

  return { results, summary }
}

/**
 * Get HTL physics limits for reference
 */
export function getHTLPhysicsLimits(): Array<{
  metric: string
  limit: number
  unit: string
  source: string
  notes: string
}> {
  return [
    {
      metric: 'Net Energy Efficiency',
      limit: 85,
      unit: '%',
      source: 'Second-law thermodynamics',
      notes: 'Maximum energy recovery from HTL accounting for process losses'
    },
    {
      metric: 'Biocrude Yield (dry basis)',
      limit: 60,
      unit: 'wt%',
      source: 'PNNL HTL studies',
      notes: 'Maximum observed biocrude yield for optimal feedstocks'
    },
    {
      metric: 'Reactor Temperature',
      limit: 400,
      unit: '°C',
      source: 'HTL process constraints',
      notes: 'Above this, process shifts to supercritical water gasification'
    },
    {
      metric: 'Reactor Pressure',
      limit: 35,
      unit: 'MPa',
      source: 'Water saturation curve',
      notes: 'Must maintain subcritical conditions for HTL'
    },
    {
      metric: 'Water Recycle Rate',
      limit: 95,
      unit: '%',
      source: 'Process engineering',
      notes: 'Higher rates cause buildup of dissolved organics'
    },
    {
      metric: 'Mass Conversion',
      limit: 90,
      unit: '%',
      source: 'Mass balance constraints',
      notes: 'Accounting for ash and non-reactive materials'
    }
  ]
}
