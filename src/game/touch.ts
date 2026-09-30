import Phaser from 'phaser';
import { isTouchDevice } from './device';

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

const STORAGE_KEY = 'bmt-touch-layout';
const KNOB_RATIO = 0.42;
/** extra grab radius so the sticks are not fiddly to catch */
const GRAB_PAD = 44;
const DEADZONE = 0.26;
/** push this far up on the move stick to jump, and release past OFF to re-arm */
const JUMP_ON = 0.55;
const JUMP_OFF = 0.3;
const MIN_R = 46;
const MAX_R = 130;

const BTN_W = 148;
const BTN_H = 58;

export const DEFAULT_LAYOUT: TouchLayout = {
  move: { x: 188, y: 602, r: 72 },
  racket: { x: 1092, y: 602, r: 66 },
};

function cloneLayout(l: TouchLayout): TouchLayout {
  return { move: { ...l.move }, racket: { ...l.racket } };
}

export function loadLayout(): TouchLayout {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneLayout(DEFAULT_LAYOUT);
    const parsed = JSON.parse(raw) as Partial<TouchLayout>;
    const merge = (base: StickConfig, got?: Partial<StickConfig>): StickConfig => ({
      x: typeof got?.x === 'number' ? got.x : base.x,
      y: typeof got?.y === 'number' ? got.y : base.y,
      r: typeof got?.r === 'number' ? got.r : base.r,
    });
    return {
      move: merge(DEFAULT_LAYOUT.move, parsed.move),
      racket: merge(DEFAULT_LAYOUT.racket, parsed.racket),
    };
  } catch {
    return cloneLayout(DEFAULT_LAYOUT);
  }
}

function persist(l: TouchLayout): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
  } catch {
    /* private mode */
  }
}

export interface TouchReadout {
  left: boolean;
  right: boolean;
  jump: boolean;
}

type DragMode = 'pos' | 'size';
type Which = 'move' | 'racket';

interface DragState {
  which: Which;
  mode: DragMode;
  grabX: number;
  grabY: number;
}

/**
 * On-screen sticks, drawn inside the Phaser canvas so they scale with the
 * game. Left stick moves (push up to jump), right stick aims the racket —
 * push further to reach further, snap it to swing harder.
 *
 * `editing` puts the whole thing into a drag-to-arrange overlay where the
 * player can restyle the layout; the result is kept in localStorage.
 */
export class TouchControls {
  layout: TouchLayout;
  /** right stick state, consumed by the scene */
  joyX = 0;
  joyY = 0;
  joyActive = false;
  enabled = true;
  editing = false;

  private scene: Phaser.Scene;
  private gfx: Phaser.GameObjects.Graphics;
  private hint: Phaser.GameObjects.Text;
  private editHint: Phaser.GameObjects.Text;
  private resetLabel: Phaser.GameObjects.Text;
  private doneLabel: Phaser.GameObjects.Text;

  private movePointer = -1;
  private racketPointer = -1;
  private moveX = 0;
  private moveY = 0;
  private jumpQueued = false;
  private jumpArmed = true;

