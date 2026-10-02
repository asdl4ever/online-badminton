/**
 * 小黄龙联名：一位特殊的对手 + 一个抽奖转盘 + 一套「趣味模式」规则。
 *
 * 每天有 3 张「挑战门票」，开一场就扣一张（输赢都扣）；赢下这一场才给 1 张「转盘抽奖券」，
 * 券拿去转盘抽联名周边与资源。所以一天最多 3 张券（全赢）。
 * 小黄龙自己的四维刻意压得比 0 积分新号（52）低一截，所以新手也能稳稳赢下来。
 */
import type { PlayerStats } from './players';

/** 小黄龙的名字（转盘 / 对战 / 界面文案都用它） */
export const NAILONG_NAME = '小黄龙';

/** 趣味模式的世界选项 id（真正的物理参数在 config.ts 的 PRACTICE_OPTIONS 里） */
export const NAILONG_OPTION_ID = 'nailongFun';

/**
 * 小黄龙的四维：比新号（52）低一截，但也不是白给——新手能赢、老玩家碾压。
 * 行为、难度、物理加成全部由这四维派生（见 ai.ts / players.ts）。
 */
export const NAILONG_STATS: PlayerStats = {
  technique: 42,
  speed: 44,
  attack: 40,
  defense: 42,
  jump: 40,
};

/** 每天最多挑战小黄龙几次（= 每天的挑战门票数），每挑战一次扣一张 */
export const NAILONG_DAILY_MAX = 3;

/** 连续这么多次没抽到联名物品，下一次必出「还没拥有的联名」 */
export const NAILONG_PITY = 8;

/** 抽到重复联名物品时折算的金币 */
export const NAILONG_DUP_COINS = 200;

export interface WheelPrize {
  id: string;
  label: string;
  icon: string;
  /** 抽中的相对权重 */
  weight: number;
  kind: 'coins' | 'honor' | 'item';
  amount?: number;
  itemId?: string;
  /** 联名物品（参与保底计数） */
  grand?: boolean;
}

/** 转盘 8 格（顺序就是盘面上的顺序，权重合计 100） */
export const WHEEL_PRIZES: WheelPrize[] = [
  { id: 'coins-s', label: '金币 ×100', icon: '🪙', weight: 28, kind: 'coins', amount: 100 },
  { id: 'honor-s', label: '荣誉点 ×20', icon: '🏅', weight: 18, kind: 'honor', amount: 20 },
  { id: 'hood', label: '小黄龙头套', icon: '🧢', weight: 12, kind: 'item', itemId: 'hat:nailongHood', grand: true },
  { id: 'coins-m', label: '金币 ×300', icon: '🪙', weight: 16, kind: 'coins', amount: 300 },
  { id: 'pet', label: '小黄龙宝宝', icon: '🐣', weight: 10, kind: 'item', itemId: 'pet:nailong', grand: true },
  { id: 'honor-m', label: '荣誉点 ×50', icon: '🏅', weight: 8, kind: 'honor', amount: 50 },
  { id: 'mount', label: '小黄龙滚滚', icon: '🛞', weight: 6, kind: 'item', itemId: 'mount:nailongRoll', grand: true },
  { id: 'skin', label: '小黄龙本体', icon: '🐲', weight: 2, kind: 'item', itemId: 'skin:nailong', grand: true },
];

/** 按权重随机取一个格子的下标 */
export function rollWheelIndex(prizes: readonly WheelPrize[] = WHEEL_PRIZES): number {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (let i = 0; i < prizes.length; i++) {
    r -= prizes[i].weight;
    if (r <= 0) return i;
  }
  return prizes.length - 1;
}
