import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('profiles').select('*').maybeSingle();
  if (error) {
    console.error('Failed to get profile:', error);
    return null;
  }
  return data as Profile | null;
}

export async function updateProfile(updates: Partial<Profile>): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}
