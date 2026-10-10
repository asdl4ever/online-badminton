<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import Stars from './ui/Stars.vue';
import ItemIcon from './ItemIcon.vue';
import Button from './ui/Button.vue';
import AppModal from './ui/AppModal.vue';
import CharacterPreview from './CharacterPreview.vue';
import ItemPreviewStage from './ItemPreviewStage.vue';
import { celebrate, RARITY_LEVEL } from '../composables/celebrate';
import { toastGood, toastWarn } from '../composables/useToast';
import { sfx } from '../game/audio';
import { useProgressStore, type PullResult } from '../stores/progress';
import { useCustomizeStore } from '../stores/customize';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import {
  activeChestSlots,
  allChestSlots,
  chestPeriod,
  nextChestTheme,
  type ChestSlot,
  type ChestTab,
} from '../game/chest';
import {
  CHEST_KEYS,
  MATERIALS,
  RARITY_META,
  SLOT_COSMETIC_KEY,
  SLOT_LABELS,
  wearItem,
  type Item,
  type ItemSlot,
} from '../game/items';

/**
 * 🎁 宝箱柜：**同一时刻有好几个池子可选**（`game/chest.ts` 的 `activeChestSlots`）——
 * 当期主题（每小时轮换）+ 限时返场（每 6 小时换一批，2~24 小时后下架）+
 * 常驻的经典大池（普通 / 高级宝箱）。点右上角那颗「奖池切换」选一个池子，
 * 里面的物品墙就是它（墙上的件数 = 抽「主题」那一档时的池子）。
 *
 * ⚠️ **开箱仍然先摇类别**：普通宝箱 50% / **选中的主题池** 35% / 高级宝箱 15%，
 * 所以选了某个主题也不是"只出这一期"。袋子档（约 1/5 给金币或 🧩 碎片）、
 * **重复装扮折算 🧩 碎片**、没有保底。碎片兑换已挪到商城的「皮肤 → 碎片兑换」。
 */
const progress = useProgressStore();
const customize = useCustomizeStore();

/** 十连要几把钥匙 */
const TEN_KEYS = CHEST_KEYS * 10;

// ---- 池子（当期 / 限时返场 / 常驻，面板开着会自己翻期、返场到点自己下架）------
const tick = ref(Date.now());
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => (tick.value = Date.now()), 1000);
});
onBeforeUnmount(() => window.clearInterval(timer));

/** 现在**能抽**的池子：当期主题 + 限时返场 + 常驻经典大池 */
const slots = computed(() => activeChestSlots(tick.value));
/** 「经典 / 新品」两个页签要铺满：没返场的主题也列出来，只是选不了 */
const allSlots = computed(() => allChestSlots(tick.value));

/** 选中的池子记在本机（跨期 / 下架之后自动落回当期） */
const pickedKey = useLocalStorage('bmt-chest-pool', '');
const slot = computed<ChestSlot>(
  () => allSlots.value.find((s) => s.key === pickedKey.value) ?? slots.value[0],
);
/** 选中的池子现在能不能抽：未返场 / 已下架的只能看内容、不能抽 */
const drawable = computed(() => slot.value.active);
const theme = computed(() => slot.value.theme);
/** 墙上这些件 = 抽「主题」那一档时用的池子 */
const banner = computed(() => slot.value.items);
const period = computed(() => chestPeriod(tick.value));
const nextTheme = computed(() => nextChestTheme(period.value));

/** 奖池切换弹窗 */
const pickerOpen = ref(false);
const TABS: { id: ChestTab | 'current' | 'return'; label: string }[] = [
  { id: 'current', label: '当前宝箱' },
  { id: 'return', label: '限时返场' },
  { id: 'classic', label: '经典主题' },
  { id: 'new', label: '新品主题' },
];
type TabId = (typeof TABS)[number]['id'];
const tab = ref<TabId>('current');
const tabSlots = computed(() => {
  if (tab.value === 'current') return slots.value.filter((s) => s.kind === 'current');
  if (tab.value === 'return') return slots.value.filter((s) => s.kind === 'return');
  return allSlots.value.filter((s) => s.tab === tab.value);
});

function pick(s: ChestSlot): void {
  // 未返场的池子也能选中——只是选中后只能**查看**内容（抽取按钮会置灰）
  sfx.click();
  pickedKey.value = s.key;
  pickerOpen.value = false;
}

/** 一个池子的集齐进度（墙上这些件里已经有几件） */
function poolProgress(s: ChestSlot): { owned: number; total: number } {
  const total = s.items.length;
  const owned = s.items.filter((i) => progress.owned.includes(i.id)).length;
  return { owned, total };
}

