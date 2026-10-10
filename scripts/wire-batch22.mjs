import fs from 'fs';

const COS = 'src/game/cosmetics.ts';
const CHR = 'src/game/draw/character.ts';
const EFFECTS = 'src/game/effects/index.ts';
const SKINS = 'src/game/draw/skins/index.ts';

function eolOf(s) { return s.includes('\r\n') ? '\r\n' : '\n'; }
function nl(s, e) { return e === '\r\n' ? s.replace(/\n/g, '\r\n') : s; }

let patches = 0;
function patch(file, anchor, replacement) {
  let c = fs.readFileSync(file, 'utf8');
  const e = eolOf(c);
  const a = nl(anchor, e);
  const r = nl(replacement, e);
  const i = c.indexOf(a);
  if (i < 0) throw new Error(`[${file}] anchor NOT FOUND: ${anchor.slice(0, 70)}`);
  if (c.indexOf(a, i + a.length) >= 0) throw new Error(`[${file}] anchor NOT UNIQUE: ${anchor.slice(0, 70)}`);
  c = c.slice(0, i) + r + c.slice(i + a.length);
  fs.writeFileSync(file, c);
  patches++;
}

// ---------- id lists ----------
const effects = ['scpBreach','keterBloom','shyScream','rakePounce','wendiHowl','mothmOmen','gbeastQuake','crawDevour','mutoBlast','beheImpact'];
const backs = ['scpCage','scpBioTank','scpCamera','scpStrongbox','keterSpine','keterTent','keterHeart','keterRibcage','shyCage','shyPalePack','shyChain','shyTag','rakeSpine','rakeFence','rakePelt','rakeLair','wendiAntlerPack','wendiFur','wendiTotem','wendiCage','mothmWings','mothmCocoon','mothmLamp','mothmChrysalis','gbeastBone','gbeastCrate','gbeastDrum','gbeastTotem','crawSpine','crawTail','crawEgg','crawRib','mutoWing','mutoEgg','mutoReactor','mutoClaw','beheSpike','beheArmor','beheMountain','beheCage'];
const hats = ['scpGasMask','scpHazmat','keterEye','keterMaw','shyPale','shyMuzzle','rakeSkull','rakeClaw','wendiAntler','wendiSkullHead','mothmAntenna','mothmEye','gbeastSkull','gbeastTusk','crawSkull','crawJaw','mutoShell','mutoAntenna','beheHorn','beheSkull'];
const pets = ['scpRoach','keterLarva','shyPup','rakeCrawler','wendiCalf','mothmMoth','gbeastCub','crawHatch','mutoGrub','beheCalf'];
const petKinds = ['b22Roach','b22Larva','b22Ape','b22Rake','b22Calf','b22Moth','b22Cub','b22Hatch','b22Grub','b22Behe'];
const trails = ['scpStaticTrail','scpBioTrail','keterBloodTrail','keterGrowthTrail','shyFearTrail','shyPaleTrail','rakeScratchTrail','rakeShadowTrail','wendiFrostTrail','wendiBloodTrail','mothmScaleTrail','mothmDustTrail','gbeastDustTrail','gbeastLavaTrail','crawSlimeTrail','crawBoneTrail','mutoToxicTrail','mutoRadTrail','beheDustTrail','beheMagmaTrail'];
const swings = ['scpContainSwing','keterDevour','shyLunge','rakeRend','wendiGore','mothmDive','gbeastSmash','crawBite','mutoSting','behemothCharge'];
const mounts = ['scpPod','keterMass','shyStride','rakeCrawl','wendiElk','mothmWing','gbeastBack','crawRide','mutoDriller','beheRhino'];
const rings = ['scpHazardRing','keterFleshRing','shyTearRing','rakeClawRing','wendiSnowRing','mothmDustRing','gbeastQuakeRing','crawTrackRing','mutoCrackRing','beheFootRing'];
const auras = ['scpAlarm','scpContainField','keterPulse','keterFeast','shyRage','shyCalm','rakeNight','rakeEye','wendiBlizzard','wendiHunger','mothmSwarm','mothmPortent','gbeastRage','gbeastStorm','crawToxic','crawRumble','mutoFallout','mutoGlow','beheDust','beheMagma'];
const rackets = ['scpTaser','scpClipboard','keterClaw','keterRibs','shyArm','shyTooth','rakeBone','rakeFang','wendiBoneAxe','wendiClaw','mothmClaw','mothmEyeRacket','gbeastFur','gbeastBoneClub','crawFang','crawClaw','mutoClawRacket','mutoSpike','beheHornRacket','beheHide'];
const skins = ['scpStatue','keterFlesh','shyGiant','rakeThing','wendiStag','mothmSeer','gbeastPrime','crawCrawler','mutoQueen','beheTitan'];

