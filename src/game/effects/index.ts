import type Phaser from 'phaser';
import type { HitStyle } from '../cosmetics';
import { spark, slash, burst, shock, frost, star, prism, vortex, ripple, hex, spiral, shatter, nova, rune, ringburst, ringdance, prismfan } from './basic';
import { shards, cross, sword, swordcross, shuriken, claw, icicle, boulder, quake, meteor, meteorrain, arrow, aim, shield, chain, thorn, thorncrown } from './shard';
import { petal, feather, blossom, sakura, leafstorm, mushroom, wind, tornado, sand, smoke, tide, tsunami, foam, acid, poison, volcano, blizzard } from './nature';
import { lightning, beam, laser, plasma, magnet, portal, blackhole, galaxy, starlight, starfall, aurora, rainbow, holy, sun, moon, atom, dna, sparkle } from './energy';
import { bubble, note, heart, coin, dice, cube, pyramid, gear, sonic, sonar, web, confetti, comet, bomb, firework, flamenova } from './toy';
import { eye, ink, pixelate, glitch, binary, butterfly, phantom } from './odd';
import { pow } from './pow';
import { gzfire } from './gzfire';
import { meteorBurst } from './alienburst';
import { shardpop, drastar } from './crystal';
import { vdaOm, takKaguraBell, celtRuneBurst, mesoGlyphBurst, cthMadness } from './myth';
import { slavCurseBurst, persHolyFire, incaSolarBurst, polyTikiBurst, auzRainbowBurst } from './folk';
import { nanoBurst, dataCrash, warpBurst, marsDustBurst, forerBurst } from './scifi';
import { glacDeepRoar, fridLureBurst, walrSmash, dimFold, hadalVoid } from './sea';
import { cretImpact, swampGasBurst, iceageBurst, yorThunderBurst, kalSongBurst, banSplat, meme404Burst, officeSnooze, gnomePollen, trashGarbage } from './gen9';
import { dreamBurst, microSplit, alchExplosion, yarnTangle, paintSplashBurst } from './gen10';
import { PLUS_PAINTERS, PLUS_SPAN } from './plus';
import { paintDefault } from './basic';
import type { EffectPainter, HitFlash } from './types';

export type { EffectPainter, HitFlash } from './types';
export { paintDefault };

