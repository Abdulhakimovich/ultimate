'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  BarChart3,
  LayoutDashboard,
  Printer,
  ChevronDown,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '@/store/languageStore';
import { useThemeStore } from '@/store/themeStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useProfileStore } from '@/store/profileStore';
import { useSignOut } from '@/hooks/useSignOut';
import { createClient } from '@/lib/supabase/client';
import { playCheckSound } from '@/lib/feedback';
import { t, LANGUAGE_OPTIONS } from '@/lib/i18n';
import Logo from '@/components/ui/Logo';

export default function TopNav() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [langOpen, setLangOpen]         = useState(false);
  const [mobileMenuOpen, setMobileMenu] = useState(false);
  const [mounted, setMounted]           = useState(false);
  const [userEmail, setUserEmail]       = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const langRef     = useRef<HTMLDivElement>(null);

  const language    = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const theme       = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const soundEnabled = useFeedbackStore((s) => s.soundEnabled);
  const toggleSound  = useFeedbackStore((s) => s.toggleSound);
  const profile      = useProfileStore((s) => s.profile);
  const signOut      = useSignOut();

  const handleSignOut = async () => {
    setDropdownOpen(false);
    setMobileMenu(false);
    await signOut();
  };

  const handleToggleSound = () => {
    toggleSound();
    if (!soundEnabled) {
      setTimeout(() => playCheckSound(), 50);
    }
  };

  const displayLanguage = mounted ? language : 'ru';
  const displayTheme    = mounted ? theme : 'dark';
  const tr              = t(displayLanguage);

  useEffect(() => {
    setMounted(true);
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user?.email) setUserEmail(data.user.email);
      }).catch(() => {});
    } catch {}

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGE_OPTIONS.find((l) => l.code === displayLanguage) || LANGUAGE_OPTIONS[0];

  const navItems = [
    { href: '/tracker',     label: tr.nav.tracker,     icon: Calendar },
    { href: '/planner',     label: tr.nav.planner,     icon: LayoutDashboard },
    { href: '/analytics',   label: tr.nav.analytics,   icon: BarChart3 },
    { href: '/instruction', label: tr.nav.instruction, icon: BookOpen },
  ];

  return (
    <header
      className="sticky top-0 z-50 h-[56px] no-print backdrop-blur-md transition-colors"
      style={{
        background: 'var(--bg-glass)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav className="h-full max-w-[1600px] mx-auto px-4 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link
            href="/tracker"
            className="flex items-center gap-2 group relative py-1 focus-visible:ring-2 focus-visible:ring-[var(--electric)] rounded-lg"
            aria-label="Ultimate Habit Tracker"
          >
            <Logo size="sm" priority />
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    color: isActive ? 'var(--electric)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--electric-glow)' : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)';
                  }}
                >
                  <Icon size={15} />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, var(--electric), var(--blue-neon))',
                        boxShadow: '0 0 8px var(--electric-glow)',
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Controls: Language Switcher, Theme Toggle, User Menu, Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          {/* Clean Text-Based Language Switcher (No Emojis) */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((p) => !p)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                background: 'var(--bg-card)',
              }}
              aria-label={tr.ui.language}
            >
              <span>{currentLang.label}</span>
              <ChevronDown size={12} className="opacity-60" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-36 rounded-xl p-1 z-50 shadow-xl"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-bright)',
                  }}
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.code}
                      onClick={() => { setLanguage(opt.code); setLangOpen(false); }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all"
                      style={{
                        color: displayLanguage === opt.code ? 'var(--electric)' : 'var(--text-secondary)',
                        background: displayLanguage === opt.code ? 'var(--electric-glow)' : 'transparent',
                        fontWeight: displayLanguage === opt.code ? 700 : 500,
                      }}
                    >
                      <span className="font-sans">{opt.fullLabel}</span>
                      <span className="font-mono text-xs opacity-75">{opt.label}</span>
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
              background: 'var(--bg-card)',
            }}
            aria-label={displayTheme === 'dark' ? tr.ui.themeLight : tr.ui.themeDark}
            title={displayTheme === 'dark' ? tr.ui.themeLight : tr.ui.themeDark}
            suppressHydrationWarning
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={displayTheme}
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.18 }}
              >
                {displayTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
            </AnimatePresence>
          </button>

          {/* Sound / Haptic Cues Toggle */}
          <button
            onClick={handleToggleSound}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-all"
            style={{
              color: soundEnabled ? 'var(--electric)' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
            }}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            title={soundEnabled ? 'Звуковые эффекты включены' : 'Звуковые эффекты выключены'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* User Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-1.5 p-1 rounded-lg transition-all"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              aria-label="User menu"
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs font-mono"
                style={{
                  background: 'var(--electric-glow)',
                  color: 'var(--electric)',
                  border: '1px solid var(--border-bright)',
                }}
              >
                {(profile?.display_name?.[0] || userEmail?.[0] || 'U').toUpperCase()}
              </div>
              <ChevronDown size={11} className="hidden sm:block" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 rounded-xl p-1.5 z-50 text-xs shadow-xl"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-bright)',
                  }}
                >
                  {(profile?.display_name || userEmail) && (
                    <div className="px-3 py-2" style={{ borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                      {profile?.display_name && (
                        <div className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {profile.display_name}
                        </div>
                      )}
                      {userEmail && (
                        <div className="text-xs truncate opacity-70" style={{ color: 'var(--text-secondary)' }}>
                          {userEmail}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => { setDropdownOpen(false); window.print(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Printer size={13} />
                    <span>{tr.ui.print}</span>
                  </button>

                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left"
                    style={{ color: 'var(--text-secondary)', display: 'flex' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <User size={13} />
                    <span>{tr.nav.profile}</span>
                  </Link>

                  <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-left font-medium"
                    style={{ color: 'var(--accent-red)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={13} />
                    <span>{tr.ui.signOut}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenu((p) => !p)}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-xs"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b px-4 py-3 space-y-1 shadow-2xl"
            style={{
              background: 'var(--bg-glass)',
              borderColor: 'var(--border)',
            }}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all touch-target"
                  style={{
                    color: isActive ? 'var(--electric)' : 'var(--text-primary)',
                    background: isActive ? 'var(--electric-glow)' : 'transparent',
                    border: isActive ? '1px solid var(--border-bright)' : '1px solid transparent',
                  }}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMobileMenu(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all touch-target"
              style={{
                color: pathname === '/profile' ? 'var(--electric)' : 'var(--text-primary)',
                background: pathname === '/profile' ? 'var(--electric-glow)' : 'transparent',
                border: pathname === '/profile' ? '1px solid var(--border-bright)' : '1px solid transparent',
              }}
            >
              <User size={16} />
              <span>{tr.nav.profile}</span>
            </Link>
            <div style={{ borderTop: '1px solid var(--border)', margin: '6px 0' }} />
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all touch-target text-left"
              style={{
                color: 'var(--accent-red)',
                background: 'rgba(239, 68, 68, 0.08)',
              }}
            >
              <LogOut size={16} />
              <span>{tr.ui.signOut}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
