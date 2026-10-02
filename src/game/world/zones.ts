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

export const WORLD_ZONES: WorldZone[] = [
  {
    id: 'training',
    x: 480,
    y: 680,
    sign: '🏸',
    name: '训练场',
    meta: '对战 AI · 发球机',
    route: '/single',
  },
  {
    id: 'court',
    x: 1140,
    y: 300,
    sign: '🌐',
    name: '联机球场',
    meta: '建房 / 加入房间',
    route: '/online',
    badge: '可邀请',
  },
  {
    id: 'cliff',
    x: 1900,
    y: 620,
    sign: '🧗',
    name: '攀岩崖',
    meta: 'Matter 刚体攀爬',
    route: '/climb',
  },
  {
    id: 'barber',
    x: 1520,
    y: 620,
    sign: '💈',
    name: '理发店',
    meta: `表情 / 配色 / 主题 · ¥${BARBER_COST} 一次`,
    route: '/barber',
  },
  {
    id: 'pond',
    x: 760,
    y: 1140,
    sign: '🤿',
    name: '海湾',
    meta: '潜水抓鱼 · 卖钱升级渔具',
    route: '/fish',
  },
  {
    id: 'cave',
    x: 1820,
    y: 1140,
    sign: '⛏️',
    name: '矿洞',
    meta: '砸矿拿金币',
    route: '/mine',
  },
  {
    id: 'shop',
    x: 760,
    y: 340,
    sign: '🏪',
    name: '商店',
    meta: '活动 · 开宝箱',
    route: '/shop',
    badge: '活动',
  },
  {
    id: 'petshop',
    x: 300,
    y: 380,
    sign: '🐾',
    name: '宠物店',
    meta: '每小时换一批新宠物',
    route: '/petshop',
    badge: '买宠物',
  },
  {
    id: 'arena',
    x: 1300,
    y: 900,
    sign: '🏆',
    name: '晋级赛馆',
    meta: '8 人淘汰赛 · 赢金币积分',
    route: '/arena',
    badge: '开赛',
  },
];
