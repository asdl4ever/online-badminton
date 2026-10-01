<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useCustomizeStore } from '../stores/customize';
import { avatarBoxSize, paintAvatar } from '../game/draw/canvas2d';
import { THEMES } from '../game/theme';
import { toHex } from '../game/cosmetics';

/**
 * 角色预览：**和游戏里、大地图上同一份绘制**（`game/draw/canvas2d.ts` →
 * `drawRigGraphics`）。以前这里是自己用 DOM + SVG 拼的一个近似角色（另一套身体、
 * 帽子路径、翅膀多边形），所以背包里看到的和地图上不一样——现在都走同一份代码，
 * 改一处到处一致。
 *
 * 每帧重绘是刻意的：光环 / 披风 / 翅膀 / 宠物都靠时间驱动摆动，换装扮也会立刻反映。
 */
const store = useCustomizeStore();
const canvas = ref<HTMLCanvasElement | null>(null);

/** 角色盒子的宽高比（用来让 CSS 等比缩放，不拉伸） */
const box = avatarBoxSize(1);
const boxRatio = `${box.w} / ${box.h}`;

const previewBg = computed(() => {
  const [sky, floor] = THEMES[store.theme].swatch;
  return {
    background: `linear-gradient(180deg, ${toHex(sky)} 0 58%, ${toHex(floor)} 58% 100%)`,
  };
});

let raf = 0;
function loop(now: number): void {
  const c = canvas.value;
  // scale 交给 CSS：画的是 1:1 的角色，显示尺寸按面板高度等比缩放
  if (c) paintAvatar(c, store.cosmetic, now, { scale: 1 });
  raf = requestAnimationFrame(loop);
}

onMounted(() => {
  raf = requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
});
</script>

<template>
  <div class="pc" :style="previewBg">
    <canvas ref="canvas" class="pc__rig" :style="{ aspectRatio: boxRatio }" />
    <span class="pc__badge">{{ THEMES[store.theme].label }}</span>
  </div>
</template>

<style scoped>
.pc {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: inset 0 1px 6px rgba(2, 6, 16, 0.08);
}

/* 角色脚下对齐背景里那条 58% 的地面线（= 距底 42%） */
.pc__rig {
  position: absolute;
  left: 50%;
  bottom: 38%;
  height: 76%;
  width: auto;
  transform: translateX(-50%);
  pointer-events: none;
}

.pc__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 12px;
}
</style>
