/**
 * Purely visual player customisation. None of this touches the simulation, so
 * it is safe to send over the wire and render differently per client.
 *
 * Unlocks / rarity live in items.ts; this file only defines the shape of a
 * look and how each value renders.
 */

export type HitStyle =
  | 'ring'
  | 'spark'
  | 'slash'
  | 'burst'
  | 'shock'
  | 'frost'
  | 'petal'
  | 'lightning'
  | 'star'
  | 'prism'
  | 'vortex'
  | 'shards'
  | 'ripple'
  | 'confetti'
  | 'cross'
  | 'hex'
  | 'spiral'
  | 'web'
  | 'bubble'
  | 'feather'
  | 'comet'
  | 'shatter'
  | 'smoke'
  | 'sonic'
  | 'gear'
  | 'nova'
  | 'rune'
  | 'bomb'
  | 'flamenova'
  | 'icicle'
  | 'sword'
  | 'claw'
  | 'meteor'
  | 'beam'
  | 'poison'
  | 'note'
  | 'heart'
  | 'coin'
  | 'dice'
  | 'arrow'
  | 'shield'
  | 'chain'
  | 'thorn'
  | 'blossom'
  | 'cube'
  | 'pyramid'
  | 'aim'
  | 'sonar'
  | 'wind'
  | 'sand'
  | 'acid'
  | 'sun'
  | 'moon'
  | 'eye'
  | 'portal'
  | 'dna'
  | 'atom'
  | 'sparkle'
  | 'ink'
  | 'firework'
  | 'ringburst'
  | 'swordcross'
  | 'shuriken'
  | 'boulder'
  | 'quake'
  | 'tornado'
  | 'blizzard'
  | 'volcano'
  | 'tsunami'
  | 'aurora'
  | 'starlight'
  | 'galaxy'
  | 'blackhole'
  | 'meteorrain'
  | 'rainbow'
  | 'laser'
  | 'plasma'
  | 'magnet'
  | 'foam'
  | 'leafstorm'
  | 'sakura'
  | 'mushroom'
  | 'pixelate'
  | 'glitch'
  | 'binary'
  | 'ringdance'
  | 'butterfly'
  | 'phantom'
  | 'holy'
  | 'thorncrown'
  | 'tide'
  | 'starfall'
  | 'prismfan'
  | PlusEffectId;

export type WingId =
  | 'none'
  | 'light'
  | 'frost'
  | 'flame'
  | 'thunder'
  | 'shine'
  | 'butterfly'
  | 'dragon'
  | 'angel'
  | 'demon'
  | 'mech'
  | 'neon'
  | 'star'
  | 'crystal'
  | 'phoenix'
  | 'fairy'
  | 'cyber'
  | 'leaf'
  | 'shadow'
  | 'rainbow'
  | 'galaxy'
  | 'bone'
  | 'paper'
  | 'blade'
  | 'tide'
  | 'ember'
  | 'manta'
  | 'reef'
  | 'crest'
  | 'wave'
  | 'aurora'
  | 'silk'
  | 'comet'
  | 'glow'
  | 'spike'
  | 'thorn'
  | 'shard'
  | 'quartz'
  | 'dragonfly'
  | 'moth'
  | 'seaWave'
  | 'ribbonDance'
  | 'crystalShard'
  | 'holyWing'
  | 'devilWing'
  | 'mechWing'
  | 'leafyWing'
  | 'emberWing'
  | 'sail'
  | 'sailStar'
  | 'featherStorm'
  | 'toxicWing'
  | 'prism'
  | 'stormcall'
  | 'auroraBore'
  | 'mothKing'
  | 'abyss'
  | 'sunfire'
  | 'moonveil'
  | 'gearsoul'
  | 'glacier'
  | 'rosewing'
  | 'cirrus'
  | 'plasmaWing'
  | 'ghostWing'
  | 'solaris'
  | 'nightjar'
  | 'coralFin'
  | 'bambooLeaf'
  | 'fireflyWing'
  | 'obsidian'
  | 'chrono';

export type CapeId =
  | 'none'
  | 'hero'
  | 'shadow'
  | 'storm'
  | 'ember'
  | 'frost'
  | 'leaf'
  | 'royal'
  | 'void'
  | 'dragon'
  | 'angel'
  | 'phoenix'
  | 'knight'
  | 'mage'
  | 'ninja'
  | 'winter'
  | 'autumn'
  | 'ocean'
  | 'starCape'
  | 'voidCape'
  | 'goldRoyal'
  | 'dragonfire'
  | 'auroraCape'
  | 'stormlord'
  | 'sakuraCape'
  | 'ironclad'
  | 'pharaoh'
  | 'emberwind'
  | 'abyssCape'
  | 'jadeRobe'
  | 'plaguecoat'
  | 'captainCape'
  | 'stardust'
  | 'warlord'
  | 'frostlord'
  | 'venomCape'
  | 'cometCape'
  | 'thunderCape'
  | 'mooncloak'
  | 'crimsonlord'
  | 'voidwalker'
  | 'goldenflame';

export type HatId =
  | 'none'
  | 'crown'
  | 'cap'
  | 'horn'
  | 'halo'
  | 'wizard'
  | 'santa'
  | 'ninja'
  | 'flower'
  | 'headphone'
  | 'topHat'
  | 'viking'
  | 'pirate'
  | 'chef'
  | 'astro'
  | 'mushroom'
  | 'beanie'
  | 'antler'
  | 'jester'
  | 'sombrero'
  | 'samurai'
  | 'foxMask'
  | 'frostCrown'
  | 'flameCrown'
  | 'witch'
  | 'beret'
  | 'vr'
  | 'sunCrown'
  | 'plague'
  | 'graduation'
  | 'propeller'
  | 'jelly'
  | 'oni'
  | 'snorkel'
  | 'thornCrown'
  | 'raincloud'
  | 'featherCrest'
  | 'captain'
  | 'catEars'
  | 'dragonHelm';

export type PetId =
  | 'none'
  | 'orb'
  | 'bird'
  | 'cat'
  | 'dragon'
  | 'fairy'
  | 'skull'
  | 'fox'
  | 'robot'
  | 'star'
  | 'flame'
  | 'ghost';

export type TrailId =
  | 'none'
  | 'classic'
  | 'fire'
  | 'ice'
  | 'rainbow'
  | 'electric'
  | 'leaf'
  | 'void'
  | 'gold'
  | 'pixel';

