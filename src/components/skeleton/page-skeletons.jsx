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
import ChartSkeleton from './ChartSkeleton';
import TopBarSkeleton from './TopBarSkeleton';
import SidebarSkeleton from './SidebarSkeleton';
import StatCardSkeleton from './StatCardSkeleton';

export function DashboardSkeleton({ title = 'Command Center', subtitle = 'Real-time stadium operations & system monitoring' }) {
  return (
    <PageShell title={title} subtitle={subtitle}>
      <BannerSkeleton />
      <StatCardsSkeleton />
      <ChartGridSkeleton wideSpan={2} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-72" />
      </div>
    </PageShell>
  );
}

export function CrowdManagementSkeleton() {
  return (
    <PageShell title="Crowd & Resource Management" subtitle="Predictive analytics & real-time flow optimization">
      <StatCardsSkeleton />
      <ChartGridSkeleton wideSpan={2} height="h-[380px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-72" />
      </div>
    </PageShell>
  );
}

export function ConcessionsSkeleton() {
  return (
    <PageShell title="Concessions & Retail Control" subtitle="Real-time sales tracking & queue intelligence">
      <StatCardsSkeleton />
      <ChartGridSkeleton wideSpan={2} height="h-[360px]" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-[340px]" />
        <ChartSkeleton height="h-[340px]" />
      </div>
    </PageShell>
  );
}

export function AnalyticsSkeleton() {
  return (
    <PageShell title="Post-Match Analytics" subtitle="Tournament-wide performance metrics & continuous improvement insights">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Skeleton className="h-9 w-full sm:w-80 max-w-full" rounded="rounded-lg" />
        <Skeleton className="h-9 w-36 flex-shrink-0" rounded="rounded-lg" />
      </div>
      <StatCardsSkeleton count={6} cols="grid-cols-2 md:grid-cols-3 lg:grid-cols-6" />
      <ChartGridSkeleton wideSpan={2} height="h-80" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height="h-72" />
        <ChartSkeleton height="h-72" />
      </div>
    </PageShell>
  );
}

export function SecuritySkeleton() {
  return (
    <PageShell title="Security & Safety Orchestration" subtitle="Real-time anomaly detection, incident management & access control">
      <StatCardsSkeleton />
      <TabsSkeleton count={4} />
      <ChartGridSkeleton wideSpan={2} height="h-96" />
      <TableRowsSkeleton rows={5} />
    </PageShell>
  );
}

export function BroadcastSkeleton() {
  return (
    <PageShell title="Broadcast & Fan Engagement" subtitle="AI-enhanced production, real-time overlays & immersive fan experiences">
      <StatCardsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SkeletonCard className="lg:col-span-2 aspect-video overflow-hidden">
          <Skeleton className="w-full h-full rounded-2xl" rounded="rounded-2xl" />
        </SkeletonCard>
        <div className="space-y-4">
          <SkeletonCard className="h-40 p-4">
            <Skeleton className="h-4 w-32 mb-3" rounded="rounded-md" />
            <Skeleton className="h-24 w-full" rounded="rounded-xl" />
          </SkeletonCard>
          <SkeletonCard className="h-40 p-4">
            <Skeleton className="h-4 w-28 mb-3" rounded="rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" rounded="rounded-lg" />
              <Skeleton className="h-8 w-full" rounded="rounded-lg" />
            </div>
          </SkeletonCard>
          <ListItemsSkeleton rows={3} />
        </div>
      </div>
    </PageShell>
  );
}

