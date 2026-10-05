import type Phaser from 'phaser';

/** rig.ts 的路径工具包（原样传进来，painter 用它沿真实轨迹构图） */
export interface SwingKit {
  pts: { x: number; y: number; a: number; w: number }[];
  n: number;
  ribbon(wm: number, color: number, am: number, off?: number): void;
  core(wm: number, am: number): void;
  at(i: number, off?: number): { x: number; y: number };
  dot(i: number, r: number, color: number, am?: number): void;
  wobble(amp: (i: number) => number, wm: number, color: number, am: number): void;
}

export type G = Phaser.GameObjects.Graphics;
export const TAU = Math.PI * 2;

export interface SwingArt {
  a: number;
  draw: (g: G, now: number, hot: number, kit: SwingKit, c: number, a: number) => void;
}
