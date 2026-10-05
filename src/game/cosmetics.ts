/**
 * Purely visual player customisation. None of this touches the simulation, so
 * it is safe to send over the wire and render differently per client.
 *
 * Unlocks / rarity live in items.ts; this file only defines the shape of a
 * look and how each value renders.
 */
/** 只借一个数：默认小人的身高 = 默认的「头顶高度」（见文件末尾的 `SKIN_HEAD_H`） */
import { PLAYER_H } from './constants';

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
  | 'pow'
  | 'gzfire'
  // 外星人降临限定
  | 'meteorBurst'
  // 🧩 碎片兑换专属
  | 'shardpop'
  // 宇宙龙域限定
  | 'drastar'
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
  | 'chrono'
  // 发球机活动专属
  | 'turbo'
  // 10 个新主题宝箱的专属翅膀（各 2 款）
  | 'desSandWing' | 'desDuneWing' | 'nimbWindWing' | 'nimbFeatherWing'
  | 'confSugarWing' | 'confCandyWing' | 'bigtTentWing' | 'bigtConfettiWing'
  | 'aegisShieldWing' | 'aegisBladeWing' | 'chanFanWing' | 'chanLeafWing'
  | 'arcanRuneWing' | 'arcanStarWing' | 'relicBoneWing' | 'relicAmberWing'
  | 'playBlockWing' | 'playKiteWing' | 'yuanLanternWing' | 'yuanFireWing'
  // 第三批 10 个主题宝箱的专属翅膀（各 2 款）
  | 'pirateWingA' | 'pirateWingB' | 'steamWingA' | 'steamWingB'
  | 'astroWingA' | 'astroWingB' | 'juraWingA' | 'juraWingB'
  | 'mushWingA' | 'mushWingB' | 'tropicWingA' | 'tropicWingB'
  | 'cryptWingA' | 'cryptWingB' | 'festivWingA' | 'festivWingB'
  | 'sushiWingA' | 'sushiWingB' | 'wildWingA' | 'wildWingB'
  // 第四批 20 个主题宝箱的专属翅膀（各 2 款）
  | 'vulcWingA' | 'vulcWingB' | 'trenchWingA' | 'trenchWingB'
  | 'dojoWingA' | 'dojoWingB' | 'inkwWingA' | 'inkwWingB'
  | 'fairyWingA' | 'fairyWingB' | 'racerWingA' | 'racerWingB'
  | 'vampWingA' | 'vampWingB' | 'autumnWingA' | 'autumnWingB'
  | 'pandaWingA' | 'pandaWingB' | 'jokerWingA' | 'jokerWingB'
  | 'pagodWingA' | 'pagodWingB' | 'stormWingA' | 'stormWingB'
  | 'lunarWingA' | 'lunarWingB' | 'vikingWingA' | 'vikingWingB'
  | 'safariWingA' | 'safariWingB' | 'theatWingA' | 'theatWingB'
  | 'boreaWingA' | 'boreaWingB' | 'venicWingA' | 'venicWingB'
  | 'olympWingA' | 'olympWingB' | 'sambaWingA' | 'sambaWingB'
  // 🗺️ 山海宝箱的普通货
  | 'shanWingFeather' | 'shanWingCloud';

export type CapeId =
  | 'none'
  | 'hero'
  | 'shadowCape'
  | 'storm'
  | 'emberCape'
  | 'frostCape'
  | 'leafCape'
  | 'royal'
  | 'void'
  | 'dragonCape'
  | 'angelCape'
  | 'phoenixCape'
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
  | 'goldenflame'
  // 发球机活动专属
  | 'towel'
  // 哥斯拉来袭限定
  | 'scalecape'
  // 外星人降临限定
  | 'antigrav'
  // 🧩 碎片兑换专属
  | 'shardcape'
  // 宇宙龙域限定
  | 'drakewing'
  // 主题宝箱专属披风（每个主题一件，见 game/chest.ts 的 CHEST_THEMES）
  | 'seamist'
  | 'batcape'
  | 'slagcape'
  | 'ermine'
  | 'petalveil'
  | 'starmap'
  | 'cinder'
  | 'icemist'
  | 'canopy'
  | 'tapecape'
  // 10 个新主题宝箱的专属披风（各 2 款）
  | 'desCloak' | 'desOasis' | 'nimbVeil' | 'nimbSail' | 'confApron'
  | 'confRibbonCape' | 'bigtCape' | 'bigtCurtain' | 'aegisBanner'
  | 'aegisRoyal' | 'chanRobe' | 'chanInkCape' | 'arcanCloak'
  | 'arcanMantle' | 'relicHide' | 'relicDustCape' | 'playCape'
  | 'playRibbonCape' | 'yuanSilk' | 'yuanLanternCape'
  // 第三批 10 个主题宝箱的专属披风（各 2 款）
  | 'pirateCape' | 'pirateCloak' | 'steamCape' | 'steamCloak' | 'astroCape'
  | 'astroCloak' | 'juraCape' | 'juraCloak' | 'mushCape' | 'mushCloak'
  | 'tropicCape' | 'tropicCloak' | 'cryptCape' | 'cryptCloak' | 'festivCape'
  | 'festivCloak' | 'sushiCape' | 'sushiCloak' | 'wildCape' | 'wildCloak'
  // 第四批 20 个主题宝箱的专属披风（各 2 款）
  | 'vulcCape' | 'vulcCloak' | 'trenchCape' | 'trenchCloak'
  | 'dojoCape' | 'dojoCloak' | 'inkwCape' | 'inkwCloak'
  | 'fairyCape' | 'fairyCloak' | 'racerCape' | 'racerCloak'
  | 'vampCape' | 'vampCloak' | 'autumnCape' | 'autumnCloak'
  | 'pandaCape' | 'pandaCloak' | 'jokerCape' | 'jokerCloak'
  | 'pagodCape' | 'pagodCloak' | 'stormCape' | 'stormCloak'
  | 'lunarCape' | 'lunarCloak' | 'vikingCape' | 'vikingCloak'
  | 'safariCape' | 'safariCloak' | 'theatCape' | 'theatCloak'
  | 'boreaCape' | 'boreaCloak' | 'venicCape' | 'venicCloak'
  | 'olympCape' | 'olympCloak' | 'sambaCape' | 'sambaCloak'
  // 🗺️ 山海宝箱的普通货
  | 'shanCapeScale' | 'shanCapeMist';

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
  | 'dragonHelm'
  // ---- 以下 50 款：每款一个独立造型（不是同形状换色） ----
  | 'rabbitEars'
  | 'bearEars'
  | 'mouseEars'
  | 'sharkFin'
  | 'dinoHorns'
  | 'unicornHorn'
  | 'afro'
  | 'mohawk'
  | 'ponytail'
  | 'bun'
  | 'pigtails'
  | 'braids'
  | 'spikyHair'
  | 'longHair'
  | 'curlyHair'
  | 'bobHair'
  | 'buzzCut'
  | 'antenna'
  | 'cowboy'
  | 'bowler'
  | 'newsboy'
  | 'turban'
  | 'wreath'
  | 'bamboo'
  | 'conical'
  | 'veil'
  | 'brideVeil'
  | 'headband'
  | 'hood'
  | 'knightHelm'
  | 'armyHelm'
  | 'fireHelm'
  | 'kabukiMask'
  | 'eyepatch'
  | 'monocle'
  | 'sailorHat'
  | 'gasMask'
  | 'skullMask'
  | 'ghostHat'
  | 'pumpkin'
  | 'iceCream'
  | 'cupcake'
  | 'burger'
  | 'watermelon'
  | 'screw'
  | 'gear'
  | 'minerLamp'
  | 'candle'
  | 'starCrown'
  | 'moonCrown'
  // ---- 第三批 50 款：每款一套独立造型 + 自己的小动态（见 drawHat 的 case，接 `now`）----
  // 吃喝
  | 'teapot'
  | 'ramen'
  | 'teacup'
  | 'boba'
  | 'popcorn'
  | 'pizza'
  | 'donut'
  | 'sushi'
  | 'taco'
  | 'cake'
  | 'lollipop'
  | 'candyCane'
  // 花草果蔬
  | 'sunflower'
  | 'lotus'
  | 'leafCrown'
  | 'clover'
  | 'sprout'
  | 'cactusHat'
  | 'acorn'
  | 'strawberry'
  | 'cherry'
  | 'pineapple'
  // 小动物
  | 'bee'
  | 'butterfly'
  | 'chick'
  | 'crab'
  | 'frogHat'
  | 'snailHat'
  | 'fishBowl'
  | 'birdCage'
  | 'beehive'
  | 'hedgehog'
  // 杂物与机械
  | 'pinwheel'
  | 'trafficCone'
  | 'lantern'
  | 'umbrella'
  | 'alarmClock'
  | 'trafficLight'
  | 'satellite'
  | 'planet'
  | 'bulb'
  | 'battery'
  | 'magnet'
  | 'weldingMask'
  // 玩具
  | 'tvHead'
  | 'snowGlobe'
  | 'paperBoat'
  | 'dice'
  | 'book'
  | 'pencil'
  // 小黄龙联名
  | 'nailongHood'
  // 发球机活动专属
  | 'coachcap'
  // 外星人降临限定
  | 'ufoHelm'
  // 🧩 碎片兑换专属
  | 'shardCrown'
  // 宇宙龙域限定
  | 'drakecrown'
  // 10 个新主题宝箱的专属头饰（各 2 款）
  | 'desTurban' | 'desScarab' | 'nimbHalo' | 'nimbCrown' | 'confCake'
  | 'confCrown' | 'bigtClown' | 'bigtRing' | 'aegisHelm' | 'aegisCrest'
  | 'chanHat' | 'chanLantern' | 'arcanCap' | 'arcanCrown' | 'relicBone'
  | 'relicAmber' | 'playBlock' | 'playTop' | 'yuanLamp' | 'yuanMask'
  // 第三批 10 个主题宝箱的专属头饰（各 2 款）
  | 'pirateHat' | 'pirateCrown' | 'steamHat' | 'steamCrown' | 'astroHat'
  | 'astroCrown' | 'juraHat' | 'juraCrown' | 'mushHat' | 'mushCrown'
  | 'tropicHat' | 'tropicCrown' | 'cryptHat' | 'cryptCrown' | 'festivHat'
  | 'festivCrown' | 'sushiHat' | 'sushiCrown' | 'wildHat' | 'wildCrown'
  // 第四批 20 个主题宝箱的专属头饰（各 2 款）
  | 'vulcHelm' | 'vulcCrown' | 'trenchDiver' | 'trenchCrown'
  | 'dojoHachimaki' | 'dojoCrown' | 'inkwHat' | 'inkwCrown'
  | 'fairyHat' | 'fairyCrown' | 'racerHelm' | 'racerCrown'
  | 'vampHat' | 'vampCrown' | 'autumnHat' | 'autumnCrown'
  | 'pandaHat' | 'pandaCrown' | 'jokerHat' | 'jokerCrown'
  | 'pagodHat' | 'pagodCrown' | 'stormHat' | 'stormCrown'
  | 'lunarHat' | 'lunarCrown' | 'vikingHelm' | 'vikingCrown'
  | 'safariHat' | 'safariCrown' | 'theatHat' | 'theatCrown'
  | 'boreaHat' | 'boreaCrown' | 'venicHat' | 'venicCrown'
  | 'olympWreath' | 'olympCrown' | 'sambaHat' | 'sambaCrown'
  // 🗺️ 山海宝箱的普通货
  | 'shanHatFeather' | 'shanHatDragon'
  // 🏟 操场跑量里程碑专属
  | 'runHat';

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
  | 'ghost'
  | 'nailong';

export type TrailId =
  | 'none'
  | 'classic'
  | 'fire'
  | 'ice'
  | 'rainbow'
  | 'electric'
  | 'neon'
  | 'leaf'
  | 'void'
  | 'gold'
  | 'pixel'
  // 外星人降临限定
  | 'stardust'
  // 10 个新主题宝箱的专属击球拖尾（各 2 款）
  | 'desTrailA' | 'desTrailB' | 'nimbTrailA' | 'nimbTrailB'
  | 'confTrailA' | 'confTrailB' | 'bigtTrailA' | 'bigtTrailB'
  | 'aegisTrailA' | 'aegisTrailB' | 'chanTrailA' | 'chanTrailB'
  | 'arcanTrailA' | 'arcanTrailB' | 'relicTrailA' | 'relicTrailB'
  | 'playTrailA' | 'playTrailB' | 'yuanTrailA' | 'yuanTrailB'
  // 第三批 10 个主题宝箱的专属击球拖尾（各 2 款）
  | 'pirateTrailA' | 'pirateTrailB' | 'steamTrailA' | 'steamTrailB'
  | 'astroTrailA' | 'astroTrailB' | 'juraTrailA' | 'juraTrailB'
  | 'mushTrailA' | 'mushTrailB' | 'tropicTrailA' | 'tropicTrailB'
  | 'cryptTrailA' | 'cryptTrailB' | 'festivTrailA' | 'festivTrailB'
  | 'sushiTrailA' | 'sushiTrailB' | 'wildTrailA' | 'wildTrailB'
  // 第四批 20 个主题宝箱的专属击球拖尾（各 2 款）
  | 'vulcTrailA' | 'vulcTrailB' | 'trenchTrailA' | 'trenchTrailB'
  | 'dojoTrailA' | 'dojoTrailB' | 'inkwTrailA' | 'inkwTrailB'
  | 'fairyTrailA' | 'fairyTrailB' | 'racerTrailA' | 'racerTrailB'
  | 'vampTrailA' | 'vampTrailB' | 'autumnTrailA' | 'autumnTrailB'
  | 'pandaTrailA' | 'pandaTrailB' | 'jokerTrailA' | 'jokerTrailB'
  | 'pagodTrailA' | 'pagodTrailB' | 'stormTrailA' | 'stormTrailB'
  | 'lunarTrailA' | 'lunarTrailB' | 'vikingTrailA' | 'vikingTrailB'
  | 'safariTrailA' | 'safariTrailB' | 'theatTrailA' | 'theatTrailB'
  | 'boreaTrailA' | 'boreaTrailB' | 'venicTrailA' | 'venicTrailB'
  | 'olympTrailA' | 'olympTrailB' | 'sambaTrailA' | 'sambaTrailB'
  // 🗺️ 山海宝箱的普通货
  | 'shanTrail'
  // 🏟 操场跑量里程碑专属
  | 'runTrail';

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
  | 'voidcut'
  | 'tempo'
  // 哥斯拉来袭限定
  | 'atomic'
  // 外星人降临限定
  | 'beam'
  // 🧩 碎片兑换专属
  | 'shardedge'
  // 宇宙龙域限定
  | 'drabreath'
  // 10 个新主题宝箱的专属挥拍拖尾（各 1 款）
  | 'desSwing' | 'nimbSwing' | 'confSwing' | 'bigtSwing' | 'aegisSwing'
  | 'chanSwing' | 'arcanSwing' | 'relicSwing' | 'playSwing' | 'yuanSwing'
  // 第三批 10 个主题宝箱的专属挥拍拖尾（各 1 款）
  | 'pirateSwing' | 'steamSwing' | 'astroSwing' | 'juraSwing' | 'mushSwing'
  | 'tropicSwing' | 'cryptSwing' | 'festivSwing' | 'sushiSwing' | 'wildSwing'
  // 第四批 20 个主题宝箱的专属挥拍拖尾（各 1 款）
  | 'vulcSwing' | 'trenchSwing' | 'dojoSwing' | 'inkwSwing' | 'fairySwing'
  | 'racerSwing' | 'vampSwing' | 'autumnSwing' | 'pandaSwing' | 'jokerSwing'
  | 'pagodSwing' | 'stormSwing' | 'lunarSwing' | 'vikingSwing' | 'safariSwing'
  | 'theatSwing' | 'boreaSwing' | 'venicSwing' | 'olympSwing' | 'sambaSwing'
  // 🗺️ 山海宝箱的普通货
  | 'shanSwing'
  // 🏟 操场跑量里程碑专属
  | 'runSwing';

/**
 * 坐骑：纯装饰，画在角色脚下、跟着他一起跑和跳。
 * **不参与任何物理**——不影响移动速度、判定半径，也不需要联机同步轨迹。
 */
