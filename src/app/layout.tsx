import type { Metadata } from 'next';
import '@/styles/globals.css';
import ThemeProvider from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'Ultimate — Habit Tracker',
  description: 'Next-level habit tracker: monthly tracker, weekly planner, analytics. Track in Russian, English, or Uzbek.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen antialiased" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