/** 「还剩 3 天 04:12:33」/「常驻」 */
function fmtLeft(endsAt: number): string {
  if (!endsAt) return '常驻';
  const ms = Math.max(0, endsAt - tick.value);
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  const p = (n: number): string => String(n).padStart(2, '0');
  return d > 0 ? `剩余 ${d}天 ${p(h)}:${p(m)}:${p(s)}` : `剩余 ${p(h)}:${p(m)}:${p(s)}`;
}

/** 池子信息那一行的后缀说明 */
const leftLabel = computed(() =>
  !slot.value.active
    ? '未返场 · 仅查看'
    : slot.value.kind === 'const'
      ? '常驻奖池 · 不会下架'
      : slot.value.kind === 'current'
        ? '后换期'
        : '后下架',
);

/** 点一件物品：弹试穿预览（穿在身上什么样） */
const preview = ref<Item | null>(null);
const previewOpen = ref(false);
/**
 * 预览用的装扮 = **默认小人 + 这一件**（`DEFAULT_COSMETIC` 起手）。
 * 不叠自己正在穿的那一身，是为了两件东西能公平对比：只看得见这件物品的效果。
 */
const previewCos = computed(() =>
  preview.value ? wearItem(DEFAULT_COSMETIC, preview.value) : DEFAULT_COSMETIC,
);
/** 只在动作里才看得见的部位：预览改成「角色挥拍 + 球飞过」的小舞台 */
const IN_GAME_ONLY: ItemSlot[] = ['trail', 'swingTrail', 'effect'];
const isAction = computed(() => !!preview.value && IN_GAME_ONLY.includes(preview.value.slot));

function openPreview(it: Item): void {
  sfx.click();
  preview.value = it;
  previewOpen.value = true;
}

/** 试穿之后如果喜欢，身上这件又已经有了，就直接穿上 */
function equipPreview(): void {
  const it = preview.value;
  if (!it) return;
  // 字段名是动态的，值都是字符串 ref，所以这里绕一下类型
  const key = SLOT_COSMETIC_KEY[it.slot];
  (customize as unknown as Record<string, string>)[key] = it.ref;
  sfx.point();
  toastGood(`已装备「${it.label}」`);
}

/** 物品墙按星级分组（参考稿那种「稀世极品 / 至臻极品」的分组墙） */
const STAR_GROUP: Record<number, string> = {
  5: '至臻极品',
  4: '稀世珍品',
  3: '珍藏好物',
  2: '寻常款式',
  1: '基础款式',
};
const wallGroups = computed(() => {
  const by = new Map<number, Item[]>();
  for (const it of banner.value) {
    const g = by.get(it.stars);
    if (g) g.push(it);
    else by.set(it.stars, [it]);
  }
  return [...by.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([stars, items]) => ({ stars, label: STAR_GROUP[stars] ?? `${stars}★`, items }));
});

/** 主题配色 → CSS 变量（宝箱、装饰、物品墙都用它） */
const themeVars = computed(() => {
  const p = theme.value.palette;
  return {
    '--ct-base': p.base,
    '--ct-lid': p.lid,
    '--ct-trim': p.trim,
    '--ct-glow': p.glow,
    '--ct-ink': p.ink,
  };
});

// ---- 抽奖 -------------------------------------------------------------------
type Phase = 'idle' | 'opening' | 'revealed';
const phase = ref<Phase>('idle');
const mode = ref<'single' | 'ten'>('single');
const result = ref<PullResult | null>(null);
const results = ref<PullResult[]>([]);

const canSingle = computed(() => drawable.value && progress.chestKeys >= CHEST_KEYS && phase.value !== 'opening');
const canTen = computed(() => drawable.value && progress.chestKeys >= TEN_KEYS && phase.value !== 'opening');
const canFreeTen = computed(() => drawable.value && progress.tenTickets > 0 && phase.value !== 'opening');

/** 展示用的小卡：装扮与「袋子档」统一成同一种结构，模板就不用手写两遍 */
type Tile = {
  key: string;
  color: string;
  /** 装扮图标（袋子档是 null，用 emoji 顶） */
  item: Item | null;
  emoji: string;
  /** 顶部小字：稀有度 / 袋子名 */
  tag: string;
  title: string;
  /** 底部小字：部位 / 袋子说明 */
  sub: string;
  /** 0 = 袋子档，不画星星 */
  stars: number;
  note: string;
  /** 重复装扮：图标上盖「重复」字样（已折算 🧩 碎片） */
  dup: boolean;
};

const BAG_COLOR = { coins: '#e0a12c', shards: '#8f6ad8' };