/** lifetime of each hit-effect style, in seconds */
export const EFFECT_SPAN: Record<HitStyle, number> = {
  ...PLUS_SPAN,
  ring: 0.36,
  spark: 0.4,
  slash: 0.22,
  burst: 0.36,
  shock: 0.4,
  frost: 0.36,
  petal: 0.52,
  lightning: 0.28,
  star: 0.42,
  prism: 0.54,
  vortex: 0.54,
  shards: 0.44,
  ripple: 0.56,
  confetti: 0.58,
  cross: 0.3,
  hex: 0.5,
  spiral: 0.5,
  web: 0.46,
  bubble: 0.6,
  feather: 0.62,
  comet: 0.4,
  shatter: 0.36,
  smoke: 0.66,
  sonic: 0.42,
  gear: 0.54,
  nova: 0.5,
  rune: 0.6,
  bomb: 0.44,
  flamenova: 0.48,
  icicle: 0.42,
  sword: 0.26,
  claw: 0.32,
  meteor: 0.5,
  beam: 0.34,
  poison: 0.6,
  note: 0.62,
  heart: 0.66,
  coin: 0.5,
  dice: 0.46,
  arrow: 0.4,
  shield: 0.44,
  chain: 0.52,
  thorn: 0.44,
  blossom: 0.5,
  cube: 0.44,
  pyramid: 0.5,
  aim: 0.4,
  sonar: 0.5,
  wind: 0.46,
  sand: 0.5,
  acid: 0.5,
  sun: 0.46,
  moon: 0.5,
  eye: 0.46,
  portal: 0.52,
  dna: 0.56,
  atom: 0.52,
  sparkle: 0.46,
  ink: 0.44,
  firework: 0.72,
  ringburst: 0.44,
  swordcross: 0.34,
  shuriken: 0.46,
  boulder: 0.5,
  quake: 0.5,
  tornado: 0.6,
  blizzard: 0.56,
  volcano: 0.62,
  tsunami: 0.56,
  aurora: 0.6,
  starlight: 0.52,
  galaxy: 0.62,
  blackhole: 0.6,
  meteorrain: 0.66,
  rainbow: 0.56,
  laser: 0.3,
  plasma: 0.46,
  magnet: 0.5,
  foam: 0.56,
  leafstorm: 0.6,
  sakura: 0.62,
  mushroom: 0.62,
  pixelate: 0.5,
  glitch: 0.4,
  binary: 0.56,
  ringdance: 0.6,
  butterfly: 0.62,
  phantom: 0.54,
  holy: 0.5,
  thorncrown: 0.5,
  tide: 0.5,
  starfall: 0.56,
  prismfan: 0.5,
  pow: 0.5,
  gzfire: 0.5,
  meteorBurst: 0.56,
  shardpop: 0.5,
  drastar: 0.56,
  // 批十六 神话主题专属命中特效
  vdaOm: 0.62,
  takKaguraBell: 0.58,
  celtRuneBurst: 0.56,
  mesoGlyphBurst: 0.54,
  cthMadness: 0.62,
  // 第六批 民俗神话主题专属命中特效
  slavCurseBurst: 0.6,
  persHolyFire: 0.56,
  incaSolarBurst: 0.56,
  polyTikiBurst: 0.58,
  auzRainbowBurst: 0.62,
  // 第七批 宇宙科幻主题专属命中特效
  nanoBurst: 0.58,
  dataCrash: 0.56,
  warpBurst: 0.6,
  marsDustBurst: 0.58,
  forerBurst: 0.6,
  // 第八批 海洋怪兽主题专属命中特效
  glacDeepRoar: 0.6,
  fridLureBurst: 0.56,
  walrSmash: 0.54,
  dimFold: 0.58,
  hadalVoid: 0.62,
  // 第九批 恐龙 / 史前 / 神话 / 恶搞 主题专属命中特效
  cretImpact: 0.6,
  swampGasBurst: 0.58,
  iceageBurst: 0.54,
  yorThunderBurst: 0.56,
  kalSongBurst: 0.6,
  banSplat: 0.56,
  meme404Burst: 0.62,
  officeSnooze: 0.58,
  gnomePollen: 0.56,
  trashGarbage: 0.58,
  // 第十批 梦境 / 微观 / 炼金 / 毛线 / 画中世界 专属命中特效
  dreamBurst: 0.6,
  microSplit: 0.54,
  alchExplosion: 0.58,
  yarnTangle: 0.56,
  paintSplashBurst: 0.58,
};

/** every style that has a bespoke painter; the rest use `paintDefault` */
export const EFFECT_PAINTERS: Partial<Record<HitStyle, EffectPainter>> = {
  ...PLUS_PAINTERS,
  acid,
  aim,
  arrow,
  atom,
  aurora,
  beam,
  binary,
  blackhole,
  blizzard,
  blossom,
  bomb,
  boulder,
  bubble,
  burst,
  butterfly,
  chain,
  claw,
  coin,
  comet,
  confetti,
  cross,
  cube,
  dice,
  dna,
  eye,
  feather,
  firework,
  flamenova,
  foam,
  frost,
  galaxy,
  gear,
  glitch,
  heart,
  hex,
  holy,
  icicle,
  ink,
  laser,
  leafstorm,
  lightning,
  magnet,
  meteor,
  meteorrain,
  moon,
  mushroom,
  note,
  nova,
  petal,
  phantom,
  pixelate,
  plasma,
  poison,
  portal,
  pow,
  gzfire,
  meteorBurst,
  shardpop,
  drastar,
  vdaOm,
  takKaguraBell,
  celtRuneBurst,
  mesoGlyphBurst,
  cthMadness,
  slavCurseBurst,
  persHolyFire,
  incaSolarBurst,
  polyTikiBurst,
  auzRainbowBurst,
  nanoBurst,
  dataCrash,
  warpBurst,
  marsDustBurst,
  forerBurst,
  glacDeepRoar,
  fridLureBurst,
  walrSmash,
  dimFold,
  hadalVoid,
  cretImpact,
  swampGasBurst,
  iceageBurst,
  yorThunderBurst,
  kalSongBurst,
  banSplat,
  meme404Burst,
  officeSnooze,
  gnomePollen,
  trashGarbage,
  dreamBurst,
  microSplit,
  alchExplosion,
  yarnTangle,
  paintSplashBurst,
  prism,
  prismfan,
  pyramid,
  quake,
  rainbow,
  ringburst,
  ringdance,
  ripple,
  rune,
  sakura,
  sand,
  shards,
  shatter,
  shield,
  shock,
  shuriken,
  slash,
  smoke,
  sonar,
  sonic,
  spark,
  sparkle,
  spiral,
  star,
  starfall,
  starlight,
  sun,
  sword,
  swordcross,
  thorn,
  thorncrown,
  tide,
  tornado,
  tsunami,
  volcano,
  vortex,
  web,
  wind,
};