/**
 * 挥拍拖尾：球拍挥动时那条弧线的风格。和「击球拖尾」（球飞行的拖尾）是
 * 两个独立部位——`none` 时回退成按挥拍速度上色的普通弧线。
 */
export type SwingTrailId =
  | 'none'
  | 'slash'
  | 'shock'
  | 'cyclone'
  | 'afterimage'
  | 'bolt'
  | 'blaze'
  | 'frostbite'
  | 'orbit'
  | 'wave'
  | 'thorn'
  | 'prism'
  | 'voidcut';

/** 地环：显示在角色脚下的装饰环（积分荣誉奖励） */
export type RingId =
  | 'none'
  | 'sprout'
  | 'bamboo'
  | 'dawn'
  | 'gale'
  | 'rock'
  | 'blaze'
  | 'sky'
  | 'legend';

export type AuraId =
  | 'none'
  | 'emerald'
  | 'rose'
  | 'violet'
  | 'king'
  | 'frost'
  | 'gold'
  | 'toxic'
  | 'crimson'
  | 'rainbow'
  | 'flame'
  | 'electric'
  | 'snow'
  | 'bubble'
  | 'orbit'
  | 'gear'
  | 'holy'
  | 'venom'
  | 'sakura'
  | 'void'
  | 'pixel'
  | 'storm'
  | 'aurora'
  | 'lava'
  | 'ghost'
  | 'neon'
  | 'prism'
  | 'thorn'
  | 'chain'
  | 'plume'
  | 'coin'
  | 'note'
  | 'heart'
  | 'skull'
  | 'sparkle'
  | 'moon'
  | 'sun'
  | 'clock'
  | 'ring'
  | 'wind'
  | 'sand'
  | 'rune'
  | 'hex'
  | 'radar'
  | 'tide'
  | 'matrix'
  | 'firefly'
  | 'vortex'
  | 'nebula'
  | 'eclipse'
  | 'dawn'
  | 'dusk'
  | 'mist'
  | 'thundercloud'
  | 'golddust'
  | 'frostbite'
  | 'ember'
  | 'sparkstorm'
  | 'leafwind'
  | 'petalrain'
  | 'snowstorm'
  | 'runering'
  | 'starfield'
  | 'haloRing'
  | 'hexflame'
  | 'bubblefield'
  | 'prismatic'
  | 'spring'
  | 'autumn'
  | 'voidRift'
  | 'blackhole'
  | 'supernova'
  | 'quantum'
  | 'laserscan'
  | 'holo'
  | 'crystalline'
  | 'wisteria'
  | 'coral'
  | 'beacon'
  | 'spiral'
  | 'phantom'
  | 'miasma'
  | 'laurel'
  | 'emberfall'
  | 'static'
  | 'tidalwave'
  | 'sandstorm'
  | 'auroraring'
  | 'singularity'
  | 'rebirth';

export type RacketSkinId =
  | 'default'
  | 'ice'
  | 'gold'
  | 'flame'
  | 'thunder'
  | 'void'
  | 'rainbow'
  | 'neon'
  | 'circuit'
  | 'spike'
  | 'holy'
  | 'shadow'
  | 'crystal'
  | 'glitch'
  | 'bamboo'
  | 'carbon'
  | 'plasma'
  | 'galaxy'
  | 'lava'
  | 'frost'
  | 'rune'
  | 'thorn'
  | 'web'
  | 'vine'
  | 'mirror'
  | 'matrix'
  | 'bone'
  | 'zebra'
  | 'camo'
  | 'star'
  | 'scale'
  | 'smoke'
  | 'aurora'
  | 'nebula'
  | 'onyx'
  | 'ivory'
  | 'amber'
  | 'jade'
  | 'ruby'
  | 'sapphire'
  | 'toxic'
  | 'ember'
  | 'quantum'
  | 'obsidian'
  | 'sunsteel'
  | 'moonlace'
  | 'rosebranch'
  | 'starpiercer'
  | 'tsunami'
  | 'magma'
  | 'stormline'
  | 'phoenixF'
  | 'dragonbone'
  | 'iceberg'
  | 'goldthread'
  | 'coralrim'
  | 'chrono'
  | 'holo'
  | 'gravity'
  | 'sonic'
  | 'willow'
  | 'blossom';

/** 角色形象：默认小人 / 哥斯拉 / U熊（大肚皮）/ 老皮（两个钢铁屁股，球弹上去会被弹开） */
export type CharacterSkin = 'none' | 'godzilla' | 'ubear' | 'laopi';
const SKIN_IDS: CharacterSkin[] = ['none', 'godzilla', 'ubear', 'laopi'];

export interface Cosmetic {
  /** whole-body character form (the streak-100 Godzilla, else 'none') */
  characterSkin: CharacterSkin;
  emoji: string;
  racket: number;
  trail: number;
  effect: HitStyle;
  wings: WingId;
  cape: CapeId;
  aura: AuraId;
  hat: HatId;
  /** 脚下的地环装饰 */
  ring: RingId;
  pet: PetId;
  /** quality of the equipped pet, 1–5 (ignored when pet is 'none') */
  petStar: number;
  racketSkin: RacketSkinId;
  trailStyle: TrailId;
  /** 挥拍时那条弧线的风格（与球拖尾独立） */
  swingTrail: SwingTrailId;
}

/** the 100 generated "plus" hit styles: p1..p100 (see effects/plus.ts) */
export type PlusEffectId = `p${number}`;
export const PLUS_EFFECT_IDS: PlusEffectId[] = Array.from({ length: 100 }, (_, i): PlusEffectId => `p${i + 1}`);

