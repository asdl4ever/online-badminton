<script setup lang="ts">
import { ref } from 'vue';
import Button from './Button.vue';

defineProps<{ backLabel?: string; collapsible?: boolean }>();
defineEmits<{ back: [] }>();

/** when collapsible, the whole bar can tuck away to give the court the screen */
const collapsed = ref(false);
</script>

<template>
  <header
    class="topbar surface hud-bar"
    :class="{ 'topbar--collapsed': collapsible && collapsed }"
  >
    <Button v-show="!(collapsible && collapsed)" variant="quiet" size="sm" @click="$emit('back')">
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

    <div v-show="!(collapsible && collapsed)" class="topbar__title">
      <slot name="title" />
    </div>

    <div class="topbar__aside">
      <span v-show="!(collapsible && collapsed)" class="topbar__aside-main">
        <slot name="aside" />
      </span>
      <Button
        v-if="collapsible"
        variant="quiet"
        size="sm"
        class="topbar__fold-btn"
        :title="collapsed ? '展开工具栏' : '收起工具栏'"
        @click="collapsed = !collapsed"
      >
        <svg
          class="topbar__icon topbar__fold"
          :class="{ 'topbar__fold--up': collapsed }"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="m6 9 6 6 6-6"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </Button>
    </div>
  </header>
</template>

<style scoped>
/* the fold toggle is easy to miss, so paint it loud: accent ring + tint */
.topbar__fold-btn {
  color: var(--accent);
  background: color-mix(in srgb, var(--accent) 20%, var(--surface-2));
  box-shadow:
    0 0 0 2px color-mix(in srgb, var(--accent) 55%, transparent),
    var(--e1);
}

.topbar__fold-btn:hover {
  background: color-mix(in srgb, var(--accent) 34%, var(--surface-2));
}

.topbar__aside-main {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.topbar__fold {
  transition: transform var(--t-fast, 0.15s) ease;
}

.topbar__fold--up {
  transform: rotate(180deg);
}
</style>
