import { create } from 'zustand';
import type { Task, DailyEntry } from '@/lib/types';
import * as dataTasks from '@/lib/data/tasks';
import * as dataEntries from '@/lib/data/entries';
import { toDateString, getWeekDays, addWeeks, subWeeks } from '@/lib/utils/dates';
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
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
}

interface PlannerState {
  currentWeekStart: Date;
  weekDays: Date[];
  tasksByDate: Record<string, Task[]>;
  entriesByDate: Record<string, DailyEntry>;
  isLoading: boolean;

  // Actions
  loadWeekData: () => Promise<void>;
  setCurrentWeek: (date: Date) => void;
  navigateWeek: (direction: 'prev' | 'next') => void;
  addTask: (dateStr: string, text: string) => Task;
  updateTask: (id: string, data: Partial<Task>) => void;
  deleteTask: (id: string, dateStr: string) => void;
  toggleTask: (id: string, dateStr: string) => void;
  reorderTasks: (dateStr: string, orderedIds: string[]) => void;
  updateEntry: (
    dateStr: string,
    field: keyof Pick<DailyEntry, 'notes' | 'improvements' | 'gratitude'>,
    values: string[]
  ) => void;
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

  loadWeekData: async () => {
    try {
      set({ isLoading: true });
      const { currentWeekStart } = get();
      const days = getWeekDays(currentWeekStart);
      const startStr = toDateString(days[0]);
      const endStr = toDateString(days[6]);

      const tasksPromise = dataTasks.getTasksForDateRange(startStr, endStr);
      const entriesPromises = days.map((d) => dataEntries.getDailyEntry(toDateString(d)));

      const [tasks, ...entries] = await Promise.all([tasksPromise, ...entriesPromises]);

      const tasksByDate: Record<string, Task[]> = {};
      const entriesByDate: Record<string, DailyEntry> = {};

      for (let i = 0; i < days.length; i++) {
        const dateStr = toDateString(days[i]);
        tasksByDate[dateStr] = tasks
          .filter((t) => t.day_date === dateStr)
          .sort((a, b) => a.sort_order - b.sort_order);

        const entry = entries[i];
        if (entry) {
          entriesByDate[dateStr] = entry;
        }
      }

      set({ weekDays: days, tasksByDate, entriesByDate, isLoading: false });
    } catch (err) {
      handleError(err, 'Failed to load planner data');
      set({ isLoading: false });
    }
  },

  setCurrentWeek: (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(date.getFullYear(), date.getMonth(), diff);
    set({ currentWeekStart: weekStart });
    get().loadWeekData();
  },

  navigateWeek: (direction) => {
    const { currentWeekStart } = get();
    const newStart =
      direction === 'prev'
        ? subWeeks(currentWeekStart, 1)
        : addWeeks(currentWeekStart, 1);
    set({ currentWeekStart: newStart });
    get().loadWeekData();
  },

  addTask: (dateStr, text) => {
    const currentTasks = get().tasksByDate[dateStr] || [];
    const maxOrder = currentTasks.reduce((max, t) => Math.max(max, t.sort_order), -1);

    const task: Task = {
      id: crypto.randomUUID(),
      user_id: '',
      day_date: dateStr,
      text,
      completed: false,
      sort_order: maxOrder + 1,
      created_at: new Date().toISOString(),
    };

    const previousTasks = currentTasks;
    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: [...previousTasks, task],
      },
    }));

    dataTasks.createTask(task).catch((err) => {
      handleError(err, 'Failed to save task');
      set((state) => ({
        tasksByDate: {
          ...state.tasksByDate,
          [dateStr]: previousTasks,
        },
      }));
    });

    return task;
  },

  updateTask: (id, data) => {
    const previousState = get().tasksByDate;
    set((state) => {
      const newTasksByDate = { ...state.tasksByDate };
      for (const dateStr in newTasksByDate) {
        newTasksByDate[dateStr] = newTasksByDate[dateStr].map((t) =>
          t.id === id ? { ...t, ...data } : t
        );
      }
      return { tasksByDate: newTasksByDate };
    });

    dataTasks.updateTask(id, data).catch((err) => {
      handleError(err, 'Failed to update task');
      set({ tasksByDate: previousState });
    });
  },

  deleteTask: (id, dateStr) => {
    const previousTasks = get().tasksByDate[dateStr] || [];
    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: (state.tasksByDate[dateStr] || []).filter((t) => t.id !== id),
      },
    }));

    dataTasks.deleteTask(id).catch((err) => {
      handleError(err, 'Failed to delete task');
      set((state) => ({
        tasksByDate: {
          ...state.tasksByDate,
          [dateStr]: previousTasks,
        },
      }));
    });
  },

  toggleTask: (id, dateStr) => {
    const tasks = get().tasksByDate[dateStr] || [];
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    const previousTasks = tasks;

    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: (state.tasksByDate[dateStr] || []).map((t) =>
          t.id === id ? { ...t, completed: newCompleted } : t
        ),
      },
    }));

    dataTasks.updateTask(id, { completed: newCompleted }).catch((err) => {
      handleError(err, 'Failed to update task');
      set((state) => ({
        tasksByDate: {
          ...state.tasksByDate,
          [dateStr]: previousTasks,
        },
      }));
    });
  },

  reorderTasks: (dateStr, orderedIds) => {
    const currentTasks = get().tasksByDate[dateStr] || [];
    const reordered = orderedIds
      .map((id) => currentTasks.find((t) => t.id === id))
      .filter(Boolean) as Task[];

    set((state) => ({
      tasksByDate: {
        ...state.tasksByDate,
        [dateStr]: reordered,
      },
    }));

    dataTasks.reorderTasks(dateStr, orderedIds).catch((err) => {
      handleError(err, 'Failed to reorder tasks');
      set((state) => ({
        tasksByDate: {
          ...state.tasksByDate,
          [dateStr]: currentTasks,
        },
      }));
    });
  },

  updateEntry: (dateStr, field, values) => {
    const previousEntry = get().entriesByDate[dateStr] || {
      id: crypto.randomUUID(),
      user_id: '',
      day_date: dateStr,
      notes: ['', '', '', ''],
      improvements: ['', '', '', ''],
      gratitude: ['', '', '', ''],
    };

    const newEntry: DailyEntry = {
      ...previousEntry,
      [field]: values,
    };

    set((state) => ({
      entriesByDate: {
        ...state.entriesByDate,
        [dateStr]: newEntry,
      },
    }));

    dataEntries.upsertDailyEntry(dateStr, { [field]: values }).catch((err) => {
      handleError(err, 'Failed to save daily entry');
      set((state) => ({
        entriesByDate: {
          ...state.entriesByDate,
          [dateStr]: previousEntry,
        },
      }));
    });
  },
}));
