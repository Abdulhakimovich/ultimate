'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface DonutSegment {
  value: number;
  color: string;
}

interface DonutRingBaseProps {
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  className?: string;
}

interface DonutRingSingleProps extends DonutRingBaseProps {
  percentage: number;
  color?: string;
  backgroundColor?: string;
  segments?: never;
}

interface DonutRingMultiProps extends DonutRingBaseProps {
  segments: DonutSegment[];
  percentage?: never;
  color?: never;
  backgroundColor?: string;
}

type DonutRingProps = DonutRingSingleProps | DonutRingMultiProps;

export default function DonutRing(props: DonutRingProps) {
  const {
    size = 80,
    strokeWidth = 8,
    animated = true,
    className = '',
    backgroundColor,
  } = props;

  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center      = size / 2;
  // backgroundColor prop still accepted for custom overrides; default to CSS var via style
  const bgColorStyle = backgroundColor
    ? { stroke: backgroundColor }
    : { stroke: 'var(--bg-elevated)' };

  const segments = props.segments;
  const segmentData = useMemo(() => {
    if (!segments) return [];
    let accumulated = 0;
    return segments.map((seg) => {
      const segLength = (seg.value / 100) * circumference;
      const offset    = circumference - accumulated * (circumference / 100);
      accumulated += seg.value;
      return { ...seg, segLength, offset };
    });
  }, [segments, circumference]);

  if (props.segments) {
    const totalValue  = props.segments.reduce((s, seg) => s + seg.value, 0);
    const clamped     = Math.min(100, totalValue);

    return (
      <div
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Progress: ${Math.round(clamped)}%`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} style={bgColorStyle} />
          {segmentData.map((seg, i) => (
            <motion.circle
              key={`${i}-${seg.color}`}
              cx={center} cy={center} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: circumference - seg.segLength }}
              animate={{ strokeDashoffset: circumference - seg.segLength }}
              transition={animated ? { duration: 0.8, ease: 'easeOut', delay: i * 0.1 } : { duration: 0 }}
              style={{ transformOrigin: 'center', rotate: `${(segmentData.slice(0, i).reduce((a, s) => a + s.value, 0) / 100) * 360}deg` }}
            />
          ))}
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-mono font-bold tabular-nums"
          style={{ fontSize: size < 60 ? '10px' : '12px', color: 'var(--electric)' }}
        >
          {Math.round(clamped)}%
        </span>
      </div>
    );
  }

  const percentage  = Math.max(0, Math.min(100, props.percentage ?? 0));
  const fillColor   = props.color ?? 'var(--electric)';
  const dashOffset  = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Progress: ${Math.round(percentage)}%`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" strokeWidth={strokeWidth} style={bgColorStyle} />
        <motion.circle
          cx={center} cy={center} r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={animated ? { strokeDashoffset: circumference } : { strokeDashoffset: dashOffset }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
          style={{ filter: `drop-shadow(0 0 4px ${fillColor}66)` }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono font-bold tabular-nums"
        style={{ fontSize: size < 60 ? '10px' : '12px', color: fillColor }}
      >
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
