
import { Crown, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PremiumBadgeProps {
  className?: string;
  showLock?: boolean;
}

const PremiumBadge = ({ className = "", showLock = false }: PremiumBadgeProps) => {
  const { isPremium } = useAuth();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-md ${className}`}>
            {isPremium || !showLock ? (
              <Crown size={14} className="text-yellow-500" />
            ) : (
              <Lock size={14} className="text-yellow-500" />
            )}
            <span className="text-yellow-500 text-xs font-medium">Premium</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isPremium 
            ? "Premium content available" 
            : "Subscribe or enter premium code to watch"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default PremiumBadge;
