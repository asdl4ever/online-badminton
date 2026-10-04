<script setup lang="ts">
import { computed, ref } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import { STYLE_META, type AiStyle } from '../game/ai';
import { statBonus, type PlayerStats } from '../game/players';
import type { Cosmetic } from '../game/cosmetics';
import {
  PLACING_LABEL,
  PLACING_MEDAL,
  PLACING_TONE,
  abilityScore,
  careerOf,
  winRateOf,
} from '../game/career';

/**
 * 球员主页：角色预览（同一份游戏绘制）+ 名字/风格 + **四张数据卡**（总胜率 / 能力值 /
 * 冠军×N / 最高排名）+ 四维雷达图 + 数值条。名人堂、晋级赛赛程树、赛事中心都用这一份。
 *
 * 点「冠军」那张奖牌卡会展开**生涯履历**（`game/career.ts` 算出来的，见那里的说明）：
 * 每行是「年月 + 杯名 + 名次」，比如 `2026-10 超神杯 🥇冠军`。
 * 底部用默认插槽放各自的操作按钮（观战 / 关闭…）。
 */
const props = defineProps<{
  name: string;
  style: AiStyle;
  rating: number;
  wins?: number;
  losses?: number;
  stats: PlayerStats;
  /** 外观（不传 = 用玩家自己的） */
  cosmetic?: Cosmetic;
  /** 本人时预览走玩家自己的装扮 */
  isMe?: boolean;
  /** 覆盖默认的「积分 / 战绩」那行 */
  subtitle?: string;
  /** 名人堂名录（只用来给履历里的「负于谁」挑名字），不传就不写对手 */
  roster?: readonly string[];
}>();

/* --- 四张数据卡 ------------------------------------------------------------ */
const careerOpen = ref(false);
/** 「能力值」卡点开的那块面板（五维雷达 + 数值条收在里面，主页更紧凑） */
const statsOpen = ref(false);
/** 生涯履历（名字 + 战绩当种子，所以每次看到的一样，见 game/career.ts） */
const career = computed(() =>
  careerOf(
    { name: props.name, rating: props.rating, wins: props.wins, losses: props.losses },
    { roster: props.roster },
  ),
);
const winPct = computed(() => Math.round(winRateOf(props.wins, props.losses, props.rating) * 100));
const ability = computed(() => abilityScore(props.stats));

/** 总胜率那圈环：周长与两段弧长 */
const donut = computed(() => {
  const rate = winRateOf(props.wins, props.losses, props.rating);
  const r = 23;
  const c = 2 * Math.PI * r;
  return { r, c, win: c * rate, rest: c * (1 - rate) };
});

/** 最高排名那圈月桂：两侧各一串叶子沿弧线排开 */
const laurel = computed(() => {
  const out: { cx: number; cy: number; rot: number }[] = [];
  for (const side of [1, -1]) {
    for (let i = 0; i < 7; i++) {
      const deg = 92 + (i * 108) / 6; // 92°（正下方）→ 200°（斜上方）
      const a = (deg * Math.PI) / 180;
      out.push({
        cx: 32 + side * Math.cos(a) * 21,
        cy: 31 + Math.sin(a) * 21,
        rot: side * (deg + 90),
      });
    }
  }
  return out;
});

/** 履历行副标题 */
function entryNote(e: (typeof career.value.entries)[number]): string {
  if (e.placing === 'champion') return `全胜夺冠 · 赢下 ${e.beaten} 场`;
  const where = e.placing === 'runnerUp' ? '决赛' : PLACING_LABEL[e.placing];
  return e.lostTo ? `止步${where} · 负于 ${e.lostTo}` : `止步${where}`;
}

/** effect = 这一维在对局里管什么 */
const STAT_AXES: { key: keyof PlayerStats; label: string; effect: string }[] = [
  { key: 'technique', label: '技术', effect: '出球质量' },
  { key: 'speed', label: '速度', effect: '跑动' },
  { key: 'attack', label: '进攻', effect: '力量' },
  { key: 'defense', label: '防守', effect: '命中/反应' },
  { key: 'stamina', label: '体力', effect: '跑动续航' },
];

const RADAR_C = 84;
const RADAR_R = 56;

const metaLine = computed(() => {
  if (props.subtitle) return props.subtitle;
  const base = `排行积分 ${props.rating}`;
  return props.wins == null ? base : `${base} · 战绩 ${props.wins}胜 ${props.losses ?? 0}负`;
});

