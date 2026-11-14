import { create } from 'zustand';
import { updateProfile } from '@/lib/data/profile';

export type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  hydrateTheme: (t: Theme) => void;
}

// Always start with 'dark' so SSR and first client render match.
// ThemeProvider hydrates the real value from localStorage / profile via useEffect.
export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  toggleTheme: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  setTheme: (t) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ult_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    }
    set({ theme: t });
    updateProfile({ theme: t }).catch(() => {
      // Ignore if offline or not signed in
    });
  },
  hydrateTheme: (t) => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
    set({ theme: t });
  },
}));
