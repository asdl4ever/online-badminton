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
  map: { label: '在大世界', icon: '🧭', route: '/', kind: 'map' },
  // 对局统一落在联机页：好友「加入 / 跟着房主」都去这里，页面自己按房号入房
  match: { label: '在联机对局', icon: '🏸', route: '/online', kind: 'match' },
  fish: { label: '在海湾潜水', icon: '🤿', route: '/fish', kind: 'fish' },
  mine: { label: '在矿洞', icon: '⛏️', route: '/mine', kind: 'mine' },
  climb: { label: '在攀岩', icon: '🧗', route: '/climb' },
  petshop: { label: '在宠物店', icon: '🐾', route: '/petshop' },
  watch: { label: '在赛事中心观战', icon: '👁', route: '/watch' },
  farm: { label: '在农场', icon: '🌾', route: '/farm' },
  nailong: { label: '在小黄龙联名', icon: '🐲', route: '/nailong' },
  godzilla: { label: '在打哥斯拉', icon: '🦖', route: '/godzilla' },
  alien: { label: '在打外星人', icon: '🛸', route: '/alien' },
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

/** 「能不能直接进他的房间」+ 不能的原因 */
export interface JoinInfo {
  can: boolean;
  /** 不能加入的原因（按钮置灰的提示、以及列表里显示的那句话） */
  reason: string;
}

/** 不能一起玩的界面，各自给一句「为什么」——比笼统的「不可加入」有用 */
const NO_JOIN_REASON: Partial<Record<SceneId, string>> = {
  off: '离线',
  home: '在主界面，还没开始玩',
  climb: '攀岩暂不支持联机',
  petshop: '宠物店里没有对局',
  watch: '在赛事中心看比赛',
  farm: '农场没有联机',
  nailong: '小黄龙联名单人挑战中',
  godzilla: '哥斯拉 Boss 战进行中，无法加入',
};

/**
 * 一键加入的唯一判据：大厅同步来的「在哪个界面 / 房号 / 是否允许加入」。
 * 三家（好友列表、在线玩家列表、跟随房主）都调它，避免各自本地误判。
 */
export function joinInfo(
  scene: SceneId,
  room: string,
  online: boolean,
  allowJoin = true,
): JoinInfo {
  if (!online) return { can: false, reason: '离线' };
  if (!allowJoin) return { can: false, reason: '对方关掉了「允许好友加入」' };
  const kind = SCENE_KIND[scene];
  if (!kind) return { can: false, reason: NO_JOIN_REASON[scene] ?? '这个模式不能加入' };
  if (room.length < 4) return { can: false, reason: '还没开房，先邀请他吧' };
  return { can: true, reason: '' };
}

/** 路由 → 界面：App 里盯着路由，一换页面就报给大厅（好友列表因此实时） */
export function sceneFromPath(path: string): SceneId {
  if (path.startsWith('/online')) return 'match';
  if (path.startsWith('/fish')) return 'fish';
  if (path.startsWith('/mine')) return 'mine';
  if (path.startsWith('/climb')) return 'climb';
  if (path.startsWith('/petshop') || path.startsWith('/shop')) return 'petshop';
  if (path.startsWith('/watch')) return 'watch';
  if (path.startsWith('/farm')) return 'farm';
  if (path.startsWith('/nailong')) return 'nailong';
  if (path.startsWith('/godzilla')) return 'godzilla';
  if (path.startsWith('/alien')) return 'alien';
  if (path.startsWith('/home')) return 'home';
  // 新闻周刊只是个阅读页：当成「在主界面」（没有独立的联机场景 id）
  if (path.startsWith('/news')) return 'home';
  if (path === '/' || path.startsWith('/world')) return 'map';
  return 'off';
}
