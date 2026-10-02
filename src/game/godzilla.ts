/**
 * 「哥斯拉来袭」限时活动：一只巨兽站在场右边朝玩家吐激光 / 火球，
 * 玩家用球拍把火球拍回去砸它扣血，血打空 = 挑战成功。
 *
 * 规则（与玩家确认过的设计）：
 * - 玩家 3 颗心：被激光扫到或被火球砸中（没拍回去）掉一颗，扣完挑战失败；
 * - 每天免费 3 次挑战（隔天重置），失败也消耗次数；
 * - 三档难度自选（简单 / 普通 / 地狱），血量与弹幕随档位变狠，奖励也随档位放大；
 * - 首次击杀（任意难度）送一套「哥斯拉来袭」限定装扮（见 `GZ_SET_IDS`）；
 *   重复击杀按难度给金币 + 荣誉点。
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
  /** 击杀奖励：金币 / 荣誉点 */
  coins: number;
  honor: number;
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
  },
};

export const GZ_DIFF_ORDER: GzDifficulty[] = ['easy', 'normal', 'hell'];

/**
 * 首杀限定套装「哥斯拉来袭」：背鳍光焰（光环）· 鳞甲披风（披风）·
 * 原子吐息（挥拍拖尾）· 原子烈焰（命中特效）。只有首杀送，不可购买。
 */
export const GZ_SET_IDS = ['aura:dorsal', 'cape:scalecape', 'swingTrail:atomic', 'effect:gzfire'];
