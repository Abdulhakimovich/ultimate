'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { useMounted } from '@/hooks/useMounted';
import { t } from '@/lib/i18n';
import { startOfMonth, endOfMonth, eachDayOfInterval, toDateString } from '@/lib/utils/dates';
import { calculateDailyCompletion, isHabitCompletedOnDate } from '@/lib/utils/calculations';

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export default function MonthlyAreaChart() {
  const mounted = useMounted();
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<'entire' | 'monthly'>('entire');

  const habits         = useHabitsStore((s) => s.habits);
  const completions    = useHabitsStore((s) => s.completions);
  const allCompletions = useHabitsStore((s) => s.allCompletions);
  const currentMonth   = useHabitsStore((s) => s.currentMonth);
  const language       = useLanguageStore((s) => s.language);
  const tr             = t(language);

  const year = currentMonth.getFullYear();

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
      const dateStr = toDateString(day);
      const isFuture = dateStr > todayStr;
      const completedCount = isFuture
        ? null
        : habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;

      return {
        day:        day.getDate(),
        name:       String(day.getDate()),
        percentage: isFuture || completedCount === null ? null : calculateDailyCompletion(completedCount, habits.length),
        fullLabel:  `${day.getDate()} ${tr.months[currentMonth.getMonth()]}`,
        isFuture,
      };
    });
  }, [mounted, habits, completions, currentMonth, tr.months]);

  const annualChartData = useMemo(() => {
    if (!mounted || habits.length === 0) return [];

    const now = new Date();
    const currentRealYear = now.getFullYear();
    const currentRealMonth = now.getMonth() + 1; // 1-12

    // Find earliest month with check-ins
    const validDates = allCompletions
      .map((c) => c.completed_date)
      .filter(Boolean)
      .sort();

    let earliestYear = currentRealYear;
    let earliestMonth = currentRealMonth;
    if (validDates.length > 0) {
      const [ey, em] = validDates[0].split('-').map(Number);
      if (ey && em) {
        earliestYear = ey;
        earliestMonth = em;
      }
    }

    return tr.shortMonths.map((mShort, idx) => {
      const targetMonth = idx + 1;
      const monthPrefix = `${year}-${String(targetMonth).padStart(2, '0')}`;
      const isBeforeStart = year < earliestYear || (year === earliestYear && targetMonth < earliestMonth);
      const isAfterNow = year > currentRealYear || (year === currentRealYear && targetMonth > currentRealMonth);

      if (isBeforeStart || isAfterNow) {
        return {
          day: mShort,
          name: mShort,
          percentage: null,
          fullLabel: `${tr.months[idx]} ${year}`,
        };
      }

      const monthCompletions = allCompletions.filter((c) => c.completed_date.startsWith(monthPrefix));
      const daysInTargetMonth = new Date(year, targetMonth, 0).getDate();
      const totalPossible = daysInTargetMonth * habits.length;
      const pct = totalPossible > 0 ? Math.round((monthCompletions.length / totalPossible) * 100) : 0;
      return {
        day: mShort,
        name: mShort,
        percentage: pct,
        fullLabel: `${tr.months[idx]} ${year}`,
      };
    });
  }, [mounted, habits.length, tr.shortMonths, tr.months, year, allCompletions]);

  if (!mounted) return <div className="h-[200px] rounded-xl skeleton-shimmer" />;

  const electricColor = getCSSVar('--electric', '#0076F9');
  const textMuted     = getCSSVar('--text-muted', '#64748B');
  const bgElevated    = getCSSVar('--bg-elevated', '#141A29');
  const borderBright  = getCSSVar('--border-bright', 'rgba(0,118,249,0.35)');
  const textPrimary   = getCSSVar('--text-primary', '#F8FAFC');

  if (habits.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Subheader with View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-mono font-semibold text-[var(--electric)] px-2 py-0.5 rounded-md bg-[var(--electric-glow)] border-hairline">
          {viewMode === 'entire' ? `${tr.analytics.entirePeriod} (${year})` : `${tr.months[currentMonth.getMonth()]} ${year}`}
        </span>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[var(--bg-elevated)] border-hairline">
          <button
            type="button"
            onClick={() => setViewMode('entire')}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
              viewMode === 'entire'
                ? 'bg-[#0A5FD6] text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tr.analytics.allMonths}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('monthly')}
            className={`px-2.5 py-0.5 rounded text-xs font-mono transition-all ${
              viewMode === 'monthly'
                ? 'bg-[#0A5FD6] text-white font-bold shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tr.analytics.dailyView}
          </button>
        </div>
      </div>

      <div style={{ height: '170px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={(viewMode === 'entire' ? annualChartData : chartData) as any[]}
            margin={{ top: 8, right: 18, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={electricColor} stopOpacity={0.4} />
                <stop offset="60%" stopColor={electricColor} stopOpacity={0.12} />
                <stop offset="95%" stopColor={electricColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 12, fill: textMuted, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
              interval={viewMode === 'entire' ? 0 : (isMobile ? 4 : 0)}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: textMuted, fontFamily: 'JetBrains Mono' }}
              axisLine={false}
              tickLine={false}
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
              formatter={(value: any) => [value !== null && value !== undefined ? `${value}%` : '—', tr.tracker.progress]}
              labelFormatter={(label: any, payload: any) => payload?.[0]?.payload?.fullLabel || label}
            />
            <Area
              type="monotone"
              dataKey="percentage"
              stroke={electricColor}
              strokeWidth={2}
              fill="url(#areaGradient)"
              connectNulls={false}
              animationDuration={600}
              dot={{ r: viewMode === 'entire' ? 3.5 : 2, fill: electricColor, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#FFFFFF', stroke: electricColor, strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
