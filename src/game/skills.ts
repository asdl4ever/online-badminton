/**
 * 🥋 **招式**：由多种方式解锁、**单机 / PvE 生效**（联机归一化，不启用）。
 *
 * - **全部是主动**（`kind:'active'`）：点 / 按触发（手机有按钮，桌面用快捷键 1/2/3）；可带**条件**。
 * - **只在局内、只在发动期间生效**：装被动常驻加成的设计已废除——「永久数值成长」
 *   统一归 `training.ts` 的锻炼里程碑管（肌群归锻炼、打法归招式，两套系统不再各算一份 +%）。
 * - **携带上限 `SKILL_SLOTS`**：解锁再多，上场只能带固定几个 → build 选择。
 * - **分支 + 质变**：练到一定熟练度（`awaken.at`）且选了分支后，该招「练熟了」——
 *   质变加成只在该招**发动窗口内**生效，并让这一招冷却更短、持续更久（不再常驻加属性）。
 *
 * 效果**数据驱动**：填 `fx`；条件填 `when`。
 * 引擎（`GameScene.applySkills`）统一执行——只改「本地玩家的属性倍率」，不动 simulation。
 */
import type { TrainKey } from './training';
import type { ShotStyle } from './types';

export type SkillId =
  | 'charge' | 'jumpSmash' | 'spinSmash'
  | 'dive' | 'aerialDive' | 'rooted'
  | 'dash' | 'swiftStep' | 'legDrive'
  | 'eagleEye' | 'netGuard' | 'softHands'
  | 'ironWall' | 'overdrive' | 'lastStand'
  // 主动（新）
  | 'netKill' | 'underdogSmash' | 'bodySmash' | 'comboCannon' | 'allInSmash'
  | 'blockWall' | 'lastDitch' | 'deflectWall' | 'blinkStep' | 'retreatStop'
  | 'pressNet' | 'feint' | 'clutchBurst'
  // 第三批
  | 'khSmash' | 'pierceSmash' | 'rapidFire' | 'heavyHand' | 'skyDrop'
  | 'stoneWall' | 'counterBeam'
  | 'windRush' | 'phantomStep' | 'teleportDart' | 'reverseDash'
  | 'spinControl' | 'netTrick'
  | 'bananaSlip'
  // 支援 / 连招
  | 'buildUp' | 'relentless' | 'secondWind';

export type SkillKind = 'active' | 'passive';

/** 能临时改写的物理倍率维（= PlayerAttrs 的字段名） */
export type SkillAttr = 'speed' | 'power' | 'reach' | 'skill' | 'stamina';

/** 触发条件：不满足则按不下 / 不生效（引擎从 world 现成状态读） */
export type SkillCond =
  | 'staminaLow' // 体力 < 35%
  | 'behind' // 比分落后
  | 'ahead' // 比分领先
  | 'netNear' // 靠近网
  | 'backCourt' // 靠本方后场
  | 'rallyLong'; // 本回合已来回 ≥ 6 拍

export interface SkillEffect {
  /** tap = 按一下触发一段；hold = 按住维持；air = 只在腾空时能触发（被动忽略） */
  mode: 'tap' | 'hold' | 'air';
  ms: number;
  cd: number;
  up?: Partial<Record<SkillAttr, number>>;
  down?: Partial<Record<SkillAttr, number>>;
}

/**
 * 「质变」：练到 `at` 级且选了该分支后，这一招「练熟了」。
 *
 * ⚠️ 这里的 `up/down` **只在发动该招式的窗口内生效**（不再常驻），
 * 另外引擎会给这招附带 冷却 -10% / 发动窗口 +15%（见 `GameScene.applySkills`）。
 */
export interface Awaken {
  at: number;
  name: string;
  desc: string;
  up?: Partial<Record<SkillAttr, number>>;
  down?: Partial<Record<SkillAttr, number>>;
}

export interface BranchMod {
  upMul?: number;
  downMul?: number;
  cdMul?: number;
  msMul?: number;
  chargeRateMul?: number;
}

export interface SkillBranch {
  id: string;
  name: string;
  desc: string;
  cost?: number;
  mod: BranchMod;
  awaken?: Awaken;
}

export type SkillUnlock =
  | { via: 'train'; key: TrainKey; level: number }
  | { via: 'scroll' }
  | { via: 'weekly'; cleared: number }
  | { via: 'arena'; titles: number }
  | { via: 'rank'; points: number };

export interface SkillMeta {
  id: SkillId;
  name: string;
  icon: string;
  kind: SkillKind;
  how: string;
  effect: string;
  /** 解锁所需维度 / 等级（train 方式用于保底展示与星级推导） */
  train: TrainKey;
  level: number;
  /** 星级（1~5；不填按 unlock 档位推导） */
  star?: number;
  /** 分类 */
  group?: 'attack' | 'defense' | 'mobility' | 'technique' | 'stamina' | 'fun';
  /** 解锁方式（不填 = train） */
  unlock?: SkillUnlock;
  /** 解锁花费的「招式秘籍」（不填按 `skillCost()` 推导） */
  cost?: number;
  /** **气势代价**：发动要花的气势（0/不填 = 免费，只吃冷却）。够不够是玩家的决策。 */
  momentum?: number;
  /** **气势供给**：发动后回一点气势（支援型招式） */
  grantMomentum?: number;
  /** **连招**：这一击命中后，给「下一板」一段加成（吃命中，形成套路） */
  chain?: { up: Partial<Record<SkillAttr, number>>; ms: number };
  /** 蓄力型（特殊） */
  charge?: boolean;
  /**
   * 🎯 **真·球路改造**：发动窗口内这一拍按它出球（搓球变贴网小球、挑高变高远球、
   * 重杀把出球角度压向地面……见 `types.ShotStyle`）。和 `fx` 的属性倍率叠加生效；
   * 只单机 / PvE 会写进模拟（联机不启用）。
   */
  shot?: ShotStyle;
  /** 主动效果 */
  fx?: SkillEffect;
  /** 触发条件（主动） */
  when?: SkillCond;
  /** 专属分支（不填用原型对） */
  branches?: SkillBranch[];
}

