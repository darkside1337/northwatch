import type { Metadata } from "next";
import { ManufactureView } from "@/features/manufacture";

export const metadata: Metadata = {
  title: "Manufacture & Provenance — Northwatch",
  description:
    "Engineered in Stockholm. Assembled in Geneva. Discover Northwatch metallurgy, Caliber NW-CAL.01 mechanical architecture, and Swiss chronometric metrology.",
};

export default function ManufacturePage() {
  return <ManufactureView />;
}
