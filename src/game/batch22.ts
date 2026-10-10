/**
 * 第二十批 10 个「SCP 恐怖怪物 / 巨兽」纯主题宝箱的**候选物品池 + 种子生成器**。
 *
 * 按《物品绘制.md》第九 / 十节的新口径：**总件数、各部位件数、每件星级全部由主题 id
 * 当种子一次性摇定**（确定性、人人一致、刷新不变），而不是写死一张固定模板。
 * 星级摇到几星就画几层——这里只负责登记元数据，画法在各 `draw/` 分包里。
 *
 * ⚠️ 只在 `items.ts` 里 `ITEMS.push(...)` 一次；`ref` 统一带主题前缀，
 * 由 `chest.ts` 的 `refPrefix` 整批认领。5★ 招牌形象固定 5★、主题专属命中特效固定 4★。
 */
import type { Item, ItemSlot, Rarity } from './items';

interface PoolItem {
  slot: ItemSlot;
  ref: string;
  label: string;
}

/** 每个主题的候选池（ref 前缀 = 主题 id；皮肤固定 5★、特效固定 4★，其余星级随机） */
const POOLS: Record<string, PoolItem[]> = {
  scp: [
    { slot: 'skin', ref: 'scpStatue', label: '花生雕像' },
    { slot: 'mount', ref: 'scpPod', label: '收容舱' },
    { slot: 'hat', ref: 'scpGasMask', label: '防毒面具' },
    { slot: 'hat', ref: 'scpHazmat', label: '防化头罩' },
    { slot: 'back', ref: 'scpCage', label: '收容笼' },
    { slot: 'back', ref: 'scpBioTank', label: '生物罐' },
    { slot: 'back', ref: 'scpCamera', label: '监控探头' },
    { slot: 'back', ref: 'scpStrongbox', label: '密码保险箱' },
    { slot: 'aura', ref: 'scpAlarm', label: '警报红光' },
    { slot: 'aura', ref: 'scpContainField', label: '收容力场' },
    { slot: 'ring', ref: 'scpHazardRing', label: '警戒地环' },
    { slot: 'pet', ref: 'scpRoach', label: '收容蟑螂' },
    { slot: 'racketSkin', ref: 'scpTaser', label: '电击棒·拍' },
    { slot: 'racketSkin', ref: 'scpClipboard', label: '记录板·拍' },
    { slot: 'trail', ref: 'scpStaticTrail', label: '雪花屏拖尾' },
    { slot: 'trail', ref: 'scpBioTrail', label: '生物质拖尾' },
    { slot: 'swingTrail', ref: 'scpContainSwing', label: '收容突袭斩' },
    { slot: 'effect', ref: 'scpBreach', label: '收容失效爆' },
  ],
  keter: [
    { slot: 'skin', ref: 'keterFlesh', label: '血肉聚合体' },
    { slot: 'mount', ref: 'keterMass', label: '肉块座驾' },
    { slot: 'hat', ref: 'keterEye', label: '千眼冠' },
    { slot: 'hat', ref: 'keterMaw', label: '裂口头罩' },
    { slot: 'back', ref: 'keterSpine', label: '脊骨背架' },
    { slot: 'back', ref: 'keterTent', label: '触须背囊' },
    { slot: 'back', ref: 'keterHeart', label: '搏动肉核' },
    { slot: 'back', ref: 'keterRibcage', label: '肋骨笼' },
    { slot: 'aura', ref: 'keterPulse', label: '血肉脉动' },
    { slot: 'aura', ref: 'keterFeast', label: '噬食环绕' },
    { slot: 'ring', ref: 'keterFleshRing', label: '增殖地环' },
    { slot: 'pet', ref: 'keterLarva', label: '血肉幼虫' },
    { slot: 'racketSkin', ref: 'keterClaw', label: '骨爪·拍' },
    { slot: 'racketSkin', ref: 'keterRibs', label: '肋骨·拍' },
    { slot: 'trail', ref: 'keterBloodTrail', label: '血痕拖尾' },
    { slot: 'trail', ref: 'keterGrowthTrail', label: '增殖拖尾' },
    { slot: 'swingTrail', ref: 'keterDevour', label: '吞噬斩' },
    { slot: 'effect', ref: 'keterBloom', label: '血肉绽放' },
  ],
  shy: [
    { slot: 'skin', ref: 'shyGiant', label: '羞怯白猿' },
    { slot: 'mount', ref: 'shyStride', label: '长臂座驾' },
    { slot: 'hat', ref: 'shyPale', label: '惨白面罩' },
    { slot: 'hat', ref: 'shyMuzzle', label: '束口头笼' },
    { slot: 'back', ref: 'shyCage', label: '遮脸头笼' },
    { slot: 'back', ref: 'shyPalePack', label: '惨白背囊' },
    { slot: 'back', ref: 'shyChain', label: '束缚锁链' },
    { slot: 'back', ref: 'shyTag', label: '档案号牌' },
    { slot: 'aura', ref: 'shyRage', label: '暴走环' },
    { slot: 'aura', ref: 'shyCalm', label: '静默光环' },
    { slot: 'ring', ref: 'shyTearRing', label: '泪痕地环' },
    { slot: 'pet', ref: 'shyPup', label: '小白猿' },
    { slot: 'racketSkin', ref: 'shyArm', label: '长臂·拍' },
    { slot: 'racketSkin', ref: 'shyTooth', label: '利齿·拍' },
    { slot: 'trail', ref: 'shyFearTrail', label: '惊惧拖尾' },
    { slot: 'trail', ref: 'shyPaleTrail', label: '惨白拖尾' },
    { slot: 'swingTrail', ref: 'shyLunge', label: '暴走扑杀斩' },
    { slot: 'effect', ref: 'shyScream', label: '羞怯尖叫' },
  ],
  rake: [
    { slot: 'skin', ref: 'rakeThing', label: '耙齿长臂怪' },
    { slot: 'mount', ref: 'rakeCrawl', label: '爬行座驾' },
    { slot: 'hat', ref: 'rakeSkull', label: '白骨面甲' },
    { slot: 'hat', ref: 'rakeClaw', label: '爪齿发箍' },
    { slot: 'back', ref: 'rakeSpine', label: '脊椎背架' },
    { slot: 'back', ref: 'rakeFence', label: '骨篱背架' },
    { slot: 'back', ref: 'rakePelt', label: '人皮披挂' },
    { slot: 'back', ref: 'rakeLair', label: '巢穴背篓' },
    { slot: 'aura', ref: 'rakeNight', label: '夜行暗影' },
    { slot: 'aura', ref: 'rakeEye', label: '暗中窥视' },
    { slot: 'ring', ref: 'rakeClawRing', label: '爪痕地环' },
    { slot: 'pet', ref: 'rakeCrawler', label: '小爬行者' },
    { slot: 'racketSkin', ref: 'rakeBone', label: '骨刃·拍' },
    { slot: 'racketSkin', ref: 'rakeFang', label: '獠牙·拍' },
    { slot: 'trail', ref: 'rakeScratchTrail', label: '抓痕拖尾' },
    { slot: 'trail', ref: 'rakeShadowTrail', label: '暗影拖尾' },
    { slot: 'swingTrail', ref: 'rakeRend', label: '撕咬斩' },
    { slot: 'effect', ref: 'rakePounce', label: '夜行扑击' },
  ],
  wendi: [
    { slot: 'skin', ref: 'wendiStag', label: '鹿首食人妖' },
    { slot: 'mount', ref: 'wendiElk', label: '白骨巨鹿' },
    { slot: 'hat', ref: 'wendiAntler', label: '枯鹿角冠' },
    { slot: 'hat', ref: 'wendiSkullHead', label: '鹿颅头罩' },
    { slot: 'back', ref: 'wendiAntlerPack', label: '鹿角背架' },
    { slot: 'back', ref: 'wendiFur', label: '兽毛披挂' },
    { slot: 'back', ref: 'wendiTotem', label: '饥饿图腾' },
    { slot: 'back', ref: 'wendiCage', label: '骨笼背篓' },
    { slot: 'aura', ref: 'wendiBlizzard', label: '风雪环' },
    { slot: 'aura', ref: 'wendiHunger', label: '饥饿寒光' },
    { slot: 'ring', ref: 'wendiSnowRing', label: '雪痕地环' },
    { slot: 'pet', ref: 'wendiCalf', label: '白骨幼鹿' },
    { slot: 'racketSkin', ref: 'wendiBoneAxe', label: '骨斧·拍' },
    { slot: 'racketSkin', ref: 'wendiClaw', label: '冻爪·拍' },
    { slot: 'trail', ref: 'wendiFrostTrail', label: '霜雪拖尾' },
    { slot: 'trail', ref: 'wendiBloodTrail', label: '血雪拖尾' },
    { slot: 'swingTrail', ref: 'wendiGore', label: '鹿角冲锋斩' },
    { slot: 'effect', ref: 'wendiHowl', label: '温迪戈嚎叫' },
  ],
  mothm: [
    { slot: 'skin', ref: 'mothmSeer', label: '巨蛾预言者' },
    { slot: 'mount', ref: 'mothmWing', label: '巨蛾坐骑' },
    { slot: 'hat', ref: 'mothmAntenna', label: '蛾须发冠' },
    { slot: 'hat', ref: 'mothmEye', label: '赤目面罩' },
    { slot: 'back', ref: 'mothmWings', label: '鳞粉背翼' },
    { slot: 'back', ref: 'mothmCocoon', label: '蛾茧背囊' },
    { slot: 'back', ref: 'mothmLamp', label: '诱蛾灯' },
    { slot: 'back', ref: 'mothmChrysalis', label: '蛹壳背架' },
    { slot: 'aura', ref: 'mothmSwarm', label: '飞蛾环绕' },
    { slot: 'aura', ref: 'mothmPortent', label: '灾兆光环' },
    { slot: 'ring', ref: 'mothmDustRing', label: '鳞粉地环' },
    { slot: 'pet', ref: 'mothmMoth', label: '小飞蛾' },
    { slot: 'racketSkin', ref: 'mothmClaw', label: '蛾爪·拍' },
    { slot: 'racketSkin', ref: 'mothmEyeRacket', label: '巨眼·拍' },
    { slot: 'trail', ref: 'mothmScaleTrail', label: '鳞粉拖尾' },
    { slot: 'trail', ref: 'mothmDustTrail', label: '尘蛾拖尾' },
    { slot: 'swingTrail', ref: 'mothmDive', label: '巨蛾俯冲斩' },
    { slot: 'effect', ref: 'mothmOmen', label: '灾兆降临' },
  ],
  gbeast: [
    { slot: 'skin', ref: 'gbeastPrime', label: '熔岩巨猿' },
    { slot: 'mount', ref: 'gbeastBack', label: '巨兽背乘' },
    { slot: 'hat', ref: 'gbeastSkull', label: '巨兽骷髅冠' },
    { slot: 'hat', ref: 'gbeastTusk', label: '獠牙头饰' },
    { slot: 'back', ref: 'gbeastBone', label: '巨骨背架' },
    { slot: 'back', ref: 'gbeastCrate', label: '集装箱背箱' },
    { slot: 'back', ref: 'gbeastDrum', label: '战鼓背箱' },
    { slot: 'back', ref: 'gbeastTotem', label: '巨兽图腾' },
    { slot: 'aura', ref: 'gbeastRage', label: '怒火环' },
    { slot: 'aura', ref: 'gbeastStorm', label: '巨兽风暴' },
    { slot: 'ring', ref: 'gbeastQuakeRing', label: '震地地环' },
    { slot: 'pet', ref: 'gbeastCub', label: '小巨猿' },
    { slot: 'racketSkin', ref: 'gbeastFur', label: '兽皮·拍' },
    { slot: 'racketSkin', ref: 'gbeastBoneClub', label: '骨棒·拍' },
    { slot: 'trail', ref: 'gbeastDustTrail', label: '尘土拖尾' },
    { slot: 'trail', ref: 'gbeastLavaTrail', label: '熔岩拖尾' },
    { slot: 'swingTrail', ref: 'gbeastSmash', label: '巨猿横扫斩' },
    { slot: 'effect', ref: 'gbeastQuake', label: '巨兽震击' },
  ],
  craw: [
    { slot: 'skin', ref: 'crawCrawler', label: '骨爬巨龙' },
    { slot: 'mount', ref: 'crawRide', label: '骨爬坐骑' },
    { slot: 'hat', ref: 'crawSkull', label: '骷髅头冠' },
    { slot: 'hat', ref: 'crawJaw', label: '巨颌头饰' },
    { slot: 'back', ref: 'crawSpine', label: '棘刺背架' },
    { slot: 'back', ref: 'crawTail', label: '骨尾披挂' },
    { slot: 'back', ref: 'crawEgg', label: '蛋壳背囊' },
    { slot: 'back', ref: 'crawRib', label: '肋骨背架' },
    { slot: 'aura', ref: 'crawToxic', label: '毒雾环' },
    { slot: 'aura', ref: 'crawRumble', label: '地鸣光环' },
    { slot: 'ring', ref: 'crawTrackRing', label: '爪印地环' },
    { slot: 'pet', ref: 'crawHatch', label: '幼骨爬' },
    { slot: 'racketSkin', ref: 'crawFang', label: '龙牙·拍' },
    { slot: 'racketSkin', ref: 'crawClaw', label: '骨爪·拍' },
    { slot: 'trail', ref: 'crawSlimeTrail', label: '黏液拖尾' },
    { slot: 'trail', ref: 'crawBoneTrail', label: '碎骨拖尾' },
    { slot: 'swingTrail', ref: 'crawBite', label: '骨爬撕咬斩' },
    { slot: 'effect', ref: 'crawDevour', label: '骨爬吞噬' },
  ],
  muto: [
    { slot: 'skin', ref: 'mutoQueen', label: '双足巨虫' },
    { slot: 'mount', ref: 'mutoDriller', label: '钻地巨虫' },
    { slot: 'hat', ref: 'mutoShell', label: '甲壳头冠' },
    { slot: 'hat', ref: 'mutoAntenna', label: '辐射触须' },
    { slot: 'back', ref: 'mutoWing', label: '虫翼背架' },
    { slot: 'back', ref: 'mutoEgg', label: '虫卵背囊' },
    { slot: 'back', ref: 'mutoReactor', label: '辐射反应堆' },
    { slot: 'back', ref: 'mutoClaw', label: '巨螯背架' },
    { slot: 'aura', ref: 'mutoFallout', label: '辐射环' },
    { slot: 'aura', ref: 'mutoGlow', label: '幽绿辉光' },
    { slot: 'ring', ref: 'mutoCrackRing', label: '辐射裂纹' },
    { slot: 'pet', ref: 'mutoGrub', label: '巨虫幼虫' },
    { slot: 'racketSkin', ref: 'mutoClawRacket', label: '虫爪·拍' },
    { slot: 'racketSkin', ref: 'mutoSpike', label: '尖刺·拍' },
    { slot: 'trail', ref: 'mutoToxicTrail', label: '毒液拖尾' },
    { slot: 'trail', ref: 'mutoRadTrail', label: '辐射拖尾' },
    { slot: 'swingTrail', ref: 'mutoSting', label: '巨虫穿刺斩' },
    { slot: 'effect', ref: 'mutoBlast', label: '核爆震击' },
  ],
  behe: [
    { slot: 'skin', ref: 'beheTitan', label: '尖角巨兽' },
    { slot: 'mount', ref: 'beheRhino', label: '巨兽坐骑' },
    { slot: 'hat', ref: 'beheHorn', label: '巨角头冠' },
    { slot: 'hat', ref: 'beheSkull', label: '兽颅头罩' },
    { slot: 'back', ref: 'beheSpike', label: '尖刺背甲' },
    { slot: 'back', ref: 'beheArmor', label: '装甲背板' },
    { slot: 'back', ref: 'beheMountain', label: '山岩背架' },
    { slot: 'back', ref: 'beheCage', label: '兽笼背箱' },
    { slot: 'aura', ref: 'beheDust', label: '沙尘环' },
    { slot: 'aura', ref: 'beheMagma', label: '熔岩之心' },
    { slot: 'ring', ref: 'beheFootRing', label: '巨足地环' },
    { slot: 'pet', ref: 'beheCalf', label: '巨兽幼崽' },
    { slot: 'racketSkin', ref: 'beheHornRacket', label: '巨角·拍' },
    { slot: 'racketSkin', ref: 'beheHide', label: '兽皮·拍' },
    { slot: 'trail', ref: 'beheDustTrail', label: '岩尘拖尾' },
    { slot: 'trail', ref: 'beheMagmaTrail', label: '熔岩拖尾' },
    { slot: 'swingTrail', ref: 'behemothCharge', label: '巨兽冲撞斩' },
    { slot: 'effect', ref: 'beheImpact', label: '巨兽冲击' },
  ],
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 星级 → 稀有度（和 `items.ts` 的口径一致） */
function rarityOf(stars: number): Rarity {
  return stars >= 5 ? 'legendary' : stars >= 4 ? 'epic' : stars >= 3 ? 'rare' : 'common';
}

/** 星级权重（越高的星越少见），摇到的星决定这件装备画到第几层 */
const STAR_POOL: number[] = [1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 5];

/**
 * 给一个主题摇物品：件数 15 ~ 池子大小，逐件随机星级（皮肤固定 5★、命中特效固定 4★）。
 * 确定性：同一个 `themeId` 永远得到同一批——人人一致、刷新不变。
 */
function genTheme(themeId: string, pool: PoolItem[]): Item[] {
  const rng = mulberry32(hashStr(`batch22|${themeId}`));
  const min = Math.min(15, pool.length);
  const count = min + Math.floor(rng() * (pool.length - min + 1));
  const list = pool.slice();
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  const picked = list.slice(0, count);
  return picked.map((p): Item => {
    const stars =
      p.slot === 'skin' ? 5 : p.slot === 'effect' ? 4 : STAR_POOL[Math.floor(rng() * STAR_POOL.length)];
    return {
      id: `${p.slot}:${p.ref}`,
      slot: p.slot,
      ref: p.ref,
      label: p.label,
      rarity: rarityOf(stars),
      stars,
      source: 'chest',
    };
  });
}

/** 生成这一批全部主题的物品（在 `items.ts` 里 push 进 `ITEMS`） */
export function generateBatch22Items(): Item[] {
  const out: Item[] = [];
  for (const id of Object.keys(POOLS)) out.push(...genTheme(id, POOLS[id]));
  return out;
}
