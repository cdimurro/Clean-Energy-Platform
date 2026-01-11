<h1 align="center">Clean Energy Platform</h1>

<p align="center">
  <strong>AI-Powered Techno-Economic Analysis for Clean Energy Technologies</strong>
</p>

> Validates clean energy technology claims against physics and produces investor-grade techno-economic assessments.

---

## Overview

This platform evaluates the commercial viability of emerging clean energy technologies. It takes technical claims from pitch decks, research papers, and data sheets, then validates them against thermodynamic limits, industry benchmarks, and physics-based simulations to produce investment-grade techno-economic assessments.

The core question the platform answers: *Can this technology compete at commercial scale, and under what conditions?*

---

## Who It's For

- **Climate tech investors** evaluating deals and conducting due diligence
- **Corporate development teams** assessing technology partnerships or acquisitions
- **Project developers** validating vendor claims before procurement
- **Startups** seeking third-party validation for fundraising materials
- **Government programs** evaluating grant applications and technology portfolios

---

## What You Get

| Deliverable | Description |
|-------------|-------------|
| **Assessment Report** | 30-50 page PDF with executive summary, claims validation, TEA, risk analysis |
| **Financial Model** | Editable assumptions with scenario analysis and sensitivity charts |
| **Validation Summary** | One-page overview suitable for investment committee presentations |
| **Data Package** | All extracted claims, benchmarks used, and calculation audit trail |

---

## What It Does

When a user submits a technology for assessment, the platform:

1. **Extracts claims** from uploaded documents using AI-powered document analysis
2. **Validates performance metrics** against fundamental physics and industry benchmarks
3. **Models financial outcomes** including LCOE, NPV, IRR, and payback periods
4. **Quantifies uncertainty** through Monte Carlo simulation with 10,000 iterations
5. **Generates publication-quality reports** with transparent methodology and source attribution

Every assumption in the final report traces back to its origin: extracted from a document (with page reference), derived from industry benchmarks (with source citation), or entered by the user.

---

## How It Works

### Editable Assessment Plans

Before any analysis runs, the platform generates an editable plan showing exactly what will be calculated and which assumptions will be used. Users see:

- **Methodology overview**: Which analyses will be performed
- **Source-attributed assumptions**: Every parameter shows where it came from
  - Extracted from uploaded documents
  - Industry defaults for the technology domain
  - Calculated from other inputs
  - User-modified values

This transparency allows users to adjust assumptions, run scenario analyses, and understand exactly how conclusions are reached.

### Seven-Agent Analysis Pipeline

Once a plan is approved, seven specialized AI agents execute the assessment in sequence:

| Agent | Function |
|-------|----------|
| **Technology Deep Dive** | Researches competitive landscape, identifies core innovations, assesses technology readiness level |
| **Claims Validation** | Verifies performance claims against thermodynamic limits and published benchmarks |
| **Performance Simulation** | Models system behavior under realistic operating conditions |
| **System Integration** | Evaluates grid interconnection requirements, supply chain dependencies, infrastructure needs |
| **TEA Analysis** | Calculates levelized costs, net present value, internal rate of return with stochastic modeling |
| **Improvement Opportunities** | Identifies cost reduction pathways and performance enhancement options |
| **Final Synthesis** | Aggregates findings into an investment rating with quantified strengths and risks |

Each agent builds on the outputs of previous agents, creating a coherent analysis where technology validation informs financial modeling, which informs risk assessment.

---

## Grounding Results in Physical Reality

The platform's credibility stems from its physics-first approach. Before any financial calculation runs, claims must pass through a validation stack that checks them against fundamental thermodynamic constraints.

### Four-Tier Validation Architecture

| Tier | Method | Purpose |
|------|--------|---------|
| **Tier 1** | Thermodynamic limit checking | Immediate rejection of physically impossible claims |
| **Tier 2** | Analytical calculations with thermodynamic property libraries | Verification against first-principles physics |
| **Tier 3** | Physics simulations with electrochemical and thermal models | Detailed performance prediction under operating conditions |
| **Tier 4** | Machine learning inference with physics-informed neural networks | Rapid evaluation of complex multi-physics systems |

A solar cell claiming 50% efficiency fails at Tier 1 (Shockley-Queisser limit for single-junction cells is 33.7%). An electrolyzer claiming 95% efficiency proceeds to Tier 2 for Butler-Volmer kinetics verification. Claims near theoretical limits trigger Tier 3 simulations for detailed validation.

