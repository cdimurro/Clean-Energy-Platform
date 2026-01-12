/**
 * TRL Calculation Engine
 *
 * Weighted scoring algorithm for multi-reviewer TRL assessments.
 * Supports multiple consensus methods and confidence calculations.
 */

import type {
  TRLLevel,
  TRLSublevel,
  TRLScore,
  ReviewSession,
  ConsensusMethod,
  Reviewer,
  TRLDisagreement,
  TechnologyDomain,
} from '@/types/trl'
import { getTRLScore, TRL_LEVELS } from './nasa-trl-framework'

/**
 * Weights for different evidence types when calculating confidence
 */
const EVIDENCE_TYPE_WEIGHTS: Record<string, number> = {
  document: 0.15,
  data: 0.25,
  publication: 0.20,
  video: 0.10,
  prototype: 0.30,
}

/**
 * Weights for reviewer expertise levels
 */
const REVIEWER_EXPERTISE_WEIGHTS: Record<string, number> = {
  domain_expert: 1.0,
  technical_reviewer: 0.8,
  general_reviewer: 0.6,
  observer: 0.4,
}

/**
 * Calculate the numeric TRL value from level and sublevel
 */
export function calculateNumericTRL(level: TRLLevel, sublevel: TRLSublevel): number {
  return getTRLScore(level, sublevel)
}

/**
 * Convert a numeric TRL score back to level and sublevel
 */
export function numericToTRL(score: number): { level: TRLLevel; sublevel: TRLSublevel } {
  const level = Math.floor(score) as TRLLevel
  const remainder = score - level

  let sublevel: TRLSublevel
  if (remainder < 0.17) {
    sublevel = 'a'
  } else if (remainder < 0.5) {
    sublevel = 'b'
  } else {
    sublevel = 'c'
  }

  return { level: Math.max(1, Math.min(9, level)) as TRLLevel, sublevel }
}

/**
 * Calculate weighted average TRL from multiple reviewer scores
 */
export function calculateWeightedAverageTRL(
  scores: Array<{ score: TRLScore; reviewer: Reviewer }>
): TRLScore {
  if (scores.length === 0) {
    throw new Error('No scores provided')
  }

  let totalWeight = 0
  let weightedSum = 0
  let confidenceSum = 0

  for (const { score, reviewer } of scores) {
    const weight = REVIEWER_EXPERTISE_WEIGHTS[reviewer.role] || 0.5
    const numericScore = calculateNumericTRL(score.level, score.sublevel)

    weightedSum += numericScore * weight
    confidenceSum += score.confidence * weight
    totalWeight += weight
  }

  const averageScore = weightedSum / totalWeight
  const averageConfidence = confidenceSum / totalWeight
  const { level, sublevel } = numericToTRL(averageScore)

  return {
    level,
    sublevel,
    confidence: Math.round(averageConfidence),
    justification: `Weighted average of ${scores.length} reviewer scores`,
    assessedAt: new Date().toISOString(),
    assessedBy: 'system',
  }
}

/**
 * Calculate median TRL from multiple reviewer scores
 */
export function calculateMedianTRL(scores: TRLScore[]): TRLScore {
  if (scores.length === 0) {
    throw new Error('No scores provided')
  }

  const numericScores = scores
    .map((s) => ({
      numeric: calculateNumericTRL(s.level, s.sublevel),
      confidence: s.confidence,
    }))
    .sort((a, b) => a.numeric - b.numeric)

  const midIndex = Math.floor(numericScores.length / 2)
  let medianScore: number
  let medianConfidence: number

  if (numericScores.length % 2 === 0) {
    medianScore = (numericScores[midIndex - 1].numeric + numericScores[midIndex].numeric) / 2
    medianConfidence =
      (numericScores[midIndex - 1].confidence + numericScores[midIndex].confidence) / 2
  } else {
    medianScore = numericScores[midIndex].numeric
    medianConfidence = numericScores[midIndex].confidence
  }

  const { level, sublevel } = numericToTRL(medianScore)

  return {
    level,
    sublevel,
    confidence: Math.round(medianConfidence),
    justification: `Median of ${scores.length} reviewer scores`,
    assessedAt: new Date().toISOString(),
    assessedBy: 'system',
  }
}

/**
 * Calculate conservative (minimum) TRL from multiple reviewer scores
 */
