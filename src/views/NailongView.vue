<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import GameCanvas from '../components/GameCanvas.vue';
import NailongPanel from '../components/NailongPanel.vue';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import {
  NAILONG_DAILY_MAX,
  NAILONG_NAME,
  NAILONG_OPTION_ID,
  NAILONG_STATS,
} from '../game/nailong';
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
 * 慢慢飘、小黄龙一身果冻会把球软软弹回来。每天 3 张门票（开一场扣一张，输赢都扣），
 * 赢球才 +1 张转盘券。
 */
const router = useRouter();
const customize = useCustomizeStore();
const lobby = useLobbyStore();
const progress = useProgressStore();

const match = ref(false);
const round = ref(0);
const result = ref<'win' | 'lose' | null>(null);
/** 结果横幅上的文字：把「券有没有加上 / 为什么没加」直接写出来，不靠一闪而过的 toast */
const resultText = ref('');

/** 小黄龙这位对手：联名形象 + 中等偏下的四维（新手也能赢下来） */
const opponent: MatchOpponent = {
  name: NAILONG_NAME,
  cosmetic: { ...DEFAULT_COSMETIC, characterSkin: 'nailong' },
  stats: NAILONG_STATS,
};

const canvasKey = computed(() => `nailong-${round.value}`);

function start(): void {
  sfx.click();
  // 开一场先扣一张今日门票（输赢都扣），没票了就打不了
  const r = progress.startNailongMatch();
  if (!r.ok) {
    toastWarn(r.message);
    return;
  }
  result.value = null;
  resultText.value = '';
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
      // 门票在 start() 时已扣，赢球这里只负责发券
      const r = progress.earnNailongTicket();
      resultText.value = `🎉 赢下小黄龙！${r.message}`;
      toastGood(r.message);
    } else {
      sfx.lose();
      resultText.value = `😵 输给小黄龙了 —— 这场门票已消耗，只有赢球才给券哦`;
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
        <span class="icon-btn ui-num nl-tickets">
          🎟 {{ progress.nailongTickets }}
          <em class="nl-today">今日门票 {{ progress.nailongLeftToday }}/{{ NAILONG_DAILY_MAX }}</em>
        </span>
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
          no-rematch
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
            {{ result ? resultText : '⚔️ 趣味模式 · 小黄龙滚滚（先到 5 分）' }}
          </span>
          <!-- 只有打完才有「再来一场」（开一场要扣一张门票，别让对局中途误触重开） -->
          <Button
            v-if="result"
            size="sm"
            :disabled="progress.nailongLeftToday <= 0"
            @click="start"
          >
            再来一场（门票 {{ progress.nailongLeftToday }}）
          </Button>
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

.nl-today {
  margin-left: 4px;
  font-style: normal;
  font-weight: 500;
  font-size: 11px;
  color: var(--text-dim);
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
