import type { JournalArticle, FieldNote, JournalCategoryTab } from "./types";

export const JOURNAL_CATEGORY_TABS: JournalCategoryTab[] = [
  { category: "all", label: "All Dispatches", count: 9 },
  { category: "metallurgy", label: "Metallurgy & Craft", count: 3 },
  { category: "atelier", label: "Atelier Interviews", count: 2 },
  { category: "philosophy", label: "Architectural Philosophy", count: 2 },
  { category: "field", label: "Field Research", count: 2 },
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: "dispatch-014",
    slug: "the-aesthetics-of-restraint",
    dispatchNumber: "DISPATCH 014",
    locationTag: "STOCKHOLM LAB",
    isLeadMonograph: true,
    specimenRef: "REF. NW-40-BLT // SPECIMEN 003 OF 025 // TEST CHAMBER 04",
    category: "philosophy",
    categoryLabel: "ARCHITECTURAL PHILOSOPHY",
    readTime: "08 MIN READ",
    publishDate: "FEB 2026",
    title:
      "The Aesthetics of Restraint: Why Nothing Superfluous Can Survive 300 Meters",
    excerpt:
      "True chronometric instrument design begins with elimination. By stripping the dial of decorative numerals, cyclops lenses, and reflective varnishes, legibility transforms into a physical constant rather than an aesthetic choice.",
    author: "Lars Engberg",
    authorRole: "Head of Atelier",
    image: "/images/hero-basalt.jpg",
    altText:
      "Editorial close-up of a minimalist Northwatch field watch resting on textured black volcanic basalt stone slab with precision chamfered edges",
    pullQuote:
      "Luminescence and pitch-black negative space act not as ornamental accents, but as load-bearing structural materials.",
    content: [
      "True chronometric instrument design begins with elimination. By stripping the dial of decorative numerals, cyclops lenses, and reflective varnishes, legibility transforms into a physical constant rather than an aesthetic choice.",
      "In deep subterranean or high-latitude nautical trials, luminescence and pitch-black negative space act not as accents, but as load-bearing structural materials. The eye cannot negotiate ambiguity when pressure climbs beyond thirty atmospheres.",
      "When we engineered the basalt matte dial for the NW-40 series, the goal was not decorative subtlety. We sought a crystalline mineral surface capable of absorbing stray optical refraction entirely, leaving only surgical white baton markings floating against pure void.",
      "Every millimeter of superfluous case geometry was evacuated during finite element analysis in our Stockholm atelier. The remaining silhouette expresses only what the tensile threshold of 316L steel demands to protect the escapement within.",
    ],
  },
  {
    id: "dispatch-013",
    slug: "study-in-basalt",
    dispatchNumber: "DISPATCH 013",
    locationTag: "METALLURGICAL DIVISION",
    category: "metallurgy",
    categoryLabel: "METALLURGY",
    readTime: "06 MIN READ",
    publishDate: "JAN 2026",
    title:
      "A Study in Basalt: Dial Texture Synthesis and High-Contrast Legibility",
    excerpt:
      "How pulverized Scandinavian volcanic basalt informed our light-absorbing matte dial finish, eliminating ocular refraction during arctic field maneuvers.",
    author: "Dr. Elin Thornström",
    authorRole: "Materials Research Lead",
    image: "/images/watch-field-38.jpg",
    altText:
      "Extreme macro shot of a black textured Northwatch timepiece dial, showing crisp metallic baton indices and brushed silver hands",
    pullQuote:
      "A dial that reflects ambient light is a failure of optical discipline.",
    content: [
      "Sub-zero circumpolar sunlight presents an acute challenge to horological legibility. Traditional lacquered enamel dials create harsh specular highlights that obliterate hand positions.",
      "To counter this phenomena, our metallurgy lab developed a microscopic pulverized basalt compound. When applied through electrostatic vacuum deposition, it creates a microscopic micro-cavity lattice that traps stray photons.",
      "The result is a surface of extraordinary perceptual stillness. Diamond-cut hands and crisp Super-LumiNova markers hover with architectural clarity across any environmental lighting delta.",
    ],
  },
  {
    id: "dispatch-012",
    slug: "five-positions-in-geneva",
    dispatchNumber: "DISPATCH 012",
    locationTag: "GENEVA LABORATORY",
    category: "atelier",
    categoryLabel: "CHRONOMETRIC ARCHITECTURE",
    readTime: "11 MIN READ",
    publishDate: "DEC 2025",
    title:
      "Five Positions in Geneva: The Metrology of the NW-CAL.01 Movement",
    excerpt:
      "Documenting the 360-hour dynamic regulation cycle required for every Northwatch escapement, maintaining -2/+2 seconds daily deviation tolerances.",
    author: "Jean-Marc Voirol",
    authorRole: "Master Watchmaker",
    image: "/images/watch-profile.jpg",
    altText:
      "Technical watchmaker workbench scene with a minimalist stainless steel Northwatch field watch resting on Swedish granite block",
    pullQuote:
      "Isochronism cannot be accelerated. It requires 360 continuous hours of acoustic observation across dynamic planes.",
    content: [
      "No mechanical movement leaves our Geneva laboratory on the strength of factory calibration alone. The NW-CAL.01 caliber must endure an unhurried fifteen-day observation cycle.",
      "Mounted upon computerized multi-axis regulation arms, each movement cycles through five static physical orientations: dial up, dial down, crown left, crown up, and crown down.",
      "High-sensitivity piezoelectric microphones capture the microscopic tick and tock of the Swiss lever escapement, registering beat errors down to tenths of a millisecond.",
    ],
  },
  {
    id: "dispatch-011",
    slug: "permanence-of-316l-steel",
    dispatchNumber: "DISPATCH 011",
    locationTag: "STOCKHOLM FOUNDRY",
    category: "metallurgy",
    categoryLabel: "MATERIALITY",
    readTime: "05 MIN READ",
    publishDate: "NOV 2025",
    title: "The Permanence of Cold-Rolled 316L Austenitic Steel",
    excerpt:
      "Examining molecular density, seawater pitting resistance, tensile yield limits, and why hand-chamfered mirror bevels remain the ultimate test of human tactile discipline.",
    author: "Matthias Berg",
    authorRole: "Senior Metallurgical Engineer",
    image: "/images/watch-movement.jpg",
    altText:
      "Macro detail shot of an exhibition sapphire crystal caseback on a luxury automatic watch, showing cold-rolled steel bevels",
    pullQuote:
      "Austenitic stainless steel is not merely durable; its molecular structure resists decades of oceanic exposure without yield.",
    content: [
      "In horological engineering, metal selection defines longevity. Grade 316L austenitic stainless steel contains molybdenum, creating a self-healing chromium oxide passivation layer.",
      "We source cold-rolled billets shaped under high-pressure forging dies. This concentrates the metallic grain structure along the outer flank of each lug, dramatically increasing impact resilience.",
      "Finally, master polishers execute alternating 240-grit longitudinal satin brushes with mirror-polished chamfers, celebrating the surgical precision of human craftsmanship.",
    ],
  },
];

