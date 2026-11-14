// Type definitions for the Habit & Weekly Planner Tracker

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  archived: boolean;
  sort_order?: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  theme: 'dark' | 'light';
  language: 'ru' | 'en' | 'uz';
  local_import_done_at: string | null;
  created_at: string;
}

export interface MonthlyGoal {
  id: string;
  user_id: string;
  year: number;
  month: number;
  goal_text: string;
  habit_targets: Record<string, number>; // { habit_id: target_count }
}

export interface HabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed_date: string; // YYYY-MM-DD
}

export interface Task {
  id: string;
  user_id: string;
  day_date: string; // YYYY-MM-DD
  text: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
}

export interface DailyEntry {
  id: string;
  user_id: string;
  day_date: string; // YYYY-MM-DD
  notes: string[];
  improvements: string[];
  gratitude: string[];
}

// Icon options for habits
export interface HabitIcon {
  key: string;
  emoji: string;
  label: string;
}

export const HABIT_ICONS: HabitIcon[] = [
  { key: 'sleep', emoji: '🌙', label: 'Сон' },
  { key: 'reading', emoji: '📚', label: 'Чтение' },
  { key: 'smoothie', emoji: '🥤', label: 'Смузи' },
  { key: 'steps', emoji: '👣', label: 'Шаги' },
  { key: 'water', emoji: '💧', label: 'Вода' },
  { key: 'exercise', emoji: '🏃', label: 'Упражнения' },
  { key: 'meditation', emoji: '🧘', label: 'Медитация' },
  { key: 'vitamins', emoji: '💊', label: 'Витамины' },
  { key: 'journal', emoji: '✍️', label: 'Дневник' },
  { key: 'coding', emoji: '💻', label: 'Код' },
  { key: 'music', emoji: '🎵', label: 'Музыка' },
  { key: 'cooking', emoji: '🍳', label: 'Готовка' },
  { key: 'cleaning', emoji: '🧹', label: 'Уборка' },
  { key: 'stretching', emoji: '🤸', label: 'Растяжка' },
  { key: 'no-sugar', emoji: '🚫', label: 'Без сахара' },
  { key: 'walk', emoji: '🚶', label: 'Прогулка' },
];

export const HABIT_COLORS = [
  '#C8B89A', '#6B5040', '#A08060', '#5A3A2A',
  '#D4C4A8', '#8B6550', '#3B6EA5', '#6B8E6B',
  '#5B8DB8', '#9B7EC8', '#C8843C', '#C87050',
];

export const DAY_NAMES_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;
export const DAY_NAMES_FULL = [
  'Понедельник', 'Вторник', 'Среда', 'Четверг', 
  'Пятница', 'Суббота', 'Воскресенье'
] as const;

export const RING_COLORS = [
  'var(--color-ring-mon)',
  'var(--color-ring-tue)',
  'var(--color-ring-wed)',
  'var(--color-ring-thu)',
  'var(--color-ring-fri)',
  'var(--color-ring-sat)',
  'var(--color-ring-sun)',
] as const;
