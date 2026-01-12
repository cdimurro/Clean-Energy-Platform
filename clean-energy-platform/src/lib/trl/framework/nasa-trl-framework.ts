/**
 * NASA TRL Framework
 *
 * Complete 9-level Technology Readiness Level framework with 3 sub-levels each (1a-9c)
 * for granular tracking of technology maturity.
 *
 * Based on NASA NPR 7123.1C Systems Engineering Processes and Requirements
 */

import type { TRLLevel, TRLSublevel, TechnologyDomain, EvidenceRequirement } from '@/types/trl'

/**
 * Core TRL level definitions with sub-levels
 */
export const TRL_LEVELS: Record<TRLLevel, {
  name: string
  description: string
  phase: 'research' | 'development' | 'demonstration' | 'deployment'
  sublevels: Record<TRLSublevel, {
    name: string
    description: string
    evidenceRequirements: EvidenceRequirement[]
    exitCriteria: string[]
    typicalDuration: { min: number; max: number; unit: 'months' | 'years' }
  }>
}> = {
  1: {
    name: 'Basic Principles Observed',
    description: 'Scientific research begins to be translated into applied R&D.',
    phase: 'research',
    sublevels: {
      a: {
        name: 'Scientific literature review initiated',
        description: 'Initial observation of basic principles documented in scientific literature.',
        evidenceRequirements: [
          { type: 'document', description: 'Literature review summary', required: true },
          { type: 'document', description: 'Relevant prior art identification', required: true },
        ],
        exitCriteria: [
          'Literature review completed',
          'Basic scientific principles identified',
          'Initial hypothesis formulated',
        ],
        typicalDuration: { min: 1, max: 3, unit: 'months' },
      },
      b: {
        name: 'Basic principles under investigation',
        description: 'Active investigation of fundamental physical principles.',
        evidenceRequirements: [
          { type: 'document', description: 'Theoretical analysis report', required: true },
          { type: 'data', description: 'Initial experimental observations', required: false },
        ],
        exitCriteria: [
          'Physical principles documented',
          'Initial theoretical models developed',
          'Potential applications identified',
        ],
        typicalDuration: { min: 2, max: 6, unit: 'months' },
      },
      c: {
        name: 'Basic principles validated',
        description: 'Fundamental principles have been validated through initial experiments.',
        evidenceRequirements: [
          { type: 'document', description: 'Validation experiment report', required: true },
          { type: 'data', description: 'Experimental data supporting principles', required: true },
          { type: 'publication', description: 'Peer-reviewed publication', required: false },
        ],
        exitCriteria: [
          'Experimental validation completed',
          'Principles confirmed to be sound',
          'Ready for technology concept formulation',
        ],
        typicalDuration: { min: 3, max: 9, unit: 'months' },
      },
    },
  },
  2: {
    name: 'Technology Concept Formulated',
    description: 'Practical applications of basic principles invented.',
    phase: 'research',
    sublevels: {
      a: {
        name: 'Concept exploration initiated',
        description: 'Application concepts being explored and documented.',
        evidenceRequirements: [
          { type: 'document', description: 'Concept exploration report', required: true },
          { type: 'document', description: 'Application feasibility notes', required: true },
        ],
        exitCriteria: [
          'Multiple concepts identified',
          'Initial feasibility assessed',
          'Target applications defined',
        ],
        typicalDuration: { min: 2, max: 4, unit: 'months' },
      },
      b: {
        name: 'Technology concept defined',
        description: 'Specific technology concept has been defined and documented.',
        evidenceRequirements: [
          { type: 'document', description: 'Technology concept document', required: true },
          { type: 'document', description: 'Preliminary system requirements', required: true },
          { type: 'document', description: 'Initial patent search', required: false },
        ],
        exitCriteria: [
          'Concept architecture defined',
          'System requirements documented',
          'Key performance parameters identified',
        ],
        typicalDuration: { min: 3, max: 6, unit: 'months' },
      },
      c: {
        name: 'Technology concept validated',
        description: 'Concept has been validated through analysis or limited experimentation.',
        evidenceRequirements: [
          { type: 'document', description: 'Concept validation report', required: true },
          { type: 'data', description: 'Analytical model results', required: true },
          { type: 'document', description: 'Risk assessment', required: true },
        ],
        exitCriteria: [
          'Concept analytically validated',
          'Key risks identified and assessed',
          'Ready for proof of concept',
        ],
        typicalDuration: { min: 3, max: 9, unit: 'months' },
      },
    },
  },
  3: {
    name: 'Proof of Concept',
    description: 'Active research and development initiated with analytical and laboratory studies.',
    phase: 'research',
    sublevels: {
      a: {
        name: 'Critical function identification',
        description: 'Critical functions and components identified for PoC development.',
        evidenceRequirements: [
          { type: 'document', description: 'Critical function analysis', required: true },
          { type: 'document', description: 'PoC development plan', required: true },
        ],
        exitCriteria: [
          'Critical functions identified',
          'Development plan approved',
          'Resources allocated',
        ],
        typicalDuration: { min: 2, max: 4, unit: 'months' },
      },
      b: {
        name: 'Laboratory experiments in progress',
        description: 'Active laboratory-scale experiments validating concept.',
        evidenceRequirements: [
          { type: 'data', description: 'Laboratory test data', required: true },
          { type: 'document', description: 'Experiment protocols', required: true },
          { type: 'document', description: 'Progress reports', required: true },
        ],
        exitCriteria: [
          'Laboratory setup complete',
          'Initial experiments conducted',
          'Data collection ongoing',
        ],
        typicalDuration: { min: 4, max: 12, unit: 'months' },
      },
      c: {
        name: 'Proof of concept validated',
        description: 'Proof of concept experiments completed with positive results.',
        evidenceRequirements: [
          { type: 'data', description: 'Complete PoC test data', required: true },
          { type: 'document', description: 'PoC validation report', required: true },
          { type: 'document', description: 'Lessons learned document', required: true },
          { type: 'publication', description: 'Technical publication', required: false },
        ],
        exitCriteria: [
          'PoC objectives met',
          'Performance within expected range',
          'Ready for component development',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
    },
  },
  4: {
    name: 'Component Validation in Lab',
    description: 'Basic technological components integrated and tested in laboratory environment.',
    phase: 'development',
    sublevels: {
      a: {
        name: 'Component development initiated',
        description: 'Key components being developed based on PoC results.',
        evidenceRequirements: [
          { type: 'document', description: 'Component specifications', required: true },
          { type: 'document', description: 'Development schedule', required: true },
          { type: 'document', description: 'Test plan', required: true },
        ],
        exitCriteria: [
          'Component specs finalized',
          'Development schedule approved',
          'Test infrastructure ready',
        ],
        typicalDuration: { min: 3, max: 6, unit: 'months' },
      },
      b: {
        name: 'Component testing in progress',
        description: 'Components undergoing laboratory testing.',
        evidenceRequirements: [
          { type: 'data', description: 'Component test data', required: true },
          { type: 'document', description: 'Test procedures', required: true },
          { type: 'document', description: 'Anomaly reports', required: false },
        ],
        exitCriteria: [
          'Testing underway per plan',
          'Data being collected',
          'Issues being tracked',
        ],
        typicalDuration: { min: 6, max: 12, unit: 'months' },
      },
      c: {
        name: 'Component validation complete',
        description: 'Components validated in laboratory environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Complete component test data', required: true },
          { type: 'document', description: 'Validation report', required: true },
          { type: 'document', description: 'Interface specifications', required: true },
        ],
        exitCriteria: [
          'All components validated',
          'Performance requirements met',
          'Ready for subsystem integration',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
    },
  },
  5: {
    name: 'Component Validation in Relevant Environment',
    description: 'Basic components integrated and tested in simulated operational environment.',
    phase: 'development',
    sublevels: {
      a: {
        name: 'Relevant environment defined',
        description: 'Simulated operational environment specifications defined.',
        evidenceRequirements: [
          { type: 'document', description: 'Environment specification', required: true },
          { type: 'document', description: 'Test facility requirements', required: true },
        ],
        exitCriteria: [
          'Environment specs finalized',
          'Test facility identified',
          'Integration plan complete',
        ],
        typicalDuration: { min: 2, max: 4, unit: 'months' },
      },
      b: {
        name: 'Subsystem testing in progress',
        description: 'Integrated subsystems under test in relevant environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Subsystem test data', required: true },
          { type: 'document', description: 'Test procedures', required: true },
          { type: 'document', description: 'Integration logs', required: true },
        ],
        exitCriteria: [
          'Subsystems integrated',
          'Testing in progress',
          'Performance data collected',
        ],
        typicalDuration: { min: 6, max: 12, unit: 'months' },
      },
      c: {
        name: 'Subsystem validation complete',
        description: 'Subsystems validated in simulated operational environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Complete subsystem test data', required: true },
          { type: 'document', description: 'Validation report', required: true },
          { type: 'document', description: 'System interface document', required: true },
        ],
        exitCriteria: [
          'Subsystems validated',
          'Performance verified',
          'Ready for system integration',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
    },
  },
  6: {
    name: 'System Demonstration in Relevant Environment',
    description: 'Representative model or prototype demonstrated in relevant environment.',
    phase: 'demonstration',
    sublevels: {
      a: {
        name: 'Prototype development initiated',
        description: 'Engineering development model or prototype construction started.',
        evidenceRequirements: [
          { type: 'document', description: 'Prototype design', required: true },
          { type: 'document', description: 'Manufacturing plan', required: true },
          { type: 'document', description: 'Demonstration plan', required: true },
        ],
        exitCriteria: [
          'Design finalized',
          'Manufacturing started',
          'Demonstration plan approved',
        ],
        typicalDuration: { min: 4, max: 8, unit: 'months' },
      },
      b: {
        name: 'Prototype demonstration in progress',
        description: 'Prototype undergoing demonstration in relevant environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Demonstration test data', required: true },
          { type: 'document', description: 'Test procedures', required: true },
          { type: 'video', description: 'Demonstration video', required: false },
        ],
        exitCriteria: [
          'Prototype complete',
          'Demonstration underway',
          'Stakeholder reviews conducted',
        ],
        typicalDuration: { min: 6, max: 12, unit: 'months' },
      },
      c: {
        name: 'System demonstration complete',
        description: 'System successfully demonstrated in relevant environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Complete demonstration data', required: true },
          { type: 'document', description: 'Demonstration report', required: true },
          { type: 'document', description: 'Performance assessment', required: true },
        ],
        exitCriteria: [
          'Demonstration objectives met',
          'Performance verified',
          'Ready for operational demonstration',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
    },
  },
  7: {
    name: 'System Demonstration in Operational Environment',
    description: 'Prototype demonstrated in actual operational environment.',
    phase: 'demonstration',
    sublevels: {
      a: {
        name: 'Operational demonstration planned',
        description: 'Operational demonstration planning and site preparation.',
        evidenceRequirements: [
          { type: 'document', description: 'Operational demo plan', required: true },
          { type: 'document', description: 'Site preparation checklist', required: true },
          { type: 'document', description: 'Safety analysis', required: true },
        ],
        exitCriteria: [
          'Demo plan approved',
          'Site prepared',
          'Safety review complete',
        ],
        typicalDuration: { min: 3, max: 6, unit: 'months' },
      },
      b: {
        name: 'Operational demonstration in progress',
        description: 'System undergoing demonstration in operational environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Operational test data', required: true },
          { type: 'document', description: 'Daily operations logs', required: true },
          { type: 'document', description: 'Incident reports', required: false },
        ],
        exitCriteria: [
          'System deployed to operational site',
          'Demonstration in progress',
          'Data being collected',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
      c: {
        name: 'Operational demonstration complete',
        description: 'System successfully demonstrated in operational environment.',
        evidenceRequirements: [
          { type: 'data', description: 'Complete operational data', required: true },
          { type: 'document', description: 'Operational demo report', required: true },
          { type: 'document', description: 'Readiness assessment', required: true },
        ],
        exitCriteria: [
          'All demo objectives met',
          'Operational performance verified',
          'Ready for qualification',
        ],
        typicalDuration: { min: 6, max: 24, unit: 'months' },
      },
    },
  },
  8: {
    name: 'System Complete and Qualified',
    description: 'Technology proven to work in final form under expected conditions.',
    phase: 'deployment',
    sublevels: {
      a: {
        name: 'Qualification testing initiated',
        description: 'Final form system undergoing qualification testing.',
        evidenceRequirements: [
          { type: 'document', description: 'Qualification test plan', required: true },
          { type: 'document', description: 'Quality assurance plan', required: true },
          { type: 'document', description: 'Certification requirements', required: true },
        ],
        exitCriteria: [
          'Test plan approved',
          'QA procedures in place',
          'Certification path defined',
        ],
        typicalDuration: { min: 3, max: 6, unit: 'months' },
      },
      b: {
        name: 'Qualification testing in progress',
        description: 'System undergoing comprehensive qualification testing.',
        evidenceRequirements: [
          { type: 'data', description: 'Qualification test data', required: true },
          { type: 'document', description: 'Test procedures', required: true },
          { type: 'document', description: 'Non-conformance reports', required: false },
        ],
        exitCriteria: [
          'Testing per plan',
          'Data collected and analyzed',
          'Issues resolved',
        ],
        typicalDuration: { min: 6, max: 12, unit: 'months' },
      },
      c: {
        name: 'System qualified',
        description: 'System qualified through test and demonstration.',
        evidenceRequirements: [
          { type: 'document', description: 'Qualification report', required: true },
          { type: 'document', description: 'Certification documentation', required: true },
          { type: 'document', description: 'Production readiness review', required: true },
        ],
        exitCriteria: [
          'Qualification complete',
          'Certifications obtained',
          'Ready for deployment',
        ],
        typicalDuration: { min: 6, max: 18, unit: 'months' },
      },
    },
  },
  9: {
    name: 'System Proven in Operational Environment',
    description: 'Actual system proven through successful mission operations.',
    phase: 'deployment',
    sublevels: {
      a: {
        name: 'Initial operational capability',
        description: 'System achieving initial operational capability.',
        evidenceRequirements: [
          { type: 'document', description: 'IOC declaration', required: true },
          { type: 'data', description: 'Initial operations data', required: true },
          { type: 'document', description: 'O&M procedures', required: true },
        ],
        exitCriteria: [
          'System deployed',
          'Initial operations successful',
          'O&M procedures validated',
        ],
        typicalDuration: { min: 3, max: 6, unit: 'months' },
      },
      b: {
        name: 'Full operational capability',
        description: 'System at full operational capability with sustained operations.',
        evidenceRequirements: [
          { type: 'data', description: 'Operational performance data', required: true },
          { type: 'document', description: 'Performance reports', required: true },
          { type: 'document', description: 'Reliability data', required: true },
        ],
        exitCriteria: [
          'Full capability achieved',
          'Performance targets met',
          'Reliability demonstrated',
        ],
        typicalDuration: { min: 6, max: 12, unit: 'months' },
      },
      c: {
        name: 'Proven system',
        description: 'System proven through extensive successful operations.',
        evidenceRequirements: [
          { type: 'data', description: 'Extensive operational data', required: true },
          { type: 'document', description: 'Long-term performance report', required: true },
          { type: 'document', description: 'Lessons learned', required: true },
          { type: 'document', description: 'Technology transfer documentation', required: false },
        ],
        exitCriteria: [
          'Extensive operational history',
          'Technology mature and stable',
          'Ready for technology transfer',
        ],
        typicalDuration: { min: 12, max: 36, unit: 'months' },
      },
    },
  },
}

