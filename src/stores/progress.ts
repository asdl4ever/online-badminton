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
  ITEMS,
  PET_EGGS,
  PET_STAR_META,
  PETS,
  PITY_LIMIT,
  RARITY_META,
  TEN_PULL_COST,
  type Item,
  type Rarity,
} from '../game/items';
import { BOAT_COST, islandById, MAX_LEVEL, upgradeCost } from '../game/dive/fish';
import { ACHIEVEMENTS, type AchMetric, type Achievement } from '../game/achievements';

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
  /** machine-mode combo milestones (10/20/…/100) already claimed */
  const milestones = useLocalStorage<number[]>('bmt-milestones', []);
  /** 渔具等级（1-5，老存档的"鱼竿等级"沿用这个键）：钩子更大、能拉更大的鱼 */
  const rodLevel = useLocalStorage('bmt-rod-level', 1);
  /** 潜水：氧气罐等级（能待多久） */
  const oxygenLv = useLocalStorage('bmt-dive-oxygen', 1);
  /** 潜水：背包等级（一趟能带多少） */
  const bagLv = useLocalStorage('bmt-dive-bag', 1);
  /** 有没有买船（没船只能在家门口的浅滩潜） */
  const boat = useLocalStorage('bmt-dive-boat', false);
  /** 当前在哪个海岛潜水 */
  const island = useLocalStorage('bmt-dive-island', 'shore');
  /** 鱼图鉴：鱼种 id → 钓到的条数 + 最大体重 */
  const fishLog = useLocalStorage<Record<string, { count: number; best: number }>>('bmt-fish-log', {});
  /** 成就专用的小计数器：卖鱼总额 / 下潜次数 / 出海次数 / 最深下潜（米） */
  const achStats = useLocalStorage<{ sold: number; dives: number; trips: number; deepest: number }>(
    'bmt-ach-stats',
    { sold: 0, dives: 0, trips: 0, deepest: 0 },
  );
  /** 已达成的成就 id（达成即发奖，见 syncAchievements） */
  const achDone = useLocalStorage<string[]>('bmt-ach-done', []);
  /** 已用过的兑换码（每个只能用一次） */
  const redeemed = useLocalStorage<string[]>('bmt-redeemed', []);
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

  /** ownership: free always, gacha/code by collection, pets by hatching, else by tier */
  function isOwned(item: Item): boolean {
    if (item.source === 'free') return true;
    if (item.source === 'gacha' || item.source === 'code') return owned.value.includes(item.id);
    if (item.source === 'egg') return (petStars.value[item.ref] ?? 0) > 0;
    if (item.source === 'streak') return milestones.value.includes(100);
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

  /**
   * A machine-mode combo milestone (10/20/…/100). First time only: 10..90 give
   * one random gacha item, 100 unlocks the Godzilla character form.
   */
  function claimMilestone(n: number): { kind: 'item'; item: Item } | { kind: 'godzilla' } | null {
    if (n <= 0 || n % 10 !== 0 || milestones.value.includes(n)) return null;
    milestones.value = [...milestones.value, n];
    if (n >= 100) return { kind: 'godzilla' };
    const item = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)];
    if (!owned.value.includes(item.id)) owned.value = [...owned.value, item.id];
    return { kind: 'item', item };
  }

  /**
   * 兑换码：码 → 物品 id。大小写和空格都无所谓。
   * 前导的 `ux7891` 是 U熊皮肤的那个码。
   */
  const REDEEM_CODES: Record<string, string> = {
    ux7891: 'skin:ubear',
  };

  /**
   * 用兑换码换一件东西。同一个码只能用一次，换到的东西直接进收藏（和宝箱一样）。
   */
  function redeem(input: string): { ok: true; item: Item } | { ok: false; message: string } {
    const code = input.trim().toLowerCase().replace(/\s+/g, '');
    if (!code) return { ok: false, message: '请输入兑换码' };
    if (redeemed.value.includes(code)) return { ok: false, message: '这个兑换码已经兑换过了' };
    const itemId = REDEEM_CODES[code];
    const item = itemId ? ITEMS.find((i) => i.id === itemId) : undefined;
    if (!item) return { ok: false, message: '兑换码无效，检查一下吧' };
    redeemed.value = [...redeemed.value, code];
    if (!owned.value.includes(item.id)) owned.value = [...owned.value, item.id];
    return { ok: true, item };
  }

  // ---- 潜水 -----------------------------------------------------------------

  /** 记一笔图鉴（钓到一条鱼） */
  function logFish(id: string, kg: number): void {
    const cur = fishLog.value[id] ?? { count: 0, best: 0 };
    fishLog.value = {
      ...fishLog.value,
      [id]: { count: cur.count + 1, best: Math.max(cur.best, kg) },
    };
  }

  /** 买船（一次性） */
  function buyBoat(): boolean {
    if (boat.value || coins.value < BOAT_COST) return false;
    coins.value -= BOAT_COST;
    boat.value = true;
    return true;
  }

  /** 升一件潜水装备：氧气 / 背包 / 渔具 */
  function upgradeDive(which: 'oxygen' | 'bag' | 'gear'): boolean {
    const lv = which === 'oxygen' ? oxygenLv : which === 'bag' ? bagLv : rodLevel;
    if (lv.value >= MAX_LEVEL) return false;
    const cost = upgradeCost(lv.value);
    if (coins.value < cost) return false;
    coins.value -= cost;
    if (which === 'oxygen') oxygenLv.value += 1;
    else if (which === 'bag') bagLv.value += 1;
    else rodLevel.value += 1;
    return true;
  }

  // ---- 成就 -----------------------------------------------------------------

  /** 卖鱼入账（成就用） */
  function noteSold(amount: number): void {
    if (amount <= 0) return;
    achStats.value = { ...achStats.value, sold: achStats.value.sold + amount };
  }

  /** 又下潜了一次 */
  function noteDive(): void {
    achStats.value = { ...achStats.value, dives: achStats.value.dives + 1 };
  }

  /** 又出海一次 */
  function noteTrip(): void {
    achStats.value = { ...achStats.value, trips: achStats.value.trips + 1 };
  }

  /** 刷新最深下潜（米），只在更深时记 */
  function noteDepth(meters: number): void {
    const m = Math.round(meters);
    if (m <= achStats.value.deepest) return;
    achStats.value = { ...achStats.value, deepest: m };
  }

  /** 图鉴汇总：累计条数 / 最重 / 鱼种数 */
  const fishTotals = computed(() => {
    let count = 0;
    let best = 0;
    for (const id of Object.keys(fishLog.value)) {
      const e = fishLog.value[id];
      count += e.count;
      best = Math.max(best, e.best);
    }
    return { count, best, species: Object.keys(fishLog.value).length };
  });

  /** 一条成就的当前进度值 */
  function metricValue(metric: AchMetric): number {
    switch (metric.kind) {
      case 'fishTotal':
        return fishTotals.value.count;
      case 'species':
        return fishTotals.value.species;
      case 'bestKg':
        return fishTotals.value.best;
      case 'caught':
        return (fishLog.value[metric.species]?.count ?? 0) > 0 ? 1 : 0;
      case 'sold':
        return achStats.value.sold;
      case 'deepest':
        return achStats.value.deepest;
      case 'dives':
        return achStats.value.dives;
      case 'trips':
        return achStats.value.trips;
      case 'boat':
        return boat.value ? 1 : 0;
      case 'oxygenLv':
        return oxygenLv.value;
      case 'bagLv':
        return bagLv.value;
      case 'gearLv':
        return rodLevel.value;
    }
  }

  /** 成就面板用：每条成就 + 当前进度 + 是否达成（按板块分组由面板负责） */
  const achievements = computed(() =>
    ACHIEVEMENTS.map((ach) => {
      const cur = Math.min(metricValue(ach.metric), ach.goal);
      return {
        ach,
        cur,
        done: achDone.value.includes(ach.id),
        pct: ach.goal > 0 ? Math.min(1, cur / ach.goal) : 1,
      };
    }),
  );

  const achDoneCount = computed(() => achievements.value.filter((a) => a.done).length);

  /** 奖励物品的详情（面板里显示名字与稀有度） */
  function achievementItem(id?: string): Item | undefined {
    return id ? ITEMS.find((i) => i.id === id) : undefined;
  }

  /**
   * 检查所有成就：新达成的一律**立刻发奖**（金币 + 收藏里的定制物品 / 皮肤）。
   * 返回刚完成的那批，调用方可以逐条弹提示。重复调用没有副作用。
   */
  function syncAchievements(): Achievement[] {
    const fresh: Achievement[] = [];
    let coinGain = 0;
    let nextOwned: string[] | null = null;
    for (const ach of ACHIEVEMENTS) {
      if (achDone.value.includes(ach.id)) continue;
      if (metricValue(ach.metric) < ach.goal) continue;
      fresh.push(ach);
      if (ach.coins) coinGain += ach.coins;
      if (ach.itemId) {
        const list: string[] = nextOwned ?? [...owned.value];
        if (!list.includes(ach.itemId)) list.push(ach.itemId);
        nextOwned = list;
      }
    }
    if (!fresh.length) return fresh;
    achDone.value = [...achDone.value, ...fresh.map((a) => a.id)];
    if (coinGain) coins.value += coinGain;
    if (nextOwned) owned.value = nextOwned;
    const parts = [coinGain ? `+¥${coinGain}` : '', ...fresh.map((a) => a.name)];
    pushNotice(`🏅 成就达成：${parts.filter(Boolean).join(' · ')}`);
    return fresh;
  }

  /** 出海去某个海岛：要船、要渔具等级、要船费，三样都够才成 */
  function sailTo(id: string): boolean {
    if (id === island.value) return true;
    const isl = islandById(id);
    if (isl.boat && !boat.value) return false;
    if (rodLevel.value < isl.gear) return false;
    if (coins.value < isl.cost) return false;
    coins.value -= isl.cost;
    island.value = id;
    noteTrip();
    return true;
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
    milestones,
    rodLevel,
    oxygenLv,
    bagLv,
    boat,
    island,
    fishLog,
    logFish,
    buyBoat,
    upgradeDive,
    sailTo,
    achStats,
    achDone,
    achDoneCount,
    achievements,
    achievementItem,
    syncAchievements,
    noteSold,
    noteDive,
    noteTrip,
    noteDepth,
    redeemed,
    redeem,
    claimMilestone,
    petStar,
    hatch,
    recordResult,
    claim,
    pull,
    pullTen,
  };
});
