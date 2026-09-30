<script setup lang="ts">
/**
 * Frosted panel — the base surface of the UI.
 *
 * `cheap` skips backdrop-blur. Use it whenever the panel sits directly on top
 * of the live WebGL canvas, where a real blur would force a full-frame
 * composite every frame.
 */
withDefaults(
  defineProps<{
    cheap?: boolean;
    flat?: boolean;
    padded?: boolean;
    radius?: 'sm' | 'md' | 'lg';
  }>(),
  { cheap: false, flat: false, padded: true, radius: 'lg' },
);
</script>

<template>
  <section
    class="glass"
    :class="[
      `glass--r-${radius}`,
      { 'glass--cheap': cheap, 'glass--flat': flat },
    ]"
  >
    <div :class="padded ? 'glass__body' : ''">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.glass--r-sm {
  border-radius: var(--r-sm);
}
.glass--r-md {
  border-radius: var(--r-md);
}
</style>
