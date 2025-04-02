
import { useState } from "react";
import { ChevronDown, ChevronUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EpisodeSelectorProps {
  seasons: Season[];
  onEpisodeSelect: (seasonNumber: number, episodeNumber: number) => void;
}

const EpisodeSelector = ({ seasons, onEpisodeSelect }: EpisodeSelectorProps) => {
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]?.season_number || 1);
  const [expandedEpisodes, setExpandedEpisodes] = useState<number[]>([]);

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

  const currentSeason = seasons.find(s => s.season_number === selectedSeason);
  
  if (!seasons.length || !currentSeason) {
    return <div className="text-gray-400">No episodes available</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <h3 className="text-lg font-medium">Episodes</h3>
        <Select value={selectedSeason.toString()} onValueChange={handleSeasonChange}>
          <SelectTrigger className="w-[180px] bg-secondary/50 border-gray-700">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map(season => (
              <SelectItem key={season.season_number} value={season.season_number.toString()}>
                Season {season.season_number}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
                  <p className="text-sm text-gray-400">{episode.duration || "Unknown duration"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-cinemax-500 hover:bg-cinemax-600 gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEpisodeSelect(selectedSeason, episode.episode_number);
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
                <p className="text-gray-300 text-sm">{episode.description || "No description available."}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EpisodeSelector;
