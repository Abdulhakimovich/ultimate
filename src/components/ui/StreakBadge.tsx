'use client';

import React from 'react';
import { Flame } from 'lucide-react';
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

  // Flame tier styling based on length (1-6, 7-29, 30-99, 100+)
  const flameTier = streak >= 100
    ? { color: '#A855F7', bg: 'rgba(168, 85, 247, 0.18)', border: 'rgba(168, 85, 247, 0.45)', glow: '0 0 12px rgba(168, 85, 247, 0.5)', flameSize: 18 }
    : streak >= 30
    ? { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.16)', border: 'rgba(239, 68, 68, 0.4)', glow: '0 0 10px rgba(239, 68, 68, 0.4)', flameSize: 16 }
    : streak >= 7
    ? { color: '#F97316', bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.35)', glow: '0 0 8px rgba(249, 115, 22, 0.3)', flameSize: 14 }
    : streak >= 1
    ? { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)', glow: 'none', flameSize: 12 }
    : { color: 'var(--text-muted)', bg: 'var(--bg-elevated)', border: 'var(--border)', glow: 'none', flameSize: 12 };

  const isFire = streak > 0;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <div
        className={`
          inline-flex items-center gap-1 rounded-full font-mono font-bold transition-all
          ${size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-3.5 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'}
        `}
        style={{
          background: flameTier.bg,
          color: flameTier.color,
          border: `1px solid ${flameTier.border}`,
          boxShadow: flameTier.glow,
        }}
      >
        <Flame
          size={flameTier.flameSize}
          className={isFire ? 'animate-flame' : ''}
          style={{ color: flameTier.color }}
        />
        <span className="tabular-nums">{streak}</span>
        <span className="text-xs font-normal uppercase opacity-75">{tr.tracker.days}</span>
      </div>

      {showMilestone && milestone && (
        <span
          className="text-xs px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 transition-all"
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