function toTile(r: PullResult, i: number): Tile {
  if (r.kind === 'bag') {
    const isCoin = r.bag === 'coins';
    return {
      key: `bag-${i}`,
      color: BAG_COLOR[r.bag],
      item: null,
      emoji: isCoin ? '🪙' : '🧩',
      tag: isCoin ? '金币袋' : '星尘碎片',
      title: `${isCoin ? '🪙' : '🧩'} +${r.amount}`,
      sub: isCoin ? '没开到装扮，金币也是钱' : '没开到装扮，碎片能换装扮',
      stars: 0,
      note: '',
      dup: false,
    };
  }
  if (r.kind === 'junk') {
    const mat = MATERIALS[r.material];
    return {
      key: `junk-${i}`,
      color: '#8b97a8',
      item: null,
      emoji: mat.emoji,
      tag: '杂物',
      title: `${mat.emoji} +${r.amount}`,
      sub: `没开到装扮，${mat.name}也能拉去农场主换钱`,
      stars: 0,
      note: '',
      dup: false,
    };
  }
  return {
    key: `${r.item.id}-${i}`,
    color: RARITY_META[r.item.rarity].color,
    item: r.item,
    emoji: '',
    tag: RARITY_META[r.item.rarity].label,
    title: r.item.label,
    sub: SLOT_LABELS[r.item.slot],
    stars: r.item.stars,
    note: r.duplicate ? `重复 · 折算 🧩${r.shards}` : '',
    dup: r.duplicate,
  };
}

/** 单抽那张卡 */
const singleTile = computed(() => (result.value ? toTile(result.value, 0) : null));
/** 十连那十格 */
const tenTiles = computed(() => results.value.map((r, i) => toTile(r, i)));

/** everything this pull produced, single or ten */
function pulled(): PullResult[] {
  if (mode.value === 'ten') return results.value;
  return result.value ? [result.value] : [];
}

/** the most exciting item decides how loud the confetti is（袋子档不算） */
function bestRarity(): { level: number; color: string } {
  let level = 0;
  let color = '#e8a33d';
  for (const r of pulled()) {
    if (r.kind !== 'item') continue;
    const lv = RARITY_LEVEL[r.item.rarity] ?? 0;
    if (lv > level) {
      level = lv;
      color = RARITY_META[r.item.rarity].color;
    }
  }
  return { level, color };
}

function reveal(): void {
  phase.value = 'opening';
  window.setTimeout(() => {
    phase.value = 'revealed';
    const best = bestRarity();
    celebrate(best.level, [best.color, '#ffffff', '#ffd45c']);
  }, 760);
}

/** 收起结果，回到「本期物品墙」 */
function dismiss(): void {
  phase.value = 'idle';
  result.value = null;
  results.value = [];
}

function openSingle(): void {
  if (!drawable.value) {
    toastWarn('这个奖池还没返场 / 已下架，只能查看内容，不能抽取');
    return;
  }
  if (!canSingle.value) {
    toastWarn(`宝箱钥匙不够，还差 ${CHEST_KEYS - progress.chestKeys} 把（成就 / 里程碑 / 段位 / 每日任务 / 哥斯拉都给钥匙）`);
    return;
  }
  // 传选中的池子：**只出这个池子墙上的内容**
  const r = progress.pull(slot.value);
  if (!r) return;
  mode.value = 'single';
  result.value = r;
  results.value = [];
  reveal();
}

function openTen(useTicket: boolean): void {
  if (!drawable.value) {
    toastWarn('这个奖池还没返场 / 已下架，只能查看内容，不能抽取');
    return;
  }
  if (!useTicket && !canTen.value) {
    toastWarn(`宝箱钥匙不够，十连要 ${TEN_KEYS} 把（现在 ${progress.chestKeys} 把）`);
    return;
  }
  if (useTicket && !canFreeTen.value) return;
  const r = progress.pullTen(useTicket, slot.value);
  if (!r) return;
  mode.value = 'ten';
  results.value = r;
  result.value = null;
  reveal();
}

const owned = (id: string): boolean => progress.owned.includes(id);
</script>

