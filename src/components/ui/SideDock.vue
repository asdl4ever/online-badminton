<script setup lang="ts">
import { ref } from 'vue';

/**
 * A right-edge floating rail: collapsed it is one small icon, expanded it
 * shows the mode's function buttons (emotes, stick editor, sell, ...).
 * Keeps the top bar to back + title so the court gets the whole screen.
 */
const open = ref(false);
</script>

<template>
  <div class="dock" :class="{ 'is-open': open }">
    <div v-show="open" class="dock__panel">
      <slot />
    </div>
    <button class="dock__toggle" type="button" :title="open ? '收起功能' : '展开功能'" @click="open = !open">
      <svg viewBox="0 0 24 24" aria-hidden="true">
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
  right: 4px;
  top: 44px;
  z-index: 30;
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.dock__toggle {
  flex: none;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: color-mix(in srgb, var(--accent) 22%, var(--surface));
  color: var(--accent);
  cursor: pointer;
  box-shadow: var(--e1);
}

.dock__toggle svg {
  width: 18px;
  height: 18px;
}

.dock__panel {
  position: relative; /* anchors popovers (emote picker) */
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-width: 150px;
  padding: 10px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e2);
}

.dock__panel :deep(.seg) {
  justify-content: space-between;
  width: 100%;
}
</style>
