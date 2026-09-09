import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-outline text-on-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 pb-16 border-b border-outline-variant">
          {/* Brand & Provenance */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-2xl tracking-[0.24em] uppercase font-medium">
                  Northwatch
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
              </div>
              <p className="font-body-sm text-sm text-on-surface-variant max-w-sm leading-relaxed">
                Boutique mechanical timepieces designed under Scandinavian
                architectural reduction. Regulated to chronometer tolerances in
                Geneva.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                Manufacture Provenance
              </p>
              <p className="font-mono text-xs text-on-surface">
                Stockholm Atelier &amp; Geneva Assembly
              </p>
            </div>
          </div>

          {/* Directory Links */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Manifest */}
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant font-semibold">
                Collection
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/products"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Active Catalog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/archive"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Archive Vault
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manufacture"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Manufacture
                  </Link>
                </li>
                <li>
                  <Link
                    href="/journal"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Journal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Client Services */}
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant font-semibold">
                Services
              </p>
              <ul className="space-y-2.5">
                <li>
                  <Link
                    href="/account/orders"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Order History
                  </Link>
                </li>
                <li>
                  <Link
                    href="/account/orders"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Digital Certificate
                  </Link>
                </li>
                <li>
                  <Link
                    href="/manufacture"
                    className="font-sans text-xs uppercase tracking-[0.12em] text-on-surface hover:text-accent transition-colors"
                  >
                    Regulation Protocol
                  </Link>
                </li>
              </ul>
            </div>

            {/* Technical Specifications */}
            <div className="space-y-4 col-span-2 sm:col-span-1">
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-on-surface-variant font-semibold">
                Integrity
              </p>
              <div className="space-y-2 font-mono text-[10px] text-on-surface-variant leading-relaxed uppercase">
                <p>316L Surgical Steel</p>
                <p>Mohs 9 Sapphire</p>
                <p>10 ATM Pressure Tested</p>
                <p>28,800 VPH High-Beat</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Hairline Metadata */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-wider text-on-surface-variant">
          <p>© 2026 Northwatch Horology. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Lat 59.3293° N</span>
            <span>Long 18.0686° E</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
