import type { HabitCompletion, Task } from '../types';

/**
 * Calculate habit completion percentage for a given period
 */
export function calculateHabitProgress(
  completions: number,
  target: number
): number {
  if (target <= 0) return 0;
  return Math.min(Math.round((completions / target) * 100), 100);
}

/**
 * Calculate daily completion percentage
 * (how many habits were completed out of total habits)
 */
export function calculateDailyCompletion(
  completedCount: number,
  totalHabits: number
): number {
  if (totalHabits <= 0) return 0;
  return Math.round((completedCount / totalHabits) * 100);
}

/**
 * Calculate average progress across all habits
 */
export function calculateAverageProgress(
  progressValues: number[]
): number {
  if (progressValues.length === 0) return 0;
  const sum = progressValues.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / progressValues.length);
}

/**
 * Count completions for a specific habit in a date range
 */
export function countCompletionsInRange(
  completions: HabitCompletion[],
  habitId: string,
  startDate: string,
  endDate: string
): number {
  return completions.filter(
    (c) =>
      c.habit_id === habitId &&
      c.completed_date >= startDate &&
      c.completed_date <= endDate
  ).length;
}

/**
 * Check if a habit was completed on a specific date
 */
export function isHabitCompletedOnDate(
  completions: HabitCompletion[],
  habitId: string,
  dateStr: string
): boolean {
  return completions.some(
    (c) => c.habit_id === habitId && c.completed_date === dateStr
  );
}

/**
 * Calculate task completion stats for a day
 */
export function calculateTaskStats(tasks: Task[]): {
  total: number;
  completed: number;
  remaining: number;
  percentage: number;
} {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, remaining, percentage };
}

/**
 * Calculate weekly overall progress from daily task stats
 */
export function calculateWeeklyProgress(
  dailyStats: { completed: number; total: number }[]
): { totalCompleted: number; totalTasks: number; percentage: number } {
  const totalCompleted = dailyStats.reduce((s, d) => s + d.completed, 0);
  const totalTasks = dailyStats.reduce((s, d) => s + d.total, 0);
  const percentage =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;
  return { totalCompleted, totalTasks, percentage };
}
