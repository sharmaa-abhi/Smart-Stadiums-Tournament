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

    expect(screen.getByPlaceholderText('operator@stadiumgenius.io')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText('Continue with Auth0')).toBeInTheDocument();
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
    expect(emailInput.className).toContain('focus:border-rose-500/40'); // Admin theme border

    // Type security email keyword
    fireEvent.change(emailInput, { target: { value: 'security-officer@stadiumgenius.io' } });
    expect(emailInput.className).toContain('focus:border-amber-500/40'); // Security theme border

    // Type manager email keyword
    fireEvent.change(emailInput, { target: { value: 'manager-hq@stadiumgenius.io' } });
    expect(emailInput.className).toContain('focus:border-violet-500/40'); // Manager theme border

    // Type operator email keyword
    fireEvent.change(emailInput, { target: { value: 'operator-staff@stadiumgenius.io' } });
    expect(emailInput.className).toContain('focus:border-brand-500/40'); // Operator theme border
  });

  it('allows switching roles manually via the color dot selectors', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const adminPill = screen.getByTitle('Preview Console: Admin');
    const securityPill = screen.getByTitle('Preview Console: Security');
    const managerPill = screen.getByTitle('Preview Console: Manager');

    // Click Admin Dot Selector
    fireEvent.click(adminPill);
    expect(adminPill.className).toContain('scale-110');

    // Click Security Dot Selector
    fireEvent.click(securityPill);
    expect(securityPill.className).toContain('scale-110');
    expect(adminPill.className).not.toContain('scale-110');
  });

  it('successfully submits the form and navigates to the dashboard', async () => {
    mockLoginFn.mockResolvedValue({ user: { role: 'operator' } });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('operator@stadiumgenius.io');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const signInButton = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'operator@stadiumgenius.io' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    await act(async () => {
      fireEvent.click(signInButton);
    });

    expect(mockLoginFn).toHaveBeenCalledWith('operator@stadiumgenius.io', 'password123');
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
    const passwordInput = screen.getByPlaceholderText('Enter your password');
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

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByLabelText('Show password');

    expect(passwordInput.type).toBe('password');

    // Toggle to text
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');

    // Toggle back to password
    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(passwordInput.type).toBe('password');
  });

  it('triggers Auth0 login flow when clicking the Continue with Auth0 button', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByText('Continue with Auth0');
    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(mockLoginFn).toHaveBeenCalled();
  });
});
