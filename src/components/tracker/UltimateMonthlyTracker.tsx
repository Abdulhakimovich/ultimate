'use client';

import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useMounted } from '@/hooks/useMounted';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  ChevronUp,
  ChevronDown,
  Edit2,
  Trash2,
  Check,
  MoreHorizontal,
} from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import {
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
import TodayHero from './TodayHero';
import MonthStatsCards from './MonthStatsCards';
import HabitCell from '@/components/ui/HabitCell';
import HabitIcon from '@/components/ui/HabitIcon';
import { formatDays } from '@/lib/utils/plural';
import TodayView from './TodayView';
import ConfettiBurst from '@/components/ui/ConfettiBurst';
import MilestoneCelebrationModal, { MilestoneInfo } from '@/components/ui/MilestoneCelebrationModal';
import EmptyStateIllustration from '@/components/ui/EmptyStateIllustration';

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon=0 … Sun=6
}

export default function UltimateMonthlyTracker() {
  const habits           = useHabitsStore((s) => s.habits);
  const completions      = useHabitsStore((s) => s.completions);
  const currentMonth     = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal      = useHabitsStore((s) => s.monthlyGoal);
  const isLoading        = useHabitsStore((s) => s.isLoading);
  const loadHabits       = useHabitsStore((s) => s.loadHabits);
  const loadCompletions  = useHabitsStore((s) => s.loadCompletions);
  const loadMonthlyGoal  = useHabitsStore((s) => s.loadMonthlyGoal);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const navigateMonth    = useHabitsStore((s) => s.navigateMonth);
  const addHabit         = useHabitsStore((s) => s.addHabit);
  const updateHabit      = useHabitsStore((s) => s.updateHabit);
  const deleteHabit      = useHabitsStore((s) => s.deleteHabit);
  const reorderHabits    = useHabitsStore((s) => s.reorderHabits);
  const setHabitTarget   = useHabitsStore((s) => s.setHabitTarget);

  const language         = useLanguageStore((s) => s.language);
  const tr               = t(language);

  const [showModal, setShowModal]       = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const mounted                         = useMounted();
  const [mobileView, setMobileView]     = useState<'today' | 'grid'>('today');
  const [mobileMenuHabitId, setMobileMenuHabitId] = useState<string | null>(null);
  const { toast }                       = useToast();

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // 1-12

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    loadCompletions(year, month);
    loadMonthlyGoal(year, month);
  }, [year, month, loadCompletions, loadMonthlyGoal]);

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
      {/* 1. Today Hero (Single Unified Motivation Center) */}
      <TodayHero onCheckHabit={handleToggleHabit} />

      {/* 2. Month Statistics Cards */}
      <MonthStatsCards />

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

      {/* 3. Unified Sticky Habit Tracker Matrix (Desktop always, Mobile when grid selected) */}
      <div className={`cyber-card overflow-hidden transition-all ${mobileView === 'today' ? 'hidden md:block' : 'block'}`}>
        {/* Table Action Bar */}
        <div className="flex items-center justify-between gap-6 flex-wrap p-5 sm:p-6 border-b border-[var(--line)] bg-[var(--panel)]">
          <div className="flex items-center gap-3.5">
            <h2 className="m-0 font-display text-xl sm:text-2xl font-semibold tracking-[-0.01em] text-[var(--text)]">
              {tr.tracker.habits}
            </h2>
            <span className="px-2.5 py-0.5 font-display text-sm font-bold text-[var(--blue-text)] border border-[var(--line-strong)] bg-[var(--blue-soft)]">
              {habits.length}
            </span>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 flex items-center justify-center border border-[var(--line-strong)] bg-transparent text-[var(--text)] hover:bg-[var(--blue-soft)] transition-colors cursor-pointer"
              aria-label={tr.tracker.prevMonth}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="min-w-[170px] text-center font-display text-sm sm:text-base font-semibold tracking-[0.14em] text-[var(--text)] uppercase">
              {monthLabel}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 flex items-center justify-center border border-[var(--line-strong)] bg-transparent text-[var(--text)] hover:bg-[var(--blue-soft)] transition-colors cursor-pointer"
              aria-label={tr.tracker.nextMonth}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Chamfered Add Habit Button */}
          <div className="filter drop-shadow-[0_0_14px_var(--blue-glow)]">
            <button
              type="button"
              onClick={() => {
                setEditingHabit(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2.5 h-11 px-5 bg-[var(--blue)] border-0 text-[#FFFFFF] text-xs sm:text-sm font-semibold tracking-[0.14em] cursor-pointer clip-chamfer-btn hover:brightness-110 active:scale-95 transition-all"
            >
              <Plus size={16} strokeWidth={2.4} />
              <span>{tr.tracker.addHabit.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Scrollable Matrix with Sticky Habit Column */}
        <div className="overflow-x-auto relative">
          <table className="w-full border-collapse text-left" style={{ minWidth: '1140px' }}>
            <thead>
              {/* Header: HABIT, Days 1..N, DONE */}
              <tr className="border-b border-[var(--line)]">
                <th
                  className="sticky left-0 z-30 px-4 py-4 text-xs font-semibold tracking-[0.16em] uppercase bg-[var(--panel)] border-r border-[var(--line)] min-w-[220px] sm:min-w-[240px] text-[var(--muted)] shadow-[4px_0_12px_rgba(0,0,0,0.18)]"
                >
                  {tr.tracker.habit}
                </th>

                {allDays.map((day) => {
                  const dowIdx = getDayOfWeek(day);
                  const isWeekend = dowIdx >= 5;
                  const today = isToday(day);
                  return (
                    <th
                      key={toDateString(day)}
                      className={`text-center py-3 px-1 border-r border-[var(--line)] ${
                        today ? 'bg-[var(--blue-soft)]' : ''
                      }`}
                      style={{
                        width: '36px',
                        minWidth: '36px',
                      }}
                    >
                      <div
                        className="text-xs font-semibold uppercase mb-1"
                        style={{ color: isWeekend ? 'var(--weekend)' : 'var(--text2)' }}
                      >
                        {tr.tracker.weekdays[dowIdx]}
                      </div>
                      <div
                        className={`text-xs font-display font-semibold mx-auto w-6 h-6 flex items-center justify-center rounded-sm ${
                          today
                            ? 'bg-[var(--blue)] text-[#FFFFFF] shadow-[0_0_10px_var(--blue-glow)] font-bold'
                            : 'text-[var(--text)]'
                        }`}
                      >
                        {day.getDate()}
                      </div>
                    </th>
                  );
                })}

                <th className="text-right py-4 px-4 text-xs font-semibold tracking-[0.16em] uppercase text-[var(--muted)] min-w-[130px]">
                  {tr.tracker.completed.toUpperCase()}
                </th>
              </tr>
            </thead>

            <tbody>
              {habits.length === 0 ? (
                <tr>
                  <td colSpan={allDays.length + 2} className="py-12">
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
                  const goal = analysis?.goal ?? allDays.length;

                  return (
                    <tr
                      key={habit.id}
                      className="group border-b border-[var(--line)] transition-colors hover:bg-[var(--raised)]"
                    >
                      {/* Sticky Left Column: Habit Info + Streak + Actions */}
                      <td className="sticky left-0 z-20 px-4 py-3 bg-[var(--panel)] border-r border-[var(--line)] group-hover:bg-[var(--raised)] transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.18)]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-[30px] h-[30px] flex items-center justify-center shrink-0 border border-[var(--line-strong)] bg-[var(--blue-soft)]"
                              style={{ color: habit.color || 'var(--blue)' }}
                            >
                              <HabitIcon icon={habit.icon || 'target'} size={16} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-sm sm:text-[15px] font-medium block truncate text-[var(--text)]" title={getHabitDisplayName(habit, language)}>
                                {getHabitDisplayName(habit, language)}
                              </span>
                              {habitStreak > 0 && (
                                <span className="text-xs text-[var(--text2)] flex items-center gap-1 mt-0.5">
                                  <Flame size={12} className="text-[var(--blue-text)] animate-flame" />
                                  <span>{formatDays(habitStreak, language)}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Desktop Quick Actions (visible on hover/focus) */}
                          <div className="hidden sm:flex items-center gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(hIdx, 'up')}
                              disabled={hIdx === 0}
                              className="p-1 rounded hover:bg-[var(--line)] disabled:opacity-20 text-[var(--text2)] hover:text-[var(--text)] transition-colors"
                              title={tr.tracker.moveUp}
                            >
                              <ChevronUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHabit(hIdx, 'down')}
                              disabled={hIdx === habits.length - 1}
                              className="p-1 rounded hover:bg-[var(--line)] disabled:opacity-20 text-[var(--text2)] hover:text-[var(--text)] transition-colors"
                              title={tr.tracker.moveDown}
                            >
                              <ChevronDown size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingHabit(habit);
                                setShowModal(true);
                              }}
                              className="p-1 rounded hover:bg-[var(--line)] text-[var(--text2)] hover:text-[var(--blue-text)] transition-colors"
                              title={tr.tracker.editHabit}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHabit(habit)}
                              className="p-1 rounded hover:bg-[var(--line)] text-[var(--text2)] hover:text-[var(--accent-red)] transition-colors"
                              title={tr.tracker.deleteHabit}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Mobile Touch Menu ("⋯") */}
                          <div className="sm:hidden relative">
                            <button
                              type="button"
                              onClick={() => setMobileMenuHabitId(mobileMenuHabitId === habit.id ? null : habit.id)}
                              className="p-1.5 rounded text-[var(--text2)] hover:text-[var(--text)] active:bg-[var(--line)] transition-colors"
                              aria-label={tr.tracker.editHabit}
                            >
                              <MoreHorizontal size={15} />
                            </button>
                            {mobileMenuHabitId === habit.id && (
                              <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--panel)] border border-[var(--line-strong)] rounded-xl shadow-2xl py-1.5 min-w-[140px] flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleMoveHabit(hIdx, 'up');
                                    setMobileMenuHabitId(null);
                                  }}
                                  disabled={hIdx === 0}
                                  className="px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-[var(--raised)] disabled:opacity-30 text-[var(--text)]"
                                >
                                  <ChevronUp size={13} /> {tr.tracker.moveUp}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleMoveHabit(hIdx, 'down');
                                    setMobileMenuHabitId(null);
                                  }}
                                  disabled={hIdx === habits.length - 1}
                                  className="px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-[var(--raised)] disabled:opacity-30 text-[var(--text)]"
                                >
                                  <ChevronDown size={13} /> {tr.tracker.moveDown}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingHabit(habit);
                                    setShowModal(true);
                                    setMobileMenuHabitId(null);
                                  }}
                                  className="px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-[var(--raised)] text-[var(--blue-text)]"
                                >
                                  <Edit2 size={13} /> {tr.tracker.editHabit}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleDeleteHabit(habit);
                                    setMobileMenuHabitId(null);
                                  }}
                                  className="px-3.5 py-2 text-xs text-left flex items-center gap-2 hover:bg-[var(--raised)] text-[var(--accent-red)]"
                                >
                                  <Trash2 size={13} /> {tr.tracker.deleteHabit}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Day Checkboxes with Streak Connectors */}
                      {allDays.map((day, dIdx) => {
                        const dateStr = toDateString(day);
                        const checked = isHabitCompletedOnDate(completions, habit.id, dateStr);
                        const today = isToday(day);
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                        const isFuture = day > new Date();

                        const prevDay = dIdx > 0 ? allDays[dIdx - 1] : null;
                        const nextDay = dIdx < allDays.length - 1 ? allDays[dIdx + 1] : null;
                        const prevDone = prevDay ? isHabitCompletedOnDate(completions, habit.id, toDateString(prevDay)) : false;
                        const nextDone = nextDay ? isHabitCompletedOnDate(completions, habit.id, toDateString(nextDay)) : false;

                        return (
                          <td
                            key={dateStr}
                            className={`p-0 text-center border-r border-[var(--line)] ${
                              today ? 'bg-[var(--blue-soft)]' : ''
                            }`}
                          >
                            <HabitCell
                              checked={checked}
                              linkL={prevDone}
                              linkR={nextDone}
                              isToday={today}
                              isPast={isPast && !checked}
                              isFuture={isFuture}
                              habitName={habit.name}
                              dateStr={dateStr}
                              habitColor={habit.color || 'var(--blue)'}
                              onToggle={() => handleToggleHabit(habit.id, dateStr)}
                            />
                          </td>
                        );
                      })}

                      {/* Right Done Column */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          <span className="font-display text-sm sm:text-[15px] font-semibold text-[var(--text)]">
                            {fact}
                            <span className="text-xs text-[var(--muted)] font-normal">/{goal}</span>
                          </span>
                          <span className="block w-[84px] h-1 bg-[var(--off)]">
                            <span
                              className="block h-full bg-[var(--blue)] transition-all duration-300"
                              style={{
                                width: `${Math.min(100, Math.round((fact / Math.max(1, goal)) * 100))}%`,
                                boxShadow: fact > 0 ? '0 0 8px var(--blue-glow)' : 'none',
                              }}
                            />
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
                  {/* PROGRESS % ROW */}
                  <tr className="border-t border-[var(--line)] bg-[var(--raised)]">
                    <td className="sticky left-0 z-20 px-4 py-2 font-display text-xs font-semibold tracking-[0.16em] uppercase bg-[var(--raised)] border-r border-[var(--line)] text-[var(--blue-text)]">
                      {tr.tracker.progressPct}
                    </td>
                    {allDays.map((day) => {
                      const isFuture = day > new Date();
                      const stat = dayStats.find((d) => d.day === day.getDate());
                      const pct = stat?.pct ?? 0;
                      return (
                        <td
                          key={`pct-${day.getDate()}`}
                          className={`text-center font-display text-xs font-semibold tabular-nums border-r border-[var(--line)] py-2 ${
                            isToday(day) ? 'bg-[var(--blue-soft)]' : ''
                          }`}
                          style={{
                            color: isFuture ? 'var(--muted)' : pct > 0 ? 'var(--text)' : 'var(--muted)',
                          }}
                        >
                          {isFuture ? '—' : `${pct}%`}
                        </td>
                      );
                    })}
                    <td className="text-right px-4 py-2 font-display text-xs font-bold tracking-[0.08em] text-[var(--blue-text)]">
                      {overallPct.toFixed(0)}% MONTH
                    </td>
                  </tr>

                  {/* ✓ COMPLETED ROW */}
                  <tr className="border-t border-[var(--line)] bg-[var(--raised)]">
                    <td className="sticky left-0 z-20 px-4 py-2 font-display text-xs font-semibold tracking-[0.16em] uppercase bg-[var(--raised)] border-r border-[var(--line)] text-[var(--blue-text)] flex items-center gap-1.5">
                      <Check size={14} strokeWidth={3} />
                      <span>{tr.tracker.completed.toUpperCase()}</span>
                    </td>
                    {allDays.map((day) => {
                      const isFuture = day > new Date();
                      const stat = dayStats.find((d) => d.day === day.getDate());
                      return (
                        <td
                          key={`done-${day.getDate()}`}
                          className={`text-center font-display text-xs font-semibold tabular-nums border-r border-[var(--line)] py-2 ${
                            isToday(day) ? 'bg-[var(--blue-soft)]' : ''
                          }`}
                          style={{
                            color: isFuture ? 'var(--muted)' : (stat?.done ?? 0) > 0 ? 'var(--blue-text)' : 'var(--muted)',
                          }}
                        >
                          {isFuture ? '—' : (stat?.done ?? 0)}
                        </td>
                      );
                    })}
                    <td />
                  </tr>
                </>
              )}
            </tbody>
          </table>
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
        existingHabits={habits}
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