export type MountId =
  | 'none'
  | 'board'
  | 'bubble'
  | 'cloud'
  | 'sword'
  | 'horse'
  | 'carpet'
  | 'star'
  | 'dragon'
  | 'rocket'
  | 'throne'
  // 金币商店的 1~3★ 「普通款」坐骑：造型简单，但各有一个小动态
  | 'scooter'
  | 'log'
  | 'box'
  | 'spring'
  | 'cart'
  | 'broom'
  | 'turtle'
  | 'bike'
  | 'hover'
  | 'shark'
  // 小黄龙联名
  | 'nailongRoll'
  // 外星人降临限定
  | 'ufo'
  // 宇宙龙域限定
  | 'stardrake'
  // 主题宝箱专属坐骑（每个主题一只，见 game/chest.ts 的 CHEST_THEMES）
  | 'dolphin'
  | 'pumpkincart'
  | 'gearbike'
  | 'lion'
  | 'kite'
  | 'crescent'
  | 'firewheel'
  | 'polarbear'
  | 'dino'
  | 'laserbike'
  // 10 个新主题宝箱的专属坐骑（各 1 款）
  | 'desCamel' | 'nimbCloud' | 'confCake' | 'bigtBall' | 'aegisSteed'
  | 'chanBoat' | 'arcanOrb' | 'relicBone' | 'playHorse' | 'yuanBoat'
  // 第三批 10 个主题宝箱的专属坐骑（各 1 款）
  | 'pirateMount' | 'steamMount' | 'astroMount' | 'juraMount' | 'mushMount'
  | 'tropicMount' | 'cryptMount' | 'festivMount' | 'sushiMount' | 'wildMount'
  // 第四批 20 个主题宝箱的专属坐骑（各 1 款）
  | 'vulcHound' | 'trenchRay' | 'dojoCrest' | 'inkwBoat' | 'fairySnail'
  | 'racerKart' | 'vampStallion' | 'autumnBoar' | 'pandaSled' | 'jokerCarriage'
  | 'pagodPalanquin' | 'stormGlider' | 'lunarCloud' | 'vikingDrakkar' | 'safariElephant'
  | 'theatSpotlight' | 'boreaStag' | 'venicGondola' | 'olympChariot' | 'sambaFloat'
  // 🗺️ 山海宝箱的普通货
  | 'shanMountKun';

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
  | 'legend'
  | 'courtline'
  // 外星人降临限定
  | 'orbit'
  // 🧩 碎片兑换专属
  | 'shardring'
  // 宇宙龙域限定
  | 'draring'
  // 10 个新主题宝箱的专属地环（各 1 款）
  | 'desRing' | 'nimbRing' | 'confRing' | 'bigtRing' | 'aegisRing'
  | 'chanRing' | 'arcanRing' | 'relicRing' | 'playRing' | 'yuanRing'
  // 第三批 10 个主题宝箱的专属地环（各 1 款）
  | 'pirateRing' | 'steamRing' | 'astroRing' | 'juraRing' | 'mushRing'
  | 'tropicRing' | 'cryptRing' | 'festivRing' | 'sushiRing' | 'wildRing'
  // 第四批 20 个主题宝箱的专属地环（各 1 款）
  | 'vulcRing' | 'trenchRing' | 'dojoRing' | 'inkwRing' | 'fairyRing'
  | 'racerRing' | 'vampRing' | 'autumnRing' | 'pandaRing' | 'jokerRing'
  | 'pagodRing' | 'stormRing' | 'lunarRing' | 'vikingRing' | 'safariRing'
  | 'theatRing' | 'boreaRing' | 'venicRing' | 'olympRing' | 'sambaRing'
  // 🗺️ 山海宝箱的普通货
  | 'shanRing'
  // 🏟 操场跑量里程碑专属
  | 'runRing';

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
  | 'rebirth'
  | 'spotlight'
  // 哥斯拉来袭限定
  | 'dorsal'
  // 外星人降临限定
  | 'warp'
  // 🧩 碎片兑换专属
  | 'shardglow'
  // 宇宙龙域限定
  | 'dranebula'
  // 10 个新主题宝箱的专属光环（各 2 款）
  | 'desSandAura' | 'desSunAura' | 'nimbWindAura' | 'nimbStarAura'
  | 'confSugarAura' | 'confHeartAura' | 'bigtConfetti' | 'bigtSpotAura'
  | 'aegisBanner' | 'aegisSteel' | 'chanInkAura' | 'chanPetalAura'
  | 'arcanRuneAura' | 'arcanStarAura' | 'relicDustAura' | 'relicAmberAura'
  | 'playBallAura' | 'playSparkAura' | 'yuanFireAura' | 'yuanLanternAura'
  // 第三批 10 个主题宝箱的专属光环（各 2 款）
  | 'pirateAuraA' | 'pirateAuraB' | 'steamAuraA' | 'steamAuraB' | 'astroAuraA'
  | 'astroAuraB' | 'juraAuraA' | 'juraAuraB' | 'mushAuraA' | 'mushAuraB'
  | 'tropicAuraA' | 'tropicAuraB' | 'cryptAuraA' | 'cryptAuraB' | 'festivAuraA'
  | 'festivAuraB' | 'sushiAuraA' | 'sushiAuraB' | 'wildAuraA' | 'wildAuraB'
  // 第四批 20 个主题宝箱的专属光环（各 2 款）
  | 'vulcAuraA' | 'vulcAuraB' | 'trenchAuraA' | 'trenchAuraB'
  | 'dojoAuraA' | 'dojoAuraB' | 'inkwAuraA' | 'inkwAuraB'
  | 'fairyAuraA' | 'fairyAuraB' | 'racerAuraA' | 'racerAuraB'
  | 'vampAuraA' | 'vampAuraB' | 'autumnAuraA' | 'autumnAuraB'
  | 'pandaAuraA' | 'pandaAuraB' | 'jokerAuraA' | 'jokerAuraB'
  | 'pagodAuraA' | 'pagodAuraB' | 'stormAuraA' | 'stormAuraB'
  | 'lunarAuraA' | 'lunarAuraB' | 'vikingAuraA' | 'vikingAuraB'
  | 'safariAuraA' | 'safariAuraB' | 'theatAuraA' | 'theatAuraB'
  | 'boreaAuraA' | 'boreaAuraB' | 'venicAuraA' | 'venicAuraB'
  | 'olympAuraA' | 'olympAuraB' | 'sambaAuraA' | 'sambaAuraB'
  // 🗺️ 山海宝箱的普通货
  | 'shanAuraSpirit' | 'shanAuraStar'
  // 🏟 操场跑量里程碑专属
  | 'runAura';

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
  | 'blossom'
  // 发球机活动专属
  | 'wood'
  // 外星人降临限定
  | 'meteorite'
  // 10 个新主题宝箱的专属球拍皮肤（各 2 款）
  | 'desRacketA' | 'desRacketB' | 'nimbRacketA' | 'nimbRacketB'
  | 'confRacketA' | 'confRacketB' | 'bigtRacketA' | 'bigtRacketB'
  | 'aegisRacketA' | 'aegisRacketB' | 'chanRacketA' | 'chanRacketB'
  | 'arcanRacketA' | 'arcanRacketB' | 'relicRacketA' | 'relicRacketB'
  | 'playRacketA' | 'playRacketB' | 'yuanRacketA' | 'yuanRacketB'
  // 第三批 10 个主题宝箱的专属球拍皮肤（各 2 款）
  | 'pirateRacketA' | 'pirateRacketB' | 'steamRacketA' | 'steamRacketB'
  | 'astroRacketA' | 'astroRacketB' | 'juraRacketA' | 'juraRacketB'
  | 'mushRacketA' | 'mushRacketB' | 'tropicRacketA' | 'tropicRacketB'
  | 'cryptRacketA' | 'cryptRacketB' | 'festivRacketA' | 'festivRacketB'
  | 'sushiRacketA' | 'sushiRacketB' | 'wildRacketA' | 'wildRacketB'
  // 第四批 20 个主题宝箱的专属球拍皮肤（各 2 款）
  | 'vulcRacketA' | 'vulcRacketB' | 'trenchRacketA' | 'trenchRacketB'
  | 'dojoRacketA' | 'dojoRacketB' | 'inkwRacketA' | 'inkwRacketB'
  | 'fairyRacketA' | 'fairyRacketB' | 'racerRacketA' | 'racerRacketB'
  | 'vampRacketA' | 'vampRacketB' | 'autumnRacketA' | 'autumnRacketB'
  | 'pandaRacketA' | 'pandaRacketB' | 'jokerRacketA' | 'jokerRacketB'
  | 'pagodRacketA' | 'pagodRacketB' | 'stormRacketA' | 'stormRacketB'
  | 'lunarRacketA' | 'lunarRacketB' | 'vikingRacketA' | 'vikingRacketB'
  | 'safariRacketA' | 'safariRacketB' | 'theatRacketA' | 'theatRacketB'
  | 'boreaRacketA' | 'boreaRacketB' | 'venicRacketA' | 'venicRacketB'
  | 'olympRacketA' | 'olympRacketB' | 'sambaRacketA' | 'sambaRacketB'
  // 🗺️ 山海宝箱的普通货
  | 'shanRacketA' | 'shanRacketB';

/**
 * 角色形象：默认小人 / 哥斯拉 / U熊（大肚皮）/ 老皮（两个钢铁屁股，球弹上去会被弹开），
 * 以及荣誉商店的三款：冠军铠甲 / 不灭凤凰 / 龙王。
 */
export type CharacterSkin =
  | 'none'
  | 'godzilla'
  | 'ubear'
  | 'laopi'
  | 'champion'
  | 'phoenix'
  | 'dragonlord'
  | 'nailong'
  // 发球机活动专属：发球机教练
  | 'coach'
  // 外星人降临专属
  | 'alien'
  // 金币商店的 1~3★ 形象：便宜、造型简单，但都会动（见 `draw/character.ts`）
  | 'slime'
  | 'cactus'
  | 'mushroom'
  | 'penguin'
  | 'frog'
  | 'snowman'
  | 'ghost'
  | 'robot'
  | 'octopus'
  | 'panda'
  // 宇宙龙域限定：星渊龙
  | 'cosmodra'
  // 主题宝箱专属形象（每个主题一款，见 game/chest.ts 的 CHEST_THEMES）
  | 'angler'
  | 'mummy'
  | 'windup'
  | 'guard'
  | 'sakurabun'
  | 'starlet'
  | 'emberling'
  | 'icesprite'
  | 'monkey'
  | 'neoncat'
  // 10 个新主题宝箱的专属形象（各主题的「招牌角色」，见 game/draw/themeart.ts）
  | 'desSpirit' | 'nimbSpirit' | 'confSpirit' | 'bigtSpirit' | 'aegisSpirit'
  | 'chanSpirit' | 'arcanSpirit' | 'relicSpirit' | 'playSpirit' | 'yuanSpirit'
  // 第三批 10 个主题宝箱的专属形象（见 game/draw/themeart2.ts）
  | 'pirateSpirit' | 'steamSpirit' | 'astroSpirit' | 'juraSpirit' | 'mushSpirit'
  | 'tropicSpirit' | 'cryptSpirit' | 'festivSpirit' | 'sushiSpirit' | 'wildSpirit'
  // 第四批 20 个主题宝箱的专属形象（见 game/draw/themeart3.ts）
  | 'vulcSpirit' | 'trenchSpirit' | 'dojoSpirit' | 'inkwSpirit' | 'fairySpirit'
  | 'racerSpirit' | 'vampSpirit' | 'autumnSpirit' | 'pandaSpirit' | 'jokerSpirit'
  | 'pagodSpirit' | 'stormSpirit' | 'lunarSpirit' | 'vikingSpirit' | 'safariSpirit'
  | 'theatSpirit' | 'boreaSpirit' | 'venicSpirit' | 'olympSpirit' | 'sambaSpirit'
  // 🗺️ 山海宝箱：10 只《山海经》怪物皮肤（宝箱专属、极低概率）
  | 'zhuLong' | 'xiangLiu' | 'qiongQi' | 'taoTie' | 'taoWu'
  | 'hunDun' | 'jiuweiHu' | 'baShe' | 'guDiao' | 'yuYu';
const SKIN_IDS: CharacterSkin[] = [
  'none',
  'godzilla',
  'ubear',
  'laopi',
  'champion',
  'phoenix',
  'dragonlord',
  'nailong',
  'coach',
  'alien',
  'slime',
  'cactus',
  'mushroom',
  'penguin',
  'frog',
  'snowman',
  'ghost',
  'robot',
  'octopus',
  'panda',
  'cosmodra',
  // 主题宝箱专属形象
  'angler', 'mummy', 'windup', 'guard', 'sakurabun',
  'starlet', 'emberling', 'icesprite', 'monkey', 'neoncat',
  // 新主题宝箱专属形象
  'desSpirit', 'nimbSpirit', 'confSpirit', 'bigtSpirit', 'aegisSpirit',
  'chanSpirit', 'arcanSpirit', 'relicSpirit', 'playSpirit', 'yuanSpirit',
  // 第三批新主题宝箱专属形象
  'pirateSpirit', 'steamSpirit', 'astroSpirit', 'juraSpirit', 'mushSpirit',
  'tropicSpirit', 'cryptSpirit', 'festivSpirit', 'sushiSpirit', 'wildSpirit',
  // 第四批新主题宝箱专属形象
  'vulcSpirit', 'trenchSpirit', 'dojoSpirit', 'inkwSpirit', 'fairySpirit',
  'racerSpirit', 'vampSpirit', 'autumnSpirit', 'pandaSpirit', 'jokerSpirit',
  'pagodSpirit', 'stormSpirit', 'lunarSpirit', 'vikingSpirit', 'safariSpirit',
  'theatSpirit', 'boreaSpirit', 'venicSpirit', 'olympSpirit', 'sambaSpirit',
  // 山海怪物皮肤
  'zhuLong', 'xiangLiu', 'qiongQi', 'taoTie', 'taoWu',
  'hunDun', 'jiuweiHu', 'baShe', 'guDiao', 'yuYu',
];

export interface Cosmetic {
  /** whole-body character form (the streak-100 Godzilla, else 'none') */
  characterSkin: CharacterSkin;
  emoji: string;
  racket: number;
  trail: number;
  effect: HitStyle;
  /** 背部装饰（翅膀 / 披风合并）：id 仍分展开形（原翅膀）与垂坠形（原披风）两家族 */
  back: BackId;
  aura: AuraId;
  hat: HatId;
  /** 脚下的地环装饰 */
  ring: RingId;
  pet: PetId;
  /** quality of the equipped pet, 1–5 (ignored when pet is 'none') */
  petStar: number;
  /** 宠物怎么跟着你：肩旁悬浮 / 贴地跟在身后 / 站在脚边不动 */
  petFollow: PetFollow;
  /** 宠物在屏幕的左 / 右 */
  petSide: PetSide;
  racketSkin: RacketSkinId;
  trailStyle: TrailId;
  /** 挥拍时那条弧线的风格（与球拖尾独立） */
  swingTrail: SwingTrailId;
  /** 坐骑：纯装饰，画在角色脚下 */
  mount: MountId;
}

/** the 100 generated "plus" hit styles: p1..p100 (see effects/plus.ts) */
export type PlusEffectId = `p${number}`;
export const PLUS_EFFECT_IDS: PlusEffectId[] = Array.from({ length: 100 }, (_, i): PlusEffectId => `p${i + 1}`);

