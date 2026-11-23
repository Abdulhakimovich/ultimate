'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Trophy, Target } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString, startOfMonth, endOfMonth } from '@/lib/utils/dates';
import { countCompletionsInRange, isHabitCompletedOnDate } from '@/lib/utils/calculations';

export default function MonthStatsCards() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal = useHabitsStore((s) => s.monthlyGoal);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const startStr = toDateString(startOfMonth(currentMonth));
  const endStr = toDateString(endOfMonth(currentMonth));
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

  // Month Progress Calculation
  const { totalCompleted, plannedCheckins, monthPct } = useMemo(() => {
    if (habits.length === 0) return { totalCompleted: 0, plannedCheckins: 0, monthPct: 0 };

    let total = 0;
    let planned = 0;
    for (const habit of habits) {
      const done = countCompletionsInRange(completions, habit.id, startStr, endStr);
      const target = monthlyGoal?.habit_targets?.[habit.id] ?? daysInMonth;
      total += done;
      planned += target;
    }
    const pct = planned > 0 ? Math.round((total / planned) * 100) : 0;
    return { totalCompleted: total, plannedCheckins: planned, monthPct: pct };
  }, [habits, completions, startStr, endStr, monthlyGoal, daysInMonth]);

  // Best Streak across habits
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    let maxStreak = 0;

    for (const habit of habits) {
      let streak = 0;
      let cur = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dStr = toDateString(d);
        const has = isHabitCompletedOnDate(completions, habit.id, dStr);
        if (has) {
          cur++;
          streak = Math.max(streak, cur);
        } else {
          cur = 0;
        }
      }
      maxStreak = Math.max(maxStreak, streak);
    }
    return maxStreak;
  }, [habits, completions, currentMonth, daysInMonth]);

  // Average Completion per day, month to date
  const avgCompletionPct = useMemo(() => {
    if (habits.length === 0) return 0;
    const now = new Date();
    const isCurrentMonth =
      now.getFullYear() === currentMonth.getFullYear() &&
      now.getMonth() === currentMonth.getMonth();

    const maxDay = isCurrentMonth ? Math.min(now.getDate(), daysInMonth) : daysInMonth;
    if (maxDay === 0) return 0;

    let dayPctsSum = 0;
    for (let day = 1; day <= maxDay; day++) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dStr = toDateString(d);
      const doneCount = habits.filter((h) =>
        isHabitCompletedOnDate(completions, h.id, dStr)
      ).length;
      dayPctsSum += (doneCount / habits.length) * 100;
    }

    return Math.round(dayPctsSum / maxDay);
  }, [habits, completions, currentMonth, daysInMonth]);

  if (habits.length === 0) return null;

  return (
    <section
      aria-label="Month statistics"
      className="grid grid-cols-1 md:grid-cols-3 gap-5"
    >
      {/* 1. Month Progress */}
      <div className="relative bg-[var(--panel)] border border-[var(--line)] p-6 sm:p-7 transition-all">
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[var(--blue)] pointer-events-none" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {tr.tracker.monthProgress}
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[var(--line-strong)] bg-[var(--blue-soft)] flex-shrink-0">
            <TrendingUp size={18} className="text-[var(--blue-text)]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 my-4 mb-2">
          <span className="font-display text-4xl sm:text-5xl font-bold leading-none text-[var(--text)]">
            {monthPct}
          </span>
          <span className="text-xl sm:text-2xl text-[var(--muted)] font-semibold">%</span>
        </div>
        <p className="text-xs sm:text-[13px] text-[var(--text2)] m-0">
          {totalCompleted} {tr.tracker.plannedCheckins} {plannedCheckins}
        </p>
      </div>

      {/* 2. Best Streak */}
      <div className="relative bg-[var(--panel)] border border-[var(--line)] p-6 sm:p-7 transition-all">
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[var(--blue)] pointer-events-none" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {tr.tracker.streakDays}
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[var(--line-strong)] bg-[var(--blue-soft)] flex-shrink-0">
            <Trophy size={18} className="text-[var(--blue-text)]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2 my-4 mb-2">
          <span className="font-display text-4xl sm:text-5xl font-bold leading-none text-[var(--text)]">
            {bestStreak}
          </span>
          <span className="text-xs sm:text-sm text-[var(--text2)] font-semibold tracking-[0.14em] uppercase">
            {tr.tracker.days}
          </span>
        </div>
        <p className="text-xs sm:text-[13px] text-[var(--text2)] m-0">
          {tr.tracker.longestRunDesc}
        </p>
      </div>

      {/* 3. Avg Completion */}
      <div className="relative bg-[var(--panel)] border border-[var(--line)] p-6 sm:p-7 transition-all">
        <div className="absolute -top-[1px] -left-[1px] w-3 h-3 border-t-2 border-l-2 border-[var(--blue)] pointer-events-none" />
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] uppercase">
            {tr.tracker.avgCompletion}
          </span>
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center border border-[var(--line-strong)] bg-[var(--blue-soft)] flex-shrink-0">
            <Target size={18} className="text-[var(--blue-text)]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 my-4 mb-2">
          <span className="font-display text-4xl sm:text-5xl font-bold leading-none text-[var(--text)]">
            {avgCompletionPct}
          </span>
          <span className="text-xl sm:text-2xl text-[var(--muted)] font-semibold">%</span>
        </div>
        <p className="text-xs sm:text-[13px] text-[var(--text2)] m-0">
          {tr.tracker.avgPerDay}
        </p>
      </div>
    </section>
  );
}
