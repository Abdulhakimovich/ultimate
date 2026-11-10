import { create } from 'zustand';
import type { Language } from '@/lib/i18n';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ult_language') as Language;
      if (saved && ['ru', 'en', 'uz'].includes(saved)) return saved;
    }
    return 'ru';
  })(),
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ult_language', lang);
    }
    set({ language: lang });
  },
}));
