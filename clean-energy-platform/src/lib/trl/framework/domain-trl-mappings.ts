/**
 * Domain-Specific TRL Mappings
 *
 * Different technology domains have specific criteria and evidence requirements
 * that vary from the standard NASA TRL framework.
 */

import type { TRLLevel, TRLSublevel, TechnologyDomain, EvidenceRequirement } from '@/types/trl'

/**
 * Domain-specific evidence requirements that supplement the base NASA framework
 */
export const DOMAIN_EVIDENCE_REQUIREMENTS: Record<
  TechnologyDomain,
  Partial<Record<TRLLevel, Partial<Record<TRLSublevel, EvidenceRequirement[]>>>>
> = {
  energy: {
    3: {
      c: [
        { type: 'data', description: 'Efficiency measurements vs. theoretical limits', required: true },
        { type: 'document', description: 'Thermodynamic analysis', required: true },
      ],
    },
    4: {
      b: [
        { type: 'data', description: 'Durability/cycle testing data', required: true },
        { type: 'document', description: 'Materials compatibility analysis', required: true },
      ],
      c: [
        { type: 'data', description: 'Long-term stability test results', required: true },
        { type: 'document', description: 'Degradation mechanism analysis', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Grid integration test results', required: true },
        { type: 'document', description: 'Safety analysis (HAZOP/FMEA)', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'Techno-economic analysis (TEA)', required: true },
        { type: 'document', description: 'LCOE/LCOS projections', required: true },
      ],
    },
    7: {
      b: [
        { type: 'data', description: 'Field performance data (>1000 hours)', required: true },
        { type: 'document', description: 'Environmental impact assessment', required: true },
      ],
      c: [
        { type: 'document', description: 'Interconnection agreement', required: true },
        { type: 'document', description: 'Regulatory compliance documentation', required: true },
      ],
    },
    8: {
      c: [
        { type: 'document', description: 'UL/IEC certification', required: true },
        { type: 'document', description: 'Manufacturing quality control plan', required: true },
      ],
    },
    9: {
      c: [
        { type: 'data', description: 'Multi-year operational performance data', required: true },
        { type: 'document', description: 'Warranty claim analysis', required: false },
      ],
    },
  },

  aerospace: {
    3: {
      c: [
        { type: 'data', description: 'Flight regime performance predictions', required: true },
        { type: 'document', description: 'Weight/power budget analysis', required: true },
      ],
    },
    4: {
      c: [
        { type: 'data', description: 'Vibration/thermal cycle test data', required: true },
        { type: 'document', description: 'Space environment compatibility analysis', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Vacuum chamber test results', required: true },
        { type: 'document', description: 'Radiation tolerance analysis', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'Altitude chamber test results', required: true },
        { type: 'document', description: 'Flight safety analysis', required: true },
      ],
    },
    7: {
      c: [
        { type: 'data', description: 'Flight test data', required: true },
        { type: 'document', description: 'Airworthiness documentation', required: true },
      ],
    },
    8: {
      c: [
        { type: 'document', description: 'DO-178/DO-254 compliance', required: true },
        { type: 'document', description: 'FAA/EASA certification', required: true },
      ],
    },
    9: {
      c: [
        { type: 'data', description: 'Flight hours accumulated', required: true },
        { type: 'document', description: 'Reliability growth analysis', required: true },
      ],
    },
  },

  biotech: {
    3: {
      c: [
        { type: 'data', description: 'In vitro assay results', required: true },
        { type: 'document', description: 'Mechanism of action hypothesis', required: true },
      ],
    },
    4: {
      c: [
        { type: 'data', description: 'Cell line characterization', required: true },
        { type: 'document', description: 'Biocompatibility assessment', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Animal model study results', required: true },
        { type: 'document', description: 'IND-enabling study plan', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'GLP toxicology study', required: true },
        { type: 'document', description: 'CMC documentation', required: true },
      ],
    },
    7: {
      b: [
        { type: 'document', description: 'Phase I protocol', required: true },
        { type: 'document', description: 'IRB approval', required: true },
      ],
      c: [
        { type: 'data', description: 'Phase I clinical data', required: true },
        { type: 'document', description: 'Safety monitoring report', required: true },
      ],
    },
    8: {
      c: [
        { type: 'data', description: 'Phase II/III clinical data', required: true },
        { type: 'document', description: 'NDA/BLA submission', required: true },
      ],
    },
    9: {
      c: [
        { type: 'document', description: 'FDA approval', required: true },
        { type: 'data', description: 'Post-market surveillance data', required: true },
      ],
    },
  },

  materials: {
    3: {
      c: [
        { type: 'data', description: 'Initial material characterization', required: true },
        { type: 'document', description: 'Synthesis route documentation', required: true },
      ],
    },
    4: {
      c: [
        { type: 'data', description: 'Mechanical property testing', required: true },
        { type: 'document', description: 'Microstructure analysis', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Environmental stability data', required: true },
        { type: 'document', description: 'Scalability assessment', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'Pilot batch characterization', required: true },
        { type: 'document', description: 'Process control documentation', required: true },
      ],
    },
    7: {
      c: [
        { type: 'data', description: 'Full-scale batch data', required: true },
        { type: 'document', description: 'Quality specifications', required: true },
      ],
    },
    8: {
      c: [
        { type: 'document', description: 'ASTM/ISO compliance', required: true },
        { type: 'document', description: 'Material safety data sheet', required: true },
      ],
    },
    9: {
      c: [
        { type: 'data', description: 'Long-term performance data in application', required: true },
        { type: 'document', description: 'Supply chain qualification', required: true },
      ],
    },
  },

  industrial: {
    3: {
      c: [
        { type: 'data', description: 'Process feasibility data', required: true },
        { type: 'document', description: 'Mass/energy balance', required: true },
      ],
    },
    4: {
      c: [
        { type: 'data', description: 'Bench-scale process data', required: true },
        { type: 'document', description: 'Process flow diagram', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Pilot plant data', required: true },
        { type: 'document', description: 'P&ID documentation', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'Demonstration plant data', required: true },
        { type: 'document', description: 'HAZOP study', required: true },
      ],
    },
    7: {
      c: [
        { type: 'data', description: 'First-of-a-kind plant data', required: true },
        { type: 'document', description: 'Commissioning report', required: true },
      ],
    },
    8: {
      c: [
        { type: 'document', description: 'Operating permits', required: true },
        { type: 'document', description: 'EPC contractor qualification', required: true },
      ],
    },
    9: {
      c: [
        { type: 'data', description: 'Nth plant operational data', required: true },
        { type: 'document', description: 'Continuous improvement metrics', required: true },
      ],
    },
  },

  software: {
    3: {
      c: [
        { type: 'data', description: 'Algorithm validation results', required: true },
        { type: 'document', description: 'Architecture concept document', required: true },
      ],
    },
    4: {
      c: [
        { type: 'data', description: 'Unit test coverage report', required: true },
        { type: 'document', description: 'API specification', required: true },
      ],
    },
    5: {
      c: [
        { type: 'data', description: 'Integration test results', required: true },
        { type: 'document', description: 'Security assessment', required: true },
      ],
    },
    6: {
      c: [
        { type: 'data', description: 'Beta test feedback', required: true },
        { type: 'document', description: 'User documentation', required: true },
      ],
    },
    7: {
      c: [
        { type: 'data', description: 'Pilot deployment metrics', required: true },
        { type: 'document', description: 'SLA documentation', required: true },
      ],
    },
    8: {
      c: [
        { type: 'document', description: 'SOC 2 compliance', required: true },
        { type: 'document', description: 'Disaster recovery plan', required: true },
      ],
    },
    9: {
      c: [
        { type: 'data', description: 'Production uptime metrics', required: true },
        { type: 'document', description: 'Incident response analysis', required: true },
      ],
    },
  },
}

/**
 * Domain-specific exit criteria that supplement the base NASA framework
 */
export const DOMAIN_EXIT_CRITERIA: Record<
  TechnologyDomain,
  Partial<Record<TRLLevel, Partial<Record<TRLSublevel, string[]>>>>
> = {
  energy: {
    4: {
      c: ['Component efficiency >70% of theoretical maximum', 'Cycle life >100 cycles demonstrated'],
    },
    5: {
      c: ['System efficiency validated at relevant scale', 'Grid interconnection tested'],
    },
    6: {
      c: ['LCOE/LCOS projections competitive with alternatives', 'Manufacturing pathway defined'],
    },
    7: {
      c: ['1000+ hours operational runtime', 'O&M costs validated'],
    },
    8: {
      c: ['Safety certifications obtained', 'Production-representative units qualified'],
    },
    9: {
      c: ['3+ years operational history', 'Performance guarantees demonstrated'],
    },
  },
  aerospace: {
    6: {
      c: ['Altitude/vacuum testing complete', 'Weight budget validated'],
    },
    7: {
      c: ['Flight test objectives met', 'Handling qualities verified'],
    },
    8: {
      c: ['Type certification obtained', 'Production processes qualified'],
    },
    9: {
      c: ['Fleet operations established', 'Safety record demonstrated'],
    },
  },
  biotech: {
    5: {
      c: ['Preclinical efficacy demonstrated', 'Safety profile acceptable'],
    },
    6: {
      c: ['IND filed and cleared', 'Manufacturing process validated'],
    },
    7: {
      c: ['Phase I complete with acceptable safety', 'Dose selection justified'],
    },
    8: {
      c: ['Pivotal trial endpoints met', 'Regulatory submission accepted'],
    },
    9: {
      c: ['Market approval obtained', 'Commercial manufacturing established'],
    },
  },
  materials: {
    5: {
      c: ['Properties stable under operational conditions', 'Batch-to-batch reproducibility demonstrated'],
    },
    6: {
      c: ['Pilot-scale production demonstrated', 'Cost model validated'],
    },
    8: {
      c: ['Industry standard compliance', 'Quality specifications finalized'],
    },
    9: {
      c: ['Multiple commercial applications', 'Supply chain mature'],
    },
  },
  industrial: {
    5: {
      c: ['Pilot plant performance validated', 'Scale-up factors determined'],
    },
    6: {
      c: ['Demonstration plant commissioned', 'Economic model validated'],
    },
    7: {
      c: ['FOAK plant operational', 'Performance guarantees tested'],
    },
    8: {
      c: ['Permits and licenses obtained', 'Nth plant design complete'],
    },
    9: {
      c: ['Multiple plants operational', 'Technology licensed'],
    },
  },
  software: {
    5: {
      c: ['Integration with target systems demonstrated', 'Performance benchmarks met'],
    },
    6: {
      c: ['Beta testing complete', 'Scalability validated'],
    },
    7: {
      c: ['Production pilot successful', 'User adoption metrics positive'],
    },
    8: {
      c: ['Security audit passed', 'Compliance requirements met'],
    },
    9: {
      c: ['High availability demonstrated', 'Customer satisfaction targets met'],
    },
  },
}

/**
 * Get combined evidence requirements (base + domain-specific)
 */
export function getDomainEvidenceRequirements(
  domain: TechnologyDomain,
  level: TRLLevel,
  sublevel: TRLSublevel,
  baseRequirements: EvidenceRequirement[]
): EvidenceRequirement[] {
  const domainRequirements =
    DOMAIN_EVIDENCE_REQUIREMENTS[domain]?.[level]?.[sublevel] || []
  return [...baseRequirements, ...domainRequirements]
}

/**
 * Get combined exit criteria (base + domain-specific)
 */
export function getDomainExitCriteria(
  domain: TechnologyDomain,
  level: TRLLevel,
  sublevel: TRLSublevel,
  baseCriteria: string[]
): string[] {
  const domainCriteria = DOMAIN_EXIT_CRITERIA[domain]?.[level]?.[sublevel] || []
  return [...baseCriteria, ...domainCriteria]
}

/**
 * Domain descriptions for UI display
 */
export const DOMAIN_DESCRIPTIONS: Record<
  TechnologyDomain,
  { name: string; description: string; examples: string[] }
> = {
  energy: {
    name: 'Energy Systems',
    description: 'Power generation, storage, and conversion technologies',
    examples: [
      'Solar photovoltaics',
      'Battery storage',
      'Hydrogen electrolysis',
      'Wind turbines',
      'Fuel cells',
      'Geothermal',
    ],
  },
  aerospace: {
    name: 'Aerospace & Defense',
    description: 'Aviation, space systems, and defense technologies',
    examples: [
      'Propulsion systems',
      'Avionics',
      'Satellites',
      'Launch vehicles',
      'UAV systems',
      'Guidance systems',
    ],
  },
  biotech: {
    name: 'Biotechnology',
    description: 'Pharmaceuticals, medical devices, and life sciences',
    examples: [
      'Therapeutics',
      'Diagnostics',
      'Medical devices',
      'Cell therapy',
      'Gene therapy',
      'Vaccines',
    ],
  },
  materials: {
    name: 'Advanced Materials',
    description: 'Novel materials and materials processing',
    examples: [
      'Nanomaterials',
      'Composites',
      'Catalysts',
      'Coatings',
      'Semiconductors',
      'Ceramics',
    ],
  },
  industrial: {
    name: 'Industrial Processes',
    description: 'Chemical, manufacturing, and process technologies',
    examples: [
      'Chemical synthesis',
      'Carbon capture',
      'Waste processing',
      'Separation processes',
      'Fermentation',
      'Electrochemistry',
    ],
  },
  software: {
    name: 'Software & AI',
    description: 'Software systems, algorithms, and AI/ML applications',
    examples: [
      'ML models',
      'Control systems',
      'Simulation software',
      'Data platforms',
      'Optimization algorithms',
      'Autonomous systems',
    ],
  },
}
