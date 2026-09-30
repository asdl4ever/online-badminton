<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{
  title?: string;
  /** teleport target; keep default unless nesting */
  maxWidth?: string;
}>();

const emit = defineEmits<{ close: [] }>();

const open = ref(true);

function close() {
  emit('close');
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

onMounted(() => {
  window.addEventListener('keydown', onKey);
});
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKey);
});

// stop the page scrolling behind the modal
watch(
  open,
  (v) => {
    document.body.style.overflow = v ? 'hidden' : '';
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div class="am-backdrop" @click.self="close">
      <div
        class="am-modal"
        role="dialog"
        aria-modal="true"
        :style="{ maxWidth: props.maxWidth ?? '760px' }"
      >
        <header class="am-head">
          <h3 v-if="title" class="am-title">{{ title }}</h3>
          <span v-else class="am-title" />
          <button class="am-close" type="button" aria-label="关闭" @click="close">×</button>
        </header>
        <div class="am-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.am-backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--s4);
  background: rgba(12, 22, 38, 0.45);
  backdrop-filter: blur(3px);
  animation: am-fade 0.14s ease-out;
}

.am-modal {
  width: 100%;
  max-height: calc(100vh - var(--s5) * 2);
  display: flex;
  flex-direction: column;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e2);
  overflow: hidden;
  animation: am-pop 0.16s ease-out;
}

.am-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s4) var(--s5);
  border-bottom: 1px solid var(--line);
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
}

.am-close:hover {
  color: var(--text);
}

.am-body {
  padding: var(--s4) var(--s5) var(--s5);
  overflow: auto;
}

@keyframes am-fade {
  from {
    opacity: 0;
  }
}

@keyframes am-pop {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.99);
  }
}
</style>
