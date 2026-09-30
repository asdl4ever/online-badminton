<script setup lang="ts">
withDefaults(defineProps<{ value: number; max?: number; animate?: boolean }>(), {
  max: 5,
  animate: false,
});
</script>

<template>
  <span class="stars" :title="`${value} / ${max}`">
    <span
      v-for="i in max"
      :key="i"
      class="star"
      :class="{ 'is-on': i <= value, 'is-pop': animate }"
      :style="animate ? { animationDelay: `${(i - 1) * 0.12}s` } : undefined"
      >★</span
    >
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 1px;
  line-height: 1;
}

.star {
  color: var(--line-strong);
  font-size: 1em;
}

.star.is-on {
  color: #e8a33d;
  text-shadow: 0 0 6px rgba(232, 163, 61, 0.55);
}

.is-pop {
  animation: star-pop 0.34s cubic-bezier(0.2, 1.4, 0.4, 1) both;
}

@keyframes star-pop {
  0% {
    transform: scale(0.2);
    opacity: 0;
  }
  60% {
    transform: scale(1.35);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}
</style>
