/**
 * Metrics Extractor
 *
 * Provides robust extraction of metrics from agent outputs.
 * Handles:
 * - Direct extraction from standardizedMetrics block
 * - Deep search through nested structures
 * - Agent-specific fallback paths
 * - Unit conversions
 */

import type {
  StandardizedMetricsOutput,
  StandardizedMetric,
  MetricExtractionResult,
} from './metrics-interface'
import type { ComponentOutput } from './base-agent'
import { convertUnit, CONVERSION_RULES } from './unit-converter'

// ============================================================================
// Types
// ============================================================================

interface ExtractionPath {
  path: string[]
  transform?: (value: unknown) => number | null
  convert?: { from: string; to: string }
}

interface AgentExtractionConfig {
  efficiency: ExtractionPath[]
  primaryCost: ExtractionPath[]
  trl: ExtractionPath[]
  rating: ExtractionPath[]
  capex: ExtractionPath[]
  lifetime: ExtractionPath[]
  [key: string]: ExtractionPath[]
}

// ============================================================================
// Agent-Specific Extraction Paths
// ============================================================================

/**
 * Known paths where each agent stores metrics
 * Order matters - first match wins
 */
const AGENT_EXTRACTION_PATHS: Record<string, AgentExtractionConfig> = {
  'technology-deep-dive': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['overview', 'performanceMetrics', 'efficiency'] },
      { path: ['technicalSpecifications', 'efficiency'] },
      { path: ['keyMetrics', 'efficiency', 'value'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['economicOverview', 'currentCost'] },
      { path: ['marketAnalysis', 'cost'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['trl', 'currentTRL'] },
      { path: ['technologyReadiness', 'level'] },
      { path: ['overview', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['overallAssessment', 'rating'] },
      { path: ['recommendation', 'rating'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['economicOverview', 'capex'] },
      { path: ['costAnalysis', 'capital'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['technicalSpecifications', 'lifetime'] },
      { path: ['durability', 'expectedLifetime'] },
    ],
  },

  'claims-validation': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['validatedClaims', 'efficiency', 'validatedValue'] },
      { path: ['summary', 'keyMetrics', 'efficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['validatedClaims', 'cost', 'validatedValue'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['validatedClaims', 'trl', 'validatedValue'] },
      { path: ['summary', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['overallConfidence'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['validatedClaims', 'capex', 'validatedValue'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['validatedClaims', 'lifetime', 'validatedValue'] },
    ],
  },

  'performance-simulation': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['keyMetrics', 'efficiency', 'value'] },
      { path: ['simulationResults', 'efficiency'] },
      { path: ['performanceMetrics', 'systemEfficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['economicMetrics', 'levelizedCost'] },
      { path: ['costProjections', 'current'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['maturityAssessment', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['performanceRating'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['economicMetrics', 'capex'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['degradationAnalysis', 'lifetimeProjection', 'expectedLifetime'] },
      { path: ['durabilityMetrics', 'lifetime'] },
    ],
  },

  'system-integration': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['systemEfficiency'] },
      { path: ['integrationMetrics', 'efficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['totalSystemCost'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['integrationReadiness', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['integrationRating'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['infrastructureCosts', 'total'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['systemLifetime'] },
    ],
  },

  'tea-analysis': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['assumptions', 'efficiency'] },
      { path: ['technicalParameters', 'efficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['financialMetrics', 'primary', 'lcoe', 'value'] },
      { path: ['financialMetrics', 'primary', 'lcoh', 'value'] },
      { path: ['financialMetrics', 'primary', 'lcos', 'value'] },
      { path: ['financialMetrics', 'primary', 'lcoc', 'value'] },
      { path: ['levelizedCost'] },
      { path: ['keyMetrics', 'lcoe'] },
      { path: ['keyMetrics', 'lcoh'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['assumptions', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['recommendation', 'rating'] },
      { path: ['investmentRating'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['capitalCosts', 'total'] },
      { path: ['costBreakdown', 'capex', 'total'] },
      { path: ['keyMetrics', 'capex'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['assumptions', 'lifetime'] },
      { path: ['projectParameters', 'lifetime'] },
    ],
    npv: [
      { path: ['standardizedMetrics', 'npv', 'value'] },
      { path: ['financialMetrics', 'primary', 'npv', 'value'] },
      { path: ['keyMetrics', 'npv'] },
    ],
    irr: [
      { path: ['standardizedMetrics', 'irr', 'value'] },
      { path: ['financialMetrics', 'primary', 'irr', 'value'] },
      { path: ['keyMetrics', 'irr'] },
    ],
  },

  'improvement-opportunities': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['currentPerformance', 'efficiency'] },
      { path: ['baseline', 'efficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['currentCost'] },
      { path: ['baseline', 'cost'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['currentTRL'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['improvementPotential'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['costReduction', 'currentCapex'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['durabilityImprovements', 'currentLifetime'] },
    ],
  },

  'final-synthesis': {
    efficiency: [
      { path: ['standardizedMetrics', 'efficiency', 'value'] },
      { path: ['keyFindings', 'efficiency'] },
      { path: ['synthesis', 'technicalMetrics', 'efficiency'] },
    ],
    primaryCost: [
      { path: ['standardizedMetrics', 'primaryCostMetric', 'value'] },
      { path: ['keyFindings', 'levelizedCost'] },
      { path: ['synthesis', 'economicMetrics', 'primaryCost'] },
    ],
    trl: [
      { path: ['standardizedMetrics', 'trl'] },
      { path: ['overallAssessment', 'trl'] },
      { path: ['keyFindings', 'trl'] },
    ],
    rating: [
      { path: ['standardizedMetrics', 'rating'] },
      { path: ['overallRating'] },
      { path: ['recommendation', 'rating'] },
      { path: ['finalRecommendation', 'rating'] },
    ],
    capex: [
      { path: ['standardizedMetrics', 'capex', 'value'] },
      { path: ['keyFindings', 'capex'] },
    ],
    lifetime: [
      { path: ['standardizedMetrics', 'lifetime', 'value'] },
      { path: ['keyFindings', 'lifetime'] },
    ],
  },
}

// ============================================================================
// Extraction Functions
// ============================================================================

/**
 * Extract a metric from component output using standardized paths
 */
export function extractMetric(
  componentId: string,
  metricName: string,
  output: ComponentOutput
): MetricExtractionResult {
  const content = output.content as Record<string, unknown>

  // First try standardized path
  const standardizedPath = ['standardizedMetrics', metricName === 'primaryCost' ? 'primaryCostMetric' : metricName]
  const standardizedValue = traversePath(content, standardizedPath)

  if (standardizedValue !== null) {
    // Handle StandardizedMetric objects
    if (typeof standardizedValue === 'object' && 'value' in (standardizedValue as Record<string, unknown>)) {
      const metricObj = standardizedValue as StandardizedMetric
      return {
        metric: metricObj,
        found: true,
        path: [...standardizedPath, 'value'],
        extractionMethod: 'direct',
      }
    }
    // Handle direct numeric values (for trl, rating)
    if (typeof standardizedValue === 'number' || typeof standardizedValue === 'string') {
      return {
        metric: {
          id: metricName,
          name: metricName,
          value: typeof standardizedValue === 'number' ? standardizedValue : parseFloat(String(standardizedValue)) || 0,
          unit: '',
          confidence: 'high',
          source: 'standardizedMetrics',
        },
        found: true,
        path: standardizedPath,
        extractionMethod: 'direct',
      }
    }
  }

  // Search secondaryMetrics array by id/name
  const secondaryMetrics = (content?.standardizedMetrics as Record<string, unknown>)?.secondaryMetrics as Array<{
    id?: string
    name?: string
    value?: number
    unit?: string
  }> | undefined

  if (secondaryMetrics && Array.isArray(secondaryMetrics)) {
    const searchKeys = getSearchKeys(metricName)
    for (const metric of secondaryMetrics) {
      const metricId = (metric.id || metric.name || '').toLowerCase().replace(/_/g, '').replace(/-/g, '')
      for (const searchKey of searchKeys) {
        const normalizedKey = searchKey.toLowerCase().replace(/_/g, '').replace(/-/g, '')
        if (metricId.includes(normalizedKey) || normalizedKey.includes(metricId)) {
          if (typeof metric.value === 'number' && !isNaN(metric.value)) {
            return {
              metric: {
                id: metric.id || metricName,
                name: metric.name || metricName,
                value: metric.value,
                unit: metric.unit || '',
                confidence: 'high',
                source: 'standardizedMetrics.secondaryMetrics',
              },
              found: true,
              path: ['standardizedMetrics', 'secondaryMetrics', metricId],
              extractionMethod: 'direct',
            }
          }
        }
      }
    }
  }

  // Fall back to agent-specific paths
  const agentConfig = AGENT_EXTRACTION_PATHS[componentId]
  if (!agentConfig || !agentConfig[metricName]) {
    // Try deep search as last resort
    return deepSearchMetric(content, metricName)
  }

  for (const pathConfig of agentConfig[metricName]) {
    const value = traversePath(content, pathConfig.path)
    if (value !== null) {
      let numericValue = toNumber(value)

      // Apply conversion if needed
      if (pathConfig.convert && numericValue !== null) {
        numericValue = convertUnit(numericValue, pathConfig.convert.from, pathConfig.convert.to)
      }

      // Apply custom transform
      if (pathConfig.transform && value !== null) {
        numericValue = pathConfig.transform(value)
      }

      if (numericValue !== null) {
        return {
          metric: {
            id: metricName,
            name: metricName,
            value: numericValue,
            unit: '',
            confidence: 'medium',
            source: `Extracted from ${pathConfig.path.join('.')}`,
          },
          found: true,
          path: pathConfig.path,
          extractionMethod: 'search',
        }
      }
    }
  }

  // Try deep search as final fallback
  return deepSearchMetric(content, metricName)
}

/**
 * Traverse a path in an object and return the value
 */
function traversePath(obj: unknown, path: string[]): unknown {
  let current: unknown = obj

  for (const key of path) {
    if (current === null || current === undefined) {
      return null
    }

    if (typeof current !== 'object') {
      return null
    }

    current = (current as Record<string, unknown>)[key]
  }

  return current
}

/**
 * Deep search for a metric by name through all nested properties
 */
function deepSearchMetric(
  obj: unknown,
  metricName: string,
  visited = new WeakSet<object>()
): MetricExtractionResult {
  const searchKeys = getSearchKeys(metricName)

  const value = deepSearchValue(obj, searchKeys, visited)

  if (value !== null) {
    return {
      metric: {
        id: metricName,
        name: metricName,
        value,
        unit: '',
        confidence: 'low',
        source: 'Deep search (path unknown)',
      },
      found: true,
      path: ['deep_search'],
      extractionMethod: 'search',
    }
  }

  return {
    metric: null,
    found: false,
    path: [],
    extractionMethod: 'fallback',
  }
}

/**
 * Recursively search for a value by key names with depth limit
 */
const MAX_SEARCH_DEPTH = 10 // Prevent runaway recursion

function deepSearchValue(
  obj: unknown,
  searchKeys: string[],
  visited = new WeakSet<object>(),
  depth = 0
): number | null {
  // Depth limit to prevent performance issues
  if (depth > MAX_SEARCH_DEPTH) return null
  if (!obj || typeof obj !== 'object') return null
  if (visited.has(obj as object)) return null
  visited.add(obj as object)

  const o = obj as Record<string, unknown>

  // Check if this object has a name/id property matching our search
  const rawObjName = String(o.name || o.id || o.metric || o.label || '').toLowerCase()
  const objNameNoSpaces = rawObjName.replace(/[\s_-]/g, '')
  for (const key of searchKeys) {
    const keyLower = key.toLowerCase()
    const keyNoSpaces = keyLower.replace(/[\s_-]/g, '')
    // Match with or without spaces/underscores
    if (rawObjName.includes(keyLower) || objNameNoSpaces.includes(keyNoSpaces)) {
      if (typeof o.value === 'number') return o.value
      if (typeof o.value === 'string') {
        const val = parseFloat(o.value.replace(/[^0-9.-]/g, ''))
        if (!isNaN(val)) return val
      }
    }
  }

  // Check direct properties (with space/underscore normalization)
  for (const key of searchKeys) {
    const keyLower = key.toLowerCase()
    const keyNoSpaces = keyLower.replace(/[\s_-]/g, '')
    for (const [propKey, propValue] of Object.entries(o)) {
      const propLower = propKey.toLowerCase()
      const propNoSpaces = propLower.replace(/[\s_-]/g, '')
      if (propLower.includes(keyLower) || propNoSpaces.includes(keyNoSpaces)) {
        const num = toNumber(propValue)
        if (num !== null) return num
      }
    }
  }

  // Recurse into nested objects and arrays (with incremented depth)
  for (const value of Object.values(o)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = deepSearchValue(item, searchKeys, visited, depth + 1)
        if (found !== null) return found
      }
    } else if (typeof value === 'object' && value !== null) {
      const found = deepSearchValue(value, searchKeys, visited, depth + 1)
      if (found !== null) return found
    }
  }

  return null
}

/**
 * Get search keys for a metric name
 */
function getSearchKeys(metricName: string): string[] {
  const keyMap: Record<string, string[]> = {
    // Core metrics
    efficiency: ['efficiency', 'eff', 'eta', 'system_efficiency', 'systemEfficiency', 'roundTripEfficiency'],
    primaryCost: ['lcoh', 'lcoe', 'lcos', 'lcoc', 'levelized', 'levelizedCost', 'primaryCost'],
    trl: ['trl', 'technology_readiness', 'readinessLevel', 'maturityLevel'],
    rating: ['rating', 'recommendation', 'overallRating', 'finalRating'],
    capex: ['capex', 'capital', 'capitalCost', 'investment', 'totalCapex'],
    lifetime: ['lifetime', 'lifespan', 'operatingHours', 'stackLifetime', 'expectedLifetime'],
    npv: ['npv', 'netPresentValue'],
    irr: ['irr', 'internalRateOfReturn'],
    opex: ['opex', 'operating', 'operatingCost', 'annualCost'],

    // Battery/storage domain metrics
    energyDensity: ['energyDensity', 'energy_density', 'energydensity', 'gravimetric', 'specificEnergy', 'specific_energy', 'whPerKg', 'wh_per_kg', 'wh/kg'],
    cycleLife: ['cycleLife', 'cycle_life', 'cyclelife', 'cycles', 'lifetimeCycles', 'lifetime_cycles', 'numberOfCycles'],
    costPerKwh: ['costPerKwh', 'cost_per_kwh', 'costperkwh', 'lcos', 'unitCost', 'cellCost', 'packCost', 'dollarPerKwh', '$/kwh'],
    roundTripEfficiency: ['roundTripEfficiency', 'round_trip_efficiency', 'roundtripefficiency', 'rte', 'cycleEfficiency'],

    // Hydrogen domain metrics
    specificEnergy: ['specificEnergy', 'specific_energy', 'specificenergy', 'kwhPerNm3', 'kwh_per_nm3', 'energyConsumption', 'energy consumption', 'kwh/nm3'],
    h2Consumption: ['h2Consumption', 'hydrogen_consumption', 'hydrogenconsumption', 'h2_usage', 'hydrogenUsage', 'h2PerTonne'],
    lcoh: ['lcoh', 'levelizedCostOfHydrogen', 'levelized cost of hydrogen', 'hydrogenCost', 'h2Cost'],

    // Industrial domain metrics
    electricityIntensity: ['electricityIntensity', 'electricity_intensity', 'electricityintensity', 'energyIntensity', 'energy intensity', 'mwhPerTonne', 'mwh_per_tonne', 'mwh/tonne'],
    co2Reduction: ['co2Reduction', 'co2_reduction', 'co2reduction', 'emissionsReduction', 'emissions reduction', 'carbonReduction', 'carbon reduction', 'decarbonization'],
    productionCost: ['productionCost', 'production_cost', 'productioncost', 'costPerTonne', 'cost per tonne', 'manufacturingCost'],
    greenPremium: ['greenPremium', 'green_premium', 'greenpremium', 'premiumVsConventional', 'additionalCost'],
  }

  return keyMap[metricName] || [metricName]
}

/**
 * Convert unknown value to number
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && !isNaN(value)) {
    return value
  }

  if (typeof value === 'string') {
    // Remove common formatting
    const cleaned = value.replace(/[,$%\s]/g, '').replace(/[^0-9.-]/g, '')
    const num = parseFloat(cleaned)
    if (!isNaN(num)) {
      return num
    }
  }

  if (typeof value === 'object' && value !== null && 'value' in value) {
    return toNumber((value as Record<string, unknown>).value)
  }

  return null
}

// ============================================================================
// Batch Extraction
// ============================================================================

/**
 * Extract all key metrics from a component output
 */
export function extractAllMetrics(
  componentId: string,
  output: ComponentOutput
): Record<string, MetricExtractionResult> {
  const metrics = [
    'efficiency',
    'primaryCost',
    'trl',
    'rating',
    'capex',
    'lifetime',
    'npv',
    'irr',
    'opex',
  ]

  const results: Record<string, MetricExtractionResult> = {}

  for (const metric of metrics) {
    results[metric] = extractMetric(componentId, metric, output)
  }

  return results
}

/**
 * Extract the standardizedMetrics block directly if it exists
 */
export function extractStandardizedMetrics(
  output: ComponentOutput
): StandardizedMetricsOutput | null {
  const content = output.content as Record<string, unknown>

  if (content && typeof content.standardizedMetrics === 'object') {
    return content.standardizedMetrics as StandardizedMetricsOutput
  }

  return null
}

// ============================================================================
// Exports
// ============================================================================

export {
  AGENT_EXTRACTION_PATHS,
  traversePath,
  deepSearchValue,
  toNumber,
}
