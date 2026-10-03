<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import Stars from './ui/Stars.vue';
import ItemIcon from './ItemIcon.vue';
import Button from './ui/Button.vue';
import ShardShop from './ShardShop.vue';
import { celebrate, RARITY_LEVEL } from '../composables/celebrate';
import { toastWarn } from '../composables/useToast';
import { useProgressStore, type PullResult } from '../stores/progress';
import {
  bannerItems,
  bannerSizeOf,
  bannerTierCount,
  CHEST_ODDS,
  CHEST_THEMES,
  chestPeriod,
  chestPeriodEnd,
  chestThemeFor,
  nextChestTheme,
  themePool,
  type ChestTheme,
} from '../game/chest';
import { CHEST_KEYS, RARITY_META, SLOT_LABELS, type Item } from '../game/items';

/**
 * 🎁 宝箱柜：**一小时一期的主题宝箱**（`game/chest.ts`）。
 *
 * 版式跟设计稿一致——
 * - 左：宝箱本体（CSS 画的，按主题换配色与装饰）+ 期名 / 卖点 / 换期倒计时；
 * - 右上：**这一期展示的主题池**（真池子，不是展示用的精选）；
 * - 右下：单抽 / 十连抽。
 *
 * ⚠️ **开箱不是"只出这一期"**：每开一次先按 `CHEST_ODDS` 摇类别——
 * 普通宝箱 50% / 本期的主题宝箱 35% / 高级宝箱 15%，所以墙上这期只是"主推"。
 * 抽奖还是老规矩：袋子档（约 1/5 不给装扮，给金币或 🧩 碎片）、重复返还金币；
 * 碎片兑换区收在面板最下面。
 */
const progress = useProgressStore();

/** 十连要几把钥匙 */
const TEN_KEYS = CHEST_KEYS * 10;

// ---- 本期（每小时一换，面板开着也会自己翻期）--------------------------------
const tick = ref(Date.now());
let timer = 0;
onMounted(() => {
  timer = window.setInterval(() => (tick.value = Date.now()), 1000);
});
onBeforeUnmount(() => window.clearInterval(timer));

const period = computed(() => chestPeriod(tick.value));
const theme = computed(() => chestThemeFor(period.value));
const nextTheme = computed(() => nextChestTheme(period.value));
const banner = computed(() => bannerItems(theme.value, period.value));
const highCount = computed(() => bannerTierCount(banner.value, 4));

// ---- 全类别查看 -------------------------------------------------------------
const browse = ref(false);
/** 每个主题「如果现在轮到它」会开出的 12 件（同一小时内看是稳定的） */
const previewOf = (t: ChestTheme): Item[] => bannerItems(t, period.value);
const poolCount = (t: ChestTheme): number => themePool(t).length;

