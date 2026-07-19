import { useState } from "react";
import { STORAGE_KEYS } from "../config/constants";

export function useAudioSynth() {
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === "true";
  });

  const toggleMute = () => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(next));
      return next;
    });
  };

  const playSound = (type: "correct" | "incorrect" | "timer") => {
    if (muted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "correct") {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.15); // C6
        osc2.frequency.setValueAtTime(659.25, now + 0.05); // E5
        osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.2); // E6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now + 0.05);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === "incorrect") {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // AudioContext unavailable
    }
  };

  return { muted, toggleMute, playSound };
}
