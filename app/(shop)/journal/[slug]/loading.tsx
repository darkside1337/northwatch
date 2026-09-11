export default function JournalDetailLoading() {
  return (
    <div className="w-full bg-surface min-h-[600px] animate-pulse">
      <div className="border-b border-outline bg-surface">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="h-4 w-32 bg-surface-container" />
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 pt-16">
        <div className="h-4 w-48 bg-surface-container mb-4" />
        <div className="h-12 w-full max-w-xl bg-surface-container mb-6" />
        <div className="h-6 w-full bg-surface-container mb-8" />
        <div className="w-full aspect-[16/9] bg-surface-container mb-12" />
        <div className="space-y-4">
          <div className="h-4 w-full bg-surface-container" />
          <div className="h-4 w-5/6 bg-surface-container" />
          <div className="h-4 w-4/6 bg-surface-container" />
        </div>
      </div>
    </div>
  );
}
