'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
} from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString, getWeekDays, formatShortDotDate, isToday } from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import { getTasksForDateRange } from '@/lib/storage';
import type { Task } from '@/lib/types';

export default function WeeklyPlannerIndicator() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const allCompletions = useHabitsStore((s) => s.allCompletions);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const completionData = allCompletions.length > 0 ? allCompletions : completions;

  const today = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => getWeekDays(today), [today]);

  useEffect(() => {
    setMounted(true);
    if (weekDays.length === 7) {
      const startStr = toDateString(weekDays[0]);
      const endStr = toDateString(weekDays[6]);
      const loadedTasks = getTasksForDateRange(startStr, endStr);
      setTasks(loadedTasks);
    }
  }, [weekDays]);

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;
    const taskRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Daily breakdown Mon..Sun
    const dailyBreakdown = weekDays.map((day, idx) => {
      const dStr = toDateString(day);
      const dayTasks = tasks.filter((t) => t.day_date === dStr);
      const dayDone = dayTasks.filter((t) => t.completed).length;
      const dayTotal = dayTasks.length;
      const dayPct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;

      // Habit completion for this day
      const habitCount = habits.filter((h) => isHabitCompletedOnDate(completionData, h.id, dStr)).length;
      const habitPct = habits.length > 0 ? Math.round((habitCount / habits.length) * 100) : 0;

      return {
        weekday: tr.tracker.weekdays[idx],
        date: day,
        dateStr: dStr,
        dayNum: day.getDate(),
        total: dayTotal,
        done: dayDone,
        taskPct: dayPct,
        habitPct,
        isToday: isToday(day),
      };
    });

    // Weekly habit synergy
    const weekStartStr = toDateString(weekDays[0]);
    const weekEndStr = toDateString(weekDays[6]);
    const weekHabitCheckins = completionData.filter(
      (c) => c.completed_date >= weekStartStr && c.completed_date <= weekEndStr
    ).length;
    const totalPossibleHabits = habits.length * 7;
    const habitRate = totalPossibleHabits > 0 ? Math.round((weekHabitCheckins / totalPossibleHabits) * 100) : 0;

    // Combined Weekly Discipline Score (60% task execution + 40% habit adherence)
    const combinedScore = totalTasks > 0
      ? Math.round(taskRate * 0.6 + habitRate * 0.4)
      : habitRate;

    // Dynamic Pace Badge
    let paceLabel = tr.analytics.sprintPaceStart;
    let paceColor = 'var(--text-secondary)';
    let paceBg = 'var(--bg-elevated)';
    let paceBorder = 'var(--border)';

    if (taskRate >= 80) {
      paceLabel = tr.analytics.sprintPacePeak;
      paceColor = 'var(--electric)';
      paceBg = 'var(--electric-glow)';
      paceBorder = 'var(--electric)';
    } else if (taskRate >= 50) {
      paceLabel = tr.analytics.sprintPaceGood;
      paceColor = 'var(--blue-neon)';
      paceBg = 'rgba(0, 210, 255, 0.12)';
      paceBorder = 'rgba(0, 210, 255, 0.35)';
    } else if (taskRate >= 20) {
      paceLabel = tr.analytics.sprintPaceSteady;
      paceColor = 'var(--accent-gold)';
      paceBg = 'rgba(245, 158, 11, 0.12)';
      paceBorder = 'rgba(245, 158, 11, 0.35)';
    }

    return {
      totalTasks,
      completedTasks,
      remainingTasks,
      taskRate,
      habitRate,
      combinedScore,
      dailyBreakdown,
      paceLabel,
      paceColor,
      paceBg,
      paceBorder,
    };
  }, [tasks, weekDays, habits, completionData, tr]);

  if (!mounted) {
    return <div className="h-44 rounded-2xl skeleton-shimmer" />;
  }

  const weekRange = `${formatShortDotDate(weekDays[0])} — ${formatShortDotDate(weekDays[6])}`;

  return (
    <div className="surface-card p-5 sm:p-6 rounded-2xl space-y-5 relative overflow-hidden border-hairline">
      {/* Ambient background light */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none blur-3xl opacity-20"
        style={{ background: 'var(--electric)' }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border-hairline shrink-0"
            style={{ background: 'var(--electric-glow)', borderColor: 'var(--electric)' }}
          >
            <LayoutDashboard size={16} style={{ color: 'var(--electric)' }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-sm sm:text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tr.analytics.weeklyPlannerAnalysis}
              </h3>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border-hairline"
                style={{
                  background: stats.paceBg,
                  color: stats.paceColor,
                  borderColor: stats.paceBorder,
                }}
              >
                ⚡ {stats.paceLabel}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.weeklyPlannerSubtitle} • <span className="font-mono text-[11px]">{weekRange}</span>
            </p>
          </div>
        </div>

        <Link
          href="/planner"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95 shrink-0 self-start sm:self-auto border-hairline"
          style={{
            background: 'var(--bg-elevated)',
            color: 'var(--electric)',
            borderColor: 'var(--border-bright)',
          }}
        >
          <span>{tr.analytics.openPlanner}</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {/* 3 Metric Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Metric 1: Sprint Velocity Gauge */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border-hairline flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.sprintVelocity}
            </span>
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[var(--electric-glow)] text-[var(--electric)]">
              <Zap size={13} />
            </div>
          </div>

          <div className="my-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold tabular-nums" style={{ color: 'var(--electric)' }}>
              {stats.taskRate}%
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              ({stats.completedTasks}/{stats.totalTasks} {tr.planner.completed})
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats.taskRate}%`,
                background: 'linear-gradient(90deg, var(--blue-neon), var(--electric))',
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono mt-2" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-[var(--electric)]" />
              <span>{stats.completedTasks} {tr.analytics.tasksCompleted.toLowerCase()}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-[var(--text-muted)]" />
              <span>{stats.remainingTasks} {tr.analytics.tasksRemaining.toLowerCase()}</span>
            </span>
          </div>
        </div>

        {/* Metric 2: Daily Sprint Execution Distribution */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border-hairline flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.dailyCompletion}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {tr.ui.today}
            </span>
          </div>

          {/* 7 Daily Micro-Bars */}
          <div className="grid grid-cols-7 gap-1.5 h-20 items-end py-1">
            {stats.dailyBreakdown.map((d) => (
              <div key={d.dateStr} className="flex flex-col items-center h-full justify-end group relative">
                {/* Bar */}
                <div className="w-full bg-[var(--bg-card)] rounded-[3px] h-12 flex items-end overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className="w-full rounded-[2px] transition-all duration-300"
                    style={{
                      height: `${Math.max(d.total > 0 ? d.taskPct : (d.habitPct > 0 ? d.habitPct * 0.4 : 4), 4)}%`,
                      background: d.isToday
                        ? 'var(--electric)'
                        : d.taskPct >= 80
                        ? 'var(--blue-neon)'
                        : d.taskPct > 0
                        ? 'rgba(0, 118, 249, 0.6)'
                        : 'var(--border-subtle)',
                      boxShadow: d.isToday ? '0 0 6px var(--electric-glow)' : 'none',
                    }}
                  />
                </div>

                {/* Day label */}
                <span
                  className={`text-[9px] font-mono mt-1 ${
                    d.isToday ? 'font-bold text-[var(--electric)]' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {d.weekday}
                </span>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-1 hidden group-hover:block z-20 px-2 py-1 rounded-md bg-[var(--bg-primary)] border-hairline text-[10px] font-mono whitespace-nowrap shadow-lg">
                  {d.dayNum}: {d.done}/{d.total} {tr.planner.tasks} ({d.taskPct}%)
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] font-mono text-center mt-1" style={{ color: 'var(--text-muted)' }}>
            Пн • Вт • Ср • Чт • Пт • Сб • Вс
          </div>
        </div>

        {/* Metric 3: Combined Weekly Discipline Index */}
        <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border-hairline flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.weeklyDisciplineIndex}
            </span>
            <div className="w-6 h-6 rounded-md flex items-center justify-center bg-[rgba(16,185,129,0.15)] text-[var(--accent-green)]">
              <TrendingUp size={13} />
            </div>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold tabular-nums text-[var(--text-primary)]">
              {stats.combinedScore}
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              / 100
            </span>
          </div>

          {/* Breakdown mini-meters */}
          <div className="space-y-1.5 text-[11px] font-mono">
            <div>
              <div className="flex justify-between text-[10px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                <span>{tr.planner.tasks} ({tr.planner.completed})</span>
                <span className="text-[var(--electric)] font-bold">{stats.taskRate}%</span>
              </div>
              <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--electric)] transition-all duration-300"
                  style={{ width: `${stats.taskRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[10px] mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                <span>{tr.tracker.habit} ({tr.analytics.heatmapTitle.split(' ')[0]})</span>
                <span className="text-[var(--accent-green)] font-bold">{stats.habitRate}%</span>
              </div>
              <div className="w-full bg-[var(--border)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent-green)] transition-all duration-300"
                  style={{ width: `${stats.habitRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
