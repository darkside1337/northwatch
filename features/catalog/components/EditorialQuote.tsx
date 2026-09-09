interface EditorialQuoteProps {
  quote?: string | null;
  author?: string | null;
}

export function EditorialQuote({ quote, author }: EditorialQuoteProps) {
  const displayQuote =
    quote || "A watch should not scream for attention. It should reward the closer glance.";
  const displayAuthor = author || "Henrik Lindqvist, Master Watchmaker";

  return (
    <section
      aria-label="Horological philosophy editorial quote"
      className="relative w-full border-y border-outline bg-surface-container-low/30 py-12 sm:py-16 px-6 sm:px-12 my-12 overflow-hidden"
    >
      {/* Corner crosshairs */}
      <span
        aria-hidden="true"
        className="absolute top-2 left-2.5 font-mono text-[11px] text-on-surface-variant/40 select-none pointer-events-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="absolute top-2 right-2.5 font-mono text-[11px] text-on-surface-variant/40 select-none pointer-events-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-2 left-2.5 font-mono text-[11px] text-on-surface-variant/40 select-none pointer-events-none"
      >
        +
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-2 right-2.5 font-mono text-[11px] text-on-surface-variant/40 select-none pointer-events-none"
      >
        +
      </span>

      <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center space-x-2 border border-outline bg-surface px-3 py-1 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-on-surface font-medium">
            HOROLOGY PHILOSOPHY // 01
          </span>
        </div>

        {/* Pull Quote */}
        <blockquote className="font-serif italic text-2xl sm:text-3xl md:text-[32px] font-light leading-[1.3] text-on-surface mb-6">
          &ldquo;{displayQuote}&rdquo;
        </blockquote>

        {/* Citation Attribution */}
        <div className="flex items-center space-x-3">
          <span className="w-6 h-px bg-accent-olive" />
          <cite className="not-italic font-mono text-[11px] tracking-[0.14em] uppercase text-on-surface-variant">
            {displayAuthor}
          </cite>
          <span className="w-6 h-px bg-accent-olive" />
        </div>
      </div>
    </section>
  );
}
