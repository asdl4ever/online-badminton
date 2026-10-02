<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import GameCanvas from '../components/GameCanvas.vue';
import PageShell from '../components/ui/PageShell.vue';
import Button from '../components/ui/Button.vue';
import SegmentedChoice from '../components/ui/SegmentedChoice.vue';
import SideDock from '../components/ui/SideDock.vue';
import { toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import type { Choice } from '../components/ui/types';
import type { HudState, MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { STYLE_META, tierFromStats } from '../game/ai';
import { ensureStats, pickOpponent, type AiPlayer } from '../game/players';
import { sfx } from '../game/audio';
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

const practices: Choice[] = [
  { value: 'ai', label: '对战 AI' },
  { value: 'machine', label: '发球机' },
];

const isMachine = computed(() => store.practice === 'machine');
/** the machine ramps its own difficulty with the streak, so one base preset;
    the AI modes build their standard world (no option patch at all) */
const optionId = computed(() => (isMachine.value ? 'machineEasy' : undefined));
/** 本局对手：按玩家当前段位，从名录里抽一位水平相近的（切模式 / 点「换对手」换人） */
const currentOpponent = ref<AiPlayer | null>(null);
function rollOpponent(): void {
  currentOpponent.value =
    pickOpponent(progress.aiPlayers, {
      points: progress.points,
      excludeId: currentOpponent.value?.id,
    }) ?? null;
}
if (!isMachine.value) rollOpponent();

/** 场景只建一次世界：换模式 / 换对手都要重建 */
const canvasKey = computed(() => `${store.practice}-${currentOpponent.value?.id ?? ''}`);

const opponentStats = computed(() =>
  currentOpponent.value ? ensureStats(currentOpponent.value) : null,
);

const opponentConfig = computed<MatchOpponent | undefined>(() => {
  const p = currentOpponent.value;
  const stats = opponentStats.value;
  if (!p || !stats || isMachine.value) return undefined;
  // 行为与加成全部由四维派生，这里只把四维交出去
  return { name: p.name, cosmetic: p.cosmetic, stats };
});

const opponentStyleLabel = computed(() =>
  currentOpponent.value ? STYLE_META[currentOpponent.value.style].label : '',
);

const opponentTierLabel = computed(() => {
  const s = opponentStats.value;
  if (!s) return '';
  return { easy: '简单', normal: '普通', hard: '困难' }[tierFromStats(s)];
});

/** 换一位对手（难度随对手的四维而变） */
function nextOpponent(): void {
  sfx.click();
  rollOpponent();
}

/** combo milestones 10..100: one reward each, first time only */
watch(
  () => hud.value?.machine?.streak ?? 0,
  (streak) => {
    if (!isMachine.value || streak <= 0) return;
    // 先记下历史最高连击（里程碑详情页的进度条用它），再看有没有新解锁的档位
    progress.noteMachineStreak(streak);
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

function setPractice(value: string) {
  sfx.click();
  store.practice = value as PracticeMode;
  if (!isMachine.value) rollOpponent();
}

function onHud(state: HudState) {
  hud.value = state;
}

function onEvent(e: SimEvent) {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    const win = e.scorer === 0;
    progress.recordResult(win, 'single');
    if (!isMachine.value && currentOpponent.value) {
      progress.recordVsAi(currentOpponent.value.id, win);
    }
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
    <PageShell title="单机练习" back @back="back">
      <template #icons>
        <button
          v-if="!isMachine"
          class="icon-btn jelly"
          type="button"
          title="换一位对手"
          @click="nextOpponent"
        >
          换对手
        </button>
      </template>

      <template #dock>
        <SideDock>
          <SegmentedChoice
            :model-value="store.practice"
            :options="practices"
            label="模式"
            @update:model-value="setPractice"
          />
          <div v-if="currentOpponent" class="dock-opponent">
            对手：{{ currentOpponent.name }} · {{ opponentStyleLabel }} · {{ opponentTierLabel }}
          </div>
          <Button v-if="!isMachine" size="sm" block @click="nextOpponent">换一位对手</Button>
          <div v-if="hud?.machine" class="dock-num">
            连击 <b class="ui-num">{{ hud.machine.streak }}</b>
            · 最高 <b class="ui-num">{{ hud.machine.best }}</b>
          </div>
        </SideDock>
      </template>

      <template #stage>
        <GameCanvas
          :key="canvasKey"
          role="single"
          :option-id="optionId"
          :opponent="opponentConfig"
          :session="null"
          :cosmetic="customize.cosmetic"
          :attrs="progress.attrs"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @hud="onHud"
          @sim="onEvent"
          @themechange="customize.theme = $event"
        />
      </template>

    </PageShell>
  </div>
</template>

<style scoped>
.dock-num {
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}

.dock-opponent {
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
}
</style>
