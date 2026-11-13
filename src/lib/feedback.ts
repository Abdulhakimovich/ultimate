'use client';

import { useFeedbackStore } from '@/store/feedbackStore';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Play a crisp, subtle haptic-like click sound
 */
export function playCheckSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Snappy pitch drop from 880Hz to 380Hz
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(380, now + 0.045);

    // Exponential gain decay
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch {
    // Ignore audio context errors gracefully
  }
}

/**
 * Play a subtle low uncheck click
 */
export function playUncheckSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // Ignore audio context errors
  }
}

/**
 * Play an inspiring ascending victory chord chime when checking off all habits for the day!
 */
export function playCelebrationSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { freq: 523.25, time: 0.00 }, // C5
      { freq: 659.25, time: 0.08 }, // E5
      { freq: 783.99, time: 0.16 }, // G5
      { freq: 1046.50, time: 0.24 }, // C6
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time }) => {
      const noteTime = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      noteGain.gain.setValueAtTime(0.2, noteTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.45);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  } catch {
    // Ignore audio context errors
  }
}

/**
 * Trigger physical haptic feedback via Navigator.vibrate
 */
export function triggerHaptic(pattern: number | number[] = 12) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignore vibration errors
    }
  }
}

/**
 * Unified feedback dispatcher respecting user sound and haptics preferences
 */
export function triggerFeedback(type: 'check' | 'uncheck' | 'celebrate' | 'milestone' = 'check') {
  const { soundEnabled, hapticsEnabled } = useFeedbackStore.getState();

  if (soundEnabled) {
    if (type === 'check') playCheckSound();
    else if (type === 'uncheck') playUncheckSound();
    else if (type === 'celebrate' || type === 'milestone') playCelebrationSound();
  }

  if (hapticsEnabled) {
    if (type === 'check') triggerHaptic(12);
    else if (type === 'uncheck') triggerHaptic(8);
    else if (type === 'celebrate') triggerHaptic([30, 45, 30, 45, 75]);
    else if (type === 'milestone') triggerHaptic([40, 50, 40, 50, 100]);
  }
}
