import { hpoly, TAU } from './shared.js';
/** 新批次主题头饰（上古神话 / 重装机甲） */
export const HATS_5 = {
    shnHatA: { c: 0xffd45c, a: 0xd9b45c, draw: (g, now, x, hy, c, a) => {
            // 凌霄金冠：三层金冠 + 宝石 + 珠光流轉
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy + 2, 30, 5);
            hpoly(g, [[x - 14, hy + 2], [x - 10, hy - 10], [x - 4, hy + 1], [x, hy - 14], [x + 4, hy + 1], [x + 10, hy - 10], [x + 14, hy + 2]], c);
            g.fillStyle(0xfff0b0, 0.55);
            hpoly(g, [[x - 14, hy + 2], [x - 10, hy - 10], [x - 6, hy + 1]], 0xfff0b0, 0.5);
            for (let k = -1; k <= 1; k++) {
                const gl = 0.5 + 0.5 * Math.sin(now / 300 + k * 2);
                g.fillStyle(0xd93a5a, 0.95);
                g.fillCircle(x + k * 10, hy - 11 - (k === 0 ? 3 : 0), 2.4);
                g.fillStyle(0xffffff, gl * 0.8);
                g.fillCircle(x + k * 10 - 0.8, hy - 11.8 - (k === 0 ? 3 : 0), 0.8);
            }
            g.fillStyle(a, 0.8);
            g.fillRect(x - 15, hy + 1, 30, 1.6);
        } },
    shnHatB: { c: 0xffb0c8, a: 0xffd45c, draw: (g, now, x, hy, _c, _a) => {
            // 蟠桃玉鬓：鬓边斜插一枝蟠桃 + 玉叶 + 珠串摇曳
            g.lineStyle(2.4, 0x6a4a3a, 1);
            g.lineBetween(x - 12, hy + 2, x + 12, hy - 22);
            g.fillStyle(0xff8fa0, 1); // 蟠桃
            g.fillCircle(x + 8, hy - 18, 5.4);
            g.fillStyle(0xffc4d0, 0.8);
            g.fillCircle(x + 6.6, hy - 19.4, 2);
            g.fillStyle(0x8fbf5a, 1);
            g.fillEllipse(x + 12, hy - 22, 6, 2.6);
            g.fillStyle(0xbfe8d0, 0.9); // 玉叶
            g.fillEllipse(x - 2, hy - 10, 8, 3.6);
            g.fillEllipse(x + 4, hy - 6, 8, 3.6);
            const sway = Math.sin(now / 400) * 2; // 珠串
            for (let k = 0; k < 3; k++) {
                g.fillStyle(0xfff0b0, 0.9);
                g.fillCircle(x + 14 + k * 3 + sway * (k / 2), hy - 4 + k * 5, 1.6);
            }
            const tw = 0.5 + 0.5 * Math.sin(now / 280);
            g.fillStyle(0xffffff, tw * 0.7);
            g.fillCircle(x + 7, hy - 20, 1.2);
        } },
    mcaHatA: { c: 0x8fe0ff, a: 0x2a3a5a, draw: (g, now, x, hy, c, a) => {
            // 战术目镜：头带 + 单边多边形镜片（数据流闪烁）+ 侧挂模块
            g.fillStyle(a, 1);
            g.fillRect(x - 16, hy - 4, 32, 7);
            g.fillStyle(0x1a2434, 1);
            g.fillRect(x - 16, hy - 4, 32, 1.6);
            g.fillStyle(0x0e1826, 0.92);
            hpoly(g, [[x + 2, hy - 4], [x + 14, hy - 2], [x + 13, hy + 4], [x + 2, hy + 3]], c, 0.85);
            g.lineStyle(1.2, c, 0.9);
            g.strokeRect(x + 2, hy - 4, 12, 7);
            for (let k = 0; k < 3; k++) { // 镜片上的数据流
                const ph = (now / 300 + k / 3) % 1;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillRect(x + 4, hy - 3 + ph * 5.4, 8 - ph * 4, 0.9);
            }
            g.fillStyle(0x3a4a5c, 1); // 侧挂模块
            g.fillRect(x - 13, hy + 3, 7, 6);
            const led = 0.5 + 0.5 * Math.sin(now / 200);
            g.fillStyle(0xff5a5a, led);
            g.fillCircle(x - 9.4, hy + 6, 1.2);
        } },
    mcaHatB: { c: 0x5a6472, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
            // 重型装甲盔：全覆式钢盔 + 观察缝蓝光 + 排气口 + 天线
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 17, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 17, hy + 2, 34, 6);
            g.fillStyle(0x39424e, 0.9);
            g.fillRect(x - 17, hy + 5, 34, 3); // 盔沿装甲
            g.fillStyle(0x0e1826, 1); // 观察缝
            g.fillRect(x - 11, hy - 5, 22, 5);
            g.fillStyle(a, 0.55 + 0.25 * Math.sin(now / 320));
            g.fillRect(x - 9, hy - 4, 18, 2.4);
            g.lineStyle(1, 0xffffff, 0.25);
            g.lineBetween(x - 9, hy - 2.6, x + 9, hy - 2.6);
            for (const s of [-1, 1]) { // 排气口
                g.fillStyle(0x39424e, 1);
                g.fillRect(x + s * 13 - 2, hy - 10, 4, 5);
            }
            g.lineStyle(1.6, 0x8a94a2, 1); // 天线
            g.lineBetween(x + 15, hy + 1, x + 19, hy - 14);
            const bl = Math.abs(Math.sin(now / 260));
            g.fillStyle(a, bl);
            g.fillCircle(x + 19, hy - 15, 1.8);
        } },
};
