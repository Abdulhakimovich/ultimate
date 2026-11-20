'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguageStore } from '@/store/languageStore';
import { useToastStore } from '@/stores/toastStore';
import { useSignOut } from '@/hooks/useSignOut';
import { t } from '@/lib/i18n';
import Modal from '@/components/ui/Modal';

interface Props {
  email: string | null;
}

export default function DangerSection({ email }: Props) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const addToast = useToastStore((s) => s.addToast);
  const signOut = useSignOut();

  const [modalOpen, setModalOpen] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = email ? typedEmail.trim().toLowerCase() === email.trim().toLowerCase() : false;

  const handleDeleteAccount = async () => {
    if (!canConfirm) {
      setError(tr.profile.deleteAccountEmailMismatch);
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: rpcError } = await supabase.rpc('delete_my_account');

      if (rpcError) {
        console.error('delete_my_account RPC error:', rpcError);
        setError(rpcError.message || tr.profile.deleteAccountError);
        addToast({ message: rpcError.message || tr.profile.deleteAccountError, variant: 'error' });
        setDeleting(false);
        return;
      }

      addToast({ message: tr.profile.deleteAccountSuccess, variant: 'success' });
      setModalOpen(false);
      await signOut();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : tr.profile.deleteAccountError;
      setError(msg);
      addToast({ message: msg, variant: 'error' });
      setDeleting(false);
    }
  };

  return (
    <div
      className="surface-card rounded-2xl p-5 space-y-4"
      style={{
        border: '1px solid rgba(239, 68, 68, 0.25)',
        background: 'rgba(239, 68, 68, 0.03)',
      }}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-[var(--accent-red)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--accent-red)' }}>
          {tr.profile.dangerTitle}
        </h2>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {tr.profile.deleteAccountWarning}
      </p>

      <button
        type="button"
        onClick={() => {
          setTypedEmail('');
          setError(null);
          setModalOpen(true);
        }}
        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
        style={{
          background: 'rgba(239, 68, 68, 0.12)',
          color: 'var(--accent-red)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        }}
      >
        <Trash2 size={13} />
        <span>{tr.profile.deleteAccount}</span>
      </button>

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          if (!deleting) setModalOpen(false);
        }}
        title={tr.profile.deleteAccountConfirm}
      >
        <div className="space-y-4">
          <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {tr.profile.deleteAccountWarning}
          </p>

          {email && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                {tr.profile.deleteAccountTypeEmail} <span className="font-mono text-[var(--accent-red)]">{email}</span>
              </label>
              <input
                type="email"
                value={typedEmail}
                onChange={(e) => {
                  setTypedEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={email}
                className="w-full px-3.5 py-2 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-red)] font-mono"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          )}

          {error && (
            <p className="text-xs font-medium" style={{ color: 'var(--accent-red)' }}>
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={deleting}
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {tr.ui.cancel}
            </button>

            <button
              type="button"
              disabled={deleting || !canConfirm}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-red)',
                color: '#fff',
              }}
            >
              {deleting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>{tr.ui.loading}</span>
                </>
              ) : (
                <>
                  <Trash2 size={13} />
                  <span>{tr.profile.deleteAccount}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
