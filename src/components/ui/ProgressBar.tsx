'use client';

interface ProgressBarProps {
  value: number;
  height?: number;
  color?: 'electric' | 'green' | 'purple' | 'gold';
  className?: string;
  showLabel?: boolean;
}

const gradients = {
  electric: 'linear-gradient(90deg, var(--electric-dim), var(--electric), var(--blue-neon))',
  green:    'linear-gradient(90deg, #00C66A, #00FF88)',
  purple:   'linear-gradient(90deg, #5B10CC, var(--accent-purple))',
  gold:     'linear-gradient(90deg, #CC9900, #FFD700)',
};

const glows = {
  electric: 'var(--electric-muted)',
  green:    'rgba(0,255,136,0.4)',
  purple:   'rgba(123,47,255,0.4)',
  gold:     'rgba(255,215,0,0.4)',
};

export default function ProgressBar({
  value,
  height = 6,
  color = 'electric',
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-[9px] mb-0.5" style={{ color: 'var(--text-muted)' }}>
          <span>0%</span>
          <span style={{ color: 'var(--electric)', fontWeight: 700 }}>{clamped}%</span>
          <span>100%</span>
        </div>
      )}
      <div
        className="rounded-full overflow-hidden"
        style={{ height, background: 'var(--bg-elevated)' }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          style={{
            height: '100%',
            width: `${clamped}%`,
            background: gradients[color],
            boxShadow: `0 0 6px ${glows[color]}`,
            borderRadius: '999px',
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
}