const HIT_STYLE_IDS: HitStyle[] = [
  'ring', 'spark', 'slash', 'burst', 'shock', 'frost', 'petal', 'lightning', 'star', 'prism', 'vortex',
  'shards', 'ripple', 'confetti', 'cross', 'hex', 'spiral', 'web', 'bubble', 'feather', 'comet', 'shatter', 'smoke', 'sonic', 'gear',   'nova', 'rune', 'gzfire',
  'shardpop', 'drastar',
  'bomb', 'flamenova', 'icicle', 'sword', 'claw', 'meteor', 'beam', 'poison', 'note', 'heart', 'coin', 'dice', 'arrow', 'shield', 'chain', 'thorn', 'blossom', 'cube', 'pyramid', 'aim', 'sonar', 'wind', 'sand', 'acid', 'sun', 'moon', 'eye', 'portal', 'dna', 'atom', 'sparkle', 'ink', 'meteorBurst',
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
  // 发球机活动专属
  'turbo',
  // 新主题宝箱专属翅膀
  'desSandWing', 'desDuneWing', 'nimbWindWing', 'nimbFeatherWing',
  'confSugarWing', 'confCandyWing', 'bigtTentWing', 'bigtConfettiWing',
  'aegisShieldWing', 'aegisBladeWing', 'chanFanWing', 'chanLeafWing',
  'arcanRuneWing', 'arcanStarWing', 'relicBoneWing', 'relicAmberWing',
  'playBlockWing', 'playKiteWing', 'yuanLanternWing', 'yuanFireWing',
  // 第三批新主题宝箱专属翅膀
  'pirateWingA', 'pirateWingB', 'steamWingA', 'steamWingB',
  'astroWingA', 'astroWingB', 'juraWingA', 'juraWingB',
  'mushWingA', 'mushWingB', 'tropicWingA', 'tropicWingB',
  'cryptWingA', 'cryptWingB', 'festivWingA', 'festivWingB',
  'sushiWingA', 'sushiWingB', 'wildWingA', 'wildWingB',
  // 第四批新主题宝箱专属翅膀
  'vulcWingA', 'vulcWingB', 'trenchWingA', 'trenchWingB',
  'dojoWingA', 'dojoWingB', 'inkwWingA', 'inkwWingB',
  'fairyWingA', 'fairyWingB', 'racerWingA', 'racerWingB',
  'vampWingA', 'vampWingB', 'autumnWingA', 'autumnWingB',
  'pandaWingA', 'pandaWingB', 'jokerWingA', 'jokerWingB',
  'pagodWingA', 'pagodWingB', 'stormWingA', 'stormWingB',
  'lunarWingA', 'lunarWingB', 'vikingWingA', 'vikingWingB',
  'safariWingA', 'safariWingB', 'theatWingA', 'theatWingB',
  'boreaWingA', 'boreaWingB', 'venicWingA', 'venicWingB',
  'olympWingA', 'olympWingB', 'sambaWingA', 'sambaWingB',
  'shanWingFeather', 'shanWingCloud',
];
const CAPE_IDS: CapeId[] = [
  'none', 'hero', 'shadowCape', 'storm', 'emberCape', 'frostCape', 'leafCape', 'royal', 'void', 'dragonCape', 'angelCape', 'phoenixCape',
  'knight', 'mage', 'ninja', 'winter', 'autumn', 'ocean', 'starCape', 'voidCape', 'goldRoyal', 'dragonfire',
  'auroraCape', 'stormlord', 'sakuraCape', 'ironclad', 'pharaoh', 'emberwind', 'abyssCape', 'jadeRobe', 'plaguecoat',
  'captainCape', 'stardust', 'warlord', 'frostlord', 'venomCape', 'cometCape', 'thunderCape', 'mooncloak',
  'crimsonlord', 'voidwalker', 'goldenflame',
  // 发球机活动专属
  'towel',
  // 外星人降临限定
  'antigrav',
  // 🧩 碎片兑换专属
  'shardcape',
  // 宇宙龙域限定
  'drakewing',
  // 主题宝箱专属披风
  'seamist', 'batcape', 'slagcape', 'ermine', 'petalveil',
  'starmap', 'cinder', 'icemist', 'canopy', 'tapecape',
  // 新主题宝箱专属披风
  'desCloak', 'desOasis', 'nimbVeil', 'nimbSail', 'confApron',
  'confRibbonCape', 'bigtCape', 'bigtCurtain', 'aegisBanner',
  'aegisRoyal', 'chanRobe', 'chanInkCape', 'arcanCloak',
  'arcanMantle', 'relicHide', 'relicDustCape', 'playCape',
  'playRibbonCape', 'yuanSilk', 'yuanLanternCape',
  // 第三批新主题宝箱专属披风
  'pirateCape', 'pirateCloak', 'steamCape', 'steamCloak', 'astroCape',
  'astroCloak', 'juraCape', 'juraCloak', 'mushCape', 'mushCloak',
  'tropicCape', 'tropicCloak', 'cryptCape', 'cryptCloak', 'festivCape',
  'festivCloak',   'sushiCape', 'sushiCloak', 'wildCape', 'wildCloak',
  // 第四批新主题宝箱专属披风
  'vulcCape', 'vulcCloak', 'trenchCape', 'trenchCloak',
  'dojoCape', 'dojoCloak', 'inkwCape', 'inkwCloak',
  'fairyCape', 'fairyCloak', 'racerCape', 'racerCloak',
  'vampCape', 'vampCloak', 'autumnCape', 'autumnCloak',
  'pandaCape', 'pandaCloak', 'jokerCape', 'jokerCloak',
  'pagodCape', 'pagodCloak', 'stormCape', 'stormCloak',
  'lunarCape', 'lunarCloak', 'vikingCape', 'vikingCloak',
  'safariCape', 'safariCloak', 'theatCape', 'theatCloak',
  'boreaCape', 'boreaCloak', 'venicCape', 'venicCloak',
  'olympCape', 'olympCloak', 'sambaCape', 'sambaCloak',
  'shanCapeScale', 'shanCapeMist',
];
/**
 * 🧥 背部装饰：翅膀与披风合并后的统一部位。
 * id 仍是两个家族的并集（`WingId` 展开形 / `CapeId` 垂坠形），
 * 绘制时按 `isWingFamily()` 分派锚点（肩部 +48 / 垂坠 +30）。
 */
export type BackId = WingId | CapeId;
export const BACK_IDS: BackId[] = [...new Set([...WING_IDS, ...CAPE_IDS] as BackId[])];
/** 该背部装饰 id 是否属于原「翅膀家族」（肩部锚点、左右镜像展开形） */
export function isWingFamily(id: BackId): boolean {
  return (WING_IDS as string[]).includes(id);
}
const HAT_IDS: HatId[] = [
  'none', 'crown', 'cap', 'horn', 'halo', 'wizard', 'santa', 'ninja', 'flower', 'headphone', 'topHat', 'viking',
  'pirate', 'chef', 'astro', 'mushroom', 'beanie', 'antler', 'jester', 'sombrero',
  'samurai', 'foxMask', 'frostCrown', 'flameCrown', 'witch', 'beret', 'vr', 'sunCrown', 'plague', 'graduation',
  'propeller', 'jelly', 'oni', 'snorkel', 'thornCrown', 'raincloud', 'featherCrest', 'captain', 'catEars', 'dragonHelm',
  // 后加的 50 款（漏了它们的话，联机 / AI 戴这些帽子会被 sanitize 回退成默认）
  'rabbitEars', 'bearEars', 'mouseEars', 'sharkFin', 'dinoHorns', 'unicornHorn',
  'afro', 'mohawk', 'ponytail', 'bun', 'pigtails', 'braids', 'spikyHair', 'longHair',
  'curlyHair', 'bobHair', 'buzzCut', 'antenna',
  'cowboy', 'bowler', 'newsboy', 'turban', 'wreath', 'bamboo', 'conical', 'veil',
  'brideVeil', 'headband', 'hood', 'knightHelm', 'armyHelm', 'fireHelm',
  'kabukiMask', 'eyepatch', 'monocle', 'sailorHat', 'gasMask', 'skullMask', 'ghostHat', 'pumpkin',
  'iceCream', 'cupcake', 'burger', 'watermelon', 'screw', 'gear', 'minerLamp', 'candle',
  'starCrown', 'moonCrown',
  // 第三批 50 款
  'teapot', 'ramen', 'teacup', 'boba', 'popcorn', 'pizza', 'donut', 'sushi', 'taco', 'cake',
  'lollipop', 'candyCane', 'sunflower', 'lotus', 'leafCrown', 'clover', 'sprout', 'cactusHat',
  'acorn', 'strawberry', 'cherry', 'pineapple', 'bee', 'butterfly', 'chick', 'crab', 'frogHat',
  'snailHat', 'fishBowl', 'birdCage', 'beehive', 'hedgehog', 'pinwheel', 'trafficCone', 'lantern',
  'umbrella', 'alarmClock', 'trafficLight', 'satellite', 'planet', 'bulb', 'battery', 'magnet',
  'weldingMask', 'tvHead', 'snowGlobe', 'paperBoat', 'dice', 'book', 'pencil',
  // 小黄龙联名
  'nailongHood',
  // 发球机活动专属
  'coachcap',
  // 外星人降临限定
  'ufoHelm',
  // 🧩 碎片兑换专属
  'shardCrown',
  // 宇宙龙域限定
  'drakecrown',
  // 新主题宝箱专属头饰
  'desTurban', 'desScarab', 'nimbHalo', 'nimbCrown', 'confCake',
  'confCrown', 'bigtClown', 'bigtRing', 'aegisHelm', 'aegisCrest',
  'chanHat', 'chanLantern', 'arcanCap', 'arcanCrown', 'relicBone',
  'relicAmber',   'playBlock', 'playTop', 'yuanLamp', 'yuanMask',
  // 第三批新主题宝箱专属头饰
  'pirateHat', 'pirateCrown', 'steamHat', 'steamCrown', 'astroHat',
  'astroCrown', 'juraHat', 'juraCrown', 'mushHat', 'mushCrown',
  'tropicHat', 'tropicCrown', 'cryptHat', 'cryptCrown', 'festivHat',
  'festivCrown',   'sushiHat', 'sushiCrown', 'wildHat', 'wildCrown',
  // 第四批新主题宝箱专属头饰
  'vulcHelm', 'vulcCrown', 'trenchDiver', 'trenchCrown',
  'dojoHachimaki', 'dojoCrown', 'inkwHat', 'inkwCrown',
  'fairyHat', 'fairyCrown', 'racerHelm', 'racerCrown',
  'vampHat', 'vampCrown', 'autumnHat', 'autumnCrown',
  'pandaHat', 'pandaCrown', 'jokerHat', 'jokerCrown',
  'pagodHat', 'pagodCrown', 'stormHat', 'stormCrown',
  'lunarHat', 'lunarCrown', 'vikingHelm', 'vikingCrown',
  'safariHat', 'safariCrown', 'theatHat', 'theatCrown',
  'boreaHat', 'boreaCrown', 'venicHat', 'venicCrown',
  'olympWreath', 'olympCrown', 'sambaHat', 'sambaCrown',
  // 山海宝箱普通货
  'shanHatFeather', 'shanHatDragon',
  // 🏟 操场跑量里程碑专属
  'runHat',
];
const PET_IDS: PetId[] = [
  'none', 'orb', 'bird', 'cat', 'dragon', 'fairy', 'skull', 'fox', 'robot', 'star', 'flame', 'ghost',
  'nailong',
];

/**
 * 🐾 宠物怎么跟着你（背包里选）：
 * - `shoulder` 悬浮在肩旁（老样子，跟着跑跳）
 * - `behind` 贴地跟在身后（会跟着你转身，左右只是偏移）
 * - `still` 站在脚边不动（贴地、不浮动）
 */
