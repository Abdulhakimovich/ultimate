'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, BarChart3, LayoutDashboard, Printer, RotateCcw, ChevronDown, Zap, Globe, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { t, type Language } from '@/lib/i18n';

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'ru', label: 'Русский',  flag: '🇷🇺' },
  { code: 'en', label: 'English',  flag: '🇺🇸' },
  { code: 'uz', label: "O'zbek",   flag: '🇺🇿' },
];

export default function TopNav() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen]         = useState(false);
  const [mounted, setMounted]           = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef     = useRef<HTMLDivElement>(null);

  const language    = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const theme       = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  // Use default ('ru') on first render to match SSR, switch to real values after mount
  const displayLanguage = mounted ? language : 'ru';
  const displayTheme    = mounted ? theme : 'dark';
  const tr              = t(displayLanguage);

  useEffect(() => {
    setMounted(true);
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === displayLanguage)!;

  const navItems = [
    { href: '/tracker',   label: tr.nav.tracker,   icon: Calendar },
    { href: '/planner',   label: tr.nav.planner,   icon: LayoutDashboard },
    { href: '/analytics', label: tr.nav.analytics, icon: BarChart3 },
  ];

  return (
    <header
      className="sticky top-0 z-50 h-[52px] no-print"
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 1px 24px rgba(0,0,0,0.5)',
      }}
    >
      <nav className="h-full max-w-[1600px] mx-auto px-4 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/tracker"
          className="flex items-center gap-2 group"
          aria-label="Ultimate"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:scale-110"
            style={{ background: 'linear-gradient(135deg, var(--electric), var(--blue-mid))', boxShadow: '0 0 12px var(--electric-muted)' }}
          >
            <Zap size={14} style={{ color: 'var(--bg-primary)' }} />
          </div>
          <span
            className="font-display font-black text-base tracking-tight hidden sm:block"
            style={{
              background: 'linear-gradient(90deg, var(--electric), var(--blue-mid))',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Ultimate
          </span>
        </Link>

        {/* Nav Items */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                style={{
                  color: isActive ? 'var(--electric)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--electric-glow)' : 'transparent',
                }}
                suppressHydrationWarning
                onMouseEnter={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={15} />
                <span className="hidden md:inline" suppressHydrationWarning>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, var(--electric), var(--blue-mid))', boxShadow: '0 0 6px var(--electric-muted)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right: Language + Theme Toggle + User */}
        <div className="flex items-center gap-2">

          {/* Language Switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
              aria-label={tr.ui.language}
            >
              <Globe size={13} />
              <span className="hidden sm:inline">{currentLang.flag} {currentLang.label}</span>
              <span className="sm:hidden">{currentLang.flag}</span>
              <ChevronDown size={11} style={{ opacity: 0.6 }} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-40 rounded-xl p-1 z-50"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 16px var(--electric-glow)' }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                      style={{
                        color: language === opt.code ? 'var(--electric)' : 'var(--text-secondary)',
                        background: language === opt.code ? 'var(--electric-glow)' : 'transparent',
                        fontWeight: language === opt.code ? 700 : 400,
                      }}
                    >
                      <span>{opt.flag}</span>
                      <span>{opt.label}</span>
                      {language === opt.code && <span className="ml-auto text-[10px]">✓</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{
              color: 'var(--electric)',
              border: '1px solid var(--border)',
              background: 'var(--electric-glow)',
            }}
            aria-label={displayTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={displayTheme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
            suppressHydrationWarning
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={displayTheme}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {displayTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* User / Settings dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-1 p-1.5 rounded-lg transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              aria-label="Меню"
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                style={{ background: 'linear-gradient(135deg, var(--electric-glow), var(--electric-glow))', color: 'var(--electric)', border: '1px solid var(--border-bright)' }}
              >
                U
              </div>
              <ChevronDown size={11} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl p-1.5 z-50 text-xs"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-bright)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                >
                  <button
                    onClick={() => { setDropdownOpen(false); window.print(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--electric-glow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Printer size={13} style={{ color: 'var(--text-secondary)' }} />
                    <span>{tr.ui.print}</span>
                  </button>

                  <div style={{ borderTop: '1px solid var(--electric-glow)', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      if (confirm('Reset all data to demo defaults?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left"
                    style={{ color: 'var(--accent-red)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,51,102,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <RotateCcw size={13} />
                    <span>{tr.ui.reset}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </header>
  );
}
