'use client';

import React from 'react';
import { Flame, Award, Zap } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

export interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showMilestone?: boolean;
}

export default function StreakBadge({
  streak,
  size = 'md',
  showMilestone = true,
}: StreakBadgeProps) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  // Check milestones
  let milestone: { title: string; desc: string; icon: string } | null = null;
  if (streak >= 100) {
    milestone = {
      title: tr.milestones.streak100Title,
      desc: tr.milestones.streak100Desc,
      icon: '👑',
    };
  } else if (streak >= 30) {
    milestone = {
      title: tr.milestones.streak30Title,
      desc: tr.milestones.streak30Desc,
      icon: '💎',
    };
  } else if (streak >= 7) {
    milestone = {
      title: tr.milestones.streak7Title,
      desc: tr.milestones.streak7Desc,
      icon: '🔥',
    };
  }

  const isFire = streak > 0;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        className={`
          inline-flex items-center gap-1 rounded-full font-mono font-bold
          ${size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}
        `}
        style={{
          background: isFire ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-elevated)',
          color: isFire ? 'var(--accent-gold)' : 'var(--text-muted)',
          border: isFire ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border)',
        }}
      >
        <Flame
          size={size === 'sm' ? 12 : size === 'lg' ? 16 : 14}
          className={isFire ? 'animate-flame' : ''}
          style={{ color: isFire ? 'var(--accent-gold)' : 'var(--text-muted)' }}
        />
        <span className="tabular-nums">{streak}</span>
        <span className="text-xs font-normal uppercase opacity-75">{tr.tracker.days}</span>
      </div>

      {showMilestone && milestone && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold hidden sm:inline-flex items-center gap-1"
          style={{
            background: 'var(--electric-glow)',
            color: 'var(--electric)',
            border: '1px solid var(--border-bright)',
          }}
          title={milestone.desc}
        >
          <span>{milestone.icon}</span>
          <span>{milestone.title}</span>
        </span>
      )}
    </div>
  );
}
