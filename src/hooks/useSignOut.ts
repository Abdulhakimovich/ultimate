'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useHabitsStore } from '@/store/habitsStore';
import { usePlannerStore } from '@/store/plannerStore';
import { useProfileStore } from '@/store/profileStore';

export function useSignOut() {
  const router = useRouter();
  return async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
    useHabitsStore.setState({ habits: [], completions: [], allCompletions: [], monthlyGoal: null, isLoading: true });
    usePlannerStore.setState({ tasksByDate: {}, entriesByDate: {}, isLoading: true });
    useProfileStore.setState({ profile: null, loading: true });
    router.push('/login');
  };
}
