import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import ThemeProvider from '@/components/providers/ThemeProvider';
import PwaProvider from '@/components/providers/PwaProvider';

export const metadata: Metadata = {
  title: 'Ultimate — Habit Tracker',
  description: 'Next-level habit tracker: monthly tracker, weekly planner, analytics. Track in Russian, English, or Uzbek.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ultimate',
  },
};

export const viewport: Viewport = {
  themeColor: '#0076F9',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
          <PwaProvider>
            {children}
          </PwaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
