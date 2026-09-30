<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'idle' | 'ok' | 'warn' | 'accent';
  }>(),
  { tone: 'idle' },
);
</script>

<template>
  <span class="chip" :class="`chip--${tone}`">
    <span class="chip__dot" />
    <span class="chip__label"><slot /></span>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 13px;
  border-radius: 999px;
  border: 1px solid var(--glass-line);
  background: linear-gradient(158deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.035));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
  font-size: 13px;
  color: var(--text-dim);
  white-space: nowrap;
}

.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-dim);
  flex: none;
}

.chip--ok .chip__dot {
  background: var(--good);
  box-shadow: 0 0 10px var(--good);
}

.chip--warn .chip__dot {
  background: var(--warn);
  box-shadow: 0 0 10px var(--warn);
}

.chip--accent .chip__dot {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

.chip--ok .chip__label {
  color: var(--text);
}
</style>
