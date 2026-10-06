import fs from 'fs';

// 适配层支持的方法（canvas2d.ts）
const adapter = fs.readFileSync('src/game/draw/canvas2d.ts', 'utf8');
const supported = new Set([...adapter.matchAll(/^\s{2}(?:async )?(\w+)\(/gm)].map((m) => m[1]));

const files = [
  'src/game/draw/hats-theme/hats5.ts',
  'src/game/draw/wings/wings9.ts',
  'src/game/draw/capes/capes7.ts',
  'src/game/draw/auras/auras7.ts',
  'src/game/draw/rings-theme/rings3.ts',
  'src/game/draw/mounts-theme/mounts4.ts',
  'src/game/draw/weapons/weapons5.ts',
  'src/game/draw/trails-theme/trails3.ts',
  'src/game/draw/swings-theme/swings3.ts',
  'src/game/draw/skins/shared.ts',
  'src/game/draw/skins/shanhai.ts',
  'src/game/draw/skins/batch2.ts',
];

const bad = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/\bg\.(\w+)\(/g)) {
    if (!supported.has(m[1])) bad.add(`${m[1]}  (${f.split(/[\\/]/).pop()})`);
  }
  // 分包工具函数内部也可能调不支持的
  for (const m of t.matchAll(/\b(g|ctx\.g)\.(\w+)\(/g)) { /* covered */ }
}
console.log(bad.size ? [...bad].join('\n') : 'ALL OK');
console.log('--- adapter methods:', [...supported].filter((s) => /^[a-z]/.test(s)).sort().join(', '));
