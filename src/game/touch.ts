import { isTouchDevice } from './device';

export { isTouchDevice };

/** 摇杆死区：调小一点，手指轻推也响应（灵敏度更高） */
const DEADZONE = 0.15;
/** 右摇杆（瞄准/挥拍）的灵敏度加成：同样的拇指位移输出更大的向量 */
const RACKET_GAIN = 1.3;

/**
 * 右摇杆原始向量 → 球拍瞄准向量：**比赛与各玩法共用同一套手感**——
 * 1.3 灵敏度增益、长度封顶 1（推一半 ≈ 0.65，轻推就有反应）。
 *
 * 大世界 / 健身房的右摇杆以前各自手搓映射，手感与比赛对不上；
 * 现在统一走这里（`TouchControls` 也用它），改灵敏度只改一处。
 */
export function racketAim(x: number, y: number): { x: number; y: number } {
  const len = Math.hypot(x, y);
  if (len < 0.001) return { x: 0, y: 0 };
  const k = Math.min(1, len * RACKET_GAIN) / len;
  return { x: x * k, y: y * k };
}
/**
 * Jumping lives in a wedge at the top of the move stick: push the knob at
 * least `JUMP_DEPTH` of the way out, and stay within `JUMP_HALF_ANGLE` of
 * straight up. The `_RELEASE_` values are the hysteresis that has to be
 * crossed the other way before it can fire again — otherwise the knob
 * jittering on the boundary would machine-gun the jump.
 */
const JUMP_DEPTH = 0.55;
const JUMP_HALF_ANGLE = (42 * Math.PI) / 180;
const JUMP_RELEASE_DEPTH = 0.3;
const JUMP_RELEASE_ANGLE = (58 * Math.PI) / 180;

/**
 * **虚拟摇杆的共享输入**：DOM 摇杆（`components/ui/GameSticks.vue`，各玩法页叠在
 * 画布上那颗）写入，`TouchControls` 读取。
 *
 * 2026-10 重构：摇杆从「画在 Phaser 画布里」改回**和大地图同一颗 DOM 摇杆**——
 * 位置固定钉在左下 / 右下角、尺寸 1:1 像素、毛玻璃质感一致，而且不会再被
 * 画布的非等比拉伸弄成椭圆或漂走。
 */
export const stickInput = {
  /** 左摇杆（移动）的归一化向量，长度 0~1 */
  move: { x: 0, y: 0 },
  /** 右摇杆（球拍）的归一化向量，长度 0~1 */
  racket: { x: 0, y: 0 },
  moveActive: false,
  racketActive: false,
};

/**
 * **招式按钮的共享输入**：DOM 招式按钮（`components/ui/GameSticks.vue` 里那排）
 * 写入，`GameScene.applySkills` 读取。下标 = 携带槽位（0/1/2 ↔ 快捷键 1/2/3）。
 * 招式现在全是主动（永久数值成长归锻炼，见 `skills.ts` / `training.ts`）。
 */
export const skillInput = {
  pressed: [false, false, false],
};

export interface TouchReadout {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** 左摇杆的纵向：潜水这类需要上下自由移动的玩法用（上 = 上浮） */
  up: boolean;
  down: boolean;
}

/**
 * 各玩法的触屏输入。本体已经没有画面——摇杆由 DOM 组件渲染（外观与大地图那颗
 * 共用 `draw/joystick.ts` 的 `JOY`），这里只把共享向量翻译成游戏要的读数：
 * 移动方向、跳（推上）、以及球拍的指向向量。
 *
 * 保留 `draw()` 是为了各场景不必改调用点（现在是空实现）。
 */
export class TouchControls {
  enabled = true;

  /** 右摇杆当前是否按住（松手时球拍回位，回位不能算挥拍） */
  get joyActive(): boolean {
    return this.enabled && stickInput.racketActive;
  }

  private jumpQueued = false;
  private jumpArmed = true;
  private moveX = 0;
  private moveY = 0;

  /** 球拍指向向量（带灵敏度加成，长度 0~1） */
  get joyX(): number {
    return this.enabled ? this.racketVector().x : 0;
  }

  get joyY(): number {
    return this.enabled ? this.racketVector().y : 0;
  }

  reset(): void {
    this.jumpQueued = false;
    this.jumpArmed = true;
    this.moveX = 0;
    this.moveY = 0;
  }

  /** 各场景每帧调一次（`draw()` 已无画面，留作兼容） */
  draw(): void {
    /* 摇杆现在由 DOM 绘制 */
  }

  destroy(): void {
    /* 没有需要销毁的 Phaser 资源 */
  }

  read(): TouchReadout {
    if (!this.enabled) {
      return { left: false, right: false, jump: false, up: false, down: false };
    }
    this.syncMove();
    const jump = this.jumpQueued;
    this.jumpQueued = false;
    return {
      left: this.moveX < -DEADZONE,
      right: this.moveX > DEADZONE,
      jump,
      up: this.moveY < -DEADZONE,
      down: this.moveY > DEADZONE,
    };
  }

  /** 从共享输入算移动向量 + 跳（推上那一块楔形区） */
  private syncMove(): void {
    const v = stickInput.move;
    this.moveX = v.x;
    this.moveY = v.y;
    const len = Math.hypot(v.x, v.y);

    const depth = this.jumpArmed ? JUMP_DEPTH : JUMP_RELEASE_DEPTH;
    const half = this.jumpArmed ? JUMP_HALF_ANGLE : JUMP_RELEASE_ANGLE;
    const inZone = len >= depth && Math.abs(Math.atan2(v.x, -v.y)) <= half;
    if (this.jumpArmed && inZone) {
      this.jumpQueued = true;
      this.jumpArmed = false;
    } else if (!this.jumpArmed && !inZone) {
      this.jumpArmed = true;
    }
  }

  private racketVector(): { x: number; y: number } {
    return racketAim(stickInput.racket.x, stickInput.racket.y);
  }
}
