import fs from 'fs';

function eolOf(s) { return s.includes('\r\n') ? '\r\n' : '\n'; }
function nl(s, e) { return e === '\r\n' ? s.replace(/\n/g, '\r\n') : s; }
let n = 0;
function patch(file, anchor, replacement) {
  let c = fs.readFileSync(file, 'utf8');
  const e = eolOf(c);
  const a = nl(anchor, e), r = nl(replacement, e);
  const i = c.indexOf(a);
  if (i < 0) throw new Error(`[${file}] NOT FOUND: ${anchor.slice(0, 70)}`);
  if (c.indexOf(a, i + a.length) >= 0) throw new Error(`[${file}] NOT UNIQUE: ${anchor.slice(0, 70)}`);
  c = c.slice(0, i) + r + c.slice(i + a.length);
  fs.writeFileSync(file, c);
  n++;
}

const idx = [
  ['src/game/draw/wings/index.ts', 'WINGS_28', 'WINGS_29', 'wings29', false],
  ['src/game/draw/auras/index.ts', 'AURAS_26', 'AURAS_27', 'auras27', true],
  ['src/game/draw/rings-theme/index.ts', 'RINGS_22', 'RINGS_23', 'rings23', true],
  ['src/game/draw/mounts-theme/index.ts', 'MOUNTS_23', 'MOUNTS_24', 'mounts24', true],
  ['src/game/draw/weapons/index.ts', 'WEAPONS_24', 'WEAPONS_25', 'weapons25', true],
  ['src/game/draw/trails-theme/index.ts', 'TRAILS_22', 'TRAILS_23', 'trails23', true],
  ['src/game/draw/swings-theme/index.ts', 'SWINGS_22', 'SWINGS_23', 'swings23', true],
  ['src/game/draw/hats-theme/index.ts', 'HATS_24', 'HATS_25', 'hats25', true],
];
for (const [file, prev, next, mod, doSpread] of idx) {
  const prefix = mod.replace(/\d+$/, '');
  const digit = prev.replace(/\D/g, '');
  patch(file, `import { ${prev} } from './${prefix}${digit}';`,
    `import { ${prev} } from './${prefix}${digit}';\nimport { ${next} } from './${mod}';`);
  if (doSpread) patch(file, `  ...${prev},\n};`, `  ...${next},\n  ...${prev},\n};`);
}

// effects/index.ts
const effects = ['scpBreach','keterBloom','shyScream','rakePounce','wendiHowl','mothmOmen','gbeastQuake','crawDevour','mutoBlast','beheImpact'];
patch('src/game/effects/index.ts',
  `import { dreamBurst, microSplit, alchExplosion, yarnTangle, paintSplashBurst } from './gen10';`,
  `import { dreamBurst, microSplit, alchExplosion, yarnTangle, paintSplashBurst } from './gen10';\nimport { ${effects.join(', ')} } from './gen11';`);
patch('src/game/effects/index.ts', `  paintSplashBurst: 0.58,\n};`,
  `${effects.map((id) => `  ${id}: 0.58,`).join('\n')}\n  paintSplashBurst: 0.58,\n};`);
patch('src/game/effects/index.ts', `  paintSplashBurst,\n`,
  `${effects.map((id) => `  ${id},`).join('\n')}\n  paintSplashBurst,\n`);

// skins/index.ts
const skins = ['scpStatue','keterFlesh','shyGiant','rakeThing','wendiStag','mothmSeer','gbeastPrime','crawCrawler','mutoQueen','beheTitan'];
patch('src/game/draw/skins/index.ts',
  `import { dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse } from './batch21';`,
  `import { dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse } from './batch21';\nimport { ${skins.join(', ')} } from './batch22';`);
patch('src/game/draw/skins/index.ts', `  dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse,\n};`,
  `${skins.map((id) => `  ${id},`).join('\n')}\n  dreamTapir, microAmeba, alchMaster, yarnGolem, paintMuse,\n};`);

console.log('patches applied:', n);
