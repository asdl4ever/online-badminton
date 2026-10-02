<script setup lang="ts">
import { computed, ref } from 'vue';
import { useJoystickPrefs } from '../../composables/useJoystick';

/**
 * 大地图用的虚拟摇杆：拖把手给出一个方向向量（长度 0~1）。
 *
 * - 推力大小映射成移动速度（推一半走一半），所以模型只暴露归一化向量；
 * - 半径之外就是满速，中心有很小的死区，手指抖动不会让角色乱飘；
 * - 键盘在 WorldView 里单独处理，两者相加后仍然夹到 1。
 *
 * 形态（设置 → 操作）：
 * - 固定（默认）：摇杆钉在左下角；
 * - 自由：本体隐藏，在左侧热区任意位置按下，摇杆出现在按下点，松手消失。
 * 大小：`scale`（0.7~1.5）缩放半径，把手随之等比缩放。
 * 两种形态的输入完全一致——只是出现方式不同。
 */
const props = withDefaults(defineProps<{ deadZone?: number }>(), {
  deadZone: 0.12,
});

const emit = defineEmits<{ move: [x: number, y: number] }>();

const { free, scale } = useJoystickPrefs();

/** 基础半径 40px × 大小缩放 */
const R = computed(() => Math.round(40 * scale.value));
/** 底座圆盘直径（半径 × 2 + 一点留白） */
const ringPx = computed(() => R.value * 2 + 24);
const knobPx = computed(() => Math.max(30, Math.round(R.value * 1.15)));
const knobStyle = computed(() => ({
  width: `${knobPx.value}px`,
  height: `${knobPx.value}px`,
  margin: `${-knobPx.value / 2}px 0 0 ${-knobPx.value / 2}px`,
}));

const knob = ref<HTMLElement | null>(null);
let pointerId: number | null = null;
/** 摇杆圆心（视口坐标）：固定模式 = 底座中心；自由模式 = 本次按下点 */
let cx = 0;
let cy = 0;
/** 自由模式：摇杆当前是否可见 */
const live = ref(false);
/** 自由模式：底座圆盘的左上角（相对热区） */
const freePos = ref({ x: 0, y: 0 });

/** 把圆心夹进热区里，保证整颗摇杆都在屏幕上 */
function clampAnchor(x: number, y: number, rect: DOMRect): { x: number; y: number } {
  const pad = R.value + 12;
  return {
    x: Math.min(Math.max(x, rect.left + pad), rect.right - pad),
    y: Math.min(Math.max(y, rect.top + pad), rect.bottom - pad),
  };
}

function apply(px: number, py: number): void {
  const dx = px - cx;
  const dy = py - cy;
  const dist = Math.hypot(dx, dy) || 1;
  const push = Math.min(dist, R.value) / R.value;
  const ux = dx / dist;
  const uy = dy / dist;

  if (knob.value)
    knob.value.style.transform = `translate(${ux * push * R.value}px, ${uy * push * R.value}px)`;

  if (push < props.deadZone) emit('move', 0, 0);
  else emit('move', ux * push, uy * push);
}

// ---- 固定模式 ---------------------------------------------------------------

function onDown(e: PointerEvent): void {
  pointerId = e.pointerId;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  cx = rect.left + rect.width / 2;
  cy = rect.top + rect.height / 2;
  apply(e.clientX, e.clientY);
}

function onMove(e: PointerEvent): void {
  if (e.pointerId !== pointerId) return;
  apply(e.clientX, e.clientY);
}

function onUp(): void {
  pointerId = null;
  if (knob.value) knob.value.style.transform = '';
  emit('move', 0, 0);
}

// ---- 自由模式 ---------------------------------------------------------------

function onZoneDown(e: PointerEvent): void {
  pointerId = e.pointerId;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const a = clampAnchor(e.clientX, e.clientY, rect);
  cx = a.x;
  cy = a.y;
  freePos.value = { x: a.x - rect.left, y: a.y - rect.top };
  live.value = true;
  apply(e.clientX, e.clientY);
}

function onZoneUp(): void {
  onUp();
  live.value = false;
}
</script>

<template>
  <!-- 固定摇杆：钉在左下角 -->
  <div
    v-if="!free"
    class="joy"
    :style="{ width: `${ringPx}px`, height: `${ringPx}px` }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="joy__ring" />
    <div ref="knob" class="joy__knob" :style="knobStyle" />
  </div>

  <!-- 自由摇杆：左侧热区（点哪出现在哪，松手消失），不挡右半屏的按钮 -->
  <div
    v-else
    class="joy-zone"
    @pointerdown="onZoneDown"
    @pointermove="onMove"
    @pointerup="onZoneUp"
    @pointercancel="onZoneUp"
  >
    <div
      v-if="live"
      class="joy joy--free"
      :style="{ width: `${ringPx}px`, height: `${ringPx}px`, left: `${freePos.x}px`, top: `${freePos.y}px` }"
    >
      <div class="joy__ring" />
      <div ref="knob" class="joy__knob" :style="knobStyle" />
    </div>
  </div>
</template>

<style scoped>
/* 自由模式热区：屏幕左侧 55%、避开顶部一栏，按住拖动都归它 */
.joy-zone {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 0;
  width: 55%;
  z-index: 28;
  touch-action: none;
  user-select: none;
}

/* 自由模式的圆盘由 left/top 定位（覆盖全局 CSS 的 left/bottom 钉位） */
.joy--free {
  left: 0;
  top: 0;
  bottom: auto;
}
</style>
