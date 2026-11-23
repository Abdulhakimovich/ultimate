'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { useMounted } from '@/hooks/useMounted';
import { t } from '@/lib/i18n';
import { startOfMonth, endOfMonth, eachDayOfInterval, toDateString, isToday } from '@/lib/utils/dates';
import { calculateDailyCompletion, isHabitCompletedOnDate } from '@/lib/utils/calculations';

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function DailyBarChart() {
  const mounted = useMounted();
  const [isMobile, setIsMobile] = useState(false);

  const habits       = useHabitsStore((s) => s.habits);
  const completions  = useHabitsStore((s) => s.completions);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const language     = useLanguageStore((s) => s.language);
  const tr           = t(language);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const chartData = useMemo(() => {
    if (!mounted) return [];
    const start = startOfMonth(currentMonth);
    const end   = endOfMonth(currentMonth);
    const days  = eachDayOfInterval({ start, end });
    const todayStr = toDateString(new Date());

    return days.map((day) => {
      const dateStr        = toDateString(day);
      const isFuture       = dateStr > todayStr;
      const completedCount = isFuture
        ? null
        : habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;
      const total          = habits.length;
      const percentage     = isFuture || completedCount === null
        ? null
        : calculateDailyCompletion(completedCount, total);

      return {
        day:          day.getDate(),
        percentage,
        completed:    completedCount,
        isToday:      isToday(day),
        isFuture,
      };
    });
  }, [mounted, habits, completions, currentMonth]);

  if (!mounted) return <div className="h-[200px] rounded-xl skeleton-shimmer" />;

  const textMuted     = getCSSVar('--text-muted', '#64748B');
  const bgElevated    = getCSSVar('--bg-elevated', '#141A29');
  const borderBright  = getCSSVar('--border-bright', 'rgba(0,118,249,0.40)');
  const textPrimary   = getCSSVar('--text-primary', '#F8FAFC');

  if (habits.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Scrollable Data Table with sticky row labels (removed red ✗ row and ascending velocity legend) */}
      <div className="overflow-x-auto pb-1">
        <table className="w-full text-xs text-center font-mono tabular-nums border-collapse" style={{ minWidth: 'max-content' }}>
          <tbody>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="sticky left-0 z-10 text-left pr-3 py-1 font-bold whitespace-nowrap bg-[var(--bg-card)]" style={{ color: 'var(--electric)' }}>
                %
              </td>
              {chartData.map((d) => {
                if (d.percentage === null) {
                  return (
                    <td key={`pct-${d.day}`} className="px-1 py-1 font-mono text-[var(--text-muted)] opacity-25">
                      —
                    </td>
                  );
                }

                return (
                  <td
                    key={`pct-${d.day}`}
                    className={`px-1 py-1 font-mono transition-colors rounded ${
                      d.percentage > 0
                        ? 'text-[var(--blue-text)] bg-[var(--blue-soft)] font-bold'
                        : 'text-[var(--text-muted)] bg-[var(--bg-elevated)] font-medium'
                    }`}
                    title={`${d.day}: ${d.percentage}%`}
                  >
                    {d.percentage}%
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="sticky left-0 z-10 text-left pr-3 py-1 font-bold whitespace-nowrap bg-[var(--bg-card)]" style={{ color: 'var(--electric)' }}>
                ✓
              </td>
              {chartData.map((d) => (
                <td key={`done-${d.day}`} className="px-1 py-1 font-semibold" style={{ color: d.completed === null ? 'var(--text-muted)' : 'var(--electric)', opacity: d.completed === null ? 0.25 : 1 }}>
                  {d.completed === null ? '—' : d.completed}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bar Chart with clean single electric blue hue for completed days */}
      <div style={{ height: '170px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={isMobile ? 5 : 8} margin={{ top: 8, right: 18, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: textMuted, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              interval={isMobile ? 4 : 0}
            />
            <YAxis
              tick={{ fontSize: 12, fill: textMuted, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              width={42}
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: bgElevated,
                border: `1px solid ${borderBright}`,
                borderRadius: 10,
                fontSize: 12,
                color: textPrimary,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
              formatter={(value: any) => [value !== null && value !== undefined ? `${value}%` : '—', tr.tracker.completed]}
              labelFormatter={(label) => `${tr.tracker.todayDate}: ${label} ${tr.months[currentMonth.getMonth()]}`}
            />
            <Bar dataKey="percentage" minPointSize={0} radius={[3, 3, 0, 0]} animationDuration={500}>
              {chartData.map((entry, i) => {
                if (entry.percentage === null || entry.percentage === 0) {
                  return <Cell key={`cell-${i}`} fill="transparent" />;
                }
                return (
                  <Cell
                    key={`cell-${i}`}
                    fill="var(--electric)"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}