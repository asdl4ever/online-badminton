<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from 'vue';
import { useRouter } from 'vue-router';
import Phaser from 'phaser';
import PageShell from '../components/ui/PageShell.vue';
import Panel from '../components/ui/Panel.vue';
import Button from '../components/ui/Button.vue';
import ItemIcon from '../components/ItemIcon.vue';
import { AlienScene, type AlienSceneCfg } from '../game/alien/AlienScene';
import { bindCanvasSize, sceneScaleConfig } from '../game/zoom';
import GameSticks from '../components/ui/GameSticks.vue';
import {
  ALIEN_DAILY_MAX,
  ALIEN_DURATION,
  ALIEN_HEARTS,
  ALIEN_MILESTONES,
  ALIEN_NAME,
} from '../game/alien';
import { ITEMS, RARITY_META } from '../game/items';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { toastBad, toastGood } from '../composables/useToast';
import { celebrate } from '../composables/celebrate';
import { sfx } from '../game/audio';

/**
 * 「外星人降临」活动页：选好就开打，一局 60 秒。
 * 飞碟在上头撒陨石，拍中 = 击飞（里面的外星人算击败 +1），没拍中的落地成外星人在地上跑；
 * 被砸到 / 被碰到掉一颗心，3 颗心掉完提前结束。
 * 结算在 `onEnd` 里走 `progress.grantAlienRun(kills)`：按击杀发金币荣誉 + 解锁里程碑装扮。
 */
const router = useRouter();
const progress = useProgressStore();
const customize = useCustomizeStore();

const host = ref<HTMLElement | null>(null);
let game: Phaser.Game | null = null;
const playing = ref(false);
const resultText = ref('');
/** 本局击杀数（结算展示） */
const lastKills = ref(0);
const loot = ref<{ label: string; color: string }[]>([]);

const attemptsLeft = computed(() => progress.alienLeftToday);

/** 里程碑那一排：早期档给金币，后面每档一件固定的专属物品 */
const milestones = computed(() =>
  ALIEN_MILESTONES.map((m) => ({
    kills: m.kills,
    item: ITEMS.find((i) => i.id === m.id),
    coins: m.coins ?? 0,
    label: m.coins ? `金币 ×${m.coins}` : '',
    done: progress.alienTiers.includes(m.kills),
  })),
);
const doneCount = computed(() => milestones.value.filter((m) => m.done).length);

async function start(): Promise<void> {
  if (playing.value) return;
  const r = progress.useAlienAttempt();
  if (!r.ok) {
    toastBad(r.message);
    return;
  }
  sfx.click();
  resultText.value = '';
  loot.value = [];
  playing.value = true;
  // 先让战斗容器显示出来（有尺寸）再启 Phaser，否则 ScaleManager 会按 0×0 算缩放
  await nextTick();
  bootScene();
}

function bootScene(): void {
  if (!host.value) return;
  if (game) game.destroy(true);
  const data: AlienSceneCfg = { cosmetic: customize.cosmetic, onEnd };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: host.value,
    width: 1280,
    height: 720,
    transparent: true,
    banner: false,
    audio: { noAudio: true },
    scale: sceneScaleConfig(),
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('AlienScene', AlienScene, true, data),
    },
  });

  // 画布后备缓冲 = 容器 CSS 尺寸 × 设备像素比（高分屏不糊），并跟随尺寸变化
  bindCanvasSize(game, host.value);
}

function onEnd(kills: number): void {
  playing.value = false;
  lastKills.value = kills;
  const r = progress.grantAlienRun(kills);
  loot.value = r.items.map((i) => ({ label: i.label, color: RARITY_META[i.rarity].color }));

  const parts = [`🪙 +${r.coins}`, `🏅 +${r.honor}`];
  if (r.bonus > 0) parts.push(`🏁 里程碑 🪙 +${r.bonus}`);
  if (r.items.length) {
    sfx.win();
    celebrate(3, ['#6fe09a', '#9fe8ff', '#ffd45c']);
    resultText.value = `🛸 击败 ${kills} 个外星人！解锁 ${r.items.length} 件限定装扮：${r.items
      .map((i) => i.label)
      .join(' / ')}（${parts.join(' · ')}）`;
    toastGood(`解锁 ${r.items.map((i) => i.label).join(' / ')}`);
  } else {
    sfx.point();
    resultText.value = `🛸 击败 ${kills} 个外星人（${parts.join(' · ')}）${
      r.best ? ' · 新纪录！' : ''
    }`;
    toastGood(resultText.value);
  }
}

function back(): void {
  sfx.click();
  destroyGame();
  void router.push('/');
}

function destroyGame(): void {
  game?.destroy(true);
  game = null;
}

onBeforeUnmount(destroyGame);
</script>

