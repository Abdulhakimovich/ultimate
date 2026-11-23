'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { triggerFeedback } from '@/lib/feedback';

export interface HabitCellProps {
  checked: boolean;
  isToday?: boolean;
  isPast?: boolean;
  habitName: string;
  dateStr: string;
  habitColor?: string;
  color?: string;
  onToggle: () => void;
  disabled?: boolean;
}

function getLuminance(color: string): number {
  if (!color || color.startsWith('var(')) return 0.2;
  const clean = color.replace('#', '');
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16) / 255;
    const g = parseInt(clean[1] + clean[1], 16) / 255;
    const b = parseInt(clean[2] + clean[2], 16) / 255;
    const [rl, gl, bl] = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  }
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const [rl, gl, bl] = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return rl * 0.2126 + gl * 0.7152 + bl * 0.0722;
  }
  return 0.2;
}

export default function HabitCell({
  checked,
  isToday = false,
  isPast = false,
  habitName,
  dateStr,
  habitColor,
  color,
  onToggle,
  disabled = false,
}: HabitCellProps) {
  const activeColor = color || habitColor || 'var(--electric)';
  const checkColor = getLuminance(activeColor) > 0.42 ? '#0A1428' : '#FFFFFF';
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
          relative w-[26px] h-[26px] sm:w-[22px] sm:h-[22px] rounded-md flex items-center justify-center
          transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--electric)]
          touch-manipulation select-none
          before:content-[''] before:absolute before:-inset-2 before:min-w-[40px] before:min-h-[40px] before:pointer-events-auto
          ${isToday && !checked ? 'ring-1 ring-[var(--electric)]' : ''}
        `}
        style={{
          background: checked
            ? activeColor
            : isToday
            ? 'var(--electric-glow)'
            : 'var(--bg-elevated)',
          border: checked
            ? `1.5px solid ${activeColor}`
            : isToday
            ? '1.5px solid var(--electric)'
            : '1px solid var(--border)',
          boxShadow: checked ? `0 0 8px ${activeColor}55` : 'none',
        }}
      >
        {checked ? (
          <Check
            size={13}
            className="animate-check-pop stroke-[3]"
            style={{ color: checkColor }}
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
