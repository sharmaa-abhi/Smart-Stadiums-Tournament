import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext useAuth hook
vi.mock('../context/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  };
});

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page Component', () => {
  const mockLoginFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      login: mockLoginFn,
    });
  });

  it('renders all login page elements correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText('Operations Console')).toBeInTheDocument();
    expect(screen.getByText('Select role & sign in via Auth0')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In with Auth0/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Google Login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Microsoft Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Register Fan Pass/i)).toBeInTheDocument();
  });

  it('allows switching roles manually via the role selector buttons', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const adminPill = screen.getByRole('button', { name: 'Role: ADMIN' });
    const securityPill = screen.getByRole('button', { name: 'Role: SECURITY' });

    // Click Admin Role Selector
    fireEvent.click(adminPill);
    expect(adminPill.className).toContain('bg-rose-500');

    // Click Security Role Selector
    fireEvent.click(securityPill);
    expect(securityPill.className).toContain('bg-amber-500');
    expect(adminPill.className).toContain('opacity-50');
  });

  it('triggers Auth0 login flow when clicking the main Auth0 button', async () => {
    mockLoginFn.mockResolvedValue();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByRole('button', { name: /Sign In with Auth0/i });
    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(mockLoginFn).toHaveBeenCalledWith('operator', null);
  });

  it('triggers Auth0 social login flow when clicking Google Login', async () => {
    mockLoginFn.mockResolvedValue();

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const googleBtn = screen.getByRole('button', { name: /Google Login/i });
    await act(async () => {
      fireEvent.click(googleBtn);
    });

    expect(mockLoginFn).toHaveBeenCalledWith('operator', 'google-oauth2');
  });

  it('displays error message when Auth0 redirection fails', async () => {
    mockLoginFn.mockRejectedValue(new Error('Auth0 server unreachable'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByRole('button', { name: /Sign In with Auth0/i });
    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(screen.getByText('Auth0 server unreachable')).toBeInTheDocument();
  });
});

