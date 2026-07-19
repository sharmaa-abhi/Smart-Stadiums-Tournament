import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Mock localStorage
const localStorageStore = {};
const localStorageMock = {
  getItem: vi.fn((key) => localStorageStore[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageStore[key] = value.toString();
  }),
  removeItem: vi.fn((key) => {
    delete localStorageStore[key];
  }),
  clear: vi.fn(() => {
    for (const key in localStorageStore) {
      delete localStorageStore[key];
    }
  }),
};
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {}
  };
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock Auth0 React SDK
const mockUseAuth0 = vi.fn(() => ({
  isLoading: false,
  isAuthenticated: false,
  user: null,
  loginWithRedirect: vi.fn(),
  logout: vi.fn(),
}));
global.mockUseAuth0 = mockUseAuth0;

vi.mock('@auth0/auth0-react', () => {
  return {
    Auth0Provider: ({ children }) => <div data-testid="auth0-provider">{children}</div>,
    useAuth0: () => global.mockUseAuth0(),
  };
});

// Mock Recharts ResponsiveContainer to avoid SVG sizing errors in jsdom
vi.mock('recharts', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    ResponsiveContainer: ({ children }) => <div className="responsive-container-mock">{children}</div>,
  };
});