export type PetFollow = 'shoulder' | 'behind' | 'still';
const PET_FOLLOW_IDS: PetFollow[] = ['shoulder', 'behind', 'still'];
/** 宠物在你左边还是右边（屏幕方向） */
export type PetSide = 'left' | 'right';
const PET_SIDE_IDS: PetSide[] = ['left', 'right'];
const TRAIL_IDS: TrailId[] = [
  'none', 'classic', 'fire', 'ice', 'rainbow', 'electric', 'leaf', 'void', 'gold', 'pixel',
  'neon',
  // 外星人降临限定
  'stardust',
  // 新主题宝箱专属击球拖尾
  'desTrailA', 'desTrailB', 'nimbTrailA', 'nimbTrailB',
  'confTrailA', 'confTrailB', 'bigtTrailA', 'bigtTrailB',
  'aegisTrailA', 'aegisTrailB', 'chanTrailA', 'chanTrailB',
  'arcanTrailA', 'arcanTrailB', 'relicTrailA', 'relicTrailB',
  'playTrailA', 'playTrailB', 'yuanTrailA', 'yuanTrailB',
  // 第三批新主题宝箱专属击球拖尾
  'pirateTrailA', 'pirateTrailB', 'steamTrailA', 'steamTrailB',
  'astroTrailA', 'astroTrailB', 'juraTrailA', 'juraTrailB',
  'mushTrailA', 'mushTrailB', 'tropicTrailA', 'tropicTrailB',
  'cryptTrailA', 'cryptTrailB', 'festivTrailA', 'festivTrailB',
  'sushiTrailA', 'sushiTrailB', 'wildTrailA', 'wildTrailB',
  // 第四批新主题宝箱专属击球拖尾
  'vulcTrailA', 'vulcTrailB', 'trenchTrailA', 'trenchTrailB',
  'dojoTrailA', 'dojoTrailB', 'inkwTrailA', 'inkwTrailB',
  'fairyTrailA', 'fairyTrailB', 'racerTrailA', 'racerTrailB',
  'vampTrailA', 'vampTrailB', 'autumnTrailA', 'autumnTrailB',
  'pandaTrailA', 'pandaTrailB', 'jokerTrailA', 'jokerTrailB',
  'pagodTrailA', 'pagodTrailB', 'stormTrailA', 'stormTrailB',
  'lunarTrailA', 'lunarTrailB', 'vikingTrailA', 'vikingTrailB',
  'safariTrailA', 'safariTrailB', 'theatTrailA', 'theatTrailB',
  'boreaTrailA', 'boreaTrailB', 'venicTrailA', 'venicTrailB',
  'olympTrailA', 'olympTrailB', 'sambaTrailA', 'sambaTrailB',
  'shanTrail',
  // 🏟 操场跑量里程碑专属
  'runTrail',
];
const SWING_TRAIL_IDS: SwingTrailId[] = [
  'none', 'slash', 'shock', 'cyclone', 'afterimage', 'bolt', 'blaze',
  'frostbite', 'orbit', 'wave', 'thorn', 'prism', 'voidcut',
  'tempo', 'atomic',
  // 外星人降临限定
  'beam',
  // 🧩 碎片兑换专属
  'shardedge',
  // 宇宙龙域限定
  'drabreath',
  // 新主题宝箱专属挥拍拖尾
  'desSwing', 'nimbSwing', 'confSwing', 'bigtSwing', 'aegisSwing',
  'chanSwing', 'arcanSwing', 'relicSwing', 'playSwing', 'yuanSwing',
  // 第三批新主题宝箱专属挥拍拖尾
  'pirateSwing', 'steamSwing', 'astroSwing', 'juraSwing', 'mushSwing',
  'tropicSwing', 'cryptSwing', 'festivSwing', 'sushiSwing', 'wildSwing',
  // 第四批新主题宝箱专属挥拍拖尾
  'vulcSwing', 'trenchSwing', 'dojoSwing', 'inkwSwing', 'fairySwing',
  'racerSwing', 'vampSwing', 'autumnSwing', 'pandaSwing', 'jokerSwing',
  'pagodSwing', 'stormSwing', 'lunarSwing', 'vikingSwing', 'safariSwing',
  'theatSwing', 'boreaSwing', 'venicSwing', 'olympSwing', 'sambaSwing',
  'shanSwing',
  // 🏟 操场跑量里程碑专属
  'runSwing',
];
const MOUNT_IDS: MountId[] = [
  'none', 'board', 'bubble', 'cloud', 'sword', 'horse', 'carpet',
  'star', 'dragon', 'rocket', 'throne',
  // 金币商店的普通款（1~3★）
  'scooter', 'log', 'box', 'spring', 'cart', 'broom', 'turtle', 'bike', 'hover', 'shark',
  'nailongRoll',
  // 外星人降临限定
  'ufo',
  // 宇宙龙域限定
  'stardrake',
  // 主题宝箱专属坐骑
  'dolphin', 'pumpkincart', 'gearbike', 'lion', 'kite',
  'crescent', 'firewheel', 'polarbear', 'dino', 'laserbike',
  // 新主题宝箱专属坐骑
  'desCamel', 'nimbCloud', 'confCake', 'bigtBall', 'aegisSteed',
  'chanBoat', 'arcanOrb', 'relicBone', 'playHorse', 'yuanBoat',
  // 第三批新主题宝箱专属坐骑
  'pirateMount', 'steamMount', 'astroMount', 'juraMount', 'mushMount',
  'tropicMount', 'cryptMount', 'festivMount', 'sushiMount', 'wildMount',
  // 第四批新主题宝箱专属坐骑
  'vulcHound', 'trenchRay', 'dojoCrest', 'inkwBoat', 'fairySnail',
  'racerKart', 'vampStallion', 'autumnBoar', 'pandaSled', 'jokerCarriage',
  'pagodPalanquin', 'stormGlider', 'lunarCloud', 'vikingDrakkar', 'safariElephant',
  'theatSpotlight', 'boreaStag', 'venicGondola', 'olympChariot', 'sambaFloat',
  'shanMountKun',
];
const RING_IDS: RingId[] = [
  'none', 'sprout', 'bamboo', 'dawn', 'gale', 'rock', 'blaze', 'sky', 'legend',
  'courtline',
  // 外星人降临限定
  'orbit',
  // 🧩 碎片兑换专属
  'shardring',
  // 宇宙龙域限定
  'draring',
  // 新主题宝箱专属地环
  'desRing', 'nimbRing', 'confRing', 'bigtRing', 'aegisRing',
  'chanRing', 'arcanRing', 'relicRing', 'playRing', 'yuanRing',
  // 第三批新主题宝箱专属地环
  'pirateRing', 'steamRing', 'astroRing', 'juraRing', 'mushRing',
  'tropicRing', 'cryptRing', 'festivRing', 'sushiRing', 'wildRing',
  // 第四批新主题宝箱专属地环
  'vulcRing', 'trenchRing', 'dojoRing', 'inkwRing', 'fairyRing',
  'racerRing', 'vampRing', 'autumnRing', 'pandaRing', 'jokerRing',
  'pagodRing', 'stormRing', 'lunarRing', 'vikingRing', 'safariRing',
  'theatRing', 'boreaRing', 'venicRing', 'olympRing', 'sambaRing',
  'shanRing',
  // 🏟 操场跑量里程碑专属
  'runRing',
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
  courtline: 0xfff2c8,
  orbit: 0x9fe8ff,
  shardring: 0xbfe8ff,
  draring: 0x8f6ad8,
  // 新主题宝箱专属地环
  desRing: 0xe0b56a, nimbRing: 0xdcefff, confRing: 0xffb7d5,
  bigtRing: 0xffd45c, aegisRing: 0xc0ccda, chanRing: 0x2f7a4a,
  arcanRing: 0xb46cff, relicRing: 0xd8c8a0, playRing: 0x4a90d9,
  yuanRing: 0xffd45c,
  // 第三批新主题宝箱专属地环
  pirateRing: 0xe8c86a, steamRing: 0xd8a24a, astroRing: 0x9fd8ff,
  juraRing: 0x9fe86a, mushRing: 0xa8ff7a, tropicRing: 0x5fe8d0,
  cryptRing: 0x9fd8a0, festivRing: 0xffffff, sushiRing: 0xd8c8a0,
  wildRing: 0xffd45c,
  // 第四批新主题宝箱专属地环
  vulcRing: 0xff5a1a, trenchRing: 0x5fd0c0,
  dojoRing: 0xc0392b, inkwRing: 0x3a4048,
  fairyRing: 0xffb7d5, racerRing: 0xffd45c,
  vampRing: 0xc0203a, autumnRing: 0xd4622a,
  pandaRing: 0x8fbf5a, jokerRing: 0xe8404a,
  pagodRing: 0xffd45c, stormRing: 0x9fd8ff,
  lunarRing: 0xe8f0ff, vikingRing: 0xc0c8d0,
  safariRing: 0xffb03a, theatRing: 0xffd45c,
  boreaRing: 0x7dffc4, venicRing: 0x5fe8d0,
  olympRing: 0xffd45c, sambaRing: 0xff8ad4,
  shanRing: 0x9fe8c0,
  // 🏟 操场跑量里程碑专属
  runRing: 0x39d0a0,
};
const AURA_IDS: AuraId[] = [
  'none', 'emerald', 'rose', 'violet', 'king', 'frost', 'gold', 'toxic', 'crimson', 'rainbow',
  'flame', 'electric', 'snow', 'bubble', 'orbit', 'gear', 'holy', 'venom', 'sakura', 'void', 'pixel', 'storm',
  'aurora', 'lava', 'ghost', 'neon', 'prism', 'thorn', 'chain', 'plume', 'coin', 'note', 'heart', 'skull', 'sparkle', 'moon', 'sun', 'clock', 'ring', 'wind', 'sand', 'rune', 'hex', 'radar', 'tide', 'matrix',
  'firefly', 'vortex', 'nebula', 'eclipse', 'dawn', 'dusk', 'mist', 'thundercloud', 'golddust', 'frostbite', 'ember', 'sparkstorm', 'leafwind', 'petalrain', 'snowstorm', 'runering', 'starfield', 'haloRing', 'hexflame', 'bubblefield', 'prismatic', 'spring', 'autumn', 'voidRift',
  'blackhole', 'supernova', 'quantum', 'laserscan', 'holo', 'crystalline', 'wisteria', 'coral', 'beacon', 'spiral',
  'phantom', 'miasma', 'laurel', 'emberfall', 'static', 'tidalwave', 'sandstorm', 'auroraring', 'singularity', 'rebirth',
  'spotlight',
  'dorsal',
  'warp',
  'shardglow',
  'dranebula',
  // 新主题宝箱专属光环
  'desSandAura', 'desSunAura', 'nimbWindAura', 'nimbStarAura',
  'confSugarAura', 'confHeartAura', 'bigtConfetti', 'bigtSpotAura',
  'aegisBanner', 'aegisSteel', 'chanInkAura', 'chanPetalAura',
  'arcanRuneAura', 'arcanStarAura', 'relicDustAura', 'relicAmberAura',
  'playBallAura', 'playSparkAura', 'yuanFireAura', 'yuanLanternAura',
  // 第三批新主题宝箱专属光环
  'pirateAuraA', 'pirateAuraB', 'steamAuraA', 'steamAuraB', 'astroAuraA',
  'astroAuraB', 'juraAuraA', 'juraAuraB', 'mushAuraA', 'mushAuraB',
  'tropicAuraA', 'tropicAuraB', 'cryptAuraA', 'cryptAuraB', 'festivAuraA',
  'festivAuraB',   'sushiAuraA', 'sushiAuraB', 'wildAuraA', 'wildAuraB',
  // 第四批新主题宝箱专属光环
  'vulcAuraA', 'vulcAuraB', 'trenchAuraA', 'trenchAuraB',
  'dojoAuraA', 'dojoAuraB', 'inkwAuraA', 'inkwAuraB',
  'fairyAuraA', 'fairyAuraB', 'racerAuraA', 'racerAuraB',
  'vampAuraA', 'vampAuraB', 'autumnAuraA', 'autumnAuraB',
  'pandaAuraA', 'pandaAuraB', 'jokerAuraA', 'jokerAuraB',
  'pagodAuraA', 'pagodAuraB', 'stormAuraA', 'stormAuraB',
  'lunarAuraA', 'lunarAuraB', 'vikingAuraA', 'vikingAuraB',
  'safariAuraA', 'safariAuraB', 'theatAuraA', 'theatAuraB',
  'boreaAuraA', 'boreaAuraB', 'venicAuraA', 'venicAuraB',
  'olympAuraA', 'olympAuraB', 'sambaAuraA', 'sambaAuraB',
  'shanAuraSpirit', 'shanAuraStar',
  // 🏟 操场跑量里程碑专属
  'runAura',
];
const RACKET_SKIN_IDS: RacketSkinId[] = [
  'default', 'ice', 'gold', 'flame', 'thunder', 'void', 'rainbow', 'neon',
  'circuit', 'spike', 'holy', 'shadow', 'crystal', 'glitch', 'bamboo', 'carbon',
  'plasma', 'galaxy', 'lava', 'frost', 'rune', 'thorn', 'web', 'vine', 'mirror', 'matrix', 'bone', 'zebra', 'camo', 'star', 'scale', 'smoke',
  'aurora', 'nebula', 'onyx', 'ivory', 'amber', 'jade', 'ruby', 'sapphire', 'toxic', 'ember',
  'quantum', 'obsidian', 'sunsteel', 'moonlace', 'rosebranch', 'starpiercer', 'tsunami', 'magma', 'stormline', 'phoenixF',
  'dragonbone', 'iceberg', 'goldthread', 'coralrim', 'chrono', 'holo', 'gravity', 'sonic', 'willow', 'blossom',
  'wood',
  // 外星人降临限定
  'meteorite',
  // 新主题宝箱专属球拍皮肤
  'desRacketA', 'desRacketB', 'nimbRacketA', 'nimbRacketB',
  'confRacketA', 'confRacketB', 'bigtRacketA', 'bigtRacketB',
  'aegisRacketA', 'aegisRacketB', 'chanRacketA', 'chanRacketB',
  'arcanRacketA', 'arcanRacketB', 'relicRacketA', 'relicRacketB',
  'playRacketA', 'playRacketB', 'yuanRacketA', 'yuanRacketB',
  // 第三批新主题宝箱专属球拍皮肤
  'pirateRacketA', 'pirateRacketB', 'steamRacketA', 'steamRacketB',
  'astroRacketA', 'astroRacketB', 'juraRacketA', 'juraRacketB',
  'mushRacketA', 'mushRacketB', 'tropicRacketA', 'tropicRacketB',
  'cryptRacketA', 'cryptRacketB', 'festivRacketA', 'festivRacketB',
  'sushiRacketA', 'sushiRacketB', 'wildRacketA', 'wildRacketB',
  // 第四批新主题宝箱专属球拍皮肤
  'vulcRacketA', 'vulcRacketB', 'trenchRacketA', 'trenchRacketB',
  'dojoRacketA', 'dojoRacketB', 'inkwRacketA', 'inkwRacketB',
  'fairyRacketA', 'fairyRacketB', 'racerRacketA', 'racerRacketB',
  'vampRacketA', 'vampRacketB', 'autumnRacketA', 'autumnRacketB',
  'pandaRacketA', 'pandaRacketB', 'jokerRacketA', 'jokerRacketB',
  'pagodRacketA', 'pagodRacketB', 'stormRacketA', 'stormRacketB',
  'lunarRacketA', 'lunarRacketB', 'vikingRacketA', 'vikingRacketB',
  'safariRacketA', 'safariRacketB', 'theatRacketA', 'theatRacketB',
  'boreaRacketA', 'boreaRacketB', 'venicRacketA', 'venicRacketB',
  'olympRacketA', 'olympRacketB', 'sambaRacketA', 'sambaRacketB',
  'shanRacketA', 'shanRacketB',
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
  turbo: 0x9fb6d8,
  // 新主题宝箱专属翅膀
  desSandWing: 0xe0b56a, desDuneWing: 0xd89a4a,
  nimbWindWing: 0xdcefff, nimbFeatherWing: 0xffffff,
  confSugarWing: 0xffc4da, confCandyWing: 0xff8ad4,
  bigtTentWing: 0xffd45c, bigtConfettiWing: 0xff8a6a,
  aegisShieldWing: 0xaab4c2, aegisBladeWing: 0xdfe8f5,
  chanFanWing: 0x2f7a4a, chanLeafWing: 0x8fd45a,
  arcanRuneWing: 0x9a86e8, arcanStarWing: 0xb46cff,
  relicBoneWing: 0xd8c8a0, relicAmberWing: 0xffb02a,
  playBlockWing: 0x4a90d9, playKiteWing: 0xffc04a,
  yuanLanternWing: 0xe8404a, yuanFireWing: 0xff8a3c,
  // 第三批新主题宝箱专属翅膀
  pirateWingA: 0xd8c8a0, pirateWingB: 0x3a8a8a,
  steamWingA: 0xd8a24a, steamWingB: 0xb0b8c0,
  astroWingA: 0x4a8ad8, astroWingB: 0xffb03a,
  juraWingA: 0x7ed957, juraWingB: 0x8a7a4a,
  mushWingA: 0xa8ff7a, mushWingB: 0xc08a5a,
  tropicWingA: 0x5fe8d0, tropicWingB: 0xffb7a0,
  cryptWingA: 0x4a4a5a, cryptWingB: 0x8a8a9a,
  festivWingA: 0xffffff, festivWingB: 0xffd45c,
  sushiWingA: 0xff8a6a, sushiWingB: 0xd8c8a0,
  wildWingA: 0x8a6a4a, wildWingB: 0xd8c8a0,
  // 第四批新主题宝箱专属翅膀
  vulcWingA: 0xff7a2a, vulcWingB: 0xff5a1a,
  trenchWingA: 0x5fd0c0, trenchWingB: 0x2a6a7a,
  dojoWingA: 0xf0eee4, dojoWingB: 0xe8404a,
  inkwWingA: 0xe8e4d8, inkwWingB: 0xd8d4c4,
  fairyWingA: 0xffb7d5, fairyWingB: 0xfff2b0,
  racerWingA: 0xdfe8f5, racerWingB: 0xffd45c,
  vampWingA: 0x2a1a3a, vampWingB: 0x4a2a6a,
  autumnWingA: 0xd4622a, autumnWingB: 0xffd45c,
  pandaWingA: 0x8fbf5a, pandaWingB: 0xdcefff,
  jokerWingA: 0xe8404a, jokerWingB: 0xff8ad4,
  pagodWingA: 0xf0e8d8, pagodWingB: 0xffd45c,
  stormWingA: 0xbfe8ff, stormWingB: 0x9fd8ff,
  lunarWingA: 0xe8f0ff, lunarWingB: 0xffe89a,
  vikingWingA: 0x3a3a44, vikingWingB: 0x8fb4de,
  safariWingA: 0xd8c8a0, safariWingB: 0xff9a3c,
  theatWingA: 0xff8ad4, theatWingB: 0xfff0c0,
  boreaWingA: 0xbfe8ff, boreaWingB: 0x7dffc4,
  venicWingA: 0xf0f4f8, venicWingB: 0x5fe8d0,
  olympWingA: 0xf8f4ea, olympWingB: 0xffd45c,
  sambaWingA: 0xff8ad4, sambaWingB: 0xffd45c,
  shanWingFeather: 0xd8e8ff, shanWingCloud: 0x9fe8c0,
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
  | 'circuit'
  | 'turbo';

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
  turbo: { kind: 'turbo', feathers: 2, len: 46, spread: 0.5, w: 14 },
  // 新主题宝箱专属翅膀（复用既有 silhouette kind，只换长短与配色）
  desSandWing: { kind: 'fin', feathers: 4, len: 56, spread: 0.6, w: 13 },
  desDuneWing: { kind: 'membrane', feathers: 4, len: 60, spread: 0.5, w: 11 },
  nimbWindWing: { kind: 'feather', feathers: 4, len: 62, spread: 0.78, w: 8 },
  nimbFeatherWing: { kind: 'feather', feathers: 5, len: 66, spread: 0.86, w: 7 },
  confSugarWing: { kind: 'butterfly', feathers: 2, len: 48, spread: 0.95, w: 13 },
  confCandyWing: { kind: 'butterfly', feathers: 3, len: 52, spread: 0.9, w: 11 },
  bigtTentWing: { kind: 'membrane', feathers: 4, len: 58, spread: 0.55, w: 10 },
  bigtConfettiWing: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.62, w: 8 },
  aegisShieldWing: { kind: 'mech', feathers: 3, len: 54, spread: 0.46, w: 12 },
  aegisBladeWing: { kind: 'blade', feathers: 5, len: 62, spread: 0.68, w: 6 },
  chanFanWing: { kind: 'sail', feathers: 1, len: 68, spread: 0.5, w: 20 },
  chanLeafWing: { kind: 'leaf', feathers: 4, len: 56, spread: 0.7, w: 12 },
  arcanRuneWing: { kind: 'circuit', feathers: 4, len: 58, spread: 0.56, w: 8 },
  arcanStarWing: { kind: 'feather', feathers: 5, len: 64, spread: 0.82, w: 8 },
  relicBoneWing: { kind: 'membrane', feathers: 4, len: 60, spread: 0.48, w: 10 },
  relicAmberWing: { kind: 'crystal', feathers: 4, len: 52, spread: 0.56, w: 7 },
  playBlockWing: { kind: 'mech', feathers: 3, len: 50, spread: 0.42, w: 11 },
  playKiteWing: { kind: 'sail', feathers: 1, len: 64, spread: 0.5, w: 18 },
  yuanLanternWing: { kind: 'ribbon', feathers: 4, len: 60, spread: 0.6, w: 8 },
  yuanFireWing: { kind: 'flame', feathers: 4, len: 58, spread: 0.6, w: 8 },
  // 山海宝箱普通货
  // 第三批新主题宝箱专属翅膀（复用既有 silhouette kind）
  pirateWingA: { kind: 'sail', feathers: 1, len: 68, spread: 0.5, w: 20 },
  pirateWingB: { kind: 'fin', feathers: 4, len: 58, spread: 0.6, w: 14 },
  steamWingA: { kind: 'mech', feathers: 4, len: 56, spread: 0.5, w: 11 },
  steamWingB: { kind: 'sail', feathers: 1, len: 66, spread: 0.5, w: 20 },
  astroWingA: { kind: 'mech', feathers: 3, len: 54, spread: 0.46, w: 12 },
  astroWingB: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.6, w: 8 },
  juraWingA: { kind: 'leaf', feathers: 4, len: 56, spread: 0.7, w: 12 },
  juraWingB: { kind: 'membrane', feathers: 5, len: 64, spread: 0.5, w: 11 },
  mushWingA: { kind: 'butterfly', feathers: 3, len: 50, spread: 0.9, w: 12 },
  mushWingB: { kind: 'leaf', feathers: 5, len: 56, spread: 0.72, w: 12 },
  tropicWingA: { kind: 'fin', feathers: 4, len: 58, spread: 0.62, w: 14 },
  tropicWingB: { kind: 'ribbon', feathers: 5, len: 62, spread: 0.58, w: 8 },
  cryptWingA: { kind: 'membrane', feathers: 4, len: 58, spread: 0.5, w: 11 },
  cryptWingB: { kind: 'ghost', feathers: 3, len: 58, spread: 0.6, w: 10 },
  festivWingA: { kind: 'feather', feathers: 5, len: 62, spread: 0.8, w: 8 },
  festivWingB: { kind: 'crystal', feathers: 4, len: 50, spread: 0.56, w: 7 },
  sushiWingA: { kind: 'fin', feathers: 3, len: 60, spread: 0.5, w: 15 },
  sushiWingB: { kind: 'blade', feathers: 4, len: 60, spread: 0.66, w: 6 },
  wildWingA: { kind: 'feather', feathers: 4, len: 60, spread: 0.72, w: 9 },
  wildWingB: { kind: 'ribbon', feathers: 3, len: 58, spread: 0.56, w: 8 },
  // 第四批新主题宝箱专属翅膀（复用既有 silhouette kind）
  vulcWingA: { kind: 'flame', feathers: 4, len: 58, spread: 0.6, w: 8 },
  vulcWingB: { kind: 'membrane', feathers: 5, len: 62, spread: 0.52, w: 10 },
  trenchWingA: { kind: 'fin', feathers: 4, len: 58, spread: 0.62, w: 13 },
  trenchWingB: { kind: 'membrane', feathers: 5, len: 64, spread: 0.5, w: 11 },
  dojoWingA: { kind: 'feather', feathers: 4, len: 60, spread: 0.72, w: 9 },
  dojoWingB: { kind: 'membrane', feathers: 5, len: 64, spread: 0.5, w: 10 },
  inkwWingA: { kind: 'ribbon', feathers: 3, len: 60, spread: 0.55, w: 7 },
  inkwWingB: { kind: 'feather', feathers: 5, len: 64, spread: 0.82, w: 8 },
  fairyWingA: { kind: 'butterfly', feathers: 2, len: 48, spread: 0.95, w: 13 },
  fairyWingB: { kind: 'feather', feathers: 5, len: 64, spread: 0.84, w: 8 },
  racerWingA: { kind: 'blade', feathers: 4, len: 60, spread: 0.66, w: 7 },
  racerWingB: { kind: 'turbo', feathers: 2, len: 48, spread: 0.5, w: 13 },
  vampWingA: { kind: 'membrane', feathers: 5, len: 62, spread: 0.5, w: 10 },
  vampWingB: { kind: 'ghost', feathers: 3, len: 58, spread: 0.6, w: 10 },
  autumnWingA: { kind: 'leaf', feathers: 4, len: 58, spread: 0.7, w: 11 },
  autumnWingB: { kind: 'feather', feathers: 5, len: 64, spread: 0.8, w: 8 },
  pandaWingA: { kind: 'leaf', feathers: 4, len: 58, spread: 0.68, w: 11 },
  pandaWingB: { kind: 'feather', feathers: 4, len: 62, spread: 0.76, w: 8 },
  jokerWingA: { kind: 'sail', feathers: 1, len: 68, spread: 0.5, w: 20 },
  jokerWingB: { kind: 'butterfly', feathers: 3, len: 52, spread: 0.9, w: 12 },
  pagodWingA: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.6, w: 8 },
  pagodWingB: { kind: 'membrane', feathers: 5, len: 64, spread: 0.5, w: 11 },
  stormWingA: { kind: 'feather', feathers: 4, len: 60, spread: 0.74, w: 8 },
  stormWingB: { kind: 'membrane', feathers: 5, len: 62, spread: 0.52, w: 10 },
  lunarWingA: { kind: 'ribbon', feathers: 3, len: 60, spread: 0.55, w: 7 },
  lunarWingB: { kind: 'feather', feathers: 5, len: 66, spread: 0.8, w: 8 },
  vikingWingA: { kind: 'feather', feathers: 4, len: 58, spread: 0.7, w: 9 },
  vikingWingB: { kind: 'sail', feathers: 1, len: 70, spread: 0.5, w: 20 },
  safariWingA: { kind: 'feather', feathers: 4, len: 60, spread: 0.7, w: 9 },
  safariWingB: { kind: 'flame', feathers: 4, len: 60, spread: 0.62, w: 8 },
  theatWingA: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.6, w: 8 },
  theatWingB: { kind: 'crystal', feathers: 4, len: 54, spread: 0.58, w: 7 },
  boreaWingA: { kind: 'crystal', feathers: 4, len: 56, spread: 0.56, w: 7 },
  boreaWingB: { kind: 'ribbon', feathers: 4, len: 62, spread: 0.6, w: 8 },
  venicWingA: { kind: 'feather', feathers: 4, len: 60, spread: 0.72, w: 9 },
  venicWingB: { kind: 'fin', feathers: 4, len: 60, spread: 0.62, w: 13 },
  olympWingA: { kind: 'feather', feathers: 5, len: 62, spread: 0.8, w: 9 },
  olympWingB: { kind: 'membrane', feathers: 5, len: 64, spread: 0.5, w: 10 },
  sambaWingA: { kind: 'feather', feathers: 5, len: 62, spread: 0.8, w: 8 },
  sambaWingB: { kind: 'crystal', feathers: 4, len: 54, spread: 0.6, w: 7 },
  shanWingFeather: { kind: 'feather', feathers: 5, len: 66, spread: 0.85, w: 7 },
  shanWingCloud: { kind: 'leaf', feathers: 4, len: 58, spread: 0.72, w: 12 },
};

