import Phaser from 'phaser';
import { isTouchDevice, joystickFreeOn, joystickScale } from './device';
import { JOY, joyMetrics } from './draw/joystick';
import { FONT_UI, P } from './theme';

export { isTouchDevice };

export interface StickConfig {
  x: number;
  y: number;
  r: number;
}

export interface TouchLayout {
  move: StickConfig;
  racket: StickConfig;
}

/** extra grab radius so the sticks are not fiddly to catch */
const GRAB_PAD = 44;
/** 摇杆死区：调小一点，手指轻推也响应（灵敏度更高） */
const DEADZONE = 0.15;
/** 右摇杆（瞄准/挥拍）的灵敏度加成：同样的拇指位移输出更大的向量 */
const RACKET_GAIN = 1.3;
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
 * 摇杆的固定位置（画布 1280×720 坐标系）：左下移动、右下瞄准球拍。
 * 以前支持拖动改位置/大小，现在与大地图的 Vue 摇杆统一成「固定样式、固定位置」。
 */
export const DEFAULT_LAYOUT: TouchLayout = {
  move: { x: 188, y: 602, r: 72 },
  racket: { x: 1092, y: 602, r: 66 },
};

/** 圆盘的白：DOM 的 `.joy__ring` 是 CSS 毛玻璃，画布内用半透明白近似（见 draw/joystick.ts） */
const RING_FILL = 0xffffff;

export interface TouchReadout {
  left: boolean;
  right: boolean;
  jump: boolean;
  /** 左摇杆的纵向：潜水这类需要上下自由移动的玩法用（上 = 上浮） */
  up: boolean;
  down: boolean;
}

type Which = 'move' | 'racket';

/**
 * On-screen sticks, drawn inside the Phaser canvas so they scale with the
 * game. Left stick moves (push the knob into the top wedge to jump), right
 * stick aims the racket — push further to reach further, snap it to swing
 * harder.
 *
 * 样式与大地图的 Vue 摇杆统一：白玻璃圆盘 + 金色把手，位置固定、不可拖动编辑。
 */
export class TouchControls {
  layout: TouchLayout;
  /** right stick state, consumed by the scene */
  joyX = 0;
  joyY = 0;
  joyActive = false;
  enabled = true;

  /** 自由摇杆：左半屏任意位置按下，移动摇杆出现在按下点，松手消失（设置里开） */
  private free = false;
  /** 摇杆大小缩放（设置里调，0.7~1.5），两颗摇杆的半径都乘它 */
  private scale = 1;
  /** 移动摇杆的实际圆心：固定模式 = 布局位置；自由模式 = 本次按下的点 */
  private moveAnchor: StickConfig;
  /** 击球（瞄准）摇杆的实际圆心：同样支持自由模式（右半屏按下即出现） */
  private racketAnchor: StickConfig;

  private scene: Phaser.Scene;
  private gfx: Phaser.GameObjects.Graphics;
  private hint: Phaser.GameObjects.Text;

  private movePointer = -1;
  private racketPointer = -1;
  private moveX = 0;
  private moveY = 0;
  private jumpQueued = false;
  private jumpArmed = true;
  /** knob is currently inside the jump wedge — drives the highlight */
  private jumpHot = false;

