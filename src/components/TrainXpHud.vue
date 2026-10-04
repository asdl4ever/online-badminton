<script setup lang="ts">
import { computed } from 'vue';
import {
  TRAIN_META,
  TRAIN_MAX_LEVEL,
  TRAIN_DAILY_SETS,
  trainProgress,
  trainXpFor,
  type TrainKey,
} from '../game/training';
import { useProgressStore } from '../stores/progress';

/**
 * 锻炼页（健身房 / 操场）**底部那条总览**：把这一页会练到的几维
 * 各画一行「图标 + 等级 + 进度条 + 经验/下一级 + 今日训练额度」。
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
    const setsToday = progress.trainSetsToday(k);
    return {
      key: k,
      icon: ICON[k],
      label: TRAIN_META[k].label,
      color: TRAIN_META[k].color,
      level,
      pct: Math.round(trainProgress(level, xp) * 100),
      text: level >= TRAIN_MAX_LEVEL ? '满级' : `${xp}/${trainXpFor(level)}`,
      setsToday,
      daily: TRAIN_DAILY_SETS,
      done: setsToday >= TRAIN_DAILY_SETS,
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
      <span class="xhud__quota" :class="{ 'is-done': r.done }">
        今日 {{ Math.min(r.setsToday, r.daily) }}/{{ r.daily }}
      </span>
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
  gap: 18px;
  padding: 7px 16px;
  border-radius: 14px;
  background: rgba(18, 26, 20, 0.6);
  box-shadow: 0 6px 18px -10px rgba(0, 0, 0, 0.7);
  pointer-events: none;
  z-index: 24;
}

.xhud__row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #f2ffe9;
  white-space: nowrap;
}

.xhud__track {
  display: block;
  width: 96px;
  height: 7px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.45);
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
  color: #cfe0cf;
}

/* 今日训练额度：满额是绿的，超额后转成金色提醒「再练只给零头」 */
.xhud__quota {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgba(55, 214, 122, 0.22);
  color: #baf0cb;
  font-size: 10px;
}

.xhud__quota.is-done {
  background: rgba(255, 212, 92, 0.22);
  color: #ffe6a8;
}
</style>