<template>
  <div class="cp" :style="themeVars">
    <div class="cp__main">
      <!-- 左：奖池物品墙（按星级分组，自己滚动） -->
      <section class="cp__left">
        <div class="cp__wall-head">
          <b>{{ theme.emoji }} {{ theme.name }}</b>
          <span class="muted num">{{ banner.length }} 件</span>
        </div>

        <div class="cp__groups">
          <div v-for="grp in wallGroups" :key="grp.stars" class="cp__group">
            <div class="cp__group-head">
              <span class="cp__group-title">{{ grp.label }}</span>
              <Stars class="cp__group-stars" :value="grp.stars" />
              <span class="muted num cp__group-count">
                {{ grp.items.filter((i) => owned(i.id)).length }}/{{ grp.items.length }}
              </span>
            </div>
            <div class="cp__wall">
              <button
                v-for="it in grp.items"
                :key="it.id"
                class="cp__tile"
                :class="{ 'is-owned': owned(it.id) }"
                :style="{ '--r': RARITY_META[it.rarity].color }"
                type="button"
                :title="`${it.label} · 点一下看穿在身上的样子`"
                @click="openPreview(it)"
              >
                <span class="cp__tile-ico"><ItemIcon :item="it" /></span>
                <span class="cp__tile-label">{{ it.label }}</span>
                <Stars class="cp__tile-stars" :value="it.stars" />
                <span v-if="owned(it.id)" class="cp__tile-owned">已有</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 右（贴右上角）：宝箱本体，抽奖按钮直接叠在箱子上 -->
      <section class="cp__right">
        <div class="cp__chest" :class="`is-${phase}`">
          <!-- 箱子画面这一层：矮屏只缩它，抽奖按钮保持原尺寸（触控 ≥44px） -->
          <div class="cp__art">
            <div class="cp__glow" />
            <span
              v-for="(d, i) in theme.decor"
              :key="i"
              class="cp__decor"
              :style="{ animationDelay: `${i * 0.6}s`, left: `${12 + i * 24}%` }"
            >{{ d }}</span>
            <div class="cp__box">
              <div class="cp__lid">
                <span class="cp__lock">{{ theme.emoji }}</span>
              </div>
              <div class="cp__body">
                <div class="cp__band" />
                <div class="cp__hole" />
              </div>
              <div class="cp__base" />
            </div>
          </div>

          <!-- 🎯 抽奖按钮：压在宝箱图案上（单抽 / 十连抽；有新手礼券时多一颗免费十连） -->
          <div class="cp__draw">
            <button
              v-if="progress.tenTickets > 0"
              class="cp__draw-free"
              type="button"
              :disabled="!canFreeTen"
              @click="openTen(true)"
            >
              🎫 免费十连 ×{{ progress.tenTickets }}
            </button>
            <div class="cp__draw-row">
              <button class="cp__draw-btn" type="button" :disabled="!canSingle" @click="openSingle">
                单抽
                <b class="num">🔑{{ CHEST_KEYS }}</b>
              </button>
              <button
                class="cp__draw-btn cp__draw-btn--ten"
                type="button"
                :disabled="!canTen"
                @click="openTen(false)"
              >
                十连抽
                <b class="num">🔑{{ TEN_KEYS }}</b>
              </button>
            </div>
          </div>
        </div>

        <div class="cp__meta">
          <div class="cp__timer">
            <span class="num cp__timer-num">{{ drawable ? fmtLeft(slot.endsAt) : '未返场' }}</span>
            <span class="muted cp__timer-label">
              {{ leftLabel }}
              <template v-if="drawable && slot.kind === 'current'">
                · 下一期 {{ nextTheme.emoji }}
              </template>
            </span>
          </div>
        </div>

        <button class="cp__pool-btn" type="button" @click="sfx.click(); pickerOpen = true">
          🎁 奖池切换
          <span class="muted cp__pool-btn-sub">
            当前：{{ theme.emoji }} {{ theme.name }}<template v-if="!drawable">（仅查看）</template>
          </span>
        </button>
      </section>

      <!-- 结果浮层：盖在左宝箱 + 右墙上 -->
      <div
        v-if="phase === 'revealed'"
        class="cp__result"
        @click="dismiss"
      >
        <div v-if="mode === 'single' && singleTile" class="cp__card" :style="{ '--rarity': singleTile.color }">
          <div class="cp__card-tag">{{ singleTile.tag }}</div>
          <div class="cp__card-media">
            <ItemIcon v-if="singleTile.item" class="cp__card-icon" :item="singleTile.item" />
            <span v-else class="cp__card-bag">{{ singleTile.emoji }}</span>
            <span v-if="singleTile.dup" class="cp__dup">重复</span>
          </div>
          <div class="cp__card-label">{{ singleTile.title }}</div>
          <Stars v-if="singleTile.stars > 0" class="cp__card-stars" :value="singleTile.stars" :animate="true" />
          <div class="muted cp__card-sub">{{ singleTile.sub }}</div>
          <div v-if="singleTile.note" class="muted cp__card-note">{{ singleTile.note }}</div>
        </div>

        <div v-else class="cp__grid">
          <div
            v-for="(t, i) in tenTiles"
            :key="t.key"
            class="cp__cell"
            :style="{ '--rarity': t.color, animationDelay: `${i * 0.06}s` }"
          >
            <span class="cp__cell-media">
              <ItemIcon v-if="t.item" class="cp__cell-icon" :item="t.item" />
              <span v-else class="cp__cell-bag">{{ t.emoji }}</span>
              <span v-if="t.dup" class="cp__dup cp__dup--sm">重复</span>
            </span>
            <span class="cp__cell-label">{{ t.title }}</span>
            <Stars v-if="t.stars > 0" class="cp__cell-stars" :value="t.stars" />
            <span class="cp__cell-slot">{{ t.dup ? t.note : t.sub }}</span>
          </div>
        </div>

        <span class="cp__result-hint">点任意处收起</span>
      </div>
    </div>

    <!-- 点物品：试穿预览（穿在自己身上什么样） -->
    <AppModal v-model="previewOpen" title="👀 试穿效果" max-width="420px">
      <div v-if="preview" class="pv">
        <!-- 动作类部位（拖尾 / 挥拍拖尾 / 命中特效）：演一段挥拍 + 球飞过 -->
        <ItemPreviewStage v-if="isAction" class="pv__rig" :cosmetic="previewCos" :slot="preview.slot" />
        <CharacterPreview v-else class="pv__rig" :cosmetic="previewCos" />
        <div class="pv__info">
          <div class="pv__name">{{ preview.label }}</div>
          <div class="pv__meta">
            <Stars :value="preview.stars" />
            <span class="pv__rarity" :style="{ color: RARITY_META[preview.rarity].color }">
              {{ RARITY_META[preview.rarity].label }}
            </span>
            <span class="muted">{{ SLOT_LABELS[preview.slot] }}</span>
          </div>
          <div class="pv__state">
            <span v-if="owned(preview.id)" class="pv__owned">✓ 已拥有</span>
            <span v-else class="pv__lock">还没拿到 · 开这个池子有机会出</span>
          </div>
          <p v-if="isAction" class="muted pv__hint">
            上面这段演示的就是它在球场上的样子：{{ preview.slot === 'swingTrail' ? '挥拍时拍头拖出的那一道' : preview.slot === 'trail' ? '球飞过时身后拖着的那一路' : '拍中球那一瞬间炸开的' }}（这是演示动画，一直在循环）。
          </p>
          <Button
            v-else-if="owned(preview.id)"
            variant="primary"
            block
            @click="equipPreview"
          >
            就穿这件
          </Button>
          <p v-else class="muted pv__hint">预览只是看一眼，不会改变你现在的装扮。</p>
        </div>
      </div>
    </AppModal>

    <!-- 🎁 奖池切换：点主题就换一个宝箱（子路由不跳页，这里是个弹窗） -->
    <AppModal v-model="pickerOpen" title="🎁 奖池切换" max-width="880px">
      <div class="pk">
        <div class="pk__tabs">
          <button
            v-for="t in TABS"
            :key="t.id"
            class="pk__tab"
            :class="{ 'is-on': tab === t.id }"
            type="button"
            @click="sfx.click(); tab = t.id"
          >
            {{ t.label }}
            <span class="num pk__tab-n">
              {{
                t.id === 'current' || t.id === 'return'
                  ? slots.filter((s) => s.kind === t.id).length
                  : allSlots.filter((s) => s.tab === t.id).length
              }}
            </span>
          </button>
        </div>

        <div class="pk__grid">
          <button
            v-for="s in tabSlots"
            :key="s.key"
            class="pk__pool"
            :class="{ 'is-on': s.key === slot.key, 'is-off': !s.active }"
            type="button"
            :style="{
              '--pc-base': s.theme.palette.base,
              '--pc-lid': s.theme.palette.lid,
              '--pc-trim': s.theme.palette.trim,
              '--pc-glow': s.theme.palette.glow,
            }"
            @click="pick(s)"
          >
            <span class="pk__art">
              <span class="pk__art-emoji">{{ s.theme.emoji }}</span>
              <span class="pk__art-name">{{ s.theme.name }}</span>
              <span v-if="s.kind === 'current'" class="pk__art-tag">当期</span>
              <span v-else-if="s.kind === 'return'" class="pk__art-tag">返场</span>
              <span v-else-if="s.kind === 'const'" class="pk__art-tag">常驻</span>
              <span v-if="s.key === slot.key" class="pk__art-on">✓ 正在开</span>
            </span>
            <span class="pk__foot">
              <span class="muted pk__left">{{ s.active ? fmtLeft(s.endsAt) : '未返场 · 仅查看' }}</span>
              <span class="num pk__prog">
                {{ poolProgress(s).owned }}/{{ poolProgress(s).total }}
              </span>
            </span>
          </button>
        </div>

        <p class="muted pk__note">
          卡右下角是<b>集齐进度</b>（这个池子里你已经拿到几件 / 一共几件）；灰色的是<b>还没轮到返场</b>的主题，等它回来才能选。
          选中的池子只影响"主题"那一档（35%），普通宝箱与高级宝箱那两档照旧。
        </p>
      </div>
    </AppModal>
  </div>
