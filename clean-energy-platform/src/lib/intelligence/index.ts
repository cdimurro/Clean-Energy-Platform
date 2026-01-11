/**
 * Intelligence Module
 *
 * Exports for competitor and patent intelligence analysis.
 * Phase 3 of investor due diligence market enhancement.
 */

export {
  CompetitorMapper,
  generateCompetitiveLandscape,
  identifyCompetitors,
  type CompetitorProfile,
  type CompetitorComparison,
  type MarketPositioning,
  type CompetitiveLandscape,
  type CompetitorMapperConfig,
} from './competitor-mapper'

export {
  PatentAnalyzer,
  analyzePatentLandscape,
  findPriorArt,
  assessFreedomToOperate,
  type Patent,
  type PatentClassification,
  type PatentHolder,
  type FTORisk,
  type PatentTrend,
  type PatentLandscape,
  type PatentAnalyzerConfig,
} from './patent-analyzer'
