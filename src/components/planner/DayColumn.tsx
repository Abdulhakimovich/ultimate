'use client';

import { useState, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { usePlannerStore } from '@/store/plannerStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { isToday, formatDotDate, toDateString } from '@/lib/utils/dates';
import { calculateTaskStats } from '@/lib/utils/calculations';
import DonutRing from '@/components/ui/DonutRing';
import TaskRow from './TaskRow';
import DailyNotes from './DailyNotes';

interface DayColumnProps {
  date: Date;
  dayIndex: number; // 0=Mon ... 6=Sun
}

const RING_COLOR_VALUES = [
  '#00D4FF', '#1E90FF', '#7B2FFF', '#00FF88', '#00BFFF', '#FFD700', '#FF6B00',
];

export default function DayColumn({ date, dayIndex }: DayColumnProps) {
  const dateStr   = toDateString(date);
  const tasks     = usePlannerStore((s) => s.tasksByDate[dateStr] || []);
  const entry     = usePlannerStore((s) => s.entriesByDate[dateStr]);
  const addTask   = usePlannerStore((s) => s.addTask);
  const toggleTask= usePlannerStore((s) => s.toggleTask);
  const updateTask= usePlannerStore((s) => s.updateTask);
  const deleteTask= usePlannerStore((s) => s.deleteTask);

  const language  = useLanguageStore((s) => s.language);
  const tr        = t(language);

  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTask, setShowNewTask] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const today = isToday(date);
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

  const emptySlots = Math.max(0, 10 - tasks.length);

  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden transition-all"
      style={{
        background: '#111827',
        border: today ? '1px solid #00D4FF' : '1px solid rgba(0,212,255,0.12)',
        boxShadow: today ? '0 0 16px rgba(0,212,255,0.25)' : '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {/* Column Header */}
      <div
        className="px-2 py-2 text-center"
        style={{
          background: today
            ? 'linear-gradient(90deg, #00D4FF25 0%, #0098C825 100%)'
            : isWeekend
              ? 'linear-gradient(90deg, #181133 0%, #24144F 100%)'
              : 'linear-gradient(90deg, #0B192E 0%, #0F2544 100%)',
          borderBottom: '1px solid rgba(0,212,255,0.15)',
        }}
      >
        <div
          className="font-bold text-sm tracking-wide"
          style={{ color: today ? '#00D4FF' : isWeekend ? '#00FF88' : '#E8F4FF' }}
        >
          {tr.tracker.weekdays[dayIndex]}
        </div>
        <div className="text-[10px] font-mono mt-0.5" style={{ color: '#7BA7CC' }}>
          {formatDotDate(date)}
        </div>
      </div>

      {/* Donut Progress Ring */}
      <div className="flex flex-col items-center py-3">
        <DonutRing
          percentage={stats.percentage}
          size={60}
          strokeWidth={6}
          color={RING_COLOR_VALUES[dayIndex]}
        />
        <span className="text-[9px] font-semibold mt-1" style={{ color: '#7BA7CC' }}>
          {tr.tracker.progress}
        </span>
      </div>

      {/* Tasks Section */}
      <div className="px-2 flex-1">
        <div
          className="text-[10px] font-bold text-center py-1 rounded-md mb-1.5 uppercase tracking-wider"
          style={{
            background: 'rgba(0,212,255,0.08)',
            color: '#00D4FF',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          {tr.planner.tasks}
        </div>

        <div className="space-y-0.5 min-h-[120px]">
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                id={task.id}
                text={task.text}
                completed={task.completed}
                onToggle={() => toggleTask(task.id, dateStr)}
                onUpdate={(text) => updateTask(task.id, { text })}
                onDelete={() => deleteTask(task.id, dateStr)}
              />
            ))}
          </AnimatePresence>

          {/* Empty clickable rows */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => {
                setShowNewTask(true);
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div
                className="w-[14px] h-[14px] rounded-[3px] border"
                style={{ borderColor: 'rgba(61,90,122,0.4)' }}
              />
              <span className="text-[10px]" style={{ color: 'rgba(61,90,122,0.4)' }}>
                —
              </span>
            </div>
          ))}

          {/* New task input */}
          {showNewTask && (
            <div className="flex items-center gap-2 px-2 py-1">
              <Plus size={12} style={{ color: '#00D4FF' }} className="shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onBlur={handleAddTask}
                onKeyDown={handleNewTaskKeyDown}
                placeholder={`${tr.planner.addTask}...`}
                className="flex-1 text-xs bg-transparent border-b text-text-primary outline-none py-0.5 placeholder:text-text-muted/50"
                style={{ borderColor: '#00D4FF' }}
                aria-label={tr.planner.addTask}
              />
            </div>
          )}
        </div>

        {/* Task Footer Stats */}
        <div
          className="flex justify-between text-[9px] mt-2 px-1 py-1 border-t"
          style={{ borderColor: 'rgba(0,212,255,0.1)', color: '#7BA7CC' }}
        >
          <span>
            {tr.planner.completed}{' '}
            <strong style={{ color: '#00FF88' }}>{stats.completed}</strong>
          </span>
          <span>
            {tr.planner.remaining}{' '}
            <strong style={{ color: '#FF3366' }}>{stats.remaining}</strong>
          </span>
        </div>
      </div>

      {/* Notes Sections */}
      <div className="px-2 pb-2 mt-1">
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
    </div>
  );
}