export type CapeKind =
  | 'cloth' | 'flame' | 'feather' | 'tatter' | 'royal' | 'split' | 'scales' | 'streak' | 'towel'
  // 外星人降临：反重力——下摆浮起来、往上游走的光带
  | 'antigrav'
  // 后加的主题披风：每种一个独立剪影（见 drawCape）
  | 'candywrap' | 'tentflap' | 'flag' | 'leafcloak' | 'pelt' | 'lanternrow'
  | 'talon' | 'shellfan' | 'ribboncurl' | 'puffcloud' | 'inkflow' | 'gearhang'
  | 'petalrain' | 'silkveil' | 'frostveil' | 'starpelt';

export const CAPE_COLORS: Record<CapeId, number> = {
  none: 0x000000,
  hero: 0xd4542c,
  shadowCape: 0x4a2a7a,
  storm: 0x5f8bff,
  emberCape: 0xff7a2a,
  frostCape: 0xbfe8ff,
  leafCape: 0x7ed957,
  royal: 0xb02a55,
  void: 0x7a3cc0,
  dragonCape: 0x53e0a0,
  angelCape: 0xfff2c4,
  phoenixCape: 0xff5a2a,
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
  towel: 0xf3ede0,
  scalecape: 0x3a7d44,
  antigrav: 0x8fe0ff,
  shardcape: 0x9fe8ff,
  drakewing: 0x6a4ad8,
  // 主题宝箱专属披风
  seamist: 0x35a8b8,
  batcape: 0x3a2a5a,
  slagcape: 0x7f8fa8,
  ermine: 0xf3ede0,
  petalveil: 0xffc4da,
  starmap: 0x2a3a8a,
  cinder: 0x8a2a1a,
  icemist: 0xd8f2ff,
  canopy: 0x3a8a3a,
  tapecape: 0xe83a9a,
  // 新主题宝箱专属披风
  desCloak: 0xc9803a, desOasis: 0xe0b56a,
  nimbVeil: 0xdcefff, nimbSail: 0xeaf6ff,
  confApron: 0xffd0e0, confRibbonCape: 0xff8ad4,
  bigtCape: 0xc0392b, bigtCurtain: 0x8a1a4a,
  aegisBanner: 0x8fb4de, aegisRoyal: 0x3a5a8a,
  chanRobe: 0x2f7a4a, chanInkCape: 0x1e3a2a,
  arcanCloak: 0x5540a0, arcanMantle: 0x7a5ad8,
  relicHide: 0x7a6440, relicDustCape: 0xd8c8a0,
  playCape: 0x4a90d9, playRibbonCape: 0xffc04a,
  yuanSilk: 0xffd45c, yuanLanternCape: 0xc0392b,
  // 第三批新主题宝箱专属披风
  pirateCape: 0x8a3a2a, pirateCloak: 0xd8c8a0,
  steamCape: 0x6a5236, steamCloak: 0x8a6a3a,
  astroCape: 0xd8e8ff, astroCloak: 0x2f4570,
  juraCape: 0x7a6440, juraCloak: 0x395f2a,
  mushCape: 0x5a7a3a, mushCloak: 0x8a5a8a,
  tropicCape: 0x2f9a8a, tropicCloak: 0xbfe8f0,
  cryptCape: 0x4a4a44, cryptCloak: 0x6a6a72,
  festivCape: 0xd23b3b, festivCloak: 0x2c6a44,
  sushiCape: 0x2a3a5a, sushiCloak: 0xd8c8a0,
  wildCape: 0x8a6a3a, wildCloak: 0x6a4a2a,
  // 第四批新主题宝箱专属披风
  vulcCape: 0x5a3a2a, vulcCloak: 0xff5a1a,
  trenchCape: 0x0d4258, trenchCloak: 0x2a6a7a,
  dojoCape: 0xf0eee4, dojoCloak: 0xe8404a,
  inkwCape: 0xe8e4d8, inkwCloak: 0x2a2e36,
  fairyCape: 0xffb7d5, fairyCloak: 0x5aa85a,
  racerCape: 0xe8404a, racerCloak: 0x1e222a,
  vampCape: 0x1a1420, vampCloak: 0x4a1a4a,
  autumnCape: 0xd8b070, autumnCloak: 0xd4622a,
  pandaCape: 0x8a6a4a, pandaCloak: 0x5f8a3a,
  jokerCape: 0x8a2a6a, jokerCloak: 0x4a2a8a,
  pagodCape: 0x6a2a20, pagodCloak: 0xffd45c,
  stormCape: 0xbfe8ff, stormCloak: 0x3d4c5c,
  lunarCape: 0xe8f0ff, lunarCloak: 0xd8e8ff,
  vikingCape: 0x6a5240, vikingCloak: 0x8fb4de,
  safariCape: 0xd8c8a0, safariCloak: 0x8a6a3a,
  theatCape: 0xa82a4a, theatCloak: 0x2a1a2e,
  boreaCape: 0x8a705a, boreaCloak: 0x7dffc4,
  venicCape: 0x2a5a8a, venicCloak: 0xe8404a,
  olympCape: 0xf0ead8, olympCloak: 0x4a5a78,
  sambaCape: 0xffd45c, sambaCloak: 0x2a9a5a,
  shanCapeScale: 0x2f8a6a, shanCapeMist: 0xbfe8d8,
};

