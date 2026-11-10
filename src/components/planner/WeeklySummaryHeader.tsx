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

const ELECTRIC_RING_COLORS = [
  '#00D4FF', '#1E90FF', '#7B2FFF', '#00FF88', '#00BFFF', '#FFD700', '#FF6B00',
];

export default function WeeklySummaryHeader() {
  const weekDays        = usePlannerStore((s) => s.weekDays);
  const tasksByDate     = usePlannerStore((s) => s.tasksByDate);
  const setCurrentWeek  = usePlannerStore((s) => s.setCurrentWeek);
  const habits          = useHabitsStore((s) => s.habits);
  const completions     = useHabitsStore((s) => s.completions);
  const toggleCompletion= useHabitsStore((s) => s.toggleCompletion);

  const language        = useLanguageStore((s) => s.language);
  const tr              = t(language);

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
    <div
      className="rounded-2xl p-5 mb-4"
      style={{
        background: 'linear-gradient(135deg, #0B1320 0%, #111D30 100%)',
        border: '1px solid rgba(0,212,255,0.18)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Title + Date selector */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">⚡</span>
            <h1
              className="font-display text-2xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #FFFFFF 0%, #00D4FF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {tr.planner.title}
            </h1>
          </div>
          <label className="text-xs mt-2 flex items-center gap-2 cursor-pointer w-fit" style={{ color: '#7BA7CC' }}>
            <span>{tr.planner.weekStart}:</span>
            <span
              className="font-mono font-bold px-2.5 py-1 rounded-lg transition-all"
              style={{
                background: 'rgba(0,212,255,0.1)',
                color: '#00D4FF',
                border: '1px solid rgba(0,212,255,0.3)',
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
        </div>

        {/* Center: Overall Progress */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-center" style={{ color: '#00D4FF' }}>
            {tr.planner.overallProgress}
          </h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-[110px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.06)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 9, fill: '#7BA7CC', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 9, fill: '#7BA7CC', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    width={22}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid rgba(0,212,255,0.3)',
                      borderRadius: 8,
                      fontSize: 11,
                      color: '#E8F4FF',
                    }}
                    formatter={(value: any) => [value, tr.planner.completed]}
                  />
                  <Bar
                    dataKey="tasks"
                    fill="#00D4FF"
                    radius={[3, 3, 0, 0]}
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col items-center">
              <DonutRing
                segments={donutSegments}
                size={76}
                strokeWidth={7}
              />
              <span className="text-[10px] font-mono font-semibold mt-1 text-center" style={{ color: '#00FF88' }}>
                {weeklyStats.totalCompleted} / {weeklyStats.totalTasks} {tr.planner.completed}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Habit Tracker for Week */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-center" style={{ color: '#00FF88' }}>
            {tr.planner.habitTracker}
          </h3>
          {habits.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: '#7BA7CC' }}>
              {tr.tracker.noHabits}
            </p>
          ) : (
            <div className="overflow-x-auto max-h-[120px] overflow-y-auto">
              <table className="w-full text-[10px]">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                    <th className="text-left py-1 pr-1 font-semibold" style={{ color: '#7BA7CC' }}>
                      {tr.tracker.habit}
                    </th>
                    {tr.tracker.weekdays.map((d) => (
                      <th key={d} className="text-center py-1 px-0.5 font-semibold w-5" style={{ color: '#7BA7CC' }}>
                        {d}
                      </th>
                    ))}
                    <th className="text-center py-1 pl-1 font-semibold w-14" style={{ color: '#7BA7CC' }}>
                      {tr.tracker.progress}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {habitWeekData.map(({ habit, weekCompletions, progress }) => (
                    <tr key={habit.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td className="py-1 pr-1 truncate max-w-[80px]" style={{ color: '#E8F4FF' }}>
                        <span className="mr-1">{habit.icon}</span>
                        {habit.name}
                      </td>
                      {weekCompletions.map((checked, di) => (
                        <td key={di} className="text-center py-1 px-0.5">
                          <Checkbox
                            checked={checked}
                            onChange={() => toggleCompletion(habit.id, toDateString(weekDays[di]))}
                            size="sm"
                            ariaLabel={`${habit.name} — ${tr.tracker.weekdays[di]}`}
                          />
                        </td>
                      ))}
                      <td className="py-1 pl-1">
                        <ProgressBar value={progress} height={4} color="electric" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
