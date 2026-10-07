// 幂等修复：确保各分包目录里**每个存在的批次文件**都 import + spread 进 index
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const root = 'd:/Games/Badminton/src/game/draw';
const mods = [
  ['hats-theme', /^hats(\d+)\.ts$/, 'HATS'],
  ['wings', /^wings(\d+)\.ts$/, 'WINGS'],
  ['auras', /^auras(\d+)\.ts$/, 'AURAS'],
  ['rings-theme', /^rings(\d+)\.ts$/, 'RINGS'],
  ['mounts-theme', /^mounts(\d+)\.ts$/, 'MOUNTS'],
  ['trails-theme', /^trails(\d+)\.ts$/, 'TRAILS'],
  ['swings-theme', /^swings(\d+)\.ts$/, 'SWINGS'],
  ['weapons', /^weapons(\d+)\.ts$/, 'WEAPONS'],
];

for (const [dir, re, pre] of mods) {
  const ip = `${root}/${dir}/index.ts`;
  let s = readFileSync(ip, 'utf8');
  const files = readdirSync(`${root}/${dir}`)
    .map((f) => f.match(re))
    .filter(Boolean)
    .map((m) => ({ n: Number(m[1]), file: m[0].replace(/\.ts$/, ''), name: `${pre}_${m[1]}` }))
    .sort((a, b) => a.n - b.n);

  const added = [];
  for (const { file, name } of files) {
    // 1) import：按整行匹配（允许没有分号）
    const lineRe = new RegExp(`^import \\{ ${name} \\} from '\\./${file}'`, 'm');
    if (!lineRe.test(s)) {
      const lines = s.split('\n');
      let lastImp = -1;
      lines.forEach((l, i) => {
        if (/^import \{ \w+ \} from '\.\/\w+'/.test(l.replace(/\r$/, ''))) lastImp = i;
      });
      if (lastImp === -1) throw new Error(`no import block in ${ip}`);
      lines.splice(lastImp + 1, 0, `import { ${name} } from './${file}';`);
      s = lines.join('\n');
      added.push(`import ${name}`);
    }
    // 2) spread：按整行匹配
    const spRe = new RegExp(`^  \\.\\.\\.${name},$`, 'm');
    if (!spRe.test(s)) {
      const lines = s.split('\n');
      let lastSp = -1;
      lines.forEach((l, i) => {
        if (/^  \.\.\.\w+,$/.test(l.replace(/\r$/, ''))) lastSp = i;
      });
      if (lastSp === -1) throw new Error(`no spread block in ${ip}`);
      lines.splice(lastSp + 1, 0, `  ...${name},`);
      s = lines.join('\n');
      added.push(`...${name}`);
    }
  }
  writeFileSync(ip, s);
  console.log(`${dir}: ${added.length ? added.join(', ') : 'ok'}`);
}
console.log('DONE');
