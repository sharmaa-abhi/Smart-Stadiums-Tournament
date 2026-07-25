import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../lib/api';

const AuthContext = createContext(null);

const DEFAULT_ROLE_PERMISSIONS = {
  admin: [
    'manage:users', 'manage:roles', 'configure:system', 'configure:ai',
    'read:incidents', 'delete:incidents', 'read:audit_logs', 'manage:dashboard'
  ],
  manager: [
    'read:dashboard', 'assign:staff', 'read:reports', 'read:incidents',
    'approve:ai', 'allocate:resources'
  ],
  operator: [
    'login', 'read:dashboard', 'update:incidents', 'read:crowd_analytics',
    'create:incidents', 'use:ai_assistant'
  ],
  security: [
    'login', 'read:security_dashboard', 'respond:incidents', 'verify:alerts',
    'read:cctv', 'update:emergency'
  ]
};

export function AuthProvider({ children }) {
  const {
    isLoading: auth0Loading,
    isAuthenticated: auth0IsAuthenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));
  const [loading, setLoading] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Auth is valid ONLY when Auth0 says so AND we have a user object
  const isAuthenticated = auth0IsAuthenticated && !!user;

  // Sync authentication state with Auth0
  useEffect(() => {
    const initAuth = async () => {
      if (auth0Loading) return;

      // If Auth0 authenticated — sync user profile
      if (auth0IsAuthenticated && auth0User) {
        try {
          // Get real JWT access token from Auth0
          let accessToken = null;
          try {
            accessToken = await getAccessTokenSilently();
          } catch (tokenErr) {
            console.warn('Could not fetch silent token from Auth0:', tokenErr);
          }

          const pendingRole = localStorage.getItem('sg_auth0_role') || 'operator';

          if (accessToken) {
            localStorage.setItem('sg_token', accessToken);
            setToken(accessToken);
          }

          // Sync with Backend
          try {
            const syncResult = await api.syncAuth0User();
            setUser({
              ...syncResult.user,
              permissions: syncResult.permissions || DEFAULT_ROLE_PERMISSIONS[syncResult.user.role] || []
            });
          } catch (syncErr) {
            // Backend unavailable — build user from Auth0 profile
            const role = pendingRole.toLowerCase();
            const fallbackUser = {
              auth0_id: auth0User.sub,
              name: auth0User.name || auth0User.nickname,
              email: auth0User.email,
              avatar: auth0User.picture,
              role: role,
              account_status: 'active',
              email_verified: auth0User.email_verified ?? true,
              last_login: new Date().toISOString(),
              permissions: DEFAULT_ROLE_PERMISSIONS[role] || []
            };
            setUser(fallbackUser);
          }
          localStorage.removeItem('sg_auth0_role');
        } catch (err) {
          console.error('Error in Auth0 login sync:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Not authenticated via Auth0 — clear everything
        localStorage.removeItem('sg_token');
        setUser(null);
        setToken(null);
        setLoading(false);
      }
    };

    initAuth();
  }, [auth0Loading, auth0IsAuthenticated, auth0User, getAccessTokenSilently]);

  // Auth0 Login — the ONLY way to authenticate
  const login = useCallback(async (selectedRole, connection = null) => {
    if (selectedRole) {
      localStorage.setItem('sg_auth0_role', selectedRole);
    }
    const params = {
      authorizationParams: {
        ...(connection ? { connection } : {}),
      }
    };
    await loginWithRedirect(params);
  }, [loginWithRedirect]);

  // Auth0 Signup — redirect to Auth0 with signup screen hint
  const signup = useCallback(async (selectedRole) => {
    if (selectedRole) {
      localStorage.setItem('sg_auth0_role', selectedRole);
    }
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'signup',
      }
    });
  }, [loginWithRedirect]);

  // Password Reset via Auth0
  const triggerPasswordReset = useCallback(async (email) => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'reset_password',
        login_hint: email,
      }
    });
  }, [loginWithRedirect]);

  // Logout — clears local state + Auth0 session
  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    }
    localStorage.removeItem('sg_token');
    localStorage.removeItem('sg_auth0_role');
    setToken(null);
    setUser(null);
    setIsProfileOpen(false);

    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

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
      login, signup, triggerPasswordReset, logout,
      loginWithAuth0: login, // Alias for backward compat in components
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
