import { createClient } from '@/lib/supabase/client';
import type { DailyEntry } from '@/lib/types';

export async function getDailyEntry(dayDate: string): Promise<DailyEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('daily_entries')
    .select('*')
    .eq('day_date', dayDate)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    day_date: data.day_date,
    notes: data.notes || ['', '', '', ''],
    improvements: data.improvements || ['', '', '', ''],
    gratitude: data.gratitude || ['', '', '', ''],
  } as DailyEntry;
}

export async function upsertDailyEntry(
  dayDate: string,
  data: Partial<DailyEntry>
): Promise<DailyEntry> {
  const supabase = createClient();
  const existing = await getDailyEntry(dayDate);

  if (existing) {
    const updated: DailyEntry = {
      ...existing,
      ...data,
    };
    const { error } = await supabase
      .from('daily_entries')
      .update({
        notes: updated.notes,
        improvements: updated.improvements,
        gratitude: updated.gratitude,
      })
      .eq('id', existing.id);

    if (error) throw error;
    return updated;
  } else {
    const id = data.id || crypto.randomUUID();
    const created: DailyEntry = {
      id,
      user_id: '',
      day_date: dayDate,
      notes: data.notes || ['', '', '', ''],
      improvements: data.improvements || ['', '', '', ''],
      gratitude: data.gratitude || ['', '', '', ''],
    };

    const { error } = await supabase.from('daily_entries').insert({
      id: created.id,
      day_date: created.day_date,
      notes: created.notes,
      improvements: created.improvements,
      gratitude: created.gratitude,
    });

    if (error) throw error;
    return created;
  }
}
