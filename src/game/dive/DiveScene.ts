import Phaser from 'phaser';
import { PLAYER_H, VIEW_H, VIEW_W } from '../constants';
import { createPlayerRig, type PlayerRig } from '../draw/rig';
import { RacketTracker } from '../racket';
import { TouchControls, isTouchDevice } from '../touch';
import { joystickAlwaysOn } from '../device';
import type { WorldConfig } from '../config';
import type { Cosmetic } from '../cosmetics';
import { P } from '../theme';
import { sfx } from '../audio';
import type { NetLink } from '../../net/link';
import {
  BOAT_COST,
  KING_CHANCE,
  KING_KG_MULT,
  KING_SPEED_MULT,
  KING_VALUE_MULT,
  SHINY_CHANCE,
  SHINY_VALUE_MULT,
  bagLimits,
  fishValue,
  gearStats,
  islandById,
  oxygenMax,
  sizeScale,
  speciesById,
  type Island,
  type Species,
} from './fish';

/**
 * 潜水抓鱼（替代原来的岸边抛竿）。
 *
 * 世界是**竖着的一片海**：y = 0 是水面，越往下越深越贵。左摇杆 8 向游动（WASD 同理），
 * 按住跳跃键/上推 = 上浮；氧气决定能待多久，背包决定一趟能带多少，渔具决定能拉住多大的鱼。
 *
 * 抓鱼沿用羽毛球那套球拍追踪（`RacketTracker`）：右摇杆/鼠标把拍头指到鱼身上就勾住，
 * 之后**一直朝着鱼的方向**才能把线收回来——所以"方向"是有意义的输入，而不是碰到就进包。
 *
 * 两条风险规则：
 * - **鱼刷在中层与深海**（`DEPTH_ZONES`：浅层 18%、中层 42%、深海 40%），浅水只有零星几条；
 * - **氧气耗尽 = 这一趟白潜**：背包全丢、黑屏、人被送回沙滩（见 `suffocate`），
 *   页面那边挂着的宝箱收获也一起没（`DiveSceneData.onWipeout`）。
 */

// ---- 岸上（沙滩 + 装备店） -------------------------------------------------
/** 水面在世界坐标 y = 0；沙滩在水面之上，从左边高阶一路斜到水边 */
const WATER_Y = 0;
/** 沙滩最高处（世界 y，负数是水面上方） */
const SAND_Y = -120;
/** 沙滩右边界：再往右就是外海 */
const SHORE_RIGHT = 900;
const SHORE_LEFT = -140;
/** 天空画到哪 */
const SKY_TOP = -560;
/** 装备店（小屋）位置与交互半径 */
const HUT_X = 360;
const HUT_R = 130;
/** 木栈桥：水面上的平台，走到尽头就下海；船停在桥尾外 */
const PIER_X0 = SHORE_RIGHT - 70;
const PIER_X1 = SHORE_RIGHT + 120;
const PIER_Y = WATER_Y - 8;
/** 船：一条停在岸边的船，点它就能交互（买船 / 出海） */
const BOAT_X = SHORE_RIGHT + 230;
const BOAT_Y = WATER_Y + 14;
const BOAT_R = 280;
/** 鱼和水下危险只在真正的海里活动（岸那一侧是沙滩） */
const SEA_LEFT = SHORE_RIGHT + 70;
/** 岸上的走 / 跳 */
const WALK_ACCEL = 1700;
const WALK_MAX = 320;
const WALK_FRICTION = 6.5;
const LAND_GRAVITY = 2100;
const JUMP_V = -660;

// ---- 手感旋钮 --------------------------------------------------------------
const SEA_W = 2600;
const SEA_EDGE = 60;
const SWIM_ACCEL = 1150;
const SWIM_MAX = 330;
/** 每秒衰减比例（水阻） */
const WATER_DRAG = 2.6;
/** 中性浮力偏差：不按上就缓缓下沉 */
const SINK = 72;
const UP_ACCEL = 640;
/** 浮在这个深度里算在水面，氧气回满 */
const SURFACE_BAND = 46;
const OXYGEN_REFILL = 9;
const OXYGEN_DRAIN = 1;
/**
 * 深度带来的额外耗气，**平方曲线**：`drain = 1 + 0.00055·y + 1.4e-7·y²`（y 是水深 px，
 * 10px = 1m）。也就是每米的代价本身在变大，越深越寸步难行：
 *
 * | 深度 | 耗气/秒 | 往返一趟大约要 | 需要的氧气罐 |
 * |---|---|---|---|
 * | 100m | 1.69 | 8s | Lv1（36s）随便潜 |
 * | 200m | 2.66 | 21s | Lv1 勉强、Lv2 稳 |
 * | 320m | 4.19 | 46s | Lv2 |
 * | 500m | 7.25 | 107s | Lv4（120s） |
 * | 640m | 10.25 | 181s | Lv8（232s）才摸得到底 |
 *
 * （往返时间按 `SWIM_MAX` 330px/s 直上直下积分估的，实际会上下浮一点。）
 */
const OXYGEN_DEEP = 0.00055;
/** 上面那条平方项：每 px² 的额外消耗 */
const OXYGEN_DEEP2 = 1.4e-7;

const HOOK_COOLDOWN = 0.4;
/** 对准鱼时收杆速度（每秒进度） */
const REEL_GAIN = 0.66;
/** 没对准时每秒掉的进度 */
const REEL_DECAY = 0.34;
/** 鱼跑出这个距离就脱钩 */
const REEL_ESCAPE = 110;
/** 鱼竿朝向与"指向鱼"的点积阈值 */
const REEL_ALIGN = 0.35;
/** 一次游多少帧内不会被同一只水母连着电 */
const JELLY_R = 26;
const JELLY_OXY = 0.26;
const JELLY_STUN = 0.9;
const SHARK_R = 44;
const SHARK_RANGE = 280;
const SHARK_SPEED = 270;
/** 场上鱼的目标数量（之前 18 条太挤，降到 10） */
const FISH_TARGET = 10;
const FISH_RESPAWN = 1.4;
/**
 * 刷鱼的深度倾向（按海床深度取比例，`0` = 水面、`1` = 海床）：
 * **浅层只有零星几条，鱼基本都在中层与深海**——想要好东西就得往下潜。
 * 具体落在哪一层由权重抽，抽完再在这一层能住的鱼种里挑一条（见 `spawnRandomFish`）。
 */
const DEPTH_ZONES: { from: number; to: number; weight: number }[] = [
  { from: 0, to: 0.22, weight: 0.18 }, // 浅层：少
  { from: 0.22, to: 0.62, weight: 0.42 }, // 中层：多
  { from: 0.62, to: 1, weight: 0.4 }, // 深海：多
];

/** 每条鱼的配色（画面上区分鱼种） */
const FISH_COLOR: Record<string, number> = {
  sardine: 0xbcd4e6,
  clown: 0xff9a3c,
  bass: 0x9fb8c8,
  octopus: 0xd06a8a,
  lobster: 0xd8554a,
  amberjack: 0xf0d98a,
  tuna: 0x5b7fa8,
  angler: 0x6a5a8a,
  grouper: 0x7a8f6a,
  oarfish: 0xcfe8ff,
};

interface Diver {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  /** 站在沙滩上（而不是在水里） */
  onGround: boolean;
}

interface Fish {
  sp: Species;
  kg: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  state: 'swim' | 'hooked' | 'gone';
  /** 收杆进度 0..1 */
  reel: number;
  /** 被勾住后拖拽的方向 */
  pullX: number;
  pullY: number;
  /** > 0 表示"拉不动"的挣扎倒计时 */
  escaped: number;
  /** 闪光变体：金色发光，价值 ×5 */
  shiny: boolean;
  /** 鱼王：超大个体，价值 ×3 + 专属成就 */
  king: boolean;
}

/** 海底宝箱：靠近按 E 拾取（仅本机生成，不进联机同步） */
interface Chest {
  x: number;
  y: number;
  phase: number;
}

interface Jelly {
  x: number;
  y: number;
  phase: number;
}

interface Shark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mode: 'patrol' | 'chase' | 'retreat';
  timer: number;
  hit: number;
}

interface Current {
  y: number;
  dir: 1 | -1;
  strength: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  v: number;
}

interface Caught {
  id: string;
  name: string;
  emoji: string;
  kg: number;
  value: number;
}

export interface DiveBagState {
  count: number;
  kg: number;
  value: number;
  items: Caught[];
}

export interface DiveSceneData {
  cosmetic: Cosmetic;
  session: NetLink | null;
  islandId: string;
  oxygenLv: number;
  bagLv: number;
  gearLv: number;
  /** 有没有船（岸上画一条船、决定能不能出海） */
  boat?: boolean;
  onBag?: (state: DiveBagState) => void;
  onCatch?: (speciesId: string, kg: number, value: number, flags: { shiny: boolean; king: boolean }) => void;
  /**
   * 氧气耗尽：这一趟的渔获**全丢**、黑屏后被送回沙滩。
   * 参数是本局丢掉的鱼条数（页面据此提示；挂着的宝箱收获由页面自己清）。
   */
  onWipeout?: (lost: number) => void;
  onHurt?: (what: 'jelly' | 'shark') => void;
  /** 开宝箱：页面侧发奖励并返回弹字文案 */
  onChest?: () => string;
  /** 消耗一个「闪光鱼饵」：有就返回 true，这条鱼必为闪光 */
  consumeShinyBait?: () => boolean;
  /**
   * 上岸状态：装备店只开在岸上，所以页面要知道人是不是已经上岸、有没有走到门口。
   */
  onShore?: (state: { onLand: boolean; nearHut: boolean; nearBoat: boolean }) => void;
  /** 在岸上、站在装备店门口按了 E */
  onShop?: (fromHutTap?: boolean) => void;
  /** 点了岸边那条船（或站在旁边按 E）：买船 / 出海都从这里进 */
  onBoat?: () => void;
  /**
   * 下潜深度上报（每深 5 米报一次）：成就里的「潜到 100m」这类靠它。
   * 单位是米（和 UI 里的海床深度一致：世界坐标 10px = 1m）。
   */
  onStats?: (state: { maxDepth: number }) => void;
}

