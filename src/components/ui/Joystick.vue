<script setup lang="ts">
import { ref } from 'vue';

/**
 * 大地图用的虚拟摇杆：拖把手给出一个方向向量（长度 0~1）。
 *
 * - 推力大小映射成移动速度（推一半走一半），所以模型只暴露归一化向量；
 * - 半径 40px 之外就是满速，中心有很小的死区，手指抖动不会让角色乱飘；
 * - 键盘在 WorldView 里单独处理，两者相加后仍然夹到 1。
 */
const props = withDefaults(defineProps<{ radius?: number; deadZone?: number }>(), {
  radius: 40,
  deadZone: 0.12,
});

const emit = defineEmits<{ move: [x: number, y: number] }>();

const knob = ref<HTMLElement | null>(null);
let pointerId: number | null = null;

function apply(clientX: number, clientY: number): void {
  const host = knob.value?.parentElement;
  if (!host) return;
  const rect = host.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width / 2);
  const dy = clientY - (rect.top + rect.height / 2);
  const dist = Math.hypot(dx, dy) || 1;
  const push = Math.min(dist, props.radius) / props.radius;
  const ux = dx / dist;
  const uy = dy / dist;

  if (knob.value)
    knob.value.style.transform = `translate(${ux * push * props.radius}px, ${uy * push * props.radius}px)`;

  if (push < props.deadZone) emit('move', 0, 0);
  else emit('move', ux * push, uy * push);
}

function onDown(e: PointerEvent): void {
  pointerId = e.pointerId;
  (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
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
</script>

<template>
  <div class="joy" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp">
    <div class="joy__ring" />
    <div ref="knob" class="joy__knob" />
  </div>
</template>
