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

export const SHOULDER_DY = 0.72; // fraction of PLAYER_H above the feet
export const SHOULDER_DX = 8;

// ---- shuttle -------------------------------------------------------------
export const SHUTTLE_R = 7;
export const SHUTTLE_GRAVITY = 1350;
export const SHUTTLE_DRAG = 0.0011;
export const SHUTTLE_MAX_SPEED = 2400;

// ---- racket --------------------------------------------------------------
/** how far the racket head may reach from the shoulder */
export const RACKET_MAX = 130;
/** radius of the racket head's sweet spot */
export const RACKET_HEAD_R = 36;
/** racket head radius + shuttle radius, i.e. actual contact distance */
export const CONTACT_R = RACKET_HEAD_R + SHUTTLE_R;

/** pointer jumps larger than this in one frame are treated as re-centring */
export const RACKET_TELEPORT = 110;
/** measured racket speed is smoothed with this factor (0..1, higher = snappier) */
export const RACKET_SMOOTH = 0.55;
/** hard cap on measurable racket speed */
export const RACKET_SPEED_CAP = 3200;

/** launch elevation is clamped into this band */
export const AIM_HARD_MIN = -0.45;
export const AIM_HARD_MAX = 1.35;

// ---- shot power ----------------------------------------------------------
/** the shuttle's launch speed equals the racket speed times this */
export const SHOT_SPEED_GAIN = 1.0;
export const SHOT_SPEED_MIN = 800;
export const SHOT_SPEED_MAX = 2100;
export const HIT_COOLDOWN = 0.12;
/** racket must be moving at least this fast to release a serve */
export const SERVE_SPEED_MIN = 620;

// how far either side of the net a player may travel
export const PLAYER_MARGIN = 70;

// ---- match ---------------------------------------------------------------
export const WIN_SCORE = 11;
export const POINT_PAUSE = 1.4;
export const SERVE_PAUSE = 0.6;

// ---- netcode -------------------------------------------------------------
export const NET_TICK_HZ = 60;
export const NET_INPUT_HZ = 60;

/** how far back the host rewinds the shuttle when judging a remote swing */
export const LAG_COMP_MAX_MS = 200;
