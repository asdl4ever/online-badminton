import type { InviteKind, SceneId } from '../net/lobby';

/**
 * 「谁在哪个界面」的展示与跳转表。
 *
 * 一处定义，好友列表（显示「在对局中 / 在潜水」+ 申请加入）和跟随房主
 * （房主换界面 ⇒ 访客路由过去）都用它，避免每个页面各写一遍。
 */
export interface SceneMeta {
  /** 列表里显示的名字 */
  label: string;
  icon: string;
  /** 这个界面在哪条路由上（'' 表示没有独立页面） */
  route: string;
  /** 这个界面是「可以联机一起玩」的吗——是的话，有房号就能直接加入 */
  kind?: InviteKind;
}

export const SCENE_META: Record<SceneId, SceneMeta> = {
  off: { label: '不在线', icon: '💤', route: '' },
  home: { label: '在主界面', icon: '🏠', route: '/home' },
  map: { label: '在大地图', icon: '🧭', route: '/', kind: 'map' },
  match: { label: '在联机对局', icon: '🏸', route: '/online', kind: 'match' },
  fish: { label: '在海湾潜水', icon: '🤿', route: '/fish', kind: 'fish' },
  mine: { label: '在矿洞', icon: '⛏️', route: '/mine', kind: 'mine' },
  climb: { label: '在攀岩', icon: '🧗', route: '/climb' },
  petshop: { label: '在宠物店', icon: '🐾', route: '/petshop' },
  hall: { label: '在名人堂', icon: '🏛️', route: '/hall' },
  farm: { label: '在农场', icon: '🌾', route: '/farm' },
};

/** 能从「好友在玩什么」直接进房间的界面（地图/对局/潜水/矿洞） */
export const SCENE_KIND: Partial<Record<SceneId, InviteKind>> = {
  map: 'map',
  match: 'match',
  fish: 'fish',
  mine: 'mine',
};

export function sceneMeta(scene: SceneId): SceneMeta {
  return SCENE_META[scene] ?? SCENE_META.off;
}

/** 路由 → 界面：App 里盯着路由，一换页面就报给大厅（好友列表因此实时） */
export function sceneFromPath(path: string): SceneId {
  if (path.startsWith('/online')) return 'match';
  if (path.startsWith('/fish')) return 'fish';
  if (path.startsWith('/mine')) return 'mine';
  if (path.startsWith('/climb')) return 'climb';
  if (path.startsWith('/petshop') || path.startsWith('/shop')) return 'petshop';
  if (path.startsWith('/hall')) return 'hall';
  if (path.startsWith('/farm')) return 'farm';
  if (path.startsWith('/home')) return 'home';
  if (path === '/' || path.startsWith('/world')) return 'map';
  return 'off';
}
