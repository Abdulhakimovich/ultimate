'use client';

import React from 'react';
import { Check, Minus } from 'lucide-react';
import { triggerFeedback } from '@/lib/feedback';

export interface HabitCellProps {
  checked: boolean;
  isToday?: boolean;
  isPast?: boolean;
  habitName: string;
  dateStr: string;
  habitColor?: string;
  onToggle: () => void;
  disabled?: boolean;
}

export default function HabitCell({
  checked,
  isToday = false,
  isPast = false,
  habitName,
  dateStr,
  habitColor = 'var(--electric)',
  onToggle,
  disabled = false,
}: HabitCellProps) {
  // Determine state
  const stateLabel = checked ? 'Done' : isPast ? 'Missed' : 'Not recorded';

  const handleToggle = () => {
    if (disabled) return;
    triggerFeedback(!checked ? 'check' : 'uncheck');
    onToggle();
  };

  return (
    <div className="flex items-center justify-center p-0.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        aria-label={`${habitName}, ${dateStr}: ${stateLabel}`}
        disabled={disabled}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            handleToggle();
          }
        }}
        className={`
          relative w-7 h-7 sm:w-6 sm:h-6 rounded-md flex items-center justify-center
          transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--electric)]
          touch-manipulation select-none
          ${isToday ? 'ring-1 ring-[var(--electric)] shadow-[0_0_8px_var(--electric-glow)]' : ''}
        `}
        style={{
          background: checked
            ? 'var(--electric-glow)'
            : isToday
            ? 'var(--electric-glow)'
            : 'var(--bg-elevated)',
          border: checked
            ? '1.5px solid var(--electric)'
            : isToday
            ? '1px solid var(--electric)'
            : '1px solid var(--border)',
          boxShadow: checked ? '0 0 10px var(--electric-glow)' : 'none',
        }}
      >
        {checked ? (
          <Check
            size={14}
            className="animate-check-pop stroke-[3]"
            style={{ color: 'var(--electric)' }}
          />
        ) : isPast ? (
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--text-muted)', opacity: 0.35 }}
          />
        ) : (
          <span className="sr-only">Empty</span>
        )}
      </button>
    </div>
  );
}
