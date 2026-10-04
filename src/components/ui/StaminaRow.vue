<script setup lang="ts">
/**
 * 双方体力条——和正式对局（`GameCanvas.vue` 里那排）**同一套外观与数值**：
 * 球馆里「上场」打的那一局复用它，所以你在场地里看到的体力和真开一局完全一致。
 */
defineProps<{ stamina: [number, number]; localIndex?: 0 | 1 }>();
</script>

<template>
  <div class="stam-row">
    <div class="stam" :class="{ 'is-me': (localIndex ?? 0) === 0 }">
      <i :class="{ 'is-low': stamina[0] < 30 }" :style="{ width: `${stamina[0]}%` }" />
    </div>
    <div class="stam stam--right" :class="{ 'is-me': (localIndex ?? 0) === 1 }">
      <i :class="{ 'is-low': stamina[1] < 30 }" :style="{ width: `${stamina[1]}%` }" />
    </div>
  </div>
</template>

<style scoped>
.stam-row {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  display: flex;
  gap: 34px;
  padding: 0 10px;
  pointer-events: none;
}

.stam {
  flex: 1;
  height: 7px;
  margin-top: 8px;
  border-radius: 999px;
  background: rgba(8, 14, 24, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.14);
  overflow: hidden;
}

.stam i {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #35c26e, #7fe08f);
  transition: width 0.18s linear;
}

.stam i.is-low {
  background: linear-gradient(90deg, #d8483c, #ff7a5c);
}

.stam.is-me {
  border-color: color-mix(in srgb, var(--accent) 70%, transparent);
  box-shadow: 0 0 8px color-mix(in srgb, var(--accent) 45%, transparent);
}
</style>
