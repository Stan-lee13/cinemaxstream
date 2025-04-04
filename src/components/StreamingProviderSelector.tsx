
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
} from "@/components/ui/dropdown-menu";
import { getProviderIcon } from "@/utils/urlUtils";

interface StreamingProviderSelectorProps {
  providers: any[];
  activeProvider: string;
  contentType: string;
  onProviderChange: (providerId: string) => void;
  variant?: 'default' | 'inline';
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
  
  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap gap-2">
        {providers.map(provider => (
          <Button
            key={provider.id}
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
        ))}
      </div>
    );
  }
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between border-gray-700 bg-gray-800/50"
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
      
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>Select Provider</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {providers.map(provider => (
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StreamingProviderSelector;