This tiered approach ensures that computational resources focus on claims that survive basic physics checks, while impossible claims are rejected immediately with clear explanations.

---

## Thermodynamic Frameworks

Each technology domain implements the relevant thermodynamic constraints that govern physical performance limits.

### Solar Photovoltaics

**Shockley-Queisser Limit**: The theoretical maximum efficiency for single-junction solar cells based on detailed balance. The platform calculates this limit for any bandgap:

- Silicon (1.12 eV): 33.7% theoretical maximum
- Perovskite (1.55 eV): 33.1% theoretical maximum
- CdTe (1.45 eV): 32.9% theoretical maximum

**Temperature Derating**: Real-world efficiency loss due to operating temperature, modeled using temperature coefficients specific to each PV technology class.

**Tandem Architectures**: For multi-junction cells, the platform calculates theoretical limits using bandgap optimization for 2-junction, 3-junction, and 4-junction configurations.

### Electrochemical Systems

**Butler-Volmer Kinetics**: Models the relationship between electrode overpotential and current density, capturing activation losses in electrolyzers and fuel cells.

**Nernst Equation**: Calculates thermodynamic cell voltage as a function of temperature, pressure, and reactant concentrations.

**Faradaic Efficiency**: Accounts for parasitic reactions and current losses that reduce practical efficiency below theoretical limits.

Technology-specific models for:
- PEM electrolyzers (proton exchange membrane)
- Alkaline electrolyzers (liquid electrolyte)
- SOEC (solid oxide, high-temperature)
- AEM (anion exchange membrane)

### Thermal Systems

**Carnot Efficiency**: The theoretical maximum for heat-to-work conversion, calculated from source and sink temperatures with technology-specific practical multipliers:

- Steam Rankine cycle: 0.65-0.75 of Carnot
- Gas Brayton cycle: 0.55-0.65 of Carnot
- Combined cycle: 0.75-0.85 of Carnot
- Organic Rankine cycle: 0.50-0.60 of Carnot
- Supercritical CO2: 0.70-0.80 of Carnot

### Wind Energy

**Betz Limit**: The theoretical maximum power extraction from wind (59.3% of kinetic energy). Real turbines achieve 75-80% of Betz limit under optimal conditions.

**Power Curve Modeling**: Uses NREL reference turbine data to model power output as a function of wind speed, including cut-in, rated, and cut-out behavior.

**Wake Effects**: Models power reduction in turbine arrays due to upstream wake interference.

### Exergy Analysis

Beyond first-law energy efficiency, the platform calculates second-law exergy metrics that reveal true thermodynamic performance:

**Applied Exergy Leverage (AEL)**: Compares useful work output to theoretical maximum, accounting for energy quality differences between heat, electricity, and chemical potential.

**Exergy Destruction Ratio**: Quantifies irreversibilities in each process step, identifying where thermodynamic losses occur.

**Quality Factors**: Assigns work-equivalent values to different energy forms:
- Electricity: 1.0 (pure work)
- Mechanical work: 0.95
- High-temperature heat (>500C): 0.65-0.85
- Low-temperature heat (<100C): 0.10-0.25
- Chemical fuels: 0.85-0.95

---

## Simulation and Validation Tools

### CoolProp Integration

Thermodynamic property calculations use the CoolProp library, providing:

- Equations of state for 120+ pure fluids and mixtures
- Transport properties (viscosity, thermal conductivity)
- Phase equilibrium calculations
- Reference-accuracy thermodynamic data

This enables first-principles verification of heat exchanger performance, compressor work, and thermal system efficiency.

### Electrochemical Modeling

**PyBaMM Framework**: For battery systems, the platform integrates with the Python Battery Mathematical Modelling library:

- Doyle-Fuller-Newman (DFN) model for lithium-ion cells
- Single Particle Model for rapid screening
- Degradation mechanisms (SEI growth, lithium plating)
- Thermal coupling for safety analysis

### Monte Carlo Engine

Uncertainty quantification uses a 10,000-iteration Monte Carlo simulation:

- Probability distributions for uncertain parameters (triangular, normal, log-normal)
- Correlation handling between related parameters
- P5/P50/P95 confidence intervals for all key metrics
- Value-at-Risk (VaR) and Expected Shortfall calculations
- Sensitivity analysis identifying which parameters most affect outcomes

