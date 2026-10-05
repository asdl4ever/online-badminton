<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import CharacterPreview from './CharacterPreview.vue';
import ItemPreviewStage from './ItemPreviewStage.vue';
import ItemIcon from './ItemIcon.vue';
import Stars from './ui/Stars.vue';
import Button from './ui/Button.vue';
import { toastGood, toastWarn } from '../composables/useToast';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';
import {
  ITEMS,
  RARITY_META,
  SLOT_LABELS,
  SLOT_ORDER,
  wearItem,
  type Item,
  type ItemSlot,
} from '../game/items';
import { CHEST_THEMES, themeOf } from '../game/chest';
import { hasPetBonus, petBonusOf, petBonusShort, petBonusText } from '../game/pets';
import type {
  AuraId,
  BackId,
  CharacterSkin,
  HatId,
  HitStyle,
  MountId,
  PetFollow,
  PetId,
  PetSide,
  RacketSkinId,
  RingId,
  SwingTrailId,
  TrailId,
} from '../game/cosmetics';

const emit = defineEmits<{ 'open-chest': [] }>();

const store = useCustomizeStore();
const progress = useProgressStore();

const COLS = 5;
const PAGE = COLS * COLS;

type Filter = ItemSlot | 'all';
const filter = ref<Filter>('all');

const ownedItems = computed(() => ITEMS.filter((i) => progress.isOwned(i)));
const ownedCount = computed(() => ownedItems.value.length);

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: '全部' },
  ...SLOT_ORDER.map((s) => ({ id: s as Filter, label: SLOT_LABELS[s] })),
];

/** 排序：默认按物品表的登记顺序 / 「星级」按星级从高到低 */
type SortBy = 'default' | 'stars';
const sortBy = ref<SortBy>('default');
const sorts: { id: SortBy; label: string }[] = [
  { id: 'default', label: '默认' },
  { id: 'stars', label: '⭐ 星级' },
];

/** pets show the star level the player actually hatched, not a fixed value */
function displayStars(item: Item): number {
  return item.slot === 'pet' ? progress.petStar(item.ref) || 1 : item.stars;
}

/* --- 🐾 宠物：跟随方式（背包里选）+ 每只宠物的加成 --------------------------- */
/** 三种跟随方式（`behind` / `still` 会画在人物身后、贴地） */
const petFollows: { id: PetFollow; label: string; hint: string }[] = [
  { id: 'shoulder', label: '肩旁悬浮', hint: '悬浮在肩旁，跟着你跑跳（老样子）' },
  { id: 'behind', label: '贴地跟随', hint: '贴地跟在身后，会跟着你转身；左右只做偏移' },
  { id: 'still', label: '站脚边', hint: '站在脚边不动，也不浮动' },
];
const petSides: { id: PetSide; label: string }[] = [
  { id: 'left', label: '左边' },
  { id: 'right', label: '右边' },
];

const followHint = computed(() => petFollows.find((f) => f.id === store.petFollow)?.hint ?? '');

/** 这只宠物在当前星级下加多少（按**实际孵化星级**算，没孵化的按 1★） */
function bonusOf(item: Item): string {
  if (item.slot !== 'pet') return '';
  const b = petBonusOf(item.ref as PetId, displayStars(item));
  return hasPetBonus(b) ? petBonusShort(b) : '';
}

/** 悬停提示：名字 + 星级 + 加成（格子小，写不开） */
function cellTitle(item: Item): string {
  const head = `${item.label} · ${displayStars(item)}★`;
  if (item.slot !== 'pet') return head;
  const b = petBonusOf(item.ref as PetId, displayStars(item));
  return hasPetBonus(b) ? `${head} · ${petBonusText(b)}（只有装备着才生效）` : head;
}

/* --- 筛选：星级（可多选）+ 宝箱主题（可多选） -------------------------------- */
/** 选中的星级（空 = 不限） */
const starFilter = ref<number[]>([]);
/** 选中的宝箱主题 id（空 = 不限；`'none'` = 无主题：活动 / 兑换码 / 荣誉 / 商店那些） */
const themeFilter = ref<string[]>([]);

/** 一件物品的主题键（没有主题就是 `'none'`） */
function themeKeyOf(item: Item): string {
  return themeOf(item)?.id ?? 'none';
}

