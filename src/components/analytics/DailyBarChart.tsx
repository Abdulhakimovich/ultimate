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

interface VelocityTier {
  color: string;
  bg: string;
  border: string;
}

function getVelocityTier(pct: number, minVal: number, maxVal: number): VelocityTier {
  if (maxVal > minVal) {
    if (pct === maxVal && maxVal > 0) {
      return {
        color: 'var(--electric)',
        bg: 'var(--electric-glow)',
        border: 'var(--electric)',
      };
    }
    if (pct === minVal) {
      return {
        color: 'var(--accent-red)',
        bg: 'rgba(239, 68, 68, 0.16)',
        border: 'var(--accent-red)',
      };
    }
  }

  // Ascending scale: Red (0-29%) -> Orange (30-59%) -> Gold (60-79%) -> Azure (80-89%) -> Electric Blue (90-100%)
  if (pct === 0) {
    return {
      color: 'var(--accent-red)',
      bg: 'rgba(239, 68, 68, 0.14)',
      border: 'rgba(239, 68, 68, 0.40)',
    };
  } else if (pct < 30) {
    return {
      color: 'var(--accent-orange)',
      bg: 'rgba(249, 115, 22, 0.14)',
      border: 'rgba(249, 115, 22, 0.40)',
    };
  } else if (pct < 60) {
    return {
      color: 'var(--accent-gold)',
      bg: 'rgba(245, 158, 11, 0.14)',
      border: 'rgba(245, 158, 11, 0.40)',
    };
  } else if (pct < 85) {
    return {
      color: 'var(--blue-neon)',
      bg: 'rgba(2, 179, 255, 0.16)',
      border: 'rgba(2, 179, 255, 0.40)',
    };
  } else {
    return {
      color: 'var(--electric)',
      bg: 'var(--electric-glow)',
      border: 'var(--electric)',
    };
  }
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

    return days.map((day) => {
      const dateStr        = toDateString(day);
      const completedCount = habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;
      const total          = habits.length;
      const percentage     = calculateDailyCompletion(completedCount, total);
      return {
        day:          day.getDate(),
        percentage,
        completed:    completedCount,
        notCompleted: total - completedCount,
        isToday:      isToday(day),
      };
    });
  }, [mounted, habits, completions, currentMonth]);

  const { maxVal, minVal } = useMemo(() => {
    if (chartData.length === 0) return { maxVal: -1, minVal: -1 };
    const pcts = chartData.map((d) => d.percentage);
    return {
      maxVal: Math.max(...pcts),
      minVal: Math.min(...pcts),
    };
  }, [chartData]);

  if (!mounted) return <div className="h-[200px] rounded-xl skeleton-shimmer" />;

  const textMuted     = getCSSVar('--text-muted', '#64748B');
  const bgElevated    = getCSSVar('--bg-elevated', '#141A29');
  const borderBright  = getCSSVar('--border-bright', 'rgba(0,118,249,0.40)');
  const textPrimary   = getCSSVar('--text-primary', '#F8FAFC');

  if (habits.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Metric Indicators Legend in Ascending Order: Red -> Orange -> Gold -> Azure -> Electric Blue */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono font-semibold pb-1">
        <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>
          {language === 'ru' ? 'Шкала в порядке возрастания:' : language === 'uz' ? 'O‘sish tartibidagi shkala:' : 'Ascending Velocity Scale:'}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ color: 'var(--accent-red)', borderColor: 'rgba(239, 68, 68, 0.45)', background: 'rgba(239, 68, 68, 0.12)' }}
            title="0–29% (Lowest)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] inline-block shadow-sm" />
            0–29%
          </span>
          <span className="opacity-40 text-xs">→</span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ color: 'var(--accent-orange)', borderColor: 'rgba(249, 115, 22, 0.45)', background: 'rgba(249, 115, 22, 0.12)' }}
            title="30–59% (Low)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-orange)] inline-block shadow-sm" />
            30–59%
          </span>
          <span className="opacity-40 text-xs">→</span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ color: 'var(--accent-gold)', borderColor: 'rgba(245, 158, 11, 0.45)', background: 'rgba(245, 158, 11, 0.12)' }}
            title="60–79% (Mid)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)] inline-block shadow-sm" />
            60–79%
          </span>
          <span className="opacity-40 text-xs">→</span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded border"
            style={{ color: 'var(--blue-neon)', borderColor: 'rgba(2, 179, 255, 0.45)', background: 'rgba(2, 179, 255, 0.14)' }}
            title="80–89% (High)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--blue-neon)] inline-block shadow-sm" />
            80–89%
          </span>
          <span className="opacity-40 text-xs">→</span>
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded border font-bold shadow-sm"
            style={{ color: 'var(--electric)', borderColor: 'var(--electric)', background: 'var(--electric-glow)' }}
            title="90–100% (Peak / Highest)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--electric)] inline-block shadow-sm" />
            90–100%
          </span>
        </div>
      </div>

      {/* Scrollable Data Table with sticky row labels */}
      <div className="overflow-x-auto pb-1">
        <table className="w-full text-xs text-center font-mono tabular-nums border-collapse" style={{ minWidth: 'max-content' }}>
          <tbody>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="sticky left-0 z-10 text-left pr-3 py-1 font-bold whitespace-nowrap bg-[var(--bg-card)]" style={{ color: 'var(--electric)' }}>
                %
              </td>
              {chartData.map((d) => {
                const tier = getVelocityTier(d.percentage, minVal, maxVal);
                const isPeak = maxVal > minVal && d.percentage === maxVal;
                const isMin = maxVal > minVal && d.percentage === minVal;

                return (
                  <td
                    key={`pct-${d.day}`}
                    className="px-1 py-1 font-mono transition-colors"
                    style={{
                      color: tier.color,
                      background: tier.bg,
                      fontWeight: isPeak || isMin ? 800 : 600,
                      border: isPeak || isMin ? `1px solid ${tier.border}` : '1px solid transparent',
                      borderRadius: '4px',
                    }}
                    title={`${d.day}: ${d.percentage}%`}
                  >
                    {d.percentage}%
                  </td>
                );
              })}
            </tr>
            <tr className="border-b border-[var(--border-subtle)]">
              <td className="sticky left-0 z-10 text-left pr-3 py-1 font-bold whitespace-nowrap bg-[var(--bg-card)]" style={{ color: 'var(--electric)' }}>
                ✓
              </td>
              {chartData.map((d) => (
                <td key={`done-${d.day}`} className="px-1 py-1 font-semibold" style={{ color: 'var(--electric)' }}>
                  {d.completed}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 z-10 text-left pr-3 py-1 font-bold whitespace-nowrap bg-[var(--bg-card)]" style={{ color: 'var(--accent-red)' }}>
                ✗
              </td>
              {chartData.map((d) => (
                <td key={`miss-${d.day}`} className="px-1 py-1 font-semibold" style={{ color: 'var(--accent-red)' }}>
                  {d.notCompleted}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bar Chart with clean responsive ticks */}
      <div style={{ height: '170px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barSize={isMobile ? 5 : 8} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              width={35}
              unit="%"
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
              formatter={(value: any) => [`${value}%`, tr.tracker.completed]}
              labelFormatter={(label) => `${tr.tracker.todayDate}: ${label} ${tr.months[currentMonth.getMonth()]}`}
            />
            <Bar dataKey="percentage" minPointSize={6} radius={[3, 3, 0, 0]} animationDuration={500}>
              {chartData.map((entry, i) => {
                const tier = getVelocityTier(entry.percentage, minVal, maxVal);
                return (
                  <Cell
                    key={`cell-${i}`}
                    fill={tier.color}
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
