'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { formatRu, toDateString } from '@/lib/utils/dates';
import WeeklySummaryHeader from './WeeklySummaryHeader';
import DayColumn from './DayColumn';

export default function WeeklyPlannerView() {
  const weekDays        = usePlannerStore((s) => s.weekDays);
  const currentWeekStart= usePlannerStore((s) => s.currentWeekStart);
  const loadWeekData    = usePlannerStore((s) => s.loadWeekData);
  const navigateWeek    = usePlannerStore((s) => s.navigateWeek);
  const isLoading       = usePlannerStore((s) => s.isLoading);

  const loadHabits      = useHabitsStore((s) => s.loadHabits);
  const loadCompletions = useHabitsStore((s) => s.loadCompletions);

  const language        = useLanguageStore((s) => s.language);
  const tr              = t(language);

  useEffect(() => {
    loadHabits();
    loadWeekData();
  }, [loadHabits, loadWeekData]);

  // Load completions for the week's month(s)
  useEffect(() => {
    if (weekDays.length > 0) {
      const months = new Set(
        weekDays.map((d) => `${d.getFullYear()}-${d.getMonth() + 1}`)
      );
      months.forEach((m) => {
        const [y, mo] = m.split('-').map(Number);
        loadCompletions(y, mo);
      });
    }
  }, [weekDays, loadCompletions]);

  if (isLoading || weekDays.length === 0) {
    return (
      <div className="space-y-4">
        <div className="h-[200px] rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[400px] rounded-xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-8">
      {/* Week Navigation */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-xl"
        style={{
          background: '#111827',
          border: '1px solid rgba(0,212,255,0.12)',
        }}
      >
        <button
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            color: '#7BA7CC',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.12)',
          }}
          aria-label={tr.ui.prev}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">{tr.ui.prev}</span>
        </button>

        <h2 className="text-xs font-mono font-bold tracking-wide" style={{ color: '#00D4FF' }}>
          {formatRu(weekDays[0], 'd MMM')} — {formatRu(weekDays[6], 'd MMM yyyy')}
        </h2>

        <button
          onClick={() => navigateWeek('next')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            color: '#7BA7CC',
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.12)',
          }}
          aria-label={tr.ui.next}
        >
          <span className="hidden sm:inline">{tr.ui.next}</span>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Summary Header */}
      <WeeklySummaryHeader />

      {/* Day Columns Grid */}
      <motion.div
        key={currentWeekStart.toISOString()}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2.5"
      >
        {weekDays.map((day, i) => (
          <DayColumn key={toDateString(day)} date={day} dayIndex={i} />
        ))}
      </motion.div>
    </div>
  );
}
