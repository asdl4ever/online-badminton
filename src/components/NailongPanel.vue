<script setup lang="ts">
import { computed, ref } from 'vue';
import Button from './ui/Button.vue';
import CharacterPreview from './CharacterPreview.vue';
import { DEFAULT_COSMETIC } from '../game/cosmetics';
import { NAILONG_DAILY_MAX, WHEEL_PRIZES } from '../game/nailong';
import { sfx } from '../game/audio';
import { toastGood, toastWarn } from '../composables/useToast';
import { useProgressStore } from '../stores/progress';

/**
 * 小黄龙联动面板（挂在小黄龙联名页 `/nailong` 里）：
 * 左边是小黄龙本人和挑战入口，右边是抽奖转盘。
 * 每天 3 张挑战门票（开一场扣一张，输赢都扣），打赢 → +1 张券，券拿去转盘抽限定周边与资源。
 */
const emit = defineEmits<{ challenge: [] }>();
const progress = useProgressStore();

/** 小黄龙长什么样（联动形象） */
const nailongCosmetic = { ...DEFAULT_COSMETIC, characterSkin: 'nailong' as const };

const spinning = ref(false);
const rotation = ref(0);
const result = ref('');

/** 每格占的角度 */
const seg = computed(() => 360 / WHEEL_PRIZES.length);

function spin(): void {
  if (spinning.value) return;
  const r = progress.spinNailongWheel();
  if (!r.ok) {
    sfx.click();
    toastWarn(r.message);
    return;
  }
  sfx.click();
  spinning.value = true;
  result.value = '';
  // 多转 5 圈，再让中奖格正对顶部的指针
  const base = rotation.value - (rotation.value % 360);
  rotation.value = base + 360 * 5 - (r.index * seg.value + seg.value / 2);
  window.setTimeout(() => {
    spinning.value = false;
    result.value = r.message;
    if (r.message.includes('限定')) {
      sfx.win();
      toastGood(r.message + '（去背包装备）');
    } else {
      sfx.point();
      toastGood(r.message);
    }
  }, 4200);
}
</script>

<template>
  <div class="nl">
    <!-- 小黄龙 + 挑战入口 -->
    <div class="nl__head">
      <div class="nl__avatar">
        <CharacterPreview :cosmetic="nailongCosmetic" />
      </div>
      <div class="nl__intro">
        <div class="nl__title">🐲 小黄龙联名</div>
        <p class="muted nl__desc">
          每天有 {{ NAILONG_DAILY_MAX }} 张「挑战门票」，开一场就扣一张（输赢都扣）；
          <b>赢下这一场</b>才给 1 张「转盘抽奖券」，券可以转下面的盘，抽联名周边和金币 / 荣誉点。
        </p>
        <p class="muted nl__desc nl__desc--fun">
          ⚔️ 打的是<b>趣味模式</b>：先到 5 分，球是个大奶团慢慢飘，
          小黄龙一身果冻、会把球软软地弹回来。
        </p>
        <div class="nl__stats">
          <span class="nl__chip">🎟 抽奖券 <b class="num">{{ progress.nailongTickets }}</b></span>
          <span class="nl__chip">
            今日门票 <b class="num">{{ progress.nailongLeftToday }}</b>/{{ NAILONG_DAILY_MAX }}
          </span>
        </div>
        <Button
          variant="primary"
          block
          :disabled="progress.nailongLeftToday <= 0"
          @click="emit('challenge')"
        >
          {{ progress.nailongLeftToday > 0 ? '⚔️ 挑战小黄龙' : '今日门票已用完，明天再来' }}
        </Button>
      </div>
    </div>

    <!-- 转盘 -->
    <div class="nl__wheel-wrap">
      <div class="nl__pointer">▼</div>
      <div
        class="nl__wheel"
        :style="{
          transform: `rotate(${rotation}deg)`,
          transitionDuration: spinning ? '4s' : '0s',
        }"
      >
        <div
          v-for="(p, i) in WHEEL_PRIZES"
          :key="p.id"
          class="nl__seg"
          :style="{ transform: `rotate(${i * seg}deg)` }"
        >
          <span class="nl__seg-icon">{{ p.icon }}</span>
          <span class="nl__seg-label">{{ p.label }}</span>
        </div>
      </div>
      <div class="nl__hub">🐲</div>
    </div>

    <Button
      variant="primary"
      block
      :disabled="spinning || progress.nailongTickets <= 0"
      @click="spin"
    >
      {{ spinning ? '转动中…' : `转一次（🎟 ${progress.nailongTickets}）` }}
    </Button>

    <p v-if="result" class="nl__result">{{ result }}</p>
    <p v-else-if="progress.nailongTickets <= 0" class="muted nl__hint">
      没有抽奖券了 —— 先打赢小黄龙攒一张。
    </p>
  </div>
</template>

<style scoped>
.nl__head {
  display: flex;
  gap: var(--s3);
  align-items: flex-start;
  padding: var(--s3);
  border-radius: var(--r-md);
  border: 1px solid color-mix(in srgb, #ffd93d 55%, var(--line));
  background: linear-gradient(120deg, color-mix(in srgb, #ffd93d 16%, var(--surface-2)), var(--surface-2));
}

.nl__avatar {
  flex: none;
  width: 92px;
  height: 116px;
}

.nl__intro {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--s2);
}

.nl__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.nl__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.nl__stats {
  display: flex;
  gap: var(--s2);
  flex-wrap: wrap;
}

.nl__desc--fun {
  padding: 6px 10px;
  border-radius: var(--r-md);
  background: color-mix(in srgb, #7fd4ff 16%, transparent);
}

.nl__chip {
  padding: 2px 10px;
  border-radius: var(--r-pill);
  background: color-mix(in srgb, #ffd93d 22%, var(--surface));
  font-size: 12px;
  color: var(--text);
}

/* --- 转盘 --- */
.nl__wheel-wrap {
  position: relative;
  width: 262px;
  height: 262px;
  margin: var(--s4) auto var(--s3);
}

.nl__pointer {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  font-size: 24px;
  line-height: 1;
  color: #d42a3a;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nl__wheel {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 6px solid #e8a33d;
  box-shadow: 0 8px 20px -8px rgba(90, 60, 0, 0.5);
  background: conic-gradient(
    #ffd93d 0deg 45deg,
    #fff3bd 45deg 90deg,
    #ffd93d 90deg 135deg,
    #fff3bd 135deg 180deg,
    #ffd93d 180deg 225deg,
    #fff3bd 225deg 270deg,
    #ffd93d 270deg 315deg,
    #fff3bd 315deg 360deg
  );
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.12, 0.72, 0.16, 1);
}

.nl__seg {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 14px;
  transform-origin: 50% 50%;
  pointer-events: none;
}

.nl__seg-icon {
  font-size: 20px;
  line-height: 1;
}

.nl__seg-label {
  width: 62px;
  margin-top: 2px;
  font-size: 9px;
  line-height: 1.15;
  text-align: center;
  color: #5a4200;
  font-weight: 700;
}

.nl__hub {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 28px;
  pointer-events: none;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}

.nl__result {
  margin: var(--s2) 0 0;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #e8a33d;
}

.nl__hint {
  margin: var(--s2) 0 0;
  text-align: center;
  font-size: 12px;
}
</style>
