'use client';

import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString } from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';

export default function HeatmapCalendar() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const allCompletions = useHabitsStore((s) => s.allCompletions);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const completionData = allCompletions.length > 0 ? allCompletions : completions;

  // Generate the last 18 weeks (approx 126 days) ending today
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    // Find the Sunday of the current week (or end of week)
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0..Sun=6
    const totalDays = 18 * 7; // 18 weeks
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (totalDays - 1 - (6 - dayOfWeek)));

    const days: { date: Date; dateStr: string; count: number; pct: number }[] = [];
    const curr = new Date(startDate);

    for (let i = 0; i < totalDays; i++) {
      const dStr = toDateString(curr);
      const count = habits.filter((h) => isHabitCompletedOnDate(completionData, h.id, dStr)).length;
      const pct = habits.length > 0 ? count / habits.length : 0;
      days.push({
        date: new Date(curr),
        dateStr: dStr,
        count,
        pct,
      });
      curr.setDate(curr.getDate() + 1);
    }

    // Group into columns of 7 days (Monday..Sunday)
    const weekCols: (typeof days)[] = [];
    for (let w = 0; w < 18; w++) {
      weekCols.push(days.slice(w * 7, (w + 1) * 7));
    }

    // Month headers
    const mLabels: { text: string; colIndex: number }[] = [];
    let lastMonth = -1;
    weekCols.forEach((col, idx) => {
      const firstDayOfMonth = col[0].date;
      const m = firstDayOfMonth.getMonth();
      if (m !== lastMonth) {
        mLabels.push({ text: tr.shortMonths[m], colIndex: idx });
        lastMonth = m;
      }
    });

    return { weeks: weekCols, monthLabels: mLabels };
  }, [habits, completionData, tr.shortMonths]);

  function getCellStyle(pct: number): { background: string; border: string; boxShadow?: string } {
    if (pct === 0) {
      return {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-subtle)',
      };
    }
    if (pct <= 0.25) {
      return {
        background: 'rgba(0, 118, 249, 0.22)',
        border: '1px solid rgba(0, 118, 249, 0.35)',
      };
    }
    if (pct <= 0.5) {
      return {
        background: 'rgba(0, 118, 249, 0.45)',
        border: '1px solid rgba(0, 118, 249, 0.55)',
      };
    }
    if (pct <= 0.75) {
      return {
        background: 'rgba(0, 118, 249, 0.72)',
        border: '1px solid var(--electric)',
      };
    }
    return {
      background: 'var(--electric)',
      border: '1px solid var(--border-bright)',
      boxShadow: '0 0 6px var(--electric-glow)',
    };
  }

  const weekdayShorts = [
    tr.tracker.weekdays[0], // Mon
    '',
    tr.tracker.weekdays[2], // Wed
    '',
    tr.tracker.weekdays[4], // Fri
    '',
    '',
  ];

  return (
    <div className="surface-card p-5 rounded-2xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border-hairline shrink-0"
            style={{ background: 'var(--electric-glow)', borderColor: 'var(--electric)' }}
          >
            <CalendarIcon size={14} style={{ color: 'var(--electric)' }} />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {tr.analytics.heatmapTitle}
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {tr.analytics.heatmapSubtitle}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>{tr.analytics.less}</span>
          <div className="w-2.5 h-2.5 rounded-[2px] border border-[var(--border-subtle)]" style={{ background: 'var(--bg-elevated)' }} title="0%" />
          <div className="w-2.5 h-2.5 rounded-[2px] border border-[rgba(0,118,249,0.35)]" style={{ background: 'rgba(0, 118, 249, 0.22)' }} title="1-25%" />
          <div className="w-2.5 h-2.5 rounded-[2px] border border-[rgba(0,118,249,0.55)]" style={{ background: 'rgba(0, 118, 249, 0.45)' }} title="26-50%" />
          <div className="w-2.5 h-2.5 rounded-[2px] border border-[var(--electric)]" style={{ background: 'rgba(0, 118, 249, 0.72)' }} title="51-75%" />
          <div className="w-2.5 h-2.5 rounded-[2px] border border-[var(--border-bright)]" style={{ background: 'var(--electric)', boxShadow: '0 0 4px var(--electric-glow)' }} title="76-100%" />
          <span>{tr.analytics.more}</span>
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[540px]">
          {/* Month labels row */}
          <div className="flex text-xs font-mono mb-1.5 pl-6" style={{ color: 'var(--text-muted)' }}>
            {weeks.map((_, idx) => {
              const match = monthLabels.find((m) => m.colIndex === idx);
              return (
                <div key={idx} className="w-[15px] mr-1">
                  {match ? match.text : ''}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 rows x 18 cols */}
          <div className="flex">
            {/* Weekday indicator labels */}
            <div className="flex flex-col justify-between pr-2 text-xs font-mono select-none" style={{ color: 'var(--text-muted)' }}>
              {weekdayShorts.map((lbl, idx) => (
                <div key={idx} className="h-[13px] leading-[13px] text-right">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1">
              {weeks.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-1">
                  {col.map((day) => {
                    const style = getCellStyle(day.pct);
                    return (
                      <div
                        key={day.dateStr}
                        className="w-[13px] h-[13px] rounded-[3px] transition-transform hover:scale-125 cursor-pointer"
                        style={style}
                        title={`${day.dateStr}: ${day.count} habits completed (${Math.round(day.pct * 100)}%)`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
