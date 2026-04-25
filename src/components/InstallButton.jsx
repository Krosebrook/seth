import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function InstallButton() {
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt
    const handleInstallPromptReady = () => {
      setShowInstall(true);
    };

    window.addEventListener('installprompt-ready', handleInstallPromptReady);

    // Hide after app is installed
    const handleAppInstalled = () => {
      setShowInstall(false);
      setIsInstalled(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('installprompt-ready', handleInstallPromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    const prompt = window.tessaInstallPrompt;
    if (!prompt) return;

    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
    }

    window.tessaInstallPrompt = null;
  };

  if (isInstalled || !showInstall) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant="outline"
      size="sm"
      className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-400/20"
      title="Install Tessa as an app on your device"
    >
      <Download className="w-4 h-4 mr-2" />
      Install App
    </Button>
  );
}