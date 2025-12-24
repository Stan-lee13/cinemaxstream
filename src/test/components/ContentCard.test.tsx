import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ContentCard from '@/components/ContentCard';
import { Content } from '@/types/content';

// Mock content data
const mockContent: Content = {
  id: '1',
  title: 'Test Movie',
  poster: 'https://example.com/poster.jpg',
  image: 'https://example.com/image.jpg',
  rating: '8.5',
  year: '2023',
  description: 'A test movie for unit testing',
  category: 'Action',
  duration: '120 mins',
  type: 'movie'
};

const mockContentWithoutImage: Content = {
  id: '2',
  title: 'Test Movie Without Image',
  poster: '',
  image: '',
  rating: '7.0',
  year: '2022',
  description: 'A test movie without poster image',
  category: 'Drama',
  duration: '95 mins',
  type: 'movie'
};

// Wrapper component for testing
const ContentCardWrapper = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('ContentCard', () => {
  it('renders content information correctly', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} />
      </ContentCardWrapper>
    );
    
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
    expect(screen.getByText('8.5')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play test movie/i })).toBeInTheDocument();
  });

  it('displays poster image with proper alt text', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} />
      </ContentCardWrapper>
    );
    
    const posterImage = screen.getByAltText('Test Movie poster');
    expect(posterImage).toBeInTheDocument();
    expect(posterImage).toHaveAttribute('src', 'https://example.com/poster.jpg');
    expect(posterImage).toHaveAttribute('loading', 'lazy');
  });

  it('shows fallback when no image is available', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContentWithoutImage} />
      </ContentCardWrapper>
    );
    
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
    expect(screen.getByLabelText(/no image available for test movie without image/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} />
      </ContentCardWrapper>
    );
    
    expect(screen.getByRole('article')).toBeInTheDocument();
    expect(screen.getByLabelText(/rating: 8.5/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/year: 2023/i)).toBeInTheDocument();
  });

  it('calls onCardClick when card is clicked', async () => {
    const mockOnCardClick = vi.fn();
    const user = userEvent.setup();
    
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} onCardClick={mockOnCardClick} />
      </ContentCardWrapper>
    );
    
    const cardLink = screen.getByRole('link');
    await user.click(cardLink);
    
    expect(mockOnCardClick).toHaveBeenCalledWith(mockContent);
  });

  it('has proper focus indicators', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} />
      </ContentCardWrapper>
    );
    
    const cardLink = screen.getByRole('link');
    expect(cardLink).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
    
    const playButton = screen.getByRole('button', { name: /play test movie/i });
    expect(playButton).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2'
    );
  });

  it('returns null for invalid content ID', () => {
    const invalidContent: Partial<Content> = { ...mockContent, id: '' };
    
    const { container } = render(
      <ContentCardWrapper>
        <ContentCard item={invalidContent as Content} />
      </ContentCardWrapper>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('displays proper ARIA labels for rating and year', () => {
    render(
      <ContentCardWrapper>
        <ContentCard item={mockContent} />
      </ContentCardWrapper>
    );
    
    expect(screen.getByLabelText('Rating: 8.5')).toBeInTheDocument();
    expect(screen.getByLabelText('Year: 2023')).toBeInTheDocument();
  });

  it('handles missing rating and year gracefully', () => {
    const contentWithoutMeta: Content = { 
      ...mockContent, 
      id: '1',
      rating: '',
      year: ''
    };
    
    render(
      <ContentCardWrapper>
        <ContentCard item={contentWithoutMeta} />
      </ContentCardWrapper>
    );
    
    expect(screen.getByLabelText('Rating: Not rated')).toBeInTheDocument();
    expect(screen.getByLabelText('Year: Unknown')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