/** cape silhouette: length, base width and the kind of motion it uses */
export const CAPE_SHAPE: Record<CapeId, { kind: CapeKind; len: number; w: number }> = {
  none: { kind: 'cloth', len: 0, w: 0 },
  hero: { kind: 'cloth', len: 54, w: 26 },
  shadowCape: { kind: 'tatter', len: 56, w: 28 },
  storm: { kind: 'streak', len: 50, w: 26 },
  emberCape: { kind: 'flame', len: 58, w: 26 },
  frostCape: { kind: 'cloth', len: 52, w: 28 },
  leafCape: { kind: 'feather', len: 50, w: 28 },
  royal: { kind: 'royal', len: 62, w: 32 },
  void: { kind: 'tatter', len: 60, w: 30 },
  dragonCape: { kind: 'cloth', len: 58, w: 30 },
  angelCape: { kind: 'feather', len: 56, w: 30 },
  phoenixCape: { kind: 'flame', len: 60, w: 28 },
  knight: { kind: 'flag', len: 56, w: 30 },
  mage: { kind: 'royal', len: 64, w: 34 },
  ninja: { kind: 'split', len: 48, w: 24 },
  winter: { kind: 'pelt', len: 54, w: 32 },
  autumn: { kind: 'petalrain', len: 52, w: 30 },
  ocean: { kind: 'cloth', len: 56, w: 28 },
  starCape: { kind: 'split', len: 62, w: 30 },
  voidCape: { kind: 'inkflow', len: 64, w: 32 },
  goldRoyal: { kind: 'flag', len: 66, w: 34 },
  dragonfire: { kind: 'flame', len: 62, w: 30 },
  auroraCape: { kind: 'silkveil', len: 58, w: 28 },
  stormlord: { kind: 'starpelt', len: 60, w: 30 },
  sakuraCape: { kind: 'petalrain', len: 54, w: 30 },
  ironclad: { kind: 'scales', len: 58, w: 32 },
  pharaoh: { kind: 'silkveil', len: 64, w: 32 },
  emberwind: { kind: 'streak', len: 58, w: 26 },
  abyssCape: { kind: 'inkflow', len: 62, w: 30 },
  jadeRobe: { kind: 'scales', len: 62, w: 32 },
  plaguecoat: { kind: 'petalrain', len: 56, w: 28 },
  captainCape: { kind: 'flag', len: 56, w: 30 },
  stardust: { kind: 'feather', len: 56, w: 30 },
  warlord: { kind: 'pelt', len: 60, w: 32 },
  frostlord: { kind: 'royal', len: 58, w: 32 },
  venomCape: { kind: 'gearhang', len: 58, w: 30 },
  cometCape: { kind: 'streak', len: 64, w: 26 },
  thunderCape: { kind: 'antigrav', len: 60, w: 28 },
  mooncloak: { kind: 'frostveil', len: 56, w: 30 },
  crimsonlord: { kind: 'lanternrow', len: 64, w: 30 },
  voidwalker: { kind: 'puffcloud', len: 62, w: 30 },
  goldenflame: { kind: 'flame', len: 62, w: 30 },
  towel: { kind: 'towel', len: 40, w: 24 },
  scalecape: { kind: 'scales', len: 60, w: 30 },
  antigrav: { kind: 'antigrav', len: 58, w: 30 },
  shardcape: { kind: 'frostveil', len: 56, w: 30 },
  drakewing: { kind: 'scales', len: 62, w: 32 },
  // 主题宝箱专属披风：每个主题内**剪影不重样**
  seamist: { kind: 'silkveil', len: 56, w: 28 },   // 深海雾纱
  batcape: { kind: 'split', len: 58, w: 32 },      // 蝙蝠斗篷（分叉翼）
  slagcape: { kind: 'gearhang', len: 52, w: 28 },  // 焊渣（齿轮帘）
  ermine: { kind: 'royal', len: 62, w: 32 },       // 白貂
  petalveil: { kind: 'silkveil', len: 54, w: 30 }, // 花瓣纱
  starmap: { kind: 'starpelt', len: 62, w: 30 },   // 星图
  cinder: { kind: 'pelt', len: 60, w: 32 },        // 火山灰兽皮
  icemist: { kind: 'frostveil', len: 54, w: 30 },  // 冰雾（冰棱帘）
  canopy: { kind: 'leafcloak', len: 56, w: 30 },   // 树冠（层叠叶）
  tapecape: { kind: 'ribboncurl', len: 54, w: 26 }, // 磁带（卷曲）
  // 新主题宝箱专属披风
  // 每个主题两种各不相同的剪影（见 drawCape 的新 kind）
  desCloak: { kind: 'pelt', len: 54, w: 28 },          // 旅人兽皮
  desOasis: { kind: 'silkveil', len: 60, w: 28 },       // 绿洲纱帐
  nimbVeil: { kind: 'puffcloud', len: 56, w: 30 },      // 云团
  nimbSail: { kind: 'cloth', len: 58, w: 28 },          // 云帆
  confApron: { kind: 'candywrap', len: 52, w: 28 },     // 糖霜卷帘
  confRibbonCape: { kind: 'ribboncurl', len: 56, w: 24 }, // 卷曲缎带
  bigtCape: { kind: 'tentflap', len: 58, w: 32 },       // 帐篷幕布
  bigtCurtain: { kind: 'split', len: 62, w: 32 },       // 分叉帷幕
  aegisBanner: { kind: 'flag', len: 62, w: 30 },        // 战旗
  aegisRoyal: { kind: 'royal', len: 66, w: 34 },        // 王袍
  chanRobe: { kind: 'inkflow', len: 62, w: 30 },        // 水墨垂流
  chanInkCape: { kind: 'streak', len: 58, w: 26 },      // 墨迹拉丝
  arcanCloak: { kind: 'starpelt', len: 60, w: 30 },     // 星幕
  arcanMantle: { kind: 'feather', len: 62, w: 30 },     // 星辉羽
  relicHide: { kind: 'tatter', len: 58, w: 30 },        // 破旧兽皮
  relicDustCape: { kind: 'petalrain', len: 60, w: 30 }, // 尘土飘落
  playCape: { kind: 'gearhang', len: 52, w: 30 },       // 齿轮帘
  playRibbonCape: { kind: 'antigrav', len: 56, w: 26 }, // 反重力彩带
  yuanSilk: { kind: 'flame', len: 58, w: 28 },          // 焰火绸
  yuanLanternCape: { kind: 'lanternrow', len: 62, w: 30 }, // 灯笼帘
  // 第三批新主题宝箱专属披风（每个主题两种各不相同的剪影）
  pirateCape: { kind: 'tatter', len: 58, w: 30 },        // 破帆布
  pirateCloak: { kind: 'flag', len: 60, w: 30 },         // 海盗旗
  steamCape: { kind: 'tentflap', len: 56, w: 30 },       // 工装帆布
  steamCloak: { kind: 'gearhang', len: 58, w: 30 },      // 齿轮帘
  astroCape: { kind: 'cloth', len: 56, w: 28 },          // 宇航布
  astroCloak: { kind: 'starpelt', len: 60, w: 30 },      // 星图
  juraCape: { kind: 'pelt', len: 56, w: 30 },            // 兽皮
  juraCloak: { kind: 'leafcloak', len: 56, w: 30 },      // 蕨叶层叠
  mushCape: { kind: 'puffcloud', len: 54, w: 30 },       // 孢子云
  mushCloak: { kind: 'frostveil', len: 56, w: 30 },      // 菌丝帘
  tropicCape: { kind: 'scales', len: 58, w: 30 },        // 鱼鳞
  tropicCloak: { kind: 'puffcloud', len: 56, w: 30 },    // 泡沫云
  cryptCape: { kind: 'tatter', len: 56, w: 30 },         // 破布
  cryptCloak: { kind: 'gearhang', len: 56, w: 30 },      // 锁链帘
  festivCape: { kind: 'pelt', len: 56, w: 32 },          // 红绒
  festivCloak: { kind: 'royal', len: 58, w: 32 },        // 圣诞王袍
  sushiCape: { kind: 'split', len: 54, w: 30 },          // 暖帘
  sushiCloak: { kind: 'streak', len: 56, w: 26 },        // 条纹拉丝
  wildCape: { kind: 'pelt', len: 56, w: 32 },            // 牛仔兽皮
  wildCloak: { kind: 'tatter', len: 56, w: 30 },         // 风沙破布
  // 第四批新主题宝箱专属披风（每个主题两种各不相同的剪影）
  vulcCape: { kind: 'tatter', len: 54, w: 28 },          // 焦土破布
  vulcCloak: { kind: 'flame', len: 58, w: 28 },          // 岩浆火舌
  trenchCape: { kind: 'silkveil', len: 56, w: 28 },      // 水幕纱
  trenchCloak: { kind: 'scales', len: 58, w: 30 },       // 海妖鳞
  dojoCape: { kind: 'cloth', len: 54, w: 26 },           // 修行素布
  dojoCloak: { kind: 'flag', len: 60, w: 30 },           // 龙旗
  inkwCape: { kind: 'cloth', len: 56, w: 28 },           // 素衫
  inkwCloak: { kind: 'inkflow', len: 62, w: 30 },        // 泼墨
  fairyCape: { kind: 'petalrain', len: 54, w: 30 },      // 花瓣雨
  fairyCloak: { kind: 'leafcloak', len: 56, w: 30 },     // 藤蔓层叠
  racerCape: { kind: 'streak', len: 56, w: 26 },         // 尾焰拉丝
  racerCloak: { kind: 'flag', len: 60, w: 30 },          // 格子旗
  vampCape: { kind: 'royal', len: 62, w: 32 },           // 高领王袍
  vampCloak: { kind: 'silkveil', len: 58, w: 28 },       // 血雾纱
  autumnCape: { kind: 'pelt', len: 56, w: 32 },          // 麦束兽皮
  autumnCloak: { kind: 'petalrain', len: 58, w: 30 },    // 落叶雨
  pandaCape: { kind: 'pelt', len: 54, w: 30 },           // 蓑衣
  pandaCloak: { kind: 'leafcloak', len: 56, w: 30 },     // 竹帘叶
  jokerCape: { kind: 'ribboncurl', len: 54, w: 26 },     // 魔术卷带
  jokerCloak: { kind: 'royal', len: 62, w: 32 },         // 王牌王袍
  pagodCape: { kind: 'cloth', len: 58, w: 28 },          // 战袍
  pagodCloak: { kind: 'scales', len: 60, w: 30 },        // 金鳞
  stormCape: { kind: 'silkveil', len: 56, w: 28 },       // 风幕纱
  stormCloak: { kind: 'streak', len: 58, w: 26 },        // 雷暴拉丝
  lunarCape: { kind: 'cloth', len: 54, w: 28 },          // 月白布
  lunarCloak: { kind: 'silkveil', len: 58, w: 28 },      // 桂香纱
  vikingCape: { kind: 'pelt', len: 58, w: 32 },          // 粗布兽皮
  vikingCloak: { kind: 'flag', len: 60, w: 30 },         // 战旗
  safariCape: { kind: 'cloth', len: 54, w: 28 },         // 帆布
  safariCloak: { kind: 'tatter', len: 56, w: 30 },       // 猎装破布
  theatCape: { kind: 'royal', len: 60, w: 32 },          // 天鹅绒
  theatCloak: { kind: 'starpelt', len: 60, w: 30 },      // 谢幕星幕
  boreaCape: { kind: 'pelt', len: 56, w: 32 },           // 兽裘
  boreaCloak: { kind: 'silkveil', len: 58, w: 28 },      // 极光纱
  venicCape: { kind: 'cloth', len: 54, w: 28 },          // 船夫披肩
  venicCloak: { kind: 'silkveil', len: 58, w: 28 },      // 面具纱
  olympCape: { kind: 'cloth', len: 58, w: 28 },          // 托加
  olympCloak: { kind: 'royal', len: 62, w: 32 },         // 神谕王袍
  sambaCape: { kind: 'ribboncurl', len: 54, w: 26 },     // 流苏卷带
  sambaCloak: { kind: 'feather', len: 58, w: 30 },       // 羽袍
  shanCapeScale: { kind: 'scales', len: 58, w: 30 },   // 鳞光
  shanCapeMist: { kind: 'frostveil', len: 60, w: 30 }, // 雾纱（冰棱帘）
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
  | 'dragonHelm'
  | 'rabbitEars'
  | 'bearEars'
  | 'mouseEars'
  | 'sharkFin'
  | 'dinoHorns'
  | 'unicornHorn'
  | 'afro'
  | 'mohawk'
  | 'ponytail'
  | 'bun'
  | 'pigtails'
  | 'braids'
  | 'spikyHair'
  | 'longHair'
  | 'curlyHair'
  | 'bobHair'
  | 'buzzCut'
  | 'antenna'
  | 'cowboy'
  | 'bowler'
  | 'newsboy'
  | 'turban'
  | 'wreath'
  | 'bamboo'
  | 'conical'
  | 'veil'
  | 'brideVeil'
  | 'headband'
  | 'hood'
  | 'knightHelm'
  | 'armyHelm'
  | 'fireHelm'
  | 'kabukiMask'
  | 'eyepatch'
  | 'monocle'
  | 'sailorHat'
  | 'gasMask'
  | 'skullMask'
  | 'ghostHat'
  | 'pumpkin'
  | 'iceCream'
  | 'cupcake'
  | 'burger'
  | 'watermelon'
  | 'screw'
  | 'gear'
  | 'minerLamp'
  | 'candle'
  | 'starCrown'
  | 'moonCrown'
  // 第三批 50 款
  | 'teapot'
  | 'ramen'
  | 'teacup'
  | 'boba'
  | 'popcorn'
  | 'pizza'
  | 'donut'
  | 'sushi'
  | 'taco'
  | 'cake'
  | 'lollipop'
  | 'candyCane'
  | 'sunflower'
  | 'lotus'
  | 'leafCrown'
  | 'clover'
  | 'sprout'
  | 'cactusHat'
  | 'acorn'
  | 'strawberry'
  | 'cherry'
  | 'pineapple'
  | 'bee'
  | 'butterfly'
  | 'chick'
  | 'crab'
  | 'frogHat'
  | 'snailHat'
  | 'fishBowl'
  | 'birdCage'
  | 'beehive'
  | 'hedgehog'
  | 'pinwheel'
  | 'trafficCone'
  | 'lantern'
  | 'umbrella'
  | 'alarmClock'
  | 'trafficLight'
  | 'satellite'
  | 'planet'
  | 'bulb'
  | 'battery'
  | 'magnet'
  | 'weldingMask'
  | 'tvHead'
  | 'snowGlobe'
  | 'paperBoat'
  | 'dice'
  | 'book'
  | 'pencil'
  | 'nailongHood'
  | 'coachcap'
  | 'ufoHelm'
  | 'shardCrown'
  | 'drakecrown'
  // 新主题宝箱的头饰统一走这里的通用画法（按 id 查 THEME_HATS）
  | 'themed';

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
  // ---- 后加的 50 款 ----
  rabbitEars: 0xf3e9dc,
  bearEars: 0x8b5a2b,
  mouseEars: 0x2b2b33,
  sharkFin: 0x6f8fa8,
  dinoHorns: 0x5fae6a,
  unicornHorn: 0xffe08a,
  afro: 0x2b2228,
  mohawk: 0xff5a4d,
  ponytail: 0x8a5a2b,
  bun: 0x3a2a22,
  pigtails: 0xffb03a,
  braids: 0xc98a4b,
  spikyHair: 0x4a90d9,
  longHair: 0x1f1a24,
  curlyHair: 0x8b3a2b,
  bobHair: 0x39d0a0,
  buzzCut: 0x5a5a64,
  antenna: 0x9fe8b0,
  cowboy: 0xa9703a,
  bowler: 0x2b2b33,
  newsboy: 0x6f5b40,
  turban: 0xdcd0b0,
  wreath: 0x7ed957,
  bamboo: 0xc9a86a,
  conical: 0xd8c08a,
  veil: 0xd9c6e8,
  brideVeil: 0xfff4f8,
  headband: 0xff5a4d,
  hood: 0x3a4a6a,
  knightHelm: 0xaab4c2,
  armyHelm: 0x5a6a3a,
  fireHelm: 0xd42a3a,
  kabukiMask: 0xf2e7d8,
  eyepatch: 0x1a1a22,
  monocle: 0xffd45c,
  sailorHat: 0xf2f6fa,
  gasMask: 0x4a5a4a,
  skullMask: 0xdfe6f0,
  ghostHat: 0xe8eeff,
  pumpkin: 0xff8a2a,
  iceCream: 0xffb7d5,
  cupcake: 0xffd0e0,
  burger: 0xd9a05a,
  watermelon: 0x3fae4a,
  screw: 0x9aa7b8,
  gear: 0xb08a4a,
  minerLamp: 0xffd45c,
  candle: 0xfff0d0,
  starCrown: 0xffd45c,
  moonCrown: 0xcfe3ff,
  // 第三批 50 款
  teapot: 0xd8e4ea,
  ramen: 0xe8b06a,
  teacup: 0xf2f2f2,
  boba: 0xc9a37a,
  popcorn: 0xe8d8b0,
  pizza: 0xe8a04a,
  donut: 0xe89ab0,
  sushi: 0xf2f0e0,
  taco: 0xd8a05a,
  cake: 0xf2c8d8,
  lollipop: 0xff8ad4,
  candyCane: 0xe8404a,
  sunflower: 0xffd45c,
  lotus: 0xffb8d8,
  leafCrown: 0x6fbf5a,
  clover: 0x4fae4a,
  sprout: 0x8fd45a,
  cactusHat: 0x4fa860,
  acorn: 0xb98a4a,
  strawberry: 0xe8404a,
  cherry: 0xd8304a,
  pineapple: 0xe8c04a,
  bee: 0xffd45c,
  butterfly: 0xff8ad4,
  chick: 0xffe08a,
  crab: 0xe8604a,
  frogHat: 0x5cbf4a,
  snailHat: 0xc9a37a,
  fishBowl: 0x8fd8ff,
  birdCage: 0xd8c08a,
  beehive: 0xe0a84a,
  hedgehog: 0x9a7a5a,
  pinwheel: 0xff8a4a,
  trafficCone: 0xe8602a,
  lantern: 0xe8403a,
  umbrella: 0x4f9ad8,
  alarmClock: 0xe8e8e0,
  trafficLight: 0x3a4a5c,
  satellite: 0xc9d4e0,
  planet: 0x8f6ad8,
  bulb: 0xffe08a,
  battery: 0x4fa860,
  magnet: 0xe8403a,
  weldingMask: 0x4a5460,
  tvHead: 0x6a7a8a,
  snowGlobe: 0x9fe8ff,
  paperBoat: 0xf2f0e8,
  dice: 0xf8f8f4,
  book: 0xc9a37a,
  pencil: 0xf2c04a,
  nailongHood: 0xffd93d,
  coachcap: 0x2f5d3a,
  ufoHelm: 0x9fe8ff,
  shardCrown: 0xbfe8ff,
  drakecrown: 0xffd45c,
  // 新主题宝箱专属头饰
  desTurban: 0xe0b56a, desScarab: 0x4a8a5a,
  nimbHalo: 0xeaf6ff, nimbCrown: 0xffe89a,
  confCake: 0xffb7d5, confCrown: 0xffd45c,
  bigtClown: 0xf2f2f2, bigtRing: 0xe8404a,
  aegisHelm: 0xaab4c2, aegisCrest: 0xc0392b,
  chanHat: 0x2f7a4a, chanLantern: 0xffd45c,
  arcanCap: 0x5540a0, arcanCrown: 0xb46cff,
  relicBone: 0xd8c8a0, relicAmber: 0xffb02a,
  playBlock: 0x4a90d9, playTop: 0xe8404a,
  yuanLamp: 0xe8404a, yuanMask: 0xffd45c,
  // 第三批新主题宝箱专属头饰
  pirateHat: 0x1e2a36, pirateCrown: 0xe8c86a,
  steamHat: 0x4a3a2a, steamCrown: 0xd8a24a,
  astroHat: 0xd8e8ff, astroCrown: 0xffb03a,
  juraHat: 0xd8c8a0, juraCrown: 0xe8d07a,
  mushHat: 0xd84a4a, mushCrown: 0xffb7d5,
  tropicHat: 0xffe8d0, tropicCrown: 0xffb7a0,
  cryptHat: 0x8a8a92, cryptCrown: 0xd8c8a0,
  festivHat: 0xd23b3b, festivCrown: 0xffd45c,
  sushiHat: 0x2a3a5a, sushiCrown: 0xffd45c,
  wildHat: 0x8a6a3a, wildCrown: 0xffd45c,
  // 第四批新主题宝箱专属头饰
  vulcHelm: 0x4a2a22, vulcCrown: 0xffb347,
  trenchDiver: 0x2a6a7a, trenchCrown: 0x5fd0c0,
  dojoHachimaki: 0xf0eee4, dojoCrown: 0xe8404a,
  inkwHat: 0x2a2e36, inkwCrown: 0x3a4048,
  fairyHat: 0xffb7d5, fairyCrown: 0x5aa85a,
  racerHelm: 0xe8404a, racerCrown: 0xffd45c,
  vampHat: 0x1a1420, vampCrown: 0xc0203a,
  autumnHat: 0xd8b070, autumnCrown: 0xd4622a,
  pandaHat: 0x8fbf5a, pandaCrown: 0x5f8a3a,
  jokerHat: 0x8a2a6a, jokerCrown: 0xffd45c,
  pagodHat: 0x6a2a20, pagodCrown: 0xffd45c,
  stormHat: 0x3d4c5c, stormCrown: 0x9fd8ff,
  lunarHat: 0xe8f0ff, lunarCrown: 0xffe89a,
  vikingHelm: 0x8a705a, vikingCrown: 0xd8e0e8,
  safariHat: 0xd8c8a0, safariCrown: 0xb06a2a,
  theatHat: 0xa82a4a, theatCrown: 0xffd45c,
  boreaHat: 0x2a4258, boreaCrown: 0x7dffc4,
  venicHat: 0xe0c88a, venicCrown: 0xffd8a0,
  olympWreath: 0x8aa84a, olympCrown: 0xffd45c,
  sambaHat: 0xff8ad4, sambaCrown: 0xffd45c,
  // 山海宝箱普通货
  shanHatFeather: 0xd8e8ff, shanHatDragon: 0xd42a2a,
  // 🏟 操场跑量里程碑专属
  runHat: 0x39d0a0,
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
  // ---- 后加的 50 款（每款一个独立形状）----
  rabbitEars: 'rabbitEars',
  bearEars: 'bearEars',
  mouseEars: 'mouseEars',
  sharkFin: 'sharkFin',
  dinoHorns: 'dinoHorns',
  unicornHorn: 'unicornHorn',
  afro: 'afro',
  mohawk: 'mohawk',
  ponytail: 'ponytail',
  bun: 'bun',
  pigtails: 'pigtails',
  braids: 'braids',
  spikyHair: 'spikyHair',
  longHair: 'longHair',
  curlyHair: 'curlyHair',
  bobHair: 'bobHair',
  buzzCut: 'buzzCut',
  antenna: 'antenna',
  cowboy: 'cowboy',
  bowler: 'bowler',
  newsboy: 'newsboy',
  turban: 'turban',
  wreath: 'wreath',
  bamboo: 'bamboo',
  conical: 'conical',
  veil: 'veil',
  brideVeil: 'brideVeil',
  headband: 'headband',
  hood: 'hood',
  knightHelm: 'knightHelm',
  armyHelm: 'armyHelm',
  fireHelm: 'fireHelm',
  kabukiMask: 'kabukiMask',
  eyepatch: 'eyepatch',
  monocle: 'monocle',
  sailorHat: 'sailorHat',
  gasMask: 'gasMask',
  skullMask: 'skullMask',
  ghostHat: 'ghostHat',
  pumpkin: 'pumpkin',
  iceCream: 'iceCream',
  cupcake: 'cupcake',
  burger: 'burger',
  watermelon: 'watermelon',
  screw: 'screw',
  gear: 'gear',
  minerLamp: 'minerLamp',
  candle: 'candle',
  starCrown: 'starCrown',
  moonCrown: 'moonCrown',
  // 第三批 50 款（每款一个独立 kind）
  teapot: 'teapot',
  ramen: 'ramen',
  teacup: 'teacup',
  boba: 'boba',
  popcorn: 'popcorn',
  pizza: 'pizza',
  donut: 'donut',
  sushi: 'sushi',
  taco: 'taco',
  cake: 'cake',
  lollipop: 'lollipop',
  candyCane: 'candyCane',
  sunflower: 'sunflower',
  lotus: 'lotus',
  leafCrown: 'leafCrown',
  clover: 'clover',
  sprout: 'sprout',
  cactusHat: 'cactusHat',
  acorn: 'acorn',
  strawberry: 'strawberry',
  cherry: 'cherry',
  pineapple: 'pineapple',
  bee: 'bee',
  butterfly: 'butterfly',
  chick: 'chick',
  crab: 'crab',
  frogHat: 'frogHat',
  snailHat: 'snailHat',
  fishBowl: 'fishBowl',
  birdCage: 'birdCage',
  beehive: 'beehive',
  hedgehog: 'hedgehog',
  pinwheel: 'pinwheel',
  trafficCone: 'trafficCone',
  lantern: 'lantern',
  umbrella: 'umbrella',
  alarmClock: 'alarmClock',
  trafficLight: 'trafficLight',
  satellite: 'satellite',
  planet: 'planet',
  bulb: 'bulb',
  battery: 'battery',
  magnet: 'magnet',
  weldingMask: 'weldingMask',
  tvHead: 'tvHead',
  snowGlobe: 'snowGlobe',
  paperBoat: 'paperBoat',
  dice: 'dice',
  book: 'book',
  pencil: 'pencil',
  nailongHood: 'nailongHood',
  coachcap: 'coachcap',
  ufoHelm: 'ufoHelm',
  shardCrown: 'shardCrown',
  drakecrown: 'drakecrown',
  // 新主题宝箱头饰：统一走 'themed'（实际造型按 id 查 THEME_HATS）
  desTurban: 'themed', desScarab: 'themed', nimbHalo: 'themed', nimbCrown: 'themed',
  confCake: 'themed', confCrown: 'themed', bigtClown: 'themed', bigtRing: 'themed',
  aegisHelm: 'themed', aegisCrest: 'themed', chanHat: 'themed', chanLantern: 'themed',
  arcanCap: 'themed', arcanCrown: 'themed', relicBone: 'themed', relicAmber: 'themed',
  playBlock: 'themed', playTop: 'themed', yuanLamp: 'themed', yuanMask: 'themed',
  shanHatFeather: 'themed', shanHatDragon: 'themed',
  // 第三批新主题宝箱头饰：统一走 'themed'
  pirateHat: 'themed', pirateCrown: 'themed', steamHat: 'themed', steamCrown: 'themed',
  astroHat: 'themed', astroCrown: 'themed', juraHat: 'themed', juraCrown: 'themed',
  mushHat: 'themed', mushCrown: 'themed', tropicHat: 'themed', tropicCrown: 'themed',
  cryptHat: 'themed', cryptCrown: 'themed', festivHat: 'themed', festivCrown: 'themed',
  sushiHat: 'themed', sushiCrown: 'themed', wildHat: 'themed', wildCrown: 'themed',
  // 第四批新主题宝箱头饰：统一走 'themed'
  vulcHelm: 'themed', vulcCrown: 'themed', trenchDiver: 'themed', trenchCrown: 'themed',
  dojoHachimaki: 'themed', dojoCrown: 'themed', inkwHat: 'themed', inkwCrown: 'themed',
  fairyHat: 'themed', fairyCrown: 'themed', racerHelm: 'themed', racerCrown: 'themed',
  vampHat: 'themed', vampCrown: 'themed', autumnHat: 'themed', autumnCrown: 'themed',
  pandaHat: 'themed', pandaCrown: 'themed', jokerHat: 'themed', jokerCrown: 'themed',
  pagodHat: 'themed', pagodCrown: 'themed', stormHat: 'themed', stormCrown: 'themed',
  lunarHat: 'themed', lunarCrown: 'themed', vikingHelm: 'themed', vikingCrown: 'themed',
  safariHat: 'themed', safariCrown: 'themed', theatHat: 'themed', theatCrown: 'themed',
  boreaHat: 'themed', boreaCrown: 'themed', venicHat: 'themed', venicCrown: 'themed',
  olympWreath: 'themed', olympCrown: 'themed', sambaHat: 'themed', sambaCrown: 'themed',
  runHat: 'themed',
};