/** 只列出**自己仓库里真的出现过**的主题，免得摆一排空主题 */
const themeOptions = computed(() => {
  const has = new Set(ownedItems.value.map(themeKeyOf));
  const out = CHEST_THEMES.filter((t) => !t.complement && has.has(t.id)).map((t) => ({
    id: t.id as string,
    emoji: t.emoji,
    name: t.name,
  }));
  if (has.has('none')) out.push({ id: 'none', emoji: '📦', name: '无主题' });
  return out;
});

const hasFilter = computed(() => starFilter.value.length > 0 || themeFilter.value.length > 0);

function toggleStar(s: number): void {
  const at = starFilter.value.indexOf(s);
  if (at >= 0) starFilter.value.splice(at, 1);
  else starFilter.value.push(s);
}

function toggleTheme(id: string): void {
  const at = themeFilter.value.indexOf(id);
  if (at >= 0) themeFilter.value.splice(at, 1);
  else themeFilter.value.push(id);
}

function clearFilters(): void {
  starFilter.value = [];
  themeFilter.value = [];
}

const filtered = computed(() => {
  let list =
    filter.value === 'all'
      ? ownedItems.value
      : ownedItems.value.filter((i) => i.slot === filter.value);
  if (starFilter.value.length) list = list.filter((i) => starFilter.value.includes(displayStars(i)));
  if (themeFilter.value.length) list = list.filter((i) => themeFilter.value.includes(themeKeyOf(i)));
  if (sortBy.value === 'default') return list;
  // 星级高的在前；同星级按稀有度（越稀有越靠前）、再按名字，保证顺序稳定
  return [...list].sort(
    (a, b) =>
      displayStars(b) - displayStars(a) ||
      RARITY_META[a.rarity].weight - RARITY_META[b.rarity].weight ||
      a.label.localeCompare(b.label, 'zh'),
  );
});

/** a fixed 5x5 grid per page, padded with empty cells */
const cells = computed<(Item | null)[]>(() => {
  const n = Math.max(PAGE, Math.ceil(filtered.value.length / PAGE) * PAGE);
  const out: (Item | null)[] = filtered.value.slice();
  while (out.length < n) out.push(null);
  return out;
});

function currentRef(slot: ItemSlot): string {
  switch (slot) {
    case 'skin':
      return store.characterSkin;
    case 'hat':
      return store.hat;
    case 'back':
      return store.back;
    case 'aura':
      return store.aura;
    case 'ring':
      return store.ring;
    case 'pet':
      return store.pet;
    case 'racketSkin':
      return store.racketSkin;
    case 'trail':
      return store.trailStyle;
    case 'swingTrail':
      return store.swingTrail;
    case 'mount':
      return store.mount;
    case 'effect':
      return store.effect;
  }
}

function isEquipped(item: Item): boolean {
  return currentRef(item.slot) === item.ref;
}

function equip(item: Item): void {
  switch (item.slot) {
    case 'skin':
      store.characterSkin = item.ref as CharacterSkin;
      break;
    case 'hat':
      store.hat = item.ref as HatId;
      break;
    case 'back':
      store.back = item.ref as BackId;
      break;
    case 'aura':
      store.aura = item.ref as AuraId;
      break;
    case 'ring':
      store.ring = item.ref as RingId;
      break;
    case 'pet':
      store.pet = item.ref as PetId;
      break;
    case 'racketSkin':
      store.racketSkin = item.ref as RacketSkinId;
      break;
    case 'trail':
      store.trailStyle = item.ref as TrailId;
      break;
    case 'swingTrail':
      store.swingTrail = item.ref as SwingTrailId;
      break;
    case 'mount':
      store.mount = item.ref as MountId;
      break;
    case 'effect':
      store.effect = item.ref as HitStyle;
      break;
  }
}

/* --- 🎬 左边预览：动作类的部位换成「挥拍 + 球飞过」的小舞台（复用宝箱详情那份组件） --- */
/**
 * 只在动作里才看得见的部位：**击球拖尾 / 挥拍拖尾 / 命中特效**。
 * 静着看它们什么都看不见（清一色空白），所以左边要演一段给你看——
 * 口径与宝箱的「试穿效果」完全一致（那边也是这三类走 `ItemPreviewStage`）。
 */
const IN_GAME_ONLY: ItemSlot[] = ['trail', 'swingTrail', 'effect'];
/** 刚点过的那一件（用来决定左边演谁；切页签会清掉） */
const shown = ref<Item | null>(null);

/**
 * 左边这块演哪一件：
 * 1. 刚点的那件是动作类 → 就演它；
 * 2. 当前页签本身就是动作类（拖尾 / 挥拍拖尾 / 命中特效）→ 演身上穿着的那件；
 * 3. 其余情况 → 回静态角色预览。
 */
