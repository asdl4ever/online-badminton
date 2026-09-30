<script setup lang="ts">
import { computed } from 'vue';
import { useCustomizeStore } from '../stores/customize';
import { useProgressStore } from '../stores/progress';
import {
  AURA_COLORS,
  CAPE_COLORS,
  HAT_COLORS,
  HAT_KIND,
  PET_COLORS,
  toHex,
  WING_COLORS,
  WING_SHAPE,
  type HatKind,
} from '../game/cosmetics';
import { THEMES } from '../game/theme';

const store = useCustomizeStore();
const progress = useProgressStore();

/** equipped pet's hatched star, 1–5 (0 when no pet) */
const petStar = computed(() => (store.pet === 'none' ? 0 : progress.petStar(store.pet) || 1));

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
const capeColor = computed(() => toHex(CAPE_COLORS[store.cape]));
const hatColor = computed(() => toHex(HAT_COLORS[store.hat]));
const petColor = computed(() => toHex(PET_COLORS[store.pet]));

/** a tiny silhouette per headpiece, drawn in a 60x40 box */
const HAT_PATHS: Record<HatKind, string> = {
  crown: 'M12 30 L18 14 L24 24 L30 10 L36 24 L42 14 L48 30 Z',
  cap: 'M12 30 Q30 16 48 30 L48 34 L12 34 Z',
  horn: 'M14 32 L10 16 L20 26 Z M46 32 L50 16 L40 26 Z',
  halo: 'M16 14 Q30 4 44 14 Q30 20 16 14 Z',
  wizard: 'M30 6 L46 34 L14 34 Z',
  santa: 'M14 30 Q30 8 46 30 L46 34 L14 34 Z',
  band: 'M12 30 L48 30 L48 35 L12 35 Z',
  flower: 'M18 28 a5 5 0 1 0 0.1 0 M30 22 a5 5 0 1 0 0.1 0 M42 28 a5 5 0 1 0 0.1 0',
  phone: 'M10 28 a8 8 0 0 1 16 0 M34 28 a8 8 0 0 1 16 0 M26 22 L26 32 L34 32 L34 22',
  top: 'M12 32 L48 32 L48 36 L12 36 Z M20 32 L20 10 L40 10 L40 32 Z',
  helm: 'M16 30 Q18 16 30 16 Q42 16 44 30 L44 34 L16 34 Z',
  pirate: 'M6 32 L20 16 L40 16 L54 32 Z',
  chef: 'M14 30 h32 v6 h-32 Z M13 24 a8 8 0 1 1 10 -10 a9 9 0 0 1 14 0 a8 8 0 1 1 10 10 Z',
  astro: 'M30 8 a15 15 0 0 1 15 15 h-30 a15 15 0 0 1 15 -15 Z M18 25 h24 v5 h-24 Z',
  mushroom: 'M10 30 a20 13 0 0 1 40 0 Z M25 30 h10 v12 h-10 Z',
  beanie: 'M14 30 a16 14 0 0 1 32 0 Z M13 30 h34 v5 h-34 Z',
  antler: 'M18 32 L16 18 L8 13 M16 22 L8 26 M42 32 L44 18 L52 13 M44 22 L52 26',
  jester: 'M18 34 L14 14 L6 32 Z M30 34 L30 12 L22 32 Z M42 34 L46 14 L54 32 Z',
  sombrero: 'M30 28 a14 9 0 0 1 28 0 a14 9 0 0 1 -28 0 Z M8 32 a22 6 0 0 0 44 0 Z',
};
const hatPath = computed(() => HAT_PATHS[HAT_KIND[store.hat]]);

/** the panel silhouette follows the same kind the game uses */
const wingPolys = computed<string[]>(() => {
  if (store.wings === 'none') return [];
  switch (WING_SHAPE[store.wings].kind) {
    case 'membrane':
      return ['80,74 12,34 20,58 8,66 26,84 80,92', '80,74 148,34 140,58 152,66 134,84 80,92'];
    case 'butterfly':
      return ['80,72 18,26 44,42 24,52 46,72 80,88', '80,72 142,26 116,42 136,52 114,72 80,88'];
    case 'mech':
      return ['80,80 26,44 34,70 22,74 40,90 80,94', '80,80 134,44 126,70 138,74 120,90 80,94'];
    case 'crystal':
      return ['80,78 30,40 44,60 34,66 52,88 80,94', '80,78 130,40 116,60 126,66 108,88 80,94'];
    case 'flame':
      return ['80,76 22,34 34,58 20,64 40,86 80,92', '80,76 138,34 126,58 140,64 120,86 80,92'];
    case 'blade':
      return ['80,72 14,30 34,52 22,58 44,80 80,90', '80,72 146,30 126,52 138,58 116,80 80,90'];
    case 'leaf':
      return ['80,78 24,38 46,54 32,64 52,86 80,94', '80,78 136,38 114,54 128,64 108,86 80,94'];
    case 'fin':
      return ['80,66 18,42 40,56 26,64 48,84 80,94', '80,66 142,42 120,56 134,64 112,84 80,94'];
    case 'ribbon':
      return ['80,80 26,34 44,54 30,62 52,82 80,92', '80,80 134,34 116,54 130,62 108,82 80,92'];
    case 'spike':
      return ['80,74 24,42 36,62 26,66 46,86 80,94', '80,74 136,42 124,62 134,66 114,86 80,94'];
    case 'sail':
      return ['78,10 118,44 106,88 78,96', '82,10 42,44 54,88 82,96'];
    default:
      return ['80,78 10,30 26,60 6,64 30,86 22,96 80,96', '80,78 150,30 134,60 154,64 130,86 138,96 80,96'];
  }
});

