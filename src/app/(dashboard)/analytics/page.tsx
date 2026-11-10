'use client';

import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { formatRu } from '@/lib/utils/dates';
import DailyBarChart from '@/components/analytics/DailyBarChart';
import MonthlyAreaChart from '@/components/analytics/MonthlyAreaChart';

export default function AnalyticsPage() {
  const currentMonth   = useHabitsStore((s) => s.currentMonth);
  const navigateMonth  = useHabitsStore((s) => s.navigateMonth);
  const loadHabits     = useHabitsStore((s) => s.loadHabits);
  const loadCompletions= useHabitsStore((s) => s.loadCompletions);
  const language       = useLanguageStore((s) => s.language);
  const tr             = t(language);

  useEffect(() => { loadHabits(); }, [loadHabits]);
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    loadCompletions(year, month);
  }, [currentMonth, loadCompletions]);

  const monthLabel = `${tr.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 rounded-xl"
        style={{ background: '#111827', border: '1px solid rgba(0,212,255,0.12)' }}
      >
        <button
          onClick={() => navigateMonth('prev')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ color: '#7BA7CC', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}
          aria-label={tr.ui.prev}
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">{tr.ui.prev}</span>
        </button>

        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: '#00D4FF' }} />
          <h2 className="font-display font-bold text-base" style={{ color: '#E8F4FF' }}>
            {tr.analytics.title} — <span style={{ color: '#00D4FF' }}>{monthLabel}</span>
          </h2>
        </div>

        <button
          onClick={() => navigateMonth('next')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all"
          style={{ color: '#7BA7CC', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}
          aria-label={tr.ui.next}
        >
          <span className="hidden sm:inline">{tr.ui.next}</span>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Charts Card */}
      <div
        className="rounded-2xl p-5 space-y-6"
        style={{ background: '#111827', border: '1px solid rgba(0,212,255,0.12)' }}
      >
        <DailyBarChart />
        <div style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }} />
        <MonthlyAreaChart />
      </div>
    </div>
  );
}
