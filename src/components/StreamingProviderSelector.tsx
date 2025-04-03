
import { Button } from "@/components/ui/button";

interface StreamingProvider {
  id: string;
  name: string;
  contentType?: 'movies' | 'series' | 'all';
}

interface StreamingProviderSelectorProps {
  providers: StreamingProvider[];
  activeProvider: string;
  contentType?: string;
  onProviderChange: (providerId: string) => void;
}

const StreamingProviderSelector = ({
  providers,
  activeProvider,
  contentType = 'all',
  onProviderChange
}: StreamingProviderSelectorProps) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  // Filter providers based on content type if needed
  const filteredProviders = contentType !== 'all' 
    ? providers.filter(p => !p.contentType || p.contentType === 'all' || p.contentType === contentType) 
    : providers;

  if (filteredProviders.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-400">Source:</span>
      {filteredProviders.map(provider => (
        <Button
          key={provider.id}
          variant={activeProvider === provider.id ? "default" : "outline"}
          size="sm"
          onClick={() => onProviderChange(provider.id)}
          className={activeProvider === provider.id ? "bg-cinemax-500" : ""}
        >
          {provider.name}
        </Button>
      ))}
    </div>
  );
};

export default StreamingProviderSelector;