/** a few auras get drifting motes in the preview */
const auraMotes = computed(() => {
  switch (store.aura) {
    case 'snow':
    case 'sakura':
    case 'emerald':
    case 'rose':
    case 'venom':
    case 'crimson':
    case 'flame':
      return 8;
    case 'bubble':
    case 'toxic':
      return 7;
    case 'orbit':
    case 'violet':
      return 4;
    default:
      return 0;
  }
});
</script>

<template>
  <div class="pc" :style="previewBg">
    <div class="pc__scene">
      <div
        v-if="store.aura !== 'none'"
        class="pc__aura"
        :style="{ background: `radial-gradient(circle, ${auraColor}66, transparent 70%)` }"
      >
        <span
          v-for="n in auraMotes"
          :key="n"
          class="pc__mote"
          :style="{
            background: auraColor,
            left: `${50 + Math.sin(n * 2.3) * 34}%`,
            animationDelay: `${n * 0.28}s`,
          }"
        />
      </div>
      <svg v-if="store.cape !== 'none'" class="pc__cape" viewBox="0 0 120 120" aria-hidden="true">
        <polygon points="42,12 78,12 98,112 22,112" :fill="capeColor" opacity="0.8" />
      </svg>
      <svg v-if="store.wings !== 'none'" class="pc__wings" viewBox="0 0 160 120" aria-hidden="true">
        <polygon v-for="(p, i) in wingPolys" :key="i" :points="p" :fill="wingColor" opacity="0.85" />
      </svg>
      <svg class="pc__racket" viewBox="0 0 150 190" aria-hidden="true">
        <path class="pc__trail" d="M34 156 A 92 92 0 0 1 132 58" :stroke="store.trailHex" />
        <line class="pc__shaft" x1="62" y1="176" x2="76" y2="108" />
        <ellipse class="pc__frame" cx="86" cy="82" rx="24" ry="30" :stroke="racketFrameColor" />
      </svg>
      <div
        v-if="store.pet !== 'none'"
        class="pc__pet"
        :class="`is-${petStar}`"
        :style="{ background: petColor }"
      />
      <div class="pc__char">
        <svg v-if="store.hat !== 'none'" class="pc__hat" viewBox="0 0 60 40" aria-hidden="true">
          <path :d="hatPath" :fill="hatColor" />
        </svg>
        <div v-if="store.emoji" class="pc__emoji">{{ store.emoji }}</div>
        <div v-else class="pc__emoji pc__emoji--plain" />
        <div class="pc__body" />
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

.pc__cape {
  position: absolute;
  left: 50%;
  bottom: 22px;
  width: 130px;
  transform: translateX(-50%);
  pointer-events: none;
}

.pc__pet {
  position: absolute;
  right: 16px;
  bottom: 130px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
  animation: pc-pet-bob 1.6s ease-in-out infinite;
}

.pc__pet.is-2 {
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.7), 0 0 10px rgba(90, 160, 232, 0.7);
}

.pc__pet.is-3 {
  width: 18px;
  height: 18px;
  box-shadow: 0 0 0 2px #3d8bfd, 0 0 12px rgba(61, 139, 253, 0.7);
}

.pc__pet.is-4 {
  width: 20px;
  height: 20px;
  box-shadow: 0 0 0 2px #9b59d0, 0 0 16px rgba(155, 89, 208, 0.8);
}

.pc__pet.is-5 {
  width: 23px;
  height: 23px;
  box-shadow: 0 0 0 2px #e8a33d, 0 0 18px rgba(232, 163, 61, 0.85);
  animation: pc-pet-bob 1.2s ease-in-out infinite, pc-pet-glow 1.4s ease-in-out infinite;
}

@keyframes pc-pet-glow {
  0%,
  100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(1.5);
  }
}

@keyframes pc-pet-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.pc__mote {
  position: absolute;
  bottom: 16%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  transform: translateX(-50%);
  opacity: 0;
  animation: pc-mote-rise 2.4s linear infinite;
}

@keyframes pc-mote-rise {
  0% {
    transform: translate(-50%, 0);
    opacity: 0;
  }
  30% {
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -130px);
    opacity: 0;
  }
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

.pc__hat {
  width: 46px;
  height: 30px;
  margin-bottom: -12px;
  z-index: 3;
  pointer-events: none;
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
