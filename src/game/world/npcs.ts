import { DEFAULT_COSMETIC, type Cosmetic } from '../cosmetics';

/**
 * 大地图上的固定 NPC（不联机、不存档，就是站在那儿的人）。
 *
 * 目前只有赚钱区里那位**农场主**：手里一条鞭子，站在农田圈外、贴着那条横路，
 * 玩家从农场走向海湾 / 矿洞时会从他跟前过——靠近 `range` 就先骂一句，然后**抽你一鞭**。
 * 抽到只做表演：震屏 + 把你朝外拍退一小段 + 冒星星，**不掉任何东西**，
 * 隔 `cooldown` 秒才会再抽（逻辑在 `WorldView.vue` 的 `stepNpcs`）。
 *
 * 摆位要注意两件事：
 * ① `x / y` 要落在**别的区域圈（`ZONE_RADIUS` = 130）之外**，否则你站在他跟前时
 *    「按 E 进入某玩法」的提示会和这段对话抢注意力；
 * ② 别摆在地图边缘——玩家坐标被夹在 `[70, W-70]`，贴边的 NPC 走不到跟前。
 */
export interface WorldNpc {
  id: string;
  name: string;
  x: number;
  y: number;
  /** 靠近到这个距离（世界 px）就开腔 */
  range: number;
  /** 台词：冒完气泡**有概率**抽你一鞭（见 `lashChance`） */
  line: string;
  /** 一次演出之后隔多久才会再开口（秒） */
  cooldown: number;
  /**
   * 抽你一鞭的概率（0 = 从不）。农场主现在主要是**收购商**，
   * 只有 ~15% 的概率顺手抽你一下，见 `WorldView.vue` 的 `stepNpcs()`。
   */
  lashChance: number;
  /** 收购商：靠近可以按 E / 点他，把仓库里的棉花 / 矿石 / 鱼换成金币 */
  trader?: boolean;
  /** 收购面板顶部他说的那句话（只有收购商有） */
  tradeLine?: string;
  /** 装扮：地图上和玩家走同一份绘制（`paintAvatar`），所以也给一份 `Cosmetic` */
  cosmetic: Cosmetic;
}

export const WORLD_NPCS: WorldNpc[] = [
  {
    id: 'farmer',
    name: '农场主',
    // 农场圈（500,1010）右下、横路（y 1175~1295）边上：既不挡「进农场 / 进矿洞」的圈，
    // 又在农场→海湾的必经之路上
    x: 600,
    y: 1120,
    range: 140,
    line: '想赚钱？下地干活去——光站着可没人给你钱',
    cooldown: 9,
    // 他主要是收购商：靠近骂一句是常态，抽鞭只是偶尔的「彩蛋」
    lashChance: 0.15,
    trader: true,
    tradeLine: '棉花、矿石、鱼——都放这儿吧，我按斤两给钱。',
    cosmetic: {
      ...DEFAULT_COSMETIC,
      emoji: '🤠',
      hat: 'cowboy',
      racket: 0x8a6238,
      trail: 0xd8a24a,
    },
  },
];
