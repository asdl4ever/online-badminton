import Phaser from 'phaser';
import { VIEW_H, VIEW_W } from './constants';
import { lowSpecDevice } from './device';

/**
 * 画面缩放（视距）+ **画布铺满**——游戏内那一半。
 *
 * DOM 界面（大世界与各房间）的响应式版本在 `composables/useZoom.ts`，
 * 两端共用同一个存储键与本文件里的上下限；Phaser 场景用 `applySceneZoom()`
 * 读同一个值套到主相机上，于是「在游戏里也能调视距」，而且和大地图是同一个数。
 *
 * **铺满策略（2026-10 重构）**：所有 Phaser 页面改用 `Phaser.Scale.RESIZE`
 * （画布 = 容器尺寸、1:1 像素），相机再按 `fitZoom()` 等比放大到铺满——
 * 画面比 16:9 更宽/更高时，多出来的一圈**留给背景**（场景背景要按
 * `SCENE_BG_PAD` 多画一圈），所以既不留黑边、也不做任何非等比拉伸，
 * 人物不会被压扁。
 *
 * 注意：这里不引 Vue（`game/` 保持纯 Canvas），所以直接从 localStorage 读。
 * 写入由 `useZoom`（vueuse 的 `useLocalStorage`）负责，数字类型的序列化就是
 * 普通数字字符串，这里 `Number()` 一下即可。
 */
export const ZOOM_KEY = 'bmt-world-zoom';
export const ZOOM_MIN = 0.55;
export const ZOOM_MAX = 1.4;

export function clampZoom(v: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, v));
}

/** 本机当前的视距（读不到 / 坏了就按 1 处理） */
export function readZoom(): number {
  try {
    const raw = window.localStorage.getItem(ZOOM_KEY);
    const v = raw == null ? 1 : Number(raw);
    return Number.isFinite(v) ? clampZoom(v) : 1;
  } catch {
    return 1;
  }
}

/**
 * 场景背景要多画出去的余量（px）：拉到最小视距（0.55）时，
 * 可见范围比 1280×720 的画布大一圈；手机横屏比 16:9 更宽时也会多露出一条，
 * 背景画够这么大才不会露白边 / 黑边。
 */
export const SCENE_BG_PAD = 640;

/** 「等比铺满」的缩放：设计画面 1280×720 等比放大到铺满当前画布 */
export function fitZoom(scene: Phaser.Scene): number {
  const cam = scene.cameras.main;
  return Math.min(cam.width / VIEW_W, cam.height / VIEW_H);
}

/** 相机最终缩放 = 铺满系数 × 本机视距（两者都不改变画面比例，只放大缩小） */
export function sceneZoom(scene: Phaser.Scene): number {
  return fitZoom(scene) * readZoom();
}

/**
 * 画布最多按几倍设备像素比渲染。
 * 手机上 DPR 常见 2.5~3，全开会让 GPU 负担和像素量成正比地涨，
 * 所以封顶 2——清晰度提升已经很明显，代价可控。
 */
export const MAX_CANVAS_DPR = 2;

/**
 * 低配设备上的像素倍率上限：像素量与 GPU 负担成正比，从 2 收到 1.5 相当于
 * 少画 **约 44%** 的像素（4.0 → 2.25 倍），是低端安卓 / WebView 上最划算的一档
 * （判据见 `device.ts` 的 `lowSpecDevice()`；`?perf=high` 可手动拉满）。
 */
export const LOW_SPEC_CANVAS_DPR = 1.5;

/** 本机画布该用的像素倍率（≥1，封顶 `MAX_CANVAS_DPR`；低配设备收到 1.5） */
export function canvasDpr(): number {
  const d = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const cap = lowSpecDevice() ? LOW_SPEC_CANVAS_DPR : MAX_CANVAS_DPR;
  return Math.max(1, Math.min(cap, d));
}

/**
 * 所有 Phaser 页面共用的渲染器片段：
 * - `powerPreference: 'high-performance'`：尽量让浏览器选独显 / 高性能 GPU
 *   （桌面双显卡笔记本上能明显少掉帧，移动端多数忽略，无副作用）。
 *
 * 用法：`new Phaser.Game({ ..., ...renderConfig() })`。
 */
export function renderConfig(): Phaser.Types.Core.RenderConfig {
  return {
    powerPreference: 'high-performance',
    // 低配设备**关抗锯齿**：少一层 MSAA 缓冲，WebGL 上下文 / 管线的初始化更快
    //（诊断面板上「新建一个实例」那种几百毫秒到两秒的长任务主要就在这儿），每帧也更省。
    // 代价是边缘略糙——只对低配设备生效，普通设备观感不变（判据见 `device.ts`）。
    ...(lowSpecDevice() ? { antialias: false } : {}),
  };
}