const HIT_STYLE_IDS: HitStyle[] = [
  'ring', 'spark', 'slash', 'burst', 'shock', 'frost', 'petal', 'lightning', 'star', 'prism', 'vortex',
  'shards', 'ripple', 'confetti', 'cross', 'hex', 'spiral', 'web', 'bubble', 'feather', 'comet', 'shatter', 'smoke', 'sonic', 'gear', 'nova', 'rune',
  'bomb', 'flamenova', 'icicle', 'sword', 'claw', 'meteor', 'beam', 'poison', 'note', 'heart', 'coin', 'dice', 'arrow', 'shield', 'chain', 'thorn', 'blossom', 'cube', 'pyramid', 'aim', 'sonar', 'wind', 'sand', 'acid', 'sun', 'moon', 'eye', 'portal', 'dna', 'atom', 'sparkle', 'ink',
  'firework', 'ringburst', 'swordcross', 'shuriken', 'boulder', 'quake', 'tornado', 'blizzard', 'volcano', 'tsunami', 'aurora', 'starlight', 'galaxy', 'blackhole', 'meteorrain', 'rainbow', 'laser', 'plasma', 'magnet', 'foam', 'leafstorm', 'sakura', 'mushroom', 'pixelate', 'glitch', 'binary', 'ringdance', 'butterfly', 'phantom', 'holy', 'thorncrown', 'tide', 'starfall', 'prismfan',
  ...PLUS_EFFECT_IDS,
];
const WING_IDS: WingId[] = [
  'none', 'light', 'frost', 'flame', 'thunder', 'shine', 'butterfly', 'dragon', 'angel', 'demon', 'mech', 'neon', 'star', 'crystal',
  'phoenix', 'fairy', 'cyber', 'leaf', 'shadow', 'rainbow', 'galaxy', 'bone', 'paper', 'blade', 'tide', 'ember',
  'manta', 'reef', 'crest', 'wave', 'aurora', 'silk', 'comet', 'glow', 'spike', 'thorn', 'shard', 'quartz',
  'dragonfly', 'moth', 'seaWave', 'ribbonDance', 'crystalShard', 'holyWing', 'devilWing', 'mechWing', 'leafyWing', 'emberWing', 'sail', 'sailStar', 'featherStorm', 'toxicWing',
  'prism', 'stormcall', 'auroraBore', 'mothKing', 'abyss', 'sunfire', 'moonveil', 'gearsoul', 'glacier', 'rosewing', 'cirrus', 'plasmaWing', 'ghostWing', 'solaris', 'nightjar',
  'coralFin', 'bambooLeaf', 'fireflyWing', 'obsidian', 'chrono',
];
const CAPE_IDS: CapeId[] = [
  'none', 'hero', 'shadow', 'storm', 'ember', 'frost', 'leaf', 'royal', 'void', 'dragon', 'angel', 'phoenix',
  'knight', 'mage', 'ninja', 'winter', 'autumn', 'ocean', 'starCape', 'voidCape', 'goldRoyal', 'dragonfire',
  'auroraCape', 'stormlord', 'sakuraCape', 'ironclad', 'pharaoh', 'emberwind', 'abyssCape', 'jadeRobe', 'plaguecoat',
  'captainCape', 'stardust', 'warlord', 'frostlord', 'venomCape', 'cometCape', 'thunderCape', 'mooncloak',
  'crimsonlord', 'voidwalker', 'goldenflame',
];
const HAT_IDS: HatId[] = [
  'none', 'crown', 'cap', 'horn', 'halo', 'wizard', 'santa', 'ninja', 'flower', 'headphone', 'topHat', 'viking',
  'pirate', 'chef', 'astro', 'mushroom', 'beanie', 'antler', 'jester', 'sombrero',
  'samurai', 'foxMask', 'frostCrown', 'flameCrown', 'witch', 'beret', 'vr', 'sunCrown', 'plague', 'graduation',
  'propeller', 'jelly', 'oni', 'snorkel', 'thornCrown', 'raincloud', 'featherCrest', 'captain', 'catEars', 'dragonHelm',
];
const PET_IDS: PetId[] = [
  'none', 'orb', 'bird', 'cat', 'dragon', 'fairy', 'skull', 'fox', 'robot', 'star', 'flame', 'ghost',
];
const TRAIL_IDS: TrailId[] = [
  'none', 'classic', 'fire', 'ice', 'rainbow', 'electric', 'leaf', 'void', 'gold', 'pixel',
];
const SWING_TRAIL_IDS: SwingTrailId[] = [
  'none', 'slash', 'shock', 'cyclone', 'afterimage', 'bolt', 'blaze',
  'frostbite', 'orbit', 'wave', 'thorn', 'prism', 'voidcut',
];
const RING_IDS: RingId[] = [
  'none', 'sprout', 'bamboo', 'dawn', 'gale', 'rock', 'blaze', 'sky', 'legend',
];

/** 地环配色（跟着组别走） */
export const RING_COLORS: Record<RingId, number> = {
  none: 0x000000,
  sprout: 0x7ed957,
  bamboo: 0xa9b4c2,
  dawn: 0xd8a534,
  gale: 0x7fd4c4,
  rock: 0x6fe3ff,
  blaze: 0x7c5cff,
  sky: 0xffb020,
  legend: 0xff5a5a,
};
const AURA_IDS: AuraId[] = [
  'none', 'emerald', 'rose', 'violet', 'king', 'frost', 'gold', 'toxic', 'crimson', 'rainbow',
  'flame', 'electric', 'snow', 'bubble', 'orbit', 'gear', 'holy', 'venom', 'sakura', 'void', 'pixel', 'storm',
  'aurora', 'lava', 'ghost', 'neon', 'prism', 'thorn', 'chain', 'plume', 'coin', 'note', 'heart', 'skull', 'sparkle', 'moon', 'sun', 'clock', 'ring', 'wind', 'sand', 'rune', 'hex', 'radar', 'tide', 'matrix',
  'firefly', 'vortex', 'nebula', 'eclipse', 'dawn', 'dusk', 'mist', 'thundercloud', 'golddust', 'frostbite', 'ember', 'sparkstorm', 'leafwind', 'petalrain', 'snowstorm', 'runering', 'starfield', 'haloRing', 'hexflame', 'bubblefield', 'prismatic', 'spring', 'autumn', 'voidRift',
  'blackhole', 'supernova', 'quantum', 'laserscan', 'holo', 'crystalline', 'wisteria', 'coral', 'beacon', 'spiral',
  'phantom', 'miasma', 'laurel', 'emberfall', 'static', 'tidalwave', 'sandstorm', 'auroraring', 'singularity', 'rebirth',
];
const RACKET_SKIN_IDS: RacketSkinId[] = [
  'default', 'ice', 'gold', 'flame', 'thunder', 'void', 'rainbow', 'neon',
  'circuit', 'spike', 'holy', 'shadow', 'crystal', 'glitch', 'bamboo', 'carbon',
  'plasma', 'galaxy', 'lava', 'frost', 'rune', 'thorn', 'web', 'vine', 'mirror', 'matrix', 'bone', 'zebra', 'camo', 'star', 'scale', 'smoke',
  'aurora', 'nebula', 'onyx', 'ivory', 'amber', 'jade', 'ruby', 'sapphire', 'toxic', 'ember',
  'quantum', 'obsidian', 'sunsteel', 'moonlace', 'rosebranch', 'starpiercer', 'tsunami', 'magma', 'stormline', 'phoenixF',
  'dragonbone', 'iceberg', 'goldthread', 'coralrim', 'chrono', 'holo', 'gravity', 'sonic', 'willow', 'blossom',
];

