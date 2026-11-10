'use client';

import { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import {
  getMonthWeeks,
  toDateString,
  isToday,
  getFullDateRu,
  formatRu,
  getMonthName,
} from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import { DAY_NAMES_SHORT } from '@/lib/types';
import type { Habit } from '@/lib/types';
import MiniCalendar from './MiniCalendar';
import HabitRow from './HabitRow';
import CheckboxCell from './CheckboxCell';
import ProgressSummaryPanel from './ProgressSummaryPanel';
import AddHabitModal from './AddHabitModal';
import { useToast } from '@/hooks/useToast';

export default function MonthlyTrackerTable() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const monthlyGoal = useHabitsStore((s) => s.monthlyGoal);
  const isLoading = useHabitsStore((s) => s.isLoading);
  const loadHabits = useHabitsStore((s) => s.loadHabits);
  const loadCompletions = useHabitsStore((s) => s.loadCompletions);
  const loadMonthlyGoal = useHabitsStore((s) => s.loadMonthlyGoal);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const setMonthlyGoalText = useHabitsStore((s) => s.setMonthlyGoalText);
  const setHabitTarget = useHabitsStore((s) => s.setHabitTarget);

  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [goalText, setGoalText] = useState('');
  const goalDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;

  useEffect(() => {
    loadHabits();
  }, [loadHabits]);

  useEffect(() => {
    loadCompletions(year, month);
    loadMonthlyGoal(year, month);
  }, [year, month, loadCompletions, loadMonthlyGoal]);

  useEffect(() => {
    setGoalText(monthlyGoal?.goal_text || '');
  }, [monthlyGoal?.goal_text]);

  const weeks = useMemo(() => getMonthWeeks(currentMonth), [currentMonth]);

  const handleDayClick = useCallback(
    (date: Date) => {
      const dateStr = toDateString(date);
      const weekIdx = weeks.findIndex((w) => w.some((d) => toDateString(d) === dateStr));
      if (weekIdx !== -1) {
        const el = document.getElementById(`week-group-${weekIdx}`);
        el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    },
    [weeks],
  );

  const handleGoalChange = useCallback(
    (value: string) => {
      setGoalText(value);
      if (goalDebounceRef.current) clearTimeout(goalDebounceRef.current);
      goalDebounceRef.current = setTimeout(() => {
        setMonthlyGoalText(value);
      }, 500);
    },
    [setMonthlyGoalText],
  );

  const handleSaveHabit = useCallback(
    (data: { name: string; icon: string; color: string; target: number }) => {
      const { target, ...habitFields } = data;
      if (editingHabit) {
        updateHabit(editingHabit.id, habitFields);
        setHabitTarget(editingHabit.id, target);
        toast({ message: 'Привычка обновлена', variant: 'success' });
      } else {
        const created = addHabit(habitFields);
        setHabitTarget(created.id, target);
        toast({ message: 'Привычка добавлена', variant: 'success' });
      }
      setEditingHabit(null);
    },
    [editingHabit, addHabit, updateHabit, setHabitTarget, toast],
  );

  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      deleteHabit(habit.id);
      toast({
        message: `«${habit.name}» удалена`,
        variant: 'info',
      });
    },
    [deleteHabit, toast],
  );

  if (isLoading) {
    return (
      <div className="flex gap-4">
        <div className="w-[200px] shrink-0 space-y-2">
          <div className="h-[200px] rounded-lg skeleton-shimmer" />
          <div className="h-[300px] rounded-lg skeleton-shimmer" />
        </div>
        <div className="flex-1 h-[500px] rounded-lg skeleton-shimmer" />
        <div className="w-[180px] shrink-0 h-[500px] rounded-lg skeleton-shimmer" />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-3 items-start">
        {/* Left Panel — Fixed */}
        <div className="w-[200px] shrink-0 space-y-3">
          <MiniCalendar onDayClick={handleDayClick} />

          <div className="bg-bg-card rounded-lg p-3 shadow-sm">
            <h3 className="text-xs font-semibold text-text-secondary mb-1">
              Ежедневные привычки
            </h3>
            <p className="text-[10px] text-text-muted mb-3 capitalize">
              {getFullDateRu(new Date())}
            </p>

            {/* Habit list */}
            <div className="space-y-0.5">
              {habits.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-3xl mb-2">📋</p>
                  <p className="text-xs text-text-muted">
                    Добавьте первую привычку, чтобы начать отслеживать прогресс
                  </p>
                </div>
              ) : (
                habits.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    onEdit={(h) => {
                      setEditingHabit(h);
                      setShowModal(true);
                    }}
                    onDelete={handleDeleteHabit}
                  />
                ))
              )}
            </div>

            {/* Add habit button */}
            <button
              onClick={() => {
                setEditingHabit(null);
                setShowModal(true);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs text-accent-blue hover:bg-accent-blue/10 transition-colors border border-dashed border-accent-blue/30"
              aria-label="Добавить привычку"
            >
              <Plus size={14} />
              Добавить привычку
            </button>

            {/* Footer */}
            <p className="text-[10px] text-text-muted mt-2 text-center">
              Всего привычек: {habits.length}
            </p>
          </div>
        </div>

        {/* Center Panel — Scrollable */}
        <div className="flex-1 overflow-x-auto">
          {/* Month Goal */}
          <div className="bg-bg-card rounded-lg p-3 shadow-sm mb-3">
            <label className="text-xs font-semibold text-text-secondary">
              Цель месяца:
            </label>
            <input
              type="text"
              value={goalText}
              onChange={(e) => handleGoalChange(e.target.value)}
              placeholder="Опишите вашу цель на этот месяц..."
              className="mt-1 w-full px-3 py-2 rounded-lg border border-bg-card-alt bg-bg-primary text-sm text-text-primary outline-none focus:border-accent-blue transition-colors"
              aria-label="Цель месяца"
            />
          </div>

          {/* Weeks Grid */}
          {habits.length === 0 ? (
            <div className="bg-bg-card rounded-lg p-8 text-center shadow-sm">
              <p className="text-text-muted text-sm">
                Нажмите «Добавить привычку» чтобы начать
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {weeks.map((weekDays, weekIndex) => (
                <div
                  key={weekIndex}
                  id={`week-group-${weekIndex}`}
                  className="bg-bg-card rounded-lg shadow-sm overflow-hidden scroll-mt-4"
                >
                  {/* Week header */}
                  <div className="bg-bg-header/50 px-3 py-1.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-text-secondary">
                      Неделя {weekIndex + 1}
                    </span>
                    <div className="flex gap-1 ml-auto">
                      {weekDays.map((day) => {
                        const dayOfWeek = (day.getDay() + 6) % 7;
                        return (
                          <span
                            key={day.toISOString()}
                            className={`text-[9px] w-8 text-center ${
                              isToday(day)
                                ? 'font-bold text-accent-blue'
                                : 'text-text-muted'
                            }`}
                          >
                            {DAY_NAMES_SHORT[dayOfWeek]}
                            <br />
                            {day.getDate()}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Habit rows x day columns */}
                  <div className="px-3 py-1">
                    {habits.map((habit) => (
                      <div
                        key={habit.id}
                        className="flex items-center gap-2 py-0.5 border-b border-bg-card-alt/40 last:border-0"
                      >
                        <div className="flex items-center gap-1 w-[110px] shrink-0">
                          <span className="text-xs">{habit.icon}</span>
                          <span className="text-[10px] truncate text-text-primary">
                            {habit.name}
                          </span>
                        </div>
                        <div className="flex gap-1 ml-auto">
                          {weekDays.map((day) => {
                            const dateStr = toDateString(day);
                            const checked = isHabitCompletedOnDate(
                              completions,
                              habit.id,
                              dateStr,
                            );
                            return (
                              <div key={dateStr} className="w-8 flex justify-center">
                                <CheckboxCell
                                  checked={checked}
                                  onChange={() =>
                                    toggleCompletion(habit.id, dateStr)
                                  }
                                  isToday={isToday(day)}
                                  ariaLabel={`${habit.name} — ${formatRu(day, 'd MMM')}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel — Progress Summary */}
        {habits.length > 0 && <ProgressSummaryPanel />}
      </div>

      {/* Add/Edit Habit Modal */}
      <AddHabitModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        editHabit={editingHabit}
        initialTarget={editingHabit ? (monthlyGoal?.habit_targets?.[editingHabit.id] ?? 20) : 20}
      />
    </>
  );
}
