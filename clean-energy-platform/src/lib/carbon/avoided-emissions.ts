/**
 * Avoided Emissions Calculator
 *
 * Calculates avoided emissions using Project Frame (2024) and
 * WBCSD Guidance (2025) methodologies for investor due diligence.
 *
 * Features:
 * - Baseline selection guidance
 * - Counterfactual scenario modeling
 * - Methodology alignment (Project Frame, WBCSD, GHG Protocol)
 * - Data quality scoring (PCAF methodology)
 *
 * Phase 4 of investor due diligence market enhancement
 */

import { generateText } from '@/lib/ai/gemini'
import type {
  AvoidedEmissionsInput,
  AvoidedEmissionsResult,
  BaselineScenario,
  CounterfactualScenario,
  DataQualityScore,
  AvoidedEmissionsMethodology,
} from '@/types/carbon'

// ============================================================================
// Baseline Emission Factors Database
// ============================================================================

interface EmissionFactorData {
  factor: number
  unit: string
  source: string
  year: number
  region: string
}

const GRID_EMISSION_FACTORS: Record<string, EmissionFactorData> = {
  // Regional grid averages (tCO2e/MWh)
  'us-average': {
    factor: 0.386,
    unit: 'tCO2e/MWh',
    source: 'EPA eGRID 2023',
    year: 2023,
    region: 'US Average',
  },
  'us-california': {
    factor: 0.225,
    unit: 'tCO2e/MWh',
    source: 'EPA eGRID 2023',
    year: 2023,
    region: 'California',
  },
  'us-texas': {
    factor: 0.361,
    unit: 'tCO2e/MWh',
    source: 'EPA eGRID 2023',
    year: 2023,
    region: 'Texas (ERCOT)',
  },
  'us-pjm': {
    factor: 0.387,
    unit: 'tCO2e/MWh',
    source: 'EPA eGRID 2023',
    year: 2023,
    region: 'PJM Interconnection',
  },
  'eu-average': {
    factor: 0.256,
    unit: 'tCO2e/MWh',
    source: 'EEA 2023',
    year: 2023,
    region: 'EU Average',
  },
  'germany': {
    factor: 0.380,
    unit: 'tCO2e/MWh',
    source: 'Umweltbundesamt 2023',
    year: 2023,
    region: 'Germany',
  },
  'uk': {
    factor: 0.207,
    unit: 'tCO2e/MWh',
    source: 'DEFRA 2023',
    year: 2023,
    region: 'United Kingdom',
  },
  'china-average': {
    factor: 0.555,
    unit: 'tCO2e/MWh',
    source: 'IEA 2023',
    year: 2023,
    region: 'China Average',
  },
  'india-average': {
    factor: 0.708,
    unit: 'tCO2e/MWh',
    source: 'CEA 2023',
    year: 2023,
    region: 'India Average',
  },
  'global-average': {
    factor: 0.436,
    unit: 'tCO2e/MWh',
    source: 'IEA Global Energy Review 2024',
    year: 2024,
    region: 'Global',
  },
}

const TRANSPORT_EMISSION_FACTORS: Record<string, EmissionFactorData> = {
  'gasoline-ice': {
    factor: 0.192,
    unit: 'kgCO2e/km',
    source: 'EPA 2023',
    year: 2023,
    region: 'US',
  },
  'diesel-ice': {
    factor: 0.171,
    unit: 'kgCO2e/km',
    source: 'EPA 2023',
    year: 2023,
    region: 'US',
  },
  'diesel-truck': {
    factor: 0.850,
    unit: 'kgCO2e/km',
    source: 'GLEC Framework',
    year: 2023,
    region: 'Global',
  },
  'jet-fuel': {
    factor: 3.16,
    unit: 'kgCO2e/kg fuel',
    source: 'ICAO 2023',
    year: 2023,
    region: 'Global',
  },
  'marine-hfo': {
    factor: 3.114,
    unit: 'kgCO2e/kg fuel',
    source: 'IMO 2023',
    year: 2023,
    region: 'Global',
  },
}