### Benchmark Databases

Results are validated against authoritative industry benchmarks:

| Source | Data |
|--------|------|
| **NREL ATB** | Annual Technology Baseline costs, efficiencies, capacity factors |
| **IEA** | Global energy statistics, technology roadmaps, cost projections |
| **DOE EERE** | Efficiency targets, R&D milestones, cost goals |
| **IRENA** | Renewable energy statistics, auction prices, deployment data |
| **PNNL** | Hydrothermal liquefaction research, state-of-technology reports |

When a claimed performance metric falls outside published benchmark ranges, the platform flags it for additional scrutiny and requires supporting evidence.

---

## Technology Domains

The platform supports comprehensive techno-economic analysis across major clean energy technology categories:

| Category | Technologies | Primary Metrics |
|----------|--------------|-----------------|
| **Power Generation** | Solar PV, Concentrated Solar, Wind (Onshore/Offshore), Geothermal, Nuclear SMR, Biomass | LCOE ($/MWh) |
| **Energy Storage** | Lithium-Ion, Flow Batteries, Sodium-Ion, Solid-State, Pumped Hydro, CAES, Thermal, Gravity | LCOS ($/kWh) |
| **Hydrogen Production** | PEM Electrolysis, Alkaline, SOEC, AEM | LCOH ($/kg) |
| **Synthetic Fuels** | Ammonia, Methanol, Fischer-Tropsch SAF, Hydrogen Fuel Cells | $/tonne, $/GGE |
| **Waste-to-Value** | Hydrothermal Liquefaction, Pyrolysis, Gasification, Anaerobic Digestion | LCOF ($/L), $/GGE |
| **Carbon Management** | Direct Air Capture, Point Source Capture, BECCS, Mineralization, Ocean CDR | $/tonne CO2 |
| **Industrial Decarbonization** | Green Steel (H2-DRI), Green Cement, Industrial Heat Pumps, Electric Crackers | $/tonne, $/MWh |

Each domain includes:
- Technology-specific thermodynamic constraints and physical limits
- Industry benchmark data from authoritative sources (NREL, IEA, DOE)
- Default parameters calibrated to current state-of-technology
- Validation rules that flag claims outside physically plausible ranges

---

## Example Assessment

**Technology:** Novel Perovskite Solar Cell
**Claim evaluated:** ">28% power conversion efficiency"

**Validation Result:**

| Check | Result | Benchmark |
|-------|--------|-----------|
| Shockley-Queisser limit | PASS | Single-junction theoretical max is 33.7% |
| Current record efficiency | FLAG | Best lab perovskite is 26.1% (NREL chart) |
| Stability claim (25-year) | INVESTIGATE | Industry standard perovskite degradation rates suggest 15-20 year practical lifetime |
| Status | CONDITIONAL | Efficiency exceeds current records but is physically possible |

**TEA Output:**

| Metric | P5 | P50 | P95 |
|--------|-----|-----|-----|
| LCOE | $18.2/MWh | $24.7/MWh | $38.1/MWh |
| NPV (10-year) | $2.1M | $8.4M | $15.2M |
| IRR | 8.2% | 14.6% | 22.1% |

**Recommendation:** CONDITIONAL - efficiency claim requires independent verification; stability assumptions significantly impact economics

---

## Financial Modeling

The TEA engine produces institutional-grade financial analysis.

**Levelized Cost Metrics:**
- **LCOE**: Levelized Cost of Energy ($/MWh) — power generation
- **LCOH**: Levelized Cost of Hydrogen ($/kg) — hydrogen production
- **LCOS**: Levelized Cost of Storage ($/kWh) — energy storage
- **LCOF**: Levelized Cost of Fuel ($/L or $/GGE) — liquid fuels including waste-to-fuel

**Core Metrics**
- Levelized Cost of Energy/Hydrogen/Storage (LCOE/LCOH/LCOS)
- Net Present Value (NPV) with configurable discount rates
- Internal Rate of Return (IRR)
- Payback period under multiple scenarios

**Advanced Analysis**
- Multi-year cash flow projections with depreciation schedules (straight-line, MACRS)
- Debt service modeling with customizable financing structures
- Tax credit integration (ITC, PTC, 45V, 45Q)
- Regional cost adjustments based on labor, materials, and utility rates
- Sensitivity tornado charts identifying key cost drivers

