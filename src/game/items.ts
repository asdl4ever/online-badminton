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
import { PLUS_META } from './effects/plus';

export type ItemSlot =
  | 'skin'
  | 'hat'
  | 'wings'
  | 'cape'
  | 'aura'
  | 'pet'
  | 'racketSkin'
  | 'trail'
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
  /** `code` = 兑换码获得（见 progress.redeem） */
  source: 'free' | 'gacha' | 'egg' | 'streak' | 'code' | TierId;
}

export const SLOT_ORDER: ItemSlot[] = [
  'skin',
  'hat',
  'wings',
  'cape',
  'aura',
  'pet',
  'racketSkin',
  'trail',
  'effect',
];

export const SLOT_LABELS: Record<ItemSlot, string> = {
  skin: '角色形象',
  hat: '头饰',
  wings: '翅膀',
  cape: '披风',
  aura: '光环',
  pet: '宠物',
  racketSkin: '球拍皮肤',
  trail: '击球拖尾',
  effect: '命中特效',
};

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

export const ITEMS: Item[] = [
  // --- character skin (special: earned by machine-mode combo milestones) ---
  it('skin', 'none', '默认', 'common', 1, 'free'),
  it('skin', 'godzilla', '哥斯拉', 'legendary', 5, 'streak'),
  it('skin', 'ubear', 'U熊', 'legendary', 5, 'code'),
  it('skin', 'laopi', '老皮', 'legendary', 5, 'code'),
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

  // --- wings ---
  it('wings', 'none', '无', 'common', 1, 'free'),
  it('wings', 'light', '光羽', 'rare', 3, 'gacha'),
  it('wings', 'neon', '霓虹', 'rare', 3, 'gacha'),
  it('wings', 'leaf', '叶翼', 'rare', 3, 'gacha'),
  it('wings', 'bone', '骨翼', 'rare', 3, 'gacha'),
  it('wings', 'tide', '潮汐', 'rare', 3, 'gacha'),
  it('wings', 'ember', '余烬', 'rare', 3, 'gacha'),
  it('wings', 'manta', '蝠鲼', 'rare', 3, 'gacha'),
  it('wings', 'reef', '珊瑚', 'rare', 3, 'gacha'),
  it('wings', 'silk', '丝绸', 'rare', 3, 'gacha'),
  it('wings', 'spike', '尖刺', 'rare', 3, 'gacha'),
  it('wings', 'frost', '冰晶', 'epic', 4, 'gacha'),
  it('wings', 'crystal', '水晶', 'epic', 4, 'gacha'),
  it('wings', 'flame', '烈焰', 'epic', 4, 'gacha'),
  it('wings', 'mech', '机械', 'epic', 4, 'gacha'),
  it('wings', 'butterfly', '蝶翼', 'epic', 4, 'gacha'),
  it('wings', 'fairy', '精灵', 'epic', 4, 'gacha'),
  it('wings', 'cyber', '赛博', 'epic', 4, 'gacha'),
  it('wings', 'shadow', '影翼', 'epic', 4, 'gacha'),
  it('wings', 'blade', '刃翼', 'epic', 4, 'gacha'),
  it('wings', 'crest', '冠鳍', 'epic', 4, 'gacha'),
  it('wings', 'wave', '潮浪', 'epic', 4, 'gacha'),
  it('wings', 'aurora', '极光', 'epic', 4, 'gacha'),
  it('wings', 'thorn', '荆棘', 'epic', 4, 'gacha'),
  it('wings', 'shard', '刃簇', 'epic', 4, 'gacha'),
  it('wings', 'thunder', '雷霆', 'legendary', 5, 'gacha'),
  it('wings', 'dragon', '龙翼', 'legendary', 5, 'gacha'),
  it('wings', 'angel', '天使', 'legendary', 5, 'gacha'),
  it('wings', 'demon', '恶魔', 'legendary', 5, 'gacha'),
  it('wings', 'star', '星辰', 'legendary', 5, 'gacha'),
  it('wings', 'phoenix', '凤凰', 'legendary', 5, 'gacha'),
  it('wings', 'rainbow', '虹翼', 'legendary', 5, 'gacha'),
  it('wings', 'galaxy', '星河', 'legendary', 5, 'gacha'),
  it('wings', 'paper', '纸翼', 'legendary', 5, 'gacha'),
  it('wings', 'comet', '彗尾', 'legendary', 5, 'gacha'),
  it('wings', 'glow', '流光', 'legendary', 5, 'gacha'),
  it('wings', 'quartz', '晶簇', 'legendary', 5, 'gacha'),
  it('wings', 'dragonfly', '蜻蜓', 'rare', 3, 'gacha'),
  it('wings', 'moth', '蛾翼', 'rare', 3, 'gacha'),
  it('wings', 'leafyWing', '藤叶', 'rare', 3, 'gacha'),
  it('wings', 'emberWing', '余烬', 'rare', 3, 'gacha'),
  it('wings', 'toxicWing', '剧毒', 'rare', 3, 'gacha'),
  it('wings', 'seaWave', '海波', 'epic', 4, 'gacha'),
  it('wings', 'ribbonDance', '飘带', 'epic', 4, 'gacha'),
  it('wings', 'crystalShard', '碎晶', 'epic', 4, 'gacha'),
  it('wings', 'mechWing', '机甲', 'epic', 4, 'gacha'),
  it('wings', 'sail', '风帆', 'epic', 4, 'gacha'),
  it('wings', 'featherStorm', '羽暴', 'epic', 4, 'gacha'),
  it('wings', 'holyWing', '圣羽', 'legendary', 5, 'gacha'),
  it('wings', 'devilWing', '魔翼', 'legendary', 5, 'gacha'),
  it('wings', 'sailStar', '星帆', 'legendary', 5, 'gacha'),
  it('wings', 'shine', '圣光', 'legendary', 5, 'god'),
  it('wings', 'prism', '棱光', 'legendary', 5, 'gacha'),
  it('wings', 'stormcall', '雷暴', 'epic', 4, 'gacha'),
  it('wings', 'auroraBore', '极夜', 'epic', 4, 'gacha'),
  it('wings', 'mothKing', '蛾皇', 'epic', 4, 'gacha'),
  it('wings', 'abyss', '深渊', 'epic', 4, 'gacha'),
  it('wings', 'sunfire', '日炎', 'epic', 4, 'gacha'),
  it('wings', 'moonveil', '月帘', 'rare', 3, 'gacha'),
  it('wings', 'gearsoul', '齿魂', 'epic', 4, 'gacha'),
  it('wings', 'glacier', '冰河', 'epic', 4, 'gacha'),
  it('wings', 'rosewing', '玫瑰', 'rare', 3, 'gacha'),
  it('wings', 'cirrus', '云羽', 'rare', 3, 'gacha'),
  it('wings', 'plasmaWing', '等离子', 'epic', 4, 'gacha'),
  it('wings', 'ghostWing', '幽翼', 'epic', 4, 'gacha'),
  it('wings', 'solaris', '烈阳', 'legendary', 5, 'gacha'),
  it('wings', 'nightjar', '夜鹰', 'epic', 4, 'gacha'),
  it('wings', 'coralFin', '珊瑚鳍', 'rare', 3, 'gacha'),
  it('wings', 'bambooLeaf', '竹叶', 'rare', 3, 'gacha'),
  it('wings', 'fireflyWing', '流萤', 'rare', 3, 'gacha'),
  it('wings', 'obsidian', '黑曜', 'legendary', 5, 'gacha'),
  it('wings', 'chrono', '时空', 'legendary', 5, 'gacha'),

  // --- cape ---
  it('cape', 'none', '无', 'common', 1, 'free'),
  it('cape', 'hero', '英雄披风', 'rare', 3, 'gacha'),
  it('cape', 'storm', '风暴披风', 'rare', 3, 'gacha'),
  it('cape', 'leaf', '藤叶披风', 'rare', 3, 'gacha'),
  it('cape', 'frost', '冰晶披风', 'rare', 3, 'gacha'),
  it('cape', 'dragon', '龙鳞披风', 'rare', 3, 'gacha'),
  it('cape', 'shadow', '暗影披风', 'epic', 4, 'gacha'),
  it('cape', 'ember', '烈焰披风', 'epic', 4, 'gacha'),
  it('cape', 'royal', '王袍', 'epic', 4, 'king'),
  it('cape', 'angel', '天使之翼披风', 'epic', 4, 'gacha'),
  it('cape', 'void', '虚空披风', 'legendary', 5, 'gacha'),
  it('cape', 'phoenix', '凤凰披风', 'legendary', 5, 'gacha'),
  it('cape', 'knight', '骑士披风', 'rare', 3, 'gacha'),
  it('cape', 'ninja', '忍者披风', 'rare', 3, 'gacha'),
  it('cape', 'winter', '冬雪披风', 'rare', 3, 'gacha'),
  it('cape', 'autumn', '秋叶披风', 'rare', 3, 'gacha'),
  it('cape', 'ocean', '海涛披风', 'rare', 3, 'gacha'),
  it('cape', 'mage', '法袍', 'epic', 4, 'gacha'),
  it('cape', 'starCape', '星辰披风', 'epic', 4, 'gacha'),
  it('cape', 'dragonfire', '龙炎披风', 'epic', 4, 'gacha'),
  it('cape', 'voidCape', '虚空披风', 'legendary', 5, 'gacha'),
  it('cape', 'goldRoyal', '鎏金王袍', 'legendary', 5, 'gacha'),
  it('cape', 'auroraCape', '极光披风', 'rare', 3, 'gacha'),
  it('cape', 'stormlord', '雷君披风', 'epic', 4, 'gacha'),
  it('cape', 'sakuraCape', '樱吹雪', 'rare', 3, 'gacha'),
  it('cape', 'ironclad', '铁甲披风', 'epic', 4, 'gacha'),
  it('cape', 'pharaoh', '法老圣袍', 'legendary', 5, 'gacha'),
  it('cape', 'emberwind', '烬风披风', 'rare', 3, 'gacha'),
  it('cape', 'abyssCape', '深渊披风', 'epic', 4, 'gacha'),
  it('cape', 'jadeRobe', '翡翠长袍', 'epic', 4, 'gacha'),
  it('cape', 'plaguecoat', '瘟疫大衣', 'rare', 3, 'gacha'),
  it('cape', 'captainCape', '船长披风', 'rare', 3, 'gacha'),
  it('cape', 'stardust', '星尘披风', 'epic', 4, 'gacha'),
  it('cape', 'warlord', '战神披风', 'epic', 4, 'gacha'),
  it('cape', 'frostlord', '冰侯披风', 'rare', 3, 'gacha'),
  it('cape', 'venomCape', '毒液披风', 'rare', 3, 'gacha'),
  it('cape', 'cometCape', '彗星披风', 'legendary', 5, 'gacha'),
  it('cape', 'thunderCape', '迅雷披风', 'epic', 4, 'gacha'),
  it('cape', 'mooncloak', '月光纱', 'rare', 3, 'gacha'),
  it('cape', 'crimsonlord', '绯红王袍', 'legendary', 5, 'gacha'),
  it('cape', 'voidwalker', '虚行者', 'epic', 4, 'gacha'),
  it('cape', 'goldenflame', '金焰披风', 'legendary', 5, 'gacha'),

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
];

export const GACHA_POOL = ITEMS.filter((i) => i.source === 'gacha');

/** every hatching pet (the "none" placeholder is not hatchable) */
export const PETS = ITEMS.filter((i) => i.slot === 'pet' && i.ref !== 'none');

/** 理发店（大地图上的外观自定义）：进门一次的花费 */
export const BARBER_COST = 100;
export const CHEST_COST = 400;
export const PITY_LIMIT = 10;

/** ten draws cost 10% less than ten singles */
export const TEN_PULL_COST = Math.round(CHEST_COST * 10 * 0.9);

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
