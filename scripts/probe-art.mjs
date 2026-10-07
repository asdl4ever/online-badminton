// 临时探针：把新画法在 mock Graphics 上跑一遍，抓 NaN / 异常 / 零绘制
const MODS = {
  mounts13: ['../.probe/game/draw/mounts-theme/mounts13.js', 'MOUNTS_13'],
  mounts14: ['../.probe/game/draw/mounts-theme/mounts14.js', 'MOUNTS_14'],
  rings12: ['../.probe/game/draw/rings-theme/rings12.js', 'RINGS_12'],
  rings13: ['../.probe/game/draw/rings-theme/rings13.js', 'RINGS_13'],
  trails12: ['../.probe/game/draw/trails-theme/trails12.js', 'TRAILS_12'],
  trails13: ['../.probe/game/draw/trails-theme/trails13.js', 'TRAILS_13'],
  swings12: ['../.probe/game/draw/swings-theme/swings12.js', 'SWINGS_12'],
  swings13: ['../.probe/game/draw/swings-theme/swings13.js', 'SWINGS_13'],
  hats15: ['../.probe/game/draw/hats-theme/hats15.js', 'HATS_15'],
  wings19: ['../.probe/game/draw/wings/wings19.js', 'WINGS_19'],
  batch12: ['../.probe/game/draw/skins/batch12.js', null],
};

function mkG() {
  const bad = [];
  let ops = 0;
  const check = (name, args) => {
    for (const v of args) {
      if (typeof v === 'number' && !Number.isFinite(v)) bad.push(`${name}(NaN)`);
      if (Array.isArray(v)) {
        for (const p of v) {
          if (p && typeof p === 'object') {
            if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) bad.push(`${name}(pts NaN)`);
          }
        }
      }
    }
  };
  const g = new Proxy({}, {
    get(_t, k) {
      if (typeof k === 'symbol') return undefined;
      if (k === '__bad') return bad;
      if (k === '__ops') return ops;
      return (...args) => { ops++; check(k, args); };
    },
  });
  return g;
}

const pts = Array.from({ length: 14 }, (_, i) => ({
  x: -40 + i * 6, y: 30 - Math.sin((i / 13) * Math.PI) * 26, a: 0.3 + (i / 13) * 0.7, w: 2 + i * 0.5,
}));
function mkKit(g) {
  const at = (i, off = 0) => ({ x: pts[i].x, y: pts[i].y + off });
  return {
    pts, n: pts.length,
    ribbon: (wm, c, am, off = 0) => { g.lineStyle(wm, c, am); g.lineBetween(at(2, off).x, at(2, off).y, at(9, off).x, at(9, off).y); },
    core: (wm, am) => { g.lineStyle(wm, 0xffffff, am); g.lineBetween(0, 0, 10, 10); },
    at, dot: (i, r, c, am = 1) => g.fillCircle(at(i).x, at(i).y, r),
    wobble: (amp, wm, c, am) => { g.lineStyle(wm, c, am); g.lineBetween(0, 0, amp(1), 5); },
  };
}

const pose = { x: 0, feetY: 0, facing: 1, color: 0xffffff, move: 0.5 };
const now = 12345;

for (const [name, [path, exportName]] of Object.entries(MODS)) {
  let mod;
  try { mod = await import(path); } catch (e) { console.log(`${name}: IMPORT FAIL ${e.message}`); continue; }
  if (!exportName) {
    // 皮肤：逐个导出跑
    for (const [k, v] of Object.entries(mod)) {
      const g = mkG();
      let err = null;
      try { v(g, now, pose); } catch (e) { err = e.message; }
      console.log(`batch12.${k}: ops=${g.__ops} bad=${g.__bad.length ? g.__bad.slice(0, 4).join(' ') : 'none'}${err ? ' ERR ' + err : ''}`);
      if (err) console.log(err.stack.split('\n').slice(1, 4).join('\n'));
    }
    continue;
  }
  const map = mod[exportName];
  const keys = Object.keys(map);
  console.log(`\n== ${name} (${keys.length} keys) ==`);
  for (const k of keys) {
    const g = mkG();
    let err = null;
    try {
      const art = map[k];
      if (name.startsWith('mounts')) art.draw(g, now, 0, 0, 1, art.c, art.a, pose);
      else if (name.startsWith('rings')) art.draw(g, now, 0, 0, art.c, art.a);
      else if (name.startsWith('swings')) art.draw(g, now, 0.5, mkKit(g), art.c ?? 0xffffff, art.a);
      else if (name.startsWith('trails')) art.draw({ g, pts, fade: 1, now }, art.c, art.a);
      else if (name.startsWith('hats')) art.draw(g, now, 0, 0, art.c, art.a);
      else if (name.startsWith('wings')) art.draw(g, now, 0, art.c, art.a);
    } catch (e) { err = e.message; }
    console.log(`${k}: ops=${g.__ops} bad=${g.__bad.length ? g.__bad.slice(0, 3).join(' ') : 'none'}${err ? ' ERR ' + err : ''}`);
    if (err) console.log(err.stack.split('\n').slice(1, 5).join('\n'));
  }
}
