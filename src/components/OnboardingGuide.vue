<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { isTouchDevice } from '../game/device';
import { zoom } from '../composables/useZoom';
import { onboardingDone, onboardingForced } from '../composables/useOnboarding';
import { useProgressStore } from '../stores/progress';
import { toastGood } from '../composables/useToast';
import { sfx } from '../game/audio';
import { WORLD_ZONES, ZONE_RADIUS, type WorldZone } from '../game/world/zones';

/**
 * 新手引导（三步 coach-mark，可跳过）：只在大世界挂一次，不锁界面——
 * 玩家可以边被引导边真的去走 / 去进圈。规则依据（ui-ux-pro-max）：
 * 教程必须可跳过、别用锁屏 tour；触控按钮 ≥44px；不拦手势。
 *
 * - 第 1 步：真的走一段路（累计 140px）自动进下一步；
 * - 第 2 步：真的走进任意区域圈（`getNear()` 非空）自动进下一步；
 * - 第 3 步：点「开始游戏」收尾，发小额奖励。
 *
 * 位置数据用**函数 prop** 传（而不是响应式对象）：大世界的 `me` 每帧都在变，
 * 组件自己跑 rAF 读值 + 直写 style，避免整页每帧重渲染。
 */
const props = defineProps<{
  getMe: () => { x: number; y: number };
  getNear: () => WorldZone | null;
  getStage: () => HTMLElement | null;
  /** 左摇杆是否显示（桌面没常显摇杆时，第一步的说法换成 WASD） */
  showJoy: boolean;
}>();

const progress = useProgressStore();
const touch = isTouchDevice();

const FINISH_COINS = 300;
const FINISH_KEYS = 1;
/** 第 1 步要真的走这么多像素才算过 */
const MOVE_NEED = 140;

const step = ref(0);
const STEPS = [
  {
    icon: '🕹️',
    title: '先走两步',
    text: touch
      ? '按住左下角拖动摇杆，在营地里随便走一走。'
      : props.showJoy
        ? '拖动左下角的摇杆（或按 WASD）走两步。'
        : '按 WASD 走两步。',
  },
  {
    icon: '🏸',
    title: '走进圈里进玩法',
    text: '地图上每个发光圈都是一个玩法：走进去，右下角会亮出「进入」按钮。',
  },
  {
    icon: '🎒',
    title: '功能都收在右上角',
    text: '背包 / 招式 / 设置都在右上角这排；点「更多」可以收起或展开。',
  },
];

/** 高亮圈：每帧直写 style（左 / 上 / 宽 / 高 / 圆角） */
const ring = ref<HTMLElement | null>(null);
let moved = 0;
let last = { x: 0, y: 0 };

function advance(): void {
  if (step.value < STEPS.length - 1) {
    step.value += 1;
    sfx.click();
  } else {
    finish();
  }
}

function finish(): void {
  onboardingDone.value = true;
  onboardingForced.value = false;
  progress.gainCoins(FINISH_COINS, { bonus: false });
  progress.grantKeys(FINISH_KEYS);
  sfx.win();
  toastGood(`新手引导完成：🪙${FINISH_COINS} + 🔑${FINISH_KEYS}`);
}

function skip(): void {
  onboardingDone.value = true;
  onboardingForced.value = false;
  sfx.click();
}

