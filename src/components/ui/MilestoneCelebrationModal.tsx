'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

export interface MilestoneInfo {
  days: number;
  title: string;
  desc: string;
  icon: string;
}

interface MilestoneCelebrationModalProps {
  milestone: MilestoneInfo | null;
  onClose: () => void;
}

export default function MilestoneCelebrationModal({
  milestone,
  onClose,
}: MilestoneCelebrationModalProps) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  if (!milestone) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm surface-card p-6 rounded-3xl border-2 border-[var(--border-bright)] shadow-2xl text-center space-y-4 z-10 overflow-hidden"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {/* Big Milestone Icon with Glow */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl flex items-center justify-center text-4xl bg-gradient-to-br from-[var(--electric-glow)] to-[var(--bg-elevated)] border border-[var(--border-bright)] shadow-[0_0_24px_var(--electric-glow)]">
            <span className="select-none">{milestone.icon}</span>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--electric-glow)] text-[var(--electric)] border border-[var(--border-bright)]">
              <Sparkles size={12} />
              <span>{milestone.days} DAYS STREAK</span>
            </div>
            <h3 className="font-display font-bold text-xl tracking-tight text-[var(--text-primary)] pt-1">
              {milestone.title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed px-2">
              {milestone.desc}
            </p>
          </div>

          {/* Action button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs font-display transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer text-white"
            style={{
              background: '#0A5FD6',
            }}
          >
            {tr.milestones.continueJourney}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
