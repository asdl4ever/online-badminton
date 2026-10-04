import { DEFAULT_COSMETIC } from '../game/cosmetics';
import { NEUTRAL_STATS } from '../game/ai';
import { ensureStats, type AiPlayer } from '../game/players';
import { worldState } from '../game/world-arena';
import type { MatchOpponent } from '../game/scenes/GameScene';

/**
 * **赛事中心正在直播的那一场**：球馆后排的「100 赛 / 200 赛」中央场地、影院大屏、
 * 观战台都是同一件事——从赛事中心的赛程里挑出**此刻在打**的那一场，变成
 * 两个 `MatchOpponent` 喂给 `GameCanvas` 的 `spectate`（双 AI 播放）。
 *
 * 数据源就是赛事中心那一份（`world-arena.ts`，纯函数、不写状态）：
 * `worldState(roster, now)` → `{ cups, liveMatches }`；档位就是报名的
 * 100 / 200 / … / 1000 赛（`ARENA_TIERS` 的 `tier`，如 `l100` / `l200`）。
 */
export interface LiveBroadcast {
  /** 换场就变：场地用它当 `key` 整块重挂（Phaser 对局不能「中途换人」） */
  key: string;
  /** 杯下标 / 档位 id */
  cup: number;
  tierId: string;
  /** 「小白公开赛 · 4 强赛」这种，摆在场地上方的牌子用 */
  label: string;
  round: number;
  index: number;
  left: MatchOpponent;
  right: MatchOpponent;
  /** 此刻是否真的在直播窗口里（false = 轮次间隙，只在放「上一场」） */
  live: boolean;
  /** 没在直播时：本届 / 下一场什么时候开始 */
  nextAt: number;
}

const toOpp = (p: AiPlayer | undefined, fallback: string): MatchOpponent => ({
  name: p?.name ?? fallback,
  cosmetic: p?.cosmetic ?? DEFAULT_COSMETIC,
  stats: p ? ensureStats(p) : NEUTRAL_STATS,
});

/**
 * 取某档（`l100` / `l200`…）此刻要播的那一场。
 * 正在直播就播它；轮次间隙里就播这一轮已经打完的 / 待打的最后一场（画面不空着）。
 * 该档一个人都没有（名人堂太空）时返回 `null`。
 */
export function arenaLive(
  roster: readonly AiPlayer[],
  tierId: string,
  now: number = Date.now(),
): LiveBroadcast | null {
  const st = worldState(roster, now);
  const cup = st.cups.find((c) => c.tier.id === tierId);
  if (!cup) return null;

  const ref = st.liveMatches.find((m) => m.cup === cup.id);
  let round = ref?.round ?? cup.round;
  let index = ref?.index ?? 0;
  let match = cup.rounds[round]?.[index];
  // 轮次间隙：本轮的场次可能还没生成，退回上一轮的最后一场
  if (!match && round > 0) {
    round -= 1;
    const row = cup.rounds[round] ?? [];
    index = Math.max(0, row.length - 1);
    match = row[index];
  }
  if (!match) return null;

  return {
    key: `${tierId}-s${cup.season}-r${round}-i${index}`,
    cup: cup.id,
    tierId,
    label: `${cup.name} · ${cup.roundNames[round] ?? ''}`.trim(),
    round,
    index,
    left: toOpp(
      roster.find((p) => p.id === match.a),
      '待定',
    ),
    right: toOpp(
      roster.find((p) => p.id === match.b),
      '待定',
    ),
    live: Boolean(ref),
    nextAt: cup.nextAt,
  };
}
