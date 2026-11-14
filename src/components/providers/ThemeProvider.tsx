'use client';

import { useEffect } from 'react';
import { useThemeStore, type Theme } from '@/store/themeStore';
import { hydrateLanguage } from '@/store/languageStore';

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
  }, [hydrateTheme]);

  return <>{children}</>;
}
