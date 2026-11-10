import { create } from 'zustand';
import type { Task, DailyEntry } from '@/lib/types';
import * as storage from '@/lib/storage';
import { toDateString, getWeekDays, addWeeks, subWeeks } from '@/lib/utils/dates';

interface PlannerState {
  currentWeekStart: Date;
  weekDays: Date[];
  tasksByDate: Record<string, Task[]>;
  entriesByDate: Record<string, DailyEntry>;
  isLoading: boolean;

  // Actions
  loadWeekData: () => void;
  setCurrentWeek: (date: Date) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  addTask: (dateStr: string, text: string) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string, dateStr: string) => void;
  toggleTask: (id: string, dateStr: string) => void;
  reorderTasks: (dateStr: string, orderedIds: string[]) => void;
  updateEntry: (dateStr: string, field: keyof Pick<DailyEntry, 'notes' | 'improvements' | 'gratitude'>, values: string[]) => void;
}

export const usePlannerStore = create<PlannerState>((set, get) => ({
  currentWeekStart: (() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.getFullYear(), now.getMonth(), diff);
  })(),
  weekDays: [],
  tasksByDate: {},
  entriesByDate: {},
  isLoading: true,

  loadWeekData: () => {
    const { currentWeekStart } = get();
    const days = getWeekDays(currentWeekStart);
    const startStr = toDateString(days[0]);
    const endStr = toDateString(days[6]);

    const tasks = storage.getTasksForDateRange(startStr, endStr);
    const tasksByDate: Record<string, Task[]> = {};
    const entriesByDate: Record<string, DailyEntry> = {};

    for (const day of days) {
      const dateStr = toDateString(day);
      tasksByDate[dateStr] = tasks
        .filter((t) => t.day_date === dateStr)
        .sort((a, b) => a.sort_order - b.sort_order);
      const entry = storage.getDailyEntry(dateStr);
      if (entry) {
        entriesByDate[dateStr] = entry;
      }
    }

    set({ weekDays: days, tasksByDate, entriesByDate, isLoading: false });
  },

  setCurrentWeek: (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.getFullYear(), date.getMonth(), diff);
    set({ currentWeekStart: weekStart });
    // Reload data after setting
    setTimeout(() => get().loadWeekData(), 0);
  },

  navigateWeek: (direction) => {
    const { currentWeekStart } = get();
    const newStart =
      direction === 'prev'
        ? subWeeks(currentWeekStart, 1)
        : addWeeks(currentWeekStart, 1);
    set({ currentWeekStart: newStart });
    setTimeout(() => get().loadWeekData(), 0);
  },

  addTask: (dateStr, text) => {
    const task = storage.createTask(dateStr, text);
    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: [...(state.tasksByDate[dateStr] || []), task],
      },
    }));
    return task;
  },

  updateTask: (id, data) => {
    storage.updateTask(id, data);
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const dateStr in newTasksByDate) {
        newTasksByDate[dateStr] = newTasksByDate[dateStr].map((t) =>
          t.id === id ? { ...t, ...data } : t
        );
      }
      return { tasksByDate: newTasksByDate };
    });
  },

  deleteTask: (id, dateStr) => {
    storage.deleteTask(id);
    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: (state.tasksByDate[dateStr] || []).filter((t) => t.id !== id),
      },
    }));
  },

  toggleTask: (id, dateStr) => {
    const tasks = get().tasksByDate[dateStr] || [];
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    storage.updateTask(id, { completed: newCompleted });
    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: (state.tasksByDate[dateStr] || []).map((t) =>
          t.id === id ? { ...t, completed: newCompleted } : t
        ),
      },
    }));
  },

  reorderTasks: (dateStr, orderedIds) => {
    storage.reorderTasks(dateStr, orderedIds);
    set((state) => {
      const tasks = state.tasksByDate[dateStr] || [];
      const reordered = orderedIds
        .map((id) => tasks.find((t) => t.id === id))
        .filter(Boolean) as Task[];
      return {
        tasksByDate: {
          ...state.tasksByDate,
          [dateStr]: reordered,
        },
      };
    });
  },

  updateEntry: (dateStr, field, values) => {
    const entry = storage.upsertDailyEntry(dateStr, { [field]: values });
    set((state) => ({
      entriesByDate: {
        ...state.entriesByDate,
        [dateStr]: entry,
      },
    }));
  },
}));
