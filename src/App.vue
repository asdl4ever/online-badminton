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
      <div style="font-size: 46px; margin-bottom: 12px">📱</div>
      <p style="font-size: 17px">请把手机横过来</p>
      <p class="muted" style="margin-top: 6px">横屏才能看清整个球场</p>
    </div>
  </div>
</template>
