import { computed, ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import { ZOOM_KEY, ZOOM_MAX, ZOOM_MIN, clampZoom } from '../game/zoom';

/**
 * **画面缩放（视距）**：一处定义、到处使用。
 *
 * 一份状态（记在本机 `bmt-world-zoom`）同时喂给：
 * - 大世界（`WorldView.vue`）与所有「可以走动的房子」——球场 / 商店 / 宠物店 / 健身房，
 *   它们都走 `composables/useWalk.ts`，镜头换算与缩放完全一致；
 * - 右侧那根可拖动的滑块 `components/ui/ZoomControl.vue`（DOM 界面用）；
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
 * 默认不参与捏合的元素（固定摇杆 / 缩放条 / 右下角按钮 / NPC 交互按钮）。
 *
 * 注意**故意不含 `.joy-zone`**（自由摇杆的半屏热区）：捏合要能从热区上起手，
 * 否则半屏都捏不动；摇杆那边靠 `pinchActive` 自己让位。
 */
const DEFAULT_IGNORE = '.joy, .zoomer, .world-enter, .npc-trade, .room__exit';

export interface PinchHandlers {
  onPointerDown: (e: PointerEvent) => void;
  onPointerMove: (e: PointerEvent) => void;
  onPointerUp: (e: PointerEvent) => void;
}

/**
 * 双指捏合缩放：把手绑在舞台元素上（大世界与各房间共用同一份实现）。
 * 摇杆 / 缩放条 / 右下角那些按钮上按下的手指不参与，免得走路时误触缩放。
 */
export function createPinchZoom(ignoreSelector = DEFAULT_IGNORE): PinchHandlers {
  const pts = new Map<number, { x: number; y: number }>();
  let dist = 0;

  const spread = (): number => {
    const [a, b] = [...pts.values()];
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
  };

  return {
    onPointerDown(e) {
      const t = e.target as HTMLElement | null;
      if (t?.closest?.(ignoreSelector)) return;
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
