/**
 * Purely visual player customisation. None of this touches the simulation, so
 * it is safe to send over the wire and render differently per client.
 */

export type HitStyle = 'ring' | 'spark' | 'slash' | 'burst';

export interface Cosmetic {
  /** character face drawn above the player; empty = plain drawn head */
  emoji: string;
  /** racket frame colour */
  racket: number;
  /** swing trail / hit-effect colour */
  trail: number;
  /** procedural hit-effect style */
  effect: HitStyle;
}

export const HIT_STYLES: { id: HitStyle; label: string }[] = [
  { id: 'ring', label: '冲击环' },
  { id: 'spark', label: '火花' },
  { id: 'slash', label: '斩击' },
  { id: 'burst', label: '爆裂' },
];

export const EMOJI_PRESETS = [
  '🙂',
  '😎',
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🐸',
  '🐵',
  '🐯',
  '🦈',
  '👽',
  '🤖',
];

export const COLOR_PRESETS = [
  0x2a7ad4, 0xd4542c, 0x1f9d55, 0xc07f00, 0x8e44ad, 0x1f7f8f, 0x1b2740, 0xffffff,
];

export const DEFAULT_COSMETIC: Cosmetic = {
  emoji: '🙂',
  racket: 0x44586f,
  trail: 0x6f9fce,
  effect: 'ring',
};

/** the CPU opponent gets a fixed look so it reads as "not you" */
export const AI_COSMETIC: Cosmetic = {
  emoji: '🤖',
  racket: 0x44586f,
  trail: 0xd4542c,
  effect: 'spark',
};

export function toHex(n: number): string {
  return `#${(n & 0xffffff).toString(16).padStart(6, '0')}`;
}

export function fromHex(s: string): number {
  const v = Number.parseInt(s.replace('#', ''), 16);
  return Number.isFinite(v) ? v & 0xffffff : 0x000000;
}

/** coerce anything that arrived over the network into a safe cosmetic */
export function sanitizeCosmetic(input: Partial<Cosmetic> | undefined): Cosmetic {
  const d = DEFAULT_COSMETIC;
  if (!input || typeof input !== 'object') return { ...d };
  const emoji = typeof input.emoji === 'string' ? input.emoji.slice(0, 8) : d.emoji;
  const racket = typeof input.racket === 'number' ? input.racket & 0xffffff : d.racket;
  const trail = typeof input.trail === 'number' ? input.trail & 0xffffff : d.trail;
  const effect = HIT_STYLES.some((s) => s.id === input.effect) ? (input.effect as HitStyle) : d.effect;
  return { emoji, racket, trail, effect };
}
