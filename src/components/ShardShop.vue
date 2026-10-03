<script setup lang="ts">
import ItemIcon from './ItemIcon.vue';
import Stars from './ui/Stars.vue';
import { SHARD_SHOP_ITEMS } from '../game/items';
import { useProgressStore } from '../stores/progress';
import { toastGood, toastWarn } from '../composables/useToast';
import { sfx } from '../game/audio';

/**
 * 🧩 碎片兑换：挂在**宝箱面板**下面的兑换区。
 *
 * 货架只有**为碎片兑换定制的专属装扮**（`source: 'shard'`）——开箱抽不到、
 * 金币买不到，唯一入手途径就是攒碎片来换。碎片只从开箱来（袋子档给的）。
 */
const progress = useProgressStore();

function redeem(id: string): void {
  const r = progress.redeemShardItem(id);
  if (!r.ok) {
    sfx.click();
    toastWarn(r.message);
    return;
  }
  sfx.point();
  toastGood(r.message);
}
</script>

<template>
  <div class="ss">
    <div class="ss__top">
      <div class="ss__wallet">
        <span class="ss__shard">🧩</span>
        <span class="num ss__shard-num">{{ progress.shards }}</span>
        <span class="muted ss__shard-label">星尘碎片</span>
      </div>
      <span class="muted ss__hint">攒够就能换 · 兑换区的装扮别处拿不到</span>
    </div>

    <div class="ss__grid">
      <button
        v-for="e in SHARD_SHOP_ITEMS"
        :key="e.item.id"
        class="ss__card"
        :class="{ 'is-owned': progress.owned.includes(e.item.id) }"
        type="button"
        :disabled="progress.owned.includes(e.item.id)"
        @click="redeem(e.item.id)"
      >
        <span class="ss__icon"><ItemIcon :item="e.item" /></span>
        <span class="ss__label">{{ e.item.label }}</span>
        <Stars class="ss__stars" :value="e.item.stars" />
        <span class="ss__price num">
          {{ progress.owned.includes(e.item.id) ? '已拥有' : `🧩 ${e.price}` }}
        </span>
      </button>
    </div>

    <p class="muted ss__note">
      碎片来自<b>开箱的袋子档</b>（约每 5 把钥匙一袋，每袋 🧩9~20）。
      这里只上<b>碎片专属</b>的六件装扮——宝箱抽不到它们，金币商店也不卖。
    </p>
  </div>
</template>

<style scoped>
.ss {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.ss__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.ss__wallet {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.ss__shard {
  font-size: 20px;
}

.ss__shard-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.ss__shard-label,
.ss__hint {
  font-size: 12px;
}

.ss__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: var(--s2);
}

.ss__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--s3) var(--s2);
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, #8f6ad8 40%, var(--line));
  background: color-mix(in srgb, #8f6ad8 8%, var(--surface));
  cursor: pointer;
}

.ss__card:disabled {
  opacity: 0.55;
  cursor: default;
}

.ss__card:not(:disabled):hover {
  border-color: #8f6ad8;
  background: color-mix(in srgb, #8f6ad8 16%, var(--surface));
  transform: translateY(-2px);
  transition: transform 200ms var(--ease-jelly);
}

.ss__icon {
  width: 100%;
  height: 56px;
  display: block;
}

.ss__label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.ss__stars {
  font-size: 10px;
}

.ss__price {
  font-size: 13px;
  font-weight: 700;
  color: #7a5410;
}

.ss__note {
  font-size: 12px;
  margin: 0;
}
</style>
