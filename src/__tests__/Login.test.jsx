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
  const mockAuth0LoginFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      loginMock: mockLoginFn,
      loginWithAuth0: mockAuth0LoginFn,
    });
  });

  it('renders all login page elements correctly', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('operator@stadiumgenius.io')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Auth0 Universal Login/i)).toBeInTheDocument();
  });

  it('switches preview role based on email input keywords automatically', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('operator@stadiumgenius.io');

    // Type admin email keyword
    fireEvent.change(emailInput, { target: { value: 'admin@stadiumgenius.io' } });
    expect(screen.getByRole('button', { name: 'admin' }).className).toContain('shadow-glow');

    // Type security email keyword
    fireEvent.change(emailInput, { target: { value: 'security-officer@stadiumgenius.io' } });
    expect(screen.getByRole('button', { name: 'security' }).className).toContain('shadow-glow');
  });

  it('allows switching roles manually via the color dot selectors', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const adminPill = screen.getByRole('button', { name: 'admin' });
    const securityPill = screen.getByRole('button', { name: 'security' });

    // Click Admin Dot Selector
    fireEvent.click(adminPill);
    expect(adminPill.className).toContain('shadow-glow');

    // Click Security Dot Selector
    fireEvent.click(securityPill);
    expect(securityPill.className).toContain('shadow-glow');
    expect(adminPill.className).toContain('opacity-50');
  });

  it('successfully submits the form and navigates to the dashboard', async () => {
    mockLoginFn.mockResolvedValue({ user: { role: 'operator' } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('operator@stadiumgenius.io');
    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'operator@stadiumgenius.io' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(signInButton);
    });

    expect(mockLoginFn).toHaveBeenCalledWith('operator', 'operator@stadiumgenius.io');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('displays a compilation/sign-in validation error on login failure', async () => {
    mockLoginFn.mockRejectedValue(new Error('Invalid email or password'));

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('operator@stadiumgenius.io');
    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@stadiumgenius.io' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });

    await act(async () => {
      fireEvent.click(signInButton);
    });

    expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
  });

  it('toggles password visibility when the eye button is clicked', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('••••••••••••');
    const toggleButton = passwordInput.nextElementSibling;

    expect(passwordInput.type).toBe('password');

    // Toggle to text
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Toggle back to password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('password');
  });

  it('triggers Auth0 login flow when clicking the Continue with Auth0 button', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByText(/Auth0 Universal Login/i);
    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(mockAuth0LoginFn).toHaveBeenCalled();
  });
});
