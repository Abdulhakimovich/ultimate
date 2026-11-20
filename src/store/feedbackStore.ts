import { create } from 'zustand';
import { updateProfile } from '@/lib/data/profile';

interface FeedbackState {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  toggleSound: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleHaptics: () => void;
  setHapticsEnabled: (enabled: boolean) => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  soundEnabled: typeof window !== 'undefined' ? localStorage.getItem('ht_sound_enabled') !== 'false' : true,
  hapticsEnabled: typeof window !== 'undefined' ? localStorage.getItem('ht_haptics_enabled') !== 'false' : true,
  toggleSound: () =>
    set((s) => {
      const next = !s.soundEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_sound_enabled', String(next));
      }
      updateProfile({ sound_enabled: next }).catch(() => {});
      return { soundEnabled: next };
    }),
  setSoundEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ht_sound_enabled', String(enabled));
    }
    set({ soundEnabled: enabled });
    updateProfile({ sound_enabled: enabled }).catch(() => {});
  },
  toggleHaptics: () =>
    set((s) => {
      const next = !s.hapticsEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_haptics_enabled', String(next));
      }
      updateProfile({ haptics_enabled: next }).catch(() => {});
      return { hapticsEnabled: next };
    }),
  setHapticsEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ht_haptics_enabled', String(enabled));
    }
    set({ hapticsEnabled: enabled });
    updateProfile({ haptics_enabled: enabled }).catch(() => {});
  },
}));