const radar = computed(() => {
  const s = props.stats;
  const axisPoint = (i: number, frac: number): [number, number] => {
    const ang = -Math.PI / 2 + (Math.PI * 2 * i) / STAT_AXES.length;
    return [RADAR_C + Math.cos(ang) * RADAR_R * frac, RADAR_C + Math.sin(ang) * RADAR_R * frac];
  };
  // 刻度按 100 封顶：玩家练满后五维会超过 100（见 training.ts 的 TRAIN_PER_LEVEL），
  // 不封的话雷达会画到圈外、进度条也会溢出。
  const poly = STAT_AXES.map((a, i) => axisPoint(i, Math.min(1, s[a.key] / 100)).join(',')).join(' ');
  const rings = [0.5, 1].map((f) =>
    STAT_AXES.map((_, i) => axisPoint(i, f).join(',')).join(' '),
  );
  const spokes = STAT_AXES.map((_, i) => {
    const [x, y] = axisPoint(i, 1);
    return { x2: x, y2: y };
  });
  const labels = STAT_AXES.map((a, i) => {
    const [x, y] = axisPoint(i, 1.32);
    return {
      key: a.key,
      label: a.label,
      effect: a.effect,
      value: Math.min(100, s[a.key]),
      x,
      y,
      bonus: statBonus(s[a.key]),
    };
  });
  return { poly, rings, spokes, labels };
});
</script>

<template>
  <div class="pp">
    <div class="pp__hero">
      <div class="pp__preview">
        <CharacterPreview :cosmetic="isMe ? undefined : cosmetic" />
      </div>
      <div class="pp__who">
        <div class="pp__name">
          {{ name }}
          <span class="pp__style" :style="{ color: STYLE_META[style].color }">
            {{ STYLE_META[style].label }}
          </span>
        </div>
        <div class="muted pp__meta">{{ metaLine }}</div>
      </div>
    </div>

    <!-- 四张数据卡：总胜率 / 能力值 / 冠军×N / 最高排名 -->
    <div class="cards">
      <div class="card">
        <svg class="card__art" viewBox="0 0 64 64" role="img" aria-label="总胜率">
          <circle class="donut__track" cx="32" cy="32" :r="donut.r" />
          <g transform="rotate(-90 32 32)">
            <circle
              class="donut__win"
              cx="32"
              cy="32"
              :r="donut.r"
              :stroke-dasharray="`${donut.win} ${donut.c}`"
            />
            <circle
              class="donut__loss"
              cx="32"
              cy="32"
              :r="donut.r"
              :stroke-dasharray="`${donut.rest} ${donut.c}`"
              :stroke-dashoffset="-donut.win"
            />
          </g>
          <text class="donut__num" x="32" y="31">{{ winPct }}</text>
          <text class="donut__pct" x="32" y="43">%</text>
        </svg>
        <div class="card__label">总胜率</div>
      </div>

      <button
        class="card is-tappable"
        :class="{ 'is-open': statsOpen }"
        type="button"
        @click="statsOpen = !statsOpen"
      >
        <svg class="card__art" viewBox="0 0 64 64" role="img" aria-label="能力值">
          <polygon class="hex__body" points="32,5 57,19 57,45 32,59 7,45 7,19" />
          <polygon class="hex__inner" points="32,12 51,23 51,41 32,52 13,41 13,23" />
          <text class="hex__num" x="32" y="38">{{ ability.toFixed(1) }}</text>
        </svg>
        <div class="card__label">能力值</div>
        <div class="card__hint">{{ statsOpen ? '收起' : '点开看五维' }}</div>
      </button>

      <button
        class="card is-tappable"
        :class="{ 'is-open': careerOpen }"
        type="button"
        @click="careerOpen = !careerOpen"
      >
        <svg class="card__art" viewBox="0 0 64 64" role="img" aria-label="冠军">
          <polygon class="medal__ribbon" points="19,4 32,27 12,27" />
          <polygon class="medal__ribbon" points="45,4 32,27 52,27" />
          <circle class="medal__disc" cx="32" cy="43" r="18" />
          <circle class="medal__inner" cx="32" cy="43" r="13" />
          <text class="medal__num" x="32" y="50">{{ career.titles }}</text>
        </svg>
        <div class="card__label">冠军 ×{{ career.titles }}</div>
        <div class="card__hint">{{ careerOpen ? '收起履历' : '点开看履历' }}</div>
      </button>

      <div class="card">
        <svg class="card__art" viewBox="0 0 64 64" role="img" aria-label="最高排名">
          <ellipse
            v-for="(l, i) in laurel"
            :key="`leaf-${i}`"
            class="laurel__leaf"
            :cx="l.cx"
            :cy="l.cy"
            rx="6.2"
            ry="2.9"
            :transform="`rotate(${l.rot} ${l.cx} ${l.cy})`"
          />
          <text class="laurel__num" x="32" y="40">{{ career.bestRank }}</text>
        </svg>
        <div class="card__label">最高排名</div>
      </div>
    </div>

    <!-- 生涯履历：点奖牌展开 -->
    <div v-if="careerOpen" class="career">
      <div class="career__head">
        <b>🏅 生涯履历</b>
        <span class="muted">
          共 {{ career.plays }} 届 · 冠军 {{ career.titles }} 次 · 最高排名
          <b class="num">#{{ career.bestRank }}</b>
        </span>
      </div>
      <div class="career__list">
        <div v-for="e in career.entries" :key="e.ts" class="career__row">
          <span class="num career__month">{{ e.month }}</span>
          <span class="career__cup">{{ e.cup }}</span>
          <span class="career__place" :style="{ color: PLACING_TONE[e.placing] }">
            {{ PLACING_MEDAL[e.placing] }}{{ PLACING_LABEL[e.placing] }}
          </span>
          <span class="muted career__note">{{ entryNote(e) }}</span>
        </div>
      </div>
    </div>

    <!-- 能力值面板：点上面的「能力值」卡展开 -->
    <div v-if="statsOpen" class="ability">
      <div class="ability__head">
        <b>📊 能力值 · 五维</b>
        <span class="muted">五维决定风格、难度与打法；点「能力值」卡收起</span>
      </div>
      <div class="pp__body">
        <svg class="radar" viewBox="0 0 168 168" role="img" aria-label="四维能力">
          <polygon
            v-for="(ring, i) in radar.rings"
            :key="`ring-${i}`"
            :points="ring"
            class="radar__ring"
          />
          <line
            v-for="(s, i) in radar.spokes"
            :key="`spoke-${i}`"
            :x1="RADAR_C"
            :y1="RADAR_C"
            :x2="s.x2"
            :y2="s.y2"
            class="radar__spoke"
          />
          <polygon :points="radar.poly" class="radar__area" />
          <text
            v-for="l in radar.labels"
            :key="l.key"
            :x="l.x"
            :y="l.y"
            class="radar__label"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ l.label }}
          </text>
        </svg>

        <div class="stat-list">
          <div v-for="l in radar.labels" :key="l.key" class="stat-row">
            <span class="stat-row__label">{{ l.label }}</span>
            <span class="muted stat-row__effect">{{ l.effect }}</span>
            <span class="stat-row__bar">
              <span class="stat-row__fill" :style="{ width: `${l.value}%` }" />
            </span>
            <span class="num stat-row__value">{{ l.value }}</span>
            <span class="num stat-row__bonus" :class="{ 'is-down': l.bonus < 0 }">
              {{ l.bonus >= 0 ? '+' : '' }}{{ Math.round(l.bonus * 100) }}%
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="$slots.default" class="pp__actions">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.pp {
  display: flex;
  flex-direction: column;
  gap: var(--s3);
}