/**
 * Get the full TRL score (e.g., "4b" -> 4.33)
 */
export function getTRLScore(level: TRLLevel, sublevel: TRLSublevel): number {
  const sublevelValues: Record<TRLSublevel, number> = {
    a: 0,
    b: 0.33,
    c: 0.67,
  }
  return level + sublevelValues[sublevel]
}

/**
 * Parse a TRL string (e.g., "4b") into level and sublevel
 */
export function parseTRLString(trl: string): { level: TRLLevel; sublevel: TRLSublevel } | null {
  const match = trl.match(/^([1-9])([abc])$/)
  if (!match) return null
  return {
    level: parseInt(match[1], 10) as TRLLevel,
    sublevel: match[2] as TRLSublevel,
  }
}

/**
 * Format TRL level and sublevel as string (e.g., 4, 'b' -> "TRL 4b")
 */
export function formatTRLString(level: TRLLevel, sublevel: TRLSublevel): string {
  return `TRL ${level}${sublevel}`
}

/**
 * Get all evidence requirements for a specific TRL
 */
export function getEvidenceRequirements(
  level: TRLLevel,
  sublevel: TRLSublevel
): EvidenceRequirement[] {
  return TRL_LEVELS[level].sublevels[sublevel].evidenceRequirements
}

/**
 * Get exit criteria for a specific TRL
 */
