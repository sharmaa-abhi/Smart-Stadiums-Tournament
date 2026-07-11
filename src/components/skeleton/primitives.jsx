import TopBar from '../TopBar';
import Skeleton from './Skeleton';
import StatCardSkeleton from './StatCardSkeleton';
import ChartSkeleton from './ChartSkeleton';
import TableSkeleton from './TableSkeleton';

export function SkeletonCard({ className = '', children }) {
  return (
    <div className={`bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse ${className}`}>
      {children}
    </div>
  );
}

export function PageShell({ title, subtitle, children, className = '' }) {
  return (
    <div className={`min-h-screen ${className}`}>
      <TopBar title={title} subtitle={subtitle} />
      <div className="p-6 space-y-6">{children}</div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <SkeletonCard className="h-28 p-5 flex items-center justify-between">
      <div className="space-y-2.5 flex-1">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      <Skeleton className="w-48 h-10 rounded-xl flex-shrink-0 hidden md:block" />
    </SkeletonCard>
  );
}

export function StatCardsSkeleton({ count = 4, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4', height = 'h-20' }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} className={height} />
      ))}
    </div>
  );
}

export function ChartGridSkeleton({ wideSpan = 2 }) {
  const wideClass = wideSpan === 2 ? 'lg:col-span-2' : 'lg:col-span-1';
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <ChartSkeleton className={wideClass} height="h-96" />
      <ChartSkeleton height="h-96" />
    </div>
  );
}

export function TableRowsSkeleton({ rows = 4 }) {
  return (
    <TableSkeleton rows={rows} />
  );
}


export function ListItemsSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <Skeleton className="w-6 h-6 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TabsSkeleton({ count = 4 }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-28 rounded-xl flex-shrink-0" />
      ))}
    </div>
  );
}

export function CardGridSkeleton({ count = 3, cols = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' }) {
  return (
    <div className={`grid ${cols} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-16 p-3">
          <Skeleton className="h-4 w-24 mb-1.5" />
          <Skeleton className="h-3 w-32" />
        </SkeletonCard>
      ))}
    </div>
  );
}

export function SettingsSectionsSkeleton({ sections = 4 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: sections }).map((_, i) => (
        <SkeletonCard key={i} className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            ))}
          </div>
        </SkeletonCard>
      ))}
    </div>
  );
}
