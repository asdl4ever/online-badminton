<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { GameScene, type HudState, type MatchConfig, type MatchOpponent } from '../game/scenes/GameScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import type { MatchRole, SimEvent } from '../game/types';
import type { NetMetrics } from '../game/telemetry';
import type { NetLink } from '../net/link';
import type { Cosmetic } from '../game/cosmetics';
import type { PlayerAttrs } from '../game/attrs';
import type { ThemeId } from '../game/theme';
import type { TierId } from '../game/ranks';
import type { PartyState } from '../game/config';
import { useLobbyStore } from '../stores/lobby';

const lobby = useLobbyStore();

const props = defineProps<{
  role: MatchRole;
  session: NetLink | null;
  cosmetic: Cosmetic;
  /** 本地玩家的属性点倍率（速度 / 力量 / 容错） */
  attrs?: PlayerAttrs;
  localName: string;
  localRank: TierId;
  /** 本地玩家的好友码：随 hello 发给对方（对方记装扮用） */
  localCode?: string;
  theme: ThemeId;
  autoCycleTheme: boolean;
  /** run the round-based fun mode (vote → play → scoreboard) */
  party: boolean;
  /** world option to build the initial world from (e.g. a ball-machine preset) */
  optionId?: string;
  /** 单机 / 晋级赛的 AI 对手（名字、风格、外观） */
  opponent?: MatchOpponent;
  /** 观战：两侧都由 AI 控制，玩家不参与 */
  spectate?: { left: MatchOpponent; right: MatchOpponent };
  /** 关掉画面内的「再来一局」（重开要扣门票的玩法用，交给页面自己的按钮） */
  noRematch?: boolean;
}>();

const emit = defineEmits<{
  hud: [HudState];
  disconnect: [string];
  sim: [SimEvent];
  metrics: [NetMetrics];
  themechange: [ThemeId];
  party: [PartyState];
}>();

const container = ref<HTMLDivElement | null>(null);
/** 留一份最新 HUD 在组件里：给叠在画布上的双方体力条用 */
const hud = ref<HudState | null>(null);
let game: Phaser.Game | null = null;

function scene(): GameScene | null {
  return (game?.scene.getScene('GameScene') as GameScene | undefined) ?? null;
}

function sendEmote(id: string): void {
  scene()?.sendEmote(id);
}

function voteParty(optionId: string): void {
  scene()?.voteParty(optionId);
}

function nextPartyRound(): void {
  scene()?.nextPartyRound();
}

defineExpose({ sendEmote, voteParty, nextPartyRound });

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
    session: props.session,
    onHud: (s) => {
      hud.value = s;
      emit('hud', s);
    },
    onDisconnect: (m) => emit('disconnect', m),
    onEvent: (e) => emit('sim', e),
    onMetrics: (m) => emit('metrics', m),
    cosmetic: props.cosmetic,
    attrs: props.attrs,
    localName: props.localName,
    localRank: props.localRank,
    localCode: props.localCode,
    // 对方（若是好友）的装扮到了就存进好友档案，好友列表能画出他的角色
    onPeerHello: (code, cosmetic) => lobby.rememberCosmetic(code, cosmetic),
    theme: props.theme,
    autoCycleTheme: props.autoCycleTheme,
    onThemeChange: (t) => emit('themechange', t),
    party: props.party,
    onParty: (s) => emit('party', s),
    optionId: props.optionId,
    opponent: props.opponent,
    spectate: props.spectate,
    noRematch: props.noRematch,
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
  <div ref="container" class="game-canvas">
    <!-- 双方体力条：跑动/击球扣体力，低了跑得慢、击球软、AI 更容易失误 -->
    <div v-if="hud" class="stam-row">
      <div class="stam" :class="{ 'is-me': hud.localIndex === 0 }">
        <i
          :class="{ 'is-low': hud.stamina[0] < 30 }"
          :style="{ width: `${hud.stamina[0]}%` }"
        />
      </div>
      <div class="stam stam--right" :class="{ 'is-me': hud.localIndex === 1 }">
        <i
          :class="{ 'is-low': hud.stamina[1] < 30 }"
          :style="{ width: `${hud.stamina[1]}%` }"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-canvas {
  position: relative;
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

.stam-row {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  gap: 34px;
  padding: 0 10px;
  pointer-events: none;
}

.stam {
  flex: 1;
  height: 7px;
  margin-top: 8px;
  border-radius: 999px;
  background: rgba(8, 14, 24, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.stam i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #35c26e, #7fe08f);
  transition: width 0.18s linear;
}

.stam i.is-low {
  background: linear-gradient(90deg, #d8483c, #ff7a5c);
}

.stam.is-me {
  border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
}
</style>
