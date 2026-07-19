import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
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

describe('Register Page Component', () => {
  const mockRegisterFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      register: mockRegisterFn,
    });
  });

  it('renders all registration page fields and buttons correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('operator@stadiumgenius.io')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Min 6 characters')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByText('Continue with Auth0')).toBeInTheDocument();
  });

  it('supports selecting different role profiles', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const securityButton = screen.getByText('Security');
    const managerButton = screen.getByText('Manager');

    // Click Security Staff role button
    fireEvent.click(securityButton);
    // Check selection highlighted
    expect(securityButton.closest('button').className).toContain('border-amber-500/35');

    // Click Venue Manager role button
    fireEvent.click(managerButton);
    expect(managerButton.closest('button').className).toContain('border-violet-500/35');
  });

  it('toggles password visibility when the eye button is clicked', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const passwordInput = screen.getByPlaceholderText('Min 6 characters');
    const toggleButton = screen.getByLabelText('Show password');

    expect(passwordInput.type).toBe('password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByLabelText('Hide password')).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(screen.getByLabelText('Hide password'));
    expect(passwordInput.type).toBe('password');
  });

  it('submits the form successfully and navigates to dashboard', async () => {
    mockRegisterFn.mockResolvedValue({ user: { name: 'John Doe' } });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('operator@stadiumgenius.io'), { target: { value: 'john@stadiumgenius.io' } });
    fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(mockRegisterFn).toHaveBeenCalledWith('John Doe', 'john@stadiumgenius.io', 'password123', 'operator');
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('renders validation error when registration fails', async () => {
    mockRegisterFn.mockRejectedValue(new Error('Email is already registered.'));

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('operator@stadiumgenius.io'), { target: { value: 'john@stadiumgenius.io' } });
    fireEvent.change(screen.getByPlaceholderText('Min 6 characters'), { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });

    await act(async () => {
      fireEvent.click(submitBtn);
    });

    expect(screen.getByText('Email is already registered.')).toBeInTheDocument();
  });

  it('triggers Auth0 registration flow when clicking the Continue with Auth0 button', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByText('Continue with Auth0');

    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(mockRegisterFn).toHaveBeenCalled();
  });
});