export function calculateConservativeTRL(scores: TRLScore[]): TRLScore {
  if (scores.length === 0) {
    throw new Error('No scores provided')
  }

  let minScore = Infinity
  let minConfidence = Infinity
  let minJustification = ''

  for (const score of scores) {
    const numeric = calculateNumericTRL(score.level, score.sublevel)
    if (numeric < minScore) {
      minScore = numeric
      minConfidence = score.confidence
      minJustification = score.justification
    }
  }

  const { level, sublevel } = numericToTRL(minScore)

  return {
    level,
    sublevel,
    confidence: minConfidence,
    justification: `Most conservative score from ${scores.length} reviewers: ${minJustification}`,
    assessedAt: new Date().toISOString(),
    assessedBy: 'system',
  }
}

/**
 * Delphi method consensus calculation
 * Iteratively refines scores by excluding outliers until convergence
 */
export function calculateDelphiConsensus(
  scores: Array<{ score: TRLScore; reviewer: Reviewer }>,
  maxIterations: number = 3
): { consensusScore: TRLScore; rounds: number } {
  if (scores.length < 3) {
    // Delphi requires at least 3 reviewers
    return { consensusScore: calculateWeightedAverageTRL(scores), rounds: 1 }
  }

  let currentScores = [...scores]
  let previousMean = -1
  let rounds = 0

  for (let i = 0; i < maxIterations; i++) {
    rounds++

    // Calculate current mean
    const numericScores = currentScores.map(({ score }) =>
      calculateNumericTRL(score.level, score.sublevel)
    )
    const mean = numericScores.reduce((a, b) => a + b, 0) / numericScores.length
    const stdDev = Math.sqrt(
      numericScores.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / numericScores.length
    )

    // Check for convergence
    if (Math.abs(mean - previousMean) < 0.1 || stdDev < 0.5) {
      break
    }

    previousMean = mean

    // Exclude outliers (scores > 1.5 standard deviations from mean)
    if (stdDev > 0) {
      currentScores = currentScores.filter(({ score }) => {
        const numeric = calculateNumericTRL(score.level, score.sublevel)
        return Math.abs(numeric - mean) <= 1.5 * stdDev
      })

      // Ensure we keep at least 2 scores
      if (currentScores.length < 2) {
        currentScores = [...scores].sort((a, b) => {
          const aNum = calculateNumericTRL(a.score.level, a.score.sublevel)
          const bNum = calculateNumericTRL(b.score.level, b.score.sublevel)
          return Math.abs(aNum - mean) - Math.abs(bNum - mean)
        }).slice(0, 2)
      }
    }
  }

  const consensusScore = calculateWeightedAverageTRL(currentScores)
  consensusScore.justification = `Delphi consensus after ${rounds} rounds with ${currentScores.length} reviewers`

  return { consensusScore, rounds }
}

/**
 * Helper to extract scores from either Map or Array format
 */
function extractScorePairs(
  session: ReviewSession
): Array<{ score: TRLScore; reviewer: Reviewer }> {
  const scores = session.individualScores

  if (scores instanceof Map) {
    return Array.from(scores.entries()).map(([reviewerId, score]) => ({
      score,
      reviewer: session.reviewers.find((r) => r.id === reviewerId) || createDefaultReviewer(reviewerId),
    }))
  }

  // Array format (IndividualScore[])
  return (scores as Array<{ reviewerId: string; score: TRLScore }>).map((item) => ({
    score: item.score,
    reviewer: session.reviewers.find((r) => r.id === item.reviewerId) || createDefaultReviewer(item.reviewerId),
  }))
}

/**
 * Create a default reviewer object
 */
function createDefaultReviewer(reviewerId: string): Reviewer {
  return {
    id: reviewerId,
    name: 'Unknown',
    email: '',
    role: 'general_reviewer' as const,
    expertise: [],
    domain: [],
  }
}

/**
 * Calculate consensus based on the specified method
 */
export function calculateConsensus(
  session: ReviewSession,
  method: ConsensusMethod
): TRLScore {
  const scorePairs = extractScorePairs(session)

  switch (method) {
    case 'weighted-average':
      return calculateWeightedAverageTRL(scorePairs)

    case 'median':
      return calculateMedianTRL(scorePairs.map((p) => p.score))

    case 'conservative':
      return calculateConservativeTRL(scorePairs.map((p) => p.score))

    case 'delphi':
      return calculateDelphiConsensus(scorePairs).consensusScore

    default:
      return calculateWeightedAverageTRL(scorePairs)
  }
}

/**
 * Identify disagreements between reviewers
 */
