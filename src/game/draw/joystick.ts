/**
 * 虚拟摇杆的「外观」定义——**全站只有一份实现**：
 *
 * - `components/ui/Joystick.vue`：大世界与**所有玩法页**（`GameSticks.vue` 叠在
 *   Phaser 画布上）用的那颗 DOM 摇杆，外观就是按它定的基准。
 *
 * 2026-10 重构：原来各玩法是「画在 Phaser 画布里」的另一颗摇杆（会被画布拉伸弄成
 * 椭圆、位置也随屏幕比例漂移），现在已经统一到这颗 DOM 摇杆上，所以比例 / 配色 /
 * 金色把手 / 按下亮度 / 描边宽度都只需要在这里维护一份。
 * `TouchControls`（`game/touch.ts`）不再画任何东西，只负责把摇杆向量翻译成游戏输入。
 */

export const JOY = {
  /**
   * DOM 版的「操作半径」（px）：把手最多能离圆心这么远，再乘设置里的「摇杆大小」。
   * 画布版不需要它——画布里的摇杆直接按圆盘半径 r 画。
   */
  baseR: 40,
  /** 底座圆盘比「操作直径」大出来的量（px）：一圈余量，DOM 版圆盘半径 = 操作半径 + 它的一半 */
  ringPad: 24,
  /** 把手半径 ÷ **圆盘**半径（大世界那颗：23 ÷ 52） */
  knobRatio: 0.442,
  /** 把手最小半径（px）：摇杆调很小时别缩成一点 */
  knobMinR: 15,

  /** 圆盘内的白：静止 / 按住（DOM 用 CSS 玻璃，画布用这个透明度近似） */
  fillIdle: 0.34,
  fillLive: 0.5,
  /** 圆盘描边：静止 / 按住 */
  lineIdle: 0.55,
  lineLive: 0.9,
  /** 描边宽度（画布内画线用；DOM 侧是那圈 1px 细边） */
  lineWidth: 2,

  /** 把手的金色（DOM 的 #f2c14e） */
  gold: 0xf2c14e,
  /** 把手不透明度：静止 / 推动或按住 */
  knobIdleAlpha: 0.88,
  knobLiveAlpha: 0.95,
} as const;

/** 数字颜色 → CSS 颜色串（同一份常量喂给 DOM） */
export function hexColor(color: number): string {
  return `#${color.toString(16).padStart(6, '0')}`;
}

export interface JoyMetrics {
  /** 圆盘半径（画布版就是 `StickConfig.r`，DOM 版由操作半径推算，见 `ringRadius()`） */
  r: number;
  /** 把手半径 */
  knobR: number;
  /** DOM 版容器边长（= 圆盘直径，圆盘元素铺满它） */
  ringPx: number;
}

/** 由圆盘半径算出整套几何——DOM 与画布共用同一套比例 */
export function joyMetrics(r: number): JoyMetrics {
  return {
    r,
    knobR: Math.max(JOY.knobMinR, r * JOY.knobRatio),
    ringPx: r * 2,
  };
}

/** DOM 版：把「操作半径」（把手行程）换成圆盘半径 */
export function ringRadius(travelR: number): number {
  return travelR + JOY.ringPad / 2;
}
