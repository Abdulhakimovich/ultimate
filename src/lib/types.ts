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
  sound_enabled: boolean;
  haptics_enabled: boolean;
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
  labels: {
    ru: string;
    en: string;
    uz: string;
  };
}

export const HABIT_ICONS: HabitIcon[] = [
  { key: 'reading', emoji: 'reading', label: 'Чтение', labels: { ru: 'Чтение', en: 'Reading', uz: 'Kitob o‘qish' } },
  { key: 'exercise', emoji: 'exercise', label: 'Спорт', labels: { ru: 'Спорт', en: 'Exercise', uz: 'Mashqlar' } },
  { key: 'water', emoji: 'water', label: 'Вода', labels: { ru: 'Вода', en: 'Water', uz: 'Suv ichish' } },
  { key: 'sleep', emoji: 'sleep', label: 'Сон', labels: { ru: 'Сон', en: 'Sleep', uz: 'Uyqu' } },
  { key: 'meditation', emoji: 'meditation', label: 'Медитация', labels: { ru: 'Медитация', en: 'Meditation', uz: 'Meditatsiya' } },
  { key: 'languages', emoji: 'languages', label: 'Языки', labels: { ru: 'Языки', en: 'Languages', uz: 'Tillar' } },
  { key: 'walk', emoji: 'walk', label: 'Прогулка', labels: { ru: 'Прогулка', en: 'Walk', uz: 'Sayr qilish' } },
  { key: 'journal', emoji: 'journal', label: 'Дневник', labels: { ru: 'Дневник', en: 'Journal', uz: 'Kundalik' } },
  { key: 'coding', emoji: 'coding', label: 'Кодинг', labels: { ru: 'Кодинг', en: 'Coding', uz: 'Dasturlash' } },
  { key: 'vitamins', emoji: 'vitamins', label: 'Витамины', labels: { ru: 'Витамины', en: 'Vitamins', uz: 'Vitaminlar' } },
  { key: 'music', emoji: 'music', label: 'Музыка', labels: { ru: 'Музыка', en: 'Music', uz: 'Musiqa' } },
  { key: 'cooking', emoji: 'cooking', label: 'Готовка', labels: { ru: 'Готовка', en: 'Cooking', uz: 'Taom tayyorlash' } },
  { key: 'cleaning', emoji: 'cleaning', label: 'Уборка', labels: { ru: 'Уборка', en: 'Cleaning', uz: 'Tozalash' } },
  { key: 'no-sugar', emoji: 'no-sugar', label: 'Без сахара', labels: { ru: 'Без сахара', en: 'No Sugar', uz: 'Shakarsiz' } },
  { key: 'target', emoji: 'target', label: 'Цель', labels: { ru: 'Цель', en: 'Target', uz: 'Maqsad' } },
  { key: 'heart', emoji: 'heart', label: 'Здоровье', labels: { ru: 'Здоровье', en: 'Health', uz: 'Salomatlik' } },
];

export const HABIT_COLORS = [
  '#0A5CFF', // Electric Blue
  '#10B981', // Emerald
  '#8B5CF6', // Vivid Purple
  '#F59E0B', // Warm Amber
  '#F97316', // Coral Orange
  '#EC4899', // Rose Pink
  '#06B6D4', // Bright Cyan
  '#EF4444', // Crimson Red
  '#6366F1', // Indigo
  '#14B8A6', // Teal
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
