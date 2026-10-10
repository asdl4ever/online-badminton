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
 *
 * 另外每维练到 Lv5 / Lv8 会送一条**永久「功底」**（`TRAIN_MILESTONES`）——
 * 原有「被动招式」的常驻加成全部收编到这里，永久成长只有锻炼这一个出处。
 */
import type { PlayerAttrs } from './attrs';

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
/**
 * 每一级给对应那一维加多少（**0–100 刻度上的点数**）。
 *
 * 6.25 不是随手取的：`attrsFromStats` 的换算是 `1 + (v-50)/50 × 0.4`，
 * 也就是**1 点 = 0.8%**，所以 6.25 点正好 = 对局倍率 **+5%/级**，
 * 满级 10 级 = +62.5 点 = **倍率 +50%**。
 *
 * ⚠️ 配套：`players.ts` 的 `clampStat` 上限必须 ≥ 底子(最高 72) + 62.5，
 * 否则升到后面会被夹住、等级白练（现在是 140）。
 */
export const TRAIN_PER_LEVEL = 6.25;

// ---- 🏅 锻炼功底：每维练到一定等级送的永久加成 --------------------------------
/**
 * 这是全游戏「永久数值成长」的**唯一**来源。
 *
 * 以前这些加成挂在「被动招式」上（装上即常驻），和锻炼练级算的是同一笔账，
 * 玩家感觉两套系统重复。2026-10 起全部收进这里：练到位就送，
 * 不需要解锁 / 装备 / 携带；招式那边只剩局内发动期间才生效的临时效果。
 */
export interface TrainMilestone {
  /** 练到这一级给 */
  at: number;
  name: string;
  desc: string;
  /** 属性倍率（键 = `PlayerAttrs` 的字段） */
  up?: Partial<Record<keyof PlayerAttrs, number>>;
}

export const TRAIN_MILESTONES: Record<TrainKey, TrainMilestone[]> = {
  attack: [
    { at: 5, name: '发力根底', desc: '力量 +10%', up: { power: 1.1 } },
    { at: 8, name: '千钧腕力', desc: '力量再 +12%', up: { power: 1.12 } },
  ],
  speed: [
    { at: 5, name: '步法功底', desc: '移速 +10%', up: { speed: 1.1 } },
    { at: 8, name: '疾风步', desc: '移速再 +12%', up: { speed: 1.12 } },
  ],
  stamina: [
    { at: 5, name: '耐力代谢', desc: '体力 +20%', up: { stamina: 1.2 } },
    { at: 8, name: '铁肺', desc: '体力再 +15%', up: { stamina: 1.15 } },
  ],
  technique: [
    { at: 5, name: '细腻手感', desc: '容错 +12%', up: { skill: 1.12 } },
    { at: 8, name: '院感', desc: '容错再 +15%', up: { skill: 1.15 } },
  ],
  defense: [
    { at: 5, name: '根基防守', desc: '判定 +8%', up: { reach: 1.08 } },
    { at: 8, name: '铁幕', desc: '判定再 +12%', up: { reach: 1.12 } },
  ],
};

/** 已到等级的功底合成一份倍率表（没到的不在里面） */
export function trainMilestoneMults(levels: TrainLevels): Partial<Record<keyof PlayerAttrs, number>> {
  const out: Partial<Record<keyof PlayerAttrs, number>> = {};
  for (const k of TRAIN_KEYS) {
    const lv = levels[k] ?? 0;
    for (const m of TRAIN_MILESTONES[k]) {
      if (lv < m.at || !m.up) continue;
      for (const [attr, mul] of Object.entries(m.up)) {
        const key = attr as keyof PlayerAttrs;
        out[key] = (out[key] ?? 1) * (mul ?? 1);
      }
    }
  }
  return out;
}

/** 把功底倍率乘到对局属性上（`progress.attrs` 用） */
export function applyTrainMilestones(attrs: PlayerAttrs, levels: TrainLevels): PlayerAttrs {
  const mult = trainMilestoneMults(levels);
  return {
    speed: attrs.speed * (mult.speed ?? 1),
    power: attrs.power * (mult.power ?? 1),
    reach: attrs.reach * (mult.reach ?? 1),
    skill: attrs.skill * (mult.skill ?? 1),
    stamina: attrs.stamina * (mult.stamina ?? 1),
  };
}

/**
 * 各项「做一次动作 / 跑完一圈 / 接到一颗球」给多少经验（都是个位数）。
 *
 * 2026-10 整体下调了一半（原来 举重 4 / 沙袋 3 / 跑步机 2 / 一圈 8 / 接球 2），
 * 而 `trainXpFor`（升级所需）没动 → 练满一维要花的时间大约翻倍。
 */
export const TRAIN_XP_PER = {
  /** 发球机接到一颗球 → 防守（`SingleView.vue`） */
  machineReturn: 1,
  /** 举重一次 → 进攻（`GymView.vue`） */
  lift: 2,
  /** 打沙袋一拳 → 技术（`GymView.vue`） */
  bag: 2,
  /** 跑步机上每跑一段（约 380px ≈ 1 秒）→ 体力（`GymView.vue`） */
  tread: 1,
  /**
   * 操场跑完一圈 → 速度（`TrackView.vue`）。
   *
   * ⚠️ 这里曾经写着 8，但那时 `TrackView` 自己另有一份 `XP_PER_100M = 2`
   * （**实际只给 2**），这个常量根本没人用、对不上。现在**统一由这一份说了算**，
   * `TrackView` 直接读它。2026-10 砍半：2 → 1。
   */
  lap: 1,
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
