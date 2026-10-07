import { ghostEcho, hairLine, petals, puffs, crystals, embers, sparks, impact, glowHalo, tipOf, ripples } from './vocab.js';
/** 批六挥拍拖尾（法老秘葬 / 暗部忍道）*/
export const SWINGS_7 = {
    // 圣沙斩：黄沙翻卷的刃风 + 悬空圣晶 + 一路金砂
    egSwing: { a: 0xffd45c, draw: (g, now, hot, k, c, _a) => {
            glowHalo(g, k, 0xffd45c, 0.14);
            puffs(g, k, now, 0xd8c08a, 0.85, 9, 13); // 翻卷的黄沙
            puffs(g, k, now, 0x8a6a3a, 0.5, 6, 16);
            crystals(g, k, now, c, 0.85, 4, 8); // 悬空圣晶
            sparks(g, k, now, 0xffe08a, 0.85, 7, 18); // 金砂
            const t = tipOf(k);
            impact(g, t.x, t.y, now, hot, 0xffd45c, 0xd8c08a);
        } },
    // 影分身斩：三重刀影错位 + 一道极细真刀光 + 卷起的樱花
    njaSwing: { a: 0xff5a7a, draw: (g, now, hot, k, _c, a) => {
            glowHalo(g, k, 0x8a94b8, 0.1);
            ghostEcho(g, k, 0x4a5a7a, 0.7, 3, 6); // 三重残影
            ghostEcho(g, k, 0x9aa8c8, 0.5, 5, 11);
            hairLine(g, k, 0xffffff, 1, 0.12); // 真刀光
            petals(g, k, now, 0xffb0c8, 0.6, 7, 4); // 樱花
            embers(g, k, now, a, 0x3a2a3a, 0.6, 5);
            const t = tipOf(k);
            ripples(g, t.x, t.y, now, 0xffffff, 0.4 + hot * 0.4, 2, 22 + hot * 10, 90);
        } },
};