export function identifyDisagreements(session: ReviewSession): TRLDisagreement[] {
  const disagreements: TRLDisagreement[] = []
  const scorePairs = extractScorePairs(session)
  const scores: Array<[string, TRLScore]> = scorePairs.map((p) => [p.reviewer.id, p.score])

  // Compare each pair of reviewers
  for (let i = 0; i < scores.length; i++) {
    for (let j = i + 1; j < scores.length; j++) {
      const [reviewerId1, score1] = scores[i]
      const [reviewerId2, score2] = scores[j]

      const numeric1 = calculateNumericTRL(score1.level, score1.sublevel)
      const numeric2 = calculateNumericTRL(score2.level, score2.sublevel)
      const difference = Math.abs(numeric1 - numeric2)

      // Flag disagreements >= 1 TRL level
      if (difference >= 1) {
        const reviewer1 = session.reviewers.find((r) => r.id === reviewerId1)
        const reviewer2 = session.reviewers.find((r) => r.id === reviewerId2)

        disagreements.push({
          id: `${reviewerId1}-${reviewerId2}`,
          reviewerIds: [reviewerId1, reviewerId2],
          levelDifference: difference,
          description: `${reviewer1?.name || 'Reviewer 1'} rated TRL ${score1.level}${score1.sublevel} while ${reviewer2?.name || 'Reviewer 2'} rated TRL ${score2.level}${score2.sublevel}`,
          resolved: false,
        })
      }
    }
  }

  return disagreements
}

/**
 * Calculate confidence score based on evidence completeness
 */
export function calculateEvidenceConfidence(
  level: TRLLevel,
  sublevel: TRLSublevel,
  submittedEvidence: Array<{ type: string; verified: boolean }>
): number {
  const requirements = TRL_LEVELS[level].sublevels[sublevel].evidenceRequirements

  let totalWeight = 0
  let completedWeight = 0

  for (const req of requirements) {
    const reqType = req.type || 'document'
    const weight = req.required
      ? (EVIDENCE_TYPE_WEIGHTS[reqType] || 0.15) * 1.5
      : EVIDENCE_TYPE_WEIGHTS[reqType] || 0.15

    totalWeight += weight

    const matching = submittedEvidence.find(
      (e) => e.type === reqType
    )
    if (matching) {
      completedWeight += matching.verified ? weight : weight * 0.7
    }
  }

  return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0
}

/**
 * Calculate overall assessment quality score
 */
export function calculateAssessmentQuality(
  session: ReviewSession,
  consensusScore: TRLScore
): {
  score: number
  factors: Array<{ name: string; score: number; weight: number }>
} {
  const factors: Array<{ name: string; score: number; weight: number }> = []

  // Factor 1: Number of reviewers (20%)
  const reviewerCountScore = Math.min(session.reviewers.length / 5, 1) * 100
  factors.push({ name: 'Reviewer Coverage', score: reviewerCountScore, weight: 0.2 })

  // Factor 2: Reviewer expertise diversity (20%)
  const roles = new Set(session.reviewers.map((r) => r.role))
  const diversityScore = (roles.size / 4) * 100
  factors.push({ name: 'Expertise Diversity', score: diversityScore, weight: 0.2 })

  // Factor 3: Agreement level (30%)
  const disagreements = identifyDisagreements(session)
  const agreementScore = Math.max(0, 100 - disagreements.length * 25)
  factors.push({ name: 'Reviewer Agreement', score: agreementScore, weight: 0.3 })

  // Factor 4: Confidence level (30%)
  factors.push({ name: 'Confidence', score: consensusScore.confidence, weight: 0.3 })

  // Calculate weighted total
  const totalScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0)

  return { score: Math.round(totalScore), factors }
}

/**
 * Recommend next steps based on current TRL and gaps
 */
export function recommendNextSteps(
  currentLevel: TRLLevel,
  currentSublevel: TRLSublevel,
  domain: TechnologyDomain,
  completedEvidence: string[]
): string[] {
  const recommendations: string[] = []
  const currentReqs = TRL_LEVELS[currentLevel].sublevels[currentSublevel].evidenceRequirements

  // Check for missing required evidence at current level
  const missingRequired = currentReqs.filter(
    (req) => req.required && !completedEvidence.includes(req.description)
  )

  if (missingRequired.length > 0) {
    recommendations.push(
      `Complete ${missingRequired.length} required evidence items for TRL ${currentLevel}${currentSublevel}:`
    )
    missingRequired.forEach((req) => {
      recommendations.push(`  - ${req.description}`)
    })
  }

  // Suggest moving to next sublevel/level
  const exitCriteria = TRL_LEVELS[currentLevel].sublevels[currentSublevel].exitCriteria
  recommendations.push(`Ensure exit criteria are met:`)
  exitCriteria.forEach((criterion) => {
    recommendations.push(`  - ${criterion}`)
  })

  return recommendations
}
