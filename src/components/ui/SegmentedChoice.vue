<script setup lang="ts">
import type { Choice } from './types';

withDefaults(
  defineProps<{
    modelValue: string;
    options: Choice[];
    label?: string;
  }>(),
  { label: '' },
);

defineEmits<{ 'update:modelValue': [string] }>();
</script>

<template>
  <div class="seg">
    <span v-if="label" class="seg__label">{{ label }}</span>
    <div class="seg__track" role="group">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="seg__item"
        :class="{ 'seg__item--on': opt.value === modelValue }"
        :aria-pressed="opt.value === modelValue"
        @click="$emit('update:modelValue', opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.seg {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
}

.seg__label {
  font-size: 13px;
  color: var(--text-dim);
}

.seg__track {
  display: inline-flex;
  padding: var(--s1);
  gap: 3px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--bg);
  box-shadow: inset 0 1px 3px rgba(2, 6, 16, 0.5);
}

.seg__item {
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  padding: 6px var(--s4);
  border-radius: var(--r-pill);
  transition:
    color var(--dur-1) var(--ease),
    background var(--dur-1) var(--ease),
    box-shadow var(--dur-1) var(--ease);
}

.seg__item:hover {
  color: var(--text);
}

.seg__item--on {
  color: #fff;
  background: linear-gradient(180deg, #3f95ec, #2260ab);
  border-color: #2f7fe0;
  box-shadow: var(--e1), inset 0 1px 0 rgba(255, 255, 255, 0.24);
}
</style>
