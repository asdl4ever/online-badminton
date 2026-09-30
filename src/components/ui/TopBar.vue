<script setup lang="ts">
import Button from './Button.vue';

defineProps<{ backLabel?: string }>();
defineEmits<{ back: [] }>();
</script>

<template>
  <header class="topbar surface hud-bar">
    <Button variant="quiet" size="sm" @click="$emit('back')">
      <svg class="topbar__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M15 5 8 12l7 7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ backLabel ?? '返回' }}</span>
    </Button>

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
  gap: var(--s3);
  flex-wrap: wrap;
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
}

.topbar__icon {
  width: 18px;
  height: 18px;
  margin-right: 2px;
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
  gap: var(--s2);
  justify-content: flex-end;
  flex-wrap: wrap;
  /* anchors the emote picker popup */
  position: relative;
}
</style>