.pp__hero {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: var(--s3);
  align-items: center;
}

.pp__preview {
  border-radius: var(--r-lg);
  overflow: hidden;
}

.pp__who {
  min-width: 0;
}

.pp__name {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.pp__style {
  margin-left: 6px;
  font-size: 12px;
}

.pp__meta {
  margin-top: 2px;
  font-size: 12px;
}

/* ---------- 四张数据卡 ---------- */
.cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--s2);
}

.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 6px 8px;
  border: none;
  border-radius: var(--r-lg, 14px);
  background: var(--surface);
  box-shadow: var(--e1, 0 2px 8px rgba(0, 0, 0, 0.12));
  color: inherit;
  font: inherit;
}

.card.is-tappable {
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.card.is-tappable:hover {
  transform: translateY(-1px);
  box-shadow: var(--e2, 0 4px 14px rgba(0, 0, 0, 0.16));
}

.card.is-open {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 60%, transparent);
}

.card__art {
  width: 46px;
  height: 46px;
}

.card__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
}

.card__hint {
  font-size: 10px;
  color: var(--accent);
}

/* 总胜率：红绿各一段的圆环 */
.donut__track {
  fill: none;
  stroke: color-mix(in srgb, var(--text) 10%, transparent);
  stroke-width: 9;
}

.donut__win,
.donut__loss {
  fill: none;
  stroke-width: 9;
  stroke-linecap: butt;
}

