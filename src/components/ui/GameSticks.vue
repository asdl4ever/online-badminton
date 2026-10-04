<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import Joystick from './Joystick.vue';
import { isTouchDevice, joystickAlwaysOn } from '../../game/device';
import { stickInput } from '../../game/touch';

/**
 * 各玩法页叠在 Phaser 画布上的**虚拟摇杆**（左：移动；右：球拍）。
 *
 * 用的就是大地图那颗 DOM 摇杆（`Joystick.vue`）——外观、尺寸、位置完全一致，
 * 钉在左下 / 右下角、1:1 像素，不会被画布拉伸。输入写进 `game/touch.ts` 的
 * 共享对象 `stickInput`，场景里的 `TouchControls` 每帧读它。
 *
 * 触屏设备必显；桌面端开了「设置 → 操作 → 桌面端也显示摇杆」也显示。
 */
const props = withDefaults(defineProps<{ always?: boolean }>(), { always: false });
/** 显隐：触屏 / 设置里开关 / 调用方强制常显（球馆里上场打球时用） */
const show = computed(() => props.always || isTouchDevice() || joystickAlwaysOn());

function setMove(x: number, y: number): void {
  stickInput.move.x = x;
  stickInput.move.y = y;
  stickInput.moveActive = x !== 0 || y !== 0;
}

function setRacket(x: number, y: number): void {
  stickInput.racket.x = x;
  stickInput.racket.y = y;
  stickInput.racketActive = x !== 0 || y !== 0;
}

function clear(): void {
  setMove(0, 0);
  setRacket(0, 0);
}

onBeforeUnmount(clear);
</script>

<template>
  <div v-if="show" class="sticks">
    <Joystick :dead-zone="0.15" @move="setMove" />
    <Joystick side="right" :dead-zone="0.15" @move="setRacket" />
  </div>
</template>

<style scoped>
/* 覆盖层本身不吃指针事件（鼠标控球拍照旧穿透到画布），
   只有两颗摇杆本体（固定模式）或半屏热区（自由模式）可点。 */
.sticks {
  position: absolute;
  inset: 0;
  z-index: 28;
  pointer-events: none;
}

.sticks :deep(.joy),
.sticks :deep(.joy-zone) {
  pointer-events: auto;
}
</style>