  private knob = { move: { x: 0, y: 0 }, racket: { x: 0, y: 0 } };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    // 形态与大小在创建时读一次（设置里改完，下一局生效）
    this.scale = Phaser.Math.Clamp(joystickScale(), 0.7, 1.5);
    this.free = joystickFreeOn();
    this.layout = {
      move: { ...DEFAULT_LAYOUT.move, r: Math.round(DEFAULT_LAYOUT.move.r * this.scale) },
      racket: { ...DEFAULT_LAYOUT.racket, r: Math.round(DEFAULT_LAYOUT.racket.r * this.scale) },
    };
    this.moveAnchor = { ...this.layout.move };
    this.racketAnchor = { ...this.layout.racket };
    // 固定在屏幕上：潜水这类相机会滚动的场景里，摇杆必须跟着视口而不是世界
    this.gfx = scene.add.graphics().setDepth(20).setScrollFactor(0);
    this.hint = scene.add
      .text(0, 0, '', { fontFamily: FONT_UI, fontSize: '15px', color: P.touchHintText })
      .setOrigin(0.5)
      .setDepth(21)
      .setScrollFactor(0)
      .setVisible(false);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.gfx.destroy();
    this.hint.destroy();
  }

  reset(): void {
    this.movePointer = -1;
    this.racketPointer = -1;
    this.moveX = 0;
    this.jumpQueued = false;
    this.jumpArmed = true;
    this.jumpHot = false;
    this.joyX = 0;
    this.joyY = 0;
    this.joyActive = false;
  }

  read(): TouchReadout {
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

  // ---- helpers ----------------------------------------------------------

  private stick(which: Which): StickConfig {
    // 自由模式下两颗摇杆都用「本次按下的点」当圆心
    return which === 'move' ? this.moveAnchor : this.racketAnchor;
  }

  private knobRadius(s: StickConfig): number {
    // 把手/圆盘的比例与大世界那颗摇杆共用一份定义
    return joyMetrics(s.r).knobR;
  }

  private maxTravel(s: StickConfig): number {
    return s.r - this.knobRadius(s) * 0.5;
  }

  /** normalised -1..1 vector for a pointer inside a stick */
  private vector(s: StickConfig, px: number, py: number): { x: number; y: number; k: number } {
    const dx = px - s.x;
    const dy = py - s.y;
    const len = Math.hypot(dx, dy);
    const max = this.maxTravel(s);
    const k = len > 0.001 ? Math.min(1, len / max) : 0;
    return { x: len > 0.001 ? (dx / len) * k : 0, y: len > 0.001 ? (dy / len) * k : 0, k };
  }

  private inStick(which: Which, px: number, py: number): boolean {
    const s = this.stick(which);
    return Math.hypot(px - s.x, py - s.y) <= s.r + GRAB_PAD;
  }

  // ---- input ------------------------------------------------------------

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;
    // 移动摇杆：固定模式抓底座附近；自由模式左半屏任意位置都行（圆心移到按下点）
    const moveHit = this.free ? pointer.x < 640 : this.inStick('move', pointer.x, pointer.y);
    if (this.movePointer < 0 && moveHit) {
      if (this.free) {
        const pad = this.moveAnchor.r + 12;
        this.moveAnchor = {
          ...this.moveAnchor,
          x: Phaser.Math.Clamp(pointer.x, pad, 640 - pad),
          y: Phaser.Math.Clamp(pointer.y, pad, 720 - pad),
        };
      }
      this.movePointer = pointer.id;
      this.updateMove(pointer);
      return;
    }
    if (this.racketPointer < 0 && (this.free ? pointer.x >= 640 : this.inStick('racket', pointer.x, pointer.y))) {
      if (this.free) {
        // 击球摇杆出现在手指下：圆心移到按住的位置（限制在右半屏内）
        const pad = this.racketAnchor.r + 12;
        this.racketAnchor = {
          ...this.racketAnchor,
          x: Phaser.Math.Clamp(pointer.x, 640 + pad, 1280 - pad),
          y: Phaser.Math.Clamp(pointer.y, pad, 720 - pad),
        };
      }
      this.racketPointer = pointer.id;
      this.joyActive = true;
      this.updateRacket(pointer);
      return;
    }
    // the right half of the court also grabs the racket: a big target feels
    // far better than forcing the thumb onto the base circle
    if (this.racketPointer < 0 && pointer.x > 640) {
      this.racketPointer = pointer.id;
      this.joyActive = true;
      this.updateRacket(pointer);
    }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (!this.enabled) return;
    if (pointer.id === this.movePointer) {
      this.updateMove(pointer);
      return;
    }
    if (pointer.id === this.racketPointer) this.updateRacket(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.movePointer) {
      this.movePointer = -1;
      this.moveX = 0;
      this.jumpArmed = true;
      this.jumpHot = false;
      this.knob.move.x = 0;
      this.knob.move.y = 0;
      return;
    }
    if (pointer.id === this.racketPointer) {
      this.racketPointer = -1;
      this.joyActive = false;
      this.joyX = 0;
      this.joyY = 0;
      this.knob.racket.x = 0;
      this.knob.racket.y = 0;
    }
  }

  private updateMove(pointer: Phaser.Input.Pointer): void {
    const s = this.stick('move');
    const v = this.vector(s, pointer.x, pointer.y);
    this.moveX = v.x;
    this.moveY = v.y;
    const max = this.maxTravel(s);
    this.knob.move.x = v.x * max;
    this.knob.move.y = v.y * max;

    // jump wedge: deep enough AND pointing up-ish. Edge triggered, with
    // separate in/out thresholds on both depth and angle.
    const depth = this.jumpArmed ? JUMP_DEPTH : JUMP_RELEASE_DEPTH;
    const half = this.jumpArmed ? JUMP_HALF_ANGLE : JUMP_RELEASE_ANGLE;
    const inZone = v.k >= depth && Math.abs(Math.atan2(v.x, -v.y)) <= half;
    this.jumpHot = inZone;
    if (this.jumpArmed && inZone) {
      this.jumpQueued = true;
      this.jumpArmed = false;
    } else if (!this.jumpArmed && !inZone) {
      this.jumpArmed = true;
    }
  }

  private updateRacket(pointer: Phaser.Input.Pointer): void {
    const s = this.stick('racket');
    const v = this.vector(s, pointer.x, pointer.y);
    // 灵敏度加成：轻推也有明显反应，推满仍是 1
    const k = Math.min(1, v.k * RACKET_GAIN);
    const scale = v.k > 0.0001 ? k / v.k : 0;
    this.joyX = v.x * scale;
    this.joyY = v.y * scale;
    const max = this.maxTravel(s);
    this.knob.racket.x = v.x * scale * max;
    this.knob.racket.y = v.y * scale * max;
  }

  // ---- rendering --------------------------------------------------------

  /** 白玻璃圆盘 + 金色把手：尺寸与配色取自 `draw/joystick.ts`，和大地图那颗同款 */
  private drawStick(
    g: Phaser.GameObjects.Graphics,
    which: Which,
    live: boolean,
    accent: number,
  ): void {
    const s = this.stick(which);
    const knobR = this.knobRadius(s);
    const k = this.knob[which];

    g.fillStyle(RING_FILL, live ? JOY.fillLive : JOY.fillIdle);
    g.fillCircle(s.x, s.y, s.r);
    g.lineStyle(JOY.lineWidth, RING_FILL, live ? JOY.lineLive : JOY.lineIdle);
    g.strokeCircle(s.x, s.y, s.r);

    const moved = k.x !== 0 || k.y !== 0;
    g.fillStyle(moved ? accent : JOY.gold, live || moved ? JOY.knobLiveAlpha : JOY.knobIdleAlpha);
    g.fillCircle(s.x + k.x, s.y + k.y, knobR);
    g.lineStyle(JOY.lineWidth, RING_FILL, 0.85);
    g.strokeCircle(s.x + k.x, s.y + k.y, knobR);
  }

  draw(): void {
    const g = this.gfx;
    g.clear();
    if (!this.enabled) return;

    // 自由模式：移动摇杆只在按下期间出现；固定模式：常驻
    if (!this.free || this.movePointer >= 0) {
      this.drawStick(g, 'move', this.movePointer >= 0, P.knobLive);

      // the jump wedge, drawn as a real region so it is obvious where to aim
      const s = this.stick('move');
      const r = s.r - 12;
      const a0 = -Math.PI / 2 - JUMP_HALF_ANGLE;
      const a1 = -Math.PI / 2 + JUMP_HALF_ANGLE;
      const hot = this.jumpHot;

      g.fillStyle(P.jumpCue, hot ? 0.32 : 0.11);
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.arc(s.x, s.y, r, a0, a1, false, 0);
      g.closePath();
      g.fillPath();

      g.lineStyle(hot ? 4 : 3, P.jumpCue, hot ? 1 : 0.5);
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.arc(s.x, s.y, r, a0, a1, false, 0);
      g.closePath();
      g.strokePath();

      // the depth the knob has to reach before the wedge fires
      const inner = this.maxTravel(s) * JUMP_DEPTH;
      g.lineStyle(2, P.jumpCue, hot ? 0.75 : 0.3);
      g.beginPath();
      g.arc(s.x, s.y, inner, a0, a1, false, 0);
      g.strokePath();

      const ty = s.y - r + 18;
      g.fillStyle(P.jumpCue, hot ? 1 : 0.55);
      g.fillTriangle(s.x, ty - 9, s.x - 9, ty + 4, s.x + 9, ty + 4);

      this.hint.setPosition(s.x, s.y + s.r + 20).setText('推上跳').setVisible(true);
    } else {
      this.hint.setVisible(false);
    }

    // 击球摇杆：自由模式只在按下期间出现，固定模式常驻
    if (!this.free || this.racketPointer >= 0) {
      this.drawStick(g, 'racket', this.racketPointer >= 0, P.knobLive);
    }
  }
}
