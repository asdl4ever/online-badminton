import type { Cosmetic } from '../cosmetics';
import { rerollCosmetic } from '../players';

/**
 * 🎬 影院看台上的**观众**：名字 / 外观 / 风格全部由**系统随机生成**，
 * 和名人堂名单（含玩家自建的球员）没有任何关系——他们只是来看球的。
 *
 * 观众是**流动**的：门口会不时进来一位、走到空位坐下，坐一阵再起身走到门口消失
 * （见 `Crowd`）。所以同一间放映厅里，坐一会儿观众就换了一批。
 */
export interface Spectator {
  id: string;
  name: string;
  cosmetic: Cosmetic;
}

/** 姓名池：姓 × 名 能拼出几百个不重样的，再加一小撮绰号 */
const SURNAME = [
  '林', '沈', '苏', '何', '陆', '顾', '江', '崔', '孟', '常', '岳', '钟', '温', '裴', '石', '舒',
  '秦', '卫', '邢', '郝',
];
const GIVEN = [
  '小满', '云岫', '一鸣', '观澜', '听雨', '子夜', '长庚', '星野', '松风', '竹青',
  '初青', '见山', '怀瑾', '朝雾', '春台', '拾光', '默默', '拾一', '无尘', '不言',
  '乘风', '望舒', '疏影', '折柳',
];
const NICK = [
  '看台常客', '后场老王', '板凳王', '前排小将', '爆米花王', '斜线大爷', '挑球少女',
  '网前快枪', '体力怪', '第七排', '常胜观众', '半场专家', '捡球小弟', '边裁同志',
];

let seq = 0;

/** 造一位系统观众（`taken` 里已有的名字会避开，名字实在用光了就编号） */
export function makeSpectator(rng: () => number = Math.random, taken?: ReadonlySet<string>): Spectator {
  let name = '';
  for (let i = 0; i < 40 && !name; i++) {
    const cand =
      rng() < 0.3
        ? NICK[Math.floor(rng() * NICK.length)]
        : `${SURNAME[Math.floor(rng() * SURNAME.length)]}${GIVEN[Math.floor(rng() * GIVEN.length)]}`;
    if (!taken?.has(cand)) name = cand;
  }
  seq += 1;
  if (!name) name = `观众 ${seq}`;
  return {
    id: `sp-${seq}-${Math.floor(rng() * 46656).toString(36)}`,
    name,
    cosmetic: rerollCosmetic(rng),
  };
}

export interface CrowdSeat {
  id: string;
  x: number;
  y: number;
  row: number;
}

/** 观众在房间里走到哪一步了 */
export type WalkerState = 'arriving' | 'seated' | 'leaving';

export interface Walker extends Spectator {
  state: WalkerState;
  /** 占的是哪个座位 */
  seatId: string;
  x: number;
  y: number;
  facing: 1 | -1;
  /** 还没走完的路点 */
  path: { x: number; y: number }[];
  /** 打算什么时候起身（坐下的时刻 + 随机停留） */
  leaveAfter: number;
}

export interface CrowdOptions {
  seats: CrowdSeat[];
  /** 过道中点（进出都走这里，不会从别人膝盖上跨过去） */
  aisles: number[];
  /** 门（左右各一，就近进出） */
  doors: { x: number; y: number }[];
  /** 任何时候至少给玩家留几个空位 */
  minFree?: number;
  /** 走动速度（px/s） */
  walkSpeed?: number;
  /** 每隔多久来一次「有人进场 / 有人离场」 */
  eventMs?: [number, number];
  /** 坐下之后停留多久 */
  dwellMs?: [number, number];
  /** 结伴进场的概率（0~1）：一对朋友一起来、坐同一排相邻的位子 */
  pairChance?: number;
}

const rndIn = (rng: () => number, [a, b]: [number, number]): number => a + rng() * (b - a);

/** 走在「自己那一排前面一点」，看起来像侧着身子从别人膝盖前过去 */
const ROW_LANE = 26;
/** 结伴进场时，第二位跟得错开半步（不要踩在朋友身上） */
const MATE_OFFSET = 26;

