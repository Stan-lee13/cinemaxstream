
import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  useEffect(() => {
    // Check if prompt has been shown before
    const hasShownBefore = localStorage.getItem('pwa-prompt-shown') === 'true';
    setHasBeenShown(hasShownBefore);

    // Show prompt after 10 seconds if installable and not shown before
    if (isInstallable && !hasShownBefore && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled, hasBeenShown]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
      localStorage.setItem('pwa-prompt-shown', 'true');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-shown', 'true');
  };

  if (!showPrompt || !isInstallable || isInstalled) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto bg-background border border-gray-800">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-cinemax-400 to-cinemax-600 rounded-full flex items-center justify-center">
            <Download className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Install CinemaxStream
          </CardTitle>
          <CardDescription className="text-gray-400">
            Get the full app experience with faster loading and offline access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cinemax-400 rounded-full"></div>
              <span>Access from your home screen</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cinemax-400 rounded-full"></div>
              <span>Faster loading times</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cinemax-400 rounded-full"></div>
              <span>Works offline</span>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleDismiss}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Not Now
            </Button>
            <Button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-cinemax-400 to-cinemax-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallPrompt;
