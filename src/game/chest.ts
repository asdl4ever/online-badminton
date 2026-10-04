import { GACHA_POOL, STAR_WEIGHT, type Item } from './items';

/**
 * 宝箱「分期」：不再是一个万年不变的大池子，而是**每小时换一期**的主题宝箱。
 *
 * - 一期 = 一个**类别**（21 个气氛主题 + 普通宝箱 / 高级宝箱），每期从该类别的
 *   候选里精选若干件当池子；物品互斥认领，一件只会出现在一个主题里，
 *   没被主题认领的进普通 / 高级宝箱（高级的星级结构高星更多）；
 * - 面板右侧那一墙就是这一期（**看图抽**，不是"展示用的精选、实际抽全池"）；
 * - 两批主题：
 *   · **早期 11 个**（深海遗珍…宇宙龙域）走「星级结构 + 补位」那套，一期 **12 件**
 *     （`BANNER_SIZE`），星级结构刻意贴近全局（见 `BANNER_TIER_TARGET`）；
 *   · **后加的 10 个**（沙漠商队…元宵灯会）是 `pure: true` 的**纯主题**宝箱——
 *     候选池就是它的 16 件定制物品，**整池上墙**（15~30 格，见 `bannerSize`），
 *     不补位，所以墙上绝不会混进别的东西；
 * - 主题按小时**轮流**（`chestThemeFor`），期内的物品用**种子随机**定死，
 *   所以同一小时内所有人、刷新页面看到的都是同一期。
 */

export interface ChestTheme {
  id: string;
  /** 期名（面板上的大标题） */
  name: string;
  emoji: string;
  /** 一句话卖点 */
  tagline: string;
  /** 宝箱外观配色（面板里当 CSS 变量用） */
  palette: { base: string; lid: string; trim: string; glow: string; ink: string };
  /** 飘在宝箱周围的装饰 emoji */
  decor: string[];
  /** 物品名里含任一词 → 这件属于这个主题 */
  keywords: string[];
  /** 关键词抓不到、但明显属于这个主题的（按物品 id 钦点） */
  extra?: string[];
  /**
   * 按 **ref 前缀** 认领：ref 以任一项开头的物品归这个主题。
   * 新主题宝箱的 16 件都是定制物品、ref 统一带主题码（如 `des...`），
   * 用前缀批量认领，省得把 16 个 id 一条条写进 `extra`。
   */
  refPrefix?: string[];
  /**
   * **黑名单**（物品名含任一词 → 不算这个主题）：
   * 关键词太宽时用它剔除不契合的（比如「波」抢到冲击波、恐龙角抢到万圣）。
   */
  exclude?: string[];
  /**
   * 兜底类别（普通宝箱 / 高级宝箱）：候选 = **任何主题都没认领**的那些物品。
   * 两个兜底类别共用同一批「没归类」的池子，差别只在星级结构（见 `tierTarget`）。
   */
  complement?: boolean;
  /** 这类宝箱的星级结构；不填用全局 `BANNER_TIER_TARGET`（高级宝箱用它放更多高星） */
  tierTarget?: [number, number][];
  /**
   * 「纯主题」宝箱：候选池 = 只属于这个主题的那些定制物品（16 件），
   * 整池上墙（`bannerSize` = 池子大小，15~30 格），不走星级结构 + 补位那一套，
   * 所以墙上绝不会混进别的东西。10 个新主题都用它。
   */
  pure?: boolean;
  /** 纯主题宝箱的物品墙格数（15~30）；不填用池子大小 */
  bannerSize?: number;
}

/**
 * 高级宝箱的星级结构：**没有低星**——3★×3 / 4★×4 / 5★×3（共 10 件），
 * 剩下两格从池子里补，所以同样的钥匙开高级宝箱，4★+ 的期望高得多。
 */
export const PREMIUM_TIER_TARGET: [number, number][] = [
  [3, 3],
  [4, 4],
  [5, 3],
];

