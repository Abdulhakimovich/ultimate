'use client';

import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import HabitIcon from '@/components/ui/HabitIcon';

interface HabitRowProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

export default function HabitRow({ habit, onEdit, onDelete }: HabitRowProps) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  return (
    <motion.div
      layout
      className="group flex items-center gap-2 px-2 py-1.5 rounded hover:bg-bg-card-alt/50 transition-colors"
    >
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
        style={{ backgroundColor: habit.color + '25', color: habit.color }}
      >
        <HabitIcon icon={habit.icon} size={13} />
      </div>
      <span className="flex-1 text-xs text-text-primary truncate">
        {habit.name}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(habit)}
          className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-text-primary transition-colors"
          aria-label={`${tr.ui.edit} ${habit.name}`}
        >
          <Pencil size={11} />
        </button>
        <button
          onClick={() => onDelete(habit)}
          className="p-1 rounded hover:bg-bg-card-alt text-text-muted hover:text-accent-danger transition-colors"
          aria-label={`${tr.ui.delete} ${habit.name}`}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </motion.div>
  );
}
