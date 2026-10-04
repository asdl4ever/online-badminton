<script setup lang="ts">
/**
 * **场地上方的计分牌子**：`赛事名 · 轮次` + `左选手 [比分] 右选手`；没得播时写一行说明。
 * 场馆中央球场 / 观战台大屏头都用它（`em` 控制整体大小）。
 */
withDefaults(
  defineProps<{
    /** 「小白公开赛 · 4 强赛」这种 */
    label?: string;
    left?: string;
    right?: string;
    /** 比分：有就在两位选手中间显示「3 : 2」，没有就退回「VS」 */
    scoreL?: number | null;
    scoreR?: number | null;
    /** 此刻是否真的在直播窗口里（false 会标一下「间隙」） */
    live?: boolean;
    /** 没得播时写的一行 */
    idleText?: string;
    em?: number;
  }>(),
  {
    label: '',
    left: '',
    right: '',
    scoreL: null,
    scoreR: null,
    live: false,
    idleText: '本场已结束 · 等下一场',
    em: 24,
  },
);
</script>

<template>
  <div class="board" :style="{ fontSize: `${em}px` }">
    <span class="board__tag" :class="{ 'is-idle': !label }">{{ label || idleText }}</span>
    <template v-if="left && right">
      <span class="board__name">{{ left }}</span>
      <span v-if="scoreL != null && scoreR != null" class="board__score num">
        {{ scoreL }} : {{ scoreR }}
      </span>
      <span v-else class="board__vs">VS</span>
      <span class="board__name board__name--r">{{ right }}</span>
      <span v-if="!live" class="board__tag is-idle">间隙</span>
    </template>
  </div>
</template>

<style scoped>
.board {
  display: flex;
  align-items: center;
  gap: 0.7em;
  padding: 0.35em 1em;
  border-radius: 0.7em;
  border: 0.12em solid #ffd45c;
  background: rgba(10, 20, 14, 0.86);
  color: #f2ffe9;
  font-weight: 800;
  white-space: nowrap;
}

.board__tag {
  font-size: 0.75em;
  opacity: 0.85;
}

.board__tag.is-idle {
  opacity: 0.7;
}

.board__name {
  font-size: 0.95em;
}

.board__name--r {
  text-align: right;
}

.board__vs {
  font-size: 0.75em;
  color: #ffd45c;
}

/* 比分：牌子中间两个金色大字（和普通场地那块计分板一个味道） */
.board__score {
  font-size: 1.2em;
  font-weight: 800;
  color: #ffd45c;
  letter-spacing: 0.06em;
}
</style>