.donut__win {
  stroke: #33b45f;
}

.donut__loss {
  stroke: #e8464f;
}

.donut__num {
  fill: var(--text);
  font-size: 17px;
  font-weight: 800;
  text-anchor: middle;
}

.donut__pct {
  fill: var(--text-dim);
  font-size: 9px;
  text-anchor: middle;
}

/* 能力值：六边形 */
.hex__body {
  fill: #eaf4ff;
  stroke: #b9d9f5;
  stroke-width: 1.5;
}

.hex__inner {
  fill: #ffffff;
  opacity: 0.55;
}

.hex__num {
  fill: #1c4a72;
  font-size: 17px;
  font-weight: 800;
  text-anchor: middle;
}

/* 冠军：紫缎带 + 金牌 */
.medal__ribbon {
  fill: #8b5cf6;
}

.medal__disc {
  fill: #f2c53d;
  stroke: #e0a92a;
  stroke-width: 1.5;
}

.medal__inner {
  fill: #ffe38a;
}

.medal__num {
  fill: #8a5a00;
  font-size: 18px;
  font-weight: 800;
  text-anchor: middle;
}

/* 最高排名：月桂 */
.laurel__leaf {
  fill: #c9d0da;
}

.laurel__num {
  fill: #e8722c;
  font-size: 21px;
  font-weight: 800;
  text-anchor: middle;
}

/* ---------- 能力值面板 ---------- */
.ability {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md, 12px);
  background: color-mix(in srgb, var(--text) 5%, transparent);
  box-shadow: inset 0 0 0 1px var(--line);
}

.ability__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 12px;
}

/* ---------- 生涯履历 ---------- */
.career {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--s2) var(--s3);
  border-radius: var(--r-md, 12px);
  background: color-mix(in srgb, var(--text) 5%, transparent);
  box-shadow: inset 0 0 0 1px var(--line);
}

.career__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s2);
  font-size: 12px;
}

.career__list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-height: 240px;
  overflow-y: auto;
}

.career__row {
  display: grid;
  grid-template-columns: 62px 1fr auto;
  grid-template-areas: 'month cup place' 'month note note';
  align-items: center;
  gap: 2px 8px;
  padding: 4px 6px;
  border-radius: 8px;
  font-size: 12px;
}

.career__row:nth-child(odd) {
  background: color-mix(in srgb, var(--text) 4%, transparent);
}

.career__month {
  grid-area: month;
  padding: 2px 0;
  border-radius: 6px;
  background: color-mix(in srgb, var(--text) 8%, transparent);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  color: var(--text-dim);
}

.career__cup {
  grid-area: cup;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.career__place {
  grid-area: place;
  font-weight: 700;
  white-space: nowrap;
}

.career__note {
  grid-area: note;
  font-size: 11px;
}

.pp__body {
  display: grid;
  grid-template-columns: 168px minmax(0, 1fr);
  gap: var(--s4);
  align-items: center;
}

.radar {
  width: 168px;
  height: 168px;
}

.radar__ring {
  fill: none;
  stroke: var(--line);
  stroke-width: 1;
}

.radar__spoke {
  stroke: var(--line);
  stroke-width: 1;
}

.radar__area {
  fill: color-mix(in srgb, var(--accent) 30%, transparent);
  stroke: var(--accent);
  stroke-width: 2;
}

.radar__label {
  fill: var(--text-dim);
  font-size: 11px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.stat-row {
  display: flex;
  align-items: center;
  gap: var(--s2);
  font-size: 13px;
}

.stat-row__label {
  flex: none;
  width: 34px;
  color: var(--text);
  font-weight: 600;
}

.stat-row__effect {
  flex: none;
  width: 58px;
  font-size: 11px;
}

.stat-row__bar {
  flex: 1 1 auto;
  height: 8px;
  border-radius: 999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--text) 12%, transparent);
}

.stat-row__fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: var(--accent);
}

.stat-row__value {
  flex: none;
  width: 28px;
  text-align: right;
  color: var(--text);
  font-weight: 700;
}

.stat-row__bonus {
  flex: none;
  width: 44px;
  text-align: right;
  font-size: 11px;
  font-weight: 700;
  color: #3a9d5d;
}

.stat-row__bonus.is-down {
  color: #c05555;
}

.pp__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

@media (max-width: 520px) {
  .pp__body {
    grid-template-columns: 1fr;
    justify-items: center;
  }

  /* 手机上四张卡排成两行 */
  .cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card__art {
    width: 40px;
    height: 40px;
  }
}
</style>