const wingColors = {
  scpCage:0x8a9a8a, scpBioTank:0x6ac0a0, scpCamera:0x8a8a92, scpStrongbox:0x4a6a4a,
  keterSpine:0xe0d8c8, keterTent:0xa03030, keterHeart:0xb02030, keterRibcage:0xe0d8c8,
  shyCage:0x8a8a92, shyPalePack:0xe8e8e0, shyChain:0x8a8a92, shyTag:0xd8d0a0,
  rakeSpine:0xe0d8c8, rakeFence:0x8a8070, rakePelt:0x8a6a52, rakeLair:0x3a3428,
  wendiAntlerPack:0x9a8060, wendiFur:0x7a5a3a, wendiTotem:0x8a6a3a, wendiCage:0x9a8060,
  mothmWings:0x8a7050, mothmCocoon:0xd8d0c0, mothmLamp:0xffd45c, mothmChrysalis:0xb8c0a0,
  gbeastBone:0xe0d8c8, gbeastCrate:0x8a5a3a, gbeastDrum:0xa03020, gbeastTotem:0x8a5a3a,
  crawSpine:0xe8d0a0, crawTail:0xc8a86a, crawEgg:0xe0d8c0, crawRib:0xe0d8c8,
  mutoWing:0x5a6a3a, mutoEgg:0x9fe86a, mutoReactor:0x5a6a3a, mutoClaw:0x7a8a4a,
  beheSpike:0x8a6a4a, beheArmor:0x5a4030, beheMountain:0x6a5a4a, beheCage:0x5a4030,
};
const hatColors = {
  scpGasMask:0x8a9a8a, scpHazmat:0xd8c040, keterEye:0xa03030, keterMaw:0x8a2020,
  shyPale:0xe8e8e0, shyMuzzle:0x8a8a92, rakeSkull:0xe0d8c8, rakeClaw:0x8a8070,
  wendiAntler:0x9a8060, wendiSkullHead:0xe0d8c8, mothmAntenna:0x8a7050, mothmEye:0xff3a3a,
  gbeastSkull:0xe0d8c8, gbeastTusk:0xe8e0d0, crawSkull:0xe8d0a0, crawJaw:0xc8a86a,
  mutoShell:0x5a6a3a, mutoAntenna:0x7dff5a, beheHorn:0xd8c8a8, beheSkull:0x8a6a4a,
};
const petColors = {
  scpRoach:0x6a5a30, keterLarva:0xc06050, shyPup:0xe8e8e0, rakeCrawler:0x8a8070, wendiCalf:0xd8e8f0,
  mothmMoth:0xb89870, gbeastCub:0x6a4a34, crawHatch:0xc8a86a, mutoGrub:0x9fe86a, beheCalf:0x6a5040,
};
const petKindMap = {
  scpRoach:'b22Roach', keterLarva:'b22Larva', shyPup:'b22Ape', rakeCrawler:'b22Rake', wendiCalf:'b22Calf',
  mothmMoth:'b22Moth', gbeastCub:'b22Cub', crawHatch:'b22Hatch', mutoGrub:'b22Grub', beheCalf:'b22Behe',
};
const trailColors = {
  scpStaticTrail:0x8a9a8a, scpBioTrail:0x6ac0a0, keterBloodTrail:0xa03030, keterGrowthTrail:0xc06050,
  shyFearTrail:0xe8e8e0, shyPaleTrail:0xd8d8d0, rakeScratchTrail:0x8a8070, rakeShadowTrail:0x2a2a30,
  wendiFrostTrail:0xd8e8f0, wendiBloodTrail:0xa03a3a, mothmScaleTrail:0xb89870, mothmDustTrail:0x8a7050,
  gbeastDustTrail:0x8a5a3a, gbeastLavaTrail:0xff6a2a, crawSlimeTrail:0x6a8a4a, crawBoneTrail:0xe8d0a0,
  mutoToxicTrail:0x7dff5a, mutoRadTrail:0x9fe86a, beheDustTrail:0x8a6a4a, beheMagmaTrail:0xff7a3a,
};
const swingColors = {
  scpContainSwing:0x8a9a8a, keterDevour:0xa03030, shyLunge:0xe8e8e0, rakeRend:0x8a8070, wendiGore:0xd8e8f0,
  mothmDive:0xb89870, gbeastSmash:0xffb347, crawBite:0xe8d0a0, mutoSting:0x7dff5a, behemothCharge:0xffb347,
};
const mountColors = {
  scpPod:0x8a9a8a, keterMass:0xa03030, shyStride:0xe8e8e0, rakeCrawl:0x8a8070, wendiElk:0xd8e8f0,
  mothmWing:0xb89870, gbeastBack:0x8a5a3a, crawRide:0xc8a86a, mutoDriller:0x5a6a3a, beheRhino:0x6a5040,
};
const ringColors = {
  scpHazardRing:0xffd45c, keterFleshRing:0xa03030, shyTearRing:0x8ab0c8, rakeClawRing:0x8a8070, wendiSnowRing:0xd8e8f0,
  mothmDustRing:0xb89870, gbeastQuakeRing:0xffb347, crawTrackRing:0xe8d0a0, mutoCrackRing:0x7dff5a, beheFootRing:0x8a6a4a,
};
const auraColors = {
  scpAlarm:0xff3a3a, scpContainField:0x7dffd0, keterPulse:0xa03030, keterFeast:0xff5a5a, shyRage:0xff5a5a, shyCalm:0xd8e0e8,
  rakeNight:0x3a3a44, rakeEye:0xff3a3a, wendiBlizzard:0xd8e8f0, wendiHunger:0x9fd8c8, mothmSwarm:0xb89870, mothmPortent:0xff3a3a,
  gbeastRage:0xff6a2a, gbeastStorm:0xffb347, crawToxic:0x7dff9a, crawRumble:0xe8d0a0, mutoFallout:0x9fe86a, mutoGlow:0x7dff5a,
  beheDust:0x8a6a4a, beheMagma:0xff7a3a,
};
const racketColors = {
  scpTaser:0x8a9a8a, scpClipboard:0xd8c090, keterClaw:0xe0d8c8, keterRibs:0xd8c8b0, shyArm:0xe8e8e0, shyTooth:0xf0ece0,
  rakeBone:0xe0d8c8, rakeFang:0xe8e0d0, wendiBoneAxe:0xd8e8f0, wendiClaw:0xcfe0ea, mothmClaw:0xb89870, mothmEyeRacket:0xff3a3a,
  gbeastFur:0x6a4a34, gbeastBoneClub:0xe0d8c8, crawFang:0xe8d0a0, crawClaw:0xc8a86a, mutoClawRacket:0x7a8a4a, mutoSpike:0x7dff5a,
  beheHornRacket:0xd8c8a8, beheHide:0x6a5040,
};
const skinHeadH = {
  scpStatue:116, keterFlesh:116, shyGiant:118, rakeThing:112, wendiStag:116,
  mothmSeer:116, gbeastPrime:120, crawCrawler:100, mutoQueen:116, beheTitan:120,
};

