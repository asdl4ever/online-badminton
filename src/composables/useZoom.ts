import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { ZOOM_KEY, ZOOM_MAX, ZOOM_MIN, clampZoom } from '../game/zoom';

/**
 * **画面缩放（视距）**：一处定义、到处使用。
 *
 * 一份状态（记在本机 `bmt-world-zoom`）同时喂给：
 * - 大世界（`WorldView.vue`）与所有「可以走动的房子」——球场 / 商店 / 宠物店 / 健身房，
 *   它们都走 `composables/useWalk.ts`，镜头换算与缩放完全一致；
 * - **双指捏合**（本文件的 `createPinchZoom`）：DOM 界面里调视距的唯一入口
 *   （原来的右缘滑块 `ZoomControl.vue` 已下线）；
 * - Phaser 场景（健身房 / 操场这类「游戏内」）——见 `game/zoom.ts` 的 `applySceneZoom()`。
 *
 * 所以从大世界走进球场、再进健身房，视距是同一个值，人物大小不会突然变。
 */

// 上下限与 clamp 定义在 `game/zoom.ts`（Phaser 场景那边也用它，保持同一份）
export { ZOOM_MIN, ZOOM_MAX, clampZoom };

/** 全站共享的视距（1 = 原始大小） */
export const zoom = useLocalStorage(ZOOM_KEY, 1);

export function setZoom(v: number): void {
  zoom.value = clampZoom(v);
}

/** 显示用的实际视距（100% = 原始大小） */
export const zoomPct = computed(() => Math.round(clampZoom(zoom.value) * 100));
/** 滑块上的位置：0% = 最小视距，100% = 最大视距 */
export const zoomPos = computed(
  () => ((clampZoom(zoom.value) - ZOOM_MIN) / (ZOOM_MAX - ZOOM_MIN)) * 100,
);

export function useZoom(): {
  zoom: typeof zoom;
  zoomPct: typeof zoomPct;
  zoomPos: typeof zoomPos;
  clampZoom: typeof clampZoom;
  setZoom: typeof setZoom;
} {
  return { zoom, zoomPct, zoomPos, clampZoom, setZoom };
}

/**
 * **两指捏合进行中**：自由摇杆（半屏热区那种）据此让位——
 * 捏合时冒出来的应该是缩放，不该是一颗摇杆。
 */
export const pinchActive = ref(false);

/**
 * 默认不参与捏合的元素（固定摇杆 / 右下角按钮 / NPC 交互按钮）。
 *
 * 注意**故意不含 `.joy-zone`**（自由摇杆的半屏热区）：捏合要能从热区上起手，
 * 否则半屏都捏不动；摇杆那边靠 `pinchActive` 自己让位。
 */
const DEFAULT_IGNORE = '.joy, .world-enter, .npc-trade, .room__exit';

export interface PinchHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
}

export interface PinchOptions {
  /** 这些元素上按下的手指不参与捏合 */
  ignore?: string;
  /**
   * **两指分处舞台左右两半时不当作捏合**（大世界开这个）。
   *
   * 大世界左右各有一颗**自由摇杆**，两指同时按在两半上正是「一边走一边挥拍」；
   * 不加这一条会被当成捏合 → `pinchActive` 一响，两颗摇杆一起让位（走不了、也挥不了）。
   * 同一半里的两指仍然是捏合，所以缩放照旧能用。
   */
  splitHalves?: boolean;
}

/**
 * 双指捏合缩放：把手绑在舞台元素上（大世界与各房间共用同一份实现）。
 * 摇杆 / 右下角那些按钮上按下的手指不参与，免得走路时误触缩放。
 *
 * 允许只传一个字符串（= `ignore`），老调用点不用改。
 */
export function createPinchZoom(opts: PinchOptions | string = {}): PinchHandlers {
  const { ignore, splitHalves } =
    typeof opts === 'string' ? { ignore: opts, splitHalves: false } : opts;
  const ignoreSelector = ignore ?? DEFAULT_IGNORE;
  const pts = new Map<number, { x: number; y: number }>();
  let dist = 0;

  const spread = (): number => {
    const [a, b] = [...pts.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  /** 第二根手指是不是落在「与第一根相对的另一半」上（只在 `splitHalves` 时问） */
  function onOtherHalf(e: PointerEvent): boolean {
    if (!splitHalves || pts.size !== 1) return false;
    const stage = e.currentTarget as HTMLElement | null;
    const r = stage?.getBoundingClientRect();
    const first = [...pts.values()][0];
    if (!r || !r.width || !first) return false;
    const mid = r.left + r.width / 2;
    return first.x < mid !== e.clientX < mid;
  }

  return {
    onPointerDown(e) {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(ignoreSelector)) return;
      // 大世界：左右两半各按一根手指 = 两只摇杆一起用，不算捏合（不置 pinchActive、
      // 也不给 dist，所以后续 move 不会缩放）
      if (onOtherHalf(e)) {
        pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
        return;
      }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2) {
        dist = spread();
        pinchActive.value = true;
      }
    },
    onPointerMove(e) {
      const p = pts.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pts.size === 2 && dist > 0) {
        const d = spread();
        if (d > 0) setZoom(zoom.value * (d / dist));
        dist = d;
      }
    },
    onPointerUp(e) {
      pts.delete(e.pointerId);
      dist = 0;
      if (pts.size < 2) pinchActive.value = false;
    },
  };
}
