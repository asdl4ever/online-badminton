<script setup lang="ts">
import GlassButton from './GlassButton.vue';

defineProps<{ backLabel?: string }>();
defineEmits<{ back: [] }>();
</script>

<template>
  <header class="topbar glass hud-bar">
    <GlassButton variant="quiet" size="sm" @click="$emit('back')">
      {{ backLabel ?? '← 返回' }}
    </GlassButton>

    <div class="topbar__title">
      <slot name="title" />
    </div>

    <div class="topbar__aside">
      <slot name="aside" />
    </div>
  </header>
</template>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 10px 14px;
  border-radius: var(--r-md);
}

.topbar__title {
  flex: 1 1 auto;
  text-align: center;
}

.topbar__title :deep(h2) {
  font-size: 19px;
}

.topbar__aside {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}
</style>
