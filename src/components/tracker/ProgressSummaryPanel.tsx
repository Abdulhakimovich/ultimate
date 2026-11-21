'use client';

import { useMemo } from 'react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString, startOfMonth, endOfMonth } from '@/lib/utils/dates';
import { calculateHabitProgress, calculateAverageProgress, countCompletionsInRange } from '@/lib/utils/calculations';
import ProgressBar from '@/components/ui/ProgressBar';

export default function ProgressSummaryPanel() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal = useHabitsStore((s) => s.monthlyGoal);
  const setHabitTarget = useHabitsStore((s) => s.setHabitTarget);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

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
      <h3 className="text-xs font-semibold text-text-secondary text-center mb-1">
        {tr.tracker.monthProgress}
      </h3>
      <p className="text-xs text-text-muted text-center mb-3">{tr.tracker.habits}</p>

      {/* Column headers */}
      <div className="grid grid-cols-3 gap-1 text-xs font-medium text-text-muted mb-2 text-center">
        <span>{tr.tracker.fact}</span>
        <span>{tr.tracker.goal}</span>
        <span>{tr.tracker.progress}</span>
      </div>

      {/* Per-habit rows */}
      <div className="space-y-2">
        {progressData.map(({ habit, completed, target, progress }) => (
          <div key={habit.id} className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <span>{habit.icon}</span>
              <span className="truncate text-text-primary flex-1">{habit.name}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 items-center text-center">
              <span className="text-xs text-text-primary font-medium">{completed}</span>
              <input
                type="number"
                value={target}
                onChange={(e) => setHabitTarget(habit.id, parseInt(e.target.value) || 0)}
                className="w-full text-xs text-center bg-bg-primary border border-bg-card-alt rounded px-1 py-0.5 text-text-primary outline-none focus:border-accent-blue"
                min={1}
                max={31}
                aria-label={`${tr.tracker.goal}: ${habit.name}`}
              />
              <span className="text-xs text-text-secondary">{progress}%</span>
            </div>
            <ProgressBar value={progress} height={4} />
          </div>
        ))}
      </div>

      {/* Average footer */}
      {habits.length > 0 && (
        <div className="mt-3 pt-2 border-t border-bg-card-alt">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary font-medium">{tr.tracker.avgCompletion}:</span>
            <span className="text-text-primary font-semibold">{averageProgress}%</span>
          </div>
          <ProgressBar value={averageProgress} height={5} className="mt-1" />
        </div>
      )}
    </div>
  );
}
