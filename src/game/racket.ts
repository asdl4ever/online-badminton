import { DEFAULT_CONFIG, type WorldConfig } from './config';

export interface RacketState {
  rx: number;
  ry: number;
  rvx: number;
  rvy: number;
}

/** 挥拍轨迹的一个采样点：**肩部相对坐标** + 这一刻的拍头速度 + 采样时刻（秒） */
export interface SwingSample {
  rx: number;
  ry: number;
  s: number;
  t: number;
}

/**
 * 挥拍轨迹采样器：每帧记一笔拍头位置（相对肩部），`drawSwingTrail` 拿这串点
 * 画出**真实的挥拍轨迹**——往上撩就是上弧、下压就是下劈，而不是一段固定角度的弧。
 *
 * 只存渲染要用的最近一小段（约 0.35s），纯渲染层的东西、不进任何模拟与快照。
 */
export class SwingPath {
  readonly pts: SwingSample[] = [];
  private clock = 0;
  private px = 0;
  private py = 0;
  private has = false;
  private smooth = 0;

  record(rx: number, ry: number, dt: number): void {
    this.clock += dt;
    // 速度从位置差分推出来（渲染用的量，跟模拟里的 rvx/rvy 不必一致）；
    // 瞬移（换边 / 重生 / 追镜头）不算挥拍
    let s = 0;
    if (this.has && dt > 1e-4) {
      const d = Math.hypot(rx - this.px, ry - this.py);
      if (d < 140) s = d / dt;
    }
    this.smooth += (s - this.smooth) * 0.5;
    this.px = rx;
    this.py = ry;
    this.has = true;
    this.pts.push({ rx, ry, s: this.smooth, t: this.clock });
    while (this.pts.length > 1 && this.clock - this.pts[0].t > 0.35) this.pts.shift();
    if (this.pts.length > 48) this.pts.shift();
  }

  clear(): void {
    this.pts.length = 0;
    this.has = false;
    this.smooth = 0;
  }
}

/**
 * Turns raw pointer movement into a racket head offset + velocity.
 *
 * The racket head is pinned to the pointer but cannot leave RACKET_MAX of the
 * shoulder. Velocity is differentiated from frame-to-frame movement, with a
 * teleport guard so that lifting the mouse to re-centre does not register as a
 * monster swing.
 */
export class RacketTracker {
  private prevOx = 0;
  private prevOy = 0;
  private has = false;
  private svx = 0;
  private svy = 0;
  /** 拍头最近的真实轨迹（肩部相对坐标），拖尾沿它画 */
  readonly path = new SwingPath();

  reset(): void {
    this.has = false;
    this.svx = 0;
    this.svy = 0;
    this.path.clear();
  }

  update(
    targetX: number,
    targetY: number,
    shoulderX: number,
    shoulderY: number,
    dt: number,
    freezeVelocity = false,
    cfg: WorldConfig = DEFAULT_CONFIG,
  ): RacketState {
    let ox = targetX - shoulderX;
    let oy = targetY - shoulderY;
    const d = Math.hypot(ox, oy);
    if (d > cfg.racketMax) {
      ox = (ox / d) * cfg.racketMax;
      oy = (oy / d) * cfg.racketMax;
    }

    // Differentiate the *offset*, not the world position, so simply running
    // sideways does not count as a swing.
    let vx = 0;
    let vy = 0;
    if (!freezeVelocity && this.has && dt > 1e-4) {
      const mx = ox - this.prevOx;
      const my = oy - this.prevOy;
      if (Math.hypot(mx, my) <= cfg.racketTeleport) {
        vx = mx / dt;
        vy = my / dt;
      }
    }
    const sp = Math.hypot(vx, vy);
    if (sp > cfg.racketSpeedCap) {
      vx = (vx / sp) * cfg.racketSpeedCap;
      vy = (vy / sp) * cfg.racketSpeedCap;
    }
    if (freezeVelocity) {
      this.svx = 0;
      this.svy = 0;
    } else {
      this.svx += (vx - this.svx) * cfg.racketSmooth;
      this.svy += (vy - this.svy) * cfg.racketSmooth;
    }
    this.prevOx = ox;
    this.prevOy = oy;
    this.has = true;
    this.path.record(ox, oy, dt);

    return { rx: ox, ry: oy, rvx: this.svx, rvy: this.svy };
  }
}