function unionAdd(ids, indent) { return ids.map((id) => `${indent}| '${id}'`).join('\n'); }
function arrAdd(ids, indent) { return ids.map((id) => `${indent}'${id}',`).join('\n'); }
function colorRec(ids, map, indent) { return ids.map((id) => `${indent}${id}: 0x${map[id].toString(16)},`).join('\n'); }

// ---------- cosmetics.ts : unions ----------
patch(COS, `  | 'paintSplashBurst';`,
  `  | 'paintSplashBurst'\n  // 第二十批 SCP / 巨兽 专属命中特效\n${unionAdd(effects, '  ')};`);
patch(COS, `  | 'paintRoller';`,
  `  | 'paintRoller'\n  // 第二十批背部背挂物件\n${unionAdd(backs, '  ')};`);
patch(COS, `  | 'paintBrushHat';`,
  `  | 'paintBrushHat'\n  // 第二十批头饰\n${unionAdd(hats, '  ')};`);
patch(COS, `  | 'paintBlob';\n\nexport type TrailId`,
  `  | 'paintBlob'\n  // 第二十批宠物\n${unionAdd(pets, '  ')};\n\nexport type TrailId`);
patch(COS, `  | 'paintGoldTrail';`,
  `  | 'paintGoldTrail'\n  // 第二十批击球拖尾\n${unionAdd(trails, '  ')};`);
