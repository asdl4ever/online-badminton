<script setup lang="ts">
import { computed } from 'vue';
import {
  TRAIN_META,
  TRAIN_MAX_LEVEL,
  trainProgress,
  trainXpFor,
  type TrainKey,
} from '../game/training';
import { useProgressStore } from '../stores/progress';

/**
 * 锻炼页（健身房 / 操场）**底部那条总览**：把这一页会练到的几维
 * 各画一行「图标 + 等级 + 进度条 + 经验/下一级」。
 *
 * 头顶那条「当前正在练的那一项」由各页面画在角色身上（跟着人走），这里只做总览。
 */
const props = defineProps<{ keys: TrainKey[] }>();

const progress = useProgressStore();

const ICON: Record<TrainKey, string> = {
  attack: '🏋️',
  speed: '🏃',
  stamina: '💪',
  technique: '🎯',
  defense: '🛡️',
};

const rows = computed(() =>
  props.keys.map((k) => {
    const level = progress.trainLevels[k] ?? 0;
    const xp = progress.trainXp[k] ?? 0;
    return {
      key: k,
      icon: ICON[k],
      label: TRAIN_META[k].label,
      color: TRAIN_META[k].color,
      level,
      pct: Math.round(trainProgress(level, xp) * 100),
      text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
    };
  }),
);
</script>

<template>
  <div class="xhud">
    <div v-for="r in rows" :key="r.key" class="xhud__row">
      <span class="xhud__name" :style="{ color: r.color }">{{ r.icon }} {{ r.label }} Lv.{{ r.level }}</span>
      <span class="xhud__track"><i :style="{ width: `${r.pct}%`, background: r.color }" /></span>
      <span class="xhud__num num">{{ r.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.xhud {
  position: absolute;
  left: 50%;
  bottom: calc(env(safe-area-inset-bottom) + 12px);
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  padding: 8px 18px;
  border-radius: 16px;
  background: rgba(255, 250, 238, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 10px 26px -14px rgba(90, 60, 10, 0.6);
  backdrop-filter: blur(10px) saturate(1.4);
  -webkit-backdrop-filter: blur(10px) saturate(1.4);
  pointer-events: none;
  z-index: 24;
}

.xhud__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #4a3410;
  white-space: nowrap;
}

.xhud__track {
  display: block;
  width: 96px;
  height: 8px;
  border-radius: 999px;
  background: rgba(90, 60, 10, 0.16);
  overflow: hidden;
}

.xhud__track i {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width 0.15s linear;
}

.xhud__num {
  font-size: 11px;
  color: #8a7440;
}
</style>
