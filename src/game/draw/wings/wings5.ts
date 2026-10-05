import { wpoly, wline, type WingArt } from './shared';

/**
 * 绗簲鎵圭繀鑶€鈥斺€?*鑰佹杩佺Щ绮剧粯**锛堝師 feather 绯绘崲鑹叉閫愬彧閲嶇敾锛夛細
 * 澶╀娇 / 鍦ｇ窘 / 缇芥毚 / 鍑ゅ嚢 / 骞界考 / 娴佽悿銆傚彧鐢诲彸缈硷紝宸︾考鐢卞叆鍙ｉ暅鍍忋€?
 */
export const WINGS_5: Record<string, WingArt> = {
  // 澶╀娇锛氫笁灞傜櫧缇藉垪锛堢窘鏍归噾鐜級锛岀窘灏栨硾鍏?
  angel: { c: 0xf6f6fa, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    for (let row = 0; row < 3; row++) {
      const n = 5 - row, y0 = 6 - row * 8, len = 62 - row * 10;
      for (let k = 0; k < n; k++) {
        const t = k / Math.max(1, n - 1);
        const bx = 4 + row * 6, by = y0 - t * (14 + f * 0.5);
        const ang = -Math.PI / 2.6 + t * 0.95;
        const cos = Math.cos(ang), sin = Math.sin(ang);
        const vs = [];
        for (let s = 0; s <= 4; s++) {
          const u = s / 4;
          vs.push({ x: bx + cos * len * u - sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u + cos * 5.4 * Math.sin(u * Math.PI) });
        }
        for (let s = 4; s >= 0; s--) {
          const u = s / 4;
          vs.push({ x: bx + cos * len * u + sin * 5.4 * Math.sin(u * Math.PI), y: by + sin * len * u - cos * 5.4 * Math.sin(u * Math.PI) });
        }
        g.fillStyle(row === 2 ? 0xe4e4ec : c, 0.98 - row * 0.05);
        g.fillPoints(vs as never, true);
      }
    }
    // 閲戣壊缇界幆 + 鍏夌偣
    g.lineStyle(2.2, a, 0.9);
    g.strokeCircle(10, -2, 9);
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 300));
    g.fillStyle(a, tw);
    g.fillCircle(58, -52 - f * 0.6, 2.4);
    g.fillCircle(78, -38 - f * 0.6, 1.8);
  } },
  // 鍦ｇ窘锛氶噾杈圭櫧缈?+ 鑳屽悗涓€杞厜鐜皠绾?
  holyWing: { c: 0xfff6dc, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -34 - f], [56, -58 - f], [88, -46 - f], [70, -10], [34, 10]], c);
    wpoly(g, [[8, 2], [30, -30 - f], [58, -50 - f], [80, -42 - f], [62, -8]], a, 0.28);
    // 浜旀牴閲戠窘杞?
    wline(g, [[4, 2], [30, -30 - f], [54, -50 - f]], 1.6, a, 0.9);
    wline(g, [[6, 4], [36, -22 - f], [66, -34 - f]], 1.4, a, 0.7);
    wline(g, [[6, 6], [40, -12 - f], [72, -18 - f]], 1.4, a, 0.6);
    // 缈煎皷涓夌矑鍦ｅ厜
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 260));
    g.fillStyle(a, tw);
    g.fillCircle(84, -44 - f, 2.8);
    g.fillCircle(66, -52 - f, 2.2);
    g.fillCircle(46, -54 - f, 1.8);
  } },
  // 缇芥毚锛氱窘姣涜椋庢挄鐫€寰€澶栭锛堜竴鎺掔鏁ｇ窘姣涳紝鐩镐綅涔遍锛?
  featherStorm: { c: 0xbfe0ff, a: 0x6fa8e8, draw: (g, now, flap, c, a) => {
    const f = flap * 8;
    for (let k = 0; k < 7; k++) {
      const t = k / 6;
      const drift = Math.sin(now / 300 + k * 1.7) * (4 + t * 8);
      const bx = 6 + t * 66, by = 2 - t * (40 + f);
      const ang = -1.15 + t * 0.8 + drift * 0.02;
      const cos = Math.cos(ang), sin = Math.sin(ang);
      const len = 20 + (k % 3) * 8;
      const vs = [
        { x: bx - sin * 4, y: by + cos * 4 },
        { x: bx + cos * len, y: by + sin * len },
        { x: bx + sin * 4, y: by - cos * 4 },
      ];
      g.fillStyle(k % 2 ? a : c, 0.85 - t * 0.25);
      g.fillPoints(vs as never, true);
    }
    // 椋庣棔
    g.lineStyle(1.4, a, 0.4);
    g.lineBetween(10, -18 - f, 34, -34 - f);
    g.lineBetween(18, -4, 48, -16 - f);
  } },
  // 鍑ゅ嚢锛氱劙缇戒笁灞傦紙澶栫劙/涓劙/鐒拌姱锛? 涓婇鐨勭伀缇?
  phoenix: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f], [64, -8], [32, 10]], 0xb83a1a, 0.9);
    wpoly(g, [[6, 2], [28, -30 - f], [58, -48 - f], [80, -36 - f], [58, -6]], c, 0.95);
    wpoly(g, [[10, 0], [32, -20 - f], [54, -30 - f], [66, -22 - f], [48, -2]], a, 0.75);
    // 鐒扮窘涓婇
    for (let k = 0; k < 5; k++) {
      const ph = (now / 500 + k / 5) % 1;
      g.fillStyle(k % 2 ? a : 0xfff0b0, 0.8 * (1 - ph));
      g.fillCircle(30 + k * 12, -52 - f - ph * 22, 3 * (1 - ph) + 0.8);
    }
    wline(g, [[2, 4], [24, -38 - f], [58, -60 - f], [90, -42 - f]], 2, a, 0.9);
  } },
  // 骞界考锛氬崐閫忔槑骞借啘 + 楠ㄨ妭缈奸 + 娑堟暎鐨勫菇缁跨矑瀛?
  ghostWing: { c: 0x8a7ae8, a: 0x9effd0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [30, -32 - f], [62, -52 - f], [86, -38 - f], [60, -6], [30, 8]], c, 0.42);
    wpoly(g, [[6, 0], [30, -24 - f], [52, -38 - f], [70, -28 - f], [48, -2]], 0xc8bcff, 0.3);
    // 涓夋牴缈奸
    wline(g, [[2, 2], [34, -28 - f], [60, -46 - f]], 2.4, 0xe8e0ff, 0.85);
    wline(g, [[4, 4], [40, -16 - f], [68, -24 - f]], 2, 0xe8e0ff, 0.7);
    // 骞界豢娑堟暎绮掑瓙
    for (let k = 0; k < 4; k++) {
      const ph = (now / 700 + k / 4) % 1;
      g.fillStyle(a, 0.7 * (1 - ph));
      g.fillCircle(44 + k * 10, -40 - f - ph * 16, 2.2 * (1 - ph) + 0.6);
    }
  } },
  // 娴佽悿锛氭殫缈?+ 缈肩紭涓€鍦堜細鍛煎惛鐨勬祦钀?
  fireflyWing: { c: 0x2a3442, a: 0xd8ff6a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [28, -30 - f], [58, -50 - f], [82, -40 - f], [60, -8], [32, 8]], c, 0.95);
    wpoly(g, [[8, 2], [30, -26 - f], [52, -40 - f], [68, -32 - f], [50, -4]], 0x3a4a5c, 0.7);
    wline(g, [[4, 2], [30, -26 - f], [54, -44 - f]], 1.4, 0x55627a, 0.9);
    // 娴佽悿锛堝叚鐐瑰懠鍚革紝鍚勫甫鍏夋檿锛?
    for (let k = 0; k < 6; k++) {
      const tw = 0.25 + 0.75 * Math.abs(Math.sin(now / 320 + k * 2.1));
      const px = 22 + (k % 3) * 24, py = -30 - f - (k % 2) * 14 + Math.sin(now / 400 + k) * 3;
      g.fillStyle(a, tw * 0.3);
      g.fillCircle(px, py, 5);
      g.fillStyle(a, tw);
      g.fillCircle(px, py, 1.8);
    }
  } },
  // 铔剧考锛氭瘺鑼稿弻鍙剁考 + 鐪兼枒 + 槌炵矇
  moth: { c: 0xc8a87a, a: 0x8a6242, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[2, 0], [20, -34 - f], [48, -44 - f], [56, -24 - f], [34, -2]], c, 0.95);
    wpoly(g, [[2, 2], [16, -12 - f * 0.6], [36, -18 - f * 0.6], [40, -4 - f * 0.6], [22, 8]], a, 0.85);
    // 鐪兼枒锛堝鐜唴鐝狅級
    g.fillStyle(0x3a2a1c, 0.9);
    g.fillCircle(34, -28 - f, 5.4);
    g.fillStyle(0xfff0c0, 0.95);
    g.fillCircle(34, -28 - f, 2.6);
    g.fillStyle(0x3a2a1c, 0.6);
    g.fillCircle(24, -8 - f * 0.6, 2.4);
    // 槌炵矇
    for (let k = 0; k < 4; k++) {
      const ph = (now / 900 + k / 4) % 1;
      g.fillStyle(0xfff0c0, 0.6 * (1 - ph));
      g.fillCircle(30 + ph * 16, -40 - f - ph * 12, 1.2);
    }
  } },
  // 澶滈拱锛氶暟鍒€鐘剁柧缈?+ 鐧界考鏉?+ 娈嬪奖
  nightjar: { c: 0x2a3442, a: 0xe8ecf4, draw: (g, _now, flap, c, a) => {
    const f = flap * 8;
    wpoly(g, [[2, 0], [40, -40 - f], [88, -50 - f], [58, -14 - f], [24, 6]], c, 0.96);
    wline(g, [[2, 0], [40, -40 - f], [86, -48 - f]], 2, a, 0.9);
    // 鐧界考鏉犱袱閬?
    g.lineStyle(2.6, a, 0.85);
    g.lineBetween(30, -24 - f, 58, -32 - f);
    g.lineBetween(24, -14 - f, 50, -20 - f);
    // 鐤鹃娈嬪奖
    g.lineStyle(1.6, a, 0.3);
    g.lineBetween(4, 2, 20, -14 - f + 6);
    g.lineBetween(6, 4, 24, -8 - f + 8);
  } },
  // 鐜懓锛氬眰鍙犺姳鐡ｇ考 + 钘よ敁 + 椋樿惤鑺辩摚
  rosewing: { c: 0xe86a8a, a: 0x4fae4a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 4; k++) {
      const t = k / 3;
      g.save();
      g.translateCanvas(4 + t * 34, 2 - t * (26 + f));
      g.rotateCanvas(-0.5 + t * 0.5);
      g.fillStyle(k % 2 ? 0xd8587a : c, 0.95);
      g.fillEllipse(0, 0, 30 - k * 3, 16 - k * 2);
      g.fillStyle(0xffffff, 0.3);
      g.fillEllipse(-4, -2, 10, 4);
      g.restore();
    }
    // 钘よ敁鍗烽』
    g.lineStyle(2, a, 0.9);
    g.beginPath();
    g.arc(52, -44 - f, 6, now / 500, now / 500 + 4);
    g.strokePath();
    // 椋樿惤鑺辩摚
    for (let k = 0; k < 3; k++) {
      const ph = (now / 1100 + k / 3) % 1;
      g.fillStyle(0xffb0c0, 0.8 * (1 - ph));
      g.fillEllipse(40 + k * 12, -30 - f + ph * 26, 5, 3);
    }
  } },
  // 绛夌瀛愶細鏃犺啘鑳介噺缈硷紙鍙屽姬鍏夋潫 + 鏍稿績绾?+ 鐢靛姬鎶栧姩锛?
  plasmaWing: { c: 0x5ac8ff, a: 0xb46cff, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    for (let k = 0; k < 3; k++) {
      const r = 30 + k * 18;
      const flick = 0.7 + 0.3 * Math.sin(now / 90 + k * 2);
      g.lineStyle(3 - k * 0.6, k % 2 ? a : c, flick * (0.9 - k * 0.15));
      g.beginPath();
      g.arc(0, 4, r, -Math.PI * 0.92 + flap * 0.1, -Math.PI * 0.14 + flap * 0.1);
      g.strokePath();
    }
    // 鏍稿績杩炵嚎 + 娌块€斾寒鐝?
    wline(g, [[2, 4], [40, -26 - f], [76, -34 - f]], 1.6, 0xffffff, 0.8);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 240 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.9 * (1 - ph));
      g.fillCircle(20 + ph * 56, -14 - ph * (18 + f), 2);
    }
  } },
  // 鍓ф瘨锛氭淮娑叉瘨鑶滅考 + 姘旀场
  toxicWing: { c: 0x8fd44a, a: 0x3a9a5a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -30 - f], [60, -48 - f], [84, -36 - f], [58, -6], [30, 8]], c, 0.85);
    wpoly(g, [[8, 0], [30, -24 - f], [54, -38 - f], [70, -28 - f], [48, -2]], 0xb8e87a, 0.45);
    wline(g, [[4, 0], [32, -26 - f], [56, -42 - f]], 1.6, a, 0.85);
    // 缈肩紭姣掓淮锛堜笁婊翠笅鍧狅級
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.fillStyle(0xb8e87a, 0.85 * (1 - ph));
      g.fillCircle(20 + k * 20, -6 - f * 0.4 + ph * 16, 2.2 * (1 - ph) + 1);
    }
    // 姘旀场
    g.fillStyle(0xd8ffb0, 0.5);
    g.fillCircle(40, -26 - f, 2.4);
    g.fillCircle(58, -34 - f, 1.8);
  } },
  // 鏈虹敳锛氫笁娈佃鐢叉澘缈?+ 閾嗛拤 + 灏惧柗鍙?
  mechWing: { c: 0x8a94a2, a: 0x5ac8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 3; k++) {
      const bx = 4 + k * 22, by = 2 - k * (12 + f * 0.5);
      g.save();
      g.translateCanvas(bx, by);
      g.rotateCanvas(-0.35 - k * 0.18);
      g.fillStyle(k % 2 ? 0x98a2b2 : c, 0.98);
      g.fillRoundedRect(0, -8, 30 - k * 4, 14 - k * 2, 3);
      g.fillStyle(0x5a6472, 0.9);
      g.fillRoundedRect(0, -8, 30 - k * 4, 4, 2);
      g.fillStyle(a, 0.9);
      g.fillCircle(4, 0, 1.4);
      g.fillCircle(12, 0, 1.4);
      g.restore();
    }
    // 灏惧柗鍙ｈ摑鐒?
    const th = 0.6 + 0.4 * Math.sin(now / 70);
    g.fillStyle(a, th);
    g.fillCircle(2, 6, 4);
    g.fillStyle(0xffffff, th * 0.8);
    g.fillCircle(2, 6, 1.8);
  } },
  // 钘ゅ彾锛氬彾鑴夊ぇ鍙朵袱鐗?+ 鍗烽』钘よ敁
  leafyWing: { c: 0x8fbf5a, a: 0x4a7a3a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [26, -34 - f], [54, -50 - f], [46, -12 - f], [24, 8]], c, 0.97);
    wpoly(g, [[8, 4], [30, -18 - f], [52, -26 - f], [40, 4]], 0xa8d87a, 0.9);
    // 鍙惰剦锛堜富鑴?+ 渚ц剦锛?
    wline(g, [[4, 2], [30, -30 - f], [50, -44 - f]], 2, a, 0.9);
    for (let k = 0; k < 4; k++) {
      const t = 0.25 + k * 0.18;
      wline(g, [[4 + 26 * t, 2 - 32 * t - f * t], [4 + 26 * t + 10, 2 - 32 * t - f * t - 6]], 1.2, a, 0.6);
    }
    // 鍗烽』
    g.lineStyle(1.8, a, 0.85);
    g.beginPath();
    g.arc(58, -40 - f, 5, now / 600, now / 600 + 4.4);
    g.strokePath();
  } },
  // 浣欑儸锛氱劍鐐考 + 缈肩紭瑁傜汗鐏厜 + 鍗囪吘鐏槦
  emberWing: { c: 0x3a2a2a, a: 0xff7a2a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -32 - f], [56, -50 - f], [82, -38 - f], [58, -6], [30, 8]], c, 0.98);
    // 瑁傜汗鐏厜锛堣剦鍐诧級
    const pulse = 0.5 + 0.5 * Math.sin(now / 240);
    g.lineStyle(2, a, 0.35 + pulse * 0.45);
    g.lineBetween(14, -10, 28, -26 - f);
    g.lineBetween(28, -26 - f, 24, -36 - f);
    g.lineBetween(40, -30 - f, 56, -42 - f);
    g.lineBetween(56, -42 - f, 54, -48 - f);
    g.lineBetween(30, 2, 44, -12 - f);
    // 鐏槦鍗囪吘
    for (let k = 0; k < 4; k++) {
      const ph = (now / 600 + k / 4) % 1;
      g.fillStyle(k % 2 ? a : 0xffd45c, 0.8 * (1 - ph));
      g.fillCircle(30 + k * 13, -44 - f - ph * 18, 1.8 * (1 - ph) + 0.6);
    }
  } },
  // 鍏夌窘锛氫簲鏍瑰彂鍏夌窘杞达紙杞村績鐧界儹銆佸鏅曞懠鍚革級
  light: { c: 0xfff6d8, a: 0xffe08a, draw: (g, _now, flap, _c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const bx = 4 + t * 10, by = 4 - t * (12 + f);
      const ang = -1.35 + t * 0.75;
      const len = 46 + (k % 2) * 14;
      g.lineStyle(5, a, 0.22);
      g.lineBetween(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
      g.lineStyle(2.2, 0xffffff, 0.85);
      g.lineBetween(bx, by, bx + Math.cos(ang) * len, by + Math.sin(ang) * len);
      g.fillStyle(0xffffff, 0.7);
      g.fillCircle(bx + Math.cos(ang) * len, by + Math.sin(ang) * len, 2.2);
    }
  } },
  // 鍦ｅ厜锛氬瀭鐩村厜鍒冪考锛堝洓閬撳厜鏌?+ 椤堕儴鍏夊啝锛?
  shine: { c: 0xfff8e0, a: 0xf2c14a, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      const bx = 8 + k * 17;
      const h = 40 - Math.abs(k - 1.5) * 10 + f;
      g.fillStyle(c, 0.22);
      g.fillRect(bx - 5, -h - 8, 10, h + 8);
      g.fillStyle(0xffffff, 0.85);
      g.fillRect(bx - 1.6, -h - 6, 3.2, h + 6);
      g.fillStyle(a, 0.7);
      g.fillCircle(bx, -h - 8, 2.6);
    }
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(now / 280));
    g.fillStyle(a, tw);
    g.fillCircle(34, -58 - f, 3);
  } },
  // 鏄熻景锛氭槦搴х考锛堟槦鐐硅繛绾挎垚缈煎舰锛?
  star: { c: 0x2a2a44, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const pts: Array<[number, number]> = [[4, 4], [20, -18 - f], [40, -36 - f], [62, -46 - f], [84, -40 - f], [66, -18 - f], [44, -6 - f], [24, 4]];
    wline(g, pts, 1.2, a, 0.55);
    for (let k = 0; k < pts.length; k++) {
      const [px, py] = pts[k];
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(now / 300 + k * 1.7));
      g.fillStyle(a, tw);
      g.fillRect(px - 2.4, py - 0.8, 4.8, 1.6);
      g.fillRect(px - 0.8, py - 2.4, 1.6, 4.8);
    }
    g.fillStyle(c, 0.5);
    g.fillCircle(44, -22 - f, 8);
  } },
  // 铏圭考锛氫竷鑹插彔寮э紙娉㈢汗娴佸姩锛?
  rainbow: { c: 0xffffff, a: 0xff8ad4, draw: (g, now, flap, _c, _a) => {
    const cols = [0xe8404a, 0xff8a3c, 0xffd45c, 0x8fd45a, 0x4ac8ff, 0x5a6ae8, 0xa86ae8];
    for (let k = 0; k < 7; k++) {
      const r = 26 + k * 8;
      const ph = now / 300 + k * 0.14;
      g.lineStyle(4.4, cols[k], 0.85 - k * 0.04);
      g.beginPath();
      g.arc(0, 4, r, -Math.PI * 0.95 + ph * 0.05 + flap * 0.08, -Math.PI * 0.1 + ph * 0.05 + flap * 0.08);
      g.strokePath();
    }
  } },
  // 鏄熸渤锛氱传缃楀叞鏄熶簯缈?+ 鏃嬭噦鏄熷皹
  galaxy: { c: 0x6a4ae8, a: 0xd8c8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -30 - f], [58, -52 - f], [86, -40 - f], [60, -6], [30, 8]], c, 0.55);
    wpoly(g, [[8, 0], [30, -24 - f], [52, -40 - f], [70, -30 - f], [48, -2]], 0x9a7aff, 0.4);
    // 鏃嬭噦鏄熷皹
    for (let k = 0; k < 10; k++) {
      const t = k / 9;
      const ang = -1.2 + t * 1.9 + now / 2400;
      const r = 14 + t * 60;
      const px = 8 + Math.cos(ang) * r, py = -6 + Math.sin(ang) * r * 0.62;
      g.fillStyle(k % 3 ? a : 0xffffff, 0.35 + 0.55 * Math.abs(Math.sin(now / 320 + k * 2)));
      g.fillCircle(px, py, 1.6 - t);
    }
  } },
  // 妫卞厜锛氭姌灏勬１闀滅考锛堜笁妫遍暅 + 涓冨僵鍒嗗厜鏉燂級
  prism: { c: 0xe8f0ff, a: 0x8ad8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[6, 6], [26, -14 - f], [46, 6]], c, 0.5);
    g.lineStyle(1.6, a, 0.9);
    g.strokeTriangle(6, 6, 26, -14 - f, 46, 6);
    const cols = [0xe8404a, 0xff8a3c, 0xffd45c, 0x8fd45a, 0x4ac8ff, 0xa86ae8];
    for (let k = 0; k < 6; k++) {
      const ang = -0.42 - k * 0.12;
      const len = 30 + k * 8 + Math.sin(now / 300 + k) * 3;
      g.lineStyle(2, cols[k], 0.8);
      g.lineBetween(30, -8 - f, 30 + Math.cos(ang) * len, -8 - f + Math.sin(ang) * len);
    }
  } },
  // 浜戠窘锛氬嵎浜戠窘鐗囷紙涓濈紩鐘讹紝缂撴參娴佸姩锛?
  cirrus: { c: 0xeaf2fb, a: 0x9ac8ee, draw: (g, now, flap, c, _a) => {
    const f = flap * 5;
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const bx = 4 + t * 14, by = 2 - t * (16 + f);
      const len = 44 - k * 4;
      g.lineStyle(7 - k, k % 2 ? c : 0xffffff, 0.75 - t * 0.15);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = bx + u * len;
        const py = by + Math.sin(u * 4 + now / 500 + k) * 3.4 - u * 6;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  // 鐑堥槼锛氭棩杞考锛堟斁灏勫厜鑺?+ 鏃ュ啎鐜級
  solaris: { c: 0xffb03a, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const cx = 34, cy = -26 - f;
    for (let k = 0; k < 12; k++) {
      const ang = (k / 12) * Math.PI * 2 + now / 1800;
      const r1 = 20, r2 = 34 + (k % 2) * 8;
      wpoly(g, [
        [cx + Math.cos(ang - 0.05) * r1, cy + Math.sin(ang - 0.05) * r1],
        [cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2],
        [cx + Math.cos(ang + 0.05) * r1, cy + Math.sin(ang + 0.05) * r1],
      ], k % 2 ? c : a, 0.8);
    }
    g.fillStyle(c, 0.95);
    g.fillCircle(cx, cy, 15);
    g.fillStyle(0xfff6d8, 0.9);
    g.fillCircle(cx, cy, 10);
    g.lineStyle(1.6, a, 0.6);
    g.strokeCircle(cx, cy, 20 + Math.sin(now / 300) * 1.6);
  } },
  // 鍒冪考锛氫笁鐗囧埄鍒冿紙瀵掑厜鎵繃锛?
  blade: { c: 0xc0ccda, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 3; k++) {
      const bx = 4 + k * 18, by = 2 - k * (10 + f * 0.5);
      const len = 52 - k * 8;
      g.save();
      g.translateCanvas(bx, by);
      g.rotateCanvas(-0.4 - k * 0.15);
      wpoly(g, [[0, -3], [len, 0], [0, 3]], k % 2 ? a : c, 0.96);
      g.fillStyle(0xffffff, 0.5);
      g.fillRect(len * 0.2, -1.2, len * 0.5, 1);
      g.restore();
    }
    const gl = Math.abs(Math.sin(now / 200));
    g.lineStyle(1.4, a, gl * 0.8);
    g.lineBetween(6, -14 - f, 66, -40 - f);
  } },
  // 铚昏湏锛氬洓鐗囬€忔槑澶嶇考锛堣剦绾?+ 楂橀€熼ⅳ鍔級
  dragonfly: { c: 0xbfe8f4, a: 0x5a8ab4, draw: (g, now, _flap, c, a) => {
    const tr = Math.sin(now / 60) * 3;
    for (const [dx, dy] of [[10, -22], [16, -4], [26, -30], [32, -12]] as const) {
      g.fillStyle(c, 0.45);
      g.fillEllipse(dx, dy + tr * (dx > 20 ? 1 : -1), 34, 9);
      g.lineStyle(1, a, 0.6);
      g.lineBetween(dx - 12, dy + tr * (dx > 20 ? 1 : -1), dx + 20, dy + tr * (dx > 20 ? 1 : -1));
    }
    g.fillStyle(0x5a8ab4, 0.8);
    g.fillCircle(6, -14, 3);
  } },
  // 闇撹櫣锛氶湏铏圭伅绠＄考锛堟弿杈瑰彂鍏?+ 闂儊锛?
  neon: { c: 0xff4ac8, a: 0x4affff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const flick = Math.sin(now / 120) > -0.7 ? 1 : 0.3;
    g.lineStyle(3.4, c, 0.9 * flick);
    g.beginPath();
    g.moveTo(2, 6); g.lineTo(28, -34 - f); g.lineTo(58, -52 - f); g.lineTo(84, -40 - f);
    g.strokePath();
    g.lineStyle(1.2, a, 0.8 * flick);
    g.lineBetween(8, 2, 32, -30 - f);
    g.lineBetween(12, 4, 56, -46 - f);
    g.fillStyle(a, 0.85 * flick);
    g.fillCircle(84, -40 - f, 3);
  } },
  // 闆烽渾锛氶浄鑳界考锛堥浄寮ч鏋?+ 鏀剧數锛?
  thunder: { c: 0x9fd8ff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    wline(g, [[2, 4], [30, -30 - f], [60, -48 - f], [84, -38 - f]], 2.6, c, 0.9);
    for (let k = 0; k < 3; k++) {
      if (Math.sin(now / 140 + k * 2) > 0) {
        g.lineStyle(1.6, a, 0.95);
        g.lineBetween(30 + k * 18, -24 - k * 10 - f, 40 + k * 18, -36 - k * 8 - f + Math.sin(now / 60 + k) * 5);
      }
    }
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(84, -38 - f, 2.4);
  } },
  // 姘存櫠锛氭１鏌辨櫠绨囩考锛堟姌灏勯潰 + 闂厜锛?
  crystal: { c: 0x9ad4ff, a: 0xe0f2ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
      const bx = 6 + k * 17, hh = 30 - k * 3;
      wpoly(g, [[bx, 4], [bx + 8, 4 - hh - f * 0.6], [bx + 14, 4]], k % 2 ? c : a, 0.85);
      g.fillStyle(0xffffff, 0.5);
      wpoly(g, [[bx + 2, 2], [bx + 8, 2 - (hh - 8) - f * 0.6], [bx + 10, 2]], 0xffffff, 0.4);
    }
    const tw = Math.abs(Math.sin(now / 350));
    g.fillStyle(0xffffff, tw);
    g.fillCircle(24, -22 - f * 0.6, 2);
  } },
  // 纰庢櫠锛氭偓娴鏅讹紙澶氶潰灏忓潡缁曡浆锛?
  crystalShard: { c: 0xb46cff, a: 0xe8d8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[4, 8], [16, -14 - f], [10, -30 - f], [26, -34 - f], [40, -12 - f], [30, 8]], c, 0.5);
    for (let k = 0; k < 5; k++) {
      const t = k / 4;
      const px = 10 + t * 58, py = -6 - t * (26 + f) + Math.sin(now / 300 + k * 2) * 4;
      g.save();
      g.translateCanvas(px, py);
      g.rotateCanvas(now / 400 + k);
      wpoly(g, [[0, -6], [5, 0], [0, 6], [-5, 0]], k % 2 ? a : c, 0.9);
      g.restore();
    }
  } },
  // 鍐版櫠锛氶湝鑺卞叚妫辩考锛堢敓闀垮懠鍚革級
  frost: { c: 0xbfe8ff, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    const cx = 34, cy = -24 - f;
    const grow = 0.85 + 0.15 * Math.sin(now / 500);
    for (let k = 0; k < 6; k++) {
      const ang = (k / 6) * Math.PI * 2 + now / 2600;
      g.lineStyle(2.2, c, 0.9);
      g.lineBetween(cx, cy, cx + Math.cos(ang) * 30 * grow, cy + Math.sin(ang) * 30 * grow);
      for (const b of [0.55, 0.8]) {
        g.lineBetween(
          cx + Math.cos(ang) * 30 * grow * b, cy + Math.sin(ang) * 30 * grow * b,
          cx + Math.cos(ang + 0.4) * 30 * grow * (b - 0.15), cy + Math.sin(ang + 0.4) * 30 * grow * (b - 0.15));
      }
    }
    g.fillStyle(a, 0.9);
    g.fillCircle(cx, cy, 5);
  } },
  // 鍐版渤锛氬啺宸濊璋风考锛堣摑鐧芥柇灞?+ 瀵掓皵锛?
  glacier: { c: 0x9ad4ee, a: 0xeaf6ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 6], [20, -22 - f], [44, -40 - f], [70, -46 - f], [86, -30 - f], [60, -2], [28, 8]], c, 0.95);
    wpoly(g, [[26, -20 - f], [44, -38 - f], [70, -44 - f], [84, -30 - f], [56, -4]], a, 0.4);
    // 鏂眰瑁傜汗
    g.lineStyle(1.6, 0x4a8ab4, 0.8);
    g.lineBetween(30, -18 - f, 40, -30 - f);
    g.lineBetween(48, -34 - f, 58, -40 - f);
    g.lineBetween(22, 0, 34, -10 - f);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 800 + k / 3) % 1;
      g.fillStyle(a, 0.5 * (1 - ph));
      g.fillCircle(30 + k * 18, -46 - f - ph * 10, 1.6);
    }
  } },
  // 娣辨笂锛氶粦鏇滆啘缈?+ 瑁傝胺骞藉厜 + 瑙﹂浘涓嬪瀭
  abyss: { c: 0x1a1424, a: 0x7a5aff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -34 - f], [58, -52 - f], [84, -38 - f], [56, -6], [28, 8]], c, 0.96);
    wline(g, [[2, 4], [28, -30 - f], [56, -46 - f]], 2.4, 0x2a2038, 1);
    const p = 0.5 + 0.5 * Math.sin(now / 260);
    g.lineStyle(2, a, 0.3 + p * 0.4);
    g.lineBetween(30, -14 - f, 44, -34 - f);
    g.lineBetween(52, -40 - f, 64, -44 - f);
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(a, 0.3 * (1 - ph));
      g.fillCircle(34 + k * 16, -2 + ph * 14, 3 + ph * 4);
    }
  } },
  // 楠ㄧ考锛氶鑺傝噦楠ㄤ笁娈?+ 鑺傚ご + 娣¤啘
  bone: { c: 0xd8c8a0, a: 0xf2ead8, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[6, 2], [34, -28 - f], [62, -44 - f], [80, -34 - f], [54, -6], [30, 8]], 0xf2ead8, 0.22);
    wline(g, [[2, 2], [30, -20 - f]], 5, c, 1);
    wline(g, [[30, -20 - f], [58, -40 - f]], 4, c, 1);
    wline(g, [[58, -40 - f], [82, -34 - f]], 3, c, 1);
    for (const [jx, jy, r] of [[30, -20 - f, 4], [58, -40 - f, 3.4], [82, -34 - f, 2.6]] as const) {
      g.fillStyle(a, 1);
      g.fillCircle(jx, jy, r);
      g.fillStyle(0xb8a880, 0.5);
      g.fillCircle(jx - r * 0.3, jy - r * 0.3, r * 0.35);
    }
  } },
  // 鎭堕瓟锛氭殫绾㈣啘缈?+ 榛戣壊鑴夌粶 + 灏栧埡鍓嶇紭
  demon: { c: 0x8a1a2a, a: 0x1a0e14, draw: (g, _now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [26, -36 - f], [58, -56 - f], [86, -40 - f], [58, -6], [28, 8]], c, 0.95);
    wline(g, [[2, 4], [26, -36 - f], [58, -56 - f], [86, -40 - f]], 2.2, a, 0.9);
    g.lineStyle(1.8, a, 0.75);
    g.lineBetween(6, 0, 36, -24 - f); g.lineBetween(36, -24 - f, 52, -40 - f);
    g.lineBetween(10, 4, 40, -12 - f); g.lineBetween(40, -12 - f, 64, -24 - f);
    for (const [sx, sy] of [[26, -36 - f], [58, -56 - f], [86, -40 - f]] as const) {
      wpoly(g, [[sx - 4, sy + 4], [sx, sy - 6], [sx + 4, sy + 4]], 0x2a0e14, 1);
    }
  } },
  // 榄旂考锛氱传榛戣潬缈?+ 涓夊皷閿嬬劙灏?
  devilWing: { c: 0x3a2050, a: 0xff5a3a, draw: (g, _now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 2], [28, -32 - f], [46, -48 - f], [64, -44 - f], [82, -52 - f], [66, -20 - f], [40, 2], [24, 8]], c, 0.96);
    wline(g, [[2, 2], [30, -28 - f], [46, -46 - f]], 2.2, 0x5a3a7a, 1);
    wline(g, [[4, 4], [44, -20 - f], [62, -40 - f]], 1.8, 0x5a3a7a, 0.85);
    for (const [sx, sy] of [[46, -48 - f], [64, -44 - f], [82, -52 - f]] as const) {
      g.fillStyle(a, 0.85);
      g.fillCircle(sx, sy, 2.6);
      g.fillStyle(a, 0.3);
      g.fillCircle(sx, sy, 5);
    }
  } },
  // 榫欑考锛氬澶ч碁鑶?+ 缈兼寚楠?+ 鍏宠妭鍒╃埅
  dragon: { c: 0x4a8a5a, a: 0xd9b45c, draw: (g, _now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [30, -38 - f], [64, -58 - f], [92, -44 - f], [62, -8], [30, 10]], c, 0.96);
    wline(g, [[2, 4], [34, -34 - f], [64, -56 - f]], 3, 0x2f6a3f, 1);
    wline(g, [[4, 4], [42, -20 - f], [78, -40 - f]], 2.6, 0x2f6a3f, 0.95);
    wline(g, [[6, 6], [48, -10 - f], [88, -20 - f]], 2.2, 0x2f6a3f, 0.9);
    g.lineStyle(1.2, 0x2f6a3f, 0.6);
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      g.arc(16 + k * 12, -12 - f * (0.3 + k * 0.15), 6, -0.8, 2.2);
      g.strokePath();
    }
    wpoly(g, [[62, -56 - f], [72, -62 - f], [66, -52 - f]], a, 1);
  } },
  // 褰辩考锛氱儫褰辫啘 + 杈圭紭娑堟暎
  shadow: { c: 0x1c1c26, a: 0x55556a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -32 - f], [58, -50 - f], [82, -36 - f], [54, -4], [26, 8]], c, 0.85);
    wpoly(g, [[8, 0], [30, -24 - f], [50, -38 - f], [66, -26 - f], [44, -2]], 0x2a2a38, 0.6);
    for (let k = 0; k < 5; k++) {
      const ph = (now / 750 + k / 5) % 1;
      g.fillStyle(a, 0.4 * (1 - ph));
      g.fillCircle(30 + k * 13, -38 - f - ph * 14, 3.4 * (1 - ph) + 0.8);
    }
  } },
  // 闆锋毚锛氶鏆翠簯鑶?+ 鑶滃唴闆风數鑴夌粶锛堣剦鍐诧級
  stormcall: { c: 0x3a4a5c, a: 0xffe89a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [26, -32 - f], [56, -52 - f], [84, -40 - f], [58, -6], [28, 8]], c, 0.95);
    wpoly(g, [[8, 0], [30, -26 - f], [54, -42 - f], [72, -32 - f], [48, -2]], 0x556a7c, 0.6);
    for (let k = 0; k < 3; k++) {
      if (Math.sin(now / 130 + k * 2.4) > 0.1) {
        g.lineStyle(1.8, a, 0.95);
        g.lineBetween(24 + k * 16, -20 - k * 8 - f, 34 + k * 16, -34 - k * 6 - f);
        g.lineBetween(34 + k * 16, -34 - k * 6 - f, 30 + k * 16, -42 - k * 4 - f);
      }
    }
  } },
  // 娼睈锛氬崐閫忔按鑶滅考 + 娉㈠眰 + 姘村厜
  tide: { c: 0x4aa8c8, a: 0x9ffcf0, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 2], [28, -32 - f], [58, -50 - f], [84, -38 - f], [56, -6], [28, 8]], c, 0.6);
    for (let k = 0; k < 3; k++) {
      g.lineStyle(2.4, k % 2 ? a : 0xffffff, 0.55 - k * 0.12);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = 6 + u * 74;
        const py = -8 - k * 12 - f * 0.7 + Math.sin(u * 5 + now / 300 + k) * 3.4 - u * 10;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  // 极光：垂落光带（多层缓摆 + 星屑坠落）
  aurora: { c: 0x7dffc4, a: 0x9ad4ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 3; k++) {
      g.lineStyle(6 - k, k % 2 ? a : c, 0.4 - k * 0.08);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = 4 + u * 78;
        const py = -10 - k * 14 - f + Math.sin(u * 4.4 + now / 600 + k) * 8 - u * 14;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    for (let k = 0; k < 3; k++) {
      const ph = (now / 900 + k / 3) % 1;
      g.fillStyle(0xffffff, 0.6 * (1 - ph));
      g.fillCircle(16 + k * 24, -30 - f + ph * 24, 1.4);
    }
  } },
  // 极夜：冷紫夜幕翼 + 一轮细月 + 寒星
  auroraBore: { c: 0x2a2450, a: 0xb8a8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[2, 4], [26, -34 - f], [58, -52 - f], [84, -38 - f], [56, -6], [28, 8]], c, 0.95);
    wpoly(g, [[8, 0], [30, -26 - f], [54, -42 - f], [72, -30 - f], [46, -2]], 0x3a3468, 0.7);
    // 细月
    g.fillStyle(a, 0.95);
    g.fillCircle(62, -40 - f, 7);
    g.fillStyle(c, 1);
    g.fillCircle(65, -42 - f, 6);
    for (let k = 0; k < 4; k++) {
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 340 + k * 2));
      g.fillStyle(0xffffff, tw);
      g.fillCircle(20 + k * 16, -20 - f - (k % 2) * 10, 1.2);
    }
  } },
  // 彗尾：核 + 扫帚尾（尘埃带散开）
  comet: { c: 0x9fd8ff, a: 0xffffff, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    const hx = 70, hy2 = -44 - f;
    wpoly(g, [[hx - 8, hy2 - 6], [hx + 8, hy2], [hx - 8, hy2 + 6]], 0xffffff, 0.95);
    g.fillStyle(c, 0.9);
    g.fillCircle(hx, hy2, 6);
    for (let k = 0; k < 7; k++) {
      const t = (k / 6) * 0.9;
      const spread = t * 16;
      g.fillStyle(k % 2 ? c : a, 0.6 * (1 - t));
      g.fillCircle(hx - 8 - t * 62, hy2 + Math.sin(k * 2.4) * spread, 3.4 * (1 - t) + 0.8);
    }
  } },
  // 流光：贯体流光翼（光带穿梭）
  glow: { c: 0xffe89a, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 4; k++) {
      const t = k / 3;
      const px = 6 + t * 62, py = -4 - t * (30 + f);
      g.fillStyle(c, 0.16);
      g.fillCircle(px, py, 9 - t * 2);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(px, py, 3 - t);
    }
    g.lineStyle(1.4, a, 0.4);
    g.beginPath();
    for (let s = 0; s <= 5; s++) {
      const u = s / 5;
      const px = 6 + u * 66, py = -4 - u * (30 + f) + Math.sin(u * 6 + now / 250) * 4;
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
  } },
  // 月帘：垂落月色纱帘（细带 + 末端月牙坠）
  moonveil: { c: 0xd8e0ff, a: 0xffe89a, draw: (g, now, flap, c, a) => {
    const f = flap * 4;
    for (let k = 0; k < 4; k++) {
      const bx = 10 + k * 16;
      const sway = Math.sin(now / 400 + k) * 3;
      g.lineStyle(2.6, c, 0.7 - k * 0.08);
      g.lineBetween(bx, -8, bx + sway, 30 - f * 0.4 - k * 4);
      g.fillStyle(a, 0.9);
      g.fillCircle(bx + sway, 33 - f * 0.4 - k * 4, 2.4);
    }
    g.lineStyle(1.6, c, 0.4);
    g.lineBetween(4, -8, 62, -8);
  } },
  // 飘带：双绸带翻转（交替上下）
  ribbonDance: { c: 0xff8ad4, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 2; k++) {
      g.lineStyle(6 - k * 2, k % 2 ? a : c, 0.9);
      g.beginPath();
      for (let s = 0; s <= 6; s++) {
        const u = s / 6;
        const px = 4 + u * 80;
        const py = -6 - k * 10 - f + Math.sin(u * 5 + now / 240 + k * 2.4) * (10 + u * 6);
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
  } },
  // 丝绸：绸面翼（缎面高光流动）
  silk: { c: 0xf0d8e8, a: 0xc86a9a, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[2, 4], [26, -32 - f], [56, -50 - f], [84, -38 - f], [56, -6], [28, 8]], c, 0.95);
    // 缎面流光（两道波状高光移动）
    for (let k = 0; k < 2; k++) {
      g.lineStyle(3, 0xffffff, 0.35);
      g.beginPath();
      for (let s = 0; s <= 5; s++) {
        const u = s / 5;
        const px = 6 + u * 72;
        const py = -8 - k * 12 - f * 0.8 + Math.sin(u * 5 + now / 400 + k * 2) * 4 - u * 8;
        if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
      }
      g.strokePath();
    }
    wline(g, [[2, 4], [26, -32 - f], [56, -50 - f], [84, -38 - f]], 1.6, a, 0.7);
    } },
    // 蝶翼：上下双叶 + 翅脉 + 缘点
    butterfly: { c: 0xff8ad4, a: 0x1a1a22, draw: (g, _now, flap, c, a) => {
    const f = flap * 9;
    g.fillStyle(c, 0.95);
    g.fillEllipse(30, -30 - f * 0.6, 52, 34);
    g.fillStyle(0xd8587a, 0.9);
    g.fillEllipse(24, -4 - f * 0.4, 38, 24);
    g.lineStyle(1.4, a, 0.6);
    g.lineBetween(4, 0, 48, -34 - f * 0.6);
    g.lineBetween(4, 0, 40, -4 - f * 0.4);
    g.fillStyle(0xffffff, 0.85);
    for (const [dx, dy] of [[48, -36 - f * 0.6], [20, -14 - f * 0.4], [40, -12 - f * 0.4]] as const) {
    g.fillCircle(dx, dy, 2.4);
    }
    } },
    // 精灵：透光薄翼（四叶透明 + 光尘）
    fairy: { c: 0xd8fff0, a: 0x9effd0, draw: (g, now, flap, c, a) => {
    const f = flap * 10;
    g.fillStyle(c, 0.55);
    g.fillEllipse(26, -32 - f, 40, 26);
    g.fillEllipse(20, -2 - f * 0.5, 32, 20);
    g.fillStyle(0xffffff, 0.5);
    g.fillEllipse(22, -36 - f, 16, 8);
    g.lineStyle(1.2, a, 0.8);
    g.lineBetween(4, 0, 44, -34 - f);
    g.lineBetween(4, 0, 34, -2 - f * 0.5);
    for (let k = 0; k < 3; k++) {
    const ph = (now / 700 + k / 3) % 1;
    g.fillStyle(a, 0.7 * (1 - ph));
    g.fillCircle(30 + k * 10, -40 - f - ph * 10, 1.4);
    }
    } },
    // 蛾皇：厚重皇蛾翼（双对叶 + 双眼斑 + 皇纹）
    mothKing: { c: 0xc9955a, a: 0x8a5a2a, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 0], [18, -38 - f], [52, -48 - f], [58, -24 - f], [34, -2]], c, 0.96);
    wpoly(g, [[2, 4], [14, -14 - f * 0.6], [38, -20 - f * 0.6], [42, -4 - f * 0.6], [22, 10]], a, 0.9);
    for (const [ex, ey, r] of [[36, -30 - f, 6.4], [26, -8 - f * 0.6, 4.4]] as const) {
    g.fillStyle(0x2a1a10, 0.9);
    g.fillCircle(ex, ey, r);
    g.fillStyle(0xfff0c0, 0.95);
    g.fillCircle(ex, ey, r * 0.45);
    g.lineStyle(1.2, 0x2a1a10, 0.7);
    g.strokeCircle(ex, ey, r);
    }
    g.lineStyle(1.4, 0x2a1a10, 0.5);
    g.lineBetween(10, -6 - f, 48, -34 - f);
    } },
    // 纸翼：折纸鹤翼（折面 + 折痕）
    paper: { c: 0xfaf6e8, a: 0xc9b88a, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [30, -30 - f], [80, -44 - f], [46, -6 - f]], c, 1);
    wpoly(g, [[2, 4], [24, -12 - f], [60, -20 - f], [30, 6]], 0xfffdf2, 0.95);
    g.lineStyle(1.4, a, 0.8);
    g.lineBetween(2, 4, 30, -30 - f);
    g.lineBetween(2, 4, 80, -44 - f);
    g.lineBetween(30, -30 - f, 80, -44 - f);
    g.lineBetween(2, 4, 46, -6 - f);
    } },
    // 珊瑚鳍：扇形鳍膜（放射鳍条 + 斑点）
    coralFin: { c: 0xff8a7a, a: 0xd85848, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 7; k++) {
    const ang = -1.4 + (k / 6) * 1.5 + flap * 0.1;
    wline(g, [[4, 0], [4 + Math.cos(ang) * 62, Math.sin(ang) * 62]], 2.2, a, 0.85);
    }
    g.fillStyle(c, 0.6);
    g.beginPath();
    g.arc(4, 0, 58, -1.5 + flap * 0.1, 0.15 + flap * 0.1);
    g.closePath(); g.fillPath();
    g.fillStyle(0xffffff, 0.4);
    for (let k = 0; k < 4; k++) {
    g.fillCircle(20 + k * 12, -16 - k * 5 - f, 2.4 - k * 0.4);
    }
    } },
    // 冠鳍：龙鱼冠鳍（锯齿背鳍 + 鳍刺）
    crest: { c: 0x4ac8b4, a: 0x1a6a5a, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 6], [14, -22 - f], [30, -40 - f], [48, -50 - f], [66, -46 - f], [80, -32 - f], [86, -12 - f], [58, 4], [24, 8]], c, 0.95);
    wline(g, [[2, 6], [24, -18 - f], [48, -44 - f], [86, -12 - f]], 2, a, 0.9);
    for (let k = 0; k < 4; k++) {
    const sx = 20 + k * 16;
    wline(g, [[sx, -24 - f - k * 4], [sx + 3, -34 - f - k * 4]], 1.6, a, 0.8);
    }
    } },
    // 蝠鲼：滑翔双翼（扑动翼尖 + 尾）
    manta: { c: 0x4a5a74, a: 0x9fd8ff, draw: (g, now, _flap, c, a) => {
    const f = Math.sin(now / 480) * 10;
    wpoly(g, [[2, 0], [40, -30 - f], [80, -18 - f], [92, 0 - f], [56, 12], [20, 10]], c, 0.96);
    wpoly(g, [[10, 4], [40, -8 - f * 0.6], [66, 2 - f * 0.6], [48, 10]], 0x5a6a88, 0.7);
    wline(g, [[6, 2], [40, -26 - f], [88, -2 - f]], 2, a, 0.7);
    g.lineStyle(2.4, c, 0.9);
    g.lineBetween(4, 4, -14, 10 + Math.sin(now / 400) * 3);
    g.fillStyle(a, 0.9);
    g.fillCircle(44, -14 - f, 2.4);
    } },
    // 珊瑚：枝状珊瑚翼（分叉枝 + 顶端息肉）
    reef: { c: 0xff7a5a, a: 0xd84838, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (const [tx, ty, ang, len] of [[8, 4, -1.2, 40], [20, 2, -0.8, 48], [34, 2, -0.5, 42], [48, 4, -0.2, 32]] as const) {
    const bx = tx, by = ty - f * 0.4;
    wline(g, [[bx, by], [bx + Math.cos(ang) * len * 0.5, by + Math.sin(ang) * len * 0.5], [bx + Math.cos(ang) * len, by + Math.sin(ang) * len + 6]], 5 - Math.abs(ang) * 1.4, c, 0.95);
    g.fillStyle(a, 0.95);
    g.fillCircle(bx + Math.cos(ang) * len, by + Math.sin(ang) * len + 6, 3.4);
    }
    for (let k = 0; k < 3; k++) {
    const ph = (now / 800 + k / 3) % 1;
    g.fillStyle(0xffd0c0, 0.6 * (1 - ph));
    g.fillCircle(20 + k * 14, -34 - f - ph * 10, 1.4);
    }
    } },
    // 海波：海浪翼（双波卷 + 浪花）
    seaWave: { c: 0x4a90d9, a: 0xffffff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 2; k++) {
    g.lineStyle(8 - k * 3, k % 2 ? c : a, 0.85 - k * 0.25);
    g.beginPath();
    for (let s = 0; s <= 6; s++) {
      const u = s / 6;
      const px = 4 + u * 76;
      const py = -6 - k * 14 - f + Math.sin(u * 4.6 + now / 280 + k * 2) * (7 + u * 5);
      if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    }
    for (let k = 0; k < 3; k++) {
    const ph = (now / 500 + k / 3) % 1;
    g.fillStyle(0xffffff, 0.6 * (1 - ph));
    g.fillCircle(24 + k * 18, -30 - f - ph * 8, 2.4 * (1 - ph) + 0.8);
    }
    } },
    // 潮浪：月引潮汐翼（双潮峰对涌）
    wave: { c: 0x3a7ab4, a: 0xbfe8ff, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    const t1 = Math.sin(now / 400), t2 = Math.sin(now / 400 + 2.2);
    wpoly(g, [[2, 6], [26, -18 - f - t1 * 6], [52, -30 - f], [78, -16 - f - t2 * 6], [86, 2], [50, 10], [20, 8]], c, 0.9);
    g.lineStyle(2.4, a, 0.8);
    g.beginPath();
    for (let s = 0; s <= 6; s++) {
    const u = s / 6;
    const px = 4 + u * 80;
    const py = -14 - f + Math.sin(u * 5.4 + now / 240) * 5 - u * 4;
    if (s === 0) g.moveTo(px, py); else g.lineTo(px, py);
    }
    g.strokePath();
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(50, -30 - f, 2.6);
    } },
    // 烈焰：焰膜翼（内焰翻涌 + 火星）
    flame: { c: 0xe8562a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [28, -34 - f], [58, -54 - f], [84, -40 - f], [56, -6], [28, 8]], c, 0.95);
    wpoly(g, [[8, 0], [30, -26 - f], [54, -42 - f], [72, -30 - f], [48, -2]], a, 0.6);
    for (let k = 0; k < 4; k++) {
    const ph = (now / 450 + k / 4) % 1;
    g.fillStyle(0xfff0b0, 0.8 * (1 - ph));
    g.fillCircle(28 + k * 14, -46 - f - ph * 16, 2.4 * (1 - ph) + 0.7);
    }
    } },
    // 日炎：白日焰翼（金白色焰舌）
    sunfire: { c: 0xffc02a, a: 0xfff6d8, draw: (g, now, flap, c, _a2) => {
    const f = flap * 7;
    wpoly(g, [[2, 4], [26, -34 - f], [56, -54 - f], [84, -40 - f], [56, -6], [28, 8]], c, 0.95);
    wpoly(g, [[8, 0], [30, -28 - f], [54, -44 - f], [74, -32 - f], [48, -2]], 0xfff6d8, 0.7);
    for (let k = 0; k < 3; k++) {
    const fl = Math.sin(now / 90 + k * 2) * 3;
    wpoly(g, [[34 + k * 16, -40 - f], [38 + k * 16, -52 - f - fl], [42 + k * 16, -40 - f]], 0xffffff, 0.55);
    }
    } },
    // 余烬（gacha）：焦膜 + 阴燃红缝
    ember: { c: 0x4a3230, a: 0xff6a3a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[2, 4], [26, -32 - f], [56, -50 - f], [82, -38 - f], [56, -6], [28, 8]], c, 0.97);
    const p = 0.5 + 0.5 * Math.sin(now / 300);
    g.lineStyle(1.8, a, 0.3 + p * 0.4);
    g.lineBetween(16, -12, 30, -28 - f);
    g.lineBetween(44, -34 - f, 58, -44 - f);
    g.fillStyle(a, 0.4 + p * 0.4);
    g.fillCircle(30, -28 - f, 1.8);
    g.fillCircle(58, -44 - f, 1.5);
    } },
    // 机械：装板翼（四块装甲 + 液压杆）
    mech: { c: 0x9aa7b8, a: 0x5ac8ff, draw: (g, _now, flap, c, a) => {
    const f = flap * 5;
    for (let k = 0; k < 4; k++) {
    const bx = 4 + k * 20, by = 4 - k * (11 + f * 0.5);
    g.fillStyle(k % 2 ? 0x8a96a6 : c, 0.98);
    g.fillRoundedRect(bx, by - 7, 26 - k * 2, 13, 3);
    g.fillStyle(0x6a7482, 0.9);
    g.fillRect(bx, by - 7, 26 - k * 2, 4);
    g.fillStyle(a, 0.85);
    g.fillCircle(bx + 4, by, 1.6);
    }
    } },
    // 赛博：全息数据翼（网格 + 流动数据块）
    cyber: { c: 0x39ffd0, a: 0x1a2a4a, draw: (g, now, flap, c, _a) => {
    const f = flap * 6;
    g.lineStyle(1.2, c, 0.7);
    for (let k = 0; k < 4; k++) g.lineBetween(6 + k * 18, 4 - k * (9 + f * 0.5), 22 + k * 18, -20 - k * (9 + f * 0.5));
    for (let k = 0; k < 4; k++) g.lineBetween(6 + k * 9, 4 - k * 2, 60 + k * 6, -34 - f - k * 5);
    for (let k = 0; k < 5; k++) {
    const t = (now / 400 + k / 5) % 1;
    g.fillStyle(c, 0.85);
    g.fillRect(8 + t * 60, -8 - t * (26 + f), 4, 4);
    }
    } },
    // 齿魂：齿轮翼（三齿轮咬合转动）
    gearsoul: { c: 0xb08a4a, a: 0xffd45c, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    for (const [gx, gy, r, sp] of [[20, -14 - f, 14, 1], [46, -30 - f, 11, -1.4], [66, -14 - f * 0.5, 8, 1.8]] as const) {
    g.fillStyle(c, 0.95);
    g.fillCircle(gx, gy, r);
    g.lineStyle(2, a, 0.85);
    for (let k = 0; k < 8; k++) {
      const ang = now / 500 * sp + (k / 8) * Math.PI * 2;
      g.lineBetween(gx + Math.cos(ang) * r, gy + Math.sin(ang) * r, gx + Math.cos(ang) * (r + 4), gy + Math.sin(ang) * (r + 4));
    }
    g.fillStyle(a, 0.9);
    g.fillCircle(gx, gy, 3);
    }
    } },
    // 叶翼：双子大叶（叶身 + 主侧脉）
    leaf: { c: 0x6fae4f, a: 0x3a6a2a, draw: (g, _now, flap, c, a) => {
    const f = flap * 6;
    wpoly(g, [[4, 4], [24, -36 - f], [52, -52 - f], [58, -26 - f], [34, 8]], c, 0.97);
    wpoly(g, [[10, 6], [28, -18 - f], [48, -28 - f], [38, 6]], 0x8fce6a, 0.8);
    wline(g, [[6, 4], [30, -32 - f], [52, -48 - f]], 2.2, a, 0.9);
    for (let k = 0; k < 4; k++) {
    const t = 0.22 + k * 0.18;
    wline(g, [[6 + 24 * t, 4 - 34 * t - f * t], [6 + 24 * t + 11, 4 - 34 * t - f * t - 5]], 1.2, a, 0.65);
    }
    } },
    // 竹叶：三竿竹叶翼（细长叶 + 竹节）
    bambooLeaf: { c: 0x8fbf5a, a: 0x4a6a2a, draw: (g, now, flap, c, a) => {
    const f = flap * 6;
    for (let k = 0; k < 3; k++) {
    const bx = 8 + k * 18, by = 2 - k * (8 + f * 0.4);
    const ang = -1.1 - k * 0.12;
    const len = 54 - k * 6;
    g.save();
    g.translateCanvas(bx, by);
    g.rotateCanvas(ang + Math.sin(now / 400 + k) * 0.06);
    wpoly(g, [[0, -2.4], [len, 0], [0, 2.4]], k % 2 ? c : 0xa8d87a, 0.96);
    g.lineStyle(1, a, 0.6);
    g.lineBetween(0, 0, len, 0);
    g.restore();
    }
    } },
    // 风帆：扬帆翼（帆面 + 帆骨 + 缆绳）
    sail: { c: 0xf0ead8, a: 0xc0392b, draw: (g, _now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[6, 6], [10, -46 - f], [34, -38 - f], [30, 4]], c, 0.97);
    wpoly(g, [[38, 4], [40, -40 - f], [62, -32 - f], [58, 4]], 0xe0d0b0, 0.9);
    wline(g, [[6, 6], [10, -46 - f]], 3, 0x6a4a2a, 1);
    g.lineStyle(1.4, a, 0.8);
    g.lineBetween(10, -42 - f, 34, -36 - f);
    g.lineBetween(40, -36 - f, 62, -30 - f);
    g.fillStyle(a, 0.9);
    g.fillCircle(6, 6, 2.6);
    } },
    // 星帆：夜空星帆（帆面星图 + 北极星）
    sailStar: { c: 0x2a2a4a, a: 0xfff0b0, draw: (g, now, flap, c, a) => {
    const f = flap * 5;
    wpoly(g, [[6, 6], [10, -46 - f], [36, -40 - f], [32, 4]], c, 0.95);
    wpoly(g, [[42, 4], [44, -40 - f], [66, -32 - f], [62, 4]], 0x3a3a5e, 0.95);
    for (let k = 0; k < 6; k++) {
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(now / 300 + k * 1.8));
    g.fillStyle(a, tw);
    g.fillCircle(14 + (k % 3) * 12, -14 - f - (k % 2) * 12, 1.4);
    }
    g.fillStyle(a, 0.95);
    g.fillRect(22, -44 - f, 1.4, 5);
    g.fillRect(20.3, -42.3 - f, 4.8, 1.4);
    } },
    };
