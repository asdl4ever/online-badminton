import { ARENA_TIERS } from './arena';
import type { AiStyle } from './ai';
import type { ThemeId } from './theme';

/**
 * 晋级赛「赛事身份」表。
 *
 * 报名第二步：先选级别（100 赛…总决赛），再从该级别的**名字池**里挑一场报名。
 * 以前这 6 场赛事除了名字之外完全一样，现在每个名字固定对应一套身份：
 * 场馆 + 球场主题 + 打法风格 + 一套专属的对手阵容（四维侧重 / 外观 / 名字 / 表情）。
 *
 * 所以同一档里 6 场赛事打起来是 6 路人：
 * 一群扣杀狂、一群只捞高远球的、一群跑不死的、一群老油条……
 *
 * **索引规则（重要）**：身份按「在本档 `names` 数组里的下标取模」解析，不按名字查表。
 * 因为 `ARENA_TIERS[].names` 里的字符串**跨档重复**（「公开赛」在 300/400/500 赛都有、
 * 「国际大师赛」在 800/1000 赛都有），而且这张 `names` 还被 `pickCupName()`、
 * `world-arena.ts` 的 `worldCupName()` 与 `career.ts` 的生涯履历共用——
 * 所以 `names` 的结构**一行都不能改**，身份表是独立于它的第二张表。
 *
 * 前 10 档名字池各 6 个、总决赛只有 5 个 → 取模后总决赛只会用到前 5 条身份，天然兼容。
 */

/** 阵容类型：低档用来重塑现场弱手的四维，高档用来筛名人堂阵容 */
export type EventPool = 'rookie' | 'attack' | 'defense' | 'speed' | 'veteran' | 'open';

/** 对手强度标签（只用于卡面提示；同档内刻意保持基本持平） */
export type EventPower = 'weak' | 'even' | 'strong';

/** 装扮档次：bare 只有帽 / 球拍皮肤 / 拖尾；mixed 再补翅膀披风；full 再补光环 / 地环 / 宠物 */
export type EventGear = 'bare' | 'mixed' | 'full';

export interface ArenaEvent {
  key: string;
  /** 阵容标签（卡面胶囊）：新手村 / 快攻营 / 防守派 / 速度队 / 老将组 / 综合赛 */
  label: string;
  /** 场馆名（卡面 / 赛程页 / 结算海报） */
  venue: string;
  /** 一句话说明 */
  blurb: string;
  /** 该赛事绑定的球场主题（见 `arena-themes.ts`） */
  theme: ThemeId;
  /** 身份双色（0xRRGGBB）：卡面色带与结算海报的渐变 */
  art: [number, number];
  /** 阵容类型 */
  pool: EventPool;
  /** 这一路人的统一打法风格（写进对手，赛程树与对局页都显示它） */
  style: AiStyle;
  /**
   * 五维偏移（均值≈0，只换侧重不换强弱）。
   * - 低档（现场弱手）：直接叠在档位基数上；
   * - 高档（名人堂抽人）：叠在**本届的副本**上——名人堂存档里他们的四维与风格一行不改。
   */
  bias: Partial<Record<'technique' | 'speed' | 'attack' | 'defense' | 'stamina', number>>;
  /** 装扮档次（只影响现场弱手；名人堂球员穿自己那身） */
  gear: EventGear;
  /** 强度倾向（卡面标注「对手偏弱 / 偏强」） */
  power: EventPower;
  /** 这一路人的外号词根（和 `SURNAMES` 拼成名字：重炮老张 / 铁壁小李…） */
  titles: string[];
  /** 这一路人的表情（现场弱手共用；对局里一眼能认出是哪一路人） */
  emojis: string[];
}

/** 名字底座：外号词根 × 下面这些「姓氏」，保证 15 个人名不重复且一眼看出是哪路人 */
const SURNAMES = [
  '老张', '小李', '阿强', '大刘', '老王', '小周', '阿杰', '老陈',
  '小赵', '阿龙', '老徐', '小吴', '阿凯', '老许', '小郑', '阿豪',
  '老蒋', '小夏', '阿伟', '老三',
];

/**
 * 六条赛事身份，顺序 = 档内 `names` 的下标。
 *
 * 偏移故意做得**足够大**（±8~18）：这样 `styleFromStats()` 会稳定给出该路人的风格，
 * 打起来也真的不一样（扣杀狂一场能扣十几次，防守派几乎不失误）。
 * 每条的偏移之和都 ≈0，所以**同档内整体强度基本持平**，只是路子不同。
 */
