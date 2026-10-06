<script setup lang="ts">
import { computed, ref } from 'vue';
import AppModal from './ui/AppModal.vue';
import ItemIcon from './ItemIcon.vue';
import CharacterPreview from './CharacterPreview.vue';
import ItemPreviewStage from './ItemPreviewStage.vue';
import Stars from './ui/Stars.vue';
import {
  ITEMS,
  RARITY_META,
  SLOT_LABELS,
  SLOT_ORDER,
  wearItem,
  type Item,
  type ItemSlot,
} from '../game/items';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import { useProgressStore } from '../stores/progress';

/**
 * 📖 装扮图鉴：全部 723+ 件装扮一墙看，
 * 点任意图标 → 右边演出「装备在角色身上的样子」。
 * 预览基准与宝箱的「👀 试穿效果」同口径：默认小人 + 这一件（`wearItem(DEFAULT_COSMETIC, …)`），
 * 只算一份新装扮、不动存档——两件东西能公平对比。
 * 动作类部位（拖尾 / 挥拍拖尾 / 命中特效）静穿看不见，走 ItemPreviewStage 演一段挥拍。
 */
const open = defineModel<boolean>({ default: false });

const progress = useProgressStore();

type Filter = ItemSlot | 'all';
const filter = ref<Filter>('all');
const selected = ref<Item | null>(null);

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  ...SLOT_ORDER.map((s) => ({ id: s as Filter, label: SLOT_LABELS[s] })),
];

/** 星级筛选（多选，空 = 不限） */
const starFilter = ref<number[]>([]);
function toggleStar(star: number): void {
  const i = starFilter.value.indexOf(star);
  if (i >= 0) starFilter.value.splice(i, 1);
  else starFilter.value.push(star);
}

/** 部位 + 星级过滤后的清单（按物品表登记顺序） */
const shown = computed(() =>
  ITEMS.filter(
    (i) =>
      (filter.value === 'all' || i.slot === filter.value) &&
      (starFilter.value.length === 0 || starFilter.value.includes(i.stars)),
  ),
);

const ownedCount = computed(() => ITEMS.filter((i) => progress.isOwned(i)).length);

/** 只在动作里才看得见的部位（与宝箱 / 背包同一口径） */
const IN_GAME_ONLY: ItemSlot[] = ['trail', 'swingTrail', 'effect'];
const isAction = computed(() => !!selected.value && IN_GAME_ONLY.includes(selected.value.slot));

/** 预览装扮 = 默认小人 + 选中这一件（不动自己的穿戴） */
const previewCos = computed(() =>
  selected.value ? wearItem(DEFAULT_COSMETIC, selected.value) : DEFAULT_COSMETIC,
);

function pick(item: Item): void {
  selected.value = item;
}

function slotCount(slot: ItemSlot): number {
  return ITEMS.filter((i) => i.slot === slot).length;
}

const SOURCE_LABELS: Partial<Record<Item['source'], string>> = {
  free: '初始',
  gacha: '宝箱',
  chest: '宝箱专属',
  shard: '碎片兑换',
  coin: '金币商店',
  egg: '孵蛋',
  streak: '连续签到',
  code: '兑换码',
  honor: '荣誉商店',
  event: '活动限定',
  combo: '连击里程碑',
  run: '操场跑量',
  bronze: '段位奖励',
  silver: '段位奖励',
  gold: '段位奖励',
  platinum: '段位奖励',
  diamond: '段位奖励',
  master: '段位奖励',
  king: '段位奖励',
  god: '段位奖励',
};
function sourceLabel(item: Item): string {
  return SOURCE_LABELS[item.source] ?? item.source;
}
</script>

