'use client';

import React from 'react';
import type { Profile } from '@/lib/types';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { Calendar, Mail } from 'lucide-react';

interface Props {
  profile: Profile;
  email: string | null;
}

export default function ProfileHeader({ profile, email }: Props) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const initial = (profile.display_name?.[0] || email?.[0] || 'U').toUpperCase();

  const formattedDate = React.useMemo(() => {
    if (!profile.created_at) return '';
    try {
      const d = new Date(profile.created_at);
      const locales: Record<string, string> = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' };
      return d.toLocaleDateString(locales[language] || 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return profile.created_at.slice(0, 10);
    }
  }, [profile.created_at, language]);

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
      {/* Large Avatar */}
      <div
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center font-display font-bold text-2xl sm:text-3xl flex-shrink-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--electric-glow), rgba(0, 212, 255, 0.2))',
          color: 'var(--electric)',
          border: '1px solid var(--border-bright)',
        }}
      >
        {initial}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <h1 className="font-display font-bold text-xl sm:text-2xl tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
          {profile.display_name || email?.split('@')[0] || tr.profile.title}
        </h1>

        {email && (
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
            <Mail size={13} className="opacity-70 flex-shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={13} className="opacity-70 flex-shrink-0" />
            <span>
              {tr.profile.memberSince} {formattedDate}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
