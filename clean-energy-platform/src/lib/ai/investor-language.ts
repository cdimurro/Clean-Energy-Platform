/**
 * Investor Language Translation
 *
 * Translates technical simulation outputs into investor-friendly language.
 * Converts physics metrics to risk-adjusted business metrics.
 *
 * Used for: Physics Simulation Validation product ($25K-$75K)
 */

// ============================================================================
// Types
// ============================================================================

export interface TechnicalMetric {
  name: string
  value: number
  unit: string
  benchmark?: number
  benchmarkSource?: string
}

export interface InvestorMetric {
  name: string
  value: string
  interpretation: string
  riskLevel: 'low' | 'medium' | 'high'
  investorImplication: string
}

export interface PerformanceRiskSummary {
  overallRisk: 'low' | 'medium' | 'high'
  technicalMaturity: string
  scaleUpRisk: string
  performanceConfidence: string
  keyRisks: string[]
  keyStrengths: string[]
}

export interface InvestorSimulationSummary {
  headline: string
  metrics: InvestorMetric[]
  riskSummary: PerformanceRiskSummary
  competitivePosition: string
  investmentImplications: string[]
  dueDiligenceQuestions: string[]
}

// ============================================================================
// Translation Maps
// ============================================================================

const METRIC_TRANSLATIONS: Record<string, {
  investorName: string
  interpretationTemplate: (value: number, benchmark?: number) => string
  riskAssessment: (value: number, benchmark?: number) => 'low' | 'medium' | 'high'
  implicationTemplate: (value: number, benchmark?: number) => string
}> = {
  'efficiency': {
    investorName: 'Energy Conversion Efficiency',
    interpretationTemplate: (value, benchmark) => {
      if (!benchmark) return `${value.toFixed(1)}% of input energy converted to useful output`
      const pct = ((value / benchmark) * 100).toFixed(0)
      return `${value.toFixed(1)}% efficiency (${pct}% of theoretical maximum)`
    },
    riskAssessment: (value, benchmark) => {
      if (!benchmark) return 'medium'
      const ratio = value / benchmark
      if (ratio > 0.85) return 'low'
      if (ratio > 0.65) return 'medium'
      return 'high'
    },
    implicationTemplate: (value, benchmark) => {
      if (!benchmark) return 'Efficiency determines operating cost competitiveness'
      const ratio = value / benchmark
      if (ratio > 0.9) return 'Near-theoretical efficiency suggests mature technology with limited improvement potential'
      if (ratio > 0.7) return 'Good efficiency with room for optimization during scale-up'
      return 'Low efficiency may require significant R&D investment before commercial viability'
    },
  },
  'degradation_rate': {
    investorName: 'Annual Performance Decline',
    interpretationTemplate: (value) =>
      `${value.toFixed(2)}% performance loss per year of operation`,
    riskAssessment: (value) => {
      if (value < 0.5) return 'low'
      if (value < 1.5) return 'medium'
      return 'high'
    },
    implicationTemplate: (value) => {
      if (value < 0.5) return 'Excellent durability - replacement costs minimal over project life'
      if (value < 1.0) return 'Acceptable degradation - factor into lifetime revenue projections'
      return 'High degradation risk - may require mid-life replacement affecting IRR'
    },
  },
  'lifetime': {
    investorName: 'Expected Operating Lifetime',
    interpretationTemplate: (value) => `${value.toFixed(0)} years before major replacement needed`,
    riskAssessment: (value) => {
      if (value >= 25) return 'low'
      if (value >= 15) return 'medium'
      return 'high'
    },
    implicationTemplate: (value) => {
      if (value >= 25) return 'Long lifetime supports debt financing and stable cash flows'
      if (value >= 15) return 'Standard lifetime - ensure replacement costs modeled in financials'
      return 'Short lifetime increases replacement capex risk and affects IRR significantly'
    },
  },
  'capacity_factor': {
    investorName: 'Capacity Utilization',
    interpretationTemplate: (value) =>
      `Operating at ${(value * 100).toFixed(1)}% of maximum capacity on average`,
    riskAssessment: (value) => {
      if (value > 0.85) return 'low'
      if (value > 0.60) return 'medium'
      return 'high'
    },
    implicationTemplate: (value) => {
      if (value > 0.85) return 'High utilization maximizes asset productivity and revenue'
      if (value > 0.60) return 'Moderate utilization - validate demand assumptions'
      return 'Low utilization risk - revenue projections may be optimistic'
    },
  },
  'lcoe': {
    investorName: 'Levelized Cost of Energy',
    interpretationTemplate: (value, benchmark) => {
      if (!benchmark) return `$${value.toFixed(2)}/MWh all-in cost over project lifetime`
      const pct = (((benchmark - value) / benchmark) * 100).toFixed(0)
      return `$${value.toFixed(2)}/MWh (${value < benchmark ? pct + '% below' : Math.abs(parseFloat(pct)) + '% above'} market average)`
    },
    riskAssessment: (value, benchmark) => {
      if (!benchmark) return 'medium'
      if (value < benchmark * 0.8) return 'low'
      if (value < benchmark * 1.1) return 'medium'
      return 'high'
    },
    implicationTemplate: (value, benchmark) => {
      if (!benchmark) return 'LCOE determines competitiveness against alternatives'
      if (value < benchmark * 0.8) return 'Strong cost advantage - attractive unit economics'
      if (value < benchmark) return 'Competitive cost position - execution is key'
      return 'Above-market costs require premium offtake or cost reduction roadmap'
    },
  },
  'round_trip_efficiency': {
    investorName: 'Round-Trip Efficiency',
    interpretationTemplate: (value) =>
      `${(value * 100).toFixed(1)}% of stored energy recovered on discharge`,
    riskAssessment: (value) => {
      if (value > 0.85) return 'low'
      if (value > 0.70) return 'medium'
      return 'high'
    },
    implicationTemplate: (value) => {
      if (value > 0.85) return 'High RTE supports arbitrage economics and grid services revenue'
      if (value > 0.70) return 'Acceptable RTE - ensure revenue model accounts for losses'
      return 'Low RTE limits revenue opportunities and market applications'
    },
  },
  'specific_consumption': {
    investorName: 'Energy Consumption per Unit',
    interpretationTemplate: (value, benchmark) => {
      if (!benchmark) return `${value.toFixed(2)} kWh required per unit of output`
      const pct = (((benchmark - value) / benchmark) * 100).toFixed(0)
      return `${value.toFixed(2)} kWh/unit (${parseFloat(pct) > 0 ? pct + '% better than' : Math.abs(parseFloat(pct)) + '% worse than'} benchmark)`
    },
    riskAssessment: (value, benchmark) => {
      if (!benchmark) return 'medium'
      if (value < benchmark * 1.05) return 'low'
      if (value < benchmark * 1.2) return 'medium'
      return 'high'
    },
    implicationTemplate: (value, benchmark) => {
      if (!benchmark) return 'Energy cost is typically 40-60% of operating expenses'
      if (value < benchmark) return 'Below-benchmark consumption provides operating cost advantage'
      return 'Above-benchmark consumption increases operating cost exposure'
    },
  },
}

