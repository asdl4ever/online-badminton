/**
 * 潜水抓鱼的静态数据：鱼种、海岛、三条升级线。
 *
 * 设计上的三个环：**氧气**（能待多久 / 敢潜多深）、**背包**（一趟能带多少）、
 * **渔具**（能拉多大的鱼）。稀有度和深度绑定——浅水只有小鱼，越深越贵也越难拉，
 * 所以"下潜"才有取舍。
 */

export interface Species {
  id: string;
  name: string;
  emoji: string;
  /** 体重范围（kg），越大越值钱 */
  kg: [number, number];
  /** 每公斤价值 + 基础价值 */
  perKg: number;
  base: number;
  /** 活动深度带（世界坐标 y，0 = 水面） */
  band: [number, number];
  /** 出现权重（越大越常见） */
  weight: number;
  /** 游速（px/s） */
  speed: number;
  /** 逃跑倾向：0 = 无视你，1 = 一靠近就跑 */
  flee: number;
  /** 需要的最低渔具等级（不够会被挣脱） */
  gear: number;
  /** 拉扯强度：越大越难收杆（0.2 轻松 ~ 1.2 要满级渔具） */
  pull: number;
  /** 群游条数（生成时一次来几条） */
  school: number;
  /** 贴海底活动（龙虾/石斑之类） */
  bottom?: boolean;
}

/**
 * 鱼种表：按深度排开，浅 → 深 = 便宜 → 贵。
 *
 * `band` 是**绝对水深（px，10px = 1m）**，海域整体加深后这里也跟着拉开了：
 * 最浅的沙丁鱼只在 60m 以内，最深的两档（巨型石斑 / 深海龙王）压到 620m 上下，
 * 所以「潜得越深 → 鱼越大越贵」这条线现在是贯穿整片海的（配合 `DiveScene`
 * 的 `DEPTH_ZONES`：浅层只占 18% 的刷鱼量）。改 `ISLANDS[].floor` 时记得一起看这里。
 */
export const SPECIES: Species[] = [
  {
    id: 'sardine',
    name: '沙丁鱼',
    emoji: '🐟',
    kg: [0.1, 0.35],
    perKg: 26,
    base: 4,
    band: [40, 600],
    weight: 26,
    speed: 150,
    flee: 0.95,
    gear: 1,
    pull: 0.2,
    school: 5,
  },
  {
    id: 'clown',
    name: '小丑鱼',
    emoji: '🐠',
    kg: [0.2, 0.7],
    perKg: 30,
    base: 6,
    band: [60, 900],
    weight: 20,
    speed: 120,
    flee: 0.8,
    gear: 1,
    pull: 0.28,
    school: 2,
  },
  {
    id: 'bass',
    name: '海鲈',
    emoji: '🐟',
    kg: [1, 3.5],
    perKg: 34,
    base: 18,
    band: [250, 1600],
    weight: 16,
    speed: 105,
    flee: 0.6,
    gear: 1,
    pull: 0.48,
    school: 1,
  },
  {
    id: 'octopus',
    name: '章鱼',
    emoji: '🐙',
    kg: [1.5, 4],
    perKg: 42,
    base: 24,
    band: [450, 2600],
    weight: 12,
    speed: 70,
    flee: 0.45,
    gear: 2,
    pull: 0.66,
    school: 1,
    bottom: true,
  },
  {
    id: 'lobster',
    name: '龙虾',
    emoji: '🦞',
    kg: [0.8, 3],
    perKg: 60,
    base: 30,
    band: [800, 4200],
    weight: 9,
    speed: 55,
    flee: 0.35,
    gear: 2,
    pull: 0.4,
    school: 1,
    bottom: true,
  },
  {
    id: 'amberjack',
    name: '鰤鱼',
    emoji: '🐟',
    kg: [3, 9],
    perKg: 44,
    base: 60,
    band: [900, 3000],
    weight: 10,
    speed: 130,
    flee: 0.7,
    gear: 2,
    pull: 0.72,
    school: 2,
  },
  {
    id: 'tuna',
    name: '金枪鱼',
    emoji: '🐟',
    kg: [8, 26],
    perKg: 52,
    base: 120,
    band: [1200, 4600],
    weight: 7,
    speed: 170,
    flee: 0.75,
    gear: 3,
    pull: 0.88,
    school: 1,
  },
  {
    id: 'angler',
    name: '深海鮟鱇',
    emoji: '🎣',
    kg: [5, 16],
    perKg: 88,
    base: 180,
    band: [1500, 5600],
    weight: 5,
    speed: 60,
    flee: 0.3,
    gear: 3,
    pull: 0.8,
    school: 1,
  },
  {
    id: 'grouper',
    name: '巨型石斑',
    emoji: '🐟',
    kg: [20, 60],
    perKg: 74,
    base: 260,
    band: [1800, 6200],
    weight: 3,
    speed: 48,
    flee: 0.2,
    gear: 4,
    pull: 1.0,
    school: 1,
    bottom: true,
  },
  {
    id: 'oarfish',
    name: '深海龙王',
    emoji: '🐉',
    kg: [30, 95],
    perKg: 150,
    base: 600,
    band: [2400, 6300],
    weight: 1.4,
    speed: 90,
    flee: 0.5,
    gear: 5,
    pull: 1.2,
    school: 1,
  },
];

