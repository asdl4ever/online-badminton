import Phaser from 'phaser';
import { VIEW_H, VIEW_W } from './constants';

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

/** 所有 Phaser 页面共用的画布配置：画布 = 容器尺寸、1:1 像素（不再靠 CSS 拉伸） */
export function sceneScaleConfig(): Phaser.Types.Core.ScaleConfig {
  return { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.NO_CENTER };
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
  const z = hall ? fitZoom(scene) : sceneZoom(scene);
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
  const z = cam.zoom || 1;
  const cx = cam.width / 2;
  const cy = cam.height / 2;
  obj.setPosition(cx + (sx - cx) / z, cy + (sy - cy) / z);
  obj.setScale(scale / z);
}

/**
 * 让一个 `setScrollFactor(0)` 的文字/图标在**任意视距下**都贴住屏幕底部居中。
 */
export function pinHudBottom(obj: Pinnable, margin = 28): void {
  const cam = obj.scene.cameras.main;
  pinScreen(obj, cam.width / 2, cam.height - margin);
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
  obj.setScale(1 / z);
  obj.setPosition((screenX - designX) / z, (screenY - designY) / z);
}
