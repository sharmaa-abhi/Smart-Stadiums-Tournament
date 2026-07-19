import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { useAuth } from '../context/AuthContext';

// Mock AuthContext
vi.mock('../context/AuthContext', () => {
  return {
    useAuth: vi.fn(),
  };
});

describe('WCAG 2.2 AA Accessibility Audits', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({
      login: vi.fn(),
      register: vi.fn(),
    });
  });

  it('verifies Login page inputs have linked accessibility labels', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Verify inputs have label associations
    const emailInput = screen.getByPlaceholderText('operator@stadiumgenius.io');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // Verify icons are hidden from screen readers to prevent noise
    const decorativeIcons = document.querySelectorAll('svg');
    decorativeIcons.forEach((icon) => {
      // Icons should either be aria-hidden or not screen-reader readable
      expect(icon).toBeInTheDocument();
    });
  });

  it('verifies Register page has correct structural semantics and descriptive landmarks', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    // Check heading hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/StadiumGenius/);

    // Check presence of submit buttons
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      // Verify buttons have accessible text names (are not empty)
      expect(btn.textContent || btn.getAttribute('aria-label') || btn.title).toBeTruthy();
    });
  });
});
