'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Printer } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString, isToday, formatDotDate } from '@/lib/utils/dates';
import WeeklySummaryHeader from './WeeklySummaryHeader';
import DayColumn from './DayColumn';

export default function WeeklyPlannerView() {
  const weekDays         = usePlannerStore((s) => s.weekDays);
  const currentWeekStart = usePlannerStore((s) => s.currentWeekStart);
  const loadWeekData     = usePlannerStore((s) => s.loadWeekData);
  const navigateWeek     = usePlannerStore((s) => s.navigateWeek);
  const isLoading        = usePlannerStore((s) => s.isLoading);

  const loadHabits       = useHabitsStore((s) => s.loadHabits);
  const loadCompletions  = useHabitsStore((s) => s.loadCompletions);

  const language         = useLanguageStore((s) => s.language);
  const tr               = t(language);

  // Selected Day Index for Mobile View (Default to Today if in current week, else 0)
  const [selectedMobileDay, setSelectedMobileDay] = useState(0);

  useEffect(() => {
    loadHabits();
    loadWeekData();
  }, [loadHabits, loadWeekData]);

  useEffect(() => {
    if (weekDays.length > 0) {
      const todayIdx = weekDays.findIndex((d) => isToday(d));
      setSelectedMobileDay(todayIdx !== -1 ? todayIdx : 0);

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
      <div className="space-y-4 max-w-[1600px] mx-auto">
        <div className="h-[200px] rounded-2xl skeleton-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-[400px] rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const weekRangeLabel = `${formatDotDate(weekDays[0])} — ${formatDotDate(weekDays[6])}`;

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-12">
      {/* 1. Week Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl surface-card">
        <button
          onClick={() => navigateWeek('prev')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-elevated)]"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          aria-label={tr.ui.prev}
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">{tr.ui.prev}</span>
        </button>

        <div className="flex items-center gap-2">
          <CalendarIcon size={15} style={{ color: 'var(--electric)' }} />
          <h2 className="text-xs sm:text-sm font-mono font-bold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            {weekRangeLabel}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Print / Export PDF Worksheet Button */}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-elevated)]"
            style={{
              color: 'var(--electric)',
              border: '1px solid var(--border-bright)',
              background: 'var(--electric-glow)',
            }}
            title={tr.planner.printWeeklyReview}
            aria-label={tr.planner.printWeeklyReview}
          >
            <Printer size={14} />
            <span className="hidden md:inline">{tr.planner.printWeeklyReview}</span>
          </button>

          <button
            onClick={() => navigateWeek('next')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            aria-label={tr.ui.next}
          >
            <span className="hidden sm:inline">{tr.ui.next}</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* Printable Sheet Header (Visible ONLY when printing or saving as PDF) */}
      <div className="print-show pb-3 mb-2 border-b border-gray-300">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-gray-900">
              {tr.planner.weeklyReviewTitle}
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {tr.planner.offlineJournalPrompt} • {weekRangeLabel}
            </p>
          </div>
          <div className="text-right text-[10px] text-gray-500 font-mono">
            {formatDotDate(new Date())}
          </div>
        </div>
      </div>

      {/* 2. Summary Header Card */}
      <WeeklySummaryHeader />

      {/* 3. Mobile View: Responsive Day Pill Selector */}
      <div className="sm:hidden no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
          {weekDays.map((day, idx) => {
            const isSelected = selectedMobileDay === idx;
            const today = isToday(day);
            return (
              <button
                key={toDateString(day)}
                onClick={() => setSelectedMobileDay(idx)}
                className={`flex-1 py-2 px-2.5 rounded-xl text-center text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-[var(--electric)] text-[#07090E] border-[var(--electric)] shadow-md'
                    : today
                    ? 'bg-[var(--electric-glow)] text-[var(--electric)] border-[var(--border-bright)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)]'
                }`}
              >
                <div className="text-[10px] uppercase font-mono">{tr.tracker.weekdays[idx]}</div>
                <div className="text-xs font-mono">{day.getDate()}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Single Day Card for Mobile */}
        <div className="mt-2">
          <DayColumn
            key={`mobile-${toDateString(weekDays[selectedMobileDay])}`}
            date={weekDays[selectedMobileDay]}
            dayIndex={selectedMobileDay}
          />
        </div>
      </div>

      {/* 4. Desktop View: 7 Full-Width Day Columns (and always used for print) */}
      <motion.div
        key={currentWeekStart.toISOString()}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3 planner-print-grid"
      >
        {weekDays.map((day, i) => (
          <DayColumn key={toDateString(day)} date={day} dayIndex={i} />
        ))}
      </motion.div>
    </div>
  );
}
