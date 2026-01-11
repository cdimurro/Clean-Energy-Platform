/**
 * Extraction Paths
 *
 * Defines known paths for extracting metrics from each agent's output.
 * This centralized configuration allows consistent metric extraction
 * across different component structures.
 *
 * Each path definition includes:
 * - Multiple paths to try (in order of priority)
 * - Validator function to check extracted values
 * - Optional transformer for unit conversion
 */

import type { ComponentOutput } from './base-agent'
import type { ExtractionAttempt, SanityCheckResult } from './debug-logger'

// ============================================================================
// Types
// ============================================================================

export interface ExtractionPath {
  /** Paths to try, in order of priority */
  paths: PathSegment[][]

  /** Unit of the extracted value */
  unit: string

  /** Validator function - returns true if value is acceptable */
  validator?: (value: number) => boolean

  /** Transform function to convert/normalize the value */
  transform?: (value: number) => number

  /** Default value if extraction fails */
  defaultValue?: number
}

/** A segment in a path - can be string key or object matcher */
export type PathSegment = string | { id: string } | { name: string } | { index: number }

export interface ExtractionResult {
  value: number | null
  foundAt: string[] | null
  rawValue: unknown
  transformedValue: number | null
  success: boolean
  error?: string
}

// ============================================================================
// Path Definitions
// ============================================================================

