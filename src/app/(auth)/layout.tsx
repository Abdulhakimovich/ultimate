'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles, Trophy } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import AuthHeaderNav from '@/components/auth/AuthHeaderNav';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden bg-[var(--bg-primary)]"
    >
      {/* Background ambient electric neon glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none opacity-20 dark:opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, var(--electric) 0%, transparent 70%)',
        }}
      />

      {/* Top Bar with Language & Theme toggles */}
      <AuthHeaderNav />

      {/* Main Content Area: Split layout on desktop (lg+), single-column on mobile */}
      <main className="w-full max-w-5xl mx-auto px-4 py-8 relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12 flex-1 justify-center">
        {/* Desktop Left Brand & Benefits Column (hidden on mobile) */}
        <div className="hidden lg:flex flex-col space-y-6 max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center group focus:outline-none transition-transform hover:scale-105"
            aria-label="Ultimate"
          >
            <Logo size="lg" priority />
          </Link>

          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl xl:text-4xl tracking-tight text-[var(--text-primary)]">
              {tr.auth.heroTitle}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {tr.auth.heroSubtitle}
            </p>
          </div>

          {/* 3 Benefit Lines */}
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[var(--electric-glow)] text-[var(--electric)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={15} />
              </div>
              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {tr.auth.benefit1}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[var(--electric-glow)] text-[var(--electric)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={15} />
              </div>
              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {tr.auth.benefit2}
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-[var(--electric-glow)] text-[var(--electric)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Trophy size={15} />
              </div>
              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {tr.auth.benefit3}
              </p>
            </div>
          </div>

          {/* 1 Encouraging line */}
          <div className="p-3.5 rounded-xl border border-[var(--border-bright)] bg-[var(--electric-glow)]/40 text-xs text-[var(--text-secondary)] italic">
            {tr.auth.quote}
          </div>
        </div>

        {/* Mobile Logo (hidden on desktop) */}
        <div className="lg:hidden text-center flex flex-col items-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center group focus:outline-none transition-transform hover:scale-105 mb-2"
            aria-label="Ultimate"
          >
            <Logo size="lg" priority />
          </Link>
          <p
            className="text-xs font-medium tracking-wide text-center"
            style={{ color: 'var(--text-secondary)' }}
          >
            {tr.auth.tagline}
          </p>
        </div>

        {/* Auth form card */}
        <div
          className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl p-6 sm:p-8 relative surface-card border-hairline shadow-2xl"
          style={{
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px var(--electric-glow)',
          }}
        >
          {children}
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-4 text-center text-xs select-none text-[var(--text-muted)]">
        ULTimate © {new Date().getFullYear()} • Built for Peak Performance
      </footer>
    </div>
  );
}
