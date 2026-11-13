import { create } from 'zustand';

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
      return { soundEnabled: next };
    }),
  setSoundEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ht_sound_enabled', String(enabled));
    }
    set({ soundEnabled: enabled });
  },
  toggleHaptics: () =>
    set((s) => {
      const next = !s.hapticsEnabled;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ht_haptics_enabled', String(next));
      }
      return { hapticsEnabled: next };
    }),
  setHapticsEnabled: (enabled) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ht_haptics_enabled', String(enabled));
    }
    set({ hapticsEnabled: enabled });
  },
}));
