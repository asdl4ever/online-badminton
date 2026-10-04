<script setup lang="ts">
import { ref } from 'vue';
import { ZOOM_MAX, ZOOM_MIN, setZoom, zoomPct, zoomPos } from '../../composables/useZoom';

/**
 * 画面缩放（视距）滑块：右缘一根可以直接拖的条。
 *
 * 状态在 `composables/useZoom.ts`（全站一份），所以大世界与各房间共用同一个视距；
 * 也可以单独塞进任何一个游戏页——Phaser 场景那边用 `game/zoom.ts` 的
 * `applySceneZoom()` 读同一个值，于是「在游戏里也能调视距」。
 */
const track = ref<HTMLElement | null>(null);
let dragging = false;

function fromPointer(e: PointerEvent): void {
  const box = track.value?.getBoundingClientRect();
  if (!box || box.height <= 0) return;
  const t = Math.min(1, Math.max(0, 1 - (e.clientY - box.top) / box.height));
  setZoom(ZOOM_MIN + t * (ZOOM_MAX - ZOOM_MIN));
}

function onDown(e: PointerEvent): void {
  dragging = true;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  fromPointer(e);
}

function onMove(e: PointerEvent): void {
  if (dragging) fromPointer(e);
}

function onUp(e: PointerEvent): void {
  dragging = false;
  (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
}
</script>

<template>
  <div
    class="zoomer num"
    title="拖动调节视距"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div ref="track" class="zoomer__track">
      <div class="zoomer__fill" :style="{ height: `${zoomPos}%` }" />
      <div class="zoomer__knob" :style="{ bottom: `calc(${zoomPos}% - 13px)` }" />
    </div>
    <span class="zoomer__label">{{ zoomPct }}%</span>
  </div>
</template>

<style scoped>
.zoomer {
  position: absolute;
  right: max(6px, env(safe-area-inset-right));
  top: 50%;
  transform: translateY(-50%);
  /* 要压在自由摇杆的半屏热区（`.joy-zone`，z-index 28）之上——
     否则想拖这根条调视距时，摸到的是摇杆热区（一按就冒出摇杆）；
     但仍旧**低于右下角那排按钮（32）**，别反过来把「上场 / 出门」挡住 */
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border-radius: 999px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  box-shadow: var(--glass-shadow);
  /* 拖动手柄：别让触摸被浏览器当成页面滚动 */
  touch-action: none;
  user-select: none;
  cursor: pointer;
}

.zoomer__track {
  position: relative;
  width: 16px;
  height: 170px;
  border-radius: 999px;
  background: rgba(120, 130, 150, 0.22);
  box-shadow: inset 0 1px 3px rgba(2, 6, 16, 0.18);
}

.zoomer__fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 999px;
  background: var(--accent);
  opacity: 0.7;
}

.zoomer__knob {
  position: absolute;
  left: 50%;
  width: 26px;
  height: 26px;
  margin-left: -13px;
  border-radius: 50%;
  border: 2px solid var(--accent);
  background: #fff;
  box-shadow: 0 2px 6px rgba(2, 6, 16, 0.3);
}

.zoomer__label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-dim);
}

/* 手机横屏屏幕矮：滑块缩短一点，别和右下角的「进入 / 出门」按钮抢位置 */
@media (max-height: 480px) {
  .zoomer__track {
    height: 110px;
  }
}
</style>
