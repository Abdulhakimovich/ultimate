import { createClient } from '@/lib/supabase/client';
import type { HabitCompletion } from '@/lib/types';

export async function getCompletions(year: number, month: number): Promise<HabitCompletion[]> {
  const supabase = createClient();
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

  const { data, error } = await supabase
    .from('habit_completions')
    .select('*')
    .gte('completed_date', startDate)
    .lt('completed_date', endDate);

  if (error) throw error;
  return (data || []) as HabitCompletion[];
}

export async function getAllCompletions(): Promise<HabitCompletion[]> {
  const supabase = createClient();
  const PAGE_SIZE = 1000;
  let all: HabitCompletion[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data as HabitCompletion[]);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

export async function insertCompletion(completion: HabitCompletion): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habit_completions').insert({
    id: completion.id,
    habit_id: completion.habit_id,
    completed_date: completion.completed_date,
  });

  if (error) throw error;
}

export async function deleteCompletion(habitId: string, completedDate: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('habit_completions')
    .delete()
    .eq('habit_id', habitId)
    .eq('completed_date', completedDate);

  if (error) throw error;
}