patch(COS, `  | 'paintSplash';`,
  `  | 'paintSplash'\n  // 第二十批挥拍拖尾\n${unionAdd(swings, '  ')};`);
patch(COS, `  | 'paintHorse';`,
  `  | 'paintHorse'\n  // 第二十批坐骑\n${unionAdd(mounts, '  ')};`);
patch(COS, `  | 'paintSplatterRing';`,
  `  | 'paintSplatterRing'\n  // 第二十批地环\n${unionAdd(rings, '  ')};`);
patch(COS, `  | 'paintGallery';`,
  `  | 'paintGallery'\n  // 第二十批背景\n${unionAdd(auras, '  ')};`);
patch(COS, `  | 'paintTubeRacket';`,
  `  | 'paintTubeRacket'\n  // 第二十批球拍皮肤\n${unionAdd(rackets, '  ')};`);
patch(COS, `  | 'paintMuse';`,
  `  | 'paintMuse'\n  // 第二十批形象\n${unionAdd(skins, '  ')};`);
patch(COS, `  | 'paintBlob';\n\nexport const PET_COLORS`,
  `  | 'paintBlob'\n  // 第二十批宠物 kind\n${unionAdd(petKinds, '  ')};\n\nexport const PET_COLORS`);

// ---------- cosmetics.ts : whitelist arrays ----------
patch(COS, `'paintSplashBurst',];`, `${arrAdd(effects, '  ')}\n'paintSplashBurst',];`);
patch(COS, `'paintRoller',];`, `${arrAdd(backs, '  ')}\n'paintRoller',];`);
patch(COS, `'paintBrushHat',];`, `${arrAdd(hats, '  ')}\n'paintBrushHat',];`);
patch(COS, `'paintBlob',];`, `${arrAdd(pets, '  ')}\n'paintBlob',];`);
patch(COS, `'paintGoldTrail',];`, `${arrAdd(trails, '  ')}\n'paintGoldTrail',];`);
patch(COS, `'paintSplash',];`, `${arrAdd(swings, '  ')}\n'paintSplash',];`);
patch(COS, `'paintHorse',];`, `${arrAdd(mounts, '  ')}\n'paintHorse',];`);
patch(COS, `'paintSplatterRing',];`, `${arrAdd(rings, '  ')}\n'paintSplatterRing',];`);
patch(COS, `'paintGallery',];`, `${arrAdd(auras, '  ')}\n'paintGallery',];`);
patch(COS, `'paintTubeRacket',];`, `${arrAdd(rackets, '  ')}\n'paintTubeRacket',];`);
patch(COS, `'paintMuse',];`, `${arrAdd(skins, '  ')}\n'paintMuse',];`);

// ---------- cosmetics.ts : records ----------
patch(COS, `paintRoller: 0xffd45c,};`, `${colorRec(backs, wingColors, '  ')}\n  paintRoller: 0xffd45c,};`);
patch(COS, `paintRoller: { kind: 'sail', feathers: 1, len: 50, spread: 0.5, w: 16 },};`,
  `${backs.map((id) => `  ${id}: { kind: 'sail', feathers: 1, len: 50, spread: 0.5, w: 16 },`).join('\n')}\n  paintRoller: { kind: 'sail', feathers: 1, len: 50, spread: 0.5, w: 16 },};`);
