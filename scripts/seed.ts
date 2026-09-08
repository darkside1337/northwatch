import "dotenv/config";
import { pool, db } from "../lib/db/client";
import { products, productVariants } from "../lib/db/schema";
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
    movement: "Automatic 4Hz (NH35A Decorated)",
    waterResistance: "100m / 10 ATM",
    editorialQuote: "A pure instrument of timekeeping. Field-ready resilience without decorative pretense.",
    quoteAuthor: "Horological Review",
    featured: true,
    variants: [
      {
        sku: "NW-01-FLD-BLK-CAN",
        name: "Matte Black / Olive Canvas",
        dialColor: "Matte Black",
        strapMaterial: "Olive Canvas",
        caseFinish: "Brushed 316L Steel",
        priceCents: 38000,
        stock: 15,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200",
        ],
      },
      {
        sku: "NW-01-FLD-BLK-LEA",
        name: "Matte Black / Horween Calf",
        dialColor: "Matte Black",
        strapMaterial: "Horween Calfskin",
        caseFinish: "Brushed 316L Steel",
        priceCents: 41000,
        stock: 12,
        images: [
          "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&q=80&w=1200",
        ],
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
    variants: [
      {
        sku: "NW-02-CHR-WHT-MSH",
        name: "Arctic White / Milanese Mesh",
        dialColor: "Arctic White",
        strapMaterial: "Milanese Mesh",
        caseFinish: "Polished Steel",
        priceCents: 62000,
        stock: 8,
        images: [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
        ],
      },
      {
        sku: "NW-02-CHR-WHT-LEA",
        name: "Arctic White / Bridle Leather",
        dialColor: "Arctic White",
        strapMaterial: "Bridle Leather",
        caseFinish: "Polished Steel",
        priceCents: 65000,
        stock: 10,
        images: [
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1200",
        ],
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
    variants: [
      {
        sku: "NW-03-BAU-GRY-COR",
        name: "Slate Grey / Shell Cordovan",
        dialColor: "Slate Grey",
        strapMaterial: "Shell Cordovan",
        caseFinish: "Satin Steel",
        priceCents: 45000,
        stock: 14,
        images: [
          "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&q=80&w=1200",
        ],
      },
      {
        sku: "NW-03-BAU-IVR-COR",
        name: "Ivory / Shell Cordovan",
        dialColor: "Ivory",
        strapMaterial: "Shell Cordovan",
        caseFinish: "Satin Steel",
        priceCents: 45000,
        stock: 11,
        images: [
          "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&q=80&w=1200",
        ],
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
    variants: [
      {
        sku: "NW-04-DIV-NVY-RUB",
        name: "Deep Navy / FKM Rubber",
        dialColor: "Deep Navy",
        strapMaterial: "FKM Rubber",
        caseFinish: "Bead-Blasted Titanium",
        priceCents: 54000,
        stock: 18,
        images: [
          "https://images.unsplash.com/photo-1547996160-71dfa63582d8?auto=format&fit=crop&q=80&w=1200",
        ],
      },
      {
        sku: "NW-04-DIV-OBS-STL",
        name: "Obsidian / Engineered Bracelet",
        dialColor: "Obsidian",
        strapMaterial: "Titanium Bracelet",
        caseFinish: "Bead-Blasted Titanium",
        priceCents: 59000,
        stock: 7,
        images: [
          "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&q=80&w=1200",
        ],
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
    variants: [
      {
        sku: "NW-05-GMT-ANT-CAL",
        name: "Anthracite / Horween Calf",
        dialColor: "Anthracite",
        strapMaterial: "Horween Calfskin",
        caseFinish: "Brushed Steel",
        priceCents: 59000,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1517463700628-9d6e49226cf5?auto=format&fit=crop&q=80&w=1200",
        ],
      },
      {
        sku: "NW-05-GMT-ANT-STL",
        name: "Anthracite / Jubilee Steel",
        dialColor: "Anthracite",
        strapMaterial: "Steel Jubilee",
        caseFinish: "Brushed Steel",
        priceCents: 63000,
        stock: 6,
        images: [
          "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
        ],
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
