<script setup lang="ts">
import { computed } from 'vue';
import { useCustomizeStore } from '../stores/customize';
import { AURA_COLORS, titleText, toHex, WING_COLORS } from '../game/cosmetics';
import { THEMES } from '../game/theme';

const store = useCustomizeStore();

const previewBg = computed(() => {
  const [sky, floor] = THEMES[store.theme].swatch;
  return {
    background: `linear-gradient(180deg, ${toHex(sky)} 0 58%, ${toHex(floor)} 58% 100%)`,
  };
});

const racketFrameColor = computed(() => {
  if (store.racketSkin === 'gold') return toHex(0xffcf5c);
  if (store.racketSkin === 'flame') return toHex(0xff7a2a);
  if (store.racketSkin === 'ice') return toHex(0x9fe8ff);
  return store.racketHex;
});

const wingColor = computed(() => toHex(WING_COLORS[store.wings]));
const auraColor = computed(() => toHex(AURA_COLORS[store.aura]));
const titleStr = computed(() => titleText(store.title));
</script>

<template>
  <div class="pc" :style="previewBg">
    <div class="pc__scene">
      <div
        v-if="store.aura !== 'none'"
        class="pc__aura"
        :style="{ background: `radial-gradient(circle, ${auraColor}66, transparent 70%)` }"
      />
      <svg v-if="store.wings !== 'none'" class="pc__wings" viewBox="0 0 160 120" aria-hidden="true">
        <polygon points="80,78 10,30 26,60 6,64 30,86 22,96 80,96" :fill="wingColor" opacity="0.85" />
        <polygon points="80,78 150,30 134,60 154,64 130,86 138,96 80,96" :fill="wingColor" opacity="0.85" />
      </svg>
      <svg class="pc__racket" viewBox="0 0 150 190" aria-hidden="true">
        <path class="pc__trail" d="M34 156 A 92 92 0 0 1 132 58" :stroke="store.trailHex" />
        <line class="pc__shaft" x1="62" y1="176" x2="76" y2="108" />
        <ellipse class="pc__frame" cx="86" cy="82" rx="24" ry="30" :stroke="racketFrameColor" />
      </svg>
      <div class="pc__char">
        <div v-if="store.emoji" class="pc__emoji">{{ store.emoji }}</div>
        <div v-else class="pc__emoji pc__emoji--plain" />
        <div class="pc__body" />
        <div v-if="titleStr" class="pc__title">{{ titleStr }}</div>
      </div>
    </div>
    <span class="pc__badge">{{ THEMES[store.theme].label }}</span>
  </div>
</template>

<style scoped>
.pc {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: inset 0 1px 6px rgba(2, 6, 16, 0.08);
}

.pc__scene {
  position: absolute;
  inset: 0;
}

.pc__aura {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 160px;
  height: 200px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  pointer-events: none;
}

.pc__wings {
  position: absolute;
  left: 50%;
  bottom: 52px;
  width: 160px;
  transform: translateX(-50%);
  pointer-events: none;
}

.pc__char {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pc__emoji {
  font-size: 56px;
  line-height: 1;
  z-index: 2;
}

.pc__emoji--plain {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f0c49c;
  border: 2px solid rgba(0, 0, 0, 0.12);
}

.pc__body {
  width: 50px;
  height: 84px;
  margin-top: -8px;
  border-radius: 16px 16px 10px 10px;
  background: #2a7ad4;
  box-shadow: inset 0 -10px 0 rgba(0, 0, 0, 0.08);
}

.pc__title {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.pc__racket {
  position: absolute;
  right: -8px;
  bottom: 40px;
  width: 62%;
  height: auto;
}

.pc__trail {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
  opacity: 0.55;
}

.pc__shaft {
  stroke: #5b6b80;
  stroke-width: 9;
  stroke-linecap: round;
}

.pc__frame {
  fill: none;
  stroke-width: 6;
}

.pc__badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 10px;
  border-radius: var(--r-pill);
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 12px;
}
</style>
