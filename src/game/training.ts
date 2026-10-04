/**
 * 锻炼：角色的属性点**不再由积分发放**，而是去对应的场地练出来——
 * 攒够经验就自动 +1 级，直接长到那一维上（不能自由分配、也不能重置）。
 *
 * 去哪儿练（见大世界的健身房 / 操场，以及单机练习里的发球机）：
 * - 🏋️ 健身房 · 举重 / 沙袋 → 进攻
 * - 🏃 健身房 · 跑步机 / 操场 → 体力（操场同时给速度）
 * - 🏸 单机练习 · 发球机    → 技术 + 防守
 *
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
  attack: { label: '进攻', desc: '击球更重', where: '健身房', route: '/gym', color: '#ff5a4d' },
  speed: { label: '速度', desc: '跑动更快', where: '操场 · 跑圈', route: '/track', color: '#39d0a0' },
  stamina: {
    label: '体力',
    desc: '体力上限更高、跑动挥拍更省力',
    where: '操场 · 跑圈 / 健身房 · 跑步机',
    route: '/track',
    color: '#ffd45c',
  },
  technique: { label: '技术', desc: '出球更稳、失误更少', where: '单机 · 发球机', route: '/single', color: '#9b8cf0' },
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

/** 各项锻炼「一次」给多少经验（发球机接到一颗球；健身房 / 操场走「训练组」，见下） */
export const TRAIN_XP_PER = {
  machineReturn: 2,
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

/* ============================================================================
   训练组（一次限时挑战）
   ----------------------------------------------------------------------------
   练法不再是「无限刷小额经验」，而是**一组 20 秒的小挑战**：
   - 组内每次动作按**节奏**判质量（Perfect / Good / Miss = 1 / 0.7 / 0）；
   - 组结束按累计质量分给**评级**（S / A / B / C），评级决定这一组的基础经验；
   - 每天每项**满额 3 组**，第 4~5 组只给零头（0.25×），再往后不给 ——
     「一口气刷满级」于是变成「每天练一点」。
   ========================================================================== */

/** 一组多少秒 */
export const TRAIN_SET_SECONDS = 20;
/** 一组的基础经验（再乘评级倍率与每日额度系数） */
export const TRAIN_SET_XP = 100;
/** 每天每项「满额」的组数 */
export const TRAIN_DAILY_SETS = 3;
/** 额度用完后还能练几组「零头」 */
export const TRAIN_LEAN_SETS = 2;
/** 零头组的系数 */
export const TRAIN_LEAN_MUL = 0.25;

export type TrainGrade = 'S' | 'A' | 'B' | 'C';

/** 评级 → 经验倍率 */
export const TRAIN_GRADE_MUL: Record<TrainGrade, number> = { S: 1.25, A: 1, B: 0.75, C: 0.45 };
export const TRAIN_GRADE_LABEL: Record<TrainGrade, string> = {
  S: '完美',
  A: '良好',
  B: '合格',
  C: '生疏',
};
export const TRAIN_GRADE_COLOR: Record<TrainGrade, string> = {
  S: '#ffd45c',
  A: '#37d67a',
  B: '#3d8bfd',
  C: '#8a94a6',
};

/** 每台器械一组的「评级目标分」（拿到它评 A）与提示节奏（秒 / 次，0 = 不看节奏）。
 *  操场不在这里：它按「一圈用时」评级，见 `TrackView.vue` 的 `TARGET_LAP_MS`。 */
export const TRAIN_SET_TARGET: Record<'lift' | 'bag' | 'tread', { target: number; beat: number }> = {
  lift: { target: 30, beat: 0.7 },
  bag: { target: 45, beat: 0.45 },
  tread: { target: 40, beat: 0 },
};

/** 节奏窗口：动作间隔落在 [beat×lo, beat×hi] 里算 Perfect / Good */
export const TRAIN_BEAT = {
  perfect: [0.55, 1.7],
  good: [0.3, 2.6],
} as const;

/** 动作质量分 */
export const TRAIN_QUALITY = { perfect: 1, good: 0.7, miss: 0 } as const;
export type TrainQuality = keyof typeof TRAIN_QUALITY;

/** 连击加成：连击每 +1 加 2%，封顶 +40% */
export function trainComboBonus(combo: number): number {
  return 1 + Math.min(combo, 20) * 0.02;
}

/** 一次动作（按间隔判质量）：返回质量和本次得分 */
export function trainJudge(dtSec: number, beatSec: number): { quality: TrainQuality; base: number } {
  if (beatSec <= 0) return { quality: 'perfect', base: TRAIN_QUALITY.perfect };
  const ratio = dtSec / beatSec;
  if (ratio >= TRAIN_BEAT.perfect[0] && ratio <= TRAIN_BEAT.perfect[1]) {
    return { quality: 'perfect', base: TRAIN_QUALITY.perfect };
  }
  if (ratio >= TRAIN_BEAT.good[0] && ratio <= TRAIN_BEAT.good[1]) {
    return { quality: 'good', base: TRAIN_QUALITY.good };
  }
  return { quality: 'miss', base: TRAIN_QUALITY.miss };
}

/**
 * 一组练完的评级：`score` 是组内累计的质量分，`target` 是拿 A 需要的分数。
 */
export function trainGradeOf(score: number, target: number): TrainGrade {
  const r = score / Math.max(1, target);
  if (r >= 1.15) return 'S';
  if (r >= 0.8) return 'A';
  if (r >= 0.5) return 'B';
  return 'C';
}

/** 今天的第 n 组（1 起）拿多少额度系数 */
export function trainQuotaMul(setsToday: number): number {
  if (setsToday < TRAIN_DAILY_SETS) return 1;
  if (setsToday < TRAIN_DAILY_SETS + TRAIN_LEAN_SETS) return TRAIN_LEAN_MUL;
  return 0;
}

/** 一组的基础经验（已乘评级倍率；每日额度系数由 `progress.finishTrainSet` 再乘） */
export function trainSetBaseXp(grade: TrainGrade): number {
  return Math.round(TRAIN_SET_XP * TRAIN_GRADE_MUL[grade]);
}