export const EXTRACTION_PATHS: Record<string, Record<string, ExtractionPath>> = {
  // ---------------------------------------------------------------------------
  // TEA Analysis Component
  // ---------------------------------------------------------------------------
  'tea-analysis': {
    // Primary cost metric (LCOH, LCOE, etc.)
    primaryCost: {
      paths: [
        ['content', 'standardizedMetrics', 'primaryCostMetric', 'value'],
        ['standardizedMetrics', 'primaryCostMetric', 'value'],
        ['content', 'financialMetrics', 'primary', 'lcoe', 'value'],
        ['content', 'financialMetrics', 'primary', 'lcoh', 'value'],
      ],
      unit: '$/unit',
      validator: (v) => v > 0 && v < 10000,
    },

    lcoh: {
      paths: [
        ['content', 'standardizedMetrics', 'primaryCostMetric', 'value'],
        ['standardizedMetrics', 'primaryCostMetric', 'value'],
      ],
      unit: '$/kg',
      validator: (v) => v > 0 && v < 50,
    },

    lcoe: {
      paths: [
        ['content', 'financialMetrics', 'primary', 'lcoe', 'value'],
        ['content', 'standardizedMetrics', 'primaryCostMetric', 'value'],
      ],
      unit: '$/MWh',
      validator: (v) => v > 0 && v < 500,
    },

    lcoc: {
      paths: [
        ['content', 'standardizedMetrics', 'primaryCostMetric', 'value'],
      ],
      unit: '$/tonne',
      validator: (v) => v > 0 && v < 5000,
    },

    efficiency: {
      paths: [
        ['content', 'standardizedMetrics', 'efficiency', 'value'],
        ['standardizedMetrics', 'efficiency', 'value'],
      ],
      unit: '%',
      validator: (v) => v >= 0 && v <= 100,
    },

    capex: {
      paths: [
        ['content', 'standardizedMetrics', 'capex', 'value'],
        ['standardizedMetrics', 'capex', 'value'],
        ['content', 'capexBreakdown', 'tasc', 'total'],
      ],
      unit: '$/kW',
      validator: (v) => v > 0,
    },

    opex: {
      paths: [
        ['content', 'standardizedMetrics', 'opex', 'value'],
        ['standardizedMetrics', 'opex', 'value'],
        ['content', 'opexBreakdown', 'totalAnnual'],
      ],
      unit: '$/year',
      validator: (v) => v > 0,
    },

    npv: {
      paths: [
        ['content', 'standardizedMetrics', 'npv', 'value'],
        ['content', 'financialMetrics', 'primary', 'npv', 'value'],
      ],
      unit: '$',
      validator: (v) => true, // NPV can be negative
    },

    irr: {
      paths: [
        ['content', 'standardizedMetrics', 'irr', 'value'],
        ['content', 'financialMetrics', 'primary', 'irr', 'value'],
      ],
      unit: '%',
      validator: (v) => v >= -100 && v <= 500,
    },

    lifetime: {
      paths: [
        ['content', 'standardizedMetrics', 'lifetime', 'value'],
        ['standardizedMetrics', 'lifetime', 'value'],
      ],
      unit: 'hours',
      validator: (v) => v >= 1000,
      transform: (v) => v < 100 ? v * 8760 : v, // Convert years to hours if needed
    },

    trl: {
      paths: [
        ['content', 'standardizedMetrics', 'trl'],
        ['standardizedMetrics', 'trl'],
      ],
      unit: '',
      validator: (v) => v >= 1 && v <= 9 && Number.isInteger(v),
    },

    rating: {
      paths: [
        ['content', 'standardizedMetrics', 'rating'],
        ['standardizedMetrics', 'rating'],
        ['content', 'rating'],
      ],
      unit: '',
      validator: (v) => ['BREAKTHROUGH', 'PROMISING', 'CONDITIONAL', 'NOT_RECOMMENDED'].includes(String(v)),
    },
  },

  // ---------------------------------------------------------------------------
  // Performance Simulation Component
  // ---------------------------------------------------------------------------
  'performance-simulation': {
    efficiency: {
      paths: [
        ['content', 'standardizedMetrics', 'efficiency', 'value'],
        ['content', 'keyMetrics', 'efficiency', 'value'],
        ['content', 'performanceMetrics', 'systemEfficiency'],
        ['content', 'performanceMetrics', 'efficiency'],
      ],
      unit: '%',
      validator: (v) => v >= 0 && v <= 100,
    },

    cycleLife: {
      paths: [
        ['content', 'standardizedMetrics', 'secondaryMetrics', { id: 'cycle_life' }, 'value'],
        ['content', 'degradation', 'cycleLife'],
        ['content', 'performanceMetrics', 'cycleLife'],
        ['content', 'degradationAnalysis', 'expectedCycles'],
      ],
      unit: 'cycles',
      validator: (v) => v >= 100, // At least 100 cycles for any battery
    },

    energyDensity: {
      paths: [
        ['content', 'standardizedMetrics', 'secondaryMetrics', { id: 'energy_density' }, 'value'],
        ['content', 'performanceMetrics', 'energyDensity'],
        ['content', 'keyMetrics', 'energyDensity', 'value'],
      ],
      unit: 'Wh/kg',
      validator: (v) => v >= 50 && v <= 1000,
    },

    lifetime: {
      paths: [
        ['content', 'standardizedMetrics', 'lifetime', 'value'],
        ['content', 'degradationAnalysis', 'lifetimeProjection', 'expectedLifetime'],
        ['content', 'degradation', 'expectedLifetime'],
      ],
      unit: 'hours',
      validator: (v) => v >= 1000,
      transform: (v) => v < 100 ? v * 8760 : v, // Convert years to hours
    },

    specificConsumption: {
      paths: [
        ['content', 'standardizedMetrics', 'secondaryMetrics', { id: 'specific_consumption' }, 'value'],
        ['content', 'performanceMetrics', 'specificConsumption'],
        ['content', 'keyMetrics', 'specificEnergyConsumption', 'value'],
      ],
      unit: 'kWh/Nm3',
      validator: (v) => v >= 3 && v <= 10,
    },

    captureEfficiency: {
      paths: [
        ['content', 'performanceMetrics', 'captureEfficiency'],
        ['content', 'keyMetrics', 'captureRate', 'value'],
      ],
      unit: '%',
      validator: (v) => v >= 50 && v <= 100,
    },
  },

  // ---------------------------------------------------------------------------
  // Technology Deep Dive Component
  // ---------------------------------------------------------------------------
  'technology-deep-dive': {
    trl: {
      paths: [
        ['content', 'standardizedMetrics', 'trl'],
        ['content', 'trl', 'currentTRL'],
        ['content', 'trlAssessment', 'level'],
      ],
      unit: '',
      validator: (v) => v >= 1 && v <= 9 && Number.isInteger(v),
    },

    efficiency: {
      paths: [
        ['content', 'standardizedMetrics', 'efficiency', 'value'],
        ['content', 'overview', 'performanceMetrics', { name: 'efficiency' }, 'value'],
      ],
      unit: '%',
      validator: (v) => v >= 0 && v <= 100,
    },
  },

  // ---------------------------------------------------------------------------
  // Final Synthesis Component
  // ---------------------------------------------------------------------------
  'final-synthesis': {
    rating: {
      paths: [
        ['content', 'standardizedMetrics', 'rating'],
        ['content', 'rating'],
        ['content', 'recommendation', 'rating'],
        ['content', 'overallAssessment', 'rating'],
      ],
      unit: '',
      validator: (v) => ['BREAKTHROUGH', 'PROMISING', 'CONDITIONAL', 'NOT_RECOMMENDED'].includes(String(v)),
    },

    trl: {
      paths: [
        ['content', 'standardizedMetrics', 'trl'],
        ['content', 'trl'],
        ['content', 'overallAssessment', 'trl'],
      ],
      unit: '',
      validator: (v) => v >= 1 && v <= 9 && Number.isInteger(v),
    },
  },

  // ---------------------------------------------------------------------------
  // Claims Validation Component
  // ---------------------------------------------------------------------------
  'claims-validation': {
    validationScore: {
      paths: [
        ['content', 'overallValidationScore'],
        ['content', 'summary', 'validationScore'],
      ],
      unit: '%',
      validator: (v) => v >= 0 && v <= 100,
    },
  },
}

// ============================================================================
// Extraction Functions
// ============================================================================

/**
 * Traverse a path to extract a value from an object
 */