</template>

<style scoped>
/* 整块钉在可视高度里：页面不滚，只有左墙自己滚（手机上也不用拖页面） */
.cp {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  height: 100%;
  min-height: 0;
}

/* ---- 两列主体：左＝奖池物品墙（自己滚动），右＝大宝箱贴右上角 ------------ */
.cp__main {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: var(--s3);
  flex: 1;
  min-height: 0;
}

/* ---- 左：物品墙（按星级分组） ------------------------------------------- */
.cp__left {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--glass-shadow), var(--glass-hi);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  min-height: 0;
  overflow-y: auto;
}

.cp__groups {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.cp__group-head {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.cp__group-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.cp__group-stars {
  font-size: 10px;
}

.cp__group-count {
  font-size: 11px;
}

/* ---- 右：宝箱本体（贴右上角：列内容从顶往下摆，不垂直居中） -------------- */
.cp__right {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  align-self: start;
  gap: var(--s2);
  padding: var(--s3) var(--s3) var(--s4);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background:
    radial-gradient(circle at 50% 30%, color-mix(in srgb, var(--ct-glow) 34%, transparent), transparent 62%),
    color-mix(in srgb, var(--ct-base) 22%, var(--glass-bg));
  box-shadow: var(--glass-shadow), var(--glass-hi);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

/* 奖池切换入口：挂在宝箱下面那一行 */
.cp__pool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: 100%;
  max-width: 260px;
  padding: 8px 12px;
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, var(--ct-trim) 55%, var(--line));
  background: color-mix(in srgb, var(--ct-glow) 12%, var(--surface-2));
  color: var(--text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.cp__pool-btn:hover {
  border-color: var(--ct-trim);
}

.cp__pool-btn-sub {
  font-size: 11px;
  font-weight: 500;
}

.cp__chest {
  position: relative;
  width: 190px;
  height: 170px;
}

/* 箱子画面层（发光 / 装饰 / 箱体都在里面） */
.cp__art {
  position: absolute;
  inset: 0;
}

/* 箱底的光晕：开箱时炸一下 */
.cp__glow {
  position: absolute;
  left: 50%;
  top: 56%;
  width: 220px;
  height: 220px;
  transform: translate(-50%, -50%) scale(0.6);
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--ct-glow) 85%, transparent), transparent 62%);
  opacity: 0.35;
  transition: transform 0.6s var(--ease-jelly), opacity 0.6s ease;
  pointer-events: none;
}

