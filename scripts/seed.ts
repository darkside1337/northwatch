import "dotenv/config";
import { pool, db } from "../lib/db/client";
import { products, productVariants, type ProductSpecs } from "../lib/db/schema";
import { eq } from "drizzle-orm";

interface SeedVariant {
  sku: string;
  name: string;
  dialColor: string;
  strapMaterial: string;
  caseFinish: string;
  priceCents: number;
  stock: number;
  images: string[];
}

interface SeedProduct {
  title: string;
  slug: string;
  referenceCode: string;
  description: string;
  caseDiameter: string;
  movement: string;
  waterResistance: string;
  editorialQuote: string;
  quoteAuthor: string;
  featured: boolean;
  specs: ProductSpecs;
  variants: SeedVariant[];
}

const CATALOG_DATA: SeedProduct[] = [
  {
    title: "The Field Automatic",
    slug: "field-automatic",
    referenceCode: "NW-01-FLD",
    description:
      "A pure instrument of timekeeping. Engineered with a high-contrast matte dial, anti-reflective sapphire crystal, and robust 100m water resistance. Designed for daily resilience without superfluous ornamentation.",
    caseDiameter: "38mm",
    movement: "Automatic 4Hz (Sellita SW200-1 Elaboré)",
    waterResistance: "100m / 10 ATM",
    editorialQuote: "A watch should not scream for attention. It should reward the closer glance.",
    quoteAuthor: "Henrik Lindqvist, Master Watchmaker",
    featured: true,
    specs: {
      movement: {
        calibre: "Calibre NW-01 (Sellita SW200-1 Elaboré)",
        frequency: "28,800 VPH (4Hz)",
        jewels: "26 Synthetic Rubies",
        powerReserve: "38 Hours Calibrated",
        origin: "La Chaux-de-Fonds, Switzerland / Regulated Stockholm",
      },
      caseArchitecture: {
        material: "316L Cold-Rolled Surgical Stainless Steel",
        finish: "Brushed Satin Flanks, Mirror-Polished Lugs",
        construction: "Three-Piece Architecture with Fixed Stepped Bezel",
        bezel: "Fixed Stepped Bezel with Hairline Satin Polish",
      },
      dimensions: {
        diameter: "38.0mm",
        height: "10.4mm Total Height (including sapphire dome)",
        lugToLug: "46.2mm Ergonomic Curve",
        lugWidth: "20.0mm Standard Lug Width",
      },
      crystalOptics: {
        crystal: "Double-Domed Scratchproof Sapphire",
        coating: "5 Layers Anti-Reflective Underside Coating",
        caseback: "Screw-Down Exhibition Sapphire Display Caseback",
      },
      waterResistance: {
        depth: "10 ATM / 100 Meters (330 Feet)",
        crown: "Knurled Threaded Screw-Down Crown with Viton Gasket",
        gaskets: "Fluoroelastomer High-Integrity Seals",
      },
      leatherwork: {
        strap: "Chicago Horween Chromexcel / High-Density Olive Canvas",
        origin: "Vegetable-Tanned Swedish Nubuck Lining",
        buckle: "Custom 316L Stainless Steel Engraved Pin Buckle",
      },
      tolerance: "-4/+6 SEC/DAY",
      edition: "ATELIER EDITION: 500 PIECES",
    },
    variants: [
      {
        sku: "NW-01-FLD-BLK-CAN",
        name: "Matte Black / Olive Canvas",
        dialColor: "Matte Black",
        strapMaterial: "Olive Canvas",
        caseFinish: "Brushed 316L Steel",
        priceCents: 38000,
        stock: 15,
        images: ["/images/watch-field-canvas.jpg"],
      },
      {
        sku: "NW-01-FLD-BLK-LEA",
        name: "Matte Black / Horween Calf",
        dialColor: "Matte Black",
        strapMaterial: "Horween Calfskin",
        caseFinish: "Brushed 316L Steel",
        priceCents: 41000,
        stock: 12,
        images: ["/images/watch-field-38.jpg"],
      },
      {
        sku: "NW-01-FLD-BLK-MSH",
        name: "Matte Black / Milanese Mesh",
        dialColor: "Matte Black",
        strapMaterial: "Milanese Mesh",
        caseFinish: "Brushed 316L Steel",
        priceCents: 43000,
        stock: 0,
        images: ["/images/watch-field-38.jpg"],
      },
    ],
  },
  {
    title: "The Monopusher Chronograph",
    slug: "monopusher-chronograph",
    referenceCode: "NW-02-CHR",
    description:
      "A celebration of mechanical clarity. A single co-axial pusher seamlessly executes start, stop, and reset operations with mechanical finality. Features a subtle bi-compax subdial layout on an Arctic White lacquered dial.",
    caseDiameter: "40mm",
    movement: "Column Wheel Mechanical Manual",
    waterResistance: "50m / 5 ATM",
    editorialQuote: "A singular pusher controls start, stop, and reset with mechanical finality.",
    quoteAuthor: "The Minimalist Journal",
    featured: true,
    specs: {
      movement: {
        calibre: "Calibre NW-02 (Column Wheel Mechanical Manual)",
        frequency: "21,600 VPH (3Hz)",
        jewels: "23 Synthetic Jewels",
        powerReserve: "45 Hours",
        origin: "Geneva, Switzerland / Stockholm Atelier",
      },
      caseArchitecture: {
        material: "316L Surgical Stainless Steel",
        finish: "Mirror Polished Bevels, Brushed Case Band",
        construction: "Three-Piece Co-Axial Pusher Integration",
        bezel: "Polished Step Bezel",
      },
      dimensions: {
        diameter: "40.0mm",
        height: "11.8mm Total Height",
        lugToLug: "47.5mm",
        lugWidth: "20.0mm",
      },
      crystalOptics: {
        crystal: "High-Box Sapphire Crystal with Internal AR",
        coating: "Multi-Layer Anti-Reflective Coating",
        caseback: "Flat Sapphire Exhibition Caseback",
      },
      waterResistance: {
        depth: "5 ATM / 50 Meters",
        crown: "Co-Axial Pusher Crown with Dual O-Rings",
        gaskets: "Synthetic Nitrile Gaskets",
      },
      leatherwork: {
        strap: "German Milanese Mesh / Bridle Leather",
        origin: "Bespoke German Manufacture",
        buckle: "Signed Fold-Over Clasp",
      },
      tolerance: "-3/+5 SEC/DAY",
      edition: "LIMITED SERIES: 250 PIECES",
    },
    variants: [
      {
        sku: "NW-02-CHR-WHT-MSH",
        name: "Arctic White / Milanese Mesh",
        dialColor: "Arctic White",
        strapMaterial: "Milanese Mesh",
        caseFinish: "Polished Steel",
        priceCents: 62000,
        stock: 8,
        images: ["/images/watch-monopusher.jpg"],
      },
      {
        sku: "NW-02-CHR-WHT-LEA",
        name: "Arctic White / Bridle Leather",
        dialColor: "Arctic White",
        strapMaterial: "Bridle Leather",
        caseFinish: "Polished Steel",
        priceCents: 65000,
        stock: 10,
        images: ["/images/watch-monopusher.jpg"],
      },
    ],
  },
  {
    title: "The Bauhaus Dress Watch",
    slug: "bauhaus-dress-watch",
    referenceCode: "NW-03-BAU",
    description:
      "Reduction to pure form. An ultra-thin 7.2mm case profile housing an exacting manual wind calibre. Hairline baton indices and heat-blued hands form a tranquil composition that fits effortlessly under tailored cuffs.",
    caseDiameter: "37mm",
    movement: "Ultra-Thin Manual Wind (2.5mm)",
    waterResistance: "30m / 3 ATM",
    editorialQuote: "Subtle proportions that slip under any cuff without demanding attention.",
    quoteAuthor: "Permanent Style",
    featured: true,
    specs: {
      movement: {
        calibre: "Calibre NW-03 (Ultra-Thin Manual Wind 2.5mm)",
        frequency: "21,600 VPH (3Hz)",
        jewels: "17 Jewels",
        powerReserve: "42 Hours",
        origin: "Glashütte & Stockholm Collaboration",
      },
      caseArchitecture: {
        material: "316L Satin Stainless Steel",
        finish: "Fine Satin Horizontal Brush",
        construction: "Two-Piece Monobloc Construction",
        bezel: "Knife-Edge Minimalist Fixed Bezel",
      },
      dimensions: {
        diameter: "37.0mm",
        height: "7.2mm Ultra-Thin Profile",
        lugToLug: "43.0mm",
        lugWidth: "18.0mm",
      },
      crystalOptics: {
        crystal: "Ultra-Flat Scratchproof Sapphire",
        coating: "Underside Colorless AR Coating",
        caseback: "Solid Caseback with Atelier Inscription",
      },
      waterResistance: {
        depth: "3 ATM / 30 Meters",
        crown: "Knurled Push-Pull Low-Profile Crown",
        gaskets: "Precision Micro-Gaskets",
      },
      leatherwork: {
        strap: "Genuine Horween Shell Cordovan",
        origin: "Chicago Tannery / Hand-Stitched Stockholm",
        buckle: "Satin Tang Buckle with Hairline Chamfer",
      },
      tolerance: "-5/+7 SEC/DAY",
      edition: "ANNUAL ALLOCATION: 300 PIECES",
    },
    variants: [
      {
        sku: "NW-03-BAU-GRY-COR",
        name: "Slate Grey / Shell Cordovan",
        dialColor: "Slate Grey",
        strapMaterial: "Shell Cordovan",
        caseFinish: "Satin Steel",
        priceCents: 45000,
        stock: 14,
        images: ["/images/watch-bauhaus.jpg"],
      },
      {
        sku: "NW-03-BAU-IVR-COR",
        name: "Ivory / Shell Cordovan",
        dialColor: "Ivory",
        strapMaterial: "Shell Cordovan",
        caseFinish: "Satin Steel",
        priceCents: 45000,
        stock: 11,
        images: ["/images/watch-bauhaus.jpg"],
      },
    ],
  },
  {
    title: "The Submersible Tool Watch",
    slug: "submersible-tool-watch",
    referenceCode: "NW-04-DIV",
    description:
      "A precision instrument built for deep waters. Grade 2 bead-blasted titanium case, helium escape valve, and 300m water resistance, paired with high-grade Super-LumiNova BGW9 indices for legible contrast in pitch darkness.",
    caseDiameter: "41mm",
    movement: "Automatic 4Hz (High Beat)",
    waterResistance: "300m / 30 ATM",
    editorialQuote: "Built to withstand depths while retaining the restraint of a studio object.",
    quoteAuthor: "Dive Mechanics",
    featured: false,
    specs: {
      movement: {
        calibre: "Calibre NW-04 (High-Beat Automatic 4Hz)",
        frequency: "28,800 VPH (4Hz)",
        jewels: "25 Synthetic Jewels",
        powerReserve: "41 Hours",
        origin: "Geneva / Regulated Stockholm",
      },
      caseArchitecture: {
        material: "Grade 2 Cold-Rolled Titanium",
        finish: "Matte Micro-Bead Blasted",
        construction: "Monobloc with Integrated Helium Valve",
        bezel: "120-Click Ceramic Inset Unidirectional Bezel",
      },
      dimensions: {
        diameter: "41.0mm",
        height: "12.6mm",
        lugToLug: "48.0mm",
        lugWidth: "20.0mm",
      },
      crystalOptics: {
        crystal: "3.5mm Thick Double-Domed Sapphire",
        coating: "Triple Internal Anti-Reflective Layers",
        caseback: "Deep-Engraved Solid Titanium Caseback",
      },
      waterResistance: {
        depth: "30 ATM / 300 Meters (1000 Feet)",
        crown: "Heavy-Duty Threaded Crown with Dual O-Ring Seals",
        gaskets: "Helium Escape Valve + Viton Gaskets",
      },
      leatherwork: {
        strap: "High-Density FKM Fluorocarbon Rubber / Titanium Bracelet",
        origin: "Precision Molded Austria",
        buckle: "Micro-Adjusting Divers Safety Clasp",
      },
      tolerance: "-2/+4 SEC/DAY (CHRONOMETER SPEC)",
      edition: "PRODUCTION BATCH: 400 PIECES",
    },
    variants: [
      {
        sku: "NW-04-DIV-NVY-RUB",
        name: "Deep Navy / FKM Rubber",
        dialColor: "Deep Navy",
        strapMaterial: "FKM Rubber",
        caseFinish: "Bead-Blasted Titanium",
        priceCents: 54000,
        stock: 18,
        images: ["/images/watch-diver.jpg"],
      },
      {
        sku: "NW-04-DIV-OBS-STL",
        name: "Obsidian / Engineered Bracelet",
        dialColor: "Obsidian",
        strapMaterial: "Titanium Bracelet",
        caseFinish: "Bead-Blasted Titanium",
        priceCents: 59000,
        stock: 7,
        images: ["/images/watch-diver.jpg"],
      },
    ],
  },
  {
    title: "The Dual-Time GMT",
    slug: "dual-time-gmt",
    referenceCode: "NW-05-GMT",
    description:
      "For cross-continental travel. A discreet 24-hour chapter ring accompanied by an independently adjustable GMT hand. Clean dual-time tracking without loud colored bezels, maintaining the hallmark horological restraint.",
    caseDiameter: "39mm",
    movement: "Automatic Caller GMT (4Hz)",
    waterResistance: "100m / 10 ATM",
    editorialQuote: "Two time zones rendered through hairline chapter rings and monochrome contrast.",
    quoteAuthor: "Monochrome Time",
    featured: false,
    specs: {
      movement: {
        calibre: "Calibre NW-05 (Automatic Caller GMT 4Hz)",
        frequency: "28,800 VPH (4Hz)",
        jewels: "24 Jewels",
        powerReserve: "42 Hours",
        origin: "Switzerland / Stockholm Atelier",
      },
      caseArchitecture: {
        material: "316L Surgical Stainless Steel",
        finish: "Radial Brushed Bezel, Satin Case Sides",
        construction: "Three-Piece Architecture with Inset 24H Ring",
        bezel: "Fixed Hairline Brushed Steel Bezel",
      },
      dimensions: {
        diameter: "39.0mm",
        height: "11.2mm",
        lugToLug: "46.8mm",
        lugWidth: "20.0mm",
      },
      crystalOptics: {
        crystal: "Domed Scratchproof Sapphire",
        coating: "Internal Colorless AR Coating",
        caseback: "Exhibition Sapphire with Smoked Rotor",
      },
      waterResistance: {
        depth: "10 ATM / 100 Meters",
        crown: "Screw-Down Independent GMT Crown",
        gaskets: "Dual Silicone Gaskets",
      },
      leatherwork: {
        strap: "Horween Calfskin / Five-Link Jubilee Steel",
        origin: "Chicago / Geneva Hardware",
        buckle: "Concealed Butterfly Deployment Buckle",
      },
      tolerance: "-4/+6 SEC/DAY",
      edition: "ATELIER EDITION: 350 PIECES",
    },
    variants: [
      {
        sku: "NW-05-GMT-ANT-CAL",
        name: "Anthracite / Horween Calf",
        dialColor: "Anthracite",
        strapMaterial: "Horween Calfskin",
        caseFinish: "Brushed Steel",
        priceCents: 59000,
        stock: 9,
        images: ["/images/watch-gmt.jpg"],
      },
      {
        sku: "NW-05-GMT-ANT-STL",
        name: "Anthracite / Jubilee Steel",
        dialColor: "Anthracite",
        strapMaterial: "Steel Jubilee",
        caseFinish: "Brushed Steel",
        priceCents: 63000,
        stock: 6,
        images: ["/images/watch-gmt.jpg"],
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Seeding Northwatch catalog data...");

  for (const item of CATALOG_DATA) {
    // Check if product already exists
    const [existing] = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.referenceCode, item.referenceCode))
      .limit(1);

    let productId: string;

    if (existing) {
      console.log(`  Updating existing product: ${item.title} (${item.referenceCode})`);
      productId = existing.id;
      await db
        .update(products)
        .set({
          title: item.title,
          slug: item.slug,
          description: item.description,
          caseDiameter: item.caseDiameter,
          movement: item.movement,
          waterResistance: item.waterResistance,
          editorialQuote: item.editorialQuote,
          quoteAuthor: item.quoteAuthor,
          specs: item.specs,
          featured: item.featured,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));
    } else {
      console.log(`  Inserting new product: ${item.title} (${item.referenceCode})`);
      const [inserted] = await db
        .insert(products)
        .values({
          title: item.title,
          slug: item.slug,
          referenceCode: item.referenceCode,
          description: item.description,
          caseDiameter: item.caseDiameter,
          movement: item.movement,
          waterResistance: item.waterResistance,
          editorialQuote: item.editorialQuote,
          quoteAuthor: item.quoteAuthor,
          specs: item.specs,
          featured: item.featured,
        })
        .returning({ id: products.id });
      productId = inserted.id;
    }

    // Process variants for this product
    for (const v of item.variants) {
      const [existingVariant] = await db
        .select({ id: productVariants.id })
        .from(productVariants)
        .where(eq(productVariants.sku, v.sku))
        .limit(1);

      if (existingVariant) {
        console.log(`    Updating variant: ${v.name} (${v.sku})`);
        await db
          .update(productVariants)
          .set({
            productId,
            name: v.name,
            dialColor: v.dialColor,
            strapMaterial: v.strapMaterial,
            caseFinish: v.caseFinish,
            priceCents: v.priceCents,
            stock: v.stock,
            images: v.images,
            updatedAt: new Date(),
          })
          .where(eq(productVariants.id, existingVariant.id));
      } else {
        console.log(`    Inserting variant: ${v.name} (${v.sku})`);
        await db.insert(productVariants).values({
          productId,
          sku: v.sku,
          name: v.name,
          dialColor: v.dialColor,
          strapMaterial: v.strapMaterial,
          caseFinish: v.caseFinish,
          priceCents: v.priceCents,
          stock: v.stock,
          images: v.images,
        });
      }
    }
  }

  console.log("✅ Seed completed successfully!");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
