'use client';

import React, { useMemo } from 'react';
import { Check, Calendar, ArrowRight } from 'lucide-react';
import type { Habit, HabitCompletion } from '@/lib/types';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import { toDateString } from '@/lib/utils/dates';
import { triggerFeedback } from '@/lib/feedback';
import { t } from '@/lib/i18n';

interface TodayViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  todayStr: string;
  onToggle: (habitId: string, dateStr: string) => void;
  onSwitchToGrid: () => void;
  tr: ReturnType<typeof t>;
}

export default function TodayView({
  habits,
  completions,
  todayStr,
  onToggle,
  onSwitchToGrid,
  tr,
}: TodayViewProps) {
  // Generate last 7 days array (oldest to newest: ending today)
  const last7Days = useMemo(() => {
    const days: { date: Date; dateStr: string; label: string; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = toDateString(d);
      const dayIdx = (d.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
      const label = tr.tracker.weekdays[dayIdx] || '';
      days.push({
        date: d,
        dateStr: str,
        label,
        isToday: i === 0,
      });
    }
    return days;
  }, [tr]);

  // Today stats
  const totalCount = habits.length;
  const completedTodayCount = habits.filter((h) =>
    isHabitCompletedOnDate(completions, h.id, todayStr)
  ).length;
  const pct = totalCount > 0 ? Math.round((completedTodayCount / totalCount) * 100) : 0;

  // Ring geometry
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const handleToggle = (habitId: string) => {
    const isDone = isHabitCompletedOnDate(completions, habitId, todayStr);
    triggerFeedback(!isDone ? 'check' : 'uncheck');
    onToggle(habitId, todayStr);
  };

  return (
    <div className="space-y-4 md:hidden">
      {/* Top Banner Card: Progress Ring + Summary & Toggle */}
      <div className="surface-card p-4 rounded-2xl border-hairline flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3.5">
          {/* Progress Ring */}
          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-[var(--border)]"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="var(--electric)"
                strokeWidth="7"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono font-bold text-sm text-[var(--electric)] tabular-nums">
                {pct}%
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              {tr.greeting?.todayView || 'Сегодня'}
            </div>
            <div className="text-base font-bold text-[var(--text-primary)]">
              {completedTodayCount} / {totalCount}{' '}
              <span className="text-xs font-normal text-[var(--text-secondary)]">
                {tr.tracker.completed.toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Toggle to Full Grid Button */}
        <button
          type="button"
          onClick={onSwitchToGrid}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border border-[var(--border)] bg-[var(--bg-elevated)] hover:bg-[var(--electric-glow)] text-[var(--text-primary)] active:scale-95"
          aria-label={tr.greeting?.switchToGrid || 'Сетка месяца'}
        >
          <Calendar size={14} className="text-[var(--electric)]" />
          <span>{tr.greeting?.monthView || 'Весь месяц'}</span>
          <ArrowRight size={12} className="opacity-60" />
        </button>
      </div>

      {/* Habit Rows */}
      <div className="space-y-2.5">
        {habits.map((habit) => {
          const habitColor = habit.color || 'var(--electric)';
          const isDoneToday = isHabitCompletedOnDate(completions, habit.id, todayStr);

          return (
            <div
              key={habit.id}
              className="surface-card p-4 rounded-2xl border-hairline flex items-center justify-between gap-3 shadow-sm hover:border-[var(--border-bright)] transition-all"
            >
              {/* Left Column: Habit Info & 7-Day Dots */}
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: habitColor }}
                  />
                  <span className="font-semibold text-sm truncate text-[var(--text-primary)]">
                    {habit.name}
                  </span>
                </div>

                {/* 7-Day Dot Strip */}
                <div className="flex items-center gap-1.5">
                  {last7Days.map((day) => {
                    const done = isHabitCompletedOnDate(completions, habit.id, day.dateStr);
                    return (
                      <div
                        key={day.dateStr}
                        className="flex flex-col items-center gap-0.5"
                        title={`${day.dateStr}: ${done ? 'Done' : 'Incomplete'}`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                            day.isToday ? 'ring-1 ring-[var(--electric)]' : ''
                          }`}
                          style={{
                            background: done ? habitColor : 'var(--bg-elevated)',
                            border: done ? 'none' : '1px solid var(--border)',
                          }}
                        >
                          {done && <Check size={8} className="text-white stroke-[3]" />}
                        </div>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: 48px Check Button */}
              <button
                type="button"
                role="checkbox"
                aria-checked={isDoneToday}
                aria-label={`${habit.name}: ${isDoneToday ? tr.tracker.cellDone : tr.tracker.checkHabit}`}
                onClick={() => handleToggle(habit.id)}
                className="w-12 h-12 min-w-[48px] min-h-[48px] rounded-2xl flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-sm"
                style={{
                  background: isDoneToday ? habitColor : 'var(--bg-elevated)',
                  border: isDoneToday ? `2px solid ${habitColor}` : '2px solid var(--border)',
                  boxShadow: isDoneToday ? `0 0 12px ${habitColor}66` : 'none',
                }}
              >
                {isDoneToday ? (
                  <Check size={22} className="text-white stroke-[3] animate-check-pop" />
                ) : (
                  <div
                    className="w-4 h-4 rounded-md border-2 border-dashed opacity-40"
                    style={{ borderColor: habitColor }}
                  />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