export function speciesById(id: string): Species | undefined {
  return SPECIES.find((s) => s.id === id);
}

/** 一条鱼的售价：基础 + 每公斤 × 体重，稀有鱼靠 perKg 拉开差距 */
export function fishValue(s: Species, kg: number): number {
  return Math.round(s.base + s.perKg * kg);
}

// ---- 体型 / 闪光 / 鱼王 ------------------------------------------------------

/**
 * 体重 → 体型倍率：同种鱼按 kg 在本种 [min,max] 区间的位置，
 * 平滑映射到 **0.6×~1.8×**。大鱼一眼就能看出来，抓鱼判定半径也跟着它走。
 */
export function sizeScale(sp: Species, kg: number): number {
  const [lo, hi] = sp.kg;
  const t = hi > lo ? Math.min(1, Math.max(0, (kg - lo) / (hi - lo))) : 0.5;
  return 0.6 + t * 1.2;
}

/** 闪光鱼：spawn 时的小概率金色变体（2%），价值翻 5 倍，图鉴特别标记 */
export const SHINY_CHANCE = 0.02;
export const SHINY_VALUE_MULT = 5;

/** 鱼王：小概率刷出的超大个体（2%，kg 拉满 + 游得快），价值 ×3 + 专属成就 */
export const KING_CHANCE = 0.02;
export const KING_VALUE_MULT = 3;
/** 鱼王体重按物种上限再乘一档（可能超过渔具 maxKg，拉不拉得住看装备） */
export const KING_KG_MULT = 1.5;
/** 鱼王游速倍率 */
export const KING_SPEED_MULT = 1.4;

// ---- 海岛 -----------------------------------------------------------------

export interface IslandHazards {
  /** 水母数量 */
  jelly: number;
  /** 鲨鱼数量 */
  shark: number;
  /** 暗流条数 */
  current: number;
}

export interface Island {
  id: string;
  name: string;
  desc: string;
  /** 出海花费（0 = 本岛不用钱） */
  cost: number;
  /** 需要的渔具等级 */
  gear: number;
  /** 需要先买船 */
  boat?: boolean;
  /** 水下配色 */
  palette: { shallow: number; deep: number; accent: number };
  /** 海床深度（世界坐标 y） */
  floor: number;
  /** 这里有的鱼 */
  fish: string[];
  hazards: IslandHazards;
}

/**
 * 四片海：`floor` 是海床深度（px，10px = 1m）。
 *
 * 海域整体加深过一轮（深水区才有大鱼），现在从 200m 一路排到 640m——
 * 能不能潜到海床，取决于氧气罐等级与 `DiveScene` 的氧气曲线（越深越费气），
 * 所以「浅滩随便潜 / 沉船湾要满级氧气罐才摸得到底」是设计好的。
 */
