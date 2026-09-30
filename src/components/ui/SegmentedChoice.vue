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
    <div class="seg__track">
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
  gap: 10px;
}

.seg__label {
  font-size: 13px;
  color: var(--text-dim);
}

.seg__track {
  display: inline-flex;
  padding: 4px;
  gap: 3px;
  border-radius: 999px;
  border: 1px solid var(--glass-line);
  background: rgba(10, 20, 33, 0.6);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.seg__item {
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-dim);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 15px;
  border-radius: 999px;
  transition:
    color 0.16s ease,
    background 0.16s ease;
}

.seg__item:hover {
  color: var(--text);
}

.seg__item--on {
  color: #fff;
  background: linear-gradient(160deg, #3f95ec, #2260ab);
  border-color: rgba(150, 205, 255, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.4),
    0 8px 20px -12px rgba(47, 127, 224, 0.9);
}
</style>
