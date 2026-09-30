/**
 * Purely visual player customisation. None of this touches the simulation, so
 * it is safe to send over the wire and render differently per client.
 *
 * Some options are gated behind a rank tier (`unlock`); the option is usable
 * once that tier has been claimed. The gate is enforced visually here and by
 * the customize panel, not by the game.
 */
import type { TierId } from './ranks';

export type HitStyle = 'ring' | 'spark' | 'slash' | 'burst';
export type WingId = 'none' | 'light' | 'flame' | 'thunder';
export type AuraId = 'none' | 'king';
export type RacketSkinId = 'default' | 'gold' | 'flame';
export type TitleId = 'none' | 'king' | 'god';

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

export interface CosOption<T> {
  id: T;
  label: string;
  /** usable only after this tier is claimed; undefined = free */
  unlock?: TierId;
}

export const HIT_STYLES: CosOption<HitStyle>[] = [
  { id: 'ring', label: '冲击环' },
  { id: 'spark', label: '火花' },
  { id: 'slash', label: '斩击', unlock: 'silver' },
  { id: 'burst', label: '爆裂', unlock: 'gold' },
];

export const WINGS: CosOption<WingId>[] = [
  { id: 'none', label: '无' },
  { id: 'light', label: '光羽', unlock: 'silver' },
  { id: 'flame', label: '烈焰', unlock: 'master' },
  { id: 'thunder', label: '雷霆', unlock: 'god' },
];

export const AURAS: CosOption<AuraId>[] = [
  { id: 'none', label: '无' },
  { id: 'king', label: '王者光环', unlock: 'king' },
];

export const RACKET_SKINS: CosOption<RacketSkinId>[] = [
  { id: 'default', label: '默认' },
  { id: 'gold', label: '鎏金', unlock: 'gold' },
  { id: 'flame', label: '烈焰', unlock: 'master' },
];

export const TITLES: CosOption<TitleId>[] = [
  { id: 'none', label: '无' },
  { id: 'king', label: '王者', unlock: 'king' },
  { id: 'god', label: '超神', unlock: 'god' },
];

export const WING_COLORS: Record<WingId, number> = {
  none: 0x000000,
  light: 0xf2f6ff,
  flame: 0xff7a2a,
  thunder: 0x7fd4ff,
};

export const AURA_COLORS: Record<AuraId, number> = {
  none: 0x000000,
  king: 0xffcf5c,
};

export const RACKET_SKIN_COLORS: Record<RacketSkinId, number> = {
  default: 0x44586f,
  gold: 0xffcf5c,
  flame: 0xff7a2a,
};

export function titleText(id: TitleId): string {
  if (id === 'king') return '王者';
  if (id === 'god') return '超神';
  return '';
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

function pick<T extends string>(opts: CosOption<T>[], v: unknown, fallback: T): T {
  return opts.some((o) => o.id === v) ? (v as T) : fallback;
}

/** coerce anything that arrived over the network into a safe cosmetic */
export function sanitizeCosmetic(input: Partial<Cosmetic> | undefined): Cosmetic {
  const d = DEFAULT_COSMETIC;
  if (!input || typeof input !== 'object') return { ...d };
  return {
    emoji: typeof input.emoji === 'string' ? input.emoji.slice(0, 8) : d.emoji,
    racket: typeof input.racket === 'number' ? input.racket & 0xffffff : d.racket,
    trail: typeof input.trail === 'number' ? input.trail & 0xffffff : d.trail,
    effect: pick(HIT_STYLES, input.effect, d.effect),
    wings: pick(WINGS, input.wings, d.wings),
    aura: pick(AURAS, input.aura, d.aura),
    racketSkin: pick(RACKET_SKINS, input.racketSkin, d.racketSkin),
    title: pick(TITLES, input.title, d.title),
  };
}
