'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, BookOpen } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { isToday, formatDotDate, toDateString } from '@/lib/utils/dates';
import { calculateTaskStats } from '@/lib/utils/calculations';
import { triggerFeedback } from '@/lib/feedback';
import DonutRing from '@/components/ui/DonutRing';
import TaskRow from './TaskRow';
import DailyNotes from './DailyNotes';

interface DayColumnProps {
  date: Date;
  dayIndex: number; // 0=Mon ... 6=Sun
}

const RING_COLOR_VALUES = [
  'var(--electric)', 'var(--blue-mid)', 'var(--accent-purple)', 'var(--accent-green)', 'var(--blue-neon)', 'var(--accent-gold)', 'var(--accent-orange)',
];

export default function DayColumn({ date, dayIndex }: DayColumnProps) {
  const dateStr    = toDateString(date);
  const tasks      = usePlannerStore((s) => s.tasksByDate[dateStr] || []);
  const entry      = usePlannerStore((s) => s.entriesByDate[dateStr]);
  const addTask    = usePlannerStore((s) => s.addTask);
  const toggleTask = usePlannerStore((s) => s.toggleTask);
  const updateTask = usePlannerStore((s) => s.updateTask);
  const deleteTask = usePlannerStore((s) => s.deleteTask);

  const language   = useLanguageStore((s) => s.language);
  const tr         = t(language);

  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = isToday(date);
  const [reflectionOpen, setReflectionOpen] = useState(today);
  const isWeekend = dayIndex >= 5;
  const stats = calculateTaskStats(tasks);

  const handleAddTask = useCallback(() => {
    const text = newTaskText.trim();
    if (text) {
      addTask(dateStr, text);
      setNewTaskText('');
    }
    setShowNewTask(false);
  }, [newTaskText, addTask, dateStr]);

  const handleNewTaskKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAddTask();
      } else if (e.key === 'Escape') {
        setNewTaskText('');
        setShowNewTask(false);
      }
    },
    [handleAddTask],
  );

  return (
    <div
      className={`flex flex-col rounded-2xl overflow-hidden transition-all surface-card ${
        today
          ? 'ring-2 ring-[var(--blue)] shadow-[0_0_24px_rgba(10,92,255,0.2)] border-[var(--blue)]'
          : 'border border-[var(--border)]'
      }`}
    >
      {/* Column Header */}
      <div
        className="px-3 py-2.5 text-center relative"
        style={{
          background: today
            ? 'var(--blue-soft)'
            : isWeekend
            ? 'var(--bg-elevated)'
            : 'var(--bg-header)',
          borderBottom: today ? '1px solid var(--blue)' : '1px solid var(--border)',
        }}
      >
        {today && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[var(--blue)] text-white shadow-sm">
            TODAY
          </div>
        )}
        <div
          className="font-display font-bold text-sm tracking-wide"
          style={{ color: today ? 'var(--blue-text)' : isWeekend ? 'var(--accent-orange)' : 'var(--text-primary)' }}
        >
          {tr.tracker.weekdays[dayIndex]}
        </div>
        <div className="font-mono text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>
          {formatDotDate(date)}
        </div>
      </div>

      {/* Daily Donut Ring */}
      <div className="flex flex-col items-center py-3 bg-[var(--bg-card)] border-b border-[var(--border)]">
        <DonutRing
          percentage={stats.percentage}
          size={56}
          strokeWidth={5}
          color={RING_COLOR_VALUES[dayIndex]}
        />
        <span className="text-xs uppercase font-bold mt-1 tracking-wider" style={{ color: 'var(--text-secondary)' }}>
          {stats.completed}/{stats.total} {tr.planner.completed}
        </span>
      </div>

      {/* Tasks Section */}
      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1.5 flex-1 min-h-[60px]">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                text={task.text}
                completed={task.completed}
                onToggle={() => {
                  triggerFeedback(!task.completed ? 'check' : 'uncheck');
                  toggleTask(task.id, dateStr);
                }}
                onUpdate={(text) => updateTask(task.id, { text })}
                onDelete={() => deleteTask(task.id, dateStr)}
              />
            ))}
          </AnimatePresence>

          {/* New task input */}
          {showNewTask && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] border border-[var(--blue)]">
              <Plus size={14} className="text-[var(--blue-text)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onBlur={handleAddTask}
                onKeyDown={handleNewTaskKeyDown}
                placeholder={tr.planner.newTaskPlaceholder}
                className="flex-1 text-xs bg-transparent text-[var(--text-primary)] outline-none"
                aria-label={tr.planner.addTask}
                autoFocus
              />
            </div>
          )}

          {/* Compact ghost "+ Add task" row */}
          {!showNewTask && (
            <button
              type="button"
              onClick={() => {
                setShowNewTask(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed transition-all hover:bg-[var(--bg-elevated)] text-xs font-medium border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-bright)]"
            >
              <Plus size={13} className="opacity-70" />
              <span>{tr.planner.addTask}</span>
            </button>
          )}
        </div>

        {/* Task Footer Stats */}
        <div
          className="flex justify-between text-xs font-mono pt-2 border-t"
          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <span>✓ {stats.completed}</span>
          <span>• {stats.total - stats.completed} {tr.planner.remaining}</span>
        </div>
      </div>

      {/* Collapsible Daily Reflection */}
      <div className="px-3 pb-3 border-t border-[var(--border)] pt-2.5">
        <button
          type="button"
          onClick={() => setReflectionOpen(!reflectionOpen)}
          className="w-full flex items-center justify-between text-xs font-semibold py-1.5 px-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-expanded={reflectionOpen}
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-[var(--electric)]" />
            <span>{tr.planner.dailyReflection || 'Daily reflection'}</span>
          </span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${reflectionOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {reflectionOpen && (
          <div className="space-y-2 mt-2 pt-1 border-t border-[var(--border-subtle)]">
            <DailyNotes
              title={tr.planner.notes}
              dateStr={dateStr}
              field="notes"
              values={entry?.notes || ['', '', '', '']}
            />
            <DailyNotes
              title={tr.planner.improvements}
              dateStr={dateStr}
              field="improvements"
              values={entry?.improvements || ['', '', '', '']}
            />
            <DailyNotes
              title={tr.planner.gratitude}
              dateStr={dateStr}
              field="gratitude"
              values={entry?.gratitude || ['', '', '', '']}
            />
          </div>
        )}
      </div>
    </div>
  );
}
