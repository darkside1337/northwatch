import { ARCHIVE_SPECIMENS } from "./data";
import type { ArchiveFilterState, ArchiveSpecimen } from "./types";

export function getArchiveSpecimens(
  filters: Partial<ArchiveFilterState> = {}
): ArchiveSpecimen[] {
  const {
    dial = "all",
    caseSize = "all",
    movement = "all",
    material = "all",
    sort = "featured",
  } = filters;

  const filtered = ARCHIVE_SPECIMENS.filter((specimen) => {
    if (dial !== "all" && specimen.dialColorCategory !== dial) {
      return false;
    }
    if (caseSize !== "all" && specimen.caseFilterCategory !== caseSize) {
      return false;
    }
    if (movement !== "all" && specimen.movementCategory !== movement) {
      return false;
    }
    if (material !== "all" && specimen.materialCategory !== material) {
      return false;
    }
    return true;
  });

  return sortSpecimens(filtered, sort);
}

function sortSpecimens(
  specimens: ArchiveSpecimen[],
  sort: string
): ArchiveSpecimen[] {
  const cloned = [...specimens];

  switch (sort) {
    case "price-asc":
      return cloned.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return cloned.sort((a, b) => b.priceCents - a.priceCents);
    case "dia-asc":
      return cloned.sort((a, b) => parseFloat(a.diameter) - parseFloat(b.diameter));
    case "cal":
      return cloned.sort((a, b) =>
        a.movementName.localeCompare(b.movementName)
      );
    case "featured":
    default:
      return cloned;
  }
}
