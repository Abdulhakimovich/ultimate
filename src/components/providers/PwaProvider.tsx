'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnected, setShowReconnected] = useState<boolean>(false);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  useEffect(() => {
    // 1. Initial online status check
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
    }

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Register Service Worker in production / supported environments
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          // Check for service worker updates
          reg.onupdatefound = () => {
            const installing = reg.installing;
            if (installing) {
              installing.onstatechange = () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available
                  console.log('[PWA] New version ready to activate.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {children}

      {/* Floating Offline / Online Status Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.aside
            key="offline-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl no-print"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent-orange)',
              color: 'var(--text-primary)',
            }}
          >
            <WifiOff size={15} style={{ color: 'var(--accent-orange)' }} className="animate-pulse" />
            <span className="text-xs font-semibold">{tr.ui.offlineMode}</span>
          </motion.aside>
        )}

        {isOnline && showReconnected && (
          <motion.aside
            key="online-banner"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl no-print"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--accent-green)',
              color: 'var(--text-primary)',
            }}
          >
            <CheckCircle2 size={15} style={{ color: 'var(--accent-green)' }} />
            <span className="text-xs font-semibold">{tr.ui.onlineRestored}</span>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
