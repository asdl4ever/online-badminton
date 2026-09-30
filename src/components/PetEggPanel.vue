<script setup lang="ts">
import { computed, ref } from 'vue';
import { vAutoAnimate } from '@formkit/auto-animate/vue';
import Stars from './ui/Stars.vue';
import Button from './ui/Button.vue';
import { celebrate, starLevel } from '../composables/celebrate';
import { toastWarn } from '../composables/useToast';
import { useProgressStore, type HatchResult } from '../stores/progress';
import { PET_EGGS, PET_STAR_META, PETS } from '../game/items';

const progress = useProgressStore();

type Phase = 'idle' | 'hatching' | 'revealed';
const phase = ref<Phase>('idle');
const result = ref<HatchResult | null>(null);

function canHatch(cost: number): boolean {
  return progress.coins >= cost && phase.value !== 'hatching';
}

const starColor = computed(() =>
  result.value ? PET_STAR_META[result.value.star].color : 'var(--line)',
);

/** pets the player has hatched, with their best star */
const hatched = computed(() =>
  PETS.filter((p) => progress.petStar(p.ref) > 0).map((p) => ({ pet: p, star: progress.petStar(p.ref) })),
);

function hatch(eggId: string): void {
  const egg = PET_EGGS.find((e) => e.id === eggId);
  if (!egg) return;
  if (progress.coins < egg.cost) {
    toastWarn(`金币不足，还差 ${egg.cost - progress.coins}`);
    return;
  }
  if (phase.value === 'hatching') return;
  const r = progress.hatch(eggId);
  if (!r) return;
  result.value = r;
  phase.value = 'hatching';
  window.setTimeout(() => {
    phase.value = 'revealed';
    const meta = PET_STAR_META[r.star];
    celebrate(starLevel(r.star), [meta.color, '#ffffff', '#ffd45c']);
  }, 760);
}
</script>

<template>
  <div class="pe">
    <div class="pe__top">
      <div class="pe__wallet">
        <span class="pe__coin">🪙</span>
        <span class="num pe__coin-num">{{ progress.coins }}</span>
        <span class="muted pe__coin-label">金币</span>
      </div>
      <span class="muted pe__hint">星级越高，宠物在场上越华丽</span>
    </div>

    <div class="pe__stage">
      <div class="pe__egg" :class="`is-${phase}`">
        <span class="pe__egg-shine" />
      </div>

      <div v-if="phase === 'revealed' && result" class="pe__card" :style="{ '--star': starColor }">
        <div class="pe__card-star">{{ result.star }}★</div>
        <div class="pe__card-label">{{ result.pet.label }}</div>
        <Stars class="pe__card-stars" :value="result.star" :animate="true" />
        <div v-if="result.upgraded" class="pe__card-up">
          升星！{{ result.prev }}★ → {{ result.star }}★
        </div>
        <div v-else-if="result.duplicate" class="muted pe__card-dup">
          已有 {{ result.prev }}★ · 返还 🪙{{ result.refund }}
        </div>
        <div v-else class="pe__card-new">新宠物！</div>
      </div>
    </div>

    <div class="pe__list">
      <div v-for="egg in PET_EGGS" :key="egg.id" class="pe__item">
        <div class="pe__item-main">
          <div class="pe__item-label">{{ egg.label }}</div>
          <div class="muted pe__item-blurb">{{ egg.blurb }}</div>
        </div>
        <Button
          size="sm"
          :variant="egg.id === 'radiant' ? 'primary' : 'default'"
          :disabled="!canHatch(egg.cost)"
          @click="hatch(egg.id)"
        >
          孵化 · {{ egg.cost }}
        </Button>
      </div>
    </div>

    <div v-if="hatched.length" class="pe__owned">
      <div class="muted pe__owned-title">已孵出 {{ hatched.length }} / {{ PETS.length }} 只</div>
      <div v-auto-animate="{ duration: 240 }" class="pe__owned-list">
        <span
          v-for="h in hatched"
          :key="h.pet.id"
          class="pe__chip"
          :style="{ '--c': PET_STAR_META[h.star].color }"
        >
          {{ h.pet.label }}<b>{{ h.star }}★</b>
        </span>
      </div>
    </div>

    <p class="muted pe__note">
      宠物蛋按星级概率孵化，星级独立于宠物种类。孵出同种更高星级会直接升星；不高于当前星级则返还金币。
    </p>
  </div>