const INDUSTRIAL_EMISSION_FACTORS: Record<string, EmissionFactorData> = {
  'grey-hydrogen': {
    factor: 10.0,
    unit: 'kgCO2e/kgH2',
    source: 'IEA 2023',
    year: 2023,
    region: 'Global',
  },
  'blue-hydrogen': {
    factor: 4.0,
    unit: 'kgCO2e/kgH2',
    source: 'IEA 2023',
    year: 2023,
    region: 'Global',
  },
  'natural-gas-boiler': {
    factor: 0.184,
    unit: 'kgCO2e/kWh',
    source: 'DEFRA 2023',
    year: 2023,
    region: 'Global',
  },
  'coal-boiler': {
    factor: 0.341,
    unit: 'kgCO2e/kWh',
    source: 'EPA 2023',
    year: 2023,
    region: 'US',
  },
  'cement-production': {
    factor: 0.6,
    unit: 'tCO2e/tonne cement',
    source: 'GCCA 2023',
    year: 2023,
    region: 'Global',
  },
  'steel-bof': {
    factor: 1.85,
    unit: 'tCO2e/tonne steel',
    source: 'World Steel Association 2023',
    year: 2023,
    region: 'Global',
  },
  'steel-eaf': {
    factor: 0.4,
    unit: 'tCO2e/tonne steel',
    source: 'World Steel Association 2023',
    year: 2023,
    region: 'Global',
  },
}

// ============================================================================
// Avoided Emissions Calculator Class
// ============================================================================

export class AvoidedEmissionsCalculator {
  /**
   * Calculate avoided emissions for a technology deployment
   */
  async calculate(input: AvoidedEmissionsInput): Promise<AvoidedEmissionsResult> {
    // Validate baseline
    const validatedBaseline = this.validateBaseline(input.baseline)

    // Calculate avoided emissions
    const emissionReduction =
      validatedBaseline.emissionsFactor - (input.counterfactual?.emissionsFactor || 0)

    const annualAvoided = emissionReduction * input.deploymentScale
    const lifetimeAvoided = annualAvoided * input.operatingLife
    const avoidedIntensity = emissionReduction

    // Assess data quality
    const dataQuality = this.assessDataQuality(input)

    // Determine confidence level
    const confidence = this.determineConfidence(input, dataQuality)

    // Collect assumptions and limitations
    const { assumptions, limitations } = await this.collectAssumptionsAndLimitations(input)

    return {
      annualAvoided,
      lifetimeAvoided,
      avoidedIntensity,
      methodology: input.methodology,
      baseline: validatedBaseline,
      counterfactual: input.counterfactual,
      assumptions,
      limitations,
      confidence,
      dataQuality,
      validatedAt: new Date().toISOString(),
    }
  }

  /**
   * Validate and enrich baseline scenario
   */
  private validateBaseline(baseline: BaselineScenario): BaselineScenario {
    // Check if we have a standard emission factor
    const allFactors = {
      ...GRID_EMISSION_FACTORS,
      ...TRANSPORT_EMISSION_FACTORS,
      ...INDUSTRIAL_EMISSION_FACTORS,
    }

    // Try to match baseline to known factors
    const lowerName = baseline.name.toLowerCase()
    for (const [key, data] of Object.entries(allFactors)) {
      if (lowerName.includes(key.replace(/-/g, ' ')) || key.includes(lowerName)) {
        return {
          ...baseline,
          emissionsFactor: baseline.emissionsFactor || data.factor,
          source: baseline.source || data.source,
          year: baseline.year || data.year,
        }
      }
    }

    return baseline
  }