export class DiveScene extends Phaser.Scene {
  private cfg!: DiveSceneData;
  private island!: Island;
  private me!: Diver;
  private remote: Diver | null = null;
  private remoteAng = -0.8;
  private remoteReach = 0;

  private rigMe!: PlayerRig;
  private rigOther!: PlayerRig;
  private g!: Phaser.GameObjects.Graphics;
  /** 角色单独一层（depth 2）：emoji 脸在它之下，装备不会被脸盖住 */
  private charG!: Phaser.GameObjects.Graphics;
  /** 帽子/宠物层：在 emoji 头（depth 3）之上 */
  private charOverG!: Phaser.GameObjects.Graphics;
  private hudG!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  private racket = new RacketTracker();
  private touchControls: TouchControls | null = null;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  /** 鱼竿（球拍）最近的姿态：拍头相对肩膀的偏移 */
  private racketRX = 40;
  private racketRY = -10;
  private racketAng = -0.8;
  private racketReach = 40;
  /** 拍头速度（px/s）：只用来驱动挥拍拖尾 */
  private racketSpeed = 0;

  private oxygen = 30;
  private stun = 0;
  private hookCd = 0;
  private hooked: Fish | null = null;
  private bag: Caught[] = [];
  private caughtValue = 0;
  private respawnTimer = 0;
  private netClock = 0;
  private wipeout = 0;
  private bubbles: Bubble[] = [];
  private pops: { t: Phaser.GameObjects.Text; life: number }[] = [];
  /** 站在沙滩上（不是在水里） */
  private onLand = false;
  /** 站在装备店门口 */
  private nearHut = false;
  /** 站在小船旁边 */
  private nearBoat = false;
  /** 这一趟已上报过的最深下潜（米） */
  private reportedDepth = 0;
  /** 没买船时，船上挂的「出售」牌子 */
  private boatSign: Phaser.GameObjects.Text | null = null;
  /** 上一次报给页面的上岸状态，避免每帧回调 */
  private shoreNotified = false;
  private shoreKey: Phaser.Input.Keyboard.Key | null = null;

  private fish: Fish[] = [];
  private jellies: Jelly[] = [];
  private sharks: Shark[] = [];
  private currents: Current[] = [];
  /** 海底宝箱（同屏最多一个），null = 还没刷出来 */
  private chest: Chest | null = null;
  /** 距离下一次刷宝箱的秒数 */
  private chestTimer = 15;
  private nearChest = false;

  constructor() {
    super('DiveScene');
  }

  create(data: DiveSceneData): void {
    this.cfg = data;
    this.island = islandById(data.islandId);
    this.oxygen = oxygenMax(data.oxygenLv);
    this.bag = [];
    this.caughtValue = 0;
    this.fish = [];
    this.jellies = [];
    this.sharks = [];
    this.currents = [];
    this.bubbles = [];
    this.hooked = null;
    this.wipeout = 0;
    this.stun = 0;

    // 从沙滩上开始：先看见岸、装备店和水边的船，再自己走进海里
    const startX = 640;
    this.me = {
      x: startX,
      y: this.shoreFloor(startX),
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: true,
    };
    this.onLand = true;
    this.nearHut = false;
    this.shoreNotified = false;
    this.reportedDepth = 0;

    this.g = this.add.graphics();
    this.charG = this.add.graphics().setDepth(2);
    this.charOverG = this.add.graphics().setDepth(4);
    this.hudG = this.add.graphics().setScrollFactor(0).setDepth(40);
    this.rigMe = createPlayerRig(this);
    this.rigOther = createPlayerRig(this);

    // 装备店招牌（世界坐标，跟着镜头走）
    this.add
      .text(HUT_X, this.shoreFloor(HUT_X) - 286, '装备店', {
        fontFamily: 'inherit',
        fontSize: '22px',
        color: '#3a2a18',
        fontStyle: 'bold',
        backgroundColor: '#f6e3b8',
        padding: { x: 10, y: 4 },
      })
      .setOrigin(0.5)
      .setDepth(8);

    // 没买船时，船上挂一块「出售」牌子
    this.boatSign = this.add
      .text(BOAT_X, BOAT_Y - 92, `出售 ¥${BOAT_COST}`, {
        fontFamily: 'inherit',
        fontSize: '18px',
        color: '#3a2a18',
        fontStyle: 'bold',
        backgroundColor: '#ffd45c',
        padding: { x: 8, y: 3 },
      })
      .setOrigin(0.5)
      .setDepth(8)
      .setVisible(!data.boat);

    this.hudText = this.add
      .text(VIEW_W / 2, VIEW_H - 58, '', { fontFamily: 'inherit', fontSize: '17px', color: '#eaf6ff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41);
    this.hintText = this.add
      .text(VIEW_W / 2, VIEW_H - 84, '', { fontFamily: 'inherit', fontSize: '15px', color: '#9fe8ff' })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(41);

    this.buildHazards();
    for (let i = 0; i < FISH_TARGET; i++) this.spawnRandomFish();

    this.cameras.main.setBounds(0, SKY_TOP, SEA_W, this.island.floor + 320 - SKY_TOP);
    this.cameras.main.startFollow(this.hudAnchor(), true, 0.12, 0.12);

    const kb = this.input.keyboard;
    if (kb) {
      this.keys = kb.addKeys('A,D,W,S,LEFT,RIGHT,UP,DOWN,SPACE,E') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
      this.shoreKey = this.keys.E ?? null;
    }
    this.input.addPointer(3);
    // 触屏必开；桌面端开了「摇杆常显」也开
    this.touchControls = isTouchDevice() || joystickAlwaysOn() ? new TouchControls(this) : null;

    // 岸边那条船：点一下就能交互（买船 / 出海）；海里的宝箱也一样；
    // 装备店小屋同样可以点（手机上没有 E 键）
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.boatHit(p.worldX, p.worldY)) {
        this.cfg.onBoat?.();
        return;
      }
      if (this.hutHit(p.worldX, p.worldY)) {
        // 点中了小屋 = 明确要进店，绕过"必须上岸"的状态判定（手机点不开的根源）
        this.cfg.onShop?.(true);
        return;
      }
      if (
        this.chest &&
        Phaser.Math.Distance.Between(p.worldX, p.worldY, this.chest.x, this.chest.y) < 80
      ) {
        this.pickChest();
      }
    });

    const link = this.cfg.session;
    if (link) {
      link.onMessage = (m) => {
        if (m.t === 'fishPose') {
          if (!this.remote) {
            this.remote = { x: m.x, y: m.y, vx: 0, vy: 0, facing: 1, onGround: false };
          }
          this.remote.x = m.x;
          this.remote.y = m.y;
          this.remoteAng = m.a;
          this.remoteReach = m.r;
          this.remote.facing = m.x > this.me.x ? -1 : 1;
        } else if (m.t === 'fishCatch') {
          this.pop(`好友钓到 ${m.fish}`, 0x9fe8ff);
        }
      };
      link.onDisconnected = () => {
        this.remote = null;
        this.pop('好友已上船', 0x8b97a8);
      };
    }

