'use client';

import React from 'react';
import { Target, CheckCircle2, Flame, Award, TrendingUp, Sparkles } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import Skeleton from '@/components/ui/Skeleton';
import type { HabitStats } from '@/lib/stats';

interface Props {
  stats: HabitStats | null;
  loading: boolean;
}

export default function ProgressSection({ stats, loading }: Props) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  if (loading || !stats) {
    return (
      <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width="140px" height="20px" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline space-y-2">
              <Skeleton width="60%" height="14px" />
              <Skeleton width="40%" height="28px" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const items = [
    {
      label: tr.profile.activeHabits,
      value: stats.activeHabits,
      unit: '',
      icon: Target,
      color: 'var(--electric)',
      bg: 'var(--electric-glow)',
    },
    {
      label: tr.profile.totalCompletions,
      value: stats.totalCompletions,
      unit: '',
      icon: CheckCircle2,
      color: 'var(--accent-green)',
      bg: 'rgba(16, 185, 129, 0.15)',
    },
    {
      label: tr.profile.currentStreak,
      value: stats.currentStreak,
      unit: tr.tracker.days,
      icon: Flame,
      color: 'var(--accent-gold)',
      bg: 'rgba(245, 158, 11, 0.15)',
      animate: stats.currentStreak > 0,
    },
    {
      label: tr.profile.bestStreak,
      value: stats.bestStreak,
      unit: tr.tracker.days,
      icon: Award,
      color: 'var(--accent-purple)',
      bg: 'rgba(139, 92, 246, 0.15)',
    },
    {
      label: tr.profile.monthRate,
      value: `${stats.completionRate}%`,
      unit: '',
      icon: TrendingUp,
      color: 'var(--electric)',
      bg: 'var(--electric-glow)',
    },
  ];

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-[var(--electric)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.profile.progressTitle}
        </h2>
      </div>

      {stats.totalCompletions === 0 && stats.activeHabits === 0 ? (
        <div className="py-6 text-center space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {tr.profile.noDataYet}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium leading-tight truncate" style={{ color: 'var(--text-secondary)' }}>
                    {it.label}
                  </span>
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: it.bg, color: it.color }}
                  >
                    <Icon size={13} className={it.animate ? 'animate-flame' : ''} />
                  </div>
                </div>

                <div className="flex items-baseline gap-1 font-mono font-bold text-xl sm:text-2xl tabular-nums" style={{ color: it.color }}>
                  <span>{it.value}</span>
                  {it.unit && <span className="text-xs font-normal opacity-70">{it.unit}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
