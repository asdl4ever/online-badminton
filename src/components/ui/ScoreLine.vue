<script setup lang="ts">
/** Bottom status strip under the court: score, local side, transport. */
</script>

<template>
  <div class="scoreline surface surface--flat hud-foot">
    <slot />
  </div>
</template>

<style scoped>
.scoreline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s4);
  flex-wrap: wrap;
  padding: var(--s2) var(--s4);
  border-radius: var(--r-md);
}
</style>
