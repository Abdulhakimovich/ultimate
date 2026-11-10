'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { startOfMonth, endOfMonth, eachDayOfInterval, toDateString } from '@/lib/utils/dates';
import { calculateDailyCompletion, isHabitCompletedOnDate } from '@/lib/utils/calculations';

export default function MonthlyAreaChart() {
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
      const dateStr        = toDateString(day);
      const completedCount = habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;
      return {
        day:        day.getDate(),
        percentage: calculateDailyCompletion(completedCount, habits.length),
      };
    });
  }, [mounted, habits, completions, currentMonth]);

  if (!mounted) return <div className="h-[220px] rounded-xl skeleton-shimmer" />;

  if (habits.length === 0) {
    return (
      <div className="text-center py-8 text-sm" style={{ color: '#3D5A7A' }}>
        {tr.analytics.monthlyTrend}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#7BA7CC' }}>
        {tr.analytics.monthlyTrend}
      </h3>

      <div style={{ height: '200px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="electricAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#00D4FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#3D5A7A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={0} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#3D5A7A', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} ticks={[25, 50, 75, 100]} width={28} />
            <Tooltip
              contentStyle={{ background: '#1A2235', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 8, fontSize: 11, color: '#E8F4FF' }}
              formatter={(value: any) => [`${value}%`, tr.tracker.progress]}
              labelFormatter={(label) => `День ${label}`}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke="#00D4FF"
              strokeWidth={2}
              fill="url(#electricAreaGrad)"
              animationDuration={1200}
              dot={{ r: 2, fill: '#00D4FF', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] italic mt-3 text-center" style={{ color: '#3D5A7A' }}>
        {tr.analytics.autoVisuals}
      </p>
    </div>
  );
}
