'use client';

import { useCallback, useRef } from 'react';

export function useSound(enabled: boolean = true, volume: number = 0.5) {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === 'undefined') return null;
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playKeySound = useCallback((type: 'standard' | 'space' | 'error' = 'standard') => {
    if (!enabled || volume <= 0) return;

    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Bandpass filter to simulate mechanical switch body resonance
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';

      if (type === 'space') {
        // Spacebar: deeper, richer bottom-out thock
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        filter.frequency.setValueAtTime(280, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(volume * 0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'error') {
        // Error key: slightly sharp, muted tick
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

        filter.frequency.setValueAtTime(400, now);
        filter.Q.setValueAtTime(2, now);

        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        // Standard key: crisp, pleasant tactile switch click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(volume * 0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.045);
      }
    } catch {
      // Audio autoplay policy or device failure: fail silently without interrupting typing
    }
  }, [enabled, volume, getAudioContext]);

  return { playKeySound, getAudioContext };
}
