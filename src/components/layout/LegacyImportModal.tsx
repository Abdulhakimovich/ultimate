'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { getProfile } from '@/lib/data/profile';
import { getHabits } from '@/lib/data/habits';
import { getLegacyDataSummary, importLegacyData, skipLegacyImport, type LegacyDataSummary } from '@/lib/legacy-import';
import { useHabitsStore } from '@/store/habitsStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useLanguageStore } from '@/store/languageStore';
import { useToastStore } from '@/stores/toastStore';

export default function LegacyImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<LegacyDataSummary | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const language = useLanguageStore((s) => s.language);
  const loadHabits = useHabitsStore((s) => s.loadHabits);
  const loadCompletions = useHabitsStore((s) => s.loadCompletions);
  const loadMonthlyGoal = useHabitsStore((s) => s.loadMonthlyGoal);
  const currentMonth = useHabitsStore((s) => s.currentMonth);
  const loadWeekData = usePlannerStore((s) => s.loadWeekData);

  useEffect(() => {
    let isCancelled = false;

    async function checkImportEligibility() {
      try {
        const profile = await getProfile();
        if (isCancelled || !profile) return;

        // If local import has already been completed or skipped
        if (profile.local_import_done_at) return;

        // Check if account already has habits
        const existingHabits = await getHabits();
        if (isCancelled || existingHabits.length > 0) return;

        // Check if browser has legacy data
        const legacySummary = getLegacyDataSummary();
        if (legacySummary.hasData) {
          setSummary(legacySummary);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to check import eligibility:', err);
      }
    }

    checkImportEligibility();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleImport = async () => {
    setIsImporting(true);
    try {
      await importLegacyData();
      useToastStore.getState().addToast({
        message:
          language === 'ru'
            ? 'Данные успешно импортированы в ваш аккаунт!'
            : language === 'uz'
            ? "Ma'lumotlar hisobingizga muvaffaqiyatli yuklandi!"
            : 'Data successfully imported to your account!',
        variant: 'success',
      });
      // Refresh stores
      await loadHabits();
      await loadCompletions(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
      await loadMonthlyGoal(currentMonth.getFullYear(), currentMonth.getMonth() + 1);
      await loadWeekData();
      setIsOpen(false);
    } catch (err) {
      console.error('Import failed:', err);
      useToastStore.getState().addToast({
        message:
          language === 'ru'
            ? 'Ошибка импорта данных'
            : language === 'uz'
            ? 'Ma‘lumotlarni yuklashda xatolik yuz berdi'
            : 'Failed to import data',
        variant: 'error',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleSkip = async () => {
    try {
      await skipLegacyImport();
    } catch (err) {
      console.error('Failed to skip import:', err);
    }
    setIsOpen(false);
  };

  if (!isOpen || !summary) return null;

  const titleText =
    language === 'ru'
      ? 'Найдены локальные данные'
      : language === 'uz'
      ? 'Lokal ma‘lumotlar topildi'
      : 'Local browser data found';

  const bodyText =
    language === 'ru'
      ? `Мы обнаружили ${summary.habitsCount} привычек, ${summary.completionsCount} отметок и ${summary.tasksCount} задач в этом браузере. Импортировать их в ваш аккаунт?`
      : language === 'uz'
      ? `Ushbu brauzerda ${summary.habitsCount} ta odat, ${summary.completionsCount} ta bajarilish va ${summary.tasksCount} ta vazifa topildi. Ularni hisobingizga import qilinsinmi?`
      : `We found ${summary.habitsCount} habits, ${summary.completionsCount} completions, and ${summary.tasksCount} tasks saved in this browser. Import into your account?`;

  const importBtnText =
    language === 'ru' ? 'Импортировать' : language === 'uz' ? 'Import qilish' : 'Import';

  const skipBtnText =
    language === 'ru' ? 'Пропустить' : language === 'uz' ? 'O‘tkazib yuborish' : 'Skip';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md rounded-2xl p-6 shadow-2xl relative border-hairline"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--electric-glow)] border border-[var(--border-bright)]">
              <Sparkles size={20} style={{ color: 'var(--electric)' }} />
            </div>
            <div>
              <h2 className="font-display text-base font-bold">{titleText}</h2>
              <p className="text-[11px] text-[var(--text-muted)]">Ultimate Cloud Sync</p>
            </div>
          </div>

          <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>
            {bodyText}
          </p>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleSkip}
              disabled={isImporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors hover:bg-[var(--bg-elevated)]"
              style={{ color: 'var(--text-secondary)' }}
            >
              {skipBtnText}
            </button>

            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#07090E] transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, var(--electric), var(--blue-neon))',
              }}
            >
              {isImporting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{language === 'ru' ? 'Импорт...' : 'Importing...'}</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>{importBtnText}</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
