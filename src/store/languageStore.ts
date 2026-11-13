import { create } from 'zustand';
import type { Language } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

// Always start with 'ru' so SSR and first client render match.
// ThemeProvider / TopNav hydrates the real value from localStorage via useEffect.
export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'ru',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ult_language', lang);
    }
    set({ language: lang });
  },
}));

// Call this once on the client after mount to sync with localStorage.
export function hydrateLanguage() {
  if (typeof window === 'undefined') return;
  const saved = localStorage.getItem('ult_language') as Language;
  if (saved && ['ru', 'en', 'uz'].includes(saved)) {
    useLanguageStore.getState().setLanguage(saved);
  }
}
