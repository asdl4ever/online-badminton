/**
 * 成就系统。
 *
 * 分板块（海域 / 球场 / 山野 / 社交），**先做海域**——其余板块先在面板里占位。
 * 每条成就 = 一个"度量 + 目标值"，度量全部从 `stores/progress.ts` 已有的数据里算出来
 * （图鉴、金币、等级…），加上几个专门为成就加的小计数器（下潜次数、最深深度、
 * 卖鱼总额、出海次数），所以成就进度**不会和玩法数据打架**。
 *
 * 奖励两种：金币，以及**定制物品 / 皮肤**（`game/items.ts` 里的一条 item id，
 * 达成后直接进收藏；这些原本是宝箱里的，成就给了另一条获取路径）。
 */

export type AchSectionId = 'sea' | 'court' | 'land' | 'social';

export interface AchSection {
  id: AchSectionId;
  name: string;
  emoji: string;
  desc: string;
  /** 这一板块的成就做好了没有（没做好的只展示占位） */
  ready: boolean;
}

export const ACH_SECTIONS: AchSection[] = [
  { id: 'sea', name: '海域', emoji: '🌊', desc: '潜水抓鱼 · 远航海岛', ready: true },
  { id: 'court', name: '球场', emoji: '🏸', desc: '对局、连击与段位（敬请期待）', ready: false },
  { id: 'land', name: '山野', emoji: '⛰️', desc: '攀岩与矿洞（敬请期待）', ready: false },
  { id: 'social', name: '社交', emoji: '🤝', desc: '好友、营地与联机（敬请期待）', ready: false },
];

/**
 * 进度的来源。`progress.metricValue()` 把每个度量映射成一个当前值，
 * 成就只比较 `cur >= goal`。
 */
export type AchMetric =
  /** 累计钓到的鱼（图鉴条数之和） */
  | { kind: 'fishTotal' }
  /** 图鉴发现的鱼种数 */
  | { kind: 'species' }
  /** 单条最重（kg） */
  | { kind: 'bestKg' }
  /** 抓到了某一特定鱼种（0/1） */
  | { kind: 'caught'; species: string }
  /** 卖鱼累计收入（¥） */
  | { kind: 'sold' }
  /** 最深下潜（米） */
  | { kind: 'deepest' }
  /** 下潜次数 */
  | { kind: 'dives' }
  /** 出海次数 */
  | { kind: 'trips' }
  /** 买到船（0/1） */
  | { kind: 'boat' }
  /** 氧气罐 / 背包 / 渔具等级 */
  | { kind: 'oxygenLv' }
  | { kind: 'bagLv' }
  | { kind: 'gearLv' };

export interface Achievement {
  id: string;
  section: AchSectionId;
  name: string;
  desc: string;
  goal: number;
  metric: AchMetric;
  /** 奖励金币 */
  coins?: number;
  /** 奖励的定制物品 / 皮肤（`ITEMS` 里的 id，达成即进收藏） */
  itemId?: string;
}

/** 海域板块的成就：从"第一次下水"一路到"深海龙王" */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'sea-dive-1',
    section: 'sea',
    name: '初次下水',
    desc: '第一次潜进海湾',
    goal: 1,
    metric: { kind: 'dives' },
    coins: 150,
  },
  {
    id: 'sea-fish-10',
    section: 'sea',
    name: '开张',
    desc: '累计抓 10 条鱼',
    goal: 10,
    metric: { kind: 'fishTotal' },
    coins: 300,
    itemId: 'effect:bubble',
  },
  {
    id: 'sea-fish-50',
    section: 'sea',
    name: '熟手渔民',
    desc: '累计抓 50 条鱼',
    goal: 50,
    metric: { kind: 'fishTotal' },
    coins: 600,
  },
  {
    id: 'sea-fish-200',
    section: 'sea',
    name: '渔场老板',
    desc: '累计抓 200 条鱼',
    goal: 200,
    metric: { kind: 'fishTotal' },
    coins: 1500,
    itemId: 'racketSkin:sapphire',
  },
  {
    id: 'sea-species-3',
    section: 'sea',
    name: '图鉴入门',
    desc: '鱼图鉴记录 3 种鱼',
    goal: 3,
    metric: { kind: 'species' },
    coins: 300,
    itemId: 'effect:ripple',
  },
  {
    id: 'sea-species-6',
    section: 'sea',
    name: '见多识广',
    desc: '鱼图鉴记录 6 种鱼',
    goal: 6,
    metric: { kind: 'species' },
    coins: 800,
    itemId: 'cape:ocean',
  },
  {
    id: 'sea-species-all',
    section: 'sea',
    name: '湾区全图鉴',
    desc: '鱼图鉴记录 10 种鱼',
    goal: 10,
    metric: { kind: 'species' },
    coins: 1500,
    itemId: 'wings:seaWave',
  },
  {
    id: 'sea-best-10',
    section: 'sea',
    name: '十斤大鱼',
    desc: '抓到单条 10kg 的鱼',
    goal: 10,
    metric: { kind: 'bestKg' },
    coins: 400,
  },
  {
    id: 'sea-best-30',
    section: 'sea',
    name: '三十斤巨物',
    desc: '抓到单条 30kg 的鱼',
    goal: 30,
    metric: { kind: 'bestKg' },
    coins: 1200,
    itemId: 'wings:manta',
  },
  {
    id: 'sea-sold-3000',
    section: 'sea',
    name: '第一桶金',
    desc: '卖鱼累计赚到 ¥3000',
    goal: 3000,
    metric: { kind: 'sold' },
    coins: 500,
  },
  {
    id: 'sea-deep-100',
    section: 'sea',
    name: '百尺深潜',
    desc: '潜到水下 100m',
    goal: 100,
    metric: { kind: 'deepest' },
    coins: 600,
    itemId: 'aura:tide',
  },
  {
    id: 'sea-boat',
    section: 'sea',
    name: '有自己的船了',
    desc: '在岸边买下那条小船',
    goal: 1,
    metric: { kind: 'boat' },
    coins: 300,
    itemId: 'hat:pirate',
  },
  {
    id: 'sea-trips-3',
    section: 'sea',
    name: '远航常客',
    desc: '出海 3 次',
    goal: 3,
    metric: { kind: 'trips' },
    coins: 900,
    itemId: 'wings:sail',
  },
  {
    id: 'sea-gear-5',
    section: 'sea',
    name: '顶级渔具',
    desc: '渔具升到 Lv.5',
    goal: 5,
    metric: { kind: 'gearLv' },
    coins: 2000,
    itemId: 'racketSkin:ember',
  },
  {
    id: 'sea-legend',
    section: 'sea',
    name: '深海龙王',
    desc: '抓到一条深海龙王',
    goal: 1,
    metric: { kind: 'caught', species: 'oarfish' },
    coins: 2500,
    itemId: 'aura:voidRift',
  },
];

export const SEA_ACHIEVEMENTS = ACHIEVEMENTS.filter((a) => a.section === 'sea');

export function achievementsOf(section: AchSectionId): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.section === section);
}