// ============================================================================
// Translation Functions
// ============================================================================

/**
 * Translate a technical metric to investor language
 */
export function translateMetric(
  metricKey: string,
  value: number,
  unit: string,
  benchmark?: number
): InvestorMetric {
  const translation = METRIC_TRANSLATIONS[metricKey.toLowerCase().replace(/\s+/g, '_')]

  if (!translation) {
    // Fallback for unknown metrics
    return {
      name: metricKey,
      value: `${value.toFixed(2)} ${unit}`,
      interpretation: `Technical metric: ${value.toFixed(2)} ${unit}`,
      riskLevel: 'medium',
      investorImplication: 'Requires domain expertise to interpret',
    }
  }

  return {
    name: translation.investorName,
    value: `${value.toFixed(2)} ${unit}`,
    interpretation: translation.interpretationTemplate(value, benchmark),
    riskLevel: translation.riskAssessment(value, benchmark),
    investorImplication: translation.implicationTemplate(value, benchmark),
  }
}

/**
 * Generate a performance risk summary for investors
 */
export function generatePerformanceRiskSummary(
  metrics: TechnicalMetric[],
  trl: number,
  monteCarloP5?: number,
  monteCarloP95?: number
): PerformanceRiskSummary {
  // Assess technical maturity
  let technicalMaturity: string
  if (trl >= 8) {
    technicalMaturity = 'Commercially proven technology with established track record'
  } else if (trl >= 6) {
    technicalMaturity = 'Demonstrated at scale, transitioning to commercial deployment'
  } else if (trl >= 4) {
    technicalMaturity = 'Validated in laboratory, requires scale-up investment'
  } else {
    technicalMaturity = 'Early research stage, significant development risk'
  }

  // Assess scale-up risk based on TRL
  let scaleUpRisk: string
  if (trl >= 7) {
    scaleUpRisk = 'Low - Technology has been demonstrated at or near commercial scale'
  } else if (trl >= 5) {
    scaleUpRisk = 'Medium - Scale-up path identified but execution risk remains'
  } else {
    scaleUpRisk = 'High - Significant scale-up uncertainty, typical of early-stage deep tech'
  }

  // Assess performance confidence from Monte Carlo
  let performanceConfidence: string
  if (monteCarloP5 && monteCarloP95) {
    const spread = ((monteCarloP95 - monteCarloP5) / monteCarloP5) * 100
    if (spread < 20) {
      performanceConfidence = 'High - Narrow uncertainty range (P5-P95 spread <20%)'
    } else if (spread < 50) {
      performanceConfidence = 'Medium - Moderate uncertainty (P5-P95 spread 20-50%)'
    } else {
      performanceConfidence = 'Low - Wide uncertainty range (P5-P95 spread >50%)'
    }
  } else {
    performanceConfidence = 'Unable to assess - Monte Carlo analysis not available'
  }

  // Identify key risks and strengths from metrics
  const keyRisks: string[] = []
  const keyStrengths: string[] = []

  for (const metric of metrics) {
    const translated = translateMetric(
      metric.name,
      metric.value,
      metric.unit,
      metric.benchmark
    )

    if (translated.riskLevel === 'high') {
      keyRisks.push(`${translated.name}: ${translated.investorImplication}`)
    } else if (translated.riskLevel === 'low') {
      keyStrengths.push(`${translated.name}: ${translated.investorImplication}`)
    }
  }

  // Overall risk assessment
  const highRiskCount = metrics.filter(m => {
    const t = translateMetric(m.name, m.value, m.unit, m.benchmark)
    return t.riskLevel === 'high'
  }).length

  let overallRisk: 'low' | 'medium' | 'high'
  if (highRiskCount >= 2 || trl < 4) {
    overallRisk = 'high'
  } else if (highRiskCount === 1 || trl < 6) {
    overallRisk = 'medium'
  } else {
    overallRisk = 'low'
  }

  return {
    overallRisk,
    technicalMaturity,
    scaleUpRisk,
    performanceConfidence,
    keyRisks: keyRisks.slice(0, 5),
    keyStrengths: keyStrengths.slice(0, 5),
  }
}

