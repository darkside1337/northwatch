import type { Metadata } from "next";
import { CartReviewView } from "@/features/cart";

export const metadata: Metadata = {
  title: "Cart & Specification Review — Northwatch",
  description:
    "Review your selected horological references, movements, and order specifications before checkout.",
};

export default function CartPage() {
  return <CartReviewView />;
}