// ---- ★5 命中特效的「高星华彩」----------------------------------------------
// 22 款 5★ 命中特效在各自画法之上再叠一层：按形态分成爆发 / 星芒 / 旋涡 / 电弧 / 雾散
// 五种，件件可见地更重、更大、更亮；1~4★ 的特效不受影响（保持原有的朴素观感）。
type Flourish = (g: Phaser.GameObjects.Graphics, f: HitFlash, t: number, a: number, size: number) => void;

/** 爆发：双环扩张 + 一圈放射尖芒 */
const flourishNova: Flourish = (g, f, t, a, size) => {
  const r = (10 + t * 64) * size;
  for (let k = 0; k < 12; k++) {
    const ang = (k / 12) * Math.PI * 2 + f.ang;
    g.lineStyle(2 * size, k % 2 ? 0xffffff : f.color, a * 0.7);
    g.lineBetween(f.x + Math.cos(ang) * r * 0.7, f.y + Math.sin(ang) * r * 0.7, f.x + Math.cos(ang) * r * 1.18, f.y + Math.sin(ang) * r * 1.18);
  }
  g.lineStyle(3 * size, 0xffffff, a * 0.5);
  g.strokeCircle(f.x, f.y, r);
  g.lineStyle(5 * size, f.color, a * 0.35);
  g.strokeCircle(f.x, f.y, r * 0.82);
};

/** 星芒：一片四散的大小星点 + 一圈光环 */
const flourishStar: Flourish = (g, f, t, a, size) => {
  for (let k = 0; k < 16; k++) {
    const ang = k * 2.399 + f.seed;
    const rr = (12 + t * 72) * size;
    const tw = 0.5 + 0.5 * Math.sin(f.seed * 7 + k * 1.7);
    g.fillStyle(k % 3 === 0 ? 0xffffff : f.color, a * (0.5 + 0.5 * tw));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (1.6 + 2.6 * (1 - t)) * size);
  }
  g.lineStyle(2 * size, 0xffffff, a * 0.6);
  g.strokeCircle(f.x, f.y, (14 + t * 44) * size);
};

