import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";

interface CatalogEmptyStateProps {
  query?: string;
  onReset?: () => void;
  className?: string;
}

export function CatalogEmptyState({
  query,
  onReset,
  className,
}: CatalogEmptyStateProps) {
  return (
    <div
      className={cn(
        "w-full bg-surface-container-lowest border border-outline p-10 sm:p-16 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      {/* Horology Status Microtag */}
      <div className="inline-flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 bg-accent rounded-none" aria-hidden="true" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent font-medium">
          Status // 0_Specimens_Located
        </span>
      </div>

      {/* Main Empty Headline */}
      <h3 className="font-serif text-2xl sm:text-3xl text-on-surface font-normal uppercase tracking-tight mb-4 max-w-lg">
        {query
          ? `No timepieces match “${query}”.`
          : "No timepieces match specified criteria."}
      </h3>

      {/* Narrative Guide */}
      <p className="font-sans text-sm text-on-surface-variant max-w-md leading-relaxed mb-8">
        We found no watches matching your active filter configuration. Adjust your
        movement, strap, or diameter parameters to browse the active manifest.
      </p>

      {/* Action to Clear Filters */}
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          Reset All Filters
        </button>
      ) : (
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          Reset All Filters
        </Link>
      )}
    </div>
  );
}