/**
 * 「整颗头换掉」的头饰：戴上之后**不画 emoji 脸**，头盔 / 面具 / 头套本身就是那颗头。
 * 其余的头饰（王冠 / 鸭舌帽 / 兔耳 / 兜帽 / 眼罩…）只是**装饰在原来的头上面**，emoji 脸照画。
 *
 * 判断标准是那块头饰的绘制里**自带五官**或者**把整颗头包住**：
 * 全罩头盔（飞碟头盔 / 宇航盔 / 骑士盔 / 武士盔 / VR / 潜水镜）与各种面具头套
 * （瘟疫医生 / 防毒面具 / 骷髅 / 歌舞伎 / 狐狸 / 鬼面 / 南瓜 / 幽灵 / 小黄龙头套）。
 */
export const FULL_HEAD_HATS: HatId[] = [
  'ufoHelm',
  'astro',
  'knightHelm',
  'samurai',
  'vr',
  'snorkel',
  'plague',
  'gasMask',
  'skullMask',
  'kabukiMask',
  'foxMask',
  'oni',
  'pumpkin',
  'ghostHat',
  'nailongHood',
  // 第三批里这两款也是「把整颗头包住」的：电视头（屏幕就是脸）与焊接面罩
  'tvHead',
  'weldingMask',
];

/**
 * 这些头饰的绘制是围着「帽子该在的高度」写的（比头再高一点），
 * 所以替换头时要整体下移这么多，盔体才落得进原来那颗头的位置。
 */
export const FULL_HEAD_DY = 12;

/** 这个头饰是不是「整头替换」（不画 emoji 脸） */
export function replacesHead(hat: HatId): boolean {
  return FULL_HEAD_HATS.includes(hat);
}

/**
 * **每只角色形象的「头顶」高度**（相对脚底，px）：默认小人是 `PLAYER_H`（108）。
 *
 * 帽子与宠物就坐在这个高度上，翅膀 / 披风挂在它下面 48 / 30px——所以**矮个子角色**
 * （果冻史莱姆 84、蘑菇人 90、小章鱼 96…）必须调小，否则会看到
 * 「帽子飘在头顶上方、翅膀悬在半空」。
 *
 * 取的是**脑袋顶**，不含天线 / 长耳 / 火苗 / 雷 / 冠羽这类往上冒的细装饰
 * （不然帽子会坐到装饰尖上）。表里的数是**渲染出来量过像素**的：
 * 「实心顶」（一行里至少有 8 个实心像素的最高行）作基准，顶着自己高帽 / 冠羽的那些
 * 再往下压 10~20px，让帽子落在脑袋上。**以后新加矮个子形象就往这里补一条**。
 */
export const SKIN_HEAD_H: Partial<Record<CharacterSkin, number>> = {
  // 矮个子：不改就会明显悬空的那几只
  slime: 84,
  frog: 84,
  mushroom: 90,
  ghost: 90,
  starlet: 90,
  panda: 92,
  octopus: 96,
  emberling: 96,
  icesprite: 96,
  cactus: 100,
  robot: 100,
  angler: 100,
  snowman: 104,
  // 头上有高装饰（长耳 / 天线 / 角 / 自家帽子）：帽子该落在脑袋上，不是装饰尖上
  alien: 104,
  guard: 104,
  chanSpirit: 104,
  godzilla: 106,
  nailong: 106,
  sakurabun: 106,
  bigtSpirit: 106,
  phoenix: 110,
  dragonlord: 110,
  yuanSpirit: 110,
  // 主题宝箱的招牌形象（云风伯是一朵矮云、白骨祭司只有一具骨架，都得调矮）
  // ⚠️ 云风伯上半身是**近白色**的云团：量像素时会把白团的顶量出来（81），
  // 但那截在浅色背景上几乎看不见，所以按「看得见的那团」再往下压（74）
  nimbSpirit: 74,
  relicSpirit: 90,
  playSpirit: 98,
  desSpirit: 98,
  aegisSpirit: 108,
  confSpirit: 112,
  arcanSpirit: 115,
  // 第三批新主题宝箱的招牌形象
  mushSpirit: 92,
  cryptSpirit: 100,
  festivSpirit: 104,
  pirateSpirit: 106,
  tropicSpirit: 106,
  sushiSpirit: 106,
  wildSpirit: 106,
  astroSpirit: 108,
  juraSpirit: 108,
  steamSpirit: 108,
  // 🗺️ 山海经怪物皮肤（烛龙的鬃火最高；混沌是只没脸的口袋所以矮）
  hunDun: 95,
  qiongQi: 96,
  taoWu: 97,
  yuYu: 98,
  jiuweiHu: 100,
  baShe: 102,
  taoTie: 104,
  guDiao: 106,
  // 第四批新主题宝箱的招牌形象
  trenchSpirit: 72,
  safariSpirit: 62,
  fairySpirit: 80,
  pandaSpirit: 84,
  sambaSpirit: 84,
  inkwSpirit: 92,
  jokerSpirit: 92,
  olympSpirit: 92,
  vulcSpirit: 96,
  dojoSpirit: 96,
  vampSpirit: 94,
  stormSpirit: 94,
  boreaSpirit: 94,
  theatSpirit: 96,
  autumnSpirit: 100,
  pagodSpirit: 100,
  lunarSpirit: 90,
  vikingSpirit: 92,
  racerSpirit: 104,
  venicSpirit: 100,
  zhuLong: 112,
  xiangLiu: 114,
};

/** 这只角色的头顶高度（表里没有就按默认小人算） */
export function skinHeadH(skin: CharacterSkin): number {
  return SKIN_HEAD_H[skin] ?? PLAYER_H;
}

export type PetKind =
  | 'orb' | 'bird' | 'cat' | 'dragon' | 'fairy' | 'skull' | 'fox' | 'robot' | 'star' | 'flame' | 'ghost'
  | 'nailong';

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
  nailong: 0xffd93d,
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
  nailong: 'nailong',
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
  neon: 0xb8ff3a,
  stardust: 0x9fe8ff,
  // 新主题宝箱专属击球拖尾
  desTrailA: 0xe0b56a, desTrailB: 0xffd45c,
  nimbTrailA: 0xdcefff, nimbTrailB: 0xffffff,
  confTrailA: 0xffb7d5, confTrailB: 0xff8ad4,
  bigtTrailA: 0xffd45c, bigtTrailB: 0xff8a6a,
  aegisTrailA: 0xc0ccda, aegisTrailB: 0x3a5a8a,
  chanTrailA: 0x2f7a4a, chanTrailB: 0xffb7d5,
  arcanTrailA: 0xffd45c, arcanTrailB: 0xb46cff,
  relicTrailA: 0xd8c8a0, relicTrailB: 0xffb02a,
  playTrailA: 0x4a90d9, playTrailB: 0xffc04a,
  yuanTrailA: 0xffd45c, yuanTrailB: 0xff8a6a,
  // 第三批新主题宝箱专属击球拖尾
  pirateTrailA: 0x9fd8e8, pirateTrailB: 0xff8a3c,
  steamTrailA: 0xcfd8e0, steamTrailB: 0xffb03a,
  astroTrailA: 0x9fd8ff, astroTrailB: 0xffb03a,
  juraTrailA: 0x9fe86a, juraTrailB: 0xff7a2a,
  mushTrailA: 0xa8ff7a, mushTrailB: 0xffe89a,
  tropicTrailA: 0x5fe8d0, tropicTrailB: 0xbfe8f0,
  cryptTrailA: 0x9fd8a0, cryptTrailB: 0xffb03a,
  festivTrailA: 0xffffff, festivTrailB: 0xff6a6a,
  sushiTrailA: 0xffffff, sushiTrailB: 0x8a4a2a,
  wildTrailA: 0xd8c8a0, wildTrailB: 0xffb03a,
  // 第四批新主题宝箱专属击球拖尾
  vulcTrailA: 0xff9a3c, vulcTrailB: 0xff5a1a,
  trenchTrailA: 0x5fd0c0, trenchTrailB: 0x9ffcf0,
  dojoTrailA: 0xf0eee4, dojoTrailB: 0xe8404a,
  inkwTrailA: 0x3a4048, inkwTrailB: 0x9fd8c8,
  fairyTrailA: 0xffb7d5, fairyTrailB: 0xfff2b0,
  racerTrailA: 0xcfd8e0, racerTrailB: 0xffd45c,
  vampTrailA: 0x4a2a6a, vampTrailB: 0xc0203a,
  autumnTrailA: 0xd4622a, autumnTrailB: 0xffd45c,
  pandaTrailA: 0x8fbf5a, pandaTrailB: 0xdcefff,
  jokerTrailA: 0xff8ad4, jokerTrailB: 0xffd45c,
  pagodTrailA: 0xffb03a, pagodTrailB: 0xffd45c,
  stormTrailA: 0xbfe8ff, stormTrailB: 0x9fd8ff,
  lunarTrailA: 0xffe89a, lunarTrailB: 0xd8e8ff,
  vikingTrailA: 0xf0f4fa, vikingTrailB: 0xff8a3c,
  safariTrailA: 0xd8c8a0, safariTrailB: 0xffb03a,
  theatTrailA: 0xff8ad4, theatTrailB: 0xfff0c0,
  boreaTrailA: 0xbfe8ff, boreaTrailB: 0x9ad4ff,
  venicTrailA: 0x5fe8d0, venicTrailB: 0xffd8a0,
  olympTrailA: 0xf0ead8, olympTrailB: 0xffd45c,
  sambaTrailA: 0xff8ad4, sambaTrailB: 0xffd45c,
  shanTrail: 0x9fe8c0,
  // 🏟 操场跑量里程碑专属
  runTrail: 0x39d0a0,
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
  tempo: 0xffb03a,
  atomic: 0x9fe8ff,
  beam: 0x7fffd4,
  shardedge: 0xbfe8ff,
  drabreath: 0x9f7bff,
  // 新主题宝箱专属挥拍拖尾
  desSwing: 0xe0b56a, nimbSwing: 0xdcefff, confSwing: 0xffb7d5,
  bigtSwing: 0xffd45c, aegisSwing: 0x8fb4de, chanSwing: 0x2f7a4a,
  arcanSwing: 0xb46cff, relicSwing: 0xd8c8a0, playSwing: 0x4a90d9,
  yuanSwing: 0xffd45c,
  // 第三批新主题宝箱专属挥拍拖尾
  pirateSwing: 0xe8c86a, steamSwing: 0xd8a24a, astroSwing: 0x9fd8ff,
  juraSwing: 0x9fe86a, mushSwing: 0xffb7d5, tropicSwing: 0x5fe8d0,
  cryptSwing: 0x9fd8a0, festivSwing: 0xffd45c, sushiSwing: 0xfff0d0,
  wildSwing: 0xffd45c,
  // 第四批新主题宝箱专属挥拍拖尾
  vulcSwing: 0xff5a1a, trenchSwing: 0x5fd0c0,
  dojoSwing: 0xf0eee4, inkwSwing: 0x2a2e36,
  fairySwing: 0xffb7d5, racerSwing: 0xffd45c,
  vampSwing: 0xc0203a, autumnSwing: 0xd4622a,
  pandaSwing: 0x8fbf5a, jokerSwing: 0xffd45c,
  pagodSwing: 0xffd45c, stormSwing: 0x9fd8ff,
  lunarSwing: 0xffe89a, vikingSwing: 0xc0c8d0,
  safariSwing: 0xffb03a, theatSwing: 0xfff0c0,
  boreaSwing: 0x7dffc4, venicSwing: 0x5fe8d0,
  olympSwing: 0xfff0b0, sambaSwing: 0xff8ad4,
  shanSwing: 0xff8a3c,
  // 🏟 操场跑量里程碑专属
  runSwing: 0x39d0a0,
};

