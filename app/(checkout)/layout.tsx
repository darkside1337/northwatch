import type { Metadata } from "next";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { CartProvider } from "@/features/cart";

export const metadata: Metadata = {
  title: "Secure Vault Checkout — Northwatch",
  description: "Direct encrypted checkout with insured courier dispatch from our Geneva atelier.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-surface text-on-surface selection:bg-surface-container">
        {/* Minimalist Distraction-Free Header */}
        <header className="w-full bg-surface border-b border-outline-variant/60 sticky top-0 z-30 backdrop-blur-xs">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between">
            {/* Wordmark */}
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-85"
            >
              <span className="font-serif text-xl sm:text-2xl font-medium tracking-[0.24em] text-foreground uppercase">
                NORTHWATCH
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            </Link>

            {/* 256-Bit Vault Badge */}
            <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-on-surface-variant border border-outline-variant/60 px-2.5 sm:px-3 py-1.5 bg-surface-container-lowest">
              <Lock className="w-3.5 h-3.5 text-secondary" />
              <span className="font-medium text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-foreground">
                256-BIT ENCRYPTED VAULT
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-12 flex-1 flex flex-col">
          {/* Breadcrumb / Back Link */}
          <div className="mb-6 sm:mb-8 flex items-center justify-between">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-xs text-on-surface-variant hover:text-foreground transition-colors uppercase tracking-[0.12em] font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Selection</span>
            </Link>
            <span className="text-[11px] font-mono text-on-surface-variant/70 uppercase">
              Atelier Dispatch Protocol
            </span>
          </div>

          {children}
        </div>

        {/* Minimal Hairline Footer */}
        <footer className="w-full border-t border-outline-variant/40 py-6 bg-surface-container-low/50 mt-auto">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-on-surface-variant">
            <p>© 2026 Northwatch Horology. All timepieces dispatched in tamper-evident sealed casing.</p>
            <div className="flex items-center gap-6 tracking-widest uppercase">
              <span>Transit Insurance</span>
              <span>•</span>
              <span>Encrypted Checkout</span>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
