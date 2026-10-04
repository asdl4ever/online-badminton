/**
 * 大地图（WorldView）的区域定义：一块 2400×1400 的俯视平面，
 * 每个区域是平面上的一个地块，走进它外圈的虚线圆里按 E 就能进。
 *
 * 只影响 UI 与路由，和玩法逻辑无关。
 */
import { BARBER_COST } from '../items';

export interface WorldZone {
  id: string;
  /** 平面坐标（左上角为原点） */
  x: number;
  y: number;
  sign: string;
  name: string;
  meta: string;
  /** 进去之后跳哪个路由 */
  route: string;
  /** 右上角的小角标（例如“即将开启”） */
  badge?: string;
}

export const WORLD_W = 2400;
export const WORLD_H = 1400;
/** 站在这个半径内就可以进入 */
export const ZONE_RADIUS = 130;

/** 把几个相关玩法圈在一起的地块：只是地面装饰，不是点击区域 */
export interface WorldDistrict {
  id: string;
  name: string;
  /** 标题下面那句说明 */
  meta: string;
  /** 平面坐标（左上角）与尺寸 */
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * 地块：把一伙相关的玩法圈在一起（左上「比赛训练区」、右上「活动和商场区」、
 * 左下「赚钱区」）。里面各区域的坐标见下面的 WORLD_ZONES，改动这里时记得让圈
 * （半径 ZONE_RADIUS，即 2×130px）都留在框里、互相不重叠。
 */
export const WORLD_DISTRICTS: WorldDistrict[] = [
  {
    id: 'arena',
    name: '比赛训练区',
    meta: '练球 / 联机 · 杯赛 · 名人堂 · 观战',
    x: 100,
    y: 70,
    w: 1000,
    h: 620,
  },
  {
    id: 'mall',
    name: '活动和商场区',
    meta: '商店 · 宝箱 / 宠物店 / 理发店',
    x: 1330,
    y: 70,
    w: 1000,
    h: 630,
  },
  {
    id: 'earn',
    name: '赚钱区',
    meta: '砸矿 / 采棉花 / 抓鱼 → 交给农场主换金币',
    x: 120,
    y: 830,
    w: 820,
    h: 550,
  },
  {
    id: 'train',
    name: '锻炼区',
    meta: '健身房举重 · 操场跑步',
    x: 1010,
    y: 830,
    w: 860,
    h: 550,
  },
];

export const WORLD_ZONES: WorldZone[] = [
  // ---- 比赛训练区（左上角地块）----
  {
    id: 'training',
    x: 330,
    y: 230,
    sign: '🏸',
    name: '大熊球馆',
    meta: '6 张空场地 · 挑战人机 / 邀请好友 · 发球机',
    route: '/single',
  },
  {
    id: 'cliff',
    x: 2000,
    y: 1235,
    sign: '🧗',
    name: '攀岩崖',
    meta: 'Matter 刚体攀爬',
    route: '/climb',
  },
  // ---- 活动和商场区（右上角地块）----
  {
    id: 'barber',
    x: 1600,
    y: 240,
    sign: '💈',
    name: '理发店',
    meta: `表情 / 配色 / 主题 · ¥${BARBER_COST} 一次`,
    route: '/barber',
  },
  // ---- 赚钱区（左下角地块，三家挨在一起）----
  {
    id: 'pond',
    x: 300,
    y: 1235,
    sign: '🤿',
    name: '海湾',
    meta: '潜水抓鱼 · 卖钱升级渔具',
    route: '/fish',
  },
  {
    id: 'cave',
    x: 720,
    y: 1235,
    sign: '⛏️',
    name: '矿洞',
    meta: '砸矿拿金币',
    route: '/mine',
  },
  // ---- 活动和商场区（右上角地块，接着理发店排）----
  {
    id: 'shop',
    x: 1990,
    y: 240,
    sign: '🏪',
    name: '商店',
    meta: '活动 · 开宝箱',
    route: '/shop',
    badge: '活动',
  },
  {
    id: 'petshop',
    x: 1795,
    y: 520,
    sign: '🐾',
    name: '宠物店',
    meta: '每小时换一批新宠物',
    route: '/petshop',
    badge: '买宠物',
  },
  // ---- 比赛训练区（左上角地块，接着两家球场排）----
  {
    id: 'arena',
    x: 730,
    y: 230,
    sign: '🏆',
    name: '晋级赛馆',
    meta: '8 大杯赛 · 按积分解锁',
    route: '/arena',
    badge: '开赛',
  },
  {
    id: 'hall',
    x: 730,
    y: 530,
    sign: '🏛️',
    name: '名人堂',
    meta: 'AI 球员排行 · 管理球员',
    route: '/hall',
    badge: '排行',
  },
  // 观战台：夹在四家之间，和晋级赛馆 / 名人堂同一块地
  {
    id: 'watch',
    x: 960,
    y: 380,
    sign: '👁',
    name: '赛事中心',
    meta: '看比赛 · 树状图 · 真观战',
    route: '/watch',
    badge: '新',
  },
  {
    id: 'farm',
    x: 500,
    y: 1010,
    sign: '🌾',
    name: '农场',
    meta: '棉花地 · 拍下棉花材料',
    route: '/farm',
    badge: '新玩法',
  },
  // ---- 锻炼区（右下地块）：属性点靠在这里练出来 ----
  {
    id: 'gym',
    x: 1200,
    y: 1080,
    sign: '🏋️',
    name: '健身房',
    meta: '举重练「进攻」',
    route: '/gym',
    badge: '练属性',
  },
  {
    id: 'track',
    x: 1560,
    y: 1080,
    sign: '🏃',
    name: '操场',
    meta: '跑步练「速度 / 体力」',
    route: '/track',
    badge: '练属性',
  },
];
