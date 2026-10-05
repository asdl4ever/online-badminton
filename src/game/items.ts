/**
 * The single source of truth for collectible cosmetics.
 *
 * Every equippable option (hat, wings, cape, aura, pet, racket skin, trail,
 * hit effect) is an item with a rarity, a 1–5 star rating and a source.
 * Ownership is derived: `free` items are always owned, `gacha` items come from
 * chests, and anything else is a tier id the player must have claimed.
 * Equipping writes the item's `ref` into the cosmetic store.
 */
import type { TierId } from './ranks';
import type { Cosmetic } from './cosmetics';
// ⚠️ 从 `plusMeta` 引（纯数据），**不要**从 `effects/plus` 引 ——
// 那边顶部是运行时 `import Phaser from 'phaser'`，会让整个 Phaser 被拖进入口 chunk
import { PLUS_META } from './effects/plusMeta';

export type ItemSlot =
  | 'skin'
  | 'hat'
  | 'back'
  | 'aura'
  | 'ring'
  | 'pet'
  | 'racketSkin'
  | 'trail'
  | 'swingTrail'
  | 'mount'
  | 'effect';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Item {
  id: string;
  slot: ItemSlot;
  /** the value written into the Cosmetic when equipped */
  ref: string;
  label: string;
  rarity: Rarity;
  /** display rating, 1–5 */
  stars: number;
  /** `code` = 兑换码获得；`honor` = 荣誉点兑换；`event` = 活动（转盘等）限定；
   *  `combo` = 发球机连击里程碑专属（不在任何宝箱池里）；
   *  `coin` = **金币商店专属**（只在金币商店卖，不进宝箱池）；
   *  `chest` = **宝箱专属**（能开出来，但金币商店不卖——金币商店只上 `coin` 与
   *  3★ 及以下的 `gacha`，见 `COIN_SHOP`）；
   *  `shard` = **碎片兑换专属**：开箱抽不到、金币买不到，唯一途径是攒 🧩 星尘碎片
   *  去宝箱的兑换区换（见 `SHARD_SHOP`）；
   *  `run` = **操场跑量里程碑专属**：累计跑量每满 1km 解锁一件（见 `RUN_MILESTONES`） */
  source:
    | 'free'
    | 'gacha'
    | 'chest'
    | 'shard'
    | 'coin'
    | 'egg'
    | 'streak'
    | 'code'
    | 'honor'
    | 'event'
    | 'combo'
    | 'run'
    | TierId;
  /**
   * **抽奖权重覆盖**（可选，见 `stores/progress.ts` 的 `rollFrom`）。
   * 不填 = 按星级权重 `STAR_WEIGHT` 在同星级的池子物品里平分；
   * 填了就用它当绝对权重——山海宝箱的怪物皮肤靠它把概率压到极低。
   */
  pullWeight?: number;
}

export const SLOT_ORDER: ItemSlot[] = [
  'skin',
  'hat',
  'back',
  'aura',
  'ring',
  'pet',
  'racketSkin',
  'trail',
  'swingTrail',
  'mount',
  'effect',
];

export const SLOT_LABELS: Record<ItemSlot, string> = {
  skin: '角色形象',
  hat: '头饰',
  back: '背部装饰',
  aura: '光环',
  ring: '地环',
  pet: '宠物',
  racketSkin: '球拍皮肤',
  trail: '击球拖尾',
  swingTrail: '挥拍拖尾',
  mount: '坐骑',
  effect: '命中特效',
};

/**
 * 物品部位 → `Cosmetic`（装扮）里的字段名。
 * 两边不完全同名（`skin` → `characterSkin`、`trail` → `trailStyle`…），
 * 所以集中在这里一份，试穿 / 装备都查它。
 */
export const SLOT_COSMETIC_KEY: Record<ItemSlot, keyof Cosmetic> = {
  skin: 'characterSkin',
  hat: 'hat',
  back: 'back',
  aura: 'aura',
  ring: 'ring',
  pet: 'pet',
  racketSkin: 'racketSkin',
  trail: 'trailStyle',
  swingTrail: 'swingTrail',
  mount: 'mount',
  effect: 'effect',
};

/**
 * **试穿**：把一件物品套进一份装扮，返回新的 `Cosmetic`（不改存档、不动 store）。
 * 用在「点物品看一眼穿在身上什么样」这种预览里。
 */
export function wearItem(cos: Cosmetic, item: Item): Cosmetic {
  return { ...cos, [SLOT_COSMETIC_KEY[item.slot]]: item.ref } as Cosmetic;
}

export const RARITY_META: Record<
  Rarity,
  { label: string; color: string; weight: number; dust: number }
> = {
  common: { label: '普通', color: '#8b97a8', weight: 58, dust: 20 },
  rare: { label: '稀有', color: '#3d8bfd', weight: 28, dust: 45 },
  epic: { label: '史诗', color: '#9b59d0', weight: 11, dust: 90 },
  legendary: { label: '传说', color: '#e8a33d', weight: 3, dust: 180 },
};

/** small helper to keep the table below readable */
function it(
  slot: ItemSlot,
  ref: string,
  label: string,
  rarity: Rarity,
  stars: number,
  source: Item['source'],
): Item {
  return { id: `${slot}:${ref}`, slot, ref, label, rarity, stars, source };
}

/** 同 `it`，但带一个**抽奖权重覆盖**（「极稀有」物品用，见 `Item.pullWeight`） */
function itw(
  slot: ItemSlot,
  ref: string,
  label: string,
  rarity: Rarity,
  stars: number,
  source: Item['source'],
  pullWeight: number,
): Item {
  return { id: `${slot}:${ref}`, slot, ref, label, rarity, stars, source, pullWeight };
}

