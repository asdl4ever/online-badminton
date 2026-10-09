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
 * 53 个类别：**51 个气氛主题** + **普通宝箱** + **高级宝箱**
 * （前 11 个是早期主题；后 40 个是 `pure` 的纯主题宝箱——
 *   第二批 10 个 + 🗺️ 山海宝箱 + 第三批 10 个 + 第四批 20 个）。
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
    extra: ['hat:snorkel', 'effect:foam', 'skin:angler', 'mount:dolphin', 'back:seamist'],
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
    extra: ['skin:mummy', 'mount:pumpkincart', 'back:batcape'],
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
      'skin:windup', 'mount:gearbike', 'back:slagcape',
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
    extra: ['skin:guard', 'mount:lion', 'back:ermine'],
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
    extra: ['skin:sakurabun', 'mount:kite', 'back:petalveil'],
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
    extra: ['skin:starlet', 'mount:crescent', 'back:starmap'],
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
    extra: ['skin:emberling', 'mount:firewheel', 'back:cinder'],
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
      'skin:monkey', 'mount:dino', 'back:canopy',
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
      'skin:neoncat', 'mount:laserbike', 'back:tapecape',
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
      'back:drakewing',
      'ring:draring',
      'effect:drastar',
      'swingTrail:drabreath',
      // 老龙系：关键词里的「龙」本来会被烈焰熔炉抢先认领，这里钦点回龙域
      'hat:dragonHelm',
      'back:dragon',
      'back:dragonCape',
      'back:dragonfire',
      'racketSkin:scale',
      'racketSkin:dragonbone',
      'effect:tornado',
    ],
  },
  // ---- 第二批 10 个主题：全部是「纯主题」宝箱 ----------------------------------
  // 每个主题 16 件定制物品（形象 / 坐骑 / 2 头饰 / 4 背部装饰（翅膀·披风）/ 2 背景 /
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
  // ---- 第三批 10 个主题：同样全部是「纯主题」宝箱 -----------------------------
  // 每个主题 16 件定制物品（ref 统一带主题码，靠 refPrefix 整批认领，
  // 绘制规格在 game/draw/themeart2.ts）。
  {
    id: 'pirate',
    name: '海盗港湾',
    emoji: '🏴‍☠️',
    tagline: '船长的私藏，一箱一箱往岸上搬',
    palette: { base: '#24424e', lid: '#35606c', trim: '#e8c86a', glow: '#5fd0c0', ink: '#102029' },
    decor: ['🏴‍☠️', '⚓', '🦜', '🗺️'],
    keywords: [],
    refPrefix: ['pirate'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'steam',
    name: '蒸汽朋克',
    emoji: '⚙️',
    tagline: '拧开这口箱子，会先冒一股白汽',
    palette: { base: '#4a3a2a', lid: '#6a5236', trim: '#d8a24a', glow: '#8fd8ff', ink: '#241a10' },
    decor: ['⚙️', '🎩', '🔧', '💨'],
    keywords: [],
    refPrefix: ['steam'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'astro',
    name: '星际宇航',
    emoji: '🚀',
    tagline: '从近地轨道运下来的补给',
    palette: { base: '#1e2a4a', lid: '#2f4570', trim: '#ffb03a', glow: '#9fd8ff', ink: '#0e1730' },
    decor: ['🚀', '🛰️', '🌠', '🧑‍🚀'],
    keywords: [],
    refPrefix: ['astro'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'jura',
    name: '侏罗纪',
    emoji: '🦖',
    tagline: '箱子上还留着爪印',
    palette: { base: '#24401f', lid: '#395f2a', trim: '#e8d07a', glow: '#9fe86a', ink: '#0f2210' },
    decor: ['🦖', '🌿', '🥚', '🌋'],
    keywords: [],
    refPrefix: ['jura'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'mush',
    name: '蘑菇森林',
    emoji: '🍄',
    tagline: '踩着菌圈来的那箱',
    palette: { base: '#4a2a4a', lid: '#6a3a5a', trim: '#ffb7d5', glow: '#a8ff7a', ink: '#2a1226' },
    decor: ['🍄', '🍂', '✨', '🐛'],
    keywords: [],
    refPrefix: ['mush'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'tropic',
    name: '热带珊瑚',
    emoji: '🐠',
    tagline: '从珊瑚礁缝里捞上来的',
    palette: { base: '#0e5a6a', lid: '#12808f', trim: '#ffb7a0', glow: '#5fe8d0', ink: '#06323c' },
    decor: ['🐠', '🪸', '🐚', '🫧'],
    keywords: [],
    refPrefix: ['tropic'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'crypt',
    name: '地牢探险',
    emoji: '🗝️',
    tagline: '第三层锁着的那口箱子',
    palette: { base: '#33363a', lid: '#4a4e54', trim: '#e8a24a', glow: '#9fd8a0', ink: '#1a1c1f' },
    decor: ['🗝️', '💀', '🕯️', '⛓️'],
    keywords: [],
    refPrefix: ['crypt'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'festiv',
    name: '圣诞雪夜',
    emoji: '🎄',
    tagline: '壁炉边塞在长袜里的',
    palette: { base: '#1e4a2f', lid: '#2c6a44', trim: '#ffd45c', glow: '#ff6a6a', ink: '#0e2418' },
    decor: ['🎄', '🎁', '❄️', '🔔'],
    keywords: [],
    refPrefix: ['festiv'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'sushi',
    name: '和风料亭',
    emoji: '🍣',
    tagline: '板前的师傅只留了最顺手的一套',
    palette: { base: '#2a2a30', lid: '#3a3a44', trim: '#e8404a', glow: '#fff0d0', ink: '#141418' },
    decor: ['🍣', '🏮', '🐟', '🍵'],
    keywords: [],
    refPrefix: ['sushi'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'wild',
    name: '西部荒野',
    emoji: '🤠',
    tagline: '火车站寄存处，没人来取的那箱',
    palette: { base: '#8a6a3a', lid: '#a8834a', trim: '#ffd45c', glow: '#ff9a4a', ink: '#462f14' },
    decor: ['🤠', '🌵', '🐎', '⭐'],
    keywords: [],
    refPrefix: ['wild'],
    pure: true,
    bannerSize: 16,
  },
  // ---- 第四批 20 个主题：同样全部是「纯主题」宝箱 -----------------------------
  // 每个主题 16 件定制物品（ref 统一带主题码，靠 refPrefix 整批认领，
  // 绘制规格在 game/draw/themeart3.ts）。
  {
    id: 'vulc',
    name: '熔岩核心',
    emoji: '🌋',
    tagline: '这口箱子摸上去是烫的',
    palette: { base: '#4a1408', lid: '#7a2410', trim: '#ffb347', glow: '#ff5a1a', ink: '#2a0c05' },
    decor: ['🌋', '🔥', '🪨', '💥'],
    keywords: [],
    refPrefix: ['vulc'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'trench',
    name: '深渊海沟',
    emoji: '🌊',
    tagline: '一万米之下压箱底的东西',
    palette: { base: '#062a3a', lid: '#0d4258', trim: '#7fe3d8', glow: '#35c9d8', ink: '#03202c' },
    decor: ['🌊', '🐙', '🫧', '🌑'],
    keywords: [],
    refPrefix: ['trench'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'dojo',
    name: '道场精神',
    emoji: '🥋',
    tagline: '进门先鞠躬，开箱先扎马',
    palette: { base: '#2a2f4a', lid: '#3d4568', trim: '#e8404a', glow: '#ffb7a0', ink: '#161a2c' },
    decor: ['🥋', '🎋', '⛩️', '👊'],
    keywords: [],
    refPrefix: ['dojo'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'inkw',
    name: '水墨江南',
    emoji: '🖌️',
    tagline: '一笔泼进箱子里，晕开了',
    palette: { base: '#3a4048', lid: '#55606a', trim: '#f0ead8', glow: '#9fd8c8', ink: '#22262c' },
    decor: ['🖌️', '🎋', '🏔️', '🪶'],
    keywords: [],
    refPrefix: ['inkw'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'fairy',
    name: '精灵花园',
    emoji: '🦋',
    tagline: '别惊动花丛里打盹的那位',
    palette: { base: '#3f6a4a', lid: '#588a62', trim: '#ffd0e2', glow: '#a8ff9a', ink: '#24402c' },
    decor: ['🦋', '🌸', '🍄', '✨'],
    keywords: [],
    refPrefix: ['fairy'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'racer',
    name: '极速竞逐',
    emoji: '🏁',
    tagline: '检录处没人认领的那箱装备',
    palette: { base: '#1e222a', lid: '#2f3642', trim: '#e8404a', glow: '#ffd45c', ink: '#101318' },
    decor: ['🏁', '🏎️', '⚡', '🛞'],
    keywords: [],
    refPrefix: ['racer'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'vamp',
    name: '吸血鬼城堡',
    emoji: '🦇',
    tagline: '只在午夜之后才上锁的一柜',
    palette: { base: '#2a1230', lid: '#431a4a', trim: '#e8404a', glow: '#b455d6', ink: '#180a1e' },
    decor: ['🦇', '🕯️', '🍷', '🌙'],
    keywords: [],
    refPrefix: ['vamp'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'autumn',
    name: '秋日枫林',
    emoji: '🍁',
    tagline: '落满一箱红叶，先扫后开',
    palette: { base: '#6a3a1a', lid: '#8a5226', trim: '#ffd45c', glow: '#ff9a3c', ink: '#3a1e0c' },
    decor: ['🍁', '🍂', '🌾', '🌰'],
    keywords: [],
    refPrefix: ['autumn'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'panda',
    name: '竹林熊猫',
    emoji: '🐼',
    tagline: '熊猫啃剩的竹子也编进了箱板',
    palette: { base: '#2f4a2a', lid: '#436b3a', trim: '#f0f4e8', glow: '#9fe86a', ink: '#1a2c16' },
    decor: ['🐼', '🎋', '🍃', '🍙'],
    keywords: [],
    refPrefix: ['panda'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'joker',
    name: '纸牌王国',
    emoji: '🃏',
    tagline: '赢了王才配开，输了洗牌重来',
    palette: { base: '#1e222e', lid: '#2f3546', trim: '#e8404a', glow: '#ffd45c', ink: '#10131c' },
    decor: ['🃏', '♠️', '♥️', '🎩'],
    keywords: [],
    refPrefix: ['joker'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'pagod',
    name: '古都风华',
    emoji: '🏯',
    tagline: '宫墙里递出来的那一箱',
    palette: { base: '#6a2018', lid: '#8a2e20', trim: '#ffd45c', glow: '#ff8a5c', ink: '#3a120c' },
    decor: ['🏯', '🏮', '🎎', '⛩️'],
    keywords: [],
    refPrefix: ['pagod'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'storm',
    name: '风暴之眼',
    emoji: '🌪️',
    tagline: '箱子是风停之后捡回来的',
    palette: { base: '#2a3440', lid: '#3d4c5c', trim: '#bfe8ff', glow: '#7fd4ff', ink: '#16202a' },
    decor: ['🌪️', '⚡', '☁️', '🌊'],
    keywords: [],
    refPrefix: ['storm'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'lunar',
    name: '月宫玉兔',
    emoji: '🐇',
    tagline: '广寒宫的快递，走的是月光',
    palette: { base: '#2a3350', lid: '#3d4a72', trim: '#e8f0ff', glow: '#9fd8ff', ink: '#161d30' },
    decor: ['🐇', '🌕', '🥮', '🌫️'],
    keywords: [],
    refPrefix: ['lunar'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'viking',
    name: '维京战船',
    emoji: '⚔️',
    tagline: '掠夺清单的最后一行',
    palette: { base: '#3a4450', lid: '#525f6e', trim: '#d8e0e8', glow: '#8fb4de', ink: '#202832' },
    decor: ['⚔️', '🛡️', '⛵', '🐺'],
    keywords: [],
    refPrefix: ['viking'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'safari',
    name: '草原巡礼',
    emoji: '🦁',
    tagline: '营地帐子里塞得最满的一箱',
    palette: { base: '#7a5a2a', lid: '#98763a', trim: '#ffd45c', glow: '#ffb84a', ink: '#3a2a12' },
    decor: ['🦁', '🐘', '🌾', '🌅'],
    keywords: [],
    refPrefix: ['safari'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'theat',
    name: '戏剧后台',
    emoji: '🎭',
    tagline: '谢幕之后才准打开',
    palette: { base: '#4a1a2a', lid: '#6a2438', trim: '#ffd45c', glow: '#ff8ad4', ink: '#2a0e18' },
    decor: ['🎭', '🎬', '🎤', '✨'],
    keywords: [],
    refPrefix: ['theat'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'borea',
    name: '极光夜境',
    emoji: '🌠',
    tagline: '极光落进箱子里还没熄',
    palette: { base: '#16283a', lid: '#24405c', trim: '#7dffc4', glow: '#9ad4ff', ink: '#0c1824' },
    decor: ['🌠', '❄️', '🏔️', '🦌'],
    keywords: [],
    refPrefix: ['borea'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'venic',
    name: '水城泛舟',
    emoji: '🛶',
    tagline: '从运河里捞上来的，还滴着水',
    palette: { base: '#1a4a58', lid: '#26667a', trim: '#ffd8a0', glow: '#5fe8d0', ink: '#0e2e38' },
    decor: ['🛶', '🌉', '🕊️', '🎻'],
    keywords: [],
    refPrefix: ['venic'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'olymp',
    name: '古希腊',
    emoji: '🏛️',
    tagline: '神殿供桌上多出来的一箱',
    palette: { base: '#4a5a78', lid: '#6a7a9a', trim: '#f0ead8', glow: '#ffd45c', ink: '#2a3450' },
    decor: ['🏛️', '🏟️', '🫒', '⚡'],
    keywords: [],
    refPrefix: ['olymp'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'samba',
    name: '桑巴狂欢',
    emoji: '🥁',
    tagline: '游行队伍走过，掉下了这箱',
    palette: { base: '#1a5a3a', lid: '#268a52', trim: '#ffd45c', glow: '#ff8ad4', ink: '#0e3a24' },
    decor: ['🥁', '🎉', '🪩', '🎺'],
    keywords: [],
    refPrefix: ['samba'],
    pure: true,
    bannerSize: 16,
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

  // ---- 新批次：上古神话 / 重装机甲 -------------------------------------------
  {
    id: 'shenhua',
    name: '上古神话',
    emoji: '🐲',
    tagline: '开天辟地那会儿的东西，都在这里',
    palette: { base: '#7a4a1a', lid: '#a86a2a', trim: '#ffd45c', glow: '#ffe08a', ink: '#3a2208' },
    decor: ['🐲', '⛰️', '☁️', '🔥'],
    keywords: [],
    refPrefix: ['shn'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'mecha',
    name: '重装机甲',
    emoji: '🤖',
    tagline: '启动引擎，装填完毕',
    palette: { base: '#22303e', lid: '#3a4f62', trim: '#5ac8ff', glow: '#8fe0ff', ink: '#0e1620' },
    decor: ['🤖', '⚙️', '🛰️', '⚡'],
    keywords: [],
    refPrefix: ['mca'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'otm',
    name: '光之巨人',
    emoji: '🦸',
    tagline: '银色巨人从光里走出来，眼睛会发光',
    palette: { base: '#3a4656', lid: '#55647a', trim: '#e8f0f8', glow: '#ff4a5c', ink: '#1a222c' },
    decor: ['🦸', '⚡', '🔴', '✨'],
    keywords: [],
    refPrefix: ['otm'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'kaiju',
    name: '怪兽之王',
    emoji: '🦖',
    tagline: '听，海面下有脚步声',
    palette: { base: '#1e2a20', lid: '#2f4032', trim: '#7de87d', glow: '#5ac8ff', ink: '#101810' },
    decor: ['🦖', '🌊', '☢️', '🐾'],
    keywords: [],
    refPrefix: ['kju'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'xiyou',
    name: '西游降魔',
    emoji: '🐵',
    tagline: '五百年前压在山下的那箱',
    palette: { base: '#3a2a1a', lid: '#5a422a', trim: '#ffd45c', glow: '#ff9a3c', ink: '#241a0c' },
    decor: ['🐵', '🌀', '⛰️', '🍑'],
    keywords: [],
    refPrefix: ['xy'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'sanguo',
    name: '三国烽火',
    emoji: '⚔️',
    tagline: '赤壁的东风把它吹到了这里',
    palette: { base: '#2a222a', lid: '#42343c', trim: '#e8404a', glow: '#ffd45c', ink: '#160f14' },
    decor: ['⚔️', '🐎', '🔥', '🛡️'],
    keywords: [],
    refPrefix: ['sgm'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'wuxia',
    name: '武侠江湖',
    emoji: '🗡️',
    tagline: '客栈二楼临窗的那箱，压着一柄剑',
    palette: { base: '#26262c', lid: '#3a3a42', trim: '#e8e0d0', glow: '#ffd45c', ink: '#141418' },
    decor: ['🗡️', '🍶', '🌙', '🌾'],
    keywords: [],
    refPrefix: ['wx'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'norse',
    name: '北欧神域',
    emoji: '⚡',
    tagline: '彩虹桥尽头递来的那箱，还冒着电',
    palette: { base: '#2a3440', lid: '#3d4c5c', trim: '#bfe8ff', glow: '#7fd4ff', ink: '#16202a' },
    decor: ['⚡', '🛡️', '🐺', '❄️'],
    keywords: [],
    refPrefix: ['norse'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'pharaoh',
    name: '法老秘葬',
    emoji: '🏺',
    tagline: '沙暴过后，金字塔脚下多出的那箱',
    palette: { base: '#6a5220', lid: '#8a7430', trim: '#ffd45c', glow: '#3a5a8a', ink: '#2a2010' },
    decor: ['🏺', '🐍', '⛏️', '💎'],
    keywords: [],
    refPrefix: ['eg'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'shinobi',
    name: '暗部忍道',
    emoji: '🥷',
    tagline: '你看见这箱的时候，它已经等你很久了',
    palette: { base: '#14141c', lid: '#24242e', trim: '#c0392b', glow: '#b08ad0', ink: '#0c0c12' },
    decor: ['🥷', '🌀', '💫', '🌫️'],
    keywords: [],
    refPrefix: ['nja'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'cyber',
    name: '赛博都市',
    emoji: '🌃',
    tagline: '霓虹淹到脚踝的那条街在卖这个',
    palette: { base: '#141824', lid: '#232a3c', trim: '#ff3bd4', glow: '#39ffd0', ink: '#0a0e18' },
    decor: ['🌃', '💾', '⚡', '🔧'],
    keywords: [],
    refPrefix: ['cyb'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'dragpalace',
    name: '东海龙宫',
    emoji: '🐉',
    tagline: '退潮之后才找得到入口的当铺',
    palette: { base: '#0e2a3a', lid: '#1a4054', trim: '#7fd4ff', glow: '#5affd0', ink: '#081820' },
    decor: ['🐉', '🐟', '💎', '🫧'],
    keywords: [],
    refPrefix: ['dg'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'chrono',
    name: '时空旅行',
    emoji: '⏳',
    tagline: '这箱昨天就到了，也可能是明天',
    palette: { base: '#1a1428', lid: '#2a2040', trim: '#9b5cff', glow: '#5ac8ff', ink: '#100c1a' },
    decor: ['⏳', '🌌', '⚙️', '🪐'],
    keywords: [],
    refPrefix: ['chrono'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'dunhuang',
    name: '敦煌飞天',
    emoji: '🪔',
    tagline: '壁画上的仙女把箱子带下来了',
    palette: { base: '#5a2a1a', lid: '#7a4224', trim: '#ffd45c', glow: '#ff9adf', ink: '#33180c' },
    decor: ['🪔', '🌬️', '🎗️', '🏔️'],
    keywords: [],
    refPrefix: ['dun'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'quetal',
    name: '羽蛇神殿',
    emoji: '🐍',
    tagline: '丛林深处的石阶尽头，箱子自己会发光',
    palette: { base: '#1e3a2e', lid: '#2f5a44', trim: '#ffd45c', glow: '#3ad49a', ink: '#0e2418' },
    decor: ['🐍', '🌿', '💎', '☀️'],
    keywords: [],
    refPrefix: ['azt'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'heaven',
    name: '圣辉天界',
    emoji: '😇',
    tagline: '云层上面批发的那些货，都是免税的',
    palette: { base: '#3a3a52', lid: '#54547a', trim: '#fff6d8', glow: '#ffd45c', ink: '#22222e' },
    decor: ['😇', '☁️', '✨', '🔔'],
    keywords: [],
    refPrefix: ['ang'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'fairytale',
    name: '童话王国',
    emoji: '🏰',
    tagline: '翻开书第三页就能走进去的那箱',
    palette: { base: '#3a2a4a', lid: '#54406a', trim: '#ffd45c', glow: '#ff9adf', ink: '#221830' },
    decor: ['🏰', '👑', '🦄', '🍭'],
    keywords: [],
    refPrefix: ['tale'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'diner',
    name: '深夜食堂',
    emoji: '🍜',
    tagline: '凌晨两点开门，只做熟客生意',
    palette: { base: '#26201a', lid: '#3a3228', trim: '#ffd45c', glow: '#ff9a3c', ink: '#161008' },
    decor: ['🍜', '🏮', '🍳', '🍙'],
    keywords: [],
    refPrefix: ['din'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'catcafe',
    name: '猫咖物语',
    emoji: '🐱',
    tagline: '店里真正的老板在打盹，别吵醒它',
    palette: { base: '#2e2620', lid: '#463a2e', trim: '#ffd8a8', glow: '#ffb070', ink: '#1a1410' },
    decor: ['🐱', '🐟', '🧶', '☕'],
    keywords: [],
    refPrefix: ['cat'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'esports',
    name: '电竞赛场',
    emoji: '🎮',
    tagline: '五杀，属于今天的你',
    palette: { base: '#101820', lid: '#1a2a3a', trim: '#00e5ff', glow: '#ff2e88', ink: '#0a0e14' },
    decor: ['🎮', '🏆', '⚡', '💜'],
    keywords: [],
    refPrefix: ['esport'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'wasteland',
    name: '末日废土',
    emoji: '☢️',
    tagline: '在废墟里，种一朵花',
    palette: { base: '#2a241a', lid: '#3a3226', trim: '#8a7a5a', glow: '#ff8a3c', ink: '#1a1610' },
    decor: ['☢️', '🛢️', '🔧', '🌵'],
    keywords: [],
    refPrefix: ['waste'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'idol',
    name: '星光偶像',
    emoji: '🎤',
    tagline: '安可声里从台上传下来的那一束追光',
    palette: { base: '#2a1e30', lid: '#40304a', trim: '#ff9adf', glow: '#ffd45c', ink: '#1a1222' },
    decor: ['🎤', '⭐', '💙', '🎫'],
    keywords: [],
    refPrefix: ['idol'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'slime',
    name: '软泥秘境',
    emoji: '🫧',
    tagline: 'duang～duang～duang',
    palette: { base: '#1e3a2a', lid: '#2a5a3a', trim: '#7de87d', glow: '#d0ff9a', ink: '#0f2418' },
    decor: ['🫧', '🟢', '💧', '✨'],
    keywords: [],
    refPrefix: ['slime'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'nekog',
    name: '妖猫夜行',
    emoji: '🐈‍⬛',
    tagline: '百鬼夜行，猫先行',
    palette: { base: '#1a1626', lid: '#2c2440', trim: '#b08aff', glow: '#ffd45c', ink: '#120e1c' },
    decor: ['🐈‍⬛', '🌙', '🔮', '✨'],
    keywords: [],
    refPrefix: ['nek'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'beetle',
    name: '甲虫王朝',
    emoji: '🪲',
    tagline: '鞘翅之下，皆是王朝',
    palette: { base: '#22200f', lid: '#3a3618', trim: '#c8a832', glow: '#7dff5a', ink: '#141208' },
    decor: ['🪲', '🌿', '⛏️', '✨'],
    keywords: [],
    refPrefix: ['btl'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'transform',
    name: '变形机甲',
    emoji: '🤖',
    tagline: '咔咔咔——变形完毕',
    palette: { base: '#101828', lid: '#1c2a40', trim: '#5ac8ff', glow: '#ff8a2a', ink: '#080c16' },
    decor: ['🤖', '⚙️', '🔧', '⚡'],
    keywords: [],
    refPrefix: ['tf'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'spiderweb',
    name: '蛛网游侠',
    emoji: '🕷️',
    tagline: '能力越大，责任越大',
    palette: { base: '#1a1420', lid: '#2c2038', trim: '#ff4a5a', glow: '#8ae0ff', ink: '#100a18' },
    decor: ['🕷️', '🕸️', '🏙️', '🦸'],
    keywords: [],
    refPrefix: ['spd'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'steelbeast',
    name: '钢铁巨兽',
    emoji: '🦾',
    tagline: '熔炉轰鸣，大地颤抖',
    palette: { base: '#1c1a16', lid: '#302c26', trim: '#ff6a2a', glow: '#ffd45c', ink: '#100e0a' },
    decor: ['🦾', '🔩', '🔥', '🦿'],
    keywords: [],
    refPrefix: ['bst'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'loch',
    name: '尼斯湖水怪',
    emoji: '🦕',
    tagline: '湖面下那截长脖子，终于露了出来',
    palette: { base: '#123c3a', lid: '#1c5a4e', trim: '#8fe8c8', glow: '#35d8a8', ink: '#08211e' },
    decor: ['🌊', '🦕', '🫧', '🏴'],
    keywords: [],
    refPrefix: ['loch'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'boonie',
    name: '熊出没·森林',
    emoji: '🐻',
    tagline: '光头强的电锯又响了，快跑',
    palette: { base: '#2e4a2a', lid: '#3f6136', trim: '#ffcf5c', glow: '#8fe06a', ink: '#182c16' },
    decor: ['🐻', '🌲', '🪓', '🍯'],
    keywords: [],
    refPrefix: ['boon'],
    pure: true,
    bannerSize: 18,
  },
  {
    id: 'bigfoot',
    name: '雪山谜踪',
    emoji: '🦶',
    tagline: '雪地上那串巨大的脚印，是谁留下的',
    palette: { base: '#2a3a52', lid: '#3a506e', trim: '#e0f2ff', glow: '#8fd8ff', ink: '#16202e' },
    decor: ['🦶', '❄️', '🏔️', '🐾'],
    keywords: [],
    refPrefix: ['bigf'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'nian',
    name: '年兽迎春',
    emoji: '🧧',
    tagline: '爆竹一响，年兽退散，红包拿来',
    palette: { base: '#8a1a1a', lid: '#b02a2a', trim: '#ffd45c', glow: '#ff8a3c', ink: '#3a0a0a' },
    decor: ['🧧', '🧨', '🐉', '🏮'],
    keywords: [],
    refPrefix: ['nian'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'wolf',
    name: '月夜狼族',
    emoji: '🐺',
    tagline: '血月升起，狼王在嚎叫',
    palette: { base: '#161628', lid: '#252540', trim: '#b8c4d8', glow: '#ff3a4a', ink: '#0a0a16' },
    decor: ['🐺', '🌕', '🌲', '🩸'],
    keywords: [],
    refPrefix: ['wolf'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'zomb',
    name: '末日丧尸',
    emoji: '🧟',
    tagline: '警报响过三次之后，街上就没人了',
    palette: { base: '#28301e', lid: '#3a442c', trim: '#9aae7a', glow: '#7dff3a', ink: '#141a10' },
    decor: ['🧟', '☣️', '🩸', '🏚️'],
    keywords: [],
    refPrefix: ['zomb'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'toil',
    name: '大便人厕所',
    emoji: '🚽',
    tagline: '冲水键一按，世界都清净了',
    palette: { base: '#5a4636', lid: '#7a6248', trim: '#f0e8d8', glow: '#8fe0c0', ink: '#2e2418' },
    decor: ['🚽', '💩', '🧻', '🪠'],
    keywords: [],
    refPrefix: ['toil'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'ghid',
    name: '三头龙·基多拉',
    emoji: '🐲',
    tagline: '云层撕开，三个头一起咆哮',
    palette: { base: '#4a3a10', lid: '#6a5418', trim: '#ffe15c', glow: '#7fd4ff', ink: '#241a06' },
    decor: ['🐲', '⚡', '🌩️', '👁️'],
    keywords: [],
    refPrefix: ['ghid'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'mothra',
    name: '巨蛾·魔斯拉',
    emoji: '🦋',
    tagline: '翅膀张开，把月亮也遮住了',
    palette: { base: '#3a4a2a', lid: '#556a3a', trim: '#ffe66a', glow: '#bfe8ff', ink: '#1e2814' },
    decor: ['🦋', '✨', '🌫️', '🌙'],
    keywords: [],
    refPrefix: ['mthr'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'sentai',
    name: '特摄机甲战队',
    emoji: '🤖',
    tagline: '五机合体，必杀技准备中',
    palette: { base: '#2a3244', lid: '#3f4a62', trim: '#ff4a4a', glow: '#5ac8ff', ink: '#141a26' },
    decor: ['🤖', '⚡', '🔴', '⭐'],
    keywords: [],
    refPrefix: ['tks'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'titan',
    name: '火山泰坦',
    emoji: '🌋',
    tagline: '它一跺脚，整座山都在喷火',
    palette: { base: '#301c14', lid: '#4a2a1a', trim: '#ff6a2a', glow: '#ffd45c', ink: '#180c08' },
    decor: ['🌋', '🔥', '🪨', '☄️'],
    keywords: [],
    refPrefix: ['titan'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'levi',
    name: '深海巨妖',
    emoji: '🦑',
    tagline: '海面下沉着一座会呼吸的岛',
    palette: { base: '#0e1e2e', lid: '#16303f', trim: '#5fe8d0', glow: '#9b6aff', ink: '#070f16' },
    decor: ['🦑', '🌊', '🐙', '💀'],
    keywords: [],
    refPrefix: ['levi'],
    pure: true,
    bannerSize: 16,
  },
  // ---- 第五批 5 个「神话」主题：纯主题宝箱 + 每主题一个定制命中特效（17 件） ----
  {
    id: 'vda',
    name: '天竺神话',
    emoji: '🕉️',
    tagline: '恒河的水、莲花的座，诸神按斤卖',
    palette: { base: '#7a4a1a', lid: '#c07a2a', trim: '#ffd45c', glow: '#ffb03a', ink: '#3a2208' },
    decor: ['🕉️', '🪷', '🐘', '🔥'],
    keywords: [],
    refPrefix: ['vda'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'tak',
    name: '高天原',
    emoji: '⛩️',
    tagline: '一镜照万世，一铃净八方',
    palette: { base: '#8a1a2a', lid: '#c0392b', trim: '#fff0d8', glow: '#ff8a5c', ink: '#3a0a12' },
    decor: ['⛩️', '🌸', '⚡', '🪞'],
    keywords: [],
    refPrefix: ['tak'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'celt',
    name: '凯尔特德鲁伊',
    emoji: '☘️',
    tagline: '石阵上的雾散开，德鲁伊的鹿角亮了',
    palette: { base: '#1e4a2e', lid: '#2f7a4a', trim: '#d8b45a', glow: '#8fd45a', ink: '#0e2418' },
    decor: ['☘️', '🌳', '🦌', '🎵'],
    keywords: [],
    refPrefix: ['celt'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'meso',
    name: '美索不达米亚',
    emoji: '🗿',
    tagline: '泥板上的字还没干，诸神已经醒了',
    palette: { base: '#3a2a5a', lid: '#2a4a8a', trim: '#d8b45a', glow: '#7fa8ff', ink: '#1a1430' },
    decor: ['🗿', '🦁', '⭐', '📜'],
    keywords: [],
    refPrefix: ['meso'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'cth',
    name: '克苏鲁沉眠',
    emoji: '🐙',
    tagline: '拉莱耶已升起，别读那本书',
    palette: { base: '#12283a', lid: '#1e5a4a', trim: '#7a4aa8', glow: '#5fe8c8', ink: '#08141e' },
    decor: ['🐙', '👁️', '📖', '🌑'],
    keywords: [],
    refPrefix: ['cth'],
    pure: true,
    bannerSize: 17,
  },
  // ---- 第六批 5 个「民俗神话」主题：纯主题宝箱，各 17 件（含专属命中特效 + 宠物） ----
  // 新规（见物品绘制.md 第十节）：15~30 件、覆盖 11 类部位、星级自由、背部只做背挂物件（不做翼/披风）。
  {
    id: 'slav',
    name: '斯拉夫密林',
    emoji: '🧹',
    tagline: '林子里那间会走路的鸡爪小屋，钥匙就插在篱笆上',
    palette: { base: '#2a2030', lid: '#3f3040', trim: '#8fd45a', glow: '#7dff6a', ink: '#170f1c' },
    decor: ['🧹', '🐔', '🕯️', '🦴'],
    keywords: [],
    refPrefix: ['slav'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'pers',
    name: '波斯圣火',
    emoji: '🔥',
    tagline: '浴火重生的神鸟，尾羽扫过的地方都在发光',
    palette: { base: '#5a2410', lid: '#8a3a16', trim: '#ffd45c', glow: '#ff9a3c', ink: '#30140a' },
    decor: ['🔥', '🕊️', '🌹', '🏺'],
    keywords: [],
    refPrefix: ['pers'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'inca',
    name: '印加太阳',
    emoji: '☀️',
    tagline: '金盘一照，整座山巅的城都醒了',
    palette: { base: '#7a5218', lid: '#a87a24', trim: '#fff0b0', glow: '#ffd45c', ink: '#3a2610' },
    decor: ['☀️', '🦙', '🦅', '🌽'],
    keywords: [],
    refPrefix: ['inca'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'poly',
    name: '波利尼西亚',
    emoji: '🗿',
    tagline: '他用一只神钩，把太阳都拴住了',
    palette: { base: '#0e3a44', lid: '#1a5a64', trim: '#ffd8a0', glow: '#5fe8d0', ink: '#07222a' },
    decor: ['🗿', '🌊', '🐚', '🛶'],
    keywords: [],
    refPrefix: ['poly'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'auz',
    name: '澳洲梦幻时代',
    emoji: '🐍',
    tagline: '创世那条蛇，一翻身就把颜色铺满了天',
    palette: { base: '#5a2a18', lid: '#8a4426', trim: '#ffd45c', glow: '#ff8a5c', ink: '#2e160c' },
    decor: ['🐍', '🌈', '🪃', '🦘'],
    keywords: [],
    refPrefix: ['auz'],
    pure: true,
    bannerSize: 17,
  },
  // ---- 第七批 5 个「宇宙炫酷科幻」主题：纯主题宝箱，各 17 件（含专属命中特效 + 宠物） ----
  {
    id: 'nano',
    name: '纳米矩阵',
    emoji: '⚛️',
    tagline: '把整座城市拆成原子，再重组成你的样子',
    palette: { base: '#12202e', lid: '#1c3448', trim: '#7fe8ff', glow: '#39ffd0', ink: '#0a1620' },
    decor: ['⚛️', '🔷', '✨', '🧬'],
    keywords: [],
    refPrefix: ['nano'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'data',
    name: '数据洪流',
    emoji: '💾',
    tagline: '这里的一切都是 0 和 1，包括你',
    palette: { base: '#101a28', lid: '#1a2c42', trim: '#4affc4', glow: '#7fb8ff', ink: '#080e16' },
    decor: ['💾', '📊', '🧮', '💠'],
    keywords: [],
    refPrefix: ['data'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'warp',
    name: '曲速跃迁',
    emoji: '🌀',
    tagline: '踩下油门，星星就拉成了线',
    palette: { base: '#141a3a', lid: '#232a5c', trim: '#9fd8ff', glow: '#a98cff', ink: '#0a0e24' },
    decor: ['🌀', '🚀', '💫', '🌌'],
    keywords: [],
    refPrefix: ['warp'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'mars',
    name: '火星殖民',
    emoji: '🔴',
    tagline: '红色的尘土下面，埋着新家',
    palette: { base: '#3a1a12', lid: '#5c2c1a', trim: '#ffb08a', glow: '#ff7a4a', ink: '#1e0c08' },
    decor: ['🔴', '🛰️', '🌵', '⛏️'],
    keywords: [],
    refPrefix: ['mars'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'forer',
    name: '先行者遗迹',
    emoji: '🔷',
    tagline: '他们走了，留下的东西还在转',
    palette: { base: '#1a2430', lid: '#2c3a4a', trim: '#a8e0ff', glow: '#5ad8ff', ink: '#0e1620' },
    decor: ['🔷', '🗿', '⚡', '✨'],
    keywords: [],
    refPrefix: ['forer'],
    pure: true,
    bannerSize: 17,
  },
  // ---- 第八批 5 个「海洋怪兽」主题（极地寒海 ×3 + 高维虚空 ×2）：纯主题宝箱，各 17 件 ----
  {
    id: 'glac',
    name: '冰海巨兽',
    emoji: '🐋',
    tagline: '浮冰下面，有个比岛还大的东西在翻身',
    palette: { base: '#0e2a3e', lid: '#1c4a63', trim: '#bfe8ff', glow: '#5fd8ff', ink: '#071a28' },
    decor: ['🐋', '🧊', '🌊', '❄️'],
    keywords: [],
    refPrefix: ['glac'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'frid',
    name: '极夜冰海',
    emoji: '🧊',
    tagline: '没有太阳的几个月里，只有它头顶的灯亮着',
    palette: { base: '#0a1c2e', lid: '#123248', trim: '#9fd8ff', glow: '#7dffd0', ink: '#06121e' },
    decor: ['🧊', '🪼', '🌑', '✨'],
    keywords: [],
    refPrefix: ['frid'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'walr',
    name: '寒潮海象',
    emoji: '🦭',
    tagline: '冰面上那堆“石头”，其实是它的背',
    palette: { base: '#3a3018', lid: '#5a4a28', trim: '#d8e8f0', glow: '#8fd8ff', ink: '#1e1a0c' },
    decor: ['🦭', '🧊', '🐚', '🌨️'],
    keywords: [],
    refPrefix: ['walr'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'dim',
    name: '维度裂隙',
    emoji: '👁️',
    tagline: '海面上裂开一道缝，缝后面的东西在看回来',
    palette: { base: '#160e2e', lid: '#2a1a52', trim: '#b08aff', glow: '#7dffd0', ink: '#0a0618' },
    decor: ['👁️', '🌀', '🌌', '✨'],
    keywords: [],
    refPrefix: ['dim'],
    pure: true,
    bannerSize: 17,
  },
  {
    id: 'hadal',
    name: '幽光深渊',
    emoji: '🪼',
    tagline: '一万米之下，它用光当诱饵，你用命当赌注',
    palette: { base: '#06141e', lid: '#0c2836', trim: '#7dffd0', glow: '#39ffd0', ink: '#040c14' },
    decor: ['🪼', '🐟', '🌑', '💡'],
    keywords: [],
    refPrefix: ['hadal'],
    pure: true,
    bannerSize: 17,
  },
  // ---- 第九批 10 个新主题：恐龙 / 史前 / 神话 / 恶搞（2026-10）------------------
  // 件数（15~30）、各部位件数、每件星级全部由主题 id 种子摇定（见 `物品绘制.md` 第九 / 十二节）。
  {
    id: 'cret',
    name: '白垩纪猎场',
    emoji: '🦖',
    tagline: '箱板上还留着三道爪印',
    palette: { base: '#2a3a1e', lid: '#3f5a28', trim: '#e8d07a', glow: '#9fe86a', ink: '#12200c' },
    decor: ['🦖', '🥚', '🌋', '🦴'],
    keywords: [],
    refPrefix: ['cret'],
    pure: true,
    bannerSize: 20,
  },
  {
    id: 'swamp',
    name: '史前沼泽',
    emoji: '🐊',
    tagline: '踩下去会冒泡的那种地方',
    palette: { base: '#1e3a2a', lid: '#2a5a3a', trim: '#8fd45a', glow: '#7dff9a', ink: '#0f2418' },
    decor: ['🐊', '🪷', '🫧', '🌿'],
    keywords: [],
    refPrefix: ['swamp'],
    pure: true,
    bannerSize: 28,
  },
  {
    id: 'iceage',
    name: '冰河世纪',
    emoji: '🦣',
    tagline: '冻在冰里的那一柜，还没化开',
    palette: { base: '#1e3a52', lid: '#2f5a78', trim: '#e0f2ff', glow: '#8fd8ff', ink: '#0e2030' },
    decor: ['🦣', '🧊', '❄️', '🏔️'],
    keywords: [],
    refPrefix: ['iceage'],
    pure: true,
    bannerSize: 18,
  },
  {
    id: 'yoruba',
    name: '非洲雷神',
    emoji: '⚡',
    tagline: '鼓点一响，天就裂开一道电',
    palette: { base: '#4a2010', lid: '#7a3416', trim: '#ffe08a', glow: '#ffb03a', ink: '#241008' },
    decor: ['⚡', '🪘', '🦁', '🔥'],
    keywords: [],
    refPrefix: ['yor'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'kaleva',
    name: '芬兰史诗',
    emoji: '🎻',
    tagline: '一张琴弹出万物，也弹出这口箱',
    palette: { base: '#24303a', lid: '#384c5a', trim: '#d8e8f0', glow: '#9fe8d0', ink: '#12202a' },
    decor: ['🎻', '🦢', '🌲', '❄️'],
    keywords: [],
    refPrefix: ['kal'],
    pure: true,
    bannerSize: 18,
  },
  {
    id: 'banana',
    name: '香蕉王国',
    emoji: '🍌',
    tagline: '别踩箱盖，那是张香蕉皮',
    palette: { base: '#8a8a1a', lid: '#c0c020', trim: '#fff080', glow: '#ffe040', ink: '#4a4a08' },
    decor: ['🍌', '🐵', '🍹', '🎉'],
    keywords: [],
    refPrefix: ['ban'],
    pure: true,
    bannerSize: 28,
  },
  {
    id: 'meme',
    name: '迷因宇宙',
    emoji: '🐸',
    tagline: '这箱子在互联网上已经传疯了',
    palette: { base: '#1e2a3a', lid: '#2f4058', trim: '#7dff9a', glow: '#39ffd0', ink: '#0e1620' },
    decor: ['🐸', '💬', '😂', '👍'],
    keywords: [],
    refPrefix: ['meme'],
    pure: true,
    bannerSize: 30,
  },
  {
    id: 'office',
    name: '摸鱼办公室',
    emoji: '💤',
    tagline: '老板不在，先开箱再干活',
    palette: { base: '#3a3a44', lid: '#54546a', trim: '#ffd45c', glow: '#9fd8ff', ink: '#1e1e26' },
    decor: ['💤', '☕', '📎', '🖥️'],
    keywords: [],
    refPrefix: ['office'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'gnome',
    name: '花园地精',
    emoji: '🍄',
    tagline: '花坛底下埋着的那口箱子',
    palette: { base: '#2f4a2a', lid: '#436b3a', trim: '#ffd0e2', glow: '#a8ff7a', ink: '#1a2c16' },
    decor: ['🍄', '🧙', '🌻', '🐌'],
    keywords: [],
    refPrefix: ['gnome'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'trash',
    name: '垃圾回收站',
    emoji: '🗑️',
    tagline: '有人当垃圾扔了，有人当宝捡回来',
    palette: { base: '#2a3030', lid: '#3f4a4a', trim: '#8fd4a0', glow: '#7dff9a', ink: '#161a1a' },
    decor: ['🗑️', '🪰', '🛢️', '♻️'],
    keywords: [],
    refPrefix: ['trash'],
    pure: true,
    bannerSize: 26,
  },
  // ---- 第十批 5 个全新主题：梦境 / 微观 / 炼金 / 毛线 / 画中世界（2026-10）----
  {
    id: 'dream',
    name: '梦境回廊',
    emoji: '🛌',
    tagline: '睡着之后才走得进去的那条长廊',
    palette: { base: '#2a2450', lid: '#3f3a78', trim: '#c9b8ff', glow: '#9f8aff', ink: '#140f2e' },
    decor: ['🛌', '☁️', '🌙', '💤'],
    keywords: [],
    refPrefix: ['dream'],
    pure: true,
    bannerSize: 29,
  },
  {
    id: 'micro',
    name: '微观世界',
    emoji: '🦠',
    tagline: '把一滴水放大一万倍，里面是一座城',
    palette: { base: '#0e2a3a', lid: '#12404f', trim: '#5fe8d0', glow: '#39ffd0', ink: '#06141e' },
    decor: ['🦠', '🧬', '🔬', '⚗️'],
    keywords: [],
    refPrefix: ['micro'],
    pure: true,
    bannerSize: 24,
  },
  {
    id: 'alch',
    name: '炼金工坊',
    emoji: '⚗️',
    tagline: '再等一会儿，它就要变成金子',
    palette: { base: '#243a1e', lid: '#3a5a2a', trim: '#ffd45c', glow: '#7dff6a', ink: '#12200c' },
    decor: ['⚗️', '🧪', '🜍', '🔥'],
    keywords: [],
    refPrefix: ['alch'],
    pure: true,
    bannerSize: 16,
  },
  {
    id: 'yarn',
    name: '毛线世界',
    emoji: '🧶',
    tagline: '整个宇宙都是织出来的，线头别乱拉',
    palette: { base: '#7a4a6a', lid: '#a86a8a', trim: '#ffd8e8', glow: '#ffb7d5', ink: '#3a1e30' },
    decor: ['🧶', '🧵', '🪡', '🧣'],
    keywords: [],
    refPrefix: ['yarn'],
    pure: true,
    bannerSize: 28,
  },
  {
    id: 'paint',
    name: '画中世界',
    emoji: '🖼️',
    tagline: '别盯着那幅画看，它会回看你',
    palette: { base: '#3a2a4a', lid: '#5a3f6a', trim: '#ffd45c', glow: '#ff8ad4', ink: '#20162e' },
    decor: ['🖼️', '🎨', '🖌️', '🌟'],
    keywords: [],
    refPrefix: ['paint'],
    pure: true,
    bannerSize: 27,
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

// ---- 开箱的池子（选中的宝箱只出它自己的内容）---------------------------------

/** 这一期展示的主题（面板右侧那面墙就是它） */
export function currentChestTheme(now: number = Date.now()): ChestTheme {
  return chestThemeFor(chestPeriod(now));
}

/**
 * **选中的宝箱只出它自己的内容**：返回这个池子墙上那些件（`slot.items`）。
 * 不再有「先摇类别」——普通 / 高级宝箱只在你**显式选中**它们时才出。
 * 不传 `slot` 就用当期主题的池子。（袋子档由 `rollOne` 另行处理。）
 */
export function chestPoolFor(slot?: ChestSlot, now: number = Date.now()): Item[] {
  if (slot) return slot.items;
  const theme = currentChestTheme(now);
  return bannerItems(theme, chestPeriod(now));
}

// ---- 多池：当期 + 限时返场 + 常驻经典 ------------------------------------------
//
// **所有主题都在「奖池切换」里列出来、都能点开看内容**，但只有——
// ① **当期主题**（照旧每小时轮换）；② **限时返场**（每 6 小时换一批，随机挑 3 个
// 历史主题，每个自己活 2~24 小时，到点下架）；③ **常驻经典大池**（普通 / 高级宝箱，
// 什么时候都在）——这几个是 `active`，**能抽**；其余主题点开只**预览**、抽取按钮置灰。
// 抽奖时**只出选中池子自己的内容**（见 `chestPoolFor`）。

/** 池子的身份：当期 / 限时返场 / 常驻（普通与高级宝箱） */
export type ChestSlotKind = 'current' | 'return' | 'const';
/** 页签归类：经典（早期 11 个主题 + 普通 / 高级宝箱）· 新品（后加的纯主题） */
export type ChestTab = 'classic' | 'new';

export interface ChestSlot {
  /** 槽位唯一键（面板拿它记「我选的是哪个池」） */
  key: string;
  theme: ChestTheme;
  kind: ChestSlotKind;
  tab: ChestTab;
  /**
   * 这个池子抽「主题」那一档时用的池子（= 墙上展示的这些件）。
   * 当期按小时换、返场整批固定、常驻按小时换（都是种子随机，人人一致）。
   */
  items: Item[];
  /** 下架时间戳（毫秒）；**0 = 常驻不过期** */
  endsAt: number;
  /** 现在能不能选中 / 抽取 */
  active: boolean;
}

/** 早期 11 个主题 + 两个兜底大池 = 「经典」页签 */
const CLASSIC_IDS = new Set([
  'deep', 'hallow', 'steel', 'royal', 'sakura', 'galaxy', 'magma', 'frost', 'jungle', 'neon', 'cosmo',
  'normal', 'premium',
]);

/** 每 6 小时换一批返场池 */
const RETURN_BATCH_MS = 6 * 3_600_000;
/** 一批返场几个池子 */
const RETURN_COUNT = 3;
/** 每个返场池活 2~24 小时 */
const RETURN_MIN_MS = 2 * 3_600_000;
const RETURN_MAX_MS = 24 * 3_600_000;

function makeSlot(theme: ChestTheme, kind: ChestSlotKind, endsAt: number, seed: number): ChestSlot {
  return {
    key: `${kind}:${theme.id}`,
    theme,
    kind,
    tab: CLASSIC_IDS.has(theme.id) ? 'classic' : 'new',
    items: bannerItems(theme, seed),
    endsAt,
    active: true,
  };
}

/** 刚刚下架（或还没轮到）的主题：只在页签里占个位置，不能选 */
function idleSlot(theme: ChestTheme, now: number): ChestSlot {
  return {
    key: `idle:${theme.id}`,
    theme,
    kind: 'return',
    tab: CLASSIC_IDS.has(theme.id) ? 'classic' : 'new',
    items: bannerItems(theme, chestPeriod(now)),
    endsAt: 0,
    active: false,
  };
}

/**
 * 现在**能抽**的池子：当期主题 + 限时返场（0~3 个）+ 常驻经典大池（2 个）。
 * 全部由时间推导（`mulberry32` + 批号当种子），不落库、刷新不变、人人一致。
 */
export function activeChestSlots(now: number = Date.now()): ChestSlot[] {
  const period = chestPeriod(now);
  const current = chestThemeFor(period);
  const out: ChestSlot[] = [makeSlot(current, 'current', chestPeriodEnd(now), period)];

  // 返场：按批号定死「这一批返场哪几个、各活多久」，到点自己下架
  const batch = Math.floor(now / RETURN_BATCH_MS);
  const batchStart = batch * RETURN_BATCH_MS;
  const rng = mulberry32(hashStr('chest-return') ^ Math.imul(batch, 2654435761));
  const picked = shuffled(
    CHEST_THEMES.filter((t) => !t.complement && t.id !== current.id),
    rng,
  ).slice(0, RETURN_COUNT);
  picked.forEach((t, i) => {
    const life = RETURN_MIN_MS + rng() * (RETURN_MAX_MS - RETURN_MIN_MS);
    // 错开一点，别几个池子同时下架
    const endsAt = batchStart + life + i * 900_000;
    if (endsAt > now) out.push(makeSlot(t, 'return', endsAt, batch));
  });

  // 常驻：普通宝箱 / 高级宝箱（同一柜杂货，星级结构不同），永远能开
  for (const t of CHEST_THEMES.filter((x) => x.complement)) {
    out.push(makeSlot(t, 'const', 0, period));
  }
  return out;
}

/** 全部主题（「经典 / 新品」两个页签要铺满，没返场的也列出来只是选不了） */
export function allChestSlots(now: number = Date.now()): ChestSlot[] {
  const active = activeChestSlots(now);
  const byId = new Map(active.map((s) => [s.theme.id, s]));
  const out: ChestSlot[] = [];
  for (const t of CHEST_THEMES) {
    if (t.complement) continue;
    out.push(byId.get(t.id) ?? idleSlot(t, now));
  }
  for (const s of active) if (s.kind === 'const') out.push(s);
  return out;
}

/** 默认选中的池子 = 当期主题 */
export function defaultChestSlot(now: number = Date.now()): ChestSlot {
  return activeChestSlots(now)[0];
}

/** 按 key 找池子（玩家的选择记在本机，跨期之后可能已经不存在了） */
export function findChestSlot(key: string, now: number = Date.now()): ChestSlot | undefined {
  return activeChestSlots(now).find((s) => s.key === key);
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
