import { apoly, TAU } from './shared.js';
/** 批七主题光环（赛博都市 / 东海龙宫 / 时空旅行）。(0,0) = 角色躯干中心，画在身后。 */
export const AURAS_12 = {
    cybAuraA: { c: 0xff3bd4, a: 0x39ffd0, draw: (g, now, c, a) => {
            // 霓虹雨夜：身后雨夜霓虹街——雨丝 + 双色霓虹招牌 + 湿地倒影 + 霓虹晕
            g.lineStyle(1, 0x5a6a8a, 0.35); // 斜雨
            for (let k = 0; k < 8; k++) {
                const ph = (now / 260 + k / 8) % 1;
                const rx = -90 + (k * 23) % 180 + ph * 14;
                g.lineBetween(rx, -140 + ph * 240, rx - 4, -132 + ph * 240);
            }
            for (let k = 0; k < 3; k++) { // 霓虹招牌（竖牌明灭闪烁）
                const sx = -66 + k * 62, on = Math.sin(now / 300 + k * 2) > -0.3 ? 1 : 0.25;
                g.fillStyle(k % 2 ? c : a, 0.14 * on);
                g.fillRect(sx - 7, -120 + (k % 2) * 34, 14, 74);
                g.lineStyle(1.6, k % 2 ? c : a, 0.8 * on);
                g.strokeRect(sx - 7, -120 + (k % 2) * 34, 14, 74);
                for (let s = 0; s < 3; s++) { // 牌上字符灯
                    g.fillStyle(0xffffff, 0.7 * on * (0.5 + 0.5 * Math.sin(now / 200 + k + s)));
                    g.fillCircle(sx, -108 + (k % 2) * 34 + s * 20, 1.6);
                }
            }
            g.fillStyle(c, 0.08); // 湿地反光
            g.fillEllipse(0, 84, 170, 20);
            for (let k = 0; k < 5; k++) { // 地面霓虹倒影条
                const gl = 0.3 + 0.3 * Math.sin(now / 240 + k);
                g.fillStyle(k % 2 ? a : c, gl * 0.4);
                g.fillRect(-70 + k * 30, 80, 6, 10 + (k % 3) * 5);
            }
            g.fillStyle(c, 0.05 + 0.03 * Math.sin(now / 400)); // 环身霓虹晕
            g.fillCircle(0, -14, 84);
        } },
    cybAuraB: { c: 0x39ffd0, a: 0xff3bd4, draw: (g, now, c, a) => {
            // 数码风暴：环身的数码风暴——字符雨 + 故障错位块 + 扫描线 + 电弧
            g.fillStyle(0x0a0e18, 0.35); // 深空数码底
            g.fillCircle(0, -16, 96);
            for (let k = 0; k < 10; k++) { // 字符雨（绿色/品红字符列下落）
                const col = k % 3 === 0 ? a : c;
                const ph = (now / 700 + k / 10) % 1;
                const cx = -88 + (k * 19) % 176;
                for (let s = 0; s < 4; s++) {
                    const cy2 = -140 + ((ph + s * 0.04) % 1) * 250;
                    g.fillStyle(col, 0.6 * (1 - s * 0.22));
                    g.fillRect(cx, cy2, 2.4, 4.4);
                }
            }
            for (let k = 0; k < 4; k++) { // 故障错位块（横向撕裂的色块闪现）
                if (Math.sin(now / 130 + k * 3) > 0.2) {
                    const gx = -70 + (k * 37) % 140, gy = -90 + (k * 43) % 160;
                    g.fillStyle(k % 2 ? a : c, 0.35);
                    g.fillRect(gx, gy, 24 + (k % 3) * 10, 4);
                    g.fillStyle(0xffffff, 0.3);
                    g.fillRect(gx + 6, gy + 4, 16, 2);
                }
            }
            for (let k = 0; k < 5; k++) { // 环身电弧（静电弧绕体）
                const a0 = now / 110 + k * 1.3;
                const cx = Math.cos(a0) * 48, cy2 = -16 + Math.sin(a0) * 66;
                g.lineStyle(1.2, k % 2 ? a : c, 0.7);
                g.lineBetween(cx, cy2, cx + Math.sin(now / 42 + k) * 12, cy2 + Math.cos(now / 48 + k) * 10);
            }
            const scan = (now / 900) % 1; // 全屏扫描线
            g.fillStyle(0xffffff, 0.08);
            g.fillRect(-96, -140 + scan * 260, 192, 3);
        } },
    dgAuraA: { c: 0x7fd4ff, a: 0x5affd0, draw: (g, now, c, a) => {
            // 水晶宫光：身后一座水晶龙宫——宫柱剪影 + 光柱透射 + 游鱼 + 上浮气泡
            g.fillStyle(0x1a4054, 0.55); // 宫殿剪影（殿顶 + 双柱）
            apoly(g, [[-70, 60], [-56, -60], [-42, 60]], 0x1a4054, 0.5);
            apoly(g, [[42, 60], [56, -70], [70, 60]], 0x1a4054, 0.55);
            apoly(g, [[-20, 60], [0, -96], [20, 60]], 0x244a5e, 0.5);
            for (let k = 0; k < 3; k++) { // 殿内透出的光柱
                const gl = 0.2 + 0.12 * Math.sin(now / 500 + k * 1.6);
                g.fillStyle(k % 2 ? c : a, gl * 0.4);
                apoly(g, [[-46 + k * 46, 56], [-42 + k * 46, -50 - k * 12], [-34 + k * 46, -50 - k * 12], [-30 + k * 46, 56]], k % 2 ? c : a, gl * 0.35);
            }
            for (let k = 0; k < 5; k++) { // 游鱼（缓缓横游的剪影小鱼）
                const ph = (now / 3400 + k / 5) % 1;
                const fx = -100 + ph * 200, fy = -70 + (k * 33) % 120;
                g.fillStyle(0x9ad8e8, 0.5);
                g.fillEllipse(fx, fy + Math.sin(ph * 6 + k) * 4, 7, 3);
                g.fillTriangle(fx - 3.4, fy, fx - 6.4, fy - 2.4, fx - 6.4, fy + 2.4);
            }
            for (let k = 0; k < 6; k++) { // 上浮气泡
                const ph = (now / 1100 + k / 6) % 1;
                g.lineStyle(1, 0xffffff, 0.4 * (1 - ph));
                g.strokeCircle(Math.sin(k * 2.6) * 56 + Math.sin(ph * 4 + k) * 5, 80 - ph * 200, 1.8 + ph * 2);
            }
            g.fillStyle(c, 0.07); // 环身水色
            g.fillCircle(0, -14, 88);
        } },
    dgAuraB: { c: 0x5affd0, a: 0x7fd4ff, draw: (g, now, c, a) => {
            // 龙卷狂澜：身后一条盘上龙卷的水龙——龙卷水柱 + 盘柱龙影 + 溅浪 + 雷雨云
            g.fillStyle(0x1a4054, 0.5); // 顶部雷雨云
            g.fillEllipse(0, -130, 150, 34);
            g.fillStyle(0x244a5e, 0.5);
            g.fillEllipse(-30, -136, 60, 20);
            g.fillEllipse(34, -134, 56, 18);
            for (let k = 0; k < 4; k++) { // 龙卷水柱（向上收窄的旋转弧带）
                const pts = [];
                for (let s = 0; s <= 12; s++) {
                    const u = s / 12;
                    const ang = u * 7 + now / 350 + k * 1.6;
                    const r = (52 - u * 38) * (1 + k * 0.16);
                    pts.push([Math.cos(ang) * r, 84 - u * 190]);
                }
                g.lineStyle(4.4 - k, k % 2 ? c : a, 0.4);
                g.beginPath();
                pts.forEach(([px, py], s) => (s === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
                g.strokePath();
            }
            // 盘柱龙影（沿龙卷螺旋上升的龙头 + 蛇形身）
            const u = (now / 2600) % 1;
            const dy = 60 - u * 150;
            g.fillStyle(c, 0.75);
            g.fillCircle(Math.sin(u * 9) * (40 - u * 26), dy, 7);
            g.fillStyle(0xffffff, 0.8);
            g.fillCircle(Math.sin(u * 9) * (40 - u * 26) + 2.4, dy - 1.4, 1.4);
            g.fillStyle(c, 0.35);
            for (let s = 1; s <= 6; s++) {
                g.fillCircle(Math.sin(u * 9 - s * 0.5) * (40 - u * 26 + s * 4), dy + s * 7, 5 - s * 0.5);
            }
            for (let k = 0; k < 5; k++) { // 溅浪（底部飞溅的水花）
                const ph = (now / 500 + k / 5) % 1;
                const ang = (k / 5) * TAU;
                g.fillStyle(0xffffff, 0.7 * (1 - ph));
                g.fillCircle(Math.cos(ang) * (20 + ph * 44), 80 - ph * 26, 2.4 * (1 - ph) + 0.5);
            }
            g.fillStyle(a, 0.06); // 环身狂澜底色
            g.fillCircle(0, -16, 86);
        } },
    chronoAuraA: { c: 0x9b5cff, a: 0x5ac8ff, draw: (g, now, c, a) => {
            // 时间涟漪：脚下荡开的时间涟漪——多层涟漪环 + 逆流时针刻度 + 时之沙
            for (let k = 0; k < 3; k++) { // 三层涟漪（周期扩散，双环）
                const ph = (now / 1300 + k / 3) % 1;
                const r = 20 + ph * 84;
                g.lineStyle(3 * (1 - ph) + 0.6, k % 2 ? a : c, 0.55 * (1 - ph));
                g.strokeCircle(0, -10, r);
                g.lineStyle(1.2, 0xffffff, 0.3 * (1 - ph));
                g.strokeCircle(0, -10, r * 0.85);
            }
            for (let k = 0; k < 12; k++) { // 环绕的逆流时针刻度（反转）
                const ang = -now / 1500 + (k / 12) * TAU;
                const px = Math.cos(ang) * 56, py = -12 + Math.sin(ang) * 74;
                g.fillStyle(k % 3 === 0 ? a : c, 0.7);
                g.fillRect(px - 1, py - 2.4, 2, 4.8);
            }
            for (let k = 0; k < 6; k++) { // 时之沙（金紫色沙粒反重力上升）
                const ph = (now / 1000 + k / 6) % 1;
                g.fillStyle(k % 2 ? 0xffd45c : c, 0.65 * (1 - ph));
                g.fillCircle(Math.sin(k * 2.7) * 40 + Math.sin(ph * 4 + k) * 6, 76 - ph * 160, 1.6 * (1 - ph) + 0.4);
            }
            g.fillStyle(c, 0.06); // 环身时场
            g.fillCircle(0, -14, 82);
        } },
    chronoAuraB: { c: 0x5ac8ff, a: 0x9b5cff, draw: (g, now, c, a) => {
            // 星门漩涡：身后一座巨大的星门漩涡——双层旋臂 + 门心白洞 + 被吸入的残骸
            for (let arm = 0; arm < 3; arm++) { // 三条旋臂星流
                const pts = [];
                for (let s = 0; s <= 14; s++) {
                    const u = s / 14;
                    const ang = u * 4.6 + now / 1900 + arm * (TAU / 3);
                    const r = 8 + u * 72;
                    pts.push([Math.cos(ang) * r, -18 + Math.sin(ang) * r * 0.92]);
                }
                g.lineStyle(7 - arm * 2, arm === 1 ? a : c, 0.32);
                g.beginPath();
                pts.forEach(([px, py], s) => (s === 0 ? g.moveTo(px, py) : g.lineTo(px, py)));
                g.strokePath();
            }
            g.fillStyle(0x100c1a, 0.95); // 门心白洞暗核
            g.fillCircle(0, -18, 15);
            const core = 0.6 + 0.4 * Math.sin(now / 240);
            g.lineStyle(2.4, 0xffffff, core);
            g.strokeCircle(0, -18, 18);
            g.fillStyle(0xffffff, core);
            g.fillCircle(0, -18, 4);
            for (let k = 0; k < 5; k++) { // 被吸入的残骸（齿轮/表针碎片螺旋坠入）
                const ph = (now / 1500 + k / 5) % 1;
                const ang = ph * 5 + k * 1.3;
                const r = 84 * (1 - ph) + 14;
                g.fillStyle(k % 2 ? a : c, 0.7 * (1 - ph * 0.4));
                g.save();
                g.translateCanvas(Math.cos(ang) * r, -18 + Math.sin(ang) * r * 0.9);
                g.rotateCanvas(ang * 2);
                g.fillRect(-2.4, -2.4, 4.8, 4.8);
                g.restore();
            }
            for (let k = 0; k < 6; k++) { // 环绕星屑
                const ang = (k / 6) * TAU + now / 1600;
                g.fillStyle(0xffffff, 0.5 + 0.4 * Math.abs(Math.sin(now / 300 + k)));
                g.fillCircle(Math.cos(ang) * 70, -18 + Math.sin(ang) * 84, 1.2);
            }
        } },
};
