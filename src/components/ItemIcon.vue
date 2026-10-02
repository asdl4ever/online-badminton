<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import type { Item } from '../game/items';
import { paintItemIcon } from '../game/draw/icons';

/** 一件物品的游戏同款静态图标（画一次，无逐帧开销） */
const props = defineProps<{ item: Item }>();

const el = ref<HTMLCanvasElement | null>(null);

function paint(): void {
  if (el.value) paintItemIcon(props.item, el.value);
}

onMounted(paint);
watch(() => props.item, paint);
</script>

<template>
  <canvas ref="el" class="item-icon" />
</template>

<style scoped>
.item-icon {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
