import type { Habit, HabitCompletion, MonthlyGoal, Task, DailyEntry } from './types';

// Generate a UUID-like ID
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEYS = {
  habits: 'ht_habits',
  completions: 'ht_completions',
  goals: 'ht_monthly_goals',
  tasks: 'ht_tasks',
  entries: 'ht_daily_entries',
  mental: 'ht_mental_ratings',
  seeded: 'ht_is_seeded_ultimate_v2',
} as const;

function getItem<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  ensureSeedData();
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Seed initial realistic data so the app looks vibrant and useful immediately
function ensureSeedData(): void {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem(STORAGE_KEYS.seeded)) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const defaultHabits: Habit[] = [
    {
      id: 'h-1',
      user_id: 'local',
      name: 'Ранний подъем',
      icon: '🌅',
      color: '#00D4FF',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-2',
      user_id: 'local',
      name: 'Выпить стакан воды',
      icon: '🥛',
      color: '#00BFFF',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-3',
      user_id: 'local',
      name: 'Контрастный душ',
      icon: '🚿',
      color: '#1E90FF',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-4',
      user_id: 'local',
      name: 'Английский язык',
      icon: '🇬🇧',
      color: '#7B2FFF',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-5',
      user_id: 'local',
      name: 'Фитнес / пробежка',
      icon: '🏃',
      color: '#00FF88',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-6',
      user_id: 'local',
      name: 'Чтение',
      icon: '📚',
      color: '#FFD700',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-7',
      user_id: 'local',
      name: 'Планирование дня',
      icon: '📋',
      color: '#00D4FF',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-8',
      user_id: 'local',
      name: 'Созвон / работа',
      icon: '💻',
      color: '#FF6B00',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
    {
      id: 'h-9',
      user_id: 'local',
      name: 'Медитация / практики',
      icon: '🧘',
      color: '#9B7EC8',
      created_at: new Date(year, month - 1, 1).toISOString(),
      archived: false,
    },
  ];

  const defaultCompletions: HabitCompletion[] = [];
  const currentDay = now.getDate();

  // Populate completions matching the photograph (days 1 to ~21 active)
  for (let d = 1; d <= Math.min(currentDay, 28); d++) {
    const dayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    defaultHabits.forEach((h, hIdx) => {
      // In the photo, the first 7 days are 100% completed, then days 8-21 around 70-80%
      const prob = d <= 7 ? 1.0 : ((hIdx + d) % 4 !== 0 ? 0.8 : 0.4);
      if (Math.sin(d * 13 + hIdx * 7) > (1 - prob * 2) || d <= 7) {
        defaultCompletions.push({
          id: `c-${d}-${h.id}`,
          user_id: 'local',
          habit_id: h.id,
          completed_date: dayDateStr,
        });
      }
    });
  }

  // Monthly goal
  const defaultGoals: MonthlyGoal[] = [
    {
      id: 'g-current',
      user_id: 'local',
      year,
      month,
      goal_text: 'Ultimate: Достичь максимальной продуктивности, энергии и дисциплины каждый день.',
      habit_targets: {
        'h-1': 30,
        'h-2': 30,
        'h-3': 30,
        'h-4': 30,
        'h-5': 30,
        'h-6': 30,
        'h-7': 30,
        'h-8': 30,
        'h-9': 30,
      },
    },
  ];

  // Default tasks for the week
  const dayOfWeek = (now.getDay() + 6) % 7; // Mon=0
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
  const defaultTasks: Task[] = [];
  const sampleTasksByDay = [
    [
      { text: 'Планирование недели и спринта', done: true },
      { text: 'Разбор входящих писем и задач', done: true },
      { text: 'Силовая тренировка в зале', done: true },
      { text: 'Созвон с командой в 14:00', done: false },
    ],
    [
      { text: 'Подготовить отчет за прошлый месяц', done: true },
      { text: 'Провести код-ревью пулреквестов', done: true },
      { text: 'Прогулка в парке 40 минут', done: true },
      { text: 'Урок английского языка', done: false },
    ],
    [
      { text: 'Фокус-блок: разработка нового функционала', done: true },
      { text: 'Заказать необходимые книги и витамины', done: true },
      { text: 'Растяжка и легкая разминка', done: false },
      { text: 'Звонок семье вечером', done: false },
    ],
    [
      { text: 'Обсуждение дизайн-системы проекта', done: true },
      { text: 'Проверка финансовых расходов', done: false },
      { text: 'Тренировка: кардио + пресс', done: false },
    ],
    [
      { text: 'Подведение итогов рабочей недели', done: false },
      { text: 'Уборка рабочего стола', done: false },
      { text: 'Вечерний просмотр полезной лекции', done: false },
    ],
    [
      { text: 'Выезд на природу / прогулка', done: false },
      { text: 'Чтение книги без спешки (50 стр)', done: false },
      { text: 'Кулинарный эксперимент: полезный ужин', done: false },
    ],
    [
      { text: 'Планирование рациона на следующую неделю', done: false },
      { text: 'Ментальная разгрузка и медитация', done: false },
      { text: 'Подготовка плана на понедельник', done: false },
    ],
  ];

  const defaultEntries: DailyEntry[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    sampleTasksByDay[i]?.forEach((item, tIdx) => {
      defaultTasks.push({
        id: `t-${i}-${tIdx}`,
        user_id: 'local',
        day_date: dateStr,
        text: item.text,
        completed: item.done,
        sort_order: tIdx,
        created_at: new Date().toISOString(),
      });
    });

    defaultEntries.push({
      id: `e-${dateStr}`,
      user_id: 'local',
      day_date: dateStr,
      notes: [
        i === 0 ? 'Отличный продуктивный старт недели' : '',
        i === 1 ? 'Сконцентрироваться на главных приоритетах' : '',
        '',
        '',
      ],
      improvements: [
        'Ложиться спать точно до 23:30',
        'Меньше отвлекаться на мессенджеры в первой половине дня',
        '',
        '',
      ],
      gratitude: [
        'За крепкое здоровье и ясный ум',
        'За поддержку близких и вдохновляющие проекты',
        'За возможность развиваться каждый день',
        '',
      ],
    });
  }

  localStorage.setItem(STORAGE_KEYS.habits, JSON.stringify(defaultHabits));
  localStorage.setItem(STORAGE_KEYS.completions, JSON.stringify(defaultCompletions));
  localStorage.setItem(STORAGE_KEYS.goals, JSON.stringify(defaultGoals));
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(defaultTasks));
  localStorage.setItem(STORAGE_KEYS.entries, JSON.stringify(defaultEntries));
  localStorage.setItem(STORAGE_KEYS.seeded, 'true');
}

