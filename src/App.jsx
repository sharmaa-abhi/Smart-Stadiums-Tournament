import { Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <div className="flex min-h-screen bg-surface-950 stadium-grid">
      <ScrollToTop />
      <Sidebar />

      {/* Main content area — offset by fixed sidebar width */}
      <main className="flex-1 ml-[260px] min-w-0">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/digital-twin" element={<DigitalTwin />} />
          <Route path="/crowd" element={<CrowdManagement />} />
          <Route path="/security" element={<Security />} />
          <Route path="/concessions" element={<Concessions />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/broadcast" element={<Broadcast />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