export const WING_COLORS: Record<WingId, number> = {
  none: 0x000000,
  light: 0xf2f6ff,
  frost: 0x9fe8ff,
  flame: 0xff7a2a,
  thunder: 0x7fd4ff,
  shine: 0xffe89a,
  butterfly: 0xff8ad4,
  dragon: 0x53e0a0,
  angel: 0xfff2c4,
  demon: 0xc23bff,
  mech: 0x9aa7b8,
  neon: 0x39ffd0,
  star: 0xffd45c,
  crystal: 0x66e0ff,
  phoenix: 0xff5a2a,
  fairy: 0xc9f0ff,
  cyber: 0x39ffd0,
  leaf: 0x7ed957,
  shadow: 0x6a3fb0,
  rainbow: 0xff6ad4,
  galaxy: 0x8f7bff,
  bone: 0xe8e0cf,
  paper: 0xfff4d6,
  blade: 0xdfe8f5,
  tide: 0x3fa9e0,
  ember: 0xff9a3c,
  manta: 0x3fbfc9,
  reef: 0xff8fa0,
  crest: 0xffd45c,
  wave: 0x5ad0ff,
  aurora: 0x7dffc4,
  silk: 0xffd9ec,
  comet: 0xffe9a8,
  glow: 0xa0ffd8,
  spike: 0xb8c4d6,
  thorn: 0x8fbf5a,
  shard: 0x9fe8ff,
  quartz: 0xd9c9ff,
  dragonfly: 0x7fffd4,
  moth: 0xd8c8a0,
  seaWave: 0x4ab8e8,
  ribbonDance: 0xffaad4,
  crystalShard: 0xa8e8ff,
  holyWing: 0xfff6d0,
  devilWing: 0xb02a4a,
  mechWing: 0x7f8fa8,
  leafyWing: 0x6fcf5a,
  emberWing: 0xff8a3c,
  sail: 0xf0e8d8,
  sailStar: 0xffe9a8,
  featherStorm: 0xe8f0ff,
  toxicWing: 0x9cff3a,
  prism: 0xffe8ff,
  stormcall: 0xffe15c,
  auroraBore: 0x9ad4ff,
  mothKing: 0xd8b070,
  abyss: 0x2a4a8a,
  sunfire: 0xffc247,
  moonveil: 0xe8f0ff,
  gearsoul: 0xb0903a,
  glacier: 0xbfe8ff,
  rosewing: 0xff6f91,
  cirrus: 0xdcf4ff,
  plasmaWing: 0xff3bd4,
  ghostWing: 0xdfe8ff,
  solaris: 0xffd45c,
  nightjar: 0x4a5a8a,
  coralFin: 0xff8fa0,
  bambooLeaf: 0x9fd95a,
  fireflyWing: 0xfff2a0,
  obsidian: 0x3a3a4a,
  chrono: 0xb46cff,
};

/** which silhouette a wing draws with; lets styles look genuinely different */
export type WingKind =
  | 'feather'
  | 'membrane'
  | 'butterfly'
  | 'mech'
  | 'crystal'
  | 'flame'
  | 'blade'
  | 'leaf'
  | 'fin'
  | 'ribbon'
  | 'spike'
  | 'sail'
  | 'ghost'
  | 'circuit';

/** per-wing silhouette so different wings actually look different */
export const WING_SHAPE: Record<
  WingId,
  { kind: WingKind; feathers: number; len: number; spread: number; w: number }
