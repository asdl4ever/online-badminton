import Phaser from 'phaser';

/** bottom-left movement strip */
const PAD = { x: 28, y: 644, w: 356, h: 66 };
/** bottom-right racket joystick */
const JOY = { x: 1130, y: 660, r: 54, knob: 24 };
const TAP_MS = 240;
const DRAG_PX = 16;

export function isTouchDevice(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('touch');
    if (q === '1') return true;
    if (q === '0') return false;
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/**
 * Fullscreen + landscape lock. Must be called from a user gesture; silently
 * does nothing where unsupported (notably iOS, which has no orientation lock).
 */
export async function enterMobileFullscreen(): Promise<void> {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.({ navigationUI: 'hide' });
    }
  } catch {
    /* user denied or unsupported */
  }
  try {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (o: string) => Promise<void>;
    };
    await orientation?.lock?.('landscape');
  } catch {
    /* unsupported */
  }
}

export interface TouchReadout {
  left: boolean;
  right: boolean;
  jump: boolean;
}

/**
 * On-screen controls drawn inside the Phaser canvas so they scale with the
 * game. Left strip = hold to run, quick tap = jump. Right stick = racket
 * direction (push further = reach further, snap it = swing power).
 */
export class TouchControls {
  joyX = 0;
  joyY = 0;
  joyActive = false;

  private scene: Phaser.Scene;
  private gfx: Phaser.GameObjects.Graphics;
  private padPointer = -1;
  private joyPointer = -1;
  private padDir = 0;
  private padDownAt = 0;
  private padDownX = 0;
  private padDownY = 0;
  private padMoved = false;
  private jumpQueued = false;
  private knobX = JOY.x;
  private knobY = JOY.y;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gfx = scene.add.graphics().setDepth(20);

    scene.input.on('pointerdown', this.onDown, this);
    scene.input.on('pointermove', this.onMove, this);
    scene.input.on('pointerup', this.onUp, this);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.onDown, this);
    this.scene.input.off('pointermove', this.onMove, this);
    this.scene.input.off('pointerup', this.onUp, this);
    this.gfx.destroy();
  }

  reset(): void {
    this.padPointer = -1;
    this.joyPointer = -1;
    this.padDir = 0;
    this.jumpQueued = false;
    this.joyX = 0;
    this.joyY = 0;
    this.joyActive = false;
  }

  read(): TouchReadout {
    const jump = this.jumpQueued;
    this.jumpQueued = false;
    return { left: this.padDir === -1, right: this.padDir === 1, jump };
  }

  // ---- input ------------------------------------------------------------

  private inPad(x: number, y: number): boolean {
    return x >= PAD.x - 18 && x <= PAD.x + PAD.w + 18 && y >= PAD.y - 26 && y <= PAD.y + PAD.h + 30;
  }

  private inJoy(x: number, y: number): boolean {
    return Math.hypot(x - JOY.x, y - JOY.y) <= JOY.r + 34;
  }

  private onDown(pointer: Phaser.Input.Pointer): void {
    if (this.padPointer < 0 && this.inPad(pointer.x, pointer.y)) {
      this.padPointer = pointer.id;
      this.padDownAt = this.scene.time.now;
      this.padDownX = pointer.x;
      this.padDownY = pointer.y;
      this.padMoved = false;
      this.padDir = pointer.x < PAD.x + PAD.w / 2 ? -1 : 1;
      return;
    }
    if (this.joyPointer < 0 && this.inJoy(pointer.x, pointer.y)) {
      this.joyPointer = pointer.id;
      this.joyActive = true;
      this.updateJoy(pointer);
      return;
    }
    // touching outside the controls still grabs the racket so it feels direct
    if (this.joyPointer < 0 && pointer.x > 640) {
      this.joyPointer = pointer.id;
      this.joyActive = true;
      this.updateJoy(pointer);
    }
  }

  private onMove(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.padPointer) {
      if (Math.hypot(pointer.x - this.padDownX, pointer.y - this.padDownY) > DRAG_PX) {
        this.padMoved = true;
      }
      this.padDir = pointer.x < PAD.x + PAD.w / 2 ? -1 : 1;
      return;
    }
    if (pointer.id === this.joyPointer) this.updateJoy(pointer);
  }

  private onUp(pointer: Phaser.Input.Pointer): void {
    if (pointer.id === this.padPointer) {
      const quick = this.scene.time.now - this.padDownAt < TAP_MS && !this.padMoved;
      if (quick) this.jumpQueued = true;
      this.padPointer = -1;
      this.padDir = 0;
      return;
    }
    if (pointer.id === this.joyPointer) {
      this.joyPointer = -1;
      this.joyActive = false;
      this.joyX = 0;
      this.joyY = 0;
    }
  }

  private updateJoy(pointer: Phaser.Input.Pointer): void {
    const dx = pointer.x - JOY.x;
    const dy = pointer.y - JOY.y;
    const len = Math.hypot(dx, dy);
    const maxLen = JOY.r - JOY.knob * 0.5;
    const k = len > 0.001 ? Math.min(1, len / maxLen) : 0;
    const ux = len > 0.001 ? dx / len : 0;
    const uy = len > 0.001 ? dy / len : 0;
    this.joyX = ux * k;
    this.joyY = uy * k;
    this.knobX = JOY.x + ux * k * maxLen;
    this.knobY = JOY.y + uy * k * maxLen;
  }

  // ---- rendering --------------------------------------------------------

  draw(): void {
    const g = this.gfx;
    g.clear();

    const padLive = this.padPointer >= 0;
    g.fillStyle(0x0b1a2b, padLive ? 0.42 : 0.22);
    g.fillRoundedRect(PAD.x, PAD.y, PAD.w, PAD.h, PAD.h / 2);
    g.lineStyle(2, 0xffffff, padLive ? 0.5 : 0.22);
    g.strokeRoundedRect(PAD.x, PAD.y, PAD.w, PAD.h, PAD.h / 2);

    const midX = PAD.x + PAD.w / 2;
    const cy = PAD.y + PAD.h / 2;
    g.lineStyle(2, 0xffffff, 0.14);
    g.lineBetween(midX, PAD.y + 12, midX, PAD.y + PAD.h - 12);

    const arrow = (cx: number, dir: -1 | 1, lit: boolean) => {
      const a = lit ? 0.95 : 0.45;
      g.fillStyle(0xffffff, a);
      g.fillTriangle(
        cx + dir * 16,
        cy,
        cx - dir * 10,
        cy - 15,
        cx - dir * 10,
        cy + 15,
      );
    };
    arrow(PAD.x + PAD.w * 0.27, -1, this.padDir === -1);
    arrow(PAD.x + PAD.w * 0.73, 1, this.padDir === 1);

    const joyLive = this.joyPointer >= 0;
    g.fillStyle(0x0b1a2b, joyLive ? 0.4 : 0.2);
    g.fillCircle(JOY.x, JOY.y, JOY.r);
    g.lineStyle(2, 0xffffff, joyLive ? 0.5 : 0.22);
    g.strokeCircle(JOY.x, JOY.y, JOY.r);
    g.lineStyle(1, 0xffffff, 0.14);
    g.lineBetween(JOY.x - JOY.r + 10, JOY.y, JOY.x + JOY.r - 10, JOY.y);
    g.lineBetween(JOY.x, JOY.y - JOY.r + 10, JOY.x, JOY.y + JOY.r - 10);
    g.fillStyle(joyLive ? 0x6ff0ff : 0x8fb8d8, joyLive ? 0.75 : 0.45);
    g.fillCircle(this.knobX, this.knobY, JOY.knob);
  }
}
