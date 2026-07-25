import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import RoleGuard from './components/RoleGuard';
import PWAInstallBanner from './components/PWAInstallBanner';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import NotificationToast from './components/NotificationToast';
import ErrorBoundary from './components/ErrorBoundary';
import { StadiumBackdrop } from './components/StadiumBackdrop';
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
const NotFound = lazy(() => import('./pages/NotFound'));

import BottomNav from './components/BottomNav';

function AppLayout({ children }) {
  const { sidebarCollapsed, user } = useAuth();
  const currentRole = user?.role || 'operator';
  return (
    <div className="flex min-h-screen bg-surface-950 stadium-grid relative overflow-x-hidden">
      <StadiumBackdrop role={currentRole} />
      <Sidebar />
      <NotificationToast />
      <main className={`flex-1 min-w-0 transition-all duration-300 ease-in-out relative z-[1] pb-20 md:pb-6 ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[260px]'}`}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function Page({ roles = [], children }) {
  return (
    <AppLayout>
      <ErrorBoundary>
        <Suspense fallback={<RouteFallbackSkeleton />}>
          {roles.length > 0 ? <RoleGuard roles={roles}>{children}</RoleGuard> : children}
        </Suspense>
      </ErrorBoundary>
    </AppLayout>
  );
}

// ── Auth0 Gate — the ONLY entry point ──
// If Auth0 says not authenticated → show Login/Register pages
// If Auth0 says authenticated → show the full app
function Auth0Gate() {
  const {
    isLoading,
    isAuthenticated,
    error,
    loginWithRedirect: login,
    logout: auth0Logout,
    user,
  } = useAuth0();

  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  // Auth0 SDK is still loading — show skeleton
  if (isLoading) {
    return <AuthPageSkeleton />;
  }

  // Authenticated via Auth0 → show full app with all routes
  if (isAuthenticated) {
    return (
      <AuthProvider>
        <NotificationProvider>
          <ScrollToTop />
          <PWAInstallBanner />
          <ErrorBoundary>
            <Suspense fallback={<RouteFallbackSkeleton />}>
              <Routes>
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

                {/* Redirect /login and /register to home since user is already authenticated */}
                <Route path="/login" element={<Page><Dashboard /></Page>} />
                <Route path="/register" element={<Page><Dashboard /></Page>} />

                {/* 404 — catch all unmatched routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    );
  }

  // NOT authenticated → show ONLY Login/Register pages
  return (
    <AuthProvider>
      <ErrorBoundary>
        <Suspense fallback={<AuthPageSkeleton />}>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </AuthProvider>
  );
}

export default function App() {
  return <Auth0Gate />;
}
