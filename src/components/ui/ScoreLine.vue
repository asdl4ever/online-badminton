<script setup lang="ts">
/** Bottom status strip under the court: score, local side, transport. */
</script>

<template>
  <div class="scoreline glass glass--cheap glass--flat hud-foot">
    <slot />
  </div>
</template>

<style scoped>
.scoreline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 9px 16px;
  border-radius: var(--r-md);
}
</style>
