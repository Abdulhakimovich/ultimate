'use client';

import { useMemo } from 'react';
import { useHabitsStore } from '@/store/habitsStore';
import { toDateString, startOfMonth, endOfMonth } from '@/lib/utils/dates';
import { calculateHabitProgress, calculateAverageProgress, countCompletionsInRange } from '@/lib/utils/calculations';
import ProgressBar from '@/components/ui/ProgressBar';

export default function ProgressSummaryPanel() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal = useHabitsStore((s) => s.monthlyGoal);
  const setHabitTarget = useHabitsStore((s) => s.setHabitTarget);

  const startStr = toDateString(startOfMonth(currentMonth));
  const endStr = toDateString(endOfMonth(currentMonth));

  const progressData = useMemo(() => {
    return habits.map((habit) => {
      const completed = countCompletionsInRange(completions, habit.id, startStr, endStr);
      const target = monthlyGoal?.habit_targets?.[habit.id] ?? 20;
      const progress = calculateHabitProgress(completed, target);
      return { habit, completed, target, progress };
    });
  }, [habits, completions, startStr, endStr, monthlyGoal]);

  const averageProgress = useMemo(
    () => calculateAverageProgress(progressData.map((d) => d.progress)),
    [progressData],
  );

  return (
    <div className="w-[180px] shrink-0 bg-bg-card rounded-lg p-3 shadow-sm">
      <h3 className="text-[10px] font-semibold text-text-secondary text-center mb-1">
        Прогресс за месяц
      </h3>
      <p className="text-[9px] text-text-muted text-center mb-3">по привычкам</p>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-1 text-[9px] font-medium text-text-muted mb-2 text-center">
        <span>Всего</span>
        <span>Цель</span>
        <span>Прогресс</span>
      </div>

      {/* Per-habit rows */}
      <div className="space-y-2">
        {progressData.map(({ habit, completed, target, progress }) => (
          <div key={habit.id} className="space-y-0.5">
            <div className="flex items-center gap-1 text-[10px]">
              <span>{habit.icon}</span>
              <span className="truncate text-text-primary flex-1">{habit.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 items-center text-center">
              <span className="text-[10px] text-text-primary font-medium">{completed}</span>
              <input
                type="number"
                value={target}
                onChange={(e) => setHabitTarget(habit.id, parseInt(e.target.value) || 0)}
                className="w-full text-[10px] text-center bg-bg-primary border border-bg-card-alt rounded px-1 py-0.5 text-text-primary outline-none focus:border-accent-blue"
                min={1}
                max={31}
                aria-label={`Цель для ${habit.name}`}
              />
              <span className="text-[10px] text-text-secondary">{progress}%</span>
            </div>
            <ProgressBar value={progress} height={4} />
          </div>
        ))}
      </div>

      {/* Average footer */}
      {habits.length > 0 && (
        <div className="mt-3 pt-2 border-t border-bg-card-alt">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-text-secondary font-medium">Среднее:</span>
            <span className="text-text-primary font-semibold">{averageProgress}%</span>
          </div>
          <ProgressBar value={averageProgress} height={5} className="mt-1" />
        </div>
      )}
    </div>
  );
}
