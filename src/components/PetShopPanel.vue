<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Button from './ui/Button.vue';
import Stars from './ui/Stars.vue';
import ItemIcon from './ItemIcon.vue';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';
import { PETS, type Item } from '../game/items';
import { petBonusOf, petBonusText } from '../game/pets';
import type { PetId } from '../game/cosmetics';
import { sfx } from '../game/audio';

/**
 * 🐾 宠物店（商城里的「宠物」那一栏，原来是大地图上可以走动的 /petshop）：
 * 3 个展示位明码标价卖现成宠物，每小时整点补货。
 *
 * ⚠️ 购买仍是占位（和搬家前一样）：扣钱、宠物入袋、下架展示位的规则还没定，
 * 所以这里只提示「开发中」，不真扣金币。
 */
const progress = useProgressStore();

interface ShopPet {
  item: Item;
  ref: string;
  star: number;
  price: number;
}

/** 按星级定价（占位，后续进 store） */
const STAR_PRICE: Record<number, number> = { 1: 150, 2: 280, 3: 480, 4: 880, 5: 1600 };

/** 占位样例：普通/稀有常见，史诗/传说小概率——先固定三只不同星级的宠物看版式 */
const SAMPLE_REFS: { ref: string; star: number }[] = [
  { ref: 'cat', star: 3 },
  { ref: 'fairy', star: 4 },
  { ref: 'dragon', star: 5 },
];

const stock = computed<ShopPet[]>(() =>
  SAMPLE_REFS.map(({ ref, star }) => ({
    item: PETS.find((p) => p.ref === ref)!,
    ref,
    star,
    price: STAR_PRICE[star] ?? 480,
  })),
);

/** 每小时整点补货：倒计时 */
const nowMs = ref(Date.now());
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => (nowMs.value = Date.now()), 1000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const countdown = computed(() => {
  const left = 3600_000 - (nowMs.value % 3600_000);
  const m = Math.floor(left / 60000);
  const s = Math.floor((left % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
});

function buy(pet: ShopPet): void {
  if (progress.coins < pet.price) {
    sfx.click();
    toastWarn(`金币不足，还差 ${pet.price - progress.coins}`);
    return;
  }
  // TODO 接 store：扣钱、宠物入袋（已拥有则折算金币）、下架该展示位
  sfx.click();
  toastGood(`「${pet.item.label}」已带回家！（功能开发中）`);
}
</script>

<template>
  <div class="pets">
    <div class="pets__bar">
      <div class="pets__bar-left">
        <span class="pets__label">🐾 在售宠物</span>
        <span class="muted pets__note">每小时整点补货 · 普通 / 稀有常见，史诗 / 传说小概率上架</span>
      </div>
      <span class="pets__timer">
        下批补货 <b class="num">{{ countdown }}</b>
      </span>
    </div>

    <div class="pets__grid">
      <div v-for="pet in stock" :key="pet.ref" class="pet-card">
        <div class="pet-card__stage">
          <div class="pet-card__pet">
            <ItemIcon :item="pet.item" />
          </div>
        </div>
        <div class="pet-card__name">{{ pet.item.label }}</div>
        <Stars class="pet-card__stars" :value="pet.star" />
        <!-- 🐾 每只宠物的加成不一样，星级越高越大（装备着才生效） -->
        <div class="pet-card__bonus">🐾 {{ petBonusText(petBonusOf(pet.ref as PetId, pet.star)) }}</div>
        <div class="pet-card__price num">🪙 {{ pet.price }}</div>
        <Button size="sm" block :disabled="progress.coins < pet.price" @click="buy(pet)">
          {{ progress.coins < pet.price ? '金币不足' : '带它回家' }}
        </Button>
      </div>
    </div>

    <p class="muted pets__foot">
      买下后直接进收藏，去「背包」里装备；重复购买的宠物会折算成金币返还。
      金币来自<b>把材料交给赚钱区的农场主</b>（棉花 / 矿石 / 鱼）。
    </p>
  </div>
</template>

<style scoped>
.pets {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.pets__bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
  padding: var(--s3) var(--s4);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, #3d8bfd 40%, var(--line));
  background: linear-gradient(120deg, color-mix(in srgb, #3d8bfd 12%, var(--surface-2)), var(--surface-2));
}

.pets__bar-left {
  display: flex;
  align-items: baseline;
  gap: var(--s2);
  flex-wrap: wrap;
}

.pets__label {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
}

.pets__note {
  font-size: 12px;
}

.pets__timer {
  font-size: 12px;
  color: var(--text-dim);
}

.pets__timer b {
  color: var(--text);
  font-variant-numeric: tabular-nums;
}

.pets__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: var(--s3);
}

.pet-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.pet-card__stage {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  height: 84px;
  border-radius: var(--r-sm);
  background: linear-gradient(180deg, #dceaf7, #c9dcee);
  overflow: hidden;
}

.pet-card__pet {
  width: 64px;
  height: 64px;
  margin-bottom: 6px;
  animation: pet-float 2.4s ease-in-out infinite;
}

@keyframes pet-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

.pet-card__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.pet-card__stars {
  font-size: 12px;
}

.pet-card__bonus {
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-dim);
  text-align: center;
}

.pet-card__price {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.pets__foot {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}
</style>