function traversePath(obj: unknown, path: PathSegment[]): unknown {
  let current = obj

  for (const segment of path) {
    if (current === null || current === undefined) {
      return undefined
    }

    if (typeof segment === 'string') {
      // Simple key access
      current = (current as Record<string, unknown>)[segment]
    } else if ('id' in segment) {
      // Array search by id field
      if (Array.isArray(current)) {
        current = current.find(item => item?.id === segment.id)
      } else {
        return undefined
      }
    } else if ('name' in segment) {
      // Array search by name field
      if (Array.isArray(current)) {
        current = current.find(item => item?.name === segment.name)
      } else {
        return undefined
      }
    } else if ('index' in segment) {
      // Array index access
      if (Array.isArray(current)) {
        current = current[segment.index]
      } else {
        return undefined
      }
    }
  }

  return current
}

/**
 * Extract a metric value from a component output
 */
export function extractMetric(
  componentId: string,
  metricId: string,
  output: ComponentOutput | Record<string, unknown>
): ExtractionResult {
  const pathConfig = EXTRACTION_PATHS[componentId]?.[metricId]

  if (!pathConfig) {
    return {
      value: null,
      foundAt: null,
      rawValue: undefined,
      transformedValue: null,
      success: false,
      error: `No extraction path defined for ${componentId}.${metricId}`,
    }
  }

  // Try each path until we find a value
  for (const path of pathConfig.paths) {
    const rawValue = traversePath(output, path)

    if (rawValue !== undefined && rawValue !== null) {
      // Handle string ratings
      if (typeof rawValue === 'string' && pathConfig.validator) {
        if (pathConfig.validator(rawValue as unknown as number)) {
          return {
            value: rawValue as unknown as number,
            foundAt: path.map(String),
            rawValue,
            transformedValue: null,
            success: true,
          }
        }
      }

      // Handle numeric values
      const numericValue = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue))

      if (!isNaN(numericValue)) {
        // Apply transform if defined
        const transformedValue = pathConfig.transform
          ? pathConfig.transform(numericValue)
          : numericValue

        // Validate
        if (!pathConfig.validator || pathConfig.validator(transformedValue)) {
          return {
            value: transformedValue,
            foundAt: path.map(String),
            rawValue,
            transformedValue: pathConfig.transform ? transformedValue : null,
            success: true,
          }
        }
      }
    }
  }

  // All paths failed
  return {
    value: pathConfig.defaultValue ?? null,
    foundAt: null,
    rawValue: undefined,
    transformedValue: null,
    success: false,
    error: `No valid value found in any path for ${metricId}`,
  }
}

/**
 * Extract multiple metrics from a component output
 */
export function extractMetrics(
  componentId: string,
  metricIds: string[],
  output: ComponentOutput | Record<string, unknown>
): Record<string, ExtractionResult> {
  const results: Record<string, ExtractionResult> = {}

  for (const metricId of metricIds) {
    results[metricId] = extractMetric(componentId, metricId, output)
  }

  return results
}

/**
 * Get all metric IDs defined for a component
 */
export function getMetricIdsForComponent(componentId: string): string[] {
  const paths = EXTRACTION_PATHS[componentId]
  return paths ? Object.keys(paths) : []
}

/**
 * Deep search for a value by name (fallback when paths fail)
 */
export function deepSearchForValue(
  obj: unknown,
  searchKeys: string[],
  validator?: (v: number) => boolean
): { value: number | null; path: string[] } {
  const normalizedSearchKeys = searchKeys.map(k => k.toLowerCase())

  function search(current: unknown, path: string[]): { value: number | null; path: string[] } | null {
    if (current === null || current === undefined) {
      return null
    }

    if (typeof current === 'object') {
      const entries = Array.isArray(current)
        ? current.map((v, i) => [String(i), v] as const)
        : Object.entries(current)

      for (const [key, value] of entries) {
        // Check if this key matches any search key
        if (normalizedSearchKeys.some(sk => key.toLowerCase().includes(sk))) {
          if (typeof value === 'number') {
            if (!validator || validator(value)) {
              return { value, path: [...path, key] }
            }
          } else if (typeof value === 'object' && value !== null) {
            // Check for nested value property
            const nestedValue = (value as Record<string, unknown>).value
            if (typeof nestedValue === 'number') {
              if (!validator || validator(nestedValue)) {
                return { value: nestedValue, path: [...path, key, 'value'] }
              }
            }
          }
        }

        // Recurse into objects
        if (typeof value === 'object') {
          const result = search(value, [...path, key])
          if (result) return result
        }
      }
    }

    return null
  }

  const result = search(obj, [])
  return result || { value: null, path: [] }
}

/**
 * Create an extraction attempt record for debugging
 */
export function createExtractionAttempt(
  metricId: string,
  componentId: string,
  result: ExtractionResult
): ExtractionAttempt {
  return {
    metricId,
    componentId,
    paths: EXTRACTION_PATHS[componentId]?.[metricId]?.paths.map(p => p.map(String)) || [],
    foundAt: result.foundAt,
    rawValue: result.rawValue,
    transformedValue: result.transformedValue,
    success: result.success,
    error: result.error,
  }
}
