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
    class="soft-btn"
    :class="[`soft-btn--${variant}`, `soft-btn--${size}`]"
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
.soft-btn--sm {
  min-height: 36px;
  padding: 0 var(--s3);
  font-size: 13px;
}

.soft-btn--lg {
  min-height: 52px;
  padding: 0 var(--s5);
  font-size: 16px;
}
</style>
