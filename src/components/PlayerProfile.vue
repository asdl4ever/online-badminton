<script setup lang="ts">
import { computed } from 'vue';
import CharacterPreview from './CharacterPreview.vue';
import { STYLE_META, type AiStyle } from '../game/ai';
import { statBonus, type PlayerStats } from '../game/players';
import type { Cosmetic } from '../game/cosmetics';

/**
 * 球员主页：角色预览（同一份游戏绘制）+ 名字/风格 + 四维雷达图 + 数值条。
 * 名人堂与晋级赛赛程树点名字都用这一份，保证两处一致。
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
}>();

/** effect = 这一维在对局里管什么 */
const STAT_AXES: { key: keyof PlayerStats; label: string; effect: string }[] = [
  { key: 'technique', label: '技术', effect: '出球质量' },
  { key: 'speed', label: '速度', effect: '跑动' },
  { key: 'attack', label: '进攻', effect: '力量' },
  { key: 'defense', label: '防守', effect: '命中/反应' },
  { key: 'jump', label: '弹跳', effect: '起跳' },
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
  const poly = STAT_AXES.map((a, i) => axisPoint(i, s[a.key] / 100).join(',')).join(' ');
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
      value: s[a.key],
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
}
</style>
