'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Info, Sparkles, Check } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { useProfileStore } from '@/store/profileStore';
import { t } from '@/lib/i18n';
import { toDateString } from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import { triggerFeedback } from '@/lib/feedback';
import ConfettiBurst from '@/components/ui/ConfettiBurst';
import HabitIcon from '@/components/ui/HabitIcon';

interface TodayHeroProps {
  onCheckHabit?: (habitId: string, dateStr: string) => void;
}

export default function TodayHero({ onCheckHabit }: TodayHeroProps) {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const language = useLanguageStore((s) => s.language);
  const profile = useProfileStore((s) => s.profile);
  const tr = t(language);

  const [quoteIdx, setQuoteIdx] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Rotate inspirational quote every 12s
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((prev) => (prev + 1) % tr.tracker.inspirational.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [tr.tracker.inspirational.length]);

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => toDateString(today), [today]);

  const yesterdayStr = useMemo(() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return toDateString(y);
  }, []);

  const totalHabits = habits.length;

  const completedToday = useMemo(() => {
    return habits.filter((h) => isHabitCompletedOnDate(completions, h.id, todayStr));
  }, [habits, completions, todayStr]);

  const remainingToday = useMemo(() => {
    return habits.filter((h) => !isHabitCompletedOnDate(completions, h.id, todayStr));
  }, [habits, completions, todayStr]);

  const doneToday = completedToday.length;
  const isAllDone = totalHabits > 0 && remainingToday.length === 0;

  // Check if yesterday had missed habits
  const missedYesterday = useMemo(() => {
    if (totalHabits === 0) return false;
    const completedYesterday = habits.filter((h) =>
      isHabitCompletedOnDate(completions, h.id, yesterdayStr)
    );
    return completedYesterday.length < totalHabits;
  }, [habits, completions, yesterdayStr, totalHabits]);

  // Streak calculations
  const calculateStreak = useCallback(
    (habitId: string) => {
      let streak = 0;
      const check = new Date();
      const isDoneToday = isHabitCompletedOnDate(completions, habitId, todayStr);
      if (!isDoneToday) {
        check.setDate(check.getDate() - 1);
      }
      for (let i = 0; i < 90; i++) {
        const dStr = toDateString(check);
        if (isHabitCompletedOnDate(completions, habitId, dStr)) {
          streak++;
          check.setDate(check.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    },
    [completions, todayStr]
  );

  const heroStreak = useMemo(() => {
    if (totalHabits === 0) return 0;
    const allStreaks = habits.map((h) => calculateStreak(h.id));
    return Math.max(0, ...allStreaks);
  }, [habits, totalHabits, calculateStreak]);

  // Milestone tier and segment calculation
  const milestone = useMemo(() => {
    if (heroStreak < 7) {
      return {
        tier: tr.tracker.pathStarter || 'PATH STARTER',
        target: 7,
        daysTo: Math.max(0, 7 - heroStreak),
        progressInTier: heroStreak,
        totalInTier: 7,
      };
    } else if (heroStreak < 30) {
      return {
        tier: tr.tracker.habitStreaker || 'HABIT STREAKER',
        target: 30,
        daysTo: Math.max(0, 30 - heroStreak),
        progressInTier: heroStreak - 7,
        totalInTier: 23,
      };
    } else if (heroStreak < 100) {
      return {
        tier: tr.tracker.consistencyMaster || 'CONSISTENCY MASTER',
        target: 100,
        daysTo: Math.max(0, 100 - heroStreak),
        progressInTier: heroStreak - 30,
        totalInTier: 70,
      };
    }
    return {
      tier: tr.tracker.legendaryDiscipline || 'LEGENDARY DISCIPLINE',
      target: 365,
      daysTo: Math.max(0, 365 - heroStreak),
      progressInTier: heroStreak - 100,
      totalInTier: 265,
    };
  }, [heroStreak, tr]);

  // 7 skewed bars representation
  const skewedBars = useMemo(() => {
    const barsCount = 7;
    // Map progress in tier to 0..7 bars
    const filledCount = Math.min(
      barsCount,
      Math.max(
        0,
        milestone.target === 7
          ? heroStreak
          : Math.round((milestone.progressInTier / milestone.totalInTier) * barsCount)
      )
    );

    return Array.from({ length: barsCount }, (_, i) => {
      if (i < filledCount) return 'filled';
      if (i === filledCount && heroStreak > 0) return 'current';
      return 'empty';
    });
  }, [milestone, heroStreak]);

  // Conic gradient ring stops
  const ringStyle = useMemo(() => {
    const total = Math.max(1, totalHabits);
    const seg = 360 / total;
    const gap = 3.5;
    const stops: string[] = [];

    for (let i = 0; i < total; i++) {
      const a = (i * seg + gap / 2).toFixed(2);
      const b = ((i + 1) * seg - gap / 2).toFixed(2);
      const color = i < doneToday ? 'var(--blue)' : 'var(--ring-off)';
      stops.push(
        `transparent ${(i * seg).toFixed(2)}deg ${a}deg`,
        `${color} ${a}deg ${b}deg`,
        `transparent ${b}deg ${((i + 1) * seg).toFixed(2)}deg`
      );
    }
    const mask = 'radial-gradient(circle farthest-side, transparent 72px, #000 73px)';
    return {
      width: '180px',
      height: '180px',
      borderRadius: '50%',
      background: `conic-gradient(from 0deg, ${stops.join(',')})`,
      WebkitMask: mask,
      mask,
    };
  }, [totalHabits, doneToday]);

  // Greeting
  const greetingText = useMemo(() => {
    const hour = today.getHours();
    let g = tr.greeting?.morning || 'Good morning';
    if (hour >= 12 && hour < 18) {
      g = tr.greeting?.afternoon || 'Good afternoon';
    } else if (hour >= 18 || hour < 5) {
      g = tr.greeting?.evening || 'Good evening';
    }
    const fullName = profile?.display_name?.trim() || '';
    const firstName = fullName ? fullName.split(/\s+/)[0] : '';
    return firstName ? `${g}, ${firstName}.` : `${g}.`;
  }, [today, tr, profile?.display_name]);

  // Date Header string (e.g. SATURDAY · 21 NOV 2026)
  const dateHeader = useMemo(() => {
    const dayName = today.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US', {
      weekday: 'long',
    }).toUpperCase();
    const dayNum = today.getDate();
    const monthName = today.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US', {
      month: 'short',
    }).toUpperCase();
    const yearNum = today.getFullYear();
    return `${dayName} · ${dayNum} ${monthName} ${yearNum}`;
  }, [today, language]);

  const handleQuickCheck = (habitId: string) => {
    if (remainingToday.length === 1) {
      triggerFeedback('celebrate');
      setShowConfetti(true);
    } else {
      triggerFeedback('check');
    }
    if (onCheckHabit) {
      onCheckHabit(habitId, todayStr);
    } else {
      toggleCompletion(habitId, todayStr);
    }
  };

  if (totalHabits === 0) return null;

  return (
    <>
      {showConfetti && <ConfettiBurst onComplete={() => setShowConfetti(false)} />}

      <section
        aria-label="Today Hero"
        className="clip-chamfer-outer p-[1px] transition-all"
        style={{
          background: 'linear-gradient(135deg, var(--blue), var(--line-strong) 35%, var(--line) 70%, var(--line-strong))',
        }}
      >
        <div
          className="clip-chamfer-inner"
          style={{
            background: 'radial-gradient(720px 340px at 10% 0%, var(--blue-soft), transparent 70%), var(--panel)',
          }}
        >
          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.45fr)_auto_minmax(0,1fr)] gap-8 lg:gap-14 items-center p-6 sm:p-10 pb-8">
            
            {/* 1. Left: Date, Greeting, Quote, Recovery callout */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex items-center gap-3 text-[var(--blue-text)] text-xs font-semibold tracking-[0.18em]">
                <span className="w-7 h-[2px] bg-[var(--blue)] shadow-[0_0_10px_var(--blue-glow)]" />
                <span>{dateHeader}</span>
              </div>

              <h1 className="m-0 font-display font-semibold text-3xl sm:text-4xl lg:text-[46px] leading-[1.08] tracking-[-0.02em] text-[var(--text)]">
                {greetingText}
              </h1>

              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIdx}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.2 }}
                  className="m-0 text-sm sm:text-[17px] leading-relaxed text-[var(--text2)] max-w-[560px]"
                >
                  {tr.tracker.inspirational[quoteIdx]}
                </motion.p>
              </AnimatePresence>

              {/* Motivation callout */}
              <div className="flex items-center gap-3 p-3 px-4 max-w-[560px] border border-[var(--line-strong)] bg-[var(--blue-soft)] rounded-sm">
                {isAllDone ? (
                  <Sparkles size={20} className="text-[var(--blue-text)] flex-shrink-0" />
                ) : (
                  <Info size={20} className="text-[var(--blue-text)] flex-shrink-0" />
                )}
                <span className="text-xs sm:text-sm leading-snug text-[var(--text2)]">
                  {isAllDone ? (
                    <>
                      {tr.tracker.perfectDayBanner}{' '}
                      <strong className="text-[var(--text)] font-semibold">{tr.tracker.perfectDayBold}</strong>
                    </>
                  ) : missedYesterday ? (
                    <>
                      {tr.tracker.neverMissTwice}{' '}
                      <strong className="text-[var(--text)] font-semibold">{tr.tracker.neverMissTwiceBold}</strong>
                    </>
                  ) : (
                    <>
                      {tr.tracker.todayRemaining}: {remainingToday.length}.{' '}
                      <strong className="text-[var(--text)] font-semibold">{tr.greeting.encouragement}</strong>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* 2. Center: Segmented Progress Ring */}
            <div className="relative w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] mx-auto filter drop-shadow-[0_0_14px_var(--blue-glow)] flex items-center justify-center">
              {/* Dashed outer orbital ring */}
              <div className="absolute inset-[-14px] border border-dashed border-[var(--line-strong)] rounded-full opacity-80 pointer-events-none" />
              
              {/* Segmented Ring */}
              <div style={ringStyle} />

              {/* Center Counts */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <span className="font-display text-4xl sm:text-5xl font-bold leading-none text-[var(--text)]">
                  {doneToday}
                  <span className="text-xl sm:text-2xl text-[var(--muted)] font-normal">/{totalHabits}</span>
                </span>
                <span className="text-xs font-semibold tracking-[0.18em] text-[var(--text2)]">
                  {tr.tracker.doneTodayLabel}
                </span>
              </div>
            </div>

            {/* 3. Right: Streak & Next Milestone */}
            <div className="flex flex-col gap-6 sm:gap-7 min-w-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex items-center justify-center flex-shrink-0 border border-[var(--line-strong)] bg-[var(--blue-soft)]">
                  <Flame size={28} className="text-[var(--blue-text)] animate-flame" />
                </div>
                <div className="flex items-baseline gap-2.5">
                  <span className="font-display text-5xl sm:text-6xl font-bold leading-none text-[var(--text)]">
                    {heroStreak}
                  </span>
                  <span className="text-xs font-semibold tracking-[0.18em] text-[var(--text2)]">
                    {tr.tracker.dayStreakLabel}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="px-2.5 py-1 text-xs font-semibold tracking-[0.14em] text-[var(--blue-text)] border border-[var(--line-strong)] bg-[var(--blue-soft)]">
                    {milestone.tier}
                  </span>
                  <span className="text-xs sm:text-sm text-[var(--text2)]">
                    {milestone.daysTo === 1
                      ? `1 ${tr.tracker.days} ${tr.tracker.daysToMilestone} ${milestone.target}`
                      : `${milestone.daysTo} ${tr.tracker.days} ${tr.tracker.daysToMilestone} ${milestone.target}`}
                  </span>
                </div>

                {/* 7 skewed parallelogram bars */}
                <div className="flex gap-1.5 px-1">
                  {skewedBars.map((state, idx) => (
                    <div
                      key={idx}
                      className="flex-1 h-3 transform skew-x-[-20deg] box-border transition-all duration-300"
                      style={{
                        background:
                          state === 'filled'
                            ? 'var(--blue)'
                            : state === 'current'
                            ? 'var(--blue-soft)'
                            : 'var(--off)',
                        border:
                          state === 'filled'
                            ? 'none'
                            : state === 'current'
                            ? '1px solid var(--blue)'
                            : '1px solid var(--line-strong)',
                        boxShadow: state === 'filled' ? '0 0 10px var(--blue-glow)' : 'none',
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Bar: UP NEXT CHIPS */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap px-6 sm:px-10 py-4 border-t border-[var(--line)] bg-[var(--raised)]">
            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--muted)] flex-shrink-0">
              {isAllDone
                ? tr.tracker.allHabitsDone
                : `${tr.tracker.upNext} · ${remainingToday.length} ${tr.tracker.left}`}
            </span>

            <div className="flex items-center gap-2.5 flex-wrap flex-1">
              {remainingToday.slice(0, 5).map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => handleQuickCheck(h.id)}
                  aria-label={`${tr.tracker.checkHabit}: ${h.name}`}
                  className="flex items-center gap-2.5 h-[38px] px-3.5 border border-[var(--line-strong)] bg-[var(--panel)] hover:bg-[var(--blue-soft)] hover:border-[var(--blue)] transition-all cursor-pointer group text-left"
                >
                  <span
                    className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs"
                    style={{ color: h.color || 'var(--blue)' }}
                  >
                    <HabitIcon icon={h.icon} size={15} />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-[var(--text)] group-hover:text-[var(--blue-text)] transition-colors truncate max-w-[140px]">
                    {h.name}
                  </span>
                  <span className="w-4 h-4 border border-[var(--line-strong)] group-hover:border-[var(--blue)] flex items-center justify-center ml-1 bg-transparent">
                    <Check size={11} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                  </span>
                </button>
              ))}

              {isAllDone && (
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--blue-text)]">
                  <Sparkles size={16} />
                  <span>{tr.tracker.allDoneToday}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