</template>

<style scoped>
.pe {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

.pe__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--s3);
  flex-wrap: wrap;
}

.pe__wallet {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.pe__coin {
  font-size: 20px;
}

.pe__coin-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.pe__coin-label,
.pe__hint {
  font-size: 12px;
}

.pe__stage {
  position: relative;
  min-height: 210px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: radial-gradient(circle at 50% 42%, #f4ecff 0 40%, #e2d9f4 100%);
  overflow: hidden;
}

/* --- egg --- */
.pe__egg {
  position: relative;
  width: 92px;
  height: 116px;
  border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%;
  background: linear-gradient(160deg, #fffdf7 0 45%, #ffe6bd 100%);
  box-shadow: inset -8px -10px 18px rgba(180, 140, 90, 0.28), 0 8px 20px -8px rgba(120, 90, 60, 0.4);
  animation: egg-float 2.4s ease-in-out infinite;
}

.pe__egg-shine {
  position: absolute;
  left: 20px;
  top: 24px;
  width: 18px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  filter: blur(1px);
}

.pe__egg.is-hatching {
  animation: egg-shake 0.66s ease;
}

.pe__egg.is-revealed {
  animation: egg-burst 0.4s ease forwards;
}

/* --- reveal card --- */
.pe__card {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--s4) var(--s5);
  border-radius: var(--r-lg);
  border: 2px solid var(--star);
  background: var(--surface);
  box-shadow: 0 12px 30px -10px color-mix(in srgb, var(--star) 65%, transparent);
  animation: card-in 0.4s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.pe__card-star {
  font-size: 13px;
  font-weight: 700;
  color: var(--star);
}

.pe__card-label {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.pe__card-stars {
  font-size: 22px;
}

.pe__card-up {
  font-size: 12px;
  font-weight: 700;
  color: #e8a33d;
}

.pe__card-new {
  font-size: 12px;
  font-weight: 700;
  color: var(--accent);
}

.pe__card-dup {
  font-size: 12px;
}

/* --- egg list --- */
.pe__list {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.pe__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s3);
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--surface-2);
}

.pe__item-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}

.pe__item-blurb {
  font-size: 12px;
}

/* --- owned --- */
.pe__owned {
  border-top: 1px solid var(--line);
  padding-top: var(--s3);
}

.pe__owned-title {
  font-size: 12px;
  margin-bottom: var(--s2);
}

.pe__owned-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pe__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  border: 1px solid var(--c);
  background: color-mix(in srgb, var(--c) 14%, var(--surface-2));
  font-size: 12px;
  color: var(--text);
}

.pe__chip b {
  color: var(--c);
}

.pe__note {
  font-size: 12px;
  margin: 0;
}

@keyframes egg-float {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-6px) rotate(1deg);
  }
}

@keyframes egg-shake {
  0%,
  100% {
    transform: translateX(0) rotate(0);
  }
  15% {
    transform: translateX(-6px) rotate(-5deg);
  }
  30% {
    transform: translateX(6px) rotate(5deg);
  }
  45% {
    transform: translateX(-5px) rotate(-4deg);
  }
  60% {
    transform: translateX(5px) rotate(4deg);
  }
  80% {
    transform: translateX(-2px) rotate(-2deg);
  }
}

@keyframes egg-burst {
  to {
    transform: scale(1.35);
    opacity: 0;
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.9);
  }
}
</style>
