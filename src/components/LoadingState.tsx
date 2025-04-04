
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState = ({ message = "Loading..." }: LoadingStateProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-cinemax-500" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