.cp__chest.is-revealed .cp__glow {
  transform: translate(-50%, -50%) scale(2.1);
  opacity: 0;
}

.cp__decor {
  position: absolute;
  top: -8px;
  font-size: 20px;
  animation: decor-float 4.6s ease-in-out infinite;
  filter: drop-shadow(0 4px 6px rgba(20, 30, 50, 0.25));
  pointer-events: none;
}

.cp__box {
  position: absolute;
  inset: 0;
  animation: chest-float 3.4s ease-in-out infinite;
}

.cp__chest.is-opening .cp__box {
  animation: chest-shake 0.6s ease;
}

.cp__chest.is-revealed .cp__box {
  animation: none;
}

.cp__lid {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 22px;
  height: 46px;
  border-radius: 22px 22px 6px 6px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ct-lid) 88%, #fff), var(--ct-lid));
  border: 1px solid color-mix(in srgb, var(--ct-trim) 55%, transparent);
  box-shadow: var(--glass-hi), inset 0 -6px 0 rgba(0, 0, 0, 0.12);
  transform-origin: 50% 100%;
  transition: transform 0.5s var(--ease-jelly), opacity 0.4s;
  display: grid;
  place-items: center;
  z-index: 2;
}

.cp__chest.is-revealed .cp__lid {
  transform: translateY(-16px) rotate(-16deg);
}

.cp__lock {
  font-size: 22px;
}

.cp__body {
  position: absolute;
  left: 14px;
  right: 14px;
  top: 62px;
  bottom: 18px;
  border-radius: 8px 8px 14px 14px;
  background: linear-gradient(180deg, var(--ct-lid), var(--ct-base));
  border: 1px solid color-mix(in srgb, var(--ct-trim) 40%, transparent);
  box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.16), var(--glass-hi);
  overflow: hidden;
}

/* 箱身的横带 + 锁孔 */
.cp__band {
  position: absolute;
  left: 0;
  right: 0;
  top: 34%;
  height: 12px;
  background: linear-gradient(180deg, var(--ct-trim), color-mix(in srgb, var(--ct-trim) 55%, var(--ct-ink)));
  opacity: 0.9;
}

.cp__hole {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 16px;
  height: 20px;
  transform: translate(-50%, -50%);
  border-radius: 6px 6px 8px 8px;
  background: color-mix(in srgb, var(--ct-ink) 78%, #000);
  box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.14);
}

.cp__base {
  position: absolute;
  left: 4px;
  right: 4px;
  bottom: 4px;
  height: 16px;
  border-radius: 6px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--ct-base) 70%, #000), var(--ct-ink));
  opacity: 0.75;
}

/* ---- 抽奖按钮：直接压在宝箱图案上（单抽 / 十连抽；有券时上面多一颗免费十连） */
.cp__draw {
  position: absolute;
  left: 50%;
  bottom: 2px;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  width: max-content;
}

