/**
 * Climb level data.
 *
 * A rock is a rotated box: it is both the collision shape and the drawing, so
 * what you see is exactly what you hit. Slopes are boxes with an `angle`, which
 * keeps the physics exact without needing a polygon decomposer.
 *
 * y grows downwards, so the summit is at a large negative y.
 */

export interface Rock {
  x: number;
  y: number;
  w: number;
  h: number;
  /** radians; a tilted ledge is a ramp you can slide along */
  angle?: number;
}

/** top of the floor slab */
export const GROUND_Y = 0;
/** the camera may not scroll above this */
export const LEVEL_TOP = -2760;
/** the shaft the player is fenced into */
export const WALL_L = -40;
export const WALL_R = 1320;

export const START = { x: 250, y: -90 };
/** standing here means you made it */
export const SUMMIT = { x: 690, y: -2180 };

export const ROCKS: Rock[] = [
  // floor
  { x: 640, y: GROUND_Y + 70, w: 1400, h: 140 },

  // --- lower pitches: short, forgiving gaps ---
  { x: 300, y: -270, w: 380, h: 26, angle: -0.05 },
  { x: 920, y: -480, w: 340, h: 26, angle: 0.06 },
  { x: 430, y: -700, w: 400, h: 26, angle: -0.04 },
  { x: 1000, y: -920, w: 320, h: 26, angle: 0.08 },

  // blocks to hook the rod on, or to push off
  { x: 1120, y: -640, w: 44, h: 320 },
  { x: 170, y: -1010, w: 44, h: 340 },

  // --- middle: longer reaches ---
  { x: 350, y: -1160, w: 330, h: 26, angle: -0.07 },
  { x: 880, y: -1380, w: 380, h: 26, angle: 0.05 },
  { x: 1120, y: -1520, w: 44, h: 300 },
  { x: 500, y: -1610, w: 300, h: 26, angle: -0.06 },

  // --- upper: the wall gets meaner ---
  { x: 200, y: -1900, w: 44, h: 320 },
  { x: 960, y: -1830, w: 340, h: 26, angle: 0.04 },
  { x: 600, y: -2020, w: 300, h: 26, angle: -0.03 },

  // --- summit shelf ---
  { x: SUMMIT.x, y: -2130, w: 660, h: 34 },
];

/**
 * Where the pot and the rod sit when the scene (re)starts. The rod hangs down
 * and to the right of the pot, the way a hammer rests on the ground.
 */
export const SPAWN = {
  pot: { x: START.x, y: START.y },
  rod: { x: START.x + 46, y: START.y - 26 },
};
