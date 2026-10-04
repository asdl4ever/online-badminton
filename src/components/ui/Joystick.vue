<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useJoystickPrefs } from '../../composables/useJoystick';
import { pinchActive } from '../../composables/useZoom';
import { JOY, hexColor, joyMetrics, ringRadius } from '../../game/draw/joystick';

/**
 * 通用虚拟摇杆：拖把手给出一个方向向量（长度 0~1）。
 *
 * - 推力大小映射成输出大小（推一半给一半），所以模型只暴露归一化向量；
 * - 半径之外就是满值，中心有很小的死区，手指抖动不会乱飘；
 * - 尺寸 / 配色 / 把手比例取自 `game/draw/joystick.ts`——各玩法画在画布里的那颗
 *   摇杆用的是同一份常量，所以大世界与游戏里的摇杆长得一样。
 *
 * 形态（设置 → 操作）：
 * - 固定（默认）：摇杆钉在屏幕角落（`side` 决定左 / 右下角）；
 * - 自由：本体隐藏，在本侧热区任意位置按下，摇杆出现在按下点，松手消失。
 * 大小：`scale`（0.7~1.5）缩放半径，把手随之等比缩放。
 * 两种形态的输入完全一致——只是出现方式不同。
 */
const props = withDefaults(
  defineProps<{
    deadZone?: number;
    /** 钉在哪一边：大世界左边走动、右边控球拍 */
    side?: 'left' | 'right';
  }>(),
  { deadZone: 0.12, side: 'left' },
);

const emit = defineEmits<{ move: [x: number, y: number] }>();

const { free, scale } = useJoystickPrefs();

const isRight = computed(() => props.side === 'right');
/** 把手行程半径 = 公共基准 × 大小缩放（把手最多能离圆心这么远） */
const R = computed(() => Math.round(JOY.baseR * scale.value));
/** 圆盘半径由行程半径推出来（见 `ringRadius`），几何比例与画布里的那颗一致 */
const metrics = computed(() => joyMetrics(ringRadius(R.value)));
/** 底座圆盘边长（= 圆盘直径，圆盘元素铺满容器） */
const ringPx = computed(() => metrics.value.ringPx);
const knobPx = computed(() => metrics.value.knobR * 2);
const knobStyle = computed(() => ({
  width: `${knobPx.value}px`,
  height: `${knobPx.value}px`,
  margin: `${-knobPx.value / 2}px 0 0 ${-knobPx.value / 2}px`,
  background: hexColor(JOY.gold),
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
  // 已经在捏合（第二根手指在缩放的）——这一下不该再冒一颗摇杆出来
  if (pinchActive.value) return;
  pointerId = e.pointerId;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const a = clampAnchor(e.clientX, e.clientY, rect);
  cx = a.x;
  cy = a.y;
  // 关键：left/top 定位的是圆盘「左上角」，要减掉半径才是圆心对准触点
  freePos.value = { x: a.x - rect.left - ringPx.value / 2, y: a.y - rect.top - ringPx.value / 2 };
  live.value = true;
  apply(e.clientX, e.clientY);
}

function onZoneUp(): void {
  onUp();
  live.value = false;
}

// 两指捏合一起手，自由摇杆就让位（收起来 + 归零），缩放不该被摇杆抢手指
watch(pinchActive, (on) => {
  if (!on) return;
  pointerId = null;
  if (live.value) onZoneUp();
});
</script>

<template>
  <!-- 固定摇杆：钉在这一侧的角落 -->
  <div
    v-if="!free"
    class="joy"
    :class="{ 'joy--right': isRight }"
    :style="{ width: `${ringPx}px`, height: `${ringPx}px` }"
    @pointerdown="onDown"
    @pointermove="onMove"
    @pointerup="onUp"
    @pointercancel="onUp"
  >
    <div class="joy__ring" />
    <div ref="knob" class="joy__knob" :style="knobStyle" />
  </div>

  <!-- 自由摇杆：本侧热区（点哪出现在哪，松手消失），不挡另一半屏 -->
  <div
    v-else
    class="joy-zone"
    :class="{ 'joy-zone--right': isRight }"
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
/* 自由模式热区：本侧半屏（左 0~50% / 右 50~100%），避开顶部一栏。
   左右各半是因为大世界两颗摇杆都在：分开正好，谁也不抢谁（和游戏里
   640 / 1280 那条分界一致）。 */
.joy-zone {
  position: absolute;
  left: 0;
  top: 15%;
  bottom: 0;
  width: 50%;
  z-index: 28;
  touch-action: none;
  user-select: none;
}

/* 右侧那颗（控球拍）：热区镜像到右半屏 */
.joy-zone--right {
  left: auto;
  right: 0;
}

/* 自由模式的圆盘由 left/top 定位（覆盖全局 CSS 的 left/bottom/right 钉位） */
.joy--free {
  left: 0;
  top: 0;
  right: auto;
  bottom: auto;
}
</style>
