/**
 * Climate Claims Validation
 *
 * Validates climate-related claims for investor due diligence.
 * Assesses net-zero, carbon neutral, and other climate claims
 * against recognized standards and best practices.
 *
 * Features:
 * - Net-zero claim assessment
 * - Carbon neutral/negative definitions validation
 * - Offset quality assessment
 * - Greenwashing risk detection
 * - Additionality assessment for CDR
 *
 * Phase 4 of investor due diligence market enhancement
 */

import { generateText } from '@/lib/ai/gemini'
import type {
  ClimateClaimInput,
  ClimateClaimAssessment,
  ClaimIssue,
  GreenwashingRisk,
  ComplianceStatus,
  ClaimType,
  OffsetDetails,
  CDRAssessment,
  CDRProject,
} from '@/types/carbon'

// ============================================================================
// Claim Type Definitions and Requirements
// ============================================================================

interface ClaimTypeDefinition {
  type: ClaimType
  definition: string
  requirements: string[]
  commonIssues: string[]
  regulatoryContext: string[]
}

const CLAIM_DEFINITIONS: ClaimTypeDefinition[] = [
  {
    type: 'net-zero',
    definition:
      'Reducing emissions to zero or balancing residual emissions with permanent carbon removal',
    requirements: [
      'Science-based pathway with interim targets',
      'Scope 1, 2, and material Scope 3 included',
      'Residual emissions offset with high-quality removals',
      'No use of avoidance offsets for net-zero claims',
      'Third-party verification recommended',
    ],
    commonIssues: [
      'Over-reliance on offsets instead of reductions',
      'Excluding material Scope 3 emissions',
      'Using avoidance credits for residual emissions',
      'Vague timeline without interim targets',
    ],
    regulatoryContext: [
      'SBTi Net-Zero Standard',
      'ISO 14068 (forthcoming)',
      'EU Green Claims Directive',
      'UK Advertising Standards Authority guidance',
    ],
  },
  {
    type: 'carbon-neutral',
    definition:
      'Balancing carbon emissions with carbon credits or offsets to achieve zero net emissions',
    requirements: [
      'Complete inventory of claimed scope(s)',
      'Use of credible offset standards',
      'Annual verification and reporting',
      'Clear scope boundary disclosure',
    ],
    commonIssues: [
      'Incomplete emission boundaries',
      'Low-quality offset credits',
      'Lack of reduction efforts',
      'Unclear what is covered by claim',
    ],
    regulatoryContext: [
      'PAS 2060 Carbon Neutrality Standard',
      'Climate Active (Australia)',
      'EU Green Claims Directive proposal',
    ],
  },
  {
    type: 'carbon-negative',
    definition: 'Removing more carbon from atmosphere than emitting across operations',
    requirements: [
      'Verified net-negative emissions across all scopes',
      'Carbon removal exceeds total emissions',
      'Removals must be additional and permanent',
      'Third-party verification required',
    ],
    commonIssues: [
      'Confusing avoided emissions with removals',
      'Using temporary removals (forests) without permanence accounting',
      'Excluding significant emission sources',
    ],
    regulatoryContext: ['No widely accepted standard yet', 'Oxford Principles for Net Zero Aligned Carbon Offsetting'],
  },
  {
    type: 'climate-positive',
    definition: 'Similar to carbon-negative, going beyond neutrality to create positive climate impact',
    requirements: [
      'Net removal of emissions beyond value chain',
      'Holistic environmental benefits considered',
      'Transparent methodology',
    ],
    commonIssues: [
      'Vague definition in marketing',
      'No standardized methodology',
      'Conflation with other claims',
    ],
    regulatoryContext: ['No formal standard exists'],
  },
  {
    type: 'renewable',
    definition: 'Powered by energy from renewable sources (solar, wind, hydro, etc.)',
    requirements: [
      'Energy attribute certificates (RECs/GOs) for claims',
      'Temporal and geographic matching recommended',
      'Distinction between physical and contractual claims',
    ],
    commonIssues: [
      'Unbundled RECs from different regions',
      'Annual matching hiding hourly carbon intensity',
      'Not accounting for grid realities',
    ],
    regulatoryContext: [
      'RE100 Technical Criteria',
      'GHG Protocol Scope 2 Guidance',
      '24/7 Carbon-Free Energy Compact',
    ],
  },
]