/**
 * Generate competitive position statement
 */
export function generateCompetitivePosition(
  benchmarkComparisons: Array<{
    metric: string
    value: number
    benchmark: number
    position: 'leading' | 'competitive' | 'lagging'
  }>
): string {
  const leadingCount = benchmarkComparisons.filter(b => b.position === 'leading').length
  const laggingCount = benchmarkComparisons.filter(b => b.position === 'lagging').length
  const total = benchmarkComparisons.length

  if (leadingCount > total / 2) {
    return 'Technology demonstrates leading performance across key metrics, suggesting potential for market differentiation and premium positioning.'
  } else if (laggingCount > total / 2) {
    return 'Performance lags industry benchmarks on multiple metrics. Cost or performance improvements needed for competitive positioning.'
  } else {
    return 'Performance is competitive with industry benchmarks. Differentiation will likely come from cost, reliability, or market positioning rather than pure performance.'
  }
}

/**
 * Generate investment implications
 */
export function generateInvestmentImplications(
  riskSummary: PerformanceRiskSummary,
  trl: number
): string[] {
  const implications: string[] = []

  // TRL-based implications
  if (trl >= 7) {
    implications.push('Technology is near-commercial, focus due diligence on manufacturing scale-up and go-to-market execution')
  } else if (trl >= 5) {
    implications.push('Technology in demonstration phase - validate pilot results and identify scale-up partners')
  } else {
    implications.push('Early-stage technology - expect 5-10 year development timeline before commercial revenue')
  }

  // Risk-based implications
  if (riskSummary.overallRisk === 'high') {
    implications.push('High technical risk - consider staged investment with milestone-based funding')
    implications.push('Recommend technical advisory board or expert validation before commitment')
  } else if (riskSummary.overallRisk === 'medium') {
    implications.push('Moderate risk profile - standard deep tech investment approach appropriate')
  } else {
    implications.push('Lower technical risk allows focus on commercial and market due diligence')
  }

  // Strengths-based implications
  if (riskSummary.keyStrengths.length > 2) {
    implications.push('Multiple performance advantages support premium pricing or market differentiation strategy')
  }

  // Risks-based implications
  if (riskSummary.keyRisks.length > 0) {
    implications.push(`Key areas for deeper diligence: ${riskSummary.keyRisks.slice(0, 2).map(r => r.split(':')[0]).join(', ')}`)
  }

  return implications.slice(0, 5)
}