export const ITEMS: Item[] = [
  // --- character skin (special: earned by machine-mode combo milestones) ---
  it('skin', 'none', '默认', 'common', 1, 'free'),
  // 哥斯拉：现在是「哥斯拉来袭」**地狱难度**的概率掉落（以前是发球机 100 连击 / 首杀）
  it('skin', 'godzilla', '哥斯拉', 'legendary', 5, 'event'),
  it('skin', 'ubear', 'U熊', 'legendary', 5, 'code'),
  it('skin', 'laopi', '老皮', 'legendary', 5, 'code'),
  // 荣誉商店专属形象：只能靠晋级赛的冠亚季军攒荣誉点兑换
  it('skin', 'champion', '冠军铠甲', 'legendary', 5, 'honor'),
  it('skin', 'phoenix', '不灭凤凰', 'legendary', 5, 'honor'),
  it('skin', 'dragonlord', '龙王', 'legendary', 5, 'honor'),
  // 发球机活动专属：绿呢鸭舌帽 + 口哨的教练
  it('skin', 'coach', '发球机教练', 'legendary', 5, 'combo'),
  // --- 金币商店专属形象：1~3★ 的便宜货，造型简单但都会动（每款一个独立剪影） ---
  it('skin', 'slime', '果冻史莱姆', 'common', 1, 'coin'),
  it('skin', 'cactus', '仙人掌宝宝', 'common', 1, 'coin'),
  it('skin', 'mushroom', '蘑菇人', 'common', 1, 'coin'),
  it('skin', 'penguin', '胖企鹅', 'common', 2, 'coin'),
  it('skin', 'frog', '呱呱蛙', 'common', 2, 'coin'),
  it('skin', 'snowman', '小雪人', 'common', 2, 'coin'),
  it('skin', 'ghost', '小幽灵', 'common', 2, 'coin'),
  it('skin', 'robot', '小机器人', 'rare', 3, 'coin'),
  it('skin', 'octopus', '小章鱼', 'rare', 3, 'coin'),
  it('skin', 'panda', '团子熊猫', 'rare', 3, 'coin'),

  // --- 发球机连击里程碑专属套装「复古训练房」：每档一件，不进宝箱池 ---
  it('hat', 'coachcap', '教练帽', 'epic', 4, 'combo'),
  it('back', 'turbo', '涡轮双翼', 'epic', 4, 'combo'),
  it('back', 'towel', '冠军毛巾', 'rare', 3, 'combo'),
  it('aura', 'spotlight', '训练聚光灯', 'epic', 4, 'combo'),
  it('racketSkin', 'wood', '复古木拍', 'legendary', 5, 'combo'),
  it('trail', 'neon', '荧光训练球', 'rare', 3, 'combo'),
  it('swingTrail', 'tempo', '节拍器弧线', 'epic', 4, 'combo'),
  it('effect', 'pow', '砰！贴纸', 'epic', 4, 'combo'),
  it('ring', 'courtline', '场地标线', 'rare', 3, 'combo'),
  // 「哥斯拉来袭」活动限定：三档难度概率掉落，不可购买（见 game/godzilla.ts 的 GZ_DROPS）
  it('aura', 'dorsal', '背鳍光焰', 'legendary', 5, 'event'),
  it('back', 'scalecape', '鳞甲披风', 'legendary', 5, 'event'),
  it('swingTrail', 'atomic', '原子吐息', 'legendary', 5, 'event'),
  it('effect', 'gzfire', '原子烈焰', 'legendary', 5, 'event'),
  // 🧩 碎片兑换专属：开箱抽不到、金币买不到，只能攒星尘碎片来换
  it('hat', 'shardCrown', '碎晶冠', 'epic', 4, 'shard'),
  it('aura', 'shardglow', '碎晶光环', 'rare', 3, 'shard'),
  it('back', 'shardcape', '碎晶披风', 'epic', 4, 'shard'),
  it('ring', 'shardring', '碎晶地环', 'rare', 3, 'shard'),
  it('effect', 'shardpop', '碎晶绽放', 'epic', 4, 'shard'),
  it('swingTrail', 'shardedge', '碎晶刃', 'epic', 4, 'shard'),
  // 宇宙龙域限定：只在该主题宝箱里出（见 game/chest.ts 的 CHEST_THEMES）
  it('skin', 'cosmodra', '星渊龙', 'legendary', 5, 'chest'),
  it('mount', 'stardrake', '星渊龙驹', 'epic', 4, 'chest'),
  it('hat', 'drakecrown', '龙冕', 'epic', 4, 'chest'),
  it('aura', 'dranebula', '龙星云气', 'rare', 3, 'chest'),
  it('back', 'drakewing', '龙翼披风', 'epic', 4, 'chest'),
  it('ring', 'draring', '星渊地环', 'rare', 3, 'chest'),
  it('effect', 'drastar', '龙星爆', 'epic', 4, 'chest'),
  it('swingTrail', 'drabreath', '龙息', 'legendary', 5, 'chest'),
  // 主题宝箱专属（每个主题三件套：形象 + 坐骑 + 披风，只在该主题宝箱里出，
  // 归属用 game/chest.ts 的 extra 钦点，见 CHEST_THEMES）
  // - 深海遗珍
  it('skin', 'angler', '灯笼鱼', 'legendary', 5, 'chest'),
  it('mount', 'dolphin', '小海豚', 'epic', 4, 'chest'),
  it('back', 'seamist', '深海雾纱', 'epic', 4, 'chest'),
  // - 幽夜万圣
  it('skin', 'mummy', '小木乃伊', 'legendary', 5, 'chest'),
  it('mount', 'pumpkincart', '南瓜车', 'epic', 4, 'chest'),
  it('back', 'batcape', '蝙蝠斗篷', 'epic', 4, 'chest'),
  // - 锈色机械
  it('skin', 'windup', '发条木偶', 'legendary', 5, 'chest'),
  it('mount', 'gearbike', '齿轮机车', 'epic', 4, 'chest'),
  it('back', 'slagcape', '焊渣披风', 'rare', 3, 'chest'),
  // - 皇家典藏
  it('skin', 'guard', '皇家卫兵', 'legendary', 5, 'chest'),
  it('mount', 'lion', '小狮子', 'epic', 4, 'chest'),
  it('back', 'ermine', '白貂披风', 'epic', 4, 'chest'),
  // - 樱吹雪
  it('skin', 'sakurabun', '樱团兔', 'legendary', 5, 'chest'),
  it('mount', 'kite', '春风纸鸢', 'epic', 4, 'chest'),
  it('back', 'petalveil', '花瓣纱', 'rare', 3, 'chest'),
  // - 星海漫游
  it('skin', 'starlet', '小星灵', 'legendary', 5, 'chest'),
  it('mount', 'crescent', '弯月舟', 'epic', 4, 'chest'),
  it('back', 'starmap', '星图披风', 'epic', 4, 'chest'),
  // - 烈焰熔炉
  it('skin', 'emberling', '熔火精灵', 'legendary', 5, 'chest'),
  it('mount', 'firewheel', '烈焰火轮', 'epic', 4, 'chest'),
  it('back', 'cinder', '火山灰披风', 'rare', 3, 'chest'),
  // - 冰川秘境
  it('skin', 'icesprite', '冰晶精灵', 'legendary', 5, 'chest'),
  it('mount', 'polarbear', '雪原熊', 'epic', 4, 'chest'),
  it('back', 'icemist', '冰雾披风', 'rare', 3, 'chest'),
  // - 丛林图腾
  it('skin', 'monkey', '小猴子', 'legendary', 5, 'chest'),
  it('mount', 'dino', '小恐龙', 'epic', 4, 'chest'),
  it('back', 'canopy', '树冠披风', 'rare', 3, 'chest'),
  // - 霓虹街头
  it('skin', 'neoncat', '霓虹猫', 'legendary', 5, 'chest'),
  it('mount', 'laserbike', '霓虹摩托', 'epic', 4, 'chest'),
  it('back', 'tapecape', '磁带披风', 'rare', 3, 'chest'),
  // 小黄龙联名（转盘限定）
  it('skin', 'nailong', '小黄龙', 'legendary', 5, 'event'),
  // --- ring（地环：积分达到组别门槛后在荣誉面板领取） ---
  it('ring', 'none', '无', 'common', 1, 'free'),
  it('ring', 'sprout', '新芽地环', 'rare', 3, 'bronze'),
  it('ring', 'bamboo', '青竹地环', 'rare', 3, 'silver'),
  it('ring', 'dawn', '曙光地环', 'epic', 4, 'gold'),
  it('ring', 'gale', '疾风地环', 'epic', 4, 'platinum'),
  it('ring', 'rock', '磐石地环', 'epic', 4, 'diamond'),
  it('ring', 'blaze', '烈焰地环', 'epic', 4, 'master'),
  it('ring', 'sky', '苍穹地环', 'legendary', 5, 'king'),
  it('ring', 'legend', '传奇地环', 'legendary', 5, 'god'),
  // --- hat ---
  it('hat', 'none', '无', 'common', 1, 'free'),
  it('hat', 'cap', '鸭舌帽', 'rare', 3, 'silver'),
  it('hat', 'ninja', '忍者头带', 'rare', 3, 'gacha'),
  it('hat', 'flower', '花环', 'rare', 3, 'gacha'),
  it('hat', 'headphone', '耳机', 'rare', 3, 'gacha'),
  it('hat', 'crown', '王冠', 'epic', 4, 'gacha'),
  it('hat', 'horn', '恶魔角', 'epic', 4, 'gacha'),
  it('hat', 'wizard', '法师帽', 'epic', 4, 'gacha'),
  it('hat', 'santa', '圣诞帽', 'epic', 4, 'gacha'),
  it('hat', 'viking', '维京盔', 'epic', 4, 'gacha'),
  it('hat', 'chef', '厨师帽', 'rare', 3, 'gacha'),
  it('hat', 'mushroom', '蘑菇帽', 'rare', 3, 'gacha'),
  it('hat', 'beanie', '毛线帽', 'rare', 3, 'gacha'),
  it('hat', 'sombrero', '草帽', 'rare', 3, 'gacha'),
  it('hat', 'pirate', '海盗帽', 'epic', 4, 'gacha'),
  it('hat', 'astro', '宇航头盔', 'epic', 4, 'gacha'),
  it('hat', 'antler', '鹿角', 'epic', 4, 'gacha'),
  it('hat', 'jester', '小丑帽', 'epic', 4, 'gacha'),
  it('hat', 'halo', '天使光环', 'legendary', 5, 'god'),
  it('hat', 'topHat', '礼帽', 'legendary', 5, 'gacha'),
  it('hat', 'samurai', '武士盔', 'epic', 4, 'gacha'),
  it('hat', 'foxMask', '狐狸面具', 'epic', 4, 'gacha'),
  it('hat', 'frostCrown', '冰晶王冠', 'legendary', 5, 'gacha'),
  it('hat', 'flameCrown', '焰之冠', 'legendary', 5, 'gacha'),
  it('hat', 'witch', '女巫尖帽', 'rare', 3, 'gacha'),
  it('hat', 'beret', '贝雷帽', 'rare', 3, 'gacha'),
  it('hat', 'vr', 'VR头显', 'epic', 4, 'gacha'),
  it('hat', 'sunCrown', '太阳冠', 'epic', 4, 'gacha'),
  it('hat', 'plague', '瘟疫医生', 'epic', 4, 'gacha'),
  it('hat', 'graduation', '学士帽', 'rare', 3, 'gacha'),
  it('hat', 'propeller', '竹蜻蜓帽', 'rare', 3, 'gacha'),
  it('hat', 'jelly', '水母冠', 'epic', 4, 'gacha'),
  it('hat', 'oni', '鬼面', 'epic', 4, 'gacha'),
  it('hat', 'snorkel', '潜水镜', 'rare', 3, 'gacha'),
  it('hat', 'thornCrown', '荆棘冠', 'epic', 4, 'gacha'),
  it('hat', 'raincloud', '雨云帽', 'epic', 4, 'gacha'),
  it('hat', 'featherCrest', '羽冠', 'rare', 3, 'gacha'),
  it('hat', 'captain', '船长帽', 'rare', 3, 'gacha'),
  it('hat', 'catEars', '猫耳', 'rare', 3, 'gacha'),
  it('hat', 'dragonHelm', '龙角盔', 'legendary', 5, 'gacha'),
  // --- 后加的 50 款头饰：每款一个独立造型 ---
  it('hat', 'rabbitEars', '兔耳', 'rare', 3, 'gacha'),
  it('hat', 'bearEars', '熊耳', 'rare', 3, 'gacha'),
  it('hat', 'mouseEars', '鼠耳', 'rare', 3, 'gacha'),
  it('hat', 'sharkFin', '鲨鱼鳍', 'rare', 3, 'gacha'),
  it('hat', 'dinoHorns', '恐龙角', 'rare', 3, 'gacha'),
  it('hat', 'unicornHorn', '独角', 'epic', 4, 'gacha'),
  it('hat', 'afro', '爆炸头', 'rare', 3, 'gacha'),
  it('hat', 'mohawk', '莫西干', 'rare', 3, 'gacha'),
  it('hat', 'ponytail', '马尾', 'rare', 3, 'gacha'),
  it('hat', 'bun', '丸子头', 'rare', 3, 'gacha'),
  it('hat', 'pigtails', '双马尾', 'rare', 3, 'gacha'),
  it('hat', 'braids', '麻花辫', 'rare', 3, 'gacha'),
  it('hat', 'spikyHair', '刺猬头', 'rare', 3, 'gacha'),
  it('hat', 'longHair', '长发', 'rare', 3, 'gacha'),
  it('hat', 'curlyHair', '卷发', 'rare', 3, 'gacha'),
  it('hat', 'bobHair', '波波头', 'rare', 3, 'gacha'),
  it('hat', 'buzzCut', '平头', 'rare', 3, 'gacha'),
  it('hat', 'antenna', '外星天线', 'epic', 4, 'gacha'),
  it('hat', 'cowboy', '牛仔帽', 'epic', 4, 'gacha'),
  it('hat', 'bowler', '圆顶礼帽', 'rare', 3, 'gacha'),
  it('hat', 'newsboy', '报童帽', 'rare', 3, 'gacha'),
  it('hat', 'turban', '头巾', 'epic', 4, 'gacha'),
  it('hat', 'wreath', '花环', 'epic', 4, 'gacha'),
  it('hat', 'bamboo', '竹笠', 'epic', 4, 'gacha'),
  it('hat', 'conical', '斗笠', 'rare', 3, 'gacha'),
  it('hat', 'veil', '面纱', 'epic', 4, 'gacha'),
  it('hat', 'brideVeil', '婚纱头纱', 'legendary', 5, 'gacha'),
  it('hat', 'headband', '运动发带', 'rare', 3, 'gacha'),
  it('hat', 'hood', '兜帽', 'epic', 4, 'gacha'),
  it('hat', 'knightHelm', '骑士盔', 'epic', 4, 'gacha'),
  it('hat', 'armyHelm', '军盔', 'epic', 4, 'gacha'),
  it('hat', 'fireHelm', '消防盔', 'epic', 4, 'gacha'),
  it('hat', 'kabukiMask', '歌舞伎面具', 'legendary', 5, 'gacha'),
  it('hat', 'eyepatch', '眼罩', 'epic', 4, 'gacha'),
  it('hat', 'monocle', '单片眼镜', 'legendary', 5, 'gacha'),
  it('hat', 'sailorHat', '水手帽', 'epic', 4, 'gacha'),
  it('hat', 'gasMask', '防毒面具', 'epic', 4, 'gacha'),
  it('hat', 'skullMask', '骷髅面', 'legendary', 5, 'gacha'),
  it('hat', 'ghostHat', '幽灵帽', 'legendary', 5, 'gacha'),
  it('hat', 'pumpkin', '南瓜头', 'legendary', 5, 'gacha'),
  it('hat', 'iceCream', '冰淇淋帽', 'epic', 4, 'gacha'),
  it('hat', 'cupcake', '纸杯蛋糕帽', 'epic', 4, 'gacha'),
  it('hat', 'burger', '汉堡帽', 'epic', 4, 'gacha'),
  it('hat', 'watermelon', '西瓜帽', 'epic', 4, 'gacha'),
  it('hat', 'screw', '螺丝钉帽', 'rare', 3, 'gacha'),
  it('hat', 'gear', '齿轮帽', 'epic', 4, 'gacha'),
  it('hat', 'minerLamp', '矿工灯', 'epic', 4, 'gacha'),
  it('hat', 'candle', '蜡烛帽', 'legendary', 5, 'gacha'),
  it('hat', 'starCrown', '星星冠', 'legendary', 5, 'gacha'),
  it('hat', 'moonCrown', '月牙冠', 'legendary', 5, 'gacha'),
  // --- 第三批 50 款头饰：每款一套独立造型 + 自己的小动态（都不换色，见 drawHat）---
  // 来源分两档：
  // - `chest` **宝箱专属**（37 款）：开箱才出，金币商店**不卖**；
  // - `gacha` 13 款最朴素的 1★ 留成平价货，金币商店 ¥200 就能买（见 COIN_PRICE_BY_STARS）。
  it('hat', 'teapot', '茶壶帽', 'common', 2, 'chest'),
  it('hat', 'ramen', '拉面碗', 'common', 2, 'chest'),
  it('hat', 'teacup', '茶杯帽', 'common', 1, 'gacha'),
  it('hat', 'boba', '珍珠奶茶', 'common', 2, 'chest'),
  it('hat', 'popcorn', '爆米花桶', 'common', 1, 'gacha'),
  it('hat', 'pizza', '披萨帽', 'common', 2, 'chest'),
  it('hat', 'donut', '甜甜圈', 'common', 1, 'gacha'),
  it('hat', 'sushi', '寿司帽', 'common', 2, 'chest'),
  it('hat', 'taco', '卷饼帽', 'common', 2, 'chest'),
  it('hat', 'cake', '蛋糕帽', 'common', 2, 'chest'),
  it('hat', 'lollipop', '棒棒糖', 'common', 1, 'gacha'),
  it('hat', 'candyCane', '拐杖糖', 'common', 1, 'gacha'),
  it('hat', 'sunflower', '向日葵', 'common', 2, 'chest'),
  it('hat', 'lotus', '莲花帽', 'rare', 3, 'chest'),
  it('hat', 'leafCrown', '树叶冠', 'common', 1, 'gacha'),
  it('hat', 'clover', '四叶草', 'common', 1, 'gacha'),
  it('hat', 'sprout', '嫩芽帽', 'common', 1, 'gacha'),
  it('hat', 'cactusHat', '仙人掌帽', 'common', 2, 'chest'),
  it('hat', 'acorn', '橡果帽', 'common', 1, 'gacha'),
  it('hat', 'strawberry', '草莓帽', 'common', 2, 'chest'),
  it('hat', 'cherry', '樱桃枝', 'common', 2, 'chest'),
  it('hat', 'pineapple', '菠萝头', 'common', 2, 'chest'),
  it('hat', 'bee', '小蜜蜂', 'rare', 3, 'chest'),
  it('hat', 'butterfly', '蝴蝶', 'rare', 3, 'chest'),
  it('hat', 'chick', '小鸡帽', 'common', 2, 'chest'),
  it('hat', 'crab', '螃蟹帽', 'rare', 3, 'chest'),
  it('hat', 'frogHat', '青蛙帽', 'common', 2, 'chest'),
  it('hat', 'snailHat', '蜗牛帽', 'rare', 3, 'chest'),
  it('hat', 'fishBowl', '鱼缸帽', 'rare', 3, 'chest'),
  it('hat', 'birdCage', '鸟笼帽', 'rare', 3, 'chest'),
  it('hat', 'beehive', '蜂巢帽', 'rare', 3, 'chest'),
  it('hat', 'hedgehog', '小刺猬', 'rare', 3, 'chest'),
  it('hat', 'pinwheel', '小风车', 'common', 1, 'gacha'),
  it('hat', 'trafficCone', '交通锥', 'common', 1, 'gacha'),
  it('hat', 'lantern', '纸灯笼', 'common', 2, 'chest'),
  it('hat', 'umbrella', '雨伞帽', 'common', 2, 'chest'),
  it('hat', 'alarmClock', '闹钟帽', 'common', 2, 'chest'),
  it('hat', 'trafficLight', '红绿灯', 'rare', 3, 'chest'),
  it('hat', 'satellite', '卫星帽', 'rare', 3, 'chest'),
  it('hat', 'planet', '行星环', 'rare', 3, 'chest'),
  it('hat', 'bulb', '灯泡帽', 'common', 2, 'chest'),
  it('hat', 'battery', '电池帽', 'common', 2, 'chest'),
  it('hat', 'magnet', '磁铁帽', 'common', 2, 'chest'),
  it('hat', 'weldingMask', '焊接面罩', 'rare', 3, 'chest'),
  it('hat', 'tvHead', '电视头', 'rare', 3, 'chest'),
  it('hat', 'snowGlobe', '水晶球', 'rare', 3, 'chest'),
  it('hat', 'paperBoat', '纸船帽', 'common', 1, 'gacha'),
  it('hat', 'dice', '骰子帽', 'common', 2, 'chest'),
  it('hat', 'book', '书本帽', 'common', 2, 'chest'),
  it('hat', 'pencil', '铅笔帽', 'common', 1, 'gacha'),
  // 小黄龙联名（转盘限定）
  it('hat', 'nailongHood', '小黄龙头套', 'legendary', 5, 'event'),

  // --- wings ---
  it('back', 'none', '无', 'common', 1, 'free'),
  it('back', 'light', '光羽', 'rare', 3, 'gacha'),
  it('back', 'neon', '霓虹', 'rare', 3, 'gacha'),
  it('back', 'leaf', '叶翼', 'rare', 3, 'gacha'),
  it('back', 'bone', '骨翼', 'rare', 3, 'gacha'),
  it('back', 'tide', '潮汐', 'rare', 3, 'gacha'),
  it('back', 'ember', '余烬', 'rare', 3, 'gacha'),
  it('back', 'manta', '蝠鲼', 'rare', 3, 'gacha'),
  it('back', 'reef', '珊瑚', 'rare', 3, 'gacha'),
  it('back', 'silk', '丝绸', 'rare', 3, 'gacha'),
  it('back', 'spike', '尖刺', 'rare', 3, 'gacha'),
  it('back', 'frost', '冰晶', 'epic', 4, 'gacha'),
  it('back', 'crystal', '水晶', 'epic', 4, 'gacha'),
  it('back', 'flame', '烈焰', 'epic', 4, 'gacha'),
  it('back', 'mech', '机械', 'epic', 4, 'gacha'),
  it('back', 'butterfly', '蝶翼', 'epic', 4, 'gacha'),
  it('back', 'fairy', '精灵', 'epic', 4, 'gacha'),
  it('back', 'cyber', '赛博', 'epic', 4, 'gacha'),
  it('back', 'shadow', '影翼', 'epic', 4, 'gacha'),
  it('back', 'blade', '刃翼', 'epic', 4, 'gacha'),
  it('back', 'crest', '冠鳍', 'epic', 4, 'gacha'),
  it('back', 'wave', '潮浪', 'epic', 4, 'gacha'),
  it('back', 'aurora', '极光', 'epic', 4, 'gacha'),
  it('back', 'thorn', '荆棘', 'epic', 4, 'gacha'),
  it('back', 'shard', '刃簇', 'epic', 4, 'gacha'),
  it('back', 'thunder', '雷霆', 'legendary', 5, 'gacha'),
  it('back', 'dragon', '龙翼', 'legendary', 5, 'gacha'),
  it('back', 'angel', '天使', 'legendary', 5, 'gacha'),
  it('back', 'demon', '恶魔', 'legendary', 5, 'gacha'),
  it('back', 'star', '星辰', 'legendary', 5, 'gacha'),
  it('back', 'phoenix', '凤凰', 'legendary', 5, 'gacha'),
  it('back', 'rainbow', '虹翼', 'legendary', 5, 'gacha'),
  it('back', 'galaxy', '星河', 'legendary', 5, 'gacha'),
  it('back', 'paper', '纸翼', 'legendary', 5, 'gacha'),
  it('back', 'comet', '彗尾', 'legendary', 5, 'gacha'),
  it('back', 'glow', '流光', 'legendary', 5, 'gacha'),
  it('back', 'quartz', '晶簇', 'legendary', 5, 'gacha'),
  it('back', 'dragonfly', '蜻蜓', 'rare', 3, 'gacha'),
  it('back', 'moth', '蛾翼', 'rare', 3, 'gacha'),
  it('back', 'leafyWing', '藤叶', 'rare', 3, 'gacha'),
  it('back', 'emberWing', '余烬', 'rare', 3, 'gacha'),
  it('back', 'toxicWing', '剧毒', 'rare', 3, 'gacha'),
  it('back', 'seaWave', '海波', 'epic', 4, 'gacha'),
  it('back', 'ribbonDance', '飘带', 'epic', 4, 'gacha'),
  it('back', 'crystalShard', '碎晶', 'epic', 4, 'gacha'),
  it('back', 'mechWing', '机甲', 'epic', 4, 'gacha'),
  it('back', 'sail', '风帆', 'epic', 4, 'gacha'),
  it('back', 'featherStorm', '羽暴', 'epic', 4, 'gacha'),
  it('back', 'holyWing', '圣羽', 'legendary', 5, 'gacha'),
  it('back', 'devilWing', '魔翼', 'legendary', 5, 'gacha'),
  it('back', 'sailStar', '星帆', 'legendary', 5, 'gacha'),
  it('back', 'shine', '圣光', 'legendary', 5, 'god'),
  it('back', 'prism', '棱光', 'legendary', 5, 'gacha'),
  it('back', 'stormcall', '雷暴', 'epic', 4, 'gacha'),
  it('back', 'auroraBore', '极夜', 'epic', 4, 'gacha'),
  it('back', 'mothKing', '蛾皇', 'epic', 4, 'gacha'),
  it('back', 'abyss', '深渊', 'epic', 4, 'gacha'),
  it('back', 'sunfire', '日炎', 'epic', 4, 'gacha'),
  it('back', 'moonveil', '月帘', 'rare', 3, 'gacha'),
  it('back', 'gearsoul', '齿魂', 'epic', 4, 'gacha'),
  it('back', 'glacier', '冰河', 'epic', 4, 'gacha'),
  it('back', 'rosewing', '玫瑰', 'rare', 3, 'gacha'),
  it('back', 'cirrus', '云羽', 'rare', 3, 'gacha'),
  it('back', 'plasmaWing', '等离子', 'epic', 4, 'gacha'),
  it('back', 'ghostWing', '幽翼', 'epic', 4, 'gacha'),
  it('back', 'solaris', '烈阳', 'legendary', 5, 'gacha'),
  it('back', 'nightjar', '夜鹰', 'epic', 4, 'gacha'),
  it('back', 'coralFin', '珊瑚鳍', 'rare', 3, 'gacha'),
  it('back', 'bambooLeaf', '竹叶', 'rare', 3, 'gacha'),
  it('back', 'fireflyWing', '流萤', 'rare', 3, 'gacha'),
  it('back', 'obsidian', '黑曜', 'legendary', 5, 'gacha'),
  it('back', 'chrono', '时空', 'legendary', 5, 'gacha'),

  // --- cape（并入背部装饰，free 占位已在上面，重名 ref 已加 Cape 后缀）---
  it('back', 'hero', '英雄披风', 'rare', 3, 'gacha'),
  it('back', 'storm', '风暴披风', 'rare', 3, 'gacha'),
  it('back', 'leafCape', '藤叶披风', 'rare', 3, 'gacha'),
  it('back', 'frostCape', '冰晶披风', 'rare', 3, 'gacha'),
  it('back', 'dragonCape', '龙鳞披风', 'rare', 3, 'gacha'),
  it('back', 'shadowCape', '暗影披风', 'epic', 4, 'gacha'),
  it('back', 'emberCape', '烈焰披风', 'epic', 4, 'gacha'),
  it('back', 'royal', '王袍', 'epic', 4, 'king'),
  it('back', 'angelCape', '天使之翼披风', 'epic', 4, 'gacha'),
  it('back', 'void', '虚空披风', 'legendary', 5, 'gacha'),
  it('back', 'phoenixCape', '凤凰披风', 'legendary', 5, 'gacha'),
  it('back', 'knight', '骑士披风', 'rare', 3, 'gacha'),
  it('back', 'ninja', '忍者披风', 'rare', 3, 'gacha'),
  it('back', 'winter', '冬雪披风', 'rare', 3, 'gacha'),
  it('back', 'autumn', '秋叶披风', 'rare', 3, 'gacha'),
  it('back', 'ocean', '海涛披风', 'rare', 3, 'gacha'),
  it('back', 'mage', '法袍', 'epic', 4, 'gacha'),
  it('back', 'starCape', '星辰披风', 'epic', 4, 'gacha'),
  it('back', 'dragonfire', '龙炎披风', 'epic', 4, 'gacha'),
  it('back', 'voidCape', '虚空披风', 'legendary', 5, 'gacha'),
  it('back', 'goldRoyal', '鎏金王袍', 'legendary', 5, 'gacha'),
  it('back', 'auroraCape', '极光披风', 'rare', 3, 'gacha'),
  it('back', 'stormlord', '雷君披风', 'epic', 4, 'gacha'),
  it('back', 'sakuraCape', '樱吹雪', 'rare', 3, 'gacha'),
  it('back', 'ironclad', '铁甲披风', 'epic', 4, 'gacha'),
  it('back', 'pharaoh', '法老圣袍', 'legendary', 5, 'gacha'),
  it('back', 'emberwind', '烬风披风', 'rare', 3, 'gacha'),
  it('back', 'abyssCape', '深渊披风', 'epic', 4, 'gacha'),
  it('back', 'jadeRobe', '翡翠长袍', 'epic', 4, 'gacha'),
  it('back', 'plaguecoat', '瘟疫大衣', 'rare', 3, 'gacha'),
  it('back', 'captainCape', '船长披风', 'rare', 3, 'gacha'),
  it('back', 'stardust', '星尘披风', 'epic', 4, 'gacha'),
  it('back', 'warlord', '战神披风', 'epic', 4, 'gacha'),
  it('back', 'frostlord', '冰侯披风', 'rare', 3, 'gacha'),
  it('back', 'venomCape', '毒液披风', 'rare', 3, 'gacha'),
  it('back', 'cometCape', '彗星披风', 'legendary', 5, 'gacha'),
  it('back', 'thunderCape', '迅雷披风', 'epic', 4, 'gacha'),
  it('back', 'mooncloak', '月光纱', 'rare', 3, 'gacha'),
  it('back', 'crimsonlord', '绯红王袍', 'legendary', 5, 'gacha'),
  it('back', 'voidwalker', '虚行者', 'epic', 4, 'gacha'),
  it('back', 'goldenflame', '金焰披风', 'legendary', 5, 'gacha'),

  // --- aura ---
  it('aura', 'none', '无', 'common', 1, 'free'),
  it('aura', 'emerald', '翡翠', 'rare', 3, 'gacha'),
  it('aura', 'rose', '绯红', 'rare', 3, 'gacha'),
  it('aura', 'frost', '寒霜', 'rare', 3, 'gacha'),
  it('aura', 'toxic', '剧毒', 'rare', 3, 'gacha'),
  it('aura', 'flame', '烈焰', 'rare', 3, 'gacha'),
  it('aura', 'snow', '飘雪', 'rare', 3, 'gacha'),
  it('aura', 'bubble', '泡泡', 'rare', 3, 'gacha'),
  it('aura', 'gear', '齿轮', 'rare', 3, 'gacha'),
  it('aura', 'pixel', '像素', 'rare', 3, 'gacha'),
  it('aura', 'lava', '熔岩', 'rare', 3, 'gacha'),
  it('aura', 'neon', '霓虹', 'rare', 3, 'gacha'),
  it('aura', 'plume', '落羽', 'rare', 3, 'gacha'),
  it('aura', 'coin', '聚财', 'rare', 3, 'gacha'),
  it('aura', 'note', '音符', 'rare', 3, 'gacha'),
  it('aura', 'sand', '沙尘', 'rare', 3, 'gacha'),
  it('aura', 'wind', '风旋', 'rare', 3, 'gacha'),
  it('aura', 'hex', '六芒', 'rare', 3, 'gacha'),
  it('aura', 'violet', '紫罗兰', 'epic', 4, 'gacha'),
  it('aura', 'gold', '黄金', 'epic', 4, 'gacha'),
  it('aura', 'crimson', '血月', 'epic', 4, 'gacha'),
  it('aura', 'electric', '电光', 'epic', 4, 'gacha'),
  it('aura', 'orbit', '星轨', 'epic', 4, 'gacha'),
  it('aura', 'venom', '剧毒', 'epic', 4, 'gacha'),
  it('aura', 'sakura', '樱落', 'epic', 4, 'gacha'),
  it('aura', 'aurora', '极光', 'epic', 4, 'gacha'),
  it('aura', 'ghost', '幽魂', 'epic', 4, 'gacha'),
  it('aura', 'prism', '棱镜', 'epic', 4, 'gacha'),
  it('aura', 'thorn', '荆棘', 'epic', 4, 'gacha'),
  it('aura', 'chain', '锁链', 'epic', 4, 'gacha'),
  it('aura', 'heart', '爱心', 'epic', 4, 'gacha'),
  it('aura', 'sparkle', '星尘', 'epic', 4, 'gacha'),
  it('aura', 'moon', '月华', 'epic', 4, 'gacha'),
  it('aura', 'clock', '时针', 'epic', 4, 'gacha'),
  it('aura', 'ring', '光环', 'epic', 4, 'gacha'),
  it('aura', 'rune', '符文', 'epic', 4, 'gacha'),
  it('aura', 'tide', '潮汐', 'epic', 4, 'gacha'),
  it('aura', 'rainbow', '虹光', 'legendary', 5, 'gacha'),
  it('aura', 'holy', '圣光', 'legendary', 5, 'gacha'),
  it('aura', 'void', '虚空', 'legendary', 5, 'gacha'),
  it('aura', 'storm', '风暴', 'legendary', 5, 'gacha'),
  it('aura', 'skull', '骷髅', 'legendary', 5, 'gacha'),
  it('aura', 'sun', '烈日', 'legendary', 5, 'gacha'),
  it('aura', 'radar', '雷达', 'legendary', 5, 'gacha'),
  it('aura', 'matrix', '矩阵', 'legendary', 5, 'gacha'),
  it('aura', 'king', '王者', 'epic', 5, 'king'),
  it('aura', 'firefly', '萤火', 'rare', 3, 'gacha'),
  it('aura', 'mist', '雾霭', 'rare', 3, 'gacha'),
  it('aura', 'golddust', '金尘', 'rare', 3, 'gacha'),
  it('aura', 'dawn', '黎明', 'rare', 3, 'gacha'),
  it('aura', 'dusk', '黄昏', 'rare', 3, 'gacha'),
  it('aura', 'spring', '春息', 'rare', 3, 'gacha'),
  it('aura', 'autumn', '秋意', 'rare', 3, 'gacha'),
  it('aura', 'leafwind', '叶风', 'rare', 3, 'gacha'),
  it('aura', 'vortex', '漩涡', 'epic', 4, 'gacha'),
  it('aura', 'nebula', '星云', 'epic', 4, 'gacha'),
  it('aura', 'eclipse', '日蚀', 'epic', 4, 'gacha'),
  it('aura', 'thundercloud', '雷云', 'epic', 4, 'gacha'),
  it('aura', 'frostbite', '极寒', 'epic', 4, 'gacha'),
  it('aura', 'ember', '余烬', 'epic', 4, 'gacha'),
  it('aura', 'sparkstorm', '电暴', 'epic', 4, 'gacha'),
  it('aura', 'petalrain', '花雨', 'epic', 4, 'gacha'),
  it('aura', 'runering', '符文环', 'epic', 4, 'gacha'),
  it('aura', 'haloRing', '圣环', 'epic', 4, 'gacha'),
  it('aura', 'hexflame', '鬼火', 'epic', 4, 'gacha'),
  it('aura', 'bubblefield', '泡泡田', 'epic', 4, 'gacha'),
  it('aura', 'prismatic', '棱彩', 'epic', 4, 'gacha'),
  it('aura', 'snowstorm', '风雪', 'legendary', 5, 'gacha'),
  it('aura', 'starfield', '星野', 'legendary', 5, 'gacha'),
  it('aura', 'voidRift', '虚空裂隙', 'legendary', 5, 'gacha'),
  it('aura', 'blackhole', '黑洞', 'legendary', 5, 'gacha'),
  it('aura', 'supernova', '超新星', 'legendary', 5, 'gacha'),
  it('aura', 'quantum', '量子', 'epic', 4, 'gacha'),
  it('aura', 'laserscan', '激光', 'epic', 4, 'gacha'),
  it('aura', 'holo', '全息', 'epic', 4, 'gacha'),
  it('aura', 'crystalline', '晶簇', 'epic', 4, 'gacha'),
  it('aura', 'wisteria', '紫藤', 'rare', 3, 'gacha'),
  it('aura', 'coral', '珊瑚', 'rare', 3, 'gacha'),
  it('aura', 'beacon', '信标', 'rare', 3, 'gacha'),
  it('aura', 'spiral', '螺旋星系', 'epic', 4, 'gacha'),
  it('aura', 'phantom', '幻影', 'rare', 3, 'gacha'),
  it('aura', 'miasma', '瘴气', 'rare', 3, 'gacha'),
  it('aura', 'laurel', '桂冠', 'epic', 4, 'gacha'),
  it('aura', 'emberfall', '落烬', 'rare', 3, 'gacha'),
  it('aura', 'static', '静电', 'epic', 4, 'gacha'),
  it('aura', 'tidalwave', '怒涛', 'epic', 4, 'gacha'),
  it('aura', 'sandstorm', '沙暴', 'epic', 4, 'gacha'),
  it('aura', 'auroraring', '极光环', 'legendary', 5, 'gacha'),
  it('aura', 'singularity', '奇点', 'legendary', 5, 'gacha'),
  it('aura', 'rebirth', '涅槃', 'legendary', 5, 'gacha'),

  // --- pet (hatched from eggs, star level is per-player) ---
  it('pet', 'none', '无', 'common', 1, 'free'),
  it('pet', 'orb', '光球', 'rare', 1, 'egg'),
  it('pet', 'bird', '雏鸟', 'rare', 1, 'egg'),
  it('pet', 'cat', '小猫', 'rare', 1, 'egg'),
  it('pet', 'fox', '狐狸', 'rare', 1, 'egg'),
  it('pet', 'fairy', '小精灵', 'epic', 1, 'egg'),
  it('pet', 'robot', '小机器人', 'epic', 1, 'egg'),
  it('pet', 'star', '星星', 'epic', 1, 'egg'),
  it('pet', 'flame', '火灵', 'epic', 1, 'egg'),
  it('pet', 'dragon', '幼龙', 'legendary', 1, 'egg'),
  it('pet', 'skull', '骷髅', 'legendary', 1, 'egg'),
  it('pet', 'ghost', '幽灵', 'legendary', 1, 'egg'),
  // 小黄龙联名（转盘限定）
  it('pet', 'nailong', '小黄龙宝宝', 'legendary', 3, 'event'),

  // --- racket skin ---
  it('racketSkin', 'default', '默认', 'common', 1, 'free'),
  it('racketSkin', 'ice', '寒霜', 'rare', 3, 'gacha'),
  it('racketSkin', 'thunder', '雷电', 'rare', 3, 'gacha'),
  it('racketSkin', 'neon', '霓虹', 'rare', 3, 'gacha'),
  it('racketSkin', 'circuit', '电路', 'rare', 3, 'gacha'),
  it('racketSkin', 'bamboo', '竹节', 'rare', 3, 'gacha'),
  it('racketSkin', 'carbon', '碳纤', 'rare', 3, 'gacha'),
  it('racketSkin', 'frost', '霜纹', 'rare', 3, 'gacha'),
  it('racketSkin', 'rune', '符文', 'rare', 3, 'gacha'),
  it('racketSkin', 'web', '蛛网', 'rare', 3, 'gacha'),
  it('racketSkin', 'vine', '藤蔓', 'rare', 3, 'gacha'),
  it('racketSkin', 'bone', '骨纹', 'rare', 3, 'gacha'),
  it('racketSkin', 'zebra', '斑马', 'rare', 3, 'gacha'),
  it('racketSkin', 'camo', '迷彩', 'rare', 3, 'gacha'),
  it('racketSkin', 'star', '星纹', 'rare', 3, 'gacha'),
  it('racketSkin', 'gold', '鎏金', 'epic', 4, 'gold'),
  it('racketSkin', 'flame', '烈焰', 'epic', 4, 'master'),
  it('racketSkin', 'crystal', '水晶', 'epic', 4, 'gacha'),
  it('racketSkin', 'holy', '圣环', 'epic', 4, 'gacha'),
  it('racketSkin', 'shadow', '暗影', 'epic', 4, 'gacha'),
  it('racketSkin', 'spike', '尖刺', 'epic', 4, 'gacha'),
  it('racketSkin', 'plasma', '等离子', 'epic', 4, 'gacha'),
  it('racketSkin', 'galaxy', '星河', 'epic', 4, 'gacha'),
  it('racketSkin', 'lava', '熔岩', 'epic', 4, 'gacha'),
  it('racketSkin', 'thorn', '荆棘', 'epic', 4, 'gacha'),
  it('racketSkin', 'mirror', '镜面', 'epic', 4, 'gacha'),
  it('racketSkin', 'matrix', '矩阵', 'epic', 4, 'gacha'),
  it('racketSkin', 'void', '虚空', 'legendary', 5, 'gacha'),
  it('racketSkin', 'rainbow', '幻彩', 'legendary', 5, 'gacha'),
  it('racketSkin', 'glitch', '故障', 'legendary', 5, 'gacha'),
  it('racketSkin', 'scale', '龙鳞', 'legendary', 5, 'gacha'),
  it('racketSkin', 'smoke', '烟雾', 'legendary', 5, 'gacha'),
  it('racketSkin', 'onyx', '玄石', 'rare', 3, 'gacha'),
  it('racketSkin', 'ivory', '象牙', 'rare', 3, 'gacha'),
  it('racketSkin', 'amber', '琥珀', 'rare', 3, 'gacha'),
  it('racketSkin', 'jade', '碧玉', 'rare', 3, 'gacha'),
  it('racketSkin', 'toxic', '剧毒', 'rare', 3, 'gacha'),
  it('racketSkin', 'aurora', '极光', 'epic', 4, 'gacha'),
  it('racketSkin', 'nebula', '星云', 'epic', 4, 'gacha'),
  it('racketSkin', 'ruby', '红宝石', 'epic', 4, 'gacha'),
  it('racketSkin', 'sapphire', '蓝宝石', 'epic', 4, 'gacha'),
  it('racketSkin', 'ember', '余烬', 'legendary', 5, 'gacha'),
  it('racketSkin', 'quantum', '量子', 'epic', 4, 'gacha'),
  it('racketSkin', 'obsidian', '黑曜石', 'epic', 4, 'gacha'),
  it('racketSkin', 'sunsteel', '太阳钢', 'epic', 4, 'gacha'),
  it('racketSkin', 'moonlace', '月纹', 'rare', 3, 'gacha'),
  it('racketSkin', 'rosebranch', '玫瑰枝', 'rare', 3, 'gacha'),
  it('racketSkin', 'starpiercer', '穿星', 'legendary', 5, 'gacha'),
  it('racketSkin', 'tsunami', '海啸', 'epic', 4, 'gacha'),
  it('racketSkin', 'magma', '熔核', 'epic', 4, 'gacha'),
  it('racketSkin', 'stormline', '风暴线', 'rare', 3, 'gacha'),
  it('racketSkin', 'phoenixF', '凤羽', 'legendary', 5, 'gacha'),
  it('racketSkin', 'dragonbone', '龙骨', 'epic', 4, 'gacha'),
  it('racketSkin', 'iceberg', '冰山', 'rare', 3, 'gacha'),
  it('racketSkin', 'goldthread', '金线', 'epic', 4, 'gacha'),
  it('racketSkin', 'coralrim', '珊瑚缘', 'rare', 3, 'gacha'),
  it('racketSkin', 'chrono', '时环', 'legendary', 5, 'gacha'),
  it('racketSkin', 'holo', '全息', 'epic', 4, 'gacha'),
  it('racketSkin', 'gravity', '引力', 'epic', 4, 'gacha'),
  it('racketSkin', 'sonic', '音爆', 'rare', 3, 'gacha'),
  it('racketSkin', 'willow', '柳影', 'rare', 3, 'gacha'),
  it('racketSkin', 'blossom', '花见', 'epic', 4, 'gacha'),

  // --- trail ---
  it('trail', 'none', '无', 'common', 1, 'free'),
  it('trail', 'classic', '经典', 'common', 1, 'free'),
  it('trail', 'ice', '冰痕', 'rare', 3, 'gacha'),
  it('trail', 'leaf', '叶痕', 'rare', 3, 'gacha'),
  it('trail', 'gold', '金沙', 'rare', 3, 'gacha'),
  it('trail', 'fire', '火焰', 'epic', 4, 'gacha'),
  it('trail', 'electric', '电弧', 'epic', 4, 'gacha'),
  it('trail', 'pixel', '像素', 'epic', 4, 'gacha'),
  it('trail', 'rainbow', '彩虹', 'legendary', 5, 'gacha'),
  it('trail', 'void', '虚空', 'legendary', 5, 'gacha'),

  // --- swing trail（挥拍拖尾：球拍挥动时那条弧线的风格） ---
  it('swingTrail', 'none', '无', 'common', 1, 'free'),
  it('swingTrail', 'slash', '斩击', 'rare', 3, 'gacha'),
  it('swingTrail', 'cyclone', '旋风', 'rare', 3, 'gacha'),
  it('swingTrail', 'afterimage', '残影', 'rare', 3, 'gacha'),
  it('swingTrail', 'frostbite', '冰痕', 'rare', 3, 'gacha'),
  it('swingTrail', 'wave', '波浪', 'rare', 3, 'gacha'),
  it('swingTrail', 'thorn', '荆棘', 'rare', 3, 'gacha'),
  it('swingTrail', 'shock', '冲击波', 'epic', 4, 'gacha'),
  it('swingTrail', 'bolt', '雷电', 'epic', 4, 'gacha'),
  it('swingTrail', 'blaze', '烈焰', 'epic', 4, 'gacha'),
  it('swingTrail', 'orbit', '星轨', 'legendary', 5, 'gacha'),
  it('swingTrail', 'prism', '棱光', 'legendary', 5, 'gacha'),
  it('swingTrail', 'voidcut', '虚空斩', 'legendary', 5, 'gacha'),

  // --- mount（坐骑：纯装饰，站在/跳到哪它就跟到哪，不影响任何判定） ---
  it('mount', 'none', '无', 'common', 1, 'free'),
  it('mount', 'board', '滑板', 'rare', 3, 'honor'),
  it('mount', 'bubble', '泡泡', 'rare', 3, 'honor'),
  it('mount', 'cloud', '筋斗云', 'rare', 3, 'honor'),
  it('mount', 'sword', '御剑', 'epic', 4, 'honor'),
  it('mount', 'horse', '战马', 'epic', 4, 'honor'),
  it('mount', 'carpet', '魔毯', 'epic', 4, 'honor'),
  it('mount', 'star', '流星', 'legendary', 5, 'honor'),
  it('mount', 'dragon', '幼龙', 'legendary', 5, 'honor'),
  it('mount', 'rocket', '火箭', 'legendary', 5, 'honor'),
  it('mount', 'throne', '浮空王座', 'legendary', 5, 'honor'),
  // --- 金币商店专属坐骑：1~3★ 的普通款，造型简单但各有一个小动态（见 draw/mounts.ts）---
  it('mount', 'scooter', '滑板车', 'common', 1, 'coin'),
  it('mount', 'log', '圆木', 'common', 1, 'coin'),
  it('mount', 'box', '纸箱', 'common', 1, 'coin'),
  it('mount', 'spring', '弹簧', 'common', 1, 'coin'),
  it('mount', 'cart', '独轮小推车', 'common', 2, 'coin'),
  it('mount', 'broom', '飞天扫帚', 'common', 2, 'coin'),
  it('mount', 'turtle', '小乌龟', 'common', 2, 'coin'),
  it('mount', 'bike', '小自行车', 'rare', 3, 'coin'),
  it('mount', 'hover', '悬浮板', 'rare', 3, 'coin'),
  it('mount', 'shark', '鲨鱼冲浪', 'rare', 3, 'coin'),
  // 小黄龙联名（转盘限定）
  it('mount', 'nailongRoll', '小黄龙滚滚', 'legendary', 5, 'event'),

  // --- hit effect ---
  it('effect', 'ring', '冲击环', 'common', 1, 'free'),
  it('effect', 'spark', '火花', 'common', 2, 'free'),
  it('effect', 'smoke', '烟雾', 'common', 2, 'free'),
  it('effect', 'slash', '斩击', 'rare', 3, 'gacha'),
  it('effect', 'frost', '冰霜', 'rare', 3, 'gacha'),
  it('effect', 'shards', '碎晶', 'rare', 3, 'gacha'),
  it('effect', 'ripple', '涟漪', 'rare', 3, 'gacha'),
  it('effect', 'confetti', '彩屑', 'rare', 3, 'gacha'),
  it('effect', 'hex', '六角', 'rare', 3, 'gacha'),
  it('effect', 'web', '蛛网', 'rare', 3, 'gacha'),
  it('effect', 'bubble', '泡泡', 'rare', 3, 'gacha'),
  it('effect', 'icicle', '冰锥', 'rare', 3, 'gacha'),
  it('effect', 'note', '音符', 'rare', 3, 'gacha'),
  it('effect', 'coin', '金币', 'rare', 3, 'gacha'),
  it('effect', 'dice', '骰子', 'rare', 3, 'gacha'),
  it('effect', 'arrow', '箭矢', 'rare', 3, 'gacha'),
  it('effect', 'aim', '准星', 'rare', 3, 'gacha'),
  it('effect', 'sonar', '声呐', 'rare', 3, 'gacha'),
  it('effect', 'wind', '旋风', 'rare', 3, 'gacha'),
  it('effect', 'sand', '沙暴', 'rare', 3, 'gacha'),
  it('effect', 'sparkle', '闪星', 'rare', 3, 'gacha'),
  it('effect', 'burst', '爆裂', 'epic', 4, 'gacha'),
  it('effect', 'shock', '冲击波', 'epic', 4, 'gacha'),
  it('effect', 'cross', '十字斩', 'epic', 4, 'gacha'),
  it('effect', 'spiral', '螺旋', 'epic', 4, 'gacha'),
  it('effect', 'feather', '落羽', 'epic', 4, 'gacha'),
  it('effect', 'comet', '彗星', 'epic', 4, 'gacha'),
  it('effect', 'sonic', '音波', 'epic', 4, 'gacha'),
  it('effect', 'gear', '齿轮', 'epic', 4, 'gacha'),
  it('effect', 'bomb', '炸弹', 'epic', 4, 'gacha'),
  it('effect', 'sword', '剑影', 'epic', 4, 'gacha'),
  it('effect', 'claw', '爪痕', 'epic', 4, 'gacha'),
  it('effect', 'meteor', '陨石', 'epic', 4, 'gacha'),
  it('effect', 'poison', '毒雾', 'epic', 4, 'gacha'),
  it('effect', 'chain', '锁链', 'epic', 4, 'gacha'),
  it('effect', 'thorn', '荆棘', 'epic', 4, 'gacha'),
  it('effect', 'blossom', '花开', 'epic', 4, 'gacha'),
  it('effect', 'cube', '立方', 'epic', 4, 'gacha'),
  it('effect', 'pyramid', '金字塔', 'epic', 4, 'gacha'),
  it('effect', 'eye', '眼瞳', 'epic', 4, 'gacha'),
  it('effect', 'dna', '双螺旋', 'epic', 4, 'gacha'),
  it('effect', 'acid', '酸液', 'epic', 4, 'gacha'),
  it('effect', 'heart', '爱心', 'epic', 4, 'gacha'),
  it('effect', 'petal', '花瓣', 'legendary', 5, 'gacha'),
  it('effect', 'lightning', '闪电', 'legendary', 5, 'gacha'),
  it('effect', 'star', '星辰', 'legendary', 5, 'gacha'),
  it('effect', 'prism', '棱光', 'legendary', 5, 'gacha'),
  it('effect', 'vortex', '漩涡', 'legendary', 5, 'gacha'),
  it('effect', 'shatter', '崩裂', 'legendary', 5, 'gacha'),
  it('effect', 'nova', '新星', 'legendary', 5, 'gacha'),
  it('effect', 'rune', '符文', 'legendary', 5, 'gacha'),
  it('effect', 'flamenova', '炎爆', 'legendary', 5, 'gacha'),
  it('effect', 'beam', '光束', 'legendary', 5, 'gacha'),
  it('effect', 'shield', '护盾', 'legendary', 5, 'gacha'),
  it('effect', 'sun', '烈日', 'legendary', 5, 'gacha'),
  it('effect', 'moon', '月影', 'legendary', 5, 'gacha'),
  it('effect', 'portal', '传送门', 'legendary', 5, 'gacha'),
  it('effect', 'atom', '原子', 'legendary', 5, 'gacha'),
  it('effect', 'ink', '墨爆', 'legendary', 5, 'gacha'),
  it('effect', 'shuriken', '手里剑', 'rare', 3, 'gacha'),
  it('effect', 'magnet', '磁场', 'rare', 3, 'gacha'),
  it('effect', 'foam', '泡沫', 'rare', 3, 'gacha'),
  it('effect', 'leafstorm', '落叶', 'rare', 3, 'gacha'),
  it('effect', 'sakura', '樱花', 'rare', 3, 'gacha'),
  it('effect', 'starfall', '星坠', 'rare', 3, 'gacha'),
  it('effect', 'firework', '烟花', 'epic', 4, 'gacha'),
  it('effect', 'ringburst', '环爆', 'epic', 4, 'gacha'),
  it('effect', 'swordcross', '双剑', 'epic', 4, 'gacha'),
  it('effect', 'boulder', '岩球', 'epic', 4, 'gacha'),
  it('effect', 'quake', '地震', 'epic', 4, 'gacha'),
  it('effect', 'tornado', '龙卷', 'epic', 4, 'gacha'),
  it('effect', 'blizzard', '暴雪', 'epic', 4, 'gacha'),
  it('effect', 'volcano', '火山', 'epic', 4, 'gacha'),
  it('effect', 'tsunami', '海啸', 'epic', 4, 'gacha'),
  it('effect', 'aurora', '极光', 'epic', 4, 'gacha'),
  it('effect', 'starlight', '星光', 'epic', 4, 'gacha'),
  it('effect', 'rainbow', '彩虹', 'epic', 4, 'gacha'),
  it('effect', 'laser', '激光', 'epic', 4, 'gacha'),
  it('effect', 'plasma', '等离子', 'epic', 4, 'gacha'),
  it('effect', 'mushroom', '蘑菇云', 'epic', 4, 'gacha'),
  it('effect', 'pixelate', '像素化', 'epic', 4, 'gacha'),
  it('effect', 'glitch', '故障', 'epic', 4, 'gacha'),
  it('effect', 'binary', '二进制', 'epic', 4, 'gacha'),
  it('effect', 'ringdance', '舞环', 'epic', 4, 'gacha'),
  it('effect', 'butterfly', '蝶舞', 'epic', 4, 'gacha'),
  it('effect', 'thorncrown', '荆棘冠', 'epic', 4, 'gacha'),
  it('effect', 'tide', '潮环', 'epic', 4, 'gacha'),
  it('effect', 'prismfan', '棱扇', 'epic', 4, 'gacha'),
  it('effect', 'galaxy', '星系', 'legendary', 5, 'gacha'),
  it('effect', 'blackhole', '黑洞', 'legendary', 5, 'gacha'),
  it('effect', 'meteorrain', '流星雨', 'legendary', 5, 'gacha'),
  it('effect', 'phantom', '幻影', 'legendary', 5, 'gacha'),
  // --- generated plus effects: 100 parametric styles (see effects/plus.ts) ---
  ...PLUS_META.map(({ id, label }, i): Item => {
    const roll = (i * 7 + 13) % 100;
    const rarity: Rarity = roll < 58 ? 'common' : roll < 86 ? 'rare' : roll < 96 ? 'epic' : 'legendary';
    const stars = rarity === 'legendary' ? 5 : rarity === 'epic' ? 4 : rarity === 'rare' ? 3 : 2;
    return it('effect', id, label, rarity, stars, 'gacha');
  }),
  it('effect', 'holy', '圣十字', 'legendary', 5, 'gacha'),

  // 「外星人降临」活动限定：单局击杀里程碑专属，十档十件、覆盖十个部位
  // （对照表在 `game/alien.ts` 的 ALIEN_MILESTONES，不进任何宝箱池）
  it('skin', 'alien', '外星人', 'legendary', 5, 'event'),
  it('hat', 'ufoHelm', '飞碟头盔', 'epic', 4, 'event'),
  it('aura', 'beacon', '幽绿信标', 'epic', 4, 'event'),
  it('effect', 'meteor', '陨石爆', 'epic', 4, 'event'),
  it('mount', 'ufo', '飞碟', 'legendary', 5, 'event'),
  it('trail', 'stardust', '星尘拖尾', 'epic', 4, 'event'),
  it('swingTrail', 'beam', '激光切片', 'epic', 4, 'event'),
  it('racketSkin', 'meteorite', '陨石球拍', 'epic', 4, 'event'),
  it('back', 'antigrav', '反重力披风', 'epic', 4, 'event'),
  it('ring', 'orbit', '轨道地环', 'rare', 3, 'event'),

  // ==========================================================================
  // 第二批 10 个主题宝箱（见 game/chest.ts 的 CHEST_THEMES）
  // 每个主题 16 件**定制物品**（`chest` 专属：开箱才出、金币商店不卖），
  // ref 统一带主题码，宝箱靠 `refPrefix` 整批认领；绘制走 game/draw/themeart.ts。
  // 部位与星级固定：形象 5★ / 挥拍拖尾 5★ / 坐骑 4★ / 4★ 的帽子·翅膀·球拍·拖尾 /
  // 3★ 的帽子·翅膀·披风·光环·球拍·拖尾 / 2★ 的披风·光环 / 1★ 地环。
  // ==========================================================================
  // --- 🏜️ 沙漠商队 ---
  it('skin', 'desSpirit', '沙灯神', 'legendary', 5, 'chest'),
  it('mount', 'desCamel', '沙漠骆驼', 'epic', 4, 'chest'),
  it('hat', 'desTurban', '商队头巾', 'rare', 3, 'chest'),
  it('hat', 'desScarab', '圣甲虫帽', 'epic', 4, 'chest'),
  it('back', 'desSandWing', '流沙之翼', 'rare', 3, 'chest'),
  it('back', 'desDuneWing', '沙丘之翼', 'epic', 4, 'chest'),
  it('back', 'desCloak', '旅人斗篷', 'common', 2, 'chest'),
  it('back', 'desOasis', '绿洲纱帐', 'rare', 3, 'chest'),
  it('aura', 'desSandAura', '风沙环绕', 'common', 2, 'chest'),
  it('aura', 'desSunAura', '烈日光环', 'rare', 3, 'chest'),
  it('ring', 'desRing', '商队地环', 'common', 1, 'chest'),
  it('racketSkin', 'desRacketA', '铜铃球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'desRacketB', '金字塔球拍', 'epic', 4, 'chest'),
  it('trail', 'desTrailA', '黄沙拖尾', 'rare', 3, 'chest'),
  it('trail', 'desTrailB', '烈日拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'desSwing', '弯刀斩', 'legendary', 5, 'chest'),
  // --- ☁️ 云端空岛 ---
  it('skin', 'nimbSpirit', '云风伯', 'legendary', 5, 'chest'),
  it('mount', 'nimbCloud', '云朵飞毯', 'epic', 4, 'chest'),
  it('hat', 'nimbHalo', '云光环', 'rare', 3, 'chest'),
  it('hat', 'nimbCrown', '云冠', 'epic', 4, 'chest'),
  it('back', 'nimbWindWing', '风之翼', 'rare', 3, 'chest'),
  it('back', 'nimbFeatherWing', '羽云翼', 'epic', 4, 'chest'),
  it('back', 'nimbVeil', '云纱披风', 'common', 2, 'chest'),
  it('back', 'nimbSail', '云帆披风', 'rare', 3, 'chest'),
  it('aura', 'nimbWindAura', '流风环绕', 'common', 2, 'chest'),
  it('aura', 'nimbStarAura', '星云光环', 'rare', 3, 'chest'),
  it('ring', 'nimbRing', '云端地环', 'common', 1, 'chest'),
  it('racketSkin', 'nimbRacketA', '云纹球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'nimbRacketB', '星云球拍', 'epic', 4, 'chest'),
  it('trail', 'nimbTrailA', '流云拖尾', 'rare', 3, 'chest'),
  it('trail', 'nimbTrailB', '星羽拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'nimbSwing', '云涡斩', 'legendary', 5, 'chest'),
  // --- 🧁 甜点工坊 ---
  it('skin', 'confSpirit', '糖霜魔女', 'legendary', 5, 'chest'),
  it('mount', 'confCake', '蛋糕坐骑', 'epic', 4, 'chest'),
  it('hat', 'confCake', '蛋糕帽', 'rare', 3, 'chest'),
  it('hat', 'confCrown', '糖霜冠', 'epic', 4, 'chest'),
  it('back', 'confSugarWing', '糖霜翼', 'rare', 3, 'chest'),
  it('back', 'confCandyWing', '糖果翼', 'epic', 4, 'chest'),
  it('back', 'confApron', '围裙披风', 'common', 2, 'chest'),
  it('back', 'confRibbonCape', '缎带披风', 'rare', 3, 'chest'),
  it('aura', 'confSugarAura', '糖霜环绕', 'common', 2, 'chest'),
  it('aura', 'confHeartAura', '爱心光环', 'rare', 3, 'chest'),
  it('ring', 'confRing', '甜点地环', 'common', 1, 'chest'),
  it('racketSkin', 'confRacketA', '糖果球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'confRacketB', '奶油球拍', 'epic', 4, 'chest'),
  it('trail', 'confTrailA', '花瓣拖尾', 'rare', 3, 'chest'),
  it('trail', 'confTrailB', '糖星拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'confSwing', '糖霜斩', 'legendary', 5, 'chest'),
  // --- 🎪 马戏团 ---
  it('skin', 'bigtSpirit', '幻术师', 'legendary', 5, 'chest'),
  it('mount', 'bigtBall', '彩球坐骑', 'epic', 4, 'chest'),
  it('hat', 'bigtClown', '小丑帽', 'rare', 3, 'chest'),
  it('hat', 'bigtRing', '彩环头饰', 'epic', 4, 'chest'),
  it('back', 'bigtTentWing', '帐篷翼', 'rare', 3, 'chest'),
  it('back', 'bigtConfettiWing', '彩带翼', 'epic', 4, 'chest'),
  it('back', 'bigtCape', '马戏披风', 'common', 2, 'chest'),
  it('back', 'bigtCurtain', '帷幕披风', 'rare', 3, 'chest'),
  it('aura', 'bigtConfetti', '彩纸环绕', 'common', 2, 'chest'),
  it('aura', 'bigtSpotAura', '聚光光环', 'rare', 3, 'chest'),
  it('ring', 'bigtRing', '彩环地环', 'common', 1, 'chest'),
  it('racketSkin', 'bigtRacketA', '小丑球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'bigtRacketB', '彩条球拍', 'epic', 4, 'chest'),
  it('trail', 'bigtTrailA', '彩星拖尾', 'rare', 3, 'chest'),
  it('trail', 'bigtTrailB', '彩带拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'bigtSwing', '彩纸斩', 'legendary', 5, 'chest'),
  // --- 🛡️ 骑士城堡 ---
  it('skin', 'aegisSpirit', '圣盾神', 'legendary', 5, 'chest'),
  it('mount', 'aegisSteed', '披甲战马', 'epic', 4, 'chest'),
  it('hat', 'aegisHelm', '骑士盔', 'rare', 3, 'chest'),
  it('hat', 'aegisCrest', '骑士冠', 'epic', 4, 'chest'),
  it('back', 'aegisShieldWing', '盾翼', 'rare', 3, 'chest'),
  it('back', 'aegisBladeWing', '刃翼', 'epic', 4, 'chest'),
  it('back', 'aegisBanner', '旗帜披风', 'common', 2, 'chest'),
  it('back', 'aegisRoyal', '王袍披风', 'rare', 3, 'chest'),
  it('aura', 'aegisBanner', '战旗环绕', 'common', 2, 'chest'),
  it('aura', 'aegisSteel', '钢铁光环', 'rare', 3, 'chest'),
  it('ring', 'aegisRing', '城堡地环', 'common', 1, 'chest'),
  it('racketSkin', 'aegisRacketA', '齿轮球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'aegisRacketB', '剑刃球拍', 'epic', 4, 'chest'),
  it('trail', 'aegisTrailA', '铁尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'aegisTrailB', '战旗拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'aegisSwing', '雷霆斩', 'legendary', 5, 'chest'),
  // --- 🍵 东方茶馆 ---
  it('skin', 'chanSpirit', '茶仙', 'legendary', 5, 'chest'),
  it('mount', 'chanBoat', '乌篷船', 'epic', 4, 'chest'),
  it('hat', 'chanHat', '茶笠', 'rare', 3, 'chest'),
  it('hat', 'chanLantern', '灯笼头饰', 'epic', 4, 'chest'),
  it('back', 'chanFanWing', '折扇翼', 'rare', 3, 'chest'),
  it('back', 'chanLeafWing', '竹叶翼', 'epic', 4, 'chest'),
  it('back', 'chanRobe', '茶袍披风', 'common', 2, 'chest'),
  it('back', 'chanInkCape', '水墨披风', 'rare', 3, 'chest'),
  it('aura', 'chanInkAura', '水墨环绕', 'common', 2, 'chest'),
  it('aura', 'chanPetalAura', '花瓣光环', 'rare', 3, 'chest'),
  it('ring', 'chanRing', '茶馆地环', 'common', 1, 'chest'),
  it('racketSkin', 'chanRacketA', '竹纹球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'chanRacketB', '茶筅球拍', 'epic', 4, 'chest'),
  it('trail', 'chanTrailA', '墨迹拖尾', 'rare', 3, 'chest'),
  it('trail', 'chanTrailB', '花瓣拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'chanSwing', '水墨斩', 'legendary', 5, 'chest'),
  // --- 🔮 魔法学院 ---
  it('skin', 'arcanSpirit', '星界魔导', 'legendary', 5, 'chest'),
  it('mount', 'arcanOrb', '魔法球坐骑', 'epic', 4, 'chest'),
  it('hat', 'arcanCap', '魔法帽', 'rare', 3, 'chest'),
  it('hat', 'arcanCrown', '星月冠', 'epic', 4, 'chest'),
  it('back', 'arcanRuneWing', '符文翼', 'rare', 3, 'chest'),
  it('back', 'arcanStarWing', '星辉翼', 'epic', 4, 'chest'),
  it('back', 'arcanCloak', '法师斗篷', 'common', 2, 'chest'),
  it('back', 'arcanMantle', '星辉披风', 'rare', 3, 'chest'),
  it('aura', 'arcanRuneAura', '符文环绕', 'common', 2, 'chest'),
  it('aura', 'arcanStarAura', '星辉光环', 'rare', 3, 'chest'),
  it('ring', 'arcanRing', '法阵地环', 'common', 1, 'chest'),
  it('racketSkin', 'arcanRacketA', '魔杖球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'arcanRacketB', '符文球拍', 'epic', 4, 'chest'),
  it('trail', 'arcanTrailA', '星尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'arcanTrailB', '魔法拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'arcanSwing', '星辉斩', 'legendary', 5, 'chest'),
  // --- 🦴 化石博物馆 ---
  it('skin', 'relicSpirit', '白骨祭司', 'legendary', 5, 'chest'),
  it('mount', 'relicBone', '骨龙坐骑', 'epic', 4, 'chest'),
  it('hat', 'relicBone', '骨头帽', 'rare', 3, 'chest'),
  it('hat', 'relicAmber', '琥珀冠', 'epic', 4, 'chest'),
  it('back', 'relicBoneWing', '骨翼', 'rare', 3, 'chest'),
  it('back', 'relicAmberWing', '琥珀翼', 'epic', 4, 'chest'),
  it('back', 'relicHide', '兽皮披风', 'common', 2, 'chest'),
  it('back', 'relicDustCape', '尘土披风', 'rare', 3, 'chest'),
  it('aura', 'relicDustAura', '尘土环绕', 'common', 2, 'chest'),
  it('aura', 'relicAmberAura', '琥珀光环', 'rare', 3, 'chest'),
  it('ring', 'relicRing', '博物馆地环', 'common', 1, 'chest'),
  it('racketSkin', 'relicRacketA', '骨纹球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'relicRacketB', '青铜镐球拍', 'epic', 4, 'chest'),
  it('trail', 'relicTrailA', '沙尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'relicTrailB', '琥珀拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'relicSwing', '沙尘斩', 'legendary', 5, 'chest'),
  // --- 🧸 玩具工坊 ---
  it('skin', 'playSpirit', '发条神', 'legendary', 5, 'chest'),
  it('mount', 'playHorse', '摇摇马', 'epic', 4, 'chest'),
  it('hat', 'playBlock', '积木头饰', 'rare', 3, 'chest'),
  it('hat', 'playTop', '陀螺头饰', 'epic', 4, 'chest'),
  it('back', 'playBlockWing', '积木翼', 'rare', 3, 'chest'),
  it('back', 'playKiteWing', '风筝翼', 'epic', 4, 'chest'),
  it('back', 'playCape', '玩具披风', 'common', 2, 'chest'),
  it('back', 'playRibbonCape', '彩带披风', 'rare', 3, 'chest'),
  it('aura', 'playBallAura', '弹球环绕', 'common', 2, 'chest'),
  it('aura', 'playSparkAura', '火花光环', 'rare', 3, 'chest'),
  it('ring', 'playRing', '玩具地环', 'common', 1, 'chest'),
  it('racketSkin', 'playRacketA', '积木球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'playRacketB', '彩带球拍', 'epic', 4, 'chest'),
  it('trail', 'playTrailA', '泡泡拖尾', 'rare', 3, 'chest'),
  it('trail', 'playTrailB', '星彩拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'playSwing', '星彩斩', 'legendary', 5, 'chest'),
  // --- 🏮 元宵灯会 ---
  it('skin', 'yuanSpirit', '灯神元夕', 'legendary', 5, 'chest'),
  it('mount', 'yuanBoat', '花灯船', 'epic', 4, 'chest'),
  it('hat', 'yuanLamp', '花灯头饰', 'rare', 3, 'chest'),
  it('hat', 'yuanMask', '面具头饰', 'epic', 4, 'chest'),
  it('back', 'yuanLanternWing', '灯笼翼', 'rare', 3, 'chest'),
  it('back', 'yuanFireWing', '焰火翼', 'epic', 4, 'chest'),
  it('back', 'yuanSilk', '绸缎披风', 'common', 2, 'chest'),
  it('back', 'yuanLanternCape', '灯彩披风', 'rare', 3, 'chest'),
  it('aura', 'yuanFireAura', '焰火环绕', 'common', 2, 'chest'),
  it('aura', 'yuanLanternAura', '灯笼光环', 'rare', 3, 'chest'),
  it('ring', 'yuanRing', '灯会地环', 'common', 1, 'chest'),
  it('racketSkin', 'yuanRacketA', '绸缎球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'yuanRacketB', '符文球拍', 'epic', 4, 'chest'),
  it('trail', 'yuanTrailA', '焰火拖尾', 'rare', 3, 'chest'),
  it('trail', 'yuanTrailB', '花瓣拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'yuanSwing', '焰火斩', 'legendary', 5, 'chest'),

  // --- 🏴‍☠️ 海盗港湾 ---
  it('skin', 'pirateSpirit', '铁钩船长', 'legendary', 5, 'chest'),
  it('mount', 'pirateMount', '海盗小船', 'epic', 4, 'chest'),
  it('hat', 'pirateHat', '三角帽', 'rare', 3, 'chest'),
  it('hat', 'pirateCrown', '船长之冠', 'epic', 4, 'chest'),
  it('back', 'pirateWingA', '破帆之翼', 'rare', 3, 'chest'),
  it('back', 'pirateWingB', '海怪之翼', 'epic', 4, 'chest'),
  it('back', 'pirateCape', '海风披风', 'common', 2, 'chest'),
  it('back', 'pirateCloak', '藏宝图斗篷', 'rare', 3, 'chest'),
  it('aura', 'pirateAuraA', '潮鸣环绕', 'common', 2, 'chest'),
  it('aura', 'pirateAuraB', '骷髅旗环绕', 'rare', 3, 'chest'),
  it('ring', 'pirateRing', '甲板地环', 'common', 1, 'chest'),
  it('racketSkin', 'pirateRacketA', '罗盘球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'pirateRacketB', '船锚球拍', 'epic', 4, 'chest'),
  it('trail', 'pirateTrailA', '浪花拖尾', 'rare', 3, 'chest'),
  it('trail', 'pirateTrailB', '炮火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'pirateSwing', '锚爪斩', 'legendary', 5, 'chest'),

  // --- ⚙️ 蒸汽朋克 ---
  it('skin', 'steamSpirit', '黄铜机师', 'legendary', 5, 'chest'),
  it('mount', 'steamMount', '蒸汽机车', 'epic', 4, 'chest'),
  it('hat', 'steamHat', '护目镜帽', 'rare', 3, 'chest'),
  it('hat', 'steamCrown', '齿轮礼帽', 'epic', 4, 'chest'),
  it('back', 'steamWingA', '黄铜之翼', 'rare', 3, 'chest'),
  it('back', 'steamWingB', '气囊之翼', 'epic', 4, 'chest'),
  it('back', 'steamCape', '工装披风', 'common', 2, 'chest'),
  it('back', 'steamCloak', '铆钉斗篷', 'rare', 3, 'chest'),
  it('aura', 'steamAuraA', '蒸汽环流', 'common', 2, 'chest'),
  it('aura', 'steamAuraB', '齿轮光环', 'rare', 3, 'chest'),
  it('ring', 'steamRing', '压力阀地环', 'common', 1, 'chest'),
  it('racketSkin', 'steamRacketA', '扳手球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'steamRacketB', '活塞球拍', 'epic', 4, 'chest'),
  it('trail', 'steamTrailA', '蒸汽拖尾', 'rare', 3, 'chest'),
  it('trail', 'steamTrailB', '火花拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'steamSwing', '齿轮斩', 'legendary', 5, 'chest'),

  // --- 🚀 星际宇航 ---
  it('skin', 'astroSpirit', '星舰驾驶员', 'legendary', 5, 'chest'),
  it('mount', 'astroMount', '太空舱', 'epic', 4, 'chest'),
  it('hat', 'astroHat', '通讯头盔', 'rare', 3, 'chest'),
  it('hat', 'astroCrown', '指令长冠', 'epic', 4, 'chest'),
  it('back', 'astroWingA', '太阳能翼', 'rare', 3, 'chest'),
  it('back', 'astroWingB', '流星之翼', 'epic', 4, 'chest'),
  it('back', 'astroCape', '宇航服披风', 'common', 2, 'chest'),
  it('back', 'astroCloak', '星图斗篷', 'rare', 3, 'chest'),
  it('aura', 'astroAuraA', '轨道光环', 'common', 2, 'chest'),
  it('aura', 'astroAuraB', '星云环绕', 'rare', 3, 'chest'),
  it('ring', 'astroRing', '发射台地环', 'common', 1, 'chest'),
  it('racketSkin', 'astroRacketA', '天线球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'astroRacketB', '火箭球拍', 'epic', 4, 'chest'),
  it('trail', 'astroTrailA', '推进拖尾', 'rare', 3, 'chest'),
  it('trail', 'astroTrailB', '彗星拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'astroSwing', '轨道斩', 'legendary', 5, 'chest'),

  // --- 🦖 侏罗纪 ---
  it('skin', 'juraSpirit', '迅猛龙', 'legendary', 5, 'chest'),
  it('mount', 'juraMount', '剑龙坐骑', 'epic', 4, 'chest'),
  it('hat', 'juraHat', '恐龙蛋帽', 'rare', 3, 'chest'),
  it('hat', 'juraCrown', '龙骨王冠', 'epic', 4, 'chest'),
  it('back', 'juraWingA', '蕨叶之翼', 'rare', 3, 'chest'),
  it('back', 'juraWingB', '翼龙之翼', 'epic', 4, 'chest'),
  it('back', 'juraCape', '兽皮披风', 'common', 2, 'chest'),
  it('back', 'juraCloak', '蕨叶斗篷', 'rare', 3, 'chest'),
  it('aura', 'juraAuraA', '孢子环绕', 'common', 2, 'chest'),
  it('aura', 'juraAuraB', '余烬环绕', 'rare', 3, 'chest'),
  it('ring', 'juraRing', '脚印地环', 'common', 1, 'chest'),
  it('racketSkin', 'juraRacketA', '骨棒球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'juraRacketB', '琥珀球拍', 'epic', 4, 'chest'),
  it('trail', 'juraTrailA', '蕨叶拖尾', 'rare', 3, 'chest'),
  it('trail', 'juraTrailB', '岩浆拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'juraSwing', '撕咬斩', 'legendary', 5, 'chest'),

  // --- 🍄 蘑菇森林 ---
  it('skin', 'mushSpirit', '蘑菇小妖', 'legendary', 5, 'chest'),
  it('mount', 'mushMount', '甲虫坐骑', 'epic', 4, 'chest'),
  it('hat', 'mushHat', '毒菇帽', 'rare', 3, 'chest'),
  it('hat', 'mushCrown', '蘑菇王冠', 'epic', 4, 'chest'),
  it('back', 'mushWingA', '孢子之翼', 'rare', 3, 'chest'),
  it('back', 'mushWingB', '落叶之翼', 'epic', 4, 'chest'),
  it('back', 'mushCape', '苔藓披风', 'common', 2, 'chest'),
  it('back', 'mushCloak', '菌丝斗篷', 'rare', 3, 'chest'),
  it('aura', 'mushAuraA', '孢子环绕', 'common', 2, 'chest'),
  it('aura', 'mushAuraB', '萤光环绕', 'rare', 3, 'chest'),
  it('ring', 'mushRing', '菌圈地环', 'common', 1, 'chest'),
  it('racketSkin', 'mushRacketA', '菌盖球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'mushRacketB', '枯枝球拍', 'epic', 4, 'chest'),
  it('trail', 'mushTrailA', '孢子拖尾', 'rare', 3, 'chest'),
  it('trail', 'mushTrailB', '萤火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'mushSwing', '菌伞斩', 'legendary', 5, 'chest'),

  // --- 🐠 热带珊瑚 ---
  it('skin', 'tropicSpirit', '珊瑚人鱼', 'legendary', 5, 'chest'),
  it('mount', 'tropicMount', '海龟坐骑', 'epic', 4, 'chest'),
  it('hat', 'tropicHat', '贝壳帽', 'rare', 3, 'chest'),
  it('hat', 'tropicCrown', '珊瑚王冠', 'epic', 4, 'chest'),
  it('back', 'tropicWingA', '鱼鳍之翼', 'rare', 3, 'chest'),
  it('back', 'tropicWingB', '水母之翼', 'epic', 4, 'chest'),
  it('back', 'tropicCape', '海藻披风', 'common', 2, 'chest'),
  it('back', 'tropicCloak', '泡沫斗篷', 'rare', 3, 'chest'),
  it('aura', 'tropicAuraA', '气泡环绕', 'common', 2, 'chest'),
  it('aura', 'tropicAuraB', '洋流环绕', 'rare', 3, 'chest'),
  it('ring', 'tropicRing', '沙滩地环', 'common', 1, 'chest'),
  it('racketSkin', 'tropicRacketA', '海螺球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'tropicRacketB', '珊瑚球拍', 'epic', 4, 'chest'),
  it('trail', 'tropicTrailA', '气泡拖尾', 'rare', 3, 'chest'),
  it('trail', 'tropicTrailB', '洋流拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'tropicSwing', '潮汐斩', 'legendary', 5, 'chest'),

  // --- 🗝️ 地牢探险 ---
  it('skin', 'cryptSpirit', '地牢骷髅', 'legendary', 5, 'chest'),
  it('mount', 'cryptMount', '骸骨战马', 'epic', 4, 'chest'),
  it('hat', 'cryptHat', '铁盔', 'rare', 3, 'chest'),
  it('hat', 'cryptCrown', '骷髅王冠', 'epic', 4, 'chest'),
  it('back', 'cryptWingA', '蝙蝠之翼', 'rare', 3, 'chest'),
  it('back', 'cryptWingB', '石像鬼之翼', 'epic', 4, 'chest'),
  it('back', 'cryptCape', '破布披风', 'common', 2, 'chest'),
  it('back', 'cryptCloak', '锁链斗篷', 'rare', 3, 'chest'),
  it('aura', 'cryptAuraA', '幽绿环绕', 'common', 2, 'chest'),
  it('aura', 'cryptAuraB', '烛火环绕', 'rare', 3, 'chest'),
  it('ring', 'cryptRing', '石砖地环', 'common', 1, 'chest'),
  it('racketSkin', 'cryptRacketA', '铁镐球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'cryptRacketB', '骨剑球拍', 'epic', 4, 'chest'),
  it('trail', 'cryptTrailA', '幽尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'cryptTrailB', '烛火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'cryptSwing', '断骨斩', 'legendary', 5, 'chest'),

  // --- 🎄 圣诞雪夜 ---
  it('skin', 'festivSpirit', '圣诞小精灵', 'legendary', 5, 'chest'),
  it('mount', 'festivMount', '驯鹿雪橇', 'epic', 4, 'chest'),
  it('hat', 'festivHat', '圣诞帽', 'rare', 3, 'chest'),
  it('hat', 'festivCrown', '圣诞王冠', 'epic', 4, 'chest'),
  it('back', 'festivWingA', '雪花之翼', 'rare', 3, 'chest'),
  it('back', 'festivWingB', '铃铛之翼', 'epic', 4, 'chest'),
  it('back', 'festivCape', '红绒披风', 'common', 2, 'chest'),
  it('back', 'festivCloak', '礼物斗篷', 'rare', 3, 'chest'),
  it('aura', 'festivAuraA', '落雪环绕', 'common', 2, 'chest'),
  it('aura', 'festivAuraB', '铃铛环绕', 'rare', 3, 'chest'),
  it('ring', 'festivRing', '雪原地环', 'common', 1, 'chest'),
  it('racketSkin', 'festivRacketA', '拐杖糖球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'festivRacketB', '铃铛球拍', 'epic', 4, 'chest'),
  it('trail', 'festivTrailA', '雪花拖尾', 'rare', 3, 'chest'),
  it('trail', 'festivTrailB', '彩灯拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'festivSwing', '铃铛斩', 'legendary', 5, 'chest'),

  // --- 🍣 和风料亭 ---
  it('skin', 'sushiSpirit', '料理长', 'legendary', 5, 'chest'),
  it('mount', 'sushiMount', '木盆小船', 'epic', 4, 'chest'),
  it('hat', 'sushiHat', '头巾帽', 'rare', 3, 'chest'),
  it('hat', 'sushiCrown', '招财猫冠', 'epic', 4, 'chest'),
  it('back', 'sushiWingA', '鲷鱼之翼', 'rare', 3, 'chest'),
  it('back', 'sushiWingB', '筷箸之翼', 'epic', 4, 'chest'),
  it('back', 'sushiCape', '暖帘披风', 'common', 2, 'chest'),
  it('back', 'sushiCloak', '条纹斗篷', 'rare', 3, 'chest'),
  it('aura', 'sushiAuraA', '蒸汽环绕', 'common', 2, 'chest'),
  it('aura', 'sushiAuraB', '樱花环绕', 'rare', 3, 'chest'),
  it('ring', 'sushiRing', '木纹地环', 'common', 1, 'chest'),
  it('racketSkin', 'sushiRacketA', '筷子球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'sushiRacketB', '鱼形球拍', 'epic', 4, 'chest'),
  it('trail', 'sushiTrailA', '蒸汽拖尾', 'rare', 3, 'chest'),
  it('trail', 'sushiTrailB', '酱油拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'sushiSwing', '快刀斩', 'legendary', 5, 'chest'),

  // --- 🤠 西部荒野 ---
  it('skin', 'wildSpirit', '快枪手', 'legendary', 5, 'chest'),
  it('mount', 'wildMount', '野马', 'epic', 4, 'chest'),
  it('hat', 'wildHat', '牛仔帽', 'rare', 3, 'chest'),
  it('hat', 'wildCrown', '警长徽章冠', 'epic', 4, 'chest'),
  it('back', 'wildWingA', '秃鹫之翼', 'rare', 3, 'chest'),
  it('back', 'wildWingB', '风滚草之翼', 'epic', 4, 'chest'),
  it('back', 'wildCape', '牛仔披风', 'common', 2, 'chest'),
  it('back', 'wildCloak', '马刺斗篷', 'rare', 3, 'chest'),
  it('aura', 'wildAuraA', '尘土环绕', 'common', 2, 'chest'),
  it('aura', 'wildAuraB', '落日环绕', 'rare', 3, 'chest'),
  it('ring', 'wildRing', '马蹄地环', 'common', 1, 'chest'),
  it('racketSkin', 'wildRacketA', '套索球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'wildRacketB', '左轮球拍', 'epic', 4, 'chest'),
  it('trail', 'wildTrailA', '尘土拖尾', 'rare', 3, 'chest'),
  it('trail', 'wildTrailB', '火花拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'wildSwing', '拔枪斩', 'legendary', 5, 'chest'),

  // ==========================================================================
  // 🗺️ 山海宝箱（见 game/chest.ts 的 theme id `shan`）
  // 10 只《山海经》怪物皮肤：`chest` 专属、5★，但额外挂了 `pullWeight`——
  // 抽奖不看星级权重、按这个绝对权重算，所以**中奖率极低**（见 progress.rollFrom）。
  // 再配 14 件普通山海物品凑数（低星、好出），衬托皮肤的珍贵。
  // ==========================================================================
  itw('skin', 'zhuLong', '烛龙', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'xiangLiu', '相柳', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'qiongQi', '穷奇', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'taoTie', '饕餮', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'taoWu', '梼杌', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'hunDun', '混沌', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'jiuweiHu', '九尾狐', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'baShe', '巴蛇', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'guDiao', '蛊雕', 'legendary', 5, 'chest', 0.3),
  itw('skin', 'yuYu', '猰貐', 'legendary', 5, 'chest', 0.3),
  // 普通山海物品（凑数用，低星好出）
  it('ring', 'shanRing', '昆仑地环', 'common', 1, 'chest'),
  it('hat', 'shanHatFeather', '鹤羽笠', 'common', 2, 'chest'),
  it('back', 'shanWingFeather', '鲲羽之翼', 'common', 2, 'chest'),
  it('back', 'shanCapeScale', '鳞光披风', 'common', 2, 'chest'),
  it('back', 'shanCapeMist', '瀛洲雾纱', 'common', 2, 'chest'),
  it('aura', 'shanAuraSpirit', '灵气环绕', 'common', 2, 'chest'),
  it('racketSkin', 'shanRacketA', '玉简球拍', 'common', 2, 'chest'),
  it('trail', 'shanTrail', '灵气拖尾', 'common', 2, 'chest'),
  it('hat', 'shanHatDragon', '螭龙角', 'rare', 3, 'chest'),
  it('back', 'shanWingCloud', '云螭翼', 'rare', 3, 'chest'),
  it('aura', 'shanAuraStar', '星汉光环', 'rare', 3, 'chest'),
  it('racketSkin', 'shanRacketB', '螭鳞球拍', 'rare', 3, 'chest'),
  it('swingTrail', 'shanSwing', '山海斩', 'rare', 3, 'chest'),
  it('mount', 'shanMountKun', '鲲鹏', 'epic', 4, 'chest'),

  // --- 🏟 操场「跑道特训」：累计跑量里程碑专属（每 1km 一件，见 RUN_MILESTONES） ---
  it('ring', 'runRing', '跑道地环', 'rare', 3, 'run'),
  it('aura', 'runAura', '冲线光环', 'epic', 4, 'run'),
  it('trail', 'runTrail', '疾跑拖尾', 'epic', 4, 'run'),
  it('swingTrail', 'runSwing', '冲刺斩', 'epic', 4, 'run'),
  it('hat', 'runHat', '跑鞋头带', 'epic', 4, 'run'),

  // ==========================================================================
  // 第四批 20 个主题宝箱（见 game/chest.ts 的 CHEST_THEMES 与
  // game/draw/themeart3.ts）。每个主题 16 件、全部 `chest` 宝箱专属，
  // 星级结构：1★×1 / 2★×3 / 3★×6 / 4★×5 / 5★×2（招牌形象 + 专属斩）。
  // ==========================================================================

  // --- 🌋 熔岩核心 ---
  it('skin', 'vulcSpirit', '熔岩巨人', 'legendary', 5, 'chest'),
  it('mount', 'vulcHound', '熔岩犬', 'epic', 4, 'chest'),
  it('hat', 'vulcHelm', '熔岩头盔', 'rare', 3, 'chest'),
  it('hat', 'vulcCrown', '火山王冠', 'epic', 4, 'chest'),
  it('back', 'vulcWingA', '火焰之翼', 'rare', 3, 'chest'),
  it('back', 'vulcWingB', '熔渣之翼', 'epic', 4, 'chest'),
  it('back', 'vulcCape', '焦土披风', 'common', 2, 'chest'),
  it('back', 'vulcCloak', '岩浆斗篷', 'rare', 3, 'chest'),
  it('aura', 'vulcAuraA', '火星环绕', 'common', 2, 'chest'),
  it('aura', 'vulcAuraB', '熔流光环', 'rare', 3, 'chest'),
  it('ring', 'vulcRing', '岩浆地环', 'common', 1, 'chest'),
  it('racketSkin', 'vulcRacketA', '火山球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'vulcRacketB', '熔核球拍', 'epic', 4, 'chest'),
  it('trail', 'vulcTrailA', '火星拖尾', 'rare', 3, 'chest'),
  it('trail', 'vulcTrailB', '熔流拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'vulcSwing', '岩浆斩', 'legendary', 5, 'chest'),

  // --- 🌊 深渊海沟 ---
  it('skin', 'trenchSpirit', '深渊巨妖', 'legendary', 5, 'chest'),
  it('mount', 'trenchRay', '魔鬼鱼坐骑', 'epic', 4, 'chest'),
  it('hat', 'trenchDiver', '深潜头盔', 'rare', 3, 'chest'),
  it('hat', 'trenchCrown', '沟底王冠', 'epic', 4, 'chest'),
  it('back', 'trenchWingA', '洋流之翼', 'rare', 3, 'chest'),
  it('back', 'trenchWingB', '巨鳃之翼', 'epic', 4, 'chest'),
  it('back', 'trenchCape', '水幕披风', 'common', 2, 'chest'),
  it('back', 'trenchCloak', '海妖斗篷', 'rare', 3, 'chest'),
  it('aura', 'trenchAuraA', '气泡环绕', 'common', 2, 'chest'),
  it('aura', 'trenchAuraB', '深海光晕', 'rare', 3, 'chest'),
  it('ring', 'trenchRing', '潮汐地环', 'common', 1, 'chest'),
  it('racketSkin', 'trenchRacketA', '鱼叉球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'trenchRacketB', '珍珠球拍', 'epic', 4, 'chest'),
  it('trail', 'trenchTrailA', '气泡拖尾', 'rare', 3, 'chest'),
  it('trail', 'trenchTrailB', '洋流拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'trenchSwing', '海啸斩', 'legendary', 5, 'chest'),

  // --- 🥋 道场精神 ---
  it('skin', 'dojoSpirit', '道场师范', 'legendary', 5, 'chest'),
  it('mount', 'dojoCrest', '得胜旗', 'epic', 4, 'chest'),
  it('hat', 'dojoHachimaki', '修行头带', 'rare', 3, 'chest'),
  it('hat', 'dojoCrown', '大师之冠', 'epic', 4, 'chest'),
  it('back', 'dojoWingA', '疾风之翼', 'rare', 3, 'chest'),
  it('back', 'dojoWingB', '龙魂之翼', 'epic', 4, 'chest'),
  it('back', 'dojoCape', '修行披风', 'common', 2, 'chest'),
  it('back', 'dojoCloak', '龙旗斗篷', 'rare', 3, 'chest'),
  it('aura', 'dojoAuraA', '汗珠环绕', 'common', 2, 'chest'),
  it('aura', 'dojoAuraB', '斗气光环', 'rare', 3, 'chest'),
  it('ring', 'dojoRing', '道场地环', 'common', 1, 'chest'),
  it('racketSkin', 'dojoRacketA', '竹剑球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'dojoRacketB', '武士球拍', 'epic', 4, 'chest'),
  it('trail', 'dojoTrailA', '疾风拖尾', 'rare', 3, 'chest'),
  it('trail', 'dojoTrailB', '龙卷拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'dojoSwing', '居合斩', 'legendary', 5, 'chest'),

  // --- 🖌️ 水墨江南 ---
  it('skin', 'inkwSpirit', '水墨先生', 'legendary', 5, 'chest'),
  it('mount', 'inkwBoat', '乌篷船', 'epic', 4, 'chest'),
  it('hat', 'inkwHat', '文人方巾', 'rare', 3, 'chest'),
  it('hat', 'inkwCrown', '状元冠', 'epic', 4, 'chest'),
  it('back', 'inkwWingA', '宣纸之翼', 'rare', 3, 'chest'),
  it('back', 'inkwWingB', '墨鹤之翼', 'epic', 4, 'chest'),
  it('back', 'inkwCape', '素衫披风', 'common', 2, 'chest'),
  it('back', 'inkwCloak', '泼墨斗篷', 'rare', 3, 'chest'),
  it('aura', 'inkwAuraA', '墨点环绕', 'common', 2, 'chest'),
  it('aura', 'inkwAuraB', '烟雨光环', 'rare', 3, 'chest'),
  it('ring', 'inkwRing', '砚台地环', 'common', 1, 'chest'),
  it('racketSkin', 'inkwRacketA', '毛笔球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'inkwRacketB', '山水球拍', 'epic', 4, 'chest'),
  it('trail', 'inkwTrailA', '墨迹拖尾', 'rare', 3, 'chest'),
  it('trail', 'inkwTrailB', '烟雨拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'inkwSwing', '泼墨斩', 'legendary', 5, 'chest'),

  // --- 🦋 精灵花园 ---
  it('skin', 'fairySpirit', '花园精灵', 'legendary', 5, 'chest'),
  it('mount', 'fairySnail', '精灵蜗牛', 'epic', 4, 'chest'),
  it('hat', 'fairyHat', '花冠', 'rare', 3, 'chest'),
  it('hat', 'fairyCrown', '藤蔓王冠', 'epic', 4, 'chest'),
  it('back', 'fairyWingA', '蝶翼', 'rare', 3, 'chest'),
  it('back', 'fairyWingB', '光尘之翼', 'epic', 4, 'chest'),
  it('back', 'fairyCape', '花瓣披风', 'common', 2, 'chest'),
  it('back', 'fairyCloak', '藤蔓斗篷', 'rare', 3, 'chest'),
  it('aura', 'fairyAuraA', '花粉环绕', 'common', 2, 'chest'),
  it('aura', 'fairyAuraB', '萤光光环', 'rare', 3, 'chest'),
  it('ring', 'fairyRing', '苔藓地环', 'common', 1, 'chest'),
  it('racketSkin', 'fairyRacketA', '花茎球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'fairyRacketB', '蜜露球拍', 'epic', 4, 'chest'),
  it('trail', 'fairyTrailA', '花瓣拖尾', 'rare', 3, 'chest'),
  it('trail', 'fairyTrailB', '萤光拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'fairySwing', '花瓣斩', 'legendary', 5, 'chest'),

  // --- 🏁 极速竞逐 ---
  it('skin', 'racerSpirit', '车手王牌', 'legendary', 5, 'chest'),
  it('mount', 'racerKart', '卡丁车', 'epic', 4, 'chest'),
  it('hat', 'racerHelm', '车手头盔', 'rare', 3, 'chest'),
  it('hat', 'racerCrown', '冠军桂冠', 'epic', 4, 'chest'),
  it('back', 'racerWingA', '尾翼', 'rare', 3, 'chest'),
  it('back', 'racerWingB', '涡轮之翼', 'epic', 4, 'chest'),
  it('back', 'racerCape', '车队披风', 'common', 2, 'chest'),
  it('back', 'racerCloak', '格子旗斗篷', 'rare', 3, 'chest'),
  it('aura', 'racerAuraA', '尾焰环绕', 'common', 2, 'chest'),
  it('aura', 'racerAuraB', '涡流光环', 'rare', 3, 'chest'),
  it('ring', 'racerRing', '赛道地环', 'common', 1, 'chest'),
  it('racketSkin', 'racerRacketA', '方程式球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'racerRacketB', '涡轮球拍', 'epic', 4, 'chest'),
  it('trail', 'racerTrailA', '轮迹拖尾', 'rare', 3, 'chest'),
  it('trail', 'racerTrailB', '火箭拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'racerSwing', '疾驰斩', 'legendary', 5, 'chest'),

  // --- 🦇 吸血鬼城堡 ---
  it('skin', 'vampSpirit', '血爵', 'legendary', 5, 'chest'),
  it('mount', 'vampStallion', '午夜黑马', 'epic', 4, 'chest'),
  it('hat', 'vampHat', '血族礼帽', 'rare', 3, 'chest'),
  it('hat', 'vampCrown', '血月王冠', 'epic', 4, 'chest'),
  it('back', 'vampWingA', '蝠翼', 'rare', 3, 'chest'),
  it('back', 'vampWingB', '暗影之翼', 'epic', 4, 'chest'),
  it('back', 'vampCape', '高领披风', 'common', 2, 'chest'),
  it('back', 'vampCloak', '血雾斗篷', 'rare', 3, 'chest'),
  it('aura', 'vampAuraA', '蝠群环绕', 'common', 2, 'chest'),
  it('aura', 'vampAuraB', '血月光环', 'rare', 3, 'chest'),
  it('ring', 'vampRing', '城堡地环', 'common', 1, 'chest'),
  it('racketSkin', 'vampRacketA', '棺木球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'vampRacketB', '獠牙球拍', 'epic', 4, 'chest'),
  it('trail', 'vampTrailA', '蝙影拖尾', 'rare', 3, 'chest'),
  it('trail', 'vampTrailB', '血雾拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'vampSwing', '血宴斩', 'legendary', 5, 'chest'),

  // --- 🍁 秋日枫林 ---
  it('skin', 'autumnSpirit', '枫林守护者', 'legendary', 5, 'chest'),
  it('mount', 'autumnBoar', '野猪坐骑', 'epic', 4, 'chest'),
  it('hat', 'autumnHat', '麦秆帽', 'rare', 3, 'chest'),
  it('hat', 'autumnCrown', '枫叶王冠', 'epic', 4, 'chest'),
  it('back', 'autumnWingA', '红叶之翼', 'rare', 3, 'chest'),
  it('back', 'autumnWingB', '丰收之翼', 'epic', 4, 'chest'),
  it('back', 'autumnCape', '麦束披风', 'common', 2, 'chest'),
  it('back', 'autumnCloak', '落叶斗篷', 'rare', 3, 'chest'),
  it('aura', 'autumnAuraA', '落叶环绕', 'common', 2, 'chest'),
  it('aura', 'autumnAuraB', '稻香光环', 'rare', 3, 'chest'),
  it('ring', 'autumnRing', '田埂地环', 'common', 1, 'chest'),
  it('racketSkin', 'autumnRacketA', '枝干球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'autumnRacketB', '琥珀秋杖球拍', 'epic', 4, 'chest'),
  it('trail', 'autumnTrailA', '落叶拖尾', 'rare', 3, 'chest'),
  it('trail', 'autumnTrailB', '篝火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'autumnSwing', '落枫斩', 'legendary', 5, 'chest'),

  // --- 🐼 竹林熊猫 ---
  it('skin', 'pandaSpirit', '竹团熊猫', 'legendary', 5, 'chest'),
  it('mount', 'pandaSled', '竹筏坐骑', 'epic', 4, 'chest'),
  it('hat', 'pandaHat', '竹叶帽', 'rare', 3, 'chest'),
  it('hat', 'pandaCrown', '竹王冠', 'epic', 4, 'chest'),
  it('back', 'pandaWingA', '竹叶之翼', 'rare', 3, 'chest'),
  it('back', 'pandaWingB', '竹节之翼', 'epic', 4, 'chest'),
  it('back', 'pandaCape', '蓑衣披风', 'common', 2, 'chest'),
  it('back', 'pandaCloak', '竹帘斗篷', 'rare', 3, 'chest'),
  it('aura', 'pandaAuraA', '竹叶环绕', 'common', 2, 'chest'),
  it('aura', 'pandaAuraB', '清风光环', 'rare', 3, 'chest'),
  it('ring', 'pandaRing', '竹林地环', 'common', 1, 'chest'),
  it('racketSkin', 'pandaRacketA', '竹枝球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'pandaRacketB', '玉竹球拍', 'epic', 4, 'chest'),
  it('trail', 'pandaTrailA', '竹叶拖尾', 'rare', 3, 'chest'),
  it('trail', 'pandaTrailB', '清风拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'pandaSwing', '竹裂斩', 'legendary', 5, 'chest'),

  // --- 🃏 纸牌王国 ---
  it('skin', 'jokerSpirit', '纸牌小丑', 'legendary', 5, 'chest'),
  it('mount', 'jokerCarriage', '纸牌花车', 'epic', 4, 'chest'),
  it('hat', 'jokerHat', '方片帽', 'rare', 3, 'chest'),
  it('hat', 'jokerCrown', '国王牌冠', 'epic', 4, 'chest'),
  it('back', 'jokerWingA', '纸牌之翼', 'rare', 3, 'chest'),
  it('back', 'jokerWingB', '小丑之翼', 'epic', 4, 'chest'),
  it('back', 'jokerCape', '魔术披风', 'common', 2, 'chest'),
  it('back', 'jokerCloak', '王牌斗篷', 'rare', 3, 'chest'),
  it('aura', 'jokerAuraA', '花色环绕', 'common', 2, 'chest'),
  it('aura', 'jokerAuraB', '王牌光环', 'rare', 3, 'chest'),
  it('ring', 'jokerRing', '牌桌地环', 'common', 1, 'chest'),
  it('racketSkin', 'jokerRacketA', '纸牌球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'jokerRacketB', '权杖球拍', 'epic', 4, 'chest'),
  it('trail', 'jokerTrailA', '花色拖尾', 'rare', 3, 'chest'),
  it('trail', 'jokerTrailB', '洗牌拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'jokerSwing', '切牌斩', 'legendary', 5, 'chest'),

  // --- 🏯 古都风华 ---
  it('skin', 'pagodSpirit', '镇守将军', 'legendary', 5, 'chest'),
  it('mount', 'pagodPalanquin', '官轿', 'epic', 4, 'chest'),
  it('hat', 'pagodHat', '乌纱帽', 'rare', 3, 'chest'),
  it('hat', 'pagodCrown', '将军盔缨', 'epic', 4, 'chest'),
  it('back', 'pagodWingA', '祥云之翼', 'rare', 3, 'chest'),
  it('back', 'pagodWingB', '金鳞之翼', 'epic', 4, 'chest'),
  it('back', 'pagodCape', '战袍披风', 'common', 2, 'chest'),
  it('back', 'pagodCloak', '金鳞斗篷', 'rare', 3, 'chest'),
  it('aura', 'pagodAuraA', '香火环绕', 'common', 2, 'chest'),
  it('aura', 'pagodAuraB', '龙气光环', 'rare', 3, 'chest'),
  it('ring', 'pagodRing', '宫殿地环', 'common', 1, 'chest'),
  it('racketSkin', 'pagodRacketA', '官刀球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'pagodRacketB', '玉玺球拍', 'epic', 4, 'chest'),
  it('trail', 'pagodTrailA', '香烟拖尾', 'rare', 3, 'chest'),
  it('trail', 'pagodTrailB', '金鳞拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'pagodSwing', '开山斩', 'legendary', 5, 'chest'),

  // --- 🌪️ 风暴之眼 ---
  it('skin', 'stormSpirit', '驭风者', 'legendary', 5, 'chest'),
  it('mount', 'stormGlider', '风暴滑翔翼', 'epic', 4, 'chest'),
  it('hat', 'stormHat', '风镜帽', 'rare', 3, 'chest'),
  it('hat', 'stormCrown', '雷云之冠', 'epic', 4, 'chest'),
  it('back', 'stormWingA', '疾风之翼', 'rare', 3, 'chest'),
  it('back', 'stormWingB', '雷云之翼', 'epic', 4, 'chest'),
  it('back', 'stormCape', '风幕披风', 'common', 2, 'chest'),
  it('back', 'stormCloak', '雷暴斗篷', 'rare', 3, 'chest'),
  it('aura', 'stormAuraA', '风尘环绕', 'common', 2, 'chest'),
  it('aura', 'stormAuraB', '雷环光环', 'rare', 3, 'chest'),
  it('ring', 'stormRing', '气旋地环', 'common', 1, 'chest'),
  it('racketSkin', 'stormRacketA', '逆风球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'stormRacketB', '引雷球拍', 'epic', 4, 'chest'),
  it('trail', 'stormTrailA', '疾风拖尾', 'rare', 3, 'chest'),
  it('trail', 'stormTrailB', '雷光拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'stormSwing', '龙卷斩', 'legendary', 5, 'chest'),

  // --- 🐇 月宫玉兔 ---
  it('skin', 'lunarSpirit', '玉兔仙子', 'legendary', 5, 'chest'),
  it('mount', 'lunarCloud', '月云', 'epic', 4, 'chest'),
  it('hat', 'lunarHat', '桂枝帽', 'rare', 3, 'chest'),
  it('hat', 'lunarCrown', '月轮王冠', 'epic', 4, 'chest'),
  it('back', 'lunarWingA', '月纱之翼', 'rare', 3, 'chest'),
  it('back', 'lunarWingB', '桂影之翼', 'epic', 4, 'chest'),
  it('back', 'lunarCape', '月白披风', 'common', 2, 'chest'),
  it('back', 'lunarCloak', '桂香斗篷', 'rare', 3, 'chest'),
  it('aura', 'lunarAuraA', '月尘环绕', 'common', 2, 'chest'),
  it('aura', 'lunarAuraB', '桂花光环', 'rare', 3, 'chest'),
  it('ring', 'lunarRing', '月宫地环', 'common', 1, 'chest'),
  it('racketSkin', 'lunarRacketA', '玉杵球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'lunarRacketB', '月轮球拍', 'epic', 4, 'chest'),
  it('trail', 'lunarTrailA', '月尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'lunarTrailB', '桂香拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'lunarSwing', '月华斩', 'legendary', 5, 'chest'),

  // --- ⚔️ 维京战船 ---
  it('skin', 'vikingSpirit', '维京首领', 'legendary', 5, 'chest'),
  it('mount', 'vikingDrakkar', '龙头船', 'epic', 4, 'chest'),
  it('hat', 'vikingHelm', '角斗头盔', 'rare', 3, 'chest'),
  it('hat', 'vikingCrown', '战利之冠', 'epic', 4, 'chest'),
  it('back', 'vikingWingA', '鸦羽之翼', 'rare', 3, 'chest'),
  it('back', 'vikingWingB', '战旗之翼', 'epic', 4, 'chest'),
  it('back', 'vikingCape', '粗布披风', 'common', 2, 'chest'),
  it('back', 'vikingCloak', '战旗斗篷', 'rare', 3, 'chest'),
  it('aura', 'vikingAuraA', '炉火环绕', 'common', 2, 'chest'),
  it('aura', 'vikingAuraB', '战吼光环', 'rare', 3, 'chest'),
  it('ring', 'vikingRing', '营地地环', 'common', 1, 'chest'),
  it('racketSkin', 'vikingRacketA', '战斧球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'vikingRacketB', '龙首球拍', 'epic', 4, 'chest'),
  it('trail', 'vikingTrailA', '雪原拖尾', 'rare', 3, 'chest'),
  it('trail', 'vikingTrailB', '战火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'vikingSwing', '战斧斩', 'legendary', 5, 'chest'),

  // --- 🦁 草原巡礼 ---
  it('skin', 'safariSpirit', '草原狮后', 'legendary', 5, 'chest'),
  it('mount', 'safariElephant', '大象坐骑', 'epic', 4, 'chest'),
  it('hat', 'safariHat', '探险遮阳帽', 'rare', 3, 'chest'),
  it('hat', 'safariCrown', '鬃毛王冠', 'epic', 4, 'chest'),
  it('back', 'safariWingA', '翎羽之翼', 'rare', 3, 'chest'),
  it('back', 'safariWingB', '夕阳之翼', 'epic', 4, 'chest'),
  it('back', 'safariCape', '帆布披风', 'common', 2, 'chest'),
  it('back', 'safariCloak', '猎装斗篷', 'rare', 3, 'chest'),
  it('aura', 'safariAuraA', '尘土环绕', 'common', 2, 'chest'),
  it('aura', 'safariAuraB', '热浪光环', 'rare', 3, 'chest'),
  it('ring', 'safariRing', '营火地环', 'common', 1, 'chest'),
  it('racketSkin', 'safariRacketA', '藤杖球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'safariRacketB', '象牙球拍', 'epic', 4, 'chest'),
  it('trail', 'safariTrailA', '草浪拖尾', 'rare', 3, 'chest'),
  it('trail', 'safariTrailB', '热风拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'safariSwing', '猛扑斩', 'legendary', 5, 'chest'),

  // --- 🎭 戏剧后台 ---
  it('skin', 'theatSpirit', '台柱名伶', 'legendary', 5, 'chest'),
  it('mount', 'theatSpotlight', '追光浮台', 'epic', 4, 'chest'),
  it('hat', 'theatHat', '花翎帽', 'rare', 3, 'chest'),
  it('hat', 'theatCrown', '桂冠', 'epic', 4, 'chest'),
  it('back', 'theatWingA', '纱袖之翼', 'rare', 3, 'chest'),
  it('back', 'theatWingB', '聚光之翼', 'epic', 4, 'chest'),
  it('back', 'theatCape', '天鹅绒披风', 'common', 2, 'chest'),
  it('back', 'theatCloak', '谢幕斗篷', 'rare', 3, 'chest'),
  it('aura', 'theatAuraA', '掌声环绕', 'common', 2, 'chest'),
  it('aura', 'theatAuraB', '追光光环', 'rare', 3, 'chest'),
  it('ring', 'theatRing', '舞台地环', 'common', 1, 'chest'),
  it('racketSkin', 'theatRacketA', '指挥棒球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'theatRacketB', '麦克风球拍', 'epic', 4, 'chest'),
  it('trail', 'theatTrailA', '彩带拖尾', 'rare', 3, 'chest'),
  it('trail', 'theatTrailB', '星光拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'theatSwing', '谢幕斩', 'legendary', 5, 'chest'),

  // --- 🌠 极光夜境 ---
  it('skin', 'boreaSpirit', '极光萨满', 'legendary', 5, 'chest'),
  it('mount', 'boreaStag', '光角驯鹿', 'epic', 4, 'chest'),
  it('hat', 'boreaHat', '御寒兜帽', 'rare', 3, 'chest'),
  it('hat', 'boreaCrown', '冰晶王冠', 'epic', 4, 'chest'),
  it('back', 'boreaWingA', '冰羽之翼', 'rare', 3, 'chest'),
  it('back', 'boreaWingB', '极光之翼', 'epic', 4, 'chest'),
  it('back', 'boreaCape', '兽裘披风', 'common', 2, 'chest'),
  it('back', 'boreaCloak', '极光斗篷', 'rare', 3, 'chest'),
  it('aura', 'boreaAuraA', '雪尘环绕', 'common', 2, 'chest'),
  it('aura', 'boreaAuraB', '极光光环', 'rare', 3, 'chest'),
  it('ring', 'boreaRing', '冰原地环', 'common', 1, 'chest'),
  it('racketSkin', 'boreaRacketA', '冰镐球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'boreaRacketB', '光幕球拍', 'epic', 4, 'chest'),
  it('trail', 'boreaTrailA', '雪尘拖尾', 'rare', 3, 'chest'),
  it('trail', 'boreaTrailB', '光弧拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'boreaSwing', '极光斩', 'legendary', 5, 'chest'),

  // --- 🛶 水城泛舟 ---
  it('skin', 'venicSpirit', '贡多拉船夫', 'legendary', 5, 'chest'),
  it('mount', 'venicGondola', '贡多拉', 'epic', 4, 'chest'),
  it('hat', 'venicHat', '船夫草帽', 'rare', 3, 'chest'),
  it('hat', 'venicCrown', '面具华冠', 'epic', 4, 'chest'),
  it('back', 'venicWingA', '鸥羽之翼', 'rare', 3, 'chest'),
  it('back', 'venicWingB', '水纹之翼', 'epic', 4, 'chest'),
  it('back', 'venicCape', '船夫披肩', 'common', 2, 'chest'),
  it('back', 'venicCloak', '面具斗篷', 'rare', 3, 'chest'),
  it('aura', 'venicAuraA', '水花环绕', 'common', 2, 'chest'),
  it('aura', 'venicAuraB', '琴音光环', 'rare', 3, 'chest'),
  it('ring', 'venicRing', '运河地环', 'common', 1, 'chest'),
  it('racketSkin', 'venicRacketA', '船桨球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'venicRacketB', '琉璃球拍', 'epic', 4, 'chest'),
  it('trail', 'venicTrailA', '涟漪拖尾', 'rare', 3, 'chest'),
  it('trail', 'venicTrailB', '歌声拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'venicSwing', '荡桨斩', 'legendary', 5, 'chest'),

  // --- 🏛️ 古希腊 ---
  it('skin', 'olympSpirit', '奥林匹斯勇士', 'legendary', 5, 'chest'),
  it('mount', 'olympChariot', '战车', 'epic', 4, 'chest'),
  it('hat', 'olympWreath', '橄榄桂冠', 'rare', 3, 'chest'),
  it('hat', 'olympCrown', '神祇之冠', 'epic', 4, 'chest'),
  it('back', 'olympWingA', '白翼', 'rare', 3, 'chest'),
  it('back', 'olympWingB', '神翼', 'epic', 4, 'chest'),
  it('back', 'olympCape', '托加披风', 'common', 2, 'chest'),
  it('back', 'olympCloak', '神谕斗篷', 'rare', 3, 'chest'),
  it('aura', 'olympAuraA', '橄榄环绕', 'common', 2, 'chest'),
  it('aura', 'olympAuraB', '神火光环', 'rare', 3, 'chest'),
  it('ring', 'olympRing', '竞技场地环', 'common', 1, 'chest'),
  it('racketSkin', 'olympRacketA', '长矛球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'olympRacketB', '雷霆球拍', 'epic', 4, 'chest'),
  it('trail', 'olympTrailA', '橄榄拖尾', 'rare', 3, 'chest'),
  it('trail', 'olympTrailB', '圣火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'olympSwing', '神罚斩', 'legendary', 5, 'chest'),

  // --- 🥁 桑巴狂欢 ---
  it('skin', 'sambaSpirit', '桑巴舞者', 'legendary', 5, 'chest'),
  it('mount', 'sambaFloat', '狂欢彩车', 'epic', 4, 'chest'),
  it('hat', 'sambaHat', '羽饰头冠', 'rare', 3, 'chest'),
  it('hat', 'sambaCrown', '狂欢王冠', 'epic', 4, 'chest'),
  it('back', 'sambaWingA', '彩羽之翼', 'rare', 3, 'chest'),
  it('back', 'sambaWingB', '亮片之翼', 'epic', 4, 'chest'),
  it('back', 'sambaCape', '流苏披风', 'common', 2, 'chest'),
  it('back', 'sambaCloak', '羽袍斗篷', 'rare', 3, 'chest'),
  it('aura', 'sambaAuraA', '彩带环绕', 'common', 2, 'chest'),
  it('aura', 'sambaAuraB', '节拍光环', 'rare', 3, 'chest'),
  it('ring', 'sambaRing', '舞池地环', 'common', 1, 'chest'),
  it('racketSkin', 'sambaRacketA', '沙锤球拍', 'rare', 3, 'chest'),
  it('racketSkin', 'sambaRacketB', '号角球拍', 'epic', 4, 'chest'),
  it('trail', 'sambaTrailA', '彩带拖尾', 'rare', 3, 'chest'),
  it('trail', 'sambaTrailB', '焰火拖尾', 'epic', 4, 'chest'),
  it('swingTrail', 'sambaSwing', '旋舞斩', 'legendary', 5, 'chest'),
];

export const GACHA_POOL = ITEMS.filter((i) => i.source === 'gacha' || i.source === 'chest');

// ---- 宝箱抽取：先等概率选类别，再在类别内按星级加权 ------------------------

/**
 * 抽奖的**星级权重**（越高的星越难出）。
 *
 * 抽取分两步（见 `stores/progress.ts` 的 `rollOne`）：
 * 1. 在宝箱池实际出现过的**类别**（`GACHA_SLOTS`）里**等概率**选一个；
 * 2. 在选中的类别里按这份权重抽星级，1★ 最常见、5★ 极少见。
 * 所以「抽到哪个部位」是均匀的，稀有感完全由星级决定。
 */
export const STAR_WEIGHT: Record<number, number> = {
  1: 45,
  2: 28,
  3: 16,
  4: 8,
  5: 3,
};

/** 开一次宝箱要的钥匙数（十连 = 10 把） */
export const CHEST_KEYS = 1;

/** 宝箱池里实际出现过的类别：抽奖第一步在这几个里等概率选一个 */
export const GACHA_SLOTS: ItemSlot[] = [...new Set(GACHA_POOL.map((i) => i.slot))];

// ---- 金币商店：宝箱池里的低星物品可以直接用金币买 --------------------------

/** 金币商店按星级定价 */
const COIN_PRICE_BY_STARS: Record<number, number> = { 1: 200, 2: 450, 3: 900 };

/**
 * 金币商店**专属款**（`source: 'coin'`：10 款角色形象 + 10 款坐骑）的星级价，
 * 比同星级的普通货贵一截——它们是「整套皮肤 / 整只坐骑」，
 * 要攒一攒（赚钱区砸矿 / 采棉花 / 抓鱼 → 交给农场主）才买得起。
 */
const COIN_EXCLUSIVE_PRICE_BY_STARS: Record<number, number> = { 1: 800, 2: 1800, 3: 3600 };

/**
 * 「金币商店」在售清单，两来源：
 * ① 宝箱池里 **3★ 及以下**的 `gacha` 物品（低星特效 + 低星头饰 / 拖尾 / 球拍皮肤…），
 *    拿出来用金币直购，省得为了几件普通货反复开箱子；高星（4★ / 5★）只从宝箱出；
 * ② **`source: 'coin'` 的金币商店专属**（10 款 1~3★ 角色形象）——它们**不在宝箱池里**，
 *    所以开箱抽不到，只能花钱买（这样也不会稀释宝箱的类别分布）。
 *
 * 注意 `source: 'chest'` 的**宝箱专属**（第三批头饰里的 37 款）不在这里：
 * 它们能开出来，但**金币买不到**——"宝箱出的东西就得开箱拿"。
 * 售价：
 * - 宝箱池那批看 `COIN_PRICE_BY_STARS`（1★ ¥200 / 2★ ¥450 / 3★ ¥900）；
 * - 专属形象看 `COIN_SKIN_PRICE_BY_STARS`（1★ ¥800 / 2★ ¥1800 / 3★ ¥3600）。
 */
export const COIN_SHOP: { id: string; price: number }[] = ITEMS.filter(
  (i) => i.source === 'coin' || (i.source === 'gacha' && i.stars <= 3),
).map((i) => ({
  id: i.id,
  price:
    i.source === 'coin'
      ? (COIN_EXCLUSIVE_PRICE_BY_STARS[i.stars] ?? 3600)
      : (COIN_PRICE_BY_STARS[i.stars] ?? 900),
}));

/** 金币商店的商品（带物品对象，界面直接用） */
export const COIN_SHOP_ITEMS: { item: Item; price: number }[] = COIN_SHOP.map((e) => ({
  item: ITEMS.find((i) => i.id === e.id)!,
  price: e.price,
})).filter((e) => !!e.item);

/** 某件金币商品的价格（不在售时返回 0） */
export function coinPriceOf(id: string): number {
  return COIN_SHOP.find((e) => e.id === id)?.price ?? 0;
}

// ---- 开箱的「袋子档」与 🧩 星尘碎片兑换 --------------------------------------

/**
 * 每次开箱先摇一次**袋子档**：`BAG_CHANCE` 的抽**不给装扮**，改成一小袋金币
 * 或星尘碎片。这是刻意加的**占位**——「每抽必出物品」会让几百件装扮一起变廉价，
 * 有了袋子，抽到装扮才算抽到东西。
 *
 * 两个例外，避免袋子吃掉玩家的盼头：
 * - **保底抽**（`floor: 'epic'` 或攒够 `PITY_LIMIT`）**不走袋子**；
 * - 袋子抽照样给 `pity` 计数 +1（所以保底不会被拖慢）。
 */
export const BAG_CHANCE = 0.2;
/** 袋子档里给**金币袋**的概率，剩下的是碎片袋 */
export const BAG_COIN_SHARE = 0.45;
/** 金币袋：`COIN_BAG_MIN` ~ `COIN_BAG_MIN + COIN_BAG_RANGE`（≈ 一件 1★ 的金币商店价） */
export const COIN_BAG_MIN = 120;
export const COIN_BAG_RANGE = 120;
/** 碎片袋：`SHARD_BAG_MIN` ~ `SHARD_BAG_MIN + SHARD_BAG_RANGE` */
export const SHARD_BAG_MIN = 9;
export const SHARD_BAG_RANGE = 12;

/** 碎片袋的期望产出 ≈ 15 🧩/袋，下面的定价按「几袋能换一件」定 */
export const SHARD_SHOP: { id: string; price: number }[] = [
  { id: 'aura:shardglow', price: 60 },
  { id: 'ring:shardring', price: 60 },
  { id: 'effect:shardpop', price: 90 },
  { id: 'back:shardcape', price: 100 },
  { id: 'swingTrail:shardedge', price: 110 },
  { id: 'hat:shardCrown', price: 120 },
];

/** 碎片兑换的商品（带物品对象，界面直接用） */
export const SHARD_SHOP_ITEMS: { item: Item; price: number }[] = SHARD_SHOP.map((e) => ({
  item: ITEMS.find((i) => i.id === e.id)!,
  price: e.price,
})).filter((e) => !!e.item);

/** 某件碎片商品的价格（不在清单里返回 0） */
export function shardPriceOf(id: string): number {
  return SHARD_SHOP.find((e) => e.id === id)?.price ?? 0;
}

/** every hatching pet (the "none" placeholder is not hatchable) */
export const PETS = ITEMS.filter((i) => i.slot === 'pet' && i.ref !== 'none');

/** 理发店（大地图上的外观自定义）：进门一次的花费（金币） */
export const BARBER_COST = 100;
/** 宝箱的史诗保底：连着这么多次没出史诗+，下一次强制史诗+ */
export const PITY_LIMIT = 10;

// ---- 材料（采集类产出）-------------------------------------------------------
/**
 * 采集玩法（棉花 / 矿石 / 鱼）**不再直接给金币**，而是给这些材料，
 * 拉回赚钱区交给**农场主**（`game/world/npcs.ts` 里那位收购商）才换钱。
 *
 * `price` 是农场主的收购单价（鱼按各自的 `value`，不进这张表）：
 * 棉花一朵 **¥5**、矿石一个 ¥8——棉花一片地能收的量比矿多得多，所以单价压低。
 */
export const MATERIALS = {
  cotton: { name: '棉花', emoji: '🧵', price: 5 },
  ore: { name: '矿石', emoji: '🪨', price: 8 },
} as const;

export type MaterialId = keyof typeof MATERIALS;
/**
 * 采摘等级：等级 = 一次挥拍能同时摘下的棉花数（初始 1）。
 * 下标 i 是「从 i 级升到 i+1 级」的价格。
 */
export const FARM_MAX_LEVEL = 5;
export const FARM_UPGRADE_COST = [0, 180, 520, 1400, 3600];
/** 拖拉机：买断后可以在页面上「一键收全地」 */
export const TRACTOR_COST = 3000;

// ---- 荣誉商店 ---------------------------------------------------------------
/**
 * 荣誉点能兑换的东西：特殊角色形象 + 坐骑。
 *
 * 荣誉点只有晋级赛的冠亚季军才有（见 arena.honorForPlace），且随杯赛档位放大，
 * 所以定价刻意压得比宝箱贵：一件坐骑 ≈ 打几届中高级杯赛，传说款要打十几届。
 * 物品本身的来源标记是 'honor'，这里只管价格。
 */
export const HONOR_SHOP: { id: string; price: number }[] = [
  // --- 坐骑（纯装饰）---
  { id: 'mount:board', price: 200 },
  { id: 'mount:bubble', price: 200 },
  { id: 'mount:cloud', price: 300 },
  { id: 'mount:sword', price: 500 },
  { id: 'mount:horse', price: 500 },
  { id: 'mount:carpet', price: 600 },
  { id: 'mount:star', price: 900 },
  { id: 'mount:dragon', price: 900 },
  { id: 'mount:rocket', price: 1200 },
  { id: 'mount:throne', price: 1200 },
  // --- 角色形象 ---
  { id: 'skin:champion', price: 800 },
  { id: 'skin:phoenix', price: 1200 },
  { id: 'skin:dragonlord', price: 1600 },
];

/** 荣誉商店里的商品（按价格从低到高，界面直接用） */
export const HONOR_ITEMS: { item: Item; price: number }[] = HONOR_SHOP.map((e) => ({
  item: ITEMS.find((i) => i.id === e.id)!,
  price: e.price,
})).filter((e) => !!e.item);

/** 某件荣誉商品的价格（不是荣誉商品时返回 0） */
export function honorPriceOf(id: string): number {
  return HONOR_SHOP.find((e) => e.id === id)?.price ?? 0;
}

// ---- 发球机连击里程碑奖励 -----------------------------------------------------

/**
 * 「复古训练房」套装：连击里程碑 → 奖励物品的**固定**对照表。
 * 每档给一件为这个活动定制的同主题装扮（不进宝箱池），
 * 详情页能事先写明「这档解锁什么」；100 连击是哥斯拉 + 发球机教练（见 progress.claimMilestone）。
 */
export const MILESTONE_REWARD: Record<number, string> = {
  10: 'hat:coachcap',
  20: 'back:turbo',
  30: 'back:towel',
  40: 'aura:spotlight',
  50: 'racketSkin:wood',
  60: 'trail:neon',
  70: 'swingTrail:tempo',
  80: 'effect:pow',
  90: 'ring:courtline',
  100: 'skin:coach',
};

/**
 * 🏟 操场「跑量里程碑」：累计里程**每满 1km** 解锁一件「跑道特训」专属装备
 * （`source: 'run'`，不进任何宝箱池、金币也买不到）。
 * 累计里程与已解锁档数记在 `bmt-run-meters` / `bmt-run-claimed`，
 * 判定与发奖在 `stores/progress.ts` 的 `noteRun()`。
 */
export const RUN_KM_STEP = 1000;
export const RUN_MILESTONES: string[] = [
  'ring:runRing',
  'aura:runAura',
  'trail:runTrail',
  'swingTrail:runSwing',
  'hat:runHat',
];

/** ten draws cost 10% less than ten singles */
/** pet stars are a per-player quality, independent of the pet species */
export const PET_STAR_MAX = 5;

export const PET_STAR_META: Record<number, { label: string; color: string; dust: number }> = {
  1: { label: '1★', color: '#8b97a8', dust: 15 },
  2: { label: '2★', color: '#5aa0e8', dust: 30 },
  3: { label: '3★', color: '#3d8bfd', dust: 55 },
  4: { label: '4★', color: '#9b59d0', dust: 100 },
  5: { label: '5★', color: '#e8a33d', dust: 200 },
};

export interface PetEgg {
  id: string;
  label: string;
  cost: number;
  /** hatch weight for 1★..5★; index 0 is 1★ */
  weights: [number, number, number, number, number];
  /** description shown in the panel */
  blurb: string;
}

export const PET_EGGS: PetEgg[] = [
  {
    id: 'plain',
    label: '普通宠物蛋',
    cost: 90,
    weights: [55, 30, 12, 3, 0],
    blurb: '常见宠物，偶尔闪光',
  },
  {
    id: 'gleam',
    label: '稀有宠物蛋',
    cost: 220,
    weights: [0, 45, 33, 17, 5],
    blurb: '保底 2★，有机会出 5★',
  },
  {
    id: 'radiant',
    label: '传说宠物蛋',
    cost: 460,
    weights: [0, 0, 40, 42, 18],
    blurb: '保底 3★，高品质宠物',
  },
];

/** coins earned per finished match (weighted toward online) */
export const COIN_RULES = {
  online: { win: 40, lose: 15 },
  single: { win: 15, lose: 5 },
} as const;

export function itemById(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}

export function itemsForSlot(slot: ItemSlot): Item[] {
  return ITEMS.filter((i) => i.slot === slot);
}
