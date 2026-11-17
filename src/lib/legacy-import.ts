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
  const completions = getStoredArray<HabitCompletion>(LEGACY_STORAGE_KEYS.completions).filter(
    (c) => !c.id?.startsWith('c-backfill-')
  );
  const tasks = getStoredArray<Task>(LEGACY_STORAGE_KEYS.tasks);

  const hasData = habits.length > 0 || tasks.length > 0;
  return {
    habitsCount: habits.length,
    completionsCount: completions.length,
    tasksCount: tasks.length,
    hasData,
  };
}

export function isValidUUID(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function toDeterministicUUID(userId: string, id: string): Promise<string> {
  if (isValidUUID(id)) return id;
  const encoder = new TextEncoder();
  const data = encoder.encode(`${userId}:${id}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(hashBuffer, 0, 16);
  // Set version to 4 (0100) -> 0x40
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  // Set variant to RFC 4122 (10xx) -> 0x80
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function chunkArray<T>(items: T[], size = 500): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function importLegacyData(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(userError?.message || 'Пользователь не авторизован');
  }

  const userId = user.id;

  const habits = getStoredArray<Habit>(LEGACY_STORAGE_KEYS.habits);
  const rawCompletions = getStoredArray<HabitCompletion>(LEGACY_STORAGE_KEYS.completions);
  const goals = getStoredArray<MonthlyGoal>(LEGACY_STORAGE_KEYS.goals);
  const tasks = getStoredArray<Task>(LEGACY_STORAGE_KEYS.tasks);
  const entries = getStoredArray<DailyEntry>(LEGACY_STORAGE_KEYS.entries);

  // Map old IDs (e.g. h-1) to deterministic UUIDs
  const idMap = new Map<string, string>();

  // 1. Import Habits (upsert on id)
  const habitRows = await Promise.all(
    habits.map(async (h, i) => {
      const newId = await toDeterministicUUID(userId, h.id);
      idMap.set(h.id, newId);
      return {
        id: newId,
        user_id: userId,
        name: h.name,
        icon: h.icon || '🎯',
        color: h.color || '#00D4FF',
        archived: Boolean(h.archived),
        sort_order: h.sort_order ?? i,
      };
    })
  );

  for (const chunk of chunkArray(habitRows, 500)) {
    const { error } = await supabase.from('habits').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error('Failed to import habits chunk:', error);
      throw error;
    }
  }

  // 2. Import Completions (always skip c-backfill-)
  // Natural unique key: (user_id, habit_id, completed_date), ignoreDuplicates: true
  const validCompletions = rawCompletions.filter((c) => !c.id?.startsWith('c-backfill-'));
  const completionRows = await Promise.all(
    validCompletions.map(async (c) => {
      const remappedHabitId = idMap.get(c.habit_id) || (await toDeterministicUUID(userId, c.habit_id));
      const newCompId = await toDeterministicUUID(userId, c.id);
      return {
        id: newCompId,
        user_id: userId,
        habit_id: remappedHabitId,
        completed_date: c.completed_date,
      };
    })
  );

  // Only import completions that point to an existing/imported habit
  const knownHabitIds = new Set(idMap.values());
  const linkableCompletions = completionRows.filter((c) => knownHabitIds.has(c.habit_id));

  for (const chunk of chunkArray(linkableCompletions, 500)) {
    const { error } = await supabase.from('habit_completions').upsert(chunk, {
      onConflict: 'user_id,habit_id,completed_date',
      ignoreDuplicates: true,
    });
    if (error) {
      console.error('Failed to import habit completions chunk:', error);
      throw error;
    }
  }

  // 3. Import Monthly Goals
  // Natural unique key: (user_id, year, month), ignoreDuplicates: true
  const goalRows = await Promise.all(
    goals.map(async (g) => {
      const remappedTargets: Record<string, number> = {};
      if (g.habit_targets) {
        for (const [hId, target] of Object.entries(g.habit_targets)) {
          const remappedHId = idMap.get(hId) || (await toDeterministicUUID(userId, hId));
          remappedTargets[remappedHId] = target;
        }
      }
      const newGoalId = await toDeterministicUUID(userId, g.id);
      return {
        id: newGoalId,
        user_id: userId,
        year: g.year,
        month: g.month,
        goal_text: g.goal_text || '',
        habit_targets: remappedTargets,
      };
    })
  );

  for (const chunk of chunkArray(goalRows, 500)) {
    const { error } = await supabase.from('monthly_goals').upsert(chunk, {
      onConflict: 'user_id,year,month',
      ignoreDuplicates: true,
    });
    if (error) {
      console.error('Failed to import monthly goals chunk:', error);
      throw error;
    }
  }

  // 4. Import Tasks (upsert on id)
  const taskRows = await Promise.all(
    tasks.map(async (t, i) => {
      const newTaskId = await toDeterministicUUID(userId, t.id);
      return {
        id: newTaskId,
        user_id: userId,
        day_date: t.day_date,
        text: t.text,
        completed: Boolean(t.completed),
        sort_order: t.sort_order ?? i,
      };
    })
  );

  for (const chunk of chunkArray(taskRows, 500)) {
    const { error } = await supabase.from('tasks').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error('Failed to import tasks chunk:', error);
      throw error;
    }
  }

  // 5. Import Daily Entries
  // Natural unique key: (user_id, day_date), ignoreDuplicates: true
  const entryRows = await Promise.all(
    entries.map(async (e) => {
      const newEntryId = await toDeterministicUUID(userId, e.id);
      return {
        id: newEntryId,
        user_id: userId,
        day_date: e.day_date,
        notes: e.notes || ['', '', '', ''],
        improvements: e.improvements || ['', '', '', ''],
        gratitude: e.gratitude || ['', '', '', ''],
      };
    })
  );

  for (const chunk of chunkArray(entryRows, 500)) {
    const { error } = await supabase.from('daily_entries').upsert(chunk, {
      onConflict: 'user_id,day_date',
      ignoreDuplicates: true,
    });
    if (error) {
      console.error('Failed to import daily entries chunk:', error);
      throw error;
    }
  }

  // Mark local import as done in profiles ONLY after everything succeeded
  await updateProfile({ local_import_done_at: new Date().toISOString() });
}

export async function skipLegacyImport(): Promise<void> {
  await updateProfile({ local_import_done_at: new Date().toISOString() });
}