/** 坐骑各款的主色 */
export const MOUNT_COLORS: Record<MountId, number> = {
  none: 0x000000,
  board: 0x8a6a3a,
  bubble: 0x7fd4ff,
  cloud: 0xffffff,
  sword: 0xcfd8e3,
  horse: 0xb06a3a,
  carpet: 0xc0392b,
  star: 0xffd45c,
  dragon: 0x39d0a0,
  rocket: 0xe8eef5,
  throne: 0xffd45c,
  // 金币商店的普通款
  scooter: 0x4f9ad8,
  log: 0x9a6b3a,
  box: 0xc99a5c,
  spring: 0x8fa6b8,
  cart: 0xb06a3a,
  broom: 0xd8a24a,
  turtle: 0x6fae4f,
  bike: 0xd05a4a,
  hover: 0x54d6ff,
  shark: 0x6f9fce,
  nailongRoll: 0xffd93d,
  ufo: 0x9fd8e8,
  stardrake: 0x8f6ad8,
  // 主题宝箱专属坐骑
  dolphin: 0x5aa8e8,
  pumpkincart: 0xff8a2a,
  gearbike: 0x8f9aa8,
  lion: 0xd8a24a,
  kite: 0xff8ad4,
  crescent: 0xffe9a8,
  firewheel: 0xff5a1a,
  polarbear: 0xf0f4fa,
  dino: 0x53c46a,
  laserbike: 0x39ffd0,
  // 新主题宝箱专属坐骑
  desCamel: 0xd8a24a, nimbCloud: 0xeaf6ff, confCake: 0xffd0e0,
  bigtBall: 0xe8404a, aegisSteed: 0xaab4c2, chanBoat: 0x3a8a5a,
  arcanOrb: 0x9a86e8, relicBone: 0xd8c8a0, playHorse: 0xffc04a,
  yuanBoat: 0xe8404a,
  // 第三批新主题宝箱专属坐骑
  pirateMount: 0x8a5a2a, steamMount: 0x8a6a3a, astroMount: 0xd8e8ff,
  juraMount: 0x6a9a4a, mushMount: 0x8a6a4a, tropicMount: 0x4aa88a,
  cryptMount: 0xd8c8a0, festivMount: 0x8a5a2a, sushiMount: 0x8a6238,
  wildMount: 0x8a5a2a,
  // 第四批新主题宝箱专属坐骑
  vulcHound: 0x5a2a1a, trenchRay: 0x2a6a7a,
  dojoCrest: 0xc0392b, inkwBoat: 0x4a525c,
  fairySnail: 0xd8b08a, racerKart: 0xe8404a,
  vampStallion: 0x1a1a26, autumnBoar: 0x6a4a2a,
  pandaSled: 0x8fbf5a, jokerCarriage: 0xe8404a,
  pagodPalanquin: 0xc0392b, stormGlider: 0x7fd4ff,
  lunarCloud: 0xe8f0ff, vikingDrakkar: 0x6a5240,
  safariElephant: 0x9aa7b8, theatSpotlight: 0xfff0c0,
  boreaStag: 0x8a705a, venicGondola: 0x2a3a4a,
  olympChariot: 0xd8d0b8, sambaFloat: 0xffd45c,
  shanMountKun: 0x4aa8d8,
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
  spotlight: 0xfff0c0,
  dorsal: 0x8fe0ff,
  warp: 0x6fe09a,
  shardglow: 0xbfe8ff,
  dranebula: 0x8f6ad8,
  // 新主题宝箱专属光环
  desSandAura: 0xe0b56a, desSunAura: 0xffd45c,
  nimbWindAura: 0xdcefff, nimbStarAura: 0xffe89a,
  confSugarAura: 0xffb7d5, confHeartAura: 0xff869c,
  bigtConfetti: 0xffd45c, bigtSpotAura: 0xff8a6a,
  aegisBanner: 0x8fb4de, aegisSteel: 0xc0ccda,
  chanInkAura: 0x2f7a4a, chanPetalAura: 0xffb7d5,
  arcanRuneAura: 0xffd45c, arcanStarAura: 0xb46cff,
  relicDustAura: 0xd8c8a0, relicAmberAura: 0xffb02a,
  playBallAura: 0x4a90d9, playSparkAura: 0xffc04a,
  yuanFireAura: 0xff8a3c, yuanLanternAura: 0xffd45c,
  // 第三批新主题宝箱专属光环
  pirateAuraA: 0x5fd0c0, pirateAuraB: 0xd8c8a0,
  steamAuraA: 0xffb03a, steamAuraB: 0x8fd8ff,
  astroAuraA: 0xffb03a, astroAuraB: 0x9fd8ff,
  juraAuraA: 0x9fe86a, juraAuraB: 0xffb03a,
  mushAuraA: 0xa8ff7a, mushAuraB: 0xffe89a,
  tropicAuraA: 0xbfe8f0, tropicAuraB: 0x5fe8d0,
  cryptAuraA: 0x9fd8a0, cryptAuraB: 0xffb03a,
  festivAuraA: 0xffffff, festivAuraB: 0xffd45c,
  sushiAuraA: 0xffffff, sushiAuraB: 0xffb7d5,
  wildAuraA: 0xffb03a, wildAuraB: 0xff9a4a,
  // 第四批新主题宝箱专属光环
  vulcAuraA: 0xff5a1a, vulcAuraB: 0xffb347,
  trenchAuraA: 0x5fd0c0, trenchAuraB: 0x9ffcf0,
  dojoAuraA: 0xbfe8f0, dojoAuraB: 0xe8404a,
  inkwAuraA: 0x3a4048, inkwAuraB: 0x9fd8c8,
  fairyAuraA: 0xffb7d5, fairyAuraB: 0xfff2b0,
  racerAuraA: 0xff8a4a, racerAuraB: 0xffd45c,
  vampAuraA: 0x4a2a6a, vampAuraB: 0xc0203a,
  autumnAuraA: 0xd4622a, autumnAuraB: 0xffd45c,
  pandaAuraA: 0x8fbf5a, pandaAuraB: 0xdcefff,
  jokerAuraA: 0xff8ad4, jokerAuraB: 0xffd45c,
  pagodAuraA: 0xffb03a, pagodAuraB: 0xffd45c,
  stormAuraA: 0x9fd8ff, stormAuraB: 0xffffff,
  lunarAuraA: 0xe8f0ff, lunarAuraB: 0xffe89a,
  vikingAuraA: 0xffb03a, vikingAuraB: 0x8fb4de,
  safariAuraA: 0xd8c8a0, safariAuraB: 0xff9a4a,
  theatAuraA: 0xffd45c, theatAuraB: 0xfff0c0,
  boreaAuraA: 0xffffff, boreaAuraB: 0x7dffc4,
  venicAuraA: 0xbfe8f0, venicAuraB: 0xffd8a0,
  olympAuraA: 0xffd45c, olympAuraB: 0xfff0b0,
  sambaAuraA: 0xff8ad4, sambaAuraB: 0xffd45c,
  shanAuraSpirit: 0x9fe8c0, shanAuraStar: 0xffe89a,
  // 🏟 操场跑量里程碑专属
  runAura: 0x39d0a0,
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
  wood: 0x9a6a3a,
  meteorite: 0x6a6f7a,
  // 新主题宝箱专属球拍皮肤
  desRacketA: 0xe0b56a, desRacketB: 0xc9803a,
  nimbRacketA: 0xdcefff, nimbRacketB: 0xa8d4f5,
  confRacketA: 0xffb7d5, confRacketB: 0xff869c,
  bigtRacketA: 0xffd45c, bigtRacketB: 0xc0392b,
  aegisRacketA: 0xc0ccda, aegisRacketB: 0x3a5a8a,
  chanRacketA: 0x2f7a4a, chanRacketB: 0xd8c07a,
  arcanRacketA: 0xb46cff, arcanRacketB: 0x5540a0,
  relicRacketA: 0xd8c8a0, relicRacketB: 0x7a6440,
  playRacketA: 0x4a90d9, playRacketB: 0xffc04a,
  yuanRacketA: 0xe8404a, yuanRacketB: 0xffd45c,
  // 第三批新主题宝箱专属球拍皮肤
  pirateRacketA: 0xe8c86a, pirateRacketB: 0x8a9aa8,
  steamRacketA: 0xd8a24a, steamRacketB: 0x6a5236,
  astroRacketA: 0xd8e8ff, astroRacketB: 0xffb03a,
  juraRacketA: 0xd8c8a0, juraRacketB: 0xffb02a,
  mushRacketA: 0xd84a4a, mushRacketB: 0x8a6a4a,
  tropicRacketA: 0x5fe8d0, tropicRacketB: 0xffb7a0,
  cryptRacketA: 0x8a8a92, cryptRacketB: 0xd8c8a0,
  festivRacketA: 0xd23b3b, festivRacketB: 0xffd45c,
  sushiRacketA: 0x8a6238, sushiRacketB: 0xff8a6a,
  wildRacketA: 0x8a6a3a, wildRacketB: 0xd8c8a0,
  // 第四批新主题宝箱专属球拍皮肤
  vulcRacketA: 0xff5a1a, vulcRacketB: 0xffb347,
  trenchRacketA: 0x5fd0c0, trenchRacketB: 0x9ffcf0,
  dojoRacketA: 0x8fbf5a, dojoRacketB: 0xe8404a,
  inkwRacketA: 0x3a4048, inkwRacketB: 0x5a8a7a,
  fairyRacketA: 0xffb7d5, fairyRacketB: 0xa8ff9a,
  racerRacketA: 0xe8404a, racerRacketB: 0xffd45c,
  vampRacketA: 0x4a2a6a, vampRacketB: 0xc0203a,
  autumnRacketA: 0x8a5a2a, autumnRacketB: 0xd4622a,
  pandaRacketA: 0x5f8a3a, pandaRacketB: 0x8fbf5a,
  jokerRacketA: 0xffd45c, jokerRacketB: 0xe8404a,
  pagodRacketA: 0xc0392b, pagodRacketB: 0xffd45c,
  stormRacketA: 0x9fd8ff, stormRacketB: 0xffffff,
  lunarRacketA: 0xffe89a, lunarRacketB: 0xd8e8ff,
  vikingRacketA: 0xc0c8d0, vikingRacketB: 0x8fb4de,
  safariRacketA: 0x9aa74a, safariRacketB: 0xf0e8d0,
  theatRacketA: 0xffd45c, theatRacketB: 0xfff0c0,
  boreaRacketA: 0x7dffc4, boreaRacketB: 0x9ad4ff,
  venicRacketA: 0x8a5a2a, venicRacketB: 0x5fe8d0,
  olympRacketA: 0xffd45c, olympRacketB: 0xfff0b0,
  sambaRacketA: 0xff8ad4, sambaRacketB: 0xffd45c,
  shanRacketA: 0xd8e8ff, shanRacketB: 0xd42a2a,
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
  back: 'none',
  aura: 'none',
  hat: 'none',
  ring: 'none',
  pet: 'none',
  petStar: 1,
  petFollow: 'shoulder',
  petSide: 'right',
  racketSkin: 'default',
  trailStyle: 'classic',
  swingTrail: 'none',
  mount: 'none',
};

/** the CPU opponent gets a fixed look so it reads as "not you" */
export const AI_COSMETIC: Cosmetic = {
  characterSkin: 'none',
  emoji: '🤖',
  racket: 0x44586f,
  trail: 0xd4542c,
  effect: 'spark',
  back: 'none',
  aura: 'none',
  hat: 'none',
  ring: 'none',
  pet: 'none',
  petStar: 1,
  petFollow: 'shoulder',
  petSide: 'right',
  racketSkin: 'default',
  trailStyle: 'classic',
  swingTrail: 'none',
  mount: 'none',
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
export function sanitizeCosmetic(
  input: (Partial<Cosmetic> & { wings?: unknown; cape?: unknown }) | undefined,
): Cosmetic {
  const d = DEFAULT_COSMETIC;
  if (!input || typeof input !== 'object') return { ...d };
  return {
    characterSkin: pick(SKIN_IDS, input.characterSkin, d.characterSkin),
    emoji: typeof input.emoji === 'string' ? input.emoji.slice(0, 8) : d.emoji,
    racket: typeof input.racket === 'number' ? input.racket & 0xffffff : d.racket,
    trail: typeof input.trail === 'number' ? input.trail & 0xffffff : d.trail,
    effect: pick(HIT_STYLE_IDS, input.effect, d.effect),
    back: (() => {
      // 背部装饰：优先取合并后的 `back`；旧版本客户端报上来的 `wings` / `cape`
      // 也认（两个都带时翅膀优先），sanitize 掉不认识的 id
      const legacyWing = pick(WING_IDS, input.wings, 'none');
      if (legacyWing !== 'none') return legacyWing;
      const legacyCape = pick(CAPE_IDS, input.cape, 'none');
      if (legacyCape !== 'none') return legacyCape;
      return pick(BACK_IDS, input.back, d.back);
    })(),
    ring: pick(RING_IDS, input.ring, d.ring),
    aura: pick(AURA_IDS, input.aura, d.aura),
    hat: pick(HAT_IDS, input.hat, d.hat),
    pet: pick(PET_IDS, input.pet, d.pet),
    petStar:
      typeof input.petStar === 'number' && Number.isFinite(input.petStar)
        ? Math.min(5, Math.max(1, Math.round(input.petStar)))
        : d.petStar,
    petFollow: pick(PET_FOLLOW_IDS, input.petFollow, d.petFollow),
    petSide: pick(PET_SIDE_IDS, input.petSide, d.petSide),
    racketSkin: pick(RACKET_SKIN_IDS, input.racketSkin, d.racketSkin),
    trailStyle: pick(TRAIL_IDS, input.trailStyle, d.trailStyle),
    swingTrail: pick(SWING_TRAIL_IDS, input.swingTrail, d.swingTrail),
    mount: pick(MOUNT_IDS, input.mount, d.mount),
  };
}
