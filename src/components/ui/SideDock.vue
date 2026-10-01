<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';

/**
 * 屏幕右缘的竖向功能坞：收起时只是一个固定 34px 的小图标，
 * 展开后是一列功能项（插槽内容）。尺寸全部走 --ui-*，不随屏幕缩放。
 *
 * 交互：Esc 或点面板外部收起；展开状态记在本机。
 */
const open = useLocalStorage('bmt-dock-open', true);
const root = ref<HTMLElement | null>(null);

function onDocPointerDown(e: PointerEvent): void {
  if (!open.value) return;
  const target = e.target as Node | null;
  if (target && root.value && !root.value.contains(target)) open.value = false;
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') open.value = false;
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  window.removeEventListener('keydown', onKey);
});

// 面板展开时把内容滚到顶部，避免上次的滚动位置残留
watch(open, (on) => {
  if (on) root.value?.querySelector('.dock__panel')?.scrollTo({ top: 0 });
});
</script>

<template>
  <div ref="root" class="dock" :class="{ 'is-collapsed': !open }">
    <div v-show="open" class="dock__panel">
      <slot />
    </div>
    <button
      class="icon-btn jelly dock__toggle"
      type="button"
      :title="open ? '收起功能' : '展开功能'"
      :aria-label="open ? '收起功能' : '展开功能'"
      :aria-expanded="open"
      @click="open = !open"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          :d="open ? 'm9 6 6 6-6 6' : 'm15 6-6 6 6 6'"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.dock {
  position: absolute;
  right: max(var(--s2), env(safe-area-inset-right));
  /* 让开右上角那排横向小图标 */
  top: calc(var(--s2) + var(--ui-icon) + 6px);
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  max-height: calc(100% - var(--s2) * 2 - var(--ui-icon) - 6px);
}

.dock__toggle {
  color: var(--accent);
  border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  background: color-mix(in srgb, var(--accent) 18%, var(--glass-bg));
}

.dock__panel {
  position: relative; /* anchors popovers (emote picker) */
  width: var(--ui-dock-w);
  max-height: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: 10px;
  border: 1px solid var(--glass-border);
  border-radius: var(--lg-radius);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  box-shadow: var(--glass-shadow), var(--glass-hi);
}

/* 相邻的分组之间自动出一条虚线分隔，视图不用手写分割线 */
.dock__panel > * + * {
  padding-top: var(--s2);
  border-top: 1px dashed var(--line);
}

.dock__panel :deep(.seg) {
  justify-content: space-between;
  width: 100%;
}
</style>
