/**
 * Continue Watching Component
 * 
 * Displays content the user started but hasn't finished watching.
 * Persists progress across sessions using Supabase watch_sessions table.
 */

import React, { memo } from 'react';
import { useContinueWatching, ContinueWatchingItem } from '@/hooks/useContinueWatching';
import { Button } from '@/components/ui/button';
import { Play, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface ContinueWatchingCardProps {
  item: ContinueWatchingItem;
  onRemove?: (id: string) => void;
}

const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = memo(({ item, onRemove }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate(`/content/${item.contentId}`);
  };

  const formatProgress = (progress: number) => {
    return `${Math.round(progress)}% watched`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group relative bg-card hover:bg-card/80 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 min-w-[280px] sm:min-w-[320px]"
    >
      {/* Thumbnail */}
      <div className="aspect-video relative overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground/50" />
          </div>
        )}
        
        {/* Progress Bar Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3">
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(item.progress || 0, 0), 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
          <Button
            onClick={handleContinue}
            size="lg"
            className="rounded-full w-14 h-14 bg-white/90 hover:bg-white text-black shadow-xl"
          >
            <Play className="h-6 w-6 ml-1" fill="currentColor" />
          </Button>
        </div>

        {/* Remove Button */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Remove from continue watching"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Content Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm mb-1 line-clamp-1">
          {item.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {item.season && item.episode && (
              <span className="bg-muted px-2 py-0.5 rounded">
                S{item.season} E{item.episode}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatProgress(item.progress)}
            </span>
          </div>
        </div>

        <Button
          onClick={handleContinue}
          size="sm"
          className="w-full mt-3 bg-primary hover:bg-primary/90"
        >
          <Play className="h-4 w-4 mr-1" />
          Continue
        </Button>
      </div>
    </motion.div>
  );
});

ContinueWatchingCard.displayName = 'ContinueWatchingCard';

const ContinueWatching: React.FC = memo(() => {
  const { continueWatchingItems, isLoading } = useContinueWatching();

  if (isLoading) {
    return (
      <section className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-foreground">Continue Watching</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[280px] sm:min-w-[320px] h-[220px] bg-muted rounded-xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (continueWatchingItems.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-6 h-6 text-blue-400" />
        <h2 className="text-2xl font-bold text-foreground">Continue Watching</h2>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {continueWatchingItems.length} {continueWatchingItems.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4">
          <AnimatePresence>
            {continueWatchingItems.map((item) => (
              <ContinueWatchingCard key={item.id} item={item} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
});

ContinueWatching.displayName = 'ContinueWatching';

export default ContinueWatching;