/**
 * 所有 Phaser 页面共用的画布配置。
 *
 * ⚠️ 这里用 `NONE` 而**不是** `RESIZE`：`RESIZE` 会把画布的**后备缓冲**开成
 * **CSS 像素**（`canvas.width = 容器宽`），DPR=3 的手机上等于被浏览器放大三倍
 * 显示 —— 这就是「手机画质糊」的根因。改成自己管尺寸（见 `bindCanvasSize`），
 * 后备缓冲 = CSS 尺寸 × DPR、CSS 尺寸不变，于是高分屏上是原生分辨率渲染。
 */
export function sceneScaleConfig(): Phaser.Types.Core.ScaleConfig {
  return { mode: Phaser.Scale.NONE, autoCenter: Phaser.Scale.NO_CENTER };
}

/**
 * 按「CSS 尺寸 × 设备像素比」设置画布后备缓冲，并跟随窗口 / 容器尺寸变化重做。
 *
 * 所有 `new Phaser.Game(...)` 之后都要调一次（`host` 传画布容器）。
 * `game.scale.resize()` 会同时更新后备缓冲、渲染器视口，并派发 `RESIZE`
 * 事件（各场景的 `onSceneResize` 靠它重新铺满），所以相机与 HUD 都跟得上。
 * 组件销毁时（`Game.destroy`）自动解绑，不用调用方操心。
 */
export function bindCanvasSize(game: Phaser.Game, host: HTMLElement | null): void {
  const dpr = canvasDpr();
  let resize = (): void => {};

  function bind(): void {
    const canvas = game.canvas;
    if (!canvas) return;

    resize = (): void => {
      const el = host ?? canvas.parentElement;
      const w = Math.round(el?.clientWidth || window.innerWidth || 0);
      const h = Math.round(el?.clientHeight || window.innerHeight || 0);
      if (w < 1 || h < 1) return;
      const pw = Math.round(w * dpr);
      const ph = Math.round(h * dpr);
      if (game.scale.gameSize.width !== pw || game.scale.gameSize.height !== ph) {
        game.scale.resize(pw, ph);
      }
      // CSS 尺寸保持 CSS 像素（`NONE` 模式下 Phaser 不动样式，这里自己写）
      if (canvas.style.width !== `${w}px`) canvas.style.width = `${w}px`;
      if (canvas.style.height !== `${h}px`) canvas.style.height = `${h}px`;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    // 容器自己变大小（转屏、面板开合）也要跟上
    if (host && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(() => resize());
      ro.observe(host);
      game.events.once(Phaser.Core.Events.DESTROY, () => ro.disconnect());
    }
    game.events.once(Phaser.Core.Events.DESTROY, () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    });
  }

  // 画布是 boot 时才建的：还没建就等 `ready`
  if (game.canvas) bind();
  else game.events.once(Phaser.Core.Events.READY, bind);
}

/** 画布在 **CSS 像素**下的尺寸（`pinScreen` / `anchorHud` 用的是这套坐标） */
export function screenSize(scene: Phaser.Scene): { w: number; h: number } {
  const cam = scene.cameras.main;
  const dpr = canvasDpr();
  return { w: cam.width / dpr, h: cam.height / dpr };
}

/**
 * 画布尺寸变化时重算（RESIZE 模式下窗口缩放 / 手机转屏都会触发），
 * 场景 shutdown 时自动解绑。
 */
export function onSceneResize(scene: Phaser.Scene, fn: () => void): void {
  scene.scale.on(Phaser.Scale.Events.RESIZE, fn);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, fn);
  });
}

/** 把公共视距套到场景的主相机上（值没变就不动，避免每帧重设） */
export function applySceneZoom(scene: Phaser.Scene): void {
  const z = sceneZoom(scene);
  const cam = scene.cameras.main;
  if (Math.abs(cam.zoom - z) > 0.001) cam.setZoom(z);
}

/**
 * **固定视口**场景（球场 / 哥斯拉 / 外星人 / 矿洞 / 农场）：把 1280×720 的
 * 设计画面等比放大到铺满——横向居中（多出来的宽度两侧平分）、**纵向底部对齐**
 * （多出来的高度全给天空，地面留在屏幕下方），比设计比例多出来的地方露出背景。
 *
 * `hall`：**球馆里挂的那些小场地**（城堡里的 6 张普通场地 / 发球机 / 公开赛场地）。
 * 它们是塞在一张**已经按视距整体缩放的 DOM 平面**里的，所以这里**只做「铺满」、
 * 不再乘本机视距**——否则视距会被叠两次（场景一次 × 平面一次），缩放时场地上的
 * 人物会按**平方**缩，看起来远比真人小（只有 100% 视距时正常）。
 */