/**
 * Generate due diligence questions
 */
export function generateDueDiligenceQuestions(
  riskSummary: PerformanceRiskSummary,
  trl: number,
  technology: string
): string[] {
  const questions: string[] = []

  // Universal questions
  questions.push('What is the testing/validation history and who conducted independent verification?')
  questions.push('What are the key assumptions in performance projections and how sensitive are outcomes to these?')

  // TRL-specific questions
  if (trl < 6) {
    questions.push('What is the detailed scale-up roadmap and what are the key technical milestones?')
    questions.push('What manufacturing partners or capabilities are required for commercialization?')
  } else {
    questions.push('What is the warranty/performance guarantee structure and historical claims experience?')
    questions.push('What is the O&M cost history from deployed systems?')
  }

  // Risk-specific questions
  for (const risk of riskSummary.keyRisks.slice(0, 2)) {
    const metricName = risk.split(':')[0]
    questions.push(`How will ${metricName.toLowerCase()} be improved in next-generation systems?`)
  }

  // Technology-specific questions
  if (technology.toLowerCase().includes('battery') || technology.toLowerCase().includes('storage')) {
    questions.push('What is the cycle life validation data and testing protocol?')
  }
  if (technology.toLowerCase().includes('solar') || technology.toLowerCase().includes('pv')) {
    questions.push('What is the temperature coefficient and performance under real-world conditions?')
  }
  if (technology.toLowerCase().includes('hydrogen') || technology.toLowerCase().includes('electrolyzer')) {
    questions.push('What is the stack replacement schedule and cost?')
  }

  return questions.slice(0, 6)
}

/**
 * Generate complete investor simulation summary
 */
export function generateInvestorSimulationSummary(
  technicalMetrics: TechnicalMetric[],
  trl: number,
  technology: string,
  benchmarkComparisons: Array<{
    metric: string
    value: number
    benchmark: number
    position: 'leading' | 'competitive' | 'lagging'
  }>,
  monteCarloP5?: number,
  monteCarloP95?: number
): InvestorSimulationSummary {
  // Translate all metrics
  const metrics = technicalMetrics.map(m =>
    translateMetric(m.name, m.value, m.unit, m.benchmark)
  )

  // Generate risk summary
  const riskSummary = generatePerformanceRiskSummary(
    technicalMetrics,
    trl,
    monteCarloP5,
    monteCarloP95
  )

  // Generate competitive position
  const competitivePosition = generateCompetitivePosition(benchmarkComparisons)

  // Generate investment implications
  const investmentImplications = generateInvestmentImplications(riskSummary, trl)

  // Generate due diligence questions
  const dueDiligenceQuestions = generateDueDiligenceQuestions(riskSummary, trl, technology)

  // Generate headline
  let headline: string
  if (riskSummary.overallRisk === 'low') {
    headline = `${technology}: Strong Technical Profile with Low Execution Risk`
  } else if (riskSummary.overallRisk === 'high') {
    headline = `${technology}: Significant Technical Validation Required`
  } else {
    headline = `${technology}: Moderate Technical Risk with Clear Development Path`
  }

  return {
    headline,
    metrics,
    riskSummary,
    competitivePosition,
    investmentImplications,
    dueDiligenceQuestions,
  }
}
