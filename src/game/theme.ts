/**
 * Every colour the canvas draws with, in one place.
 *
 * The court is light, so the shuttle has to be dark to stay visible — that is
 * the one constraint that drives most of this file. Keep the two team colours
 * (blue / orange) clearly distinct from the floor and from each other.
 */
export const P = {
  // --- court ------------------------------------------------------------
  skyTop: 0xe9f1fa,
  skyBottom: 0xd2e2f3,

  stands: 0xccd9ea,
  crowdA: 0xa9bdd6,
  crowdB: 0xc3d1e3,
  apron: 0xbfd0e2,

  floor: 0xd3e6dc,
  floorStrip: 0xbfd9cb,
  floorEdge: 0xb2cec0,

  /** court markings / net — mid slate reads on both sky and floor */
  line: 0x3f5570,
  post: 0x445d78,
  netMesh: 0x5f7791,
  netTape: 0x3f5570,

  // --- shuttle: dark, with a soft dark halo for separation --------------
  shuttle: 0x1e2b40,
  shuttleFeather: 0x5c7288,
  shuttleHalo: 0x1e2b40,
  trail: 0x6f9fce,

  // --- actors -----------------------------------------------------------
  player0: 0x2a7ad4,
  player1: 0xd4542c,
  skin: 0xf0c49c,
  grip: 0x5b6b80,
  racket: 0x44586f,

  shadow: 0x1b2740,
  localMark: 0x1f6fd0,
  serveHint: 0xc07f00,
  flash: 0x1f6fd0,

  // --- on-canvas HUD ----------------------------------------------------
  msgWin: '#17804a',
  msgLose: '#c02c2c',
  sub: '#52678a',
  score: '#17233a',

  debugBg: 'rgba(255, 255, 255, 0.9)',
  debugText: '#2c4363',

  replayFill: 0x1f6fd0,
  replayBorder: 0x8fbcff,
  replayText: '#ffffff',
  replayTextHover: '#eaf3ff',

  // --- touch overlay ----------------------------------------------------
  stickFill: 0x1b2740,
  stickLine: 0x1b2740,
  knobIdle: 0x5b7191,
  knobLive: 0x1f6fd0,
  jumpCue: 0xc07f00,

  editScrim: 0xe9eff7,
  editLine: 0x1f6fd0,
  btnPrimary: 0x1f6fd0,
  btnSecondary: 0xdbe5f2,
  btnBorder: 0x8fbcff,

  touchHintText: '#52678a',
  touchEditHintText: '#2c4363',
  touchBtnText: '#ffffff',
  touchBtnAltText: '#2c4363',
};

/** font stack for canvas text — Latin via Chakra Petch, CJK falls through */
export const FONT_UI =
  '"Chakra Petch", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
export const FONT_NUM = '"Chakra Petch", Consolas, ui-monospace, monospace';
