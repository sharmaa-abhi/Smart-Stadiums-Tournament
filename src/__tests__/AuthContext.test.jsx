import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Mock API client
vi.mock('../lib/api', () => {
  return {
    default: {
      logout: vi.fn().mockResolvedValue({}),
    },
  };
});

function TestComponent() {
  const { user, isAuthenticated, switchRole, logout } = useAuth();
  return (
    <div>
      <div data-testid="is-authenticated">{isAuthenticated.toString()}</div>
      <div data-testid="user-email">{user?.email || 'no-email'}</div>
      <div data-testid="user-role">{user?.role || 'no-role'}</div>
      <button data-testid="switch-manager-btn" onClick={() => switchRole('manager')}>Switch Manager</button>
      <button data-testid="switch-security-btn" onClick={() => switchRole('security')}>Switch Security</button>
      <button data-testid="logout-btn" onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext & AuthProvider (Direct Access Mode)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders initial authenticated default user state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('is-authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-email').textContent).toBe('admin@stadiumgenius.io');
    expect(screen.getByTestId('user-role').textContent).toBe('admin');
  });

  it('allows dynamic role switching via switchRole', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('switch-manager-btn').click();
    });

    expect(screen.getByTestId('user-role').textContent).toBe('manager');
    expect(screen.getByTestId('user-email').textContent).toBe('manager@stadiumgenius.io');

    await act(async () => {
      screen.getByTestId('switch-security-btn').click();
    });

    expect(screen.getByTestId('user-role').textContent).toBe('security');
    expect(screen.getByTestId('user-email').textContent).toBe('security@stadiumgenius.io');
  });

  it('resets to operator role on logout without crashing', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });

    expect(screen.getByTestId('user-role').textContent).toBe('operator');
    expect(api.logout).toHaveBeenCalled();
  });

  it('toggles sidebar collapsed state correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    expect(result.current.sidebarCollapsed).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.sidebarCollapsed).toBe(true);
  });

  it('updates user state details correctly', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    act(() => {
      result.current.updateUser({ name: 'Custom Name' });
    });
    expect(result.current.user?.name).toBe('Custom Name');
  });

  it('correctly verifies role and permissions with admin override', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Admin has access to all roles and permissions
    expect(result.current.hasRole('manager')).toBe(true);
    expect(result.current.hasPermission('configure:system')).toBe(true);

    // Switch to operator
    act(() => {
      result.current.switchRole('operator');
    });
    expect(result.current.hasRole('operator')).toBe(true);
    expect(result.current.hasPermission('use:ai_assistant')).toBe(true);
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

  it('throws an error if useAuth is invoked outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    consoleError.mockRestore();
  });
});