export function AdminPanelSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-52" rounded="rounded-md" />
            <Skeleton className="h-3 w-64" rounded="rounded-md" />
          </div>
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SkeletonCard className="xl:col-span-2 p-5 space-y-4">
          <Skeleton className="h-5 w-24" rounded="rounded-md" />
          <div className="flex flex-col sm:flex-row gap-3">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-full sm:w-32 rounded-xl" />
          </div>
          <TableRowsSkeleton rows={5} />
        </SkeletonCard>
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-5 w-32" rounded="rounded-md" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-3 w-24" rounded="rounded-md" />
              <Skeleton className="h-3 w-16" rounded="rounded-md" />
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
        <Skeleton className="h-4 w-44 mb-4" rounded="rounded-md" />
        <CardGridSkeleton count={3} />
      </SkeletonCard>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-4 w-32" rounded="rounded-md" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" rounded="rounded-md" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </SkeletonCard>
        <SkeletonCard className="p-5 space-y-4">
          <Skeleton className="h-4 w-36" rounded="rounded-md" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-24" rounded="rounded-md" />
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
      <div className="flex flex-col lg:flex-row gap-6 -mt-0 max-h-[calc(100vh-57px)]">
        <SkeletonCard className="flex-1 flex flex-col overflow-hidden min-h-[480px]">
          <div className="px-5 py-3 border-b border-white/[0.06] flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-32" rounded="rounded-md" />
              <Skeleton className="h-3 w-56 max-w-full" rounded="rounded-md" />
            </div>
          </div>
          <div className="flex-1 p-5 space-y-4">
            <div className="flex gap-3">
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
              <Skeleton className="h-20 flex-1 rounded-2xl" rounded="rounded-2xl" />
            </div>
            <div className="flex gap-3 justify-end">
              <Skeleton className="h-12 w-2/3 max-w-sm rounded-2xl" rounded="rounded-2xl" />
              <Skeleton className="w-7 h-7 rounded-lg flex-shrink-0" />
            </div>
          </div>
          <div className="p-4 border-t border-white/[0.06]">
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </SkeletonCard>
        <SkeletonCard className="w-full lg:w-72 p-4 space-y-3 flex-shrink-0">
          <Skeleton className="h-4 w-28" rounded="rounded-md" />
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
      <SkeletonCard className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
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
        <SkeletonCard className="lg:col-span-3 h-[480px] overflow-hidden">
          <Skeleton className="w-full h-full" rounded="rounded-2xl" />
        </SkeletonCard>
        <div className="space-y-4">
          <SkeletonCard className="h-48 p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-20" rounded="rounded-md" />
                <Skeleton className="h-3 w-12" rounded="rounded-md" />
              </div>
            ))}
          </SkeletonCard>
          <SkeletonCard className="h-48 p-4">
            <Skeleton className="h-4 w-24 mb-3" rounded="rounded-md" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full mb-2 rounded-xl" />
            ))}
          </SkeletonCard>
        </div>
      </div>
    </PageShell>
  );
}

export function FanPortalSkeleton() {
  return (
    <div className="min-h-screen bg-surface-950 max-w-sm mx-auto">
      <div className="flex items-center justify-between px-6 pt-4 pb-2">
        <Skeleton className="h-4 w-16" rounded="rounded-md" />
        <Skeleton className="h-3 w-28" rounded="rounded-md" />
        <Skeleton className="h-4 w-8" rounded="rounded-md" />
      </div>
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-24" rounded="rounded-md" />
            <Skeleton className="h-3 w-32" rounded="rounded-md" />
          </div>
        </div>
        <Skeleton className="w-10 h-10 rounded-xl" />
      </div>
      <div className="flex gap-2 px-6 mb-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-16 rounded-2xl" />
        ))}
      </div>
      <div className="px-6 space-y-4 pb-24">
        <SkeletonCard className="h-48 rounded-3xl overflow-hidden">
          <Skeleton className="w-full h-full" rounded="rounded-3xl" />
        </SkeletonCard>
        <SkeletonCard className="h-32 p-4 space-y-3">
          <Skeleton className="h-4 w-32" rounded="rounded-md" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </SkeletonCard>
        <SkeletonCard className="h-40 p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </SkeletonCard>
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 stadium-grid p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="w-16 h-16 mx-auto rounded-2xl" />
          <Skeleton className="h-7 w-48 mx-auto" rounded="rounded-md" />
          <Skeleton className="h-4 w-56 mx-auto" rounded="rounded-md" />
        </div>
        <SkeletonCard className="p-8 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-3 w-16" rounded="rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20" rounded="rounded-md" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
          <Skeleton className="h-11 w-full rounded-xl" />
        </SkeletonCard>
      </div>
    </div>
  );
}

export function PageContentSkeleton({ title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBarSkeleton title={title} subtitle={subtitle} />
      <div className="p-6 space-y-6 flex-1">
        <StatCardsSkeleton />
        <ChartGridSkeleton wideSpan={2} />
      </div>
    </div>
  );
}

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-surface-950 stadium-grid">
      <SidebarSkeleton />
      <main className="flex-1 min-w-0 ml-[260px]">
        <PageContentSkeleton />
      </main>
    </div>
  );
}

export function RouteFallbackSkeleton() {
  return <PageContentSkeleton />;
}
