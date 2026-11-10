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

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: '#3D5A7A' }}>
        {tr.analytics.dailyCompletion}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7BA7CC' }}>
        {tr.analytics.dailyCompletion}
      </h3>

      {/* Data table */}
      <div className="overflow-x-auto mb-3">
        <table className="w-full text-[9px] text-center font-mono" style={{ minWidth: 'max-content' }}>
          <tbody>
            <tr>
              <td className="text-left pr-2 py-0.5 whitespace-nowrap font-bold" style={{ color: '#00D4FF' }}>%</td>
              {chartData.map((d) => (
                <td
                  key={`pct-${d.day}`}
                  className="px-0.5 py-0.5 font-semibold"
                  style={{ color: d.isToday ? '#00D4FF' : d.percentage > 0 ? '#7BA7CC' : '#3D5A7A' }}
                >
                  {d.percentage}
                </td>
              ))}
            </tr>
            <tr style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
              <td className="text-left pr-2 py-0.5 whitespace-nowrap font-bold" style={{ color: '#00FF88' }}>✓</td>
              {chartData.map((d) => (
                <td key={`done-${d.day}`} className="px-0.5 py-0.5" style={{ color: '#00FF88' }}>{d.completed}</td>
              ))}
            </tr>
            <tr style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#3D5A7A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis tick={{ fontSize: 9, fill: '#3D5A7A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} width={28} />
            <Tooltip
              contentStyle={{ background: '#1A2235', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, fontSize: 11, color: '#E8F4FF' }}
              formatter={(value: any) => [`${value}%`, tr.tracker.completed]}
              labelFormatter={(label) => `День ${label}`}
            />
            <Bar dataKey="percentage" radius={[3, 3, 0, 0]} animationDuration={600}>
              {chartData.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={entry.isToday ? '#00D4FF' : entry.percentage >= 75 ? '#00FF88' : '#1E90FF'}
                  style={{ filter: entry.isToday ? 'drop-shadow(0 0 4px rgba(0,212,255,0.6))' : 'none' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] italic mt-3 text-center" style={{ color: '#3D5A7A' }}>
        {tr.analytics.watchProgress}
      </p>
    </div>
  );
}

