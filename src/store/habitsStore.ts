import { create } from 'zustand';
import type { Habit, HabitCompletion, MonthlyGoal } from '@/lib/types';
import * as dataHabits from '@/lib/data/habits';
import * as dataCompletions from '@/lib/data/completions';
import * as dataGoals from '@/lib/data/goals';
import { useToastStore } from '@/stores/toastStore';

function handleError(error: unknown, fallbackMessage: string) {
  const message = error instanceof Error ? error.message : fallbackMessage;
  useToastStore.getState().addToast({ message, variant: 'error' });
  const isAuthError =
    message.includes('JWT') ||
    message.includes('expired') ||
    message.includes('Unauthorized') ||
    message.includes('session');
  if (isAuthError && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  allCompletions: HabitCompletion[];
  monthlyGoal: MonthlyGoal | null;
  currentMonth: Date;
  isLoading: boolean;

  // Actions
  loadHabits: () => Promise<void>;
  loadCompletions: (year: number, month: number) => Promise<void>;
  loadMonthlyGoal: (year: number, month: number) => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'archived'>) => Habit;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string) => void;
  reorderHabits: (orderedIds: string[]) => void;
  toggleCompletion: (habitId: string, dateStr: string) => boolean;
  setMonthlyGoalText: (text: string) => void;
  setHabitTarget: (habitId: string, target: number) => void;
  setCurrentMonth: (date: Date) => void;
  navigateMonth: (direction: 'prev' | 'next') => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  completions: [],
  allCompletions: [],
  monthlyGoal: null,
  currentMonth: new Date(),
  isLoading: true,

  loadHabits: async () => {
    try {
      set({ isLoading: true });
      const habits = await dataHabits.getHabits();
      set({ habits, isLoading: false });
    } catch (err) {
      handleError(err, 'Failed to load habits');
      set({ isLoading: false });
    }
  },

  loadCompletions: async (year: number, month: number) => {
    try {
      const [completions, allCompletions] = await Promise.all([
        dataCompletions.getCompletions(year, month),
        dataCompletions.getAllCompletions(),
      ]);
      set({ completions, allCompletions });
    } catch (err) {
      handleError(err, 'Failed to load completions');
    }
  },

  loadMonthlyGoal: async (year: number, month: number) => {
    try {
      const goal = await dataGoals.getMonthlyGoal(year, month);
      set({ monthlyGoal: goal });
    } catch (err) {
      handleError(err, 'Failed to load monthly goal');
    }
  },

  addHabit: (data) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      user_id: '',
      created_at: new Date().toISOString(),
      archived: false,
      sort_order: get().habits.length,
      ...data,
    };
    const previousHabits = get().habits;
    set({ habits: [...previousHabits, habit] });

    dataHabits.createHabit(habit).catch((err) => {
      handleError(err, 'Failed to save habit');
      set({ habits: previousHabits });
    });

    return habit;
  },

  updateHabit: (id, data) => {
    const previousHabits = get().habits;
    set({
      habits: previousHabits.map((h) => (h.id === id ? { ...h, ...data } : h)),
    });

    dataHabits.updateHabit(id, data).catch((err) => {
      handleError(err, 'Failed to update habit');
      set({ habits: previousHabits });
    });
  },

  deleteHabit: (id) => {
    const previousHabits = get().habits;
    const previousCompletions = get().completions;
    const previousAllCompletions = get().allCompletions;

    set({
      habits: previousHabits.filter((h) => h.id !== id),
      completions: previousCompletions.filter((c) => c.habit_id !== id),
      allCompletions: previousAllCompletions.filter((c) => c.habit_id !== id),
    });

    dataHabits.deleteHabit(id).catch((err) => {
      handleError(err, 'Failed to delete habit');
      set({
        habits: previousHabits,
        completions: previousCompletions,
        allCompletions: previousAllCompletions,
      });
    });
  },

  archiveHabit: (id) => {
    const previousHabits = get().habits;
    set({
      habits: previousHabits.filter((h) => h.id !== id),
    });

    dataHabits.archiveHabit(id).catch((err) => {
      handleError(err, 'Failed to archive habit');
      set({ habits: previousHabits });
    });
  },

  reorderHabits: (orderedIds) => {
    const previousHabits = get().habits;
    const reordered: Habit[] = [];
    for (const id of orderedIds) {
      const h = previousHabits.find((h) => h.id === id);
      if (h) reordered.push(h);
    }
    for (const h of previousHabits) {
      if (!orderedIds.includes(h.id)) reordered.push(h);
    }
    set({ habits: reordered });

    dataHabits.reorderHabits(orderedIds).catch((err) => {
      handleError(err, 'Failed to reorder habits');
      set({ habits: previousHabits });
    });
  },

  toggleCompletion: (habitId, dateStr) => {
    const previousCompletions = get().completions;
    const previousAllCompletions = get().allCompletions;
    const existingIndex = previousCompletions.findIndex(
      (c) => c.habit_id === habitId && c.completed_date === dateStr
    );
    const isNowCompleted = existingIndex < 0;

    let nextCompletions: HabitCompletion[];
    let nextAllCompletions: HabitCompletion[];

    if (isNowCompleted) {
      const newCompletion: HabitCompletion = {
        id: crypto.randomUUID(),
        user_id: '',
        habit_id: habitId,
        completed_date: dateStr,
      };
      nextCompletions = [...previousCompletions, newCompletion];
      nextAllCompletions = [...previousAllCompletions, newCompletion];

      dataCompletions.insertCompletion(newCompletion).catch((err) => {
        handleError(err, 'Failed to record completion');
        set({ completions: previousCompletions, allCompletions: previousAllCompletions });
      });
    } else {
      nextCompletions = previousCompletions.filter(
        (c) => !(c.habit_id === habitId && c.completed_date === dateStr)
      );
      nextAllCompletions = previousAllCompletions.filter(
        (c) => !(c.habit_id === habitId && c.completed_date === dateStr)
      );

      dataCompletions.deleteCompletion(habitId, dateStr).catch((err) => {
        handleError(err, 'Failed to remove completion');
        set({ completions: previousCompletions, allCompletions: previousAllCompletions });
      });
    }

    set({ completions: nextCompletions, allCompletions: nextAllCompletions });
    return isNowCompleted;
  },

  setMonthlyGoalText: (text) => {
    const { currentMonth, monthlyGoal } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const previousGoal = monthlyGoal;
    const updatedGoal: MonthlyGoal = {
      id: previousGoal?.id || crypto.randomUUID(),
      user_id: previousGoal?.user_id || '',
      year,
      month,
      goal_text: text,
      habit_targets: previousGoal?.habit_targets || {},
    };
    set({ monthlyGoal: updatedGoal });

    dataGoals.upsertMonthlyGoal(year, month, { goal_text: text }).catch((err) => {
      handleError(err, 'Failed to update goal');
      set({ monthlyGoal: previousGoal });
    });
  },

  setHabitTarget: (habitId, target) => {
    const { currentMonth, monthlyGoal } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const previousGoal = monthlyGoal;
    const targets = { ...(previousGoal?.habit_targets || {}), [habitId]: target };
    const updatedGoal: MonthlyGoal = {
      id: previousGoal?.id || crypto.randomUUID(),
      user_id: previousGoal?.user_id || '',
      year,
      month,
      goal_text: previousGoal?.goal_text || '',
      habit_targets: targets,
    };
    set({ monthlyGoal: updatedGoal });

    dataGoals.upsertMonthlyGoal(year, month, { habit_targets: targets }).catch((err) => {
      handleError(err, 'Failed to update target');
      set({ monthlyGoal: previousGoal });
    });
  },

  setCurrentMonth: (date) => {
    set({ currentMonth: date });
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    get().loadCompletions(year, month);
    get().loadMonthlyGoal(year, month);
  },

  navigateMonth: (direction) => {
    const { currentMonth } = get();
    const newMonth =
      direction === 'prev'
        ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    get().setCurrentMonth(newMonth);
  },
}));
