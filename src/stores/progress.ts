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
  RUN_KM_STEP,
  RUN_MILESTONES,
  STAR_WEIGHT,
  TRACTOR_COST,
  shardPriceOf,
  type Item,
  type ItemSlot,
} from '../game/items';
import { pickChestPool, type ChestSlot } from '../game/chest';
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
  ensureRosterSize,
  ensureStats,
  evolveRoster,
  generatePlayers,
  playerStats,
  rosterSlice,
  syncDerived,
  type AiPlayer,
  type PlayerStats,
} from '../game/players';
import {
  CUP_COUNT,
  CUP_TIERS,
  cupMatchKey,
  cupSeason,
  worldState,
  type WorldArenaState,
} from '../game/world-arena';
import {
  DEFAULT_COSMETIC,
  replacesHead,
  type Cosmetic,
  type HatId,
} from '../game/cosmetics';
import {
  addTrainXp,
  emptyLevels,
  emptyXp,
  type TrainKey,
  type TrainLevels,
  type TrainXp,
} from '../game/training';
import {
  MATCH_XP_SCALE,
  opponentMul,
  qualityMul,
  rawMatchXp,
  scaleMatchXp,
  type MatchTally,
  type MatchXpGain,
} from '../game/match-xp';
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
  GZ_DIFF_ORDER,
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
  ARENA_TIERS,
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
import {
  arenaEventIndexOf,
  arenaEventOf,
  arenaRookieNames,
  type ArenaEvent,
} from '../game/arena-events';
import { fmtDelay, phaseOf, slotOf, type EventSlot } from '../game/arena-schedule';

/** 晋级赛对阵树里代表「玩家自己」的参赛者 id */
const ME_ID = '__me__';

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

/**
 * 📰 **新闻周刊**的一条消息：世界自己发生的事（老将退役 / 新秀入行…）。
 * 换血时由 `evolveRosterIfDue()` 生成，周刊页（`views/NewsView.vue`）按周成刊。
 */
