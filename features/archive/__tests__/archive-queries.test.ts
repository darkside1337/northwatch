import { describe, it, expect } from "vitest";
import { getArchiveSpecimens } from "../queries";
import { archiveFilterSchema } from "../schemas";

describe("Archive Queries and Filtering", () => {
  it("returns all 12 specimens when no filters are applied", () => {
    const specimens = getArchiveSpecimens();
    expect(specimens).toHaveLength(12);
  });

  it("filters specimens by dial color category", () => {
    const slateSpecimens = getArchiveSpecimens({ dial: "slate" });
    expect(slateSpecimens.length).toBeGreaterThan(0);
    slateSpecimens.forEach((specimen) => {
      expect(specimen.dialColorCategory).toBe("slate");
    });

    const arcticSpecimens = getArchiveSpecimens({ dial: "arctic" });
    expect(arcticSpecimens.length).toBeGreaterThan(0);
    arcticSpecimens.forEach((specimen) => {
      expect(specimen.dialColorCategory).toBe("arctic");
    });
  });

  it("filters specimens by case diameter", () => {
    const case38Specimens = getArchiveSpecimens({ caseSize: "38mm" });
    expect(case38Specimens.length).toBeGreaterThan(0);
    case38Specimens.forEach((specimen) => {
      expect(specimen.caseFilterCategory).toBe("38mm");
    });
  });

  it("filters specimens by movement category", () => {
    const handWound = getArchiveSpecimens({ movement: "hand-wound" });
    expect(handWound.length).toBeGreaterThan(0);
    handWound.forEach((specimen) => {
      expect(specimen.movementCategory).toBe("hand-wound");
    });
  });

  it("sorts specimens by price ascending and descending", () => {
    const asc = getArchiveSpecimens({ sort: "price-asc" });
    for (let i = 0; i < asc.length - 1; i++) {
      expect(asc[i].priceCents).toBeLessThanOrEqual(asc[i + 1].priceCents);
    }

    const desc = getArchiveSpecimens({ sort: "price-desc" });
    for (let i = 0; i < desc.length - 1; i++) {
      expect(desc[i].priceCents).toBeGreaterThanOrEqual(desc[i + 1].priceCents);
    }
  });

  it("gracefully catches invalid filter input via Zod schema", () => {
    const parsed = archiveFilterSchema.parse({
      dial: "non-existent-color",
      caseSize: "99mm",
      sort: "unsupported-sort",
    });

    expect(parsed.dial).toBe("all");
    expect(parsed.caseSize).toBe("all");
    expect(parsed.sort).toBe("featured");
  });
});
