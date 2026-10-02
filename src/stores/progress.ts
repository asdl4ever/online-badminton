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
  CHEST_COST,
  COIN_RULES,
  FARM_MAX_LEVEL,
  FARM_UPGRADE_COST,
  GACHA_POOL,
  honorPriceOf,
  ITEMS,
  MILESTONE_REWARD,
  PET_EGGS,
  PET_STAR_META,
  PETS,
  PITY_LIMIT,
  RARITY_META,
  TEN_PULL_COST,
  TRACTOR_COST,
  type Item,
  type ItemSlot,
  type Rarity,
} from '../game/items';
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
  applyMatchResult,
  attrsFromStats,
  ensureStats,
  generatePlayers,
  LEGEND_ID,
  playerStats,
  syncDerived,
  withLegend,
  type AiPlayer,
  type PlayerStats,
} from '../game/players';
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
import { GZ_DIFFS, GZ_DAILY_MAX, GZ_SET_IDS, type GzDifficulty } from '../game/godzilla';
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

export type PullResult = { kind: 'item'; item: Item; duplicate: boolean; refund: number };

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
  /**
   * 荣誉点：晋级赛拿冠亚季军才有（随杯赛档位放大），是「荣誉商店」的唯一货币。
   * 跟金币不同，它**永久不清零**——积分每月清零，荣誉不该跟着掉。
   */
  const honor = useLocalStorage('bmt-honor', 0);
  // ---- 小黄龙联动：抽奖券与转盘 ----
  /** 手上的转盘抽奖券 */
  const nailongTickets = useLocalStorage('bmt-nailong-tickets', 0);
  /** 今天已经赢了几场小黄龙 */
  const nailongWins = useLocalStorage('bmt-nailong-wins', 0);
  /** 上面那个计数属于哪一天（YYYY-MM-DD，跨天自动重新计） */
  const nailongDay = useLocalStorage('bmt-nailong-day', '');
  /** 连续没抽到限定物品的次数（保底计数） */
  const nailongPity = useLocalStorage('bmt-nailong-pity', 0);

  /** 今天还能靠赢小黄龙拿几张券 */
  const nailongLeftToday = computed(() => {
    const used = nailongDay.value === todayKey() ? nailongWins.value : 0;
    return Math.max(0, NAILONG_DAILY_MAX - used);
  });
  // ---- 哥斯拉来袭：每日次数 / 击杀数 / 首杀 ----
  /** 今天已经用掉几次哥斯拉挑战 */
  const gzUsed = useLocalStorage('bmt-gz-used', 0);
  /** 次数属于哪一天（YYYY-MM-DD，跨天自动重置） */
  const gzDay = useLocalStorage('bmt-gz-day', '');
  /** 累计击杀哥斯拉的次数（刷战绩用） */
  const gzKills = useLocalStorage('bmt-gz-kills', 0);
  /** 是否已经拿过首杀限定套装 */
  const gzFirstKill = useLocalStorage('bmt-gz-first-kill', false);

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
   * 击杀哥斯拉的结算：首杀（任意难度）送「哥斯拉来袭」限定套装，
   * 重复击杀按难度给金币 + 荣誉点。返回界面拿来弹横幅的信息。
   */
  function grantGodzillaKill(difficulty: GzDifficulty): {
    coins: number;
    honor: number;
    firstKill: boolean;
    items: Item[];
  } {
    const cfg = GZ_DIFFS[difficulty];
    coins.value += cfg.coins;
    honor.value += cfg.honor;
    gzKills.value += 1;

    let first = false;
    const items: Item[] = [];
    if (!gzFirstKill.value) {
      first = true;
      gzFirstKill.value = true;
      for (const id of GZ_SET_IDS) {
        const it = ITEMS.find((i) => i.id === id);
        if (it) {
          if (!owned.value.includes(it.id)) owned.value = [...owned.value, it.id];
          items.push(it);
        }
      }
    }
    return { coins: cfg.coins, honor: cfg.honor, firstKill: first, items };
  }

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

  /** ownership: free always, gacha/code by collection, pets by hatching, else by tier */
  function isOwned(item: Item): boolean {
    if (item.source === 'free') return true;
    if (item.source === 'gacha' || item.source === 'code') return owned.value.includes(item.id);
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

  // 老存档兼容：以前 100 连击送「哥斯拉」，改版后哥斯拉由「哥斯拉来袭」首杀赠送。
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
    let text =
      `「${run.cupName}」${PLACE_LABEL[place]}：金币 +${gold}` +
      (gain ? ` · 积分 +${gain}` : ' · 无积分') +
      (hon ? ` · 荣誉 +${hon}` : '');
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

  function claim(id: TierId): void {
    const t = TIERS.find((x) => x.id === id);
    if (!t || points.value < t.points || claimed.value.includes(id)) return;
    claimed.value = [...claimed.value, id];
    pushNotice(`已领取 ${t.label} 奖励：${t.reward}`);
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
   * 哥斯拉皮肤不在这里——它是「哥斯拉来袭」活动的首杀奖励。
   */
  function claimMilestone(n: number): { kind: 'item'; item: Item } | null {
    if (n <= 0 || n % 10 !== 0 || milestones.value.includes(n)) return null;
    milestones.value = [...milestones.value, n];
    const itemId = MILESTONE_REWARD[n] ?? 'skin:coach';
    const item = ITEMS.find((i) => i.id === itemId);
    if (!item) return null;
    if (!owned.value.includes(item.id)) owned.value = [...owned.value, item.id];
    milestoneLog.value = { ...milestoneLog.value, [String(n)]: item.id };
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
    return { ok: true, message: `任务完成！🪙 +${task.coins} · 🏅 +${task.honor}` };
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

  /** 打赢小黄龙：+1 张转盘抽奖券（每天最多 NAILONG_DAILY_MAX 张） */
  function earnNailongTicket(): { ok: boolean; message: string } {
    const today = todayKey();
    if (nailongDay.value !== today) {
      nailongDay.value = today;
      nailongWins.value = 0;
    }
    if (nailongWins.value >= NAILONG_DAILY_MAX) {
      return { ok: false, message: `今天已经赢满 ${NAILONG_DAILY_MAX} 场了，明天再来找小黄龙玩` };
    }
    nailongWins.value += 1;
    nailongTickets.value += 1;
    return { ok: true, message: `抽奖券 ×1（今日 ${nailongWins.value}/${NAILONG_DAILY_MAX}）` };
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
      (r) => r.item.rarity === 'epic' || r.item.rarity === 'legendary',
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
    buyHonorItem,
    nailongTickets,
    nailongLeftToday,
    earnNailongTicket,
    spinNailongWheel,
    gzLeftToday,
    useGodzillaAttempt,
    grantGodzillaKill,
    gzKills,
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
    seasonId,
    seasonPeak,
  };
});
