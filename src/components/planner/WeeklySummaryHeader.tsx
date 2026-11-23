'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePlannerStore } from '@/store/plannerStore';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString, formatShortDotDate } from '@/lib/utils/dates';
import { calculateTaskStats, calculateWeeklyProgress, isHabitCompletedOnDate, calculateHabitProgress } from '@/lib/utils/calculations';
import DonutRing from '@/components/ui/DonutRing';
import Checkbox from '@/components/ui/Checkbox';
import ProgressBar from '@/components/ui/ProgressBar';
import HabitIcon from '@/components/ui/HabitIcon';
import { getHabitDisplayName } from '@/lib/utils/habitDisplay';
import { Zap } from 'lucide-react';

const ELECTRIC_RING_COLORS = [
  '#00E5FF', '#0284C7', '#8B5CF6', '#10B981', '#38BDF8', '#F59E0B', '#F97316',
];

export default function WeeklySummaryHeader() {
  const weekDays         = usePlannerStore((s) => s.weekDays);
  const tasksByDate      = usePlannerStore((s) => s.tasksByDate);
  const setCurrentWeek   = usePlannerStore((s) => s.setCurrentWeek);
  const habits           = useHabitsStore((s) => s.habits);
  const completions      = useHabitsStore((s) => s.completions);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);

  const language         = useLanguageStore((s) => s.language);
  const tr               = t(language);

  // Chart data
  const chartData = useMemo(() => {
    return weekDays.map((day, i) => {
      const dateStr = toDateString(day);
      const tasks = tasksByDate[dateStr] || [];
      const stats = calculateTaskStats(tasks);
      return {
        name: tr.tracker.weekdays[i],
        tasks: stats.completed,
        total: stats.total,
      };
    });
  }, [weekDays, tasksByDate, tr.tracker.weekdays]);

  // Weekly progress
  const weeklyStats = useMemo(() => {
    const dailyStats = weekDays.map((day) => {
      const dateStr = toDateString(day);
      const tasks = tasksByDate[dateStr] || [];
      return calculateTaskStats(tasks);
    });
    return calculateWeeklyProgress(dailyStats);
  }, [weekDays, tasksByDate]);

  // Donut segments
  const donutSegments = useMemo(() => {
    return weekDays.map((day, i) => {
      const dateStr = toDateString(day);
      const tasks = tasksByDate[dateStr] || [];
      const stats = calculateTaskStats(tasks);
      return {
        value: weeklyStats.totalTasks > 0
          ? (stats.completed / weeklyStats.totalTasks) * 100
          : 0,
        color: ELECTRIC_RING_COLORS[i],
      };
    });
  }, [weekDays, tasksByDate, weeklyStats.totalTasks]);

  // Habit tracker for week
  const habitWeekData = useMemo(() => {
    return habits.map((habit) => {
      const weekCompletions = weekDays.map((day) => {
        const dateStr = toDateString(day);
        return isHabitCompletedOnDate(completions, habit.id, dateStr);
      });
      const completed = weekCompletions.filter(Boolean).length;
      return {
        habit,
        weekCompletions,
        progress: calculateHabitProgress(completed, 7),
      };
    });
  }, [habits, weekDays, completions]);

  if (weekDays.length === 0) return null;

  return (
    <div className="surface-card p-5 sm:p-6 rounded-2xl mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left: Brand + Date Selector */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="font-display text-sm sm:text-base font-bold tracking-tight" style={{ color: 'var(--text-secondary)' }}>
              {tr.planner.title}
            </h1>
          </div>
          <label className="text-xs mt-2 flex items-center gap-2 cursor-pointer w-fit" style={{ color: 'var(--text-secondary)' }}>
            <span>{tr.planner.weekStart}:</span>
            <span
              className="font-mono font-bold px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: 'var(--electric-glow)',
                color: 'var(--electric)',
                border: '1px solid var(--border-bright)',
              }}
            >
              {weekDays[0] && formatShortDotDate(weekDays[0])}
            </span>
            <input
              type="date"
              className="sr-only"
              value={weekDays[0] ? toDateString(weekDays[0]) : ''}
              onChange={(e) => {
                if (e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  setCurrentWeek(new Date(y, m - 1, d));
                }
              }}
            />
          </label>

          {/* Dynamic Sprint Velocity Indicator */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded-md border-hairline flex items-center gap-1"
              style={{
                background: 'var(--electric-glow)',
                color: 'var(--electric)',
                borderColor: 'var(--electric)',
              }}
            >
              <Zap size={11} />
              <span>
                {weeklyStats.percentage}% {tr.analytics.sprintVelocity}
              </span>
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {weeklyStats.totalCompleted}/{weeklyStats.totalTasks} {tr.planner.completed}
            </span>
          </div>
        </div>

        {/* Center: Overall Progress Chart & Donut */}
        <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2 border-y lg:border-y-0 lg:border-x border-[var(--border)] px-4">
          <div className="w-full sm:w-36 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-bright)',
                    borderRadius: 8,
                    fontSize: 10,
                    color: 'var(--text-primary)',
                  }}
                  formatter={(val: unknown) => [`${val}`, tr.planner.tasks]}
                />
                <Bar dataKey="tasks" fill="var(--electric)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col items-center flex-shrink-0">
            <DonutRing
              segments={donutSegments}
              size={72}
              strokeWidth={7}
            />
            <span className="text-xs font-mono font-bold mt-1 text-center" style={{ color: 'var(--accent-green)' }}>
              {weeklyStats.totalCompleted} / {weeklyStats.totalTasks} {tr.planner.completed}
            </span>
          </div>
        </div>

        {/* Right: Weekly Habit Progress Mini-Matrix */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-center" style={{ color: 'var(--accent-green)' }}>
            {tr.planner.habitTracker}
          </h3>
          {habits.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.noHabits}
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[150px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-1 pr-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      {tr.tracker.habit}
                    </th>
                    {tr.tracker.weekdays.map((d) => (
                      <th key={d} className="text-center py-1 px-1 font-semibold w-6" style={{ color: 'var(--text-secondary)' }}>
                        {d}
                      </th>
                    ))}
                    <th className="text-center py-1 pl-2 font-semibold w-16" style={{ color: 'var(--text-secondary)' }}>
                      {tr.tracker.progress}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habitWeekData.map(({ habit, weekCompletions, progress }) => {
                    const habitName = getHabitDisplayName(habit, language);
                    return (
                      <tr key={habit.id} className="border-b border-[var(--border-subtle)]">
                        <td className="py-1.5 pr-2 truncate max-w-[120px] flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }} title={habitName}>
                          <HabitIcon icon={habit.icon} size={13} className="shrink-0" />
                          <span className="truncate">{habitName}</span>
                        </td>
                        {weekCompletions.map((checked, di) => (
                          <td key={di} className="text-center py-1 px-0.5">
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleCompletion(habit.id, toDateString(weekDays[di]))}
                              size="sm"
                              ariaLabel={`${habitName} — ${tr.tracker.weekdays[di]}`}
                            />
                          </td>
                        ))}
                        <td className="py-1 pl-2">
                          <ProgressBar value={progress} height={4} color="electric" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
