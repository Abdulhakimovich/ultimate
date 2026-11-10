import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { z } from 'zod';

const createTaskSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  text: z.string().min(1).max(500),
});

const updateTaskSchema = z.object({
  id: z.string().min(1),
  completed: z.boolean().optional(),
  text: z.string().optional(),
  sort_order: z.number().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, mode: 'local', tasks: [] });
    }

    const supabase = await createClient();
    let query = supabase.from('tasks').select('*');

    if (startDate && endDate) {
      query = query.gte('day_date', startDate).lte('day_date', endDate);
    }

    const { data, error } = await query.order('sort_order', { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tasks: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = createTaskSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        mode: 'local',
        task: {
          id: crypto.randomUUID(),
          day_date: parsed.data.date,
          text: parsed.data.text,
          completed: false,
          sort_order: 0,
        },
      });
    }

    const supabase = await createClient();
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        day_date: parsed.data.date,
        text: parsed.data.text,
        completed: false,
        sort_order: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const json = await request.json();
    const parsed = updateTaskSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    if (!isSupabaseConfigured) {
      return NextResponse.json({ success: true, mode: 'local' });
    }

    const supabase = await createClient();
    const { id, ...updates } = parsed.data;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, task: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
