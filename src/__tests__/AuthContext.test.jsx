import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useAuth0 } from '@auth0/auth0-react';

// Mock API client
vi.mock('../lib/api', () => {
  return {
    default: {
      login: vi.fn(),
      register: vi.fn(),
      getMe: vi.fn(),
      request: vi.fn(),
    },
  };
});

// Helper component to access useAuth hooks in tests
function TestComponent() {
  const { user, token, isAuthenticated, login, register, logout } = useAuth();
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="user-role">{user?.role || 'no-role'}</div>
      <button data-testid="login-btn" onClick={() => login('operator@stadiumgenius.io', 'password123')}>Login</button>
      <button data-testid="login-auth0-btn" onClick={() => login()}>Login Auth0</button>
      <button data-testid="register-auth0-btn" onClick={() => register('Test User', null, null, 'security')}>Register Auth0</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext & AuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    global.mockUseAuth0.mockImplementation(() => ({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    }));
  });

  it('renders initial unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
    expect(screen.getByTestId('user-email').textContent).toBe('no-email');
  });

  it('successfully logs in with email and password', async () => {
    const mockUser = { id: 1, email: 'operator@stadiumgenius.io', role: 'operator', name: 'Operator' };
    const mockToken = 'mock-jwt-token-123';
    api.login.mockResolvedValue({ user: mockUser, token: mockToken });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(api.login).toHaveBeenCalledWith('operator@stadiumgenius.io', 'password123');
    expect(window.localStorage.getItem('sg_token')).toBe(mockToken);
    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('operator@stadiumgenius.io');
    expect(screen.getByTestId('user-role').textContent).toBe('operator');
  });

  it('falls back to mock operator login when Auth0 keys are missing and no credentials provided', async () => {
    // Override import.meta.env values during test
    vi.stubEnv('VITE_AUTH0_DOMAIN', '');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', '');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-auth0-btn').click();
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('operator@stadiumgenius.io');
    expect(screen.getByTestId('user-role').textContent).toBe('operator');
    expect(window.localStorage.getItem('sg_token')).toBe('mock-jwt-token');

    vi.unstubAllEnvs();
  });

  it('falls back to mock registration when Auth0 keys are missing', async () => {
    vi.stubEnv('VITE_AUTH0_DOMAIN', '');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', '');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('register-auth0-btn').click();
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-role').textContent).toBe('security');
    expect(window.localStorage.getItem('sg_token')).toBe('mock-jwt-token');

    vi.unstubAllEnvs();
  });

  it('logs out and clears storage state', async () => {
    const mockUser = { id: 1, email: 'operator@stadiumgenius.io', role: 'operator', name: 'Operator' };
    const mockToken = 'mock-jwt-token-123';
    api.login.mockResolvedValue({ user: mockUser, token: mockToken });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('login-btn').click();
    });

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(window.localStorage.getItem('sg_token')).toBeNull();
    expect(screen.getByTestId('is-authenticated').textContent).toBe('false');
  });

  it('toggles sidebar state correctly', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.sidebarCollapsed).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('updates user state details correctly', async () => {
    const mockUser = { id: 1, email: 'operator@stadiumgenius.io', role: 'operator', name: 'Operator' };
    const mockToken = 'mock-jwt-token-123';
    api.login.mockResolvedValue({ user: mockUser, token: mockToken });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login('operator@stadiumgenius.io', 'password123');
    });

    expect(result.current.user.name).toBe('Operator');

    act(() => {
      result.current.updateUser({ name: 'Updated Operator' });
    });
    expect(result.current.user.name).toBe('Updated Operator');
  });

  it('throws an error if useAuth is invoked outside AuthProvider', () => {
    // Suppress console error output for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  it('calls Auth0 redirect functions when keys are present', async () => {
    vi.stubEnv('VITE_AUTH0_DOMAIN', 'stadiumgenius-test.us.auth0.com');
    vi.stubEnv('VITE_AUTH0_CLIENT_ID', 'testclientid123');

    const mockLoginWithRedirect = vi.fn();
    global.mockUseAuth0.mockReturnValue({
      isLoading: false,
      isAuthenticated: false,
      user: null,
      loginWithRedirect: mockLoginWithRedirect,
      logout: vi.fn(),
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.login();
    });
    expect(mockLoginWithRedirect).toHaveBeenCalled();

    await act(async () => {
      await result.current.register();
    });
    expect(mockLoginWithRedirect).toHaveBeenCalled();

    vi.unstubAllEnvs();
  });

  it('triggers Auth0 logout when authenticated with Auth0', async () => {
    const mockLogout = vi.fn();
    global.mockUseAuth0.mockImplementation(() => ({
      isLoading: false,
      isAuthenticated: true,
      user: { name: 'Auth0 User' },
      loginWithRedirect: vi.fn(),
      logout: mockLogout,
    }));

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockLogout).toHaveBeenCalled();
  });

  it('supports setting active venue ID state', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.setActiveVenueId('sofi');
    });

    expect(result.current.activeVenueId).toBe('sofi');
  });

  it('restores auth state from localStorage token on initial mount', async () => {
    const mockUser = { id: 1, name: 'Operator', email: 'operator@stadiumgenius.io', role: 'operator', permissions: [] };
    api.getMe.mockResolvedValue(mockUser);
    window.localStorage.setItem('sg_token', 'restored-token-456');

    const { result: resultHook } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {});

    expect(api.getMe).toHaveBeenCalled();
    expect(resultHook.current.user).toEqual(expect.objectContaining({ name: 'Operator', email: 'operator@stadiumgenius.io' }));
    expect(resultHook.current.token).toBe('restored-token-456');
  });

  it('resets state if token restoration fails', async () => {
    api.getMe.mockRejectedValue(new Error('Token expired'));
    window.localStorage.setItem('sg_token', 'invalid-token');

    const { result: resultHook } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {});

    expect(resultHook.current.user).toBeNull();
    expect(resultHook.current.token).toBeNull();
  });

  it('registers successfully with email and password', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await result.current.register('operator', 'new@stadiumgenius.io');
    });

    expect(result.current.user.email).toBe('new@stadiumgenius.io');
  });
});
