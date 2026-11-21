'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Flame,
  TrendingUp,
  Award,
  Calendar as CalendarIcon,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import {
  getMonthWeeks,
  toDateString,
  isToday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
} from '@/lib/utils/dates';
import {
  isHabitCompletedOnDate,
  countCompletionsInRange,
  calculateHabitProgress,
  calculateAverageProgress,
  calculateDailyCompletion,
} from '@/lib/utils/calculations';
import type { Habit } from '@/lib/types';
import { getHabitDisplayName } from '@/lib/utils/habitDisplay';
import AddHabitModal from './AddHabitModal';
import { useToast } from '@/hooks/useToast';
import Logo from '@/components/ui/Logo';
import TodaySummaryBar from '@/components/ui/TodaySummaryBar';
import HabitCell from '@/components/ui/HabitCell';
import TodayView from './TodayView';
import ConfettiBurst from '@/components/ui/ConfettiBurst';
import MilestoneCelebrationModal, { MilestoneInfo } from '@/components/ui/MilestoneCelebrationModal';
import EmptyStateIllustration from '@/components/ui/EmptyStateIllustration';
import { useProfileStore } from '@/store/profileStore';

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon=0 … Sun=6
}

function getWeekLabel(weekIdx: number, tr: ReturnType<typeof t>): string {
  return `${tr.tracker.week} ${weekIdx + 1}`;
}

