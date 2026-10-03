import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import {
  POINT_RULES,
  TIERS,
  nextTier,
  tierById,
  tierForPoints,
  tierProgress,
  type PlayMode,
  type TierId,
} from '../game/ranks';
import {
  BAG_CHANCE,
  BAG_COIN_SHARE,
  CHEST_KEYS,
  COIN_BAG_MIN,
  COIN_BAG_RANGE,
  COIN_RULES,
  FARM_MAX_LEVEL,
  FARM_UPGRADE_COST,
  GACHA_POOL,
  SHARD_BAG_MIN,
  SHARD_BAG_RANGE,
  coinPriceOf,
  honorPriceOf,
  ITEMS,
  MATERIALS,
  MILESTONE_REWARD,
  PET_EGGS,
  PET_STAR_META,
  PETS,
  RARITY_META,
  STAR_WEIGHT,
  TRACTOR_COST,
  shardPriceOf,
  type Item,
  type ItemSlot,
} from '../game/items';
import { pickChestPool } from '../game/chest';
import {
  BOAT_COST,
  FISH_TASKS,
  fishTaskMatch,
  islandById,
  MAX_LEVEL,
  SPECIES,
  upgradeCost,
  type FishTaskTemplate,
} from '../game/dive/fish';
import { styleFromStats, tierFromStats } from '../game/ai';
import {
  applyAiResult,
  applyMatchResult,
  attrsFromStats,
  ensureStats,
  generatePlayers,
  LEGEND_ID,
  makeRandomPlayer,
  playerStats,
  ratingFromStats,
  syncDerived,
  withLegend,
  type AiPlayer,
  type PlayerStats,
} from '../game/players';
import {
  MATCH_KEY,
  worldEdition,
  worldState,
  type WorldArenaState,
} from '../game/world-arena';
import { DEFAULT_COSMETIC, type Cosmetic } from '../game/cosmetics';
import {
  effectiveAlloc,
  emptyAlloc,
  spentPoints,
  totalAttrPoints,
  type AttrAlloc,
  type AttrKey,
} from '../game/attrs';
import { ACHIEVEMENTS, type AchMetric, type Achievement } from '../game/achievements';
import {
  NAILONG_DAILY_MAX,
  NAILONG_DUP_COINS,
  NAILONG_PITY,
  rollWheelIndex,
  WHEEL_PRIZES,
} from '../game/nailong';
import {
  GZ_DIFFS,
  GZ_DROPS,
  GZ_DAILY_MAX,
  GZ_REWARD_ODDS,
  type GzDifficulty,
} from '../game/godzilla';
import {
  ALIEN_COINS_PER_KILL,
  ALIEN_DAILY_MAX,
  ALIEN_HONOR_PER_KILL,
  ALIEN_MILESTONES,
} from '../game/alien';
import {
  ARENA_COOLDOWN_MS,
  ARENA_ROUNDS,
  PLACE_LABEL,
  SEASON_REWARDS,
  arenaByTier,
  buildBracket,
  fillNextRound,
  goldForPlace,
  honorForPlace,
  myMatchIndex,
  pickCupName,
  pointsForPlace,
  ROOKIE_TIERS,
  simulateArenaMatch,
  type ArenaBracket,
  type ArenaEntrant,
  type ArenaPlace,
} from '../game/arena';

/** 晋级赛对阵树里代表「玩家自己」的参赛者 id */
const ME_ID = '__me__';

/** 低档杯赛的临时弱手名字池（15 位对手从这里抽，不重复） */
const ROOKIE_NAMES = [
  '小张同学', '隔壁老王', '球场阿呆', '新手小美', '临时工', '手抖小王',
  '菜鸟阿飞', '慢半拍', '热身选手', '陪练小刘', '挥空大王', '三分钟热度',
  '刚学会发球', '今天刚来', '球拍借的', '业余爱好', '打了两次', '重在参与',
];

/** Fisher-Yates 洗牌（原地） */
function shuffleList<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 本地日期键（YYYY-MM-DD）——每日限次按它重置（用本地时区，不用 UTC） */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 一次开箱的产物：
 * - `item`：抽到装扮（重复的话 `refund` 是返还的金币）；
 * - `bag`：**袋子档**（`BAG_CHANCE` 的概率）——没抽到装扮，给一小袋金币
 *   或 🧩 星尘碎片（碎片能在宝箱的兑换区换指定低星装扮）。
 */
export type PullResult =
  | { kind: 'item'; item: Item; duplicate: boolean; refund: number }
  | { kind: 'bag'; bag: 'coins' | 'shards'; amount: number };

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

/**
 * The meta layer: rank points, coins, and the cosmetic collection. All local
 * (no accounts), so this is a for-fun progression, not a competitive one.
 */