/** 🔥 气势：本局内积累的资源——打中 +1、赢下一分 +3；高价值招式要花它 */
export const MOMENTUM_MAX = 10;
export const MOMENTUM_PER_HIT = 1;
export const MOMENTUM_PER_POINT = 3;

/** 一次上场能携带的招式数 = 快捷键 1/2/3 = 手机按钮最多几个 */
export const SKILL_SLOTS = 3;

// ---- 分支原型（未写专属分支的技能共用）----------------------------------------
export const BRANCH_ARCHETYPES: SkillBranch[] = [
  { id: 'power', name: '威力强化', desc: '强度 +30%，蓄力/冷却更慢', mod: { upMul: 1.3, chargeRateMul: 0.8, cdMul: 1.25, msMul: 0.9 }, awaken: { at: 5, name: '震击', desc: '发动时力量 +8%', up: { power: 1.08 } } },
  { id: 'swift', name: '迅捷', desc: '蓄力/冷却更快，强度 -10%', mod: { upMul: 0.9, chargeRateMul: 1.35, cdMul: 0.6, msMul: 1.1 }, awaken: { at: 5, name: '余势', desc: '发动时速度 +6%', up: { speed: 1.06 } } },
];

/** 便捷造一条专属分支 */
function br(id: string, name: string, desc: string, mod: BranchMod, awaken: Awaken, cost = 500): SkillBranch {
  return { id, name, desc, mod, awaken, cost };
}

