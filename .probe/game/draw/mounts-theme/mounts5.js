import { mpoly } from './shared.js';
/** 批三主题坐骑（光之巨人 / 怪兽之王）。(x, y) = 地面基准，f = 朝向。 */
export const MOUNTS_5 = {
    otmMount: { c: 0xb8c8dc, a: 0xff4a5c, draw: (g, now, x, y, f, c, a) => {
            // 光线拦截机：银红涂装的悬浮拦截机——机身 + 座舱 + 双引擎喷焰 + 翼尖光弹
            const hover = Math.sin(now / 340) * 2.4;
            const by = y - 12 + hover;
            g.fillStyle(0x0e1620, 0.2); // 悬浮影
            g.fillEllipse(x, y + 1, 58, 8);
            g.fillStyle(c, 1); // 机身
            mpoly(g, [[x - f * 32, by + 3], [x - f * 22, by - 6], [x + f * 16, by - 7], [x + f * 34, by], [x + f * 26, by + 6], [x - f * 24, by + 7]], c, 1);
            g.fillStyle(0xdfe8f5, 0.6); // 机背受光
            mpoly(g, [[x - f * 18, by - 4], [x + f * 8, by - 5.4], [x + f * 10, by - 2], [x - f * 14, by - 0.6]], 0xdfe8f5, 0.6);
            g.fillStyle(0xff4a5c, 1); // 红色涂装条
            mpoly(g, [[x - f * 6, by - 6.4], [x + f * 2, by - 6.6], [x + f * 2, by + 5.4], [x - f * 6, by + 5.8]], a, 1);
            g.fillStyle(0x22303e, 1); // 座舱罩
            g.fillEllipse(x + f * 10, by - 8, 14, 8);
            g.fillStyle(0x9fd8ff, 0.5 + 0.2 * Math.sin(now / 300));
            g.fillEllipse(x + f * 10, by - 8.6, 9, 4.4);
            for (const s of [-1, 1]) { // 双引擎喷焰
                const px = x + s * 18;
                g.fillStyle(0x39424e, 1);
                g.fillEllipse(px, by + 8, 11, 4.4);
                const jet = 8 + Math.abs(Math.sin(now / 85 + s)) * 6;
                g.fillStyle(0x9fd8ff, 0.7);
                g.fillTriangle(px - 3, by + 10, px + 3, by + 10, px + Math.sin(now / 100 + s) * 1.6, by + 10 + jet);
                g.fillStyle(0xffffff, 0.85);
                g.fillCircle(px, by + 10.2, 1.4);
            }
            // 翼尖光弹（左右翼尖交替充能）
            for (const s of [-1, 1]) {
                const bl = Math.abs(Math.sin(now / 240 + (s > 0 ? 0 : Math.PI / 2)));
                g.fillStyle(a, bl);
                g.fillCircle(x + s * 30, by + 1, 2 + bl * 1.6);
            }
            g.lineStyle(2, 0x39424e, 1); // 机鼻探针
            g.lineBetween(x + f * 34, by, x + f * 40, by - 2);
            g.fillStyle(0x9fd8ff, 0.9);
            g.fillCircle(x + f * 40, by - 2, 1.4);
        } },
    kjuMount: { c: 0x4a5a3a, a: 0x7de87d, draw: (g, now, x, y, f, c, _a) => {
            // 岩甲兽：驮着鞍座的四足岩甲兽——甲背 + 鞍座 + 甩尾 + 呼吸起伏
            const walk = Math.sin(now / 280) * 2.4;
            const breathe = Math.sin(now / 420) * 1.4;
            const by = y - 14 + breathe;
            g.fillStyle(0x101810, 0.25); // 落影
            g.fillEllipse(x, y + 1, 56, 9);
            // 四条腿（交错迈步）
            for (let k = 0; k < 4; k++) {
                const lx = x - 18 + k * 12;
                const step = Math.sin(now / 280 + (k % 2) * Math.PI) * 2.4;
                g.fillStyle(0x3a4a2c, 1);
                g.fillRect(lx - 3 + step, y - 16, 6, 15);
                g.fillStyle(0x2a3620, 1);
                g.fillRect(lx - 4 + step, y - 4, 8, 4); // 爪掌
            }
            g.fillStyle(c, 1); // 躯干
            g.fillEllipse(x, by, 40, 20);
            g.fillStyle(0x5a6a46, 0.7); // 背部受光
            g.fillEllipse(x - f * 2, by - 5, 30, 9);
            // 岩甲背板（三排叠压）
            for (let k = 0; k < 5; k++) {
                const px = x - 14 + k * 7;
                const h = 8 + Math.sin(k * 1.7) * 3;
                g.fillStyle(k % 2 ? 0x5a4a32 : 0x6a5a3a, 1);
                mpoly(g, [[px - 4, by - 8], [px, by - 8 - h], [px + 4, by - 8]], k % 2 ? 0x5a4a32 : 0x6a5a3a, 1);
            }
            // 鞍座（骑乘位）
            g.fillStyle(0x6a4a2a, 1);
            g.fillEllipse(x - f * 4, by - 12, 16, 7);
            g.fillStyle(0x8a6a3a, 0.9);
            g.fillRect(x - f * 10, by - 14, f * 12, 3);
            // 头（低伏的兽首 + 绿晶眼 + 獠牙）
            const hx = x + f * 24, hy = by - 4 + walk * 0.4;
            g.fillStyle(c, 1);
            g.fillEllipse(hx, hy, 16, 12);
            g.fillStyle(0x3a4a2c, 1); // 吻部
            g.fillEllipse(hx + f * 7, hy + 2, 9, 7);
            g.fillStyle(0x7de87d, 0.85 + 0.15 * Math.sin(now / 300)); // 绿晶眼
            g.fillCircle(hx + f * 3, hy - 2, 2);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(hx + f * 3.6, hy - 2.6, 0.7);
            g.fillStyle(0xcfc4a0, 1); // 獠牙
            g.fillTriangle(hx + f * 9, hy + 4, hx + f * 12, hy + 4, hx + f * 10.5, hy + 8);
            // 尾巴（末端骨锤，左右甩）
            const tail = Math.sin(now / 350) * 8;
            g.fillStyle(0x3a4a2c, 1);
            mpoly(g, [[x - f * 18, by + 2], [x - f * 28, by - 2 + tail], [x - f * 34, by + 2 + tail], [x - f * 26, by + 6]], 0x3a4a2c, 1);
            g.fillStyle(0x6a5a3a, 1); // 骨锤
            g.fillCircle(x - f * 34, by + 2 + tail, 4.4);
            g.fillStyle(0xcfc4a0, 0.9);
            g.fillCircle(x - f * 34, by + 2 + tail, 2);
        } },
};
