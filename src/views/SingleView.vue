<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import TopBar from '../components/ui/TopBar.vue';
import ScoreLine from '../components/ui/ScoreLine.vue';
import Button from '../components/ui/Button.vue';
import SegmentedChoice from '../components/ui/SegmentedChoice.vue';
import SideDock from '../components/ui/SideDock.vue';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import type { Choice } from '../components/ui/types';
import type { HudState } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import type { Difficulty } from '../game/ai';
import { sfx } from '../game/audio';
import { isTouchDevice } from '../game/device';
import { useGameStore, type PracticeMode } from '../stores/game';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

const router = useRouter();
const store = useGameStore();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();
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

const practices: Choice[] = [
  { value: 'ai', label: '对战 AI' },
  { value: 'machine', label: '发球机' },
];

const isMachine = computed(() => store.practice === 'machine');
/** the machine ramps its own difficulty with the streak, so one base preset;
    the AI modes build their standard world (no option patch at all) */
const optionId = computed(() => (isMachine.value ? 'machineEasy' : undefined));
/** the scene builds its world once, so the mode switch has to remount it */
const canvasKey = computed(() =>
  isMachine.value ? store.practice : `${store.practice}-${store.difficulty}`,
);

/** combo milestones 10..100: one reward each, first time only */
watch(
  () => hud.value?.machine?.streak ?? 0,
  (streak) => {
    if (!isMachine.value || streak <= 0) return;
    const reward = progress.claimMilestone(streak);
    if (!reward) return;
    if (reward.kind === 'godzilla') {
      customize.characterSkin = 'godzilla';
      toastGood('100 连击达成！解锁传说角色形象「哥斯拉」，已自动装备！');
      celebrate(3, ['#3a7d44', '#e8a33d', '#f2e7c9']);
      sfx.win();
    } else {
      toastGood(`${streak} 连击！获得「${reward.item.label}」`);
      celebrate(2, ['#ffd45c', '#3d8bfd', '#9b59d0']);
    }
  },
);

function setDifficulty(value: string) {
  sfx.click();
  store.difficulty = value as Difficulty;
}

function setPractice(value: string) {
  sfx.click();
  store.practice = value as PracticeMode;
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
    const win = e.scorer === 0;
    progress.recordResult(win, 'single');
    if (win) sfx.win();
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
      <TopBar collapsible @back="back">
        <template #title>单机练习</template>
      </TopBar>

      <SideDock>
        <SegmentedChoice
          :model-value="store.practice"
          :options="practices"
          label="模式"
          @update:model-value="setPractice"
        />
        <SegmentedChoice
          v-if="!isMachine"
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
      </SideDock>

      <div class="stage">
        <GameCanvas
          :key="canvasKey"
          ref="canvas"
          role="single"
          :difficulty="store.difficulty"
          :option-id="optionId"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
          @editmode="editing = $event"
          @themechange="customize.theme = $event"
        />
      </div>

      <ScoreLine>
        <div v-if="hud?.machine" class="muted">
          连击 <b class="num" style="color: var(--accent)">{{ hud.machine.streak }}</b>
          &nbsp;·&nbsp; 最高
          <b class="num" style="color: var(--accent-2)">{{ hud.machine.best }}</b>
          &nbsp;·&nbsp; 接球 {{ hud.machine.returns }} / 失误 {{ hud.machine.misses }}
        </div>
        <div v-else class="muted">
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