export interface NewsItem {
  id: string;
  /** 发生时刻 */
  at: number;
  /** `champion` = 世界赛冠军（见 `scanWorldNews()`） */
  kind: 'retire' | 'debut' | 'champion';
  /** 头条（一句概括，如「3 位老将宣布退役」） */
  title: string;
  /** 涉及的人（名字），周刊里列在头条下面 */
  names: string[];
}

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
  /** 已经**打赢过**的难度档：三档逐级解锁（简单 → 普通 → 地狱）靠它判定 */
  const gzCleared = useLocalStorage<GzDifficulty[]>('bmt-gz-cleared', []);

  /**
   * 这一档难度是否已解锁：**简单档永远能打**，之后每一档都要先打赢前一档。
   * （只是解锁门槛，不限制重复挑战——已经打通的档随时能再打。）
   */
  function gzUnlocked(d: GzDifficulty): boolean {
    const i = GZ_DIFF_ORDER.indexOf(d);
    if (i <= 0) return true;
    return gzCleared.value.includes(GZ_DIFF_ORDER[i - 1]);
  }

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
    // 记一笔「这一档已经打赢过」：下一档难度据此解锁（逐级解锁，见 gzUnlocked）
    if (!gzCleared.value.includes(difficulty)) {
      gzCleared.value = [...gzCleared.value, difficulty];
    }

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

  // ---- 锻炼（属性不再由积分发放，改成去场地练出来） --------------------------
  /**
   * 每个维度各自的**锻炼等级 / 经验**：去哪儿练就长哪一维（见 training.ts）。
   * 满了自动 +1 级，不能自由分配、也不能重置。
   */
  const trainLevels = useLocalStorage<TrainLevels>('bmt-train-levels', emptyLevels());
  const trainXp = useLocalStorage<TrainXp>('bmt-train-xp', emptyXp());

  /**
   * 给若干维加锻炼经验（健身房 / 操场 / 练球机打完一次调它）。
   * 返回这次练升了级的维度，页面据此弹提示。
   */
  function train(gains: Partial<Record<TrainKey, number>>): TrainKey[] {
    const res = addTrainXp(trainLevels.value, trainXp.value, gains);
    trainLevels.value = res.levels;
    trainXp.value = res.xp;
    return res.up;
  }

  /* --- 「打比赛也在变强」：一场比赛 → 五维经验（见 game/match-xp.ts） -------- */
  /**
   * 每天的比赛经验**满额额度**：和健身房的「每天每项 3 组满额」是同一个思路 ——
   * 到量之后只给零头、再多不给，免得靠刷比赛几天就把五维练满。
   *
   * 现在是 **600 满额 / 1200 封顶**（900~1800 那版给的还是偏多：按每场几十点算，
   * 一天能打满的量差不多是一晚上打完不至于「练满一维」的尺度）。
   */
  /**
   * 每日比赛经验额度：超过就只给 25%，再超过就不给。
   * ⚠️ 单位是「经验点」，而 2026-10 起**一场只给 12~16 点**（原来是 150 上下），
   * 所以这两个数也跟着从 600 / 1200 收到 60 / 120（约等于「一天 4 场满额、8 场封顶」）。
   */
  const MATCH_XP_DAILY = 60;
  const MATCH_XP_LEAN = 120;
  const matchXpDay = useLocalStorage<{ day: string; xp: number }>('bmt-match-xp-day', {
    day: '',
    xp: 0,
  });
  /** 今天对同一个对手已经打了几场（第 2 场 40%、第 3 场 15%、之后 0） */
  const matchXpFoes = useLocalStorage<Record<string, { day: string; n: number }>>(
    'bmt-match-xp-foes',
    {},
  );

  /**
   * 一场比赛打完 → 换五维经验（那张「干了什么 → 长哪一维」的表在 `game/match-xp.ts`）。
   *
   * 系数 = **基准（`MATCH_XP_SCALE`，0.06）× 对手强度 × 比赛质量 × 同对手递减 × 每日额度**；
   * 返回这一场涨了什么，页面拿去弹结算提示。机器（发球机）不走这条，它有自己的
   * 「接到一颗给一点」（`TRAIN_XP_PER.machineReturn`）。
   */
  function gainMatchXp(input: {
    tally: MatchTally;
    localIndex: 0 | 1;
    win: boolean;
    /** 同一个对手重复打会递减（AI id / 对手名 / 房间号） */
    foeKey: string;
    /** 对手 rating：越高给得越多；联机没有 rating，传 undefined 就是 1.0 倍 */
    foeRating?: number;
  }): { gains: MatchXpGain[]; up: TrainKey[] } {
    const today = todayKey();
    const raw = rawMatchXp(input.tally, input.localIndex);
    // 同对手递减（同一天）
    const rec = matchXpFoes.value[input.foeKey];
    const played = rec && rec.day === today ? rec.n : 0;
    const foeMul = played === 0 ? 1 : played === 1 ? 0.4 : played === 2 ? 0.15 : 0;
    // 每日额度
    const used = matchXpDay.value.day === today ? matchXpDay.value.xp : 0;
    const quotaMul = used < MATCH_XP_DAILY ? 1 : used < MATCH_XP_LEAN ? 0.25 : 0;

    const gains = scaleMatchXp(
      raw,
      MATCH_XP_SCALE *
        opponentMul(input.foeRating) *
        qualityMul(input.tally, input.win) *
        foeMul *
        quotaMul,
    );
    let up: TrainKey[] = [];
    if (gains.length) {
      const byKey: Partial<Record<TrainKey, number>> = {};
      let total = 0;
      for (const g of gains) {
        byKey[g.key] = g.xp;
        total += g.xp;
      }
      up = train(byKey);
      matchXpDay.value = { day: today, xp: used + total };
    }
    // 记下「今天跟他也打过一场」（顺手把昨天的记录清掉）
    const nextFoes: typeof matchXpFoes.value = {};
    for (const [k, v] of Object.entries(matchXpFoes.value)) if (v.day === today) nextFoes[k] = v;
    nextFoes[input.foeKey] = { day: today, n: played + 1 };
    matchXpFoes.value = nextFoes;

    return { gains, up };
  }

  /**
   * 写进对局的属性倍率。**由五维派生**——五维是唯一的加成来源，
   * 玩家（锻炼等级 → 五维）和 AI（名录里的五维）走的是同一条换算。
   */
  const attrs = computed(() => attrsFromStats(playerStats(points.value, trainLevels.value)));

  /* --- 🏟 操场跑量里程碑：累计跑量每满 1km 解锁一件专属装备 ------------------ */
  /**
   * 累计跑量（米，永久累计，跨场次不清零）。
   * **键名带 v2**：v1 用的是「直道标尺」换算（32px = 1m），人物 400px/s 等于
   * 12.5 m/s，几秒就能跑出一公里——那一版的里程全部作废，从 0 重新算。
   */
  const RUN_METERS_KEY = 'bmt-run-meters-v2';
  const hadRunV2 =
    typeof localStorage !== 'undefined' && localStorage.getItem(RUN_METERS_KEY) !== null;
  const runMeters = useLocalStorage(RUN_METERS_KEY, 0);
  // 第一次升到 v2：把 v1 那版「几秒一公里」白送出去的跑道装备收回来，重新按新比例跑一遍
  if (!hadRunV2) {
    owned.value = owned.value.filter((id) => !RUN_MILESTONES.includes(id));
  }

  /** 已经解锁到第几件（按 `RUN_MILESTONES` 的顺序，0 = 一件都没解锁） */
  function runUnlockedCount(): number {
    const reached = Math.floor(runMeters.value / RUN_KM_STEP);
    return Math.max(0, Math.min(RUN_MILESTONES.length, reached));
  }

  /**
   * 跑了这么多米：累加里程，够档就把新装备发进收藏。
   * 返回**这次真正新拿到**的物品 id（之前已经拥有的不会重复报，免得弹一串空提示）。
   */
  function noteRun(meters: number): string[] {
    if (!(meters > 0)) return [];
    const before = runUnlockedCount();
    runMeters.value += meters;
    const after = runUnlockedCount();
    const got: string[] = [];
    for (let i = before; i < after; i++) {
      const id = RUN_MILESTONES[i];
      if (!id || owned.value.includes(id)) continue;
      owned.value = [...owned.value, id];
      got.push(id);
    }
    return got;
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
    // 荣誉商店 / 活动限定 / 连击里程碑 / 跑量里程碑的东西：拿到过才算拥有（都记在 owned 里）
    if (
      item.source === 'honor' ||
      item.source === 'event' ||
      item.source === 'combo' ||
      item.source === 'run'
    )
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
    tier: string;
    /** 本届赛事名（从该档的名字池里抽的，每届不同） */
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

  /**
   * 「预约」：同一档最多一条，记下届别、赛事名与该场开赛时刻。
   * **不预扣报名费、也不预建对阵树**——等待期间玩家照样能报名别的档，
   * 到点由 `tickArenaBooking()` 真正走一遍 `enterArena()`。
   */
  const arenaBooking = useLocalStorage<Record<string, { cupName: string; startAt: number }>>(
    'bmt-arena-booking',
    {},
  );

  /** 到点自动开赛成功后置一次（页面用它把玩家带进本届赛程） */
  const arenaAutoStartedAt = ref(0);

  // 老存档迁移：旧赛制（8 人、没有完整对阵树 / 四维）的那一届直接作废，避免读半截数据
  if (
    arenaRun.value &&
    (!arenaRun.value.entrants ||
      !arenaRun.value.rounds ||
      arenaRun.value.entrants.some((e) => !e.stats || !Number.isFinite(e.stats.stamina)))
  ) {
    arenaRun.value = null;
  }

  /** AI 球员名录：首次进入游戏时随机生成一份，之后持久化（战绩会被写回） */
  const aiPlayers = useLocalStorage<AiPlayer[]>('bmt-ai-players', []);
  /** 老存档里那位「传奇球员皮泽恩」的 id：他已经下线，见到就从名录里清掉 */
  const LEGACY_LEGEND_ID = 'legend-peisien';
  if (!aiPlayers.value.length) {
    aiPlayers.value = generatePlayers();
  } else {
    // 老存档：补四维 / 把 style 与 difficulty 校准到与四维一致（没变化就不写回）
    const needs = aiPlayers.value.some(
      (p) =>
        !p.stats ||
        !Number.isFinite(p.stats.stamina) ||
        p.style !== styleFromStats(p.stats) ||
        p.difficulty !== tierFromStats(p.stats),
    );
    if (needs) aiPlayers.value = aiPlayers.value.map(syncDerived);
    // 老存档兼容：皮泽恩已下线（清掉），并把名录补到 ROSTER_SIZE 位
    if (aiPlayers.value.some((p) => p.id === LEGACY_LEGEND_ID)) {
      aiPlayers.value = aiPlayers.value.filter((p) => p.id !== LEGACY_LEGEND_ID);
    }
    aiPlayers.value = ensureRosterSize(aiPlayers.value);
  }

  /** 名录「换血」的进度（时间片号）：每片只换一次，见 `players.evolveRoster()` */
  const rosterSliceKey = useLocalStorage('bmt-ai-roster-slice', 0);

  /** 📰 「新闻周刊」的消息：世界自己发生的事（退役 / 新秀入行…），见 `evolveRosterIfDue` */
  const news = useLocalStorage<NewsItem[]>('bmt-news', []);
  /** 周刊最多留这么多条（再老的就不留了） */
  const NEWS_CAP = 300;
  /** 每种消息各自的上限：冠军远比换血频繁，单独限住，别把退役/入行的公告挤出周刊 */
  const NEWS_KIND_CAP: Record<NewsItem['kind'], number> = {
    retire: 60,
    debut: 60,
    champion: 60,
  };
  function pushNews(item: Omit<NewsItem, 'id'>): void {
    const id = `${item.at.toString(36)}-${item.kind}-${Math.random().toString(36).slice(2, 7)}`;
    const counts: Partial<Record<NewsItem['kind'], number>> = {};
    news.value = [{ ...item, id }, ...news.value]
      .filter((n) => {
        const c = (counts[n.kind] ?? 0) + 1;
        counts[n.kind] = c;
        return c <= NEWS_KIND_CAP[n.kind];
      })
      .slice(0, NEWS_CAP);
  }

  /**
   * 🌍 **世界自己会变**：到点让一批到龄的系统球员退役、补进一批新秀（rating 偏低，
   * 从低档赛事打起）。启动时与 15 秒心跳（`App.vue`）各调一次；没跨时间片就直接返回。
   * 玩家自己在名人堂新增的球员不受影响。
   *
   * 每次换血顺手给「新闻周刊」记两条消息（退役公告 / 新秀入行），名单带上。
   */
  function evolveRosterIfDue(now: number = Date.now()): void {
    const slice = rosterSlice(now);
    if (slice <= rosterSliceKey.value) return;
    const before = aiPlayers.value;
    const after = evolveRoster(before, slice);
    aiPlayers.value = after;
    rosterSliceKey.value = slice;
    const beforeById = new Map(before.map((p) => [p.id, p]));
    const retired = after.filter((p) => !p.custom && p.retired && !beforeById.get(p.id)?.retired);
    const rookies = after.filter((p) => !beforeById.has(p.id));
    if (retired.length) {
      pushNews({
        at: now,
        kind: 'retire',
        title: `${retired.length} 位老将宣布退役`,
        names: retired.map((p) => p.name),
      });
    }
    if (rookies.length) {
      pushNews({
        at: now,
        kind: 'debut',
        title: `${rookies.length} 位新秀通过资格赛入行`,
        names: rookies.map((p) => p.name),
      });
    }
  }
  evolveRosterIfDue();

  // 老存档兼容：以前 100 连击送「哥斯拉」，改版后哥斯拉由「哥斯拉来袭」地狱难度掉落。
  // 已经打到 100 连击的老玩家，把哥斯拉按旧规则补进收藏，不让人白打。
  if (milestones.value.includes(100) && !owned.value.includes('skin:godzilla')) {
    owned.value = [...owned.value, 'skin:godzilla'];
  }
  /** 玩家自己在单机 / 晋级赛里的胜负记录（排行榜里和自己对比用） */
  const playerRecord = useLocalStorage('bmt-player-record', { wins: 0, losses: 0 });

  /** 名人堂球员的名字：球员履历里挑「负于谁」用（见 `game/career.ts`） */
  const aiNames = computed(() => aiPlayers.value.map((p) => p.name));

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

  /** 这档、这场赛事此刻的场次（开赛 / 截止 / 下一场） */
  function arenaSlot(cupId: string, cupName: string, now = Date.now()): EventSlot {
    return slotOf(cupId, arenaEventIndexOf(cupId, cupName), now);
  }

  /**
   * 报名一届杯赛：积分门槛、赛事正在开赛窗口、报名费、冷却四关都过才能报。
   * `eventName` 指定打哪场（不在本档名字池里就随机取一个）。
   *
   * **已经进行中的一届（`arenaRun` 非空）随时可以继续**，不再做窗口校验 ——
   * 开打之后窗口关闭不影响这一届打完。
   */
  function enterArena(
    cupId: string,
    meName = '你',
    eventName?: string,
  ): { ok: boolean; message: string } {
    if (arenaRun.value) {
      if (arenaRun.value.tier === cupId) return { ok: true, message: '继续这一届' };
      return { ok: false, message: '还有一届没打完，先去打完它' };
    }
    const a = arenaByTier(cupId);
    if (points.value < a.req) {
      return { ok: false, message: `还差 ${a.req - points.value} 积分解锁「${a.label}」` };
    }
    // 玩家点名的赛事必须是这一档名池里的，否则随机取一个（先定赛事，后面用它生成对手）
    const cupName = eventName && a.names.includes(eventName) ? eventName : pickCupName(a.tier);
    const slot = arenaSlot(a.tier, cupName);
    const now = Date.now();
    if (phaseOf(slot, now) !== 'open') {
      const ev = arenaEventOf(a.tier, cupName);
      return {
        ok: false,
        message:
          now < slot.startAt
            ? `「${cupName}」${fmtDelay(slot.startAt - now)}后开赛，可以先预约`
            : `「${cupName}」本场已结束，下一场 ${fmtDelay(slot.nextStartAt - now)}后 · ${ev.venue}`,
      };
    }
    const cd = arenaCooldown.value[cupId] ?? 0;
    if (cd > now) {
      return { ok: false, message: `${a.label}刚打完，${Math.ceil((cd - now) / 1000)} 秒后可再报名` };
    }
    if (coins.value < a.fee) return { ok: false, message: `报名费不够，还差 🪙${a.fee - coins.value}` };
    coins.value -= a.fee;

    const entrants = buildEntrants(cupId, meName, cupName);
    arenaRun.value = {
      tier: a.tier,
      cupName,
      round: 0,
      wins: 0,
      entrants,
      rounds: buildBracket(entrants),
    };
    const ev = arenaEventOf(a.tier, cupName);
    return {
      ok: true,
      message: `「${cupName}(${a.label})」${ev.venue}报名成功！-${a.fee} 金币，祝好运`,
    };
  }

  /**
   * 预约一场还没开赛的赛事（同一档只留一条，新预约覆盖旧的）。
   * 只记「档位 + 赛事名 + 开赛时刻」，不花钱也不建对阵树。
   */
  function bookArena(cupId: string, eventName: string): { ok: boolean; message: string } {
    const a = arenaByTier(cupId);
    if (arenaRun.value) return { ok: false, message: '还有一届没打完，先去打完它' };
    if (!a.names.includes(eventName)) return { ok: false, message: '没有这场赛事' };
    const slot = arenaSlot(a.tier, eventName);
    const now = Date.now();
    const phase = phaseOf(slot, now);
    if (phase === 'open') return { ok: false, message: `「${eventName}」已经在报名了，直接报名即可` };
    if (phase === 'closed') return { ok: false, message: `「${eventName}」本场已过，预约下一场吧` };
    if (points.value < a.req) {
      return { ok: false, message: `还差 ${a.req - points.value} 积分解锁「${a.label}」` };
    }
    arenaBooking.value = {
      ...arenaBooking.value,
      [a.tier]: { cupName: eventName, startAt: slot.startAt },
    };
    return { ok: true, message: `已预约「${eventName}」· ${fmtDelay(slot.startAt - now)}后自动开赛` };
  }

  /** 取消某一档的预约 */
  function cancelBooking(cupId: string): boolean {
    if (!arenaBooking.value[cupId]) return false;
    const next = { ...arenaBooking.value };
    delete next[cupId];
    arenaBooking.value = next;
    return true;
  }

  /**
   * 到点自动开赛：给每个到点的预约真正走一遍 `enterArena()`。
   * 由 `App.vue` 的低频心跳调用（页面不在前台时不保证准时，回到前台会补一次）；
   * `meName` 是玩家昵称（App 从大厅 store 取），不传就和手动报名一样兜底成「你」。
   * 返回这一批里成功开赛的赛事名（页面用它决定要不要把玩家带进赛程）。
   */
  function tickArenaBooking(now = Date.now(), meName?: string): string[] {
    const started: string[] = [];
    for (const [tier, b] of Object.entries(arenaBooking.value)) {
      if (now < b.startAt) continue;
      // 只在这场比赛自己的报名窗口内自动开赛：关了一夜再回来不会「迟到扣费」
      const r = enterArena(tier, meName, b.cupName);
      cancelBooking(tier);
      if (r.ok) {
        started.push(b.cupName);
        arenaAutoStartedAt.value = now;
        pushNotice(`🏆「${b.cupName}」开赛！已自动为你报名`);
      } else {
        pushNotice(`「${b.cupName}」开赛了，但没能报名：${r.message}`);
      }
    }
    return started;
  }

  /**
   * 临时弱手的装扮：只从**普通 / 稀有**里挑帽子、球拍皮肤、击球拖尾，
   * 其余部位一律不穿——看上去就是个没见过世面的新手，不会一身传说。
   *
   * 赛事身份带 `gear: 'mixed'` 时（防守派 / 老将组 / 综合赛）再补翅膀与披风，
   * 同样是低星货，所以「装备齐但不高星」——看一眼就知道这批人不一样。
   */
  function rookieCosmetic(ev: ArenaEvent): Cosmetic {
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
    // 这一路人的「队服脸」：不戴全罩头套，保证那副表情（😡 / 🛡️ / ⚡ …）始终露着
    c.emoji = ev.emojis[Math.floor(Math.random() * ev.emojis.length)] ?? c.emoji;
    c.hat = pickLow('hat') as Cosmetic['hat'];
    if (replacesHead(c.hat as HatId)) c.hat = 'none';
    c.racketSkin = pickLow('racketSkin') as Cosmetic['racketSkin'];
    c.trailStyle = pickLow('trail') as Cosmetic['trailStyle'];
    if (ev.gear === 'mixed' || ev.gear === 'full') {
      c.wings = pickLow('wings') as Cosmetic['wings'];
      c.cape = pickLow('cape') as Cosmetic['cape'];
    }
    if (ev.gear === 'full') {
      c.aura = pickLow('aura') as Cosmetic['aura'];
      c.ring = pickLow('ring') as Cosmetic['ring'];
      c.pet = pickLow('pet') as Cosmetic['pet'];
      c.petStar = 1;
    }
    return c;
  }

  /** 把身份偏移叠到一份四维上（夹在 1~100），不改动传进来的对象 */
  function biasedStats(stats: PlayerStats, ev: ArenaEvent): PlayerStats {
    const at = (k: keyof PlayerStats): number =>
      Math.max(1, Math.min(100, Math.round(stats[k] + (ev.bias[k] ?? 0))));
    return {
      technique: at('technique'),
      speed: at('speed'),
      attack: at('attack'),
      defense: at('defense'),
      stamina: at('stamina'),
    };
  }

  /**
   * 现场生成一位「临时弱手」（低档杯赛专用，不进名人堂）。
   *
   * 四维按档位递进：第 1 档 28~38、第 2 档 34~44、第 3 档 40~50 ——
   * 比 0 积分新号的 52 明显低，所以新手也能稳稳打赢。
   * 再叠加**赛事身份的四维偏移**（快攻营扣杀 20、防守派防守 20、老将组技术 20…），
   * 偏移够大，所以 `styleFromStats()` 会稳定给出该路人的风格，打起来也真的不一样。
   * 风格统一取身份声明的那一个（保证赛程树里 15 个人标签一致）。
   */
  function makeRookie(tierIdx: number, name: string, ev: ArenaEvent): ArenaEntrant {
    const base = 28 + tierIdx * 6;
    const jitter = (): number => Math.round(Math.random() * 10);
    const stats = biasedStats(
      {
        technique: base + jitter(),
        speed: base + jitter(),
        attack: base + jitter(),
        defense: base + jitter(),
        stamina: base + jitter(),
      },
      ev,
    );
    return {
      id: `rookie-${tierIdx}-${name}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      isMe: false,
      rating: 400 + tierIdx * 130 + Math.round(Math.random() * 80),
      style: ev.style,
      difficulty: tierFromStats(stats),
      cosmetic: rookieCosmetic(ev),
      stats,
    };
  }

  /** 名人堂候选的「优先顺序」：按身份把更符合这一路打法的人排到前面（稳定排序） */
  function preferByEvent(players: AiPlayer[], ev: ArenaEvent): AiPlayer[] {
    if (players.length < 2) return players;
    if (ev.pool === 'rookie' || ev.pool === 'open') return players;
    const fit = (p: AiPlayer): number => {
      const s = biasedStats(ensureStats(p), ev);
      switch (ev.pool) {
        case 'attack':
          return s.attack + s.stamina * 0.5;
        case 'defense':
          return s.defense + s.technique * 0.5;
        case 'speed':
          return s.speed + s.stamina * 0.5;
        // 老将 = 手上最细 + 名单里最资深的那批
        default:
          return s.technique + p.rating * 0.1;
      }
    };
    return players
      .map((p, i) => ({ p, i, f: fit(p) }))
      .sort((a, b) => b.f - a.f || a.i - b.i)
      .map((x) => x.p);
  }

  /**
   * 生成 16 位参赛者：自己 + 15 位对手。
   *
   * - **低档杯赛**（`ROOKIE_TIERS` 之内）：现场生成一路临时弱手，完全不碰名人堂；
   *   名字是这一路人的外号（重炮老张 / 铁壁小李…）、表情共用一套（😡 / 🛡️ / ⚡…）、
   *   四维按身份偏移、装扮按档次。
   * - **其余杯赛**：从名人堂名录里抽（杯赛越高抽到的一档越强，名额不够就按排名补）；
   *   选出候选后按身份排一遍（谁更像这一路就先上）。
   *   对手的 `stats` / `style` 是**叠加了本场偏移的副本** —— 同一批人打不同赛事会带着
   *   这一场的战术倾向（扣杀营里人人更爱扣），但**名人堂存档里他们的四维与风格一行不改**，
   *   世界赛、排行榜、球员主页读到的仍是他们自己的数据。
   */
  function buildEntrants(tier: string, meName: string, cupName?: string): ArenaEntrant[] {
    const tierIdx = ARENA_TIERS.findIndex((t) => t.tier === tier);
    const idx = tierIdx < 0 ? ARENA_TIERS.length - 1 : tierIdx;
    const want = 2 ** ARENA_ROUNDS.length - 1; // 16 人 → 15 位 AI
    const ev = arenaEventOf(tier, cupName);

    let opponents: ArenaEntrant[];
    if (idx < ROOKIE_TIERS) {
      // 低档杯赛：一路人当场生成（这一路的外号洗牌后取 15 个，不重复）
      const names = shuffleList([...arenaRookieNames(ev)]);
      opponents = Array.from({ length: want }, (_, i) =>
        makeRookie(idx, names[i % names.length], ev),
      );
    } else {
      const sorted = [...aiPlayers.value].sort((a, b) => b.rating - a.rating);
      const span = Math.max(0, sorted.length - want);
      // 杯赛越高，抽到的一档越强
      const start = Math.round((1 - idx / Math.max(1, ARENA_TIERS.length - 1)) * span);
      const chosen = sorted.length <= want ? [...sorted] : sorted.slice(start, start + want);
      while (chosen.length < want && sorted.length) {
        chosen.push(sorted[chosen.length % sorted.length]);
      }
      opponents = preferByEvent(chosen, ev).map((p) => {
        const stats = biasedStats(ensureStats(p), ev);
        return {
          id: p.id,
          name: p.name,
          isMe: false,
          rating: p.rating,
          style: ev.style,
          difficulty: tierFromStats(stats),
          cosmetic: p.cosmetic,
          stats,
        };
      });
    }

    const me: ArenaEntrant = {
      id: ME_ID,
      name: meName || '你',
      isMe: true,
      rating: 1000 + points.value,
      style: 'balanced',
      difficulty: 'normal',
      stats: playerStats(points.value, trainLevels.value),
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

  // ---- 🌍 世界赛（观战台的数据源）-------------------------------------------

  /**
   * 只存「玩家真看过 / 快进过」的那几场。键里带着杯 + 届（见 `cupMatchKey`），
   * 所以不同杯、不同届不会串；条目太多就按插入顺序丢掉最老的（联赛自己往前滚）。
   */
  const worldArena = useLocalStorage<{ overrides: Record<string, string> }>('bmt-world-arena', {
    overrides: {},
  });
  /** overrides 最多留这么多条（4 个杯每 10 分钟一届，够翻好几十届） */
  const WORLD_OVERRIDE_CAP = 600;

  /**
   * 当前这些杯"到此刻为止"的样子——**纯读**（不在 computed 里写状态）。
   * `overrides` 里过期的键不影响结果（每届的键都带届号，对不上就是没记过）。
   */
  function worldArenaState(now = Date.now()): WorldArenaState {
    return worldState(aiPlayers.value, now, worldArena.value.overrides);
  }

  /** 已经为「哪一档的哪一届」写过冠军新闻（`cup.tier.id` → 届号） */
  const newsChamps = useLocalStorage<Record<string, number>>('bmt-news-champs', {});
  /**
   * 🏆 **冠军也进新闻**：世界赛冠军出炉时写一条。
   *
   * 只记**最高档（总决赛）**的冠军——世界赛一共 11 个档、每档 10 分钟一届，
   * 11 个档全记的话周刊会被冠军刷屏（新闻里冠军本来就单独限量，见 `NEWS_KIND_CAP`）。
   * 跟着 15 秒心跳调（`App.vue`），没出炉 / 这一届记过就直接返回。
   */
  function scanWorldNews(now: number = Date.now()): void {
    // 先做一次**便宜**的判断：`worldArenaState()` 会把 11 个杯的对阵树整个重建一遍，
    // 而它跟着 `App.vue` 的 15 秒心跳跑——不先挡一下，**对局中每 15 秒就白算一次**
    // （一堆数组 / 对象分配），表现就是「打着打着突然卡一下」。
    // 最高档还没换届时，下面那些判断一定会 return，所以这里直接短路是等价的。
    if ((newsChamps.value[CUP_TIERS[CUP_COUNT - 1].id] ?? -1) >= cupSeason(CUP_COUNT - 1, now)) {
      return;
    }
    const st = worldArenaState(now);
    const top = st.cups[st.cups.length - 1];
    if (!top || !top.champion) return;
    if ((newsChamps.value[top.tier.id] ?? -1) >= top.season) return;
    const name = aiPlayers.value.find((p) => p.id === top.champion)?.name;
    if (!name) return;
    pushNews({
      at: now,
      kind: 'champion',
      title: `${top.tier.tag} · ${top.name} 冠军`,
      names: [name],
    });
    newsChamps.value = { ...newsChamps.value, [top.tier.id]: top.season };
  }
  scanWorldNews();

  /** 现在正在直播的所有场次（跨杯，可能同时好几场）——观战台的大屏用 */
  function worldLiveMatches(
    now = Date.now(),
  ): { cup: number; season: number; round: number; index: number; a: ArenaEntrant; b: ArenaEntrant }[] {
    const st = worldArenaState(now);
    const out: ReturnType<typeof worldLiveMatches> = [];
    for (const l of st.liveMatches) {
      const cup = st.cups[l.cup];
      if (!cup) continue;
      const m = cup.rounds[l.round]?.[l.index];
      if (!m) continue;
      const a = cup.entrants.find((e) => e.id === m.a);
      const b = cup.entrants.find((e) => e.id === m.b);
      if (a && b) {
        out.push({ cup: l.cup, season: cup.season, round: l.round, index: l.index, a, b });
      }
    }
    return out;
  }

  /** 某位球员正在打的那一场（名人堂给他一个「观战」入口） */
  function worldLiveMatchOf(
    id: string,
    now = Date.now(),
  ): { cup: number; season: number; round: number; index: number; a: ArenaEntrant; b: ArenaEntrant } | null {
    return worldLiveMatches(now).find((l) => l.a.id === id || l.b.id === id) ?? null;
  }

  /**
   * 记下一场世界赛的结果（**真观战打完**与**快进**都走这里）：
   * 写进 `overrides`（刷新也认这个结果），并把两位 AI 的战绩一起更新——
   * 所以"看比赛"是真的在改变名人堂的名次。
   */
  function recordWorldMatch(
    cup: number,
    season: number,
    round: number,
    index: number,
    winnerId: string,
  ): boolean {
    const key = cupMatchKey(cup, season, round, index);
    if (worldArena.value.overrides[key]) return false; // 已经记过，别重复记战绩
    const st = worldState(aiPlayers.value, Date.now(), worldArena.value.overrides);
    const stCup = st.cups[cup];
    // 届号对不上（这一届已经打完翻篇了）就不记
    if (!stCup || stCup.season !== season) return false;
    const m = stCup.rounds[round]?.[index];
    if (!m || (winnerId !== m.a && winnerId !== m.b)) return false;
    const loserId = winnerId === m.a ? m.b : m.a;
    const nextOv = { ...worldArena.value.overrides, [key]: winnerId };
    const keys = Object.keys(nextOv);
    if (keys.length > WORLD_OVERRIDE_CAP) {
      for (const k of keys.slice(0, keys.length - WORLD_OVERRIDE_CAP)) delete nextOv[k];
    }
    worldArena.value = { overrides: nextOv };
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
  function fastForwardWorldMatch(
    cup: number,
    season: number,
    round: number,
    index: number,
  ): boolean {
    const st = worldState(aiPlayers.value, Date.now(), worldArena.value.overrides);
    const stCup = st.cups[cup];
    if (!stCup || stCup.season !== season) return false;
    const m = stCup.rounds[round]?.[index];
    if (!m || !m.a || !m.b) return false;
    let winner = m.winner;
    if (!winner) {
      const a = stCup.entrants.find((e) => e.id === m.a);
      const b = stCup.entrants.find((e) => e.id === m.b);
      if (!a || !b) return false;
      winner = simulateArenaMatch(a, b);
    }
    return recordWorldMatch(cup, season, round, index, winner);
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
  function rollOne(slot?: ChestSlot): PullResult {
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

    // 先**摇类别**：普通宝箱概率最高、选中的主题宝箱次高、高级宝箱最低
    // （`game/chest.ts` 的 CHEST_ODDS）。`slot` 就是玩家在「奖池切换」里选的那个池，
    // 不传就用当期主题。
    const item = rollFrom(pickChestPool(Date.now(), slot));

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
   * `slot` 是玩家在「奖池切换」里选中的池子（见 `game/chest.ts` 的 `activeChestSlots`），
   * 不传就用当期主题。
   */
  function pull(slot?: ChestSlot): PullResult | null {
    if (chestKeys.value < CHEST_KEYS) return null;
    chestKeys.value -= CHEST_KEYS;
    return rollOne(slot);
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
   * `slot` 同 `pull`：玩家选中的奖池，不传就是当期主题。
   */
  function pullTen(useTicket = false, slot?: ChestSlot): PullResult[] | null {
    if (useTicket) {
      if (tenTickets.value <= 0) return null;
      tenTickets.value -= 1;
    } else {
      if (chestKeys.value < CHEST_KEYS * 10) return null;
      chestKeys.value -= CHEST_KEYS * 10;
    }

    const out: PullResult[] = [];
    for (let i = 0; i < 10; i++) out.push(rollOne(slot));
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
    trainLevels,
    trainXp,
    train,
    gainMatchXp,
    attrs,
    runMeters,
    runUnlockedCount,
    noteRun,
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
    gzCleared,
    gzUnlocked,
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
    arenaBooking,
    arenaAutoStartedAt,
    arenaSlot,
    bookArena,
    cancelBooking,
    tickArenaBooking,
    trophies,
    enterArena,
    arenaFinishMatch,
    arenaQuit,
    aiPlayers,
    aiNames,
    evolveRosterIfDue,
    scanWorldNews,
    news,
    honor,
    playerRecord,
    recordVsAi,
    worldArenaState,
    worldLiveMatches,
    worldLiveMatchOf,
    recordWorldMatch,
    fastForwardWorldMatch,
    seasonId,
    seasonPeak,
  };
});
