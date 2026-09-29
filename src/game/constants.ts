// ---- play field ----------------------------------------------------------
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const GROUND_Y = 640;
export const NET_X = 640;
export const NET_HEIGHT = 108;
export const NET_TOP = GROUND_Y - NET_HEIGHT;
export const NET_HALF_W = 5;

export const COURT_LEFT = 170;
export const COURT_RIGHT = 1110;

// ---- players -------------------------------------------------------------
export const PLAYER_W = 38;
export const PLAYER_H = 126;
export const PLAYER_SPEED = 430;
export const PLAYER_ACCEL = 4200;
export const PLAYER_JUMP_V = -760;
export const PLAYER_GRAVITY = 2200;

export const RACKET_OFFSET_X = 28;
export const RACKET_OFFSET_Y = 0.85; // fraction of PLAYER_H above the feet
export const RACKET_REACH = 95;

export const SWING_DURATION = 0.24;
export const SWING_COOLDOWN = 0.28;
export const SWING_ACTIVE_START = 0.02;
export const SWING_ACTIVE_END = 0.16;

// how far either side of the net a player may travel
export const PLAYER_MARGIN = 70;

// ---- shuttle -------------------------------------------------------------
export const SHUTTLE_R = 7;
export const SHUTTLE_GRAVITY = 1350;
export const SHUTTLE_DRAG = 0.0011;
export const SHUTTLE_MAX_SPEED = 2400;

// ---- match ---------------------------------------------------------------
export const WIN_SCORE = 11;
export const POINT_PAUSE = 1.4;
export const SERVE_PAUSE = 0.6;

// ---- shot classification (relative to the player's head) ------------------
// d = headY - shuttle.y ; larger = higher contact
export const OVERHEAD_D = -10;
export const DRIVE_D = -70;
// a contact above this line (higher up) can be attacked flat
export const NET_ATTACK_Y = NET_TOP - 20;

// ---- netcode -------------------------------------------------------------
export const NET_TICK_HZ = 30;
export const NET_INPUT_HZ = 40;
