'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, Flame, Check } from 'lucide-react';
import { useHabitsStore } from '@/store/habitsStore';
import { useLanguageStore } from '@/store/languageStore';
import { t } from '@/lib/i18n';
import { toDateString } from '@/lib/utils/dates';
import { isHabitCompletedOnDate } from '@/lib/utils/calculations';
import { getHabitDisplayName } from '@/lib/utils/habitDisplay';
import { triggerFeedback } from '@/lib/feedback';
import ConfettiBurst from '@/components/ui/ConfettiBurst';

export default function TodaySummaryBar() {
  const habits = useHabitsStore((s) => s.habits);
  const completions = useHabitsStore((s) => s.completions);
  const toggleCompletion = useHabitsStore((s) => s.toggleCompletion);
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const [showConfetti, setShowConfetti] = useState(false);

  const todayStr = toDateString(new Date());

  const totalHabits = habits.length;
  if (totalHabits === 0) return null;

  const completedToday = habits.filter((h) =>
    isHabitCompletedOnDate(completions, h.id, todayStr)
  );
  const remainingToday = habits.filter(
    (h) => !isHabitCompletedOnDate(completions, h.id, todayStr)
  );

  const completionPct = Math.round((completedToday.length / totalHabits) * 100);
  const isAllDone = remainingToday.length === 0;

  const handleQuickCheck = (habitId: string) => {
    if (remainingToday.length === 1) {
      triggerFeedback('celebrate');
      setShowConfetti(true);
    } else {
      triggerFeedback('check');
    }
    toggleCompletion(habitId, todayStr);
  };

  return (
    <div
      className="surface-card p-4 rounded-xl transition-all duration-200"
      style={{
        background: isAllDone
          ? 'linear-gradient(135deg, var(--electric-glow) 0%, var(--bg-card) 100%)'
          : 'var(--bg-card)',
        borderColor: isAllDone ? 'var(--electric)' : 'var(--border)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Status and progress */}
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isAllDone ? 'var(--electric)' : 'var(--electric-glow)',
              color: isAllDone ? '#07090E' : 'var(--electric)',
            }}
          >
            {isAllDone ? (
              <Sparkles size={18} className="animate-bounce" />
            ) : (
              <Flame size={18} className="animate-flame" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {tr.tracker.todayDate}
              </span>
              <span
                className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--electric-glow)',
                  color: 'var(--electric)',
                  border: isAllDone ? '1px solid var(--electric)' : 'none',
                }}
              >
                {completedToday.length}/{totalHabits} ({completionPct}%)
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: isAllDone ? 'var(--electric)' : 'var(--text-secondary)' }}>
              {isAllDone ? tr.tracker.allDoneToday : `${tr.tracker.todayRemaining}: ${remainingToday.length}`}
            </p>
          </div>
        </div>

        {/* Right: Quick-check actionable pills for remaining habits */}
        {!isAllDone && remainingToday.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {remainingToday.slice(0, 4).map((h) => (
              <button
                key={h.id}
                onClick={() => handleQuickCheck(h.id)}
                className="text-xs px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 touch-target sm:touch-auto"
                style={{
                  background: 'var(--bg-elevated)',
                  borderColor: 'var(--border-bright)',
                  color: 'var(--text-primary)',
                }}
                title={`Mark ${getHabitDisplayName(h, language)} as done for today`}
              >
                <span>{h.icon || '✓'}</span>
                <span className="max-w-[120px] truncate">{getHabitDisplayName(h, language)}</span>
                <Check size={12} className="opacity-50" />
              </button>
            ))}
            {remainingToday.length > 4 && (
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                +{remainingToday.length - 4}
              </span>
            )}
          </div>
        )}

        {isAllDone && (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: [1, 1.06, 1], opacity: 1 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center gap-1.5 text-xs font-bold font-display px-3 py-1.5 rounded-xl border shadow-sm select-none"
            style={{
              background: 'var(--electric-glow)',
              borderColor: 'var(--electric)',
              color: 'var(--electric)',
            }}
          >
            <CheckCircle2 size={16} style={{ color: 'var(--electric)' }} />
            <span className="tracking-wide">100% COMPLETE</span>
          </motion.div>
        )}
      </div>

      {showConfetti && <ConfettiBurst onComplete={() => setShowConfetti(false)} />}
    </div>
  );
}
