/**
 * Device capability checks that must stay free of heavy imports.
 *
 * This module is reached from App.vue, so it must never pull in Phaser — that
 * would drag the whole game engine into the first-load bundle.
 */
export function isTouchDevice(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('touch');
    if (q === '1') return true;
    if (q === '0') return false;
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** `?ice=relay` forces every connection through TURN. */
export function relayOnly(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('ice') === 'relay';
  } catch {
    return false;
  }
}

/** `?debug=1` shows the netcode telemetry overlay inside the canvas. */
export function debugOverlayEnabled(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}

// ---- 低配设备探测（帧率优化用） ---------------------------------------------

let lowSpecCache: boolean | null = null;

/**
 * 是否按「低配设备」降级。
 *
 * 目前只影响一件事：画布后备缓冲的像素倍率（`zoom.ts` 的 `canvasDpr()` 给它
 * 从 2 收到 1.5）。像素量与 GPU 负担成正比，这是低端安卓 / WebView 上最立竿见影
 * 的一档。判据刻意保守——**明确**报告 ≤4 核 或 ≤4GB 内存才降级，免得误伤中端机；
 * 网页与 App 都能用 URL 参数覆盖：`?perf=low` 强制降级、`?perf=high` 强制满血。
 *
 * 只读 `navigator`，零依赖（不能引 Vue / Phaser）。
 */
export function lowSpecDevice(): boolean {
  if (lowSpecCache != null) return lowSpecCache;
  let forced: string | null = null;
  try {
    forced = new URLSearchParams(window.location.search).get('perf');
  } catch {
    /* ignore */
  }
  if (forced === 'low') return (lowSpecCache = true);
  if (forced === 'high') return (lowSpecCache = false);
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency || 0;
  const mem = nav.deviceMemory ?? 0;
  lowSpecCache = (cores > 0 && cores <= 4) || (mem > 0 && mem <= 4);
  return lowSpecCache;
}

// ---- 摇杆常显开关 -----------------------------------------------------------

const JOY_ALWAYS_KEY = 'bmt-joystick-always';

/**
 * 「桌面端也显示虚拟摇杆」的全局开关（设置里改，存 localStorage）。
 * 触屏设备永远显示摇杆；桌面端默认不显示，打开这个开关后全游戏（大地图 /
 * 商店 / 宠物店 / 比赛 / 矿洞 / 农场 / 潜水）都常显摇杆。
 */
export function joystickAlwaysOn(): boolean {
  try {
    return window.localStorage.getItem(JOY_ALWAYS_KEY) === '1';
  } catch {
    return false;
  }
}

export function setJoystickAlwaysOn(on: boolean): void {
  try {
    window.localStorage.setItem(JOY_ALWAYS_KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
}

// ---- 摇杆形态与大小 ---------------------------------------------------------

const JOY_FREE_KEY = 'bmt-joystick-free';
const JOY_SCALE_KEY = 'bmt-joystick-scale';

/**
 * 「自由摇杆」开关：
 * - 关（默认）：摇杆固定显示在角落；
 * - 开：摇杆本体隐藏，在左侧区域（比赛里是左半屏）任意位置按下，摇杆就出现在
 *   按下点（整颗限制在屏幕内），松手消失。仅改变出现方式，**输入逻辑完全一致**。
 */
export function joystickFreeOn(): boolean {
  try {
    return window.localStorage.getItem(JOY_FREE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setJoystickFreeOn(on: boolean): void {
  try {
    window.localStorage.setItem(JOY_FREE_KEY, on ? '1' : '0');
  } catch {
    /* private mode */
  }
}

/** 摇杆大小缩放（0.7~1.5，默认 1）：对大地图与画布摇杆同时生效 */
export function joystickScale(): number {
  try {
    const v = Number(window.localStorage.getItem(JOY_SCALE_KEY));
    if (Number.isFinite(v) && v >= 0.7 && v <= 1.5) return v;
  } catch {
    /* ignore */
  }
  return 1;
}

export function setJoystickScale(s: number): void {
  const v = Math.min(1.5, Math.max(0.7, s));
  try {
    window.localStorage.setItem(JOY_SCALE_KEY, String(v));
  } catch {
    /* private mode */
  }
}
