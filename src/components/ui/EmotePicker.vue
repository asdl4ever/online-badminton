<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { EMOTES } from '../../game/emotes';

const emit = defineEmits<{ pick: [string]; close: [] }>();

/** desktop: Esc closes, 1-8 picks directly */
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }
  const n = Number(e.key);
  if (Number.isInteger(n) && n >= 1 && n <= EMOTES.length) {
    e.preventDefault();
    emit('pick', EMOTES[n - 1].id);
  }
}

onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="emote-scrim" @click="emit('close')" />

  <div class="emote-pop" role="dialog" aria-label="发送表情">
    <button
      v-for="(e, i) in EMOTES"
      :key="e.id"
      type="button"
      class="emote-pop__item"
      :aria-label="e.label"
      :title="`${e.label} (${i + 1})`"
      @click="emit('pick', e.id)"
    >
      <span aria-hidden="true">{{ e.char }}</span>
    </button>
  </div>
</template>

<style scoped>
/* transparent catcher so a tap anywhere else dismisses the picker */
.emote-scrim {
  position: fixed;
  inset: 0;
  z-index: 40;
}

.emote-pop {
  position: absolute;
  top: calc(100% + var(--s2));
  right: 0;
  z-index: 41;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s1);
  padding: var(--s2);
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: var(--e3);
}

.emote-pop__item {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  font-size: 28px;
  line-height: 1;
  border: 1px solid transparent;
  border-radius: var(--r-md);
  background: transparent;
  transition:
    background var(--dur-1) var(--ease),
    transform var(--dur-1) var(--ease);
}

.emote-pop__item:hover {
  background: var(--surface-2);
}

.emote-pop__item:active {
  transform: scale(0.92);
  background: var(--surface-3);
}

/* thumbs need a bigger target than a mouse does */
@media (pointer: coarse) {
  .emote-pop__item {
    width: 58px;
    height: 58px;
    font-size: 32px;
  }
}
</style>