// ============================================================================
// Offset Quality Assessment
// ============================================================================

interface OffsetQualityRating {
  registry: string
  qualityScore: number // 1-10
  permanence: 'high' | 'medium' | 'low'
  additionality: 'high' | 'medium' | 'low'
  concerns: string[]
}

const OFFSET_REGISTRY_RATINGS: OffsetQualityRating[] = [
  {
    registry: 'Verra VCS',
    qualityScore: 7,
    permanence: 'medium',
    additionality: 'medium',
    concerns: ['Some project types face scrutiny', 'REDD+ methodology debates'],
  },
  {
    registry: 'Gold Standard',
    qualityScore: 8,
    permanence: 'medium',
    additionality: 'high',
    concerns: ['Limited to avoidance/reduction credits'],
  },
  {
    registry: 'American Carbon Registry',
    qualityScore: 7,
    permanence: 'medium',
    additionality: 'medium',
    concerns: ['Regional focus'],
  },
  {
    registry: 'Climate Action Reserve',
    qualityScore: 7,
    permanence: 'medium',
    additionality: 'high',
    concerns: ['North America focused'],
  },
  {
    registry: 'Puro.earth',
    qualityScore: 9,
    permanence: 'high',
    additionality: 'high',
    concerns: ['Limited scale', 'Emerging methodologies'],
  },
  {
    registry: 'Isometric',
    qualityScore: 9,
    permanence: 'high',
    additionality: 'high',
    concerns: ['Newer registry', 'DAC/CDR focused'],
  },
]

// ============================================================================
// Climate Claims Validator Class
// ============================================================================

export class ClimateClaimsValidator {
  /**
   * Validate a climate claim
   */
  async validate(claim: ClimateClaimInput): Promise<ClimateClaimAssessment> {
    // Get claim definition
    const definition = CLAIM_DEFINITIONS.find((d) => d.type === claim.claimType)

    // Identify issues
    const issues = this.identifyIssues(claim, definition)

    // Assess greenwashing risk
    const greenwashingRisk = this.assessGreenwashingRisk(claim, issues)

    // Check compliance
    const complianceStatus = this.checkCompliance(claim, definition)

    // Generate recommendations
    const recommendations = await this.generateRecommendations(claim, issues, greenwashingRisk)

    // Determine validity
    const criticalIssues = issues.filter((i) => i.severity === 'critical')
    const isValid = criticalIssues.length === 0

    return {
      claim,
      isValid,
      issues,
      recommendations,
      riskLevel: greenwashingRisk.level,
      greenwashingRisk,
      complianceStatus,
    }
  }

  /**
   * Identify issues with the claim
   */
  private identifyIssues(
    claim: ClimateClaimInput,
    definition?: ClaimTypeDefinition
  ): ClaimIssue[] {
    const issues: ClaimIssue[] = []

    // Scope issues
    if (claim.claimType === 'net-zero' && !claim.scope.includes('scope3')) {
      issues.push({
        category: 'scope',
        severity: 'major',
        description: 'Net-zero claims typically require inclusion of material Scope 3 emissions',
        regulation: 'SBTi Net-Zero Standard',
        recommendation: 'Include material Scope 3 categories or clarify claim boundary',
      })
    }

    // Offset issues
    if (claim.offsetsUsed && claim.offsetDetails) {
      const offsetIssues = this.assessOffsetQuality(claim.offsetDetails, claim.claimType)
      issues.push(...offsetIssues)
    }

    // Verification issues
    if (!claim.verificationStatus.verified) {
      const severity =
        claim.claimType === 'net-zero' || claim.claimType === 'carbon-negative'
          ? 'major'
          : 'minor'
      issues.push({
        category: 'verification',
        severity,
        description: 'Claim is not third-party verified',
        recommendation: 'Obtain third-party verification from recognized body',
      })
    }

    // Timeline issues for net-zero
    if (claim.claimType === 'net-zero') {
      if (!claim.targetYear) {
        issues.push({
          category: 'methodology',
          severity: 'major',
          description: 'No target year specified for net-zero achievement',
          recommendation: 'Define science-aligned target year (typically 2050 or earlier)',
        })
      }
      if (!claim.baselineYear) {
        issues.push({
          category: 'methodology',
          severity: 'minor',
          description: 'No baseline year specified for tracking progress',
          recommendation: 'Establish baseline year for emissions trajectory',
        })
      }
    }

    // Boundary issues
    if (!claim.boundaryDescription || claim.boundaryDescription.length < 20) {
      issues.push({
        category: 'boundary',
        severity: 'minor',
        description: 'Claim boundary is not clearly defined',
        recommendation: 'Clearly specify what operations/products are covered by the claim',
      })
    }

    // Definition-specific issues
    if (definition) {
      for (const commonIssue of definition.commonIssues) {
        // Check if any obvious issues apply
        if (
          commonIssue.toLowerCase().includes('offset') &&
          claim.offsetsUsed &&
          claim.claimType === 'net-zero'
        ) {
          // Already handled above
        }
      }
    }

    return issues
  }

