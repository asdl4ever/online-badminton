/**
 * Tiny Web Audio synth so the game has feedback without shipping any audio
 * assets. Everything is generated from oscillators / noise buffers.
 */
class Sfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = true;

  unlock(): void {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
      const len = Math.floor(this.ctx.sampleRate * 0.2);
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private burst(dur: number, gain: number, freq: number): void {
    if (!this.enabled || !this.ctx || !this.master || !this.noise) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 0.8;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(filter).connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur + 0.02);
  }

  hit(kind: string): void {
    this.unlock();
    switch (kind) {
      case 'smash':
        this.burst(0.09, 0.9, 2400);
        this.tone(420, 0.09, 'square', 0.18, 180);
        break;
      case 'clear':
        this.burst(0.11, 0.7, 1500);
        this.tone(300, 0.12, 'triangle', 0.16, 160);
        break;
      case 'drive':
        this.burst(0.08, 0.6, 1800);
        this.tone(340, 0.08, 'square', 0.12, 200);
        break;
      case 'serve':
        this.burst(0.1, 0.5, 1200);
        this.tone(260, 0.12, 'triangle', 0.14, 180);
        break;
      default:
        this.burst(0.1, 0.55, 1100);
        this.tone(240, 0.12, 'triangle', 0.14, 320);
    }
  }

  net(): void {
    this.unlock();
    this.burst(0.18, 0.4, 320);
    this.tone(120, 0.2, 'sine', 0.16, 70);
  }

  land(): void {
    this.unlock();
    this.burst(0.06, 0.25, 700);
  }

  point(): void {
    this.unlock();
    this.tone(660, 0.12, 'sine', 0.2);
    window.setTimeout(() => this.tone(990, 0.18, 'sine', 0.2), 90);
  }

  win(): void {
    this.unlock();
    [523, 659, 784, 1046].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.22, 'triangle', 0.22), i * 110);
    });
  }

  lose(): void {
    this.unlock();
    [440, 349, 262].forEach((f, i) => {
      window.setTimeout(() => this.tone(f, 0.28, 'triangle', 0.2), i * 140);
    });
  }

  click(): void {
    this.unlock();
    this.tone(520, 0.05, 'square', 0.1);
  }
}

export const sfx = new Sfx();
