import type { MaterialSpec, CaliberParameter, TestingPhase } from "./types";

export const METALLURGY_SPECS: MaterialSpec[] = [
  {
    id: "316l-steel",
    badge: "GRADE // 316L",
    category: "ALLOY SPECIFICATION",
    title: "316L Surgical Steel",
    description:
      "Cold-rolled low-carbon austenitic stainless steel milled from solid billets to a tolerance of ±0.005mm. Longitudinal satin brushing accented by hand-chamfered mirror-polished lug facets.",
    image: "/images/watch-profile.jpg",
    altText: "Northwatch 316L stainless steel case profile showing brushed flank finish",
    metrics: [
      { label: "TENSILE STRENGTH", value: "620 MPa" },
      { label: "CORROSION INDEX", value: "PREN ≥ 25.0" },
      { label: "SURFACE GRAIN", value: "240-GRIT SATIN" },
    ],
  },
  {
    id: "sapphire-crystal",
    badge: "MOHS // 9.0",
    category: "OPTICAL SYNTHESIS",
    title: "Double-Domed Sapphire",
    description:
      "Synthesized pure corundum crystal cut with dual convex curves to eliminate dial distortion from extreme viewing angles. Multi-layer anti-reflective treatment applied solely to the internal plane.",
    image: "/images/watch-movement.jpg",
    altText: "Exhibition sapphire crystal caseback displaying automatic movement mechanism",
    metrics: [
      { label: "HARDNESS SPEC", value: "2,000 VICKERS" },
      { label: "AR COATING", value: "5-LAYER INNER PLANE" },
      { label: "THERMAL SHOCK", value: "ΔT 160°C RESISTANT" },
    ],
  },
  {
    id: "vegetable-leather",
    badge: "TÄRNSJÖ // 1873",
    category: "ORGANIC PROVENANCE",
    title: "Vegetable-Tanned Leather",
    description:
      "Ethically sourced full-grain hide vegetable-tanned exclusively with organic tree bark extracts in Sweden. Hand-finished with raw edges, waxed linen bar tacking, and an engraved 316L pin buckle.",
    image: "/images/watch-strap.jpg",
    altText: "Macro detail of vegetable-tanned Swedish leather strap and buckle",
    metrics: [
      { label: "CURING METHOD", value: "ORGANIC BARK OAK" },
      { label: "THICKNESS TAPER", value: "3.8MM → 2.6MM" },
      { label: "THREADING", value: "WAXED LINEN TACK" },
    ],
  },
];

export const CALIBER_PARAMETERS: CaliberParameter[] = [
  {
    label: "CALIBER REFERENCE",
    value: "NW-CAL.01 (HIGH-BEAT MECHANICAL)",
  },
  {
    label: "FREQUENCY",
    value: "28,800 VPH (4.0 HZ)",
  },
  {
    label: "JEWELS",
    value: "26 SYNTHETIC RUBIES",
  },
  {
    label: "POWER RESERVE",
    value: "42 HOURS AUTONOMOUS",
  },
  {
    label: "REGULATION TOLERANCE",
    value: "-4 / +6 SEC / DAY (5 POSITIONS)",
    isHighlighted: true,
  },
  {
    label: "WATER RESISTANCE",
    value: "10 ATM / 100 METERS",
  },
  {
    label: "SHOCK PROTECTION",
    value: "INCABLOC® INTEGRATED SYSTEM",
  },
];

export const TESTING_PHASES: TestingPhase[] = [
  {
    phaseNumber: "01",
    phaseTag: "PHASE I",
    title: "Thermal Shock Cycling",
    description:
      "Instruments undergo continuous thermal transitions from -15°C to +55°C to certify alloy stabilization, gasket hermeticity, and lubrication viscosity.",
    chamberRef: "CHAMBER // ARCTIC-04",
  },
  {
    phaseNumber: "02",
    phaseTag: "PHASE II",
    title: "Hydrostatic Pressure",
    description:
      "Submerged under 12.5 bar static fluid pressure exceeding nominal 10 ATM rating by 25% to verify caseback O-rings and screw-down crown integrity.",
    chamberRef: "CALIBRATION // 125M OVERTEST",
  },
  {
    phaseNumber: "03",
    phaseTag: "PHASE III",
    title: "Demagnetization Field",
    description:
      "Exposure to intense electromagnetic fields up to 4,800 A/m simulating modern consumer electronic proximity without rate deviation.",
    chamberRef: "RESISTANCE // DIN 8309",
  },
  {
    phaseNumber: "04",
    phaseTag: "PHASE IV",
    title: "Micro-Acoustic Timing",
    description:
      "Piezoelectric microphone diagnostics capturing escapement beat error (≤0.2ms) and amplitude stability across all five static horological positions.",
    chamberRef: "TOLERANCE // ≤0.2MS BEAT ERR",
  },
];
