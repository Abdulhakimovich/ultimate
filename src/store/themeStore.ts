import { create } from 'zustand';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  hydrateTheme: (t: Theme) => void;
}

// Always start with 'dark' so SSR and first client render match.
// ThemeProvider hydrates the real value from localStorage via useEffect.
export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === 'dark' ? 'light' : 'dark';
      if (typeof window !== 'undefined') {
        localStorage.setItem('ult_theme', next);
        document.documentElement.setAttribute('data-theme', next);
      }
      return { theme: next };
    }),
  setTheme: (t) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ult_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    }
    set({ theme: t });
  },
  hydrateTheme: (t) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
    set({ theme: t });
  },
}));
