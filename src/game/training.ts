/**
 * 锻炼：角色的属性点**不再由积分发放**，而是去对应的场地练出来——
 * 攒够经验就自动 +1 级，直接长到那一维上（不能自由分配、也不能重置）。
 *
 * 去哪儿练（**一个场地只管一维**，五维各有一个去处，互不重叠）：
 * - 🏋️ 健身房 · 举重    → 进攻
 * - 🥊 健身房 · 沙袋    → 技术
 * - 🏃 健身房 · 跑步机  → 体力
 * - 🏃 操场 · 跑圈      → 速度
 * - 🏸 单机练习 · 发球机 → 防守
 *
 * 练法很简单：**做一次动作就给一笔固定经验**（举一次哑铃、打一拳沙袋、
 * 跑完一圈…），没有节奏判定、没有评级、也没有每日额度。
 * 等级只是「加了多少」，真正的物理效果仍由 players.playerStats → attrsFromStats
 * 那条唯一换算决定（四维 → 倍率），所以练出来的东西在对局里是同一套。
 */

/** 能练的五维（= PlayerStats 的键，这里显式写死避免循环引用） */
export type TrainKey = 'technique' | 'speed' | 'attack' | 'defense' | 'stamina';

export const TRAIN_KEYS: TrainKey[] = ['technique', 'speed', 'attack', 'defense', 'stamina'];

export type TrainLevels = Record<TrainKey, number>;
export type TrainXp = Record<TrainKey, number>;

export interface TrainMeta {
  label: string;
  /** 练高了对局里的效果 */
  desc: string;
  /** 去哪儿练 */
  where: string;
  /** 大世界里的入口（没有独立场地就写去哪） */
  route: string;
  color: string;
}

export const TRAIN_META: Record<TrainKey, TrainMeta> = {
  attack: {
    label: '进攻',
    desc: '击球更重',
    where: '健身房 · 举重 / 操场 · 实心球',
    route: '/gym',
    color: '#ff5a4d',
  },
  speed: { label: '速度', desc: '跑动更快', where: '操场 · 跑圈', route: '/track', color: '#39d0a0' },
  stamina: {
    label: '体力',
    desc: '体力上限更高、跑动挥拍更省力',
    where: '健身房 · 跑步机',
    route: '/gym',
    color: '#ffd45c',
  },
  technique: { label: '技术', desc: '出球更稳、失误更少', where: '健身房 · 沙袋', route: '/gym', color: '#9b8cf0' },
  defense: {
    label: '防守',
    desc: '判定半径更大、接杀更稳',
    where: '单机 · 发球机',
    route: '/single',
    color: '#3d8bfd',
  },
};

/** 单项最高等级 */
export const TRAIN_MAX_LEVEL = 10;
/** 每一级给对应那一维加多少（0–100 刻度） */
export const TRAIN_PER_LEVEL = 4;

/** 各项「做一次动作 / 跑完一圈 / 接到一颗球」给多少经验（都是个位数） */
export const TRAIN_XP_PER = {
  /** 发球机接到一颗球 → 防守 */
  machineReturn: 2,
  /** 举重一次 → 进攻 */
  lift: 4,
  /** 打沙袋一拳 → 技术 */
  bag: 3,
  /** 跑步机上每跑一段（约 380px ≈ 1 秒）→ 体力 */
  tread: 2,
  /** 操场跑完一圈 → 速度 */
  lap: 8,
} as const;

/** 从当前等级升到下一级需要的经验（越练越慢，后期明显变长） */
export function trainXpFor(level: number): number {
  return 30 + 8 * level + 2 * level * level;
}

export function emptyLevels(): TrainLevels {
  return { technique: 0, speed: 0, attack: 0, defense: 0, stamina: 0 };
}

export function emptyXp(): TrainXp {
  return { technique: 0, speed: 0, attack: 0, defense: 0, stamina: 0 };
}

export interface TrainResult {
  levels: TrainLevels;
  xp: TrainXp;
  /** 这一次练完升了级的维度（用来弹提示） */
  up: TrainKey[];
}

/**
 * 给若干维加经验，满了就升级（经验够的话一档一档连着升）。
 * 纯函数：调用方拿返回值写回存档。
 */
export function addTrainXp(
  levels: TrainLevels,
  xp: TrainXp,
  gains: Partial<Record<TrainKey, number>>,
): TrainResult {
  const nextL: TrainLevels = { ...emptyLevels(), ...levels };
  const nextX: TrainXp = { ...emptyXp(), ...xp };
  const up: TrainKey[] = [];
  for (const k of TRAIN_KEYS) {
    const amount = gains[k] ?? 0;
    if (amount <= 0) continue;
    if (nextL[k] >= TRAIN_MAX_LEVEL) {
      nextL[k] = TRAIN_MAX_LEVEL;
      nextX[k] = 0;
      continue;
    }
    nextX[k] += amount;
    while (nextL[k] < TRAIN_MAX_LEVEL && nextX[k] >= trainXpFor(nextL[k])) {
      nextX[k] -= trainXpFor(nextL[k]);
      nextL[k] += 1;
      up.push(k);
    }
    if (nextL[k] >= TRAIN_MAX_LEVEL) {
      nextL[k] = TRAIN_MAX_LEVEL;
      nextX[k] = 0;
    }
  }
  return { levels: nextL, xp: nextX, up };
}

/** 这一项离下一级还差多少（0~1，满级恒为 1） */
export function trainProgress(level: number, xp: number): number {
  if (level >= TRAIN_MAX_LEVEL) return 1;
  return Math.max(0, Math.min(1, xp / trainXpFor(level)));
}
