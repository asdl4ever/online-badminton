<script setup lang="ts">
/**
 * **场边座位区**（一排座位块）——场馆里的中央球场 / 观战台 / 影院的座位都是这一套，
 * 只是各自再叠自己的细节（观战台那侧还有上座率与逐座坐下）。
 *
 * `em` 给的是这块的基准字号：座位尺寸全用 em，所以场地盒子多大、座位就多大。
 */
withDefaults(defineProps<{ seats?: number; em?: number }>(), { seats: 11, em: 26 });
</script>

<template>
  <div class="seats" :style="{ fontSize: `${em}px` }">
    <i v-for="n in seats" :key="n" class="seats__seat" />
  </div>
</template>

<style scoped>
.seats {
  display: flex;
  gap: 0.4em;
  padding: 0.35em 0.6em;
  border-radius: 0.6em;
  background: repeating-linear-gradient(
    90deg,
    rgba(30, 46, 40, 0.5) 0 0.9em,
    transparent 0.9em 1.3em
  );
  box-shadow: inset 0 0 0 0.1em rgba(30, 46, 40, 0.35);
}

.seats__seat {
  width: 0.9em;
  height: 0.9em;
  border-radius: 0.2em;
  background: #6b7383;
  box-shadow: inset 0 -0.15em 0 rgba(0, 0, 0, 0.25);
}
</style>
