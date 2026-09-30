<script setup lang="ts">
import { computed } from 'vue';
import { VDialog } from 'vuetify/components';

/**
 * Thin wrapper around VDialog so every modal in the app gets Vuetify's
 * machinery for free: enter/leave transitions, focus trap, scrim
 * click-to-close, Escape handling and background scroll locking.
 *
 * Two ways to drive it:
 *   <AppModal v-model="show" ... />            preferred
 *   <AppModal v-if="show" @close="show=false" /> legacy, still supported
 */
const props = defineProps<{
  modelValue?: boolean;
  title?: string;
  maxWidth?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const open = computed({
  // `?? true` keeps the old `v-if` usage working: the component only exists
  // when it should be visible, so absent modelValue means "open".
  get: () => props.modelValue ?? true,
  set: (v: boolean) => {
    emit('update:modelValue', v);
    if (!v) emit('close');
  },
});

/** matches the app's soft-surface motion instead of Vuetify's default pop */
const transition = {
  enterActiveClass: 'am-enter-active',
  leaveActiveClass: 'am-leave-active',
  enterFromClass: 'am-enter-from',
  leaveToClass: 'am-leave-to',
};
</script>

<template>
  <VDialog
    v-model="open"
    class="app-dialog"
    :max-width="props.maxWidth ?? '760px'"
    :opacity="0.42"
    :transition="transition"
  >
    <div class="am-modal" role="dialog" aria-modal="true">
      <header class="am-head">
        <h3 v-if="title" class="am-title">{{ title }}</h3>
        <span v-else class="am-title" />
        <button class="am-close" type="button" aria-label="关闭" @click="open = false">×</button>
      </header>
      <div class="am-body">
        <slot />
      </div>
    </div>
  </VDialog>
</template>

<style scoped>
/* inside .v-overlay__content, which already handles centring + max-width */
.am-modal {
  width: 100%;
  max-height: calc(100vh - var(--s5) * 2);
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e3);
  overflow: hidden;
}

.am-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s4) var(--s5);
  border-bottom: 1px solid var(--line);
  flex: none;
}

.am-title {
  margin: 0;
  font-size: 18px;
}

.am-close {
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition:
    color var(--dur-1) var(--ease),
    background var(--dur-1) var(--ease);
}

.am-close:hover {
  color: var(--text);
  background: var(--surface-3);
}

.am-body {
  padding: var(--s4) var(--s5) var(--s5);
  overflow: auto;
}
</style>
