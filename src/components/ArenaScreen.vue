<script setup lang="ts">
import GameCanvas from './GameCanvas.vue';
import ArenaBoard from './ArenaBoard.vue';
import ArenaSeats from './ArenaSeats.vue';
import type { LiveBroadcast } from '../composables/useArenaLive';
import type { HudState } from '../game/scenes/GameScene';
import type { PlayerAttrs } from '../game/attrs';
import type { Cosmetic } from '../game/cosmetics';
import type { TierId } from '../game/ranks';

/**
 * **场馆里的一块「赛事大屏场地」**（球馆中央比赛区的 100 赛 / 200 赛用它）：
 * 一块场地 + 一场**真实直播**（`LiveBroadcast`，来自赛事中心）+ 场边座位区 +
 * 上方牌子（带计分）。三块零件都是共用的：
 *
 * - 播放：`GameCanvas` 的 `spectate`（双 AI）+ `hall`（画布透明、不画背景），
 *   和普通场地的 AI 对局**同一份逻辑**；画布下面垫一层 `.court-mat`（看台 + 地板），
 *   所以场地看起来是块**真场地**而不是几条线；
 * - 牌子：`ArenaBoard`（带比分）；
 * - 座位：`ArenaSeats`。
 *
 * 这个组件只负责「画」；**坐下看**由场馆那侧接（`useWalk` 的镜头锁定 + 座位）。
 */
withDefaults(
  defineProps<{
    /** 此刻要播的那一场（`arenaLive()` 的结果；null = 没得播） */
    broadcast: LiveBroadcast | null;
    /** 场地盒子尺寸（房间坐标；聚焦看时给 1280×720） */
    w: number;
    h: number;
    /** 场上比分（观战 HUD 给的；有就在牌子上显示「3 : 2」） */
    score?: [number, number] | null;
    /** 镜头是否锁在这一块（锁定的那块是 1:1，其余按舞台比例） */
    focused?: boolean;
    /** 这块画面此刻不可见（球馆里走远了 / 在看别的场地）：把直播画布的主循环停掉 */
    paused?: boolean;
    /** 场边一排几个座位 */
    seats?: number;
    /** 没在直播时牌子上写的一行 */
    idleText?: string;
    cosmetic: Cosmetic;
    attrs?: PlayerAttrs;
    localName: string;
    localRank: TierId;
  }>(),
  { score: null, focused: false, seats: 11, idleText: '本场已结束 · 等下一场' },
);

const emit = defineEmits<{ hud: [HudState] }>();
</script>

<template>
  <div
    class="screen"
    :class="{ 'is-focused': focused }"
    :style="{ width: `${w}px`, height: `${h}px` }"
  >
    <!-- 场地垫：透明画布下面垫一层「看台 + 地板 + 边线」，场地才像块真场地 -->
    <div class="court-mat" />

    <!-- 场边看台（坐下看由场馆那侧接「走近 → 坐下」） -->
    <div class="screen__stands">
      <ArenaSeats :seats="seats" :em="Math.round((h / 720) * 26)" />
    </div>

    <!-- 直播画面：和普通场地同一台（双 AI 播放，画布透明、不画背景） -->
    <GameCanvas
      v-if="broadcast"
      :key="broadcast.key"
      role="single"
      :session="null"
      :spectate="{ left: broadcast.left, right: broadcast.right }"
      :hall="true"
      :paused="paused"
      :no-sticks="true"
      :no-hud="true"
      :no-rematch="true"
      :cosmetic="cosmetic"
      :attrs="attrs"
      :local-name="localName"
      :local-rank="localRank"
      :party="false"
      @hud="(s) => emit('hud', s)"
    />

    <!-- 场地上方的牌子：杯名 · 轮次 + 两位选手 + 比分 -->
    <div class="screen__board">
      <ArenaBoard
        :label="broadcast?.label ?? ''"
        :left="broadcast?.left.name ?? ''"
        :right="broadcast?.right.name ?? ''"
        :score-l="score?.[0] ?? null"
        :score-r="score?.[1] ?? null"
        :live="broadcast?.live ?? false"
        :idle-text="idleText"
        :em="Math.round((h / 720) * 24)"
      />
    </div>
  </div>
</template>

<style scoped>
.screen {
  position: relative;
  flex: none;
  pointer-events: none;
}

.screen.is-focused {
  z-index: 4;
}

.screen__stands {
  position: absolute;
  left: 50%;
  bottom: 2%;
  transform: translateX(-50%);
}

.screen__board {
  position: absolute;
  left: 50%;
  top: 4%;
  transform: translateX(-50%);
}
</style>
