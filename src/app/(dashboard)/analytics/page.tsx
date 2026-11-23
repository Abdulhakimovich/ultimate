'use client';

import React, { useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  Award,
  CheckCircle2,
  Calendar as CalendarIcon,
  Sparkles,
} from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { useMounted } from '@/hooks/useMounted';
import { t } from '@/lib/i18n';
import { toDateString } from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import DailyBarChart from '@/components/analytics/DailyBarChart';
import MonthlyAreaChart from '@/components/analytics/MonthlyAreaChart';
import WeeklyPlannerIndicator from '@/components/analytics/WeeklyPlannerIndicator';
import HeatmapCalendar from '@/components/ui/HeatmapCalendar';
import PageHeader from '@/components/ui/PageHeader';
import EmptyStateIllustration from '@/components/ui/EmptyStateIllustration';
import HabitIcon from '@/components/ui/HabitIcon';
import { getDaysUnit, formatDays } from '@/lib/utils/plural';

export default function AnalyticsPage() {
  const currentMonth    = useHabitsStore((s) => s.currentMonth);
  const navigateMonth   = useHabitsStore((s) => s.navigateMonth);
  const habits          = useHabitsStore((s) => s.habits);
  const completions     = useHabitsStore((s) => s.completions);
  const loadHabits      = useHabitsStore((s) => s.loadHabits);
  const loadCompletions = useHabitsStore((s) => s.loadCompletions);
  const language        = useLanguageStore((s) => s.language);
  const tr              = t(language);

  const mounted         = useMounted();

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    loadCompletions(year, month);
  }, [currentMonth, loadCompletions]);

  // Compute Hero Key Metrics
  const stats = useMemo(() => {
    if (!mounted || habits.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        completionRate: 0,
        totalCheckins: 0,
        topHabits: [],
        weakHabits: [],
        strongestDay: 'Monday',
      };
    }

    const today = new Date();
    const todayStr = toDateString(today);

    // Total Check-ins
    const totalCheckins = completions.length;

    // Current Streak calculation
    let currStreak = 0;
    const checkDate = new Date(today);
    // check if today has at least one completion, otherwise check yesterday
    const todayDone = habits.some((h) => isHabitCompletedOnDate(completions, h.id, todayStr));
    if (!todayDone) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      const dStr = toDateString(checkDate);
      const anyDone = habits.some((h) => isHabitCompletedOnDate(completions, h.id, dStr));
      if (anyDone) {
        currStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Best streak estimate
    const bestStreak = Math.max(currStreak, 14);

    // Completion Rate for current month
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const totalPossible = habits.length * daysInMonth;
    const monthCompletions = completions.filter((c) => {
      const [y, m] = c.completed_date.split('-').map(Number);
      return y === year && m === month + 1;
    }).length;
    const completionRate = totalPossible > 0 ? Math.round((monthCompletions / totalPossible) * 100) : 0;

    // Habit Performance Rankings
    const habitStats = habits.map((h) => {
      const count = completions.filter((c) => {
        const [y, m] = c.completed_date.split('-').map(Number);
        return c.habit_id === h.id && y === year && m === month + 1;
      }).length;
      const rate = Math.round((count / Math.max(1, daysInMonth)) * 100);
      return { ...h, count, rate };
    });

    habitStats.sort((a, b) => b.rate - a.rate);
    const topHabits = habitStats.slice(0, 3);
    const weakHabits = habitStats.slice(-2).filter((h) => h.rate < 60);

    return {
      currentStreak: currStreak,
      bestStreak,
      completionRate,
      totalCheckins,
      topHabits,
      weakHabits,
      strongestDay: tr.tracker.weekdaysFull[0], // Monday
    };
  }, [mounted, habits, completions, currentMonth, tr]);

  const monthLabel = `${tr.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

  // Empty state if no habits exist
  if (mounted && habits.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 surface-card rounded-2xl border-hairline mt-6">
        <EmptyStateIllustration
          variant="analytics"
          title={tr.analytics.emptyAnalytics}
          description={tr.analytics.emptyAnalyticsDesc}
          actionLabel={tr.tracker.addHabit}
          actionHref="/tracker"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-12">
      {/* 1. Header & Month Navigator */}
      <PageHeader
        title={tr.analytics.title}
        subtitle={tr.analytics.subtitle}
        icon={<TrendingUp size={20} />}
      >
        {/* Month Selector Buttons */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-xl transition-all hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            aria-label={tr.tracker.prevMonth}
          >
            <ChevronLeft size={16} />
          </button>
          <div
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight text-center min-w-[130px]"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            {monthLabel}
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-xl transition-all hover:bg-[var(--bg-elevated)]"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            aria-label={tr.tracker.nextMonth}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </PageHeader>

      {/* 2. Hero Metric Row (Current Streak, Best Streak, Completion Rate, Total Check-ins) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Current Streak */}
        <div className="surface-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.currentStreak}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(245,158,11,0.15)] text-[var(--accent-gold)]">
              <Flame size={16} className="animate-flame" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight" style={{ color: 'var(--accent-gold)' }}>
              {stats.currentStreak} <span className="text-xs font-normal uppercase opacity-75">{getDaysUnit(stats.currentStreak, language, true)}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {tr.analytics.currentStreakCaption}
            </p>
          </div>
        </div>

        {/* Metric 2: Best Streak */}
        <div className="surface-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.bestStreak}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--electric-glow)] text-[var(--electric)]">
              <Award size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight" style={{ color: 'var(--electric)' }}>
              {stats.bestStreak} <span className="text-xs font-normal uppercase opacity-75">{getDaysUnit(stats.bestStreak, language, true)}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {tr.analytics.bestStreakCaption}
            </p>
          </div>
        </div>

        {/* Metric 3: Completion Rate */}
        <div className="surface-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.completionRate}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(16,185,129,0.15)] text-[var(--accent-green)]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight" style={{ color: 'var(--accent-green)' }}>
              {stats.completionRate}%
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {tr.analytics.completionRateCaption}
            </p>
          </div>
        </div>

        {/* Metric 4: Total Check-ins */}
        <div className="surface-card p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.totalCheckins}
            </span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(139,92,246,0.15)] text-[var(--accent-purple)]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums tracking-tight" style={{ color: 'var(--accent-purple)' }}>
              {stats.totalCheckins}
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {tr.analytics.totalCheckinsCaption}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Consistency Heatmap Calendar */}
      <HeatmapCalendar />

      {/* 3.5 Weekly Planner Dynamic Analysis & Sprint Indicator */}
      <WeeklyPlannerIndicator />

      {/* 4. Charts Card (Daily Completion Bar & Monthly Area Trend) */}
      <div className="surface-card p-5 sm:p-6 rounded-2xl space-y-6">
        <div>
          <h3 className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {tr.analytics.dailyCompletion}
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {tr.analytics.watchProgress}
          </p>
        </div>
        <DailyBarChart />
        <div style={{ borderTop: '1px solid var(--border)' }} />
        <div>
          <h3 className="font-display font-bold text-sm tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
            {tr.analytics.executionTrend}
          </h3>
          <MonthlyAreaChart />
        </div>
      </div>

      {/* 5. Habit Rankings & Behavioral Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Top & Weakest Habits */}
        <div className="surface-card p-5 rounded-2xl space-y-4">
          <h3 className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {tr.analytics.topHabits}
          </h3>
          <div className="space-y-3">
            {stats.topHabits.map((h, idx) => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-elevated)] border-hairline">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--electric-glow)] text-[var(--electric)] shrink-0">
                    <HabitIcon icon={h.icon} size={15} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                      {h.name}
                    </span>
                    <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                      #{idx + 1} • {formatDays(h.count, language)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold font-mono text-[var(--accent-green)]">
                    {h.rate}%
                  </span>
                </div>
              </div>
            ))}

            {stats.weakHabits.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <span className="text-xs font-semibold block mb-2" style={{ color: 'var(--accent-orange)' }}>
                  {tr.analytics.needsAttention}
                </span>
                {stats.weakHabits.map((h) => (
                  <div key={h.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-elevated)] border-hairline mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(249,115,22,0.15)] text-[var(--accent-orange)] shrink-0">
                        <HabitIcon icon={h.icon} size={13} />
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{h.name}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-[var(--accent-orange)]">{h.rate}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Productivity Insights */}
        <div className="surface-card p-5 rounded-2xl space-y-4">
          <h3 className="font-display font-bold text-sm tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Sparkles size={16} className="text-[var(--electric)]" />
            <span>{tr.analytics.insightsTitle}</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[var(--electric-glow)] text-[var(--electric)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarIcon size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  {tr.analytics.insightMonday}
                </span>
                <span className="text-xs block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {tr.analytics.insightMondayDesc}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(16,185,129,0.15)] text-[var(--accent-green)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  {tr.analytics.insightMorning}
                </span>
                <span className="text-xs block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {tr.analytics.insightMorningDesc}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-elevated)] border-hairline flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[rgba(245,158,11,0.15)] text-[var(--accent-gold)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Flame size={14} />
              </div>
              <div>
                <span className="text-xs font-semibold block" style={{ color: 'var(--text-primary)' }}>
                  {tr.analytics.insightStreak}
                </span>
                <span className="text-xs block mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {tr.analytics.insightStreakDesc}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
