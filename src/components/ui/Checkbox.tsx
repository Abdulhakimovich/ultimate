'use client';

import { motion } from 'framer-motion';

export interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
  color?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  size = 'md',
  color = 'var(--electric)',
  ariaLabel,
  disabled = false,
}: CheckboxProps) {
  const dimensions = size === 'sm' ? 22 : 24;
  const checkSize  = size === 'sm' ? 12 : 14;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className="relative flex-shrink-0 rounded-md transition-all duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--electric)] before:content-[''] before:absolute before:-inset-2 before:min-w-[40px] before:min-h-[40px] before:pointer-events-auto flex items-center justify-center touch-manipulation"
      style={{
        width: dimensions,
        height: dimensions,
        border: `2px solid ${checked ? color : 'var(--border)'}`,
        background: checked ? color : 'transparent',
        boxShadow: checked ? `0 0 8px ${color}40` : 'none',
      }}
    >
      {checked && (
        <motion.svg
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15, ease: 'backOut' }}
          width={checkSize}
          height={checkSize}
          viewBox="0 0 12 9"
          fill="none"
          className="absolute inset-0 m-auto"
        >
          <path
            d="M1.5 4.5L4.5 7.5L10.5 1.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </button>
  );
}
