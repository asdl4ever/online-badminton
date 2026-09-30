<script setup lang="ts">
/**
 * A soft-elevation surface. Three depths only — inline, floating, raised —
 * so the whole UI shares one elevation scale instead of ad-hoc shadows.
 */
withDefaults(
  defineProps<{
    variant?: 'default' | 'flat' | 'raised';
    padded?: boolean;
    radius?: 'sm' | 'md' | 'lg';
  }>(),
  { variant: 'default', padded: true, radius: 'lg' },
);
</script>

<template>
  <section
    class="surface"
    :class="[`surface--r-${radius}`, variant !== 'default' && `surface--${variant}`]"
  >
    <div :class="padded ? 'surface__body' : ''">
      <slot />
    </div>
  </section>
</template>
