import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import PWAInstallBanner from './components/PWAInstallBanner';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import DigitalTwin from './pages/DigitalTwin';
import CrowdManagement from './pages/CrowdManagement';
import Security from './pages/Security';
import Concessions from './pages/Concessions';
import AIAssistant from './pages/AIAssistant';
import Broadcast from './pages/Broadcast';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AdminPanel from './pages/AdminPanel';
import FanPortal from './pages/FanPortal';
import Login from './pages/Login';
import Register from './pages/Register';

function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-surface-950 stadium-grid">
      <Sidebar />
      <main className="flex-1 ml-[260px] min-w-0">
        {children}
      </main>
    </div>
  );
}

// Wrap with ProtectedRoute + AppLayout + optional RoleGuard
function Page({ roles = [], children }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        {roles.length > 0 ? <RoleGuard roles={roles}>{children}</RoleGuard> : children}
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <PWAInstallBanner />
      <Routes>
        {/* ── Public routes ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/fan" element={<FanPortal />} />

        {/* ── All roles ── */}
        <Route path="/" element={<Page><Dashboard /></Page>} />
        <Route path="/assistant" element={<Page><AIAssistant /></Page>} />
        <Route path="/settings" element={<Page><Settings /></Page>} />

        {/* ── Operator + Manager ── */}
        <Route path="/digital-twin" element={<Page roles={['operator', 'manager', 'admin']}><DigitalTwin /></Page>} />
        <Route path="/crowd" element={<Page roles={['operator', 'manager', 'security', 'admin']}><CrowdManagement /></Page>} />
        <Route path="/concessions" element={<Page roles={['operator', 'manager', 'admin']}><Concessions /></Page>} />

        {/* ── Security + Admin ── */}
        <Route path="/security" element={<Page roles={['security', 'admin']}><Security /></Page>} />

        {/* ── Manager + Admin ── */}
        <Route path="/analytics" element={<Page roles={['manager', 'admin']}><Analytics /></Page>} />
        <Route path="/broadcast" element={<Page roles={['manager', 'security', 'operator', 'admin']}><Broadcast /></Page>} />

        {/* ── Admin only ── */}
        <Route path="/admin-panel" element={<Page roles={['admin']}><AdminPanel /></Page>} />
      </Routes>
    </AuthProvider>
  );
}
