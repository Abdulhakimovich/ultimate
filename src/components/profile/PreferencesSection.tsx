'use client';

import React from 'react';
import { Sliders, Sun, Moon, Globe, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { playCheckSound } from '@/lib/feedback';
import { t, LANGUAGE_OPTIONS, type Language } from '@/lib/i18n';

export default function PreferencesSection() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const soundEnabled = useFeedbackStore((s) => s.soundEnabled);
  const toggleSound = useFeedbackStore((s) => s.toggleSound);

  const hapticsEnabled = useFeedbackStore((s) => s.hapticsEnabled);
  const toggleHaptics = useFeedbackStore((s) => s.toggleHaptics);

  const tr = t(language);

  const handleSoundToggle = () => {
    toggleSound();
    if (!soundEnabled) {
      setTimeout(() => playCheckSound(), 50);
    }
  };

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
      <div className="flex items-center gap-2">
        <Sliders size={16} className="text-[var(--electric)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.profile.preferencesTitle}
        </h2>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {/* Theme Preference */}
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
            >
              {theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
            </div>
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
                {tr.ui.theme}
              </span>
              <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                {theme === 'dark' ? tr.ui.themeDark : tr.ui.themeLight}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border-hairline">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={{
                background: theme === 'light' ? 'var(--bg-card)' : 'transparent',
                color: theme === 'light' ? 'var(--electric)' : 'var(--text-secondary)',
                boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Sun size={13} />
              <span>{tr.ui.themeLight.split(' ')[0]}</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
              style={{
                background: theme === 'dark' ? 'var(--bg-card)' : 'transparent',
                color: theme === 'dark' ? 'var(--electric)' : 'var(--text-secondary)',
                boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              <Moon size={13} />
              <span>{tr.ui.themeDark.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* Language Preference */}
        <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
            >
              <Globe size={15} />
            </div>
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
                {tr.ui.language}
              </span>
              <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                {LANGUAGE_OPTIONS.find((l) => l.code === language)?.fullLabel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border-hairline self-start sm:self-auto">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => setLanguage(opt.code as Language)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all"
                style={{
                  background: language === opt.code ? 'var(--bg-card)' : 'transparent',
                  color: language === opt.code ? 'var(--electric)' : 'var(--text-secondary)',
                  boxShadow: language === opt.code ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sound Effects Preference */}
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
            >
              {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </div>
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
                {tr.profile.sound}
              </span>
              <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                {tr.profile.soundDesc}
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={soundEnabled}
            onClick={handleSoundToggle}
            className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0"
            style={{
              background: soundEnabled ? 'var(--electric)' : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full bg-white transition-transform"
              style={{
                transform: soundEnabled ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>

        {/* Haptics Preference */}
        <div className="py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--electric-glow)', color: 'var(--electric)' }}
            >
              <Smartphone size={15} />
            </div>
            <div>
              <span className="text-sm font-semibold block" style={{ color: 'var(--text-primary)' }}>
                {tr.profile.haptics}
              </span>
              <span className="text-xs block" style={{ color: 'var(--text-secondary)' }}>
                {tr.profile.hapticsDesc}
              </span>
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={hapticsEnabled}
            onClick={toggleHaptics}
            className="w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 flex-shrink-0"
            style={{
              background: hapticsEnabled ? 'var(--electric)' : 'var(--bg-elevated)',
              border: '1px solid var(--border)',
            }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full bg-white transition-transform"
              style={{
                transform: hapticsEnabled ? 'translateX(20px)' : 'translateX(0)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