/** 这一帧高亮圈该罩住哪：左摇杆 / 最近的区域圈 / 右上角图标行 */
function placeRing(): void {
  const el = ring.value;
  const stage = props.getStage();
  if (!el || !stage) return;
  const r = stage.getBoundingClientRect();
  if (!r.width) return;
  const z = Math.min(1.4, Math.max(0.55, zoom.value));
  let x = 0;
  let y = 0;
  let rad = 70;
  let rect: { x: number; y: number; w: number; h: number } | null = null;

  if (step.value === 0) {
    // 固定摇杆：圈它本体；自由摇杆没本体，圈左下那块热区
    const joys = [...stage.querySelectorAll<HTMLElement>('.joy')].sort(
      (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
    );
    const joyEl = joys[0];
    if (joyEl) {
      const jr = joyEl.getBoundingClientRect();
      x = jr.left + jr.width / 2 - r.left;
      y = jr.top + jr.height / 2 - r.top;
      rad = jr.width / 2 + 14;
    } else {
      x = r.width * 0.2;
      y = r.height - 110;
      rad = 96;
    }
  } else if (step.value === 1) {
    // 最近的区域圈（屏幕坐标 = 舞台中心 + 世界偏移 × 视距），贴边时夹回屏内
    const me = props.getMe();
    let best: WorldZone | null = null;
    let bd = Infinity;
    for (const zn of WORLD_ZONES) {
      const d = Math.hypot(zn.x - me.x, zn.y - me.y);
      if (d < bd) {
        bd = d;
        best = zn;
      }
    }
    if (best) {
      x = r.width / 2 + (best.x - me.x) * z;
      y = r.height / 2 + (best.y - me.y) * z;
      rad = Math.max(58, ZONE_RADIUS * z + 10);
      x = Math.min(Math.max(x, rad + 6), r.width - rad - 6);
      y = Math.min(Math.max(y, rad + 6), r.height - rad - 6);
    }
  } else {
    // 右上角那排图标：矩形高亮
    const icons = document.querySelector<HTMLElement>('.hud-icons');
    if (icons) {
      const ir = icons.getBoundingClientRect();
      rect = { x: ir.left - r.left - 10, y: ir.top - r.top - 8, w: ir.width + 20, h: ir.height + 16 };
    }
  }

  if (rect) {
    el.style.left = `${rect.x}px`;
    el.style.top = `${rect.y}px`;
    el.style.width = `${rect.w}px`;
    el.style.height = `${rect.h}px`;
    el.style.borderRadius = '16px';
  } else {
    el.style.left = `${x - rad}px`;
    el.style.top = `${y - rad}px`;
    el.style.width = `${rad * 2}px`;
    el.style.height = `${rad * 2}px`;
    el.style.borderRadius = '50%';
  }
}

let raf = 0;
function loop(): void {
  const me = props.getMe();
  const d = Math.hypot(me.x - last.x, me.y - last.y);
  // 单帧位移过大 = 传送 / 被推飞，不算「自己走了两步」
  if (step.value === 0 && d > 0 && d < 80) moved += d;
  last = { x: me.x, y: me.y };

  if (step.value === 0 && moved >= MOVE_NEED) advance();
  else if (step.value === 1 && props.getNear()) advance();
  placeRing();
  raf = requestAnimationFrame(loop);
}

onMounted(() => {
  last = { ...props.getMe() };
  raf = requestAnimationFrame(loop);
});
onBeforeUnmount(() => cancelAnimationFrame(raf));
</script>

<template>
  <div class="onboard" :class="`is-step-${step}`" role="dialog" aria-label="新手引导">
    <!-- 高亮圈：不吃指针，玩家该走走该点点 -->
    <div ref="ring" class="onboard__ring" aria-hidden="true" />

    <div class="onboard__card">
      <div class="onboard__head">
        <span class="onboard__icon" aria-hidden="true">{{ STEPS[step].icon }}</span>
        <b class="onboard__title">{{ STEPS[step].title }}</b>
        <span class="onboard__count num">{{ step + 1 }} / {{ STEPS.length }}</span>
      </div>
      <p class="onboard__text">{{ STEPS[step].text }}</p>
      <div class="onboard__btns">
        <button type="button" class="onboard__skip" @click="skip">跳过</button>
        <button type="button" class="onboard__next" @click="advance">
          {{
            step === STEPS.length - 1
              ? `开始游戏 · 领 🪙${FINISH_COINS} + 🔑${FINISH_KEYS}`
              : '下一步'
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 覆盖层本身不吃指针（不锁界面）；只有卡片上的按钮可点 */
.onboard {
  position: absolute;
  inset: 0;
  z-index: 44;
  pointer-events: none;
}

.onboard__ring {
  position: absolute;
  border: 3px solid var(--accent, #f0a020);
  box-shadow:
    0 0 0 6px color-mix(in srgb, var(--accent, #f0a020) 22%, transparent),
    0 0 22px color-mix(in srgb, var(--accent, #f0a020) 55%, transparent);
  transition:
    left 0.16s ease,
    top 0.16s ease,
    width 0.16s ease,
    height 0.16s ease;
  animation: onboard-pulse 1.4s ease-in-out infinite;
}

@keyframes onboard-pulse {
  0%,
  100% {
    opacity: 0.95;
  }
  50% {
    opacity: 0.55;
  }
}

.onboard__card {
  position: absolute;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(400px, calc(100vw - 32px));
  padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px));
  border-radius: var(--r-lg, 16px);
  border: 1px solid var(--line, #ddd);
  background: color-mix(in srgb, var(--surface, #fff) 94%, transparent);
  backdrop-filter: blur(8px);
  box-shadow: var(--e2, 0 2px 8px rgba(0, 0, 0, 0.18));
  animation: onboard-in 0.22s ease;
}

@keyframes onboard-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 第 1、2 步：顶部居中（目标在左下摇杆 / 地图里，卡片别压住它们） */
.onboard.is-step-0 .onboard__card,
.onboard.is-step-1 .onboard__card {
  top: calc(56px + env(safe-area-inset-top, 0px));
  left: 50%;
  transform: translateX(-50%);
}

/* 第 3 步：目标在右上角，卡片挂到图标行下面 */
.onboard.is-step-2 .onboard__card {
  top: calc(96px + env(safe-area-inset-top, 0px));
  right: calc(12px + env(safe-area-inset-right, 0px));
}

.onboard__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.onboard__icon {
  font-size: 18px;
}

.onboard__title {
  flex: 1 1 auto;
  font-size: 14px;
  color: var(--text, #222);
}

.onboard__count {
  flex: none;
  font-size: 11px;
  color: var(--text-dim, #888);
}

.onboard__text {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text, #222);
}

.onboard__btns {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 触控目标 ≥44px、禁用双击缩放延迟（ui-ux-pro-max 的 Touch 规则） */
.onboard__skip,
.onboard__next {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
}

.onboard__skip {
  border: 1px solid var(--line, #ddd);
  background: transparent;
  color: var(--text-dim, #888);
}

.onboard__next {
  border: 1px solid transparent;
  background: var(--accent, #f0a020);
  color: #fff;
}

.onboard__next:active,
.onboard__skip:active {
  transform: scale(0.97);
}
</style>
