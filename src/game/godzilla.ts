/**
 * 「哥斯拉来袭」限时活动：一只巨兽站在场右边朝玩家吐激光 / 火球，
 * 玩家用球拍把火球拍回去砸它扣血，血打空 = 挑战成功。
 *
 * 规则（与玩家确认过的设计）：
 * - 玩家 3 颗心：被激光扫到或被火球砸中（没拍回去）掉一颗，扣完挑战失败；
 * - 每天免费 3 次挑战（隔天重置），失败也消耗次数；
 * - 三档难度自选（简单 / 普通 / 地狱），血量与弹幕随档位变狠，奖励也随档位放大；
 * - **血条清空 = 击杀成功**（`GodzillaScene` 收到 `hp <= 0` 就收尾）；
 * - 每次击杀摇一次**三选一战利品**（`GZ_REWARD_ODDS`）：金币 / 该档限定皮肤 / 宝箱钥匙，
 *   荣誉点不参与摇奖、打赢就固定给。
 */
export const GZ_NAME = '哥斯拉';

/** 每天免费挑战次数 */
export const GZ_DAILY_MAX = 3;
/** 玩家的心数 */
export const GZ_HEARTS = 3;

export type GzDifficulty = 'easy' | 'normal' | 'hell';

export interface GzDiffConfig {
  id: GzDifficulty;
  label: string;
  /** 拍回去一次扣的血量（哥斯拉总血 = 命中次数，好读） */
  hits: number;
  /** 火球飞行速度（px/s） */
  fireballSpeed: number;
  /** 两次火球之间的间隔（秒） */
  fireballEvery: number;
  /** 同一时间最多几颗火球在飞 */
  maxFireballs: number;
  /** 激光扫描一次的间隔（秒） */
  laserEvery: number;
  /** 激光横扫速度（px/s） */
  laserSpeed: number;
  /** 击杀奖励：金币（摇到金币档才发） */
  coins: number;
  /** 荣誉点（打赢就固定给，不参与摇奖） */
  honor: number;
  /** 摇到钥匙档时给几把宝箱钥匙（越难给得越多） */
  keys: number;
}

export const GZ_DIFFS: Record<GzDifficulty, GzDiffConfig> = {
  easy: {
    id: 'easy',
    label: '简单',
    hits: 12,
    fireballSpeed: 340,
    fireballEvery: 3.2,
    maxFireballs: 1,
    laserEvery: 9,
    laserSpeed: 220,
    coins: 400,
    honor: 20,
    keys: 1,
  },
  normal: {
    id: 'normal',
    label: '普通',
    hits: 18,
    fireballSpeed: 460,
    fireballEvery: 2.4,
    maxFireballs: 2,
    laserEvery: 6.5,
    laserSpeed: 330,
    coins: 1000,
    honor: 50,
    keys: 2,
  },
  hell: {
    id: 'hell',
    label: '地狱',
    hits: 26,
    fireballSpeed: 620,
    fireballEvery: 1.7,
    maxFireballs: 3,
    laserEvery: 4.5,
    laserSpeed: 460,
    coins: 2500,
    honor: 120,
    keys: 3,
  },
};

export const GZ_DIFF_ORDER: GzDifficulty[] = ['easy', 'normal', 'hell'];

/**
 * 限定套装「哥斯拉来袭」：**哥斯拉形象** + 背鳍光焰（光环）· 鳞甲披风（披风）·
 * 原子吐息（挥拍拖尾）· 原子烈焰（命中特效）。只能从哥斯拉身上掉，不可购买。
 */
export const GZ_SET_IDS = [
  'skin:godzilla',
  'aura:dorsal',
  'cape:scalecape',
  'swingTrail:atomic',
  'effect:gzfire',
];

/**
 * 每次**击败**哥斯拉摇一次的战利品概率（加起来 = 1）：
 * - `coins` **50%**：发该档的 `coins`；
 * - `skin` **20%**：从该档的限定里挑一件**还没拥有的**（见 `GZ_DROPS`）——
 *   **这一档全拿齐了就不再重复给**，折算成 `coins` 那份金币；
 * - `keys` **30%**：发该档的 `keys` 把宝箱钥匙（越难给得越多）。
 *
 * 荣誉点不参与摇奖：打赢就固定给 `honor`（它是荣誉商店的唯一货币，不该被概率掐掉）。
 */
export const GZ_REWARD_ODDS = { coins: 0.5, skin: 0.2, keys: 0.3 } as const;

/**
 * 三档难度各自绑定的限定物件（`skin` 档那 20% 从这里出）：
 * 简单档给两件小件，**地狱档才是哥斯拉皮肤本身**，各档之间不重叠。
 */
export const GZ_DROPS: Record<GzDifficulty, { ids: string[] }> = {
  easy: { ids: ['effect:gzfire', 'swingTrail:atomic'] },
  normal: { ids: ['aura:dorsal', 'cape:scalecape'] },
  hell: { ids: ['skin:godzilla'] },
};