.cp__draw-row {
  display: flex;
  gap: 6px;
}

.cp__draw-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  min-width: 84px;
  min-height: 46px;
  padding: 4px 10px;
  border-radius: 12px;
  border: 1px solid color-mix(in srgb, var(--ct-trim) 70%, var(--line));
  background: color-mix(in srgb, var(--ct-base) 30%, var(--surface));
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.1;
  cursor: pointer;
  touch-action: manipulation;
  box-shadow: 0 8px 16px -10px rgba(10, 20, 40, 0.7);
}

.cp__draw-btn--ten {
  background: color-mix(in srgb, var(--ct-glow) 42%, var(--surface));
  border-color: color-mix(in srgb, var(--ct-glow) 65%, var(--line));
}

.cp__draw-free {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--ct-trim) 70%, var(--line));
  background: color-mix(in srgb, var(--ct-glow) 26%, var(--surface));
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.cp__draw-btn:disabled,
.cp__draw-free:disabled {
  opacity: 0.55;
  cursor: default;
}

.cp__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.cp__timer {
  margin-top: 4px;
  display: flex;
  align-items: baseline;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--ct-trim) 45%, transparent);
  background: color-mix(in srgb, var(--ct-trim) 14%, transparent);
}

.cp__timer-num {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.cp__timer-label {
  font-size: 11px;
}

/* ---- 物品墙 -------------------------------------------------------------- */
.cp__wall-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 13px;
}

.cp__wall {
  display: grid;
  /* 一格最小 92px：宽一点就一行 5 个（参考稿那样），窄了自动少几列 */
  grid-template-columns: repeat(auto-fill, minmax(92px, 1fr));
  gap: 6px;
  padding: var(--s2);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--glass-hi), var(--glass-lo);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

.cp__tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--r) 45%, transparent);
  background: color-mix(in srgb, var(--r) 10%, var(--surface));
  box-shadow: 0 6px 14px -10px color-mix(in srgb, var(--r) 80%, transparent);
  color: var(--text);
  font-family: inherit;
  cursor: pointer;
}

.cp__tile:hover {
  border-color: color-mix(in srgb, var(--r) 80%, transparent);
}

.cp__tile.is-owned {
  opacity: 0.5;
}

/* 图标容器必须是**正方形**：ItemIcon 画的就是 96×96 的方图，
   容器一扁（宽 100% × 高 46px）就会把整张图横向拉扁。 */
.cp__tile-ico {
  display: block;
  width: min(100%, 64px);
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}

.cp__tile-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  line-height: 1.15;
}

.cp__tile-stars {
  font-size: 9px;
}

.cp__tile-owned {
  position: absolute;
  right: 3px;
  top: 3px;
  padding: 0 4px;
  border-radius: 6px;
  font-size: 9px;
  color: #fff;
  background: color-mix(in srgb, var(--r) 80%, #000);
}

/* ---- 结果浮层 ------------------------------------------------------------ */
.cp__result {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--s3);
  padding: var(--s4);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background: color-mix(in srgb, var(--glass-bg) 88%, #0c1626 12%);
  box-shadow: var(--glass-shadow), var(--glass-hi);
  backdrop-filter: blur(calc(var(--lg-blur) + 6px)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(calc(var(--lg-blur) + 6px)) saturate(var(--lg-sat));
  animation: result-in 0.3s var(--ease-jelly) both;
  cursor: pointer;
}

.cp__result-hint {
  font-size: 11px;
  color: var(--text-dim);
}

.cp__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: var(--s4) var(--s5);
  border-radius: var(--r-lg);
  border: 2px solid var(--rarity);
  background: var(--surface);
  box-shadow: 0 14px 34px -12px color-mix(in srgb, var(--rarity) 70%, transparent);
  animation: card-in 0.4s var(--ease-jelly) both;
}

.cp__card-tag {
  font-size: 12px;
  color: var(--rarity);
}

.cp__card-media {
  position: relative;
  display: grid;
  place-items: center;
}

.cp__card-icon {
  width: 76px;
  height: 76px;
}

.cp__card-bag {
  font-size: 54px;
  line-height: 1;
}

/* 「重复」章：盖在图标右上角（重复装扮已折算 🧩 碎片） */
.cp__dup {
  position: absolute;
  right: -10px;
  top: -6px;
  padding: 1px 7px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.5;
  color: #fff;
  background: color-mix(in srgb, #d05a4a 88%, #000);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  pointer-events: none;
}

.cp__dup--sm {
  right: -10px;
  top: -7px;
  font-size: 9px;
  padding: 0 5px;
}

.cp__card-label {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.cp__card-stars {
  font-size: 20px;
}

.cp__card-sub,
.cp__card-note {
  font-size: 12px;
}

.cp__grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--s2);
  width: 100%;
}

@media (max-width: 620px) {
  .cp__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.cp__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: var(--s2) 4px;
  border-radius: 10px;
  border: 1px solid var(--rarity);
  background: color-mix(in srgb, var(--rarity) 12%, var(--surface));
  box-shadow: 0 6px 14px -8px color-mix(in srgb, var(--rarity) 70%, transparent);
  animation: cell-in 0.36s var(--ease-jelly) both;
}

.cp__cell-media {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
}

.cp__cell-icon {
  width: 70%;
  height: 40px;
  flex: none;
}

.cp__cell-bag {
  font-size: 22px;
  line-height: 1.6;
}

.cp__cell-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text);
  text-align: center;
  line-height: 1.15;
}