export const ARENA_EVENTS: ArenaEvent[] = [
  {
    key: 'rookie',
    label: '新手村',
    venue: '社区体育馆',
    blurb: '街坊邻居组的局，装备寒酸、失误偏多',
    theme: 'courtyard',
    art: [0x8fbf7a, 0xd9ebc9],
    pool: 'rookie',
    style: 'balanced',
    bias: { technique: -9, speed: -9, attack: -9, defense: -9, stamina: -9 },
    gear: 'bare',
    power: 'weak',
    titles: ['刚学会', '手抖', '挥空', '慢半拍', '重在参与', '三分钟', '借拍的', '热身'],
    emojis: ['🙂', '😐', '😅'],
  },
  {
    key: 'attack',
    label: '快攻营',
    venue: '城东进攻训练馆',
    blurb: '一群扣杀爱好者，逮到高球就往下砸，后场与网前小球偏弱',
    theme: 'smashHall',
    art: [0xe4622f, 0xffc79a],
    pool: 'attack',
    style: 'attack',
    bias: { attack: 20, stamina: 6, defense: -12, technique: -7 },
    gear: 'bare',
    power: 'even',
    titles: ['重炮', '扣杀', '爆扣', '劈杀', '压网', '跳杀', '猛冲', '连扣'],
    emojis: ['😡', '🔥', '💥'],
  },
  {
    key: 'defense',
    label: '防守派',
    venue: '老城区高远球馆',
    blurb: '把球挑到天花板也不失误，专等你自己打飞',
    theme: 'highClearHall',
    art: [0x3d6fb8, 0xa9c6ea],
    pool: 'defense',
    style: 'defense',
    bias: { defense: 20, technique: 4, attack: -14, speed: -5 },
    gear: 'mixed',
    power: 'even',
    titles: ['铁壁', '高远', '捞球', '不死', '稳守', '底线', '回防', '耐心'],
    emojis: ['🛡️', '🧱', '😌'],
  },
  {
    key: 'speed',
    label: '速度队',
    venue: '湖畔快腿中心',
    blurb: '两条腿停不下来，网前什么球都能扑到，手上功夫偏糙',
    theme: 'lakeside',
    art: [0x1fa5a0, 0xa8e4df],
    pool: 'speed',
    style: 'speed',
    bias: { speed: 20, stamina: 14, technique: -14, attack: -8, defense: -6 },
    gear: 'bare',
    power: 'even',
    titles: ['飞毛腿', '闪电', '快腿', '追风', '疾步', '小鹿', '风火轮', '蹿天'],
    emojis: ['⚡', '💨', '🏃'],
  },
  {
    key: 'veteran',
    label: '老将组',
    venue: '市体育馆 · 老将专场',
    blurb: '跑不动了，但球路最刁、几乎不失误，装备最齐',
    theme: 'veteranHall',
    art: [0x6a5aa8, 0xc4b8ea],
    pool: 'veteran',
    style: 'technique',
    bias: { technique: 20, defense: 4, speed: -14, attack: -8 },
    gear: 'full',
    power: 'even',
    titles: ['老练', '经验', '老球皮', '稳手', '老辣', '十年', '老姜', '熟路'],
    emojis: ['🎓', '🧐', '👴'],
  },
  {
    key: 'open',
    label: '综合赛',
    venue: '中心竞技场',
    blurb: '什么人都来，整体最齐整的一场',
    theme: 'grandArena',
    art: [0xc9962f, 0xf2dfa8],
    pool: 'open',
    style: 'balanced',
    bias: { technique: 6, speed: 6, attack: 6, defense: 6, stamina: 6 },
    gear: 'full',
    power: 'strong',
    titles: ['全能', '万金油', '两面手', '多面', '正经', '老手', '实力派', '无短板'],
    emojis: ['🏅', '😎', '🤝'],
  },
];

export const EVENT_POWER_LABEL: Record<EventPower, string> = {
  weak: '对手偏弱',
  even: '实力相当',
  strong: '对手偏强',
};

/** 这一路人的名字池（外号 + 姓，15 个人名不重复） */
export function arenaRookieNames(ev: ArenaEvent): string[] {
  const out: string[] = [];
  const n = Math.max(1, ev.titles.length);
  for (let i = 0; out.length < SURNAMES.length; i++) {
    out.push(`${ev.titles[i % n]}${SURNAMES[i]}`);
  }
  return out;
}

/** 某个赛事名在本档名字池里的下标（找不到 → 0） */
export function arenaEventIndexOf(tier: string, cupName?: string): number {
  const a = ARENA_TIERS.find((t) => t.tier === tier);
  const names = a?.names ?? [];
  if (!cupName || !names.length) return 0;
  const i = names.indexOf(cupName);
  return i < 0 ? 0 : i % ARENA_EVENTS.length;
}

/** 解析一场赛事的身份（越界 / 找不到都兜底到第 0 条） */
export function arenaEventOf(tier: string, cupName?: string): ArenaEvent {
  return ARENA_EVENTS[arenaEventIndexOf(tier, cupName)];
}
