<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import TopBar from '../components/ui/TopBar.vue';
import ScoreLine from '../components/ui/ScoreLine.vue';
import Button from '../components/ui/Button.vue';
import SegmentedChoice from '../components/ui/SegmentedChoice.vue';
import type { Choice } from '../components/ui/types';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { Difficulty } from '../game/ai';
import { sfx } from '../game/audio';
import { isTouchDevice } from '../game/device';
import { useGameStore } from '../stores/game';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';

const router = useRouter();
const store = useGameStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const hud = ref<HudState | null>(null);
const canvas = ref<InstanceType<typeof GameCanvas> | null>(null);
const editing = ref(false);
/** the layout editor only makes sense where the on-screen sticks exist */
const touch = isTouchDevice();

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
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    if (e.scorer === 0) sfx.win();
    else sfx.lose();
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
          <Button v-if="touch" size="sm" @click="canvas?.toggleEditMode()">
            <svg class="gear" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h8M16 17h4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
              <circle cx="16" cy="7" r="2.5" fill="currentColor" />
              <circle cx="10" cy="12" r="2.5" fill="currentColor" />
              <circle cx="14" cy="17" r="2.5" fill="currentColor" />
            </svg>
            <span>{{ editing ? '完成' : '摇杆' }}</span>
          </Button>
        </template>
      </TopBar>

      <div class="stage">
        <GameCanvas
          ref="canvas"
          role="single"
          :difficulty="store.difficulty"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          @hud="onHud"
          @sim="onEvent"
          @editmode="editing = $event"
          @themechange="customize.theme = $event"
        />
      </div>

      <ScoreLine>
        <div class="muted">
          比分 <b class="num" style="color: var(--accent)">{{ hud?.score[0] ?? 0 }}</b>
          :
          <b class="num" style="color: var(--accent-2)">{{ hud?.score[1] ?? 0 }}</b>
          &nbsp;·&nbsp; 先到 11 分获胜
        </div>
      </ScoreLine>
    </div>
  </div>
</template>

<style scoped>
.gear {
  width: 17px;
  height: 17px;
  margin-right: 6px;
}
</style>
