'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useThemeStore } from '@/store/themeStore';

export interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'auto' | 'dark' | 'light' | 'original' | 'badge';
  className?: string;
  showGlow?: boolean;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: { height: 22, width: 73 },
  sm: { height: 32, width: 106 },
  md: { height: 42, width: 139 },
  lg: { height: 56, width: 185 },
  xl: { height: 76, width: 252 },
};

export default function Logo({
  size = 'sm',
  variant = 'auto',
  className = '',
  showGlow = true,
  priority = false,
}: LogoProps) {
  const [mounted, setMounted] = useState(false);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = SIZE_MAP[size] || SIZE_MAP.sm;

  // Determine active visual theme
  const effectiveTheme = mounted ? theme : 'dark';
  const isLight = variant === 'light' || (variant === 'auto' && effectiveTheme === 'light');

  // Select asset
  let src = '/ultimate-logo-dark-trimmed.png';
  if (variant === 'original') {
    src = '/ultimate-logo.jpg';
  } else if (isLight) {
    src = '/ultimate-logo-light-trimmed.png';
  }

  // Glow styles depending on theme
  const glowStyle = showGlow
    ? {
        filter: isLight
          ? 'drop-shadow(0 2px 8px rgba(0, 102, 204, 0.25))'
          : 'drop-shadow(0 0 14px rgba(0, 240, 255, 0.45)) drop-shadow(0 0 28px rgba(0, 140, 255, 0.2))',
      }
    : {};

  if (variant === 'badge') {
    return (
      <div
        className={`relative inline-flex items-center px-3 py-1 rounded-xl bg-[#040711] border border-[rgba(0,240,255,0.3)] shadow-[0_0_16px_rgba(0,240,255,0.2)] transition-transform duration-200 hover:scale-105 ${className}`}
      >
        <Image
          src="/ultimate-logo-dark-trimmed.png"
          alt="ULTimate"
          width={dimensions.width}
          height={dimensions.height}
          priority={priority}
          className="object-contain"
          style={glowStyle}
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{ height: dimensions.height }}
    >
      <Image
        src={src}
        alt="ULTimate"
        width={dimensions.width}
        height={dimensions.height}
        priority={priority}
        className="object-contain transition-opacity duration-300"
        style={glowStyle}
      />
    </div>
  );
}