> = {
  none: { kind: 'feather', feathers: 0, len: 0, spread: 0, w: 0 },
  light: { kind: 'feather', feathers: 3, len: 52, spread: 0.55, w: 7 },
  frost: { kind: 'crystal', feathers: 4, len: 48, spread: 0.5, w: 6 },
  flame: { kind: 'flame', feathers: 3, len: 58, spread: 0.62, w: 8 },
  thunder: { kind: 'blade', feathers: 4, len: 60, spread: 0.7, w: 7 },
  shine: { kind: 'feather', feathers: 5, len: 58, spread: 0.78, w: 8 },
  butterfly: { kind: 'butterfly', feathers: 2, len: 46, spread: 0.95, w: 13 },
  dragon: { kind: 'membrane', feathers: 5, len: 68, spread: 0.5, w: 10 },
  angel: { kind: 'feather', feathers: 4, len: 62, spread: 0.66, w: 9 },
  demon: { kind: 'membrane', feathers: 4, len: 56, spread: 0.52, w: 9 },
  mech: { kind: 'mech', feathers: 3, len: 50, spread: 0.42, w: 10 },
  neon: { kind: 'blade', feathers: 3, len: 54, spread: 0.6, w: 8 },
  star: { kind: 'feather', feathers: 5, len: 64, spread: 0.82, w: 8 },
  crystal: { kind: 'crystal', feathers: 4, len: 50, spread: 0.56, w: 7 },
  phoenix: { kind: 'flame', feathers: 5, len: 66, spread: 0.6, w: 9 },
  fairy: { kind: 'butterfly', feathers: 3, len: 50, spread: 0.9, w: 11 },
  cyber: { kind: 'mech', feathers: 4, len: 56, spread: 0.5, w: 11 },
  leaf: { kind: 'leaf', feathers: 4, len: 54, spread: 0.7, w: 12 },
  shadow: { kind: 'membrane', feathers: 5, len: 60, spread: 0.46, w: 11 },
  rainbow: { kind: 'feather', feathers: 4, len: 60, spread: 0.74, w: 8 },
  galaxy: { kind: 'feather', feathers: 6, len: 64, spread: 0.86, w: 7 },
  bone: { kind: 'membrane', feathers: 3, len: 54, spread: 0.4, w: 9 },
  paper: { kind: 'butterfly', feathers: 2, len: 48, spread: 0.85, w: 14 },
  blade: { kind: 'blade', feathers: 5, len: 62, spread: 0.66, w: 6 },
  tide: { kind: 'membrane', feathers: 4, len: 58, spread: 0.58, w: 12 },
  ember: { kind: 'flame', feathers: 3, len: 50, spread: 0.56, w: 7 },
  manta: { kind: 'fin', feathers: 3, len: 62, spread: 0.5, w: 14 },
  reef: { kind: 'fin', feathers: 4, len: 54, spread: 0.62, w: 12 },
  crest: { kind: 'fin', feathers: 2, len: 58, spread: 0.42, w: 16 },
  wave: { kind: 'fin', feathers: 3, len: 56, spread: 0.7, w: 13 },
  aurora: { kind: 'ribbon', feathers: 4, len: 64, spread: 0.6, w: 8 },
  silk: { kind: 'ribbon', feathers: 3, len: 58, spread: 0.52, w: 7 },
  comet: { kind: 'ribbon', feathers: 2, len: 70, spread: 0.46, w: 9 },
  glow: { kind: 'ribbon', feathers: 4, len: 56, spread: 0.66, w: 7 },
  spike: { kind: 'spike', feathers: 6, len: 52, spread: 0.5, w: 8 },
  thorn: { kind: 'spike', feathers: 5, len: 54, spread: 0.58, w: 7 },
  shard: { kind: 'spike', feathers: 7, len: 58, spread: 0.44, w: 9 },
  quartz: { kind: 'spike', feathers: 6, len: 56, spread: 0.54, w: 8 },
  dragonfly: { kind: 'blade', feathers: 5, len: 58, spread: 0.72, w: 6 },
  moth: { kind: 'butterfly', feathers: 3, len: 50, spread: 1.0, w: 15 },
  seaWave: { kind: 'fin', feathers: 4, len: 60, spread: 0.66, w: 15 },
  ribbonDance: { kind: 'ribbon', feathers: 5, len: 62, spread: 0.58, w: 8 },
  crystalShard: { kind: 'crystal', feathers: 5, len: 54, spread: 0.6, w: 7 },
  holyWing: { kind: 'feather', feathers: 5, len: 66, spread: 0.7, w: 9 },
  devilWing: { kind: 'membrane', feathers: 5, len: 62, spread: 0.5, w: 10 },
  mechWing: { kind: 'mech', feathers: 4, len: 54, spread: 0.46, w: 11 },
  leafyWing: { kind: 'leaf', feathers: 5, len: 56, spread: 0.72, w: 12 },
  emberWing: { kind: 'flame', feathers: 4, len: 54, spread: 0.6, w: 8 },
  sail: { kind: 'sail', feathers: 1, len: 72, spread: 0.4, w: 22 },
  sailStar: { kind: 'sail', feathers: 1, len: 66, spread: 0.5, w: 20 },
  featherStorm: { kind: 'feather', feathers: 6, len: 68, spread: 0.9, w: 7 },
  toxicWing: { kind: 'membrane', feathers: 4, len: 58, spread: 0.56, w: 12 },
  prism: { kind: 'feather', feathers: 5, len: 66, spread: 0.85, w: 8 },
  stormcall: { kind: 'membrane', feathers: 5, len: 60, spread: 0.5, w: 10 },
  auroraBore: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.6, w: 8 },
  mothKing: { kind: 'butterfly', feathers: 3, len: 54, spread: 1.0, w: 16 },
  abyss: { kind: 'membrane', feathers: 5, len: 64, spread: 0.44, w: 11 },
  sunfire: { kind: 'flame', feathers: 5, len: 62, spread: 0.64, w: 9 },
  moonveil: { kind: 'ribbon', feathers: 3, len: 60, spread: 0.5, w: 7 },
  gearsoul: { kind: 'mech', feathers: 4, len: 52, spread: 0.46, w: 11 },
  glacier: { kind: 'crystal', feathers: 5, len: 56, spread: 0.58, w: 7 },
  rosewing: { kind: 'butterfly', feathers: 2, len: 48, spread: 0.9, w: 13 },
  cirrus: { kind: 'feather', feathers: 4, len: 60, spread: 0.8, w: 7 },
  plasmaWing: { kind: 'circuit', feathers: 3, len: 58, spread: 0.6, w: 9 },
  ghostWing: { kind: 'ghost', feathers: 3, len: 58, spread: 0.6, w: 10 },
  solaris: { kind: 'feather', feathers: 6, len: 66, spread: 0.9, w: 8 },
  nightjar: { kind: 'blade', feathers: 4, len: 58, spread: 0.7, w: 6 },
  coralFin: { kind: 'fin', feathers: 4, len: 56, spread: 0.6, w: 13 },
  bambooLeaf: { kind: 'leaf', feathers: 4, len: 56, spread: 0.68, w: 11 },
  fireflyWing: { kind: 'butterfly', feathers: 2, len: 44, spread: 0.95, w: 12 },
  obsidian: { kind: 'spike', feathers: 7, len: 56, spread: 0.5, w: 8 },
  chrono: { kind: 'circuit', feathers: 4, len: 56, spread: 0.55, w: 8 },
};

export type CapeKind = 'cloth' | 'flame' | 'feather' | 'tatter' | 'royal' | 'split' | 'scales' | 'streak';

export const CAPE_COLORS: Record<CapeId, number> = {
  none: 0x000000,
  hero: 0xd4542c,
  shadow: 0x4a2a7a,
  storm: 0x5f8bff,
  ember: 0xff7a2a,
  frost: 0xbfe8ff,
  leaf: 0x7ed957,
  royal: 0xb02a55,
  void: 0x7a3cc0,
  dragon: 0x53e0a0,
  angel: 0xfff2c4,
  phoenix: 0xff5a2a,
  knight: 0xc0c8d8,
  mage: 0x6a3fb0,
  ninja: 0x2a2a34,
  winter: 0xdfefff,
  autumn: 0xd08a3a,
  ocean: 0x2a7ad4,
  starCape: 0x8f7bff,
  voidCape: 0x4a2a8a,
  goldRoyal: 0xffcf5c,
  dragonfire: 0xff4a2a,
  auroraCape: 0x7dffc4,
  stormlord: 0x6f8bff,
  sakuraCape: 0xffb7d5,
  ironclad: 0x7f8fa8,
  pharaoh: 0xffd45c,
  emberwind: 0xff9a3c,
  abyssCape: 0x2a4a8a,
  jadeRobe: 0x35d6a4,
  plaguecoat: 0xd8cba0,
  captainCape: 0x2a3a5a,
  stardust: 0xfff2c4,
  warlord: 0xd4542c,
  frostlord: 0xbfe8ff,
  venomCape: 0x9cff3a,
  cometCape: 0xffe9a8,
  thunderCape: 0x8fe0ff,
  mooncloak: 0xe8f0ff,
  crimsonlord: 0xb02a55,
  voidwalker: 0x4a2a8a,
  goldenflame: 0xffd45c,
};

