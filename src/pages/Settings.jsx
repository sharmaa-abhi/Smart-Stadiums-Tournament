import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe, Bell, Shield, Server, Key, Users
} from 'lucide-react';
import TopBar from '../components/TopBar';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SettingsSkeleton } from '../components/skeleton';

const settingSections = [
  {
    title: 'Venue Configuration',
    icon: Globe,
    items: [
      { label: 'Active Venue', value: 'MetLife Stadium', type: 'select' },
      { label: 'Edge Node Auto-Discovery', value: true, type: 'toggle' },
      { label: 'Telemetry Refresh Rate', value: '5 seconds', type: 'select' },
      { label: 'Digital Twin Sync Mode', value: 'Real-time', type: 'select' },
    ],
  },
  {
    title: 'Notifications & Alerts',
    icon: Bell,
    items: [
      { label: 'Push Notifications', value: true, type: 'toggle' },
      { label: 'SMS Alerts (Critical)', value: true, type: 'toggle' },
      { label: 'Email Digest', value: false, type: 'toggle' },
      { label: 'Alert Sound', value: true, type: 'toggle' },
      { label: 'Crowd Density Threshold', value: '85%', type: 'input' },
      { label: 'Queue Alert Threshold', value: '8 min wait', type: 'input' },
    ],
  },
  {
    title: 'AI & Model Settings',
    icon: Server,
    items: [
      { label: 'AI Model', value: 'StadiumGPT-4o', type: 'select' },
      { label: 'Inference Mode', value: 'Edge + Cloud Hybrid', type: 'select' },
      { label: 'Confidence Threshold', value: '85%', type: 'input' },
      { label: 'Human-in-the-Loop', value: true, type: 'toggle' },
      { label: 'Auto-generate Incident Reports', value: true, type: 'toggle' },
      { label: 'PII Filter', value: true, type: 'toggle' },
    ],
  },
  {
    title: 'Security & Privacy',
    icon: Shield,
    items: [
      { label: 'mTLS Encryption', value: true, type: 'toggle' },
      { label: 'Audit Logging', value: true, type: 'toggle' },
      { label: 'CCTV Face Blur', value: true, type: 'toggle' },
      { label: 'Session Timeout', value: '30 minutes', type: 'select' },
      { label: 'Two-Factor Auth', value: true, type: 'toggle' },
    ],
  },
];

export default function Settings() {
  const { user, updateUser, activeVenueId, setActiveVenueId } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);

  // Profile fields
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');
  const [profileMsg, setProfileMsg] = useState(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfileAvatar(user.avatar || '');
    }
  }, [user]);

  useEffect(() => {
    api.getVenues()
      .then(res => {
        setVenues(res.venues || []);
      })
      .catch(console.error)
      .finally(() => setLoadingVenues(false));
  }, []);

  const activeVenueIdx = venues.findIndex(v => v.id === activeVenueId);
  const currentActiveIdx = activeVenueIdx !== -1 ? activeVenueIdx : 0;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.updateUserProfile({ name: profileName, avatar: profileAvatar });
      updateUser(res.user);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    }
  };

  if (loadingVenues) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <TopBar title="Settings" subtitle="Platform configuration & preferences" />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Venue Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white/90">Active Venue Selection</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {venues.slice(0, 6).map((venue, i) => (
              <motion.div
                key={venue.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => {
                  setActiveVenueId(venue.id);
                }}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-200
                  ${i === currentActiveIdx
                    ? 'bg-brand-500/15 border border-brand-500/30 shadow-lg shadow-brand-500/5'
                    : 'bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10]'
                  }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-semibold ${i === currentActiveIdx ? 'text-brand-400' : 'text-white/70'}`}>
                    {venue.name}
                  </span>
                  {i === currentActiveIdx && <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-dot" />}
                </div>
                <p className="text-[10px] text-white/30">{venue.city}, {venue.country} • {venue.capacity.toLocaleString()} capacity</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* User Profile & Security Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white/90">Edit User Profile</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Email Address</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.04] text-sm text-white/40 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">Avatar Image URL</label>
                <input
                  type="text"
                  value={profileAvatar}
                  onChange={(e) => setProfileAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all"
                />
              </div>
              {profileMsg && (
                <p className={`text-xs font-medium ${profileMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {profileMsg.text}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400 hover:bg-brand-500/20 transition-all cursor-pointer"
              >
                Save Profile Changes
              </button>
            </form>
          </motion.div>

          {/* Change Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-brand-400" />
              <h3 className="text-sm font-semibold text-white/90">Change Password</h3>
            </div>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs text-white/40 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sm text-white/80 focus:outline-none focus:border-brand-500/40 focus:bg-white/[0.05] transition-all"
                  required
                />
              </div>
              {passwordMsg && (
                <p className={`text-xs font-medium ${passwordMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {passwordMsg.text}
                </p>
              )}
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-400 hover:bg-brand-500/20 transition-all cursor-pointer"
              >
                Change Password
              </button>
            </form>
          </motion.div>
        </div>

        {/* Settings Sections */}
        {settingSections.map((section, sIdx) => {
          const SectionIcon = section.icon;
          return (
            <motion.div
              key={sIdx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sIdx * 0.1 + 0.2 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-4">
                <SectionIcon className="w-4 h-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white/90">{section.title}</h3>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 group">
                    <span className="text-sm text-white/60">{item.label}</span>
                    {item.type === 'toggle' ? (
                      <button className="relative">
                        {item.value ? (
                          <ToggleRight className="w-8 h-8 text-brand-400" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-white/20" />
                        )}
                      </button>
                    ) : item.type === 'select' ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                        text-xs text-white/60 cursor-pointer hover:bg-white/[0.06] transition-all">
                        {item.value}
                        <ChevronRight className="w-3 h-3 text-white/30" />
                      </div>
                    ) : (
                      <input
                        type="text"
                        defaultValue={item.value}
                        className="w-32 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]
                          text-xs text-white/60 text-right focus:outline-none focus:border-brand-500/40 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* System Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Monitor className="w-4 h-4 text-brand-400" />
            <h3 className="text-sm font-semibold text-white/90">System Information</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Platform Version', value: 'v2.4.1-beta' },
              { label: 'API Version', value: 'v3.1.0' },
              { label: 'Edge SDK', value: 'v1.8.2' },
              { label: 'Last Sync', value: 'Just now' },
              { label: 'Database', value: 'TimescaleDB + Neo4j' },
              { label: 'Streaming', value: 'Kafka 3.7' },
              { label: 'AI Runtime', value: 'CUDA 12.3' },
              { label: 'Uptime', value: '99.97% (30d)' },
            ].map((info, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/[0.02]">
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{info.label}</p>
                <p className="text-xs font-semibold text-white/70 mt-1">{info.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
