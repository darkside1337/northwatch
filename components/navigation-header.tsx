"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, User, Menu, X, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "cn";

interface NavigationHeaderProps {
  cartItemCount?: number;
  className?: string;
}

const NAV_LINKS = [
  { href: "/products", label: "Catalog" },
  { href: "/archive", label: "Archive" },
  { href: "/manufacture", label: "Manufacture" },
  { href: "/journal", label: "Journal" },
];

export function NavigationHeader({
  cartItemCount = 0,
  className,
}: NavigationHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

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
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

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
            className="flex items-center gap-1.5 text-on-surface hover:text-accent transition-colors p-1 select-none"
            aria-label={`Shopping Bag, ${cartItemCount} items`}
          >
            <span className="font-mono text-xs uppercase tracking-[0.1em] font-medium">
              Bag [{cartItemCount}]
            </span>
          </button>

          {/* Mobile Hamburger Trigger */}
          <div className="flex md:hidden items-center ml-1">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                aria-label="Open Navigation Menu"
                className="p-1.5 text-on-surface hover:text-accent transition-colors"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </SheetTrigger>

              <SheetContent
                side="right"
                showCloseButton={false}
                className="w-full max-w-[390px] p-0 flex flex-col justify-between bg-surface border-l border-outline"
              >
                {/* Mobile Drawer Top Bar */}
                <div>
                  <div className="h-16 px-6 flex items-center justify-between border-b border-outline">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif tracking-[0.24em] text-lg font-medium uppercase text-on-surface">
                        Northwatch
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
                    </div>
                    <SheetClose className="w-8 h-8 flex items-center justify-center text-on-surface hover:text-accent transition-colors border border-transparent hover:border-outline">
                      <X className="w-4 h-4" strokeWidth={1.5} />
                      <span className="sr-only">Close Navigation</span>
                    </SheetClose>
                  </div>

                  {/* Drawer Content */}
                  <div className="p-6 space-y-8">
                    {/* Quick Search Section */}
                    <form onSubmit={handleSearchSubmit} className="space-y-2">
                      <label
                        htmlFor="mobile-search-input"
                        className="block font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface-variant"
                      >
                        Search Collection
                      </label>
                      <div className="relative flex items-center border-b border-on-surface pb-2 focus-within:border-accent transition-colors">
                        <Search
                          className="w-4 h-4 text-on-surface-variant mr-3 shrink-0"
                          strokeWidth={1.5}
                        />
                        <input
                          id="mobile-search-input"
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Reference, caliber, or dial..."
                          className="w-full bg-transparent font-serif italic text-base text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none"
                        />
                      </div>
                    </form>

                    {/* Primary Links */}
                    <nav
                      aria-label="Mobile Navigation"
                      className="space-y-1 pt-2"
                    >
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">
                        Manifest &amp; Index
                      </p>

                      {NAV_LINKS.map((link, idx) => {
                        const indexFormatted = String(idx + 1).padStart(2, "0");
                        const isActive = pathname.startsWith(link.href);

                        return (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "group flex items-baseline justify-between py-3.5 border-b border-outline-variant transition-colors",
                              isActive
                                ? "border-on-surface text-on-surface"
                                : "hover:border-on-surface text-on-surface"
                            )}
                          >
                            <div className="flex items-baseline space-x-4">
                              <span className="font-mono text-[11px] text-on-surface-variant group-hover:text-accent transition-colors tracking-widest">
                                {indexFormatted}
                              </span>
                              <span className="font-serif text-[22px] font-normal tracking-[0.14em] uppercase group-hover:translate-x-1 transition-transform inline-block">
                                {link.label}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                          </Link>
                        );
                      })}

                      {/* Account Link in Drawer */}
                      <Link
                        href="/account/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="group flex items-baseline justify-between py-3.5 border-b border-outline transition-colors text-on-surface hover:border-on-surface"
                      >
                        <div className="flex items-baseline space-x-4">
                          <span className="font-mono text-[11px] text-on-surface-variant group-hover:text-accent transition-colors tracking-widest">
                            05
                          </span>
                          <span className="font-serif text-[22px] font-normal tracking-[0.14em] uppercase group-hover:translate-x-1 transition-transform inline-block">
                            Account
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-on-surface-variant group-hover:text-on-surface transition-colors" />
                      </Link>
                    </nav>
                  </div>
                </div>

                {/* Mobile Drawer Bottom Metadata */}
                <div className="p-6 border-t border-outline bg-surface-container-low/50">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Northwatch Atelier · Stockholm / Geneva
                  </p>
                  <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant/70 mt-1">
                    Lat 59.3293° N · Long 18.0686° E
                  </p>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
