/**
 * Carbon Module
 *
 * Exports for carbon accounting, avoided emissions,
 * and LCA validation functionality.
 * Phase 4 of investor due diligence market enhancement.
 */

export {
  AvoidedEmissionsCalculator,
  calculateAvoidedEmissions,
  suggestBaselines,
  getEmissionFactor,
  listAvailableFactors,
} from './avoided-emissions'

export {
  LCAValidator,
  validateLCA,
  getBenchmark,
  listBenchmarks,
  checkStandardCompliance,
} from './lca-validator'
