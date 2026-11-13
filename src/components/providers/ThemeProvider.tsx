'use client';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';
import { hydrateLanguage } from '@/store/languageStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const setTheme = useThemeStore((s) => s.setTheme);

  useEffect(() => {
    // Hydrate theme from localStorage (or system preference) after mount
    const saved = localStorage.getItem('ult_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = (saved as 'dark' | 'light') ?? (prefersDark ? 'dark' : 'dark');
    setTheme(theme);
    if (!saved) localStorage.setItem('ult_theme', theme);

    // Hydrate language from localStorage after mount
    hydrateLanguage();
  }, [setTheme]);

  return <>{children}</>;
}
