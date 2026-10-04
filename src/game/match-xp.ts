import type { ShotKind } from './types';
import { TRAIN_META, type TrainKey } from './training';

/**
 * **「打比赛也在变强」（方案 B）**：把一场比赛里「你实际打出来的东西」换成五维经验。
 *
 * | 这场干了什么 | 长哪一维 |
 * |---|---|
 * | 扣杀多 / 主动进攻得分 | 进攻 |
 * | 接杀成功多 / 失误少 | 防守 |
 * | 跑动距离长 | 速度 |
 * | 出球稳、下网少 | 技术 |
 * | 挥拍多、一直在动 | 体力 |
 *
 * 统计由 `GameScene` 边打边攒（**渲染层，不进模拟**，所以不影响联机确定性 / 快照），
 * 结算时 `rawMatchXp()` 换成原始分，`progress.gainMatchXp()` 再乘上
 * **基准系数 × 对手强度 × 比赛质量 × 同对手递减 × 每日额度** 之后加到 `trainLevels` 上。
 *
 * 和健身房的关系：**健身房是「定向 + 高效」，比赛是「覆盖面 + 顺手有收益」**。
 * 想精准补某一维还是得去练；打比赛则顺带把五维都推一点。
 */
export interface MatchTally {
  /** 双方击球次数（按类型） */
  hits: [Record<ShotKind, number>, Record<ShotKind, number>];
  /** 双方跑动距离（像素，只累加水平位移） */
  travel: [number, number];
  /** 下网（非受迫失误）次数 */
  faults: [number, number];
  /** 接杀成功：对手刚扣杀、自己接起来了 */
  saves: [number, number];
  /** 扣杀直接得分 */
  smashWins: [number, number];
  /** 这一场一共打了几次分 */
  points: number;
  /** 最长的一拍来回（击球次数） */
  longestRally: number;
  /** 本场时长（秒） */
  seconds: number;
}

const SHOT_KINDS: ShotKind[] = ['lift', 'drive', 'clear', 'smash', 'serve'];

function emptyKinds(): Record<ShotKind, number> {
  return { lift: 0, drive: 0, clear: 0, smash: 0, serve: 0 };
}

export function emptyTally(): MatchTally {
  return {
    hits: [emptyKinds(), emptyKinds()],
    travel: [0, 0],
    faults: [0, 0],
    saves: [0, 0],
    smashWins: [0, 0],
    points: 0,
    longestRally: 0,
    seconds: 0,
  };
}

export interface MatchTallyTracker {
  /** 纯数据：给 HUD / 结算读 */
  readonly value: MatchTally;
  /** 一次击球（`player` 是出手的那位） */
  hit(player: 0 | 1, kind: ShotKind): void;
  /** 有人把球打下网了（sim 的 net 事件不带 player，这里按「刚击球的那位」算） */
  net(): void;
  /** 这一分结束了 */
  point(scorer: 0 | 1): void;
  /** 累加水平位移 */
  travel(player: 0 | 1, dx: number): void;
  /** 累加时长（只在比赛进行中调） */
  tick(dt: number): void;
}

/**
 * 边打边攒的统计器。内部记着「上一拍是谁、什么球」——
 * 所以能判「接杀成功」（对手扣杀后我接起来）和「扣杀直接得分」（我扣完这分归我）。
 */
export function createMatchTally(): MatchTallyTracker {
  const value = emptyTally();
  let last: { p: 0 | 1; kind: ShotKind } | null = null;
  let rally = 0;

  return {
    get value() {
      return value;
    },
    hit(player, kind) {
      if (last && last.p !== player && last.kind === 'smash') value.saves[player] += 1;
      value.hits[player][kind] += 1;
      rally += 1;
      if (rally > value.longestRally) value.longestRally = rally;
      last = { p: player, kind };
    },
    net() {
      if (last) value.faults[last.p] += 1;
      last = null;
      rally = 0;
    },
    point(scorer) {
      if (last && last.p === scorer && last.kind === 'smash') value.smashWins[scorer] += 1;
      value.points += 1;
      last = null;
      rally = 0;
    },
    travel(player, dx) {
      value.travel[player] += dx;
    },
    tick(dt) {
      value.seconds += dt;
    },
  };
}

/** 每一项的原始分封顶：免得某一维（比如跑动）一家独大 */
const PER_KEY_CAP = 60;
const cap = (v: number): number => Math.max(0, Math.min(PER_KEY_CAP, v));

const countKinds = (h: Record<ShotKind, number>): number =>
  SHOT_KINDS.reduce((n, k) => n + h[k], 0);

/**
 * 这一场「每一维练了多少」的原始分（还没乘对手强度 / 质量 / 额度）。
 *
 * 系数都在这里，想调手感改这一个函数即可。
 */
export function rawMatchXp(t: MatchTally, me: 0 | 1): Record<TrainKey, number> {
  const h = t.hits[me];
  const hitsTotal = countKinds(h);
  const hitsOk = hitsTotal - h.serve; // 发球不算「成功击球」
  const travel = t.travel[me];
  const faults = t.faults[me];
  return {
    attack: cap(h.smash * 3 + t.smashWins[me] * 6),
    defense: cap(t.saves[me] * 6 + Math.max(0, 15 - faults * 2)),
    speed: cap(travel / 100),
    technique: cap(hitsOk * 0.8 - faults * 3),
    stamina: cap(hitsTotal + travel / 200),
  };
}

/**
 * **基准系数**：所有比赛经验的统一缩放（只调手感就动这一个数）。
 *
 * 0.7 —— 整体往下压了三成：五维靠打比赛「顺手长」的速度要慢于健身房那种
 * 定向苦练，不然一晚上刷几场就把一维推上去了。
 */
export const MATCH_XP_SCALE = 0.7;

/**
 * 对手强度系数：对面 rating 越高给得越多，1500 为基准（0.6~1.8）。
 * 打随机人机（rating 900~1800）差不多就是 0.6~1.2 倍。
 */
export function opponentMul(opponentRating?: number): number {
  if (opponentRating == null || !Number.isFinite(opponentRating)) return 1;
  return Math.max(0.6, Math.min(1.8, opponentRating / 1500));
}

/**
 * 比赛质量系数：**赢了给得多、打得久给得多**（总分多、来回长）。
 * 11:9 这种拉锯 ≈ 1.1；11:1 速胜 ≈ 0.9；输球再打 0.6 折。
 */
export function qualityMul(t: MatchTally, win: boolean): number {
  const games = Math.min(0.8, t.points / 20);
  const rally = Math.min(0.3, t.longestRally / 40);
  return (win ? 1 : 0.6) * (0.6 + games + rally);
}

export interface MatchXpGain {
  key: TrainKey;
  xp: number;
}

/** 把原始分乘上各种系数、取整、丢掉 0，得到最终「哪一维加了多少经验」 */
export function scaleMatchXp(
  raw: Record<TrainKey, number>,
  mul: number,
): MatchXpGain[] {
  const out: MatchXpGain[] = [];
  for (const key of Object.keys(raw) as TrainKey[]) {
    const xp = Math.round(raw[key] * mul);
    if (xp > 0) out.push({ key, xp });
  }
  return out;
}

/** 「进攻 +36 · 速度 +40 …」——结算提示用 */
export function formatGains(gains: MatchXpGain[]): string {
  return gains.map((g) => `${TRAIN_META[g.key].label} +${g.xp}`).join(' · ');
}