/** 旋涡：三条甩出去又收拢的旋臂 */
const flourishVortex: Flourish = (g, f, t, a, size) => {
  for (let arm = 0; arm < 3; arm++) {
    g.lineStyle(2.4 * size, arm % 2 ? f.color : 0xffffff, a * 0.6);
    g.beginPath();
    for (let s = 0; s <= 12; s++) {
      const u = s / 12;
      const ang = (arm / 3) * Math.PI * 2 + u * 4 + t * 5;
      const rr = u * (14 + t * 62) * size;
      const px = f.x + Math.cos(ang) * rr;
      const py = f.y + Math.sin(ang) * rr;
      if (s === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.strokePath();
  }
};

/** 电弧：三股沿击球方向窜出、带随机折角的雷 */
const flourishBolt: Flourish = (g, f, t, a, size) => {
  for (let k = 0; k < 3; k++) {
    const base = f.ang + (k - 1) * 0.7;
    let px = f.x;
    let py = f.y;
    g.lineStyle(2.4 * size, 0xffffff, a * 0.8);
    for (let s = 1; s <= 6; s++) {
      const len = (8 + t * 62) * (s / 6) * size;
      const jitter = Math.sin(f.seed * 5 + s * 3 + k) * 7 * size;
      const nx = f.x + Math.cos(base) * len - Math.sin(base) * jitter;
      const ny = f.y + Math.sin(base) * len + Math.cos(base) * jitter;
      g.lineBetween(px, py, nx, ny);
      px = nx;
      py = ny;
    }
  }
};

/** 雾散：一团向外飘散的浓雾颗粒 */
const flourishMist: Flourish = (g, f, t, a, size) => {
  for (let k = 0; k < 18; k++) {
    const ang = k * 2.399 + f.seed;
    const rr = (6 + t * 70) * size;
    g.fillStyle(f.color, a * 0.45 * (1 - t));
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, (2 + 3.4 * (1 - t)) * size);
  }
};

/** 棱片：八片彩色三角碎片边自转边螺旋飞散 */
const flourishShard: Flourish = (g, f, t, a, size) => {
  const hues = [0xff5a5a, 0xffb347, 0xffe86a, 0x7ed957, 0x5fd0c0, 0x5aa8ff, 0x9a7bff, 0xff8ad4];
  for (let k = 0; k < 8; k++) {
    const ang = f.ang + (k / 8) * Math.PI * 2 + t * 2.2;
    const rr = (8 + t * 58) * size;
    const px = f.x + Math.cos(ang) * rr;
    const py = f.y + Math.sin(ang) * rr;
    const s = (4 + 3 * (1 - t)) * size;
    g.save();
    g.translateCanvas(px, py);
    g.rotateCanvas(ang + t * 6 + f.seed);
    g.fillStyle(hues[k], a * 0.85 * (1 - t * 0.4));
    g.fillTriangle(-s, s * 0.6, s, s * 0.6, 0, -s * 1.2);
    g.fillStyle(0xffffff, a * 0.5 * (1 - t));
    g.fillTriangle(-s * 0.4, s * 0.3, s * 0.4, s * 0.3, 0, -s * 0.6);
    g.restore();
  }
};

/** 流星：五条沿击球方向射出、拖着尾的流光 */
const flourishComet: Flourish = (g, f, t, a, size) => {
  for (let k = 0; k < 5; k++) {
    const spread = (k - 2) * 0.26;
    const ang = f.ang + spread + Math.sin(f.seed + k) * 0.12;
    const len = (14 + t * 74) * size;
    const tx = f.x + Math.cos(ang) * len;
    const ty = f.y + Math.sin(ang) * len;
    const bx = f.x + Math.cos(ang) * Math.max(0, len - 26 * size);
    const by = f.y + Math.sin(ang) * Math.max(0, len - 26 * size);
    g.lineStyle(3 * size * (1 - t * 0.5), k % 2 ? f.color : 0xffffff, a * 0.8 * (1 - t * 0.3));
    g.lineBetween(bx, by, tx, ty);
    g.fillStyle(0xffffff, a * 0.9 * (1 - t));
    g.fillCircle(tx, ty, 2.2 * size);
  }
};

/** 引力：两圈向内收拢的环 + 中心聚成一点的白光 */
const flourishGrav: Flourish = (g, f, t, a, size) => {
  const r = (64 - t * 48) * size;
  g.lineStyle(3 * size, f.color, a * 0.55);
  g.strokeCircle(f.x, f.y, Math.max(2, r));
  g.lineStyle(1.6 * size, 0xffffff, a * 0.4);
  g.strokeCircle(f.x, f.y, Math.max(1, r * 1.3));
  for (let k = 0; k < 10; k++) {
    const ang = k * 2.399 + f.seed + t * 3;
    const rr = r * (0.5 + 0.5 * ((k % 3) / 3));
    g.fillStyle(k % 2 ? 0xffffff : f.color, a * 0.7);
    g.fillCircle(f.x + Math.cos(ang) * rr, f.y + Math.sin(ang) * rr, 1.8 * size);
  }
  g.fillStyle(0xffffff, a * 0.85 * (1 - t * 0.5));
  g.fillCircle(f.x, f.y, (3 + 5 * t) * size);
};

/** 微华彩（4★）：一圈细环 + 六个沿环闪烁的小亮点——轻，但一眼看得出「高了一档」 */
const flourishGlint: Flourish = (g, f, t, a, size) => {
  const r = (12 + t * 40) * size;
  g.lineStyle(1.4 * size, 0xffffff, a * 0.4);
  g.strokeCircle(f.x, f.y, r);
  for (let k = 0; k < 6; k++) {
    const ang = f.ang + (k / 6) * Math.PI * 2 + t * 1.5;
    const tw = 0.5 + 0.5 * Math.sin(f.seed * 3 + k * 2.1);
    g.fillStyle(0xffffff, a * (0.3 + 0.5 * tw));
    g.fillCircle(f.x + Math.cos(ang) * r, f.y + Math.sin(ang) * r, (1.2 + 1.2 * (1 - t)) * size);
  }
};

/** 5★ 命中特效 → 用哪种华彩 */
const FIVE_STAR_FLOURISH: Partial<Record<HitStyle, Flourish>> = {
  nova: flourishNova, sun: flourishNova, flamenova: flourishNova, gzfire: flourishNova, holy: flourishNova,
  star: flourishStar, rune: flourishStar, petal: flourishStar, moon: flourishStar, shield: flourishStar, beam: flourishStar,
  vortex: flourishVortex, portal: flourishVortex,
  lightning: flourishBolt,
  ink: flourishMist, phantom: flourishMist,
  // 换了更贴题的新华彩：棱光 / 崩裂 → 彩色棱片，流星雨 / 星系 → 流光，黑洞 / 原子 → 引力坍缩
  prism: flourishShard, shatter: flourishShard,
  meteorrain: flourishComet, galaxy: flourishComet,
  blackhole: flourishGrav, atom: flourishGrav,
};

for (const id of Object.keys(FIVE_STAR_FLOURISH) as HitStyle[]) {
  const base = EFFECT_PAINTERS[id];
  const extra = FIVE_STAR_FLOURISH[id];
  if (!base || !extra) continue;
  EFFECT_PAINTERS[id] = (g, f, t, a, size) => {
    base(g, f, t, a, size);
    extra(g, f, t, a, size);
  };
}

/**
 * **4★ 命中特效的「微华彩」**：在各自画法之上叠一层 `flourishGlint`
 * （细环 + 闪烁点）——比 1~3★ 明显亮一档，又不会盖过 5★ 那套全场华彩。
 */
const FOUR_STAR_GLOW: Partial<Record<HitStyle, Flourish>> = {};
for (const id of [
  'burst', 'shock', 'cross', 'spiral', 'feather', 'comet', 'sonic', 'gear', 'bomb', 'sword',
  'claw', 'meteor', 'poison', 'chain', 'thorn', 'blossom', 'cube', 'pyramid', 'eye', 'dna',
  'acid', 'heart', 'firework', 'ringburst', 'swordcross', 'boulder', 'quake', 'tornado',
  'blizzard', 'volcano', 'tsunami', 'aurora', 'starlight', 'rainbow', 'laser', 'plasma',
  'mushroom', 'pixelate', 'glitch', 'binary', 'ringdance', 'butterfly', 'thorncrown', 'tide',
  'prismfan', 'pow', 'shardpop', 'drastar', 'meteorBurst',
  'slavCurseBurst', 'persHolyFire', 'incaSolarBurst', 'polyTikiBurst', 'auzRainbowBurst',
  'nanoBurst', 'dataCrash', 'warpBurst', 'marsDustBurst', 'forerBurst',
  'glacDeepRoar', 'fridLureBurst', 'walrSmash', 'dimFold', 'hadalVoid',
] as HitStyle[]) {
  FOUR_STAR_GLOW[id] = flourishGlint;
}

for (const id of Object.keys(FOUR_STAR_GLOW) as HitStyle[]) {
  const base = EFFECT_PAINTERS[id];
  const extra = FOUR_STAR_GLOW[id];
  if (!base || !extra) continue;
  EFFECT_PAINTERS[id] = (g, f, t, a, size) => {
    base(g, f, t, a, size);
    extra(g, f, t, a, size);
  };
}
