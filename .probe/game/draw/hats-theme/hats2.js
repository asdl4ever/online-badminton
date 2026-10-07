import { hpoly, hline, TAU } from './shared.js';
/** 第二批主题头饰（海盗 / 蒸汽 / 太空 / 侏罗纪 / 蘑菇 / 热带 / 墓地 / 节日 / 寿司 / 西部） */
export const HATS_2 = {
    pirateHat: { c: 0x1a1a22, a: 0xffffff, draw: (g, now, x, hy, c, a) => {
            // 三角帽：黑色三角帽 + 白边 + 骷髅徽
            hpoly(g, [[x - 22, hy + 2], [x, hy - 14], [x + 22, hy + 2]], c);
            g.lineStyle(2, a, 0.85);
            hline(g, [[x - 22, hy + 2], [x, hy - 14], [x + 22, hy + 2]], 2, a, 0.85);
            g.fillStyle(a, 1);
            g.fillCircle(x, hy - 5, 3.4);
            g.fillRect(x - 3, hy - 4, 6, 3); // 骷髅下颌
            g.fillStyle(0x1a1a22, 1);
            g.fillCircle(x - 1.4, hy - 6, 0.9);
            g.fillCircle(x + 1.4, hy - 6, 0.9);
        } },
    pirateCrown: { c: 0xd9b45c, a: 0x1a1a22, draw: (g, now, x, hy, c, a) => {
            // 船长之冠：鎏金冠 + 红宝石 + 交叉刀剑徽 + 金光 + 缠绳
            hpoly(g, [[x - 16, hy + 2], [x - 10, hy - 14], [x - 3, hy - 6], [x, hy - 16], [x + 3, hy - 6], [x + 10, hy - 14], [x + 16, hy + 2]], c);
            hpoly(g, [[x - 16, hy + 2], [x - 10, hy - 14], [x - 3, hy - 6], [x, hy - 16], [0, hy + 2]], 0xf0d88a); // 亮面
            g.fillStyle(0x8a6a1a, 0.5);
            g.fillRect(x - 16, hy, 32, 2);
            g.fillRect(x - 14, hy - 6, 28, 1.6); // 錾纹
            g.lineStyle(2.2, a, 0.95);
            g.lineBetween(x - 8, hy - 11, x + 8, hy - 3);
            g.lineBetween(x + 8, hy - 11, x - 8, hy - 3);
            g.fillStyle(0xd9b45c, 1);
            g.fillRect(x - 9.4, hy - 13, 3.4, 3.4);
            g.fillRect(x + 6, hy - 13, 3.4, 3.4); // 剑柄
            g.fillStyle(0xd42a3a, 1);
            g.fillCircle(x, hy - 18, 3); // 红宝石
            g.fillStyle(0xff8a9a, 0.8);
            g.fillCircle(x - 1, hy - 19, 1);
            const gl = 0.4 + 0.4 * Math.sin(now / 320);
            g.fillStyle(0xfff0c0, gl);
            g.fillRect(x - 0.8, hy - 24, 1.6, 5);
            g.fillRect(x - 2.5, hy - 22.5, 5, 1.6); // 宝石闪光
        } },
    steamHat: { c: 0x8a6a4a, a: 0x9aa7b8, draw: (g, now, x, hy, c, a) => {
            // 护目镜帽：皮质帽 + 双镜片护目镜
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 16, hy, 32, 6);
            g.fillStyle(a, 0.9);
            g.fillCircle(x - 8, hy - 4, 6);
            g.fillCircle(x + 8, hy - 4, 6);
            g.fillStyle(0x5ac8ff, 0.7);
            g.fillCircle(x - 8, hy - 4, 3.6);
            g.fillCircle(x + 8, hy - 4, 3.6);
            g.lineStyle(2, 0x6a4a2a, 1);
            g.lineBetween(x - 2, hy - 4, x + 2, hy - 4);
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(x - 9.4, hy - 5.4, 1.4);
        } },
    steamCrown: { c: 0x8a6a4a, a: 0xd9b45c, draw: (g, now, x, hy, c, a) => {
            // 齿轮礼帽：高顶礼帽 + 旋转齿轮
            g.fillStyle(c, 1);
            g.fillRect(x - 12, hy - 24, 24, 24);
            g.fillRect(x - 17, hy - 2, 34, 4); // 帽檐
            g.fillStyle(0x6a4a2a, 1);
            g.fillRect(x - 12, hy - 8, 24, 4); // 帽带
            const rot = now / 900;
            g.fillStyle(0xd9b45c, 1);
            g.fillCircle(x, hy - 28, 6);
            for (let k = 0; k < 8; k++) {
                const ang = rot + (k / 8) * TAU;
                g.fillRect(x + Math.cos(ang) * 7.4 - 1.6, hy - 28 + Math.sin(ang) * 7.4 - 1.6, 3.2, 3.2);
            }
            g.fillStyle(0x6a4a2a, 1);
            g.fillCircle(x, hy - 28, 2.4);
        } },
    astroHat: { c: 0xe8f0ff, a: 0x5ac8ff, draw: (g, now, x, hy, c, a) => {
            // 通讯头盔：白头盔 + 侧耳天线
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 17, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0x2a3a6a, 0.85);
            g.fillRect(x - 12, hy - 8, 24, 7); // 面窗
            g.fillStyle(a, 0.8);
            g.fillRect(x - 10, hy - 6, 20, 3);
            g.fillStyle(0x8a92a8, 1);
            g.fillCircle(x + 16, hy - 4, 4.4); // 侧耳
            g.lineStyle(1.6, a, 0.9);
            g.lineBetween(x + 16, hy - 8, x + 20, hy - 16);
            const bl = Math.abs(Math.sin(now / 250));
            g.fillStyle(a, bl);
            g.fillCircle(x + 20, hy - 17, 1.8);
        } },
    astroCrown: { c: 0x2a3a6a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 指令长冠：深蓝舰桥冠 + 金色军衔星 + 警灯 + 通讯波纹
            hpoly(g, [[x - 16, hy + 2], [x - 12, hy - 12], [x, hy - 18], [x + 12, hy - 12], [x + 16, hy + 2]], c);
            hpoly(g, [[x - 16, hy + 2], [x - 12, hy - 12], [x, hy - 18], [0, hy + 2]], 0x3d5290); // 亮面
            hline(g, [[x - 16, hy + 1], [x + 16, hy + 1]], 2.4, a, 0.95);
            hline(g, [[x - 13, hy - 4], [x + 13, hy - 4]], 1.2, a, 0.5);
            for (let k = -1; k <= 1; k++) {
                const tw = 0.6 + 0.4 * Math.sin(now / 260 + k * 2);
                g.fillStyle(a, tw);
                g.fillRect(x + k * 9 - 1.4, hy - 10, 2.8, 2.8);
                g.fillRect(x + k * 9 - 0.7, hy - 10.7, 1.4, 4.2);
            }
            const bl = Math.abs(Math.sin(now / 220));
            g.fillStyle(0xff5a5a, bl);
            g.fillCircle(x - 8, hy - 15, 2); // 左舷警灯
            g.fillStyle(0x5aff8a, Math.abs(Math.cos(now / 220)));
            g.fillCircle(x + 8, hy - 15, 2); // 右舷警灯
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 18.5, 2.6);
            g.lineStyle(1, a, 0.35);
            g.beginPath();
            g.arc(x, hy - 18.5, 6 + Math.abs(Math.sin(now / 400)) * 4, -2.4, -0.7);
            g.strokePath(); // 通讯波纹
        } },
    juraHat: { c: 0x8fbf5a, a: 0xd8cba8, draw: (g, now, x, hy, c, a) => {
            // 恐龙蛋帽：半颗破壳的蛋扣在头上
            g.fillStyle(0xf0e8d0, 1);
            g.beginPath();
            g.arc(x, hy, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            hpoly(g, [[x - 16, hy], [x - 10, hy - 6], [x - 4, hy - 1], [x + 3, hy - 7], [x + 10, hy - 2], [x + 16, hy]], 0xf0e8d0); // 破口锯齿
            g.fillStyle(0xd8cba8, 0.7);
            g.fillCircle(x - 6, hy - 9, 2.2);
            g.fillCircle(x + 5, hy - 11, 2.6); // 蛋壳斑
            g.fillStyle(c, 0.9);
            g.fillTriangle(x + 14, hy - 4, x + 22, hy - 8, x + 16, hy + 1); // 破壳翘片
        } },
    juraCrown: { c: 0xd8cba8, a: 0x8a6a3a, draw: (g, now, x, hy, c, a) => {
            // 龙骨王冠：骨刺排成的冠
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy - 2, 32, 5);
            for (let k = 0; k < 5; k++) {
                const px = x - 12 + k * 6;
                const h = k === 2 ? 18 : k === 1 || k === 3 ? 14 : 10;
                hpoly(g, [[px - 3, hy - 2], [px + 3, hy - 2], [px, hy - 2 - h]], c);
                g.fillStyle(0xb8ab88, 0.8);
                g.fillCircle(px, hy - 4 - h * 0.6, 2); // 骨节
                g.fillStyle(c, 1);
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 22, 2.4);
        } },
    mushHat: { c: 0x6a4a9a, a: 0xd95a4a, draw: (g, now, x, hy, c, a) => {
            // 毒菇帽：紫斑点毒菇伞
            g.fillStyle(a, 0.9);
            g.beginPath();
            g.arc(x, hy, 18, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillStyle(0xffffff, 0.9);
            g.fillCircle(x - 8, hy - 8, 3.4);
            g.fillCircle(x + 4, hy - 12, 4.2);
            g.fillCircle(x + 12, hy - 5, 2.8);
            const gl = 0.4 + 0.3 * Math.sin(now / 350);
            g.fillStyle(c, gl * 0.6);
            g.fillCircle(x, hy - 8, 10); // 孢子雾
        } },
    mushCrown: { c: 0xd95a4a, a: 0xf0e0c0, draw: (g, now, x, hy, c, a) => {
            // 蘑菇王冠：三朵蘑菇排成冠
            for (let k = -1; k <= 1; k++) {
                const px = x + k * 11;
                const s = k === 0 ? 9 : 7;
                g.fillStyle(k === 0 ? c : 0xc04a3a, 0.95);
                g.beginPath();
                g.arc(px, hy - 2 - s * 0.5, s, Math.PI, TAU);
                g.closePath();
                g.fillPath();
                g.fillStyle(0xf0e0c0, 0.95);
                g.fillRect(px - s * 0.5, hy - 3, s, 4); // 菌柄
                g.fillStyle(0xffffff, 0.9);
                g.fillCircle(px - s * 0.35, hy - 5 - s * 0.5, s * 0.24);
            }
            g.fillStyle(0x8a6a4a, 0.9);
            g.fillRect(x - 16, hy, 32, 3);
        } },
    tropicHat: { c: 0xf0e8d0, a: 0x3ac8c8, draw: (g, now, x, hy, c, a) => {
            // 贝壳帽：扇贝扣头上
            g.fillStyle(c, 1);
            g.beginPath();
            for (let k = 0; k <= 8; k++) {
                const ang = Math.PI + (k / 8) * Math.PI;
                const px = x + Math.cos(ang) * 18, py = hy + Math.sin(ang) * 16;
                if (k === 0)
                    g.moveTo(px, py);
                else
                    g.lineTo(px, py);
            }
            g.closePath();
            g.fillPath();
            g.lineStyle(1.4, a, 0.8);
            for (let k = 1; k < 4; k++) {
                const ang = Math.PI + (k / 4) * Math.PI;
                g.lineBetween(x, hy, x + Math.cos(ang) * 17, hy + Math.sin(ang) * 15);
            }
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy, 2.6); // 贝铰
        } },
    tropicCrown: { c: 0xff7a6a, a: 0x3a9a5a, draw: (g, now, x, hy, c, a) => {
            // 珊瑚王冠：珊瑚枝排成冠
            g.fillStyle(0x8a6a4a, 0.9);
            g.fillRect(x - 16, hy - 2, 32, 4);
            g.lineStyle(3.4, c, 1);
            for (let k = -1; k <= 1; k++) {
                const bx = x + k * 11;
                g.lineBetween(bx, hy - 2, bx + k * 2, hy - 14 - (k === 0 ? 4 : 0));
                g.lineBetween(bx + k * 2, hy - 10, bx + k * 5, hy - 16);
                g.fillStyle(a, 0.9);
                g.fillCircle(bx + k * 2, hy - 15 - (k === 0 ? 4 : 0), 2.2);
                g.fillStyle(c, 1);
            }
        } },
    cryptHat: { c: 0x7a8290, a: 0x4a4a52, draw: (g, now, x, hy, c, a) => {
            // 铁盔：矿工铁盔 + 头灯
            g.fillStyle(c, 1);
            g.beginPath();
            g.arc(x, hy + 2, 16, Math.PI, TAU);
            g.closePath();
            g.fillPath();
            g.fillRect(x - 18, hy + 2, 36, 4); // 盔檐
            g.fillStyle(a, 0.8);
            g.fillRect(x - 14, hy - 2, 28, 3); // 盔脊
            g.fillStyle(0xffd45c, 0.8 + 0.2 * Math.sin(now / 200));
            g.fillCircle(x + 12, hy - 3, 3.4); // 头灯
            g.fillStyle(0xffffff, 0.6);
            g.fillCircle(x + 11, hy - 4, 1.2);
        } },
    cryptCrown: { c: 0xd8d0c0, a: 0x6a4a9a, draw: (g, now, x, hy, c, a) => {
            // 骷髅王冠：骨冠 + 三个小骷髅
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy - 2, 32, 4);
            for (let k = -1; k <= 1; k++) {
                const px = x + k * 11;
                const s = k === 0 ? 6.4 : 5;
                g.fillStyle(c, 1);
                g.fillCircle(px, hy - 8 - s * 0.3, s);
                g.fillStyle(0x2a2a2a, 1);
                g.fillCircle(px - s * 0.32, hy - 9 - s * 0.3, s * 0.22);
                g.fillCircle(px + s * 0.32, hy - 9 - s * 0.3, s * 0.22);
                g.fillRect(px - s * 0.24, hy - 6 - s * 0.3, s * 0.48, s * 0.2); // 牙
            }
            const gl = 0.5 + 0.4 * Math.sin(now / 300);
            g.fillStyle(a, gl);
            g.fillRect(x - 16, hy - 2, 32, 2); // 紫光
        } },
    festivHat: { c: 0xe84a5a, a: 0xffffff, draw: (g, now, x, hy, c, a) => {
            // 圣诞帽：斜垂的红帽 + 白绒球
            hpoly(g, [[x - 15, hy + 2], [x + 13, hy + 2], [x + 6 + Math.sin(now / 500) * 3, hy - 28]], c);
            g.fillStyle(a, 1);
            g.fillRect(x - 17, hy + 1, 32, 5);
            g.fillStyle(0xffffff, 0.6);
            g.fillRect(x - 17, hy + 1, 32, 2);
            g.fillStyle(0xffffff, 1);
            g.fillCircle(x + 6, hy - 28, 4); // 绒球
            g.fillStyle(0xfff0c0, 0.7);
            g.fillCircle(x + 5, hy - 29, 1.6);
        } },
    festivCrown: { c: 0x3aa05a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 圣诞王冠：松枝冠 + 冬青果 + 星
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy - 2, 32, 4);
            for (let k = 0; k < 5; k++) {
                const px = x - 12 + k * 6;
                hpoly(g, [[px - 4, hy - 2], [px, hy - 12], [px + 4, hy - 2]], k % 2 ? c : 0x2f7a4a);
            }
            g.fillStyle(a, 1);
            g.fillCircle(x - 6, hy - 4, 2.4);
            g.fillCircle(x - 2, hy - 5, 2.4); // 冬青果
            const tw = 0.5 + 0.5 * Math.sin(now / 250);
            g.fillStyle(0xffd45c, tw);
            g.fillRect(x + 8, hy - 14, 2, 5);
            g.fillRect(x + 6.5, hy - 12.5, 5, 2); // 星
        } },
    sushiHat: { c: 0xf5f0e0, a: 0x2a3a6a, draw: (g, now, x, hy, c, a) => {
            // 头巾帽：寿司店头巾 + 红日家纹
            g.fillStyle(c, 1);
            g.fillRect(x - 16, hy - 10, 32, 12);
            hpoly(g, [[x - 16, hy - 10], [x + 16, hy - 10], [x + 22, hy - 2], [x - 22, hy - 2]], c); // 后结
            g.fillStyle(a, 0.95);
            g.fillRect(x - 16, hy - 10, 32, 2.4);
            g.fillStyle(0xe8404a, 1);
            g.fillCircle(x, hy - 4, 3.4); // 家纹
        } },
    sushiCrown: { c: 0xffd45c, a: 0xd93a3a, draw: (g, now, x, hy, c, a) => {
            // 招财猫冠：冠座上一只招财猫头
            g.fillStyle(0xf5f0e0, 1);
            g.fillCircle(x, hy - 10, 11);
            mpoly_ears(g, x, hy - 16);
            g.fillStyle(0xd93a3a, 1);
            g.fillEllipse(x - 8, hy - 16, 5, 6);
            g.fillEllipse(x + 8, hy - 16, 5, 6); // 耳内
            g.fillStyle(0x2a2a2a, 1);
            g.fillEllipse(x - 4, hy - 11, 2.4, 3);
            g.fillEllipse(x + 4, hy - 11, 2.4, 3); // 眼
            g.fillStyle(a, 1);
            g.fillEllipse(x, hy - 7, 3, 2); // 鼻
            g.fillStyle(0xffd45c, 1);
            g.fillCircle(x + 7, hy - 6, 2.4); // 铃铛
            g.fillStyle(0xffd45c, 0.9);
            g.fillRect(x - 16, hy - 2, 32, 3);
        } },
    wildHat: { c: 0x8a5a2a, a: 0xd9c08a, draw: (g, now, x, hy, c, a) => {
            // 牛仔帽：宽檐帽 + 帽带
            g.fillStyle(c, 1);
            g.fillEllipse(x, hy + 2, 44, 8); // 宽檐
            g.beginPath();
            g.arc(x, hy + 1, 13, Math.PI, TAU);
            g.closePath();
            g.fillPath(); // 帽冠
            g.fillEllipse(x, hy - 1, 26, 8);
            g.fillStyle(0x6a4a2a, 1);
            g.fillRect(x - 13, hy - 4, 26, 3); // 帽带
            g.fillStyle(a, 0.9);
            g.fillCircle(x, hy - 2.5, 2.2); // 帽扣
        } },
    wildCrown: { c: 0x8a5a2a, a: 0xffd45c, draw: (g, now, x, hy, c, a) => {
            // 警长徽章冠：皮冠 + 缝线 + 鎏金大警星 + 星光 + 弹带
            g.fillStyle(c, 1);
            g.fillRect(x - 15, hy - 6, 30, 8);
            g.fillRect(x - 17, hy - 2, 34, 4);
            g.lineStyle(1, 0xd8c8a0, 0.5);
            g.lineBetween(x - 13, hy - 4, x + 13, hy - 4); // 缝线
            g.fillStyle(0x4a3a22, 0.9);
            for (let k = -1; k <= 1; k++)
                g.fillCircle(x + k * 12, hy + 0.5, 1.4); // 铆扣
            const pts = [];
            for (let k = 0; k < 10; k++) {
                const ang = -Math.PI / 2 + (k / 10) * TAU;
                const r = k % 2 === 0 ? 9 : 3.8;
                pts.push([x + Math.cos(ang) * r, hy - 14 + Math.sin(ang) * r]);
            }
            hpoly(g, pts, a);
            hpoly(g, [pts[0], pts[1], pts[2], pts[3], pts[4]], 0xfff0b0, 0.55); // 亮面
            g.fillStyle(0x6a4a2a, 0.85);
            g.fillCircle(x, hy - 14, 1.6);
            const tw = 0.5 + 0.5 * Math.sin(now / 300);
            g.fillStyle(0xffffff, tw * 0.9);
            g.fillRect(x - 4, hy - 19, 8, 1.2);
            g.fillRect(x - 0.6, hy - 22, 1.2, 7); // 星光十字
            g.lineStyle(2.4, 0x4a3a22, 0.8);
            g.lineBetween(x - 16, hy + 1, x - 8, hy - 5); // 斜挎弹带
            g.fillStyle(0xd9b45c, 0.9);
            g.fillCircle(x - 12, hy - 3, 1.2);
            g.fillCircle(x - 9, hy - 5, 1.2);
        } },
};
/** 招财猫的耳朵 */
function mpoly_ears(g, x, y) {
    hpoly(g, [[x - 10, y - 4], [x - 5, y - 2], [x - 9, y + 3]], 0xf5f0e0);
    hpoly(g, [[x + 10, y - 4], [x + 5, y - 2], [x + 9, y + 3]], 0xf5f0e0);
}
