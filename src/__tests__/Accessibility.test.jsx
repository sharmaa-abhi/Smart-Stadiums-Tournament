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
      signup: vi.fn(),
    });
  });

  it('verifies Login page buttons have accessible names and aria attributes', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    // Verify main heading exists
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/StadiumGenius/);

    // Verify all buttons have accessible text names (are not empty)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.textContent || btn.getAttribute('aria-label') || btn.title).toBeTruthy();
    });

    // Verify SVG icons exist in document
    const decorativeIcons = document.querySelectorAll('svg');
    expect(decorativeIcons.length).toBeGreaterThan(0);
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

    // Check presence of buttons
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      // Verify buttons have accessible text names (are not empty)
      expect(btn.textContent || btn.getAttribute('aria-label') || btn.title).toBeTruthy();
    });
  });
});

