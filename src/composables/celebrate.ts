import confetti from 'canvas-confetti';

/**
 * One-shot庆祝效果 for reward moments (抽到好东西 / 孵出高星).
 *
 * Kept in one place so the rarity→intensity mapping stays consistent
 * between the chest and the pet egg. canvas-confetti creates its own
 * full-screen canvas lazily and cleans up after itself.
 *
 * `level` is intensity: 0 is silent, 3 is the biggest.
 */
export function celebrate(level: number, colors: string[]): void {
  if (level <= 0) return;

  const base: confetti.Options = {
    colors,
    disableForReducedMotion: true,
    ticks: 180,
    origin: { y: 0.62 },
    // the reward always happens inside a modal, and Vuetify's overlay sits at
    // z-index 2000+ — the default 100 would hide the whole thing behind it
    zIndex: 5000,
  };

  confetti({
    ...base,
    particleCount: 60 * level,
    spread: 70 + level * 15,
    startVelocity: 32 + level * 7,
    scalar: 0.9 + level * 0.12,
  });

  if (level >= 2) {
    // two side cannons, slightly delayed so it reads as one gesture
    window.setTimeout(() => {
      confetti({ ...base, particleCount: 30 * level, angle: 60, origin: { x: 0, y: 0.72 } });
      confetti({ ...base, particleCount: 30 * level, angle: 120, origin: { x: 1, y: 0.72 } });
    }, 130);
  }

  if (level >= 3) {
    window.setTimeout(() => {
      confetti({ ...base, particleCount: 130, spread: 150, startVelocity: 46, origin: { y: 0.45 } });
    }, 300);
  }
}

/** 普通 0 · 稀有 1 · 史诗 2 · 传说 3 */
export const RARITY_LEVEL: Record<string, number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

/** 1★ 0 · 2★ 1 · 3★ 2 · 4★ 2 · 5★ 3 */
export function starLevel(star: number): number {
  if (star >= 5) return 3;
  if (star >= 3) return 2;
  if (star >= 2) return 1;
  return 0;
}