<template>
  <AppModal v-model="open" title="📖 装扮图鉴" max-width="900px">
    <div class="codex">
      <!-- 左：物品墙 -->
      <div class="codex__wall">
        <div class="codex__chips">
          <button
            v-for="f in filters"
            :key="f.id"
            class="codex__chip"
            :class="{ 'is-on': filter === f.id }"
            type="button"
            @click="filter = f.id"
          >
            {{ f.label }}
            <span v-if="f.id !== 'all'" class="codex__chip-n">{{ slotCount(f.id as ItemSlot) }}</span>
          </button>
          <span class="codex__chip-sep"></span>
          <button
            v-for="s in [1, 2, 3, 4, 5]"
            :key="s"
            class="codex__chip codex__chip--star"
            :class="{ 'is-on': starFilter.includes(s) }"
            type="button"
            @click="toggleStar(s)"
          >
            {{ s }}★
          </button>
        </div>
        <div class="codex__grid">
          <button
            v-for="item in shown"
            :key="item.id"
            class="codex__cell"
            :class="[
              `is-${item.rarity}`,
              { 'is-owned': progress.isOwned(item), 'is-on': selected?.id === item.id },
            ]"
            type="button"
            :title="`${item.label} · ${item.stars}★ · ${SLOT_LABELS[item.slot]}`"
            @click="pick(item)"
          >
            <ItemIcon :item="item" />
            <span v-if="progress.isOwned(item)" class="codex__own" aria-label="已拥有">✓</span>
          </button>
        </div>
      </div>

      <!-- 右：试穿预览 -->
      <div class="codex__side">
        <template v-if="selected">
          <div class="codex__stage">
            <ItemPreviewStage
              v-if="isAction"
              :cosmetic="previewCos"
              :slot="selected.slot"
            />
            <CharacterPreview v-else :cosmetic="previewCos" />
          </div>
          <p v-if="isAction" class="muted codex__stage-hint">
            🎬 动作类部位静穿看不见——这里演它在球场上的样子
          </p>
          <div class="codex__info">
            <span class="codex__icon"><ItemIcon :item="selected" /></span>
            <div class="codex__meta">
              <b class="codex__name">{{ selected.label }}</b>
              <Stars :value="selected.stars" />
              <span class="codex__tags">
                <span class="codex__tag" :style="{ color: RARITY_META[selected.rarity].color }">
                  {{ RARITY_META[selected.rarity].label }}
                </span>
                <span class="codex__tag">{{ SLOT_LABELS[selected.slot] }}</span>
                <span class="codex__tag">{{ sourceLabel(selected) }}</span>
                <span class="codex__tag" :class="progress.isOwned(selected) ? 'is-owned' : 'is-missing'">
                  {{ progress.isOwned(selected) ? '已拥有' : '未收集' }}
                </span>
              </span>
            </div>
          </div>
        </template>
        <template v-else>
          <CharacterPreview />
          <p class="muted codex__placeholder">
            点左边的图标，看看它穿在身上什么样 👀
            <br />已收集 {{ ownedCount }} / {{ ITEMS.length }} 件
          </p>
        </template>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
.codex {
  display: grid;
  grid-template-columns: 1fr minmax(200px, 250px);
  gap: var(--s4);
  align-items: start;
}

/* --- 左：物品墙 ------------------------------------------------------------- */
.codex__wall {
  min-width: 0;
}

.codex__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--s3);
}

.codex__chip {
  padding: 4px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: transparent;
  font-size: 12px;
  color: var(--text);
  cursor: pointer;
}

.codex__chip.is-on {
  background: var(--accent, #2f6df6);
  border-color: transparent;
  color: #fff;
}

.codex__chip-n {
  opacity: 0.6;
  margin-left: 2px;
}

.codex__chip-sep {
  width: 1px;
  align-self: stretch;
  background: var(--line);
  margin: 0 4px;
}

.codex__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 8px;
  max-height: 60vh;
  overflow-y: auto;
  padding: 2px;
}

.codex__cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: var(--r-md);
  border: 2px solid var(--line);
  background: #fff;
  padding: 4px;
  cursor: pointer;
  overflow: hidden;
}

.codex__cell.is-rare { border-color: #3d8bfd; }
.codex__cell.is-epic { border-color: #9b59d0; }
.codex__cell.is-legendary { border-color: #e8a33d; }

.codex__cell.is-on {
  outline: 2px solid var(--accent, #2f6df6);
  outline-offset: 1px;
}

/* 未收集的降低存在感，但图标仍可看（图鉴就是让人看全的） */
.codex__cell:not(.is-owned) {
  opacity: 0.45;
  filter: grayscale(0.5);
}

.codex__cell:not(.is-owned):hover {
  opacity: 0.85;
  filter: none;
}

.codex__own {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #2f9e44;
  color: #fff;
  font-size: 10px;
  line-height: 15px;
  text-align: center;
}

/* --- 右：预览 ---------------------------------------------------------------- */
.codex__side {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.codex__stage-hint {
  font-size: 12px;
}

.codex__info {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.codex__icon {
  width: 52px;
  height: 52px;
  flex: none;
}

.codex__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.codex__name {
  font-size: 14px;
}

.codex__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.codex__tag {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: var(--r-pill);
  background: rgba(2, 6, 16, 0.06);
}

.codex__tag.is-owned {
  background: rgba(47, 158, 68, 0.15);
  color: #2f9e44;
}

.codex__tag.is-missing {
  background: rgba(2, 6, 16, 0.1);
}

.codex__placeholder {
  font-size: 12px;
}

@media (max-width: 700px) {
  .codex {
    grid-template-columns: 1fr;
  }

  .codex__side {
    position: static;
  }
}
</style>