export const SKILLS: SkillMeta[] = [
  // ══ 已有 15 个（全部主动）══════════════════════════════════════
  { id: 'charge', name: '蓄力重杀', icon: '💥', kind: 'active', train: 'attack', level: 3, charge: true, star: 5, momentum: 2, group: 'attack', how: '按住 1 蓄力，掐满再打', effect: '蓄力越满越重，出球角度压向地面（判定同时收窄，打空风险大）', shot: { elevation: -0.24 } },
  { id: 'jumpSmash', name: '跳杀', icon: '🦅', kind: 'active', train: 'attack', level: 6, group: 'attack', how: '按一下打一记重炮', effect: '力量短时拉满，有冷却', fx: { mode: 'tap', ms: 350, cd: 1300, up: { power: 1.5 } } },
  { id: 'spinSmash', name: '旋风扣', icon: '🌀', kind: 'active', train: 'attack', level: 9, group: 'attack', how: '按一下旋身重扣', effect: '力量 + 移速同时升，判定略缩', fx: { mode: 'tap', ms: 400, cd: 2000, up: { power: 1.4, speed: 1.15 }, down: { reach: 0.85 } } },
  { id: 'dive', name: '鱼跃救球', icon: '🐟', kind: 'active', train: 'defense', level: 3, group: 'defense', how: '按一下扑救', effect: '短暂大幅加大够球判定，硬直期间几乎动不了', fx: { mode: 'tap', ms: 320, cd: 1500, up: { reach: 1.5 }, down: { speed: 0.45 } } },
  { id: 'aerialDive', name: '凌空飞扑', icon: '🕊️', kind: 'active', train: 'defense', level: 6, group: 'defense', how: '腾空时按一下', effect: '空中救球判定 + 冲刺', fx: { mode: 'air', ms: 500, cd: 2000, up: { reach: 1.4, speed: 1.3 }, down: { power: 0.85 } } },
  { id: 'rooted', name: '稳如泰山', icon: '🗿', kind: 'active', train: 'defense', level: 9, group: 'defense', how: '按住扎稳', effect: '判定 + 容错提升，几乎站桩', fx: { mode: 'hold', ms: 120, cd: 0, up: { reach: 1.2, skill: 1.3 }, down: { speed: 0.5 } } },
  { id: 'dash', name: '交叉步突进', icon: '⚡', kind: 'active', train: 'speed', level: 3, group: 'mobility', how: '按一下位移', effect: '短促爆发加速，带冷却', fx: { mode: 'tap', ms: 260, cd: 1800, up: { speed: 1.85 } } },
  { id: 'swiftStep', name: '疾影步', icon: '💨', kind: 'active', train: 'speed', level: 6, group: 'mobility', how: '按一下提速', effect: '持续更久的加速，力量略降', fx: { mode: 'tap', ms: 500, cd: 2200, up: { speed: 1.5 }, down: { power: 0.9 } } },
  { id: 'legDrive', name: '蹬地突进', icon: '🦿', kind: 'active', train: 'speed', level: 9, group: 'mobility', how: '按一下强力蹬地', effect: '速度 + 判定同时升，略耗体力', fx: { mode: 'tap', ms: 380, cd: 1800, up: { speed: 1.7, reach: 1.1 }, down: { stamina: 0.8 } } },
  { id: 'eagleEye', name: '鹰眼', icon: '👁️', kind: 'active', train: 'technique', level: 3, group: 'technique', how: '按住专注', effect: '容错大增，移速略降', fx: { mode: 'hold', ms: 120, cd: 0, up: { skill: 1.4 }, down: { speed: 0.9 } } },
  { id: 'netGuard', name: '封网', icon: '🛡️', kind: 'active', train: 'technique', level: 6, group: 'technique', how: '按住撑住拍面', effect: '拍面变大专吃网前球（站桩）', fx: { mode: 'hold', ms: 120, cd: 0, up: { reach: 1.3 }, down: { speed: 0.6 } } },
  { id: 'softHands', name: '软手搓球', icon: '🪶', kind: 'active', train: 'technique', level: 9, group: 'technique', how: '按一下放小球', effect: '出球变成贴网小球（落点收在网前），容错与判定提升', fx: { mode: 'tap', ms: 700, cd: 2500, up: { skill: 1.5, reach: 1.1 }, down: { power: 0.6 } }, shot: { elevation: 0.72, landWithin: 170, speedMul: 0.92 } },
  { id: 'ironWall', name: '铁壁', icon: '🧱', kind: 'active', train: 'stamina', level: 3, group: 'stamina', how: '按住省体力', effect: '更省体力，力量略降', fx: { mode: 'hold', ms: 120, cd: 0, up: { stamina: 1.4 }, down: { power: 0.85 } } },
  { id: 'overdrive', name: '暴走', icon: '🔥', kind: 'active', train: 'stamina', level: 6, group: 'stamina', momentum: 3, how: '按一下全开', effect: '几秒速度/力量/判定提升，体力狂掉', fx: { mode: 'tap', ms: 3000, cd: 9000, up: { speed: 1.2, power: 1.2, reach: 1.1 }, down: { stamina: 0.5 } } },
  { id: 'lastStand', name: '背水一战', icon: '🩸', kind: 'active', train: 'stamina', level: 9, star: 5, group: 'stamina', momentum: 4, how: '按一下豁出去', effect: '五维小升、很久，体力几乎见底', fx: { mode: 'tap', ms: 5000, cd: 12000, up: { speed: 1.15, power: 1.15, reach: 1.15, skill: 1.15 }, down: { stamina: 0.4 } } },

  // ══ 主动（新）：带条件 / 不同解锁方式 ══════════════════════════════
  { id: 'netKill', name: '网前扑杀', icon: '🎯', kind: 'active', group: 'attack', train: 'attack', level: 3,
    how: '网前按一下', effect: '出球变成平快扑杀：贴网压向中前场（落点收住），力量/判定都涨', when: 'netNear',
    unlock: { via: 'rank', points: 300 },
    fx: { mode: 'tap', ms: 340, cd: 1400, up: { power: 1.45, reach: 1.15 } }, shot: { elevation: 0.06, speedMul: 1.15, landWithin: 380 },
    branches: [br('kill', '凌空重压', '更重、判定更久', { upMul: 1.35, msMul: 1.2 }, { at: 5, name: '压制', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('quick', '快手', '冷却更短', { cdMul: 0.55 }, { at: 5, name: '快手', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'underdogSmash', name: '逆风重杀', icon: '🌪️', kind: 'active', group: 'attack', train: 'attack', level: 3,
    how: '落后时按一下', effect: '比分落后：力量大增（翻盘技）', when: 'behind',
    unlock: { via: 'arena', titles: 1 },
    fx: { mode: 'tap', ms: 400, cd: 2000, up: { power: 1.6 } },
    branches: [br('revenge', '绝地', '越落后越强（力量再高）', { upMul: 1.2 }, { at: 5, name: '绝地', desc: '发动时力量 +10%', up: { power: 1.1 } }), br('steady', '稳住', '代价更小、冷却更短', { cdMul: 0.6 }, { at: 5, name: '定力', desc: '发动时容错 +6%', up: { skill: 1.06 } })] },
  { id: 'bodySmash', name: '追身强扣', icon: '🥊', kind: 'active', group: 'attack', train: 'attack', level: 3,
    how: '按一下强扣', effect: '力量很重，但出球容错下降', unlock: { via: 'arena', titles: 3 },
    fx: { mode: 'tap', ms: 380, cd: 1600, up: { power: 1.5 }, down: { skill: 0.8 } },
    branches: [br('brute', '蛮力', '力量再上一档', { upMul: 1.25 }, { at: 5, name: '蛮力', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('aim', '准头', '容错不再扣', { downMul: 0.4 }, { at: 5, name: '准头', desc: '发动时容错 +8%', up: { skill: 1.08 } })] },
  { id: 'comboCannon', name: '连击重炮', icon: '🔗', kind: 'active', group: 'attack', train: 'attack', level: 3,
    how: '长回合按一下', effect: '本回合来回越多，力量越高', when: 'rallyLong',
    unlock: { via: 'weekly', cleared: 3 },
    fx: { mode: 'tap', ms: 360, cd: 1700, up: { power: 1.35 } },
    branches: [br('snowball', '滚雪球', '强度更高', { upMul: 1.3 }, { at: 5, name: '滚雪', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('fast', '快节奏', '冷却更短', { cdMul: 0.55 }, { at: 5, name: '快节奏', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'allInSmash', name: '破釜扣杀', icon: '🪓', kind: 'active', group: 'attack', train: 'attack', level: 3,
    how: '按住蓄势', effect: '按住期间出球全是陡直重杀（角度压向地面，判定收窄）', unlock: { via: 'scroll' },
    fx: { mode: 'hold', ms: 120, cd: 0, up: { power: 1.5 }, down: { reach: 0.7 } }, shot: { elevation: -0.26, speedMul: 1.06 },
    branches: [br('allin', '孤注', '力量更高', { upMul: 1.3 }, { at: 5, name: '孤注', desc: '发动时力量 +10%', up: { power: 1.1 } }), br('safe', '留手', '判定不再缩那么多', { downMul: 0.5 }, { at: 5, name: '留手', desc: '发动时判定 +6%', up: { reach: 1.06 } })] },

  { id: 'blockWall', name: '铁壁封堵', icon: '🧱', kind: 'active', group: 'defense', train: 'defense', level: 3,
    how: '按住封堵', effect: '判定 + 更省体力，但几乎站桩', unlock: { via: 'scroll' },
    fx: { mode: 'hold', ms: 120, cd: 0, up: { reach: 1.35, stamina: 1.2 }, down: { speed: 0.55 } },
    branches: [br('wall', '磐石', '判定更高', { upMul: 1.25 }, { at: 5, name: '磐石', desc: '发动时判定 +8%', up: { reach: 1.08 } }), br('mobile', '可动', '站桩代价减轻', { downMul: 0.5 }, { at: 5, name: '可动', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'lastDitch', name: '极限扑救', icon: '🆘', kind: 'active', group: 'defense', train: 'defense', level: 3,
    how: '体力见底时按一下', effect: '体力低：判定暴增（救命一扑）', when: 'staminaLow',
    unlock: { via: 'weekly', cleared: 4 },
    fx: { mode: 'tap', ms: 340, cd: 1600, up: { reach: 1.7 }, down: { speed: 0.4 } },
    branches: [br('desp', '拼命', '判定更高', { upMul: 1.25 }, { at: 5, name: '拼命', desc: '发动时判定 +8%', up: { reach: 1.08 } }), br('recover', '急起', '硬直更短', { msMul: 0.6 }, { at: 5, name: '急起', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'deflectWall', name: '反弹墙', icon: '🪞', kind: 'active', group: 'defense', train: 'defense', level: 3,
    how: '按住撑墙', effect: '判定 + 容错提升，移速略降', unlock: { via: 'scroll' },
    fx: { mode: 'hold', ms: 120, cd: 0, up: { reach: 1.25, skill: 1.2 }, down: { speed: 0.8 } },
    branches: [br('mirror', '镜面', '容错更高', { upMul: 1.2 }, { at: 5, name: '镜面', desc: '发动时容错 +8%', up: { skill: 1.08 } }), br('wide', '广域', '判定更高', { upMul: 1.2 }, { at: 5, name: '广域', desc: '发动时判定 +8%', up: { reach: 1.08 } })] },
  { id: 'blinkStep', name: '瞬步闪身', icon: '💫', kind: 'active', group: 'mobility', train: 'speed', level: 3, momentum: 2,
    how: '按一下闪身', effect: '极短超加速，冷却较长', unlock: { via: 'arena', titles: 2 },
    fx: { mode: 'tap', ms: 180, cd: 2600, up: { speed: 2.0 } },
    branches: [br('flash', '疾闪', '加速更高', { upMul: 1.15 }, { at: 5, name: '疾闪', desc: '发动时速度 +10%', up: { speed: 1.1 } }), br('ready', '就绪', '冷却更短', { cdMul: 0.5 }, { at: 5, name: '就绪', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'retreatStop', name: '后撤急停', icon: '↩️', kind: 'active', group: 'mobility', train: 'speed', level: 3,
    how: '落后时按一下', effect: '比分落后：快速退防，力量略降', when: 'behind',
    unlock: { via: 'weekly', cleared: 2 },
    fx: { mode: 'tap', ms: 420, cd: 1800, up: { speed: 1.4 }, down: { power: 0.85 } },
    branches: [br('brake', '急停', '加速更高', { upMul: 1.2 }, { at: 5, name: '急停', desc: '发动时速度 +6%', up: { speed: 1.06 } }), br('counter', '反手', '力量不再降', { downMul: 0.3 }, { at: 5, name: '反手', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  { id: 'pressNet', name: '前压上网', icon: '⬆️', kind: 'active', group: 'mobility', train: 'speed', level: 3,
    how: '网前按一下', effect: '网前：加速 + 判定提升', when: 'netNear',
    unlock: { via: 'rank', points: 400 },
    fx: { mode: 'tap', ms: 400, cd: 1800, up: { speed: 1.4, reach: 1.15 } },
    branches: [br('push', '逼抢', '判定更高', { upMul: 1.2 }, { at: 5, name: '逼抢', desc: '发动时判定 +8%', up: { reach: 1.08 } }), br('dart', '疾进', '加速更高', { upMul: 1.2 }, { at: 5, name: '疾进', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'feint', name: '假动作虚晃', icon: '🎭', kind: 'active', group: 'technique', train: 'technique', level: 3,
    how: '网前按一下', effect: '网前：出球变成贴网小吊（落点收在网前），骗对手重心', when: 'netNear',
    unlock: { via: 'arena', titles: 5 },
    fx: { mode: 'tap', ms: 650, cd: 2500, up: { skill: 1.5 }, down: { power: 0.7 } }, shot: { elevation: 0.62, landWithin: 150, speedMul: 0.9 },
    branches: [br('act', '逼真', '容错更高', { upMul: 1.25 }, { at: 5, name: '逼真', desc: '发动时容错 +10%', up: { skill: 1.1 } }), br('tempo', '变奏', '力量不再压那么多', { downMul: 0.4 }, { at: 5, name: '变奏', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  { id: 'clutchBurst', name: '濒死爆发', icon: '💢', kind: 'active', group: 'stamina', train: 'stamina', level: 3, momentum: 3,
    how: '体力见底时按一下', effect: '体力低：五维齐升（绝地反打）', when: 'staminaLow',
    unlock: { via: 'arena', titles: 4 },
    fx: { mode: 'tap', ms: 1600, cd: 6000, up: { speed: 1.25, power: 1.25, reach: 1.2, skill: 1.15 } },
    branches: [br('rage', '狂怒', '全面更高', { upMul: 1.2 }, { at: 5, name: '狂怒', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('endure', '续航', '持续更久', { msMul: 1.4 }, { at: 5, name: '续航', desc: '发动时体力 +8%', up: { stamina: 1.08 } })] },

  // ══ 第三批 ═══════════════════════════════════════════════════
  // 进攻
  { id: 'khSmash', name: '泰山压顶', icon: '⛰️', kind: 'active', group: 'attack', train: 'attack', level: 8, momentum: 2,
    how: '领先时按一下', effect: '领先：极重的一记高压', when: 'ahead', unlock: { via: 'rank', points: 700 },
    fx: { mode: 'tap', ms: 450, cd: 2600, up: { power: 1.65 } },
    branches: [br('crush', '压顶', '更重', { upMul: 1.3 }, { at: 5, name: '沉稳', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('wide', '余震', '判定更久更广', { msMul: 1.2 }, { at: 5, name: '余震', desc: '发动时判定 +6%', up: { reach: 1.06 } })] },
  { id: 'pierceSmash', name: '穿刺重扣', icon: '🗡️', kind: 'active', group: 'attack', train: 'attack', level: 8,
    how: '按一下穿刺', effect: '力量很重，但判定收窄', unlock: { via: 'arena', titles: 6 },
    fx: { mode: 'tap', ms: 400, cd: 2400, up: { power: 1.5 }, down: { reach: 0.9 } },
    branches: [br('tip', '尖锋', '力量更高', { upMul: 1.25 }, { at: 5, name: '尖锋', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('fix', '补正', '判定不再缩', { downMul: 0.4 }, { at: 5, name: '补正', desc: '发动时判定 +6%', up: { reach: 1.06 } })] },
  { id: 'rapidFire', name: '连珠快攻', icon: '🔫', kind: 'active', group: 'attack', train: 'attack', level: 5,
    how: '长回合按一下', effect: '长回合：又快又重', when: 'rallyLong', unlock: { via: 'weekly', cleared: 4 },
    fx: { mode: 'tap', ms: 350, cd: 1500, up: { power: 1.3, speed: 1.15 } },
    branches: [br('burst', '速射', '冷却更短', { cdMul: 0.55 }, { at: 5, name: '速射', desc: '发动时速度 +8%', up: { speed: 1.08 } }), br('heavy', '重弹', '力量更高', { upMul: 1.3 }, { at: 5, name: '重弹', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  { id: 'heavyHand', name: '千钧一击', icon: '🪨', kind: 'active', group: 'attack', train: 'attack', level: 5, momentum: 2,
    how: '按一下抡一记', effect: '抡出垂直重杀：出球角度压向地面（判定收窄、冷却长）', unlock: { via: 'scroll' },
    fx: { mode: 'tap', ms: 500, cd: 3200, up: { power: 1.7 }, down: { reach: 0.88 } }, shot: { elevation: -0.32 },
    branches: [br('mighty', '巨力', '力量再高', { upMul: 1.25 }, { at: 5, name: '巨力', desc: '发动时力量 +10%', up: { power: 1.1 } }), br('wind', '蓄势', '冷却更短', { cdMul: 0.7 }, { at: 5, name: '蓄势', desc: '发动时判定 +6%', up: { reach: 1.06 } })] },
  { id: 'skyDrop', name: '天降重锤', icon: '☄️', kind: 'active', group: 'attack', train: 'attack', level: 8,
    how: '领先时按一下', effect: '领先：重锤下压，容错略降', when: 'ahead', unlock: { via: 'arena', titles: 7 },
    fx: { mode: 'tap', ms: 420, cd: 2600, up: { power: 1.6 }, down: { skill: 0.9 } },
    branches: [br('meteor', '陨落', '力量更高', { upMul: 1.3 }, { at: 5, name: '陨落', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('aim', '精准', '容错不再扣', { downMul: 0.4 }, { at: 5, name: '精准', desc: '发动时容错 +8%', up: { skill: 1.08 } })] },
  // 防守
  { id: 'stoneWall', name: '石壁', icon: '🧱', kind: 'active', group: 'defense', train: 'defense', level: 8,
    how: '体力见底时按一下', effect: '体力低：判定暴增的最后一堵墙', when: 'staminaLow', unlock: { via: 'arena', titles: 8 },
    fx: { mode: 'tap', ms: 420, cd: 2200, up: { reach: 1.55 }, down: { speed: 0.45 } },
    branches: [br('rock', '磐石', '判定更高', { upMul: 1.25 }, { at: 5, name: '磐石', desc: '发动时判定 +8%', up: { reach: 1.08 } }), br('rise', '急起', '硬直更短', { msMul: 0.6 }, { at: 5, name: '急起', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'counterBeam', name: '反手挑高', icon: '🪃', kind: 'active', group: 'defense', train: 'defense', level: 5,
    how: '按一下挑高', effect: '出球变成高远球（真的改球路，把对手顶回后场），容错大增', unlock: { via: 'weekly', cleared: 5 },
    fx: { mode: 'tap', ms: 600, cd: 2400, up: { skill: 1.4 }, down: { power: 0.85 } }, shot: { elevation: 0.95, speedMul: 1.3 },
    branches: [br('high', '高挑', '容错更高', { upMul: 1.25 }, { at: 5, name: '高挑', desc: '发动时容错 +10%', up: { skill: 1.1 } }), br('steady', '稳手', '力量不再压', { downMul: 0.3 }, { at: 5, name: '稳手', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  // 移动
  { id: 'windRush', name: '疾风冲', icon: '🌬️', kind: 'active', group: 'mobility', train: 'speed', level: 8,
    how: '按一下冲刺', effect: '大幅加速一段', unlock: { via: 'rank', points: 700 },
    fx: { mode: 'tap', ms: 420, cd: 2000, up: { speed: 1.6 } },
    branches: [br('gale', '疾风', '加速更高', { upMul: 1.2 }, { at: 5, name: '疾风', desc: '发动时速度 +8%', up: { speed: 1.08 } }), br('chain', '连动', '冷却更短', { cdMul: 0.6 }, { at: 5, name: '连动', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'phantomStep', name: '幻影步', icon: '👥', kind: 'active', group: 'mobility', train: 'speed', level: 8,
    how: '按一下疾走', effect: '高速位移，力量略降', unlock: { via: 'arena', titles: 9 },
    fx: { mode: 'tap', ms: 360, cd: 2600, up: { speed: 1.8 }, down: { power: 0.85 } },
    branches: [br('ghost', '幻影', '加速更高', { upMul: 1.2 }, { at: 5, name: '幻影', desc: '发动时速度 +8%', up: { speed: 1.08 } }), br('real', '实招', '力量不再降', { downMul: 0.4 }, { at: 5, name: '实招', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  { id: 'teleportDart', name: '缩地', icon: '🌌', kind: 'active', group: 'mobility', train: 'speed', level: 8, momentum: 3,
    how: '按一下瞬移', effect: '极短超高速，冷却很长', unlock: { via: 'arena', titles: 10 },
    fx: { mode: 'tap', ms: 220, cd: 3400, up: { speed: 2.3 } },
    branches: [br('dart', '缩地', '更高', { upMul: 1.15 }, { at: 5, name: '缩地', desc: '发动时速度 +10%', up: { speed: 1.1 } }), br('breath', '回气', '冷却更短', { cdMul: 0.6 }, { at: 5, name: '回气', desc: '发动时体力 +8%', up: { stamina: 1.08 } })] },
  { id: 'reverseDash', name: '反冲', icon: '↪️', kind: 'active', group: 'mobility', train: 'speed', level: 5,
    how: '落后时按一下', effect: '落后：快速回位，力量略降', when: 'behind', unlock: { via: 'scroll' },
    fx: { mode: 'tap', ms: 420, cd: 2200, up: { speed: 1.5 }, down: { power: 0.9 } },
    branches: [br('wind', '逆风', '加速更高', { upMul: 1.2 }, { at: 5, name: '逆风', desc: '发动时速度 +6%', up: { speed: 1.06 } }), br('back', '反打', '力量不再降', { downMul: 0.3 }, { at: 5, name: '反打', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  // 技术
  { id: 'spinControl', name: '旋控', icon: '🌀', kind: 'active', group: 'technique', train: 'technique', level: 5,
    how: '按一下控旋', effect: '容错大增、力量压低', unlock: { via: 'arena', titles: 10 },
    fx: { mode: 'tap', ms: 600, cd: 2600, up: { skill: 1.45 }, down: { power: 0.85 } },
    branches: [br('spin', '旋精', '容错更高', { upMul: 1.25 }, { at: 5, name: '旋精', desc: '发动时容错 +8%', up: { skill: 1.08 } }), br('both', '兼顾', '力量不再压', { downMul: 0.4 }, { at: 5, name: '兼顾', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  { id: 'netTrick', name: '网前戏法', icon: '🎩', kind: 'active', group: 'technique', train: 'technique', level: 5,
    how: '网前按一下', effect: '网前：出球变成贴网戏法球（落点收在网前），容错大增', when: 'netNear', unlock: { via: 'weekly', cleared: 5 },
    fx: { mode: 'tap', ms: 650, cd: 2500, up: { skill: 1.5 }, down: { power: 0.7 } }, shot: { elevation: 0.68, landWithin: 185, speedMul: 0.9 },
    branches: [br('trick', '戏法', '容错更高', { upMul: 1.25 }, { at: 5, name: '戏法', desc: '发动时容错 +10%', up: { skill: 1.1 } }), br('tempo', '变奏', '力量不再压', { downMul: 0.4 }, { at: 5, name: '变奏', desc: '发动时力量 +6%', up: { power: 1.06 } })] },
  // 趣味
  { id: 'bananaSlip', name: '香蕉皮', icon: '🍌', kind: 'active', group: 'fun', train: 'speed', level: 5,
    how: '领先时按一下', effect: '领先：脚下一滑窜出去（力量略降）', when: 'ahead', unlock: { via: 'scroll' },
    fx: { mode: 'tap', ms: 400, cd: 2000, up: { speed: 1.5 }, down: { power: 0.9 } },
    branches: [br('slip', '打滑', '更快', { upMul: 1.2 }, { at: 5, name: '打滑', desc: '发动时速度 +6%', up: { speed: 1.06 } }), br('stand', '站稳', '力量不再降', { downMul: 0.4 }, { at: 5, name: '站稳', desc: '发动时力量 +6%', up: { power: 1.06 } })] },

  // ══ 支援 / 连招（新动词）═══════════════════════════════════════
  { id: 'buildUp', name: '蓄势待发', icon: '🧘', kind: 'active', group: 'stamina', train: 'stamina', level: 5,
    how: '按一下回气势', effect: '不追分时攒资源：立刻回复 🔥+3', unlock: { via: 'scroll' }, grantMomentum: 3,
    fx: { mode: 'tap', ms: 600, cd: 3000, up: { stamina: 1.1 } },
    branches: [br('calm', '静心', '顺带体力', { upMul: 1.0 }, { at: 5, name: '静心', desc: '发动时体力 +8%', up: { stamina: 1.08 } }), br('swift', '速蓄', '冷却更短', { cdMul: 0.6 }, { at: 5, name: '速蓄', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'relentless', name: '乘胜追击', icon: '🔁', kind: 'active', group: 'attack', train: 'attack', level: 5,
    how: '命中后强化下一板', effect: '这一击命中 → 下一板力量/判定 +15%（连招）', unlock: { via: 'weekly', cleared: 5 },
    chain: { up: { power: 1.15, reach: 1.08 }, ms: 1600 },
    fx: { mode: 'tap', ms: 350, cd: 2000, up: { power: 1.2 } },
    branches: [br('combo', '连招', '追击更强', { upMul: 1.2 }, { at: 5, name: '连招', desc: '发动时力量 +8%', up: { power: 1.08 } }), br('flow', '流畅', '冷却更短', { cdMul: 0.6 }, { at: 5, name: '流畅', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
  { id: 'secondWind', name: '重整旗鼓', icon: '🫧', kind: 'active', group: 'defense', train: 'defense', level: 5,
    how: '体力低时按一下', effect: '体力低：回气势 🔥+2 且大幅省体力', when: 'staminaLow', unlock: { via: 'scroll' }, grantMomentum: 2,
    fx: { mode: 'tap', ms: 800, cd: 4000, up: { stamina: 1.5, reach: 1.1 } },
    branches: [br('hold', '坚守', '续航更强', { upMul: 1.2 }, { at: 5, name: '坚守', desc: '发动时体力 +8%', up: { stamina: 1.08 } }), br('rise', '速起', '冷却更短', { cdMul: 0.6 }, { at: 5, name: '速起', desc: '发动时速度 +6%', up: { speed: 1.06 } })] },
];

export const SKILL_BY_ID: Record<SkillId, SkillMeta> = Object.fromEntries(
  SKILLS.map((s) => [s.id, s]),
) as Record<SkillId, SkillMeta>;

// ---- 🌳 技能族（母招）：把近似的招式归到一棵树下展示（不删技能，只归组）---------
export interface SkillFamily {
  id: string;
  name: string;
  icon: string;
}
export const SKILL_FAMILIES: SkillFamily[] = [
  { id: 'smash', name: '重杀', icon: '💥' },
  { id: 'combo', name: '连击', icon: '🔗' },
  { id: 'save', name: '扑救', icon: '🐟' },
  { id: 'dash', name: '突击', icon: '⚡' },
  { id: 'net', name: '网前', icon: '🕸️' },
  { id: 'guard', name: '封堵', icon: '🛡️' },
  { id: 'burst', name: '爆发', icon: '🔥' },
  { id: 'touch', name: '手感', icon: '✋' },
  { id: 'support', name: '支援', icon: '🧘' },
  { id: 'fun', name: '趣味', icon: '🎭' },
];
const FAMILY_BY_ID: Record<string, SkillFamily> = Object.fromEntries(
  SKILL_FAMILIES.map((f) => [f.id, f]),
);

/** 每个招式归哪个族 */
const SKILL_FAMILY: Record<SkillId, string> = {
  charge: 'smash', jumpSmash: 'smash', spinSmash: 'smash', underdogSmash: 'smash',
  bodySmash: 'smash', allInSmash: 'smash', khSmash: 'smash',
  pierceSmash: 'smash', heavyHand: 'smash', skyDrop: 'smash',
  comboCannon: 'combo', rapidFire: 'combo', relentless: 'combo',
  dive: 'save', aerialDive: 'save', lastDitch: 'save', stoneWall: 'save',
  dash: 'dash', swiftStep: 'dash', legDrive: 'dash', blinkStep: 'dash', retreatStop: 'dash',
  windRush: 'dash', phantomStep: 'dash', teleportDart: 'dash',
  reverseDash: 'dash',
  netGuard: 'net', softHands: 'net', netKill: 'net', pressNet: 'net', feint: 'net',
  netTrick: 'net',
  rooted: 'guard', ironWall: 'guard', blockWall: 'guard', deflectWall: 'guard',
  counterBeam: 'guard',
  overdrive: 'burst', lastStand: 'burst', clutchBurst: 'burst',
  eagleEye: 'touch', spinControl: 'touch',
  buildUp: 'support', secondWind: 'support',
  bananaSlip: 'fun',
};

export function familyOf(id: SkillId): SkillFamily {
  return FAMILY_BY_ID[SKILL_FAMILY[id]] ?? { id: 'misc', name: '其它', icon: '❔' };
}

/** 某招式的解锁方式（不填 = train） */
export function skillUnlock(m: SkillMeta): SkillUnlock {
  return m.unlock ?? { via: 'train', key: m.train, level: m.level };
}

export function skillUnlocked(id: SkillId, levels: Partial<Record<TrainKey, number>>): boolean {
  const m = SKILL_BY_ID[id];
  return (levels?.[m.train] ?? 0) >= m.level;
}
export function skillUnlockMap(
  levels: Partial<Record<TrainKey, number>>,
): Record<SkillId, boolean> {
  const out = {} as Record<SkillId, boolean>;
  for (const m of SKILLS) out[m.id] = (levels?.[m.train] ?? 0) >= m.level;
  return out;
}

/** 解锁花费的「招式秘籍」：train 档按等级推导；其它方式基础 3 本（被动/稀有另计） */
export function skillCost(m: SkillMeta): number {
  if (typeof m.cost === 'number') return m.cost;
  if (m.unlock && m.unlock.via !== 'train') return 3;
  if (m.level <= 3) return 0;
  if (m.level <= 6) return 3;
  return 6;
}

/** 📦 星级（1~5）：不填按解锁档位推导，可逐条覆写 */
export function skillStar(m: SkillMeta): number {
  if (typeof m.star === 'number') return m.star;
  if (m.level <= 3) return 2;
  if (m.level <= 6) return 3;
  return 4;
}

// ---- 📈 熟练度 ----------------------------------------------------------------
export const MASTERY_LEVEL_XP = [0, 5, 15, 30, 55, 90];
export const MASTERY_MAX_LEVEL = MASTERY_LEVEL_XP.length - 1;
export const MASTERY_BRANCH_LEVEL = 3;
export const BRANCH_COST = 500;

export function masteryLevel(xp: number): number {
  let lv = 0;
  for (let i = 0; i < MASTERY_LEVEL_XP.length; i++) if (xp >= MASTERY_LEVEL_XP[i]) lv = i;
  return lv;
}
export function masteryProgress(xp: number): number {
  const lv = masteryLevel(xp);
  if (lv >= MASTERY_MAX_LEVEL) return 1;
  const lo = MASTERY_LEVEL_XP[lv];
  const hi = MASTERY_LEVEL_XP[lv + 1];
  return Math.max(0, Math.min(1, (xp - lo) / (hi - lo)));
}

export function skillBranches(m: SkillMeta): SkillBranch[] {
  return m.branches ?? BRANCH_ARCHETYPES;
}
export function branchModOf(m: SkillMeta, branchId?: string): BranchMod | null {
  if (!branchId) return null;
  return skillBranches(m).find((b) => b.id === branchId)?.mod ?? null;
}
/** 该分支的「质变」（没到 `at` 级或没选分支则 null） */
export function branchAwakenOf(m: SkillMeta, branchId: string | undefined, masteryXp: number): Awaken | null {
  if (!branchId) return null;
  const b = skillBranches(m).find((x) => x.id === branchId);
  if (!b?.awaken) return null;
  return masteryLevel(masteryXp) >= b.awaken.at ? b.awaken : null;
}

// ---- 🔗 套装协同：带上指定的几个招式 → 触发一条额外被动 ----------------------
// 这是给「3 个携带槽」加入 build 的第一步（让选择之间有搭配，而不是各乘各的）。
export interface SkillSynergy {
  id: string;
  name: string;
  desc: string;
  /** 需要同时携带的招式 */
  skills: SkillId[];
  up?: Partial<Record<SkillAttr, number>>;
  down?: Partial<Record<SkillAttr, number>>;
}

export const SKILL_SYNERGIES: SkillSynergy[] = [
  { id: 'bruiser', name: '攻守兼备', desc: '穿刺重扣 + 反弹墙：力量/判定各 +6%', skills: ['pierceSmash', 'deflectWall'], up: { power: 1.06, reach: 1.06 } },
  { id: 'tempest', name: '疾风连击', desc: '突进 + 连珠快攻：速度 +8%', skills: ['dash', 'rapidFire'], up: { speed: 1.08 } },
  { id: 'netmaster', name: '网前大师', desc: '网前戏法 + 封网：容错 +8%', skills: ['netTrick', 'netGuard'], up: { skill: 1.08 } },
  { id: 'counterpunch', name: '铁壁反攻', desc: '石壁 + 反手挑高：判定/力量 +6%', skills: ['stoneWall', 'counterBeam'], up: { reach: 1.06, power: 1.06 } },
  { id: 'windform', name: '灵巧身法', desc: '瞬步闪身 + 幻影步：速度 +8%', skills: ['blinkStep', 'phantomStep'], up: { speed: 1.08 } },
  { id: 'ironlung', name: '钢铁肺腑', desc: '铁壁 + 蓄势待发：体力 +10%', skills: ['ironWall', 'buildUp'], up: { stamina: 1.1 } },
];

/** 当前携带的招式里，已经凑齐的协同 */
export function activeSynergies(equipped: SkillId[]): SkillSynergy[] {
  return SKILL_SYNERGIES.filter((s) => s.skills.every((k) => equipped.includes(k)));
}
