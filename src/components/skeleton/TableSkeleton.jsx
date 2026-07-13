import Skeleton from './Skeleton';
import AvatarSkeleton from './AvatarSkeleton';

export default function TableSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.01] border border-white/[0.03]">
          <AvatarSkeleton size="w-8 h-8" className="rounded-xl" rounded="rounded-xl" />
          <div className="flex-1 space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-32 max-w-full" rounded="rounded-md" />
            <Skeleton className="h-3 w-48 max-w-full" rounded="rounded-md" />
          </div>
          <Skeleton className="w-20 h-6 flex-shrink-0 hidden sm:block" rounded="rounded-md" />
          <Skeleton className="w-8 h-8 flex-shrink-0" rounded="rounded-md" />
        </div>
      ))}
    </div>
  );
}
