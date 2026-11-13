'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { startOfMonth, endOfMonth, eachDayOfInterval, toDateString, isToday } from '@/lib/utils/dates';
import { calculateDailyCompletion, isHabitCompletedOnDate } from '@/lib/utils/calculations';

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function DailyBarChart() {
  const [mounted, setMounted] = useState(false);
  const habits      = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const currentMonth= useHabitsStore((s) => s.currentMonth);
  const language    = useLanguageStore((s) => s.language);
  const tr          = t(language);

  useEffect(() => { setMounted(true); }, []);

  const chartData = useMemo(() => {
    if (!mounted) return [];
    const start = startOfMonth(currentMonth);
    const end   = endOfMonth(currentMonth);
    const days  = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dateStr     = toDateString(day);
      const completedCount = habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;
      const total       = habits.length;
      const percentage  = calculateDailyCompletion(completedCount, total);
      return {
        day:        day.getDate(),
        percentage,
        completed:  completedCount,
        notCompleted: total - completedCount,
        isToday:    isToday(day),
      };
    });
  }, [mounted, habits, completions, currentMonth]);

  if (!mounted) return <div className="h-[220px] rounded-xl skeleton-shimmer" />;

  // Resolve CSS vars for Recharts SVG attributes
  const electricColor   = getCSSVar('--electric', '#00D4FF');
  const textMuted       = getCSSVar('--text-muted', '#3D5A7A');
  const textSecondary   = getCSSVar('--text-secondary', '#7BA7CC');
  const bgElevated      = getCSSVar('--bg-elevated', '#1E2A3E');
  const borderBright    = getCSSVar('--border-bright', 'rgba(0,212,255,0.35)');
  const textPrimary     = getCSSVar('--text-primary', '#E8F4FF');
  const accentGreen     = getCSSVar('--accent-green', '#00FF88');
  const blueMid         = getCSSVar('--blue-mid', '#1E90FF');

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>
        {tr.analytics.dailyCompletion}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
        {tr.analytics.dailyCompletion}
      </h3>

      {/* Data table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-[9px] text-center font-mono" style={{ minWidth: 'max-content' }}>
          <tbody>
            <tr>
              <td className="text-left pr-2 py-0.5 whitespace-nowrap font-bold" style={{ color: 'var(--electric)' }}>%</td>
              {chartData.map((d) => (
                <td
                  key={`pct-${d.day}`}
                  className="px-0.5 py-0.5 font-semibold"
                  style={{ color: d.isToday ? 'var(--electric)' : d.percentage > 0 ? 'var(--text-secondary)' : 'var(--text-muted)' }}
                >
                  {d.percentage}
                </td>
              ))}
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="text-left pr-2 py-0.5 whitespace-nowrap font-bold" style={{ color: 'var(--accent-green)' }}>✓</td>
              {chartData.map((d) => (
                <td key={`done-${d.day}`} className="px-0.5 py-0.5" style={{ color: 'var(--accent-green)' }}>{d.completed}</td>
              ))}
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="text-left pr-2 py-0.5 whitespace-nowrap font-bold" style={{ color: '#FF3366' }}>✗</td>
              {chartData.map((d) => (
                <td key={`miss-${d.day}`} className="px-0.5 py-0.5" style={{ color: '#FF3366' }}>{d.notCompleted}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bar Chart */}
      <div style={{ height: '160px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={8}>
            <CartesianGrid strokeDasharray="3 3" stroke={`${electricColor}1a`} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: textMuted, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 9, fill: textMuted, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} width={28} />
            <Tooltip
              contentStyle={{ background: bgElevated, border: `1px solid ${borderBright}`, borderRadius: 8, fontSize: 11, color: textPrimary }}
              formatter={(value: any) => [`${value}%`, tr.tracker.completed]}
              labelFormatter={(label) => `День ${label}`}
            />
            <Bar dataKey="percentage" radius={[3, 3, 0, 0]} animationDuration={600}>
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.isToday ? electricColor : entry.percentage >= 75 ? accentGreen : blueMid}
                  style={{ filter: entry.isToday ? `drop-shadow(0 0 4px ${electricColor}99)` : 'none' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] italic mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
        {tr.analytics.watchProgress}
      </p>
    </div>
  );
}
