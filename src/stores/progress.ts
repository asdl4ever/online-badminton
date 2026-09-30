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
  COIN_RULES,
  GACHA_POOL,
  PITY_LIMIT,
  RARITY_META,
  type Item,
  type Rarity,
} from '../game/items';

export interface PullResult {
  item: Item;
  duplicate: boolean;
  refund: number;
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
  /** pulls since the last epic/legendary */
  const pity = useLocalStorage('bmt-pity', 0);
  const notice = ref('');
  let noticeTimer: number | undefined;

  const tier = computed(() => tierForPoints(points.value));
  const next = computed(() => nextTier(points.value));
  const progress = computed(() => tierProgress(points.value));
  const claimable = computed(() =>
    TIERS.filter((t) => points.value >= t.points && !claimed.value.includes(t.id)),
  );

  function isClaimed(id: TierId): boolean {
    return claimed.value.includes(id);
  }

  /** ownership: free always, gacha by collection, otherwise by claimed tier */
  function isOwned(item: Item): boolean {
    if (item.source === 'free') return true;
    if (item.source === 'gacha') return owned.value.includes(item.id);
    return claimed.value.includes(item.source);
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

  /** open a chest; returns what was drawn, or null if the player is broke */
  function pull(): PullResult | null {
    if (coins.value < CHEST_COST) return null;
    coins.value -= CHEST_COST;
    pity.value += 1;

    const available = [...new Set(GACHA_POOL.map((i) => i.rarity))];
    let rarity: Rarity;
    if (pity.value >= PITY_LIMIT) {
      rarity = available.includes('epic') ? 'epic' : available[available.length - 1];
      if (available.includes('legendary') && Math.random() < 0.25) rarity = 'legendary';
    } else {
      rarity = weightedRarity(available);
    }

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

    return { item, duplicate, refund };
  }

  return {
    points,
    claimed,
    coins,
    owned,
    pity,
    notice,
    tier,
    next,
    progress,
    claimable,
    isClaimed,
    isOwned,
    recordResult,
    claim,
    pull,
  };
});
