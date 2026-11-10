'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { Habit } from '@/lib/types';

interface HabitRowProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export default function HabitRow({ habit, onEdit, onDelete }: HabitRowProps) {
  return (
    <motion.div
      layout
      className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-card-alt/50 transition-colors"
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center text-sm shrink-0"
        style={{ backgroundColor: habit.color + '30' }}
      >
        {habit.icon}
      </div>
      <span className="flex-1 text-xs text-text-primary truncate">
        {habit.name}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(habit)}
          className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-text-primary transition-colors"
          aria-label={`Редактировать ${habit.name}`}
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={() => onDelete(habit)}
          className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-accent-danger transition-colors"
          aria-label={`Удалить ${habit.name}`}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}
