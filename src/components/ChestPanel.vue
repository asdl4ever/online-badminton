<script setup lang="ts">
import { computed, ref } from 'vue';
import Stars from './ui/Stars.vue';
import Button from './ui/Button.vue';
import { celebrate, RARITY_LEVEL } from '../composables/celebrate';
import { toastWarn } from '../composables/useToast';
import { useProgressStore, type PullResult } from '../stores/progress';
import {
  CHEST_COST,
  COIN_DROP_CHANCE,
  PITY_LIMIT,
  RARITY_META,
  SLOT_LABELS,
  TEN_PULL_COST,
} from '../game/items';

const progress = useProgressStore();

type Phase = 'idle' | 'opening' | 'revealed';
const phase = ref<Phase>('idle');
const mode = ref<'single' | 'ten'>('single');
const result = ref<PullResult | null>(null);
const results = ref<PullResult[]>([]);

const canSingle = computed(() => progress.coins >= CHEST_COST && phase.value !== 'opening');
const canTen = computed(() => progress.coins >= TEN_PULL_COST && phase.value !== 'opening');
const canFreeTen = computed(() => progress.tenTickets > 0 && phase.value !== 'opening');

const rarityColor = computed(() => {
  if (mode.value === 'ten' || !result.value || result.value.kind !== 'item') return 'var(--line)';
  return RARITY_META[result.value.item.rarity].color;
});

function cellColor(r: PullResult): string {
  return r.kind === 'item' ? RARITY_META[r.item.rarity].color : '#e8a33d';
}

/** everything this pull produced, single or ten */
function pulled(): PullResult[] {
  if (mode.value === 'ten') return results.value;
  return result.value ? [result.value] : [];
}

/** the most exciting item decides how loud the confetti is */
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

function openSingle(): void {
  if (!canSingle.value) {
    toastWarn(`金币不足，还差 ${CHEST_COST - progress.coins}`);
    return;
  }
  const r = progress.pull();
  if (!r) return;
  mode.value = 'single';
  result.value = r;
  results.value = [];
  reveal();
}