  /**
   * Assess offset quality
   */
  private assessOffsetQuality(offsets: OffsetDetails, claimType: ClaimType): ClaimIssue[] {
    const issues: ClaimIssue[] = []

    // Check registry quality
    const registryRating = OFFSET_REGISTRY_RATINGS.find(
      (r) => offsets.registryUsed.toLowerCase().includes(r.registry.toLowerCase())
    )

    if (!registryRating) {
      issues.push({
        category: 'offset',
        severity: 'major',
        description: `Unknown offset registry: ${offsets.registryUsed}`,
        recommendation: 'Use offsets from recognized registries (Verra, Gold Standard, etc.)',
      })
    } else if (registryRating.qualityScore < 7) {
      issues.push({
        category: 'offset',
        severity: 'minor',
        description: `Offset registry has moderate quality concerns`,
        recommendation: 'Consider higher-quality registries for stronger claims',
      })
    }

    // Check vintage
    const currentYear = new Date().getFullYear()
    const oldVintages = offsets.vintageYears.filter((v) => v < currentYear - 5)
    if (oldVintages.length > 0) {
      issues.push({
        category: 'offset',
        severity: 'minor',
        description: 'Some offsets have vintage years more than 5 years old',
        recommendation: 'Use offsets with more recent vintage years',
      })
    }

    // Net-zero specific: should not use avoidance offsets
    if (claimType === 'net-zero') {
      const avoidanceTypes = ['redd', 'avoided', 'cookstove', 'renewable energy']
      const usesAvoidance = offsets.projectTypes.some((pt) =>
        avoidanceTypes.some((at) => pt.toLowerCase().includes(at))
      )

      if (usesAvoidance) {
        issues.push({
          category: 'offset',
          severity: 'critical',
          description:
            'Net-zero claims should not use avoidance/reduction credits for residual emissions',
          regulation: 'SBTi Net-Zero Standard, Oxford Principles',
          recommendation: 'Use only carbon removal credits (DAC, biochar, etc.) for net-zero',
        })
      }
    }

    // Additionality concerns
    if (offsets.additionality === 'unknown') {
      issues.push({
        category: 'offset',
        severity: 'major',
        description: 'Offset additionality has not been verified',
        recommendation: 'Ensure offset projects demonstrate clear additionality',
      })
    }

    // Permanence for removal claims
    if (
      (claimType === 'carbon-negative' || claimType === 'net-zero') &&
      offsets.permanence !== 'permanent'
    ) {
      issues.push({
        category: 'offset',
        severity: 'major',
        description: 'Offsets may not provide permanent carbon storage',
        recommendation:
          'Prioritize offsets with permanent storage (geological, mineralization)',
      })
    }

    return issues
  }