  private knob = { move: { x: 0, y: 0 }, racket: { x: 0, y: 0 } };
  private drag: DragState | null = null;
  private btnReset = { x: 0, y: 0 };
  private btnDone = { x: 0, y: 0 };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.layout = loadLayout();
    this.gfx = scene.add.graphics().setDepth(20);
    this.hint = scene.add
      .text(0, 0, '', { fontFamily: 'Segoe UI, Arial', fontSize: '15px', color: '#cfe6ff' })
      .setOrigin(0.5)
      .setDepth(21)
      .setVisible(false);
    this.editHint = scene.add
      .text(640, 74, '拖动圆盘改位置 · 拖右上角把手改大小', {
        fontFamily: 'Segoe UI, Arial',
        fontSize: '19px',
        color: '#dbe9f7',
        backgroundColor: 'rgba(4,10,18,0.7)',
        padding: { x: 14, y: 9 },
      })
      .setOrigin(0.5)
      .setDepth(22)
      .setVisible(false);
    const btnStyle = {
      fontFamily: 'Segoe UI, Arial',
      fontSize: '21px',
      color: '#ffffff',
      fontStyle: 'bold',
    } as const;
    this.resetLabel = scene.add.text(0, 0, '重置', btnStyle).setOrigin(0.5).setDepth(22).setVisible(false);
    this.doneLabel = scene.add.text(0, 0, '完成', btnStyle).setOrigin(0.5).setDepth(22).setVisible(false);

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
    this.editHint.destroy();
    this.resetLabel.destroy();
    this.doneLabel.destroy();
  }

  reset(): void {
    this.movePointer = -1;
    this.racketPointer = -1;
    this.moveX = 0;
    this.moveY = 0;
    this.jumpQueued = false;
    this.jumpArmed = true;
    this.joyX = 0;
    this.joyY = 0;
    this.joyActive = false;
  }

  read(): TouchReadout {
    const jump = this.jumpQueued;
    this.jumpQueued = false;
    if (this.editing) return { left: false, right: false, jump: false };
    return {
      left: this.moveX < -DEADZONE,
      right: this.moveX > DEADZONE,
      jump,
    };
  }

  setEditing(on: boolean): void {
    if (this.editing === on) return;
    this.editing = on;
    this.reset();
    this.drag = null;
    this.editHint.setVisible(on);
    this.resetLabel.setVisible(on);
    this.doneLabel.setVisible(on);
    if (on) this.hint.setVisible(false);
    if (!on) persist(this.layout);
  }

  // ---- helpers ----------------------------------------------------------

  private stick(which: Which): StickConfig {
    return this.layout[which];
  }

  private knobRadius(s: StickConfig): number {
    return Math.max(16, s.r * KNOB_RATIO);
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

  private handleAt(which: Which): { x: number; y: number } {
    const s = this.stick(which);
    const a = -Math.PI / 4;
    return { x: s.x + Math.cos(a) * s.r, y: s.y + Math.sin(a) * s.r };
  }

  private inButton(b: { x: number; y: number }, px: number, py: number): boolean {
    return Math.abs(px - b.x) <= BTN_W / 2 && Math.abs(py - b.y) <= BTN_H / 2;
  }

  // ---- input ------------------------------------------------------------

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.editing) {
      if (this.inButton(this.btnReset, pointer.x, pointer.y)) {
        this.layout = cloneLayout(DEFAULT_LAYOUT);
        persist(this.layout);
        return;
      }
      if (this.inButton(this.btnDone, pointer.x, pointer.y)) {
        this.setEditing(false);
        return;
      }
      for (const which of ['racket', 'move'] as const) {
        const h = this.handleAt(which);
        if (Math.hypot(pointer.x - h.x, pointer.y - h.y) <= 34) {
          this.drag = { which, mode: 'size', grabX: pointer.x, grabY: pointer.y };
          return;
        }
      }
      for (const which of ['racket', 'move'] as const) {
        if (this.inStick(which, pointer.x, pointer.y)) {
          const s = this.stick(which);
          this.drag = { which, mode: 'pos', grabX: pointer.x - s.x, grabY: pointer.y - s.y };
          return;
        }
      }
      return;
    }

    if (!this.enabled) return;
    if (this.movePointer < 0 && this.inStick('move', pointer.x, pointer.y)) {
      this.movePointer = pointer.id;
      this.updateMove(pointer);
      return;
    }
    if (this.racketPointer < 0 && this.inStick('racket', pointer.x, pointer.y)) {
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
    if (this.editing) {
      if (!this.drag) return;
      const s = this.stick(this.drag.which);
      if (this.drag.mode === 'pos') {
        s.x = pointer.x - this.drag.grabX;
        s.y = pointer.y - this.drag.grabY;
      } else {
        s.r = Phaser.Math.Clamp(
          Math.hypot(pointer.x - s.x, pointer.y - s.y),
          MIN_R,
          MAX_R,
        );
      }
      return;
    }

    if (!this.enabled) return;
    if (pointer.id === this.movePointer) {
      this.updateMove(pointer);
      return;
    }
    if (pointer.id === this.racketPointer) this.updateRacket(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (this.editing) {
      if (this.drag) {
        this.drag = null;
        persist(this.layout);
      }
      return;
    }
    if (pointer.id === this.movePointer) {
      this.movePointer = -1;
      this.moveX = 0;
      this.moveY = 0;
      this.jumpArmed = true;
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

    // push up to jump, edge triggered, re-armed once released past JUMP_OFF
    const up = -v.y;
    if (this.jumpArmed && up > JUMP_ON) {
      this.jumpQueued = true;
      this.jumpArmed = false;
    } else if (!this.jumpArmed && up < JUMP_OFF) {
      this.jumpArmed = true;
    }
  }

  private updateRacket(pointer: Phaser.Input.Pointer): void {
    const s = this.stick('racket');
    const v = this.vector(s, pointer.x, pointer.y);
    this.joyX = v.x;
    this.joyY = v.y;
    const max = this.maxTravel(s);
    this.knob.racket.x = v.x * max;
    this.knob.racket.y = v.y * max;
  }

  // ---- rendering --------------------------------------------------------

  private drawStick(
    g: Phaser.GameObjects.Graphics,
    which: Which,
    live: boolean,
    accent: number,
  ): void {
    const s = this.stick(which);
    const knobR = this.knobRadius(s);
    const k = this.knob[which];

    g.fillStyle(0x0b1a2b, live ? 0.42 : 0.22);
    g.fillCircle(s.x, s.y, s.r);
    g.lineStyle(2, 0xffffff, live ? 0.5 : 0.22);
    g.strokeCircle(s.x, s.y, s.r);
    g.lineStyle(1, 0xffffff, 0.14);
    g.lineBetween(s.x - s.r + 10, s.y, s.x + s.r - 10, s.y);
    g.lineBetween(s.x, s.y - s.r + 10, s.x, s.y + s.r - 10);
    g.fillStyle(live || k.x !== 0 || k.y !== 0 ? accent : 0x8fb8d8, live ? 0.75 : 0.45);
    g.fillCircle(s.x + k.x, s.y + k.y, knobR);
  }

  private drawEditOverlay(g: Phaser.GameObjects.Graphics): void {
    g.fillStyle(0x040a12, 0.62);
    g.fillRect(0, 0, 1280, 720);

    for (const which of ['move', 'racket'] as const) {
      const s = this.stick(which);
      g.fillStyle(0x6ff0ff, 0.1);
      g.fillCircle(s.x, s.y, s.r);
      g.lineStyle(3, 0x6ff0ff, 0.85);
      g.strokeCircle(s.x, s.y, s.r);
      g.lineStyle(2, 0x6ff0ff, 0.4);
      g.strokeCircle(s.x, s.y, s.r + 44);

      const h = this.handleAt(which);
      g.fillStyle(0x6ff0ff, 0.95);
      g.fillCircle(h.x, h.y, 14);
      g.lineStyle(2, 0x040a12, 0.9);
      g.strokeCircle(h.x, h.y, 14);
      g.lineBetween(s.x, s.y, h.x, h.y);
    }

    const btn = (b: { x: number; y: number }, accent: boolean) => {
      g.fillStyle(accent ? 0x2f7fe0 : 0x21324a, 0.95);
      g.fillRoundedRect(b.x - BTN_W / 2, b.y - BTN_H / 2, BTN_W, BTN_H, 14);
      g.lineStyle(2, 0x9fd6ff, accent ? 0.9 : 0.4);
      g.strokeRoundedRect(b.x - BTN_W / 2, b.y - BTN_H / 2, BTN_W, BTN_H, 14);
    };
    btn(this.btnReset, false);
    btn(this.btnDone, true);
  }

  draw(): void {
    const g = this.gfx;
    g.clear();

    if (this.editing) {
      this.btnReset = { x: 640 - 90, y: 660 };
      this.btnDone = { x: 640 + 90, y: 660 };
      this.resetLabel.setPosition(this.btnReset.x, this.btnReset.y);
      this.doneLabel.setPosition(this.btnDone.x, this.btnDone.y);
      this.drawEditOverlay(g);
      this.drawStick(g, 'move', true, 0x6ff0ff);
      this.drawStick(g, 'racket', true, 0x6ff0ff);
      return;
    }

    if (!this.enabled) return;

    this.drawStick(g, 'move', this.movePointer >= 0, 0x6ff0ff);
    this.drawStick(g, 'racket', this.racketPointer >= 0, 0x6ff0ff);

    // "push up to jump" cue on the move stick
    const s = this.stick('move');
    const lit = this.jumpArmed === false || -this.moveY > JUMP_ON - 0.1;
    g.lineStyle(4, 0xffe066, lit ? 0.95 : 0.35);
    g.beginPath();
    g.arc(s.x, s.y, s.r - 12, -Math.PI * 0.75, -Math.PI * 0.25, false, 0);
    g.strokePath();
    const ty = s.y - s.r + 24;
    g.fillStyle(0xffe066, lit ? 1 : 0.5);
    g.fillTriangle(s.x, ty - 9, s.x - 9, ty + 4, s.x + 9, ty + 4);

    this.hint
      .setPosition(s.x, s.y + s.r + 20)
      .setText('推上跳')
      .setVisible(true);
  }
}
