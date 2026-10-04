// ---- play field ----------------------------------------------------------
export const VIEW_W = 1280;
export const VIEW_H = 720;

export const GROUND_Y = 640;
export const NET_X = 640;
export const NET_HEIGHT = 108;
export const NET_TOP = GROUND_Y - NET_HEIGHT;
export const NET_HALF_W = 5;

// a hair in from the screen edges so the boundary line stays visible once the
// canvas is scaled into a rounded container (otherwise it is clipped away)
export const COURT_LEFT = 14;
export const COURT_RIGHT = VIEW_W - 14;

// ---- players -------------------------------------------------------------
export const PLAYER_W = 32;
export const PLAYER_H = 108;
export const PLAYER_SPEED = 430;
export const PLAYER_ACCEL = 4200;
export const PLAYER_JUMP_V = -760;
export const PLAYER_GRAVITY = 2200;

// ---- 体力（stamina）-------------------------------------------------------
// 设计目标：终结超长稳定回合。跑动越多、击球越频繁 → 体力掉得越快；
// 体力低了移动变慢、击球变软、AI 失误率上升 → 长回合被自然终结。
//
// **消耗再乘一层「体力」属性**（见 attrs.stamina）：角色一上来体力比较弱，
// 跑动 / 挥拍掉得更快；去操场把体力练上去，同样的跑动才省得下来。
export const STAMINA_MAX = 100;
/** 每分之间（发球前）恢复的体力（再乘本人的体力属性倍率） */
export const STAMINA_POINT_RECOVER = 16;
/** 站着不动的自然恢复（每秒）；跑动中恢复打折 */
export const STAMINA_REGEN_STILL = 3.6;
/** 跑动中的自然恢复系数（0~1，乘在 STAMINA_REGEN_STILL 上） */
export const STAMINA_REGEN_MOVING = 0.15;
/** 满速跑动每秒消耗的体力（再 ÷ 体力属性倍率） */
export const STAMINA_RUN_DRAIN = 12.5;
/** 起跳一次的消耗（再 ÷ 体力属性倍率） */
export const STAMINA_JUMP_DRAIN = 4.5;
/** 每次击球（挥拍触球）的消耗（再 ÷ 体力属性倍率） */
export const STAMINA_HIT_DRAIN = 6.5;
/** 空体力时的移动速度折扣（0.65 = 六五折） */
export const STAMINA_SPEED_FLOOR = 0.65;
/** 空体力时的击球力度折扣 */
export const STAMINA_POWER_FLOOR = 0.72;
/** AI 额外失误率上限（空体力时叠加到 blunder 上） */
export const STAMINA_BLUNDER = 0.16;

export const SHOULDER_DY = 0.72; // fraction of PLAYER_H above the feet
export const SHOULDER_DX = 7;

// ---- shuttle -------------------------------------------------------------
export const SHUTTLE_R = 7;
export const SHUTTLE_GRAVITY = 1350;
// quadratic air drag: stronger = the shuttle bleeds speed faster and drops
// shorter. Tuned so a full clear from mid-court still reaches the far line.
export const SHUTTLE_DRAG = 0.0016;
export const SHUTTLE_MAX_SPEED = 2400;

// ---- racket --------------------------------------------------------------
/** how far the racket head may reach from the shoulder */
export const RACKET_MAX = 110;
/** radius of the racket head's sweet spot */
export const RACKET_HEAD_R = 30;
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
export const SERVE_SPEED_MIN = 700;
/**
 * After a serve resets the players, the racket has to settle for this long
 * before it is allowed to release. Without it, re-positioning the mouse on the
 * frame after the reset counts as a swing and serves by accident.
 */
export const SERVE_ARM_DELAY = 0.3;
/**
 * A serve must also travel in a sane direction: the racket has to be moving
 * towards the opponent or upwards. Pulling the racket back to re-aim no longer
 * fires a serve.
 */
export const SERVE_FORWARD_MIN = 60;
/** both players are kept at least this far from the net while a serve is set */
export const SERVE_NET_MARGIN = 170;
/**
 * A shot that would sail past the opponent's back line has its power trimmed
 * so it drops in. This is how far past the line it is still allowed to land
 * (the tolerated overshoot), in px.
 */
export const SHOT_LAND_SLACK = 30;

// how far past each back line a player may travel (the back lines are now the
// screen edges, so 0 keeps everyone on screen)
export const PLAYER_MARGIN = 0;

// ---- match ---------------------------------------------------------------
export const WIN_SCORE = 11;
export const POINT_PAUSE = 1.4;
export const SERVE_PAUSE = 0.6;

// ---- netcode -------------------------------------------------------------
export const NET_TICK_HZ = 60;
export const NET_INPUT_HZ = 60;

/** how far back the host rewinds the shuttle when judging a remote swing */
export const LAG_COMP_MAX_MS = 200;