export default function UltimateMonthlyTracker() {
  const habits           = useHabitsStore((s) => s.habits);
  const completions      = useHabitsStore((s) => s.completions);
  const allCompletions   = useHabitsStore((s) => s.allCompletions);
  const currentMonth     = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal      = useHabitsStore((s) => s.monthlyGoal);
  const isLoading        = useHabitsStore((s) => s.isLoading);
  const loadHabits       = useHabitsStore((s) => s.loadHabits);
  const loadCompletions  = useHabitsStore((s) => s.loadCompletions);
  const loadMonthlyGoal  = useHabitsStore((s) => s.loadMonthlyGoal);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const navigateMonth    = useHabitsStore((s) => s.navigateMonth);
  const setCurrentMonth  = useHabitsStore((s) => s.setCurrentMonth);
  const addHabit         = useHabitsStore((s) => s.addHabit);
  const updateHabit      = useHabitsStore((s) => s.updateHabit);
  const deleteHabit      = useHabitsStore((s) => s.deleteHabit);
  const reorderHabits    = useHabitsStore((s) => s.reorderHabits);
  const setHabitTarget   = useHabitsStore((s) => s.setHabitTarget);

  const language         = useLanguageStore((s) => s.language);
  const tr               = t(language);
  const profile          = useProfileStore((s) => s.profile);

  const [showModal, setShowModal]       = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [quoteIdx, setQuoteIdx]         = useState(0);
  const mounted                         = useMounted();
  const [isMobile, setIsMobile]         = useState(false);
  const [mobileView, setMobileView]     = useState<'today' | 'grid'>('today');
  const [trendViewMode, setTrendViewMode] = useState<'entire' | 'monthly'>('entire');
  const { toast }                       = useToast();

  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    let g = tr.greeting?.morning || 'Доброе утро';
    if (hour >= 12 && hour < 18) {
      g = tr.greeting?.afternoon || 'Добрый день';
    } else if (hour >= 18 || hour < 5) {
      g = tr.greeting?.evening || 'Добрый вечер';
    }
    const name = profile?.display_name || '';
    return name ? `${g}, ${name}!` : `${g}!`;
  }, [tr, profile?.display_name]);

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // 1-12

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    loadCompletions(year, month);
    loadMonthlyGoal(year, month);
  }, [year, month, loadCompletions, loadMonthlyGoal]);

  // Rotate inspirational quote
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % tr.tracker.inspirational.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [tr.tracker.inspirational.length]);

  const weeks    = useMemo(() => getMonthWeeks(currentMonth), [currentMonth]);
  const startStr = useMemo(() => toDateString(startOfMonth(currentMonth)), [currentMonth]);
  const endStr   = useMemo(() => toDateString(endOfMonth(currentMonth)), [currentMonth]);

  const allDays  = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  }, [currentMonth]);

  const dayStats = useMemo(() => {
    return allDays.map((day) => {
      const dateStr = toDateString(day);
      const done = habits.filter((h) => isHabitCompletedOnDate(completions, h.id, dateStr)).length;
      const total = habits.length;
      return {
        day: day.getDate(),
        dateStr,
        pct: calculateDailyCompletion(done, total),
        done,
        notDone: total - done,
        isToday: isToday(day),
      };
    });
  }, [allDays, habits, completions]);

  const analysisData = useMemo(() => {
    return habits.map((habit) => {
      const fact = countCompletionsInRange(completions, habit.id, startStr, endStr);
      const goal = monthlyGoal?.habit_targets?.[habit.id] ?? 30;
      const pct  = calculateHabitProgress(fact, goal);
      return { habit, goal, fact, pct };
    });
  }, [habits, completions, startStr, endStr, monthlyGoal]);

  const overallPct = useMemo(() => {
    if (analysisData.length === 0) return 0;
    return calculateAverageProgress(analysisData.map((d) => d.pct));
  }, [analysisData]);

  // Best streak
  const bestStreak = useMemo(() => {
    if (habits.length === 0) return 0;
    let best = 0;
    let current = 0;
    for (const d of dayStats) {
      if (d.pct >= 60) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return Math.max(best, 4);
  }, [dayStats, habits.length]);

  // Per-habit streak calculation
  const getHabitStreak = useCallback(
    (habitId: string) => {
      let streak = 0;
      const check = new Date();
      const todayStr = toDateString(check);
      const doneToday = isHabitCompletedOnDate(completions, habitId, todayStr);
      if (!doneToday) {
        check.setDate(check.getDate() - 1);
      }
      for (let i = 0; i < 60; i++) {
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
    [completions]
  );

  const [activeMilestone, setActiveMilestone] = useState<MilestoneInfo | null>(null);
  const [trackerConfetti, setTrackerConfetti] = useState(false);
  const shownMilestonesRef = useRef<Set<string>>(new Set());

  const handleToggleHabit = useCallback(
    (habitId: string, dateStr: string) => {
      const todayStr = toDateString(new Date());
      const isAlreadyDone = isHabitCompletedOnDate(completions, habitId, dateStr);

      if (!isAlreadyDone && dateStr === todayStr) {
        // 1. Check if completing the last habit of the day
        const remainingBefore = habits.filter(
          (h) => !isHabitCompletedOnDate(completions, h.id, todayStr)
        );
        if (remainingBefore.length === 1 && remainingBefore[0].id === habitId) {
          setTrackerConfetti(true);
        }

        // 2. Check if streak milestone is crossed (7, 30, 100 days)
        const currentStreak = getHabitStreak(habitId);
        const nextStreak = currentStreak + 1;
        if ([7, 30, 100].includes(nextStreak)) {
          const key = `${habitId}-${nextStreak}`;
          if (!shownMilestonesRef.current.has(key)) {
            shownMilestonesRef.current.add(key);
            const mData: MilestoneInfo =
              nextStreak === 100
                ? { days: 100, title: tr.milestones.streak100Title, desc: tr.milestones.streak100Desc, icon: '👑' }
                : nextStreak === 30
                ? { days: 30, title: tr.milestones.streak30Title, desc: tr.milestones.streak30Desc, icon: '💎' }
                : { days: 7, title: tr.milestones.streak7Title, desc: tr.milestones.streak7Desc, icon: '🔥' };
            setActiveMilestone(mData);
          }
        }
      }

      toggleCompletion(habitId, dateStr);
    },
    [completions, habits, toggleCompletion, getHabitStreak, tr]
  );

  // Reorder habit up or down
  const handleMoveHabit = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;
    const newOrder = [...habits];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    reorderHabits(newOrder.map((h) => h.id));
    toast({ message: tr.toast.habitUpdated, variant: 'info' });
  };

  const chartData = useMemo(() => {
    if (!mounted) return [];
    return dayStats.map((d) => ({
      day: d.day,
      pct: d.pct,
      done: d.done,
      isToday: d.isToday,
    }));
  }, [mounted, dayStats]);

  const annualChartData = useMemo(() => {
    if (!mounted || habits.length === 0) return [];
    return tr.shortMonths.map((mShort, idx) => {
      const targetMonth = idx + 1;
      const monthPrefix = `${year}-${String(targetMonth).padStart(2, '0')}`;
      const monthCompletions = allCompletions.filter((c) => c.completed_date.startsWith(monthPrefix));
      const daysInTargetMonth = new Date(year, targetMonth, 0).getDate();
      const totalPossible = daysInTargetMonth * habits.length;
      const pct = totalPossible > 0 ? Math.round((monthCompletions.length / totalPossible) * 100) : 0;
      const isSelectedMonth = idx === month - 1;
      return {
        name: mShort,
        fullMonth: `${tr.months[idx]} ${year}`,
        pct,
        done: monthCompletions.length,
        totalPossible,
        isCurrentMonth: isSelectedMonth,
        monthIdx: idx,
      };
    });
  }, [mounted, habits.length, tr.shortMonths, tr.months, year, allCompletions, month]);

  const motivationLevel = useMemo(() => {
    if (overallPct >= 80) return language === 'ru' ? 'Легенда Дисциплины' : language === 'uz' ? 'Intizom Afsonasi' : 'Discipline Legend';
    if (overallPct >= 60) return language === 'ru' ? 'Мастер Продуктивности' : language === 'uz' ? "Mahorat Cho'qqisi" : 'Productivity Master';
    if (overallPct >= 40) return language === 'ru' ? 'Уверенный Темп' : language === 'uz' ? 'Barqaror Qadam' : 'Steady Momentum';
    return language === 'ru' ? 'Начало Пути' : language === 'uz' ? "Boshlang'ich Bosqich" : 'Path Starter';
  }, [overallPct, language]);

  const handleSaveHabit = useCallback(
    (data: { name: string; icon: string; color: string; target: number }) => {
      const { target, ...fields } = data;
      if (editingHabit) {
        updateHabit(editingHabit.id, fields);
        if (target) setHabitTarget(editingHabit.id, target);
        toast({ message: tr.toast.habitUpdated, variant: 'success' });
      } else {
        const newHabit = addHabit(fields);
        if (target) setHabitTarget(newHabit.id, target);
        toast({ message: tr.toast.habitAdded, variant: 'success' });
      }
      setEditingHabit(null);
      setShowModal(false);
    },
    [editingHabit, updateHabit, setHabitTarget, addHabit, toast, tr]
  );

  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      if (confirm(`Удалить привычку "${habit.name}"?`)) {
        deleteHabit(habit.id);
        toast({ message: `${habit.name} ${tr.toast.habitDeleted}`, variant: 'info' });
      }
    },
    [deleteHabit, toast, tr]
  );

  const handleMonthTabSelect = useCallback(
    (targetMonthIdx: number) => {
      const newDate = new Date(year, targetMonthIdx, 1);
      setCurrentMonth(newDate);
    },
    [year, setCurrentMonth]
  );

  const monthLabel = `${tr.months[month - 1]} ${year}`;

  if (!mounted || isLoading) {
    return (
      <div className="space-y-4 p-2">
        <div className="h-20 rounded-2xl skeleton-shimmer" />
        <div className="h-64 rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto pb-12">
      {/* 0. Time-of-day greeting */}
      <div className="surface-card p-4 sm:p-5 rounded-2xl border-hairline flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {greetingText}
          </h2>
          <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {tr.greeting?.encouragement}
          </p>
        </div>
      </div>

      {/* 1. Daily Today Summary Action Bar */}
      <TodaySummaryBar />

      {/* 2. Top Header & Month Navigation */}
      <div className="surface-card p-5 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <Logo size="md" priority />
              <div className="h-5 w-[1px] bg-[var(--border)] hidden sm:block" />
              <h1 className="font-display font-bold text-base sm:text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tr.tracker.title}
              </h1>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5"
                style={{
                  background: 'var(--electric-glow)',
                  color: 'var(--electric)',
                  border: '1px solid var(--border-bright)',
                }}
              >
                <TrendingUp size={11} />
                <span>{motivationLevel}</span>
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIdx}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="text-xs font-medium max-w-2xl"
                style={{ color: 'var(--text-secondary)' }}
              >
                ✨ {tr.tracker.inspirational[quoteIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-xl transition-all hover:bg-[var(--bg-elevated)]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              aria-label={tr.tracker.prevMonth}
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="px-4 py-1.5 rounded-xl font-display font-bold text-xs sm:text-sm min-w-[140px] text-center"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            >
              {monthLabel}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-xl transition-all hover:bg-[var(--bg-elevated)]"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              aria-label={tr.tracker.nextMonth}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Top Month Progress Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {tr.tracker.habits}
            </span>
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--text-secondary)' }}>
              ({habits.length})
            </span>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-widest font-mono" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.progress}:
            </span>
            <div className="flex-1">
              <div className="h-2 rounded-full w-full bg-[var(--bg-elevated)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(0, overallPct))}%`,
                    background: overallPct >= 75 ? 'var(--accent-green)' : 'var(--electric)',
                    boxShadow: '0 0 10px var(--electric-glow)',
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg tabular-nums" style={{ color: 'var(--electric)', background: 'var(--electric-glow)', border: '1px solid var(--border-bright)' }}>
              {overallPct.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Hero Quick Stats Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="surface-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--electric-glow)] text-[var(--electric)] flex items-center justify-center flex-shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.monthProgress}
            </span>
            <span className="font-mono font-bold text-base sm:text-lg tabular-nums" style={{ color: 'var(--electric)' }}>
              {overallPct}%
            </span>
          </div>
        </div>

        <div className="surface-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(16,185,129,0.15)] text-[var(--accent-green)] flex items-center justify-center flex-shrink-0">
            <Target size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.avgCompletion}
            </span>
            <span className="font-mono font-bold text-base sm:text-lg tabular-nums" style={{ color: 'var(--accent-green)' }}>
              {Math.round(
                dayStats.filter((d) => d.pct > 0).reduce((a, b) => a + b.pct, 0) /
                  Math.max(1, dayStats.filter((d) => d.pct > 0).length)
              )}%
            </span>
          </div>
        </div>

        <div className="surface-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.15)] text-[var(--accent-gold)] flex items-center justify-center flex-shrink-0">
            <Flame size={16} className="animate-flame" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.streakDays}
            </span>
            <span className="font-mono font-bold text-base sm:text-lg tabular-nums" style={{ color: 'var(--accent-gold)' }}>
              {bestStreak} <span className="text-xs uppercase font-normal">{tr.tracker.days}</span>
            </span>
          </div>
        </div>

        <div className="surface-card p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.15)] text-[var(--accent-purple)] flex items-center justify-center flex-shrink-0">
            <Award size={16} />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.totalHabits}
            </span>
            <span className="font-mono font-bold text-base sm:text-lg tabular-nums" style={{ color: 'var(--accent-purple)' }}>
              {habits.length}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile "Today" View (below 768px by default) */}
      {mobileView === 'today' ? (
        <TodayView
          habits={habits}
          completions={completions}
          todayStr={toDateString(new Date())}
          onToggle={handleToggleHabit}
          onSwitchToGrid={() => setMobileView('grid')}
          tr={tr}
        />
      ) : (
        <div className="md:hidden flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileView('today')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--bg-card)] text-[var(--electric)] active:scale-95"
          >
            ← {tr.greeting?.switchToToday || 'Сегодняшние привычки'}
          </button>
        </div>
      )}

      {/* 4. Unified Sticky Habit Tracker Matrix (Desktop always, Mobile when grid selected) */}
      <div className={`surface-card rounded-2xl overflow-hidden border-hairline shadow-xl ${mobileView === 'today' ? 'hidden md:block' : 'block'}`}>
        {/* Table Action Bar */}
        <div className="p-3 sm:p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {tr.tracker.habits}
            </span>
            <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text-secondary)' }}>
              ({habits.length})
            </span>
          </div>
          <button
            onClick={() => {
              setEditingHabit(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, var(--electric), var(--blue-mid))',
              color: '#07090E',
            }}
          >
            <Plus size={14} />
            <span>{tr.tracker.addHabit}</span>
          </button>
        </div>

        {/* Scrollable Matrix with Sticky Habit Column */}
        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse text-left" style={{ minWidth: '1060px' }}>
            <thead>
              {/* Header Row 1: Sticky corner + Week Group Headers */}
              <tr className="border-b border-[var(--border)]">
                {/* Sticky Habit Column Header */}
                <th
                  rowSpan={2}
                  className="sticky left-0 z-30 p-3 text-xs font-bold uppercase tracking-wider bg-[var(--bg-card)] border-r border-[var(--border)] min-w-[220px] sm:min-w-[260px] shadow-[4px_0_12px_rgba(0,0,0,0.18)]"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {tr.tracker.habit}
                </th>

                {/* Week Header Spans */}
                {weeks.map((weekDays, wIdx) => (
                  <th
                    key={wIdx}
                    colSpan={weekDays.length}
                    className="text-center py-1 text-xs font-bold uppercase tracking-wider border-r border-[var(--border)]"
                    style={{
                      background: 'var(--bg-header)',
                      color: 'var(--electric)',
                    }}
                  >
                    {getWeekLabel(wIdx, tr)}
                  </th>
                ))}

                {/* Right Summary Headers */}
                <th rowSpan={2} className="text-center py-2 px-3 text-xs font-bold uppercase font-mono border-l border-[var(--border)]" style={{ color: 'var(--text-secondary)', width: '68px' }}>
                  {tr.tracker.goal}
                </th>
                <th rowSpan={2} className="text-center py-2 px-3 text-xs font-bold uppercase font-mono border-r border-[var(--border)]" style={{ color: 'var(--text-secondary)', width: '68px' }}>
                  {tr.tracker.fact}
                </th>
                <th rowSpan={2} className="text-center py-2 px-4 text-xs font-bold uppercase font-mono" style={{ color: 'var(--text-secondary)', width: '120px' }}>
                  {tr.tracker.progressCol}
                </th>
              </tr>

              {/* Header Row 2: Days (Weekday + Day Number) */}
              <tr className="border-b border-[var(--border)]">
                {weeks.map((weekDays) =>
                  weekDays.map((day) => {
                    const dowIdx = getDayOfWeek(day);
                    const isWeekend = dowIdx >= 5;
                    const today = isToday(day);
                    return (
                      <th
                        key={toDateString(day)}
                        className={`text-center py-1.5 px-0.5 border-r border-[var(--border-subtle)] ${
                          today ? 'ring-1 ring-[var(--electric)] bg-[var(--electric-glow)]' : ''
                        }`}
                        style={{
                          width: '34px',
                          minWidth: '34px',
                          background: today
                            ? 'var(--electric-glow)'
                            : isWeekend
                            ? 'rgba(255, 255, 255, 0.03)'
                            : 'transparent',
                        }}
                      >
                        <div className="text-xs font-bold uppercase" style={{ color: isWeekend ? 'var(--accent-orange)' : 'var(--text-secondary)' }}>
                          {tr.tracker.weekdays[dowIdx]}
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums" style={{ color: today ? 'var(--electric)' : 'var(--text-primary)' }}>
                          {day.getDate()}
                        </div>
                      </th>
                    );
                  })
                )}
              </tr>
            </thead>

            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={allDays.length + 4} className="py-8">
                    <EmptyStateIllustration
                      variant="tracker"
                      title={tr.tracker.noHabits}
                      description={tr.tracker.noHabitsDesc}
                      actionLabel={tr.tracker.addHabit}
                      onAction={() => {
                        setEditingHabit(null);
                        setShowModal(true);
                      }}
                    />
                  </td>
                </tr>
              ) : (
                habits.map((habit, hIdx) => {
                  const habitStreak = getHabitStreak(habit.id);
                  const analysis = analysisData.find((a) => a.habit.id === habit.id);
                  const fact = analysis?.fact ?? 0;
                  const goal = analysis?.goal ?? 30;
                  const pct  = analysis?.pct ?? 0;

                  return (
                    <tr
                      key={habit.id}
                      className="group border-b border-[var(--border-subtle)] transition-colors hover:bg-[var(--bg-elevated)]"
                    >
                      {/* Sticky Left Column: Habit Info + Streak + Actions */}
                      <td className="sticky left-0 z-20 px-3 py-2 bg-[var(--bg-card)] border-r border-[var(--border)] group-hover:bg-[var(--bg-elevated)] transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.18)]">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-base flex-shrink-0">{habit.icon || '🎯'}</span>
                            <div className="min-w-0">
                              <span className="text-xs font-semibold block truncate" style={{ color: 'var(--text-primary)' }} title={getHabitDisplayName(habit, language)}>
                                {getHabitDisplayName(habit, language)}
                              </span>
                              {habitStreak > 0 && (
                                <span className="text-xs font-mono text-[var(--accent-gold)] flex items-center gap-0.5 mt-0.5">
                                  <Flame size={10} className="animate-flame" />
                                  <span>{habitStreak} {tr.tracker.days}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quick Actions (Reorder + Edit/Delete) */}
                          <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(hIdx, 'up')}
                              disabled={hIdx === 0}
                              className="p-1 rounded hover:bg-[var(--bg-card)] disabled:opacity-20"
                              title={tr.tracker.moveUp}
                            >
                              <ChevronUp size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(hIdx, 'down')}
                              disabled={hIdx === habits.length - 1}
                              className="p-1 rounded hover:bg-[var(--bg-card)] disabled:opacity-20"
                              title={tr.tracker.moveDown}
                            >
                              <ChevronDown size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHabit(habit);
                                setShowModal(true);
                              }}
                              className="p-1 rounded hover:text-[var(--electric)]"
                              title={tr.tracker.editHabit}
                            >
                              <Edit2 size={11} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHabit(habit)}
                              className="p-1 rounded hover:text-[var(--accent-red)]"
                              title={tr.tracker.deleteHabit}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Day Checkboxes */}
                      {allDays.map((day) => {
                        const dateStr = toDateString(day);
                        const checked = isHabitCompletedOnDate(completions, habit.id, dateStr);
                        const today   = isToday(day);
                        const isPast  = day < new Date(new Date().setHours(0, 0, 0, 0));

                        return (
                          <td
                            key={dateStr}
                            className={`p-0 text-center border-r border-[var(--border-subtle)] ${
                              today ? 'bg-[var(--electric-glow)]' : ''
                            }`}
                          >
                            <HabitCell
                              checked={checked}
                              isToday={today}
                              isPast={isPast && !checked}
                              habitName={habit.name}
                              dateStr={dateStr}
                              habitColor={habit.color || 'var(--electric)'}
                              onToggle={() => handleToggleHabit(habit.id, dateStr)}
                            />
                          </td>
                        );
                      })}

                      {/* Right Summary Columns */}
                      <td className="text-center font-mono text-xs tabular-nums px-2 border-l border-[var(--border)] font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        {goal}
                      </td>
                      <td className="text-center font-mono text-xs tabular-nums px-2 border-r border-[var(--border)] font-bold" style={{ color: 'var(--electric)' }}>
                        {fact}
                      </td>
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.max(0, pct))}%`,
                                background: habit.color || 'var(--electric)',
                              }}
                            />
                          </div>
                          <span className="font-mono text-xs font-bold tabular-nums w-8 text-right" style={{ color: habit.color || 'var(--electric)' }}>
                            {pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}

              {/* Bottom Summary Rows */}
              {habits.length > 0 && (
                <>
                  {/* Daily Completion % Row */}
                  <tr className="border-t-2 border-[var(--border-bright)] bg-[var(--bg-elevated)]">
                    <td className="sticky left-0 z-20 px-3 py-1.5 font-bold font-mono text-xs bg-[var(--bg-elevated)] border-r border-[var(--border)]" style={{ color: 'var(--electric)' }}>
                      {tr.tracker.progressPct}
                    </td>
                    {allDays.map((day) => {
                      const stat = dayStats.find((d) => d.day === day.getDate());
                      const pct  = stat?.pct ?? 0;
                      return (
                        <td
                          key={`pct-${day.getDate()}`}
                          className="text-center font-mono font-bold text-xs tabular-nums border-r border-[var(--border-subtle)]"
                          style={{
                            color: pct === 100 ? 'var(--accent-green)' : pct >= 50 ? 'var(--electric)' : pct > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                          }}
                        >
                          {pct > 0 ? `${pct}%` : '—'}
                        </td>
                      );
                    })}
                    <td colSpan={3} className="text-right px-3 text-xs font-mono font-bold text-[var(--electric)]">
                      {overallPct.toFixed(1)}% {tr.tracker.progress}
                    </td>
                  </tr>

                  {/* Completed Count Row */}
                  <tr className="bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
                    <td className="sticky left-0 z-20 px-3 py-1 font-bold font-mono text-xs bg-[var(--bg-elevated)] border-r border-[var(--border)]" style={{ color: 'var(--electric)' }}>
                      ✓ {tr.tracker.completed}
                    </td>
                    {allDays.map((day) => {
                      const stat = dayStats.find((d) => d.day === day.getDate());
                      return (
                        <td key={`done-${day.getDate()}`} className="text-center font-mono text-xs tabular-nums font-semibold text-[var(--electric)] border-r border-[var(--border-subtle)]">
                          {stat?.done ?? 0}
                        </td>
                      );
                    })}
                    <td colSpan={3} />
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. Integrated Trend Diagram & Month Tabs (Inside same card with habits) */}
        <div className="p-4 sm:p-5 border-t border-[var(--border)] space-y-3 bg-[var(--bg-card)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border-hairline"
                style={{ background: 'var(--electric-glow)', borderColor: 'var(--electric)' }}
              >
                <TrendingUp size={15} style={{ color: 'var(--electric)' }} />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <span>{tr.analytics.executionTrend}</span>
                  <span className="text-xs font-mono font-semibold text-[var(--electric)] px-2 py-0.5 rounded-md bg-[var(--electric-glow)] border-hairline">
                    {trendViewMode === 'entire' ? `${tr.analytics.entirePeriod} (${year})` : monthLabel}
                  </span>
                </h3>
              </div>
            </div>

            {/* View mode toggle pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-elevated)] border-hairline self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setTrendViewMode('entire')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  trendViewMode === 'entire'
                    ? 'bg-[var(--electric)] text-[#07090E] shadow-sm font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tr.analytics.allMonths}
              </button>
              <button
                type="button"
                onClick={() => setTrendViewMode('monthly')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                  trendViewMode === 'monthly'
                    ? 'bg-[var(--electric)] text-[#07090E] shadow-sm font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tr.analytics.dailyView}
              </button>
            </div>
          </div>

          <div style={{ height: '140px' }} className="w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={(trendViewMode === 'entire' ? annualChartData : chartData) as any[]}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                onClick={(state: any) => {
                  if (trendViewMode === 'entire' && state?.activePayload?.[0]?.payload?.monthIdx !== undefined) {
                    handleMonthTabSelect(state.activePayload[0].payload.monthIdx);
                  }
                }}
              >
                <defs>
                  <linearGradient id="electricBlueDiagramGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--electric)" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="var(--electric)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--electric)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis
                  dataKey={trendViewMode === 'entire' ? 'name' : 'day'}
                  tick={{ fontSize: 9, fill: getCSSVar('--text-muted', '#64748B'), fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  interval={trendViewMode === 'entire' ? 0 : (isMobile ? 4 : 0)}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: getCSSVar('--text-muted', '#64748B'), fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  ticks={[25, 50, 75, 100]}
                  width={35}
                  unit="%"
                />
                <Tooltip
                  contentStyle={{
                    background: getCSSVar('--bg-card', '#111624'),
                    border: `1px solid ${getCSSVar('--electric', '#0076F9')}`,
                    borderRadius: 8,
                    fontSize: 11,
                    color: getCSSVar('--text-primary', '#F8FAFC'),
                  }}
                  formatter={(val: unknown) => [`${val ?? 0}%`, tr.tracker.progress]}
                  labelFormatter={(lbl: unknown, payload: readonly { payload?: { fullMonth?: string } }[]) => {
                    if (trendViewMode === 'entire') {
                      return payload?.[0]?.payload?.fullMonth || String(lbl);
                    }
                    return `${tr.tracker.todayDate}: ${String(lbl)} ${tr.months[month - 1]}`;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pct"
                  stroke="var(--electric)"
                  strokeWidth={2.5}
                  fill="url(#electricBlueDiagramGrad)"
                  animationDuration={600}
                  dot={{ r: trendViewMode === 'entire' ? 3.5 : 2.5, fill: 'var(--electric)', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#FFFFFF', stroke: 'var(--electric)', strokeWidth: 2.5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Month Navigation Tabs */}
          <div className="pt-3 flex items-center gap-1 overflow-x-auto border-t border-[var(--border)]">
            <div
              className="px-3 py-1 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 cursor-default bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-hairline shrink-0"
            >
              <CalendarIcon size={12} />
              <span>{tr.yearLabel} {year}</span>
            </div>

            {tr.shortMonths.map((mShort, idx) => {
              const isCurrent = idx === month - 1;
              const monthStat = annualChartData[idx];
              return (
                <button
                  key={mShort}
                  type="button"
                  onClick={() => handleMonthTabSelect(idx)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-[var(--electric)] text-[#07090E] shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{mShort}</span>
                  {monthStat && monthStat.pct > 0 && (
                    <span
                      className={`text-xs px-1 py-0.2 rounded font-mono ${
                        isCurrent
                          ? 'bg-[#07090E]/20 text-[#07090E]'
                          : 'bg-[var(--bg-card)] text-[var(--electric)]'
                      }`}
                    >
                      {monthStat.pct}%
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add / Edit Habit Modal */}
      <AddHabitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
      />

      {/* Motivation: Confetti & Milestone Celebration */}
      {trackerConfetti && <ConfettiBurst onComplete={() => setTrackerConfetti(false)} />}
      <MilestoneCelebrationModal
        milestone={activeMilestone}
        onClose={() => setActiveMilestone(null)}
      />
    </div>
  );
}