/** cape silhouette: length, base width and the kind of motion it uses */
export const CAPE_SHAPE: Record<CapeId, { kind: CapeKind; len: number; w: number }> = {
  none: { kind: 'cloth', len: 0, w: 0 },
  hero: { kind: 'cloth', len: 54, w: 26 },
  shadow: { kind: 'tatter', len: 56, w: 28 },
  storm: { kind: 'cloth', len: 50, w: 24 },
  ember: { kind: 'flame', len: 58, w: 26 },
  frost: { kind: 'feather', len: 52, w: 30 },
  leaf: { kind: 'feather', len: 50, w: 28 },
  royal: { kind: 'royal', len: 62, w: 32 },
  void: { kind: 'tatter', len: 60, w: 30 },
  dragon: { kind: 'cloth', len: 58, w: 30 },
  angel: { kind: 'feather', len: 56, w: 30 },
  phoenix: { kind: 'flame', len: 60, w: 28 },
  knight: { kind: 'cloth', len: 52, w: 28 },
  mage: { kind: 'royal', len: 64, w: 34 },
  ninja: { kind: 'tatter', len: 48, w: 24 },
  winter: { kind: 'feather', len: 54, w: 32 },
  autumn: { kind: 'feather', len: 52, w: 30 },
  ocean: { kind: 'cloth', len: 56, w: 28 },
  starCape: { kind: 'split', len: 62, w: 30 },
  voidCape: { kind: 'split', len: 64, w: 32 },
  goldRoyal: { kind: 'royal', len: 66, w: 34 },
  dragonfire: { kind: 'flame', len: 62, w: 30 },
  auroraCape: { kind: 'cloth', len: 58, w: 26 },
  stormlord: { kind: 'tatter', len: 60, w: 30 },
  sakuraCape: { kind: 'feather', len: 54, w: 30 },
  ironclad: { kind: 'scales', len: 58, w: 32 },
  pharaoh: { kind: 'royal', len: 64, w: 34 },
  emberwind: { kind: 'flame', len: 58, w: 26 },
  abyssCape: { kind: 'split', len: 62, w: 30 },
  jadeRobe: { kind: 'royal', len: 62, w: 32 },
  plaguecoat: { kind: 'tatter', len: 56, w: 28 },
  captainCape: { kind: 'cloth', len: 54, w: 28 },
  stardust: { kind: 'feather', len: 56, w: 30 },
  warlord: { kind: 'cloth', len: 60, w: 30 },
  frostlord: { kind: 'feather', len: 58, w: 32 },
  venomCape: { kind: 'tatter', len: 58, w: 28 },
  cometCape: { kind: 'streak', len: 64, w: 26 },
  thunderCape: { kind: 'streak', len: 60, w: 26 },
  mooncloak: { kind: 'cloth', len: 56, w: 28 },
  crimsonlord: { kind: 'royal', len: 64, w: 34 },
  voidwalker: { kind: 'split', len: 62, w: 30 },
  goldenflame: { kind: 'flame', len: 62, w: 30 },
};

export type HatKind =
  | 'crown'
  | 'cap'
  | 'horn'
  | 'halo'
  | 'wizard'
  | 'santa'
  | 'band'
  | 'flower'
  | 'phone'
  | 'top'
  | 'helm'
  | 'pirate'
  | 'chef'
  | 'astro'
  | 'mushroom'
  | 'beanie'
  | 'antler'
  | 'jester'
  | 'sombrero'
  | 'samurai'
  | 'foxMask'
  | 'frostCrown'
  | 'flameCrown'
  | 'witch'
  | 'beret'
  | 'vr'
  | 'sunCrown'
  | 'plague'
  | 'graduation'
  | 'propeller'
  | 'jelly'
  | 'oni'
  | 'snorkel'
  | 'thornCrown'
  | 'raincloud'
  | 'featherCrest'
  | 'captain'
  | 'catEars'
  | 'dragonHelm';

export const HAT_COLORS: Record<HatId, number> = {
  none: 0x000000,
  crown: 0xffcf5c,
  cap: 0x2a7ad4,
  horn: 0xd94a4a,
  halo: 0xffe89a,
  wizard: 0x6a3fb0,
  santa: 0xd42a3a,
  ninja: 0x2a2a34,
  flower: 0xff8ad4,
  headphone: 0x39ffd0,
  topHat: 0x1b1b22,
  viking: 0x9aa7b8,
  pirate: 0x3a2a1a,
  chef: 0xf2f2f2,
  astro: 0xdfefff,
  mushroom: 0xd94a4a,
  beanie: 0x3aa0a0,
  antler: 0xb98a4a,
  jester: 0x9b59d0,
  sombrero: 0xd8b070,
  samurai: 0x7a2a3a,
  foxMask: 0xe8703a,
  frostCrown: 0x9fe8ff,
  flameCrown: 0xff7a2a,
  witch: 0x3a2a5a,
  beret: 0xd42a3a,
  vr: 0x2a2a3a,
  sunCrown: 0xffd45c,
  plague: 0xd8cba0,
  graduation: 0x1b1b22,
  propeller: 0x5aa0e8,
  jelly: 0xff9adf,
  oni: 0xd42a3a,
  snorkel: 0x3aa0a0,
  thornCrown: 0x5a7a3a,
  raincloud: 0x9aa7b8,
  featherCrest: 0xff5a2a,
  captain: 0x2a3a5a,
  catEars: 0xe8a33d,
  dragonHelm: 0x53e0a0,
};

