<script setup lang="ts">
import { computed } from 'vue';
import Button from './ui/Button.vue';
import ItemIcon from './ItemIcon.vue';
import { HONOR_ITEMS, RARITY_META, type Item } from '../game/items';
import type { CharacterSkin, MountId } from '../game/cosmetics';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';

/**
 * 荣誉商店：用「荣誉点」兑换特殊角色形象与坐骑。
 *
 * 荣誉点只有晋级赛的冠亚季军才有（见 arena.honorForPlace），杯赛越高给得越多，
 * 所以这里的定价是按「打几届高级杯赛」来定的。买下即永久拥有，可随时在背包里换。
 */
const progress = useProgressStore();
const customize = useCustomizeStore();

const groups = computed(() => [
  {
    title: '🦄 坐骑',
    note: '纯装饰：跟着角色跑和跳，不影响速度与判定',
    items: HONOR_ITEMS.filter((e) => e.item.slot === 'mount'),
  },
  {
    title: '⚔️ 特殊角色形象',
    note: '整只角色换一套绘制',
    items: HONOR_ITEMS.filter((e) => e.item.slot === 'skin'),
  },
]);

function equip(item: Item): void {
  if (item.slot === 'mount') customize.mount = item.ref as MountId;
  else if (item.slot === 'skin') customize.characterSkin = item.ref as CharacterSkin;
  sfx.click();
  toastGood(`已装备「${item.label}」`);
}

function buy(item: Item): void {
  const r = progress.buyHonorItem(item.id);
  if (r.ok) {
    sfx.point();
    toastGood(`${r.message}，去背包里装上吧`);
  } else {
    sfx.click();
    toastWarn(r.message);
  }
}
</script>

<template>
  <div class="honor">
    <div class="honor__bar">
      <span class="honor__label">🏅 荣誉点</span>
      <span class="honor__value num">{{ progress.honor }}</span>
    </div>
    <p class="muted honor__hint">
      晋级赛拿到<b>冠军 / 亚军 / 季军</b>才会给荣誉点，杯赛级别越高给得越多（最高约 3 倍）。
      荣誉点永久保留，不会随赛季清零。
    </p>

    <div v-for="g in groups" :key="g.title" class="honor__group">
      <div class="honor__group-head">
        <span class="honor__group-title">{{ g.title }}</span>
        <span class="muted honor__group-note">{{ g.note }}</span>
      </div>
      <div class="honor__grid">
        <div
          v-for="e in g.items"
          :key="e.item.id"
          class="shop-card"
          :class="[`is-${e.item.rarity}`, { 'is-owned': progress.isOwned(e.item) }]"
        >
          <div class="shop-card__icon">
            <ItemIcon :item="e.item" />
          </div>
          <div class="shop-card__name">{{ e.item.label }}</div>
          <div class="shop-card__meta" :style="{ color: RARITY_META[e.item.rarity].color }">
            {{ RARITY_META[e.item.rarity].label }}
          </div>
          <Button
            v-if="progress.isOwned(e.item)"
            size="sm"
            block
            variant="quiet"
            @click="equip(e.item)"
          >
            装备
          </Button>
          <Button
            v-else
            size="sm"
            block
            :disabled="progress.honor < e.price"
            @click="buy(e.item)"
          >
            🏅 {{ e.price }}
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.honor__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, #ffd45c 45%, var(--line));
  background: linear-gradient(120deg, color-mix(in srgb, #ffd45c 14%, var(--surface-2)), var(--surface-2));
}

.honor__label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.honor__value {
  font-size: 22px;
  font-weight: 700;
  color: #e8a33d;
}

.honor__hint {
  margin: var(--s2) 0 0;
  font-size: 12px;
  line-height: 1.6;
}

.honor__group {
  margin-top: var(--s4);
}

.honor__group-head {
  display: flex;
  align-items: baseline;
  gap: var(--s2);
  flex-wrap: wrap;
  margin-bottom: var(--s2);
}

.honor__group-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.honor__group-note {
  font-size: 11px;
}

.honor__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  gap: var(--s2);
}

.shop-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--s2);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.shop-card.is-rare {
  border-color: color-mix(in srgb, #3d8bfd 45%, var(--line));
}

.shop-card.is-epic {
  border-color: color-mix(in srgb, #9b59d0 45%, var(--line));
}

.shop-card.is-legendary {
  border-color: color-mix(in srgb, #e8a33d 55%, var(--line));
  background: color-mix(in srgb, #e8a33d 7%, var(--surface-2));
}

.shop-card.is-owned {
  opacity: 0.82;
}

.shop-card__icon {
  width: 62px;
  height: 62px;
}

.shop-card__name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
}

.shop-card__meta {
  font-size: 10px;
}
</style>