function openTen(useTicket: boolean): void {
  if (!useTicket && !canTen.value) {
    toastWarn(`金币不足，还差 ${TEN_PULL_COST - progress.coins}`);
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
</script>

<template>
  <div class="cp">
    <div class="cp__top">
      <div class="cp__wallet">
        <span class="cp__coin">🪙</span>
        <span class="num cp__coin-num">{{ progress.coins }}</span>
        <span class="muted cp__coin-label">金币</span>
      </div>
      <span class="muted cp__pity">
        再抽 {{ PITY_LIMIT - progress.pity }} 次必出史诗+（{{ progress.pity }}/{{ PITY_LIMIT }}）
      </span>
    </div>

    <div class="cp__stage" :class="{ 'is-grid': phase === 'revealed' && mode === 'ten' }">
      <div v-show="!(phase === 'revealed' && mode === 'ten')" class="cp__chest" :class="`is-${phase}`">
        <div class="cp__halo" />
        <div class="cp__box">
          <div class="cp__lid" />
          <div class="cp__body">
            <span class="cp__lock">🔒</span>
          </div>
        </div>
      </div>

      <div v-if="phase === 'revealed' && mode === 'single' && result" class="cp__card" :style="{ '--rarity': rarityColor }">
        <template v-if="result.kind === 'item'">
          <div class="cp__card-rarity">{{ RARITY_META[result.item.rarity].label }}</div>
          <div class="cp__card-label">{{ result.item.label }}</div>
          <Stars class="cp__card-stars" :value="result.item.stars" :animate="true" />
          <div class="muted cp__card-slot">{{ SLOT_LABELS[result.item.slot] }}</div>
          <div v-if="result.duplicate" class="muted cp__card-dup">重复 · 返还 🪙{{ result.refund }}</div>
        </template>
        <template v-else>
          <div class="cp__card-label">金币袋</div>
          <div class="cp__card-gold num">🪙 +{{ result.amount }}</div>
        </template>
      </div>

      <div v-if="phase === 'revealed' && mode === 'ten'" class="cp__grid">
        <div
          v-for="(r, i) in results"
          :key="i"
          class="cp__cell"
          :style="{ '--rarity': cellColor(r), animationDelay: `${i * 0.06}s` }"
        >
          <template v-if="r.kind === 'item'">
            <span class="cp__cell-label">{{ r.item.label }}</span>
            <Stars class="cp__cell-stars" :value="r.item.stars" />
            <span class="cp__cell-slot">{{ SLOT_LABELS[r.item.slot] }}</span>
          </template>
          <template v-else>
            <span class="cp__cell-gold">🪙</span>
            <span class="cp__cell-label">+{{ r.amount }}</span>
          </template>
        </div>
      </div>
    </div>

    <div class="cp__actions">
      <Button variant="primary" block :disabled="!canSingle" @click="openSingle">
        {{ phase === 'idle' || mode === 'ten' ? `开启宝箱 · ${CHEST_COST}` : phase === 'revealed' ? `再开一次 · ${CHEST_COST}` : '开启中…' }}
      </Button>
      <Button block :disabled="!canTen" @click="openTen(false)">十连抽 · {{ TEN_PULL_COST }}</Button>
      <Button v-if="progress.tenTickets > 0" variant="primary" block :disabled="!canFreeTen" @click="openTen(true)">
        免费十连（新手礼）×{{ progress.tenTickets }}
      </Button>
    </div>

    <p class="muted cp__note">
      宝箱有 {{ Math.round(COIN_DROP_CHANCE * 100) }}% 概率开出金币袋。十连抽九折，且保底至少一件史诗+。重复物品按稀有度返还金币。
    </p>
  </div>
</template>

<style scoped>
.cp {
  display: flex;
  flex-direction: column;
  gap: var(--s4);
}

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

.cp__coin {
  font-size: 20px;
}

.cp__coin-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.cp__coin-label,
.cp__pity {
  font-size: 12px;
}

.cp__stage {
  position: relative;
  min-height: 230px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background: radial-gradient(circle at 50% 42%, #eaf2fb 0 40%, #dbe6f4 100%);
  overflow: hidden;
}

.cp__stage.is-grid {
  min-height: 0;
  padding: var(--s3);
  background: var(--surface-2);
}

/* --- chest --- */
.cp__chest {
  position: relative;
  width: 132px;
  height: 118px;
  animation: chest-float 2.4s ease-in-out infinite;
}

.cp__box {
  position: absolute;
  inset: 0;
}

.cp__body {
  position: absolute;
  left: 6px;
  right: 6px;
  bottom: 0;
  height: 74px;
  border-radius: 6px 6px 12px 12px;
  background: linear-gradient(180deg, #a9702f, #7d4f1d);
  box-shadow: inset 0 -8px 0 rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cp__lid {
  position: absolute;
  left: 0;
  right: 0;
  top: 18px;
  height: 34px;
  border-radius: 12px 12px 4px 4px;
  background: linear-gradient(180deg, #c88a3f, #9a6526);
  transform-origin: 50% 100%;
  transition: transform 0.45s cubic-bezier(0.3, 1.4, 0.5, 1), opacity 0.45s;
  z-index: 2;
}

.cp__lock {
  font-size: 22px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.4));
}

.cp__halo {
  position: absolute;
  left: 50%;
  top: 46%;
  width: 120px;
  height: 120px;
  transform: translate(-50%, -50%) scale(0.5);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 220, 130, 0.9), transparent 65%);
  opacity: 0;
  transition: transform 0.6s ease, opacity 0.6s ease;
  pointer-events: none;
}

.cp__chest.is-opening {
  animation: chest-shake 0.6s ease;
}

.cp__chest.is-revealed {
  animation: none;
}

.cp__chest.is-revealed .cp__lid {
  transform: translateY(-22px) rotate(-24deg);
  opacity: 0.9;
}

.cp__chest.is-revealed .cp__halo {
  transform: translate(-50%, -50%) scale(2.4);
  opacity: 0;
}

/* --- reward card --- */
.cp__card {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--s4) var(--s5);
  border-radius: var(--r-lg);
  border: 2px solid var(--rarity);
  background: var(--surface);
  box-shadow: 0 12px 30px -10px color-mix(in srgb, var(--rarity) 65%, transparent);
  animation: card-in 0.4s cubic-bezier(0.2, 1.3, 0.4, 1) both;
}

.cp__card-rarity {
  font-size: 12px;
  color: var(--rarity);
}

.cp__card-label {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
}

.cp__card-stars {
  font-size: 22px;
}

.cp__card-slot {
  font-size: 12px;
}

.cp__card-gold {
  font-size: 26px;
  font-weight: 700;
  color: #b8860b;
}

/* --- ten-pull grid --- */
.cp__grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--s2);
  width: 100%;
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
  box-shadow: 0 4px 12px -6px color-mix(in srgb, var(--rarity) 70%, transparent);
  animation: cell-in 0.36s cubic-bezier(0.2, 1.3, 0.4, 1) both;
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

.cp__cell-gold {
  font-size: 18px;
}

.cp__actions {
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.cp__note {
  font-size: 12px;
  margin: 0;
}

@keyframes chest-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes chest-shake {
  0%,
  100% {
    transform: translateX(0) rotate(0);
  }
  15% {
    transform: translateX(-6px) rotate(-3deg);
  }
  30% {
    transform: translateX(6px) rotate(3deg);
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
