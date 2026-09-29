<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { Difficulty } from '../game/ai';
import { sfx } from '../game/audio';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();
const hud = ref<HudState | null>(null);
const hint = ref('');

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: '简单' },
  { id: 'normal', label: '普通' },
  { id: 'hard', label: '困难' },
];

function onHud(state: HudState) {
  hud.value = state;
}

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') {
    sfx.point();
    hint.value = e.scorer === 0 ? '得分！' : '对手得分';
  } else if (e.type === 'gameover') {
    if (e.scorer === 0) sfx.win();
    else sfx.lose();
  } else if (e.type === 'serve') {
    hint.value = '';
  }
}

function setDifficulty(d: Difficulty) {
  sfx.click();
  store.difficulty = d;
}

function back() {
  sfx.click();
  void router.push('/');
}

onBeforeUnmount(() => {
  store.role = 'single';
});
</script>

<template>
  <div class="page">
    <div class="shell">
      <div class="topbar">
        <button class="btn btn-ghost" @click="back">← 返回</button>
        <div style="display: flex; align-items: center; gap: 10px">
          <span class="muted">难度</span>
          <button
            v-for="d in difficulties"
            :key="d.id"
            class="btn"
            :class="{ 'btn-primary': store.difficulty === d.id }"
            style="padding: 8px 16px"
            @click="setDifficulty(d.id)"
          >
            {{ d.label }}
          </button>
        </div>
        <div class="chip">
          <span class="dot on" />
          <span>单机练习</span>
        </div>
      </div>

      <div class="stage">
        <GameCanvas
          role="single"
          :difficulty="store.difficulty"
          :session="null"
          @hud="onHud"
          @sim="onEvent"
        />
      </div>

      <div class="topbar">
        <div class="muted">
          比分 <b style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
          :
          <b style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
          &nbsp;·&nbsp; 先到 11 分获胜
        </div>
        <div class="muted">{{ hint }}</div>
      </div>
    </div>
  </div>
</template>