  /**
   * Assess greenwashing risk
   */
  private assessGreenwashingRisk(
    claim: ClimateClaimInput,
    issues: ClaimIssue[]
  ): GreenwashingRisk {
    const indicators: string[] = []
    const mitigations: string[] = []

    // Check for red flags
    const criticalIssues = issues.filter((i) => i.severity === 'critical').length
    const majorIssues = issues.filter((i) => i.severity === 'major').length

    if (criticalIssues > 0) {
      indicators.push(`${criticalIssues} critical issue(s) with claim`)
    }
    if (majorIssues > 2) {
      indicators.push('Multiple major issues suggest incomplete methodology')
    }

    // Offset-heavy approach
    if (claim.offsetsUsed && !claim.scope.includes('scope1')) {
      indicators.push('Reliance on offsets without addressing direct emissions')
    }

    // Vague claims
    if (claim.claimType === 'green' || claim.claimType === 'sustainable') {
      indicators.push('Vague claim type without specific metrics')
      mitigations.push('Use more specific claims (carbon-neutral, net-zero) with clear definitions')
    }

    // No verification
    if (!claim.verificationStatus.verified) {
      indicators.push('Unverified claim increases perception risk')
      mitigations.push('Obtain third-party verification')
    }

    // Determine level
    let level: 'high' | 'medium' | 'low' = 'low'
    if (criticalIssues > 0 || indicators.length >= 3) {
      level = 'high'
    } else if (majorIssues > 1 || indicators.length >= 2) {
      level = 'medium'
    }

    // Standard mitigations
    if (level !== 'low') {
      mitigations.push('Ensure claim is backed by transparent, verifiable data')
      mitigations.push('Clearly communicate claim boundaries and limitations')
      mitigations.push('Align with recognized standards and frameworks')
    }

    return {
      level,
      indicators,
      mitigations,
    }
  }

  /**
   * Check regulatory compliance
   */
  private checkCompliance(
    claim: ClimateClaimInput,
    definition?: ClaimTypeDefinition
  ): ComplianceStatus {
    const standards: ComplianceStatus['standards'] = []
    let overallScore = 100

    if (!definition) {
      return {
        isCompliant: true,
        standards: [],
        overallScore: 50,
        recommendations: ['No standard requirements available for this claim type'],
      }
    }

    // Check against regulatory context
    for (const regulation of definition.regulatoryContext) {
      const gaps: string[] = []

      // Generic checks
      if (!claim.verificationStatus.verified) {
        gaps.push('Third-party verification recommended')
      }

      if (claim.scope.length < 2) {
        gaps.push('Broader emission scope coverage expected')
      }

      if (claim.offsetsUsed && !claim.offsetDetails) {
        gaps.push('Offset details not provided')
      }

      standards.push({
        name: regulation,
        compliant: gaps.length === 0,
        gaps,
      })

      if (gaps.length > 0) {
        overallScore -= 15
      }
    }

    overallScore = Math.max(0, overallScore)

    const recommendations: string[] = []
    if (overallScore < 70) {
      recommendations.push('Address compliance gaps before public claim')
    }
    if (overallScore < 50) {
      recommendations.push('Consider revising claim scope or type')
    }

    return {
      isCompliant: overallScore >= 70,
      standards,
      overallScore,
      recommendations,
    }
  }

  /**
   * Generate improvement recommendations
   */
  private async generateRecommendations(
    claim: ClimateClaimInput,
    issues: ClaimIssue[],
    greenwashingRisk: GreenwashingRisk
  ): Promise<string[]> {
    const recommendations: string[] = []

    // Priority recommendations from issues
    const criticalRecs = issues
      .filter((i) => i.severity === 'critical')
      .map((i) => i.recommendation)
    const majorRecs = issues
      .filter((i) => i.severity === 'major')
      .map((i) => i.recommendation)

    recommendations.push(...criticalRecs)
    recommendations.push(...majorRecs.slice(0, 3))

    // Greenwashing mitigations
    recommendations.push(...greenwashingRisk.mitigations)

    // Use LLM for context-specific recommendations if needed
    if (recommendations.length < 3) {
      const prompt = `Given a ${claim.claimType} climate claim with these issues:
${issues.map((i) => `- ${i.description}`).join('\n')}

Provide 2-3 specific, actionable recommendations for strengthening the claim.
Return a JSON array of strings.`

      try {
        const result = await generateText(prompt, {
          model: 'flash',
          responseMimeType: 'application/json',
          temperature: 0.3,
          maxOutputTokens: 512,
        })

        const additionalRecs = JSON.parse(result.trim())
        recommendations.push(...additionalRecs)
      } catch {
        recommendations.push('Consult with climate claims experts for guidance')
      }
    }

    // Deduplicate and limit
    const unique = [...new Set(recommendations)]
    return unique.slice(0, 8)
  }