// ========== HABITS ==========

export function getHabits(): Habit[] {
  return getItem<Habit>(STORAGE_KEYS.habits).filter((h) => !h.archived);
}

export function getAllHabits(): Habit[] {
  return getItem<Habit>(STORAGE_KEYS.habits);
}

export function createHabit(data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'archived'>): Habit {
  const habits = getAllHabits();
  const habit: Habit = {
    id: generateId(),
    user_id: 'local',
    created_at: new Date().toISOString(),
    archived: false,
    ...data,
  };
  habits.push(habit);
  setItem(STORAGE_KEYS.habits, habits);
  return habit;
}

export function updateHabit(id: string, data: Partial<Habit>): Habit | null {
  const habits = getAllHabits();
  const index = habits.findIndex((h) => h.id === id);
  if (index === -1) return null;
  habits[index] = { ...habits[index], ...data };
  setItem(STORAGE_KEYS.habits, habits);
  return habits[index];
}

export function deleteHabit(id: string): boolean {
  const habits = getAllHabits();
  const filtered = habits.filter((h) => h.id !== id);
  if (filtered.length === habits.length) return false;
  setItem(STORAGE_KEYS.habits, filtered);
  // Also clean up completions
  const completions = getItem<HabitCompletion>(STORAGE_KEYS.completions);
  setItem(STORAGE_KEYS.completions, completions.filter((c) => c.habit_id !== id));
  return true;
}

export function archiveHabit(id: string): Habit | null {
  return updateHabit(id, { archived: true });
}

export function reorderHabits(orderedIds: string[]): void {
  const habits = getAllHabits();
  const reordered: Habit[] = [];
  for (const id of orderedIds) {
    const h = habits.find((h) => h.id === id);
    if (h) reordered.push(h);
  }
  for (const h of habits) {
    if (!orderedIds.includes(h.id)) reordered.push(h);
  }
  setItem(STORAGE_KEYS.habits, reordered);
}

// ========== HABIT COMPLETIONS ==========

export function getCompletions(year?: number, month?: number): HabitCompletion[] {
  let completions = getItem<HabitCompletion>(STORAGE_KEYS.completions);
  if (year !== undefined && month !== undefined) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    completions = completions.filter((c) => c.completed_date.startsWith(prefix));
  }
  return completions;
}

export function toggleCompletion(habitId: string, dateStr: string): boolean {
  const completions = getItem<HabitCompletion>(STORAGE_KEYS.completions);
  const existingIndex = completions.findIndex(
    (c) => c.habit_id === habitId && c.completed_date === dateStr
  );

  if (existingIndex >= 0) {
    completions.splice(existingIndex, 1);
    setItem(STORAGE_KEYS.completions, completions);
    return false; // Now unchecked
  } else {
    completions.push({
      id: generateId(),
      user_id: 'local',
      habit_id: habitId,
      completed_date: dateStr,
    });
    setItem(STORAGE_KEYS.completions, completions);
    return true; // Now checked
  }
}

export function getCompletionsForDateRange(startDate: string, endDate: string): HabitCompletion[] {
  const completions = getItem<HabitCompletion>(STORAGE_KEYS.completions);
  return completions.filter(
    (c) => c.completed_date >= startDate && c.completed_date <= endDate
  );
}

// ========== MONTHLY GOALS ==========

