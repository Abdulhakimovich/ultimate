'use client';

import React, { useState } from 'react';
import { Database, Download, Loader2 } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';
import { useToastStore } from '@/stores/toastStore';
import { t } from '@/lib/i18n';
import { getProfile } from '@/lib/data/profile';
import { getAllHabits } from '@/lib/data/habits';
import { getAllCompletions } from '@/lib/data/completions';
import { getAllGoals } from '@/lib/data/goals';
import { getAllTasks } from '@/lib/data/tasks';
import { getAllEntries } from '@/lib/data/entries';

export default function DataSection() {
  const language = useLanguageStore((s) => s.language);
  const tr = t(language);
  const addToast = useToastStore((s) => s.addToast);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const [profile, habits, completions, goals, tasks, entries] = await Promise.all([
        getProfile(),
        getAllHabits(),
        getAllCompletions(),
        getAllGoals(),
        getAllTasks(),
        getAllEntries(),
      ]);

      const exportPayload = {
        app: 'Ultimate Habit Tracker',
        version: 1,
        exported_at: new Date().toISOString(),
        profile,
        habits,
        completions,
        monthly_goals: goals,
        tasks,
        daily_entries: entries,
      };

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const todayStr = new Date().toISOString().slice(0, 10);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ultimate-export-${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addToast({ message: tr.profile.dataDownloaded, variant: 'success' });
    } catch (err) {
      console.error('Data export error:', err);
      addToast({ message: tr.profile.dataDownloadError, variant: 'error' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="surface-card rounded-2xl p-5 border-hairline space-y-4">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-[var(--electric)]" />
        <h2 className="font-display font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {tr.profile.dataTitle}
        </h2>
      </div>

      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
        {tr.profile.downloadData}
      </p>

      <button
        type="button"
        onClick={handleExport}
        disabled={exporting}
        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-bright)',
          color: 'var(--text-primary)',
        }}
      >
        {exporting ? (
          <>
            <Loader2 size={14} className="animate-spin text-[var(--electric)]" />
            <span>{tr.profile.downloadingData}</span>
          </>
        ) : (
          <>
            <Download size={14} className="text-[var(--electric)]" />
            <span>{tr.profile.downloadData}</span>
          </>
        )}
      </button>
    </div>
  );
}
