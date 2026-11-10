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
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7BA7CC' }}>
            {tr.habits.name}
          </label>
          <input
            {...register('name')}
            type="text"
            placeholder={tr.habits.namePlaceholder}
            className="w-full px-3 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{
              background: '#0B1320',
              border: '1px solid rgba(0,212,255,0.25)',
              color: '#E8F4FF',
            }}
            aria-label={tr.habits.name}
          />
          {errors.name && (
            <p className="text-xs text-[#FF3366] mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Target */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7BA7CC' }}>
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
                background: '#0B1320',
                border: '1px solid rgba(0,212,255,0.25)',
                color: '#00D4FF',
              }}
              aria-label={tr.habits.target}
            />
            <span className="text-xs" style={{ color: '#7BA7CC' }}>
              {tr.habits.targetLabel}
            </span>
          </div>
          {errors.target && (
            <p className="text-xs text-[#FF3366] mt-1">{errors.target.message}</p>
          )}
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7BA7CC' }}>
            {tr.habits.icon}
          </label>
          <div className="grid grid-cols-8 gap-1.5 p-2 rounded-xl" style={{ background: '#0B1320', border: '1px solid rgba(255,255,255,0.06)' }}>
            {HABIT_ICONS.map((icon) => (
              <button
                key={icon.key}
                type="button"
                onClick={() => setValue('icon', icon.emoji)}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg text-base
                  transition-all border
                  ${
                    selectedIcon === icon.emoji
                      ? 'border-[#00D4FF] bg-[rgba(0,212,255,0.2)] scale-110 shadow-[0_0_8px_rgba(0,212,255,0.4)]'
                      : 'border-transparent hover:bg-[rgba(255,255,255,0.06)]'
                  }
                `}
                title={icon.label}
                aria-label={icon.label}
              >
                {icon.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color Picker */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: '#7BA7CC' }}>
            {tr.habits.color}
          </label>
          <div className="flex gap-2 flex-wrap p-2 rounded-xl" style={{ background: '#0B1320', border: '1px solid rgba(255,255,255,0.06)' }}>
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setValue('color', color)}
                className={`
                  w-6 h-6 rounded-full transition-all
                  ${
                    selectedColor === color
                      ? 'ring-2 ring-[#00D4FF] ring-offset-2 ring-offset-[#111827] scale-110 shadow-[0_0_8px_rgba(0,212,255,0.6)]'
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
        <div className="flex justify-end gap-2 pt-3 border-t border-[rgba(0,212,255,0.12)]">
          <button
            type="button"
            onClick={() => {
              reset();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: '#7BA7CC', background: 'rgba(255,255,255,0.05)' }}
          >
            {tr.ui.cancel}
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, #00D4FF 0%, #1E90FF 100%)',
              color: '#080C14',
              boxShadow: '0 0 16px rgba(0,212,255,0.5)',
            }}
          >
            {tr.ui.save}
          </button>
        </div>
      </form>
    </Modal>
  );
}
