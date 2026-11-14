import { createClient } from '@/lib/supabase/client';
import type { Task } from '@/lib/types';

export async function getTasksForDateRange(startDate: string, endDate: string): Promise<Task[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .gte('day_date', startDate)
    .lte('day_date', endDate)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data || []) as Task[];
}

export async function createTask(task: Task): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').insert({
    id: task.id,
    day_date: task.day_date,
    text: task.text,
    completed: task.completed,
    sort_order: task.sort_order,
  });

  if (error) throw error;
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderTasks(dateStr: string, orderedIds: string[]): Promise<void> {
  const supabase = createClient();
  const promises = orderedIds.map((id, index) =>
    supabase.from('tasks').update({ sort_order: index }).eq('id', id)
  );
  const results = await Promise.all(promises);
  for (const res of results) {
    if (res.error) throw res.error;
  }
}
