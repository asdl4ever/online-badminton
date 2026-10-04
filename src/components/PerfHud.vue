<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { PerfMeter } from '../game/perf';

/**
 * 「性能诊断」小面板（设置 → 性能诊断打开，默认关）。
 *
 * 挂在 `App.vue` 上，**全站角落常显**：哪一页卡都能看到。
 * 显示 fps / 最慢一帧 / 掉帧次数 / 最近几次卡顿与长任务（内核见 `game/perf.ts`）。
 *
 * ⚠️ 它自己必须便宜：
 * - **不走 Vue 响应式**——数字每 0.25 秒变一次，用 ref 会每 0.25 秒重渲染整页；
 *   这里直接写 `textContent`。
 * - 只在挂载期间跑一条 rAF（`PerfMeter`）+ 一条 250ms 定时器；关掉面板全停。
 */
const meter = new PerfMeter();
const box = ref<HTMLElement | null>(null);
const line1 = ref<HTMLElement | null>(null);
const line2 = ref<HTMLElement | null>(null);
const line3 = ref<HTMLElement | null>(null);
const line4 = ref<HTMLElement | null>(null);
let timer = 0;

function render(): void {
  const s = meter.snapshot();
  if (line1.value) {
    line1.value.textContent = `${s.fps}fps · 掉帧 ${s.drops}/${s.frames} 帧（近 ${s.windowS}s）`;
  }
  if (line2.value) {
    line2.value.textContent = `最慢 ${s.worstMs.toFixed(0)}ms（近 ${s.windowS}s）· 累计最慢 ${s.worstEverMs.toFixed(0)}ms`;
  }
  if (line3.value) {
    line3.value.textContent = s.spikes.length
      ? `卡顿 ${s.spikes
          .map((k) => `${k.ms.toFixed(0)}ms${k.kind === 'task' ? '·长任务' : ''}(${k.agoS.toFixed(1)}s)`)
          .join(' ')}`
      : `卡顿 · 近 ${s.windowS}s 没有`;
  }
  if (line4.value) {
    const parts: string[] = [];
    if (s.heapMB != null) parts.push(`堆 ${s.heapMB}MB`);
    parts.push(s.longTaskOk ? '长任务已监听' : '长任务不支持');
    line4.value.textContent = parts.join(' · ');
  }
  // 有掉帧就整体变红，扫一眼就知道；只在真的变了的时候改 class
  box.value?.classList.toggle('is-bad', s.drops > 0);
}

onMounted(() => {
  meter.start();
  render();
  timer = window.setInterval(render, 250);
});

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer);
  meter.stop();
});
</script>

<template>
  <div ref="box" class="perf">
    <div ref="line1" class="perf__row perf__row--head" />
    <div ref="line2" class="perf__row" />
    <div ref="line3" class="perf__row" />
    <div ref="line4" class="perf__row perf__row--dim" />
  </div>
</template>

<style scoped>
.perf {
  position: fixed;
  left: max(8px, env(safe-area-inset-left));
  /* 让开左上角那排按钮（--ui-top-h = 图标行高度） */
  top: calc(env(safe-area-inset-top) + var(--ui-top-h) + 12px);
  z-index: 45;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 5px 8px;
  border-radius: 8px;
  background: rgba(8, 14, 24, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #d6e6ff;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11px;
  line-height: 1.35;
  white-space: nowrap;
  /* 别吃掉摇杆 / 按钮的手指（pointer-events 已经关了，这里是兜底） */
  user-select: none;
}

.perf.is-bad {
  border-color: rgba(255, 138, 120, 0.75);
  color: #ffd9d2;
}

.perf__row--head {
  font-weight: 700;
  color: #fff;
}

.perf.is-bad .perf__row--head {
  color: #ff9c8a;
}

.perf__row--dim {
  opacity: 0.75;
}
</style>
