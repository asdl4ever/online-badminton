import type { Palette } from './theme';

/**
 * 晋级赛「赛事专属」球场主题。
 *
 * 六套配色对应六种赛事身份（见 `arena-events.ts`），只注册进 `theme.ts` 的 `THEMES`，
 * 玩家在界面上选不到（理发店的主题选择与自动轮换已经下线）——只有赛事对局会用到
 * （`ArenaView` 把主题传给 `GameCanvas`）。
 *
 * 只覆盖「球场相关」的键（天空 / 看台 / 围裙 / 地板 / 界线 / 网 / 拖尾 / 画布文字），
 * 羽毛球与角色的颜色一律继承 `BASE`，保证任何底色下球与角色都清晰可辨。
 * 老将组是夜场，所以额外覆盖了球与阴影的浅色（与既有的 `night` 主题同一套处理）。
 *
 * 新增一套主题 = 在这里加一条 + 在 `arena-events.ts` 里指给某个身份。
 */

export type ArenaThemeId =
  | 'courtyard'
  | 'smashHall'
  | 'highClearHall'
  | 'lakeside'
  | 'veteranHall'
  | 'grandArena';

/** 与 `theme.ts` 的 `ThemeDef` 结构一致（这里不直接引用，避免 id 联合类型互相依赖） */
export interface ArenaThemeDef {
  id: ArenaThemeId;
  label: string;
  /** UI 色块（天空 / 地板） */
  swatch: [number, number];
  colors: Partial<Palette>;
}

export const ARENA_THEMES: Record<ArenaThemeId, ArenaThemeDef> = {
  // 社区体育馆：暖白日间，浅绿地板
  courtyard: {
    id: 'courtyard',
    label: '社区馆',
    swatch: [0xeaf4e2, 0xd9ebc9],
    colors: {
      skyTop: 0xeaf4e2,
      skyBottom: 0xd6e9c8,
      stands: 0xcfe3c0,
      crowdA: 0xb3cfa0,
      crowdB: 0xd8ecc8,
      apron: 0xc6dcb6,
      floor: 0xdcebc9,
      floorStrip: 0xcde2b6,
      floorEdge: 0xbdd4a4,
      line: 0x4a6b3f,
      post: 0x557a48,
      netMesh: 0x7c9c6b,
      netTape: 0x4a6b3f,
      trail: 0x6fa85a,
      localMark: 0x4f8f3a,
      score: '#243318',
      sub: '#4f6a44',
    },
  },
  // 城东进攻训练馆：橙红暖厅，界线压深
  smashHall: {
    id: 'smashHall',
    label: '进攻训练馆',
    swatch: [0xffe6d2, 0xf0c4a6],
    colors: {
      skyTop: 0xffe6d2,
      skyBottom: 0xf7c6a4,
      stands: 0xe8b493,
      crowdA: 0xd79a76,
      crowdB: 0xf0c4a6,
      apron: 0xe0aa88,
      floor: 0xf3d4b8,
      floorStrip: 0xe8c3a2,
      floorEdge: 0xd9b18e,
      line: 0x7a2e12,
      post: 0x8a3517,
      netMesh: 0xb06a48,
      netTape: 0x7a2e12,
      trail: 0xe4622f,
      localMark: 0xd4501a,
      score: '#3b1a0c',
      sub: '#8a4a2c',
    },
  },
  // 老城区高远球馆：靛蓝冷调，网带浅蓝
  highClearHall: {
    id: 'highClearHall',
    label: '高远球馆',
    swatch: [0xe4edfa, 0xc6d6ee],
    colors: {
      skyTop: 0xe4edfa,
      skyBottom: 0xc6d8f0,
      stands: 0xc0d2ea,
      crowdA: 0xa2bada,
      crowdB: 0xd0dff2,
      apron: 0xb8cbe6,
      floor: 0xd7e3f4,
      floorStrip: 0xc6d6ee,
      floorEdge: 0xb2c6e2,
      line: 0x24457c,
      post: 0x2b4f8a,
      netMesh: 0x6d8cba,
      netTape: 0x24457c,
      trail: 0x3d6fb8,
      localMark: 0x2b5fa8,
      score: '#152942',
      sub: '#4a6488',
    },
  },
  // 湖畔快腿中心：青绿水岸，地面偏亮
  lakeside: {
    id: 'lakeside',
    label: '湖畔中心',
    swatch: [0xe2f6f3, 0xc0e4de],
    colors: {
      skyTop: 0xe2f6f3,
      skyBottom: 0xc0e8e3,
      stands: 0xbde0da,
      crowdA: 0x9ccbc4,
      crowdB: 0xd2efeb,
      apron: 0xaed8d2,
      floor: 0xd3efea,
      floorStrip: 0xc0e4de,
      floorEdge: 0xa9d3cc,
      line: 0x146662,
      post: 0x187a74,
      netMesh: 0x5b9d97,
      netTape: 0x146662,
      trail: 0x1fa5a0,
      localMark: 0x188a85,
      score: '#0b2b29',
      sub: '#3f6f6b',
    },
  },
  // 市体育馆老将专场：深紫夜灯，观众席压暗（球与阴影转浅色，同 night）
  veteranHall: {
    id: 'veteranHall',
    label: '老将夜场',
    swatch: [0x2a2440, 0x3a3462],
    colors: {
      skyTop: 0x2a2440,
      skyBottom: 0x1a1630,
      stands: 0x2e2a4a,
      crowdA: 0x3a3560,
      crowdB: 0x474170,
      apron: 0x342f56,
      floor: 0x3a3462,
      floorStrip: 0x2f2a52,
      floorEdge: 0x262146,
      line: 0xa99cdc,
      post: 0xb5a9e4,
      netMesh: 0xc4b8ea,
      netTape: 0xd6cdf0,
      shuttle: 0xf2f6ff,
      shuttleFeather: 0xcdd8ea,
      shuttleHalo: 0x000000,
      shadow: 0x000000,
      trail: 0xc4b8ea,
      localMark: 0xb5a9e4,
      flash: 0xb5a9e4,
      serveHint: 0xffd166,
      msgWin: '#5ce08a',
      msgLose: '#ff8a8a',
      score: '#efeaff',
      sub: '#b6aede',
    },
  },
  // 中心竞技场：金色聚光，场地高对比
  grandArena: {
    id: 'grandArena',
    label: '中心竞技场',
    swatch: [0xfdf3d8, 0xeddfb2],
    colors: {
      skyTop: 0xfdf3d8,
      skyBottom: 0xf3e0b0,
      stands: 0xe8d3a2,
      crowdA: 0xd6bd85,
      crowdB: 0xf0e0ba,
      apron: 0xe4cc96,
      floor: 0xf7ecca,
      floorStrip: 0xeddfb2,
      floorEdge: 0xdccb98,
      line: 0x7a5a12,
      post: 0x8a671a,
      netMesh: 0xb59a55,
      netTape: 0x7a5a12,
      trail: 0xc9962f,
      localMark: 0xa87c1c,
      score: '#3a2c08',
      sub: '#7d6a35',
    },
  },
};

/** 六套赛事主题的 id 列表（顺序与 `arena-events.ts` 的身份表一致） */
export const ARENA_THEME_IDS: ArenaThemeId[] = [
  'courtyard',
  'smashHall',
  'highClearHall',
  'lakeside',
  'veteranHall',
  'grandArena',
];
