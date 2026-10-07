import { curve, ribbon, scatter, headCore, alongPath, starAt, polyAt, petalAt, ringAt, puffAt, sparkAt, } from './shared.js';
/**
 * 第一批主题拖尾——**按名字逐款构图**（物品绘制.md：名字决定外形）。
 * 每款 = 一层贴题的轨迹主形 + 名字里的东西沿路摆出来，不再共用同一套「曲线+散点」。
 */
export const TRAILS_1 = {
    // 操场跑量里程碑：跑道——红地胶 + 两侧白色车道虚线
    runTrail: { c: 0xd84040, a: 0xffffff, draw: (t, c, a) => {
            curve(t, 10, 15, 0.1, 0.5, c);
            alongPath(t, 4, 2, (x, y, ang, f) => {
                const off = 7 + f * 4;
                const px = x + Math.cos(ang + Math.PI / 2) * off;
                const py = y + Math.sin(ang + Math.PI / 2) * off;
                const qx = x - Math.cos(ang + Math.PI / 2) * off;
                const qy = y - Math.sin(ang + Math.PI / 2) * off;
                t.g.lineStyle(2, a, (0.3 + f * 0.6) * t.fade);
                t.g.lineBetween(px, py, px + Math.cos(ang) * 5, py + Math.sin(ang) * 5);
                t.g.lineBetween(qx, qy, qx + Math.cos(ang) * 5, qy + Math.sin(ang) * 5);
            });
            headCore(t, c);
        } },
    // 黄沙拖尾：一道沙脊 + 沙粒顺风滚动
    desTrailA: { c: 0xd8a24a, a: 0xf0d8a0, draw: (t, c, a) => {
            curve(t, 5, 17, 0.15, 0.6, c);
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                const wob = Math.sin(i * 2.3 + t.now / 240) * 6;
                polyAt(t, x, y + wob, 1.4 + f * 2, 4, i * 0.9, a, 0.35 + f * 0.5, 0.6);
            });
            scatter(t, 5, 1.8, a, 12, 2);
            headCore(t, c);
        } },
    // 烈日拖尾：日芯 + 绕头旋转的日芒
    desTrailB: { c: 0xffd45c, a: 0xc9803a, draw: (t, c, a) => {
            curve(t, 8, 18, 0.12, 0.5, c);
            curve(t, 2, 7, 0.2, 0.8, a);
            const head = t.pts[t.pts.length - 1];
            const spin = t.now / 300;
            for (let k = 0; k < 8; k++) {
                const ang = spin + (k / 8) * Math.PI * 2;
                sparkAt(t, head.x + Math.cos(ang) * 14, head.y + Math.sin(ang) * 14, 4.5, ang, k % 2 ? c : a, 0.8);
            }
            headCore(t, c);
        } },
    // 流云拖尾：一路云团飘着走
    nimbTrailA: { c: 0xeaf6ff, a: 0x9ad4ff, draw: (t, c, a) => {
            curve(t, 2, 6, 0.1, 0.35, a);
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                const drift = Math.sin(t.now / 500 + i) * 4;
                puffAt(t, x, y + drift, 6 + f * 5, c, 0.4 + f * 0.4);
            });
            headCore(t, a);
        } },
    // 星羽拖尾：羽毛沿路飘落 + 星屑闪
    nimbTrailB: { c: 0xffe89a, a: 0xffffff, draw: (t, c, a) => {
            curve(t, 1.6, 5, 0.1, 0.4, c);
            alongPath(t, 4, 1, (x, y, ang, f, i) => {
                const sway = Math.sin(t.now / 350 + i * 1.7) * 0.6;
                petalAt(t, x, y, ang + sway, 7 + f * 4, 2.6, a, 0.35 + f * 0.5);
            });
            scatter(t, 6, 1.6, c, 10, 4);
            headCore(t, c);
        } },
    // 花瓣拖尾（樱）：花瓣翻着跟头一路撒
    confTrailA: { c: 0xff869c, a: 0xfff0e0, draw: (t, c, a) => {
            curve(t, 2, 6, 0.08, 0.3, a);
            alongPath(t, 2, 1, (x, y, ang, f, i) => {
                const flip = t.now / 200 + i * 1.3;
                petalAt(t, x, y, ang + Math.sin(flip) * 1.2, 6 + f * 5, 3, c, 0.3 + f * 0.6);
                if (i % 2)
                    petalAt(t, x, y + 4, ang + Math.cos(flip) * 1.2, 4.5 + f * 3, 2, a, 0.25 + f * 0.5);
            });
            headCore(t, c);
        } },
    // 糖星拖尾：糖霜小星星一颗颗粘在路上
    confTrailB: { c: 0xfff0e0, a: 0xff869c, draw: (t, c, a) => {
            curve(t, 3, 9, 0.1, 0.35, c);
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                starAt(t, x, y + Math.sin(i * 2.1) * 5, 2.2 + f * 2.4, t.now / 400 + i, i % 2 ? c : a, 0.35 + f * 0.6);
            });
            headCore(t, a);
        } },
    // 彩星拖尾：彩色星星旋转着撒一路
    bigtTrailA: { c: 0xffd45c, a: 0xe8404a, draw: (t, c, a) => {
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                const col = [c, a, 0x4ac8ff, 0x8fd45a][i % 4];
                starAt(t, x, y + Math.sin(i * 1.7) * 8, 3 + f * 3.5, t.now / 260 + i * 0.8, col, 0.35 + f * 0.6);
            });
            headCore(t, c);
        } },
    // 彩带拖尾：三条相位不同的飘带绞在一起
    bigtTrailB: { c: 0xe8404a, a: 0x4ac8ff, draw: (t, c, a) => {
            ribbon(t, 10, 1.6, 420, 4.6, c, 0.85);
            ribbon(t, 14, 1.1, 560, 3.4, a, 0.7);
            ribbon(t, 8, 2.1, 340, 2.6, 0xffd45c, 0.75);
            headCore(t, c);
        } },
    // 铁尘拖尾：金属碎屑是带棱角的
    aegisTrailA: { c: 0xc0ccda, a: 0xffffff, draw: (t, c, a) => {
            curve(t, 4, 12, 0.12, 0.45, c);
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                polyAt(t, x, y + Math.sin(i * 3.1) * 7, 2 + f * 2.2, 3, i * 1.4, i % 3 ? a : c, 0.3 + f * 0.55);
            });
            headCore(t, a);
        } },
    // 战旗拖尾：旗杆轨迹 + 一串小三角旗
    aegisTrailB: { c: 0xc0392b, a: 0xffd45c, draw: (t, c, a) => {
            curve(t, 2.4, 6, 0.15, 0.6, c);
            alongPath(t, 4, 1, (x, y, ang, f, i) => {
                const flap = Math.sin(t.now / 180 + i * 2.2) * 3;
                const nx = Math.cos(ang + Math.PI / 2), ny = Math.sin(ang + Math.PI / 2);
                const vs = [
                    { x: x + nx * 2, y: y + ny * 2 },
                    { x: x - nx * 2, y: y - ny * 2 },
                    { x: x + Math.cos(ang) * 9 + nx * flap, y: y + Math.sin(ang) * 9 + ny * flap },
                ];
                t.g.fillStyle(i % 2 ? a : c, (0.35 + f * 0.55) * t.fade);
                t.g.fillPoints(vs, true, true);
            });
            headCore(t, a);
        } },
    // 墨迹拖尾：一笔浓墨，收笔带飞白与溅点
    chanTrailA: { c: 0x2a2e36, a: 0x8a8a92, draw: (t, c, a) => {
            curve(t, 10, 18, 0.25, 0.85, c);
            alongPath(t, 5, 2, (x, y, _ang, f, i) => {
                const r = 1.5 + ((i * 7) % 3) + f * 2;
                t.g.fillStyle(c, 0.3 * t.fade);
                t.g.fillCircle(x + Math.sin(i * 5.1) * 9, y + Math.cos(i * 3.7) * 9, r);
            });
            headCore(t, a);
        } },
    // 花瓣拖尾（茶）：茶叶 + 白瓣一起落
    chanTrailB: { c: 0x8fd45a, a: 0x2f7a4a, draw: (t, c, a) => {
            curve(t, 1.6, 5, 0.1, 0.35, a);
            alongPath(t, 3, 1, (x, y, ang, f, i) => {
                const sway = Math.sin(t.now / 300 + i) * 0.7;
                petalAt(t, x, y, ang + sway + 0.6, 6 + f * 4, 1.8, c, 0.35 + f * 0.55);
                if (i % 2)
                    petalAt(t, x + 4, y - 3, ang - sway - 0.5, 4.5, 1.4, 0xf0fff0, 0.3 + f * 0.5);
            });
            headCore(t, a);
        } },
    // 星尘拖尾：紫雾里一路碎星光
    arcanTrailA: { c: 0xb46cff, a: 0xffd45c, draw: (t, c, a) => {
            curve(t, 6, 15, 0.1, 0.35, c);
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                sparkAt(t, x, y + Math.sin(i * 2.4) * 8, 2.2 + f * 2.6, t.now / 350 + i, i % 3 ? a : 0xffffff, 0.35 + f * 0.6);
            });
            headCore(t, a);
        } },
    // 魔法拖尾：菱形符文一路排开 + 头顶光环
    arcanTrailB: { c: 0xb46cff, a: 0xe8d8ff, draw: (t, c, a) => {
            ribbon(t, 6, 1.8, 460, 3, c, 0.55);
            alongPath(t, 4, 1, (x, y, ang, f, i) => {
                polyAt(t, x, y, 3.2 + f * 2.4, 4, ang + t.now / 400, i % 2 ? c : a, 0.35 + f * 0.6);
            });
            const head = t.pts[t.pts.length - 1];
            ringAt(t, head.x, head.y, 13 + Math.sin(t.now / 200) * 2, 1.6, a, 0.7);
            headCore(t, c);
        } },
    // 沙尘拖尾：一团团尘土被球带起来
    relicTrailA: { c: 0xd8c8a0, a: 0xb8a880, draw: (t, c, a) => {
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                puffAt(t, x, y - Math.sin(t.now / 600 + i) * 3, 5 + f * 6, i % 2 ? c : a, 0.25 + f * 0.35);
            });
            headCore(t, c);
        } },
    // 琥珀拖尾：半透明的琥珀块泛着光
    relicTrailB: { c: 0xffb02a, a: 0xff5a1a, draw: (t, c, a) => {
            curve(t, 3, 8, 0.08, 0.3, a);
            alongPath(t, 4, 1, (x, y, _ang, f, i) => {
                polyAt(t, x, y, 3 + f * 3, 6, i * 1.1, c, 0.3 + f * 0.5);
                polyAt(t, x, y, 1.6 + f * 1.4, 6, i * 1.1, 0xfff0c0, 0.4 + f * 0.5);
            });
            headCore(t, c);
        } },
    // 泡泡拖尾：一串空心泡泡越靠近球头越大
    playTrailA: { c: 0x4a90d9, a: 0xffffff, draw: (t, c, a) => {
            alongPath(t, 3, 1, (x, y, _ang, f, i) => {
                const r = 2.5 + f * 5 + ((i * 3) % 3);
                ringAt(t, x, y + Math.sin(i * 2.8) * 5, r, 1.3, i % 2 ? c : a, 0.3 + f * 0.6);
                t.g.fillStyle(0xffffff, 0.35 * f * t.fade);
                t.g.fillCircle(x - r * 0.35, y - r * 0.35, r * 0.25);
            });
            headCore(t, c);
        } },
    // 星彩拖尾：庆祝彩纸星星四色混撒
    playTrailB: { c: 0x9effd0, a: 0xffd45c, draw: (t, c, a) => {
            curve(t, 1.6, 5, 0.1, 0.4, 0xffffff);
            alongPath(t, 2, 1, (x, y, _ang, f, i) => {
                const col = [c, a, 0xff869c, 0x4ac8ff][i % 4];
                starAt(t, x, y + Math.sin(i * 2.2) * 9, 2.4 + f * 2.6, t.now / 300 + i, col, 0.35 + f * 0.6);
            });
            headCore(t, a);
        } },
    // 焰火拖尾：每隔一段炸开一朵小烟花
    yuanTrailA: { c: 0xe8404a, a: 0xffd45c, draw: (t, c, a) => {
            curve(t, 2, 6, 0.1, 0.4, a);
            alongPath(t, 6, 3, (x, y, _ang, f, i) => {
                for (let k = 0; k < 6; k++) {
                    const ang = (k / 6) * Math.PI * 2 + t.now / 280 + i;
                    sparkAt(t, x + Math.cos(ang) * (5 + f * 4), y + Math.sin(ang) * (5 + f * 4), 3, ang, k % 2 ? a : c, 0.35 + f * 0.55);
                }
            });
            headCore(t, a);
        } },
    // 花瓣拖尾（灯会）：暖红花瓣 + 余烬光点
    yuanTrailB: { c: 0xff869c, a: 0xffe89a, draw: (t, c, a) => {
            curve(t, 2, 7, 0.1, 0.35, a);
            alongPath(t, 3, 1, (x, y, ang, f, i) => {
                const flip = t.now / 220 + i;
                petalAt(t, x, y, ang + Math.sin(flip) * 1.1, 5.5 + f * 4, 2.6, c, 0.3 + f * 0.6);
            });
            scatter(t, 6, 1.8, a, 10, 6);
            headCore(t, a);
        } },
    // 灵气拖尾：青色雾气绕着轨迹打旋
    shanTrail: { c: 0x9fe8c0, a: 0x3a9a7a, draw: (t, c, a) => {
            curve(t, 4, 12, 0.08, 0.3, a);
            alongPath(t, 2, 1, (x, y, _ang, f, i) => {
                const swirl = t.now / 300 + i * 1.9;
                const r = 6 + Math.sin(i * 1.3) * 3;
                const px = x + Math.cos(swirl) * r, py = y + Math.sin(swirl) * r * 0.6;
                t.g.fillStyle(i % 2 ? c : a, (0.2 + f * 0.45) * t.fade);
                t.g.fillCircle(px, py, 1.6 + f * 2.2);
            });
            headCore(t, c);
        } },
};
