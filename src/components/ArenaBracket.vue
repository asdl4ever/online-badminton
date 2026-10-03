<script setup lang="ts">
import { computed } from 'vue';
import { ARENA_ROUNDS, type ArenaBracket, type ArenaEntrant } from '../game/arena';

/**
 * 晋级赛对阵树：从左到右按轮次分列（列名可用 `roundNames` 覆盖，杯型不同列数不同）。
 * 每场显示两位参赛者，胜者高亮、败者划线；玩家所在的那一场会特别标出来。
 * 世界赛还会传：`matchNote`（轮空 / 未开赛倒计时）、`liveKeys`（正在直播、可点「👁 观看」）
 * 与 `activeKey`（大屏正在播的那场，标「📺 正在播」）。
 */
const props = defineProps<{
  rounds: ArenaBracket;
  entrants: ArenaEntrant[];
  /** 当前轮次（用于高亮「正在进行」的那一场） */
  currentRound: number;
  /**
   * 每场的状态，键是 `${轮}:${场}`（世界赛 / 观战台用）。
   * 不传就完全不显示状态角标——晋级赛页面维持原样。
   */
  matchPhase?: Record<string, 'upcoming' | 'live' | 'ended'>;
  /** 现在可以点进去真看的那一场（键同 `matchPhase`，单场版） */
  liveKey?: string;
  /** 正在直播的那些场次（可点「👁 观看」切台） */
  liveKeys?: readonly string[];
  /** 大屏正在播的那一场（标「📺 正在播」） */
  activeKey?: string;
  /** 每场的补充说明（轮空 / 倒计时），有就替代状态文字 */
  matchNote?: Record<string, string>;
  /** 轮次名（杯型不是 16 强时用） */
  roundNames?: readonly string[];
}>();

const emit = defineEmits<{ select: [id: string]; watch: [round: number, index: number] }>();

const keyOf = (r: number, i: number): string => `${r}:${i}`;

const colTitle = (ri: number): string => props.roundNames?.[ri] ?? ARENA_ROUNDS[ri] ?? '';

function phaseOf(r: number, i: number): 'upcoming' | 'live' | 'ended' {
  return props.matchPhase?.[keyOf(r, i)] ?? 'upcoming';
}

function phaseText(r: number, i: number): string {
  const note = props.matchNote?.[keyOf(r, i)];
  if (note) return note;
  const p = phaseOf(r, i);
  return p === 'live' ? '🔴 进行中' : p === 'ended' ? '已结束' : '未开始';
}

/** 正在直播（可点「👁 观看」） */
function isLive(r: number, i: number): boolean {
  const k = keyOf(r, i);
  return props.liveKey === k || (props.liveKeys?.includes(k) ?? false);
}

const meId = computed(() => props.entrants.find((e) => e.isMe)?.id ?? '__me__');

const nameById = computed(() => {
  const m = new Map<string, string>();
  for (const e of props.entrants) m.set(e.id, e.name);
  return m;
});

function nameOf(id: string): string {
  if (!id) return '—';
  return nameById.value.get(id) ?? '—';
}

function slotClass(winner: string | null, id: string): string {
  if (!id) return 'is-empty';
  if (!winner) return '';
  return winner === id ? 'is-winner' : 'is-out';
}

function isMine(a: string, b: string): boolean {
  return a === meId.value || b === meId.value;
}
</script>

<template>
  <div class="bracket">
    <div v-for="(round, ri) in rounds" :key="ri" class="bracket-col">
      <div class="bracket-col__title" :class="{ 'is-now': ri === currentRound }">
        {{ colTitle(ri) }}
      </div>
      <div class="bracket-col__matches">
        <div
          v-for="(m, mi) in round"
          :key="mi"
          class="match"
          :class="{
            'is-mine': isMine(m.a, m.b),
            'is-now': ri === currentRound && isMine(m.a, m.b),
          }"
        >
          <button
            class="match__slot"
            :class="slotClass(m.winner, m.a)"
            type="button"
            :disabled="!m.a"
            @click="m.a && emit('select', m.a)"
          >
            {{ nameOf(m.a) }}
          </button>
          <button
            class="match__slot"
            :class="slotClass(m.winner, m.b)"
            type="button"
            :disabled="!m.b"
            @click="m.b && emit('select', m.b)"
          >
            {{ nameOf(m.b) }}
          </button>
          <div v-if="matchPhase" class="match__meta">
            <span class="match__badge" :class="`is-${phaseOf(ri, mi)}`">
              {{ phaseText(ri, mi) }}
            </span>
            <span v-if="activeKey === keyOf(ri, mi)" class="match__onair num">📺 正在播</span>
            <button
              v-else-if="isLive(ri, mi)"
              class="match__watch"
              type="button"
              @click="emit('watch', ri, mi)"
            >
              👁 观看
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bracket {
  display: flex;
  gap: var(--s3);
  overflow-x: auto;
  padding-bottom: var(--s2);
}

.bracket-col {
  flex: none;
  width: 148px;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.bracket-col__title {
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-dim);
  padding: 2px 0;
}

.bracket-col__title.is-now {
  color: var(--accent);
}

.bracket-col__matches {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 6px;
}

.match {
  display: flex;
  flex-direction: column;
  border-radius: var(--r-sm, 8px);
  border: 1px solid var(--line);
  background: var(--surface-2);
  overflow: hidden;
}

.match.is-mine {
  border-color: color-mix(in srgb, var(--accent) 55%, var(--line));
}

.match.is-now {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent);
}

.match__slot {
  display: block;
  width: 100%;
  padding: 4px 8px;
  border: none;
  background: transparent;
  text-align: left;
  font: inherit;
  font-size: 12px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.match__slot:disabled {
  cursor: default;
}

.match__slot:not(:disabled):hover {
  color: var(--accent);
}

.match__slot + .match__slot {
  border-top: 1px solid var(--line);
}

.match__slot.is-empty {
  color: var(--text-dim);
}

.match__slot.is-winner {
  color: var(--text);
  font-weight: 700;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
}

.match__slot.is-out {
  color: var(--text-dim);
  text-decoration: line-through;
  opacity: 0.65;
}

/* 世界赛 / 观战台：每场的状态 + 「观看」 */
.match__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 3px 8px 4px;
  border-top: 1px solid var(--line);
  background: color-mix(in srgb, var(--surface-2) 60%, transparent);
}

.match__badge {
  font-size: 11px;
  color: var(--text-dim);
}

.match__badge.is-live {
  color: var(--accent);
  font-weight: 700;
}

.match__badge.is-ended {
  opacity: 0.7;
}

.match__watch {
  border: 1px solid color-mix(in srgb, var(--accent) 55%, var(--line));
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--text);
  font: inherit;
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 999px;
  cursor: pointer;
}

.match__watch:hover {
  background: color-mix(in srgb, var(--accent) 26%, transparent);
}

.match__onair {
  flex: none;
  font-size: 10px;
  font-weight: 700;
  color: #ff6a72;
}
</style>
