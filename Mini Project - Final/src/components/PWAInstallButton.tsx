import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detect if already installed or running standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="w-full py-2 px-3 rounded-xl bg-[#2E2741] hover:bg-[#433A5E] text-[#FBF9F2] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        title="Install Kira's To-Do List to home screen"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#E7D1DA]" />
        <span>Install App on Device</span>
        <Download className="w-3 h-3 text-[#E7D1DA] ml-auto" />
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E2741]/50 backdrop-blur-xs">
          <div className="bg-[#FBF9F2] border border-[#DDD6EC] rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-[#2E2741]">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#766E87] hover:text-[#2E2741] hover:bg-[#EDE9F6]"
            >
              <X className="w-4 h-4" />
            </button>
            <h4 className="font-display font-bold text-base text-[#2E2741] mb-2">
              Install on iPhone or iPad
            </h4>
            <p className="text-xs text-[#766E87] leading-relaxed mb-4 font-mono">
              1. Tap the <strong className="text-[#2E2741]">Share</strong> button in the Safari toolbar.<br />
              2. Scroll down and tap <strong className="text-[#2E2741]">Add to Home Screen</strong>.<br />
              3. Tap <strong className="text-[#2E2741]">Add</strong> in the top right.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2 rounded-xl bg-[#2E2741] text-white text-xs font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
