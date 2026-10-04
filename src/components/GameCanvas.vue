<script setup lang="ts">
import Phaser from 'phaser';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { GameScene, type HudState, type MatchConfig, type MatchOpponent } from '../game/scenes/GameScene';
import { VIEW_H, VIEW_W } from '../game/constants';
import { bindCanvasSize, renderConfig, sceneScaleConfig } from '../game/zoom';
import GameSticks from './ui/GameSticks.vue';
import type { MatchRole, SimEvent } from '../game/types';
import type { NetMetrics } from '../game/telemetry';
import type { NetLink } from '../net/link';
import type { Cosmetic } from '../game/cosmetics';
import type { PlayerAttrs } from '../game/attrs';
import { DEFAULT_THEME, type ThemeId } from '../game/theme';
import type { TierId } from '../game/ranks';
import type { PartyState } from '../game/config';
import { useLobbyStore } from '../stores/lobby';

const lobby = useLobbyStore();

const props = defineProps<{
  role: MatchRole;
  session: NetLink | null;
  cosmetic: Cosmetic;
  /** 本地玩家的属性倍率（速度 / 力量 / 容错 / 体力） */
  attrs?: PlayerAttrs;
  localName: string;
  localRank: TierId;
  /** 本地玩家的好友码：随 hello 发给对方（对方记装扮用） */
  localCode?: string;
  /** 球场主题：不传就用默认日间（晋级赛按赛事传入） */
  theme?: ThemeId;
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
  /** **球馆里挂的那些**：画布透明、不画背景（场地直接摆在球馆地板上） */
  hall?: boolean;
  /** **空场地**：只画场地本身（线 + 网），不跑球 / 不画人 / 不画比分 */
  idle?: boolean;
  /** 不要画布里的那颗 DOM 摇杆（球馆里由页面摆到屏幕角上） */
  noSticks?: boolean;
  /** 不要这一层体力条（球馆里由页面摆到屏幕顶部） */
  noHud?: boolean;
  /** 强制走「触屏摇杆」输入：球馆里页面自己摆了一对常显摇杆时用 */
  forceTouch?: boolean;
  /**
   * **暂停这块画面**：球馆里同时挂着好几台 Phaser（2 场公开赛直播 + 6 张空场地
   * + 发球机），全都在跑各自的 rAF 会卡。不可见的那几台传 `paused` 就把 Phaser
   * 的主循环 `sleep()` 掉（**同时停掉 update 与渲染**），重新可见时 `wake()`。
   */
  paused?: boolean;
}>();

const emit = defineEmits<{
  hud: [HudState];
  disconnect: [string];
  sim: [SimEvent];
  metrics: [NetMetrics];
  party: [PartyState];
}>();

const container = ref<HTMLDivElement | null>(null);
/** 留一份最新 HUD 在组件里：给叠在画布上的双方体力条用 */
const hud = ref<HudState | null>(null);
let game: Phaser.Game | null = null;

/**
 * 已经至少渲染过一帧没。
 *
 * ⚠️ **没画过就 `sleep()` 的话，这块画布是永远空白的**——`loop.sleep()` 停掉的是循环，
 * 画布保留的是「上一次画面」，一次都没画过就什么都没有。球馆里睡着的场地全靠这一帧
 * 停在屏幕上（场地是静态的，睡不睡看起来一样），所以先让它真的画一帧再判断。
 */
let drew = false;

/** 按 `paused` 把 Phaser 主循环 sleep / wake（sleep 会同时停掉 update 与渲染） */
function applyPaused(): void {
  const loop = game?.loop;
  if (!loop) return;
  if (props.paused) {
    if (drew && loop.running) loop.sleep();
  } else if (!loop.running) {
    loop.wake();
  }
}

watch(() => props.paused, applyPaused);

function scene(): GameScene | null {
  return (game?.scene.getScene('GameScene') as GameScene | undefined) ?? null;
}

/** 把当前 props 组装成 MatchConfig（**首次启动与「原地重启场景」共用同一份**） */
function buildCfg(): MatchConfig {
  return {
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
    theme: props.theme ?? DEFAULT_THEME,
    party: props.party,
    onParty: (s) => emit('party', s),
    optionId: props.optionId,
    opponent: props.opponent,
    spectate: props.spectate,
    noRematch: props.noRematch,
    hall: props.hall,
    idle: props.idle,
    forceTouch: props.forceTouch,
  };
}

/**
 * **原地重启场景**，而不是重建整个 Phaser 实例。
 *
 * ⚠️ 这是「进入 / 退出比赛卡一下」的正解：`new Phaser.Game()` 要建 WebGL 上下文 +
 * 编译着色器，`destroy()` 再还回去，**这两下在手机上是几百毫秒到两秒的主线程长任务**
 * （诊断面板上就是「长任务 463ms / 2043ms」）。球馆里「上场 / 离开场地」只是**同一块
 * 画布换个模式**，却因为父组件用了 `:key` 把整块画布重挂 → 每次点都新建一个实例。
 *
 * 改成 `scene.restart(cfg)`：渲染器与着色器都还在，只把场景重建一遍（几十毫秒）。
 *
 * 渲染器层面的东西（`hall` 决定画布透明与否、`role`、`session`）不在这里管——
 * 它们在一次挂载里是不变的，真要变仍然靠 `:key` 重挂。
 */
function restartScene(): void {
  scene()?.scene.restart(buildCfg());
}

/**
 * 这些 props 一变，场景要按新配置重来（原来靠父组件的 `:key` 重挂整个实例）。
 * `paused` 不在此列——它只 sleep / wake 主循环，见 `applyPaused()`。
 */
watch(
  () => [props.optionId, props.opponent, props.idle, props.forceTouch, props.theme, props.party],
  restartScene,
);

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

  const cfg: MatchConfig = buildCfg();

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: container.value ?? undefined,
    width: VIEW_W,
    height: VIEW_H,
    // 球馆里挂的那些：画布透明（背景不画，直接露出球馆地板）
    backgroundColor: props.hall ? 'rgba(0,0,0,0)' : '#0b1a2b',
    ...(props.hall ? { transparent: true } : {}),
    banner: false,
    audio: { noAudio: true },
    scale: sceneScaleConfig(),
    ...renderConfig(),
    scene: [],
    callbacks: {
      postBoot: (g) => {
        g.scene.add('GameScene', GameScene, true, cfg);
      },
    },
  });

  // 画布后备缓冲 = 容器 CSS 尺寸 × 设备像素比（高分屏不糊），并跟随尺寸变化
  bindCanvasSize(game, container.value);

  // 先让渲染器 + 场景**真的画两帧**，之后才按 `paused` 决定睡不睡：
  // 没画过就 sleep 会留下一块空白画布（见 `drew` 的注释）。
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      drew = true;
      applyPaused();
    }),
  );

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
  <div ref="container" class="game-canvas" :class="{ 'is-hall': hall }">
    <!-- 虚拟摇杆：和大地图同一颗 DOM 摇杆（观战 / 球馆里由页面摆时不显示） -->
    <GameSticks v-if="!spectate && !noSticks" />
    <!-- 双方体力条：跑动/击球扣体力，低了跑得慢、击球软、AI 更容易失误 -->
    <div v-if="hud && !noHud" class="stam-row">
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
/* 球馆里挂的那些：画布透明 —— 球场直接摆在球馆地板上（没有天空 / 看台 / 木地板） */
.game-canvas.is-hall {
  background: transparent;
  border-radius: 0;
  overflow: visible;
  box-shadow: none;
}

.game-canvas {
  position: relative;
  width: 100%;
  height: 100%;
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
