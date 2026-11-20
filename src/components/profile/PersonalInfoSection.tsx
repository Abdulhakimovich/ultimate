'use client';

import React, { useState } from 'react';
import { User, Check, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useProfileStore } from '@/store/profileStore';
import { useToastStore } from '@/stores/toastStore';
import { t } from '@/lib/i18n';

export default function PersonalInfoSection() {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const profile = useProfileStore((s) => s.profile);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const addToast = useToastStore((s) => s.addToast);

  const [name, setName] = useState(profile?.display_name || '');
  const [prevProfileName, setPrevProfileName] = useState(profile?.display_name || '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (profile?.display_name && profile.display_name !== prevProfileName) {
    setPrevProfileName(profile.display_name);
    setName(profile.display_name);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (trimmed.length < 1) {
      setError(tr.profile.nameRequired);
      return;
    }
    if (trimmed.length > 50) {
      setError(tr.profile.nameTooLong);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await saveProfile({ display_name: trimmed });
      addToast({ message: tr.profile.nameSaved, variant: 'success' });
    } catch {
      // Error is handled in profileStore with rollback
    } finally {
      setSaving(false);
    }
  };

  const isChanged = (profile?.display_name || '') !== name.trim();

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
      <div className="flex items-center gap-2">
        <User size={16} className="text-[var(--electric)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.profile.personalInfo}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="displayName" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            {tr.profile.editName}
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              id="displayName"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder={tr.profile.namePlaceholder}
              maxLength={60}
              className="flex-1 px-3.5 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--electric)]"
              style={{
                background: 'var(--bg-elevated)',
                border: error ? '1px solid var(--accent-red)' : '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />

            <button
              type="submit"
              disabled={saving || !isChanged}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isChanged
                  ? 'linear-gradient(135deg, var(--electric), var(--blue-neon))'
                  : 'var(--bg-elevated)',
                color: isChanged ? '#000' : 'var(--text-muted)',
                border: isChanged ? 'none' : '1px solid var(--border)',
              }}
            >
              {saving ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>{tr.ui.loading}</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>{tr.ui.save}</span>
                </>
              )}
            </button>
          </div>
          {error && (
            <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--accent-red)' }}>
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
