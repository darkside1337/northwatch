import { cn } from "cn";

interface ProductGridSkeletonProps {
  count?: number;
  className?: string;
}

export function ProductGridSkeleton({
  count = 4,
  className,
}: ProductGridSkeletonProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
        className
      )}
      aria-label="Loading catalog items..."
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-surface-container-lowest border border-outline animate-pulse"
        >
          {/* Visual Stage Skeleton (4:5 Aspect Ratio) */}
          <div className="relative aspect-[4/5] w-full bg-surface-container-low border-b border-outline-variant p-6 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-surface-container/60 rounded-none" />
            <div className="absolute top-3 left-3 w-16 h-4 bg-surface-container rounded-none" />
          </div>

          {/* Metadata Skeleton */}
          <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="h-5 w-3/5 bg-surface-container rounded-none" />
                <div className="h-4 w-12 bg-surface-container rounded-none" />
              </div>
              <div className="h-3 w-4/5 bg-surface-container/60 rounded-none" />
            </div>

            {/* Footer Line */}
            <div className="pt-3 border-t border-outline-variant flex items-center justify-between">
              <div className="h-3 w-16 bg-surface-container rounded-none" />
              <div className="h-3 w-12 bg-surface-container rounded-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
