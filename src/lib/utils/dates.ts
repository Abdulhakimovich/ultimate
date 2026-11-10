import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getISOWeek,
  isBefore,
  isAfter,
  parseISO,
} from 'date-fns';
import { ru } from 'date-fns/locale';

export {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  isToday,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  getISOWeek,
  isBefore,
  isAfter,
  parseISO,
};

export const ruLocale = ru;

/**
 * Format a date with Russian locale
 */
export function formatRu(date: Date | string, formatStr: string): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: ru });
}

/**
 * Get the date string in YYYY-MM-DD format
 */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get all days in a month, organized by weeks (Mon-Sun)
 */
export function getMonthWeeks(date: Date): Date[][] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  for (const day of days) {
    // getDay: 0=Sun, 1=Mon, ..., 6=Sat
    // Convert to Mon=0, ..., Sun=6
    const dayOfWeek = (getDay(day) + 6) % 7;

    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
}

/**
 * Get the week days for a given date (Mon-Sun)
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: weekStart, end: weekEnd });
}

/**
 * Get all calendar days for a month view (including trailing/leading days)
 */
export function getCalendarDays(date: Date): (Date | null)[] {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  const days = eachDayOfInterval({ start, end });

  // Add leading empty cells
  const firstDayOfWeek = (getDay(start) + 6) % 7; // Mon=0
  const leading: (Date | null)[] = Array(firstDayOfWeek).fill(null);

  return [...leading, ...days];
}

/**
 * Get month name in Russian
 */
export function getMonthName(date: Date): string {
  return format(date, 'LLLL', { locale: ru });
}

/**
 * Get full date string in Russian (e.g., "вторник, 21 октября")
 */
export function getFullDateRu(date: Date): string {
  return format(date, 'EEEE, d MMMM', { locale: ru });
}

/**
 * Format date as DD.MM.YYYY
 */
export function formatDotDate(date: Date): string {
  return format(date, 'dd.MM.yyyy');
}

/**
 * Format date as DD.MM.YY
 */
export function formatShortDotDate(date: Date): string {
  return format(date, 'dd.MM.yy');
}

/**
 * Get the week number for display (1-5 within a month)
 */
export function getMonthWeekNumber(date: Date): number {
  const monthStart = startOfMonth(date);
  const dayOfMonth = date.getDate();
  const firstDayOffset = (getDay(monthStart) + 6) % 7;
  return Math.ceil((dayOfMonth + firstDayOffset) / 7);
}