    this.cameras.main.fadeIn(300, 0, 0, 0);
    this.pushBag();
  }

  /** 相机跟随用一个不可见的锚点，避免直接跟玩家时抖动 */
  private anchor!: Phaser.GameObjects.Zone;
  private hudAnchor(): Phaser.GameObjects.Zone {
    if (!this.anchor) this.anchor = this.add.zone(this.me.x, this.me.y, 1, 1);
    return this.anchor;
  }

  /** 岸上升级完装备后热更新等级（不用重开一局，背包里的鱼也不会丢） */
  setLevels(l: { oxygenLv: number; bagLv: number; gearLv: number }): void {
    this.cfg.oxygenLv = l.oxygenLv;
    this.cfg.bagLv = l.bagLv;
    this.cfg.gearLv = l.gearLv;
  }

  /** 当前背包里的鱼数（岸上判断能不能出海时用） */
  bagCount(): number {
    return this.bag.length;
  }

  /** 刚买了船：栈桥旁边那条船立刻换成有帆的（不用重开一局） */
  setBoat(on: boolean): void {
    this.cfg.boat = on;
    this.boatSign?.setVisible(!on);
  }

  /** 点到的位置在船身上吗（世界坐标），给「点击小船」交互用 */
  private boatHit(x: number, y: number): boolean {
    const bob = Math.sin(this.time.now / 700) * 3;
    const dx = (x - BOAT_X) / 155;
    const dy = (y - (BOAT_Y + bob) + 34) / 120;
    return dx * dx + dy * dy <= 1;
  }

  /** 点到的位置在装备店小屋上吗（世界坐标），手机没有 E 键，点小屋=打开装备店 */
  private hutHit(x: number, y: number): boolean {
    const base = this.shoreFloor(HUT_X);
    return Math.abs(x - HUT_X) < 130 && y > base - 280 && y < base + 16;
  }

  update(_time: number, delta: number): void {
    const dt = Math.min(delta / 1000, 1 / 20);
    this.stun = Math.max(0, this.stun - dt);
    this.hookCd = Math.max(0, this.hookCd - dt);
    this.wipeout = Math.max(0, this.wipeout - dt);

    this.stepDiver(dt);

    // 最深下潜上报（每深 5 米一次）：成就里的「潜到 100m」靠它
    const depth = Math.max(0, this.me.y) / 10;
    if (depth >= this.reportedDepth + 5) {
      this.reportedDepth = Math.floor(depth / 5) * 5;
      this.cfg.onStats?.({ maxDepth: this.reportedDepth });
    }

    this.stepRacket(dt);
    this.stepOxygen(dt);
    this.stepFish(dt);
    this.stepHook(dt);
    this.stepChest(dt);
    this.stepHazards(dt);
    this.stepBubbles(dt);
    this.stepPops(dt);

    this.anchor.setPosition(this.me.x, this.me.y);
    this.draw();
    this.drawHud();
    this.touchControls?.draw();
    this.sendPose(dt);
  }

  // ---- 游动 / 岸上走动 ------------------------------------------------------
  /**
   * 沙滩的顶面高度：左边最高（`SAND_Y`），到右边界斜降到水面（0）。
   * 返回 `Infinity` 表示这里已经没有岸了，再往右就是外海。
   */
  private shoreFloor(x: number): number {
    // 木栈桥是可以走上去的平台（走到桥尾就掉进海里）
    if (x >= PIER_X0 && x <= PIER_X1) return PIER_Y;
    if (x >= SHORE_RIGHT) return Infinity;
    return this.sandTop(x);
  }

  /** 沙滩顶面本身（不含栈桥）：左边最高，到右边界降到水面 */
  private sandTop(x: number): number {
    const t = Phaser.Math.Clamp(x / SHORE_RIGHT, 0, 1);
    return SAND_Y * (1 - t);
  }

  private stepDiver(dt: number): void {
    const k = this.keys;
    const t = this.touchControls?.read();
    const left = k?.A.isDown || k?.LEFT.isDown || !!t?.left;
    const right = k?.D.isDown || k?.RIGHT.isDown || !!t?.right;
    const up = k?.W.isDown || k?.UP.isDown || k?.SPACE.isDown || !!t?.up || !!t?.jump;
    const down = k?.S.isDown || k?.DOWN.isDown || !!t?.down;

    const blocked = this.stun > 0 || this.wipeout > 0;
    const dirX = blocked ? 0 : (right ? 1 : 0) - (left ? 1 : 0);
    const dirY = blocked ? 0 : (down ? 1 : 0) - (up ? 1 : 0);

    const floorY = this.shoreFloor(this.me.x);
    const overLand = floorY !== Infinity;
    // 脚踩着沙滩（或在水边的那一线）就算上岸
    const grounded = overLand && this.me.y >= floorY - 2;

    if (grounded) {
      // 岸上：走路 + 跳，往右走出沙滩就掉进海里
      this.me.vx += dirX * WALK_ACCEL * dt;
      this.me.vx *= Math.max(0, 1 - WALK_FRICTION * dt);
      this.me.vx = Phaser.Math.Clamp(this.me.vx, -WALK_MAX, WALK_MAX);
      if ((up || this.wipeout > 0) && this.me.onGround) {
        this.me.vy = JUMP_V;
        this.me.onGround = false;
      }
      this.me.vy += LAND_GRAVITY * dt;
      this.me.x += this.me.vx * dt;
      this.me.y += this.me.vy * dt;
      const nextFloor = this.shoreFloor(this.me.x);
      // 站到新的地面上（或者走出沙滩，那就开始落水）
      if (nextFloor !== Infinity && this.me.y >= nextFloor) {
        this.me.y = nextFloor;
        this.me.vy = 0;
        this.me.onGround = true;
      } else {
        this.me.onGround = false;
      }
      this.me.x = Phaser.Math.Clamp(this.me.x, SEA_EDGE, SEA_W - SEA_EDGE);
    } else if (overLand) {
      // 沙滩上方：按陆地的重力掉回地面（跳起来的弧线）
      this.me.vx += dirX * WALK_ACCEL * 0.6 * dt;
      this.me.vx *= Math.max(0, 1 - WALK_FRICTION * 0.4 * dt);
      this.me.vx = Phaser.Math.Clamp(this.me.vx, -WALK_MAX, WALK_MAX);
      this.me.vy += LAND_GRAVITY * dt;
      this.me.x += this.me.vx * dt;
      this.me.y = Math.min(this.me.y + this.me.vy * dt, floorY);
      if (this.me.y >= floorY) {
        this.me.y = floorY;
        this.me.vy = 0;
        this.me.onGround = true;
      }
    } else {
      this.me.onGround = false;
      // 水里：8 向游动 + 水阻
      const rise = this.wipeout > 0 ? 1 : up ? 1 : 0;
      this.me.vx += dirX * SWIM_ACCEL * dt;
      this.me.vy += dirY * SWIM_ACCEL * dt;
      this.me.vy += SINK * dt;
      if (rise) this.me.vy -= (UP_ACCEL + (this.wipeout > 0 ? 900 : 0)) * dt;
      // 水面附近有浮力：不按住也能漂在水面回氧
      if (this.me.y < SURFACE_BAND) this.me.vy -= 300 * dt;

      const damp = Math.max(0, 1 - WATER_DRAG * dt);
      this.me.vx *= damp;
      this.me.vy *= damp;
      const sp = Math.hypot(this.me.vx, this.me.vy);
      if (sp > SWIM_MAX) {
        this.me.vx = (this.me.vx / sp) * SWIM_MAX;
        this.me.vy = (this.me.vy / sp) * SWIM_MAX;
      }

      this.me.x = Phaser.Math.Clamp(this.me.x + this.me.vx * dt, SEA_EDGE, SEA_W - SEA_EDGE);
      this.me.y = Phaser.Math.Clamp(this.me.y + this.me.vy * dt, 4, this.island.floor - 10);

      // 游动时冒泡
      if (sp > 90 && Math.random() < 0.5) {
        this.bubbles.push({
          x: this.me.x - this.me.facing * 16,
          y: this.me.y - PLAYER_H * 0.4,
          r: 1.5 + Math.random() * 2.5,
          v: 40 + Math.random() * 50,
        });
      }
    }

    if (Math.abs(this.me.vx) > 12) this.me.facing = this.me.vx > 0 ? 1 : -1;
    this.onLand = grounded;

    // 装备店：上岸走到小屋门口才能升级；小船：游到桥尾那一条也能点
    const nearHut = grounded && Math.abs(this.me.x - HUT_X) < HUT_R;
    const nearBoat =
      this.me.y < 170 && Math.hypot(this.me.x - BOAT_X, this.me.y - BOAT_Y) < BOAT_R;
    if (
      nearHut !== this.nearHut ||
      nearBoat !== this.nearBoat ||
      grounded !== this.shoreNotified
    ) {
      this.nearHut = nearHut;
      this.nearBoat = nearBoat;
      this.shoreNotified = grounded;
      this.cfg.onShore?.({ onLand: grounded, nearHut, nearBoat });
    }
    if (this.shoreKey && Phaser.Input.Keyboard.JustDown(this.shoreKey)) {
      if (nearHut) this.cfg.onShop?.();
      else if (nearBoat) this.cfg.onBoat?.();
      else if (this.chest && this.nearChest) this.pickChest();
    }
  }

  /** 球拍就是鱼竿：拍头指到鱼身上就勾住（和羽毛球同一套追踪） */
  private stepRacket(dt: number): void {
    const shoulderX = this.me.x;
    const shoulderY = this.me.y - PLAYER_H * 0.35;
    const max = gearStats(this.cfg.gearLv).hook + 46;
    const cfg = {
      racketMax: max,
      racketTeleport: 90,
      racketSpeedCap: 3200,
      racketSmooth: 0.55,
    } as unknown as WorldConfig;

    const tc = this.touchControls;
    let tx: number;
    let ty: number;
    let freeze: boolean;
    if (tc) {
      tx = shoulderX + (tc.joyActive ? tc.joyX * max : this.me.facing * 40);
      ty = shoulderY + (tc.joyActive ? tc.joyY * max : -10);
      freeze = !tc.joyActive;
    } else {
      const p = this.input.activePointer;
      tx = p.worldX;
      ty = p.worldY;
      freeze = false;
    }
    const st = this.racket.update(tx, ty, shoulderX, shoulderY, dt, freeze, cfg);
    this.racketRX = st.rx;
    this.racketRY = st.ry;
    this.racketAng = Math.atan2(st.ry, st.rx);
    this.racketReach = Math.hypot(st.rx, st.ry);
    this.racketSpeed = Math.hypot(st.rvx, st.rvy);
  }

  private headX(): number {
    return this.me.x + this.racketRX;
  }
  private headY(): number {
    return this.me.y - PLAYER_H * 0.35 + this.racketRY;
  }

  // ---- 氧气 ----------------------------------------------------------------
  private stepOxygen(dt: number): void {
    // 岸上（或浮在水面）都在呼吸空气：氧气回满
    const atSurface = this.onLand || this.me.y <= SURFACE_BAND;
    if (atSurface) {
      this.oxygen = Math.min(oxygenMax(this.cfg.oxygenLv), this.oxygen + OXYGEN_REFILL * dt);
      return;
    }
    // 越深越费气：线性 + 平方（平方项在 200m 以下开始顶事）
    const drain =
      OXYGEN_DRAIN + this.me.y * OXYGEN_DEEP + this.me.y * this.me.y * OXYGEN_DEEP2;
    this.oxygen -= drain * dt;
    if (this.oxygen <= 0) {
      this.oxygen = 0;
      this.suffocate();
    }
  }

  /**
   * 憋不住：**这一趟白潜**——背包里的鱼全丢（还没入港的宝箱收获由页面清），
   * 黑屏一下，然后人在沙滩上醒来（氧气给满，接着潜）。
   */
  private suffocate(): void {
    if (this.wipeout > 0) return;
    const lost = this.bag.length;
    this.bag = [];
    this.hooked = null;
    this.wipeout = 1.6;
    this.oxygen = oxygenMax(this.cfg.oxygenLv);
    this.cameras.main.shake(260, 0.01);
    sfx.hit('smash');
    this.pop('氧气耗尽！渔获全丢了…', 0xff6b6b);
    this.cfg.onWipeout?.(lost);
    this.pushBag();

    // 黑屏 → 送回岸上：不在水下瞬移，免得镜头一跳
    this.cameras.main.fadeOut(420, 0, 0, 0);
    this.time.delayedCall(460, () => {
      const x = 620;
      this.me.x = x;
      this.me.y = this.shoreFloor(x);
      this.me.vx = 0;
      this.me.vy = 0;
      this.me.onGround = true;
      this.me.facing = 1;
      this.cameras.main.fadeIn(380, 0, 0, 0);
    });
  }

  // ---- 鱼群 ----------------------------------------------------------------

  /** 某条鱼在这片海里能活动的上界（不能贴水面） */
  private bandTop(floor: number, raw: number): number {
    return Phaser.Math.Clamp(Math.max(SURFACE_BAND + 10, raw), 20, floor - 20);
  }

  /** 下界（不能钻进海床） */
  private bandBottom(floor: number, raw: number): number {
    return Phaser.Math.Clamp(Math.min(floor - 30, raw), 30, floor - 20);
  }

  /**
   * 刷一条（或一小群）鱼。顺序是**先定深度、再定鱼种**：
   * ① 按 `DEPTH_ZONES` 的权重抽一层（浅层只占一成多，中深海占大头）；
   * ② 只在这一层住得下的鱼种里按 `weight` 挑一条（这一层一条能住的都没有，
   *    就退回整个鱼池，贴着它自己的活动带刷）；
   * ③ 落点在「这段深度」∩「这条鱼的活动带」里。
   */
  private spawnRandomFish(): void {
    const floor = this.island.floor;
    const pool = this.island.fish
      .map((id) => speciesById(id))
      .filter((s): s is Species => !!s);
    if (!pool.length) return;

    // ① 抽深度层
    const zoneWeight = DEPTH_ZONES.reduce((s, z) => s + z.weight, 0);
    let zr = Math.random() * zoneWeight;
    let zone = DEPTH_ZONES[0];
    for (const z of DEPTH_ZONES) {
      zr -= z.weight;
      if (zr <= 0) {
        zone = z;
        break;
      }
    }
    const zTop = this.bandTop(floor, zone.from * floor);
    const zBot = this.bandBottom(floor, zone.to * floor);

    // ② 挑这一层里的鱼
    const here = pool.filter(
      (sp) => this.bandBottom(floor, sp.band[1]) > zTop && this.bandTop(floor, sp.band[0]) < zBot,
    );
    const use = here.length ? here : pool;
    const sum = use.reduce((s, sp) => s + sp.weight, 0);
    let wr = Math.random() * sum;
    let sp = use[0];
    for (const s of use) {
      wr -= s.weight;
      if (wr <= 0) {
        sp = s;
        break;
      }
    }

    // ③ 落点：这段深度 ∩ 它的活动带（兜底时只取活动带，保证有地方刷）
    let top = Math.max(zTop, this.bandTop(floor, sp.band[0]));
    let bot = Math.min(zBot, this.bandBottom(floor, sp.band[1]));
    if (bot - top < 20) {
      top = this.bandTop(floor, sp.band[0]);
      bot = this.bandBottom(floor, sp.band[1]);
    }

    // 鱼王：小概率刷出，单独一条、kg 拉满再放大
    const king = Math.random() < KING_CHANCE;
    // 闪光：鱼王不作闪光（王位不可叠加），闪光鱼饵直接点亮
    const shiny = !king && (this.cfg.consumeShinyBait?.() === true || Math.random() < SHINY_CHANCE);
    const group = king ? 1 : Math.max(1, Math.min(sp.school, 3));
    const baseX = Phaser.Math.FloatBetween(SEA_LEFT + 80, SEA_W - SEA_EDGE - 40);
    const baseY = Phaser.Math.FloatBetween(top, Math.max(top + 1, bot));
    for (let i = 0; i < group; i++) {
      this.fish.push({
        sp,
        kg: king ? sp.kg[1] * KING_KG_MULT : Phaser.Math.FloatBetween(sp.kg[0], sp.kg[1]),
        x: Phaser.Math.Clamp(baseX + (i - group / 2) * 26, SEA_LEFT, SEA_W - SEA_EDGE),
        y: Phaser.Math.Clamp(baseY + (i - group / 2) * 14, 20, this.island.floor - 20),
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        state: 'swim',
        reel: 0,
        pullX: 0,
        pullY: 0,
        escaped: 0,
        shiny,
        king,
      });
    }
  }

  private stepFish(dt: number): void {
    const now = this.time.now / 1000;
    for (const f of this.fish) {
      if (f.state === 'gone') continue;
      const sp = f.sp;

      if (f.state === 'hooked') {
        // 被勾住：朝远离玩家的方向拖
        const dx = f.x - this.me.x;
        const dy = f.y - this.me.y;
        const d = Math.hypot(dx, dy) || 1;
        const pullSpeed = 60 + sp.pull * 130;
        f.vx = (dx / d) * pullSpeed;
        f.vy = (dy / d) * pullSpeed;
      } else {
        // 自由游动：正弦摆动 + 被玩家吓跑；鱼王整体加速，更难追
        const kingK = f.king ? KING_SPEED_MULT : 1;
        const dx = f.x - this.me.x;
        const dy = f.y - this.me.y;
        const d = Math.hypot(dx, dy);
        const alert = 70 + sp.flee * 130;
        if (d < alert && sp.flee > 0.2) {
          const k = (1 - d / alert) * sp.speed * (0.7 + sp.flee) * kingK;
          f.vx = (dx / (d || 1)) * k;
          f.vy = (dy / (d || 1)) * k * 0.6;
        } else {
          f.vx = Math.cos(now * 1.1 + f.phase) * sp.speed * 0.32 * kingK;
          f.vy = Math.sin(now * 0.7 + f.phase) * sp.speed * 0.16 * kingK;
        }
      }

      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < SEA_LEFT || f.x > SEA_W - SEA_EDGE + 20) f.vx *= -1;
      // 别游出自己那条深度带，也别钻出水面
      const top = Math.max(SURFACE_BAND, sp.band[0] - 60);
      const bottom = Math.min(this.island.floor - 16, sp.band[1] + 60);
      if (f.y < top) {
        f.y = top;
        f.vy = Math.abs(f.vy);
      }
      if (f.y > bottom) {
        f.y = bottom;
        f.vy = -Math.abs(f.vy);
      }
      f.x = Phaser.Math.Clamp(f.x, SEA_LEFT, SEA_W - SEA_EDGE + 20);
      f.phase += dt * 0.4;
    }

    this.fish = this.fish.filter((f) => f.state !== 'gone');

    // 补充鱼群
    this.respawnTimer -= dt;
    if (this.fish.length < FISH_TARGET && this.respawnTimer <= 0) {
      this.respawnTimer = FISH_RESPAWN;
      this.spawnRandomFish();
    }
  }

  // ---- 海底宝箱 ---------------------------------------------------------------
  private stepChest(dt: number): void {
    this.nearChest = false;
    if (this.chest) {
      this.nearChest =
        Phaser.Math.Distance.Between(this.me.x, this.me.y, this.chest.x, this.chest.y) < 70;
      return;
    }
    this.chestTimer -= dt;
    if (this.chestTimer > 0) return;
    // 刷在海床附近的中下层，往深处潜才有机会碰到
    this.chest = {
      x: Phaser.Math.FloatBetween(SEA_LEFT + 120, SEA_W - SEA_EDGE - 80),
      y: Phaser.Math.FloatBetween(this.island.floor * 0.55, this.island.floor - 60),
      phase: Math.random() * Math.PI * 2,
    };
  }

  private pickChest(): void {
    if (!this.chest) return;
    this.chest = null;
    this.chestTimer = Phaser.Math.FloatBetween(20, 40);
    sfx.win();
    const message = this.cfg.onChest?.() ?? '宝箱里空空如也…';
    this.pop(`🎁 ${message}`, 0xffe27a);
  }

  // ---- 勾鱼 / 收杆 ----------------------------------------------------------
  private stepHook(dt: number): void {
    if (this.hooked) {
      const f = this.hooked;
      const dx = f.x - this.me.x;
      const dy = f.y - this.me.y;
      const d = Math.hypot(dx, dy);

      // 鱼竿朝向必须朝着鱼，才能把线收回来
      const hx = this.headX() - this.me.x;
      const hy = this.headY() - this.me.y;
      const hl = Math.hypot(hx, hy) || 1;
      const align = (hx / hl) * (dx / (d || 1)) + (hy / hl) * (dy / (d || 1));

      const gear = gearStats(this.cfg.gearLv);
      if (align > REEL_ALIGN) f.reel += REEL_GAIN * gear.reel * dt;
      else f.reel -= REEL_DECAY * dt;
      f.reel = Phaser.Math.Clamp(f.reel, 0, 1);

      if (f.reel >= 1) {
        this.landFish(f);
        return;
      }
      if (d > REEL_ESCAPE + gear.hook) {
        this.pop(`${f.sp.name} 跑掉了…`, 0x9fb8c8);
        f.state = 'swim';
        this.hooked = null;
      }
      return;
    }

    if (this.hookCd > 0 || this.stun > 0 || this.wipeout > 0) return;
    const hx = this.headX();
    const hy = this.headY();
    const gear = gearStats(this.cfg.gearLv);
    for (const f of this.fish) {
      if (f.state !== 'swim') continue;
      const d = Math.hypot(f.x - hx, f.y - hy);
      // 大鱼体型大，判定半径也跟着体型走
      if (d > gear.hook + 6 + 7 * sizeScale(f.sp, f.kg)) continue;

      // 渔具不够：拽一下就跑
      if (f.sp.gear > this.cfg.gearLv || f.kg > gear.maxKg) {
        f.state = 'swim';
        f.escaped = 0.6;
        this.hookCd = HOOK_COOLDOWN;
        this.pop(`拉不动！需要更好的渔具（${f.sp.name} ${f.kg.toFixed(1)}kg）`, 0xff9a6b);
        // 让它窜出去
        const ang = Math.atan2(f.y - this.me.y, f.x - this.me.x);
        f.vx = Math.cos(ang) * 320;
        f.vy = Math.sin(ang) * 320;
        return;
      }

      f.state = 'hooked';
      f.reel = 0;
      f.escaped = 0;
      this.hooked = f;
      this.hookCd = HOOK_COOLDOWN;
      this.pop(`勾住了 ${f.sp.name}！朝它的方向收杆`, 0x9fe8ff);
      return;
    }
  }

  private landFish(f: Fish): void {
    // 闪光 ×5、鱼王 ×3，可以叠加
    const mult = (f.shiny ? SHINY_VALUE_MULT : 1) * (f.king ? KING_VALUE_MULT : 1);
    const value = Math.round(fishValue(f.sp, f.kg) * mult);
    const limits = bagLimits(this.cfg.bagLv);
    const kg = this.bagKg();
    if (this.bag.length >= limits.count || kg + f.kg > limits.kg) {
      this.pop('背包塞不下了！回船上卖鱼', 0xffc04d);
      f.state = 'swim';
      this.hooked = null;
      return;
    }
    const badge = f.king ? '👑' : f.shiny ? '✨' : '';
    this.bag.push({
      id: f.sp.id,
      name: `${badge}${f.sp.name}`,
      emoji: f.sp.emoji,
      kg: f.kg,
      value,
    });
    this.caughtValue += value;
    this.hooked = null;
    // 进了背包就从水里拿掉（stepFish 会把 gone 的过滤掉）
    f.state = 'gone';
    this.pop(`${badge} ${f.sp.emoji} ${f.sp.name} ${f.kg.toFixed(1)}kg  +¥${value}`, 0xffe27a);
    this.cfg.session?.send({
      t: 'fishCatch',
      fish: `${f.sp.name} ${f.kg.toFixed(1)}kg`,
      value,
    });
    this.cfg.onCatch?.(f.sp.id, f.kg, value, { shiny: f.shiny, king: f.king });
    this.pushBag();
  }

  private bagKg(): number {
    return this.bag.reduce((s, f) => s + f.kg, 0);
  }

  private pushBag(): void {
    this.cfg.onBag?.({
      count: this.bag.length,
      kg: Math.round(this.bagKg() * 10) / 10,
      value: this.bag.reduce((s, f) => s + f.value, 0),
      items: [...this.bag],
    });
  }

  /**
   * 把这一趟的渔获取走（清空袋子并返回那几条鱼）。
   *
   * 鱼不是钱：页面拿去 `progress.addFish()` 入仓，之后拉去赚钱区交给农场主卖。
   * 上岸时、以及离开潜水页（销毁场景）前都会调一次，所以不会无声无息丢掉。
   * 氧气耗尽那一下袋子里已经是空的（`suffocate` 先丢光），所以那种情况自然是白潜。
   */
  takeBag(): Caught[] {
    const list = [...this.bag];
    this.bag = [];
    this.pushBag();
    return list;
  }

  // ---- 危险元素 -------------------------------------------------------------
  private buildHazards(): void {
    const h = this.island.hazards;
    for (let i = 0; i < h.jelly; i++) {
      this.jellies.push({
        x: Phaser.Math.FloatBetween(SEA_LEFT + 60, SEA_W - SEA_EDGE),
        y: Phaser.Math.FloatBetween(160, this.island.floor - 40),
        phase: Math.random() * Math.PI * 2,
      });
    }
    for (let i = 0; i < h.shark; i++) {
      this.sharks.push({
        x: Phaser.Math.FloatBetween(SEA_LEFT + 200, SEA_W - SEA_EDGE),
        y: Phaser.Math.FloatBetween(this.island.floor * 0.45, this.island.floor - 60),
        vx: 120,
        vy: 0,
        mode: 'patrol',
        timer: 0,
        hit: 0,
      });
    }
    for (let i = 0; i < h.current; i++) {
      this.currents.push({
        y: this.island.floor * (0.25 + 0.5 * (i + 1) / (h.current + 1)),
        dir: Math.random() < 0.5 ? -1 : 1,
        strength: 190 + Math.random() * 120,
      });
    }
  }

  private stepHazards(dt: number): void {
    const now = this.time.now / 1000;

    // 暗流：把人往一侧推
    for (const c of this.currents) {
      if (Math.abs(this.me.y - c.y) < 70) {
        this.me.vx += c.dir * c.strength * dt;
      }
    }

    // 水母：漂着，碰到掉氧气 + 短晕
    for (const j of this.jellies) {
      j.phase += dt * 0.6;
      j.y += Math.sin(now * 0.5 + j.phase) * 12 * dt;
      j.x += Math.cos(now * 0.35 + j.phase) * 16 * dt;
      if (this.wipeout > 0) continue;
      const d = Math.hypot(j.x - this.me.x, j.y - this.me.y);
      if (d < JELLY_R + 14) {
        this.oxygen = Math.max(1, this.oxygen - oxygenMax(this.cfg.oxygenLv) * JELLY_OXY);
        this.stun = JELLY_STUN;
        this.cameras.main.shake(180, 0.008);
        this.pop('被水母电到！氧气流失', 0xd06a8a);
        this.cfg.onHurt?.('jelly');
        // 弹开一点，免得一直粘着
        const ang = Math.atan2(this.me.y - j.y, this.me.x - j.x);
        this.me.vx = Math.cos(ang) * 260;
        this.me.vy = Math.sin(ang) * 260;
      }
    }

    // 鲨鱼：巡逻 → 追人 → 抢鱼后撤退
    for (const s of this.sharks) {
      s.hit = Math.max(0, s.hit - dt);
      const dx = this.me.x - s.x;
      const dy = this.me.y - s.y;
      const d = Math.hypot(dx, dy);
      if (s.mode === 'patrol') {
        s.x += s.vx * dt;
        if (s.x < SEA_LEFT + 120 || s.x > SEA_W - SEA_EDGE) s.vx *= -1;
        s.y += Math.sin(now * 0.4) * 20 * dt;
        if (d < SHARK_RANGE && this.wipeout <= 0) {
          s.mode = 'chase';
          this.pop('鲨鱼盯上你了！', 0xff6b6b);
          this.cfg.onHurt?.('shark');
        }
      } else if (s.mode === 'chase') {
        const k = SHARK_SPEED / (d || 1);
        s.x += dx * k * dt;
        s.y += dy * k * dt;
        if (d < SHARK_R + 16 && s.hit <= 0) {
          s.hit = 6;
          s.mode = 'retreat';
          const stolen = this.bag.splice(0, Math.max(1, Math.ceil(this.bag.length / 2)));
          this.cameras.main.shake(300, 0.014);
          this.pop(
            stolen.length ? `鲨鱼抢走了 ${stolen.length} 条鱼！` : '鲨鱼撞了你一下！',
            0xff6b6b,
          );
          this.cfg.onHurt?.('shark');
          this.pushBag();
        } else if (d > SHARK_RANGE * 1.6) {
          s.mode = 'retreat';
        }
      } else {
        s.x -= s.vx * 0.6 * dt;
        s.y += Math.sin(now * 0.6) * 12 * dt;
        if (d > SHARK_RANGE * 1.4) s.mode = 'patrol';
      }
      s.x = Phaser.Math.Clamp(s.x, SEA_LEFT + 60, SEA_W - SEA_EDGE);
      s.y = Phaser.Math.Clamp(s.y, this.island.floor * 0.2, this.island.floor - 30);
    }
  }

  private stepBubbles(dt: number): void {
    for (const b of this.bubbles) {
      b.y -= b.v * dt;
      b.x += Math.sin(this.time.now / 300 + b.y) * 8 * dt;
    }
    this.bubbles = this.bubbles.filter((b) => b.y > 10);
    if (this.bubbles.length > 90) this.bubbles.splice(0, this.bubbles.length - 90);
  }

  private pop(text: string, color: number): void {
    const t = this.add
      .text(this.me.x, this.me.y - PLAYER_H * 0.8, text, {
        fontFamily: 'inherit',
        fontSize: '16px',
        color: `#${color.toString(16).padStart(6, '0')}`,
        fontStyle: 'bold',
        stroke: '#04101f',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(30);
    this.pops.push({ t, life: 1.6 });
  }

  private stepPops(dt: number): void {
    for (const p of this.pops) {
      p.life -= dt;
      p.t.y -= 24 * dt;
      p.t.setAlpha(Math.max(0, Math.min(1, p.life)));
      if (p.life <= 0) p.t.destroy();
    }
    this.pops = this.pops.filter((p) => p.life > 0);
  }

  // ---- 渲染 ----------------------------------------------------------------
  private draw(): void {
    const g = this.g;
    g.clear();
    this.charG.clear();
    this.charOverG.clear();
    const cam = this.cameras.main;
    const left = cam.scrollX;
    const top = cam.scrollY;
    const w = cam.width;
    const h = cam.height;
    const { shallow, deep } = this.island.palette;

    // 天空（镜头抬到水面以上才看得见）
    this.drawSky(g, left, top, w, h);

    // 水体：从水线往下插值的横带
    const waterTop = Math.max(top, WATER_Y);
    const waterBottom = Math.min(top + h, this.island.floor + 220);
    if (waterBottom > waterTop) {
      const bands = 12;
      const span = waterBottom - waterTop;
      for (let i = 0; i < bands; i++) {
        const y0 = waterTop + (i / bands) * span;
        const y1 = waterTop + ((i + 1) / bands) * span;
        const col = lerpColor(shallow, deep, Math.min(1, y0 / this.island.floor));
        g.fillStyle(col, 1);
        g.fillRect(left, y0, w, y1 - y0 + 1);
      }
    }

    // 光柱
    g.fillStyle(this.island.palette.accent, 0.06);
    for (let i = 0; i < 5; i++) {
      const bx = ((i * 520 + Math.sin(this.time.now / 4200 + i) * 60) % (SEA_W + 400)) - 200;
      g.fillPoints(
        [
          new Phaser.Math.Vector2(bx, -80),
          new Phaser.Math.Vector2(bx + 120, -80),
          new Phaser.Math.Vector2(bx + 300, this.island.floor),
          new Phaser.Math.Vector2(bx + 120, this.island.floor),
        ],
        true,
      );
    }

    // 暗流
    for (const c of this.currents) {
      g.fillStyle(0xffffff, 0.05);
      g.fillRect(left, c.y - 46, w, 92);
      g.lineStyle(2, this.island.palette.accent, 0.28);
      for (let i = 0; i < 8; i++) {
        const t = (this.time.now / 900 + i / 8) % 1;
        const x = c.dir > 0 ? left + t * w : left + (1 - t) * w;
        g.lineBetween(x, c.y - 14, x + c.dir * 34, c.y - 14);
        g.lineBetween(x, c.y + 16, x + c.dir * 34, c.y + 16);
      }
    }

    // 海床
    const floor = this.island.floor;
    g.fillStyle(0x0a1a24, 1);
    g.fillRect(left, floor, w, h);
    g.fillStyle(deep, 1);
    for (let i = 0; i < 12; i++) {
      const rx = (i * 260 + 90) % SEA_W;
      const rr = 60 + ((i * 37) % 70);
      if (rx > left - 200 && rx < left + w + 200) {
        g.fillEllipse(rx, floor + 6, rr * 2, rr * 0.8);
      }
    }
    // 海草
    g.lineStyle(4, 0x1f6f4a, 0.85);
    for (let i = 0; i < 24; i++) {
      const sx = (i * 137 + 40) % SEA_W;
      if (sx < left - 60 || sx > left + w + 60) continue;
      g.beginPath();
      g.moveTo(sx, floor + 4);
      for (let k = 1; k <= 3; k++) {
        g.lineTo(sx + Math.sin(this.time.now / 700 + i + k) * 12 * k, floor + 4 - k * 26);
      }
      g.strokePath();
    }

    // 水母
    for (const j of this.jellies) {
      if (j.x < left - 80 || j.x > left + w + 80) continue;
      const pulse = 1 + Math.sin(this.time.now / 380 + j.phase) * 0.12;
      g.fillStyle(0xd06a8a, 0.75);
      g.fillEllipse(j.x, j.y, 30 * pulse, 22 * pulse);
      g.lineStyle(2, 0xf0a0c0, 0.55);
      for (let i = -2; i <= 2; i++) {
        g.lineBetween(j.x + i * 6, j.y + 10, j.x + i * 8 + Math.sin(this.time.now / 260 + i) * 6, j.y + 34);
      }
    }

    // 鱼
    for (const f of this.fish) {
      if (f.x < left - 80 || f.x > left + w + 80) continue;
      const col = f.shiny ? 0xffd45c : (FISH_COLOR[f.sp.id] ?? 0x9fb8c8);
      // 体型：体重 → 0.6×~1.8×，鱼王再放大到上限
      const scale = f.king ? 1.8 : sizeScale(f.sp, f.kg);
      const bw = 20 * scale;
      const bh = 10 * scale;
      const dir = f.vx >= 0 ? 1 : -1;

      // 闪光鱼：金色光晕（呼吸闪烁）；鱼王：淡金光圈
      const glowP = 0.5 + 0.5 * Math.sin(this.time.now / 180 + f.phase);
      if (f.shiny) {
        g.fillStyle(0xffd45c, 0.14 + 0.12 * glowP);
        g.fillCircle(f.x, f.y, bw * 1.7);
      } else if (f.king) {
        g.fillStyle(0xffe27a, 0.08 + 0.05 * glowP);
        g.fillCircle(f.x, f.y, bw * 1.9);
      }

      g.fillStyle(col, 1);
      g.fillEllipse(f.x, f.y, bw * 2, bh * 2);
      g.fillTriangle(
        f.x - dir * bw,
        f.y,
        f.x - dir * (bw + 10 * scale),
        f.y - 8 * scale,
        f.x - dir * (bw + 10 * scale),
        f.y + 8 * scale,
      );
      if (f.shiny || f.king) {
        g.lineStyle(2, 0xffe27a, 0.85);
        g.strokeEllipse(f.x, f.y, bw * 2, bh * 2);
      }
      g.fillStyle(0xffffff, 1);
      g.fillCircle(f.x + dir * bw * 0.5, f.y - bh * 0.25, 2 * scale);
      g.fillStyle(0x04101f, 1);
      g.fillCircle(f.x + dir * bw * 0.55, f.y - bh * 0.25, 1 * scale);
      // 鱼王皇冠标记
      if (f.king) {
        g.fillStyle(0xffd45c, 1);
        g.fillTriangle(f.x - 7, f.y - bh - 3, f.x - 2, f.y - bh - 12, f.x + 2, f.y - bh - 4);
        g.fillTriangle(f.x + 1, f.y - bh - 4, f.x + 6, f.y - bh - 13, f.x + 10, f.y - bh - 3);
        g.fillRect(f.x - 7, f.y - bh - 4, 18, 3);
      }

      if (f.state === 'hooked') {
        // 收杆进度：鱼身上的圆环
        g.lineStyle(4, 0x04101f, 0.5);
        g.strokeCircle(f.x, f.y, 26 * scale);
        g.lineStyle(4, 0xffe27a, 1);
        g.beginPath();
        g.arc(f.x, f.y, 26 * scale, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * f.reel, false, 0);
        g.strokePath();
      }
      if (f.escaped > 0) {
        g.lineStyle(1.5, 0x0a0a0a, 0.5 * f.escaped);
        g.strokeCircle(f.x, f.y, 30 * scale);
      }
    }

    // 鲨鱼
    for (const s of this.sharks) {
      if (s.x < left - 160 || s.x > left + w + 160) continue;
      const dir = s.vx >= 0 ? 1 : -1;
      g.fillStyle(s.mode === 'chase' ? 0x4a5a6a : 0x3a4a58, 1);
      g.fillEllipse(s.x, s.y, 150, 56);
      g.fillTriangle(s.x - dir * 70, s.y, s.x - dir * 130, s.y - 30, s.x - dir * 120, s.y + 34);
      g.fillTriangle(s.x, s.y - 26, s.x + dir * 26, s.y - 60, s.x + dir * 40, s.y - 20);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(s.x + dir * 46, s.y - 10, 5);
      g.fillStyle(s.mode === 'chase' ? 0xff3b30 : 0x101a22, 1);
      g.fillCircle(s.x + dir * 48, s.y - 10, 2.6);
      // 牙
      g.fillStyle(0xffffff, 0.9);
      for (let i = 0; i < 5; i++) {
        g.fillTriangle(
          s.x + dir * (30 + i * 8),
          s.y + 8,
          s.x + dir * (34 + i * 8),
          s.y + 18,
          s.x + dir * (38 + i * 8),
          s.y + 8,
        );
      }
    }

    // 气泡
    g.fillStyle(0xffffff, 0.35);
    for (const b of this.bubbles) g.fillCircle(b.x, b.y, b.r);

    // 海底宝箱：木箱 + 金光呼吸
    if (this.chest) {
      const c = this.chest;
      const bob = Math.sin(this.time.now / 500 + c.phase) * 3;
      const glow = 0.5 + 0.5 * Math.sin(this.time.now / 260);
      g.fillStyle(0xffd45c, 0.1 + 0.1 * glow);
      g.fillCircle(c.x, c.y + bob, 34);
      g.fillStyle(0x8a5a2b, 1);
      g.fillRoundedRect(c.x - 18, c.y - 13 + bob, 36, 26, 4);
      g.fillStyle(0x6a421c, 1);
      g.fillRect(c.x - 18, c.y - 2 + bob, 36, 4);
      g.fillStyle(0xffd45c, 1);
      g.fillCircle(c.x, c.y + bob, 4);
      g.lineStyle(2, 0xffe27a, 0.9);
      g.strokeRoundedRect(c.x - 18, c.y - 13 + bob, 36, 26, 4);
    }

    // 岸：沙滩 + 装备店 + 码头 + 船（画在水与鱼之上，所以在岸上的东西挡得住水面）
    this.drawShore(g, left, top, w, h);

    // 自己 + 好友（画在单独的角色层，见 charG）
    this.drawDiver(this.charG, this.me, this.cfg.cosmetic, true);
    if (this.remote) this.drawDiver(this.charG, this.remote, this.cfg.cosmetic, false);
  }

  /** 天空 + 太阳 + 云（只有镜头抬到水面以上才画） */
  private drawSky(
    g: Phaser.GameObjects.Graphics,
    left: number,
    top: number,
    w: number,
    h: number,
  ): void {
    if (top >= WATER_Y) return;
    const bottom = Math.min(top + h, WATER_Y);
    const bands = 10;
    for (let i = 0; i < bands; i++) {
      const y0 = top + ((bottom - top) * i) / bands;
      const y1 = top + ((bottom - top) * (i + 1)) / bands;
      g.fillStyle(lerpColor(0x5cc0ee, 0xe6f6ff, i / bands), 1);
      g.fillRect(left, y0, w, y1 - y0 + 1);
    }

    const sunX = 2000;
    const sunY = SKY_TOP + 170;
    if (sunX > left - 260 && sunX < left + w + 260) {
      g.fillStyle(0xfff2b0, 0.45);
      g.fillCircle(sunX, sunY, 92);
      g.fillStyle(0xfff8d8, 1);
      g.fillCircle(sunX, sunY, 54);
    }

    g.fillStyle(0xffffff, 0.82);
    for (let i = 0; i < 4; i++) {
      const cx = ((i * 660 + this.time.now / 55) % (SEA_W + 500)) - 250;
      const cy = SKY_TOP + 210 + i * 56;
      if (cx < left - 340 || cx > left + w + 340) continue;
      g.fillEllipse(cx, cy, 240, 58);
      g.fillEllipse(cx + 82, cy - 18, 150, 50);
      g.fillEllipse(cx - 92, cy + 6, 130, 42);
    }
  }

  /** 沙滩 + 装备店 + 码头 + 船 */
  private drawShore(
    g: Phaser.GameObjects.Graphics,
    left: number,
    top: number,
    w: number,
    h: number,
  ): void {
    if (top + h < SAND_Y) return;
    const x0 = Math.max(left - 60, SHORE_LEFT);
    const x1 = Math.min(left + w + 60, SHORE_RIGHT);
    if (x1 <= x0) return;
    const bottom = Math.max(Math.min(top + h, this.island.floor + 220), WATER_Y);

    // 沙体（沿着斜坡一路到水边）
    g.fillStyle(0xe9d29b, 1);
    g.fillPoints(
      [
        new Phaser.Math.Vector2(x0, this.sandTop(x0)),
        new Phaser.Math.Vector2(x1, this.sandTop(x1)),
        new Phaser.Math.Vector2(x1, bottom),
        new Phaser.Math.Vector2(x0, bottom),
      ],
      true,
    );
    // 干沙顶面 + 湿沙（贴水线）
    g.lineStyle(10, 0xf7e6bd, 1);
    g.lineBetween(x0, this.sandTop(x0), x1, this.sandTop(x1));
    if (x1 > 660) {
      const wx = Math.max(660, x0);
      g.lineStyle(16, 0xd4b77e, 1);
      g.lineBetween(wx, this.sandTop(wx) - 3, x1, this.sandTop(x1) - 3);
    }

    // 草丛 + 石头（只在岸的高处）
    g.lineStyle(3, 0x6fae5a, 0.9);
    for (let i = 0; i < 18; i++) {
      const gx = ((-100 + i * 58) % (SHORE_RIGHT + 100) + SHORE_RIGHT + 100) % (SHORE_RIGHT + 100) - 100;
      if (gx < x0 - 20 || gx > x1 + 20) continue;
      const gy = this.sandTop(gx);
      if (gy > -30) continue;
      g.lineBetween(gx, gy - 2, gx - 6, gy - 18);
      g.lineBetween(gx, gy - 2, gx + 2, gy - 22);
      g.lineBetween(gx, gy - 2, gx + 9, gy - 16);
    }
    g.fillStyle(0xbfae94, 1);
    for (const [rx, ry] of [
      [180, 8],
      [520, 6],
      [700, 5],
      [860, 4],
    ] as const) {
      if (rx < x0 - 20 || rx > x1 + 20) continue;
      g.fillEllipse(rx, this.sandTop(rx) - ry * 0.4, rx % 3 === 0 ? 26 : 18, ry * 1.6);
    }

    // 装备店
    this.drawHut(g, x0, x1);

    // 码头 + 船
    this.drawPier(g, x0, x1);
  }

  /** 岸上的装备店：走到门口才能升级装备 */
  private drawHut(g: Phaser.GameObjects.Graphics, x0: number, x1: number): void {
    if (HUT_X < x0 - 200 || HUT_X > x1 + 200) return;
    const x = HUT_X;
    const base = this.shoreFloor(x);

    g.fillStyle(0x000000, 0.12);
    g.fillEllipse(x, base - 3, 250, 22);
    // 木屋
    g.fillStyle(0xb07a44, 1);
    g.fillRoundedRect(x - 96, base - 172, 192, 172, 8);
    g.fillStyle(0x8f5f33, 1);
    g.fillRect(x - 96, base - 172, 192, 12);
    g.lineStyle(3, 0x7d5430, 0.6);
    g.strokeRoundedRect(x - 96, base - 172, 192, 172, 8);
    // 屋顶
    g.fillStyle(0x8a3f31, 1);
    g.fillTriangle(x - 118, base - 170, x + 118, base - 170, x, base - 254);
    g.fillStyle(0xa64f3e, 1);
    g.fillTriangle(x - 96, base - 176, x + 96, base - 176, x, base - 238);
    // 门 + 把手
    g.fillStyle(0x6f4a28, 1);
    g.fillRoundedRect(x - 28, base - 98, 56, 98, 6);
    g.fillStyle(0xffd45c, 1);
    g.fillCircle(x + 16, base - 50, 4);
    // 两扇窗
    g.fillStyle(0x9fe8ff, 0.92);
    g.fillRoundedRect(x - 86, base - 142, 46, 42, 6);
    g.fillRoundedRect(x + 40, base - 142, 46, 42, 6);
    g.lineStyle(3, 0x7d5430, 0.8);
    g.strokeRoundedRect(x - 86, base - 142, 46, 42, 6);
    g.strokeRoundedRect(x + 40, base - 142, 46, 42, 6);

    // 站在门口：给个高亮框，提示可以按 E
    if (this.nearHut) {
      g.lineStyle(4, 0xffd45c, 0.9);
      g.strokeRoundedRect(x - 116, base - 196, 232, 210, 12);
    }
  }

  /**
   * 沙滩尽头的木栈桥（可以走上去），桥尾拴着一条船。
   * 船一直在岸边停着：没买的时候挂「出售」牌子，点它就是交互入口。
   */
  private drawPier(g: Phaser.GameObjects.Graphics, x0: number, x1: number): void {
    if (PIER_X1 + 260 < x0 || PIER_X0 - 60 > x1) return;

    // 从沙滩伸进海里的栈桥
    g.fillStyle(0x8a6a45, 1);
    g.fillRect(PIER_X0, PIER_Y, PIER_X1 - PIER_X0 + 10, 14);
    g.fillStyle(0x6f5436, 1);
    for (let i = 0; i * 44 < PIER_X1 - PIER_X0; i++) {
      g.fillRect(PIER_X0 + 20 + i * 44, PIER_Y + 14, 12, 34);
    }
    g.lineStyle(3, 0x5d4529, 0.7);
    for (let i = 0; i * 44 < PIER_X1 - PIER_X0; i++) {
      g.lineBetween(PIER_X0 + i * 44, PIER_Y, PIER_X0 + i * 44, PIER_Y + 14);
    }

    // 拴船的缆绳
    const bob = Math.sin(this.time.now / 700) * 3;
    const by = BOAT_Y + bob;
    g.lineStyle(3, 0x8a6a45, 0.9);
    g.lineBetween(PIER_X1 - 6, PIER_Y + 8, BOAT_X - 76, by - 6);

    if (this.cfg.boat) {
      // 有帆的船
      g.fillStyle(0xd8e6ee, 1);
      g.fillEllipse(BOAT_X, by, 200, 48);
      g.fillStyle(0xb9c9d6, 1);
      g.fillEllipse(BOAT_X, by - 7, 158, 30);
      g.fillStyle(0x3f7fbf, 1);
      g.fillTriangle(BOAT_X + 58, by - 4, BOAT_X + 132, by - 4, BOAT_X + 96, by - 66);
      g.lineStyle(4, 0x6f5436, 1);
      g.lineBetween(BOAT_X - 24, by - 12, BOAT_X - 24, by - 100);
    } else {
      // 待售的小划子（还插着两支桨）
      g.fillStyle(0xc9d6df, 1);
      g.fillEllipse(BOAT_X, by, 172, 42);
      g.fillStyle(0x9fb0bd, 1);
      g.fillEllipse(BOAT_X, by - 6, 134, 26);
      g.lineStyle(4, 0x6f5436, 1);
      g.lineBetween(BOAT_X - 50, by - 6, BOAT_X + 70, by - 40);
      g.lineBetween(BOAT_X + 50, by - 6, BOAT_X - 40, by - 46);
    }

    // 站在船边：给个高亮圈，提示可以点
    if (this.nearBoat) {
      g.lineStyle(4, 0xffd45c, 0.85);
      g.strokeEllipse(BOAT_X, by - 34, 250, 170);
    }
  }

  private drawDiver(g: Phaser.GameObjects.Graphics, d: Diver, cos: Cosmetic, isMe: boolean): void {
    const rig = isMe ? this.rigMe : this.rigOther;
    const ang = isMe ? this.racketAng : this.remoteAng;
    const reach = isMe ? this.racketReach : this.remoteReach;
    const facing = d.facing;
    const sh = d.y - PLAYER_H * 0.55;

    // 装备贴图只在钓鱼场景里画（drawDiver 只被 DiveScene 调用），退出池塘不跟随。
    // 好友的装备等级未知，只给自己画全套。
    if (isMe) {
      // 氧气罐：背在背后（画在身体之前，会被身体遮住一半），随等级变大换色
      const oLv = this.cfg.oxygenLv;
      const tankH = 24 + oLv * 4;
      const tankX = d.x - facing * 17;
      const tankColor = [0x9fb6c8, 0x54d6ff, 0x54e0a0, 0xffd45c, 0xff8ad4][Math.min(oLv - 1, 4)];
      g.fillStyle(0x2a3442, 1);
      g.fillRect(tankX - 4, sh - tankH / 2 - 4, 8, 4);
      g.fillStyle(tankColor, 0.95);
      g.fillRoundedRect(tankX - 7, sh - tankH / 2, 14, tankH, 7);
      g.fillStyle(0xffffff, 0.35);
      g.fillRect(tankX - 4, sh - tankH / 2 + 3, 3, tankH - 8);
    }

    // 潜水时手臂放松一点：拍头就在身前，不是举在头顶
    rig.draw(
      g,
      this.time.now,
      cos,
      { x: d.x, feetY: d.y, facing: d.facing, color: isMe ? P.player0 : P.player1 },
      Math.cos(ang) * reach,
      Math.sin(ang) * reach,
      isMe ? this.racketSpeed : 0,
      gearStats(this.cfg.gearLv).hook,
      this.charOverG,
      isMe ? this.racket.path.pts : undefined,
    );

    if (isMe) {
      const gLv = this.cfg.gearLv;
      // 鱼竿：从手沿挥杆方向伸出去的竿身，等级越高越粗越金
      const rodLen = 30 + gLv * 6;
      const hx = d.x + facing * 4 + Math.cos(ang) * rodLen;
      const hy = sh + 8 + Math.sin(ang) * rodLen;
      const rodColor = gLv >= 5 ? 0xffd45c : gLv >= 4 ? 0xff8ad4 : gLv >= 3 ? 0x54e0a0 : 0x8a6a3a;
      g.lineStyle(1.5 + gLv * 0.5, rodColor, 1);
      g.lineBetween(d.x + facing * 4, sh + 8, hx, hy);
      // 竿身装饰环：等级越高环越多
      g.fillStyle(0xffffff, 0.8);
      for (let i = 1; i <= gLv; i++) {
        const u = i / (gLv + 1);
        g.fillCircle(d.x + facing * 4 + (hx - d.x - facing * 4) * u, sh + 8 + (hy - sh - 8) * u, 1.6);
      }

      // 背包：挂在腰侧，随等级变大
      const bLv = this.cfg.bagLv;
      const bw = 16 + bLv * 3;
      const bh = 13 + bLv * 2;
      g.fillStyle(0x8a6a3a, 1);
      g.fillRoundedRect(d.x + facing * 10 - bw / 2, d.y - PLAYER_H * 0.42, bw, bh, 4);
      g.fillStyle(0x5f4a28, 1);
      g.fillRect(d.x + facing * 10 - bw / 2, d.y - PLAYER_H * 0.42 + bh * 0.4, bw, 2);
    }

    if (isMe && this.stun > 0) {
      g.lineStyle(3, 0xffd45c, 0.8);
      g.strokeCircle(d.x, d.y - PLAYER_H * 0.5, 34);
    }
  }

  private drawHud(): void {
    const g = this.hudG;
    g.clear();
    const max = oxygenMax(this.cfg.oxygenLv);
    const frac = Phaser.Math.Clamp(this.oxygen / max, 0, 1);
    const w = 320;
    const x = VIEW_W / 2 - w / 2;
    const y = VIEW_H - 46;

    g.fillStyle(0x04101f, 0.55);
    g.fillRoundedRect(x - 6, y - 6, w + 12, 20, 8);
    g.fillStyle(frac < 0.25 ? 0xff6b6b : 0x54d6ff, 1);
    g.fillRoundedRect(x, y, w * frac, 8, 4);

    // 右侧潜水深度进度条：当前深度 / 本岛海床
    const barX = VIEW_W - 36;
    const barTop = 96;
    const barBot = VIEW_H - 150;
    const track = barBot - barTop;
    const df = Phaser.Math.Clamp(this.me.y / this.island.floor, 0, 1);
    g.fillStyle(0x04101f, 0.5);
    g.fillRoundedRect(barX - 7, barTop - 7, 22, track + 14, 11);
    g.fillStyle(0x123a4a, 1);
    g.fillRoundedRect(barX - 3, barTop, 14, track, 7);
    if (df > 0.005) {
      const fillH = track * df;
      g.fillStyle(df > 0.85 ? 0xff8ad4 : 0x54d6ff, 0.95);
      g.fillRoundedRect(barX - 3, barBot - fillH, 14, fillH, 7);
    }
    // 当前深度刻度线
    const markY = barBot - track * df;
    g.lineStyle(2, 0xffd45c, 0.95);
    g.lineBetween(barX - 9, markY, barX + 15, markY);
    // 海床线（到底了）
    g.lineStyle(2, 0xffe27a, 0.5);
    g.lineBetween(barX - 6, barBot, barX + 14, barBot);
    // 水面刻度
    g.lineStyle(2, 0x9fe8ff, 0.4);
    g.lineBetween(barX - 6, barTop, barX + 14, barTop);

    const limits = bagLimits(this.cfg.bagLv);
    const depth = Math.round(this.me.y / 10);
    this.hudText.setText(
      `氧气 ${Math.ceil(this.oxygen)}s · 背包 ${this.bag.length}/${limits.count} 条 ` +
        `(${this.bagKg().toFixed(1)}/${limits.kg}kg) · 深度 ${depth}m · 渔获 ¥${this.caughtValue}`,
    );
    this.hintText.setText(
      this.nearChest
        ? '海底宝箱：按 E / 点一下打开！'
        : this.nearHut
        ? '装备店门口：点小屋 / 按 E 打开（升级氧气罐 / 背包 / 渔具）'
        : this.nearBoat
          ? `岸边的船：点它或按 E ${this.cfg.boat ? '出海去别的海岛' : `买下它（¥${BOAT_COST}）`}`
          : this.onLand
            ? '岸上：往右走上栈桥看小船 · 往左回装备店 · 空格/上推可以跳'
            : this.me.y <= SURFACE_BAND
              ? '浮在水面：氧气回满 · 按左摇杆下潜 · 往左上岸'
              : this.hooked
                ? '收杆中：把鱼竿朝向鱼'
                : '左摇杆游动 / 上推上浮 · 右摇杆把拍头指到鱼身上勾住',
    );
  }

  // ---- 联机 ----------------------------------------------------------------
  private sendPose(dt: number): void {
    const link = this.cfg.session;
    if (!link) return;
    this.netClock -= dt;
    if (this.netClock > 0) return;
    this.netClock = 1 / 12;
    link.send({
      t: 'fishPose',
      x: Math.round(this.me.x),
      y: Math.round(this.me.y),
      a: Math.round(this.racketAng * 100) / 100,
      r: Math.round(this.racketReach),
    });
  }
}

/** 两个 0xRRGGBB 之间线性插值 */
function lerpColor(a: number, b: number, t: number): number {
  const k = Phaser.Math.Clamp(t, 0, 1);
  const ar = (a >> 16) & 255;
  const ag = (a >> 8) & 255;
  const ab = a & 255;
  const br = (b >> 16) & 255;
  const bg = (b >> 8) & 255;
  const bb = b & 255;
  return (
    (Math.round(ar + (br - ar) * k) << 16) |
    (Math.round(ag + (bg - ag) * k) << 8) |
    Math.round(ab + (bb - ab) * k)
  );
}
