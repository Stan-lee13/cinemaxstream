import React from "react";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { useQuery } from "@tanstack/react-query";
import { tmdbApi } from "@/services/tmdbApi";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/LoadingState";
import ContentCard from "@/components/ContentCard";
import { ContentItem } from "@/types/content";

const PersonalizedSections: React.FC = () => {
  const { recommendations, isLoading: aiLoading } = useAIRecommendations();
  const { continueWatchingItems, isLoading: continueLoading } = useContinueWatching();

  // Get hourly rotating default content for "Just for You"
  const { data: rotatingContent, isLoading: rotatingLoading } = useQuery({
    queryKey: ['rotating-content', Math.floor(Date.now() / (1000 * 60 * 60))], // Refresh every hour
    queryFn: async () => {
      const trending = await tmdbApi.getTrendingMovies(1);
      const popular = await tmdbApi.getPopularMovies(1);
      const anime = await tmdbApi.getAnime(1);
      
      // Mix different types and shuffle for variety
      const mixedContent = [...trending.slice(0, 4), ...popular.slice(0, 3), ...anime.slice(0, 3)];
      return mixedContent.sort(() => Math.random() - 0.5).slice(0, 10);
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  return (
    <div className="space-y-12">
      {/* Just for You - Always show with rotating content */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-cinemax-400" />
          <h2 className="text-2xl font-bold">Just for You</h2>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            Refreshes Hourly
          </span>
        </div>
        
        {rotatingLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-cinemax-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rotatingContent && rotatingContent.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
            {rotatingContent.map((item: ContentItem) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Loading personalized content...</p>
          </div>
        )}
      </section>

      {/* Continue Watching - Only show if user has items */}
      {continueWatchingItems.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold">Continue Watching</h2>
          </div>
          
          {continueLoading ? (
            <LoadingState message="Loading your progress..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {continueWatchingItems.map((item) => (
                <div key={item.id} className="bg-card rounded-lg p-4 hover:bg-card/80 transition-colors">
                  <div className="aspect-[16/9] bg-gray-800 rounded mb-3 relative overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                          <div
                            className={`bg-cinemax-500 h-full transition-all w-[${Math.min(Math.max(item.progress || 0, 0), 100)}%]`}
                          />
                        </div>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                  {item.episode && (
                    <p className="text-xs text-gray-400 mb-2">
                      S{item.season}E{item.episode}
                    </p>
                  )}
                  <Button 
                    size="sm" 
                    className="w-full bg-cinemax-500 hover:bg-cinemax-600"
                    onClick={() => window.location.href = `/content/${item.contentId}`}
                  >
                    Continue
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default PersonalizedSections;