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

  const isAuthenticated = !!user && !!token;

  // Sync authentication state with Auth0 and FastAPI Backend
  useEffect(() => {
    const initAuth = async () => {
      if (auth0Loading) return;

      if (auth0IsAuthenticated && auth0User) {
        try {
          // Attempt to get real JWT access token from Auth0
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

          // Sync with FastAPI Backend
          try {
            const syncResult = await api.syncAuth0User();
            setUser({
              ...syncResult.user,
              permissions: syncResult.permissions || DEFAULT_ROLE_PERMISSIONS[syncResult.user.role] || []
            });
          } catch (syncErr) {
            // Fallback sync payload if backend running in offline/mock mode
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
            if (!accessToken) {
              const mockToken = `mock-${role}-jwt-token`;
              localStorage.setItem('sg_token', mockToken);
              setToken(mockToken);
            }
          }
          localStorage.removeItem('sg_auth0_role');
        } catch (err) {
          console.error('Error in Auth0 login sync:', err);
        } finally {
          setLoading(false);
        }
      } else {
        const storedToken = localStorage.getItem('sg_token');
        if (!storedToken) {
          setUser(null);
          setToken(null);
          setLoading(false);
          return;
        }

        try {
          const profile = await api.getMe();
          setUser({
            ...profile,
            permissions: profile.permissions || DEFAULT_ROLE_PERMISSIONS[profile.role] || []
          });
          setToken(storedToken);
        } catch (err) {
          console.warn('Token validation failed on startup:', err);
          // If token valid locally (mock or stored)
          if (storedToken.startsWith('mock-')) {
            const role = storedToken.includes('admin') ? 'admin' :
                         storedToken.includes('manager') ? 'manager' :
                         storedToken.includes('security') ? 'security' : 'operator';
            setUser({
              auth0_id: `mock-${role}-id`,
              name: `Stadium ${role.charAt(0).toUpperCase() + role.slice(1)}`,
              email: `${role}@stadiumgenius.io`,
              role: role,
              account_status: 'active',
              email_verified: true,
              last_login: new Date().toISOString(),
              permissions: DEFAULT_ROLE_PERMISSIONS[role] || []
            });
          } else {
            localStorage.removeItem('sg_token');
            setUser(null);
            setToken(null);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [auth0Loading, auth0IsAuthenticated, auth0User, getAccessTokenSilently]);

  // Auth0 Login Triggers
  const loginWithAuth0 = useCallback(async (selectedRole, connection = null) => {
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

  // Direct Mock Login for testing / dev demo
  const loginMock = useCallback(async (role = 'operator', email = null) => {
    const userRole = role.toLowerCase();
    const mockToken = `mock-${userRole}-jwt-token`;
    const mockUser = {
      auth0_id: `mock-${userRole}-id-100`,
      name: `Stadium ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}`,
      email: email || `${userRole}@stadiumgenius.io`,
      role: userRole,
      account_status: 'active',
      email_verified: true,
      last_login: new Date().toISOString(),
      permissions: DEFAULT_ROLE_PERMISSIONS[userRole] || []
    };

    localStorage.setItem('sg_token', mockToken);
    setToken(mockToken);
    setUser(mockUser);
    return { user: mockUser, token: mockToken };
  }, []);

  // Password Reset Flow
  const triggerPasswordReset = useCallback(async (email) => {
    await loginWithRedirect({
      authorizationParams: {
        screen_hint: 'reset_password',
        login_hint: email,
      }
    });
  }, [loginWithRedirect]);

  // Logout Handler
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

    if (auth0IsAuthenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }, [auth0IsAuthenticated, auth0Logout]);

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

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, 
      loginWithAuth0, loginMock, triggerPasswordReset, logout,
      login: loginMock, register: loginMock, // Backward-compatible aliases for legacy callers/tests
      sidebarCollapsed, toggleSidebar, updateUser, activeVenueId, setActiveVenueId,
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
