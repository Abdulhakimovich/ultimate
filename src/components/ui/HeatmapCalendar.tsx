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

  // Generate 53 weeks (approx 371 days ending on current week's Sunday) to fill the card
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7; // Mon=0..Sun=6
    const totalWeeks = 53;
    const totalDays = totalWeeks * 7;
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

    const weekCols: (typeof days)[] = [];
    for (let w = 0; w < totalWeeks; w++) {
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
    <div className="surface-card p-5 sm:p-6 rounded-2xl space-y-3.5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border-hairline shrink-0"
            style={{ background: 'var(--blue-soft)', borderColor: 'var(--blue)' }}
          >
            <CalendarIcon size={14} className="text-[var(--blue-text)]" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm tracking-tight text-[var(--text-primary)]">
              {tr.analytics.heatmapTitle}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {tr.analytics.heatmapSubtitle}
            </p>
          </div>
        </div>

        {/* Legend next to title on wide screens */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--text-muted)] self-end sm:self-center">
          <span>{tr.analytics.less}</span>
          <div className="w-3 h-3 rounded-[2px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)]" title="0%" />
          <div className="w-3 h-3 rounded-[2px] bg-[#BFDBFE] dark:bg-[rgba(10,92,255,0.28)] border border-[#93C5FD] dark:border-[rgba(10,92,255,0.45)]" title="1-25%" />
          <div className="w-3 h-3 rounded-[2px] bg-[#60A5FA] dark:bg-[rgba(10,92,255,0.52)] border border-[#3B82F6] dark:border-[rgba(10,92,255,0.65)]" title="26-50%" />
          <div className="w-3 h-3 rounded-[2px] bg-[#2563EB] dark:bg-[rgba(10,92,255,0.78)] border border-[#1D4ED8] dark:border-[var(--electric)]" title="51-75%" />
          <div className="w-3 h-3 rounded-[2px] bg-[#1D4ED8] dark:bg-[var(--electric)] border border-[#1E40AF] dark:border-[var(--border-bright)] shadow-sm" title="76-100%" />
          <span>{tr.analytics.more}</span>
        </div>
      </div>

      {/* Grid Container - 53 weeks computed to fill container */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[680px] w-full">
          {/* Month labels row */}
          <div className="flex text-xs font-mono mb-1 pl-6 text-[var(--text-muted)] w-full">
            {weeks.map((_, idx) => {
              const match = monthLabels.find((m) => m.colIndex === idx);
              return (
                <div key={idx} className="flex-1 min-w-0 text-left overflow-visible whitespace-nowrap">
                  {match ? match.text : ''}
                </div>
              );
            })}
          </div>

          {/* Grid: 7 rows x 53 cols */}
          <div className="flex w-full items-center">
            {/* Weekday indicator labels */}
            <div className="flex flex-col justify-between pr-2 text-xs font-mono select-none text-[var(--text-muted)] w-6 shrink-0 h-[100px]">
              {weekdayShorts.map((lbl, idx) => (
                <div key={idx} className="text-right leading-none">
                  {lbl}
                </div>
              ))}
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3px] flex-1 w-full justify-between">
              {weeks.map((col, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px] flex-1 min-w-[7px]">
                  {col.map((day) => {
                    let levelClass = 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]';
                    if (day.pct > 0 && day.pct <= 0.25) {
                      levelClass = 'bg-[#BFDBFE] dark:bg-[rgba(10,92,255,0.28)] border border-[#93C5FD] dark:border-[rgba(10,92,255,0.45)]';
                    } else if (day.pct > 0.25 && day.pct <= 0.5) {
                      levelClass = 'bg-[#60A5FA] dark:bg-[rgba(10,92,255,0.52)] border border-[#3B82F6] dark:border-[rgba(10,92,255,0.65)]';
                    } else if (day.pct > 0.5 && day.pct <= 0.75) {
                      levelClass = 'bg-[#2563EB] dark:bg-[rgba(10,92,255,0.78)] border border-[#1D4ED8] dark:border-[var(--electric)]';
                    } else if (day.pct > 0.75) {
                      levelClass = 'bg-[#1D4ED8] dark:bg-[var(--electric)] border border-[#1E40AF] dark:border-[var(--border-bright)] shadow-[0_0_4px_var(--electric-glow)]';
                    }

                    return (
                      <div
                        key={day.dateStr}
                        className={`w-full aspect-square rounded-[2px] transition-transform hover:scale-125 cursor-pointer ${levelClass}`}
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