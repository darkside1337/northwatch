"use client";

import * as React from "react";
import { FIELD_NOTES } from "../data";

export function JournalMonographLibrary() {
  const [downloadedNote, setDownloadedNote] = React.useState<string | null>(
    null
  );

  const handleAction = (noteCode: string) => {
    setDownloadedNote(noteCode);
    setTimeout(() => {
      setDownloadedNote(null);
    }, 3000);
  };

  return (
    <section className="w-full bg-surface-container-low border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-olive inline-block" />
              <span className="font-mono text-xs uppercase tracking-widest text-accent-olive font-semibold">
                INDEXED ARCHIVES
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-on-surface mb-3">
              Field Notes &amp; Monograph Library
            </h2>
            <p className="font-sans text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Unpublished laboratory protocols, material certifications, testing
              logs, and CAD tolerances released directly for collector and
              horological study.
            </p>
            <div className="mt-6 p-4 bg-surface border border-outline">
              <span className="font-mono text-[10px] text-on-surface-variant block uppercase mb-1">
                ARCHIVE INTEGRITY CHECKSUM
              </span>
              <span className="font-mono text-xs text-on-surface font-semibold tracking-wider">
                SHA-256 // 7F4C82E09B1A
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="border border-outline bg-surface divide-y divide-outline">
              {/* Table Header */}
              <div className="p-3 sm:p-4 grid grid-cols-12 gap-4 bg-surface-container font-sans text-xs uppercase text-on-surface-variant tracking-wider">
                <span className="col-span-3 sm:col-span-2">REF CODE</span>
                <span className="col-span-5 sm:col-span-6">
                  DOCUMENT &amp; TESTING SUBJECT
                </span>
                <span className="col-span-4 text-right">ACCESS</span>
              </div>

              {/* Rows */}
              {FIELD_NOTES.map((note) => (
                <div
                  key={note.id}
                  className="p-3 sm:p-4 grid grid-cols-12 gap-4 items-center hover:bg-surface-container-low transition-colors"
                >
                  <div className="col-span-3 sm:col-span-2">
                    <span className="font-mono text-xs text-accent-olive font-semibold block">
                      {note.noteCode}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant block">
                      {note.dateCode}
                    </span>
                  </div>

                  <div className="col-span-5 sm:col-span-6">
                    <h4 className="font-sans text-xs sm:text-sm font-semibold text-on-surface">
                      {note.title}
                    </h4>
                    <p className="font-sans text-xs text-on-surface-variant mt-0.5 line-clamp-2 sm:line-clamp-none">
                      {note.description}
                    </p>
                  </div>

                  <div className="col-span-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleAction(note.noteCode)}
                      className="inline-block border border-on-surface text-on-surface px-2.5 sm:px-3 py-1.5 font-sans text-[11px] sm:text-xs uppercase tracking-wider hover:bg-primary hover:text-on-primary transition-colors whitespace-nowrap"
                    >
                      {downloadedNote === note.noteCode
                        ? "Retrieved ✓"
                        : note.actionLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