  /**
   * Assess CDR project quality
   */
  async assessCDRProject(project: CDRProject): Promise<CDRAssessment> {
    const concerns: string[] = []
    const cobenefits: string[] = []
    const recommendations: string[] = []

    // Permanence risk assessment
    let permanenceRisk: 'high' | 'medium' | 'low' = 'low'
    if (project.type === 'afforestation' || project.type === 'reforestation') {
      permanenceRisk = 'high'
      concerns.push('Forest-based removals face reversal risk from fire, disease, or harvest')
      recommendations.push('Ensure buffer pool and insurance mechanisms')
      cobenefits.push('Biodiversity enhancement')
      cobenefits.push('Local employment')
    } else if (project.type === 'soil-carbon') {
      permanenceRisk = 'medium'
      concerns.push('Soil carbon requires ongoing land management')
      recommendations.push('Ensure long-term land use agreements')
      cobenefits.push('Improved soil health')
      cobenefits.push('Agricultural productivity')
    } else if (project.type === 'dac' || project.type === 'enhanced-weathering') {
      permanenceRisk = 'low'
      cobenefits.push('Highly verifiable removal')
      if (project.price < 300) {
        concerns.push('Price below typical DAC costs raises questions')
      }
    } else if (project.type === 'biochar') {
      permanenceRisk = 'low'
      cobenefits.push('Soil amendment benefits')
      cobenefits.push('Relatively permanent storage')
    }

    // Additionality assessment
    let additionalityAssessment = ''
    if (project.additionality === 'verified') {
      additionalityAssessment = 'Third-party verified additionality provides confidence'
    } else if (project.additionality === 'claimed') {
      additionalityAssessment =
        'Additionality claimed but not independently verified - request verification'
      concerns.push('Unverified additionality')
    } else {
      additionalityAssessment = 'Additionality status unknown - high risk'
      concerns.push('Unknown additionality is a significant concern')
    }

    // Reversal risk
    let reversalRisk: 'high' | 'medium' | 'low' = permanenceRisk
    if (project.permanence < 100) {
      reversalRisk = 'high'
      concerns.push(`Stated permanence of ${project.permanence} years may require replacement`)
    }

    // MRV assessment
    if (!project.mrvMethod || project.mrvMethod.length < 10) {
      concerns.push('MRV methodology not clearly specified')
      recommendations.push('Request detailed MRV documentation')
    }

    // Registry
    if (!project.registry) {
      concerns.push('Not registered with recognized carbon registry')
      recommendations.push('Verify through recognized CDR registry (Puro, Isometric)')
    }

    // Overall credibility
    const isCredible =
      project.additionality === 'verified' &&
      permanenceRisk !== 'high' &&
      concerns.length < 3

    return {
      project,
      isCredible,
      permanenceRisk,
      additionalityAssessment,
      reversalRisk,
      cobenefits,
      concerns,
      recommendations,
    }
  }
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Validate a climate claim
 */
export async function validateClimateClaim(
  claim: ClimateClaimInput
): Promise<ClimateClaimAssessment> {
  const validator = new ClimateClaimsValidator()
  return validator.validate(claim)
}

/**
 * Assess a CDR project
 */
export async function assessCDRProject(project: CDRProject): Promise<CDRAssessment> {
  const validator = new ClimateClaimsValidator()
  return validator.assessCDRProject(project)
}

/**
 * Get definition for a claim type
 */
export function getClaimDefinition(claimType: ClaimType): ClaimTypeDefinition | undefined {
  return CLAIM_DEFINITIONS.find((d) => d.type === claimType)
}

/**
 * Get offset registry rating
 */
export function getOffsetRegistryRating(registry: string): OffsetQualityRating | undefined {
  return OFFSET_REGISTRY_RATINGS.find((r) =>
    registry.toLowerCase().includes(r.registry.toLowerCase())
  )
}

/**
 * List all claim type definitions
 */
export function listClaimDefinitions(): ClaimTypeDefinition[] {
  return CLAIM_DEFINITIONS
}
