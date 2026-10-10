<script setup lang="ts">
import { computed, ref } from 'vue';
import ItemIcon from './ItemIcon.vue';
import Stars from './ui/Stars.vue';
import ShopTryOnModal from './ShopTryOnModal.vue';
import { COIN_SHOP_ITEMS, SLOT_LABELS, SLOT_ORDER, type Item, type ItemSlot } from '../game/items';
import { useProgressStore } from '../stores/progress';
import { toastGood, toastWarn } from '../composables/useToast';
import { sfx } from '../game/audio';

/**
 * 🪙 金币商店：用**金币**直接买宝箱池里的**低星物品**（3★ 及以下）。
 *
 * 金币现在不再用于开宝箱（宝箱只吃钥匙），所以这里的去处是：
 * 顺手把普通 / 稀有那几件凑齐，不用为了两三件普通货反复开箱。
 * 高星（4★ / 5★）只能从宝箱出。
 */
const progress = useProgressStore();

/** 有货的部位才给页签 */
const slots = computed(() => SLOT_ORDER.filter((s) => COIN_SHOP_ITEMS.some((e) => e.item.slot === s)));
const slot = ref<ItemSlot>(slots.value[0] ?? 'effect');

/** 当前货架：没拥有的排前面，同类里星级高的先看到 */
const rows = computed(() =>
  COIN_SHOP_ITEMS.filter((e) => e.item.slot === slot.value).sort((a, b) => {
    const ownA = progress.owned.includes(a.item.id) ? 1 : 0;
    const ownB = progress.owned.includes(b.item.id) ? 1 : 0;
    return ownA - ownB || b.item.stars - a.item.stars;
  }),
);

const countIn = (s: ItemSlot): number => COIN_SHOP_ITEMS.filter((e) => e.item.slot === s).length;

function buy(id: string): void {
  const r = progress.buyCoinItem(id);
  if (!r.ok) {
    sfx.click();
    toastWarn(r.message);
    return;
  }
  sfx.point();
  toastGood(r.message);
}

/** 🛍️ 点货架 → 先弹试穿确认，确认后才真正扣钱 */
const trying = ref<Item | null>(null);
const tryingPrice = ref('');

function onCard(item: Item, price: number): void {
  if (progress.owned.includes(item.id)) return;
  trying.value = item;
  tryingPrice.value = `🪙 ${price}`;
}

function confirmBuy(): void {
  if (!trying.value) return;
  buy(trying.value.id);
  trying.value = null;
}
</script>

<template>
  <div class="cs">
    <div class="cs__top">
      <div class="cs__wallet">
        <span class="cs__coin">🪙</span>
        <span class="num cs__coin-num">{{ progress.coins }}</span>
        <span class="muted cs__coin-label">金币</span>
      </div>
      <span class="muted cs__hint">低星装扮（3★ 及以下）可以用金币直接买，高星只从宝箱出</span>
    </div>

    <div class="cs__tabs">
      <button
        v-for="s in slots"
        :key="s"
        class="cs__tab"
        :class="{ 'is-on': s === slot }"
        type="button"
        @click="slot = s"
      >
        {{ SLOT_LABELS[s] }}
        <em class="num">{{ countIn(s) }}</em>
      </button>
    </div>

    <div class="cs__grid">
      <button
        v-for="e in rows"
        :key="e.item.id"
        class="cs__card"
        :class="{ 'is-owned': progress.owned.includes(e.item.id) }"
        type="button"
        :disabled="progress.owned.includes(e.item.id)"
        @click="onCard(e.item, e.price)"
      >
        <span class="cs__icon"><ItemIcon :item="e.item" /></span>
        <span class="cs__label">{{ e.item.label }}</span>
        <Stars class="cs__stars" :value="e.item.stars" />
        <span class="cs__price num">
          {{ progress.owned.includes(e.item.id) ? '已拥有' : `🪙 ${e.price}` }}
        </span>
      </button>
    </div>

    <ShopTryOnModal
      :item="trying"
      :price-label="tryingPrice"
      @close="trying = null"
      @confirm="confirmBuy"
    />

    <p class="muted cs__note">
      金币主要来自<b>把材料交给赚钱区的农场主</b>（棉花 / 矿石 / 鱼都找他换），另有对局结算、晋级赛名次与每日任务；
      开宝箱用的是<b>钥匙</b>，不是金币；抽到重复物品会折算成 🧩 星尘碎片（去宝箱的「碎片兑换」花）。
    </p>
  </div>
</template>

<style scoped>
.cs {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.cs__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.cs__wallet {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.cs__coin {
  font-size: 20px;
}

.cs__coin-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.cs__coin-label,
.cs__hint {
  font-size: 12px;
}

.cs__tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.cs__tab {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font-size: 12px;
  cursor: pointer;
}

.cs__tab.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 14%, var(--surface-2));
}

.cs__tab em {
  font-style: normal;
  font-size: 10px;
  color: var(--text-dim);
}

.cs__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(108px, 1fr));
  gap: var(--s2);
  max-height: 46vh;
  overflow-y: auto;
  padding-right: 4px;
}

.cs__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--s2) 6px;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  cursor: pointer;
}

.cs__card:hover:not(:disabled) {
  border-color: var(--accent);
}

.cs__card.is-owned {
  opacity: 0.5;
  cursor: default;
}

.cs__icon {
  width: 54px;
  height: 54px;
}

.cs__label {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
}

.cs__stars {
  font-size: 10px;
}

.cs__price {
  font-size: 11px;
  color: var(--text-dim);
}

.cs__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
