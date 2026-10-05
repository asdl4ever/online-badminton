<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { paintActionPreview } from '../game/draw/canvas2d';
import type { Cosmetic } from '../game/cosmetics';
import type { ItemSlot } from '../game/items';

/**
 * 试穿预览的小舞台：**角色挥着拍、一颗羽毛球从面前飞过**，
 * 专门用来演示那些「只在动作里才看得见」的部位——挥拍拖尾（拍头真实轨迹）、
 * 击球拖尾（球身后那一路）、命中特效（拍中那一瞬间）。
 *
 * 画法与球场完全共用（`canvas2d.paintActionPreview`），所以这里看到的就是游戏里的样子。
 */
const props = defineProps<{ cosmetic: Cosmetic; slot: ItemSlot }>();

const canvas = ref<HTMLCanvasElement | null>(null);

let raf = 0;
function loop(now: number): void {
  const c = canvas.value;
  if (c) paintActionPreview(c, props.cosmetic, now, props.slot);
  raf = requestAnimationFrame(loop);
}

onMounted(() => {
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
});
</script>

<template>
  <!-- ⚠️ 类名不能叫 `stage`：全局 `style.css` 里 `.page--playing .shell-ui__main .stage`
       那条是给**游戏画面容器**用的（`position: absolute; inset: 0`），
       在商城这种「带外壳的页面」里会把这块预览画布撑成整屏。 -->
  <canvas ref="canvas" class="aps" />
</template>

<style scoped>
/* 舞台是 260×200 的逻辑画面，这里只负责等比铺满、不拉伸 */
.aps {
  display: block;
  width: 100%;
  aspect-ratio: 260 / 200;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  background: #f7f9fd;
}
</style>
