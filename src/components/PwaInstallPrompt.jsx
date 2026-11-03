'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, Smartphone } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true); // default true until verified on client

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('PWA Service Worker registered with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already installed in standalone mode
    const checkStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');

    setIsStandalone(checkStandalone);
    if (checkStandalone) return;

    // 3. Check if user dismissed recently (within 3 days)
    const dismissedAt = localStorage.getItem('calorielens_pwa_dismissed');
    if (dismissedAt) {
      const daysSinceDismissed = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 3) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } else {
      setIsDismissed(false);
    }

    // 4. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 5. Capture Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setIsDismissed(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 6. Listen for successful app installation
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.removeItem('calorielens_pwa_dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 7. Support manual trigger from Profile or other pages
    const handleManualTrigger = () => {
      setIsDismissed(false);
      if (isIosDevice) {
        setShowIosGuide(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      }
    };

    window.addEventListener('trigger-pwa-install', handleManualTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('trigger-pwa-install', handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback for browsers without direct prompt
      setShowIosGuide(true);
      return;
    }

    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIosGuide(false);
    localStorage.setItem('calorielens_pwa_dismissed', Date.now().toString());
  };

  // If running as an installed standalone app, or user dismissed, don't render
  if (isStandalone || isDismissed) {
    return null;
  }

  // Only show on mobile devices or if installable
  if (!isInstallable && !isIos) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 dark:bg-[#0c1017]/95 border border-slate-200/90 dark:border-emerald-500/30 p-4 sm:p-5 rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-black/70 backdrop-blur-2xl relative overflow-hidden transition-colors">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-16 bg-emerald-500/20 blur-xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer"
          aria-label="Dismiss install prompt"
        >
          <X size={16} />
        </button>

        {/* Normal Install Banner View */}
        {!showIosGuide ? (
          <div className="flex items-start gap-3.5 pr-6">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full rounded-[14px] bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon-192.png" alt="CalorieLens" className="w-9 h-9 object-contain" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Install CalorieLens
                </h4>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  App
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Add to your home screen for full-screen camera logging and offline tracking.
              </p>

              <div className="flex items-center gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={14} strokeWidth={2.5} />
                  <span>{isIos ? 'Install on iPhone' : 'Install App'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="py-2 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
                >
                  Not now
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* iOS Step-by-Step Guide View */
          <div className="space-y-3.5 pr-5">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <Smartphone size={15} />
              <span>Install on iPhone & iPad</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Safari lets you install CalorieLens directly to your home screen in 2 quick taps:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <span className="flex-1 text-slate-700 dark:text-slate-300">
                  Tap the <strong className="text-slate-900 dark:text-white">Share</strong> button <Share size={13} className="inline mx-1 text-blue-500" /> at bottom of Safari
                </span>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <span className="flex-1 text-slate-700 dark:text-slate-300">
                  Scroll down & select <strong className="text-slate-900 dark:text-white">Add to Home Screen</strong> <PlusSquare size={13} className="inline mx-1 text-emerald-500" />
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition hover:scale-[1.02] active:scale-95 text-center cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Got It
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
