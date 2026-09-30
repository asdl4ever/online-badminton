<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GameScene, type HudState, type MatchConfig } from '../game/scenes/GameScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import type { Difficulty } from '../game/ai';
import type { MatchRole, SimEvent } from '../game/types';
import type { NetMetrics } from '../game/telemetry';
import type { NetLink } from '../net/link';
import type { Cosmetic } from '../game/cosmetics';
import type { ThemeId } from '../game/theme';

const props = defineProps<{
  role: MatchRole;
  difficulty: Difficulty;
  session: NetLink | null;
  cosmetic: Cosmetic;
  localName: string;
  theme: ThemeId;
  autoCycleTheme: boolean;
}>();

const emit = defineEmits<{
  hud: [HudState];
  disconnect: [string];
  sim: [SimEvent];
  metrics: [NetMetrics];
  editmode: [boolean];
  themechange: [ThemeId];
}>();

const container = ref<HTMLDivElement | null>(null);
let game: Phaser.Game | null = null;

function scene(): GameScene | null {
  return (game?.scene.getScene('GameScene') as GameScene | undefined) ?? null;
}

function toggleEditMode(): void {
  scene()?.toggleEditMode();
}

function sendEmote(id: string): void {
  scene()?.sendEmote(id);
}

defineExpose({ toggleEditMode, sendEmote });

onMounted(async () => {
  // Phaser renders text with the canvas 2D API, which does not re-flow when a
  // web font finishes loading — so wait for the display face before booting
  try {
    await document.fonts.load('700 64px "Chakra Petch"');
  } catch {
    /* font optional: the stack falls back to system CJK */
  }

  const cfg: MatchConfig = {
    role: props.role,
    difficulty: props.difficulty,
    session: props.session,
    onHud: (s) => emit('hud', s),
    onDisconnect: (m) => emit('disconnect', m),
    onEvent: (e) => emit('sim', e),
    onMetrics: (m) => emit('metrics', m),
    onEditMode: (on) => emit('editmode', on),
    cosmetic: props.cosmetic,
    localName: props.localName,
    theme: props.theme,
    autoCycleTheme: props.autoCycleTheme,
    onThemeChange: (t) => emit('themechange', t),
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
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--e2);
}

.game-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
