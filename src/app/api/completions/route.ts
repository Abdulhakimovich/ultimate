import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { z } from 'zod';

const toggleCompletionSchema = z.object({
  habitId: z.string().uuid().or(z.string().min(1)),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, mode: 'local', completions: [] });
    }

    const supabase = await createClient();
    let query = supabase.from('habit_completions').select('*');

    if (year && month) {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = `${year}-${String(month).padStart(2, '0')}-31`;
      query = query.gte('completed_date', startDate).lte('completed_date', endDate);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, completions: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = toggleCompletionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, mode: 'local' });
    }

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    // Check if completion exists
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('user_id', userId)
      .eq('habit_id', parsed.data.habitId)
      .eq('completed_date', parsed.data.date)
      .maybeSingle();

    if (existing) {
      // Remove
      await supabase
        .from('habit_completions')
        .delete()
        .eq('id', existing.id);

      return NextResponse.json({ success: true, completed: false });
    } else {
      // Insert
      const { data, error } = await supabase
        .from('habit_completions')
        .insert({
          user_id: userId,
          habit_id: parsed.data.habitId,
          completed_date: parsed.data.date,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, completed: true, completion: data });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