export const useProgressStore = defineStore('progress', () => {
  const points = useLocalStorage('bmt-points', 0);
  const claimed = useLocalStorage<TierId[]>('bmt-claimed', []);
  const coins = useLocalStorage('bmt-coins', 0);
  /**
   * 荣誉点：晋级赛拿冠亚季军才有（随杯赛档位放大），是「荣誉商店」的唯一货币。
   * 跟金币不同，它**永久不清零**——积分每月清零，荣誉不该跟着掉。
   */
  const honor = useLocalStorage('bmt-honor', 0);
  // ---- 小黄龙联动：抽奖券与转盘 ----
  /** 手上的转盘抽奖券 */
  const nailongTickets = useLocalStorage('bmt-nailong-tickets', 0);
  /** 今天已经用掉几张挑战门票（开一场扣一张，输赢都扣） */
  const nailongAttempts = useLocalStorage('bmt-nailong-attempts', 0);
  /** 上面那个计数属于哪一天（YYYY-MM-DD，跨天自动重新计） */
  const nailongDay = useLocalStorage('bmt-nailong-day', '');
  /** 连续没抽到限定物品的次数（保底计数） */
  const nailongPity = useLocalStorage('bmt-nailong-pity', 0);

  /** 今天还剩几张挑战门票 */
  const nailongLeftToday = computed(() => {
    const used = nailongDay.value === todayKey() ? nailongAttempts.value : 0;
    return Math.max(0, NAILONG_DAILY_MAX - used);
  });
  // ---- 哥斯拉来袭：每日次数 / 击杀数（限定物品按难度概率掉落，见 GZ_DROPS）----
  /** 今天已经用掉几次哥斯拉挑战 */
  const gzUsed = useLocalStorage('bmt-gz-used', 0);
  /** 次数属于哪一天（YYYY-MM-DD，跨天自动重置） */
  const gzDay = useLocalStorage('bmt-gz-day', '');
  /** 累计击杀哥斯拉的次数（刷战绩用） */
  const gzKills = useLocalStorage('bmt-gz-kills', 0);

  /** 今天还剩几次哥斯拉挑战 */
  const gzLeftToday = computed(() =>
    Math.max(0, GZ_DAILY_MAX - (gzDay.value === todayKey() ? gzUsed.value : 0)),
  );

  /**
   * 开打前扣一次每日次数（失败也算）。
   * 返回是否允许开打；不允许时 `message` 说明原因。
   */
  function useGodzillaAttempt(): { ok: boolean; message: string } {
    if (gzDay.value !== todayKey()) {
      gzDay.value = todayKey();
      gzUsed.value = 0;
    }
    if (gzUsed.value >= GZ_DAILY_MAX) {
      return { ok: false, message: `今天 ${GZ_DAILY_MAX} 次挑战已经用完了，明天再来` };
    }
    gzUsed.value += 1;
    return { ok: true, message: `剩余次数 ${GZ_DAILY_MAX - gzUsed.value}` };
  }

  /**
   * 击杀哥斯拉的结算（**三选一摇奖**，见 `GZ_REWARD_ODDS`）：
   * 50% 金币 / 20% 该档限定皮肤 / 30% 宝箱钥匙；荣誉点不摇、打赢就固定给。
   *
   * 「皮肤不会重复」：皮肤档只在**这一档自己还没拥有**的里挑；这一档全拿齐之后，
   * 再摇到皮肤档就**折算成该档那份金币**，不会给你一件已经有过的。
   * 返回界面拿来弹横幅的信息。
   */
  function grantGodzillaKill(difficulty: GzDifficulty): {
    /** 这次摇到的分支 */
    kind: 'coins' | 'skin' | 'keys';
    /** 金币档发的金币（皮肤档折算时也记在这里） */
    coins: number;
    /** 皮肤档撞上已拥有 → 折算的金币（已算进 `coins`） */
    refund: number;
    honor: number;
    /** 钥匙档发了几把 */
    keys: number;
    /** 这次掉出来的限定（没掉就是 undefined） */
    drop?: Item;
    /** 这一档的限定物品是否已经全部拿到 */
    allOwned: boolean;
  } {
    const cfg = GZ_DIFFS[difficulty];
    honor.value += cfg.honor;
    gzKills.value += 1;

    const missing = GZ_DROPS[difficulty].ids.filter((id) => !owned.value.includes(id));
    const roll = Math.random();
    const res = {
      coins: 0,
      refund: 0,
      honor: cfg.honor,
      keys: 0,
      drop: undefined as Item | undefined,
      allOwned: missing.length === 0,
    };

    if (roll < GZ_REWARD_ODDS.coins) {
      // 🪙 金币档
      res.coins = cfg.coins;
      coins.value += cfg.coins;
      return { ...res, kind: 'coins' as const };
    }

    if (roll < GZ_REWARD_ODDS.coins + GZ_REWARD_ODDS.skin) {
      // 🎁 皮肤档：只在「这一档还没拥有的」里挑
      if (missing.length) {
        const id = missing[Math.floor(Math.random() * missing.length)];
        const it = ITEMS.find((i) => i.id === id);
        if (it) {
          owned.value = [...owned.value, it.id];
          res.drop = it;
        }
        res.allOwned = missing.length === 1;
        return { ...res, kind: 'skin' as const };
      }
      // 这一档拿齐了：不重复给，折算成该档那份金币
      res.coins = cfg.coins;
      res.refund = cfg.coins;
      coins.value += cfg.coins;
      return { ...res, kind: 'skin' as const };
    }

    // 🔑 钥匙档
    res.keys = cfg.keys;
    grantKeys(cfg.keys);
    return { ...res, kind: 'keys' as const };
  }

  // ---- 外星人降临：每日次数 / 单局最佳击杀 / 击杀里程碑 ----
  /** 今天已经用掉几次外星人挑战 */
  const alienUsed = useLocalStorage('bmt-alien-used', 0);
  /** 次数属于哪一天（YYYY-MM-DD，跨天自动重置） */
  const alienDay = useLocalStorage('bmt-alien-day', '');
  /** 单局最高击杀（进度条 / 战绩） */
  const alienBest = useLocalStorage('bmt-alien-best', 0);
  /** 已经解锁过的里程碑档位（存的是那档要求的击杀数） */
  const alienTiers = useLocalStorage<number[]>('bmt-alien-tiers', []);

  /** 今天还剩几次外星人挑战 */
  const alienLeftToday = computed(() =>
    Math.max(0, ALIEN_DAILY_MAX - (alienDay.value === todayKey() ? alienUsed.value : 0)),
  );

  /** 开打前扣一次每日次数（失败也算），和哥斯拉同一套 */
  function useAlienAttempt(): { ok: boolean; message: string } {
    if (alienDay.value !== todayKey()) {
      alienDay.value = todayKey();
      alienUsed.value = 0;
    }
    if (alienUsed.value >= ALIEN_DAILY_MAX) {
      return { ok: false, message: `今天 ${ALIEN_DAILY_MAX} 次挑战已经用完了，明天再来` };
    }
    alienUsed.value += 1;
    return { ok: true, message: `剩余次数 ${ALIEN_DAILY_MAX - alienUsed.value}` };
  }

  /**
   * 一局结束的结算：按击杀数发金币与荣誉点，再把达到的里程碑**一次性**解锁
   * （每档只给一次；早期档位给的是金币，见 `ALIEN_MILESTONES`）。
   * 返回这次新解锁的物品 / 里程碑金币与是否刷新了纪录，界面拿去弹横幅。
   */
  function grantAlienRun(kills: number): {
    coins: number;
    /** 里程碑里的金币档发下来的那部分（已算进 coins 总账，单独返回给界面展示） */
    bonus: number;
    honor: number;
    items: Item[];
    best: boolean;
  } {
    const coinsGained = kills * ALIEN_COINS_PER_KILL;
    const honorGained = kills * ALIEN_HONOR_PER_KILL;
    honor.value += honorGained;

    const best = kills > alienBest.value;
    if (best) alienBest.value = kills;

    const unlocked: Item[] = [];
    let bonus = 0;
    for (const m of ALIEN_MILESTONES) {
      if (kills < m.kills || alienTiers.value.includes(m.kills)) continue;
      alienTiers.value = [...alienTiers.value, m.kills];
      // 金币档：直接进金币，不占物品名额
      if (m.coins) {
        bonus += m.coins;
        continue;
      }
      const it = ITEMS.find((i) => i.id === m.id);
      if (!it) continue;
      if (!owned.value.includes(it.id)) owned.value = [...owned.value, it.id];
      unlocked.push(it);
    }
    coins.value += coinsGained + bonus;
    return { coins: coinsGained, bonus, honor: honorGained, items: unlocked, best };
  }

  /** ids of gacha items the player has won */
  const owned = useLocalStorage<string[]>('bmt-owned', []);
  /** highest star level owned per pet ref (absent = not hatched yet) */
  const petStars = useLocalStorage<Record<string, number>>('bmt-pet-stars', {});
  /**
   * 宝箱钥匙：开宝箱的唯一货币（**不再花金币**）。
   * 来源：成就（主要）、发球机里程碑、段位奖励、每日钓鱼任务、晋级赛名次、小黄龙转盘。
   */
  const chestKeys = useLocalStorage('bmt-chest-keys', 0);
  /**
   * 🧩 星尘碎片：开箱抽到「袋子档」时给的（见 `BAG_CHANCE`），
   * 只能在宝箱的**兑换区**里花——换 3★ 及以下的指定装扮（含宝箱专属那批）。
   * 跟金币不通用：金币是赚钱区挣的，碎片必须开箱才有。
   */
  const shards = useLocalStorage('bmt-shards', 0);
  /** free ten-pulls the player still holds */
  const tenTickets = useLocalStorage<number>('bmt-ten-tickets', 0);

  /** 发钥匙（各玩法的发奖统一走它），返回新的余量 */
  function grantKeys(n: number): number {
    if (n > 0) chestKeys.value += n;
    return chestKeys.value;
  }
  /** machine-mode combo milestones (10/20/…/100) already claimed */
  const milestones = useLocalStorage<number[]>('bmt-milestones', []);
  /** 发球机模式的历史最高连击：里程碑详情页的进度条就是它 */
  const machineBest = useLocalStorage('bmt-machine-best', 0);
  /** 每一档里程碑实际解锁到的物品（"里程碑编号 → 物品 id"），详情页拿来回显 */
  const milestoneLog = useLocalStorage<Record<string, string>>('bmt-milestone-log', {});
  /** 渔具等级（1-5，老存档的"鱼竿等级"沿用这个键）：钩子更大、能拉更大的鱼 */
  const rodLevel = useLocalStorage('bmt-rod-level', 1);
  /** 农场采摘等级：= 一次挥拍能同时摘下的棉花数（初始 1） */
  const farmLevel = useLocalStorage('bmt-farm-level', 1);
  /** 农场是否已买断拖拉机（可在页面上一键收全地） */
  const tractor = useLocalStorage('bmt-farm-tractor', false);
  /** 潜水：氧气罐等级（能待多久） */
  const oxygenLv = useLocalStorage('bmt-dive-oxygen', 1);
  /** 潜水：背包等级（一趟能带多少） */
  const bagLv = useLocalStorage('bmt-dive-bag', 1);
  /** 有没有买船（没船只能在家门口的浅滩潜） */
  const boat = useLocalStorage('bmt-dive-boat', false);
  /** 当前在哪个海岛潜水 */
  const island = useLocalStorage('bmt-dive-island', 'shore');
  /** 鱼图鉴：鱼种 id → 钓到的条数 + 最大体重（+ 闪光条数，老存档缺省 0） */
  const fishLog = useLocalStorage<Record<string, { count: number; best: number; shiny?: number }>>(
    'bmt-fish-log',
    {},
  );

  // ---- 材料（采集产出：不直接是钱，交给赚钱区的农场主才换钱）------------------
  /** 棉花：采棉花得到，一朵一个 */
  const cotton = useLocalStorage('bmt-cotton', 0);
  /** 矿石：砸矿得到，越硬的矿给得越多（石头 1 / 铁矿 2 / 金矿 4 / 钻石 10） */
  const ore = useLocalStorage('bmt-ore', 0);
  /**
   * 鱼仓：潜水那一趟的渔获**上岸时**入仓（氧气耗尽不算，那一趟直接白潜），
   * 然后拉去农场主那里按条卖。每条都带着当时算好的 `value`（闪光/鱼王的倍率已含在内）。
   */
  const fishBox = useLocalStorage<
    { id: string; name: string; emoji: string; kg: number; value: number }[]
  >('bmt-fish-box', []);

  /** 仓库里这些东西按农场主收购价一共值多少 */
  const materialValue = computed(
    () =>
      cotton.value * MATERIALS.cotton.price +
      ore.value * MATERIALS.ore.price +
      fishBox.value.reduce((s, f) => s + f.value, 0),
  );

  function addCotton(n: number): void {
    if (n > 0) cotton.value += n;
  }

  function addOre(n: number): void {
    if (n > 0) ore.value += n;
  }

  /** 潜水一趟的渔获入仓（上岸 / 离开潜水页时调用；一次性转入，不重复） */
  function addFish(
    list: { id: string; name: string; emoji: string; kg: number; value: number }[],
  ): void {
    if (!list.length) return;
    fishBox.value = [...fishBox.value, ...list];
  }

  /**
   * 农场主收购：把仓库里的材料换成金币（`what` 选一类，或 `all` 全卖）。
   * 鱼的收入记进「卖鱼累计」（`noteSold`），那条成就靠它。
   */
  function sellMaterials(what: 'cotton' | 'ore' | 'fish' | 'all'): {
    ok: boolean;
    coins: number;
    message: string;
  } {
    const takeCotton = what === 'cotton' || what === 'all';
    const takeOre = what === 'ore' || what === 'all';
    const takeFish = what === 'fish' || what === 'all';
    const c = takeCotton ? cotton.value : 0;
    const o = takeOre ? ore.value : 0;
    const fish = takeFish ? [...fishBox.value] : [];
    const fishCoins = fish.reduce((s, f) => s + f.value, 0);
    const gained = c * MATERIALS.cotton.price + o * MATERIALS.ore.price + fishCoins;
    if (gained <= 0) return { ok: false, coins: 0, message: '仓库里没有能换钱的东西' };
    if (takeCotton) cotton.value = 0;
    if (takeOre) ore.value = 0;
    if (takeFish) fishBox.value = [];
    coins.value += gained;
    if (fishCoins > 0) noteSold(fishCoins);
    return { ok: true, coins: gained, message: `换到 ¥${gained}` };
  }
  /** 成就专用的小计数器：卖鱼总额 / 下潜次数 / 出海次数 / 最深下潜（米）+ 鱼王 / 闪光 */
  const achStats = useLocalStorage<{
    sold: number;
    dives: number;
    trips: number;
    deepest: number;
    kings: number;
    shiny: number;
  }>('bmt-ach-stats', { sold: 0, dives: 0, trips: 0, deepest: 0, kings: 0, shiny: 0 });
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

  // ---- 属性点（速度 / 力量 / 容错） -------------------------------------------
  /**
   * 分配意图；实际生效会被当前段位额度裁剪——掉段自动缩水、升段自动恢复，
   * 所以玩家不用手动重分配。
   */
  const attrAlloc = useLocalStorage<AttrAlloc>('bmt-attr-alloc', emptyAlloc());
  /** 当前段位给的总点数（随积分实时增减） */
  const attrPoints = computed(() => totalAttrPoints(points.value));
  /** 原始分配合计 */
  const attrSpent = computed(() => spentPoints(attrAlloc.value));
  /** 实际生效的分配（超出额度时按 速度→力量→容错 裁剪） */
  const attrEffective = computed(() => effectiveAlloc(attrAlloc.value, attrPoints.value));
  /**
   * 写进对局的属性倍率。**由四维派生**——四维是唯一的加成来源，
   * 玩家（属性点 → 四维）和 AI（名录里的四维）走的是同一条换算。
   */
  const attrs = computed(() => attrsFromStats(playerStats(points.value, attrEffective.value)));

  function addAttr(key: AttrKey): boolean {
    if (attrSpent.value >= attrPoints.value) return false;
    attrAlloc.value = { ...attrAlloc.value, [key]: (attrAlloc.value[key] ?? 0) + 1 };
    return true;
  }

  function removeAttr(key: AttrKey): boolean {
    if ((attrAlloc.value[key] ?? 0) <= 0) return false;
    attrAlloc.value = { ...attrAlloc.value, [key]: attrAlloc.value[key] - 1 };
    return true;
  }

  function resetAttrs(): void {
    attrAlloc.value = emptyAlloc();
  }

  function isClaimed(id: TierId): boolean {
    return claimed.value.includes(id);
  }

  /** ownership: free always, gacha/chest/coin/code by collection, pets by hatching, else by tier */
  function isOwned(item: Item): boolean {
    if (item.source === 'free') return true;
    if (
      item.source === 'gacha' ||
      item.source === 'chest' ||
      item.source === 'shard' ||
      item.source === 'coin' ||
      item.source === 'code'
    )
      return owned.value.includes(item.id);
    if (item.source === 'egg') return (petStars.value[item.ref] ?? 0) > 0;
    if (item.source === 'streak') return milestones.value.includes(100);
    // 荣誉商店 / 活动限定 / 连击里程碑的东西：拿到过才算拥有（都记在 owned 里）
    if (item.source === 'honor' || item.source === 'event' || item.source === 'combo')
      return owned.value.includes(item.id);
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
    trackSeasonPeak();
  }

  // ---- 晋级赛（8 人淘汰赛） + 赛季 -------------------------------------------

  /** 当前进行中的一届晋级赛（null = 没报名） */
  const arenaRun = useLocalStorage<null | {
    tier: TierId;
    /** 本届赛事名（从该段位的名池里抽的，每届不同） */
    cupName: string;
    /** 当前轮次：0 = 16强，1 = 8强，2 = 4强，3 = 决赛 */
    round: number;
    /** 已经赢下的场次 */
    wins: number;
    /** 16 位参赛者（含自己） */
    entrants: ArenaEntrant[];
    /** 完整对阵树：rounds[轮次][场次] */
    rounds: ArenaBracket;
  }>('bmt-arena-run', null);

  /** 每个杯赛的冷却到期时间戳（打完一届后 5 分钟不能重报） */
  const arenaCooldown = useLocalStorage<Record<string, number>>('bmt-arena-cooldown', {});

  // 老存档迁移：旧赛制（8 人、没有完整对阵树 / 四维）的那一届直接作废，避免读半截数据
  if (
    arenaRun.value &&
    (!arenaRun.value.entrants ||
      !arenaRun.value.rounds ||
      arenaRun.value.entrants.some((e) => !e.stats || !Number.isFinite(e.stats.jump)))
  ) {
    arenaRun.value = null;
  }

  /** AI 球员名录：首次进入游戏时随机生成一份，之后持久化（战绩会被写回） */
  const aiPlayers = useLocalStorage<AiPlayer[]>('bmt-ai-players', []);
  if (!aiPlayers.value.length) {
    aiPlayers.value = generatePlayers(20);
  } else {
    // 老存档：补四维 / 把 style 与 difficulty 校准到与四维一致（没变化就不写回）
    const needs = aiPlayers.value.some(
      (p) =>
        !p.stats ||
        !Number.isFinite(p.stats.jump) ||
        p.style !== styleFromStats(p.stats) ||
        p.difficulty !== tierFromStats(p.stats),
    );
    if (needs) aiPlayers.value = aiPlayers.value.map(syncDerived);
  }
  /**
   * 把传奇球员皮泽恩补进名录（老存档 / 名录被改坏时都要补上），并恒定排在最前。
   * 返回是否真的补了人。除了初始化时调用，名人堂页面挂载时也会再校验一次——
   * 这样即使游戏在更新之前就已经开着（store 早就初始化完了），打开排行榜也能自动补上。
   */
  function ensureLegend(): boolean {
    if (aiPlayers.value.some((p) => p.id === LEGEND_ID)) return false;
    aiPlayers.value = withLegend(aiPlayers.value);
    return true;
  }
  ensureLegend();

  // 老存档兼容：以前 100 连击送「哥斯拉」，改版后哥斯拉由「哥斯拉来袭」地狱难度掉落。
  // 已经打到 100 连击的老玩家，把哥斯拉按旧规则补进收藏，不让人白打。
  if (milestones.value.includes(100) && !owned.value.includes('skin:godzilla')) {
    owned.value = [...owned.value, 'skin:godzilla'];
  }
  /** 玩家自己在单机 / 晋级赛里的胜负记录（排行榜里和自己对比用） */
  const playerRecord = useLocalStorage('bmt-player-record', { wins: 0, losses: 0 });

  /** 赛季（YYYY-MM）：积分每月 1 号清零，按赛季最高段位发金币 */
  const seasonId = useLocalStorage('bmt-season', '');
  const seasonPeak = useLocalStorage<TierId>('bmt-season-peak', 'bronze');

  function currentSeasonId(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function trackSeasonPeak(): void {
    const cur = tierForPoints(points.value).id;
    if (TIERS.findIndex((t) => t.id === cur) > TIERS.findIndex((t) => t.id === seasonPeak.value)) {
      seasonPeak.value = cur;
    }
  }

  /** 应用启动时跑一次：跨月就结算上赛季（积分清零 + 按最高段位发金币） */
  function checkSeason(): void {
    const cur = currentSeasonId();
    if (seasonId.value === cur) return;
    if (seasonId.value) {
      const reward = SEASON_REWARDS[TIERS.findIndex((t) => t.id === seasonPeak.value)] ?? 100;
      coins.value += reward;
      pushNotice(`赛季 ${seasonId.value} 结算：最高段位 ${tierById(seasonPeak.value).label}，奖励 🪙${reward}！积分已清零，新赛季加油！`);
      points.value = 0;
      seasonPeak.value = 'bronze';
    }
    seasonId.value = cur;
  }
  checkSeason();

  /** 奖杯柜：每个杯赛记录 冠军/亚军/季军 次数 */
  const trophies = useLocalStorage<Record<string, { champion: number; runner: number; third: number }>>(
    'bmt-trophies',
    {},
  );

  /** 报名一届杯赛：积分门槛、报名费、冷却三关都过才能报 */
  function enterArena(cupId: TierId, meName = '你'): { ok: boolean; message: string } {
    if (arenaRun.value) {
      if (arenaRun.value.tier === cupId) return { ok: true, message: '继续这一届' };
      return { ok: false, message: '还有一届没打完，先去打完它' };
    }
    const a = arenaByTier(cupId);
    if (points.value < a.req) {
      return { ok: false, message: `还差 ${a.req - points.value} 积分解锁「${a.cup}」` };
    }
    const cd = arenaCooldown.value[cupId] ?? 0;
    if (cd > Date.now()) {
      return { ok: false, message: `${a.cup}刚打完，${Math.ceil((cd - Date.now()) / 1000)} 秒后可再报名` };
    }
    if (coins.value < a.fee) return { ok: false, message: `报名费不够，还差 🪙${a.fee - coins.value}` };
    coins.value -= a.fee;

    const entrants = buildEntrants(cupId, meName);
    const cupName = pickCupName(a.tier);
    arenaRun.value = {
      tier: a.tier,
      cupName,
      round: 0,
      wins: 0,
      entrants,
      rounds: buildBracket(entrants),
    };
    return { ok: true, message: `「${cupName}」报名成功！-${a.fee} 金币，祝好运` };
  }

  /**
   * 临时弱手的装扮：只从**普通 / 稀有**里挑帽子、球拍皮肤、击球拖尾，
   * 其余部位一律不穿——看上去就是个没见过世面的新手，不会一身传说。
   */
  function rookieCosmetic(): Cosmetic {
    const pickLow = (slot: ItemSlot): string => {
      const pool = ITEMS.filter(
        (i) =>
          i.slot === slot &&
          (i.rarity === 'common' || i.rarity === 'rare') &&
          i.ref !== 'none' &&
          i.ref !== 'default',
      );
      return pool.length ? pool[Math.floor(Math.random() * pool.length)].ref : 'none';
    };
    const c = { ...DEFAULT_COSMETIC };
    c.hat = pickLow('hat') as Cosmetic['hat'];
    c.racketSkin = pickLow('racketSkin') as Cosmetic['racketSkin'];
    c.trailStyle = pickLow('trail') as Cosmetic['trailStyle'];
    return c;
  }

  /**
   * 现场生成一位「临时弱手」（低档杯赛专用，不进名人堂）。
   *
   * 四维按档位递进：第 1 档 28~38、第 2 档 34~44、第 3 档 40~50 ——
   * 比 0 积分新号的 52 明显低，所以新手也能稳稳打赢。
   * 风格与难度照旧由四维派生，rating 只是个用来在对阵树上显示强弱的数字。
   */
  function makeRookie(tierIdx: number, name: string): ArenaEntrant {
    const base = 28 + tierIdx * 6;
    const roll = (): number => Math.round(base + Math.random() * 10);
    const stats: PlayerStats = {
      technique: roll(),
      speed: roll(),
      attack: roll(),
      defense: roll(),
      jump: roll(),
    };
    return {
      id: `rookie-${tierIdx}-${name}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      isMe: false,
      rating: 400 + tierIdx * 130 + Math.round(Math.random() * 80),
      style: styleFromStats(stats),
      difficulty: tierFromStats(stats),
      cosmetic: rookieCosmetic(),
      stats,
    };
  }

  /**
   * 生成 16 位参赛者：自己 + 15 位对手。
   *
   * - **前 3 档杯赛**（新芽 / 青竹 / 曙光）：现场生成临时弱手，完全不碰名人堂。
   * - **其余杯赛**：从名人堂名录里抽（杯赛越高抽到的一档越强），最后两档必定拉上皮泽恩。
   */
  function buildEntrants(tier: TierId, meName: string): ArenaEntrant[] {
    const tierIdx = TIERS.findIndex((t) => t.id === tier);
    const want = 2 ** ARENA_ROUNDS.length - 1; // 16 人 → 15 位 AI

    let opponents: ArenaEntrant[];
    if (tierIdx < ROOKIE_TIERS) {
      // 低档杯赛：当场生成一批路人弱手（名字池洗牌后取 15 个，不重复）
      const names = shuffleList([...ROOKIE_NAMES]);
      opponents = Array.from({ length: want }, (_, i) => makeRookie(tierIdx, names[i % names.length]));
    } else {
      const sorted = [...aiPlayers.value].sort((a, b) => b.rating - a.rating);
      const span = Math.max(0, sorted.length - want);
      // 杯赛越高，抽到的一档越强
      const start = Math.round((1 - tierIdx / Math.max(1, TIERS.length - 1)) * span);
      const chosen = sorted.length <= want ? [...sorted] : sorted.slice(start, start + want);
      // 传奇球员皮泽恩只打高级赛事：最后两档杯赛必定拉他进 16 人名单
      if (tierIdx >= TIERS.length - 2 && !chosen.some((p) => p.id === LEGEND_ID) && chosen.length) {
        const legend = sorted.find((p) => p.id === LEGEND_ID);
        if (legend) chosen.splice(chosen.length - 1, 1, legend);
      }
      while (chosen.length < want && sorted.length) {
        chosen.push(sorted[chosen.length % sorted.length]);
      }
      opponents = chosen.map((p) => ({
        id: p.id,
        name: p.name,
        isMe: false,
        rating: p.rating,
        style: p.style,
        difficulty: p.difficulty,
        cosmetic: p.cosmetic,
        stats: ensureStats(p),
      }));
    }

    const me: ArenaEntrant = {
      id: ME_ID,
      name: meName || '你',
      isMe: true,
      rating: 1000 + points.value,
      style: 'balanced',
      difficulty: 'normal',
      stats: playerStats(points.value, attrEffective.value),
    };
    // 洗牌，让自己落在随机位置
    return shuffleList([me, ...opponents]);
  }

  function settleArena(place: ArenaPlace): void {
    const run = arenaRun.value;
    if (!run) return;
    const a = arenaByTier(run.tier);
    const gold = goldForPlace(a, place, run.wins);
    const gain = pointsForPlace(a, place);
    // 荣誉点：冠亚季军才有，且随杯赛档位放大（荣誉商店的唯一货币，永久不清零）
    const hon = honorForPlace(run.tier, place);
    coins.value += gold;
    honor.value += hon;
    const before = tierForPoints(points.value).id;
    points.value += gain;
    trackSeasonPeak();
    // 奖杯柜：冠亚季各记一次（季军 = 半决赛输的那两位）
    if (place === 'champion' || place === 'runner' || place === 'third') {
      const cur = trophies.value[run.tier] ?? { champion: 0, runner: 0, third: 0 };
      trophies.value = {
        ...trophies.value,
        [run.tier]: {
          champion: cur.champion + (place === 'champion' ? 1 : 0),
          runner: cur.runner + (place === 'runner' ? 1 : 0),
          third: cur.third + (place === 'third' ? 1 : 0),
        },
      };
    }
    const after = tierForPoints(points.value);
    // 钥匙：冠亚季军各有一点（宝箱钥匙的来源之一）
    const keyGain = place === 'champion' ? 5 : place === 'runner' ? 3 : place === 'third' ? 2 : 0;
    if (keyGain) grantKeys(keyGain);
    let text =
      `「${run.cupName}」${PLACE_LABEL[place]}：金币 +${gold}` +
      (gain ? ` · 积分 +${gain}` : ' · 无积分') +
      (hon ? ` · 荣誉 +${hon}` : '') +
      (keyGain ? ` · 🔑 钥匙 +${keyGain}` : '');
    if (after.id !== before) text += ` · 升入 ${after.label}！可领取荣誉奖励`;
    pushNotice(text);
    // 本届结束：该杯赛进入冷却
    arenaCooldown.value = {
      ...arenaCooldown.value,
      [run.tier]: Date.now() + ARENA_COOLDOWN_MS,
    };
    arenaRun.value = null;
  }

  /**
   * 打完自己这一场：记录胜负、把同轮其它场次用 Elo 模拟补齐；
   * 赢了就推进到下一轮（或夺冠），输了就按轮次结算名次。
   */
  function arenaFinishMatch(playerWon: boolean): {
    win: boolean;
    finished: boolean;
    place?: ArenaPlace;
  } {
    const run = arenaRun.value;
    if (!run) return { win: false, finished: true };
    const r = run.round;
    const idx = myMatchIndex(run.rounds, r, ME_ID);
    const match = idx >= 0 ? run.rounds[r][idx] : undefined;
    if (!match) return { win: false, finished: true };

    const foeId = match.a === ME_ID ? match.b : match.a;
    match.winner = playerWon ? ME_ID : foeId;
    if (foeId) recordVsAi(foeId, playerWon);

    // 同轮其它场次：AI 之间按 Elo 模拟，树状图才每轮都完整
    for (const m of run.rounds[r]) {
      if (m.winner) continue;
      const A = run.entrants.find((e) => e.id === m.a);
      const B = run.entrants.find((e) => e.id === m.b);
      m.winner = A && B ? simulateArenaMatch(A, B) : m.a || m.b || null;
    }

    if (!playerWon) {
      const place: ArenaPlace =
        r >= ARENA_ROUNDS.length - 1 ? 'runner' : r === 2 ? 'third' : r === 1 ? 'fourth' : 'qf';
      settleArena(place);
      return { win: false, finished: true, place };
    }

    if (r >= ARENA_ROUNDS.length - 1) {
      run.wins += 1;
      settleArena('champion');
      return { win: true, finished: true, place: 'champion' };
    }

    fillNextRound(run.rounds, r);
    run.round = r + 1;
    run.wins += 1;
    arenaRun.value = { ...run };
    return { win: true, finished: false };
  }

  /** 放弃当前这届晋级赛：退 20% 报名费，本届结束并进入冷却 */
  function arenaQuit(): { ok: boolean; message: string } {
    const run = arenaRun.value;
    if (!run) return { ok: false, message: '没有进行中的晋级赛' };
    const a = arenaByTier(run.tier);
    const refund = Math.round(a.fee * 0.2);
    coins.value += refund;
    arenaCooldown.value = {
      ...arenaCooldown.value,
      [run.tier]: Date.now() + ARENA_COOLDOWN_MS,
    };
    arenaRun.value = null;
    const text = `退出「${run.cupName}」，退回 20% 报名费 🪙${refund}`;
    pushNotice(text);
    return { ok: true, message: text };
  }

  /** 玩家和某位 AI 打完一场：写回该球员的战绩并更新玩家自己的记录 */
  function recordVsAi(playerId: string, playerWon: boolean): void {
    const idx = aiPlayers.value.findIndex((p) => p.id === playerId);
    if (idx < 0) return;
    const next = [...aiPlayers.value];
    next[idx] = applyMatchResult(next[idx], playerWon);
    aiPlayers.value = next;
    playerRecord.value = {
      wins: playerRecord.value.wins + (playerWon ? 1 : 0),
      losses: playerRecord.value.losses + (playerWon ? 0 : 1),
    };
  }

  // ---- 名人堂的增删改（新增 / 退役 / 编辑）----------------------------------

  /** 新增一位球员（随机生成，随后可以在编辑面板里改） */
  function addAiPlayer(): AiPlayer {
    const p = makeRandomPlayer(aiPlayers.value);
    aiPlayers.value = [...aiPlayers.value, p];
    pushNotice(`名人堂新增球员「${p.name}」`);
    return p;
  }

  /**
   * 编辑一位球员：名字 / 装扮 / rating / 五维。
   * 改了五维就按五维**重算 rating**（不传 rating 时），并顺手把 style / difficulty 校准。
   */
  function updateAiPlayer(
    id: string,
    patch: Partial<Pick<AiPlayer, 'name' | 'rating' | 'cosmetic'>> & { stats?: Partial<PlayerStats> },
  ): void {
    const idx = aiPlayers.value.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const cur = aiPlayers.value[idx];
    const stats: PlayerStats = patch.stats
      ? { ...ensureStats(cur), ...patch.stats }
      : ensureStats(cur);
    const next = [...aiPlayers.value];
    next[idx] = syncDerived({
      ...cur,
      ...patch,
      stats,
      rating: patch.rating ?? (patch.stats ? ratingFromStats(stats) : cur.rating),
    });
    aiPlayers.value = next;
  }

  /** 退役（不再上榜单 / 不再参加赛事）或复出；战绩与履历都保留 */
  function setAiRetired(id: string, retired: boolean): void {
    const idx = aiPlayers.value.findIndex((p) => p.id === id);
    if (idx < 0) return;
    const next = [...aiPlayers.value];
    next[idx] = { ...next[idx], retired };
    aiPlayers.value = next;
    pushNotice(`「${next[idx].name}」${retired ? '已退役，不再参加赛事' : '复出了'}`);
  }

  /** 除名：只允许删掉**自己新增**的球员（系统球员请用「退役」） */
  function removeAiPlayer(id: string): boolean {
    const p = aiPlayers.value.find((x) => x.id === id);
    if (!p || !p.custom || id === LEGEND_ID) return false;
    aiPlayers.value = aiPlayers.value.filter((x) => x.id !== id);
    pushNotice(`已把「${p.name}」除名`);
    return true;
  }

  // ---- 🌍 世界赛（观战台的数据源）-------------------------------------------

  /** 只存「玩家真看过 / 快进过」的那几场；届一换就清空（联赛自己往前滚） */
  const worldArena = useLocalStorage<{ edition: number; overrides: Record<string, string> }>(
    'bmt-world-arena',
    { edition: -1, overrides: {} },
  );

  /** 翻届：届号一变就把「看过的那几场」清掉（联赛自己往前滚）。视图每秒调一次 */
  function ensureWorldEdition(now = Date.now()): number {
    const ed = worldEdition(now);
    if (worldArena.value.edition !== ed) worldArena.value = { edition: ed, overrides: {} };
    return ed;
  }

  /**
   * 当前这一届世界赛"到此刻为止"的样子——**纯读**（不在 computed 里写状态）。
   * 届号还没翻（视图没来得及调 `ensureWorldEdition`）时，按"没有任何 override"算。
   */
  function worldArenaState(now = Date.now()): WorldArenaState {
    const ed = worldEdition(now);
    const overrides = worldArena.value.edition === ed ? worldArena.value.overrides : {};
    return worldState(aiPlayers.value, ed, now, overrides);
  }

  /** 正在打的那一场（没有就 null） */
  function worldLiveMatch(
    now = Date.now(),
  ): { round: number; index: number; a: ArenaEntrant; b: ArenaEntrant } | null {
    const st = worldArenaState(now);
    if (!st.live) return null;
    const m = st.rounds[st.live.round]?.[st.live.index];
    if (!m) return null;
    const a = st.entrants.find((e) => e.id === m.a);
    const b = st.entrants.find((e) => e.id === m.b);
    return a && b ? { round: st.live.round, index: st.live.index, a, b } : null;
  }

  /**
   * 记下一场世界赛的结果（**真观战打完**与**快进**都走这里）：
   * 写进 `overrides`（刷新也认这个结果），并把两位 AI 的战绩一起更新——
   * 所以"看比赛"是真的在改变名人堂的名次。
   */
  function recordWorldMatch(round: number, index: number, winnerId: string): boolean {
    const ed = ensureWorldEdition();
    const key = MATCH_KEY(round, index);
    if (worldArena.value.overrides[key]) return false; // 已经记过，别重复记战绩
    const st = worldState(aiPlayers.value, ed, Date.now(), worldArena.value.overrides);
    const m = st.rounds[round]?.[index];
    if (!m || (winnerId !== m.a && winnerId !== m.b)) return false;
    const loserId = winnerId === m.a ? m.b : m.a;
    worldArena.value = {
      edition: ed,
      overrides: { ...worldArena.value.overrides, [key]: winnerId },
    };
    const wi = aiPlayers.value.findIndex((p) => p.id === winnerId);
    const li = aiPlayers.value.findIndex((p) => p.id === loserId);
    if (wi >= 0 && li >= 0 && wi !== li) {
      const next = [...aiPlayers.value];
      const out = applyAiResult(next[wi], next[li]);
      next[wi] = out.winner;
      next[li] = out.loser;
      aiPlayers.value = next;
    }
    return true;
  }

  /** 快进：不看这一场，直接按五维算结果并写回赛程 */
  function fastForwardWorldMatch(round: number, index: number): boolean {
    const ed = ensureWorldEdition();
    const st = worldState(aiPlayers.value, ed, Date.now(), worldArena.value.overrides);
    const m = st.rounds[round]?.[index];
    if (!m || !m.a || !m.b) return false;
    let winner = m.winner;
    if (!winner) {
      const a = st.entrants.find((e) => e.id === m.a);
      const b = st.entrants.find((e) => e.id === m.b);
      if (!a || !b) return false;
      winner = simulateArenaMatch(a, b);
    }
    return recordWorldMatch(round, index, winner);
  }

  /** 段位奖励：每档 3 把宝箱钥匙（宝箱钥匙的来源之一） */
  function claim(id: TierId): void {
    const t = TIERS.find((x) => x.id === id);
    if (!t || points.value < t.points || claimed.value.includes(id)) return;
    claimed.value = [...claimed.value, id];
    grantKeys(3);
    pushNotice(`已领取 ${t.label} 奖励：${t.reward} · 🔑 钥匙 +3（共 ${chestKeys.value} 把）`);
  }

  /**
   * 发球机里连击涨了就报一笔：只用来刷新历史最高连击（里程碑进度条读数）。
   */
  function noteMachineStreak(streak: number): void {
    if (streak > machineBest.value) machineBest.value = streak;
  }

  /**
   * 发球机连击里程碑（10/20/…/100），每个只算一次。
   * 10~100 给「复古训练房」套装里为这个活动定制的同主题装扮
   * （固定对照表见 items.MILESTONE_REWARD，不进宝箱池）；
   * 100 连击的终极大奖是「发球机教练」形象。
   * 哥斯拉皮肤不在这里——它是「哥斯拉来袭」地狱难度的概率掉落。
   */
  function claimMilestone(n: number): { kind: 'item'; item: Item } | null {
    if (n <= 0 || n % 10 !== 0 || milestones.value.includes(n)) return null;
    milestones.value = [...milestones.value, n];
    const itemId = MILESTONE_REWARD[n] ?? 'skin:coach';
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return null;
    if (!owned.value.includes(item.id)) owned.value = [...owned.value, item.id];
    milestoneLog.value = { ...milestoneLog.value, [String(n)]: item.id };
    // 每档附带 1 把宝箱钥匙（宝箱钥匙的来源之一）
    grantKeys(1);
    return { kind: 'item', item };
  }

  /**
   * 兑换码：码 → 物品 id。大小写和空格都无所谓。
   * 前导的 `ux7891` 是 U熊皮肤的那个码。
   */
  const REDEEM_CODES: Record<string, string> = {
    ux7891: 'skin:ubear',
    '91laopi': 'skin:laopi',
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

  /** 记一笔图鉴（钓到一条鱼；闪光鱼单独计数，图鉴上挂 ✨） */
  function logFish(id: string, kg: number, shiny = false): void {
    const cur = fishLog.value[id] ?? { count: 0, best: 0, shiny: 0 };
    fishLog.value = {
      ...fishLog.value,
      [id]: {
        count: cur.count + 1,
        best: Math.max(cur.best, kg),
        shiny: (cur.shiny ?? 0) + (shiny ? 1 : 0),
      },
    };
  }

  /** 抓到鱼王 / 闪光鱼的成就计数 */
  function noteFishKing(): void {
    achStats.value = { ...achStats.value, kings: achStats.value.kings + 1 };
  }
  function noteFishShiny(): void {
    achStats.value = { ...achStats.value, shiny: achStats.value.shiny + 1 };
  }

  // ---- 每日钓鱼任务 / 闪光鱼饵 -------------------------------------------------

  /** 任务属于哪一天 */
  const fishTaskDay = useLocalStorage('bmt-fish-task-day', '');
  /** 今天的任务 id（FISH_TASKS 里的一条，跨天随机换） */
  const fishTaskId = useLocalStorage('bmt-fish-task-id', '');
  /** 任务进度 */
  const fishTaskProg = useLocalStorage('bmt-fish-task-prog', 0);
  /** 今天这条任务领过奖没有 */
  const fishTaskClaimed = useLocalStorage('bmt-fish-task-claimed', false);

  /** 今天的钓鱼任务（进页面时对齐日期，跨天自动换一条） */
  const fishTask = computed<FishTaskTemplate>(() => {
    if (fishTaskDay.value !== todayKey() || !fishTaskId.value) {
      return FISH_TASKS[0];
    }
    return FISH_TASKS.find((t) => t.id === fishTaskId.value) ?? FISH_TASKS[0];
  });

  /** 闪光鱼饵余量：>0 时下一条生成的鱼必为闪光（开宝箱获得） */
  const shinyBait = useLocalStorage('bmt-shiny-bait', 0);

  /** 保证今天的任务已就绪：跨天随机抽一条并清零进度 */
  function ensureFishTask(): FishTaskTemplate {
    const today = todayKey();
    if (fishTaskDay.value !== today || !fishTaskId.value) {
      fishTaskDay.value = today;
      fishTaskId.value = FISH_TASKS[Math.floor(Math.random() * FISH_TASKS.length)].id;
      fishTaskProg.value = 0;
      fishTaskClaimed.value = false;
    }
    return FISH_TASKS.find((t) => t.id === fishTaskId.value) ?? FISH_TASKS[0];
  }

  /** 抓到鱼时推进任务进度（DiveScene.onCatch → FishView 调用） */
  function noteFishCatch(taskId: string, spId: string, kg: number, shiny: boolean): void {
    const task = ensureFishTask();
    if (task.id !== taskId) return;
    const sp = SPECIES.find((s) => s.id === spId);
    if (sp && fishTaskMatch(task.id, sp, kg, shiny)) {
      fishTaskProg.value = Math.min(task.goal, fishTaskProg.value + 1);
    }
  }

  /** 领取今日钓鱼任务奖励 */
  function claimFishTask(): { ok: boolean; message: string } {
    const task = ensureFishTask();
    if (fishTaskClaimed.value) return { ok: false, message: '今天这份已经领过了' };
    if (fishTaskProg.value < task.goal) {
      return { ok: false, message: `任务还没完成（${fishTaskProg.value}/${task.goal}）` };
    }
    fishTaskClaimed.value = true;
    coins.value += task.coins;
    honor.value += task.honor;
    // 每日任务的额外小奖励：1 把宝箱钥匙
    grantKeys(1);
    return {
      ok: true,
      message: `任务完成！🪙 +${task.coins} · 🏅 +${task.honor} · 🔑 钥匙 +1`,
    };
  }

  /** 开宝箱获得闪光鱼饵 */
  function grantShinyBait(): number {
    shinyBait.value += 1;
    return shinyBait.value;
  }
  /** 消耗一个闪光鱼饵（生成下一条鱼时用），没有返回 false */
  function consumeShinyBait(): boolean {
    if (shinyBait.value <= 0) return false;
    shinyBait.value -= 1;
    return true;
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

  /**
   * 荣誉商店兑换：花荣誉点买下特殊角色形象 / 坐骑。
   * 买过就永久拥有（记进 `owned`，跟宝箱抽到的东西共用一套所有权）。
   */
  function buyHonorItem(id: string): { ok: boolean; message: string } {
    const item = ITEMS.find((i) => i.id === id);
    const price = honorPriceOf(id);
    if (!item || !price) return { ok: false, message: '没有这件商品' };
    if (owned.value.includes(id)) return { ok: false, message: `已经拥有「${item.label}」了` };
    if (honor.value < price) {
      return { ok: false, message: `荣誉点不够，还差 ${price - honor.value} 点` };
    }
    honor.value -= price;
    owned.value = [...owned.value, id];
    return { ok: true, message: `已兑换「${item.label}」` };
  }

  /** 开一场小黄龙挑战：先扣一张今日门票（每天 NAILONG_DAILY_MAX 张，输赢都扣） */
  function startNailongMatch(): { ok: boolean; message: string } {
    const today = todayKey();
    if (nailongDay.value !== today) {
      nailongDay.value = today;
      nailongAttempts.value = 0;
    }
    if (nailongAttempts.value >= NAILONG_DAILY_MAX) {
      return { ok: false, message: `今天的 ${NAILONG_DAILY_MAX} 张门票用完了，明天再来找小黄龙玩` };
    }
    nailongAttempts.value += 1;
    return { ok: true, message: `已消耗门票 1 张（今日 ${nailongAttempts.value}/${NAILONG_DAILY_MAX}）` };
  }

  /** 打赢小黄龙：+1 张转盘抽奖券（门票在开打时就已扣掉，这里只管发券） */
  function earnNailongTicket(): { ok: boolean; message: string } {
    nailongTickets.value += 1;
    return { ok: true, message: `获得抽奖券 ×1（共 ${nailongTickets.value} 张）` };
  }

  /**
   * 转一次小黄龙转盘：扣一张券，按权重（或保底）决定落在哪一格并发奖。
   * 返回格子下标，界面拿去把盘转到那一格。
   */
  function spinNailongWheel(): { ok: boolean; index: number; message: string } {
    if (nailongTickets.value <= 0) {
      return { ok: false, index: -1, message: '没有抽奖券了，先去打赢小黄龙' };
    }
    nailongTickets.value -= 1;

    // 保底：连续多次没出限定，这次必给一件「还没拥有的限定」
    const missing = WHEEL_PRIZES.filter(
      (p) => p.grand && p.itemId && !owned.value.includes(p.itemId),
    );
    const index =
      nailongPity.value >= NAILONG_PITY && missing.length
        ? WHEEL_PRIZES.indexOf(missing[Math.floor(Math.random() * missing.length)])
        : rollWheelIndex();

    const prize = WHEEL_PRIZES[index];
    nailongPity.value = prize.grand ? 0 : nailongPity.value + 1;

    if (prize.kind === 'coins') {
      coins.value += prize.amount ?? 0;
      return { ok: true, index, message: `金币 +${prize.amount}` };
    }
    if (prize.kind === 'honor') {
      honor.value += prize.amount ?? 0;
      return { ok: true, index, message: `荣誉点 +${prize.amount}` };
    }
    if (prize.kind === 'key') {
      grantKeys(prize.amount ?? 0);
      return { ok: true, index, message: `🔑 宝箱钥匙 +${prize.amount}` };
    }
    const item = prize.itemId ? ITEMS.find((i) => i.id === prize.itemId) : undefined;
    if (!item || !prize.itemId) return { ok: true, index, message: '谢谢参与' };
    // 重复的限定 → 折成金币，不让玩家白抽
    if (owned.value.includes(prize.itemId)) {
      coins.value += NAILONG_DUP_COINS;
      return { ok: true, index, message: `重复的「${item.label}」→ 金币 +${NAILONG_DUP_COINS}` };
    }
    owned.value = [...owned.value, prize.itemId];
    return { ok: true, index, message: `🎉 获得限定「${item.label}」` };
  }

  /** 花金币升农场采摘等级：等级就是「一次挥拍能摘几朵棉花」 */
  function upgradeFarm(): boolean {
    if (farmLevel.value >= FARM_MAX_LEVEL) return false;
    const cost = FARM_UPGRADE_COST[farmLevel.value] ?? 0;
    if (coins.value < cost) return false;
    coins.value -= cost;
    farmLevel.value += 1;
    return true;
  }

  /** 买断拖拉机（一次性），之后可以在农场页面「一键收全地」 */
  function buyTractor(): boolean {
    if (tractor.value || coins.value < TRACTOR_COST) return false;
    coins.value -= TRACTOR_COST;
    tractor.value = true;
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
      case 'fishKings':
        return achStats.value.kings;
      case 'fishShiny':
        return achStats.value.shiny;
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
   * 检查所有成就：新达成的一律**立刻发奖**（宝箱钥匙 + 收藏里的定制物品 / 皮肤）。
   * 成就**不再发金币**——金币改成只在金币商店花，钥匙才是开宝箱的东西。
   * 返回刚完成的那批，调用方可以逐条弹提示。重复调用没有副作用。
   */
  function syncAchievements(): Achievement[] {
    const fresh: Achievement[] = [];
    let keyGain = 0;
    let nextOwned: string[] | null = null;
    for (const ach of ACHIEVEMENTS) {
      if (achDone.value.includes(ach.id)) continue;
      if (metricValue(ach.metric) < ach.goal) continue;
      fresh.push(ach);
      if (ach.keys) keyGain += ach.keys;
      if (ach.itemId) {
        const list: string[] = nextOwned ?? [...owned.value];
        if (!list.includes(ach.itemId)) list.push(ach.itemId);
        nextOwned = list;
      }
    }
    if (!fresh.length) return fresh;
    achDone.value = [...achDone.value, ...fresh.map((a) => a.id)];
    if (keyGain) grantKeys(keyGain);
    if (nextOwned) owned.value = nextOwned;
    const parts = [keyGain ? `🔑 +${keyGain}` : '', ...fresh.map((a) => a.name)];
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

  /**
   * 从**给定池子**里按星级权重抽一件（同星级内等概率）；挂了 `pullWeight` 的按绝对权重。
   * 池子由 `game/chest.ts` 的 `pickChestPool()` 摇类别给出（`rollOne` 里），
   * 或者由调用方直接传（`pull(banner)` 那种显式指定池子的老用法仍然有效）。
   */
  function rollFrom(banner: Item[] = GACHA_POOL): Item {
    const items = banner.length ? banner : GACHA_POOL;
    // 每件物品的权重：默认 = 它那一档的全局权重 ÷ 同档件数（同档内等概率）；
    // 挂了 `pullWeight` 的（山海宝箱的怪物皮肤）就用绝对权重，**无视星级**，
    // 所以能把它们的概率单独压到极低——不填时分布与老逻辑完全一致。
    const perStar = new Map<number, number>();
    for (const i of items) perStar.set(i.stars, (perStar.get(i.stars) ?? 0) + 1);
    const weightOf = (i: Item): number =>
      i.pullWeight ?? (STAR_WEIGHT[i.stars] ?? 1) / (perStar.get(i.stars) ?? 1);
    let total = 0;
    for (const i of items) total += weightOf(i);
    let x = Math.random() * total;
    let pick = items[items.length - 1];
    for (const i of items) {
      x -= weightOf(i);
      if (x <= 0) {
        pick = i;
        break;
      }
    }
    return pick;
  }

  /**
   * 一次抽取，不动钱包（钥匙由调用方扣）。重复物品折算金币返还。
   *
   * **没有保底**：概率就是概率（星级权重见 `STAR_WEIGHT`），抽不到就是抽不到——
   * 缺的「确定性」由碎片兑换补（开箱攒 🧩，攒够直接换指定的碎片专属装扮）。
   *
   * **袋子档**：先摇一次 `BAG_CHANCE`，中了就不给装扮，改给一小袋金币或 🧩 星尘
   * 碎片——「每抽必出物品」会让几百件装扮一起变廉价，这个占位把「抽到装扮」
   * 重新变成一件值得高兴的事。
   */
  function rollOne(banner?: Item[]): PullResult {
    if (Math.random() < BAG_CHANCE) {
      if (Math.random() < BAG_COIN_SHARE) {
        const amount = COIN_BAG_MIN + Math.floor(Math.random() * COIN_BAG_RANGE);
        coins.value += amount;
        return { kind: 'bag', bag: 'coins', amount };
      }
      const amount = SHARD_BAG_MIN + Math.floor(Math.random() * SHARD_BAG_RANGE);
      shards.value += amount;
      return { kind: 'bag', bag: 'shards', amount };
    }

    // 传了池子就按它抽（显式指定）；没传就先**摇类别**——
    // 普通宝箱概率最高、本期的主题宝箱次高、高级宝箱最低（`game/chest.ts` 的 CHEST_ODDS）
    const item = banner ? rollFrom(banner) : rollFrom(pickChestPool());

    let duplicate = false;
    let refund = 0;
    if (owned.value.includes(item.id)) {
      duplicate = true;
      refund = RARITY_META[item.rarity].dust;
      coins.value += refund;
    } else {
      owned.value = [...owned.value, item.id];
    }

    return { kind: 'item', item, duplicate, refund };
  }

  /**
   * 开一次宝箱：花 1 把钥匙（金币只用于商店买东西）。
   * `banner` 是**当期主题宝箱**的那 12 件（见 `game/chest.ts`），不传就是标准大池。
   */
  function pull(banner?: Item[]): PullResult | null {
    if (chestKeys.value < CHEST_KEYS) return null;
    chestKeys.value -= CHEST_KEYS;
    return rollOne(banner);
  }

  /**
   * 🧩 碎片兑换（宝箱面板里的兑换区）：花星尘碎片换一件**碎片专属装扮**
   * （`source: 'shard'`——开箱抽不到、金币买不到，唯一入手途径）。
   */
  function redeemShardItem(id: string): { ok: boolean; message: string } {
    const price = shardPriceOf(id);
    const item = ITEMS.find((i) => i.id === id);
    if (!price || !item) return { ok: false, message: '这件不在兑换清单里' };
    if (owned.value.includes(id)) return { ok: false, message: `已经拥有「${item.label}」了` };
    if (shards.value < price) {
      return { ok: false, message: `碎片不够，还差 🧩${price - shards.value}` };
    }
    shards.value -= price;
    owned.value = [...owned.value, id];
    return { ok: true, message: `用 🧩${price} 换到了「${item.label}」` };
  }

  /**
   * 金币商店：花金币直接买一件低星装扮（3★ 及以下的宝箱物品），买了就进收藏。
   */
  function buyCoinItem(id: string): { ok: boolean; message: string } {
    const price = coinPriceOf(id);
    const item = ITEMS.find((i) => i.id === id);
    if (!price || !item) return { ok: false, message: '这件不在售' };
    if (owned.value.includes(id)) return { ok: false, message: `已经拥有「${item.label}」了` };
    if (coins.value < price) {
      return { ok: false, message: `金币不够，还差 ¥${price - coins.value}` };
    }
    coins.value -= price;
    owned.value = [...owned.value, id];
    return { ok: true, message: `已买下「${item.label}」` };
  }

  /** whether the free welcome ten-pull is still available */
  const canFreeTen = computed(() => tenTickets.value > 0);

  /**
   * 十连：10 把钥匙（`useTicket` 则消耗一张免费十连券）。
   * `banner` 同 `pull`：传当期宝箱的 12 件，不传就是标准大池。
   */
  function pullTen(useTicket = false, banner?: Item[]): PullResult[] | null {
    if (useTicket) {
      if (tenTickets.value <= 0) return null;
      tenTickets.value -= 1;
    } else {
      if (chestKeys.value < CHEST_KEYS * 10) return null;
      chestKeys.value -= CHEST_KEYS * 10;
    }

    const out: PullResult[] = [];
    for (let i = 0; i < 10; i++) out.push(rollOne(banner));
    return out;
  }

  return {
    points,
    claimed,
    coins,
    chestKeys,
    shards,
    grantKeys,
    buyCoinItem,
    redeemShardItem,
    owned,
    petStars,
    tenTickets,
    notice,
    canFreeTen,
    tier,
    next,
    progress,
    claimable,
    isClaimed,
    attrAlloc,
    attrPoints,
    attrSpent,
    attrEffective,
    attrs,
    addAttr,
    removeAttr,
    resetAttrs,
    isOwned,
    milestones,
    machineBest,
    milestoneLog,
    noteMachineStreak,
    rodLevel,
    farmLevel,
    tractor,
    oxygenLv,
    bagLv,
    boat,
    island,
    fishLog,
    logFish,
    noteFishKing,
    noteFishShiny,
    fishTask,
    fishTaskProg,
    fishTaskClaimed,
    ensureFishTask,
    noteFishCatch,
    claimFishTask,
    shinyBait,
    grantShinyBait,
    consumeShinyBait,
    buyBoat,
    upgradeDive,
    upgradeFarm,
    buyTractor,
    cotton,
    ore,
    fishBox,
    materialValue,
    addCotton,
    addOre,
    addFish,
    sellMaterials,
    buyHonorItem,
    nailongTickets,
    nailongLeftToday,
    startNailongMatch,
    earnNailongTicket,
    spinNailongWheel,
    gzLeftToday,
    useGodzillaAttempt,
    grantGodzillaKill,
    gzKills,
    alienLeftToday,
    useAlienAttempt,
    grantAlienRun,
    alienBest,
    alienTiers,
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
    arenaRun,
    arenaCooldown,
    trophies,
    enterArena,
    arenaFinishMatch,
    arenaQuit,
    aiPlayers,
    ensureLegend,
    honor,
    playerRecord,
    recordVsAi,
    addAiPlayer,
    updateAiPlayer,
    setAiRetired,
    removeAiPlayer,
    ensureWorldEdition,
    worldArenaState,
    worldLiveMatch,
    recordWorldMatch,
    fastForwardWorldMatch,
    seasonId,
    seasonPeak,
  };
});