const staged = computed<Item | null>(() => {
  if (shown.value && IN_GAME_ONLY.includes(shown.value.slot)) return shown.value;
  const f = filter.value;
  if (f === 'all' || !IN_GAME_ONLY.includes(f)) return null;
  return ITEMS.find((i) => i.slot === f && i.ref === currentRef(f)) ?? null;
});

/** 演示用的这一身 = 自己现在穿的（点了什么先把那件套上，看得就是它的效果） */
const previewCos = computed(() =>
  shown.value ? wearItem(store.cosmetic, shown.value) : store.cosmetic,
);

// 换页签就忘掉「刚点的那件」，回到「这个页签演什么」的默认判断
watch(filter, () => (shown.value = null));

function onCell(item: Item | null): void {
  if (!item) return;
  // 动作类的点一下就在左边演起来（已装备的那件也让它再演一遍）
  shown.value = IN_GAME_ONLY.includes(item.slot) ? item : null;
  if (isEquipped(item)) {
    toastWarn(`已经装备着「${item.label}」`);
    return;
  }
  equip(item);
  toastGood(`已装备「${item.label}」`);
}

/** stable identity for the grid so auto-animate can FLIP reordering */
function cellKey(item: Item | null, idx: number): string {
  return item ? `${item.slot}:${item.ref}` : `empty:${idx}`;
}

/** label of whatever is equipped in a slot (shown on the character side) */
function equippedLabel(slot: ItemSlot): string {
  const ref = currentRef(slot);
  const item = ITEMS.find((i) => i.slot === slot && i.ref === ref);
  return item ? item.label : ref;
}
</script>

<template>
  <div class="bp">
    <div class="bp__left">
      <!-- 🎬 拖尾 / 挥拍拖尾 / 命中特效静着看什么都没有，左边换成会动的演示舞台
           （组件与宝箱「试穿效果」里那个是同一个） -->
      <ItemPreviewStage v-if="staged" :cosmetic="previewCos" :slot="staged.slot" />
      <CharacterPreview v-else :cosmetic="previewCos" />
      <p v-if="staged" class="muted bp__stage-hint">
        🎬 左边演的就是它在球场上的样子（循环播放，换页签或点别的装扮就回静态）
      </p>
      <div class="bp__loadout">
        <div v-for="slot in SLOT_ORDER" :key="slot" class="bp__loadout-row">
          <span class="bp__loadout-slot">{{ SLOT_LABELS[slot] }}</span>
          <span class="bp__loadout-item">{{ equippedLabel(slot) }}</span>
        </div>
      </div>
    </div>

    <div class="bp__main">
      <div class="bp__bar">
        <div class="bp__wallet">
          <span class="bp__coin">🪙</span>
          <span class="num bp__coin-num">{{ progress.coins }}</span>
          <Button size="sm" variant="primary" @click="emit('open-chest')">去开宝箱</Button>
        </div>
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

        <div class="bp__sorts">
          <span class="bp__sorts-label">排序</span>
          <button
            v-for="s in sorts"
            :key="s.id"
            class="bp__tab"
            :class="{ 'is-active': sortBy === s.id }"
            type="button"
            @click="sortBy = s.id"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- 🐾 宠物栏：跟随方式（左/右）+ 当前生效的加成 -->
      <div v-if="filter === 'pet'" class="bp__pet">
        <div class="bp__pet-row">
          <span class="bp__sorts-label">跟随</span>
          <div class="bp__chips">
            <button
              v-for="f in petFollows"
              :key="f.id"
              class="bp__chip"
              :class="{ 'is-on': store.petFollow === f.id }"
              type="button"
              :title="f.hint"
              @click="store.petFollow = f.id"
            >
              {{ f.label }}
            </button>
          </div>
          <span class="bp__sorts-label">位置</span>
          <div class="bp__chips">
            <button
              v-for="s in petSides"
              :key="s.id"
              class="bp__chip"
              :class="{ 'is-on': store.petSide === s.id }"
              type="button"
              @click="store.petSide = s.id"
            >
              {{ s.label }}
            </button>
          </div>
        </div>
        <p class="bp__pet-note">
          <template v-if="store.pet === 'none'">还没带宠物——点下面的宠物格子装备一只。</template>
          <template v-else>
            <b>{{ equippedLabel('pet') }}</b>
            <template v-if="hasPetBonus(progress.petBonus)">
              · {{ petBonusText(progress.petBonus) }}
              <span class="muted">（只有装备着的这一只生效）</span>
            </template>
            <template v-else>· 这只宠物没有加成</template>
            <span class="muted"> · {{ followHint }}</span>
          </template>
        </p>
      </div>

      <!-- 筛选：星级（多选）+ 宝箱主题（多选），可和上面的部位页签叠加 -->
      <div class="bp__filters">
        <span class="bp__sorts-label">筛选</span>
        <div class="bp__chips">
          <button
            v-for="s in [1, 2, 3, 4, 5]"
            :key="s"
            class="bp__chip"
            :class="{ 'is-on': starFilter.includes(s) }"
            type="button"
            @click="toggleStar(s)"
          >
            {{ s }}★
          </button>
        </div>
        <div class="bp__chips bp__chips--scroll">
          <button
            v-for="t in themeOptions"
            :key="t.id"
            class="bp__chip"
            :class="{ 'is-on': themeFilter.includes(t.id) }"
            type="button"
            @click="toggleTheme(t.id)"
          >
            {{ t.emoji }} {{ t.name }}
          </button>
        </div>
        <button v-if="hasFilter" class="bp__tab bp__chip--clear" type="button" @click="clearFilters">
          ✕ 清空
        </button>
      </div>

      <div class="bp__collect muted">
        已收集 {{ ownedCount }} / {{ ITEMS.length }}<template v-if="hasFilter">
          · 当前筛选出 {{ filtered.length }} 件</template
        >
      </div>

      <div v-auto-animate="{ duration: 220 }" class="bp__grid" :style="{ '--cols': COLS }">
        <button
          v-for="(item, idx) in cells"
          :key="cellKey(item, idx)"
          class="bp__cell"
          :class="{ 'is-empty': !item, 'is-equipped': item && isEquipped(item) }"
          :style="item ? { '--rarity': RARITY_META[item.rarity].color } : undefined"
          type="button"
          :title="item ? cellTitle(item) : undefined"
          :disabled="!item"
          @click="onCell(item)"
        >
          <template v-if="item">
            <ItemIcon class="bp__cell-icon" :item="item" />
            <span class="bp__cell-label">{{ item.label }}</span>
            <Stars class="bp__cell-stars" :value="displayStars(item)" />
            <span v-if="bonusOf(item)" class="bp__cell-bonus">{{ bonusOf(item) }}</span>
            <span v-if="isEquipped(item)" class="bp__cell-check">✓</span>
          </template>
        </button>
      </div>

      <p class="muted bp__note">
        点格子即可装备。宝箱开出的物品会直接进入背包，重复物品按稀有度返还金币；宠物在商城（🏪 → 皮肤 → 宠物）购买。
        <br />🐾 每只宠物的加成不一样（有的偏金币、有的偏经验，见格子上的小字），
        <b>只有装备着的那一只生效</b>，星级越高加成越大。
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

