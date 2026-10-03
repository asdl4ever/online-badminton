<script setup lang="ts">
import Phaser from 'phaser';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import SideDock from '../components/ui/SideDock.vue';
import Button from '../components/ui/Button.vue';
import StatusChip from '../components/ui/StatusChip.vue';
import { FarmScene, type FarmSceneData } from '../game/farm/FarmScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { FARM_MAX_LEVEL, FARM_UPGRADE_COST, MATERIALS, TRACTOR_COST } from '../game/items';

/** 农场主的棉花收购价（显示在提示里，价格本身在 `game/items.ts` 的 `MATERIALS`） */
const COTTON_PRICE = MATERIALS.cotton.price;
import { applyTheme } from '../game/theme';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';

/**
 * 农场：一片棉花地，用球拍把棉花拍下来换金币。
 * 侧栏可以把金币投进「采摘等级」（一次挥拍摘更多）和「拖拉机」（一键收全地）。
 */
const router = useRouter();
const customize = useCustomizeStore();
const progress = useProgressStore();
const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

const sessionTotal = ref(0);
const remaining = ref(0);
let timer: number | undefined;

const scene = (): FarmScene | undefined =>
  game?.scene.getScene('FarmScene') as FarmScene | undefined;

const upgradeCost = computed(() => FARM_UPGRADE_COST[progress.farmLevel] ?? 0);
const maxed = computed(() => progress.farmLevel >= FARM_MAX_LEVEL);

function back(): void {
  sfx.click();
  void router.push('/');
}

/**
 * 棉花在采摘时实时进仓（**材料，不是金币**）：场景上报的是本场累计朵数，
 * 这里只把增量记进 `progress.cotton`，换钱要拉去赚钱区交给农场主。
 */
function onPick(total: number): void {
  if (total > sessionTotal.value) {
    progress.addCotton(total - sessionTotal.value);
    sessionTotal.value = total;
  }
}

function boot(): void {
  if (!container.value) return;
  game?.destroy(true);
  const data: FarmSceneData = {
    cosmetic: customize.cosmetic,
    harvest: progress.farmLevel,
    onPick,
  };
  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#cfe9f7',
    banner: false,
    audio: { noAudio: true },
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: [],
    callbacks: {
      postBoot: (g) => g.scene.add('FarmScene', FarmScene, true, data),
    },
  });
}

function upgrade(): void {
  if (maxed.value) return;
  if (!progress.upgradeFarm()) {
    toastWarn(`金币不够，升级要 ¥${upgradeCost.value}`);
    return;
  }
  sfx.point();
  scene()?.setHarvest(progress.farmLevel);
  toastGood(`采摘等级 ${progress.farmLevel}：一次挥拍能摘 ${progress.farmLevel} 朵`);
}

function buyTractor(): void {
  if (!progress.buyTractor()) {
    toastWarn(`金币不够，拖拉机要 ¥${TRACTOR_COST}`);
    return;
  }
  sfx.win();
  toastGood('拖拉机到手！以后可以一键收全地');
}

function harvestAll(): void {
  const s = scene();
  if (!s) return;
  const gain = s.collectAll();
  if (!gain) {
    toastWarn('地里暂时没有棉花');
    return;
  }
  toastGood(`拖拉机收成 +${gain} 朵棉花`);
}

onMounted(() => {
  applyTheme(customize.theme);
  boot();
  timer = window.setInterval(() => {
    remaining.value = scene()?.remaining() ?? 0;
  }, 250);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="农场" back @back="back">
      <template #icons>
        <span class="icon-btn ui-num farm-earn" title="本场摘了多少棉花">
          🧵 本场 {{ sessionTotal }} · 仓 {{ progress.cotton }}
        </span>
      </template>

      <template #dock>
        <SideDock>
          <StatusChip tone="idle">单机</StatusChip>
          <span class="ui-num farm-earn">🧵 本场 {{ sessionTotal }} · 仓 {{ progress.cotton }}</span>
          <span class="dock-note">地里还有 {{ remaining }} 朵棉花</span>

          <Button v-if="!maxed" size="sm" block :disabled="progress.coins < upgradeCost" @click="upgrade">
            升级采摘（¥{{ upgradeCost }}）· 一次摘 {{ progress.farmLevel + 1 }} 朵
          </Button>
          <span v-else class="dock-note">采摘等级已满（一次摘 {{ FARM_MAX_LEVEL }} 朵）</span>

          <Button v-if="!progress.tractor" size="sm" block :disabled="progress.coins < TRACTOR_COST" @click="buyTractor">
            买拖拉机（¥{{ TRACTOR_COST }}）
          </Button>
          <Button v-else size="sm" block @click="harvestAll">🚜 一键收全地</Button>

          <p class="dock-note">
            把球拍挥到棉花上就能摘（一朵 = 一个 🧵 棉花材料），买断拖拉机后可以一键把整片地收完。
            <b>棉花不直接换钱</b>：拉去左下角赚钱区交给<b>农场主</b>，他按 ¥{{ COTTON_PRICE }}/朵 收购。
          </p>
        </SideDock>
      </template>

      <template #stage>
        <div ref="container" class="farm-canvas" />
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.farm-canvas {
  position: absolute;
  inset: 0;
}

.farm-earn {
  font-weight: 700;
  color: var(--accent-2);
  font-size: var(--ui-font-sm);
}

.dock-note {
  margin: 0;
  font-size: var(--ui-font-xs);
  color: var(--text-dim);
  line-height: 1.5;
}
</style>
