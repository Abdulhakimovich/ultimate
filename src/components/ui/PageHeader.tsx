'use client';

import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  badge,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`surface-card p-4 sm:p-5 rounded-2xl border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${className}`}
    >
      <div className="flex items-start sm:items-center gap-3.5">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-[var(--electric-glow)] text-[var(--electric)] border border-[var(--border-bright)] flex items-center justify-center flex-shrink-0 shadow-sm">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}