/**
 * 一间放映厅里的观众群：
 *
 * - `step()` 每帧推一次，隔 `eventMs` 安排一位观众**从门口进来**走到空位坐下，
 *   或者让坐够了的观众**起身走到门口消失**；
 * - 座位一旦被「正要坐下 / 已坐下 / 正起身」的观众占了就算有人（`isTaken`），
 *   玩家的位子用 `reserve()` / `release()` 单独占；
 * - 人不够时就让座位空着，**永远不会两个人坐同一个位子**。
 */
export class Crowd {
  readonly walkers: Walker[] = [];
  /**
   * 上座率档位（0~1）：门口往里放人的上限 = 座位数 × level。
   * 决赛 1.0（坐到只留 `minFree` 个空位）、首轮 0.5 之类，由界面按场次重要度给。
   */
  level = 1;

  private readonly seats: CrowdSeat[];
  private readonly aisles: number[];
  private readonly doors: { x: number; y: number }[];
  private readonly minFree: number;
  private readonly walkSpeed: number;
  private readonly eventMs: [number, number];
  private readonly dwellMs: [number, number];
  private readonly pairChance: number;
  private readonly rng: () => number;
  /** seatId → walkerId / 'me' */
  private readonly owner = new Map<string, string>();
  private nextEvent = 0;

  constructor(opts: CrowdOptions, rng: () => number = Math.random) {
    this.seats = opts.seats;
    this.aisles = [...opts.aisles].sort((a, b) => a - b);
    this.doors = opts.doors;
    this.minFree = opts.minFree ?? 2;
    this.walkSpeed = opts.walkSpeed ?? 150;
    this.eventMs = opts.eventMs ?? [8000, 15000];
    // 停留时间要跟「门口多久来一个人」配平：平均停留 ÷ 平均来人间隔 ≈ 场内的常驻人数
    // （140s / 11.5s ≈ 12 人，18 个座位的场子看起来才是「坐了不少人、但总有空位」）
    this.dwellMs = opts.dwellMs ?? [70000, 210000];
    this.pairChance = opts.pairChance ?? 0.3;
    this.rng = rng;
  }

  /** 改上座率档位（0~1）：调高之后门口会更勤快地往里放人，调低自然靠离场降下来 */
  setLevel(level: number): void {
    this.level = Math.max(0.15, Math.min(1, level));
  }

  /** 这个位子有人吗（含正走过来 / 正起身的，以及玩家自己） */
  isTaken(seatId: string): boolean {
    return this.owner.has(seatId);
  }

  /** 空位签名：变了说明画面上的「空位」要重画（给界面用） */
  freeSignature(extraBlocked?: ReadonlySet<string>): string {
    const out: string[] = [];
    for (const s of this.seats) {
      if (!this.owner.has(s.id) && !extraBlocked?.has(s.id)) out.push(s.id);
    }
    return out.join(',');
  }

  /** 玩家坐进 / 离开某个位子 */
  reserve(seatId: string): void {
    this.owner.set(seatId, 'me');
  }

  release(seatId: string): void {
    if (this.owner.get(seatId) === 'me') this.owner.delete(seatId);
  }

  /** 开场前先坐好一批观众（免得一进房间空空荡荡） */
  prefill(now: number, count: number, extraBlocked?: ReadonlySet<string>): void {
    const free = this.freeSeats(extraBlocked);
    shuffle(free, this.rng);
    const names = new Set(this.walkers.map((w) => w.name));
    for (let i = 0; i < Math.min(count, free.length); i++) {
      const seat = free[i];
      const sp = makeSpectator(this.rng, names);
      names.add(sp.name);
      this.owner.set(seat.id, sp.id);
      const w: Walker = {
        ...sp,
        state: 'seated',
        seatId: seat.id,
        x: seat.x,
        y: seat.y,
        facing: seat.x > this.midX() ? -1 : 1,
        path: [],
        // 停留时间错开：有人很快起身，有人坐很久，门口就会一直有人进出
        leaveAfter: now + rndIn(this.rng, [this.dwellMs[0] * 0.4, this.dwellMs[1]]),
      };
      this.walkers.push(w);
    }
    this.nextEvent = now + rndIn(this.rng, this.eventMs);
  }

