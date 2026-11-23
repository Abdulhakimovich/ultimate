'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '@/components/ui/Modal';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { HABIT_ICONS, HABIT_COLORS } from '@/lib/types';
import type { Habit } from '@/lib/types';
import HabitIcon from '@/components/ui/HabitIcon';

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Max 50 characters'),
  icon: z.string().min(1, 'Select an icon'),
  color: z.string().min(1, 'Select a color'),
  target: z.number().min(1, 'Min 1 day').max(31, 'Max 31 days'),
});

type HabitFormData = z.infer<typeof habitSchema>;

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string; target: number }) => void;
  editHabit?: Habit | null;
  initialTarget?: number;
}

export default function AddHabitModal({
  isOpen,
  onClose,
  onSave,
  editHabit,
  initialTarget = 30,
}: AddHabitModalProps) {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<HabitFormData>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: editHabit?.name || '',
      icon: editHabit?.icon || HABIT_ICONS[0].emoji,
      color: editHabit?.color || HABIT_COLORS[0],
      target: initialTarget,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: editHabit?.name || '',
        icon: editHabit?.icon || HABIT_ICONS[0].emoji,
        color: editHabit?.color || HABIT_COLORS[0],
        target: initialTarget,
      });
    }
  }, [isOpen, editHabit, initialTarget, reset]);

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const onSubmit = (data: HabitFormData) => {
    onSave(data);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editHabit ? tr.habits.editTitle : tr.habits.addTitle}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.habits.name}
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder={tr.habits.namePlaceholder}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-bright)',
              color: 'var(--text-primary)',
            }}
            aria-label={tr.habits.name}
          />
          {errors.name && (
            <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{errors.name.message}</p>
          )}
        </div>

        {/* Target */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.habits.target}
          </label>
          <div className="flex items-center gap-2">
            <input
              {...register('target', { valueAsNumber: true })}
              type="number"
              min={1}
              max={31}
              className="w-24 px-3 py-1.5 rounded-xl text-sm font-mono outline-none transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-bright)',
                color: 'var(--electric)',
              }}
              aria-label={tr.habits.target}
            />
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {tr.habits.targetLabel}
            </span>
          </div>
          {errors.target && (
            <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{errors.target.message}</p>
          )}
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.habits.icon}
          </label>
          <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            {HABIT_ICONS.map((icon) => {
              const label = icon.labels?.[language] || icon.label;
              return (
                <button
                  key={icon.key}
                  type="button"
                  onClick={() => setValue('icon', icon.key)}
                  className={`
                    flex items-center justify-center w-8 h-8 rounded-lg text-base
                    transition-all border
                    ${
                      selectedIcon === icon.key || selectedIcon === icon.emoji
                        ? 'border-[var(--electric)] bg-[var(--border-bright)] scale-110 shadow-[0_0_8px_var(--electric-muted)] text-[var(--electric)]'
                        : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
                    }
                  `}
                  title={label}
                  aria-label={label}
                >
                  <HabitIcon icon={icon.key} size={16} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
            {tr.habits.color}
          </label>
          <div className="flex gap-2 flex-wrap p-2 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`
                  w-6 h-6 rounded-full transition-all
                  ${
                    selectedColor === color
                      ? 'ring-2 ring-[var(--electric)] ring-offset-2 ring-offset-[var(--bg-card)] scale-110 shadow-[0_0_8px_var(--electric-muted)]'
                      : 'hover:scale-105'
                  }
                `}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: 'var(--text-secondary)', background: 'var(--border-subtle)' }}
          >
            {tr.ui.cancel}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--electric) 0%, var(--blue-mid) 100%)',
              color: 'var(--bg-primary)',
              boxShadow: '0 0 16px var(--electric-muted)',
            }}
          >
            {tr.ui.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
