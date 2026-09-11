export type DialFilter = "all" | "slate" | "arctic" | "forest";
export type CaseFilter = "all" | "38mm" | "39mm" | "40mm";
export type MovementFilter = "all" | "automatic" | "hand-wound";
export type MaterialFilter = "all" | "steel" | "dlc" | "monolithic";
export type ArchiveSortOrder =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "dia-asc"
  | "cal";

export interface ArchiveSpecimen {
  id: string;
  refCode: string;
  indexNumber: string;
  title: string;
  diameter: "38mm" | "38.5mm" | "39mm" | "40mm";
  caseFilterCategory: "38mm" | "39mm" | "40mm";
  movementName: string;
  movementCategory: "automatic" | "hand-wound";
  dialColorCategory: "slate" | "arctic" | "forest";
  materialCategory: "steel" | "dlc" | "monolithic";
  specsSummary: string;
  priceCents: number;
  inStock: boolean;
  isLimitedRun?: boolean;
  image: string;
  altText: string;
  productSlug?: string;
}

export interface ArchiveFilterParams {
  dial?: string;
  caseSize?: string;
  movement?: string;
  material?: string;
  sort?: string;
  page?: string;
}

export interface ArchiveFilterState {
  dial: DialFilter;
  caseSize: CaseFilter;
  movement: MovementFilter;
  material: MaterialFilter;
  sort: ArchiveSortOrder;
  page: number;
}
