
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Play, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDuration } from "@/utils/urlUtils";

interface EpisodeSelectorProps {
  seasons: Season[];
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
}

const EpisodeSelector = ({ seasons, onEpisodeSelect }: EpisodeSelectorProps) => {
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [expandedEpisodes, setExpandedEpisodes] = useState<number[]>([]);

  // Set default selected season
  useEffect(() => {
    if (seasons.length > 0 && selectedSeason === null) {
      setSelectedSeason(seasons[0].season_number);
    }
  }, [seasons, selectedSeason]);

  const handleSeasonChange = (value: string) => {
    setSelectedSeason(parseInt(value));
    setExpandedEpisodes([]);
  };

  const toggleEpisode = (episodeNumber: number) => {
    setExpandedEpisodes(prev => 
      prev.includes(episodeNumber) 
        ? prev.filter(ep => ep !== episodeNumber)
        : [...prev, episodeNumber]
    );
  };

  // Format air date
  const formatAirDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Unknown date";
    }
  };

  const currentSeason = selectedSeason !== null ? seasons.find(s => s.season_number === selectedSeason) : null;
  
  if (!seasons.length || !currentSeason) {
    return <div className="text-gray-400">No episodes available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-medium">Episodes</h3>
        <Select 
          value={selectedSeason.toString()} 
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger className="w-[180px] bg-secondary/50 border-gray-700">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map(season => (
              <SelectItem key={season.season_number} value={season.season_number.toString()}>
                Season {season.season_number}
                {season.episode_count ? ` (${season.episode_count} episodes)` : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {currentSeason.episodes && currentSeason.episodes.length > 0 ? (
        <div className="space-y-2">
          {currentSeason.episodes.map(episode => (
            <div 
              key={episode.id} 
              className="border border-gray-800 rounded-md overflow-hidden bg-black/20"
            >
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-800/50"
                onClick={() => toggleEpisode(episode.episode_number)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md bg-gray-800 flex items-center justify-center">
                    {episode.episode_number}
                  </div>
                  <div>
                    <h4 className="font-medium">{episode.title}</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      {episode.duration && (
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{episode.duration}</span>
                        </div>
                      )}
                      {episode.air_date && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{formatAirDate(episode.air_date)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    className="bg-cinemax-500 hover:bg-cinemax-600 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEpisodeSelect(currentSeason.season_number, episode.episode_number);
                    }}
                  >
                    <Play size={14} />
                    <span>Play</span>
                  </Button>
                  {expandedEpisodes.includes(episode.episode_number) ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {expandedEpisodes.includes(episode.episode_number) && (
                <div className="p-3 border-t border-gray-800 bg-black/30">
                  <div className="flex gap-3 mb-3">
                    {episode.image && (
                      <img 
                        src={episode.image} 
                        alt={episode.title} 
                        className="w-40 h-24 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">Episode {episode.episode_number}: {episode.title}</h4>
                      <p className="text-gray-300 text-sm">{episode.description || "No description available."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 border border-gray-800 rounded-md text-center">
          <p className="text-gray-400 mb-2">No episodes available for this season</p>
          <Button 
            variant="outline" 
            className="border-gray-700"
            onClick={() => {
              if (seasons.length > 1) {
                const nextSeason = seasons.find(s => s.season_number !== selectedSeason);
                if (nextSeason) {
                  setSelectedSeason(nextSeason.season_number);
                }
              }
            }}
          >
            Try Another Season
          </Button>
        </div>
      )}
    </div>
  );
};

export default EpisodeSelector;
