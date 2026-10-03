/**
 * 「外星人降临」限时活动：头顶一个飞碟左右盘旋，不断往下吐**陨石**——每颗陨石里
 * 都裹着一个外星人。用球拍拍中就是把它击飞（外星人算击败 +1）；没拍中的陨石落地，
 * 外星人着陆后在地上跑，还可以补拍。
 *
 * 规则（与玩家确认过的设计）：
 * - 一局 60 秒，3 颗心：被陨石砸到、被跑动的外星人碰到、被落地外星人打出的子弹打中
 *   都掉一颗，心空提前结束；
 * - 每天免费 3 次挑战（隔天重置），失败也消耗次数；
 * - 陨石越到后面掉得越密（间隔按二次曲线收紧）；
 * - 单局击杀数走**里程碑**：**每 6 杀一档**，前面两档给金币、后面十档各一件专属装扮，
 *   解锁过就不会再给（见 `ALIEN_MILESTONES`）；
 * - 每局结算另给金币与荣誉点，按击杀数算（里程碑之外的零头）。
 */
export const ALIEN_NAME = '外星人';

/** 一局的秒数 */
export const ALIEN_DURATION = 60;
/** 玩家的心数 */
export const ALIEN_HEARTS = 3;
/** 每天免费挑战次数 */
export const ALIEN_DAILY_MAX = 3;

/** 结算：每击杀给的金币 / 荣誉点（里程碑装备另算） */
export const ALIEN_COINS_PER_KILL = 25;
export const ALIEN_HONOR_PER_KILL = 2;

/** 一档里程碑：早期档给金币，后期档给一件专属物品（都只给一次） */
export interface AlienMilestone {
  /** 本局击杀数达到它就算解锁 */
  kills: number;
  /** 给一件专属物品（`ITEMS` 里的 id）——与 `coins` 二选一 */
  id?: string;
  /** 或者给金币（早期档位，直接在金币商店花） */
  coins?: number;
}

/**
 * 击杀里程碑：**每 6 杀一档**，共 12 档。
 * 前两档（6 / 12 杀）给金币——早期档位拿得快，给装扮会太容易；
 * 之后十档各给一件专属物品（头饰 / 光环 / 命中特效 / 坐骑 / 击球拖尾 / 挥拍拖尾 /
 * 球拍皮肤 / 披风 / 地环 / 角色形象），越靠后越稀有，最后一档「外星人形象」要 72 杀。
 */
export const ALIEN_MILESTONES: AlienMilestone[] = [
  { kills: 6, coins: 500 },
  { kills: 12, coins: 1500 },
  { kills: 18, id: 'hat:ufoHelm' },
  { kills: 24, id: 'aura:beacon' },
  { kills: 30, id: 'effect:meteor' },
  { kills: 36, id: 'mount:ufo' },
  { kills: 42, id: 'trail:stardust' },
  { kills: 48, id: 'swingTrail:beam' },
  { kills: 54, id: 'racketSkin:meteorite' },
  { kills: 60, id: 'cape:antigrav' },
  { kills: 66, id: 'ring:orbit' },
  { kills: 72, id: 'skin:alien' },
];

/** 本活动限定的全部物品 id（结算/图鉴用） */
export const ALIEN_ITEM_IDS: string[] = ALIEN_MILESTONES.map((m) => m.id).filter(
  (id): id is string => !!id,
);
