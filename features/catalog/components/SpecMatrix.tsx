import { ProductWithVariants, ProductVariant } from "../schemas";

interface SpecMatrixProps {
  product: ProductWithVariants;
  selectedVariant?: ProductVariant;
}

interface SpecItem {
  label: string;
  value: string;
}

interface SpecBlock {
  number: string;
  title: string;
  items: SpecItem[];
}

export function SpecMatrix({ product, selectedVariant }: SpecMatrixProps) {
  const specs = product.specs;

  const specBlocks: SpecBlock[] = [
    {
      number: "01",
      title: "MOVEMENT CALIBRE",
      items: [
        {
          label: "Calibre",
          value: specs?.movement?.calibre || product.movement || "Automatic Mechanical Calibre",
        },
        {
          label: "Frequency",
          value: specs?.movement?.frequency || "28,800 VPH (4Hz)",
        },
        {
          label: "Jewel Count",
          value: specs?.movement?.jewels || "26 Synthetic Rubies",
        },
        {
          label: "Power Reserve",
          value: specs?.movement?.powerReserve || "38 Hours Calibrated",
        },
        {
          label: "Manufacture",
          value: specs?.movement?.origin || "Switzerland / Regulated Stockholm",
        },
      ],
    },
    {
      number: "02",
      title: "CASE ARCHITECTURE",
      items: [
        {
          label: "Material",
          value: specs?.caseArchitecture?.material || "316L Surgical Stainless Steel",
        },
        {
          label: "Finish",
          value:
            selectedVariant?.caseFinish ||
            specs?.caseArchitecture?.finish ||
            "Brushed Satin Flanks, Mirror Lugs",
        },
        {
          label: "Construction",
          value: specs?.caseArchitecture?.construction || "Three-Piece Architecture",
        },
        {
          label: "Bezel",
          value: specs?.caseArchitecture?.bezel || "Fixed Stepped Bezel",
        },
      ],
    },
    {
      number: "03",
      title: "DIMENSIONS & PROFILE",
      items: [
        {
          label: "Diameter",
          value: specs?.dimensions?.diameter || product.caseDiameter || "38.0mm",
        },
        {
          label: "Case Height",
          value: specs?.dimensions?.height || "10.4mm (with Sapphire)",
        },
        {
          label: "Lug to Lug",
          value: specs?.dimensions?.lugToLug || "46.2mm Ergonomic Curve",
        },
        {
          label: "Strap Lug Width",
          value: specs?.dimensions?.lugWidth || "20.0mm Standard Lug",
        },
      ],
    },
    {
      number: "04",
      title: "CRYSTAL & OPTICS",
      items: [
        {
          label: "Dial Face Crystal",
          value: specs?.crystalOptics?.crystal || "Double-Domed Scratchproof Sapphire",
        },
        {
          label: "Anti-Reflective",
          value: specs?.crystalOptics?.coating || "5 Layers Internal Colorless AR",
        },
        {
          label: "Exhibition Back",
          value: specs?.crystalOptics?.caseback || "Sapphire Display Exhibition Window",
        },
      ],
    },
    {
      number: "05",
      title: "WATER & ATMOSPHERIC",
      items: [
        {
          label: "Depth Rating",
          value: specs?.waterResistance?.depth || product.waterResistance || "10 ATM / 100 Meters",
        },
        {
          label: "Crown Integration",
          value: specs?.waterResistance?.crown || "Threaded Knurled Screw-Down Crown",
        },
        {
          label: "Gasket Seal",
          value: specs?.waterResistance?.gaskets || "High-Integrity Viton Fluoroelastomer",
        },
      ],
    },
    {
      number: "06",
      title: "LEATHERWORK & HARDWARE",
      items: [
        {
          label: "Strap Material",
          value:
            selectedVariant?.strapMaterial ||
            specs?.leatherwork?.strap ||
            "Horween Chromexcel / High-Density Canvas",
        },
        {
          label: "Lining / Origin",
          value: specs?.leatherwork?.origin || "Vegetable-Tanned Swedish Nubuck",
        },
        {
          label: "Hardware & Buckle",
          value: specs?.leatherwork?.buckle || "316L Engraved Stainless Pin Buckle",
        },
      ],
    },
  ];

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="border-b border-outline pb-4 mb-8 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-accent-olive font-medium block mb-1">
            HOROLOGICAL MANIFEST // 06
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-on-surface font-normal">
            Technical Specification Matrix
          </h2>
        </div>
        <div className="font-mono text-[11px] tracking-wider text-on-surface-variant uppercase">
          TOLERANCE: {specs?.tolerance || "-4/+6 SEC/DAY"}
        </div>
      </div>

      {/* 6-Block Specification Matrix Grid (Invariant 8 mapped data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline border border-outline">
        {specBlocks.map((block) => (
          <div
            key={block.number}
            className="bg-surface-container-lowest p-6 flex flex-col justify-between"
          >
            <div>
              {/* Block Header */}
              <div className="flex items-center justify-between border-b border-outline pb-3 mb-4">
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-accent-olive font-medium">
                  {`${block.number} // ${block.title}`}
                </span>
                <span className="font-mono text-[10px] text-on-surface-variant/40">+</span>
              </div>

              {/* Spec Rows */}
              <dl className="space-y-2.5">
                {block.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-baseline gap-4 border-b border-outline-variant/50 pb-2 last:border-b-0"
                  >
                    <dt className="font-mono text-[11px] tracking-wider uppercase text-on-surface-variant shrink-0">
                      {item.label}
                    </dt>
                    <dd className="font-sans text-[12px] sm:text-[13px] text-on-surface font-medium text-right">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
