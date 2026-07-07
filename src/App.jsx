import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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

export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
        <Route path="/digital-twin" element={<ProtectedRoute><AppLayout><DigitalTwin /></AppLayout></ProtectedRoute>} />
        <Route path="/crowd" element={<ProtectedRoute><AppLayout><CrowdManagement /></AppLayout></ProtectedRoute>} />
        <Route path="/security" element={<ProtectedRoute><AppLayout><Security /></AppLayout></ProtectedRoute>} />
        <Route path="/concessions" element={<ProtectedRoute><AppLayout><Concessions /></AppLayout></ProtectedRoute>} />
        <Route path="/assistant" element={<ProtectedRoute><AppLayout><AIAssistant /></AppLayout></ProtectedRoute>} />
        <Route path="/broadcast" element={<ProtectedRoute><AppLayout><Broadcast /></AppLayout></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><AppLayout><Analytics /></AppLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><AppLayout><Settings /></AppLayout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}
