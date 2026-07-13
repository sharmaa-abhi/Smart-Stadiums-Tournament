import Skeleton from './Skeleton';
import AvatarSkeleton from './AvatarSkeleton';

export default function SidebarSkeleton({ collapsed = false }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-50 flex flex-col flex-shrink-0
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
        bg-surface-950/80 backdrop-blur-xl border-r border-white/[0.06]`}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
        {!collapsed && (
          <div className="space-y-1.5 flex-1 overflow-hidden">
            <Skeleton className="h-4 w-28" rounded="rounded-md" />
            <Skeleton className="h-4 w-20" rounded="rounded-md" />
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-0.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${collapsed ? 'justify-center' : ''}`}
          >
            <Skeleton className="w-[18px] h-[18px] rounded-md flex-shrink-0" />
            {!collapsed && (
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-24" rounded="rounded-md" />
                <Skeleton className="h-2.5 w-32" rounded="rounded-md" />
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className={`flex items-center gap-3 p-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          <AvatarSkeleton size="w-9 h-9" className="rounded-xl" />
          {!collapsed && (
            <div className="space-y-1.5 flex-1 min-w-0">
              <Skeleton className="h-3 w-24" rounded="rounded-md" />
              <Skeleton className="h-2.5 w-16" rounded="rounded-md" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
