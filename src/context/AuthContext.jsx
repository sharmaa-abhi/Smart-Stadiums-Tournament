import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { AuthContext } from './contexts';
import { createDefaultUser } from './authDefaults';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('sg_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch {
      // Fallback if parsing fails
    }
    const initialRole = localStorage.getItem('sg_role') || 'admin';
    return createDefaultUser(initialRole);
  });

  const [token] = useState(() => localStorage.getItem('sg_token') || 'sg-bypass-token-dev');
  const loading = false;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Authentication is always valid in direct access mode
  const isAuthenticated = !!user;

  // Persist user and active role
  useEffect(() => {
    if (user) {
      localStorage.setItem('sg_user', JSON.stringify(user));
      localStorage.setItem('sg_role', user.role);
    }
  }, [user]);

  // Role Switcher for instant UI testing across roles
  const switchRole = useCallback((newRole = 'admin') => {
    const r = (newRole || 'admin').toLowerCase();
    const updatedUser = createDefaultUser(r);
    localStorage.setItem('sg_role', r);
    localStorage.setItem('sg_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  const login = useCallback(async (selectedRole) => {
    switchRole(selectedRole || 'admin');
  }, [switchRole]);

  const mockDevLogin = useCallback((selectedRole = 'admin') => {
    switchRole(selectedRole);
  }, [switchRole]);

  const signup = useCallback(async (selectedRole) => {
    switchRole(selectedRole || 'admin');
  }, [switchRole]);

  const triggerPasswordReset = useCallback(async () => {
    return Promise.resolve();
  }, []);

  // Logout resets to default operator role
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors
    }
    switchRole('operator');
    setIsProfileOpen(false);
  }, [switchRole]);

  // Sidebar & Venue State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sg_sidebar_collapsed') === 'true';
  });

  const [activeVenueId, setActiveVenueIdState] = useState(() => {
    return localStorage.getItem('sg_active_venue_id') || 'metlife';
  });

  const setActiveVenueId = useCallback((id) => {
    localStorage.setItem('sg_active_venue_id', id);
    setActiveVenueIdState(id);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sg_sidebar_collapsed', String(newVal));
      return newVal;
    });
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  }, []);

  const hasPermission = useCallback((permissionCode) => {
    if (!user || !user.permissions) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permissionCode);
  }, [user]);

  const hasRole = useCallback((roleName) => {
    if (!user || !user.role) return false;
    return user.role.toLowerCase() === roleName.toLowerCase() || user.role.toLowerCase() === 'admin';
  }, [user]);

  // Mobile Sidebar Drawer State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const openMobileSidebar = useCallback(() => setMobileSidebarOpen(true), []);
  const closeMobileSidebar = useCallback(() => setMobileSidebarOpen(false), []);
  const toggleMobileSidebar = useCallback(() => setMobileSidebarOpen(prev => !prev), []);

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated,
      login, signup, triggerPasswordReset, logout, mockDevLogin,
      switchRole,
      loginWithAuth0: login,
      sidebarCollapsed, toggleSidebar, updateUser, activeVenueId, setActiveVenueId,
      mobileSidebarOpen, openMobileSidebar, closeMobileSidebar, toggleMobileSidebar,
      hasPermission, hasRole,
      isProfileOpen, openProfile: () => setIsProfileOpen(true), closeProfile: () => setIsProfileOpen(false),
      sessionExpired, setSessionExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
}

