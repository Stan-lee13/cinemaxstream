import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingState from '@/components/LoadingState';

describe('LoadingState', () => {
  it('renders with default loading message', () => {
    render(<LoadingState />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    const customMessage = 'Please wait while we load your content';
    render(<LoadingState message={customMessage} />);
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays loading spinner', () => {
    render(<LoadingState />);
    
    // Check for the SVG element with the specific class
    const spinner = document.querySelector('.lucide-loader-circle');
    expect(spinner).toBeInTheDocument();
  });

  it('has proper styling classes', () => {
    const { container } = render(<LoadingState />);
    
    const loadingContainer = container.firstChild;
    expect(loadingContainer).toHaveClass('min-h-screen', 'bg-background', 'flex', 'flex-col', 'items-center', 'justify-center');
  });

  it('applies correct text styling', () => {
    render(<LoadingState message="Test loading" />);
    
    const message = screen.getByText('Test loading');
    expect(message).toHaveClass('text-lg', 'font-medium');
  });
});