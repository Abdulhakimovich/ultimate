import { createClient } from '@/lib/supabase/client';
import type { Habit } from '@/lib/types';

export async function getHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('archived', false)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Habit[];
}

export async function getAllHabits(): Promise<Habit[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Habit[];
}

export async function createHabit(habit: Habit): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habits').insert({
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    archived: habit.archived ?? false,
    sort_order: habit.sort_order ?? 0,
  });

  if (error) throw error;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habits').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteHabit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function archiveHabit(id: string): Promise<void> {
  await updateHabit(id, { archived: true });
}

export async function reorderHabits(orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  const promises = orderedIds.map((id, index) =>
    supabase.from('habits').update({ sort_order: index }).eq('id', id)
  );
  const results = await Promise.all(promises);
  for (const res of results) {
    if (res.error) throw res.error;
  }
}
