<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import TopBar from '../components/ui/TopBar.vue';
import SideDock from '../components/ui/SideDock.vue';
import Button from '../components/ui/Button.vue';
import { ClimbScene } from '../game/climb/ClimbScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { applyTheme } from '../game/theme';
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
  applyTheme(customize.theme);

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value ?? undefined,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#101a2c',
    banner: false,
    audio: { noAudio: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
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
    <div class="shell">
      <TopBar collapsible @back="back">
        <template #title>攀爬挑战</template>
      </TopBar>

      <SideDock>
        <Button size="sm" @click="restart">重来</Button>
      </SideDock>

      <div class="stage">
        <div ref="container" class="climb-canvas" />
      </div>

      <p class="muted climb-note">
        用球拍撑住岩壁往上爬。移动鼠标决定球拍朝向，撑地、勾住凸起、再荡上去。
        掉下来就真的掉下来了。`A` / `D` 行走，`R` 重来。
      </p>
    </div>
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