  /**
   * Assess data quality using PCAF methodology
   */
  private assessDataQuality(input: AvoidedEmissionsInput): DataQualityScore {
    let score: 1 | 2 | 3 | 4 | 5 = 3
    const improvements: string[] = []

    // Check baseline data source
    const hasVerifiedSource =
      input.baseline.source.toLowerCase().includes('verified') ||
      input.baseline.source.toLowerCase().includes('epa') ||
      input.baseline.source.toLowerCase().includes('iea')

    if (hasVerifiedSource && input.baseline.year >= 2023) {
      score = 1
    } else if (input.baseline.source && input.baseline.year >= 2022) {
      score = 2
      improvements.push('Use verified/third-party data sources')
    } else if (input.baseline.source) {
      score = 3
      improvements.push('Update to more recent emission factors')
      improvements.push('Use region-specific data instead of averages')
    } else {
      score = 4
      improvements.push('Document data sources for all emission factors')
      improvements.push('Use primary data where available')
    }

    // Penalize for missing counterfactual
    if (!input.counterfactual && score < 4) {
      score = (score + 1) as 1 | 2 | 3 | 4 | 5
      improvements.push('Define explicit counterfactual scenario')
    }

    const descriptions: Record<number, string> = {
      1: 'Verified primary data from audited sources',
      2: 'Unverified primary data with clear methodology',
      3: 'Sector-specific secondary data',
      4: 'Proxy data based on similar activities',
      5: 'Estimated data with high uncertainty',
    }

    const categories: Record<number, DataQualityScore['category']> = {
      1: 'verified-primary',
      2: 'unverified-primary',
      3: 'sector-specific',
      4: 'proxy-data',
      5: 'estimated',
    }

    return {
      score,
      description: descriptions[score],
      category: categories[score],
      improvements,
    }
  }