patch(COS, `paintBrushHat: 0x5a3f6a,};`, `${colorRec(hats, hatColors, '  ')}\n  paintBrushHat: 0x5a3f6a,};`);
patch(COS, `paintBrushHat: 'band',};`, `${hats.map((id) => `  ${id}: 'themed',`).join('\n')}\n  paintBrushHat: 'band',};`);
patch(COS, `paintMuse: 116,};`, `${skins.map((id) => `  ${id}: ${skinHeadH[id]},`).join('\n')}\n  paintMuse: 116,};`);
patch(COS, `paintBlob: 0x5a3f6a,};`, `${colorRec(pets, petColors, '  ')}\n  paintBlob: 0x5a3f6a,};`);
patch(COS, `paintBlob: 'paintBlob',};`, `${pets.map((id) => `  ${id}: '${petKindMap[id]}',`).join('\n')}\n  paintBlob: 'paintBlob',};`);
patch(COS, `paintGoldTrail: 0x5a3f6a,};`, `${colorRec(trails, trailColors, '  ')}\n  paintGoldTrail: 0x5a3f6a,};`);
patch(COS, `paintSplash: 0x5a3f6a,};`, `${colorRec(swings, swingColors, '  ')}\n  paintSplash: 0x5a3f6a,};`);
patch(COS, `paintHorse: 0xff8ad4,};`, `${colorRec(mounts, mountColors, '  ')}\n  paintHorse: 0xff8ad4,};`);
patch(COS, `paintGallery: 0xff8ad4,};`, `${colorRec(auras, auraColors, '  ')}\n  paintGallery: 0xff8ad4,};`);
patch(COS, `paintTubeRacket: 0xff8ad4,};`, `${colorRec(rackets, racketColors, '  ')}\n  paintTubeRacket: 0xff8ad4,};`);

// ---------- index files ----------
const idx = [
  ['src/game/draw/wings/index.ts', 'WINGS_28', 'WINGS_29', 'wings29'],
  ['src/game/draw/auras/index.ts', 'AURAS_26', 'AURAS_27', 'auras27'],
  ['src/game/draw/rings-theme/index.ts', 'RINGS_22', 'RINGS_23', 'rings23'],
  ['src/game/draw/mounts-theme/index.ts', 'MOUNTS_23', 'MOUNTS_24', 'mounts24'],
  ['src/game/draw/weapons/index.ts', 'WEAPONS_24', 'WEAPONS_25', 'weapons25'],
  ['src/game/draw/trails-theme/index.ts', 'TRAILS_22', 'TRAILS_23', 'trails23'],
  ['src/game/draw/swings-theme/index.ts', 'SWINGS_22', 'SWINGS_23', 'swings23'],
  ['src/game/draw/hats-theme/index.ts', 'HATS_24', 'HATS_25', 'hats25'],
];
for (const [file, prev, next, mod] of idx) {
  patch(file, `  ...${prev},\n};`, `  ...${next},\n  ...${prev},\n};`);
  const prefix = mod.replace(/\d+$/, '');
  patch(file, `import { ${prev} } from './${prefix}${prev.replace(/\D/g, '')}';\n`,
    `import { ${prev} } from './${prefix}${prev.replace(/\D/g, '')}';\nimport { ${next} } from './${mod}';\n`);
}

// ---------- effects/index.ts ----------
patch(EFFECTS, `import { dreamBurst, microSplit, alchExplosion, yarnTangle, paintSplashBurst } from './gen10';\n`,
  `import { dreamBurst, microSplit, alchExplosion, yarnTangle, paintSplashBurst } from './gen10';\nimport { ${effects.join(', ')} } from './gen11';\n`);
patch(EFFECTS, `  paintSplashBurst: 0.58,\n};`,
  `${effects.map((id) => `  ${id}: 0.58,`).join('\n')}\n  paintSplashBurst: 0.58,\n};`);
patch(EFFECTS, `  paintSplashBurst,\n`,
  `${effects.map((id) => `  ${id},`).join('\n')}\n  paintSplashBurst,\n`);

// ---------- skins/index.ts ----------
patch(SKINS, `import { dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse } from './batch21';\n`,
  `import { dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse } from './batch21';\nimport { ${skins.join(', ')} } from './batch22';\n`);
