export const MOVEMENT_OPTIONS = [
  { label: "All Movements", value: "" },
  { label: "Automatic", value: "Automatic" },
  { label: "Manual Wind", value: "Manual" },
] as const;

export const STRAP_OPTIONS = [
  { label: "All Straps", value: "" },
  { label: "Olive Canvas", value: "Olive Canvas" },
  { label: "Horween Calfskin", value: "Horween Calfskin" },
  { label: "Milanese Mesh", value: "Milanese Mesh" },
  { label: "Bridle Leather", value: "Bridle Leather" },
  { label: "Shell Cordovan", value: "Shell Cordovan" },
  { label: "FKM Rubber", value: "FKM Rubber" },
  { label: "Titanium Bracelet", value: "Titanium Bracelet" },
] as const;

export const DIAMETER_OPTIONS = [
  { label: "All Diameters", value: "" },
  { label: "37mm", value: "37mm" },
  { label: "38mm", value: "38mm" },
  { label: "39mm", value: "39mm" },
  { label: "40mm", value: "40mm" },
  { label: "41mm", value: "41mm" },
] as const;

export const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Newest Arrivals", value: "newest" },
] as const;
