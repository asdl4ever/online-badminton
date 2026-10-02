import Phaser from 'phaser';
import { FONT_EMOJI, FONT_NUM, FONT_UI, P } from '../theme';
import { PLAYER_H, SHOULDER_DY, VIEW_H, VIEW_W } from '../constants';
import { sanitizeCosmetic, type Cosmetic } from '../cosmetics';
import { drawCharacter } from '../draw/character';
import { drawRacketHead, racketFrameColor } from '../draw/racket';
import { GROUND_Y, LEVEL_TOP, ROCKS, SPAWN, SUMMIT, WALL_L, WALL_R, type Rock } from './level';

/**
 * Getting Over It, with a badminton racket.
 *
 * The whole point of the original is that you *cannot* move the character —
 * the only input is the angle of the stick, and everything that happens is the
 * rigid-body solver reacting to it. So there is no walk, no jump and no air
 * control here: the pot is a free body, the racket is a second free body, and a
 * pin joint ties them together. Turning the racket is all you get.
 *
 * Matter is used through Phaser's scene plugin (`this.matter`), which exposes
 * the raw Matter API — bodies, constraints and the world all live under it.
 */

/**
 * Tuning knobs. These are the whole game — Getting Over It lives or dies on
 * how the arm feels, so they are all in one place.
 */
/**
 * The player is the badminton character, and the climbing tool is their racket.
 * The collider is a single disc around the torso — big enough to stand on a
 * ledge, small enough that the head and the racket still stick out past it.
 */
/** torso collider radius */
const BODY_R = 30;
/** where the arm pivots, above the body centre (matches the match scene's shoulder) */
const SHOULDER_UP = Math.round(PLAYER_H * SHOULDER_DY - BODY_R);
const BODY_DENSITY = 0.0022;
/** the racket is a long, heavy stick — the length is the mechanical advantage */
const ROD_LEN = 150;
const ROD_W = 11;
const ROD_DENSITY = 0.005;
/** the racket head is drawn bigger than on court, so it reads as a climbing hook */
const HEAD_SCALE = 2;
/**
 * The arm is driven as a torque, expressed as a real angular acceleration.
 * Matter accumulates rotation as `Δω = torque / inertia · Δt²` with an internal
 * Δt of ≈16.67 ms, so multiplying by `inertia / DT_MS²·60` turns "rad/s²" into
 * the number Matter wants. Getting this wrong is what made the rig either
 * unable to lift itself or launch itself into orbit.
 */
const DT_MS = 1000 / 60;
const TORQUE_SCALE = DT_MS * DT_MS * 60;
/**
 * The arm is a PD controller: it pushes towards the pointer in proportion to
 * the angle error and brakes in proportion to how fast it is already spinning.
 *
 * The two terms are clamped separately. Clamping their *sum* (an earlier
 * version did) lets a fast-spinning arm saturate the clamp, which removes the
 * braking entirely and leaves it spinning out of control.
 */
/** rad/s² per rad of angle error */
const ARM_KP = 30;
/** rad/s² per rad/s of angular velocity */
const ARM_KD = 8;
/** the drive term's cap, so a huge error cannot whip the arm around */
const ARM_ALPHA = 45;
/** the braking term's cap — high, because it has to win against the drive */
const BRAKE_ALPHA = 300;
/** hard angular speed limit, in case everything else fails */
const MAX_SPIN = 18;
/**
 * The character and their own racket share a negative collision group, so the
 * arm can sweep a full 360° without snagging on the body it is attached to.
 */
const SELF_GROUP = -7;
/**
 * Matter's `body.velocity` is **pixels per step**, not per second — using
 * px/s here made the character thirteen times too fast. Everything below is
 * written in familiar px/s and converted by STEP where it touches the engine.
 */
const STEP = 1 / 60;
/** walking */
const WALK_SPEED = 190;
const WALK_ACC = 1500;
/** the character is not allowed to fly; a safety net against solver blow-ups */
const BODY_MAX_V = 1400;
/** px per "metre" on the HUD */
const PX_PER_M = 90;

