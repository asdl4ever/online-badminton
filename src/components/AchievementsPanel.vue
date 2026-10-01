<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { ACH_SECTIONS, achievementsOf, type AchSectionId } from '../game/achievements';
import { RARITY_META, SLOT_LABELS } from '../game/items';
import { useProgressStore } from '../stores/progress';

/**
 * 成就面板：分板块（海域 / 球场 / 山野 / 社交），**先做海域**。
 *
 * 进度和发奖都在 `stores/progress.ts` 里（`achievements` / `syncAchievements`），
 * 这里只负责展示：每条成就一行，带进度条、奖励（金币 / 定制物品 / 皮肤）和发放状态。
 */
const progress = useProgressStore();
const tab = ref<AchSectionId>('sea');

/** 当前板块的成就，附上奖励物品详情 */
const rows = computed(() =>
  progress.achievements
    .filter((r) => r.ach.section === tab.value)
    .map((r) => ({ ...r, item: progress.achievementItem(r.ach.itemId) })),
);

const summary = computed(() => ({
  done: progress.achDoneCount,
  total: progress.achievements.length,
}));

function doneCount(id: AchSectionId): number {
  return progress.achievements.filter((r) => r.ach.section === id && r.done).length;
}

function totalCount(id: AchSectionId): number {
  return achievementsOf(id).length;
}

const currentSection = computed(() => ACH_SECTIONS.find((s) => s.id === tab.value));

// 打开面板时先补一次判定：老存档里早就满足条件的成就，进面板就发奖
onMounted(() => progress.syncAchievements());
</script>

<template>
  <div class="ach">
    <div class="ach__head">
      <span class="ach__sum">🏅 已完成 <b class="num">{{ summary.done }}</b> / {{ summary.total }}</span>
      <span class="muted ach__hint">
        达成即发奖：金币直接到账，定制物品 / 皮肤直接进收藏（去「背包 / 外观」就能换上）
      </span>
    </div>

    <div class="ach__tabs">
      <button
        v-for="s in ACH_SECTIONS"
        :key="s.id"
        class="ach__tab"
        :class="{ 'is-on': s.id === tab, 'is-locked': !s.ready }"
        type="button"
        :disabled="!s.ready"
        @click="tab = s.id"
      >
        <span class="ach__tab-emoji">{{ s.emoji }}</span>
        <span class="ach__tab-name">{{ s.name }}</span>
        <span class="muted ach__tab-num">
          {{ s.ready ? `${doneCount(s.id)}/${totalCount(s.id)}` : '敬请期待' }}
        </span>
      </button>
    </div>

    <p class="muted ach__desc">{{ currentSection?.desc }}</p>

    <ul class="ach__list">
      <li v-for="r in rows" :key="r.ach.id" class="ach__item" :class="{ 'is-done': r.done }">
        <div class="ach__main">
          <div class="ach__name">
            <span class="ach__medal">{{ r.done ? '🏅' : '⬜' }}</span>
            {{ r.ach.name }}
          </div>
          <div class="muted ach__sub">{{ r.ach.desc }}</div>
          <div class="ach__bar"><i :style="{ width: `${Math.round(r.pct * 100)}%` }" /></div>
        </div>

        <div class="ach__right">
          <span class="muted ach__num">{{ r.cur }} / {{ r.ach.goal }}</span>
          <span v-if="r.ach.coins" class="ach__coin">¥{{ r.ach.coins }}</span>
          <span
            v-if="r.item"
            class="ach__chip"
            :style="{ borderColor: RARITY_META[r.item.rarity].color, color: RARITY_META[r.item.rarity].color }"
          >
            {{ SLOT_LABELS[r.item.slot] }} · {{ r.item.label }}
          </span>
          <span v-if="r.done" class="ach__got">已发放</span>
        </div>
      </li>
    </ul>

    <p class="muted ach__note">
      海域成就覆盖：下潜次数、渔获总量、图鉴种类、单条最重、卖鱼收入、最深下潜、买船与出海次数、渔具满级。
    </p>
  </div>
</template>

<style scoped>
.ach {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.ach__head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ach__sum {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.ach__hint {
  font-size: 11px;
  line-height: 1.5;
}

.ach__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ach__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font-size: var(--ui-font-sm);
  cursor: pointer;
}

.ach__tab.is-on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 22%, transparent);
}

.ach__tab.is-locked {
  opacity: 0.5;
  cursor: not-allowed;
}

.ach__tab-num {
  font-size: 11px;
}

.ach__desc {
  margin: 0;
  font-size: 12px;
}

.ach__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.ach__item {
  display: flex;
  align-items: center;
  gap: var(--s3);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.ach__item.is-done {
  border-color: color-mix(in srgb, var(--accent) 45%, var(--line));
  background: color-mix(in srgb, var(--accent) 10%, var(--surface-2));
}

.ach__main {
  flex: 1;
  min-width: 0;
}

.ach__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.ach__medal {
  margin-right: 2px;
}

.ach__sub {
  font-size: 11px;
  line-height: 1.4;
}

.ach__bar {
  margin-top: 5px;
  height: 5px;
  border-radius: var(--r-pill);
  background: color-mix(in srgb, var(--text-dim) 22%, transparent);
  overflow: hidden;
}

.ach__bar > i {
  display: block;
  height: 100%;
  border-radius: var(--r-pill);
  background: var(--accent);
  transition: width 0.25s var(--ease, ease);
}

.ach__right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex: none;
}

.ach__num {
  font-size: 11px;
  white-space: nowrap;
}

.ach__coin {
  font-size: 11px;
  font-weight: 600;
  color: #e8a33d;
  white-space: nowrap;
}

.ach__chip {
  padding: 1px 7px;
  border-radius: var(--r-pill);
  border: 1px solid currentColor;
  font-size: 11px;
  white-space: nowrap;
}

.ach__got {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
}

.ach__note {
  margin: 0;
  font-size: 11px;
  line-height: 1.5;
}
</style>