export const FIELD_NOTES: FieldNote[] = [
  {
    id: "note-08",
    noteCode: "NOTE 08",
    dateCode: "2026.01",
    title: "Magnetic Resistance Testing Protocol (DIN 8309 Standard)",
    description:
      "Full 4,800 A/m magnetic flux density exposure benchmark results across silicon hairspring iterations.",
    actionLabel: "Download Spec PDF",
    actionType: "download",
    specFile: "NW-SPEC-DIN8309-V4.pdf",
  },
  {
    id: "note-07",
    noteCode: "NOTE 07",
    dateCode: "2025.11",
    title: "Vegetable Tanning Chemistry with Tärnsjö Garveri",
    description:
      "Organic bark extract formulation, zero-chromium curing, and 3-year wrist patina aging metrics.",
    actionLabel: "View Transcript",
    actionType: "view",
    specFile: "NW-NOTE-TARNSJO-METRICS.pdf",
  },
  {
    id: "note-06",
    noteCode: "NOTE 06",
    dateCode: "2025.09",
    title: "Coaxial Monopusher Column Wheel Tolerances",
    description:
      "Machining blueprints detailing ±0.002mm laser-wire EDM tolerances for instantaneous chronograph reset.",
    actionLabel: "Download Blueprint",
    actionType: "download",
    specFile: "NW-CAD-MONOPUSHER-TOL.pdf",
  },
  {
    id: "note-05",
    noteCode: "NOTE 05",
    dateCode: "2025.07",
    title: "Arctic Thermal Delta Testing (-40°C to +60°C)",
    description:
      "Viscosity variations of synthetic ester oils under extreme circumpolar thermal cycling.",
    actionLabel: "Download Spec PDF",
    actionType: "download",
    specFile: "NW-TEST-ARCTIC-DELTA.pdf",
  },
];