/** 距离换期还有多久 */
const leftText = computed(() => {
  const ms = Math.max(0, chestPeriodEnd(tick.value) - tick.value);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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

const canSingle = computed(() => progress.chestKeys >= CHEST_KEYS && phase.value !== 'opening');
const canTen = computed(() => progress.chestKeys >= TEN_KEYS && phase.value !== 'opening');
const canFreeTen = computed(() => progress.tenTickets > 0 && phase.value !== 'opening');

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
    note: r.duplicate ? `重复 · 返还 🪙${r.refund}` : '',
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
  if (!canSingle.value) {
    toastWarn(`宝箱钥匙不够，还差 ${CHEST_KEYS - progress.chestKeys} 把（成就 / 里程碑 / 段位 / 每日任务 / 哥斯拉都给钥匙）`);
    return;
  }
  // 不传池子：由 `progress` 摇类别（普通 50% / 本期主题 35% / 高级 15%）
  const r = progress.pull();
  if (!r) return;
  mode.value = 'single';
  result.value = r;
  results.value = [];
  reveal();
}

function openTen(useTicket: boolean): void {
  if (!useTicket && !canTen.value) {
    toastWarn(`宝箱钥匙不够，十连要 ${TEN_KEYS} 把（现在 ${progress.chestKeys} 把）`);
    return;
  }
  if (useTicket && !canFreeTen.value) return;
  const r = progress.pullTen(useTicket);
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
    <!-- 顶栏：钥匙 / 碎片 / 保底 -->
    <div class="cp__top">
      <div class="cp__wallet">
        <span class="cp__w-ico">🔑</span>
        <span class="num cp__w-num">{{ progress.chestKeys }}</span>
        <span class="muted cp__w-label">宝箱钥匙</span>
        <span class="muted cp__w-dot">·</span>
        <span class="cp__w-ico">🧩</span>
        <span class="num cp__w-num">{{ progress.shards }}</span>
        <span class="muted cp__w-label">星尘碎片</span>
      </div>
      <span class="muted cp__pity">没有保底 · 抽不到的攒 🧩 碎片直接换</span>
    </div>

    <div class="cp__main">
      <!-- 左：宝箱本体 -->
      <section class="cp__left">
        <div class="cp__chest" :class="`is-${phase}`">
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

        <div class="cp__meta">
          <div class="cp__name">{{ theme.emoji }} {{ theme.name }}</div>
          <div class="muted cp__tagline">{{ theme.tagline }}</div>
          <div class="cp__timer">
            <span class="num cp__timer-num">{{ leftText }}</span>
            <span class="muted cp__timer-label">后换期 · 下一期 {{ nextTheme.emoji }} {{ nextTheme.name }}</span>
          </div>
        </div>
      </section>

      <!-- 右：物品墙 + 两个按钮 -->
      <section class="cp__right">
        <div class="cp__wall-head">
          <b>本期主推主题</b>
          <span class="muted num">
            {{ banner.length }} 件 · 共 {{ bannerSizeOf(theme) }} 格 · 4★+ {{ highCount }} 件
          </span>
          <span v-if="theme.id === 'shan'" class="muted num">
            · 🐉 摇到"主题"档时：怪物皮肤任意一只 ≈3%、指定某一只 ≈0.3%
          </span>
        </div>
        <p class="muted cp__odds">
          开箱先摇类别：普通宝箱 <b>{{ Math.round(CHEST_ODDS.normal * 100) }}%</b> ·
          本期主题 <b>{{ Math.round(CHEST_ODDS.theme * 100) }}%</b> ·
          高级宝箱 <b>{{ Math.round(CHEST_ODDS.premium * 100) }}%</b>
          （左边这面墙就是"主题"那一档）。
        </p>

        <div class="cp__wall">
          <div
            v-for="it in banner"
            :key="it.id"
            class="cp__tile"
            :class="{ 'is-owned': owned(it.id) }"
            :style="{ '--r': RARITY_META[it.rarity].color }"
          >
            <span class="cp__tile-ico"><ItemIcon :item="it" /></span>
            <span class="cp__tile-label">{{ it.label }}</span>
            <Stars class="cp__tile-stars" :value="it.stars" />
            <span v-if="owned(it.id)" class="cp__tile-owned">已有</span>
          </div>
        </div>

        <div class="cp__actions">
          <Button variant="primary" block :disabled="!canSingle" @click="openSingle">
            单抽 · 🔑{{ CHEST_KEYS }}
          </Button>
          <Button block :disabled="!canTen" @click="openTen(false)">十连抽 · 🔑{{ TEN_KEYS }}</Button>
          <Button
            v-if="progress.tenTickets > 0"
            variant="primary"
            block
            :disabled="!canFreeTen"
            @click="openTen(true)"
          >
            免费十连（新手礼）×{{ progress.tenTickets }}
          </Button>
        </div>
      </section>

      <!-- 结果浮层：盖在左宝箱 + 右墙上 -->
      <div
        v-if="phase === 'revealed'"
        class="cp__result"
        @click="dismiss"
      >
        <div v-if="mode === 'single' && singleTile" class="cp__card" :style="{ '--rarity': singleTile.color }">
          <div class="cp__card-tag">{{ singleTile.tag }}</div>
          <ItemIcon v-if="singleTile.item" class="cp__card-icon" :item="singleTile.item" />
          <span v-else class="cp__card-bag">{{ singleTile.emoji }}</span>
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
            <ItemIcon v-if="t.item" class="cp__cell-icon" :item="t.item" />
            <span v-else class="cp__cell-bag">{{ t.emoji }}</span>
            <span class="cp__cell-label">{{ t.title }}</span>
            <Stars v-if="t.stars > 0" class="cp__cell-stars" :value="t.stars" />
            <span class="cp__cell-slot">{{ t.sub }}</span>
          </div>
        </div>

        <span class="cp__result-hint">点任意处收起</span>
      </div>
    </div>

    <!-- 全部类别与奖池 -->
    <div class="cp__browse">
      <button class="cp__browse-btn" type="button" @click="browse = !browse">
        {{ browse ? '▴ 收起类别列表' : '▾ 查看全部宝箱类别与奖池' }}
      </button>
      <div v-if="browse" class="cp__themes">
        <div
          v-for="t in CHEST_THEMES"
          :key="t.id"
          class="cp__theme"
          :class="{ 'is-now': t.id === theme.id }"
        >
          <div class="cp__theme-head">
            <span class="cp__theme-face">{{ t.emoji }}</span>
            <div class="cp__theme-title">
              <b class="cp__theme-name">
                {{ t.name }}
                <span v-if="t.id === theme.id" class="cp__theme-now">本期</span>
              </b>
              <div class="muted cp__theme-tag">{{ t.tagline }}</div>
            </div>
            <span class="muted num cp__theme-count">候选 {{ poolCount(t) }} 件</span>
          </div>
          <div class="cp__theme-wall">
            <div
              v-for="it in previewOf(t)"
              :key="it.id"
              class="cp__tcell"
              :style="{ '--r': RARITY_META[it.rarity].color }"
              :title="it.label"
            >
              <span class="cp__tcell-ico"><ItemIcon :item="it" /></span>
              <span class="cp__tcell-label">{{ it.label }}</span>
              <Stars class="cp__tcell-stars" :value="it.stars" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <p class="muted cp__note">
      宝箱<b>一小时换一期</b>：一期一个主题（右边墙上就是它这一期的主推池，早期主题 12 件、纯主题宝箱 16 件、🗺️ 山海宝箱 24 件）；<b>但开箱先摇类别</b>——普通宝箱 50% / 本期主题 35% / 高级宝箱 15%，所以也可能开出普通、高级宝箱里的东西，
      也可以点上面看所有类别；物品互斥认领，高级宝箱高星更多）。<b>没有保底</b>——概率就是概率，抽不到的攒 🧩 碎片在下面直接换专属装扮。
      开箱只花<b>宝箱钥匙</b>（成就 / 发球机里程碑 / 段位 / 每日钓鱼任务 / 晋级赛名次 / 小黄龙转盘 / 哥斯拉），
      约 <b>1/5 的抽是「袋子档」</b>（给金币或 🧩 碎片），重复返还金币。
    </p>

    <details class="cp__shard" open>
      <summary>🧩 星尘碎片兑换 · 3★ 及以下（含金币商店不卖的宝箱专属）</summary>
      <ShardShop />
    </details>
  </div>
</template>

<style scoped>
.cp {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

/* ---- 顶栏 ---------------------------------------------------------------- */
.cp__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.cp__wallet {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.cp__w-ico {
  font-size: 18px;
}

.cp__w-num {
  font-size: 22px;
  font-weight: 700;
  color: var(--text);
}

.cp__w-label,
.cp__pity,
.cp__w-dot {
  font-size: 12px;
}

/* ---- 两列主体 ------------------------------------------------------------ */
.cp__main {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--s3);
}

@media (max-width: 720px) {
  .cp__main {
    grid-template-columns: 1fr;
  }
}

/* ---- 左：宝箱 ------------------------------------------------------------ */
.cp__left {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--s3);
  padding: var(--s4) var(--s3);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background:
    radial-gradient(circle at 50% 34%, color-mix(in srgb, var(--ct-glow) 34%, transparent), transparent 62%),
    color-mix(in srgb, var(--ct-base) 22%, var(--glass-bg));
  box-shadow: var(--glass-shadow), var(--glass-hi);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

.cp__chest {
  position: relative;
  width: 190px;
  height: 170px;
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

.cp__meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
}

.cp__name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
}

.cp__tagline {
  font-size: 12px;
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

/* ---- 右上：物品墙 -------------------------------------------------------- */
.cp__right {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.cp__wall-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 13px;
}

.cp__wall {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 6px;
  padding: var(--s2);
  border-radius: var(--r-lg);
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: var(--glass-hi), var(--glass-lo);
  backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
  -webkit-backdrop-filter: blur(var(--lg-blur)) saturate(var(--lg-sat));
}

@media (max-width: 620px) {
  .cp__wall {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.cp__tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 4px;
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--r) 45%, transparent);
  background: color-mix(in srgb, var(--r) 10%, var(--surface));
  box-shadow: 0 6px 14px -10px color-mix(in srgb, var(--r) 80%, transparent);
}

.cp__tile.is-owned {
  opacity: 0.5;
}

.cp__tile-ico {
  width: 100%;
  height: 46px;
  display: block;
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

/* ---- 右下：两个按钮 ------------------------------------------------------ */
.cp__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s2);
}

.cp__actions > :last-child:nth-child(3) {
  grid-column: span 2;
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

.cp__card-icon {
  width: 76px;
  height: 76px;
}

.cp__card-bag {
  font-size: 54px;
  line-height: 1;
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

/* ---- 全类别查看 ---------------------------------------------------------- */
.cp__browse-btn {
  width: 100%;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--glass-hi);
}

.cp__browse-btn:hover {
  border-color: color-mix(in srgb, var(--ct-trim) 55%, transparent);
}

.cp__themes {
  margin-top: var(--s2);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--s2);
}

.cp__theme {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.cp__theme.is-now {
  border-color: color-mix(in srgb, var(--ct-trim) 60%, transparent);
  background: color-mix(in srgb, var(--ct-trim) 10%, var(--surface-2));
}

.cp__theme-head {
  display: flex;
  align-items: center;
  gap: var(--s2);
}

.cp__theme-face {
  font-size: 24px;
}

.cp__theme-title {
  flex: 1;
  min-width: 0;
}

.cp__theme-name {
  font-size: 14px;
  color: var(--text);
}

.cp__theme-now {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 6px;
  font-size: 10px;
  color: #fff;
  background: color-mix(in srgb, var(--ct-trim) 75%, #000);
}

.cp__theme-tag {
  font-size: 11px;
}

.cp__theme-count {
  font-size: 11px;
  white-space: nowrap;
}

.cp__theme-wall {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
}

.cp__tcell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 4px 2px;
  border-radius: 8px;
  border: 1px solid color-mix(in srgb, var(--r) 40%, transparent);
  background: color-mix(in srgb, var(--r) 8%, var(--surface));
}

.cp__tcell-ico {
  width: 100%;
  height: 34px;
  display: block;
}

.cp__tcell-label {
  width: 100%;
  font-size: 10px;
  color: var(--text-dim);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cp__tcell-stars {
  font-size: 8px;
}

/* ---- 底部说明与兑换区 ---------------------------------------------------- */
.cp__note {
  font-size: 12px;
  margin: 0;
}

.cp__odds {
  font-size: 12px;
  margin: 0 0 var(--s2);
}

.cp__shard {
  border-top: 1px solid var(--line);
  padding-top: var(--s3);
}

.cp__shard > summary {
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--s3);
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
