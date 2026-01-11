/**
 * Physics-Based Validation Module
 *
 * Exports the complete validation stack for verifying clean energy
 * technology claims against physics limits, benchmarks, and simulations.
 */

// Main validation engine
export {
  ValidationEngine,
  getValidationEngine,
  initializeValidationEngine,
  type ValidationTier,
  type ClaimType,
  type ValidationStatus,
  type ConfidenceLevel,
  type ValidationRequest,
  type PhysicsCheckResult,
  type CalculatedValue,
  type SimulationResult,
  type BenchmarkComparison,
  type ValidationResult,
  type ValidationBatch,
} from './validation-engine'

// Tier selection
export {
  selectValidationTier,
  hasAnalyticalModel,
  needsPhysicsSimulation,
  hasSurrogateModel,
  getTierCapabilities,
  getRecommendedTiers,
  type TierSelectionCriteria,
  type TierCapabilities,
} from './tier-selector'

// Tier 1: Physics limits
export {
  checkThermodynamicLimits,
  checkBenchmarks,
  calculateCarnotEfficiency,
  getPhysicsLimits,
  PHYSICS_CONSTANTS,
  type LimitType,
} from './tier1-rules/thermodynamic-limits'

// Pre-loaders
export {
  PreloadedBenchmarks,
  formatBenchmarkRange,
  isWithinBenchmark,
  calculatePercentile,
  type BenchmarkRange,
  type TechnologyBenchmarks,
  type DomainBenchmarks,
} from './preload/benchmark-preloader'

export {
  CoolPropCache,
  getHydrogenDensity,
  getWaterProperties,
  calculateH2ProductionRate,
  calculateRequiredPower,
  type FluidProperties,
  type PropertyTable,
  type PropertyRange,
} from './preload/coolprop-cache'