  /**
   * Determine confidence level
   */
  private determineConfidence(
    input: AvoidedEmissionsInput,
    dataQuality: DataQualityScore
  ): 'high' | 'medium' | 'low' {
    // High confidence requirements:
    // - Data quality score 1-2
    // - Explicit counterfactual
    // - Recognized methodology
    if (
      dataQuality.score <= 2 &&
      input.counterfactual &&
      ['project-frame', 'wbcsd-guidance', 'ghg-protocol'].includes(input.methodology)
    ) {
      return 'high'
    }

    // Medium confidence:
    // - Data quality score 2-3
    // - Some methodology alignment
    if (dataQuality.score <= 3) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Collect assumptions and limitations
   */
  private async collectAssumptionsAndLimitations(
    input: AvoidedEmissionsInput
  ): Promise<{ assumptions: string[]; limitations: string[] }> {
    const assumptions: string[] = []
    const limitations: string[] = []

    // Standard assumptions based on methodology
    if (input.methodology === 'project-frame') {
      assumptions.push('Follows Project Frame avoided emissions accounting principles')
      assumptions.push('Baseline represents the most likely alternative scenario')
      assumptions.push('Technology deployment displaces emissions on 1:1 basis')
    } else if (input.methodology === 'wbcsd-guidance') {
      assumptions.push('Aligned with WBCSD 2025 Avoided Emissions Guidance')
      assumptions.push('Uses market-average baseline approach')
    }

    // Add deployment assumptions
    assumptions.push(`Operating life assumed at ${input.operatingLife} years`)
    assumptions.push(`Deployment scale of ${input.deploymentScale} ${input.deploymentUnit}`)
    assumptions.push(`Regional context: ${input.region}`)

    // Standard limitations
    limitations.push('Avoided emissions are estimates based on counterfactual scenarios')
    limitations.push('Actual emissions reductions may vary based on market conditions')
    limitations.push('Does not account for rebound effects or market displacement')

    if (!input.counterfactual) {
      limitations.push('No explicit counterfactual defined - using zero-emission assumption')
    }

    if (input.baseline.year < new Date().getFullYear() - 2) {
      limitations.push('Baseline emission factors may not reflect current grid mix')
    }

    return { assumptions, limitations }
  }

  /**
   * Get suggested baseline for a technology type
   */
  async suggestBaseline(
    technology: string,
    sector: string,
    region: string
  ): Promise<BaselineScenario[]> {
    const prompt = `Suggest appropriate baseline scenarios for calculating avoided emissions for this technology:

TECHNOLOGY: ${technology}
SECTOR: ${sector}
REGION: ${region}

Provide 2-3 appropriate baseline scenarios with:
1. Name (e.g., "Grid Average Electricity", "Grey Hydrogen Production")
2. Description of what is being displaced
3. Emission factor (with units)
4. Data source
5. Year of data
6. Justification for why this is an appropriate baseline

Return a JSON array:
[
  {
    "name": "Baseline Name",
    "description": "What this baseline represents",
    "emissionsFactor": 0.5,
    "unit": "tCO2e/MWh",
    "source": "IEA 2023",
    "year": 2023,
    "region": "${region}",
    "justification": "Why this baseline is appropriate"
  }
]

Return only the JSON array.`

    try {
      const result = await generateText(prompt, {
        model: 'flash',
        responseMimeType: 'application/json',
        temperature: 0.2,
        maxOutputTokens: 1024,
      })

      return JSON.parse(result.trim())
    } catch (error) {
      console.error('[AvoidedEmissions] Failed to suggest baseline:', error)
      return []
    }
  }

  /**
   * Validate methodology alignment
   */
  validateMethodologyAlignment(
    methodology: AvoidedEmissionsMethodology,
    input: AvoidedEmissionsInput
  ): { isAligned: boolean; gaps: string[]; recommendations: string[] } {
    const gaps: string[] = []
    const recommendations: string[] = []

    if (methodology === 'project-frame') {
      // Project Frame requirements
      if (!input.counterfactual) {
        gaps.push('Project Frame requires explicit counterfactual scenario')
        recommendations.push('Define the most likely alternative scenario if technology did not exist')
      }
      if (!input.baseline.justification) {
        gaps.push('Missing baseline justification')
        recommendations.push('Document rationale for baseline selection per Project Frame guidance')
      }
    }

    if (methodology === 'wbcsd-guidance') {
      // WBCSD 2025 requirements
      if (!input.baseline.source.includes('verified')) {
        recommendations.push('Consider using third-party verified emission factors')
      }
    }

    if (methodology === 'ghg-protocol') {
      // GHG Protocol requirements
      if (input.operatingLife > 25) {
        gaps.push('Very long operating life may require discounting')
        recommendations.push('Consider using discounted emissions for >25 year horizons')
      }
    }

    return {
      isAligned: gaps.length === 0,
      gaps,
      recommendations,
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Calculate avoided emissions for a technology
 */
export async function calculateAvoidedEmissions(
  input: AvoidedEmissionsInput
): Promise<AvoidedEmissionsResult> {
  const calculator = new AvoidedEmissionsCalculator()
  return calculator.calculate(input)
}

/**
 * Get suggested baseline scenarios
 */
export async function suggestBaselines(
  technology: string,
  sector: string,
  region: string
): Promise<BaselineScenario[]> {
  const calculator = new AvoidedEmissionsCalculator()
  return calculator.suggestBaseline(technology, sector, region)
}

/**
 * Get emission factor for a known baseline type
 */
export function getEmissionFactor(
  type: 'grid' | 'transport' | 'industrial',
  key: string
): EmissionFactorData | undefined {
  const factorDatabases = {
    grid: GRID_EMISSION_FACTORS,
    transport: TRANSPORT_EMISSION_FACTORS,
    industrial: INDUSTRIAL_EMISSION_FACTORS,
  }

  return factorDatabases[type][key]
}

/**
 * List available emission factors
 */
export function listAvailableFactors(): {
  grid: string[]
  transport: string[]
  industrial: string[]
} {
  return {
    grid: Object.keys(GRID_EMISSION_FACTORS),
    transport: Object.keys(TRANSPORT_EMISSION_FACTORS),
    industrial: Object.keys(INDUSTRIAL_EMISSION_FACTORS),
  }
}
