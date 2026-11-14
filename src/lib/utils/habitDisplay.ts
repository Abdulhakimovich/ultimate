import type { Habit } from '@/lib/types';

export const DEFAULT_HABIT_NAMES: Record<string, Record<'ru' | 'en' | 'uz', string>> = {
  'h-1': { ru: 'Ранний подъем', en: 'Early Morning Rise', uz: 'Erta tongda uyg‘onish' },
  'h-2': { ru: 'Выпить стакан воды', en: 'Drink a Glass of Water', uz: '1 stakan suv ichish' },
  'h-3': { ru: 'Контрастный душ', en: 'Contrast / Cold Shower', uz: 'Kontrast dush' },
  'h-4': { ru: 'Изучение языка', en: 'Language Practice', uz: 'Til o‘rganish' },
  'h-5': { ru: 'Фитнес / пробежка', en: 'Fitness / Morning Run', uz: 'Fitnes / ertalabki yugurish' },
  'h-6': { ru: 'Чтение книги (30 мин)', en: 'Read a Book (30 min)', uz: 'Kitob o‘qish (30 daqiqa)' },
  'h-7': { ru: 'Планирование дня', en: 'Daily Planning', uz: 'Kunni rejalashtirish' },
  'h-8': { ru: 'Фокус-работа', en: 'Deep Focus Session', uz: 'Fokusli ish seansi' },
  'h-9': { ru: 'Медитация / дыхание', en: 'Meditation & Breathwork', uz: 'Meditatsiya va nafas mashqi' },
};

export function getHabitDisplayName(habit: Habit, lang: 'ru' | 'en' | 'uz'): string {
  if (DEFAULT_HABIT_NAMES[habit.id] && DEFAULT_HABIT_NAMES[habit.id][lang]) {
    return DEFAULT_HABIT_NAMES[habit.id][lang];
  }
  return habit.name;
}
