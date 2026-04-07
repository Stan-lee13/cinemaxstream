import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SkipLink from '@/components/SkipLink';

describe('SkipLink', () => {
  it('renders skip link with correct href and content', () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>);
    
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('is initially hidden with sr-only class', () => {
    render(<SkipLink href="#navigation">Skip to navigation</SkipLink>);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveClass('sr-only');
  });

  it('becomes visible when focused', async () => {
    const user = userEvent.setup();
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>);
    
    const skipLink = screen.getByRole('link');
    
    // Initially should have sr-only class
    expect(skipLink).toHaveClass('sr-only');
    
    // Focus the skip link
    await user.tab();
    expect(skipLink).toHaveFocus();
    
    // Should not have sr-only class when focused
    expect(skipLink).not.toHaveClass('sr-only');
  });

  it('has proper accessibility styling', () => {
    render(<SkipLink href="#main-content">Skip to main content</SkipLink>);
    
    const skipLink = screen.getByRole('link');
    expect(skipLink).toHaveClass(
      'focus:absolute',
      'focus:top-4',
      'focus:left-4',
      'focus:z-50',
      'focus:px-4',
      'focus:py-2',
      'focus:bg-primary',
      'focus:text-primary-foreground',
      'focus:rounded-md',
      'focus:shadow-lg',
      'focus:outline-none',
      'focus:ring-2',
      'focus:ring-primary',
      'focus:ring-offset-2'
    );
  });

  it('renders children content correctly', () => {
    render(
      <SkipLink href="#footer">
        <span>Skip to footer</span>
      </SkipLink>
    );
    
    expect(screen.getByText('Skip to footer')).toBeInTheDocument();
  });
});