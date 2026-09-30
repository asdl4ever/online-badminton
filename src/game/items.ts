/**
 * The single source of truth for collectible cosmetics.
 *
 * Every equippable option (wings, aura, racket skin, title, hit effect) is an
 * item with a rarity and a source. Ownership is derived: `free` items are always
 * owned, `gacha` items come from chests, and anything else is a tier id the
 * player must have claimed. Equipping just writes the item's `ref` into the
 * cosmetic store.
 */
import type { TierId } from './ranks';

export type ItemSlot = 'wings' | 'aura' | 'racketSkin' | 'title' | 'effect';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  slot: ItemSlot;
  /** the value written into the Cosmetic when equipped */
  ref: string;
  label: string;
  rarity: Rarity;
  source: 'free' | 'gacha' | TierId;
}

export const SLOT_ORDER: ItemSlot[] = ['wings', 'aura', 'racketSkin', 'title', 'effect'];

export const SLOT_LABELS: Record<ItemSlot, string> = {
  wings: '翅膀',
  aura: '光环',
  racketSkin: '球拍皮肤',
  title: '称号',
  effect: '命中特效',
};

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; weight: number; dust: number }
> = {
  common: { label: '普通', color: '#8b97a8', weight: 58, dust: 20 },
  rare: { label: '稀有', color: '#3d8bfd', weight: 28, dust: 45 },
  epic: { label: '史诗', color: '#9b59d0', weight: 11, dust: 90 },
  legendary: { label: '传说', color: '#e8a33d', weight: 3, dust: 180 },
};

export const ITEMS: Item[] = [
  // --- wings ---
  { id: 'wings:none', slot: 'wings', ref: 'none', label: '无', rarity: 'common', source: 'free' },
  { id: 'wings:light', slot: 'wings', ref: 'light', label: '光羽', rarity: 'rare', source: 'gacha' },
  { id: 'wings:frost', slot: 'wings', ref: 'frost', label: '冰晶', rarity: 'epic', source: 'gacha' },
  { id: 'wings:flame', slot: 'wings', ref: 'flame', label: '烈焰', rarity: 'epic', source: 'gacha' },
  {
    id: 'wings:thunder',
    slot: 'wings',
    ref: 'thunder',
    label: '雷霆',
    rarity: 'legendary',
    source: 'gacha',
  },
  { id: 'wings:shine', slot: 'wings', ref: 'shine', label: '圣光', rarity: 'legendary', source: 'god' },

  // --- aura ---
  { id: 'aura:none', slot: 'aura', ref: 'none', label: '无', rarity: 'common', source: 'free' },
  { id: 'aura:emerald', slot: 'aura', ref: 'emerald', label: '翡翠', rarity: 'rare', source: 'gacha' },
  { id: 'aura:rose', slot: 'aura', ref: 'rose', label: '绯红', rarity: 'rare', source: 'gacha' },
  { id: 'aura:violet', slot: 'aura', ref: 'violet', label: '紫罗兰', rarity: 'epic', source: 'gacha' },
  { id: 'aura:king', slot: 'aura', ref: 'king', label: '王者', rarity: 'epic', source: 'king' },

  // --- racket skin ---
  {
    id: 'racketSkin:default',
    slot: 'racketSkin',
    ref: 'default',
    label: '默认',
    rarity: 'common',
    source: 'free',
  },
  {
    id: 'racketSkin:ice',
    slot: 'racketSkin',
    ref: 'ice',
    label: '寒霜',
    rarity: 'rare',
    source: 'gacha',
  },
  {
    id: 'racketSkin:gold',
    slot: 'racketSkin',
    ref: 'gold',
    label: '鎏金',
    rarity: 'epic',
    source: 'gold',
  },
  {
    id: 'racketSkin:flame',
    slot: 'racketSkin',
    ref: 'flame',
    label: '烈焰',
    rarity: 'epic',
    source: 'master',
  },

  // --- title ---
  { id: 'title:none', slot: 'title', ref: 'none', label: '无', rarity: 'common', source: 'free' },
  { id: 'title:swift', slot: 'title', ref: 'swift', label: '疾风', rarity: 'rare', source: 'silver' },
  { id: 'title:ace', slot: 'title', ref: 'ace', label: '王牌', rarity: 'rare', source: 'gacha' },
  { id: 'title:king', slot: 'title', ref: 'king', label: '王者', rarity: 'epic', source: 'king' },
  { id: 'title:god', slot: 'title', ref: 'god', label: '超神', rarity: 'legendary', source: 'god' },

  // --- hit effect ---
  { id: 'effect:ring', slot: 'effect', ref: 'ring', label: '冲击环', rarity: 'common', source: 'free' },
  { id: 'effect:spark', slot: 'effect', ref: 'spark', label: '火花', rarity: 'common', source: 'free' },
  { id: 'effect:slash', slot: 'effect', ref: 'slash', label: '斩击', rarity: 'rare', source: 'gacha' },
  { id: 'effect:burst', slot: 'effect', ref: 'burst', label: '爆裂', rarity: 'epic', source: 'gacha' },
];

export const GACHA_POOL = ITEMS.filter((i) => i.source === 'gacha');

export const CHEST_COST = 120;
export const PITY_LIMIT = 10;

/** coins earned per finished match (weighted toward online) */
export const COIN_RULES = {
  online: { win: 40, lose: 15 },
  single: { win: 15, lose: 5 },
} as const;

export function itemById(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function itemsForSlot(slot: ItemSlot): Item[] {
  return ITEMS.filter((i) => i.slot === slot);
}
