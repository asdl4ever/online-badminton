<script setup lang="ts">
import { RouterView } from 'vue-router';
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
