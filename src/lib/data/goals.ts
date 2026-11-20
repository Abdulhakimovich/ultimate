import { createClient } from '@/lib/supabase/client';
import type { MonthlyGoal } from '@/lib/types';

export async function getMonthlyGoal(year: number, month: number): Promise<MonthlyGoal | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('monthly_goals')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    year: data.year,
    month: data.month,
    goal_text: data.goal_text || '',
    habit_targets: data.habit_targets || {},
  } as MonthlyGoal;
}

export async function getAllGoals(): Promise<MonthlyGoal[]> {
  const supabase = createClient();
  const PAGE_SIZE = 1000;
  let all: MonthlyGoal[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('monthly_goals')
      .select('*')
      .order('year', { ascending: true })
      .order('month', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(
      data.map((d) => ({
        id: d.id,
        user_id: d.user_id,
        year: d.year,
        month: d.month,
        goal_text: d.goal_text || '',
        habit_targets: d.habit_targets || {},
      })) as MonthlyGoal[]
    );
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}

export async function upsertMonthlyGoal(
  year: number,
  month: number,
  data: Partial<MonthlyGoal>
): Promise<MonthlyGoal> {
  const supabase = createClient();
  const existing = await getMonthlyGoal(year, month);

  if (existing) {
    const updated = {
      ...existing,
      ...data,
    };
    const { error } = await supabase
      .from('monthly_goals')
      .update({
        goal_text: updated.goal_text,
        habit_targets: updated.habit_targets,
      })
      .eq('id', existing.id);

    if (error) throw error;
    return updated;
  } else {
    const id = data.id || crypto.randomUUID();
    const created: MonthlyGoal = {
      id,
      user_id: '',
      year,
      month,
      goal_text: data.goal_text || '',
      habit_targets: data.habit_targets || {},
    };

    const { error } = await supabase.from('monthly_goals').insert({
      id: created.id,
      year: created.year,
      month: created.month,
      goal_text: created.goal_text,
      habit_targets: created.habit_targets,
    });

    if (error) throw error;
    return created;
  }
}
