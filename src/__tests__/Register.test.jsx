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
  const mockSignupFn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({
      signup: mockSignupFn,
    });
  });

  it('renders all registration page components and Auth0 button correctly', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Select Role Profile')).toBeInTheDocument();
    expect(screen.getByText('Register via Auth0 Secure Signup')).toBeInTheDocument();
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
    expect(securityButton.closest('button').className).toContain('border-amber-500/35');

    // Click Venue Manager role button
    fireEvent.click(managerButton);
    expect(managerButton.closest('button').className).toContain('border-violet-500/35');
  });

  it('triggers Auth0 registration flow when clicking the Register via Auth0 button', async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const auth0Btn = screen.getByText('Register via Auth0 Secure Signup');

    await act(async () => {
      fireEvent.click(auth0Btn);
    });

    expect(mockSignupFn).toHaveBeenCalledWith('operator');
  });
});
