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
