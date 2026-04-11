/**
 * Explore Page with filters
 * Browse by genre, year, rating, popularity, release date
 */

import { useState, useMemo, useCallback } from 'react';
import { useScrollRestore } from '@/hooks/usePersistentState';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContentCard from '@/components/ContentCard';
import { tmdbApi } from '@/services/tmdbApi';
import { ContentItem } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Loader2, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
  'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 'Mystery',
  'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

const YEARS = Array.from({ length: 30 }, (_, i) => String(2026 - i));

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'release', label: 'Newest First' },
  { value: 'title', label: 'A-Z' },
];

const Explore = () => {
  useScrollRestore('explore');
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [contentType, setContentType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(true);

  // Fetch content
  const { data: allContent, isLoading } = useQuery({
    queryKey: ['explore-content', contentType],
    queryFn: async () => {
      const [movies, series, anime] = await Promise.all([
        contentType === 'all' || contentType === 'movie' ? tmdbApi.getPopularMovies(1) : Promise.resolve([]),
        contentType === 'all' || contentType === 'series' ? tmdbApi.getPopularTvShows(1) : Promise.resolve([]),
        contentType === 'all' || contentType === 'anime' ? tmdbApi.getAnime(1) : Promise.resolve([]),
      ]);
      const trending = contentType === 'all' ? await tmdbApi.getTrendingMovies(1) : [];
      return [...trending, ...movies, ...series, ...anime];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter and sort
  const filteredContent = useMemo(() => {
    if (!allContent) return [];

    let items = [...allContent];

    // Deduplicate by id
    const seen = new Set<string>();
    items = items.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    // Filter by genre
    if (selectedGenres.length > 0) {
      items = items.filter(item =>
        item.genres?.some(g => selectedGenres.includes(g))
      );
    }

    // Filter by year
    if (selectedYear) {
      items = items.filter(item => item.year === selectedYear);
    }

    // Filter by rating
    if (minRating > 0) {
      items = items.filter(item => {
        const r = parseFloat(item.rating || '0');
        return r >= minRating;
      });
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        items.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
        break;
      case 'release':
        items.sort((a, b) => (b.year || '').localeCompare(a.year || ''));
        break;
      case 'title':
        items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default: // popularity — keep original order
        break;
    }

    return items;
  }, [allContent, selectedGenres, selectedYear, minRating, sortBy]);

  const toggleGenre = useCallback((genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedGenres([]);
    setSelectedYear('');
    setMinRating(0);
    setSortBy('popularity');
    setContentType('all');
  }, []);

  const hasActiveFilters = selectedGenres.length > 0 || selectedYear || minRating > 0 || contentType !== 'all';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Explore</h1>
            <p className="text-muted-foreground mt-1">
              Discover movies, series, and anime
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-destructive">
                <X className="h-4 w-4" /> Clear
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6 mb-8 space-y-6">
            {/* Content type */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Content Type</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'movie', 'series', 'anime'].map(type => (
                  <Button
                    key={type}
                    variant={contentType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setContentType(type)}
                    className="capitalize"
                  >
                    {type === 'all' ? 'All' : type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selectedGenres.includes(genre)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Year and Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Year</h3>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any year</SelectItem>
                    {YEARS.map(y => (
                      <SelectItem key={y} value={y}>{y}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Sort By</h3>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Min Rating: {minRating > 0 ? minRating.toFixed(1) : 'Any'}
                </h3>
                <Slider
                  value={[minRating]}
                  onValueChange={([v]) => setMinRating(v)}
                  max={9}
                  min={0}
                  step={0.5}
                  className="mt-3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4 text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${filteredContent.length} results`}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredContent.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredContent.map((item: ContentItem) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Explore;
