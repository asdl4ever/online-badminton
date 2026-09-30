<script setup lang="ts">
import { computed, ref } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';
import {
  CHEST_COST,
  ITEMS,
  PITY_LIMIT,
  RARITY_META,
  SLOT_LABELS,
  SLOT_ORDER,
  type Item,
  type ItemSlot,
} from '../game/items';
import type { AuraId, HitStyle, RacketSkinId, TitleId, WingId } from '../game/cosmetics';
import Button from './ui/Button.vue';

const store = useCustomizeStore();
const progress = useProgressStore();

const COLS = 5;
const PAGE = COLS * COLS;

const result = ref<{ item: Item; duplicate: boolean; refund: number } | null>(null);
type Filter = ItemSlot | 'all';
const filter = ref<Filter>('all');

const canOpen = computed(() => progress.coins >= CHEST_COST);
const ownedItems = computed(() => ITEMS.filter((i) => progress.isOwned(i)));
const ownedCount = computed(() => ownedItems.value.length);

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  ...SLOT_ORDER.map((s) => ({ id: s as Filter, label: SLOT_LABELS[s] })),
];

const filtered = computed(() =>
  filter.value === 'all' ? ownedItems.value : ownedItems.value.filter((i) => i.slot === filter.value),
);

/** a fixed 5x5 grid per page, padded with empty cells */
const cells = computed<(Item | null)[]>(() => {
  const n = Math.max(PAGE, Math.ceil(filtered.value.length / PAGE) * PAGE);
  const out: (Item | null)[] = filtered.value.slice();
  while (out.length < n) out.push(null);
  return out;
});

function currentRef(slot: ItemSlot): string {
  switch (slot) {
    case 'wings':
      return store.wings;
    case 'aura':
      return store.aura;
    case 'racketSkin':
      return store.racketSkin;
    case 'title':
      return store.title;
    case 'effect':
      return store.effect;
  }
}

function isEquipped(item: Item): boolean {
  return currentRef(item.slot) === item.ref;
}

function equip(item: Item): void {
  switch (item.slot) {
    case 'wings':
      store.wings = item.ref as WingId;
      break;
    case 'aura':
      store.aura = item.ref as AuraId;
      break;
    case 'racketSkin':
      store.racketSkin = item.ref as RacketSkinId;
      break;
    case 'title':
      store.title = item.ref as TitleId;
      break;
    case 'effect':
      store.effect = item.ref as HitStyle;
      break;
  }
}

function onCell(item: Item | null): void {
  if (item) equip(item);
}

/** label of whatever is equipped in a slot (shown on the character side) */
function equippedLabel(slot: ItemSlot): string {
  const ref = currentRef(slot);
  const item = ITEMS.find((i) => i.slot === slot && i.ref === ref);
  return item ? item.label : ref;
}

function openChest(): void {
  const r = progress.pull();
  if (r) result.value = r;
}
</script>

