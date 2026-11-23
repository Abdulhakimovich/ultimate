import type { Language } from '@/lib/i18n';

/**
 * Plural helper for days count
 * ru: 1 день, 2-4 дня, 5-20 дней, 21 день, etc.
 * en: 1 day, 2 days
 * uz: 1 kun, 2 kun
 */
export function getDaysUnit(count: number, language: Language, uppercase = false): string {
  let unit = '';
  if (language === 'uz') {
    unit = 'kun';
  } else if (language === 'en') {
    unit = count === 1 ? 'day' : 'days';
  } else {
    // Russian pluralization
    const abs = Math.abs(count);
    const mod10 = abs % 10;
    const mod100 = abs % 100;

    if (mod100 >= 11 && mod100 <= 14) {
      unit = 'дней';
    } else if (mod10 === 1) {
      unit = 'день';
    } else if (mod10 >= 2 && mod10 <= 4) {
      unit = 'дня';
    } else {
      unit = 'дней';
    }
  }

  return uppercase ? unit.toUpperCase() : unit;
}

/**
 * Format count with proper plural suffix, e.g. "1 day", "5 days", "1 день", "3 дня"
 */
export function formatDays(count: number, language: Language, uppercase = false): string {
  return `${count} ${getDaysUnit(count, language, uppercase)}`;
}
