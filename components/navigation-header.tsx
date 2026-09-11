"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User } from "lucide-react";
import { NavigationMobileMenu } from "./navigation-mobile-menu";
import { cn } from "cn";

export interface NavigationHeaderProps {
  cartItemCount?: number;
  onOpenCart?: () => void;
  className?: string;
}

const NAV_LINKS = [
  { href: "/products", label: "Catalog" },
  { href: "/archive", label: "Archive" },
  { href: "/manufacture", label: "Manufacture" },
  { href: "/journal", label: "Journal" },
] as const;

function NavigationHeaderFallback({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 w-full bg-surface border-b border-outline transition-colors",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-on-surface hover:opacity-90 transition-opacity"
            aria-label="Northwatch Homepage"
          >
            <span className="font-serif text-xl tracking-[0.28em] font-medium uppercase select-none">
              Northwatch
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-accent-olive" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavigationHeaderInner({
  cartItemCount = 0,
  onOpenCart,
  className,
}: NavigationHeaderProps) {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 w-full bg-surface border-b border-outline transition-colors",
        className
      )}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-12">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-on-surface hover:opacity-90 transition-opacity"
            aria-label="Northwatch Homepage"
          >
            <span className="font-serif text-xl tracking-[0.28em] font-medium uppercase select-none">
              Northwatch
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent inline-block mb-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Center: Desktop Navigation Manifest */}
        <nav
          className="hidden md:flex items-center gap-8 lg:gap-10"
          aria-label="Primary Navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-sans text-[13px] tracking-[0.14em] uppercase font-medium transition-colors relative py-1",
                  isActive
                    ? "text-on-surface border-b border-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Desktop & Mobile Utilities */}
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Search Trigger */}
          <Link
            href="/products"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            aria-label="Search Collection"
          >
            <Search className="w-4 h-4 text-on-surface" strokeWidth={1.5} />
          </Link>

          {/* Account */}
          <Link
            href="/account/orders"
            className="text-on-surface-variant hover:text-on-surface transition-colors p-1"
            aria-label="Customer Account"
          >
            <User className="w-4 h-4 text-on-surface" strokeWidth={1.5} />
          </Link>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex items-center gap-1.5 text-on-surface hover:text-accent transition-colors p-1 select-none focus:outline-none"
            aria-label={`Shopping Bag, ${cartItemCount} items`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.1em] font-medium tabular-nums">
              Bag [{cartItemCount}]
            </span>
          </button>

          {/* Mobile Navigation Sheet Drawer */}
          <NavigationMobileMenu
            navLinks={NAV_LINKS}
            pathname={pathname}
            displayCount={cartItemCount}
            onOpenCart={onOpenCart}
          />
        </div>
      </div>
    </header>
  );
}

export function NavigationHeader(props: NavigationHeaderProps) {
  return (
    <React.Suspense fallback={<NavigationHeaderFallback className={props.className} />}>
      <NavigationHeaderInner {...props} />
    </React.Suspense>
  );
}