export const HAT_KIND: Record<HatId, HatKind> = {
  none: 'cap',
  crown: 'crown',
  cap: 'cap',
  horn: 'horn',
  halo: 'halo',
  wizard: 'wizard',
  santa: 'santa',
  ninja: 'band',
  flower: 'flower',
  headphone: 'phone',
  topHat: 'top',
  viking: 'helm',
  pirate: 'pirate',
  chef: 'chef',
  astro: 'astro',
  mushroom: 'mushroom',
  beanie: 'beanie',
  antler: 'antler',
  jester: 'jester',
  sombrero: 'sombrero',
  samurai: 'samurai',
  foxMask: 'foxMask',
  frostCrown: 'frostCrown',
  flameCrown: 'flameCrown',
  witch: 'witch',
  beret: 'beret',
  vr: 'vr',
  sunCrown: 'sunCrown',
  plague: 'plague',
  graduation: 'graduation',
  propeller: 'propeller',
  jelly: 'jelly',
  oni: 'oni',
  snorkel: 'snorkel',
  thornCrown: 'thornCrown',
  raincloud: 'raincloud',
  featherCrest: 'featherCrest',
  captain: 'captain',
  catEars: 'catEars',
  dragonHelm: 'dragonHelm',
};

export type PetKind = 'orb' | 'bird' | 'cat' | 'dragon' | 'fairy' | 'skull' | 'fox' | 'robot' | 'star' | 'flame' | 'ghost';

export const PET_COLORS: Record<PetId, number> = {
  none: 0x000000,
  orb: 0x9be8ff,
  bird: 0xffd45c,
  cat: 0xe8a33d,
  dragon: 0x53e0a0,
  fairy: 0xffb7d5,
  skull: 0xdfe6f0,
  fox: 0xff8a5c,
  robot: 0x9aa7b8,
  star: 0xffd45c,
  flame: 0xff7a2a,
  ghost: 0xdfe8ff,
};

export const PET_KIND: Record<PetId, PetKind> = {
  none: 'orb',
  orb: 'orb',
  bird: 'bird',
  cat: 'cat',
  dragon: 'dragon',
  fairy: 'fairy',
  skull: 'skull',
  fox: 'fox',
  robot: 'robot',
  star: 'star',
  flame: 'flame',
  ghost: 'ghost',
};

export const TRAIL_COLORS: Record<TrailId, number> = {
  none: 0x000000,
  classic: 0x6f9fce,
  fire: 0xff7a2a,
  ice: 0x9fe8ff,
  rainbow: 0xff5ad4,
  electric: 0x7fd4ff,
  leaf: 0x7ed957,
  void: 0x9b5cff,
  gold: 0xffd45c,
  pixel: 0x39ffd0,
};

/** 挥拍拖尾各风格的主色 */
export const SWING_TRAIL_COLORS: Record<SwingTrailId, number> = {
  none: 0x000000,
  slash: 0xd8ecff,
  shock: 0x8fe0ff,
  cyclone: 0x9fe8b0,
  afterimage: 0xb6a4ff,
  bolt: 0x7fd4ff,
  blaze: 0xff7a2a,
  frostbite: 0x9fe8ff,
  orbit: 0xffd45c,
  wave: 0x4dd0e1,
  thorn: 0x7ed957,
  prism: 0xff8ad4,
  voidcut: 0x9b5cff,
};

export const AURA_COLORS: Record<AuraId, number> = {
  none: 0x000000,
  emerald: 0x35d6a4,
  rose: 0xff6f91,
  violet: 0xb46cff,
  king: 0xffcf5c,
  frost: 0x8fe6ff,
  gold: 0xffc247,
  toxic: 0xa6ff3a,
  crimson: 0xff3b5c,
  rainbow: 0xff8a5c,
  flame: 0xff7a2a,
  electric: 0x8fe0ff,
  snow: 0xdcf4ff,
  bubble: 0x9be8ff,
  orbit: 0xb46cff,
  gear: 0xa9b4c2,
  holy: 0xfff2b0,
  venom: 0x9cff3a,
  sakura: 0xffb7d5,
  void: 0x7a3cc0,
  pixel: 0x39ffd0,
  storm: 0x6f8bff,
  aurora: 0x7dffc4,
  lava: 0xff7a1a,
  ghost: 0xdfe8ff,
  neon: 0x39ffd0,
  prism: 0xff9adf,
  thorn: 0x8fbf5a,
  chain: 0xc9d2de,
  plume: 0xfff0c4,
  coin: 0xffd45c,
  note: 0xc9a0ff,
  heart: 0xff6f91,
  skull: 0xdfe6f0,
  sparkle: 0xfff2a0,
  moon: 0xe8f0ff,
  sun: 0xffd45c,
  clock: 0xd8b070,
  ring: 0x8fd0ff,
  wind: 0xbfe8ff,
  sand: 0xe0c880,
  rune: 0x9be8ff,
  hex: 0xb46cff,
  radar: 0x39ff8a,
  tide: 0x5ad0ff,
  matrix: 0x4fff8a,
  firefly: 0xd8ff8a,
  vortex: 0x8f7bff,
  nebula: 0xc9a0ff,
  eclipse: 0x6a4a9a,
  dawn: 0xffb070,
  dusk: 0xff8a5c,
  mist: 0xd8e8f0,
  thundercloud: 0x8fa0c0,
  golddust: 0xffd45c,
  frostbite: 0xbfe8ff,
  ember: 0xff9a3c,
  sparkstorm: 0xfff2a0,
  leafwind: 0x7ed957,
  petalrain: 0xffb7d5,
  snowstorm: 0xf0f8ff,
  runering: 0x9be8ff,
  starfield: 0xfff2c4,
  haloRing: 0xffe89a,
  hexflame: 0x6affd0,
  bubblefield: 0x9be8ff,
  prismatic: 0xff9adf,
  spring: 0x8fe08a,
  autumn: 0xe8a33d,
  voidRift: 0x5a2a8a,
  blackhole: 0x9b5cff,
  supernova: 0xffc247,
  quantum: 0x39ffd0,
  laserscan: 0xff3b5c,
  holo: 0x7fd4ff,
  crystalline: 0xa8e8ff,
  wisteria: 0xc9a0ff,
  coral: 0xff8fa0,
  beacon: 0xffd45c,
  spiral: 0xb46cff,
  phantom: 0xdfe8ff,
  miasma: 0x9cff3a,
  laurel: 0xffcf5c,
  emberfall: 0xff9a3c,
  static: 0x8fe0ff,
  tidalwave: 0x5ad0ff,
  sandstorm: 0xd8b070,
  auroraring: 0x7dffc4,
  singularity: 0x7a3cc0,
  rebirth: 0xff5a2a,
};

