
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, X, Filter, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuthState";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BackButton from "@/components/BackButton";

interface WatchHistoryItem {
  id: string;
  content_id: string;
  title: string;
  poster_path: string;
  watch_time: number;
  duration: number;
  type: string;
  watched_at: string;
  progress: number;
  episode_id?: string;
  season_number?: number;
  episode_number?: number;
}

const WatchHistory = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState<WatchHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    // Simulating fetching watch history from an API
    const fetchWatchHistory = async () => {
      setIsLoading(true);
      
      try {
        // Here we would fetch from a real API, for now using mock data
        const mockHistory: WatchHistoryItem[] = [
          {
            id: "1",
            content_id: "movie-1",
            title: "The Dark Knight",
            poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
            watch_time: 7800, // seconds
            duration: 9000, // seconds
            type: "movie",
            watched_at: "2023-10-01T12:00:00Z",
            progress: 87, // percent
          },
          {
            id: "2",
            content_id: "series-1",
            title: "Stranger Things",
            poster_path: "https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
            watch_time: 2400,
            duration: 3600,
            type: "series",
            watched_at: "2023-09-28T18:30:00Z",
            progress: 67,
            episode_id: "s1e1",
            season_number: 1,
            episode_number: 1,
          },
          {
            id: "3",
            content_id: "movie-2",
            title: "Inception",
            poster_path: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
            watch_time: 8100,
            duration: 8800,
            type: "movie",
            watched_at: "2023-09-25T21:15:00Z",
            progress: 92,
          },
        ];
        
        setHistory(mockHistory);
      } catch (error) {
        console.error("Error fetching watch history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWatchHistory();
  }, [isAuthenticated, navigate]);

  const filteredHistory = filter === "all" 
    ? history 
    : history.filter(item => item.type === filter);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
  };

  const clearHistory = () => {
    // In a real app this would call an API to clear history
    setHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    // In a real app this would call an API to remove specific item
    setHistory(history.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-background pt-20 px-4 container mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <BackButton className="mr-4" />
          <h1 className="text-3xl font-bold">Watch History</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter size={14} />
                <span>{filter === "all" ? "All Content" : filter === "movie" ? "Movies" : "TV Shows"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Content
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("movie")}>
                Movies
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("series")}>
                TV Shows
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="destructive" 
            size="sm"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear History
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 border-4 border-cinemax-500 rounded-full border-t-transparent"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-medium mb-2">No watch history yet</h2>
          <p className="text-gray-400 mb-6">Your watch history will appear here once you start watching content</p>
          <Button 
            onClick={() => navigate("/")}
            className="bg-cinemax-500 hover:bg-cinemax-600"
          >
            Discover Content
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map(item => (
            <div key={item.id} className="bg-card rounded-lg overflow-hidden shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="relative md:w-48 h-36 md:h-auto">
                  <img 
                    src={item.poster_path} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      className="rounded-full bg-white/20 backdrop-blur-sm"
                      onClick={() => navigate(`/content/${item.content_id}`)}
                    >
                      <Play className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-gray-400">
                        {item.type === 'series' && `S${item.season_number} E${item.episode_number}`}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-400">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{formatDate(item.watched_at)}</span>
                        <span className="mx-2">•</span>
                        <span>Watched {formatWatchTime(item.watch_time)}</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-gray-400 hover:text-white"
                      onClick={() => removeHistoryItem(item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-1">{item.progress}% completed</p>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-cinemax-500 h-2 rounded-full" 
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistory;
