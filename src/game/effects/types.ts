import type Phaser from 'phaser';
import type { HitStyle } from '../cosmetics';

/** a transient hit effect, drawn with the hitter's chosen style/colour */
export interface HitFlash {
  x: number;
  y: number;
  life: number;
  ang: number;
  style: HitStyle;
  color: number;
  power: number;
  seed: number;
}

/**
 * Paints one hit effect into the shared dynamic Graphics layer.
 *
 * @param g    the shared dynamic Graphics layer
 * @param f    the flash being drawn (position, colour, angle, seed)
 * @param t    elapsed fraction, 0 → 1
 * @param a    remaining alpha, 1 → 0
 * @param size the flash power multiplier (bigger on a smash)
 */
export type EffectPainter = (
  g: Phaser.GameObjects.Graphics,
  f: HitFlash,
  t: number,
  a: number,
  size: number,
) => void;