export function getExitCriteria(level: TRLLevel, sublevel: TRLSublevel): string[] {
  return TRL_LEVELS[level].sublevels[sublevel].exitCriteria
}

/**
 * Calculate progress percentage based on evidence completion
 */
export function calculateEvidenceProgress(
  level: TRLLevel,
  sublevel: TRLSublevel,
  completedEvidence: string[]
): number {
  const requirements = getEvidenceRequirements(level, sublevel)
  const requiredCount = requirements.filter((r) => r.required).length
  const completedRequired = requirements
    .filter((r) => r.required)
    .filter((r) => completedEvidence.includes(r.description)).length
  return requiredCount > 0 ? (completedRequired / requiredCount) * 100 : 0
}

/**
 * Get the next TRL after the current one
 */
export function getNextTRL(
  level: TRLLevel,
  sublevel: TRLSublevel
): { level: TRLLevel; sublevel: TRLSublevel } | null {
  const sublevels: TRLSublevel[] = ['a', 'b', 'c']
  const currentIndex = sublevels.indexOf(sublevel)

  if (currentIndex < 2) {
    return { level, sublevel: sublevels[currentIndex + 1] }
  } else if (level < 9) {
    return { level: (level + 1) as TRLLevel, sublevel: 'a' }
  }
  return null // Already at TRL 9c
}

