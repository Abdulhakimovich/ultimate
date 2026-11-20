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

export async function getAllTasks(): Promise<Task[]> {
  const supabase = createClient();
  const PAGE_SIZE = 1000;
  let all: Task[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('day_date', { ascending: true })
      .order('sort_order', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data || data.length === 0) break;
    all = all.concat(data as Task[]);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
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
