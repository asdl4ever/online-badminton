<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import GameCanvas from '../components/GameCanvas.vue';
import NailongPanel from '../components/NailongPanel.vue';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import { NAILONG_NAME, NAILONG_OPTION_ID, NAILONG_STATS } from '../game/nailong';
import type { MatchOpponent } from '../game/scenes/GameScene';
import type { SimEvent } from '../game/types';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useCustomizeStore } from '../stores/customize';
import { useLobbyStore } from '../stores/lobby';
import { useProgressStore } from '../stores/progress';

/**
 * 小黄龙联名（大地图右侧的活动入口）：左边是小黄龙本人和挑战入口，右边是抽奖转盘。
 *
 * 对战走**趣味模式**（optionId = nailongFun，见 config.ts）：先到 5 分、球是个大奶团
 * 慢慢飘、小黄龙一身果冻会把球软软弹回来。打赢 +1 张转盘券（每天 3 张）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();

const match = ref(false);
const round = ref(0);
const result = ref<'win' | 'lose' | null>(null);

/** 小黄龙这位对手：联名形象 + 中等偏下的四维（新手也能赢下来） */
const opponent: MatchOpponent = {
  name: NAILONG_NAME,
  cosmetic: { ...DEFAULT_COSMETIC, characterSkin: 'nailong' },
  stats: NAILONG_STATS,
};

const canvasKey = computed(() => `nailong-${round.value}`);

function start(): void {
  sfx.click();
  result.value = null;
  round.value += 1;
  match.value = true;
}

function onEvent(e: SimEvent): void {
  if (e.type === 'hit') sfx.hit(e.kind ?? 'drive');
  else if (e.type === 'belly') sfx.hit('lift');
  else if (e.type === 'net') sfx.net();
  else if (e.type === 'land') sfx.land();
  else if (e.type === 'point') sfx.point();
  else if (e.type === 'gameover') {
    if (result.value) return;
    const win = e.scorer === 0;
    result.value = win ? 'win' : 'lose';
    if (win) {
      sfx.win();
      // 只算赢：打赢才给券，输了一分不给
      const r = progress.earnNailongTicket();
      if (r.ok) toastGood(r.message);
      else toastWarn(r.message);
    } else {
      sfx.lose();
      toastWarn('输给小黄龙啦，再来一场？');
    }
  }
}

function leave(): void {
  sfx.click();
  match.value = false;
  result.value = null;
}

function back(): void {
  sfx.click();
  if (match.value) {
    leave();
    return;
  }
  void router.push('/');
}
</script>

<template>
  <div class="page page--playing">
    <PageShell title="小黄龙联名" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num nl-tickets">🎟 {{ progress.nailongTickets }}</span>
      </template>

      <template #stage>
        <!-- 趣味模式对战 -->
        <GameCanvas
          v-if="match"
          :key="canvasKey"
          role="single"
          difficulty="easy"
          :option-id="NAILONG_OPTION_ID"
          :opponent="opponent"
          :session="null"
          :cosmetic="customize.cosmetic"
          :local-name="lobby.playerName"
          :local-rank="progress.tier.id"
          :theme="customize.theme"
          :auto-cycle-theme="customize.autoCycle"
          :party="false"
          @sim="onEvent"
          @themechange="customize.theme = $event"
        />

        <!-- 联名主页：小黄龙 + 转盘 -->
        <div v-else class="nl-stage">
          <Panel class="nl-card">
            <NailongPanel @challenge="start" />
          </Panel>
        </div>

        <div v-if="match" class="nl-banner">
          <span class="num">
            <template v-if="result === 'win'">🎉 赢下小黄龙！抽奖券 +1</template>
            <template v-else-if="result === 'lose'">输给小黄龙了，要再来一场吗？</template>
            <template v-else>⚔️ 趣味模式 · 小黄龙滚滚（先到 5 分）</template>
          </span>
          <Button size="sm" @click="start">再来一场</Button>
          <Button size="sm" variant="quiet" @click="leave">回到转盘</Button>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.nl-tickets {
  font-weight: 700;
  color: #e8a33d;
  font-size: var(--ui-font-sm);
}

.nl-stage {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.nl-card {
  width: min(560px, 100%);
  margin: auto 0;
}

.nl-banner {
  position: absolute;
  top: calc(var(--ui-top-h) + 12px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--s2);
  padding: 4px 16px;
  border-radius: var(--r-pill);
  background: rgba(10, 16, 28, 0.55);
  color: #eaf2fb;
  font-size: 13px;
}

@media (max-width: 560px) {
  .nl-card {
    width: 100%;
  }
}
</style>
