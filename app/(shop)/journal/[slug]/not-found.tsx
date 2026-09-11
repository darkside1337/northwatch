import Link from "next/link";

export default function JournalNotFound() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
      <div className="border border-outline bg-surface-container-low p-10 sm:p-16 max-w-xl mx-auto">
        <span className="font-mono text-xs text-on-surface-variant block uppercase tracking-wider mb-2">
          JOURNAL ARCHIVE // 404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-surface font-normal mb-4">
          Dispatch Not Located
        </h1>
        <p className="font-sans text-sm text-on-surface-variant mb-8 leading-relaxed">
          The requested monograph, field note, or horological essay could not be
          found in the Northwatch archives.
        </p>
        <Link
          href="/journal"
          className="inline-block px-6 py-3 bg-primary text-on-primary font-sans text-xs uppercase tracking-wider hover:bg-primary-hover transition-colors"
        >
          Return to Journal Index
        </Link>
      </div>
    </div>
  );
}