.bp__stage-hint {
  margin: var(--s2) 0 0;
  font-size: 12px;
  line-height: 1.4;
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

.bp__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.bp__wallet {
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
}

.bp__coin {
  font-size: 20px;
}

.bp__coin-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
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

/* 排序：默认顺序 / 按星级从高到低 */
.bp__sorts {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.bp__sorts-label {
  font-size: 12px;
  color: var(--text-dim);
}

/* 筛选区：星级一行 + 主题一行（主题多，横向滚动，不占地方） */
.bp__filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
  margin-top: var(--s3);
}

.bp__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.bp__chips--scroll {
  flex: 1 1 240px;
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.bp__chip {
  flex: none;
  padding: 4px 10px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text-dim);
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

.bp__chip.is-on {
  color: var(--text);
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 18%, var(--surface-2));
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 32%, transparent);
}

.bp__chip--clear {
  flex: none;
}

.bp__collect {
  margin: var(--s3) 0;
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

.bp__cell-icon {
  width: 58%;
  height: 46%;
  margin-bottom: 2px;
  flex: none;
}

.bp__cell-label {
  font-size: 12px;
  line-height: 1.1;
}

.bp__cell-stars {
  font-size: 9px;
}

/* 宠物格子上的加成（格子小，写短语，完整说明看悬停提示） */
.bp__cell-bonus {
  font-size: 9px;
  line-height: 1;
  color: var(--text-dim);
  white-space: nowrap;
}

/* 🐾 宠物栏：跟随方式 + 当前加成（只在宠物页签出现） */
.bp__pet {
  margin-top: var(--s3);
  padding: var(--s3);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--surface-2);
}

.bp__pet-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 10px;
}

.bp__pet-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text);
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