.cp__cell-stars {
  font-size: 9px;
}

.cp__cell-slot {
  font-size: 9px;
  color: var(--text-dim);
}

/* ---- 👀 试穿预览弹窗 ------------------------------------------------------ */
.pv {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.pv__rig {
  align-self: center;
  width: min(220px, 60%);
}

.pv__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pv__name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
}

.pv__meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--s2);
  font-size: 12px;
}

.pv__rarity {
  font-weight: 700;
}

.pv__state {
  text-align: center;
  font-size: 12px;
}

.pv__owned {
  color: #3a9a6a;
  font-weight: 700;
}

.pv__lock {
  color: var(--text-dim);
}

.pv__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

/* ---- 🎁 奖池切换弹窗 ------------------------------------------------------ */
.pk {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.pk__tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
}

.pk__tab {
  flex: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.pk__tab.is-on {
  border-color: var(--accent);
  background: color-mix(in srgb, var(--accent) 16%, var(--surface-2));
}

.pk__tab-n {
  font-style: normal;
  font-size: 11px;
  color: var(--text-dim);
}

.pk__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  gap: var(--s2);
  max-height: 56vh;
  overflow-y: auto;
  padding-right: 4px;
}

/* 一张奖池卡：上面是主题配色画出来的「画面」，下面是倒计时与集齐进度 */
.pk__pool {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
  color: var(--text);
  overflow: hidden;
  cursor: pointer;
  text-align: left;
}

.pk__pool.is-on {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 45%, transparent);
}

.pk__pool.is-off {
  opacity: 0.45;
  cursor: default;
  filter: grayscale(0.6);
}

.pk__art {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-height: 84px;
  padding: 10px 12px;
  background:
    radial-gradient(circle at 78% 18%, color-mix(in srgb, var(--pc-glow) 55%, transparent), transparent 62%),
    linear-gradient(140deg, var(--pc-base), var(--pc-lid));
}

.pk__art-emoji {
  font-size: 26px;
  line-height: 1;
}

.pk__art-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--pc-trim);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
}

.pk__art-tag {
  position: absolute;
  right: 6px;
  top: 6px;
  padding: 1px 7px;
  border-radius: var(--r-pill);
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: rgba(0, 0, 0, 0.35);
}

.pk__art-on {
  position: absolute;
  left: 8px;
  top: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.pk__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 6px 10px;
}

.pk__left,
.pk__prog {
  font-size: 11px;
}

.pk__prog {
  font-weight: 700;
  color: var(--text);
}

.pk__note {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

/* 矮屏（手机横屏 ~360px 高）：紧凑一档，整块力争一屏放下、不用拖页面 */
@media (max-height: 430px) {
  .cp__right {
    padding: 8px 10px 10px;
    gap: 5px;
  }

  .cp__chest {
    height: 150px;
  }

  .cp__art {
    transform: scale(0.88);
    transform-origin: top center;
  }

  .cp__timer {
    padding: 3px 8px;
  }

  .cp__timer-num {
    font-size: 14px;
  }

  .cp__pool-btn {
    padding: 5px 10px;
    font-size: 12px;
  }
}

@keyframes chest-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-7px);
  }
}

@keyframes chest-shake {
  0%,
  100% {
    transform: translateX(0) rotate(0);
  }
  15% {
    transform: translateX(-7px) rotate(-3deg);
  }
  30% {
    transform: translateX(7px) rotate(3deg);
  }
  45% {
    transform: translateX(-5px) rotate(-2deg);
  }
  60% {
    transform: translateX(5px) rotate(2deg);
  }
  80% {
    transform: translateX(-2px) rotate(-1deg);
  }
}

@keyframes decor-float {
  0%,
  100% {
    transform: translateY(0) rotate(-6deg);
    opacity: 0.85;
  }
  50% {
    transform: translateY(-14px) rotate(8deg);
    opacity: 1;
  }
}

@keyframes result-in {
  from {
    opacity: 0;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.9);
  }
}

@keyframes cell-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.85);
  }
}
</style>
