<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import TopBar from '../components/ui/TopBar.vue';
import ScoreLine from '../components/ui/ScoreLine.vue';
import SegmentedChoice from '../components/ui/SegmentedChoice.vue';
import type { Choice } from '../components/ui/types';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { Difficulty } from '../game/ai';
import { sfx } from '../game/audio';
import { useGameStore } from '../stores/game';

const router = useRouter();
const store = useGameStore();
const hud = ref<HudState | null>(null);
const hint = ref('');

const difficulties: Choice[] = [
  { value: 'easy', label: '简单' },
  { value: 'normal', label: '普通' },
  { value: 'hard', label: '困难' },
];

function setDifficulty(value: string) {
  sfx.click();
  store.difficulty = value as Difficulty;
}

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

function back() {
  sfx.click();
  void router.push('/');
}

onBeforeUnmount(() => {
  store.role = 'single';
});
</script>

<template>
  <div class="page page--playing">
    <div class="shell">
      <TopBar @back="back">
        <template #title>单机练习</template>
        <template #aside>
          <SegmentedChoice
            :model-value="store.difficulty"
            :options="difficulties"
            label="难度"
            @update:model-value="setDifficulty"
          />
        </template>
      </TopBar>

      <div class="stage">
        <GameCanvas
          role="single"
          :difficulty="store.difficulty"
          :session="null"
          @hud="onHud"
          @sim="onEvent"
        />
      </div>

      <ScoreLine>
        <div class="muted">
          比分 <b style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
          :
          <b style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
          &nbsp;·&nbsp; 先到 11 分获胜
        </div>
        <div class="muted">{{ hint }}</div>
      </ScoreLine>
    </div>
  </div>
</template>
