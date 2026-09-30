<script setup lang="ts">
import { VBtn } from 'vuetify/components';

withDefaults(
  defineProps<{
    variant?: 'default' | 'primary' | 'quiet';
    size?: 'sm' | 'md' | 'lg';
    block?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit';
  }>(),
  { variant: 'default', size: 'md', block: false, disabled: false, type: 'button' },
);

defineEmits<{ click: [MouseEvent] }>();
</script>

<template>
  <VBtn
    class="glass-btn"
    :class="[`glass-btn--${variant}`, `glass-btn--${size}`]"
    variant="flat"
    :block="block"
    :disabled="disabled"
    :type="type"
    @click="$emit('click', $event)"
  >
    <slot />
  </VBtn>
</template>

<style scoped>
.glass-btn--sm {
  min-height: 34px;
  padding: 0 12px;
  font-size: 13px;
}

.glass-btn--lg {
  min-height: 52px;
  padding: 0 26px;
  font-size: 17px;
}
</style>
