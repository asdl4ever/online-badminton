<script setup lang="ts">
import { computed } from 'vue';
import Button from './ui/Button.vue';
import ItemIcon from './ItemIcon.vue';
import { ITEMS, MILESTONE_REWARD, type Item } from '../game/items';

import { useProgressStore } from '../stores/progress';

/**
 * 发球机「连击里程碑」详情。
 *
 * 规则（见 `progress.claimMilestone`）：在发球机模式里连续接球，连击每到 10 的倍数
 * 解锁一档，共 10 档。10~90 各给**固定部位**的一件随机宝箱装扮（部位写死在
 * `MILESTONE_SLOT` 里，所以这里能事先告诉你这档会给什么），**100 连击解锁哥斯拉**。
 *
 * 进度条读的是「历史最高连击」（`progress.machineBest`），每档只解锁一次，
 * 已解锁的格子会直接回显当时真正抽到的那件东西。
 */
const emit = defineEmits<{ play: [] }>();
const progress = useProgressStore();

/** 十档里程碑：10 / 20 / … / 100 */
const MILESTONES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
/** 进度条的满格线 */
const GOAL = 100;

/** 历史最高连击（进度条读数） */
const best = computed(() => progress.machineBest);
const pct = computed(() => Math.min(100, Math.round((best.value / GOAL) * 100)));
const done = computed(() => MILESTONES.filter((m) => progress.milestones.includes(m)).length);
/** 下一档还没解锁的里程碑 */
const next = computed(() => MILESTONES.find((m) => !progress.milestones.includes(m)) ?? null);
/** 距离下一档还差多少连击 */
const remaining = computed(() => (next.value ? Math.max(0, next.value - best.value) : 0));

const has = (m: number): boolean => progress.milestones.includes(m);

/** 这一档当时抽到了什么（老存档可能没有记录） */
function unlocked(m: number): Item | undefined {
  const id = progress.milestoneLog[String(m)];
  return id ? ITEMS.find((i) => i.id === id) : undefined;
}

/** 格子上的文字：每一档都是固定的活动专属装扮，解锁前后都显示它的名字 */
function rewardLabel(m: number): string {
  const got = unlocked(m);
  if (got) return got.label;
  if (m >= 100) return '哥斯拉 + 教练';
  const id = MILESTONE_REWARD[m];
  const item = id ? ITEMS.find((i) => i.id === id) : undefined;
  return item?.label ?? '神秘装扮';
}
</script>

<template>
  <div class="combo">
    <div class="combo__head">
      <div class="combo__headline">
        <div class="combo__title">🎯 发球机连击里程碑</div>
        <div class="muted combo__sub">
          在<b>发球机模式</b>里连着接球，连击每到 10 的倍数解锁一档，十档各只算一次
        </div>
      </div>
      <div class="combo__best">
        <span class="num combo__best-n">{{ best }}</span>
        <i>最高连击</i>
      </div>
    </div>

    <div class="combo__bar">
      <i class="combo__fill" :style="{ width: `${pct}%` }" />
    </div>
    <div class="combo__meta">
      <span class="muted">进度 <b class="num">{{ best }}</b> / {{ GOAL }} 连击</span>
      <span class="muted">已解锁 <b class="num">{{ done }}</b> / {{ MILESTONES.length }} 档</span>
    </div>

    <p v-if="next" class="combo__next">
      下一档：<b class="num">{{ next }}</b> 连击
      <template v-if="remaining > 0">（还差 <b class="num">{{ remaining }}</b>）</template>
      <template v-else>（已经够到了）</template>
      → 解锁 <b class="combo__next-r">{{ rewardLabel(next) }}</b>
    </p>
    <p v-else class="combo__next combo__all">十档全部解锁 🎉</p>

    <div class="combo__grid">
      <div
        v-for="m in MILESTONES"
        :key="m"
        class="combo__cell"
        :class="{ 'is-done': has(m), 'is-big': m >= 100 }"
      >
        <span class="combo__n num">{{ m }}</span>
        <ItemIcon v-if="unlocked(m)" :item="unlocked(m)!" class="combo__icon" />
        <span class="combo__r" :title="unlocked(m)?.label">{{ rewardLabel(m) }}</span>
        <span v-if="has(m)" class="combo__tick">✓</span>
      </div>
    </div>

    <p class="muted combo__note">
      十档都是<b>发球机活动专属</b>的「复古训练房」套装（教练帽 / 涡轮双翼 / 冠军毛巾 /
      训练聚光灯 / 复古木拍 / 荧光训练球 / 节拍器弧线 / 砰！贴纸 / 场地标线），
      <b>100 连击</b>解锁传说角色形象「哥斯拉」（自动装备）+ 同主题的「发球机教练」形象。
      只能靠连击解锁，宝箱里抽不到。
    </p>

    <Button variant="primary" block @click="emit('play')">🎯 去发球机练球</Button>
  </div>
</template>

<style scoped>
.combo__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--s3);
}

.combo__headline {
  min-width: 0;
}

.combo__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.combo__sub {
  margin-top: 2px;
  font-size: 12px;
  line-height: 1.5;
}

.combo__best {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
}

.combo__best-n {
  font-size: 26px;
  font-weight: 700;
  color: var(--accent);
}

.combo__best i {
  font-style: normal;
  font-size: 10px;
  color: var(--text-dim);
}

.combo__bar {
  height: 10px;
  margin: var(--s3) 0 var(--s1);
  border-radius: var(--r-pill);
  background: var(--surface-3, rgba(127, 127, 127, 0.18));
  overflow: hidden;
}

.combo__fill {
  display: block;
  height: 100%;
  border-radius: var(--r-pill);
  background: linear-gradient(90deg, #7fd4ff, #e8a33d);
  transition: width 0.4s ease;
}

.combo__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 11px;
}

.combo__next {
  margin: var(--s2) 0 0;
  padding: 6px 10px;
  border-radius: var(--r-md);
  background: color-mix(in srgb, #e8a33d 12%, transparent);
  font-size: 12px;
  line-height: 1.6;
  color: var(--text);
}

.combo__next-r {
  color: #e8a33d;
}

.combo__all {
  text-align: center;
  font-weight: 700;
  color: #e8a33d;
}

.combo__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin: var(--s3) 0 var(--s2);
}

.combo__cell {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 7px 2px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  opacity: 0.55;
}

.combo__cell.is-done {
  opacity: 1;
  border-color: #e8a33d;
  background: color-mix(in srgb, #e8a33d 12%, var(--surface-2));
}

.combo__cell.is-big {
  border-color: color-mix(in srgb, #53e0a0 60%, var(--line));
}

.combo__cell.is-big.is-done {
  border-color: #53e0a0;
  background: color-mix(in srgb, #53e0a0 14%, var(--surface-2));
}

.combo__n {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

/* 已解锁的格子：直接回显当时抽到的那件装扮的游戏同款图标 */
.combo__icon {
  width: 30px;
  height: 30px;
}

.combo__r {
  max-width: 100%;
  font-size: 9px;
  line-height: 1.2;
  text-align: center;
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.combo__cell.is-done .combo__r {
  color: var(--text);
}

.combo__tick {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 10px;
  color: #e8a33d;
}

.combo__note {
  margin: 0 0 var(--s3);
  font-size: 11px;
  line-height: 1.6;
}

@media (max-width: 420px) {
  .combo__grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
