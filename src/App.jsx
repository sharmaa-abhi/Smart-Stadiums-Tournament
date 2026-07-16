import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import PWAInstallBanner from './components/PWAInstallBanner';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import NotificationToast from './components/NotificationToast';
import { RouteFallbackSkeleton, AuthPageSkeleton, FanPortalSkeleton } from './components/skeleton';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const DigitalTwin = lazy(() => import('./pages/DigitalTwin'));
const CrowdManagement = lazy(() => import('./pages/CrowdManagement'));
const Security = lazy(() => import('./pages/Security'));
const Concessions = lazy(() => import('./pages/Concessions'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const Broadcast = lazy(() => import('./pages/Broadcast'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const FanPortal = lazy(() => import('./pages/FanPortal'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function AppLayout({ children }) {
  const { sidebarCollapsed } = useAuth();
  return (
    <div className="flex min-h-screen bg-surface-950 stadium-grid">
      <Sidebar />
      <NotificationToast />
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'}`}>
        {children}
      </main>
    </div>
  );
}

function Page({ roles = [], children }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<RouteFallbackSkeleton />}>
          {roles.length > 0 ? <RoleGuard roles={roles}>{children}</RoleGuard> : children}
        </Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ScrollToTop />
        <PWAInstallBanner />
        <Suspense fallback={<AuthPageSkeleton />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/fan" element={
              <Suspense fallback={<FanPortalSkeleton />}>
                <FanPortal />
              </Suspense>
            } />

            <Route path="/" element={<Page><Dashboard /></Page>} />
            <Route path="/assistant" element={<Page><AIAssistant /></Page>} />
            <Route path="/settings" element={<Page><Settings /></Page>} />

            <Route path="/digital-twin" element={<Page roles={['operator', 'manager', 'admin']}><DigitalTwin /></Page>} />
            <Route path="/crowd" element={<Page roles={['operator', 'manager', 'security', 'admin']}><CrowdManagement /></Page>} />
            <Route path="/concessions" element={<Page roles={['operator', 'manager', 'admin']}><Concessions /></Page>} />

            <Route path="/security" element={<Page roles={['security', 'admin']}><Security /></Page>} />

            <Route path="/analytics" element={<Page roles={['manager', 'admin']}><Analytics /></Page>} />
            <Route path="/broadcast" element={<Page roles={['manager', 'security', 'operator', 'admin']}><Broadcast /></Page>} />

            <Route path="/admin-panel" element={<Page roles={['admin']}><AdminPanel /></Page>} />

            {/* 404 — catch all unmatched routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </NotificationProvider>
    </AuthProvider>
  );
}
