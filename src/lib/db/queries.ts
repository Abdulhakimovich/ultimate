import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import * as storage from '@/lib/storage';
import type { Habit, HabitCompletion, MonthlyGoal, Task, DailyEntry } from '@/lib/types';

// Habits queries
export async function fetchHabits(): Promise<Habit[]> {
  if (!isSupabaseConfigured) {
    return storage.getHabits();
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: true });

  if (error || !data) {
    return storage.getHabits();
  }
  return data as Habit[];
}

export async function insertHabit(data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'archived'>): Promise<Habit> {
  if (!isSupabaseConfigured) {
    return storage.createHabit(data);
  }
  const supabase = createClient();
  const { data: user } = await supabase.auth.getUser();
  const userId = user?.user?.id || 'local';

  const { data: inserted, error } = await supabase
    .from('habits')
    .insert({
      user_id: userId,
      name: data.name,
      icon: data.icon,
      color: data.color,
    })
    .select()
    .single();

  if (error || !inserted) {
    return storage.createHabit(data);
  }
  return inserted as Habit;
}

// Completions queries
export async function fetchCompletions(year: number, month: number): Promise<HabitCompletion[]> {
  if (!isSupabaseConfigured) {
    return storage.getCompletions(year, month);
  }
  const supabase = createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month).padStart(2, '0')}-31`;

  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .gte('completed_date', startDate)
    .lte('completed_date', endDate);

  if (error || !data) {
    return storage.getCompletions(year, month);
  }
  return data as HabitCompletion[];
}

// Tasks queries
export async function fetchTasks(startDate: string, endDate: string): Promise<Task[]> {
  if (!isSupabaseConfigured) {
    return storage.getTasksForDateRange(startDate, endDate);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('day_date', startDate)
    .lte('day_date', endDate)
    .order('sort_order', { ascending: true });

  if (error || !data) {
    return storage.getTasksForDateRange(startDate, endDate);
  }
  return data as Task[];
}

// Daily Entries queries
export async function fetchDailyEntry(dateStr: string): Promise<DailyEntry | null> {
  if (!isSupabaseConfigured) {
    return storage.getDailyEntry(dateStr);
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('day_date', dateStr)
    .maybeSingle();

  if (error || !data) {
    return storage.getDailyEntry(dateStr);
  }
  return data as DailyEntry;
}
