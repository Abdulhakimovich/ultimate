'use client';
import { create } from 'zustand';
import type { Profile } from '@/lib/types';
import { getProfile, updateProfile } from '@/lib/data/profile';
import { useToastStore } from '@/stores/toastStore';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  setProfile: (p: Profile | null) => void;
  loadProfile: () => Promise<void>;
  saveProfile: (partial: Partial<Profile>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: true,
  setProfile: (p) => set({ profile: p, loading: false }),
  loadProfile: async () => {
    try {
      set({ loading: true });
      const p = await getProfile();
      set({ profile: p, loading: false });
    } catch (err) {
      console.error('Failed to load profile:', err);
      set({ loading: false });
    }
  },
  saveProfile: async (partial) => {
    const previous = get().profile;
    // optimistic update
    set({ profile: previous ? { ...previous, ...partial } : null });
    try {
      await updateProfile(partial);
    } catch {
      // rollback
      set({ profile: previous });
      useToastStore.getState().addToast({ message: 'Failed to save profile', variant: 'error' });
    }
  },
}));
