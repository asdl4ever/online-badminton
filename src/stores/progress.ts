import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  POINT_RULES,
  TIERS,
  nextTier,
  tierForPoints,
  tierProgress,
  type PlayMode,
  type TierId,
} from '../game/ranks';
import {
  CHEST_COST,
  COIN_DROP_CHANCE,
  COIN_DROP_RANGE,
  COIN_RULES,
  GACHA_POOL,
  PET_EGGS,
  PET_STAR_META,
  PETS,
  PITY_LIMIT,
  RARITY_META,
  TEN_PULL_COST,
  type Item,
  type Rarity,
} from '../game/items';

export type PullResult =
  | { kind: 'item'; item: Item; duplicate: boolean; refund: number }
  | { kind: 'coins'; amount: number };

export interface HatchResult {
  pet: Item;
  /** star level rolled by the egg, 1–5 */
  star: number;
  /** the pet was already owned (possibly at a lower star) */
  duplicate: boolean;
  /** this hatch raised the pet's star */
  upgraded: boolean;
  /** star owned before this hatch (0 = brand new pet) */
  prev: number;
  /** coins returned when the roll was not an upgrade */
  refund: number;
}

/** weighted pick over an egg's 1★..5★ weights */
function rollStar(weights: readonly number[]): number {
  const total = weights.reduce((s, w) => s + w, 0);
  if (total <= 0) return 1;
  let x = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    x -= weights[i];
    if (x <= 0) return i + 1;
  }
  return weights.length;
}

/** weighted pick, but only across rarities that actually exist in the pool */
function weightedRarity(available: Rarity[]): Rarity {
  const total = available.reduce((s, r) => s + RARITY_META[r].weight, 0);
  let x = Math.random() * total;
  for (const r of available) {
    x -= RARITY_META[r].weight;
    if (x <= 0) return r;
  }
  return available[available.length - 1];
}

/**
 * The meta layer: rank points, coins, and the cosmetic collection. All local
 * (no accounts), so this is a for-fun progression, not a competitive one.
 */
