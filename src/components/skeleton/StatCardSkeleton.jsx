import Skeleton from './Skeleton';

export default function StatCardSkeleton({ className = '' }) {
  return (
    <div className={`glass-card rounded-2xl p-5 relative overflow-hidden flex items-start justify-between min-h-[108px] ${className}`}>
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-24" rounded="rounded-md" />
        <Skeleton className="h-7 w-20 mt-2" rounded="rounded-md" />
        <Skeleton className="h-3 w-28" rounded="rounded-md" />
      </div>
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
    </div>
  );
}
