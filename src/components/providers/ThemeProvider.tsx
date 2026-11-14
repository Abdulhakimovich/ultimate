'use client';

import { useEffect } from 'react';
import { useThemeStore, type Theme } from '@/store/themeStore';
import { useLanguageStore, hydrateLanguage } from '@/store/languageStore';
import { getProfile } from '@/lib/data/profile';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const hydrateTheme = useThemeStore((s) => s.hydrateTheme);

  useEffect(() => {
    let resolvedTheme: Theme = 'dark';
    try {
      const saved = localStorage.getItem('ult_theme');
      if (saved === 'dark' || saved === 'light') {
        resolvedTheme = saved;
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        resolvedTheme = prefersDark ? 'dark' : 'light';
      }
    } catch {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolvedTheme = prefersDark ? 'dark' : 'light';
    }

    hydrateTheme(resolvedTheme);
    hydrateLanguage();

    // After mount, check if signed-in profile has saved preferences
    getProfile()
      .then((profile) => {
        if (!profile) return;
        if (profile.theme && (profile.theme === 'dark' || profile.theme === 'light')) {
          hydrateTheme(profile.theme);
          try {
            localStorage.setItem('ult_theme', profile.theme);
          } catch {}
        }
        if (profile.language && ['ru', 'en', 'uz'].includes(profile.language)) {
          useLanguageStore.setState({ language: profile.language });
          try {
            localStorage.setItem('ult_language', profile.language);
          } catch {}
        }
      })
      .catch(() => {
        // Not signed in or offline
      });
  }, [hydrateTheme]);

  return <>{children}</>;
}