export function getMonthlyGoal(year: number, month: number): MonthlyGoal | null {
  const goals = getItem<MonthlyGoal>(STORAGE_KEYS.goals);
  return goals.find((g) => g.year === year && g.month === month) || null;
}

export function upsertMonthlyGoal(year: number, month: number, data: Partial<MonthlyGoal>): MonthlyGoal {
  const goals = getItem<MonthlyGoal>(STORAGE_KEYS.goals);
  const index = goals.findIndex((g) => g.year === year && g.month === month);

  if (index >= 0) {
    goals[index] = { ...goals[index], ...data };
    setItem(STORAGE_KEYS.goals, goals);
    return goals[index];
  } else {
    const goal: MonthlyGoal = {
      id: generateId(),
      user_id: 'local',
      year,
      month,
      goal_text: '',
      habit_targets: {},
      ...data,
    };
    goals.push(goal);
    setItem(STORAGE_KEYS.goals, goals);
    return goal;
  }
}

// ========== TASKS ==========

export function getTasks(dateStr: string): Task[] {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  return tasks
    .filter((t) => t.day_date === dateStr)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function getTasksForDateRange(startDate: string, endDate: string): Task[] {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  return tasks
    .filter((t) => t.day_date >= startDate && t.day_date <= endDate)
    .sort((a, b) => a.sort_order - b.sort_order);
}

export function createTask(dateStr: string, text: string): Task {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  const dayTasks = tasks.filter((t) => t.day_date === dateStr);
  const maxOrder = dayTasks.reduce((max, t) => Math.max(max, t.sort_order), -1);

  const task: Task = {
    id: generateId(),
    user_id: 'local',
    day_date: dateStr,
    text,
    completed: false,
    sort_order: maxOrder + 1,
    created_at: new Date().toISOString(),
  };
  tasks.push(task);
  setItem(STORAGE_KEYS.tasks, tasks);
  return task;
}

export function updateTask(id: string, data: Partial<Task>): Task | null {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...data };
  setItem(STORAGE_KEYS.tasks, tasks);
  return tasks[index];
}

export function deleteTask(id: string): boolean {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  const filtered = tasks.filter((t) => t.id !== id);
  if (filtered.length === tasks.length) return false;
  setItem(STORAGE_KEYS.tasks, filtered);
  return true;
}

export function reorderTasks(dateStr: string, orderedIds: string[]): void {
  const tasks = getItem<Task>(STORAGE_KEYS.tasks);
  orderedIds.forEach((id, index) => {
    const task = tasks.find((t) => t.id === id);
    if (task) task.sort_order = index;
  });
  setItem(STORAGE_KEYS.tasks, tasks);
}

// ========== DAILY ENTRIES ==========

export function getDailyEntry(dateStr: string): DailyEntry | null {
  const entries = getItem<DailyEntry>(STORAGE_KEYS.entries);
  return entries.find((e) => e.day_date === dateStr) || null;
}

export function upsertDailyEntry(dateStr: string, data: Partial<DailyEntry>): DailyEntry {
  const entries = getItem<DailyEntry>(STORAGE_KEYS.entries);
  const index = entries.findIndex((e) => e.day_date === dateStr);

  if (index >= 0) {
    entries[index] = { ...entries[index], ...data };
    setItem(STORAGE_KEYS.entries, entries);
    return entries[index];
  } else {
    const entry: DailyEntry = {
      id: generateId(),
      user_id: 'local',
      day_date: dateStr,
      notes: ['', '', '', ''],
      improvements: ['', '', '', ''],
      gratitude: ['', '', '', ''],
      ...data,
    };
    entries.push(entry);
    setItem(STORAGE_KEYS.entries, entries);
    return entry;
  }
}

// ========== MENTAL RATINGS (Mood & Motivation from photograph) ==========
export interface MentalRatings {
  mood: Record<string, number>;
  motivation: Record<string, number>;
}

export function getMentalRatings(): MentalRatings {
  if (typeof window === 'undefined') return { mood: {}, motivation: {} };
  try {
    const raw = localStorage.getItem('ht_mental_ratings');
    if (raw) return JSON.parse(raw);
    // Seed initial ratings for realism
    const initial: MentalRatings = { mood: {}, motivation: {} };
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    for (let d = 1; d <= Math.min(now.getDate(), 28); d++) {
      const dayDateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      initial.mood[dayDateStr] = 7 + (d % 3);
      initial.motivation[dayDateStr] = 8 + (d % 3 === 0 ? -1 : 1);
    }
    localStorage.setItem('ht_mental_ratings', JSON.stringify(initial));
    return initial;
  } catch {
    return { mood: {}, motivation: {} };
  }
}

export function setMentalRating(
  dateStr: string,
  type: 'mood' | 'motivation',
  value: number
): MentalRatings {
  const current = getMentalRatings();
  current[type][dateStr] = value;
  if (typeof window !== 'undefined') {
    localStorage.setItem('ht_mental_ratings', JSON.stringify(current));
  }
  return current;
}