**Risk Quantification**
- Full probability distributions for all financial metrics
- Confidence intervals at user-specified levels
- Downside risk metrics (VaR, Expected Shortfall)
- Scenario analysis with parameter sweeps

---

## Report Generation

Final assessments are delivered as publication-quality PDF reports containing:

- **Executive Summary**: Investment rating, key findings, critical risks
- **Technology Analysis**: Innovation assessment, competitive positioning, TRL evaluation
- **Claims Validation**: Physics-based verification results with confidence levels
- **Financial Projections**: LCOE/NPV/IRR with uncertainty ranges
- **Sensitivity Analysis**: Tornado charts, parameter importance rankings
- **Risk Assessment**: Quantified risks with mitigation pathways
- **Methodology Documentation**: Full transparency on assumptions, sources, and calculations

Every number in the report links to its source, whether extracted from uploaded documents, derived from benchmark databases, or calculated from first principles.

---

## Platform Architecture

### System Layers

| Layer | Components | Function |
|-------|------------|----------|
| **Document Processing** | PDF parser, Excel extractor, AI claim identifier | Extracts structured data and performance claims from uploaded files |
| **Physics Validation** | Thermodynamic limit calculators, CoolProp integration, PyBaMM models | Validates claims against fundamental physical constraints |
| **Agent Orchestration** | Seven specialized AI agents, sequential execution, output aggregation | Coordinates multi-step analysis with context passing between agents |
| **Financial Engine** | LCOE/NPV/IRR calculators, Monte Carlo simulator, sensitivity analyzer | Produces probabilistic financial projections with uncertainty quantification |
| **Report Generator** | PDF renderer, chart generator, source attribution system | Creates publication-quality deliverables with full methodology transparency |

### Data Flow

| Stage | Input | Processing | Output |
|-------|-------|------------|--------|
| **1. Intake** | Documents, technology description | AI extraction, claim identification | Structured claims with source references |
| **2. Planning** | Extracted claims, domain selection | Default population, methodology configuration | Editable assessment plan |
| **3. Validation** | Performance claims | 4-tier physics validation stack | Validated metrics with confidence levels |
| **4. Analysis** | Validated claims, user assumptions | 7-agent sequential processing | Component outputs (technology, claims, simulation, integration, TEA, improvements) |
| **5. Synthesis** | All component outputs | Final agent aggregation, rating calculation | Investment recommendation with quantified risks |
| **6. Reporting** | Synthesis results | PDF generation with charts and tables | Downloadable assessment report |

### Validation Pipeline

| Check | Threshold | Action on Failure |
|-------|-----------|-------------------|
| **Thermodynamic limits** | Exceeds theoretical maximum | Immediate rejection with explanation |
| **Benchmark range** | Outside 3-sigma of published data | Flag for additional evidence |
| **Internal consistency** | Parameters contradict each other | Highlight conflict, request clarification |
| **Unit validation** | Mismatched or implausible units | Auto-correct with user confirmation |
| **Completeness** | Missing required parameters | Populate from domain defaults with attribution |

---

## Data Sources

The platform integrates with authoritative scientific and industry databases:

**Academic Literature**
- arXiv (physics, materials science preprints)
- PubMed (bioprocess, biomass research)
- OpenAlex (broad academic coverage)
- Semantic Scholar (citation analysis, impact metrics)
- ChemRxiv (chemistry preprints)
- IEEE Xplore (electrical engineering)

**Industry Benchmarks**
- NREL Annual Technology Baseline
- DOE EERE efficiency targets
- IEA World Energy Outlook
- IRENA renewable energy statistics
- PNNL state-of-technology reports

**Patent Databases**
- Google Patents
- USPTO PatentsView

All benchmark data is updated annually. Every assumption in your report cites its source.

---

## Limitations

This platform provides physics-based validation and financial modeling, but does not:

- **Replace site visits** — We validate claims against physics and benchmarks, not physical inspection
- **Provide legal advice** — IP and regulatory assessments require specialized counsel
- **Guarantee outcomes** — Our analysis quantifies probability ranges, not certainties
- **Access proprietary data** — We work with information you provide plus public sources

---

## Get Started

1. **Upload your documents** — pitch decks, technical specs, research papers
2. **Review the assessment plan** — see exactly what will be analyzed and which assumptions apply
3. **Run the analysis** — seven specialized agents evaluate claims and model economics
4. **Download your report** — investor-grade PDF with full methodology transparency
