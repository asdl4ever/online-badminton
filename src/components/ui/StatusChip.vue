<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'idle' | 'ok' | 'warn' | 'accent' | 'danger';
  }>(),
  { tone: 'idle' },
);
</script>

<template>
  <span class="chip" :class="`chip--${tone}`">
    <span class="chip__dot" aria-hidden="true" />
    <span class="chip__label"><slot /></span>
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  padding: 6px var(--s3);
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  box-shadow: var(--e1), var(--hairline);
  font-size: 13px;
  font-weight: 500;
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
}
.chip--warn .chip__dot {
  background: var(--warn);
}
.chip--accent .chip__dot {
  background: var(--accent);
}
.chip--danger .chip__dot {
  background: var(--danger);
}

.chip--ok .chip__label,
.chip--accent .chip__label {
  color: var(--text);
}
</style>
