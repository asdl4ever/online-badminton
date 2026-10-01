<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { closeDock, dockOpen } from '../../composables/useDock';

/**
 * 左上角的「模式设置」面板：由外壳上那个按钮控制展开（见 `PageShell`），
 * 这里只负责面板本身——模式/难度选择、摇杆编辑、卖鱼、建房之类的功能项。
 *
 * 交互：Esc 或点面板外部收起；展开状态记在本机（`useDock`）。
 */
const root = ref<HTMLElement | null>(null);

function onDocPointerDown(e: PointerEvent): void {
  if (!dockOpen.value) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (root.value?.contains(target)) return;
  // 左上角那个按钮自己负责开合，别把它当成点了外面
  if (target.closest('[data-dock-toggle]')) return;
  closeDock();
}

function onKey(e: KeyboardEvent): void {
  if (e.key === 'Escape') closeDock();
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true);
  window.addEventListener('keydown', onKey);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  window.removeEventListener('keydown', onKey);
});
</script>

<template>
  <div v-show="dockOpen" ref="root" class="dock">
    <div class="dock__panel">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.dock {
  position: absolute;
  left: max(var(--s2), env(safe-area-inset-left));
  /* 让开左上角那排按钮（退出 / 模式设置） */
  top: calc(env(safe-area-inset-top) + var(--s2) + var(--ui-top-h) + 6px);
  z-index: 30;
  width: var(--ui-dock-w);
  max-height: calc(100% - var(--s2) * 3 - var(--ui-top-h) - 6px);
}

.dock__panel {
  position: relative; /* anchors popovers (emote picker) */
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
