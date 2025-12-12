import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SkipLink from '@/components/SkipLink';

// Simple test for core navigation accessibility
describe('Navigation Accessibility', () => {
  it('renders skip link correctly', () => {
    render(
      <BrowserRouter>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
      </BrowserRouter>
    );
    
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('skip link has proper accessibility attributes', () => {
    render(
      <BrowserRouter>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
      </BrowserRouter>
    );
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveAttribute('href', '#navigation');
    expect(skipLink).toHaveClass('sr-only');
  });
});