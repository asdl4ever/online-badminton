import fs from 'fs';

const f = 'src/game/cosmetics.ts';
let t = fs.readFileSync(f, 'utf8');

const additions = {
  SKIN_IDS: ["'shnSpirit'", "'mcaSpirit'"],
  WING_IDS: ["'shnWingA'", "'shnWingB'", "'mcaWingA'", "'mcaWingB'"],
  CAPE_IDS: ["'shnCapeA'", "'shnCapeB'", "'mcaCapeA'", "'mcaCapeB'"],
  HAT_IDS: ["'shnHatA'", "'shnHatB'", "'mcaHatA'", "'mcaHatB'"],
  TRAIL_IDS: ["'shnTrailA'", "'shnTrailB'", "'mcaTrailA'", "'mcaTrailB'"],
  SWING_TRAIL_IDS: ["'shnSwing'", "'mcaSwing'"],
  MOUNT_IDS: ["'shnMount'", "'mcaMount'"],
  RING_IDS: ["'shnRing'", "'mcaRing'"],
  AURA_IDS: ["'shnAuraA'", "'shnAuraB'", "'mcaAuraA'", "'mcaAuraB'"],
  RACKET_SKIN_IDS: ["'shnRacketA'", "'shnRacketB'", "'mcaRacketA'", "'mcaRacketB'"],
};

for (const [name, ids] of Object.entries(additions)) {
  const start = t.indexOf(`const ${name}`);
  if (start < 0) throw new Error('not found: ' + name);
  const close = t.indexOf('];', start);
  if (close < 0) throw new Error('close not found: ' + name);
  const missing = ids.filter((id) => !t.slice(start, close).includes(id));
  if (missing.length) {
    t = t.slice(0, close) + missing.map((id) => `  ${id},`).join('\n') + '\n' + t.slice(close);
  }
}
fs.writeFileSync(f, t);
console.log('whitelists patched');
