
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { Crown, Download, Play } from 'lucide-react';

const CreditUsageBar: React.FC = () => {
  const { userProfile, userUsage, getCreditLimits, isLoading } = useCreditSystem();

  if (isLoading || !userProfile || !userUsage) {
    return null;
  }

  const limits = getCreditLimits();
  if (!limits) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'premium': return 'text-yellow-500';
      case 'pro': return 'text-blue-500';
      default: return 'text-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'premium': return 'bg-yellow-500/20 border-yellow-500/30';
      case 'pro': return 'bg-blue-500/20 border-blue-500/30';
      default: return 'bg-gray-500/20 border-gray-500/30';
    }
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-gray-800 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Usage Overview</h3>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getRoleBadge(userProfile.role)}`}>
          <div className="flex items-center gap-1">
            {userProfile.role === 'premium' && <Crown size={14} />}
            <span className={getRoleColor(userProfile.role)}>
              {userProfile.role.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Play size={16} className="text-cinemax-500" />
              <span className="text-sm font-medium">Streams Today</span>
            </div>
            <span className="text-sm text-gray-400">
              {`${userUsage.watched_today} / ∞`}
            </span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Download size={16} className="text-green-500" />
              <span className="text-sm font-medium">Downloads Today</span>
            </div>
            <span className="text-sm text-gray-400">
              {limits.unlimited || userProfile.role === 'pro' || userProfile.role === 'premium'
                ? `${userUsage.downloads_today} / ∞`
                : `${userUsage.downloads_today} / ${limits.maxDownloads}`
              }
          </span>
          </div>
          {!(limits.unlimited || userProfile.role === 'pro' || userProfile.role === 'premium') && limits.maxDownloads > 0 && (
            <Progress
              value={(userUsage.downloads_today / limits.maxDownloads) * 100}
              className="h-2"
            />
          )}
        </div>

        {/* Reset Timer */}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
          Credits reset daily at midnight ({userProfile.timezone})
        </div>
      </div>
    </div>
  );
};

export default CreditUsageBar;
