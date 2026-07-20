import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const {
    isLoading: auth0Loading,
    isAuthenticated: auth0IsAuthenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
  } = useAuth0();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sg_token'));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Sync authentication state
  useEffect(() => {
    const initAuth = async () => {
      if (auth0Loading) return;

      if (auth0IsAuthenticated && auth0User) {
        try {
          const pendingRole = localStorage.getItem('sg_auth0_role');
          const data = await api.request('/auth/auth0-login', {
            method: 'POST',
            body: JSON.stringify({
              email: auth0User.email,
              name: auth0User.name || auth0User.nickname,
              avatar: auth0User.picture,
              role: pendingRole || undefined,
            }),
          });
          localStorage.removeItem('sg_auth0_role');
          if (data && data.token) {
            localStorage.setItem('sg_token', data.token);
            setToken(data.token);
            setUser(data.user);
          }
        } catch (err) {
          console.error('Error syncing Auth0 user:', err);
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
          const data = await api.getMe();
          setUser(data.user);
          setToken(storedToken);
        } catch {
          localStorage.removeItem('sg_token');
          setUser(null);
          setToken(null);
        } finally {
          setLoading(false);
        }
      }
    };

    initAuth();
  }, [auth0Loading, auth0IsAuthenticated, auth0User]);

  const login = useCallback(async (email, password, selectedRole) => {
    if (email && password) {
      const data = await api.login(email, password);
      localStorage.setItem('sg_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } else {
      if (selectedRole) {
        localStorage.setItem('sg_auth0_role', selectedRole);
      }
      if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
        console.warn("Auth0 credentials missing. Falling back to mock operator login.");
        const mockUser = {
          id: `mock-${selectedRole || 'operator'}`,
          name: `Mock ${selectedRole ? selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1) : 'Operator'}`,
          email: `${selectedRole || 'operator'}@stadiumgenius.io`,
          role: selectedRole || "operator",
          avatar: null
        };
        try {
          const authUser = await api.request('/auth/auth0-login', {
            method: 'POST',
            body: JSON.stringify({
              email: mockUser.email,
              name: mockUser.name,
              avatar: mockUser.avatar,
              role: mockUser.role
            })
          });
          if (authUser && authUser.token) {
            localStorage.setItem('sg_token', authUser.token);
            setToken(authUser.token);
            setUser(authUser.user);
            return { user: authUser.user, token: authUser.token };
          }
        } catch (err) {
          console.error("Failed to fetch real token for mock Auth0 user:", err);
        }
        const mockToken = "mock-jwt-token";
        localStorage.setItem('sg_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return { user: mockUser, token: mockToken };
      }
      await loginWithRedirect();
    }
  }, [loginWithRedirect]);

  const register = useCallback(async (name, email, password, role) => {
    if (email && password) {
      const data = await api.register(name, email, password, role);
      localStorage.setItem('sg_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } else {
      if (role) {
        localStorage.setItem('sg_auth0_role', role);
      }
      if (!import.meta.env.VITE_AUTH0_DOMAIN || !import.meta.env.VITE_AUTH0_CLIENT_ID) {
        console.warn("Auth0 credentials missing. Falling back to mock registration.");
        const mockUser = {
          id: "mock-user",
          name: name || `Mock ${role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User'}`,
          email: email || `${role || 'operator'}_auth0@stadiumgenius.io`,
          role: role || "operator",
          avatar: null
        };
        try {
          const authUser = await api.request('/auth/auth0-login', {
            method: 'POST',
            body: JSON.stringify({
              email: mockUser.email,
              name: mockUser.name,
              avatar: mockUser.avatar,
              role: mockUser.role
            })
          });
          if (authUser && authUser.token) {
            localStorage.setItem('sg_token', authUser.token);
            setToken(authUser.token);
            setUser(authUser.user);
            return { user: authUser.user, token: authUser.token };
          }
        } catch (err) {
          console.error("Failed to fetch real token for mock Auth0 user:", err);
        }
        const mockToken = "mock-jwt-token";
        localStorage.setItem('sg_token', mockToken);
        setToken(mockToken);
        setUser(mockUser);
        return { user: mockUser, token: mockToken };
      }
      await loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } });
    }
  }, [loginWithRedirect]);

  const logout = useCallback(() => {
    localStorage.removeItem('sg_token');
    setToken(null);
    setUser(null);
    if (auth0IsAuthenticated) {
      auth0Logout({ logoutParams: { returnTo: window.location.origin } });
    }
  }, [auth0IsAuthenticated, auth0Logout]);

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

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, login, register, logout,
      sidebarCollapsed, toggleSidebar, updateUser, activeVenueId, setActiveVenueId
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