patch(SKINS, `  dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse,\n};`,
  `${skins.map((id) => `  ${id},`).join('\n')}\n  dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse,\n};`);

// ---------- character.ts : pet cases ----------
const petCases = `
    case 'b22Roach': {
      const sc = Math.sin(now / 120) * 1.5;
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 9, 14, 4);
      g.fillStyle(color, 1); g.fillEllipse(px + sc, py, 16, 9);
      g.fillStyle(0x2a2010, 1); g.fillEllipse(px + sc + dir * 6, py - 1, 6, 6);
      g.lineStyle(1.4, 0x3a2c14, 0.9); for (let k = 0; k < 3; k++) g.lineBetween(px + sc - 6 + k * 6, py + 4, px + sc - 8 + k * 6 + dir * 3, py + 9);
      g.lineStyle(1.2, 0x2a2010, 0.9); g.lineBetween(px + sc + dir * 9, py - 3, px + sc + dir * 16, py - 8); g.lineBetween(px + sc + dir * 9, py - 1, px + sc + dir * 16, py - 2);
      g.fillStyle(0xff5a3a, 1); g.fillCircle(px + sc + dir * 4, py - 2, 1.2);
      break;
    }
    case 'b22Larva': {
      const wob = Math.sin(now / 300);
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 9, 16, 4);
      for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? color : 0xe0b0a0, 1); g.fillCircle(px - dir * (6 - k * 5) + wob * (k - 1.5), py + Math.sin(now / 300 + k) * 1.5, 6 - k * 0.4); }
      g.fillStyle(0x1a1a1a, 1); g.fillCircle(px + dir * 8, py - 1, 1.2); g.fillCircle(px + dir * 4, py - 1, 1.2);
      break;
    }
    case 'b22Ape': {
      const sw = Math.sin(now / 300) * 2;
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 10, 16, 4);
      g.fillStyle(color, 1); g.fillEllipse(px, py + 1, 14, 13);
      g.lineStyle(5, color, 1); g.lineBetween(px, py - 2, px + dir * 14, py - 6 + sw);
      g.fillStyle(color, 1); g.fillCircle(px + dir * 2, py - 7, 6);
      g.fillStyle(0x1a1a22, 1); g.fillCircle(px + dir * 5, py - 8, 1.2); g.fillCircle(px + dir * 1, py - 8, 1.2);
      break;
    }
    case 'b22Rake': {
      const step = Math.sin(now / 120) * 2;
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 10, 18, 4);
      g.fillStyle(color, 1); g.fillEllipse(px, py + 1, 18, 9);
      g.fillStyle(color, 1); g.fillCircle(px + dir * 9, py - 2, 5.5);
      g.lineStyle(1.6, 0x3a3a3a, 1); for (const lx of [-6, 2]) g.lineBetween(px + lx, py + 5, px + lx + step, py + 10);
      g.lineStyle(2, color, 1); g.lineBetween(px - dir * 9, py, px - dir * 16, py - 6 + step);
      g.fillStyle(0xff3a3a, 1); g.fillCircle(px + dir * 10, py - 3, 1.1);
      break;
    }
    case 'b22Calf': {
      const step = Math.sin(now / 200) * 2;
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 10, 18, 4);
      g.fillStyle(color, 1); g.fillEllipse(px, py, 14, 9);
      for (const lx of [-5, 4]) { g.lineStyle(2, color, 1); g.lineBetween(px + lx, py + 4, px + lx + step, py + 10); }
      g.fillStyle(color, 1); g.fillEllipse(px + dir * 9, py - 6, 6, 6);
      g.lineStyle(2, color, 1); g.lineBetween(px + dir * 7, py - 10, px + dir * 4, py - 16); g.lineBetween(px + dir * 10, py - 10, px + dir * 13, py - 16);
      g.fillStyle(0x1a1a1a, 1); g.fillCircle(px + dir * 11, py - 7, 1.1);
      break;
    }
    case 'b22Moth': {
      const flap = Math.sin(now / 90);
      g.fillStyle(color, 0.9); g.fillPoints([{ x: px, y: py }, { x: px - 14, y: py - 8 - flap * 5 }, { x: px - 4, y: py + 4 }] as never, true); g.fillPoints([{ x: px, y: py }, { x: px + 14, y: py - 8 - flap * 5 }, { x: px + 4, y: py + 4 }] as never, true);
      g.fillStyle(0x4a3a24, 1); g.fillEllipse(px, py, 5, 10);
      g.fillStyle(0xffd45c, 1); g.fillCircle(px - 2, py - 3, 1.4); g.fillCircle(px + 2, py - 3, 1.4);
      g.lineStyle(1, 0x4a3a24, 1); g.lineBetween(px, py - 8, px - 4, py - 13); g.lineBetween(px, py - 8, px + 4, py - 13);
      break;
    }
    case 'b22Cub': {
      const bb = Math.sin(now / 260) * 2;
      g.fillStyle(0x000000, 0.09); g.fillEllipse(px, py + 11, 20, 5);
      g.fillStyle(color, 1); g.fillEllipse(px, py + 2 + bb, 18, 15);
      g.fillStyle(0x4a3222, 1); g.fillEllipse(px, py + 6 + bb, 12, 9);
      g.lineStyle(5, color, 1); g.lineBetween(px - dir * 9, py + bb, px - dir * 15, py + 8 + bb);
      g.fillStyle(color, 1); g.fillCircle(px + dir * 3, py - 8 + bb, 7);
      g.fillStyle(0x1a1208, 1); g.fillCircle(px + dir * 5, py - 9 + bb, 1.3); g.fillCircle(px + dir * 1, py - 9 + bb, 1.3);
      break;
    }
    case 'b22Hatch': {
      const step = Math.sin(now / 140) * 2;
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 10, 18, 4);
      g.fillStyle(color, 1); g.fillEllipse(px - dir * 2, py, 16, 8);
      g.fillStyle(color, 1); g.fillEllipse(px + dir * 9, py, 10, 6);
      g.fillStyle(0xe8e0d0, 1); g.fillTriangle(px + dir * 12, py - 2, px + dir * 20, py, px + dir * 12, py + 2);
      g.lineStyle(1.6, 0x5a4a2a, 1); for (const lx of [-6, 2]) g.lineBetween(px + lx, py + 5, px + lx + step, py + 10);
      g.fillStyle(0x1a1208, 1); g.fillCircle(px + dir * 7, py - 2, 1.1);
      break;
    }
    case 'b22Grub': {
      const wob = Math.sin(now / 280);
      g.fillStyle(0x000000, 0.08); g.fillEllipse(px, py + 9, 16, 4);
      for (let k = 0; k < 4; k++) { g.fillStyle(k % 2 ? 0x7a8a4a : color, 1); g.fillCircle(px - dir * (7 - k * 5) + wob * (k - 1.5), py + Math.sin(now / 280 + k) * 1.5, 6 - k * 0.3); }
      g.fillStyle(0xff5a3a, 1); g.fillCircle(px + dir * 9 + wob, py - 2, 1.4);
      g.fillStyle(0x3a4a1a, 1); g.fillCircle(px + dir * 10 + wob, py + 1, 1.1);
      break;
    }
    case 'b22Behe': {
      const step = Math.sin(now / 180) * 1.5;
      g.fillStyle(0x000000, 0.09); g.fillEllipse(px, py + 11, 22, 5);
      g.fillStyle(color, 1); g.fillEllipse(px, py + 1, 20, 12);
      g.fillStyle(0x4a3524, 1); g.fillEllipse(px, py + 5, 14, 7);
      for (const lx of [-7, 3]) { g.fillStyle(color, 1); g.fillRect(px + lx, py + 6, 4, 6 + step); }
      g.fillStyle(color, 1); g.fillEllipse(px + dir * 12, py - 2, 9, 8);
      g.fillStyle(0xe0d8c8, 1); g.fillTriangle(px + dir * 15, py - 3, px + dir * 19, py - 8, px + dir * 13, py - 2);
      g.fillStyle(0x1a1208, 1); g.fillCircle(px + dir * 13, py - 4, 1.1);
      break;
    }`;
patch(CHR, `      void wob;\n      break;\n    }\n  }\n`, `      void wob;\n      break;\n    }${petCases}\n  }\n`);

console.log('patches applied:', patches);
