import Skeleton from './Skeleton';

export default function ChartSkeleton({ className = '', height = 'h-80' }) {
  return (
    <div className={`glass-card rounded-2xl p-5 flex flex-col ${height} ${className}`}>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" rounded="rounded-md" />
        <Skeleton className="h-3 w-60 max-w-full" rounded="rounded-md" />
      </div>
      <div className="flex-1 flex items-end gap-2 sm:gap-3 mt-6 mb-2 min-h-0">
        <Skeleton className="h-[20%] flex-1 rounded-lg" rounded="rounded-lg" />
        <Skeleton className="h-[50%] flex-1 rounded-lg" rounded="rounded-lg" />
        <Skeleton className="h-[35%] flex-1 rounded-lg" rounded="rounded-lg" />
        <Skeleton className="h-[75%] flex-1 rounded-lg hidden sm:block" rounded="rounded-lg" />
        <Skeleton className="h-[60%] flex-1 rounded-lg hidden sm:block" rounded="rounded-lg" />
        <Skeleton className="h-[90%] flex-1 rounded-lg hidden md:block" rounded="rounded-lg" />
      </div>
      <div className="flex justify-between mt-2 pt-2 border-t border-white/[0.04]">
        <Skeleton className="h-3 w-10" rounded="rounded-md" />
        <Skeleton className="h-3 w-10" rounded="rounded-md" />
        <Skeleton className="h-3 w-10" rounded="rounded-md" />
        <Skeleton className="h-3 w-10 hidden sm:block" rounded="rounded-md" />
      </div>
    </div>
  );
}
