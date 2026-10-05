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
  | { kind: 'gearLv' }
  /** 抓到鱼王的次数 */
  | { kind: 'fishKings' }
  /** 抓到闪光鱼的次数 */
  | { kind: 'fishShiny' };

export interface Achievement {
  id: string;
  section: AchSectionId;
  name: string;
  desc: string;
  goal: number;
  metric: AchMetric;
  /**
   * 奖励的**宝箱钥匙**（1~3 把）。钥匙是开宝箱的唯一货币，成就是它的主要来源；
   * 金币已经改成「只在金币商店买东西」，所以成就这里不再发金币。
   */
  keys?: number;
  /** 奖励的定制物品 / 皮肤（`ITEMS` 里的 id，达成即进收藏） */
  itemId?: string;
}

/**
 * 海域板块的成就：从"第一次下水"一路到"深海龙王"。
 *
 * ⚠️ `id` 里那几个数字是**历史遗留**（比如 `sea-fish-10` 现在要求 50 条）——id 只当
 * 存档键用（`bmt-ach-done`），改名会让老存档的那条重新发一次奖，所以只改 `goal` / `desc`。
 * 现在真正看的是 `desc` 与 `goal`。
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'sea-dive-1',
    section: 'sea',
    name: '初次下水',
    desc: '第一次潜进海湾',
    goal: 1,
    metric: { kind: 'dives' },
    keys: 1,
  },
  {
    id: 'sea-fish-10',
    section: 'sea',
    name: '开张',
    desc: '累计抓 50 条鱼',
    goal: 50,
    metric: { kind: 'fishTotal' },
    keys: 1,
    itemId: 'effect:bubble',
  },
  {
    id: 'sea-fish-50',
    section: 'sea',
    name: '熟手渔民',
    desc: '累计抓 300 条鱼',
    goal: 300,
    metric: { kind: 'fishTotal' },
    keys: 2,
  },
  {
    id: 'sea-fish-200',
    section: 'sea',
    name: '渔场老板',
    desc: '累计抓 1000 条鱼',
    goal: 1000,
    metric: { kind: 'fishTotal' },
    keys: 3,
    itemId: 'racketSkin:sapphire',
  },
  {
    id: 'sea-species-3',
    section: 'sea',
    name: '图鉴入门',
    desc: '鱼图鉴记录 3 种鱼',
    goal: 3,
    metric: { kind: 'species' },
    keys: 1,
    itemId: 'effect:ripple',
  },
  {
    id: 'sea-species-6',
    section: 'sea',
    name: '见多识广',
    desc: '鱼图鉴记录 6 种鱼',
    goal: 6,
    metric: { kind: 'species' },
    keys: 2,
    itemId: 'cape:ocean',
  },
  {
    id: 'sea-species-all',
    section: 'sea',
    name: '湾区全图鉴',
    desc: '鱼图鉴记录 10 种鱼',
    goal: 10,
    metric: { kind: 'species' },
    keys: 3,
    itemId: 'back:seaWave',
  },
  {
    id: 'sea-best-10',
    section: 'sea',
    name: '十斤大鱼',
    desc: '抓到单条 10kg 的鱼',
    goal: 10,
    metric: { kind: 'bestKg' },
    keys: 1,
  },
  {
    id: 'sea-best-30',
    section: 'sea',
    name: '三十斤巨物',
    desc: '抓到单条 30kg 的鱼',
    goal: 30,
    metric: { kind: 'bestKg' },
    keys: 3,
    itemId: 'back:manta',
  },
  {
    id: 'sea-sold-3000',
    section: 'sea',
    name: '第一桶金',
    desc: '卖鱼累计赚到 ¥12000',
    goal: 12000,
    metric: { kind: 'sold' },
    keys: 1,
  },
  {
    id: 'sea-deep-100',
    section: 'sea',
    name: '百尺深潜',
    desc: '潜到水下 100m',
    goal: 100,
    metric: { kind: 'deepest' },
    keys: 2,
    itemId: 'aura:tide',
  },
  {
    id: 'sea-deep-200',
    section: 'sea',
    name: '两百米之下',
    desc: '潜到水下 200m（近岸浅滩只有 200m 深，得先出海去珊瑚环礁）',
    goal: 200,
    metric: { kind: 'deepest' },
    keys: 3,
    itemId: 'trail:void',
  },
  {
    id: 'sea-deep-500',
    section: 'sea',
    name: '深渊旅客',
    desc: '潜到水下 500m（只有沉船湾够深，氧气罐至少要 4 级）',
    goal: 500,
    metric: { kind: 'deepest' },
    keys: 3,
    itemId: 'racketSkin:tsunami',
  },
  {
    id: 'sea-boat',
    section: 'sea',
    name: '有自己的船了',
    desc: '在岸边买下那条小船',
    goal: 1,
    metric: { kind: 'boat' },
    keys: 1,
    itemId: 'hat:pirate',
  },
  {
    id: 'sea-trips-3',
    section: 'sea',
    name: '远航常客',
    desc: '出海 3 次',
    goal: 3,
    metric: { kind: 'trips' },
    keys: 2,
    itemId: 'back:sail',
  },
  {
    id: 'sea-gear-5',
    section: 'sea',
    name: '顶级渔具',
    desc: '渔具升到 Lv.8（深海的大鱼得要满级钩子）',
    goal: 8,
    metric: { kind: 'gearLv' },
    keys: 3,
    itemId: 'racketSkin:ember',
  },
  {
    id: 'sea-legend',
    section: 'sea',
    name: '深海龙王',
    desc: '抓到一条深海龙王',
    goal: 1,
    metric: { kind: 'caught', species: 'oarfish' },
    keys: 3,
    itemId: 'aura:voidRift',
  },
  {
    id: 'sea-king-1',
    section: 'sea',
    name: '👑 鱼王猎人',
    desc: '抓住 3 条鱼王',
    goal: 3,
    metric: { kind: 'fishKings' },
    keys: 3,
    itemId: 'hat:captain',
  },
  {
    id: 'sea-king-5',
    section: 'sea',
    name: '👑 王中王',
    desc: '抓住 15 条鱼王',
    goal: 15,
    metric: { kind: 'fishKings' },
    keys: 3,
    itemId: 'aura:gold',
  },
  {
    id: 'sea-shiny-1',
    section: 'sea',
    name: '✨ 金光一闪',
    desc: '抓住 3 条闪光鱼',
    goal: 3,
    metric: { kind: 'fishShiny' },
    keys: 1,
    itemId: 'effect:star',
  },
  {
    id: 'sea-shiny-5',
    section: 'sea',
    name: '✨ 星光收藏家',
    desc: '抓住 15 条闪光鱼',
    goal: 15,
    metric: { kind: 'fishShiny' },
    keys: 3,
    itemId: 'trail:gold',
  },
];

export const SEA_ACHIEVEMENTS = ACHIEVEMENTS.filter((a) => a.section === 'sea');

export function achievementsOf(section: AchSectionId): Achievement[] {
  return ACHIEVEMENTS.filter((a) => a.section === section);
}
