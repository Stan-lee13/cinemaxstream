
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
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

interface StreamingProviderSelectorProps {
  providers: Provider[];
  activeProvider: string;
  contentType: string;
  onProviderChange: (providerId: string) => void;
  variant?: 'default' | 'inline' | 'grid';
}

interface Provider {
  id: string;
  name: string;
  isPremium?: boolean;
  isTorrent?: boolean;
  contentType?: string;
}

const StreamingProviderSelector = ({
  providers,
  activeProvider,
  contentType,
  onProviderChange,
  variant = 'default'
}: StreamingProviderSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

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

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {providers.map(provider => (
          <Button
            key={provider.id}
            variant="outline"
            size="sm"
            onClick={() => onProviderChange(provider.id)}
            className={`${activeProvider === provider.id
                ? "bg-cinemax-500/20 border-cinemax-500 text-white"
                : "bg-background border-gray-700 text-gray-300"
              }`}
          >
            {provider.name}
            {provider.isTorrent && <span className="text-xs ml-1 text-yellow-500">(Torrent)</span>}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {providers.map(provider => (
          <Button
            key={provider.id}
            variant="outline"
            size="sm"
            onClick={() => onProviderChange(provider.id)}
            className={`justify-start ${activeProvider === provider.id
                ? "bg-cinemax-500/20 border-cinemax-500 text-white"
                : "bg-background border-gray-700 text-gray-300"
              }`}
          >
            <div className="flex items-center gap-2 w-full">
              <img
                src={getProviderIcon(provider.id)}
                alt={provider.name}
                className="w-4 h-4 rounded object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icons/play.png';
                }}
              />
              <span className="truncate">{provider.name}</span>
              {activeProvider === provider.id && (
                <Check className="h-3 w-3 ml-auto" />
              )}
            </div>
          </Button>
        ))}
      </div>
    );
  }

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

      <DropdownMenuContent align="end" className="w-[250px]">
        <DropdownMenuLabel>Select Provider</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <ScrollArea className="h-[300px]">
          {/* Recommended providers first */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-gray-400">Recommended for {contentType}</DropdownMenuLabel>
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
          {Object.entries(groupedProviders).map(([group, groupProviders]) => (
            <DropdownMenuGroup key={group}>
              <DropdownMenuLabel className="text-xs text-gray-400">
                {group === 'premium' ? 'Premium Services' :
                  group === 'torrent' ? 'Torrent Sources' :
                    group === 'anime' ? 'Anime Specific' : 'Standard Sources'}
              </DropdownMenuLabel>

              {Array.isArray(groupProviders) && groupProviders.map(provider => (
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
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingProviderSelector;
