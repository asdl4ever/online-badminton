/**
 * Purely visual player customisation. None of this touches the simulation, so
 * it is safe to send over the wire and render differently per client.
 *
 * Unlocks / rarity live in items.ts; this file only defines the shape of a
 * look and how each value renders.
 */

export type HitStyle = 'ring' | 'spark' | 'slash' | 'burst';
export type WingId = 'none' | 'light' | 'flame' | 'thunder' | 'shine' | 'frost';
export type AuraId = 'none' | 'king' | 'emerald' | 'rose' | 'violet';
export type RacketSkinId = 'default' | 'gold' | 'flame' | 'ice';
export type TitleId = 'none' | 'king' | 'god' | 'swift' | 'ace';

export interface Cosmetic {
  /** character face drawn above the player; empty = plain drawn head */
  emoji: string;
  /** racket frame colour */
  racket: number;
  /** swing trail / shuttle trail / hit-effect colour */
  trail: number;
  /** procedural hit-effect style */
  effect: HitStyle;
  /** wings drawn behind the player */
  wings: WingId;
  /** glow aura around the player */
  aura: AuraId;
  /** racket material */
  racketSkin: RacketSkinId;
  /** label shown after the name */
  title: TitleId;
}

const HIT_STYLE_IDS: HitStyle[] = ['ring', 'spark', 'slash', 'burst'];
const WING_IDS: WingId[] = ['none', 'light', 'flame', 'thunder', 'shine', 'frost'];
const AURA_IDS: AuraId[] = ['none', 'king', 'emerald', 'rose', 'violet'];
const RACKET_SKIN_IDS: RacketSkinId[] = ['default', 'gold', 'flame', 'ice'];
const TITLE_IDS: TitleId[] = ['none', 'king', 'god', 'swift', 'ace'];

export const WING_COLORS: Record<WingId, number> = {
  none: 0x000000,
  light: 0xf2f6ff,
  flame: 0xff7a2a,
  thunder: 0x7fd4ff,
  shine: 0xffe89a,
  frost: 0x9fe8ff,
};

export const AURA_COLORS: Record<AuraId, number> = {
  none: 0x000000,
  king: 0xffcf5c,
  emerald: 0x35d6a4,
  rose: 0xff6f91,
  violet: 0xb46cff,
};

export const RACKET_SKIN_COLORS: Record<RacketSkinId, number> = {
  default: 0x44586f,
  gold: 0xffcf5c,
  flame: 0xff7a2a,
  ice: 0x9fe8ff,
};

export function titleText(id: TitleId): string {
  switch (id) {
    case 'king':
      return '王者';
    case 'god':
      return '超神';
    case 'swift':
      return '疾风';
    case 'ace':
      return '王牌';
    default:
      return '';
  }
}

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
  wings: 'none',
  aura: 'none',
  racketSkin: 'default',
  title: 'none',
};

/** the CPU opponent gets a fixed look so it reads as "not you" */
export const AI_COSMETIC: Cosmetic = {
  emoji: '🤖',
  racket: 0x44586f,
  trail: 0xd4542c,
  effect: 'spark',
  wings: 'none',
  aura: 'none',
  racketSkin: 'default',
  title: 'none',
};

export function toHex(n: number): string {
  return `#${(n & 0xffffff).toString(16).padStart(6, '0')}`;
}

export function fromHex(s: string): number {
  const v = Number.parseInt(s.replace('#', ''), 16);
  return Number.isFinite(v) ? v & 0xffffff : 0x000000;
}

function pick<T extends string>(ids: readonly T[], v: unknown, fallback: T): T {
  return typeof v === 'string' && (ids as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** coerce anything that arrived over the network into a safe cosmetic */
export function sanitizeCosmetic(input: Partial<Cosmetic> | undefined): Cosmetic {
  const d = DEFAULT_COSMETIC;
  if (!input || typeof input !== 'object') return { ...d };
  return {
    emoji: typeof input.emoji === 'string' ? input.emoji.slice(0, 8) : d.emoji,
    racket: typeof input.racket === 'number' ? input.racket & 0xffffff : d.racket,
    trail: typeof input.trail === 'number' ? input.trail & 0xffffff : d.trail,
    effect: pick(HIT_STYLE_IDS, input.effect, d.effect),
    wings: pick(WING_IDS, input.wings, d.wings),
    aura: pick(AURA_IDS, input.aura, d.aura),
    racketSkin: pick(RACKET_SKIN_IDS, input.racketSkin, d.racketSkin),
    title: pick(TITLE_IDS, input.title, d.title),
  };
}