export const ISLANDS: Island[] = [
  {
    id: 'shore',
    name: '近岸浅滩',
    desc: '家门口的浅水，小鱼多、水母少，练手够用',
    cost: 0,
    gear: 1,
    palette: { shallow: 0x3fa9d8, deep: 0x0b2e4a, accent: 0x9fe8ff },
    floor: 2000,
    fish: ['sardine', 'clown', 'bass', 'octopus'],
    hazards: { jelly: 3, shark: 0, current: 0 },
  },
  {
    id: 'coral',
    name: '珊瑚环礁',
    desc: '彩色礁盘，鱼多但水母也密',
    cost: 600,
    gear: 2,
    boat: true,
    palette: { shallow: 0x35c4c0, deep: 0x083b46, accent: 0xffe6a3 },
    floor: 3200,
    fish: ['clown', 'bass', 'octopus', 'lobster', 'amberjack'],
    hazards: { jelly: 7, shark: 0, current: 1 },
  },
  {
    id: 'trench',
    name: '深海沟',
    desc: '又深又冷，金枪鱼与鮟鱇在这里',
    cost: 1200,
    gear: 3,
    boat: true,
    palette: { shallow: 0x1f6f9e, deep: 0x061b33, accent: 0x8fd8ff },
    floor: 5000,
    fish: ['amberjack', 'tuna', 'angler', 'grouper'],
    hazards: { jelly: 4, shark: 1, current: 2 },
  },
  {
    id: 'wreck',
    name: '沉船湾',
    desc: '沉船残骸盘着石斑，龙王偶尔路过',
    cost: 2000,
    gear: 4,
    boat: true,
    palette: { shallow: 0x2d7f8f, deep: 0x04101f, accent: 0x7fe0c0 },
    floor: 6400,
    fish: ['tuna', 'grouper', 'oarfish', 'lobster'],
    hazards: { jelly: 6, shark: 2, current: 3 },
  },
];

export function islandById(id: string): Island {
  return ISLANDS.find((i) => i.id === id) ?? ISLANDS[0];
}

// ---- 升级 -----------------------------------------------------------------

/**
 * 三条线的最高等级。海域加深到 640m 之后，氧气罐要能撑到「下一趟深海」才够用，
 * 所以从 5 级放宽到 8 级（背包与渔具跟着一起放开，不然只有氧气能升会很怪）。
 */
export const MAX_LEVEL = 8;

/** 升到下一级的价格：三件装备一个曲线（下标 = 当前等级，即「从 i 级升到 i+1 级」） */
export const UPGRADE_COSTS = [0, 300, 700, 1400, 2400, 4200, 7000, 11000];

export function upgradeCost(level: number): number {
  return UPGRADE_COSTS[Math.min(level, UPGRADE_COSTS.length - 1)];
}

/**
 * 氧气上限（秒）。深海一趟动辄一两分钟，所以曲线比原来陡：
 * Lv1 36s → Lv8 232s（配合 `DiveScene` 的平方消耗曲线，见那边的 `OXYGEN_DEEP2`）。
 */
export function oxygenMax(level: number): number {
  return 36 + (level - 1) * 28;
}

/** 背包容量：条数 / 总重量（kg） */
export function bagLimits(level: number): { count: number; kg: number } {
  return { count: 6 + (level - 1) * 3, kg: 14 + (level - 1) * 9 };
}

/** 渔具：钩子半径 + 能拉住的体重上限（kg） */
export function gearStats(level: number): { hook: number; maxKg: number; reel: number } {
  return {
    hook: 34 + (level - 1) * 6,
    maxKg: 4 + (level - 1) * 14,
    // 收杆速度倍率
    reel: 1 + (level - 1) * 0.18,
  };
}

/** 买船的价格 */
export const BOAT_COST = 2500;

// ---- 每日钓鱼任务 -----------------------------------------------------------

export interface FishTaskTemplate {
  id: string;
  /** 文案（{n} 占位） */
  text: string;
  /** 目标次数 */
  goal: number;
  /** 奖励 */
  coins: number;
  honor: number;
}

/** 模板池：每天随机一条 */
export const FISH_TASKS: FishTaskTemplate[] = [
  { id: 'kg20_3', text: '抓 3 条 20kg 以上的鱼', goal: 3, coins: 300, honor: 15 },
  { id: 'kg10_5', text: '抓 5 条 10kg 以上的鱼', goal: 5, coins: 260, honor: 12 },
  { id: 'count8', text: '抓 8 条任意鱼', goal: 8, coins: 200, honor: 10 },
  { id: 'shiny1', text: '抓 1 条闪光鱼', goal: 1, coins: 350, honor: 18 },
  { id: 'sardine5', text: '抓 5 条沙丁鱼', goal: 5, coins: 180, honor: 8 },
  { id: 'clown3', text: '抓 3 条小丑鱼', goal: 3, coins: 220, honor: 10 },
];

/** 每个任务的判定器：这条鱼算不算进度 */
export function fishTaskMatch(taskId: string, sp: Species, kg: number, shiny: boolean): boolean {
  switch (taskId) {
    case 'kg20_3':
      return kg >= 20;
    case 'kg10_5':
      return kg >= 10;
    case 'count8':
      return true;
    case 'shiny1':
      return shiny;
    case 'sardine5':
      return sp.id === 'sardine';
    case 'clown3':
      return sp.id === 'clown';
    default:
      return false;
  }
}
