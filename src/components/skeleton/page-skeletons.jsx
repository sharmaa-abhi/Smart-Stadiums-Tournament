import {
  PageShell,
  BannerSkeleton,
  StatCardsSkeleton,
  ChartGridSkeleton,
  TableRowsSkeleton,
  ListItemsSkeleton,
  TabsSkeleton,
  CardGridSkeleton,
  SettingsSectionsSkeleton,
  SkeletonCard,
} from './primitives';
import Skeleton from './Skeleton';

export function DashboardSkeleton({ title = 'Dashboard', subtitle = 'Loading...' }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <BannerSkeleton />
      <StatCardsSkeleton />
      <ChartGridSkeleton wideSpan={2} />
    </PageShell>
  );
}

export function StatsPageSkeleton({ title, subtitle }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <StatCardsSkeleton cols="grid-cols-2 md:grid-cols-4" height="h-24" />
      <ChartGridSkeleton wideSpan={2} />
    </PageShell>
  );
}

export function AnalyticsSkeleton() {
  return (
    <PageShell title="Post-Match Analytics" subtitle="Tournament-wide performance metrics & continuous improvement insights">
      <div className="flex items-center justify-between animate-pulse">
        <Skeleton className="h-9 w-80 rounded-lg" />
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>
      <StatCardsSkeleton count={6} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-6" height="h-24" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard className="h-80 p-5" />
        <SkeletonCard className="h-80 p-5" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2 h-72 p-5" />
        <SkeletonCard className="h-72 p-5" />
      </div>
    </PageShell>
  );
}

export function SecuritySkeleton() {
  return (
    <PageShell title="Security & Safety Orchestration" subtitle="Real-time anomaly detection, incident management & access control">
      <StatCardsSkeleton cols="grid-cols-2 md:grid-cols-4" height="h-24" />
      <TabsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2 h-96 p-5" />
        <div className="space-y-4">
          <SkeletonCard className="h-48 p-5" />
          <SkeletonCard className="h-48 p-5" />
        </div>
      </div>
      <TableRowsSkeleton rows={5} />
    </PageShell>
  );
}

export function BroadcastSkeleton() {
  return (
    <PageShell title="Broadcast & Fan Engagement" subtitle="AI-enhanced production, real-time overlays & immersive fan experiences">
      <StatCardsSkeleton cols="grid-cols-2 md:grid-cols-4" height="h-24" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2 aspect-video" />
        <div className="space-y-4">
          <SkeletonCard className="h-40 p-4" />
          <SkeletonCard className="h-40 p-4" />
          <ListItemsSkeleton rows={3} />
        </div>
      </div>
    </PageShell>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <StatCardsSkeleton cols="grid-cols-4" height="h-20" />
      <div className="grid grid-cols-3 gap-6">
        <SkeletonCard className="col-span-2 p-5 space-y-4">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <TableRowsSkeleton rows={5} />
        </SkeletonCard>
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </SkeletonCard>
      </div>
    </div>
  );
}

export function SettingsSkeleton() {
  return (
    <PageShell title="Settings" subtitle="Platform configuration & preferences">
      <SkeletonCard className="p-5">
        <Skeleton className="h-4 w-44 mb-4" />
        <CardGridSkeleton count={3} />
      </SkeletonCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </SkeletonCard>
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </SkeletonCard>
      </div>
      <SettingsSectionsSkeleton sections={4} />
    </PageShell>
  );
}

export function AIAssistantSkeleton() {
  return (
    <PageShell title="GenAI Operational Assistant" subtitle="Multimodal AI assistant for real-time operations" className="flex flex-col">
      <div className="flex-1 flex gap-6 max-h-[calc(100vh-64px)] -mt-0">
        <SkeletonCard className="flex-1 flex flex-col overflow-hidden">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <div className="flex-1 p-5 space-y-4">
            <div className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
              <Skeleton className="h-20 flex-1 rounded-2xl" />
            </div>
            <div className="flex gap-3 justify-end">
              <Skeleton className="h-12 w-2/3 rounded-2xl" />
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
            </div>
          </div>
          <div className="p-4 border-t border-white/[0.06]">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="w-72 p-4 space-y-3 hidden lg:block">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </SkeletonCard>
      </div>
    </PageShell>
  );
}

export function DigitalTwinSkeleton() {
  return (
    <PageShell title="Digital Twin" subtitle="Real-time virtual model — MetLife Stadium">
      <SkeletonCard className="p-4 flex items-center justify-between">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-32 rounded-xl" />
          ))}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-9 h-9 rounded-lg" />
          ))}
        </div>
      </SkeletonCard>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SkeletonCard className="lg:col-span-3 h-[480px]" />
        <div className="space-y-4">
          <SkeletonCard className="h-48 p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard className="h-48 p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-xl mb-2" />
            ))}
          </SkeletonCard>
        </div>
      </div>
    </PageShell>
  );
}

export function FanPortalSkeleton() {
  return (
    <div className="min-h-screen bg-surface-950 animate-pulse">
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-4 w-8" />
      </div>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <div className="flex gap-2 px-6 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-16 rounded-2xl" />
        ))}
      </div>
      <div className="px-6 space-y-4">
        <SkeletonCard className="h-48 rounded-3xl" />
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-40" />
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 stadium-grid p-4">
      <div className="w-full max-w-md space-y-8 animate-pulse">
        <div className="text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-2xl mx-auto" />
          <Skeleton className="h-7 w-48 mx-auto" />
          <Skeleton className="h-4 w-56 mx-auto" />
        </div>
        <SkeletonCard className="p-8 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </SkeletonCard>
      </div>
    </div>
  );
}

export function RouteFallbackSkeleton() {
  return (
    <div className="min-h-screen bg-surface-950 stadium-grid">
      <div className="p-6 space-y-6 animate-pulse">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <StatCardsSkeleton />
        <ChartGridSkeleton wideSpan={2} />
      </div>
    </div>
  );
}
