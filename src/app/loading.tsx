export default function Loading() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-8 bg-neutral-900 rounded w-1/4"></div>
      
      {/* Table/Card Skeleton */}
      <div className="border border-neutral-800 rounded-lg overflow-hidden">
        <div className="h-10 bg-neutral-900/50 border-b border-neutral-800"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 border-b border-neutral-800/50 flex items-center px-4 gap-4">
            <div className="w-8 h-4 bg-neutral-800 rounded"></div>
            <div className="w-32 h-4 bg-neutral-800 rounded"></div>
            <div className="flex-1"></div>
            <div className="w-12 h-4 bg-neutral-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}