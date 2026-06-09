export function Skeleton({ width = 'w-full', height = 'h-4', className = '' }) {
  return (
    <div
      className={`${width} ${height} bg-cream-200 rounded-lg animate-pulse ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-card space-y-3">
      <Skeleton height="h-6" width="w-2/3" />
      <Skeleton height="h-4" width="w-full" />
      <Skeleton height="h-4" width="w-4/5" />
    </div>
  );
}
