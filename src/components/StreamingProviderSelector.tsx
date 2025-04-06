
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, AlertTriangle, Star, Filter } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { getProviderIcon } from "@/utils/urlUtils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface Provider {
  id: string;
  name: string;
  isPremium?: boolean;
  isTorrent?: boolean;
  contentType?: string;
}

interface StreamingProviderSelectorProps {
  providers: Provider[];
  activeProvider: string;
  contentType: string;
  onProviderChange: (providerId: string) => void;
  variant?: 'default' | 'inline' | 'grid';
}

const StreamingProviderSelector = ({
  providers,
  activeProvider,
  contentType,
  onProviderChange,
  variant = 'default'
}: StreamingProviderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  
  // Find the active provider
  const currentProvider = providers.find(p => p.id === activeProvider) || providers[0];
  
  // Group providers by type for better organization
  const groupedProviders = providers.reduce((acc, provider) => {
    const group = provider.isPremium ? 'premium' : 
                  provider.isTorrent ? 'torrent' :
                  provider.contentType === 'anime' ? 'anime' : 'standard';
    
    if (!acc[group]) {
      acc[group] = [];
    }
    
    acc[group].push(provider);
    return acc;
  }, {} as Record<string, Provider[]>);

  // Apply filtering if needed
  const filteredProviders = filter 
    ? providers.filter(p => {
        if (filter === 'recommended') return p.contentType === contentType || p.contentType === 'all';
        if (filter === 'premium') return p.isPremium;
        if (filter === 'torrent') return p.isTorrent;
        if (filter === 'anime') return p.contentType === 'anime';
        return true;
      })
    : providers;
  
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {providers.map(provider => (
          <TooltipProvider key={provider.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onProviderChange(provider.id)}
                  className={`${
                    activeProvider === provider.id 
                      ? "bg-cinemax-500/20 border-cinemax-500 text-white" 
                      : "bg-background border-gray-700 text-gray-300"
                  }`}
                >
                  {provider.name}
                  {provider.isTorrent && <span className="text-xs ml-1 text-yellow-500">(Torrent)</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-xs">
                  {provider.isPremium && <Badge className="bg-yellow-500">Premium</Badge>}
                  {provider.isTorrent && <Badge className="bg-orange-500 ml-1">Torrent</Badge>}
                  {provider.contentType === 'anime' && <Badge className="bg-blue-500 ml-1">Anime</Badge>}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  }
  
  if (variant === 'grid') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 text-xs ${filter === 'recommended' ? 'bg-cinemax-500/20 text-white' : ''}`}
              onClick={() => setFilter(filter === 'recommended' ? null : 'recommended')}
            >
              Recommended
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 text-xs ${filter === 'premium' ? 'bg-cinemax-500/20 text-white' : ''}`}
              onClick={() => setFilter(filter === 'premium' ? null : 'premium')}
            >
              Premium
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`px-2 text-xs ${filter === 'torrent' ? 'bg-cinemax-500/20 text-white' : ''}`}
              onClick={() => setFilter(filter === 'torrent' ? null : 'torrent')}
            >
              Torrent
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredProviders.map(provider => (
              <Button
                key={provider.id}
                variant="outline"
                size="sm"
                onClick={() => onProviderChange(provider.id)}
                className={`justify-start ${
                  activeProvider === provider.id 
                    ? "bg-cinemax-500/20 border-cinemax-500 text-white" 
                    : "bg-background border-gray-700 text-gray-300"
                } hover:bg-gray-800/70 transition-all hover:scale-105 duration-150`}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="relative">
                    <img 
                      src={getProviderIcon(provider.id)} 
                      alt={provider.name}
                      className="w-4 h-4 rounded object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/play.png';
                      }}
                    />
                    {provider.isPremium && (
                      <Star className="absolute -top-1 -right-1 w-2 h-2 text-yellow-500" />
                    )}
                  </div>
                  <span className="truncate">{provider.name}</span>
                  {activeProvider === provider.id && (
                    <Check className="h-3 w-3 ml-auto" />
                  )}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  }
  
  // Default dropdown view
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between border-gray-700 bg-gray-800/50 hover:bg-gray-700/50"
        >
          <div className="flex items-center gap-2">
            <img 
              src={getProviderIcon(activeProvider)} 
              alt={currentProvider?.name}
              className="w-5 h-5 rounded object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/icons/play.png';
              }}
            />
            <span>{currentProvider?.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Select Provider</span>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`p-1 h-6 text-xs ${filter === 'recommended' ? 'bg-cinemax-500/20 text-white' : ''}`}
              onClick={() => setFilter(filter === 'recommended' ? null : 'recommended')}
            >
              Recommended
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`p-1 h-6 text-xs ${filter === 'premium' ? 'bg-cinemax-500/20 text-white' : ''}`}
              onClick={() => setFilter(filter === 'premium' ? null : 'premium')}
            >
              Premium
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-[300px]">
          {/* Recommended providers first */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-400 flex items-center">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              Recommended for {contentType}
            </DropdownMenuLabel>
            {providers
              .filter(p => p.contentType === contentType || p.contentType === 'all')
              .slice(0, 5)
              .map(provider => (
                <DropdownMenuItem
                  key={provider.id}
                  onClick={() => {
                    onProviderChange(provider.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img 
                      src={getProviderIcon(provider.id)} 
                      alt={provider.name}
                      className="w-4 h-4 rounded object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/icons/play.png';
                      }}
                    />
                    <span>{provider.name}</span>
                  </div>
                  {activeProvider === provider.id && (
                    <Check className="h-4 w-4" />
                  )}
                </DropdownMenuItem>
              ))}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Show all providers by group */}
          {Object.entries(groupedProviders).map(([group, groupProviders]) => {
            // Skip if filtered
            if (filter && (
              (filter === 'premium' && group !== 'premium') ||
              (filter === 'torrent' && group !== 'torrent') ||
              (filter === 'anime' && group !== 'anime')
            )) {
              return null;
            }
            
            // Get appropriate icon and label
            let groupIcon;
            let groupLabel;
            
            switch(group) {
              case 'premium':
                groupIcon = <Star className="w-3 h-3 mr-1 text-yellow-500" />;
                groupLabel = 'Premium Services';
                break;
              case 'torrent':
                groupIcon = <AlertTriangle className="w-3 h-3 mr-1 text-orange-500" />;
                groupLabel = 'Torrent Sources';
                break;
              case 'anime':
                groupIcon = <img src="/icons/anime.svg" alt="Anime" className="w-3 h-3 mr-1" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />;
                groupLabel = 'Anime Specific';
                break;
              default:
                groupIcon = null;
                groupLabel = 'Standard Sources';
            }
            
            return (
              <DropdownMenuGroup key={group}>
                <DropdownMenuLabel className="text-xs text-gray-400 flex items-center">
                  {groupIcon}
                  {groupLabel}
                </DropdownMenuLabel>
                
                {groupProviders.map(provider => (
                  <DropdownMenuItem
                    key={provider.id}
                    onClick={() => {
                      onProviderChange(provider.id);
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <img 
                        src={getProviderIcon(provider.id)} 
                        alt={provider.name}
                        className="w-4 h-4 rounded object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icons/play.png';
                        }}
                      />
                      <span>{provider.name}</span>
                    </div>
                    {activeProvider === provider.id && (
                      <Check className="h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            );
          })}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingProviderSelector;