<template>
  <div class="bp">
    <div class="bp__left">
      <CharacterPreview />
      <div class="bp__loadout">
        <div v-for="slot in SLOT_ORDER" :key="slot" class="bp__loadout-row">
          <span class="bp__loadout-slot">{{ SLOT_LABELS[slot] }}</span>
          <span class="bp__loadout-item">{{ equippedLabel(slot) }}</span>
        </div>
      </div>
    </div>

    <div class="bp__main">
      <div class="bp__shop">
        <div class="bp__wallet">
          <span class="bp__coin">🪙</span>
          <span class="num bp__coin-num">{{ progress.coins }}</span>
          <span class="muted bp__coin-label">金币</span>
        </div>
        <Button variant="primary" :disabled="!canOpen" @click="openChest">
          开启宝箱 · {{ CHEST_COST }}
        </Button>
        <span class="muted bp__pity">
          再抽 {{ PITY_LIMIT - progress.pity }} 次必出史诗+（{{ progress.pity }}/{{ PITY_LIMIT }}）
        </span>
      </div>

      <div
        v-if="result"
        class="bp__result"
        :style="{
          borderColor: RARITY_META[result.item.rarity].color,
          color: RARITY_META[result.item.rarity].color,
        }"
      >
        {{ result.duplicate ? '重复' : '新获得' }} {{ RARITY_META[result.item.rarity].label }}「{{
          result.item.label
        }}」
        <span v-if="result.duplicate" class="muted">· 返还 🪙{{ result.refund }}</span>
      </div>

      <div class="bp__bar">
        <div class="bp__tabs">
          <button
            v-for="f in filters"
            :key="f.id"
            class="bp__tab"
            :class="{ 'is-active': filter === f.id }"
            type="button"
            @click="filter = f.id"
          >
            {{ f.label }}
          </button>
        </div>
        <span class="muted bp__collect">已收集 {{ ownedCount }} / {{ ITEMS.length }}</span>
      </div>

      <div class="bp__grid" :style="{ '--cols': COLS }">
        <button
          v-for="(item, idx) in cells"
          :key="idx"
          class="bp__cell"
          :class="{ 'is-empty': !item, 'is-equipped': item && isEquipped(item) }"
          :style="item ? { '--rarity': RARITY_META[item.rarity].color } : undefined"
          type="button"
          :disabled="!item"
          @click="onCell(item)"
        >
          <template v-if="item">
            <span class="bp__cell-label">{{ item.label }}</span>
            <span class="bp__cell-rarity">{{ RARITY_META[item.rarity].label }}</span>
            <span v-if="isEquipped(item)" class="bp__cell-check">✓</span>
          </template>
        </button>
      </div>

      <p class="muted bp__note">
        金币来自对局结算，宝箱开出的物品会直接进入背包。点格子即可装备，重复物品按稀有度返还金币。
      </p>
    </div>
  </div>
</template>

<style scoped>
.bp {
  display: grid;
  grid-template-columns: minmax(180px, 260px) 1fr;
  gap: var(--s5);
  align-items: start;
}

.bp__left {
  min-width: 0;
}

.bp__main {
  min-width: 0;
}

.bp__loadout {
  margin-top: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.bp__loadout-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  font-size: 12px;
}

.bp__loadout-slot {
  color: var(--text-dim);
}

.bp__loadout-item {
  color: var(--text);
  font-weight: 600;
}

.bp__shop {
  display: flex;
  align-items: center;
  gap: var(--s4);
  flex-wrap: wrap;
  padding-bottom: var(--s4);
  border-bottom: 1px solid var(--line);
}

.bp__wallet {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.bp__coin {
  font-size: 20px;
}

.bp__coin-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.bp__coin-label {
  font-size: 12px;
}

.bp__pity {
  font-size: 12px;
}

.bp__result {
  margin-top: var(--s3);
  padding: var(--s2) var(--s4);
  border: 1px solid;
  border-radius: var(--r-md);
  font-size: 14px;
  background: var(--surface-2);
}

.bp__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
  margin: var(--s3) 0;
}

.bp__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bp__tab {
  padding: 6px 12px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 13px;
  cursor: pointer;
}

.bp__tab.is-active {
  color: var(--text);
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent);
}

.bp__collect {
  font-size: 12px;
}

.bp__grid {
  display: grid;
  grid-template-columns: repeat(var(--cols), 1fr);
  gap: var(--s2);
}

.bp__cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--rarity);
  background: var(--surface-2);
  color: var(--text);
  font-size: 12px;
  text-align: center;
  cursor: pointer;
  overflow: hidden;
}

.bp__cell.is-empty {
  border: 1px dashed var(--line);
  background: transparent;
  cursor: default;
}

.bp__cell.is-equipped {
  background: color-mix(in srgb, var(--rarity) 22%, var(--surface-2));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--rarity) 45%, transparent);
}

.bp__cell-label {
  font-size: 12px;
  line-height: 1.1;
}

.bp__cell-rarity {
  font-size: 9px;
  color: var(--rarity);
}

.bp__cell-check {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 11px;
  color: var(--accent);
}

.bp__note {
  margin-top: var(--s4);
  font-size: 12px;
}

@media (max-width: 560px) {
  .bp {
    grid-template-columns: 1fr;
  }
}
</style>
