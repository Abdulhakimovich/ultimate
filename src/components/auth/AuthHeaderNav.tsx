'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sun, Moon, ArrowLeft, Globe } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { t, LANGUAGE_OPTIONS } from '@/lib/i18n';

export default function AuthHeaderNav() {
  const [mounted, setMounted] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayLang = mounted ? language : 'ru';
  const displayTheme = mounted ? theme : 'dark';
  const tr = t(displayLang);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === displayLang) || LANGUAGE_OPTIONS[0];

  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 py-4 relative z-20">
      <Link
        href="/tracker"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-elevated)] border-hairline"
        style={{ color: 'var(--text-secondary)' }}
      >
        <ArrowLeft size={14} />
        <span>{tr.ui.prev} ({tr.nav.tracker})</span>
      </Link>

      <div className="flex items-center gap-2">
        {/* Language selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all hover:bg-[var(--bg-elevated)] border-hairline"
            style={{ color: 'var(--text-secondary)' }}
            aria-label={tr.ui.language}
          >
            <Globe size={13} style={{ color: 'var(--electric)' }} />
            <span>{currentLang.label}</span>
          </button>

          {langOpen && (
            <div
              className="absolute right-0 mt-1.5 w-32 py-1 rounded-xl shadow-xl z-50 border-hairline bg-[var(--bg-card)]"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors flex items-center justify-between ${
                    displayLang === lang.code
                      ? 'text-[var(--electric)] font-bold bg-[var(--electric-glow)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{lang.fullLabel}</span>
                  <span className="text-[10px] opacity-60 font-mono">{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl transition-all hover:bg-[var(--bg-elevated)] border-hairline"
          style={{ color: 'var(--text-secondary)' }}
          aria-label={tr.ui.theme}
        >
          {displayTheme === 'dark' ? (
            <Sun size={15} style={{ color: 'var(--accent-gold)' }} />
          ) : (
            <Moon size={15} style={{ color: 'var(--electric)' }} />
          )}
        </button>
      </div>
    </div>
  );
}
