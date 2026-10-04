/**
 * Every colour the canvas draws with, in one place.
 *
 * `P` is the *live* palette: the court is drawn once per scene, so switching a
 * theme just means re-assigning `P` and redrawing. `BASE` is the default set;
 * each theme only overrides the keys it cares about so adding one stays small.
 *
 * 晋级赛的六套「赛事专属」主题来自 `arena-themes.ts`：它们在这里注册，但玩家在界面上
 * 选不到（主题选择器与自动轮换已经下线），只有赛事对局会用到。
 */
import { ARENA_THEMES, type ArenaThemeId } from './arena-themes';

export const BASE = {
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

  // --- ball machine -----------------------------------------------------
  machineFrame: 0x44586f,
  machineBody: 0xdce6f2,
  machineBarrel: 0x8fa3bd,
  machineLamp: 0xe8a33d,

  // --- climb mode -------------------------------------------------------
  climbSky: 0x101a2c,
  climbFog: 0x1a2740,
  climbRock: 0x415068,
  climbRockTop: 0x6d839f,
  climbRod: 0xc07f00,
  climbRodTip: 0xf0c060,
  climbPot: 0x2a7ad4,
  climbFlag: 0xe8a33d,

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

export type Palette = typeof BASE;

/** the live palette — mutate through applyTheme(), read directly */
export const P: Palette = { ...BASE };

/** 通用主题（玩家不出现在任何选择器里）+ 晋级赛的赛事专属主题 */
export type ThemeId = 'day' | 'sunset' | 'mint' | 'night' | ArenaThemeId;

export interface ThemeDef {
  id: ThemeId;
  label: string;
  /** two colours for the UI swatch (sky, floor) */
  swatch: [number, number];
  colors: Partial<Palette>;
}

export const THEMES: Record<ThemeId, ThemeDef> = {
  day: {
    id: 'day',
    label: '日间',
    swatch: [0xe9f1fa, 0xd3e6dc],
    colors: {},
  },
  sunset: {
    id: 'sunset',
    label: '黄昏',
    swatch: [0xffe0c0, 0xe7d3b6],
    colors: {
      skyTop: 0xffe9d2,
      skyBottom: 0xf7cdb0,
      stands: 0xe6c6ad,
      crowdA: 0xd8b096,
      crowdB: 0xefd6c2,
      apron: 0xe2c2a8,
      floor: 0xe7d3b6,
      floorStrip: 0xdcc4a0,
      floorEdge: 0xcdb28a,
      line: 0x6b4a3a,
      post: 0x6b4a3a,
      netMesh: 0x8a6a56,
      netTape: 0x6b4a3a,
      trail: 0xe08a3c,
      flash: 0xe08a3c,
      localMark: 0xb4560f,
      score: '#3a2a1e',
      sub: '#7a5a44',
    },
  },
  mint: {
    id: 'mint',
    label: '薄荷',
    swatch: [0xe6f6f1, 0xd7ece2],
    colors: {
      skyTop: 0xe6f6f1,
      skyBottom: 0xcdeae2,
      stands: 0xc2e0d6,
      crowdA: 0xa8cfc2,
      crowdB: 0xd2e8e0,
      apron: 0xbcd8cd,
      floor: 0xd7ece2,
      floorStrip: 0xc2ddce,
      floorEdge: 0xb2cdbe,
      line: 0x2f5d52,
      post: 0x35635a,
      netMesh: 0x5a8377,
      netTape: 0x2f5d52,
      trail: 0x16a085,
      flash: 0x16a085,
      localMark: 0x0f8f72,
      score: '#123028',
      sub: '#3f6b60',
    },
  },
  night: {
    id: 'night',
    label: '夜场',
    swatch: [0x1b2740, 0x24405a],
    colors: {
      skyTop: 0x1b2740,
      skyBottom: 0x0f1a2e,
      stands: 0x223350,
      crowdA: 0x2c4160,
      crowdB: 0x3a5170,
      apron: 0x2a3d5c,
      floor: 0x24405a,
      floorStrip: 0x1d3550,
      floorEdge: 0x16283e,
      line: 0x7fa8d8,
      post: 0x8fb4de,
      netMesh: 0xa9c6e6,
      netTape: 0xcfe0f5,
      shuttle: 0xf2f6ff,
      shuttleFeather: 0xcdd8ea,
      shuttleHalo: 0x000000,
      trail: 0x9fc2f0,
      shadow: 0x000000,
      localMark: 0x8fbcff,
      serveHint: 0xffd166,
      flash: 0x8fbcff,
      msgWin: '#5ce08a',
      msgLose: '#ff8a8a',
      sub: '#a9c0dd',
      score: '#eaf3ff',
      debugBg: 'rgba(10, 18, 30, 0.85)',
      debugText: '#cfe0f5',
    },
  },
  // 晋级赛的六套赛事专属主题（只注册，玩家选不到）
  ...ARENA_THEMES,
};

/** 默认球场主题：不指定主题的玩法（单机 / 联机 / 潜水 / 采矿…）都用它 */
export const DEFAULT_THEME: ThemeId = 'day';

export function applyTheme(id: ThemeId): void {
  Object.assign(P, BASE);
  const def = THEMES[id];
  if (def) Object.assign(P, def.colors);
}

/** font stack for canvas text — Latin via Chakra Petch, CJK falls through */
export const FONT_UI =
  '"Chakra Petch", system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
export const FONT_NUM = '"Chakra Petch", Consolas, ui-monospace, monospace';
/** emoji faces for player characters (platform emoji fonts, then fallback) */
export const FONT_EMOJI =
  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Chakra Petch", sans-serif';
