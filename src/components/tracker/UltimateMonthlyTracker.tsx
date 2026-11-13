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
import type { Habit } from '@/lib/types';
import AddHabitModal from './AddHabitModal';
import { useToast } from '@/hooks/useToast';

/* ------------------------------------------------------------------ */
/* Recharts CSS-var helper (SVG doesn't support CSS vars natively)     */
/* ------------------------------------------------------------------ */

function getCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function getDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7; // Mon=0 вЂ¦ Sun=6
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
      aria-label={checked ? 'РћС‚РјРµС‡РµРЅРѕ' : 'РќРµ РѕС‚РјРµС‡РµРЅРѕ'}
      className={`
        w-[18px] h-[18px] rounded-[3px] flex items-center justify-center
        transition-all duration-150 cursor-pointer border
        ${checked
          ? 'border-[var(--electric)] shadow-[0_0_8px_rgba(0,212,255,0.7)] scale-100'
          : todayFlag
            ? 'border-[var(--electric)] hover:border-[var(--electric)]'
            : 'border-[var(--text-muted)] bg-transparent hover:border-[var(--electric)]'
        }
      `}
      style={
        checked
          ? { background: 'var(--electric)' }
          : todayFlag
            ? { background: 'var(--electric-glow)' }
            : { background: 'transparent' }
      }
    >
      {checked && (
        <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
          <path
            d="M1 4L4 7L10 1"
            stroke="var(--bg-primary)"
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
    electric: 'linear-gradient(90deg, var(--electric-dim), var(--electric), var(--blue-neon))',
    green:    'linear-gradient(90deg, var(--accent-green-dim), var(--accent-green))',
    purple:   'linear-gradient(90deg, #5B10CC, var(--accent-purple))',
    gold:     'linear-gradient(90deg, #CC9900, var(--accent-gold))',
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
      style={{ height, background: 'var(--bg-elevated)' }}
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
  color = 'var(--electric)',
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
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center gap-1.5">
        {Icon && <Icon size={13} style={{ color }} />}
        <span className="text-[9px] uppercase tracking-widest font-semibold" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
      </div>
      <div className="font-mono font-bold text-xl leading-none mt-0.5" style={{ color }}>
        {value}
        {unit && <span className="text-xs ml-0.5 font-normal" style={{ color: 'var(--text-secondary)' }}>{unit}</span>}
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
  const { toast } = useToast();

  const year  = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1; // 1-12

  useEffect(() => {
    setMounted(true);
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

  // Analysis data per habit (matches "РђРЅР°Р»РёР·" in photo 2)
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
    if (overallPct >= 80) return language === 'ru' ? 'Р›РµРіРµРЅРґР° Р”РёСЃС†РёРїР»РёРЅС‹' : language === 'uz' ? 'Intizom Afsonasi' : 'Discipline Legend';
    if (overallPct >= 60) return language === 'ru' ? 'РњР°СЃС‚РµСЂ РџСЂРѕРґСѓРєС‚РёРІРЅРѕСЃС‚Рё' : language === 'uz' ? "Mahorat Cho'qqisi" : 'Productivity Master';
    if (overallPct >= 40) return language === 'ru' ? 'РЈРІРµСЂРµРЅРЅС‹Р№ РўРµРјРї' : language === 'uz' ? 'Barqaror Qadam' : 'Steady Momentum';
    return language === 'ru' ? 'РќР°С‡Р°Р»Рѕ РџСѓС‚Рё' : language === 'uz' ? "Boshlang'ich Bosqich" : 'Path Starter';
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
      toast({ message: `В«${habit.name}В» ${tr.toast.habitDeleted}`, variant: 'info' });
    },
    [deleteHabit, toast, tr],
  );

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
          background: 'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-card-alt) 50%, var(--bg-primary) 100%)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 32px rgba(0,212,255,0.03)',
        }}
      >
        {/* Animated glowing decorative lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--electric)] to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--accent-green)] to-transparent" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Title + Quote */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--electric), var(--blue-mid))',
                  boxShadow: '0 0 16px var(--electric-muted)',
                }}
              >
                <Zap size={18} style={{ color: 'var(--bg-primary)' }} />
              </div>
              <h1
                className="font-display font-black text-2xl tracking-tight"
                style={{
                  background: 'linear-gradient(90deg, var(--text-bright) 0%, var(--electric) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {tr.tracker.title}
              </h1>
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-mono"
                style={{
                  background: 'var(--border)',
                  color: 'var(--electric)',
                  border: '1px solid var(--border-bright)',
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
                вњЁ {tr.tracker.inspirational[quoteIdx]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Month Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-bright)',
                color: 'var(--electric)',
              }}
              aria-label={tr.tracker.prevMonth}
            >
              <ChevronLeft size={16} />
            </button>
            <div
              className="px-4 py-1.5 rounded-xl font-display font-bold text-sm min-w-[140px] text-center"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-primary)',
              }}
            >
              {monthLabel}
            </div>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-bright)',
                color: 'var(--electric)',
              }}
              aria-label={tr.tracker.nextMonth}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Top Progress bar exactly matching photo 2: "РџСЂРёРІС‹С‡РєРё | РџСЂРѕРіСЂРµСЃСЃ | РџСЂРѕРіСЂРµСЃСЃ РІ %" */}
        <div
          className="mt-4 pt-3 rounded-xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
          style={{
            background: 'var(--bg-glass)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              {tr.tracker.habits}
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
              ({habits.length})
            </span>
          </div>

          <div className="flex-1 max-w-xl flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.progress}:
            </span>
            <div className="flex-1">
              <ProgressBarElectric value={overallPct} height={10} color={overallPct >= 75 ? 'green' : 'electric'} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              {tr.tracker.progressPct}:
            </span>
            <span
              className="font-mono font-black text-lg px-2.5 py-0.5 rounded-lg"
              style={{
                color: 'var(--electric)',
                background: 'var(--electric-glow)',
                border: '1px solid var(--border-bright)',
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
          color="var(--electric)"
          icon={TrendingUp}
        />
        <StatBadge
          label={tr.tracker.avgCompletion}
          value={Math.round(
            dayStats.filter((d) => d.pct > 0).reduce((a, b) => a + b.pct, 0) /
              Math.max(1, dayStats.filter((d) => d.pct > 0).length)
          )}
          unit="%"
          color="var(--accent-green)"
          icon={Target}
        />
        <StatBadge
          label={tr.tracker.streakDays}
          value={bestStreak}
          unit={tr.tracker.days}
          color="var(--accent-gold)"
          icon={Flame}
        />
        <StatBadge
          label={tr.tracker.totalHabits}
          value={habits.length}
          color="var(--accent-purple)"
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
              border: '1px solid var(--border-bright)',
              background: 'var(--bg-card)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Header: Dark Green / Blue banner like Photo 1 & 2 */}
            <div
              className="px-3 py-2.5 font-bold text-[11px] uppercase tracking-wider flex items-center justify-between"
              style={{
                background: 'linear-gradient(90deg, #0A2416 0%, #0E3520 100%)',
                color: 'var(--accent-green)',
                borderBottom: '2px solid rgba(0,255,136,0.3)',
              }}
            >
              <span>{tr.tracker.habits}</span>
              <Activity size={13} style={{ color: 'var(--accent-green)' }} />
            </div>

            {/* Habit Rows */}
            {habits.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">вњЁ</div>
                <p className="text-xs font-semibold" style={{ color: 'var(--electric)' }}>
                  {tr.tracker.noHabits}
                </p>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-secondary)' }}>
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
                      borderBottom: '1px solid var(--border-subtle)',
                      background: hIdx % 2 === 0 ? 'transparent' : 'var(--bg-glass)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background = 'var(--electric-glow)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.background =
                        hIdx % 2 === 0 ? 'transparent' : 'var(--bg-glass)';
                    }}
                  >
                    <span className="text-sm flex-shrink-0">{habit.icon}</span>
                    <span
                      className="text-xs font-semibold truncate flex-1"
                      style={{ color: 'var(--text-primary)' }}
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
                        className="p-1 rounded text-[10px] hover:text-[var(--electric)]"
                        style={{ color: 'var(--text-secondary)' }}
                        title={tr.tracker.editHabit}
                      >
                        вњЋ
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHabit(habit);
                        }}
                        className="p-1 rounded text-[10px] hover:text-red-400"
                        style={{ color: 'var(--text-secondary)' }}
                        title={tr.tracker.deleteHabit}
                      >
                        вњ•
                      </button>
                    </div>
                  </div>
                ))}

                {/* Left labels for 3 summary rows */}
                <div
                  className="px-3 h-[28px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #0A1628, #0F203A)',
                    color: 'var(--electric)',
                    borderTop: '2px solid var(--border-bright)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {tr.tracker.progress}
                </div>
                <div
                  className="px-3 h-[26px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #091C12, #0D261A)',
                    color: 'var(--accent-green)',
                    borderBottom: '1px solid var(--border-subtle)',
                  }}
                >
                  {tr.tracker.completed}
                </div>
                <div
                  className="px-3 h-[26px] flex items-center text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #1C0A12, #260D1A)',
                    color: 'var(--accent-red)',
                    borderBottom: '1px solid var(--border-subtle)',
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
                color: 'var(--electric)',
                background: 'var(--electric-glow)',
                borderTop: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--electric-glow)';
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
              border: '1px solid var(--border-bright)',
              background: 'var(--bg-card)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <table
              className="border-collapse"
              style={{
                minWidth: 'max-content',
                width: '100%',
                background: 'var(--bg-card)',
              }}
            >
              {/* Columns for all days */}
              <colgroup>
                {allDays.map((day) => (
                  <col key={day.getDate()} style={{ width: '28px', minWidth: '28px' }} />
                ))}
              </colgroup>

              <thead>
                {/* 1. Week group headers banner (РќРµРґРµР»СЏ 1, РќРµРґРµР»СЏ 2, etc.) */}
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
                        color: 'var(--accent-green)',
                        borderRight: '1px solid rgba(0,255,136,0.25)',
                        borderBottom: '1px solid rgba(0,255,136,0.3)',
                      }}
                    >
                      {getWeekLabel(wIdx, tr)}
                    </th>
                  ))}
                </tr>

                {/* 2. Days of week abbreviations (РїРЅ РІС‚ СЃСЂ С‡С‚ РїС‚ СЃР± РІСЃ) */}
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
                              ? 'var(--border-bright)'
                              : isWeekend
                                ? 'var(--bg-secondary)'
                                : 'transparent',
                            color: today
                              ? 'var(--electric)'
                              : isWeekend
                                ? 'var(--accent-green)'
                                : 'var(--text-secondary)',
                            borderBottom: '1px solid var(--border)',
                            borderRight: '1px solid var(--border-subtle)',
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
                            background: today ? 'var(--electric-glow)' : 'transparent',
                            color: today
                              ? 'var(--electric)'
                              : isWeekend
                                ? 'var(--text-secondary)'
                                : 'var(--text-primary)',
                            borderBottom: '2px solid var(--border-bright)',
                            borderRight: '1px solid var(--border-subtle)',
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
                      background: hIdx % 2 === 0 ? 'transparent' : 'var(--bg-glass)',
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
                            borderRight: '1px solid var(--border-subtle)',
                            borderBottom: '1px solid var(--border-subtle)',
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
                        borderTop: '2px solid var(--border-bright)',
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
                                  ? 'var(--accent-green)'
                                  : pct >= 50
                                    ? 'var(--electric)'
                                    : pct > 0
                                      ? 'var(--text-secondary)'
                                      : 'var(--text-muted)',
                              borderRight: '1px solid var(--border-subtle)',
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
                              color: 'var(--accent-green)',
                              borderRight: '1px solid var(--border-subtle)',
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
                              color: 'var(--accent-red)',
                              borderRight: '1px solid var(--border-subtle)',
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
                background: 'var(--bg-card)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              {/* Header: "РђРќРђР›РР—" */}
              <div
                className="text-center py-2.5 font-black text-xs uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(90deg, #0A2416 0%, #0E3520 100%)',
                  color: 'var(--accent-green)',
                  borderBottom: '2px solid rgba(0,255,136,0.3)',
                }}
              >
                {tr.tracker.analysis}
              </div>

              {/* Sub-headers: Р¦РµР»СЊ | Р¤Р°РєС‚ | РџСЂРѕРіСЂРµСЃСЃ */}
              <div
                className="grid grid-cols-3 text-center border-b"
                style={{ borderColor: 'rgba(0,255,136,0.2)' }}
              >
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: 'var(--accent-green-dim)',
                    borderRight: '1px solid rgba(0,255,136,0.15)',
                  }}
                >
                  {tr.tracker.goal}
                </div>
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: 'var(--accent-green-dim)',
                    borderRight: '1px solid rgba(0,255,136,0.15)',
                  }}
                >
                  {tr.tracker.fact}
                </div>
                <div
                  className="py-1 text-[9px] font-black uppercase tracking-wider"
                  style={{
                    background: 'rgba(0,255,136,0.08)',
                    color: 'var(--accent-green-dim)',
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
                    borderColor: 'var(--border-subtle)',
                    background: idx % 2 === 0 ? 'transparent' : 'var(--bg-glass)',
                  }}
                >
                  <div
                    className="text-center font-mono text-[11px] font-bold"
                    style={{
                      color: 'var(--text-secondary)',
                      borderRight: '1px solid var(--border-subtle)',
                    }}
                  >
                    {goal}
                  </div>
                  <div
                    className="text-center font-mono text-[11px] font-bold"
                    style={{
                      color: fact >= goal ? 'var(--accent-green)' : 'var(--text-primary)',
                      borderRight: '1px solid var(--border-subtle)',
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
                  color: 'var(--accent-green)',
                  borderTop: '1px solid rgba(0,255,136,0.15)',
                }}
              >
                {tr.tracker.progressPct}: {overallPct.toFixed(1)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== BELOW TABLE: TREND AREA CHART ===== */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-alt) 100%)',
          border: '1px solid var(--border-bright)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} style={{ color: 'var(--electric)' }} />
            <h3 className="font-display font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
              {tr.analytics.monthlyTrend} вЂ” {monthLabel}
            </h3>
          </div>
          <span className="text-[10px] font-mono" style={{ color: 'var(--electric)' }}>
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
              <CartesianGrid strokeDasharray="3 3" stroke={getCSSVar('--border-subtle', 'rgba(255,255,255,0.05)')} vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: getCSSVar('--text-secondary', '#7BA7CC'), fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: getCSSVar('--text-secondary', '#7BA7CC'), fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                ticks={[25, 50, 75, 100]}
                width={35}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  background: getCSSVar('--bg-card', '#111827'),
                  border: `1px solid ${getCSSVar('--border-bright', 'rgba(0,212,255,0.3)')}`,
                  borderRadius: 8,
                  fontSize: 11,
                  color: getCSSVar('--text-primary', '#E8F4FF'),
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
                activeDot={{ r: 5, fill: getCSSVar('--electric', '#00D4FF') }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ===== BOTTOM MONTH NAVIGATION TABS (Exact match of Excel tabs at bottom of Photo 1 & 2) ===== */}
        <div
          className="mt-4 pt-3 flex items-center gap-1 overflow-x-auto border-t border-[rgba(0,212,255,0.12)]"
        >
          {/* "Р“РѕРґ" / "Year" Tab */}
          <div
            className="px-3 py-1 rounded-t-lg text-xs font-bold flex items-center gap-1 cursor-default"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
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
                    ? 'linear-gradient(180deg, var(--border) 0%, var(--bg-primary) 100%)'
                    : 'var(--bg-card)',
                  color: isCurrent ? 'var(--electric)' : 'var(--text-secondary)',
                  border: isCurrent
                    ? '1px solid var(--electric)'
                    : '1px solid var(--border-subtle)',
                  borderBottom: isCurrent ? '2px solid var(--electric)' : 'none',
                  boxShadow: isCurrent ? '0 -2px 8px var(--electric-muted)' : 'none',
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