  /**
   * 推一帧。返回 **true** 表示观众名单变了（有人进场 / 离场），
   * 界面据此重建 DOM；位置一律由界面自己按 `walkers` 直接改样式。
   */
  step(dt: number, now: number, extraBlocked?: ReadonlySet<string>): boolean {
    let changed = false;
    if (!this.nextEvent) this.nextEvent = now + rndIn(this.rng, this.eventMs);
    if (now >= this.nextEvent) {
      this.nextEvent = now + rndIn(this.rng, this.eventMs);
      changed = this.act(extraBlocked) || changed;
    }

    for (let i = this.walkers.length - 1; i >= 0; i--) {
      const w = this.walkers[i];
      if (w.state === 'seated') {
        if (now >= w.leaveAfter) this.beginLeave(w);
        continue;
      }
      this.move(w, dt);
      if (w.path.length) continue;
      if (w.state === 'arriving') {
        w.state = 'seated';
        w.leaveAfter = now + rndIn(this.rng, this.dwellMs);
      } else {
        this.owner.delete(w.seatId);
        this.walkers.splice(i, 1);
        changed = true;
      }
    }
    return changed;
  }

  // ---- 内部 ----------------------------------------------------------------

  private midX(): number {
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of this.seats) {
      lo = Math.min(lo, s.x);
      hi = Math.max(hi, s.x);
    }
    return (lo + hi) / 2;
  }

  private freeSeats(extraBlocked?: ReadonlySet<string>): CrowdSeat[] {
    return this.seats.filter((s) => !this.owner.has(s.id) && !extraBlocked?.has(s.id));
  }

  /** 进出走哪条过道：取「同一排不会从别人座位上跨过去」的那条 */
  private aisleFor(seat: CrowdSeat): number {
    let best = this.aisles[0];
    let bestD = Infinity;
    for (const a of this.aisles) {
      const lo = Math.min(a, seat.x);
      const hi = Math.max(a, seat.x);
      const cross = this.seats.some((s) => s.row === seat.row && s.x > lo && s.x < hi);
      const d = Math.abs(a - seat.x) + (cross ? 1e6 : 0);
      if (d < bestD) {
        bestD = d;
        best = a;
      }
    }
    return best;
  }

  private doorFor(aisleX: number): { x: number; y: number } {
    let best = this.doors[0];
    for (const d of this.doors) {
      if (Math.abs(d.x - aisleX) < Math.abs(best.x - aisleX)) best = d;
    }
    return best;
  }

  /** 进场 / 离场二选一 */
  private act(extraBlocked?: ReadonlySet<string>): boolean {
    const seated = this.walkers.filter((w) => w.state === 'seated');
    const arriving = this.walkers.filter((w) => w.state === 'arriving').length;
    const leaving = this.walkers.filter((w) => w.state === 'leaving').length;
    const free = this.freeSeats(extraBlocked);
    // 上座率档位：坐到「座位数 × level」就基本不再往里放人（越重要的场次坐得越满）
    const cap = Math.max(3, Math.round(this.seats.length * this.level));

    const canArrive = free.length > this.minFree && arriving < 3;
    const canLeave = seated.length > 0 && leaving < 3;
    // 人少的时候多进人，坐得差不多满了才主要往外走
    const arriveFirst = canArrive && (seated.length < cap || this.rng() < 0.5);

    if (arriveFirst) return this.spawn(free);
    if (canLeave) {
      // 坐得最久的先走
      const oldest = seated.reduce((a, b) => (a.leaveAfter <= b.leaveAfter ? a : b));
      this.beginLeave(oldest);
      return false;
    }
    if (canArrive) return this.spawn(free);
    return false;
  }

  private spawn(free: CrowdSeat[]): boolean {
    const byId = new Set(free.map((s) => s.id));
    const mateOf = (s: CrowdSeat): CrowdSeat[] => this.neighbors(s).filter((n) => byId.has(n.id));
    // 结伴：一对朋友从同一个门一起进来、坐同一排相邻的位子。
    // 一次占两个位子，所以空位要留够（否则会把留给玩家的位子也吃掉）
    const pairable = free.length > this.minFree + 1 ? free.filter((s) => mateOf(s).length > 0) : [];
    if (pairable.length && this.rng() < this.pairChance) {
      const seat = pairable[Math.floor(this.rng() * pairable.length)];
      const mates = mateOf(seat);
      this.addWalker(seat, 0);
      this.addWalker(mates[Math.floor(this.rng() * mates.length)], MATE_OFFSET);
      return true;
    }
    this.addWalker(free[Math.floor(this.rng() * free.length)], 0);
    return true;
  }

  /** 同一排里**真正紧挨着**的座位：中间既没有别的座位、也不隔着过道 */
  private neighbors(seat: CrowdSeat): CrowdSeat[] {
    const row = this.seats.filter((s) => s.row === seat.row && s.id !== seat.id);
    return row.filter((s) => {
      const lo = Math.min(s.x, seat.x);
      const hi = Math.max(s.x, seat.x);
      if (this.aisles.some((a) => a > lo && a < hi)) return false;
      return !row.some((o) => o.x > lo && o.x < hi);
    });
  }

  /** 把一个新观众放到位子上（`offset` > 0 时是"跟在朋友侧后方半步"） */
  private addWalker(seat: CrowdSeat, offset: number): void {
    const aisle = this.aisleFor(seat);
    const door = this.doorFor(aisle);
    const names = new Set(this.walkers.map((w) => w.name));
    const sp = makeSpectator(this.rng, names);
    const dy = offset ? 12 : 0;
    const walker: Walker = {
      ...sp,
      state: 'arriving',
      seatId: seat.id,
      x: door.x + offset,
      y: door.y + dy,
      facing: seat.x > door.x ? 1 : -1,
      // 进门 → 走到过道 → 顺着过道走到自己那排 → 侧身进座位（结伴的那位全程错开半步）
      path: [
        { x: aisle + offset, y: door.y + dy },
        { x: aisle + offset, y: seat.y + ROW_LANE },
        { x: seat.x + offset, y: seat.y + ROW_LANE },
        { x: seat.x, y: seat.y },
      ],
      leaveAfter: 0,
    };
    this.owner.set(seat.id, walker.id);
    this.walkers.push(walker);
  }

  private beginLeave(w: Walker): void {
    if (w.state !== 'seated') return;
    const seat = this.seats.find((s) => s.id === w.seatId);
    if (!seat) return;
    const aisle = this.aisleFor(seat);
    const door = this.doorFor(aisle);
    w.state = 'leaving';
    // 起身 → 侧身到过道 → 顺过道走到门口 → 出门消失
    w.path = [
      { x: seat.x, y: seat.y + ROW_LANE },
      { x: aisle, y: seat.y + ROW_LANE },
      { x: aisle, y: door.y },
      { x: door.x, y: door.y },
    ];
  }

  /** 沿路点走（走完一段接着下一段，不会走过头） */
  private move(w: Walker, dt: number): void {
    let budget = this.walkSpeed * dt;
    let guard = 0;
    while (budget > 0 && w.path.length && guard++ < 16) {
      const t = w.path[0];
      const dx = t.x - w.x;
      const dy = t.y - w.y;
      const d = Math.hypot(dx, dy);
      if (Math.abs(dx) > 1) w.facing = dx > 0 ? 1 : -1;
      if (d <= budget) {
        w.x = t.x;
        w.y = t.y;
        budget -= d;
        w.path.shift();
      } else {
        w.x += (dx / d) * budget;
        w.y += (dy / d) * budget;
        budget = 0;
      }
    }
  }
}

/** 洗牌（就地） */
function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
