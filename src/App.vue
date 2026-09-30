<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useMobileShell } from './composables/useMobileShell';

// requests fullscreen + landscape lock on the first tap (touch devices only)
useMobileShell();
</script>

<template>
  <RouterView />

  <div class="rotate-hint">
    <div>
      <svg class="rotate-hint__icon" viewBox="0 0 24 24" aria-hidden="true">
        <rect
          x="7"
          y="2"
          width="10"
          height="20"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path d="M10.5 5h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path
          d="M4 12a8.5 8.5 0 0 1 2-5.5M20 12a8.5 8.5 0 0 0-2-5.5"
          fill="none"
          stroke="var(--accent)"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
      <p style="font-size: 17px">请把手机横过来</p>
      <p class="muted" style="margin-top: 6px">横屏才能看清整个球场</p>
    </div>
  </div>
</template>

<style scoped>
.rotate-hint__icon {
  width: 52px;
  height: 52px;
  display: block;
  margin: 0 auto var(--s3);
  color: var(--text-dim);
}
</style>
