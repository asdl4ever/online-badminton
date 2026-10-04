import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';
import { sfx } from '../game/audio';
import { toastWarn } from './useToast';
import { clampZoom, createPinchZoom, zoom } from './useZoom';

/**
 * 室内小房间的走动逻辑（球场 / 商店 / 宠物店 / 健身房这类「可以进出的房子」用）。
 *
 * 就是大地图（WorldView）那套走动的轻量版——**镜头与视距换算完全一致**：
 * 摇杆 / WASD 走动、镜头跟着人走、右缘那根公共缩放条（`useZoom`）+ 双指捏合，
 * 所以从大世界走进房间，人物大小与摇杆手感不会变。走近某个物件（场地 / 柜台）
 * 时高亮并提示按 E，按 E 或点物件触发 `onEnter`。角色绘制由调用方每帧做（`onFrame`）。
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
  /**
   * 镜头临时锁定：返回非空时**停止走动**，镜头框住返回的那一点（并用给定视距，
   * 不再跟人）。球馆里「走到空场地打一局 / 坐下看直播」用它把镜头拉到那块场地上。
   */
  focus?: () => { x: number; y: number; zoom: number } | null;
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

  /** 双指捏合：和大地图共用同一份实现 */
  const pinch = createPinchZoom();

  function updateCamera(): void {
    const rect = opts.stage.value?.getBoundingClientRect();
    const locked = opts.focus?.() ?? null;
    const z = clampZoom(locked ? locked.zoom : zoom.value);
    // 焦点：锁定在场地 / 人物身上（**永远钉在屏幕正中**，不夹房间边界——
    // 视比房间大时，房间里那一圈露的是房间底色，这是刻意的）
    const focusX = locked ? locked.x : me.value.x;
    const focusY = locked ? locked.y : me.value.y;
    // 画面正中按**屏幕上真正看得见的那块**算：页面万一被滚动了（手机地址栏、
    // 画布抢焦点…）也不会偏——元素坐标里的「视口中心」= (视口中心 - 元素左上角) / 缩放
    const vp = window.visualViewport;
    const vw = vp?.width ?? window.innerWidth;
    const vh = vp?.height ?? window.innerHeight;
    const camX = focusX - (vw / 2 - (rect?.left ?? 0)) / z;
    const camY = focusY - (vh / 2 - (rect?.top ?? 0)) / z;
    if (opts.plane.value) {
      // scale 在前、translate 在后：镜头位移是房间坐标，缩放让房间铺满屏幕
      opts.plane.value.style.transform = `scale(${z}) translate(${-camX}px, ${-camY}px)`;
    }
    if (locked) {
      // 锁着的时候没有「走近的可交互物」——场地上的退出按钮接管交互
      nearId.value = null;
      return;
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

    // 镜头被锁在场地里时（打一局 / 坐下看）不走动：摇杆与键盘都留给对局用
    if (!opts.focus?.()) {
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

  /** 双指捏合绑在舞台上（摇杆 / 缩放条 / 出门按钮上按下的手指不参与） */
  function bindPinch(): void {
    const el = opts.stage.value;
    if (!el) return;
    el.addEventListener('pointerdown', pinch.onPointerDown);
    el.addEventListener('pointermove', pinch.onPointerMove);
    el.addEventListener('pointerup', pinch.onPointerUp);
    el.addEventListener('pointercancel', pinch.onPointerUp);
  }
  function unbindPinch(): void {
    const el = opts.stage.value;
    if (!el) return;
    el.removeEventListener('pointerdown', pinch.onPointerDown);
    el.removeEventListener('pointermove', pinch.onPointerMove);
    el.removeEventListener('pointerup', pinch.onPointerUp);
    el.removeEventListener('pointercancel', pinch.onPointerUp);
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    bindPinch();
    raf = requestAnimationFrame(loop);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(raf);
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    unbindPinch();
  });

  return { me, joy, nearId, tryEnter };
}