function rockCorners(r: Rock): Phaser.Math.Vector2[] {
  const a = r.angle ?? 0;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const hw = r.w / 2;
  const hh = r.h / 2;
  return [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ].map(([px, py]) => new Phaser.Math.Vector2(r.x + px * c - py * s, r.y + px * s + py * c));
}

export class ClimbScene extends Phaser.Scene {
  private pot!: MatterJS.BodyType;
  private rod!: MatterJS.BodyType;
  private follower!: Phaser.GameObjects.Zone;
  private bg!: Phaser.GameObjects.Graphics;
  private fg!: Phaser.GameObjects.Graphics;
  private info!: Phaser.GameObjects.Text;
  private banner!: Phaser.GameObjects.Text;
  /** the character's emoji face lives in a Text, like on the court */
  private face!: Phaser.GameObjects.Text;
  private cos: Cosmetic = sanitizeCosmetic(undefined);
  private keys!: { left: Phaser.Input.Keyboard.Key[]; right: Phaser.Input.Keyboard.Key[] };
  private pointerWorld = new Phaser.Math.Vector2();
  private bestHeight = 0;
  private elapsed = 0;
  private finished = false;
  private finishTime = 0;

  constructor() {
    super('ClimbScene');
  }

  init(data: Cosmetic | undefined): void {
    if (data) this.cos = sanitizeCosmetic(data);
  }

