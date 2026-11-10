import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and brand */}
        <div className="text-center mb-6">
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 font-display font-bold text-2xl text-text-primary hover:text-accent-brown transition-colors"
          >
            <span className="text-3xl">📋</span>
            <span>Планер Привычек</span>
          </Link>
          <p className="text-xs text-text-secondary mt-1">
            Ваш личный дашборд продуктивности, привычек и целей
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-bg-card rounded-2xl shadow-md border border-bg-card-alt p-6 sm:p-8">
          {children}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-text-muted">
          <Link href="/planner" className="hover:text-accent-blue transition-colors underline">
            Войти как гость в демо-режиме
          </Link>
        </div>
      </div>
    </div>
  );
}
