import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import AuthHeaderNav from '@/components/auth/AuthHeaderNav';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at top, #0A1428 0%, var(--bg-primary) 70%)',
      }}
    >
      {/* Background ambient electric neon glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none opacity-25 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #00D2FF 0%, var(--electric) 50%, transparent 80%)',
        }}
      />

      {/* Top Bar with Language & Theme toggles */}
      <AuthHeaderNav />

      {/* Main Content Area */}
      <div className="w-full max-w-md mx-auto px-4 py-6 relative z-10 flex flex-col items-center">
        {/* Logo and brand */}
        <div className="text-center mb-6 flex flex-col items-center">
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
            Личный дашборд привычек, продуктивности и побед
          </p>
        </div>

        {/* Auth card */}
        <div
          className="w-full rounded-2xl p-6 sm:p-8 relative surface-card border-hairline shadow-2xl"
          style={{
            boxShadow: '0 16px 48px rgba(0,0,0,0.6), 0 0 24px var(--electric-glow)',
          }}
        >
          {children}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="py-4 text-center text-[11px] font-mono select-none" style={{ color: 'var(--text-muted)' }}>
        ULTimate © {new Date().getFullYear()} • Built for Peak Performance
      </div>
    </div>
  );
}
