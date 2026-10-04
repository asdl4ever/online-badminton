/**
 * 帧时间 / 卡顿诊断（设置 → 「性能诊断」打开后由 `components/PerfHud.vue` 驱动）。
 *
 * **为什么不做「FPS 数字」**：Phaser 的 `loop.actualFps` 是**平滑过的平均值**——
 * 一秒钟里卡了一帧 48ms、其余 59 帧都正常，平均值照样 57~58，那种「突然卡一下」
 * 在 FPS 数字上根本看不出来。这里记的是**每一帧花了多久**（rAF 时间戳差分），
 * 才能抓到那一下；再把浏览器的**长任务**（`longtask`）一起列出来，
 * 定位到底卡在主线程的哪一处（渲染 / GC / 别的活儿）。
 *
 * 纯数据、零依赖（**不引 Vue、不引 Phaser**），DOM 那边按 4Hz 读一次 `snapshot()`。
 */

/** 超过这个毫秒数记一次「掉帧」（60Hz 的一帧是 16.7ms，33ms ≈ 连着掉两帧） */
const STUTTER_MS = 33;
/** 「最慢一帧 / 掉帧次数」的统计窗口 */
const WINDOW_MS = 5000;
/** 环形缓冲容量（约 17 秒 @60fps，够扫出 5 秒窗口） */
const CAP = 1024;
/** 最多记几条卡顿明细（给面板显示用） */
const SPIKE_KEEP = 6;

export interface PerfSpike {
  /** 距「现在」多少秒（负数，越接近 0 越近） */
  agoS: number;
  ms: number;
  /** `frame` = 一帧超时；`task` = 浏览器报告的长任务 */
  kind: 'frame' | 'task';
}

export interface PerfSnapshot {
  /** 最近一秒渲染了多少帧 */
  fps: number;
  /** 最近 `WINDOW_MS` 内最慢的一帧（ms） */
  worstMs: number;
  /** 面板打开至今最慢的一帧（ms）——卡顿可能一分钟才来一次，5 秒窗口容易错过 */
  worstEverMs: number;
  /** 最近 `WINDOW_MS` 内的掉帧次数（> STUTTER_MS 的帧） */
  drops: number;
  /** 该窗口一共多少帧（用来判断「3 次掉帧」严不严重） */
  frames: number;
  windowS: number;
  /** 最近的卡顿明细（帧 + 长任务，按时间从近到远） */
  spikes: PerfSpike[];
  /** 浏览器支不支持 `longtask` 观测 */
  longTaskOk: boolean;
  /** JS 堆占用（MB）；浏览器不给就是 null */
  heapMB: number | null;
}

export class PerfMeter {
  /** 每帧耗时（ms）与那一帧的时间戳，环形缓冲 */
  private times = new Float32Array(CAP);
  private stamps = new Float64Array(CAP);
  /** 下一个写入位置 */
  private head = 0;
  /** 已写入的条数（封顶 CAP） */
  private count = 0;

  /** 长任务明细（`at` 是 `performance.now()` 基准的绝对时刻） */
  private taskAt: number[] = [];
  private taskMs: number[] = [];

  longTaskOk = false;

  /** 面板打开至今最慢的一帧 */
  private worstEver = 0;

  private raf = 0;
  private last = 0;
  private observer: PerformanceObserver | null = null;

  /**
   * 页面从后台回来时把时间基准往前推。
   *
   * ⚠️ 别用「间隔 > 500ms 就跳过」那种懒办法：**主线程被卡 2 秒**也是一个超长间隔，
   * 那样会被当成「切后台」丢掉，于是「累计最慢」永远看不到真正的那一下。
   * 改成用 `document.hidden` 判断：不可见时 rAF 停 / 被节流，那段时间不记；
   * 可见时不管多大都记下来（那才是真的卡）。
   */
  private onVisibility = (): void => {
    this.last = performance.now();
  };

  start(): void {
    if (this.raf) return;
    this.observeLongTasks();
    document.addEventListener('visibilitychange', this.onVisibility);
    this.last = performance.now();
    const tick = (now: number): void => {
      const dt = now - this.last;
      this.last = now;
      // 只在页面可见时记账；熄屏 / 切后台那段不算掉帧
      if (dt > 0 && !document.hidden) this.push(dt, now);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.observer?.disconnect();
    this.observer = null;
    this.head = 0;
    this.count = 0;
    this.worstEver = 0;
    this.taskAt = [];
    this.taskMs = [];
  }

  private push(dt: number, now: number): void {
    this.times[this.head] = dt;
    this.stamps[this.head] = now;
    this.head = (this.head + 1) % CAP;
    if (this.count < CAP) this.count++;
    if (dt > this.worstEver) this.worstEver = dt;
  }

  private observeLongTasks(): void {
    if (typeof PerformanceObserver === 'undefined') return;
    const supported = PerformanceObserver.supportedEntryTypes?.includes('longtask');
    if (!supported) return;
    try {
      this.observer = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          this.taskAt.push(e.startTime);
          this.taskMs.push(e.duration);
          if (this.taskAt.length > SPIKE_KEEP) {
            this.taskAt.shift();
            this.taskMs.shift();
          }
        }
      });
      this.observer.observe({ entryTypes: ['longtask'] });
      this.longTaskOk = true;
    } catch {
      this.observer = null;
      this.longTaskOk = false;
    }
  }

  /** 第 k 新的那条在环形缓冲里的下标（k = 0 是最新） */
  private at(k: number): number {
    return (this.head - 1 - k + CAP * 2) % CAP;
  }

  /** 读一份快照（4Hz 调用就够；自己会扫一遍窗口，1024 条以内，代价可忽略） */
  snapshot(): PerfSnapshot {
    const now = performance.now();
    let worst = 0;
    let drops = 0;
    let frames = 0;
    let fps = 0;
    for (let k = 0; k < this.count; k++) {
      const i = this.at(k);
      const age = now - this.stamps[i];
      if (age > WINDOW_MS) break; // 再往回只会更老
      const dt = this.times[i];
      frames++;
      if (dt > worst) worst = dt;
      if (dt > STUTTER_MS) drops++;
      if (age <= 1000) fps++;
    }

    const spikes: PerfSpike[] = [];
    for (let k = 0; k < this.count && spikes.length < SPIKE_KEEP; k++) {
      const i = this.at(k);
      const age = now - this.stamps[i];
      if (age > WINDOW_MS) break;
      if (this.times[i] > STUTTER_MS) {
        spikes.push({ agoS: -age / 1000, ms: this.times[i], kind: 'frame' });
      }
    }
    for (let k = this.taskAt.length - 1; k >= 0 && spikes.length < SPIKE_KEEP; k--) {
      const age = now - this.taskAt[k];
      if (age > WINDOW_MS) continue;
      spikes.push({ agoS: -age / 1000, ms: this.taskMs[k], kind: 'task' });
    }
    spikes.sort((a, b) => b.agoS - a.agoS); // 越接近 0 越近，排前面

    const mem = (
      performance as Performance & { memory?: { usedJSHeapSize: number } }
    ).memory;

    return {
      fps,
      worstMs: worst,
      worstEverMs: this.worstEver,
      drops,
      frames,
      windowS: WINDOW_MS / 1000,
      spikes,
      longTaskOk: this.longTaskOk,
      heapMB: mem ? Math.round(mem.usedJSHeapSize / 1048576) : null,
    };
  }
}
