/**
 * 🗓 **本机周赛**：每周固定 5 关 AI 关卡（逐关变强），按 ISO 周号确定性生成——
 * 同一周里谁打开看到的都是同一套对手；下周自动换人、进度与「本机榜」重置。
 *
 * 这是纯本机内容（不联网、不录像）：给 PvP 之外一个「随时能打、有目标、有周奖励」的去处，
 * 让训练出来的属性（`attrsFromStats`）有一个能立刻变现的舞台。
 */
import type { PlayerStats } from './players';
import { statPower } from './players';

export const WEEKLY_STAGES = 5;

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
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
const clamp = (v: number): number => Math.max(1, Math.min(100, Math.round(v)));

/**
 * 周号：以「周一」为一周起点、自 Unix 纪元起算的周数。
 * 只求稳定（同一天任何人、刷新都不变），不追求严格 ISO 8601 边界。
 */
export function currentWeek(now: number = Date.now()): number {
  return Math.floor((now / 86_400_000 + 4) / 7);
}

export interface WeeklyStage {
  /** 0..WEEKLY_STAGES-1 */
  idx: number;
  /** 关卡名（热身 / 淘汰 …） */
  round: string;
  /** 本周这一关的对手外号 */
  name: string;
  /** 对手五维（自定义对局直接吃它） */
  stats: PlayerStats;
  /** 首通奖励：金币 / 荣誉点 / 招式秘籍 */
  coins: number;
  honor: number;
  scrolls: number;
}

const ROUNDS = ['热身赛', '淘汰赛', '复赛', '半决赛', '总决赛'];
const BASE = [42, 54, 66, 78, 92];
const COINS = [150, 300, 520, 820, 1300];
const HONOR = [0, 1, 2, 4, 8];
const SCROLLS = [0, 0, 1, 1, 2];
const SURNAME = ['热', '快', '铁', '稳', '猛', '老', '冷', '黑', '旋', '重', '巧', '疾'];
const GIVEN = ['手', '刀', '壁', '将', '虎', '鹰', '影', '风', '锤', '箭', '云', '狼'];

/** 某一周的 5 关（按周号确定性随机；对手由弱到强） */
export function weeklyStages(week: number): WeeklyStage[] {
  const rng = mulberry32(hashStr('weekly') ^ Math.imul(week, 2654435761));
  const out: WeeklyStage[] = [];
  for (let i = 0; i < WEEKLY_STAGES; i++) {
    const b = BASE[i];
    const j = (): number => (rng() - 0.5) * 12;
    const stats: PlayerStats = {
      technique: clamp(b + j()),
      speed: clamp(b + j()),
      attack: clamp(b + j()),
      defense: clamp(b + j()),
      stamina: clamp(b + j()),
    };
    const name =
      SURNAME[Math.floor(rng() * SURNAME.length)] + GIVEN[Math.floor(rng() * GIVEN.length)];
    out.push({ idx: i, round: ROUNDS[i], name, stats, coins: COINS[i], honor: HONOR[i], scrolls: SCROLLS[i] });
  }
  return out;
}

/** 一关对手的综合分（界面排序 / 标签用） */
export function weeklyStagePower(s: WeeklyStage): number {
  return statPower(s.stats);
}

/** 累计首通系数：清到第 k 关（0-based），本周已经拿到的金币总量 */
export function weeklyTotalCoins(stages: WeeklyStage[], cleared: number): number {
  return stages.slice(0, cleared).reduce((sum, s) => sum + s.coins, 0);
}
export function weeklyTotalHonor(stages: WeeklyStage[], cleared: number): number {
  return stages.slice(0, cleared).reduce((sum, s) => sum + s.honor, 0);
}

/** 本机周赛存档 */
export interface WeeklySave {
  /** 存档对应的周号（!= 当前周号时重置） */
  week: number;
  /** 本周已首通到第几关（0..WEEKLY_STAGES，即「已通 N 关」） */
  cleared: number;
  /** 历史（往期最好成绩），本机榜用 */
  history: { week: number; cleared: number; at: number }[];
}

export function emptyWeekly(): WeeklySave {
  return { week: 0, cleared: 0, history: [] };
}
