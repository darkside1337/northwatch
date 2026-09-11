const ATELIER_STANDARDS = [
  { step: "01", label: "Swiss Mechanical" },
  { step: "02", label: "316L Billet Steel" },
  { step: "03", label: "Mohs 9 Sapphire" },
  { step: "04", label: "10 ATM Tested" },
] as const;

export function AtelierStandardsRail() {
  return (
    <section className="w-full bg-surface py-10 border-b border-outline">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
          {ATELIER_STANDARDS.map((standard) => (
            <div key={standard.step} className="flex items-center gap-3">
              <span className="text-accent font-bold">{standard.step}</span>
              <span>{standard.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
