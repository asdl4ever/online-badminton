<script setup lang="ts">
import { computed } from 'vue';
import { ARENA_ROUNDS, type ArenaBracket, type ArenaEntrant } from '../game/arena';

/**
 * 晋级赛对阵树：从左到右四列（16 强 → 8 强 → 4 强 → 决赛）。
 * 每场显示两位参赛者，胜者高亮、败者划线；玩家所在的那一场会特别标出来。
 */
const props = defineProps<{
  rounds: ArenaBracket;
  entrants: ArenaEntrant[];
  /** 当前轮次（用于高亮「正在进行」的那一场） */
  currentRound: number;
}>();

const emit = defineEmits<{ select: [id: string] }>();

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
        {{ ARENA_ROUNDS[ri] }}
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
</style>