export const useProgressStore = defineStore('progress', () => {
  const points = useLocalStorage('bmt-points', 0);
  const claimed = useLocalStorage<TierId[]>('bmt-claimed', []);
  const coins = useLocalStorage('bmt-coins', 0);
  /** ids of gacha items the player has won */
  const owned = useLocalStorage<string[]>('bmt-owned', []);
  /** highest star level owned per pet ref (absent = not hatched yet) */
  const petStars = useLocalStorage<Record<string, number>>('bmt-pet-stars', {});
  /** free ten-pulls the player still holds */
  const tenTickets = useLocalStorage<number>('bmt-ten-tickets', 0);
  /** pulls since the last epic/legendary */
  const pity = useLocalStorage('bmt-pity', 0);
  const notice = ref('');
  let noticeTimer: number | undefined;

  // brand-new players get one free ten-pull as a welcome gift, once ever
  const welcomed = useLocalStorage('bmt-welcomed', false);
  if (!welcomed.value) {
    welcomed.value = true;
    tenTickets.value += 1;
    pushNotice('新手上线礼：免费十连抽 ×1，快去宝箱页面领取！');
  }

  const tier = computed(() => tierForPoints(points.value));
  const next = computed(() => nextTier(points.value));
  const progress = computed(() => tierProgress(points.value));
  const claimable = computed(() =>
    TIERS.filter((t) => points.value >= t.points && !claimed.value.includes(t.id)),
  );

  function isClaimed(id: TierId): boolean {
    return claimed.value.includes(id);
  }

  /** ownership: free always, gacha by collection, pets by hatching, else by tier */
  function isOwned(item: Item): boolean {
    if (item.source === 'free') return true;
    if (item.source === 'gacha') return owned.value.includes(item.id);
    if (item.source === 'egg') return (petStars.value[item.ref] ?? 0) > 0;
    return claimed.value.includes(item.source);
  }

  /** the star level owned for a pet ref (0 = not hatched) */
  function petStar(ref: string): number {
    return petStars.value[ref] ?? 0;
  }

  /** hatch one egg; returns what came out, or null if the player can't pay */
  function hatch(eggId: string): HatchResult | null {
    const egg = PET_EGGS.find((e) => e.id === eggId);
    if (!egg || coins.value < egg.cost) return null;
    coins.value -= egg.cost;

    const star = rollStar(egg.weights);
    const pet = PETS[Math.floor(Math.random() * PETS.length)];
    const prev = petStars.value[pet.ref] ?? 0;

    if (star <= prev) {
      const refund = PET_STAR_META[star]?.dust ?? 15;
      coins.value += refund;
      return { pet, star, duplicate: true, upgraded: false, prev, refund };
    }
    petStars.value = { ...petStars.value, [pet.ref]: star };
    return { pet, star, duplicate: prev > 0, upgraded: prev > 0, prev, refund: 0 };
  }

  function pushNotice(text: string): void {
    notice.value = text;
    if (noticeTimer) window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.value = '';
    }, 4200);
  }

  function recordResult(win: boolean, mode: PlayMode): void {
    const p = POINT_RULES[mode];
    const c = COIN_RULES[mode];
    const gain = win ? p.win : p.lose;
    const coin = win ? c.win : c.lose;
    const before = tierForPoints(points.value).id;
    points.value += gain;
    coins.value += coin;
    const after = tierForPoints(points.value);
    let text = `+${gain} 积分 · 金币 +${coin}`;
    if (after.id !== before) text += ` · 晋级 ${after.label}！可领取奖励`;
    pushNotice(text);
  }

  function claim(id: TierId): void {
    const t = TIERS.find((x) => x.id === id);
    if (!t || points.value < t.points || claimed.value.includes(id)) return;
    claimed.value = [...claimed.value, id];
    pushNotice(`已领取 ${t.label} 奖励：${t.reward}`);
  }

  /** one weighted draw, without touching the wallet (the caller pays) */
  function rollOne(floor?: 'epic'): PullResult {
    // bonus coin payout instead of an item (never on a guaranteed draw)
    if (!floor && Math.random() < COIN_DROP_CHANCE) {
      const [lo, hi] = COIN_DROP_RANGE;
      const amount = lo + Math.floor(Math.random() * (hi - lo + 1));
      coins.value += amount;
      return { kind: 'coins', amount };
    }

    pity.value += 1;

    const available = [...new Set(GACHA_POOL.map((i) => i.rarity))];
    let rarity: Rarity;
    if (pity.value >= PITY_LIMIT) {
      rarity = available.includes('epic') ? 'epic' : available[available.length - 1];
      if (available.includes('legendary') && Math.random() < 0.25) rarity = 'legendary';
    } else {
      rarity = weightedRarity(available);
    }
    if (floor === 'epic' && rarity !== 'epic' && rarity !== 'legendary') rarity = 'epic';

    const candidates = GACHA_POOL.filter((i) => i.rarity === rarity);
    const item = candidates[Math.floor(Math.random() * candidates.length)];

    let duplicate = false;
    let refund = 0;
    if (owned.value.includes(item.id)) {
      duplicate = true;
      refund = RARITY_META[item.rarity].dust;
      coins.value += refund;
    } else {
      owned.value = [...owned.value, item.id];
    }
    if (item.rarity === 'epic' || item.rarity === 'legendary') pity.value = 0;

    return { kind: 'item', item, duplicate, refund };
  }

  /** open a chest; returns what was drawn, or null if the player is broke */
  function pull(): PullResult | null {
    if (coins.value < CHEST_COST) return null;
    coins.value -= CHEST_COST;
    return rollOne();
  }

  /** whether the free welcome ten-pull is still available */
  const canFreeTen = computed(() => tenTickets.value > 0);

  /** ten draws at a 10% discount; `useTicket` spends a free ten-pull instead */
  function pullTen(useTicket = false): PullResult[] | null {
    if (useTicket) {
      if (tenTickets.value <= 0) return null;
      tenTickets.value -= 1;
    } else {
      if (coins.value < TEN_PULL_COST) return null;
      coins.value -= TEN_PULL_COST;
    }

    const out: PullResult[] = [];
    for (let i = 0; i < 10; i++) out.push(rollOne());
    // ten-pulls guarantee at least one epic+ (a slight courtesy over singles)
    const hasHigh = out.some(
      (r) => r.kind === 'item' && (r.item.rarity === 'epic' || r.item.rarity === 'legendary'),
    );
    if (!hasHigh) out[9] = rollOne('epic');
    return out;
  }

  return {
    points,
    claimed,
    coins,
    owned,
    petStars,
    tenTickets,
    pity,
    notice,
    canFreeTen,
    tier,
    next,
    progress,
    claimable,
    isClaimed,
    isOwned,
    petStar,
    hatch,
    recordResult,
    claim,
    pull,
    pullTen,
  };
});
