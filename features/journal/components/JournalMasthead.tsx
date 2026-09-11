"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { JOURNAL_CATEGORY_TABS } from "../data";
import type { JournalCategory } from "../types";

interface JournalMastheadProps {
  activeCategory: JournalCategory;
}

export function JournalMasthead({ activeCategory }: JournalMastheadProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSelectCategory = (category: JournalCategory) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  };

  return (
    <section className="w-full bg-surface border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12 md:pt-16 pb-8 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-accent-olive inline-block" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent-olive font-semibold">
                FIELD DISPATCHES &amp; HOROLOGICAL ESSAYS // VOL. IV — 2026
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-on-surface tracking-tight leading-tight">
              The Northwatch Journal
            </h1>
            <p className="font-sans text-base md:text-lg text-on-surface-variant mt-3 max-w-2xl leading-relaxed">
              Critical writings on chronometric discipline, Scandinavian
              architectural reduction, uncompromised metallurgy, and the silent
              philosophy of mechanical time.
            </p>
          </div>

          {/* Coordinates & Publication Stamp */}
          <div className="flex flex-col items-start md:items-end gap-1 text-left md:text-right pb-1">
            <span className="font-mono text-xs text-on-surface uppercase tracking-wider">
              STOCKHOLM 59.3293° N // GENEVA 46.2044° E
            </span>
            <span className="font-sans text-xs text-on-surface-variant uppercase tracking-wider">
              ISSUE 04 / EDITION ARCHIVE
            </span>
            <span className="font-mono text-[11px] text-accent-olive font-medium">
              INDEX SYSTEM NW-JRNL-2026.04
            </span>
          </div>
        </div>

        {/* Category Rail */}
        <div className="border-t border-outline pt-3">
          <nav
            aria-label="Journal category dispatches"
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar py-1"
          >
            {JOURNAL_CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.category;
              return (
                <button
                  key={tab.category}
                  type="button"
                  onClick={() => handleSelectCategory(tab.category)}
                  className={`flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider whitespace-nowrap pb-2 border-b-2 transition-colors ${
                    isActive
                      ? "text-on-surface font-semibold border-accent-olive"
                      : "text-on-surface-variant hover:text-on-surface border-transparent"
                  }`}
                >
                  <span>
                    {tab.label} [{tab.count.toString().padStart(2, "0")}]
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </section>
  );
}