export const RACKET_SKIN_COLORS: Record<RacketSkinId, number> = {
  default: 0x44586f,
  ice: 0x9fe8ff,
  gold: 0xffcf5c,
  flame: 0xff7a2a,
  thunder: 0x7fd4ff,
  void: 0x9b5cff,
  rainbow: 0xff5ad4,
  neon: 0x39ffd0,
  circuit: 0x39ffd0,
  spike: 0xff5a5a,
  holy: 0xfff0b0,
  shadow: 0x7a4ad0,
  crystal: 0x8fe0ff,
  glitch: 0xff3bd0,
  bamboo: 0x8fbf5a,
  carbon: 0x59657a,
  plasma: 0xff5ad4,
  galaxy: 0x8f7bff,
  lava: 0xff7a1a,
  frost: 0xbfe8ff,
  rune: 0x9be8ff,
  thorn: 0x8fbf5a,
  web: 0xd8e0ea,
  vine: 0x4f9f4a,
  mirror: 0xdfe8f5,
  matrix: 0x4fff8a,
  bone: 0xe8e0cf,
  zebra: 0x1c1c24,
  camo: 0x6a7a4a,
  star: 0xffd45c,
  scale: 0xff8a5c,
  smoke: 0x9aa7b8,
  aurora: 0x7dffc4,
  nebula: 0xc9a0ff,
  onyx: 0x2a2a34,
  ivory: 0xf8f4ea,
  amber: 0xffb02a,
  jade: 0x35d6a4,
  ruby: 0xe83a5a,
  sapphire: 0x3a6ae8,
  toxic: 0x9cff3a,
  ember: 0xff9a3c,
  quantum: 0x39ffd0,
  obsidian: 0x3a3a4a,
  sunsteel: 0xffc247,
  moonlace: 0xe8f0ff,
  rosebranch: 0xff6f91,
  starpiercer: 0xffd45c,
  tsunami: 0x2a7ad4,
  magma: 0xff5a1a,
  stormline: 0x6f8bff,
  phoenixF: 0xff5a2a,
  dragonbone: 0xd8cba0,
  iceberg: 0x9fe8ff,
  goldthread: 0xffd45c,
  coralrim: 0xff8fa0,
  chrono: 0xb46cff,
  holo: 0x7fd4ff,
  gravity: 0x9b5cff,
  sonic: 0x7fffd4,
  willow: 0x8fbf5a,
  blossom: 0xffb7d5,
};

export const EMOJI_PRESETS = [
  '🙂', '😎', '😈', '🥷', '🦸', '🐱', '🐶', '🦊', '🐼', '🐸', '🐵', '🐯', '🦁', '🐲', '🦈', '🐙', '👽', '🤖', '👻', '💀',
];

export const COLOR_PRESETS = [
  0x2a7ad4, 0xd4542c, 0x1f9d55, 0xc07f00, 0x8e44ad, 0x1f7f8f, 0x1b2740, 0xffffff,
  0xff5ad4, 0x39ffd0, 0xffd45c, 0x9b5cff,
];

export const DEFAULT_COSMETIC: Cosmetic = {
  characterSkin: 'none',
  emoji: '🙂',
  racket: 0x44586f,
  trail: 0x6f9fce,
  effect: 'ring',
  wings: 'none',
  cape: 'none',
  aura: 'none',
  hat: 'none',
  ring: 'none',
  pet: 'none',
  petStar: 1,
  racketSkin: 'default',
  trailStyle: 'classic',
  swingTrail: 'none',
};

/** the CPU opponent gets a fixed look so it reads as "not you" */
export const AI_COSMETIC: Cosmetic = {
  characterSkin: 'none',
  emoji: '🤖',
  racket: 0x44586f,
  trail: 0xd4542c,
  effect: 'spark',
  wings: 'none',
  cape: 'none',
  aura: 'none',
  hat: 'none',
  ring: 'none',
  pet: 'none',
  petStar: 1,
  racketSkin: 'default',
  trailStyle: 'classic',
  swingTrail: 'none',
};

export function toHex(n: number): string {
  return `#${(n & 0xffffff).toString(16).padStart(6, '0')}`;
}

export function fromHex(s: string): number {
  const v = Number.parseInt(s.replace('#', ''), 16);
  return Number.isFinite(v) ? v & 0xffffff : 0x000000;
}

function pick<T extends string>(ids: readonly T[], v: unknown, fallback: T): T {
  return typeof v === 'string' && (ids as readonly string[]).includes(v) ? (v as T) : fallback;
}

/** coerce anything that arrived over the network into a safe cosmetic */
export function sanitizeCosmetic(input: Partial<Cosmetic> | undefined): Cosmetic {
  const d = DEFAULT_COSMETIC;
  if (!input || typeof input !== 'object') return { ...d };
  return {
    characterSkin: pick(SKIN_IDS, input.characterSkin, d.characterSkin),
    emoji: typeof input.emoji === 'string' ? input.emoji.slice(0, 8) : d.emoji,
    racket: typeof input.racket === 'number' ? input.racket & 0xffffff : d.racket,
    trail: typeof input.trail === 'number' ? input.trail & 0xffffff : d.trail,
    effect: pick(HIT_STYLE_IDS, input.effect, d.effect),
    wings: pick(WING_IDS, input.wings, d.wings),
    cape: pick(CAPE_IDS, input.cape, d.cape),
    ring: pick(RING_IDS, input.ring, d.ring),
    aura: pick(AURA_IDS, input.aura, d.aura),
    hat: pick(HAT_IDS, input.hat, d.hat),
    pet: pick(PET_IDS, input.pet, d.pet),
    petStar:
      typeof input.petStar === 'number' && Number.isFinite(input.petStar)
        ? Math.min(5, Math.max(1, Math.round(input.petStar)))
        : d.petStar,
    racketSkin: pick(RACKET_SKIN_IDS, input.racketSkin, d.racketSkin),
    trailStyle: pick(TRAIL_IDS, input.trailStyle, d.trailStyle),
    swingTrail: pick(SWING_TRAIL_IDS, input.swingTrail, d.swingTrail),
  };
}