/**
 * 23 个类别：**21 个气氛主题** + **普通宝箱** + **高级宝箱**
 * （前 11 个是早期主题，后 11 个是 `pure` 的纯主题宝箱——第 11 个是 🗺️ 山海宝箱）。
 * - 物品**互斥认领**：一件物品只会出现在一个主题里（先看 `extra` 钦点，再按
 *   `refPrefix` 前缀、再按数组顺序做关键词匹配，先到先得，见 `ownerOf`）；
 * - 没被任何主题认领的物品归入**普通宝箱**和**高级宝箱**（两个类别同一池子，
 *   高级宝箱的星级结构高星更多，见 `PREMIUM_TIER_TARGET`）。
 */
export const CHEST_THEMES: ChestTheme[] = [
  {
    id: 'deep',    name: '深海遗珍',
    emoji: '🐚',
    tagline: '从沉船里捞上来的那一柜',
    palette: { base: '#0e4f63', lid: '#14708a', trim: '#7fe3d8', glow: '#35c9d8', ink: '#06323f' },
    decor: ['🫧', '🐚', '🪸', '💧'],
    keywords: [
      '海', '潮', '浪', '水', '潜', '珍珠', '珊瑚', '鲛', '鲨', '鱼', '船', '锚', '桨', '帆',
      '贝', '螺', '海盗', '波',
    ],
    extra: ['hat:snorkel', 'effect:foam', 'skin:angler', 'mount:dolphin', 'cape:seamist'],
    // 「波/螺/水」太宽：冲击波、螺旋系、水晶球这些不是海的东西剔掉
    exclude: ['波波', '螺丝', '螺旋', '冲击波', '音波', '波纹', '水晶', '奶茶'],
  },
  {
    id: 'hallow',
    name: '幽夜万圣',
    emoji: '🎃',
    tagline: '不给糖，就捣蛋',
    palette: { base: '#4a2450', lid: '#6d2f52', trim: '#ffb347', glow: '#b455d6', ink: '#2a0f2e' },
    decor: ['🦇', '🕸️', '👻', '🕯️'],
    keywords: [
      '南瓜', '幽灵', '髅', '鬼', '蝙蝠', '骸', '蛛', '墓', '蜡烛', '提灯', '巫', '黑猫',
      '骨', '恐', '夜', '爪', '网', '诅咒',
    ],
    // 「网」会抢到参数化特效的雷网系列，「恐」是恐龙的——都不归万圣
    exclude: ['雷网', '恐龙角'],
    extra: ['skin:mummy', 'mount:pumpkincart', 'cape:batcape'],
  },
  {
    id: 'steel',
    name: '锈色机械',
    emoji: '⚙️',
    tagline: '拆开看看里面是什么',
    palette: { base: '#3c4650', lid: '#55606b', trim: '#d8a24a', glow: '#8fd8ff', ink: '#1d2329' },
    decor: ['⚙️', '🔧', '💡', '🛠️'],
    keywords: [
      '机械', '齿轮', '螺丝', '电池', '卫星', '焊', '电视', '闹钟', '红绿灯', '机器', '电路',
      '涡轮', '铁', '钢', '机车', '矿工', '摄像', '引擎', '零件',
    ],
    // 关键词抓不到的科技货：VR / 雷达 / 全息 / 二进制 + 本主题专属三件套
    extra: [
      'hat:vr', 'aura:radar', 'aura:holo', 'racketSkin:holo', 'effect:binary',
      'skin:windup', 'mount:gearbike', 'cape:slagcape',
    ],
  },
  {
    id: 'royal',
    name: '皇家典藏',
    emoji: '👑',
    tagline: '这一柜，只有戴得上的人配开',
    palette: { base: '#1f3b78', lid: '#2c56a8', trim: '#ffd45c', glow: '#ffe8a0', ink: '#12224a' },
    decor: ['👑', '💎', '✨', '🏆'],
    keywords: [
      '王冠', '王座', '皇家', '冠军', '礼帽', '金', '宝石', '权杖', '勋章', '君主', '荣耀',
      '皇', '冠', '鎏',
    ],
    // 「冠」会抢到树叶冠 / 羽冠 / 冠鳍（鱼鳍），不算王室的
    exclude: ['树叶冠', '羽冠', '冠鳍'],
    extra: ['skin:guard', 'mount:lion', 'cape:ermine'],
  },
  {
    id: 'sakura',
    name: '樱吹雪',
    emoji: '🌸',
    tagline: '花瓣落在箱盖上',
    palette: { base: '#d8789f', lid: '#f0a3bd', trim: '#fff0f4', glow: '#ffd0e2', ink: '#7a3550' },
    decor: ['🌸', '🌷', '🦋', '💮'],
    keywords: [
      '樱', '花', '蝴蝶', '兔', '春', '嫩芽', '四叶草', '草莓', '樱桃', '甜', '粉', '莲',
      '芽', '蝶',
    ],
    // 麻花辫 / 爆米花是「花」字误伤，甜甜圈是「甜」误伤，烟花归霓虹
    exclude: ['麻花辫', '爆米花', '甜甜圈', '烟花'],
    extra: ['skin:sakurabun', 'mount:kite', 'cape:petalveil'],
  },
  {
    id: 'galaxy',
    name: '星海漫游',
    emoji: '🌌',
    tagline: '从星尘里捞东西',
    palette: { base: '#242058', lid: '#3a3486', trim: '#9fd8ff', glow: '#a98cff', ink: '#12103a' },
    decor: ['✨', '🌙', '🪐', '⭐'],
    keywords: [
      '星', '月', '银河', '流星', '彗', '极光', '轨道', '行星', '宇宙', '虚空', '黑洞',
      '量子', '幻影', '光',
    ],
    // 圣光是神职系不是星空系
    exclude: ['圣光'],
    extra: ['skin:starlet', 'mount:crescent', 'cape:starmap'],
  },
  {
    id: 'magma',
    name: '烈焰熔炉',
    emoji: '🔥',
    tagline: '打开前先戴手套',
    palette: { base: '#5a1a12', lid: '#8c2a14', trim: '#ffb347', glow: '#ff6a2a', ink: '#3a0d08' },
    decor: ['🔥', '🌋', '💥', '🪨'],
    keywords: ['焰', '火', '熔', '龙', '原子', '赤', '灼', '岩', '陨石', '火山', '岩浆', '爆', '炎', '烬'],
    // 墨爆是墨水不是火、爆米花是零食；龙系全部归「宇宙龙域」（extra 先于关键词认领）
    exclude: ['墨爆', '爆米花'],
    extra: ['skin:emberling', 'mount:firewheel', 'cape:cinder'],
  },
  {
    id: 'frost',
    name: '冰川秘境',
    emoji: '❄️',
    tagline: '里面比外面还冷',
    palette: { base: '#2a5f7a', lid: '#4c8fa8', trim: '#e8fbff', glow: '#9fe8ff', ink: '#123544' },
    decor: ['❄️', '🧊', '🌨️', '💎'],
    keywords: ['冰', '霜', '雪', '极地', '冬', '寒', '企鹅', '水晶', '冻', '凛'],
  },
  {
    id: 'jungle',
    name: '丛林图腾',
    emoji: '🌿',
    tagline: '藤蔓缠了三圈的木箱',
    palette: { base: '#2c4a22', lid: '#436b30', trim: '#d8c07a', glow: '#8fe06a', ink: '#16280f' },
    decor: ['🌿', '🍃', '🐛', '🌱'],
    keywords: [
      '竹', '藤', '叶', '蘑菇', '仙人掌', '木', '森', '兽', '恐', '蜥', '蛙', '蜗牛',
      '橡果', '树', '草', '虫', '苔',
    ],
    // 丛林里的小生物与水果：关键词抓不到的钦点进来（恐龙角从万圣让过来）
    extra: [
      'hat:bee', 'hat:beehive', 'hat:hedgehog', 'hat:birdCage',
      'hat:pineapple', 'hat:sunflower', 'hat:watermelon', 'hat:crab', 'hat:dinoHorns',
      'skin:monkey', 'mount:dino', 'cape:canopy',
    ],
  },
  {
    id: 'neon',
    name: '霓虹街头',
    emoji: '🕹️',
    tagline: '街机厅后巷的那台机器',
    palette: { base: '#1b1533', lid: '#2a1f4d', trim: '#ff5ec8', glow: '#3ef0d0', ink: '#0d0a1c' },
    decor: ['🕹️', '🎧', '💿', '⚡'],
    keywords: [
      '荧光', '像素', '节拍', '派对', '滑板', '涂鸦', '霓虹', '街', '音', '磁带', '朋克',
      '电子', '迪', '电', '彩', '鼓', '摇', '赛', '灯',
    ],
    // 街机厅周边：耳机、烟花、故障艺术 + 本主题专属三件套
    extra: [
      'hat:headphone', 'effect:firework', 'effect:glitch',
      'skin:neoncat', 'mount:laserbike', 'cape:tapecape',
    ],
  },
  {
    // 宇宙龙域：本期主角是「星渊龙」——皮肤 + 坐骑 + 一整套龙系装扮，
    // 全部 `chest` 专属（只有这个主题的宝箱里出，金币商店 / 碎片兑换都拿不到）
    id: 'cosmo',
    name: '宇宙龙域',
    emoji: '🐉',
    tagline: '龙眠于星渊，钥匙是唯一的船票',
    palette: { base: '#241d45', lid: '#3a2f6b', trim: '#ffd45c', glow: '#9f7bff', ink: '#120e24' },
    decor: ['🐉', '✨', '🪐', '💫'],
    keywords: ['龙', '星渊'],
    extra: [
      'skin:cosmodra',
      'mount:stardrake',
      'hat:drakecrown',
      'aura:dranebula',
      'cape:drakewing',
      'ring:draring',
      'effect:drastar',
      'swingTrail:drabreath',
      // 老龙系：关键词里的「龙」本来会被烈焰熔炉抢先认领，这里钦点回龙域
      'hat:dragonHelm',
      'wings:dragon',
      'cape:dragon',
      'cape:dragonfire',
      'racketSkin:scale',
      'racketSkin:dragonbone',
      'effect:tornado',
    ],
  },
  // ---- 第二批 10 个主题：全部是「纯主题」宝箱 ----------------------------------
  // 每个主题 16 件定制物品（形象 / 坐骑 / 2 头饰 / 2 翅膀 / 2 披风 / 2 光环 /
  // 地环 / 2 球拍皮肤 / 2 拖尾 / 挥拍拖尾），ref 统一带主题码，靠 `refPrefix`
  // 整批认领；物品墙 = 整池 16 件（15~30 格，见 `pure` / `bannerSize`）。
  {
    id: 'des',
    name: '沙漠商队',
    emoji: '🏜️',
    tagline: '驼铃响过的地方，沙里埋着好东西',
    palette: { base: '#a9743a', lid: '#c98f4a', trim: '#ffd45c', glow: '#ffb84a', ink: '#5a3a18' },
    decor: ['🏜️', '🐪', '🌵', '☀️'],
    keywords: [],
    refPrefix: ['des'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'nimb',
    name: '云端空岛',
    emoji: '☁️',
    tagline: '飘在云上的那口箱子',
    palette: { base: '#7fb6e8', lid: '#a8d4f5', trim: '#ffffff', glow: '#cfeaff', ink: '#3a5f80' },
    decor: ['☁️', '🪁', '🕊️', '✨'],
    keywords: [],
    refPrefix: ['nimb'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'conf',
    name: '甜点工坊',
    emoji: '🧁',
    tagline: '打开它，会有点甜',
    palette: { base: '#e88aa8', lid: '#ffb7d5', trim: '#fff0f4', glow: '#ffd0e0', ink: '#8a3a58' },
    decor: ['🧁', '🍰', '🍬', '🍓'],
    keywords: [],
    refPrefix: ['conf'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'bigt',
    name: '马戏团',
    emoji: '🎪',
    tagline: '今晚的压轴，就在这口箱子里',
    palette: { base: '#6a1a4a', lid: '#9a2a6a', trim: '#ffd45c', glow: '#ff8ad4', ink: '#3a0f28' },
    decor: ['🎪', '🎈', '🎩', '🤹'],
    keywords: [],
    refPrefix: ['bigt'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'aegis',
    name: '骑士城堡',
    emoji: '🛡️',
    tagline: '城堡军械库里最里面那一柜',
    palette: { base: '#2a3a5a', lid: '#3f5578', trim: '#c0ccda', glow: '#8fb4de', ink: '#141f33' },
    decor: ['🛡️', '⚔️', '🏰', '🦁'],
    keywords: [],
    refPrefix: ['aegis'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'chan',
    name: '东方茶馆',
    emoji: '🍵',
    tagline: '茶香里泡着的一套',
    palette: { base: '#2f5d3a', lid: '#3f7a4a', trim: '#d8c07a', glow: '#8fd45a', ink: '#16280f' },
    decor: ['🍵', '🏮', '🎋', '🀄'],
    keywords: [],
    refPrefix: ['chan'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'arcan',
    name: '魔法学院',
    emoji: '🔮',
    tagline: '书页间掉出来的一柜',
    palette: { base: '#3a2a6a', lid: '#5540a0', trim: '#ffd45c', glow: '#b46cff', ink: '#1e1440' },
    decor: ['🔮', '📖', '✨', '🪄'],
    keywords: [],
    refPrefix: ['arcan'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'relic',
    name: '化石博物馆',
    emoji: '🦴',
    tagline: '展柜里挖出来的老东西',
    palette: { base: '#5a4a30', lid: '#7a6440', trim: '#d8c8a0', glow: '#ffb02a', ink: '#2e2414' },
    decor: ['🦴', '🦖', '🔍', '🏺'],
    keywords: [],
    refPrefix: ['relic'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'play',
    name: '玩具工坊',
    emoji: '🧸',
    tagline: '木屑味的一整箱玩具',
    palette: { base: '#3a6ea8', lid: '#4a90d9', trim: '#ffc04a', glow: '#ff8a6a', ink: '#1e3a55' },
    decor: ['🧸', '🧩', '🪀', '🎨'],
    keywords: [],
    refPrefix: ['play'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'yuan',
    name: '元宵灯会',
    emoji: '🏮',
    tagline: '灯谜猜对才让开',
    palette: { base: '#a01a2a', lid: '#c0392b', trim: '#ffd45c', glow: '#ff8a6a', ink: '#4a0f18' },
    decor: ['🏮', '🎆', '🥟', '🎏'],
    keywords: [],
    refPrefix: ['yuan'],
    pure: true,
    bannerSize: 16,
  },
  {
    // 🗺️ 山海宝箱：10 只《山海经》怪物皮肤（5★、挂了极低的 `pullWeight`）
    // + 14 件普通山海物品凑数。皮肤 ref 不带 `shan` 前缀，所以用 `extra` 钦点。
    id: 'shan',
    name: '山海宝箱',
    emoji: '🗺️',
    tagline: '翻开山海经，怪物就睡在里面',
    palette: { base: '#1e3a2a', lid: '#2f5a3a', trim: '#ffd45c', glow: '#9fe86a', ink: '#0e1f16' },
    decor: ['🗺️', '🐉', '🏔️', '📜'],
    keywords: [],
    refPrefix: ['shan'],
    extra: [
      'skin:zhuLong', 'skin:xiangLiu', 'skin:qiongQi', 'skin:taoTie', 'skin:taoWu',
      'skin:hunDun', 'skin:jiuweiHu', 'skin:baShe', 'skin:guDiao', 'skin:yuYu',
    ],
    pure: true,
    bannerSize: 24,
  },
  {
    // 兜底：没被任何主题认领的物品都在这里。和高级宝箱共用池子，只是高星少
    id: 'normal',
    name: '普通宝箱',
    emoji: '📦',
    tagline: '没归类的杂货，全在箱子里',
    palette: { base: '#6b5636', lid: '#8a7248', trim: '#d8c49a', glow: '#e8d8a8', ink: '#3a2e1a' },
    decor: ['📦', '🧵', '🕯️', '🔔'],
    keywords: [],
    complement: true,
  },
  {
    // 兜底：池子与普通宝箱相同，但星级结构刻意压高（3★/4★/5★ 占满）
    id: 'premium',
    name: '高级宝箱',
    emoji: '💎',
    tagline: '同一柜杂货，好货的密度不一样',
    palette: { base: '#2c2350', lid: '#41356f', trim: '#ffd45c', glow: '#b98cff', ink: '#171029' },
    decor: ['💎', '✨', '🏆', '💫'],
    keywords: [],
    complement: true,
    tierTarget: PREMIUM_TIER_TARGET,
  },
];

/** 一期 12 件（**纯主题宝箱**用各自的 `bannerSize`，15~30 格，见 `ChestTheme.pure`） */
export const BANNER_SIZE = 12;

/**
 * 一期的星级结构。**五个星级每个至少一件**是关键：
 * 抽奖时星级按 `STAR_WEIGHT` 在"这期出现过的星级"里加权，缺档就会把那一档的权重
 * 摊给其它档（比如一期没有 1★，45% 的权重全压到 2★/3★ 上），概率就飘了。
 * 所以每期都是 `1★×1 / 2★×1 / 3★×4 / 4★×3 / 5★×1`（共 10 件），
 * 缺的档**从大池子里补**（一期最多补 2 件），剩下的两格再从主题里挑，凑满 12 件。
 */
export const BANNER_TIER_TARGET: [number, number][] = [
  [1, 1],
  [2, 1],
  [3, 4],
  [4, 3],
  [5, 1],
];

// ---- 期号与主题 --------------------------------------------------------------

/** 一小时一期：把时间戳映射成「期号」（= 自 Unix 纪元起的小时数） */
export function chestPeriod(now: number = Date.now()): number {
  return Math.floor(now / 3_600_000);
}

/** 这一期什么时候换（毫秒时间戳） */
export function chestPeriodEnd(now: number = Date.now()): number {
  return (chestPeriod(now) + 1) * 3_600_000;
}

/** 期号 → 主题（按顺序轮流，所以同一小时内谁看到的都一样） */
export function chestThemeFor(period: number = chestPeriod()): ChestTheme {
  const n = CHEST_THEMES.length;
  return CHEST_THEMES[((period % n) + n) % n];
}

/** 下一期是哪个主题（面板上"下一期"那行用） */
export function nextChestTheme(period: number = chestPeriod()): ChestTheme {
  return chestThemeFor(period + 1);
}

// ---- 候选池与每期 12 件 ------------------------------------------------------

/**
 * 一件物品唯一归属的主题（或 null = 没被任何主题认领 → 普通宝箱 / 高级宝箱）。
 * 先看 `extra` 钦点（钦点优先级最高，防止关键词抢先把它认领走），
 * 再按 `CHEST_THEMES` 数组顺序做关键词匹配——**先到先得**，保证互斥。
 */
const ownerCache = new Map<string, ChestTheme | null>();

function ownerOf(item: Item): ChestTheme | null {
  const cached = ownerCache.get(item.id);
  if (cached !== undefined) return cached;
  const atmo = CHEST_THEMES.filter((t) => !t.complement);
  let out: ChestTheme | null = null;
  for (const t of atmo) {
    if (t.extra?.includes(item.id)) {
      out = t;
      break;
    }
  }
  if (!out) {
    // 前缀认领（新主题那批定制物品，ref 统一带主题码）。
    // 要求前缀后面紧跟**大写字母**（驼峰边界），这样 `conf` 只认领 `confSpirit`
    // 这类，不会把老物品 `confetti`（撒花特效）也卷进来。
    for (const t of atmo) {
      if (
        t.refPrefix?.some(
          (p) => item.ref.startsWith(p) && /[A-Z]/.test(item.ref.charAt(p.length)),
        )
      ) {
        out = t;
        break;
      }
    }
  }
  if (!out) {
    for (const t of atmo) {
      if (t.exclude?.some((w) => item.label.includes(w))) continue;
      if (t.keywords.some((k) => item.label.includes(k))) {
        out = t;
        break;
      }
    }
  }
  ownerCache.set(item.id, out);
  return out;
}

/**
 * 一件物品归属的**宝箱主题**（背包按「主题」筛选用），没归属就是 `null`。
 *
 * 只有**宝箱池里**的物品（`gacha` / `chest`）才有主题：活动限定、兑换码、荣誉柜台、
 * 金币商店专属、碎片兑换、跑量特训那些**不进任何宝箱池**，一律返回 `null`
 * ——在背包里归成「无主题」，不然「外星人」会被关键词「星」误判进星海漫游。
 */
export function themeOf(item: Item): ChestTheme | null {
  if (item.source !== 'gacha' && item.source !== 'chest') return null;
  return ownerOf(item);
}

const poolCache = new Map<string, Item[]>();

/**
 * 某个类别的候选池。
 * - 气氛主题：认领了它的物品（**每件只属于一个主题**，不会跨主题重复出现）；
 * - 普通宝箱 / 高级宝箱（complement）：没人认领的那些物品（两个类别同一池子）。
 */
export function themePool(theme: ChestTheme): Item[] {
  const cached = poolCache.get(theme.id);
  if (cached) return cached;
  const out = theme.complement
    ? GACHA_POOL.filter((i) => ownerOf(i) === null)
    : GACHA_POOL.filter((i) => ownerOf(i) === theme);
  poolCache.set(theme.id, out);
  return out;
}

/** 没被任何主题认领的物品（普通 / 高级宝箱的池子；bannerItems 补位时也用它，避免串进别的主题） */
export function unassignedPool(): Item[] {
  return themePool(CHEST_THEMES.find((t) => t.complement)!);
}

/** 一个确定性的小随机数发生器（同一期号 → 同一串结果） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Fisher–Yates，用给定 rng 洗一份副本 */
function shuffled<T>(list: readonly T[], rng: () => number): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * 这一期的 12 件。规则：
 * ① 按**这个类别自己的**星级结构（`theme.tierTarget`，缺省 `BANNER_TIER_TARGET`）
 *    每档取够件数（同档里尽量**换部位**，别一墙全是帽子）；
 * ② 某个星级池子里一件都没有：先从「未归类池」补一件，再从大池子兜底，
 *    保证五个星级都在 → 概率稳定；
 * ③ 还剩的格子用主题里剩下的补，最后才用未归类池 / 大池子兜底（绝不让某一期空着）。
 *    补位**只从本主题池 + 未归类池**拿，所以一件物品不会借补位溜进别的主题。
 */
export function bannerItems(theme: ChestTheme, period: number = chestPeriod()): Item[] {
  const pool = themePool(theme);
  if (theme.pure) {
    // 纯主题宝箱：整池（16 件定制物品）上墙，不做星级结构 / 补位，
    // 所以墙上绝不会混进别的主题或大池子里的东西。
    const size = theme.bannerSize ?? pool.length;
    const byStar = new Map<number, Item[]>();
    for (const it of pool) {
      const g = byStar.get(it.stars);
      if (g) g.push(it);
      else byStar.set(it.stars, [it]);
    }
    const order = [...byStar.keys()].sort((a, b) => a - b);
    const out: Item[] = [];
    for (const it of pool) if (out.length < size && pool.length <= size) out.push(it);
    if (pool.length > size) {
      let more = true;
      while (out.length < size && more) {
        more = false;
        for (const s of order) {
          const g = byStar.get(s)!;
          if (g.length) {
            out.push(g.shift()!);
            more = true;
            if (out.length >= size) break;
          }
        }
      }
    }
    return out.sort((a, b) => a.stars - b.stars || a.slot.localeCompare(b.slot));
  }

  const rng = mulberry32(hashStr(theme.id) ^ Math.imul(period, 2654435761));
  const spare = theme.complement ? pool : unassignedPool();
  const out: Item[] = [];
  const used = new Set<string>();
  const slots = new Set<string>();

  /** 从 candidates 里取 n 件：优先没出现过的部位 */
  const take = (candidates: Item[], n: number): number => {
    const list = shuffled(candidates, rng);
    let got = 0;
    for (const it of list) {
      if (got >= n) break;
      if (used.has(it.id)) continue;
      if (slots.has(it.slot)) continue;
      out.push(it);
      used.add(it.id);
      slots.add(it.slot);
      got++;
    }
    // 部位都占过了还得凑，就放宽部位限制
    for (const it of list) {
      if (got >= n) break;
      if (used.has(it.id)) continue;
      out.push(it);
      used.add(it.id);
      got++;
    }
    return got;
  };

  for (const [star, n] of theme.tierTarget ?? BANNER_TIER_TARGET) {
    if (n <= 0 || out.length >= BANNER_SIZE) continue;
    const got = take(
      pool.filter((i) => i.stars === star),
      Math.min(n, BANNER_SIZE - out.length),
    );
    // ② 这个星级池子里一件都没有：从未归类池补一件，别让这个星级整档消失
    if (got === 0) {
      if (take(spare.filter((i) => i.stars === star), 1) === 0) {
        take(GACHA_POOL.filter((i) => i.stars === star), 1);
      }
    }
  }
  // ③ 还差就用主题里剩下的补，再未归类池，最后才用大池子兜底
  if (out.length < BANNER_SIZE) take(pool, BANNER_SIZE - out.length);
  if (out.length < BANNER_SIZE) take(spare, BANNER_SIZE - out.length);
  if (out.length < BANNER_SIZE) take(GACHA_POOL, BANNER_SIZE - out.length);

  // 展示顺序：星级从低到高（跟右侧物品墙的排布一致，好对照）
  return out.sort((a, b) => a.stars - b.stars || a.slot.localeCompare(b.slot));
}

/** 这期池子里的星级构成（面板"本期高星 N 件"用） */
export function bannerTierCount(banner: Item[], minStars = 4): number {
  return banner.filter((i) => i.stars >= minStars).length;
}

/**
 * 这个主题物品墙的**格数**：纯主题宝箱 = `bannerSize`（15~30，默认池子大小），
 * 其余 = 通用 `BANNER_SIZE`。面板顶部那行「共 N 格」用它。
 */
export function bannerSizeOf(theme: ChestTheme): number {
  if (theme.bannerSize) return theme.bannerSize;
  if (theme.pure) return themePool(theme).length;
  return BANNER_SIZE;
}

// ---- 开箱的类别概率 ----------------------------------------------------------

const NORMAL_THEME = CHEST_THEMES.find((t) => t.id === 'normal')!;
const PREMIUM_THEME = CHEST_THEMES.find((t) => t.id === 'premium')!;

/**
 * 每开一次箱**先摇类别**（不再是"这一小时只出这一期"）：
 * **普通宝箱概率最高**、**主题宝箱次高**（= 面板上这一期展示的那个主题）、
 * **高级宝箱最低**。摇到哪一类就在那一类的候选池里抽。
 */
export const CHEST_ODDS = { normal: 0.5, theme: 0.35, premium: 0.15 } as const;

/** 这一期展示的主题（面板右侧那面墙就是它） */
export function currentChestTheme(now: number = Date.now()): ChestTheme {
  return chestThemeFor(chestPeriod(now));
}

/**
 * 摇一次类别并返回这一类的候选池：
 * - 普通宝箱：`CHEST_ODDS.normal`
 * - 高级宝箱：`CHEST_ODDS.premium`
 * - 其余落到**本期主题宝箱**（`currentChestTheme()`，用当期种子定住的池子）
 */
export function pickChestPool(now: number = Date.now()): Item[] {
  const r = Math.random();
  if (r < CHEST_ODDS.normal) return themePool(NORMAL_THEME);
  if (r < CHEST_ODDS.normal + CHEST_ODDS.premium) return themePool(PREMIUM_THEME);
  const theme = currentChestTheme(now);
  return bannerItems(theme, chestPeriod(now));
}

/**
 * 抽奖时一件物品的权重 = 它那一档的全局权重 ÷ 同档件数（同档内等概率）；
 * 挂了 `pullWeight` 的（山海宝箱的怪物皮肤）**直接用它**，不看星级。
 * 与 `stores/progress.ts` 的 `rollFrom` 同一套口径。
 */
export function bannerWeight(item: Item, banner: Item[]): number {
  if (item.pullWeight !== undefined) return item.pullWeight;
  const same = banner.filter((i) => i.stars === item.stars).length || 1;
  return (STAR_WEIGHT[item.stars] ?? 1) / same;
}
