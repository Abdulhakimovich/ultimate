'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, ArrowRight } from 'lucide-react';

interface EmptyStateProps {
  variant: 'tracker' | 'planner' | 'analytics';
  title: string;
  description?: string;
  actionLabel: string;
  onAction?: () => void;
  actionHref?: string;
}

export default function EmptyStateIllustration({
  variant,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  const renderIllustration = () => {
    switch (variant) {
      case 'tracker':
        return (
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            <circle cx="60" cy="60" r="50" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="36" fill="var(--bg-elevated)" stroke="var(--border-bright)" strokeWidth="1.5" />
            <circle cx="60" cy="60" r="22" fill="var(--electric-glow)" stroke="var(--electric)" strokeWidth="2" />
            <path d="M52 60L57 65L69 53" stroke="var(--electric)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="60" cy="18" r="4" fill="var(--blue-neon)" />
            <circle cx="102" cy="60" r="4" fill="var(--accent-gold)" />
            <circle cx="60" cy="102" r="4" fill="var(--accent-green)" />
            <circle cx="18" cy="60" r="4" fill="var(--accent-purple)" />
          </svg>
        );

      case 'planner':
        return (
          <svg
            width="90"
            height="90"
            viewBox="0 0 90 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            <rect x="22" y="16" width="46" height="58" rx="8" fill="var(--bg-elevated)" stroke="var(--border-bright)" strokeWidth="1.5" />
            <rect x="34" y="10" width="22" height="10" rx="3" fill="var(--electric)" />
            <line x1="30" y1="34" x2="60" y2="34" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="44" x2="54" y2="44" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
            <line x1="30" y1="54" x2="48" y2="54" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="64" cy="62" r="12" fill="var(--electric-glow)" stroke="var(--electric)" strokeWidth="2" />
            <path d="M60 62L63 65L69 59" stroke="var(--electric)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'analytics':
        return (
          <svg
            width="130"
            height="130"
            viewBox="0 0 130 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto"
          >
            <rect x="15" y="15" width="100" height="100" rx="16" fill="var(--bg-elevated)" stroke="var(--border)" strokeWidth="1.5" />
            <path d="M28 92L48 68L68 78L102 38" stroke="var(--electric)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="48" cy="68" r="4.5" fill="var(--blue-neon)" stroke="var(--bg-elevated)" strokeWidth="1.5" />
            <circle cx="68" cy="78" r="4.5" fill="var(--accent-purple)" stroke="var(--bg-elevated)" strokeWidth="1.5" />
            <circle cx="102" cy="38" r="5.5" fill="var(--accent-green)" stroke="var(--bg-elevated)" strokeWidth="2" />
            <path d="M30 102H100" stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  const buttonClass =
    'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer';
  const buttonStyle = {
    background: 'linear-gradient(135deg, var(--electric), var(--blue-mid))',
    color: '#07090E',
  };

  return (
    <div className="text-center py-8 px-4 max-w-sm mx-auto space-y-3">
      {renderIllustration()}

      <div className="space-y-1">
        <h3 className="font-display font-bold text-base text-[var(--text-primary)]">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="pt-2">
        {actionHref ? (
          <Link href={actionHref} className={buttonClass} style={buttonStyle}>
            <span>{actionLabel}</span>
            <ArrowRight size={13} />
          </Link>
        ) : (
          <button type="button" onClick={onAction} className={buttonClass} style={buttonStyle}>
            <Plus size={14} />
            <span>{actionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
