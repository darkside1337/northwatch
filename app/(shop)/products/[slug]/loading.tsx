export default function ProductDetailLoading() {
  return (
    <div className="w-full pb-24 md:pb-32 animate-pulse">
      {/* 1. Breadcrumbs Skeleton Bar */}
      <div className="border-b border-outline bg-surface px-6 md:px-12 py-3.5 flex items-center justify-between">
        <div className="h-3 w-48 bg-surface-container-low" />
        <div className="hidden sm:block h-3 w-40 bg-surface-container-low" />
      </div>

      <main className="max-w-7xl mx-auto px-6 md:px-12 pt-8 sm:pt-12">
        {/* 2. 55% Gallery / 45% Details Split Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Left Column: Gallery Skeleton */}
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/5] w-full bg-surface-container-low border border-outline p-6 flex items-center justify-center">
              <span className="absolute top-2 left-2.5 font-mono text-[11px] text-on-surface-variant/30">+</span>
              <span className="absolute top-2 right-2.5 font-mono text-[11px] text-on-surface-variant/30">+</span>
              <span className="absolute bottom-2 left-2.5 font-mono text-[11px] text-on-surface-variant/30">+</span>
              <span className="absolute bottom-2 right-2.5 font-mono text-[11px] text-on-surface-variant/30">+</span>
              <div className="w-48 h-48 rounded-full border border-outline/40" />
            </div>

            {/* Thumbnail Strip Skeleton */}
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] bg-surface-container-low border border-outline" />
              ))}
            </div>
          </div>

          {/* Right Column: Specification & Action Skeleton */}
          <div className="lg:col-span-5 space-y-6">
            <div className="h-3 w-36 bg-surface-container-low" />
            <div className="h-10 w-3/4 bg-surface-container-low" />
            <div className="flex justify-between items-baseline pt-2">
              <div className="h-8 w-28 bg-surface-container-low" />
              <div className="h-6 w-32 bg-surface-container-low" />
            </div>

            <div className="space-y-2 pt-4">
              <div className="h-3 w-full bg-surface-container-low" />
              <div className="h-3 w-5/6 bg-surface-container-low" />
              <div className="h-3 w-4/6 bg-surface-container-low" />
            </div>

            <div className="pt-6 space-y-4">
              <div className="h-4 w-24 bg-surface-container-low" />
              <div className="h-10 w-full bg-surface-container-low" />
            </div>

            <div className="pt-4 space-y-3">
              <div className="h-12 w-full bg-surface-container-low" />
              <div className="grid grid-cols-2 gap-3">
                <div className="h-10 bg-surface-container-low" />
                <div className="h-10 bg-surface-container-low" />
              </div>
            </div>

            <div className="border-t border-outline pt-6 space-y-3">
              <div className="h-8 w-full bg-surface-container-low" />
              <div className="h-8 w-full bg-surface-container-low" />
              <div className="h-8 w-full bg-surface-container-low" />
            </div>
          </div>
        </div>

        {/* 3. 6-Block Spec Matrix Skeleton */}
        <div className="mt-20 pt-12 border-t border-outline">
          <div className="h-6 w-48 bg-surface-container-low mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-outline border border-outline">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-surface-container-lowest p-6 h-48 space-y-3">
                <div className="h-4 w-32 bg-surface-container-low" />
                <div className="h-3 w-full bg-surface-container-low" />
                <div className="h-3 w-3/4 bg-surface-container-low" />
                <div className="h-3 w-5/6 bg-surface-container-low" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
