'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { triggerFeedback } from '@/lib/feedback';

export interface HabitCellProps {
  checked: boolean;
  linkL?: boolean;
  linkR?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  isFuture?: boolean;
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
  linkL = false,
  linkR = false,
  isToday = false,
  isPast = false,
  isFuture = false,
  habitName,
  dateStr,
  habitColor,
  color,
  onToggle,
  disabled = false,
}: HabitCellProps) {
  const activeColor = color || habitColor || 'var(--blue)';
  const checkColor = getLuminance(activeColor) > 0.42 ? '#0A1428' : '#FFFFFF';
  const stateLabel = checked ? 'Done' : isFuture ? 'Upcoming' : isPast ? 'Missed' : 'Not recorded';

  const handleToggle = () => {
    if (disabled || isFuture) return;
    triggerFeedback(!checked ? 'check' : 'uncheck');
    onToggle();
  };

  return (
    <div className={`relative flex items-center justify-center h-12 w-full ${isToday ? 'bg-[var(--blue-soft)]' : ''}`}>
      {/* Streak connectors */}
      {checked && linkL && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] w-1/2 pointer-events-none z-0"
          style={{ background: activeColor, opacity: 0.55 }}
        />
      )}
      {checked && linkR && (
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[2px] w-1/2 pointer-events-none z-0"
          style={{ background: activeColor, opacity: 0.55 }}
        />
      )}

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
          relative z-10 w-[24px] h-[24px] rounded-[5px] flex items-center justify-center
          transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[var(--blue)]
          touch-manipulation select-none
          before:content-[''] before:absolute before:-inset-2 before:min-w-[40px] before:min-h-[40px] before:pointer-events-auto
          ${isFuture ? 'cursor-default' : 'cursor-pointer active:scale-90'}
        `}
        style={{
          background: checked
            ? activeColor
            : isToday
            ? 'var(--blue-soft)'
            : isFuture
            ? 'transparent'
            : 'var(--off)',
          border: checked
            ? `1.5px solid ${activeColor}`
            : isToday
            ? '1.5px solid var(--blue)'
            : isFuture
            ? '1px dashed var(--line)'
            : '1px solid var(--line)',
          boxShadow: checked
            ? `0 0 12px ${activeColor}80`
            : isToday
            ? '0 0 10px var(--blue-glow)'
            : 'none',
        }}
      >
        {checked ? (
          <Check
            size={13}
            className="animate-check-pop stroke-[3]"
            style={{ color: checkColor }}
          />
        ) : null}
      </button>
    </div>
  );
}
