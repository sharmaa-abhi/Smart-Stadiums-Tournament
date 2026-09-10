import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import BottomNav from '../components/BottomNav';
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
      user: {
        role: 'admin',
        name: 'Stadium Admin',
        email: 'admin@stadiumgenius.io',
        permissions: ['manage:dashboard']
      },
      sidebarCollapsed: false,
      toggleSidebar: vi.fn(),
      logout: vi.fn(),
      closeMobileSidebar: vi.fn(),
      openProfile: vi.fn(),
      closeProfile: vi.fn(),
      isProfileOpen: false,
      mobileSidebarOpen: false
    });
  });

  it('verifies Sidebar elements have accessible names and aria attributes', () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    );

    // Verify main heading exists
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toHaveTextContent(/StadiumGenius/);

    // Verify all buttons have accessible text names
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.textContent || btn.getAttribute('aria-label') || btn.title).toBeTruthy();
    });

    // Verify SVG icons exist in document
    const decorativeIcons = document.querySelectorAll('svg');
    expect(decorativeIcons.length).toBeGreaterThan(0);
  });

  it('verifies BottomNav has correct structural semantics and navigation landmarks', () => {
    render(
      <BrowserRouter>
        <BottomNav />
      </BrowserRouter>
    );

    // Check navigation landmark
    const nav = screen.getByRole('navigation', { name: /Mobile Navigation/i });
    expect(nav).toBeInTheDocument();

    // Verify navigation links have accessible text
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link.textContent).toBeTruthy();
    });
  });
});