  create(): void {
    this.cameras.main.setBounds(0, LEVEL_TOP, VIEW_W, GROUND_Y + 200 - LEVEL_TOP);
    this.cameras.main.setBackgroundColor(P.climbSky);

    this.bg = this.add.graphics().setDepth(0);
    this.fg = this.add.graphics().setDepth(10);
    this.drawTerrain();

    this.buildPhysics();

    this.follower = this.add.zone(SPAWN.pot.x, SPAWN.pot.y, 1, 1);
    this.cameras.main.startFollow(this.follower, false, 0.12, 0.12);

    this.face = this.add
      .text(0, 0, '', { fontFamily: FONT_EMOJI, fontSize: '30px' })
      .setOrigin(0.5)
      // depth 1：在角色所在的前景层（10）之下、背景（0）之上，装备不会被 emoji 盖住
      .setDepth(1)
      .setVisible(false);

    this.info = this.add
      .text(20, 18, '', {
        fontFamily: FONT_NUM,
        fontSize: '20px',
        color: '#eaf3ff',
        lineSpacing: 6,
      })
      .setScrollFactor(0)
      .setDepth(20);

    this.banner = this.add
      .text(VIEW_W / 2, VIEW_H / 2, '', {
        fontFamily: FONT_UI,
        fontSize: '44px',
        fontStyle: 'bold',
        color: '#ffd166',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21)
      .setVisible(false);

    this.add
      .text(VIEW_W - 20, 18, '移动鼠标转动球拍 · R 重来', {
        fontFamily: FONT_UI,
        fontSize: '16px',
        color: '#9fb4d0',
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(20);

    this.input.on('pointermove', this.onPointer, this);
    const kb = this.input.keyboard!;
    this.keys = {
      left: [kb.addKey('A'), kb.addKey('LEFT')],
      right: [kb.addKey('D'), kb.addKey('RIGHT')],
    };
    kb.on('keydown-R', () => this.restart());

    this.targetFromPointer();
  }

  // ---- physics ------------------------------------------------------------

  private buildPhysics(): void {
    // rocks: static boxes, exactly the shapes drawn above
    for (const r of ROCKS) {
      this.matter.add.rectangle(r.x, r.y, r.w, r.h, {
        isStatic: true,
        angle: r.angle ?? 0,
        friction: 0.95,
        frictionStatic: 1.2,
        label: 'rock',
      });
    }

    // side walls, so the pot cannot wander out of the shaft
    const wallH = GROUND_Y - LEVEL_TOP + 400;
    const wallY = (GROUND_Y + LEVEL_TOP) / 2;
    for (const wx of [WALL_L, WALL_R]) {
      this.matter.add.rectangle(wx, wallY, 40, wallH, {
        isStatic: true,
        friction: 0.4,
        label: 'wall',
      });
    }

    // the character's torso: high friction, low restitution — thud, not bounce
    this.pot = this.matter.add.circle(SPAWN.pot.x, SPAWN.pot.y, BODY_R, {
      friction: 0.9,
      frictionStatic: 1,
      frictionAir: 0.006,
      restitution: 0,
      density: BODY_DENSITY,
      label: 'pot',
      collisionFilter: { group: SELF_GROUP },
    });

    // The racket spawns lying flat at shoulder height, grip anchor exactly on
    // the joint. Both halves of that matter: an overlapping or mis-anchored
    // spawn makes the solver correct it hard every frame, which reads as the
    // whole character shivering.
    const grip = ROD_LEN / 2 - 6;
    const shoulder = { x: SPAWN.pot.x, y: SPAWN.pot.y - SHOULDER_UP };
    this.rod = this.matter.add.rectangle(shoulder.x + grip, shoulder.y, ROD_LEN, ROD_W, {
      angle: 0,
      friction: 1,
      frictionStatic: 2,
      frictionAir: 0.008,
      restitution: 0,
      density: ROD_DENSITY,
      label: 'rod',
      collisionFilter: { group: SELF_GROUP },
    });

    // the pin: the character's shoulder to the racket's grip. A stiff joint
    // keeps the arm solid while still letting the solver bend it under load.
    this.matter.add.constraint(this.pot, this.rod, 0, 0.9, {
      pointA: { x: 0, y: -SHOULDER_UP },
      pointB: { x: -ROD_LEN / 2 + 6, y: 0 },
      damping: 0.12,
    } as Phaser.Types.Physics.Matter.MatterConstraintConfig);
  }

  private restart(): void {
    this.scene.restart();
  }

  // ---- input --------------------------------------------------------------

  private onPointer(p: Phaser.Input.Pointer): void {
    const w = this.cameras.main.getWorldPoint(p.x, p.y);
    this.pointerWorld.set(w.x, w.y);
  }

  /** with no pointer yet, aim the racket straight down-and-right */
  private targetFromPointer(): void {
    this.pointerWorld.set(SPAWN.pot.x + 120, SPAWN.pot.y + 90);
  }

  // ---- loop ---------------------------------------------------------------

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 0.05);
    if (!this.finished) this.elapsed += dt;

    const pos = this.pot.position;

    // ---- walking: the character is a normal physics body you can move -------
    const held = (k: Phaser.Input.Keyboard.Key[]) => k.some((key) => key.isDown);
    const dir = (held(this.keys.left) ? -1 : 0) + (held(this.keys.right) ? 1 : 0);
    const vx = this.pot.velocity.x;
    const target = (dir * WALK_SPEED * STEP);
    const dv = WALK_ACC * STEP * STEP;
    this.matter.body.setVelocity(this.pot, {
      x: vx + Phaser.Math.Clamp(target - vx, -dv, dv),
      y: this.pot.velocity.y,
    });

    // ---- the arm chases the pointer as a torque, not as an angle override ---
    const want = Math.atan2(this.pointerWorld.y - pos.y, this.pointerWorld.x - pos.x);
    const diff = Phaser.Math.Angle.Wrap(want - this.rod.angle);
    const drive = Phaser.Math.Clamp(ARM_KP * diff, -ARM_ALPHA, ARM_ALPHA);
    const brake = Phaser.Math.Clamp(-ARM_KD * this.rod.angularVelocity, -BRAKE_ALPHA, BRAKE_ALPHA);
    this.rod.torque += ((drive + brake) * this.rod.inertia) / TORQUE_SCALE;

    // safety net: a spinning arm would otherwise never come back
    if (Math.abs(this.rod.angularVelocity) > MAX_SPIN) {
      this.matter.body.setAngularVelocity(
        this.rod,
        Math.sign(this.rod.angularVelocity) * MAX_SPIN,
      );
    }

    // the solver can still spit the character somewhere silly on a bad overlap
    const v = this.pot.velocity;
    const speed = Math.hypot(v.x, v.y);
    const cap = BODY_MAX_V * STEP;
    if (speed > cap) {
      this.matter.body.setVelocity(this.pot, {
        x: (v.x / speed) * cap,
        y: (v.y / speed) * cap,
      });
    }

    const height = GROUND_Y - pos.y;
    if (height > this.bestHeight) this.bestHeight = height;

    if (!this.finished && pos.y <= SUMMIT.y) {
      this.finished = true;
      this.finishTime = this.elapsed;
      this.banner.setText(`登顶！ ${this.finishTime.toFixed(1)}s`).setVisible(true);
    }

    this.follower.setPosition(pos.x, pos.y - 150);
    this.draw();
    this.drawHud(height);
  }

  // ---- rendering ----------------------------------------------------------

  private drawTerrain(): void {
    const g = this.bg;
    g.clear();

    // fog bands so the depth reads without a parallax layer
    for (let i = 0; i < 9; i++) {
      const y = LEVEL_TOP + i * 340;
      g.fillStyle(P.climbFog, 0.28);
      g.fillRect(0, y, VIEW_W, 170);
    }

    for (const r of ROCKS) {
      const pts = rockCorners(r);
      g.fillStyle(P.climbRock, 1);
      g.fillPoints(pts, true);
      // lit crust along the top edge only
      g.lineStyle(3, P.climbRockTop, 0.9);
      g.lineBetween(pts[0].x, pts[0].y, pts[1].x, pts[1].y);
      g.lineStyle(1.5, 0x2c394d, 0.5);
      g.strokePoints(pts, true);
    }

    // summit flag
    g.lineStyle(4, P.climbRockTop, 0.9);
    g.lineBetween(SUMMIT.x, SUMMIT.y - 34, SUMMIT.x, SUMMIT.y - 150);
    g.fillStyle(P.climbFlag, 0.95);
    g.fillTriangle(
      SUMMIT.x,
      SUMMIT.y - 150,
      SUMMIT.x + 62,
      SUMMIT.y - 132,
      SUMMIT.x,
      SUMMIT.y - 114,
    );
  }

  private draw(): void {
    const g = this.fg;
    const now = this.time.now;
    g.clear();

    // the character, anchored so the collider's bottom is where the feet are
    const pos = this.pot.position;
    drawCharacter(g, now, this.cos, {
      x: pos.x,
      feetY: pos.y + BODY_R,
      facing: this.pointerWorld.x >= pos.x ? 1 : -1,
      color: P.player0,
    }, { face: this.face, shadow: pos.y + BODY_R >= GROUND_Y - 2 });

    // The racket: a long shaft out to the tip, with the court racket's head on
    // the end, scaled up enough to read as a climbing hook. The head's far
    // edge is placed exactly at the collider's tip, so what you hook with is
    // what you hit with.
    const r = this.rod;
    const headEdge = ROD_LEN / 2 - 17 * HEAD_SCALE;
    g.save();
    g.translateCanvas(r.position.x, r.position.y);
    g.rotateCanvas(r.angle);
    g.lineStyle(ROD_W, P.grip, 0.95);
    g.lineBetween(-ROD_LEN / 2, 0, headEdge, 0);
    g.translateCanvas(headEdge - 9 * HEAD_SCALE, 0);
    g.scaleCanvas(HEAD_SCALE, HEAD_SCALE);
    drawRacketHead(g, now, this.cos.racketSkin, racketFrameColor(this.cos.racketSkin, this.cos.racket));
    g.restore();
  }

  private drawHud(height: number): void {
    const m = Math.max(0, height) / PX_PER_M;
    const best = Math.max(0, this.bestHeight) / PX_PER_M;
    const total = (GROUND_Y - SUMMIT.y) / PX_PER_M;
    this.info.setText(
      [
        `高度  ${m.toFixed(1)}m / ${total.toFixed(1)}m`,
        `最高  ${best.toFixed(1)}m`,
        `用时  ${this.elapsed.toFixed(1)}s`,
      ].join('\n'),
    );
  }
}
