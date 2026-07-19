import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from '../components/ErrorBoundary';

// Helper component that throws an error when requested
function ProblematicComponent({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test rendering crash');
  }
  return <div data-testid="normal-content">All good!</div>;
}

describe('ErrorBoundary Component', () => {
  let consoleErrorMock;

  beforeEach(() => {
    // Suppress console.error output during intentional throwing tests
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  it('renders children normally when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('normal-content')).toBeInTheDocument();
    expect(screen.queryByText('System Glitch Intercepted')).not.toBeInTheDocument();
  });

  it('catches render exceptions and renders the fallback UI', () => {
    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByTestId('normal-content')).not.toBeInTheDocument();
    expect(screen.getByText('System Glitch Intercepted')).toBeInTheDocument();
    expect(screen.getByText('Error: Test rendering crash')).toBeInTheDocument();
  });

  it('provides a reset and reload button', () => {
    const originalReload = window.location.reload;
    const reloadMock = vi.fn();
    
    // Temporarily mock window.location
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
      writable: true,
      configurable: true
    });

    render(
      <ErrorBoundary>
        <ProblematicComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetBtn = screen.getByRole('button', { name: /Reset & Retry/i });
    fireEvent.click(resetBtn);

    expect(reloadMock).toHaveBeenCalled();

    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: { reload: originalReload },
      writable: true,
      configurable: true
    });
  });
});
