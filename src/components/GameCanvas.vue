<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GameScene, type HudState, type MatchConfig } from '../game/scenes/GameScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import type { Difficulty } from '../game/ai';
import type { MatchRole, SimEvent } from '../game/types';
import type { NetLink } from '../net/link';

const props = defineProps<{
  role: MatchRole;
  difficulty: Difficulty;
  session: NetLink | null;
}>();

const emit = defineEmits<{
  hud: [HudState];
  disconnect: [string];
  sim: [SimEvent];
}>();

const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

onMounted(() => {
  const cfg: MatchConfig = {
    role: props.role,
    difficulty: props.difficulty,
    session: props.session,
    onHud: (s) => emit('hud', s),
    onDisconnect: (m) => emit('disconnect', m),
    onEvent: (e) => emit('sim', e),
  };

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value ?? undefined,
    width: VIEW_W,
    height: VIEW_H,
    backgroundColor: '#0b1a2b',
    banner: false,
    audio: { noAudio: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],
    callbacks: {
      postBoot: (g) => {
        g.scene.add('GameScene', GameScene, true, cfg);
      },
    },
  });

  if (import.meta.env.DEV) {
    (window as unknown as { __game?: Phaser.Game }).__game = game;
  }
});

onBeforeUnmount(() => {
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div ref="container" class="game-canvas" />
</template>

<style scoped>
.game-canvas {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #0b1a2b;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
}

.game-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
