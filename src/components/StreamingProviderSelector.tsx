
import { Button } from "@/components/ui/button";

interface StreamingProvider {
  id: string;
  name: string;
}

interface StreamingProviderSelectorProps {
  providers: StreamingProvider[];
  activeProvider: string;
  onProviderChange: (providerId: string) => void;
}

const StreamingProviderSelector = ({
  providers,
  activeProvider,
  onProviderChange
}: StreamingProviderSelectorProps) => {
  if (!providers || providers.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-gray-400">Source:</span>
      {providers.map(provider => (
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
