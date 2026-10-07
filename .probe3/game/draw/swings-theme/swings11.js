import { dashLine, plates, shards, bolts, puffs, embers, starRow, ripples, petals, notes, cracks, glowHalo, tipOf, impact, } from './vocab.js';
/** 批十挥拍拖尾（电竞赛场 / 末日废土 / 星光偶像）*/
export const SWINGS_11 = {
    // 终结一击：扫描脉冲 + 全息判定板 + 命中处 ARC 电弧与数据碎片
    esportSwing: { a: 0xff2e88, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, c, 0.16);
            dashLine(g, k, now, c, 1, 4, 0.22); // 扫描脉冲
            plates(g, k, now, 0x11304a, 0.85, 6, 6); // 全息判定板（六边）
            bolts(g, k, now, a, 0xffffff, 0.8, 4); // ARC 电弧
            shards(g, k, now, 0x8ae0ff, 0.75, 5, 9, 2.2); // 数据碎片
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, a, c);
        } },
    // 爆裂重锤：烟尘炸开 + 地面放射裂纹 + 崩起的钢渣与余烬
    wasteSwing: { a: 0xff8a3c, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0x8a7a5a, 0.14);
            puffs(g, k, now, 0x4a4438, 0.9, 10, 15); // 黑烟
            puffs(g, k, now, 0xd8c8b0, 0.5, 6, 12); // 扬尘
            shards(g, k, now, 0x8a8a92, 0.85, 7, 10, 1.8); // 钢渣
            embers(g, k, now, a, 0x4a3a2a, 0.9, 8);
            // 轨迹下方炸裂的地面裂纹
            for (let i = 2; i < k.n - 1; i += 4) {
                const p = k.pts[i];
                cracks(g, p.x, p.y + 8, now, 0x1a1a20, 0.5, 3, 10);
            }
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, a, 0x4a4438);
        } },
    // 谢幕爆点：星海爆闪 + 彩带花瓣 + 升起的音符与声波环
    idolSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, a) => {
            glowHalo(g, k, 0xffb0e8, 0.18);
            starRow(g, k, now, 0xffffff, c, 0.95, 7, 3);
            petals(g, k, now, 0xffb0e8, 0.7, 7, 4.4); // 彩带
            notes(g, k, now, 0xffffff, 0.8, 4); // 音符
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, c, 0.55 + hot * 0.35, 3, 34 + hot * 14, 95);
            ripples(g, t.x, t.y, now + 180, a, 0.35, 2, 40, 140);
            impact(g, t.x, t.y, now, hot, 0xffffff, c);
        } },
};
