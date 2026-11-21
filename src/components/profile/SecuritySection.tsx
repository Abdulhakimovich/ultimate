'use client';

import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Loader2, LogOut } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useLanguageStore } from '@/store/languageStore';
import { useToastStore } from '@/stores/toastStore';
import { useSignOut } from '@/hooks/useSignOut';
import { MIN_PASSWORD_LENGTH } from '@/lib/constants';
import { t } from '@/lib/i18n';

interface Props {
  user: SupabaseUser | null;
}

export default function SecuritySection({ user }: Props) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const addToast = useToastStore((s) => s.addToast);
  const signOut = useSignOut();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Check if user signed up with email/password
  const isEmailUser = Boolean(
    user?.identities?.some((id) => id.provider === 'email') ||
      (user?.app_metadata?.providers &&
        Array.isArray(user.app_metadata.providers) &&
        user.app_metadata.providers.includes('email')) ||
      user?.app_metadata?.provider === 'email'
  );

  // Hide this card for users who only have Google sign-in
  if (!isEmailUser) {
    return null;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(tr.profile.passwordMinLength);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(tr.profile.passwordMismatch);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      addToast({ message: tr.profile.passwordChanged, variant: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
  };

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
      <div className="flex items-center gap-2">
        <Shield size={16} className="text-[var(--electric)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.profile.securityTitle}
        </h2>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {tr.profile.newPassword}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder={tr.profile.passwordPlaceholder}
              className="w-full px-3.5 py-2 pr-10 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--electric)]"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {tr.profile.confirmPassword}
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError(null);
            }}
            placeholder={tr.profile.passwordPlaceholder}
            className="w-full px-3.5 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--electric)]"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
          />
        </div>

        {error && (
          <p className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>
            {error}
          </p>
        )}

        <div className="pt-1 flex items-center justify-between">
          <button
            type="submit"
            disabled={loading || !newPassword}
            className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, var(--electric), var(--blue-neon))',
              color: '#000',
            }}
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>{tr.ui.loading}</span>
              </>
            ) : (
              <>
                <Lock size={13} />
                <span>{tr.profile.changePassword}</span>
              </>
            )}
          </button>
        </div>
      </form>

      <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0 12px 0' }} />

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          {tr.ui.signOut}
        </span>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border"
          style={{
            color: 'var(--accent-red)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.08)',
          }}
        >
          {signingOut ? <Loader2 size={13} className="animate-spin" /> : <LogOut size={13} />}
          <span>{tr.ui.signOut}</span>
        </button>
      </div>
    </div>
  );
}
