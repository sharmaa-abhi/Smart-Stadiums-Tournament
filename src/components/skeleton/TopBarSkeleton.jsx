import Skeleton from './Skeleton';

export default function TopBarSkeleton({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3 bg-surface-950/70 backdrop-blur-xl border-b border-white/[0.06] min-h-[57px]">
      <div className="space-y-1.5 min-w-0">
        {title ? (
          <h1 className="text-lg font-bold font-display text-white tracking-tight truncate">{title}</h1>
        ) : (
          <Skeleton className="h-4 w-36" rounded="rounded-md" />
        )}
        {subtitle !== undefined ? (
          subtitle && <p className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</p>
        ) : (
          <Skeleton className="h-2.5 w-48" rounded="rounded-md" />
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Skeleton className="w-64 h-8 rounded-xl hidden md:block" />
        <Skeleton className="w-24 h-8 rounded-lg hidden lg:block" />
        <Skeleton className="w-24 h-8 rounded-lg hidden lg:block" />
        <Skeleton className="w-24 h-8 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-xl" />
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right space-y-1">
            <Skeleton className="h-3 w-28 ml-auto" rounded="rounded-md" />
            <Skeleton className="h-2.5 w-16 ml-auto" rounded="rounded-md" />
          </div>
          <Skeleton className="w-8 h-8 rounded-xl" />
        </div>
      </div>
    </header>
  );
}
