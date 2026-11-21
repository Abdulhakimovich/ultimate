'use client';

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { getCalendarDays, isToday, isSameMonth } from '@/lib/utils/dates';

interface MiniCalendarProps {
  onDayClick?: (date: Date) => void;
}

export default function MiniCalendar({ onDayClick }: MiniCalendarProps) {
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const navigateMonth = useHabitsStore((s) => s.navigateMonth);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const monthName = `${tr.months[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
  const dayHeaders = tr.tracker.weekdays;

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  return (
    <div className="bg-bg-card rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-bg-header-dark px-3 py-2 flex items-center justify-between">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label={tr.tracker.prevMonth}
        >
          <ChevronLeft size={14} className="text-text-on-dark" />
        </button>
        <span className="text-sm font-semibold text-text-on-dark capitalize">
          {monthName}
        </span>
        <button
          onClick={() => navigateMonth('next')}
          className="p-0.5 rounded hover:bg-white/10 transition-colors"
          aria-label={tr.tracker.nextMonth}
        >
          <ChevronRight size={14} className="text-text-on-dark" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 px-2 pt-2">
        {dayHeaders.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-text-muted py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 px-2 pb-2 gap-y-0.5">
        {days.map((day, i) => {
          if (!day) {
            return <div key={`empty-${i}`} className="w-full aspect-square" />;
          }

          const today = isToday(day);
          const inMonth = isSameMonth(day, currentMonth);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick?.(day)}
              className={`
                w-full aspect-square flex items-center justify-center rounded-full text-xs
                transition-colors
                ${today
                  ? 'bg-accent-blue text-white font-bold'
                  : inMonth
                    ? 'text-text-primary hover:bg-bg-card-alt'
                    : 'text-text-muted/40'
                }
              `}
              aria-label={`${day.getDate()} ${tr.months[day.getMonth()]}`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
