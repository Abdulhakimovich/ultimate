'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Target,
  Flame,
  TrendingUp,
  Zap,
  Star,
  Award,
  Smile,
  Activity,
  Calendar as CalendarIcon,
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
import { getMentalRatings, setMentalRating, type MentalRatings } from '@/lib/storage';
import AddHabitModal from './AddHabitModal';
import { useToast } from '@/hooks/useToast';
import type { Habit } from '@/lib/types';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon=0 … Sun=6
}

function getWeekLabel(weekIdx: number, tr: ReturnType<typeof t>): string {
  return `${tr.tracker.week} ${weekIdx + 1}`;
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function ElectricCheckbox({
  checked,
  onChange,
  isToday: todayFlag,
}: {
  checked: boolean;
  onChange: () => void;
  isToday?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={checked ? 'Отмечено' : 'Не отмечено'}
      className={`
        w-[18px] h-[18px] rounded-[3px] flex items-center justify-center
        transition-all duration-150 cursor-pointer border
        ${checked
          ? 'bg-[#00D4FF] border-[#00D4FF] shadow-[0_0_8px_rgba(0,212,255,0.7)] scale-100'
          : todayFlag
            ? 'border-[#00D4FF] bg-[rgba(0,212,255,0.08)] hover:bg-[rgba(0,212,255,0.2)]'
            : 'border-[#3D5A7A] bg-transparent hover:border-[#00D4FF] hover:bg-[rgba(0,212,255,0.1)]'
        }
      `}
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path
            d="M1 4L4 7L10 1"
            stroke="#080C14"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function ProgressBarElectric({
  value,
  height = 8,
  color = 'electric',
}: {
  value: number;
  height?: number;
  color?: 'electric' | 'green' | 'purple' | 'gold';
}) {
  const gradients: Record<string, string> = {
    electric: 'linear-gradient(90deg, #0098C8, #00D4FF, #00BFFF)',
    green:    'linear-gradient(90deg, #00C66A, #00FF88)',
    purple:   'linear-gradient(90deg, #5B10CC, #7B2FFF)',
    gold:     'linear-gradient(90deg, #CC9900, #FFD700)',
  };
  const glows: Record<string, string> = {
    electric: 'rgba(0,212,255,0.5)',
    green:    'rgba(0,255,136,0.5)',
    purple:   'rgba(123,47,255,0.5)',
    gold:     'rgba(255,215,0,0.5)',
  };

  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div
      className="rounded-full overflow-hidden w-full"
      style={{ height, background: '#1E2A3E' }}
    >
      <div
        style={{
          height: '100%',
          width: `${clamped}%`,
          background: gradients[color],
          boxShadow: `0 0 8px ${glows[color]}`,
          borderRadius: '999px',
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}

function StatBadge({
  label,
  value,
  unit,
  color = '#00D4FF',
  icon: Icon,
}: {
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-1 transition-transform hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, #111827 0%, #152033 100%)',
        border: '1px solid rgba(0,212,255,0.15)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={13} style={{ color }} />}
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: '#7BA7CC' }}>
          {label}
        </span>
      </div>
      <div className="font-mono font-bold text-xl leading-none mt-0.5" style={{ color }}>
        {value}
        {unit && <span className="text-xs ml-0.5 font-normal" style={{ color: '#7BA7CC' }}>{unit}</span>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export default function UltimateMonthlyTracker() {
  const habits             = useHabitsStore((s) => s.habits);
  const completions        = useHabitsStore((s) => s.completions);
  const currentMonth       = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal        = useHabitsStore((s) => s.monthlyGoal);
  const isLoading          = useHabitsStore((s) => s.isLoading);
  const loadHabits         = useHabitsStore((s) => s.loadHabits);
  const loadCompletions    = useHabitsStore((s) => s.loadCompletions);
  const loadMonthlyGoal    = useHabitsStore((s) => s.loadMonthlyGoal);
  const toggleCompletion   = useHabitsStore((s) => s.toggleCompletion);
  const navigateMonth      = useHabitsStore((s) => s.navigateMonth);
  const setCurrentMonth    = useHabitsStore((s) => s.setCurrentMonth);
  const addHabit           = useHabitsStore((s) => s.addHabit);
  const updateHabit        = useHabitsStore((s) => s.updateHabit);
  const deleteHabit        = useHabitsStore((s) => s.deleteHabit);
  const setHabitTarget     = useHabitsStore((s) => s.setHabitTarget);

  const language           = useLanguageStore((s) => s.language);
  const tr                 = t(language);

  const [showModal, setShowModal]         = useState(false);
  const [editingHabit, setEditingHabit]   = useState<Habit | null>(null);
  const [quoteIdx, setQuoteIdx]           = useState(0);
  const [mounted, setMounted]             = useState(false);
  const [mentalRatings, setMentalState]   = useState<MentalRatings>({ mood: {}, motivation: {} });
  const { toast } = useToast();

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // 1-12

  useEffect(() => {
    setMounted(true);
    setMentalState(getMentalRatings());
  }, []);

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    loadCompletions(year, month);
    loadMonthlyGoal(year, month);
  }, [year, month, loadCompletions, loadMonthlyGoal]);

  // Rotate inspirational quote every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIdx((i) => (i + 1) % tr.tracker.inspirational.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [tr.tracker.inspirational.length]);

  const weeks = useMemo(() => getMonthWeeks(currentMonth), [currentMonth]);

  const startStr = useMemo(() => toDateString(startOfMonth(currentMonth)), [currentMonth]);
  const endStr   = useMemo(() => toDateString(endOfMonth(currentMonth)), [currentMonth]);

  // All days in month
  const allDays = useMemo(() => {
    return eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  }, [currentMonth]);

  // Per-day habit stats
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

  // Analysis data per habit (matches "Анализ" in photo 2)
  const analysisData = useMemo(() => {
    return habits.map((habit) => {
      const fact = countCompletionsInRange(completions, habit.id, startStr, endStr);
      const goal = monthlyGoal?.habit_targets?.[habit.id] ?? 30;
      const pct  = calculateHabitProgress(fact, goal);
      return { habit, goal, fact, pct };
    });
  }, [habits, completions, startStr, endStr, monthlyGoal]);

  // Overall progress percentage
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
      if (d.pct >= 70) {
        current++;
        best = Math.max(best, current);
      } else {
        current = 0;
      }
    }
    return best;
  }, [dayStats, habits.length]);

  // Area chart data across all days of the month (matches photo 1)
  const chartData = useMemo(() => {
    if (!mounted) return [];
    return dayStats.map((d) => ({
      day: d.day,
      pct: d.pct,
      done: d.done,
      isToday: d.isToday,
    }));
  }, [mounted, dayStats]);

  // Motivation level calculation
  const motivationLevel = useMemo(() => {
    if (overallPct >= 80) return language === 'ru' ? 'Легенда Дисциплины' : language === 'uz' ? 'Intizom Afsonasi' : 'Discipline Legend';
    if (overallPct >= 60) return language === 'ru' ? 'Мастер Продуктивности' : language === 'uz' ? 'Mahorat Cho‘qqisi' : 'Productivity Master';
    if (overallPct >= 40) return language === 'ru' ? 'Уверенный Темп' : language === 'uz' ? 'Barqaror Qadam' : 'Steady Momentum';
    return language === 'ru' ? 'Начало Пути' : language === 'uz' ? 'Boshlang‘ich Bosqich' : 'Path Starter';
  }, [overallPct, language]);

  const handleSaveHabit = useCallback(
    (data: { name: string; icon: string; color: string; target: number }) => {
      const { target, ...fields } = data;
      if (editingHabit) {
        updateHabit(editingHabit.id, fields);
        setHabitTarget(editingHabit.id, target);
        toast({ message: tr.toast.habitUpdated, variant: 'success' });
      } else {
        const created = addHabit(fields);
        setHabitTarget(created.id, target);
        toast({ message: tr.toast.habitAdded, variant: 'success' });
      }
      setEditingHabit(null);
    },
    [editingHabit, addHabit, updateHabit, setHabitTarget, toast, tr],
  );

  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      deleteHabit(habit.id);
      toast({ message: `«${habit.name}» ${tr.toast.habitDeleted}`, variant: 'info' });
    },
    [deleteHabit, toast, tr],
  );

  const handleRatingClick = useCallback((dateStr: string, type: 'mood' | 'motivation') => {
    const currentVal = mentalRatings[type][dateStr] || 0;
    // Cycle 0 -> 7 -> 8 -> 9 -> 10 -> 0
    const nextVal = currentVal >= 10 ? 0 : currentVal === 0 ? 7 : currentVal + 1;
    const updated = setMentalRating(dateStr, type, nextVal);
    setMentalState({ ...updated });
  }, [mentalRatings]);

  const handleMonthTabSelect = useCallback((targetMonthIdx: number) => {
    const newDate = new Date(year, targetMonthIdx, 1);
    setCurrentMonth(newDate);
  }, [year, setCurrentMonth]);

  const monthLabel = `${tr.months[month - 1]} ${year}`;

  if (!mounted || isLoading) {
    return (
      <div className="space-y-4 p-2">
        <div className="h-20 rounded-2xl skeleton-shimmer" />
        <div className="h-[480px] rounded-2xl skeleton-shimmer" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-12">

      {/* ===== MOTIVATIONAL HERO HEADER ===== */}
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #070B12 0%, #0D192E 50%, #080C14 100%)',
          border: '1px solid rgba(0,212,255,0.22)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 32px rgba(0,212,255,0.03)',
        }}
      >
        {/* Animated glowing decorative lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00D4FF] to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00FF88] to-transparent" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title + Quote */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #1E90FF)',
                  boxShadow: '0 0 16px rgba(0,212,255,0.6)',
                }}
              >
                <Zap size={18} style={{ color: '#080C14' }} />
              </div>
              <h1
                className="font-display font-black text-2xl tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, #FFFFFF 0%, #00D4FF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {tr.tracker.title}
              </h1>
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono"
                style={{
                  background: 'rgba(0,212,255,0.12)',
                  color: '#00D4FF',
                  border: '1px solid rgba(0,212,255,0.3)',
                }}
              >
                {motivationLevel}
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={quoteIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
                className="text-xs font-semibold quote-text max-w-2xl"
              >
                ✨ {tr.tracker.inspirational[quoteIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: '#111827',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00D4FF',
              }}
              aria-label={tr.tracker.prevMonth}
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="px-4 py-1.5 rounded-xl font-display font-bold text-sm min-w-[140px] text-center"
              style={{
                background: '#111827',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#E8F4FF',
              }}
            >
              {monthLabel}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: '#111827',
                border: '1px solid rgba(0,212,255,0.2)',
                color: '#00D4FF',
              }}
              aria-label={tr.tracker.nextMonth}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Top Progress bar exactly matching photo 2: "Привычки | Прогресс | Прогресс в %" */}
        <div
          className="mt-4 pt-3 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
          style={{
            background: 'rgba(10, 20, 35, 0.7)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#E8F4FF' }}>
              {tr.tracker.habits}
            </span>
            <span className="text-xs font-mono" style={{ color: '#7BA7CC' }}>
              ({habits.length})
            </span>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7BA7CC' }}>
              {tr.tracker.progress}:
            </span>
            <div className="flex-1">
              <ProgressBarElectric value={overallPct} height={10} color={overallPct >= 75 ? 'green' : 'electric'} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#7BA7CC' }}>
              {tr.tracker.progressPct}:
            </span>
            <span
              className="font-mono font-black text-lg px-2.5 py-0.5 rounded-lg"
              style={{
                color: '#00D4FF',
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
              }}
            >
              {overallPct.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* ===== 4 MOTIVATING STATS BADGES ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBadge
          label={tr.tracker.monthProgress}
          value={`${overallPct}%`}
          color="#00D4FF"
          icon={TrendingUp}
        />
        <StatBadge
          label={tr.tracker.avgCompletion}
          value={Math.round(
            dayStats.filter((d) => d.pct > 0).reduce((a, b) => a + b.pct, 0) /
              Math.max(1, dayStats.filter((d) => d.pct > 0).length)
          )}
          unit="%"
          color="#00FF88"
          icon={Target}
        />
        <StatBadge
          label={tr.tracker.streakDays}
          value={bestStreak}
          unit={tr.tracker.days}
          color="#FFD700"
          icon={Flame}
        />
        <StatBadge
          label={tr.tracker.totalHabits}
          value={habits.length}
          color="#7B2FFF"
          icon={Award}
        />
      </div>

      {/* ===== SPREADSHEET MATRIX (Exact matching of Photo 1 & Photo 2) ===== */}
      <div className="flex flex-col lg:flex-row gap-4 items-start w-full">

        {/* ===== LEFT HABITS COLUMN ===== */}
        <div className="w-full lg:w-[190px] flex-shrink-0">
          <div
            className="rounded-xl overflow-hidden"
            style={{
              border: '1px solid rgba(0,212,255,0.18)',
              background: '#111827',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header: Dark Green / Blue banner like Photo 1 & 2 */}
            <div
              className="px-3 py-2.5 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between"
              style={{
                background: 'linear-gradient(90deg, #0A2416 0%, #0E3520 100%)',
                color: '#00FF88',
                borderBottom: '2px solid rgba(0,255,136,0.3)',
              }}
            >
              <span>{tr.tracker.habits}</span>
              <Activity size={13} style={{ color: '#00FF88' }} />
            </div>

            {/* Habit Rows */}
            {habits.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">✨</div>
                <p className="text-xs font-semibold" style={{ color: '#00D4FF' }}>
                  {tr.tracker.noHabits}
                </p>
                <p className="text-[10px] mt-1" style={{ color: '#7BA7CC' }}>
                  {tr.tracker.noHabitsDesc}
                </p>
              </div>
            ) : (
              <div>
                {habits.map((habit, hIdx) => (
                  <div
                    key={habit.id}
                    className="group flex items-center gap-2 px-3 h-[34px] cursor-pointer transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: hIdx % 2 === 0 ? 'transparent' : 'rgba(14,24,40,0.5)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,255,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        hIdx % 2 === 0 ? 'transparent' : 'rgba(14,24,40,0.5)';
                    }}
                  >
                    <span className="text-sm flex-shrink-0">{habit.icon}</span>
                    <span
                      className="text-xs font-semibold truncate flex-1"
                      style={{ color: '#E8F4FF' }}
                      title={habit.name}
                    >
                      {habit.name}
                    </span>
                    {/* Hover actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHabit(habit);
                          setShowModal(true);
                        }}
                        className="p-1 rounded text-[10px] hover:text-[#00D4FF]"
                        style={{ color: '#7BA7CC' }}
                        title={tr.tracker.editHabit}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(habit);
                        }}
                        className="p-1 rounded text-[10px] hover:text-red-400"
                        style={{ color: '#7BA7CC' }}
                        title={tr.tracker.deleteHabit}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                {/* Left labels for 3 summary rows */}
                <div
                  className="px-3 h-[28px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #0A1628, #0F203A)',
                    color: '#00D4FF',
                    borderTop: '2px solid rgba(0,212,255,0.25)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {tr.tracker.progress}
                </div>
                <div
                  className="px-3 h-[26px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #091C12, #0D261A)',
                    color: '#00FF88',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {tr.tracker.completed}
                </div>
                <div
                  className="px-3 h-[26px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #1C0A12, #260D1A)',
                    color: '#FF3366',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {tr.tracker.notCompleted}
                </div>
              </div>
            )}

            {/* Add Habit Button */}
            <button
              type="button"
              onClick={() => {
                setEditingHabit(null);
                setShowModal(true);
              }}
              className="w-full px-3 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              style={{
                color: '#00D4FF',
                background: 'rgba(0,212,255,0.05)',
                borderTop: '1px solid rgba(0,212,255,0.15)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.12)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,212,255,0.05)';
              }}
            >
              <Plus size={14} />
              <span>{tr.tracker.addHabit}</span>
            </button>
          </div>
        </div>

        {/* ===== CENTER GRID TABLE (Horizontally Scrollable) ===== */}
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <div
            className="tracker-scroll rounded-xl overflow-x-auto"
            style={{
              border: '1px solid rgba(0,212,255,0.18)',
              background: '#111827',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <table
              className="border-collapse"
              style={{
                minWidth: 'max-content',
                width: '100%',
                background: '#111827',
              }}
            >
              {/* Columns for all days */}
              <colgroup>
                {allDays.map((day) => (
                  <col key={day.getDate()} style={{ width: '28px', minWidth: '28px' }} />
                ))}
              </colgroup>

              <thead>
                {/* 1. Week group headers banner (Неделя 1, Неделя 2, etc.) */}
                <tr>
                  {weeks.map((weekDays, wIdx) => (
                    <th
                      key={wIdx}
                      colSpan={weekDays.length}
                      className="text-center py-1.5 text-[10px] font-black uppercase tracking-wider"
                      style={{
                        background:
                          wIdx % 2 === 0
                            ? 'linear-gradient(90deg, #092015 0%, #0E3322 100%)'
                            : 'linear-gradient(90deg, #0B2519 0%, #0F3825 100%)',
                        color: '#00FF88',
                        borderRight: '1px solid rgba(0,255,136,0.25)',
                        borderBottom: '1px solid rgba(0,255,136,0.3)',
                      }}
                    >
                      {getWeekLabel(wIdx, tr)}
                    </th>
                  ))}
                </tr>

                {/* 2. Days of week abbreviations (пн вт ср чт пт сб вс) */}
                <tr>
                  {weeks.map((weekDays) =>
                    weekDays.map((day) => {
                      const dowIdx = getDayOfWeek(day);
                      const isWeekend = dowIdx >= 5;
                      const today = isToday(day);
                      return (
                        <th
                          key={toDateString(day)}
                          className="text-center py-1 text-[9px] font-bold"
                          style={{
                            background: today
                              ? 'rgba(0,212,255,0.2)'
                              : isWeekend
                                ? '#0D1624'
                                : 'transparent',
                            color: today
                              ? '#00D4FF'
                              : isWeekend
                                ? '#00FF88'
                                : '#7BA7CC',
                            borderBottom: '1px solid rgba(0,212,255,0.1)',
                            borderRight: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          {tr.tracker.weekdays[dowIdx]}
                        </th>
                      );
                    })
                  )}
                </tr>

                {/* 3. Day numbers (1, 2, 3... 30, 31) */}
                <tr>
                  {weeks.map((weekDays) =>
                    weekDays.map((day) => {
                      const today = isToday(day);
                      const dowIdx = getDayOfWeek(day);
                      const isWeekend = dowIdx >= 5;
                      return (
                        <th
                          key={`num-${toDateString(day)}`}
                          className="text-center py-1 font-mono font-bold text-[10px]"
                          style={{
                            background: today ? 'rgba(0,212,255,0.15)' : 'transparent',
                            color: today
                              ? '#00D4FF'
                              : isWeekend
                                ? '#7BA7CC'
                                : '#E8F4FF',
                            borderBottom: '2px solid rgba(0,212,255,0.25)',
                            borderRight: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          {day.getDate()}
                        </th>
                      );
                    })
                  )}
                </tr>
              </thead>

              <tbody>
                {/* Habit Checkboxes Matrix */}
                {habits.map((habit, hIdx) => (
                  <tr
                    key={habit.id}
                    style={{
                      height: '34px',
                      background: hIdx % 2 === 0 ? 'transparent' : 'rgba(14,24,40,0.5)',
                    }}
                  >
                    {allDays.map((day) => {
                      const dateStr = toDateString(day);
                      const checked = isHabitCompletedOnDate(completions, habit.id, dateStr);
                      const today   = isToday(day);
                      return (
                        <td
                          key={dateStr}
                          className="p-0 text-center"
                          style={{
                            borderRight: '1px solid rgba(255,255,255,0.04)',
                            borderBottom: '1px solid rgba(255,255,255,0.04)',
                            background: today ? 'rgba(0,212,255,0.04)' : undefined,
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <ElectricCheckbox
                              checked={checked}
                              onChange={() => toggleCompletion(habit.id, dateStr)}
                              isToday={today}
                            />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* 3 Summary Stats Rows */}
                {habits.length > 0 && (
                  <>
                    {/* Row 1: Daily Progress % */}
                    <tr
                      style={{
                        height: '28px',
                        borderTop: '2px solid rgba(0,212,255,0.25)',
                        background: '#0A1628',
                      }}
                    >
                      {allDays.map((day) => {
                        const stat = dayStats.find((d) => d.day === day.getDate());
                        const pct  = stat?.pct ?? 0;
                        return (
                          <td
                            key={`pct-${day.getDate()}`}
                            className="text-center font-mono font-bold text-[9px]"
                            style={{
                              color:
                                pct === 100
                                  ? '#00FF88'
                                  : pct >= 50
                                    ? '#00D4FF'
                                    : pct > 0
                                      ? '#7BA7CC'
                                      : '#3D5A7A',
                              borderRight: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            {pct > 0 ? `${pct}%` : '0%'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 2: Completed Count */}
                    <tr style={{ height: '26px', background: '#091C12' }}>
                      {allDays.map((day) => {
                        const stat = dayStats.find((d) => d.day === day.getDate());
                        return (
                          <td
                            key={`done-${day.getDate()}`}
                            className="text-center font-mono font-semibold text-[9px]"
                            style={{
                              color: '#00FF88',
                              borderRight: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            {stat?.done ?? 0}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Row 3: Missed Count */}
                    <tr style={{ height: '26px', background: '#1C0A12' }}>
                      {allDays.map((day) => {
                        const stat = dayStats.find((d) => d.day === day.getDate());
                        return (
                          <td
                            key={`miss-${day.getDate()}`}
                            className="text-center font-mono font-semibold text-[9px]"
                            style={{
                              color: '#FF3366',
                              borderRight: '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            {stat?.notDone ?? 0}
                          </td>
                        );
                      })}
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== RIGHT ANALYSIS PANEL (Matches Photo 2) ===== */}
        {habits.length > 0 && (
          <div className="w-full lg:w-[220px] flex-shrink-0">
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: '1px solid rgba(0,255,136,0.3)',
                background: '#111827',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {/* Header: "АНАЛИЗ" */}
              <div
                className="text-center py-2.5 font-black text-xs uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(90deg, #0A2416 0%, #0E3520 100%)',
                  color: '#00FF88',
                  borderBottom: '2px solid rgba(0,255,136,0.3)',
                }}
              >
                {tr.tracker.analysis}
              </div>

              {/* Sub-headers: Цель | Факт | Прогресс */}
              <div
                className="grid grid-cols-3 text-center border-b"
                style={{ borderColor: 'rgba(0,255,136,0.2)' }}
              >
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: '#00C66A',
                    borderRight: '1px solid rgba(0,255,136,0.15)',
                  }}
                >
                  {tr.tracker.goal}
                </div>
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: '#00C66A',
                    borderRight: '1px solid rgba(0,255,136,0.15)',
                  }}
                >
                  {tr.tracker.fact}
                </div>
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: '#00C66A',
                  }}
                >
                  {tr.tracker.progressCol}
                </div>
              </div>

              {/* Habit rows in Analysis */}
              {analysisData.map(({ habit, goal, fact, pct }, idx) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-3 items-center border-b h-[34px]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.04)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(14,24,40,0.5)',
                  }}
                >
                  <div
                    className="text-center font-mono text-[11px] font-bold"
                    style={{
                      color: '#7BA7CC',
                      borderRight: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {goal}
                  </div>
                  <div
                    className="text-center font-mono text-[11px] font-bold"
                    style={{
                      color: fact >= goal ? '#00FF88' : '#E8F4FF',
                      borderRight: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    {fact}
                  </div>
                  <div className="px-2">
                    <ProgressBarElectric
                      value={pct}
                      height={6}
                      color={pct >= 80 ? 'green' : pct >= 50 ? 'electric' : 'purple'}
                    />
                  </div>
                </div>
              ))}

              {/* Analysis Footer */}
              <div
                className="p-2 text-center text-[10px] font-mono font-semibold"
                style={{
                  background: 'rgba(0,255,136,0.05)',
                  color: '#00FF88',
                  borderTop: '1px solid rgba(0,255,136,0.15)',
                }}
              >
                {tr.tracker.progressPct}: {overallPct.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BELOW TABLE: AREA CHART & MENTAL STATE (From Photo 1) ===== */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, #0B1320 0%, #0F1A2D 100%)',
          border: '1px solid rgba(0,212,255,0.18)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: '#00D4FF' }} />
            <h3 className="font-display font-bold text-sm" style={{ color: '#E8F4FF' }}>
              {tr.analytics.monthlyTrend} — {monthLabel}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#00D4FF]">
            25% / 50% / 75% / 100%
          </span>
        </div>

        {/* Daily Area Chart with 25%, 50%, 75% lines (Matches Photo 1) */}
        <div style={{ height: '140px' }} className="w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="photoGreenGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.45} />
                  <stop offset="60%" stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.08)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: '#7BA7CC', fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: '#7BA7CC', fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                ticks={[25, 50, 75, 100]}
                width={35}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: '#111827',
                  border: '1px solid rgba(0,212,255,0.3)',
                  borderRadius: 8,
                  fontSize: 11,
                  color: '#E8F4FF',
                }}
                formatter={(val: any) => [`${val ?? 0}%`, tr.tracker.progress]}
                labelFormatter={(lbl) => `${tr.tracker.todayDate}: ${lbl}`}
              />
              <Area
                type="monotone"
                dataKey="pct"
                stroke="#00FF88"
                strokeWidth={2.5}
                fill="url(#photoGreenGradient)"
                animationDuration={900}
                dot={{ r: 2, fill: '#00FF88', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00D4FF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ===== MENTAL STATE SECTION (From Photo 1) ===== */}
        <div className="mt-4 pt-3 border-t border-[rgba(0,212,255,0.1)]">
          {/* Header */}
          <div
            className="px-3 py-1.5 rounded-lg text-center text-xs font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(90deg, #0A2416 0%, #0E3520 100%)',
              color: '#00FF88',
              border: '1px solid rgba(0,255,136,0.25)',
            }}
          >
            <Smile size={14} />
            <span>{tr.tracker.mentalState}</span>
          </div>

          <div className="tracker-scroll overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: 'max-content' }}>
              <tbody>
                {/* Row: Настроение (Mood) */}
                <tr className="border-b border-[rgba(255,255,255,0.04)]">
                  <td
                    className="px-3 py-1 text-xs font-semibold whitespace-nowrap"
                    style={{
                      width: '140px',
                      color: '#00D4FF',
                      background: 'rgba(0,212,255,0.06)',
                    }}
                  >
                    😊 {tr.tracker.mood}
                  </td>
                  {allDays.map((day) => {
                    const dateStr = toDateString(day);
                    const val = mentalRatings.mood[dateStr] || 0;
                    return (
                      <td
                        key={`mood-${dateStr}`}
                        onClick={() => handleRatingClick(dateStr, 'mood')}
                        className="text-center font-mono text-[10px] cursor-pointer hover:bg-[rgba(0,212,255,0.15)] transition-colors p-1"
                        style={{
                          width: '28px',
                          color: val >= 9 ? '#00FF88' : val >= 7 ? '#00D4FF' : val > 0 ? '#FFD700' : '#3D5A7A',
                          borderRight: '1px solid rgba(255,255,255,0.04)',
                        }}
                        title={`${tr.tracker.mood}: ${val}/10 (клик для изменения)`}
                      >
                        {val > 0 ? val : '·'}
                      </td>
                    );
                  })}
                </tr>

                {/* Row: Мотивация (Motivation) */}
                <tr>
                  <td
                    className="px-3 py-1 text-xs font-semibold whitespace-nowrap"
                    style={{
                      width: '140px',
                      color: '#FFD700',
                      background: 'rgba(255,215,0,0.06)',
                    }}
                  >
                    ⚡ {tr.tracker.motivation}
                  </td>
                  {allDays.map((day) => {
                    const dateStr = toDateString(day);
                    const val = mentalRatings.motivation[dateStr] || 0;
                    return (
                      <td
                        key={`mot-${dateStr}`}
                        onClick={() => handleRatingClick(dateStr, 'motivation')}
                        className="text-center font-mono text-[10px] cursor-pointer hover:bg-[rgba(255,215,0,0.15)] transition-colors p-1"
                        style={{
                          width: '28px',
                          color: val >= 9 ? '#00FF88' : val >= 7 ? '#FFD700' : val > 0 ? '#7BA7CC' : '#3D5A7A',
                          borderRight: '1px solid rgba(255,255,255,0.04)',
                        }}
                        title={`${tr.tracker.motivation}: ${val}/10 (клик для изменения)`}
                      >
                        {val > 0 ? val : '·'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ===== BOTTOM MONTH NAVIGATION TABS (Exact match of Excel tabs at bottom of Photo 1 & 2) ===== */}
        <div
          className="mt-4 pt-3 flex items-center gap-1 overflow-x-auto border-t border-[rgba(0,212,255,0.12)]"
        >
          {/* "Год" / "Year" Tab */}
          <div
            className="px-3 py-1 rounded-t-lg text-xs font-bold flex items-center gap-1 cursor-default"
            style={{
              background: '#080C14',
              color: '#7BA7CC',
              border: '1px solid rgba(0,212,255,0.15)',
              borderBottom: 'none',
            }}
          >
            <CalendarIcon size={12} />
            <span>{tr.yearLabel} {year}</span>
          </div>

          {/* 12 Month Tabs */}
          {tr.shortMonths.map((mShort, idx) => {
            const isCurrent = idx === month - 1;
            return (
              <button
                key={mShort}
                type="button"
                onClick={() => handleMonthTabSelect(idx)}
                className="px-3 py-1 rounded-t-lg text-xs font-semibold transition-all cursor-pointer"
                style={{
                  background: isCurrent
                    ? 'linear-gradient(180deg, #00D4FF22 0%, #080C14 100%)'
                    : '#111827',
                  color: isCurrent ? '#00D4FF' : '#7BA7CC',
                  border: isCurrent
                    ? '1px solid #00D4FF'
                    : '1px solid rgba(255,255,255,0.06)',
                  borderBottom: isCurrent ? '2px solid #00D4FF' : 'none',
                  boxShadow: isCurrent ? '0 -2px 8px rgba(0,212,255,0.3)' : 'none',
                }}
              >
                {mShort}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== ADD / EDIT HABIT MODAL ===== */}
      <AddHabitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
        initialTarget={editingHabit ? (monthlyGoal?.habit_targets?.[editingHabit.id] ?? 30) : 30}
      />
    </div>
  );
}
