import { create } from 'zustand';
import type { Habit, HabitCompletion, MonthlyGoal } from '@/lib/types';
import * as storage from '@/lib/storage';
import { toDateString } from '@/lib/utils/dates';

interface HabitsState {
  habits: Habit[];
  completions: HabitCompletion[];
  allCompletions: HabitCompletion[];
  monthlyGoal: MonthlyGoal | null;
  currentMonth: Date;
  isLoading: boolean;

  // Actions
  loadHabits: () => void;
  loadCompletions: (year: number, month: number) => void;
  loadMonthlyGoal: (year: number, month: number) => void;
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

  loadHabits: () => {
    const habits = storage.getHabits();
    set({ habits, isLoading: false });
  },

  loadCompletions: (year: number, month: number) => {
    const completions = storage.getCompletions(year, month);
    const allCompletions = storage.getAllCompletions();
    set({ completions, allCompletions });
  },

  loadMonthlyGoal: (year: number, month: number) => {
    const goal = storage.getMonthlyGoal(year, month);
    set({ monthlyGoal: goal });
  },

  addHabit: (data) => {
    const habit = storage.createHabit(data);
    set((state) => ({ habits: [...state.habits, habit] }));
    return habit;
  },

  updateHabit: (id, data) => {
    storage.updateHabit(id, data);
    set((state) => ({
      habits: state.habits.map((h) => (h.id === id ? { ...h, ...data } : h)),
    }));
  },

  deleteHabit: (id) => {
    storage.deleteHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
      completions: state.completions.filter((c) => c.habit_id !== id),
    }));
  },

  archiveHabit: (id) => {
    storage.archiveHabit(id);
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
  },

  reorderHabits: (orderedIds) => {
    storage.reorderHabits(orderedIds);
    const habits = storage.getHabits();
    set({ habits });
  },

  toggleCompletion: (habitId, dateStr) => {
    const isNowCompleted = storage.toggleCompletion(habitId, dateStr);
    const { currentMonth } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const completions = storage.getCompletions(year, month);
    const allCompletions = storage.getAllCompletions();
    set({ completions, allCompletions });
    return isNowCompleted;
  },

  setMonthlyGoalText: (text) => {
    const { currentMonth } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const goal = storage.upsertMonthlyGoal(year, month, { goal_text: text });
    set({ monthlyGoal: goal });
  },

  setHabitTarget: (habitId, target) => {
    const { currentMonth, monthlyGoal } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1;
    const targets = { ...(monthlyGoal?.habit_targets || {}), [habitId]: target };
    const goal = storage.upsertMonthlyGoal(year, month, { habit_targets: targets });
    set({ monthlyGoal: goal });
  },

  setCurrentMonth: (date) => {
    set({ currentMonth: date });
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const completions = storage.getCompletions(year, month);
    const goal = storage.getMonthlyGoal(year, month);
    set({ completions, monthlyGoal: goal });
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
