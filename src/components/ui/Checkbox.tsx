'use client';

import { motion } from 'framer-motion';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  size?: 'sm' | 'md';
  ariaLabel?: string;
  disabled?: boolean;
}

export default function Checkbox({
  checked,
  onChange,
  size = 'md',
  ariaLabel,
  disabled = false,
}: CheckboxProps) {
  const dimensions = size === 'sm' ? 16 : 20;
  const checkSize  = size === 'sm' ? 10 : 12;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className="relative flex-shrink-0 rounded-[3px] transition-all duration-150 cursor-pointer focus-visible:outline-none"
      style={{
        width: dimensions,
        height: dimensions,
        border: `1.5px solid ${checked ? '#00D4FF' : '#3D5A7A'}`,
        background: checked ? '#00D4FF' : 'transparent',
        boxShadow: checked ? '0 0 8px rgba(0,212,255,0.5)' : 'none',
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
            stroke="#080C14"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      )}
    </button>
  );
}
