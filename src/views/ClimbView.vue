<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageShell from '../components/ui/PageShell.vue';
import { ClimbScene } from '../game/climb/ClimbScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { bindCanvasSize, sceneScaleConfig } from '../game/zoom';
import { applyTheme, DEFAULT_THEME } from '../game/theme';
import { sfx } from '../game/audio';
import { useCustomizeStore } from '../stores/customize';

const router = useRouter();
const customize = useCustomizeStore();
const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

function back() {
  sfx.click();
  void router.push('/');
}

function restart() {
  sfx.click();
  game?.scene.getScene('ClimbScene')?.scene.restart();
}

onMounted(() => {
  applyTheme(DEFAULT_THEME);

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value ?? undefined,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#101a2c',
    banner: false,
    audio: { noAudio: true },
    scale: sceneScaleConfig(),
    // the climb is the only mode that needs a real rigid-body solver
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 1.1 },
        enableSleeping: false,
        debug: false,
      },
    },
    scene: [],
    callbacks: {
      postBoot: (g) => {
        g.scene.add('ClimbScene', ClimbScene, true, customize.cosmetic);
      },
    },
  });

  // 画布后备缓冲 = 容器 CSS 尺寸 × 设备像素比（高分屏不糊），并跟随尺寸变化
  bindCanvasSize(game, container.value);

  if (import.meta.env.DEV) {
    (window as unknown as { __climb?: Phaser.Game }).__climb = game;
  }
});

onBeforeUnmount(() => {
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div class="page page--playing">
    <PageShell title="攀爬挑战" back @back="back">
      <template #icons>
        <button class="icon-btn jelly" type="button" title="重来一局" @click="restart">重来</button>
      </template>


      <template #stage>
        <div ref="container" class="climb-canvas" />
      </template>
    </PageShell>
  </div>
</template>

<style scoped>
.climb-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #101a2c;
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--e2);
  touch-action: none;
}

.climb-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.climb-note {
  margin-top: var(--s3);
  font-size: 13px;
}
</style>
