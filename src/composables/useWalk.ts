import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { sfx } from '../game/audio';
import { toastWarn } from './useToast';

/**
 * 室内小房间的走动逻辑（商店 / 宠物店这类「可以进出的房子」用）。
 *
 * 从大地图（WorldView）那套移动 + 镜头跟随抽出来的轻量版：摇杆 / WASD 走动，
 * 镜头跟着人走，走近某个物件（柜台 / 告示板）时高亮并提示按 E，按 E 或点物件
 * 触发 `onEnter`。角色绘制由调用方每帧做（`onFrame` 回调给出来）。
 */
export interface WalkObject {
  id: string;
  x: number;
  y: number;
}

const KEY_VECTORS: Record<string, [number, number]> = {
  arrowleft: [-1, 0],
  a: [-1, 0],
  arrowright: [1, 0],
  d: [1, 0],
  arrowup: [0, -1],
  w: [0, -1],
  arrowdown: [0, 1],
  s: [0, 1],
};

export function useWalk(opts: {
  stage: Ref<HTMLElement | null>;
  plane: Ref<HTMLElement | null>;
  /** 房间尺寸 */
  width: number;
  height: number;
  /** 可以交互的物件（走动中实时取，所以传函数） */
  objects: () => WalkObject[];
  /** 交互半径 */
  radius?: number;
  spawn?: { x: number; y: number };
  /** 走近按 E（或点物件）时触发 */
  onEnter: (id: string) => void;
  /** 每帧回调（画角色） */
  onFrame?: (now: number) => void;
}) {
  const radius = opts.radius ?? 130;
  const me = ref({ ...(opts.spawn ?? { x: opts.width / 2, y: opts.height - 160 }) });
  const joy = ref({ x: 0, y: 0 });
  const nearId = ref<string | null>(null);
  const held = new Set<string>();
  let raf = 0;
  let last = performance.now();

  function clamp(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.max(60, Math.min(opts.width - 60, x)),
      y: Math.max(120, Math.min(opts.height - 60, y)),
    };
  }

  function updateCamera(): void {
    const box = opts.stage.value?.getBoundingClientRect();
    const viewW = box?.width ?? 844;
    const viewH = box?.height ?? 390;
    const camX = Math.max(0, Math.min(opts.width - viewW, me.value.x - viewW / 2));
    const camY = Math.max(0, Math.min(opts.height - viewH, me.value.y - viewH / 2));
    if (opts.plane.value) {
      opts.plane.value.style.transform = `translate(${-camX}px, ${-camY}px)`;
    }
    let near: string | null = null;
    let best = Infinity;
    for (const o of opts.objects()) {
      const d = Math.hypot(o.x - me.value.x, o.y - me.value.y);
      if (d < radius && d < best) {
        best = d;
        near = o.id;
      }
    }
    nearId.value = near;
  }

  function loop(now: number): void {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    let vx = joy.value.x;
    let vy = joy.value.y;
    held.forEach((k) => {
      const v = KEY_VECTORS[k];
      if (v) {
        vx += v[0];
        vy += v[1];
      }
    });
    const len = Math.hypot(vx, vy);
    if (len > 0.06) {
      const k = Math.min(len, 1) / len;
      me.value = clamp(me.value.x + vx * k * 400 * dt, me.value.y + vy * k * 400 * dt);
    }
    updateCamera();
    opts.onFrame?.(now);
    raf = requestAnimationFrame(loop);
  }

  function onKeyDown(e: KeyboardEvent): void {
    const k = e.key.toLowerCase();
    if (KEY_VECTORS[k]) held.add(k);
    if (k === 'e' && nearId.value) opts.onEnter(nearId.value);
  }

  function onKeyUp(e: KeyboardEvent): void {
    held.delete(e.key.toLowerCase());
  }

  /** 点物件：够近才算（和地图上的区域点击一个手感）；太远给个提示（手机上没有悬停，点击是唯一入口） */
  function tryEnter(id: string): void {
    const o = opts.objects().find((w) => w.id === id);
    if (!o) return;
    if (Math.hypot(o.x - me.value.x, o.y - me.value.y) < radius) {
      sfx.click();
      opts.onEnter(id);
    } else {
      toastWarn('太远了，先走过去再点');
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    raf = requestAnimationFrame(loop);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  return { me, joy, nearId, tryEnter };
}
