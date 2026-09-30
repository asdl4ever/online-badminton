import type { ShuttleState } from './types';

export interface NetMetrics {
  /** '房主(本地权威)' / '访客' etc. */
  role: string;
  /** round-trip time in ms, 0 while unknown */
  rttMs: number;
  /** spread of recent RTT samples */
  jitterMs: number;
  /** mean interval between snapshots, ms */
  snapIntervalMs: number;
  snapHz: number;
  /** how far behind the newest snapshot the rendered shuttle is, ms */
  ballRenderLagMs: number;
  /** that lag expressed as pixels of travel */
  ballTrailPx: number;
  /** shuttle speed used for the conversion, px/s */
  ballSpeed: number;
  /** rtt/2 + render lag — the number we are trying to shrink */
  ballTotalLagMs: number;
  snapshots: number;
  /** the sender's render frame rate, which caps the snapshot rate */
  fps: number;
  /** true once we have enough samples for the numbers to mean anything */
  ready: boolean;
}

const SAMPLE_WINDOW = 30;

function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  let sum = 0;
  for (const x of xs) sum += x;
  return sum / xs.length;
}

/**
 * Client-side measurements for the multiplayer link.
 *
 * Everything here is observable from the guest without a shared clock:
 *  - RTT comes from an echoed timestamp, so no clock sync is needed.
 *  - Snapshot cadence comes from local arrival times.
 *  - Ball lag is derived from how far the rendered shuttle trails the freshest
 *    authoritative sample, divided by how fast it is travelling.
 */
export class Telemetry {
  role = '本地';
  transport = '';

  private rttSamples: number[] = [];
  private snapTimes: number[] = [];
  private snapGaps: number[] = [];
  private lagSamples: number[] = [];
  private snapshots = 0;

  private ballRenderLagMs = 0;
  private ballTrailPx = 0;
  private ballSpeed = 0;
  fps = 0;

  reset(): void {
    this.rttSamples = [];
    this.snapTimes = [];
    this.snapGaps = [];
    this.lagSamples = [];
    this.snapshots = 0;
    this.ballRenderLagMs = 0;
    this.ballTrailPx = 0;
    this.ballSpeed = 0;
  }

  /** the peer echoed our stamp: now - ts is the full round trip */
  onPong(ts: number, now: number): void {
    const rtt = now - ts;
    if (rtt < 0 || rtt > 10000) return;
    this.rttSamples.push(rtt);
    if (this.rttSamples.length > SAMPLE_WINDOW) this.rttSamples.shift();
  }

  /** called from applySnapshot so we can see the arrival cadence */
  onSnapshot(now: number): void {
    this.snapshots++;
    const prev = this.snapTimes[this.snapTimes.length - 1];
    if (prev !== undefined) {
      const dt = now - prev;
      if (dt > 0 && dt < 1000) {
        this.snapGaps.push(dt);
        if (this.snapGaps.length > SAMPLE_WINDOW) this.snapGaps.shift();
      }
    }
    this.snapTimes.push(now);
    if (this.snapTimes.length > SAMPLE_WINDOW) this.snapTimes.shift();
  }

  /**
   * Compare the shuttle we are drawing with the freshest authoritative sample.
   * `rendered` trails `latest` by however much smoothing/buffering we apply.
   */
  sampleShuttle(rendered: ShuttleState, latest: ShuttleState): void {
    // while the shuttle is parked we keep the last flight's numbers: the
    // readout answers "the last time it flew, how far behind was it?"
    if (!rendered.live || !latest.live) return;
    const dx = latest.x - rendered.x;
    const dy = latest.y - rendered.y;
    const trail = Math.hypot(dx, dy);
    const speed = Math.hypot(latest.vx, latest.vy);
    this.ballTrailPx = trail;
    this.ballSpeed = speed;
    // below ~80px/s the "distance / speed" conversion explodes; skip instead
    // of reporting nonsense
    if (speed <= 80) return;
    this.lagSamples.push((trail / speed) * 1000);
    if (this.lagSamples.length > SAMPLE_WINDOW) this.lagSamples.shift();
    this.ballRenderLagMs = mean(this.lagSamples);
  }

  get rttMs(): number {
    return mean(this.rttSamples);
  }

  get jitterMs(): number {
    if (this.rttSamples.length < 3) return 0;
    const m = mean(this.rttSamples);
    let worst = 0;
    for (const x of this.rttSamples) worst = Math.max(worst, Math.abs(x - m));
    return worst;
  }

  read(): NetMetrics {
    const interval = mean(this.snapGaps);
    const rtt = this.rttMs;
    return {
      role: this.role,
      rttMs: rtt,
      jitterMs: this.jitterMs,
      snapIntervalMs: interval,
      snapHz: interval > 1 ? 1000 / interval : 0,
      ballRenderLagMs: this.ballRenderLagMs,
      ballTrailPx: this.ballTrailPx,
      ballSpeed: this.ballSpeed,
      ballTotalLagMs: rtt / 2 + this.ballRenderLagMs,
      snapshots: this.snapshots,
      fps: this.fps,
      ready: this.rttSamples.length >= 3 && this.snapGaps.length >= 5,
    };
  }
}