export function fitFixedView(scene: Phaser.Scene, hall = false): void {
  const cam = scene.cameras.main;
  // 固定视口（球场 / 哥斯拉 / 外星人 / 矿洞 / 农场）只允许视距**放大**：
  // 大地图上调低的视距（<100%）不能乘进来，否则画面缩成一小块，
  // 而且超宽屏上露出的背景会超出 `SCENE_BG_PAD` 的余量、四周露出页面底色。
  const z = hall ? fitZoom(scene) : fitZoom(scene) * Math.max(1, readZoom());
  cam.setZoom(z);
  cam.centerOn(VIEW_W / 2, VIEW_H - cam.height / z / 2);
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

/**
 * 按当前视距摆好主相机取景框：
 * - 横向跟着焦点（在 `worldW` 宽的场地里夹住；场地比视口还窄时居中）；
 * - 纵向让地面留在画面下方（视口比画布高时整体居中）。
 * 这样把视距拉近到 140% 也不会把主角挤出画面。
 *
 * ⚠️ 相机的 `midPoint` 才是「视野中心」（`scrollX` 只是它的副产品，且在
 * zoom ≠ 1 时**不等于**视野左边缘），所以这里一律用 `centerOn()`。
 */
export function frameCamera(
  scene: Phaser.Scene,
  focusX: number,
  worldW: number,
  groundY: number,
): void {
  const cam = scene.cameras.main;
  const z = cam.zoom || 1;
  const viewW = cam.width / z;
  const viewH = cam.height / z;
  const mx = viewW >= worldW ? worldW / 2 : clamp(focusX, viewW / 2, worldW - viewW / 2);
  // 视口比设计高度还高（窄屏 / 平板）时，多出来的高度全给天空，地面贴住底部
  const my = viewH >= VIEW_H ? VIEW_H - viewH / 2 : groundY + 80 - viewH / 2;
  cam.centerOn(mx, my);
}

/** 能被钉到屏幕上的对象（Text / Graphics / Container 都满足） */
interface Pinnable {
  scene: Phaser.Scene;
  setPosition(x: number, y: number): unknown;
  setScale(x: number, y?: number): unknown;
}

/**
 * 把 `setScrollFactor(0)` 的对象钉在**屏幕像素坐标** `(sx, sy)` 上（尺寸保持 1:1）。
 *
 * 相机的 zoom 会连同 scrollFactor=0 的物体一起缩放（并以相机中心为原点），
 * 所以要反向缩 `1/scale`、并按 `screen = center + (pos - center) * z` 反推位置。
 */
export function pinScreen(obj: Pinnable, sx: number, sy: number, scale = 1): void {
  const cam = obj.scene.cameras.main;
  const dpr = canvasDpr();
  const z = cam.zoom || 1;
  const cx = cam.width / 2;
  const cy = cam.height / 2;
  // `(sx, sy)` 是 **CSS 屏幕像素**，画布内部是 CSS × dpr
  obj.setPosition(cx + (sx * dpr - cx) / z, cy + (sy * dpr - cy) / z);
  obj.setScale((scale * dpr) / z);
}

/**
 * 让一个 `setScrollFactor(0)` 的文字/图标在**任意视距下**都贴住屏幕底部居中。
 */
export function pinHudBottom(obj: Pinnable, margin = 28): void {
  const { w, h } = screenSize(obj.scene);
  pinScreen(obj, w / 2, h - margin);
}

/**
 * **HUD 图形**专用：内部仍按 1280×720 的设计坐标画，但整体平移 + 反向缩放到
 * 屏幕上对应的锚点（尺寸 1:1 像素）。用法：
 *
 * ```ts
 * const g = this.hudG;         // setScrollFactor(0)
 * g.clear();
 * anchorHud(g, VIEW_W / 2, VIEW_H - 46, cam.width / 2, cam.height - 46);
 * // 之后照旧按设计坐标画（x = VIEW_W/2 - w/2、y = VIEW_H - 46 …）
 * ```
 */
export function anchorHud(
  obj: Pinnable,
  designX: number,
  designY: number,
  screenX: number,
  screenY: number,
): void {
  const z = obj.scene.cameras.main.zoom || 1;
  const dpr = canvasDpr();
  // 整体按 dpr 缩放：位置与尺寸一起放大，屏幕上的落点与物理尺寸都不变
  obj.setScale(dpr / z);
  obj.setPosition(((screenX - designX) * dpr) / z, ((screenY - designY) * dpr) / z);
}
