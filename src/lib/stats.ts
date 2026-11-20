import type { HabitCompletion } from './types';
import { toDateString } from './utils/dates';

export interface HabitStats {
  activeHabits: number;
  totalCompletions: number;
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
}

/**
 * Pure streak calculation:
 * - A day counts if at least one habit was completed on that day.
 * - Current streak ends today (or yesterday if today has no check yet).
 * - Best streak is the longest consecutive run of days across all completions.
 */
export function computeStreaks(completions: HabitCompletion[]): { currentStreak: number; bestStreak: number } {
  if (completions.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completedDays = new Set<string>();
  for (const c of completions) {
    completedDays.add(c.completed_date);
  }

  const today = new Date();
  const todayStr = toDateString(today);

  // Check current streak
  let currentStreak = 0;
  const checkDate = new Date(today);
  const doneToday = completedDays.has(todayStr);
  if (!doneToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Count backwards day by day
  while (true) {
    const dStr = toDateString(checkDate);
    if (completedDays.has(dStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate best streak: sort unique dates ascending and find longest consecutive run
  const sortedDates = Array.from(completedDays).sort();
  let bestStreak = 0;
  let run = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const parts = dateStr.split('-').map(Number);
    const currD = new Date(parts[0], parts[1] - 1, parts[2]);

    if (!prevDate) {
      run = 1;
    } else {
      const diffMs = currD.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        run++;
      } else if (diffDays > 1) {
        run = 1;
      }
    }
    if (run > bestStreak) {
      bestStreak = run;
    }
    prevDate = currD;
  }

  return {
    currentStreak,
    bestStreak: Math.max(currentStreak, bestStreak),
  };
}

/**
 * Calculates this month's completion rate across active habits:
 * (completions in current month / (habitCount * daysInCurrentMonth)) * 100
 */
export function computeThisMonthRate(completions: HabitCompletion[], activeHabitCount: number): number {
  if (activeHabitCount <= 0) return 0;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const daysInMonth = new Date(year, month, 0).getDate();
  const totalPossible = activeHabitCount * daysInMonth;

  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  const monthCompletions = completions.filter((c) => c.completed_date.startsWith(monthPrefix)).length;

  return totalPossible > 0 ? Math.round((monthCompletions / totalPossible) * 100) : 0;
}
