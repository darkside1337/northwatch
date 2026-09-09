import { cn } from "cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  badge?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  badge,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-end justify-between mb-10 pb-6 border-b border-outline-variant gap-4",
        className
      )}
    >
      <div className="max-w-xl">
        {eyebrow && (
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent font-medium block mb-2">
            {eyebrow}
          </span>
        )}
        <h2 className="font-serif text-3xl sm:text-4xl text-on-surface tracking-tight font-normal uppercase">
          {title}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center md:justify-end gap-3">
        {description && (
          <p className="font-sans text-sm text-on-surface-variant max-w-sm leading-relaxed">
            {description}
          </p>
        )}
        {badge && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface bg-surface-container-low px-2.5 py-1 border border-outline-variant shrink-0 self-start sm:self-auto">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