/**
 * Get the previous TRL before the current one
 */
export function getPreviousTRL(
  level: TRLLevel,
  sublevel: TRLSublevel
): { level: TRLLevel; sublevel: TRLSublevel } | null {
  const sublevels: TRLSublevel[] = ['a', 'b', 'c']
  const currentIndex = sublevels.indexOf(sublevel)

  if (currentIndex > 0) {
    return { level, sublevel: sublevels[currentIndex - 1] }
  } else if (level > 1) {
    return { level: (level - 1) as TRLLevel, sublevel: 'c' }
  }
  return null // Already at TRL 1a
}

/**
 * Calculate cumulative duration to reach a specific TRL from TRL 1a
 */
export function calculateCumulativeDuration(
  targetLevel: TRLLevel,
  targetSublevel: TRLSublevel,
  variant: 'min' | 'max' = 'min'
): number {
  let total = 0
  const sublevels: TRLSublevel[] = ['a', 'b', 'c']

  for (let level = 1; level <= targetLevel; level++) {
    const l = level as TRLLevel
    const maxSublevel =
      level === targetLevel ? sublevels.indexOf(targetSublevel) : 2

    for (let s = 0; s <= maxSublevel; s++) {
      const sublevel = sublevels[s]
      const duration = TRL_LEVELS[l].sublevels[sublevel].typicalDuration
      total += duration[variant]
    }
  }

  return total
}
