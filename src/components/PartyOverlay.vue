<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Button from './ui/Button.vue';
import { optionById, type PartyState } from '../game/config';

const props = defineProps<{
  state: PartyState;
  localName: string;
  remoteName: string;
}>();

const emit = defineEmits<{ vote: [string]; next: [] }>();

/** ticks the vote countdown */
const now = ref(Date.now());
let timer: number | undefined;
onMounted(() => {
  timer = window.setInterval(() => {
    now.value = Date.now();
  }, 200);
});
onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
});

const secondsLeft = computed(() =>
  Math.max(0, Math.ceil((props.state.voteEndsAt - now.value) / 1000)),
);
const myVote = computed(() => props.state.votes[0]);
const peerVote = computed(() => props.state.votes[1]);

const totals = computed(() => {
  const s = props.state.scores;
  return s[0] === s[1] ? null : s[0] > s[1] ? 0 : 1;
});

function label(id: string | null): string {
  return id ? (optionById(id)?.label ?? id) : '未选';
}

function desc(id: string): string {
  return optionById(id)?.desc ?? '';
}
</script>

<template>
  <div v-if="state.active" class="po">
    <!-- ---------------- vote ---------------- -->
    <div v-if="state.stage === 'vote'" class="po__panel">
      <div class="po__head">
        <span class="po__round">第 {{ state.round }} / {{ state.total }} 轮</span>
        <span class="po__timer">{{ secondsLeft }}s</span>
      </div>
      <h3 class="po__title">投票选择本轮玩法</h3>

      <div class="po__options">
        <button
          v-for="id in state.options"
          :key="id"
          class="po__option"
          :class="{ 'is-picked': myVote === id, 'is-peer': peerVote === id && myVote !== id }"
          type="button"
          :disabled="!!myVote"
          @click="emit('vote', id)"
        >
          <span class="po__option-label">{{ label(id) }}</span>
          <span class="po__option-desc">{{ desc(id) }}</span>
        </button>
      </div>

      <div class="po__votes">
        <span>{{ localName }}：{{ label(myVote) }}</span>
        <span>{{ remoteName }}：{{ peerVote ? label(peerVote) : '思考中…' }}</span>
      </div>
    </div>

    <!-- ---------------- scoreboard ---------------- -->
    <div v-else-if="state.stage === 'result'" class="po__panel">
      <h3 class="po__title">第 {{ state.round }} 轮结束</h3>

      <table class="po__table">
        <thead>
          <tr>
            <th>轮次</th>
            <th>玩法</th>
            <th>结果</th>
            <th>胜者</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in state.results" :key="r.round">
            <td>{{ r.round }}</td>
            <td>{{ r.label }}</td>
            <td>{{ r.detail }}</td>
            <td>{{ r.winner < 0 ? '平局' : r.winner === 0 ? localName : remoteName }}</td>
          </tr>
        </tbody>
      </table>

      <div class="po__totals">
        <span :class="{ 'is-lead': totals === 0 }">{{ localName }} {{ state.scores[0] }}</span>
        <span class="po__sep">:</span>
        <span :class="{ 'is-lead': totals === 1 }">{{ state.scores[1] }} {{ remoteName }}</span>
      </div>

      <Button v-if="state.localCanAdvance" variant="primary" block @click="emit('next')">
        {{ state.round >= state.total ? '查看总成绩' : '下一轮' }}
      </Button>
      <p v-else class="muted po__wait">等待房主继续…</p>
    </div>

    <!-- ---------------- champion ---------------- -->
    <div v-else-if="state.stage === 'done'" class="po__panel">
      <h3 class="po__title">
        {{
          totals === null
            ? '平局收场！'
            : totals === 0
              ? `${localName} 获胜！`
              : `${remoteName} 获胜！`
        }}
      </h3>
      <div class="po__totals">
        <span :class="{ 'is-lead': totals === 0 }">{{ localName }} {{ state.scores[0] }}</span>
        <span class="po__sep">:</span>
        <span :class="{ 'is-lead': totals === 1 }">{{ state.scores[1] }} {{ remoteName }}</span>
      </div>
      <div class="po__chips">
        <span v-for="r in state.results" :key="r.round" class="po__chip">
          R{{ r.round }} {{ r.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.po {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
  background: rgba(8, 14, 24, 0.62);
  backdrop-filter: blur(3px);
  /* below the fixed HUD bar so the back button stays reachable */
  z-index: 9;
}

.po__panel {
  width: min(760px, 100%);
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
  padding: var(--s5);
  border-radius: var(--r-lg);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--e3, 0 18px 40px -16px rgba(2, 6, 16, 0.5));
}

.po__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.po__round {
  font-size: 13px;
  color: var(--text-dim);
}

.po__timer {
  font-size: 20px;
  font-weight: 700;
  color: var(--accent);
}

.po__title {
  margin: 0;
  font-size: 20px;
  color: var(--text);
}

.po__options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s2);
}

.po__option {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--s4) var(--s3);
  border-radius: var(--r-md);
  border: 2px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
  text-align: center;
  transition: transform 0.12s ease, border-color 0.12s ease;
}

.po__option:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.po__option:disabled {
  cursor: default;
  opacity: 0.55;
}

.po__option.is-picked {
  opacity: 1;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent);
}

.po__option.is-peer {
  opacity: 1;
  border-color: #e8a33d;
}

.po__option-label {
  font-size: 16px;
  font-weight: 700;
}

.po__option-desc {
  font-size: 12px;
  color: var(--text-dim);
}

.po__votes {
  display: flex;
  justify-content: space-between;
  gap: var(--s3);
  font-size: 13px;
  color: var(--text-dim);
}

.po__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.po__table th,
.po__table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--line);
  color: var(--text);
}

.po__table th {
  color: var(--text-dim);
  font-weight: 600;
}

.po__totals {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--s3);
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.po__totals .is-lead {
  color: var(--accent);
}

.po__sep {
  color: var(--text-dim);
}

.po__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.po__chip {
  padding: 3px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  font-size: 12px;
  color: var(--text);
}

.po__wait {
  font-size: 13px;
  text-align: center;
  margin: 0;
}
</style>
