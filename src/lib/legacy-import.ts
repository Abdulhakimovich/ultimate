import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/data/profile';
import type { Habit, HabitCompletion, MonthlyGoal, Task, DailyEntry } from '@/lib/types';

const LEGACY_STORAGE_KEYS = {
  habits: 'ht_habits',
  completions: 'ht_completions',
  goals: 'ht_monthly_goals',
  tasks: 'ht_tasks',
  entries: 'ht_daily_entries',
} as const;

function getStoredArray<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export interface LegacyDataSummary {
  habitsCount: number;
  completionsCount: number;
  tasksCount: number;
  hasData: boolean;
}

export function getLegacyDataSummary(): LegacyDataSummary {
  if (typeof window === 'undefined') {
    return { habitsCount: 0, completionsCount: 0, tasksCount: 0, hasData: false };
  }

  const habits = getStoredArray<Habit>(LEGACY_STORAGE_KEYS.habits);
  const completions = getStoredArray<HabitCompletion>(LEGACY_STORAGE_KEYS.completions)
    .filter((c) => !c.id?.startsWith('c-backfill-'));
  const tasks = getStoredArray<Task>(LEGACY_STORAGE_KEYS.tasks);

  const hasData = habits.length > 0 || tasks.length > 0;
  return {
    habitsCount: habits.length,
    completionsCount: completions.length,
    tasksCount: tasks.length,
    hasData,
  };
}

function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function importLegacyData(): Promise<void> {
  const supabase = createClient();

  const habits = getStoredArray<Habit>(LEGACY_STORAGE_KEYS.habits);
  const rawCompletions = getStoredArray<HabitCompletion>(LEGACY_STORAGE_KEYS.completions);
  const goals = getStoredArray<MonthlyGoal>(LEGACY_STORAGE_KEYS.goals);
  const tasks = getStoredArray<Task>(LEGACY_STORAGE_KEYS.tasks);
  const entries = getStoredArray<DailyEntry>(LEGACY_STORAGE_KEYS.entries);

  // Map old IDs (e.g. h-1) to new UUIDs
  const idMap = new Map<string, string>();

  // 1. Import Habits
  for (let i = 0; i < habits.length; i++) {
    const h = habits[i];
    const newId = isValidUUID(h.id) ? h.id : crypto.randomUUID();
    idMap.set(h.id, newId);

    await supabase.from('habits').upsert(
      {
        id: newId,
        name: h.name,
        icon: h.icon || '🎯',
        color: h.color || '#00D4FF',
        archived: Boolean(h.archived),
        sort_order: i,
      },
      { onConflict: 'id' }
    );
  }

  // 2. Import Completions (always skip c-backfill-)
  const validCompletions = rawCompletions.filter((c) => !c.id?.startsWith('c-backfill-'));
  for (const c of validCompletions) {
    const remappedHabitId = idMap.get(c.habit_id) || c.habit_id;
    // Only import completions that point to an existing habit
    if (![...idMap.values()].includes(remappedHabitId)) {
      continue;
    }
    const newCompId = isValidUUID(c.id) ? c.id : crypto.randomUUID();
    await supabase.from('habit_completions').upsert(
      {
        id: newCompId,
        habit_id: remappedHabitId,
        completed_date: c.completed_date,
      },
      { onConflict: 'id' }
    );
  }

  // 3. Import Monthly Goals
  for (const g of goals) {
    const remappedTargets: Record<string, number> = {};
    if (g.habit_targets) {
      for (const [hId, target] of Object.entries(g.habit_targets)) {
        const remappedHId = idMap.get(hId) || hId;
        remappedTargets[remappedHId] = target;
      }
    }
    const newGoalId = isValidUUID(g.id) ? g.id : crypto.randomUUID();
    await supabase.from('monthly_goals').upsert(
      {
        id: newGoalId,
        year: g.year,
        month: g.month,
        goal_text: g.goal_text || '',
        habit_targets: remappedTargets,
      },
      { onConflict: 'id' }
    );
  }

  // 4. Import Tasks
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i];
    const newTaskId = isValidUUID(t.id) ? t.id : crypto.randomUUID();
    await supabase.from('tasks').upsert(
      {
        id: newTaskId,
        day_date: t.day_date,
        text: t.text,
        completed: Boolean(t.completed),
        sort_order: t.sort_order ?? i,
      },
      { onConflict: 'id' }
    );
  }

  // 5. Import Daily Entries
  for (const e of entries) {
    const newEntryId = isValidUUID(e.id) ? e.id : crypto.randomUUID();
    await supabase.from('daily_entries').upsert(
      {
        id: newEntryId,
        day_date: e.day_date,
        notes: e.notes || ['', '', '', ''],
        improvements: e.improvements || ['', '', '', ''],
        gratitude: e.gratitude || ['', '', '', ''],
      },
      { onConflict: 'id' }
    );
  }

  // Mark local import as done in profiles
  await updateProfile({ local_import_done_at: new Date().toISOString() });
}

export async function skipLegacyImport(): Promise<void> {
  await updateProfile({ local_import_done_at: new Date().toISOString() });
}
