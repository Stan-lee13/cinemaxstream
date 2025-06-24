
import React from "react";
import { useAIRecommendations } from "@/hooks/useAIRecommendations";
import { useContinueWatching } from "@/hooks/useContinueWatching";
import { Sparkles, Clock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import LoadingState from "@/components/LoadingState";

const PersonalizedSections: React.FC = () => {
  const { recommendations, isLoading: aiLoading } = useAIRecommendations();
  const { continueWatchingItems, isLoading: continueLoading } = useContinueWatching();

  return (
    <div className="space-y-12">
      {/* AI Recommendations */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-cinemax-400" />
          <h2 className="text-2xl font-bold">Just for You</h2>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            AI Powered
          </span>
        </div>
        
        {aiLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-cinemax-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="bg-card rounded-lg p-4 hover:bg-card/80 transition-colors">
                <div className="aspect-[2/3] bg-gray-800 rounded mb-3 flex items-center justify-center">
                  <span className="text-gray-400 text-sm text-center px-2">
                    {rec.title}
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1 line-clamp-2">{rec.title}</h3>
                <p className="text-xs text-gray-400 mb-2 line-clamp-2">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cinemax-400">{rec.genre}</span>
                  <span className="text-xs text-gray-500">
                    {Math.round(rec.confidence * 100)}% match
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Watch some content to get personalized recommendations!</p>
          </div>
        )}
      </section>

      {/* Continue Watching */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">Continue Watching</h2>
        </div>
        
        {continueLoading ? (
          <LoadingState message="Loading your progress..." />
        ) : continueWatchingItems.length > 0 ? (
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
                        className="bg-cinemax-500 h-full transition-all"
                        style={{ width: `${item.progress || 0}%` }}
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
        ) : (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No content in progress. Start watching something!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default PersonalizedSections;