<template>
  <div class="page page--playing">
    <PageShell :title="`${ALIEN_NAME}降临`" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num az-attempts" title="今日剩余挑战次数">
          🎫 今日 {{ attemptsLeft }}/{{ ALIEN_DAILY_MAX }}
        </span>
      </template>

      <template #stage>
        <!-- 战斗画面：容器走公共的 phaser-stage（桌面 16:9、手机铺满整屏） -->
        <div v-show="playing" ref="host" class="phaser-stage">
          <GameSticks />
        </div>

        <!-- 活动主页：说明 + 里程碑 + 开打 -->
        <div v-if="!playing" class="az-home">
          <Panel class="az-card">
            <div class="az-head">
              <span class="az-face">🛸</span>
              <div>
                <div class="az-title">{{ ALIEN_NAME }}降临</div>
                <div class="muted az-sub">
                  飞碟在头顶盘旋，<b>越到后面吐陨石越密</b>——每颗里都裹着一个外星人。
                  用球拍<b>拍中陨石就是把它击飞</b>（里面的外星人算击败）；
                  没拍中的陨石落地，外星人会爬出来<b>一边追你一边打子弹</b>（子弹也能拍掉），
                  <b>补拍也能得分</b>。
                  被陨石砸到、被外星人碰到、被子弹打中都掉一颗心，
                  <b>{{ ALIEN_HEARTS }} 颗心</b>掉完提前结束，否则打满 <b>{{ ALIEN_DURATION }} 秒</b>。
                </div>
              </div>
            </div>

            <div class="az-milehead">
              <b>击杀里程碑</b>
              <span class="muted num">已解锁 {{ doneCount }}/{{ milestones.length }}</span>
            </div>
            <div class="az-miles">
              <div
                v-for="m in milestones"
                :key="m.kills"
                class="az-mile"
                :class="{ 'is-on': m.done }"
              >
                <span class="num az-mile-kill">{{ m.kills }} 杀</span>
                <span class="az-mile-icon">
                  <ItemIcon v-if="m.item" :item="m.item" />
                  <span v-else class="az-mile-coin">🪙</span>
                </span>
                <span class="az-mile-label">{{ m.item?.label ?? m.label }}</span>
              </div>
            </div>

            <div v-if="loot.length" class="az-loot">
              <span
                v-for="l in loot"
                :key="l.label"
                class="az-loot-item"
                :style="{ borderColor: l.color }"
              >
                {{ l.label }}
              </span>
            </div>

            <p v-if="resultText" class="az-result">{{ resultText }}</p>
            <p v-if="progress.alienBest > 0" class="muted az-note">
              单局最高击杀：<b class="num">{{ progress.alienBest }}</b>
            </p>

            <Button variant="primary" block :disabled="attemptsLeft <= 0" @click="start">
              {{
                attemptsLeft <= 0
                  ? '今日次数已用完，明天再来'
                  : `⚔️ 开始迎击 · 今日剩 ${attemptsLeft} 次`
              }}
            </Button>
          </Panel>
        </div>

        <div v-if="playing" class="az-hud">
          <Button size="sm" variant="quiet" @click="destroyGame(); playing = false">
            退出战斗
          </Button>
        </div>
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.az-home {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
}

.az-card {
  width: min(620px, 94vw);
  margin: auto 0;
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.az-head {
  display: flex;
  align-items: flex-start;
  gap: var(--s3);
}

.az-face {
  font-size: 44px;
  line-height: 1;
}

.az-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
}

.az-sub {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.7;
}

.az-milehead {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 13px;
  color: var(--text);
}

.az-miles {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--s2);
}

.az-mile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 4px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  opacity: 0.55;
}

.az-mile.is-on {
  opacity: 1;
  border-color: #6fe09a;
  background: color-mix(in srgb, #6fe09a 14%, var(--surface-2));
}

.az-mile-kill {
  font-size: 10px;
  color: var(--text-dim);
}

.az-mile-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
}

/* 金币档没有物品图标，用一个金币符号顶替 */
.az-mile-coin {
  font-size: 22px;
  line-height: 1;
}

.az-mile-label {
  font-size: 10px;
  line-height: 1.2;
  text-align: center;
  color: var(--text);
}

.az-loot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--s2);
}

.az-loot-item {
  padding: 3px 10px;
  border-radius: var(--r-pill);
  border: 2px solid var(--line);
  font-size: 12px;
  color: var(--text);
}

.az-result {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
  color: #53e0a0;
}

.az-note {
  margin: 0;
  font-size: 12px;
}

.az-hud {
  position: absolute;
  left: 50%;
  bottom: 14px;
  transform: translateX(-50%);
  z-index: 6;
}

.az-attempts {
  color: #7ee0a8;
}

@media (max-width: 560px) {
  .az-miles {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
