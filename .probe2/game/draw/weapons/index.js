import { WEAPONS_1 } from './weapons1.js';
import { WEAPONS_2 } from './weapons2.js';
import { WEAPONS_3 } from './weapons3.js';
import { WEAPONS_4 } from './weapons4.js';
import { WEAPONS_5 } from './weapons5.js';
import { WEAPONS_6 } from './weapons6.js';
import { WEAPONS_7 } from './weapons7.js';
import { WEAPONS_8 } from './weapons8.js';
import { WEAPONS_9 } from './weapons9.js';
import { WEAPONS_10 } from './weapons10.js';
import { WEAPONS_11 } from './weapons11.js';
import { WEAPONS_12 } from './weapons12.js';
import { WEAPONS_13 } from './weapons13.js';
import { WEAPONS_14 } from './weapons14.js';
import { WEAPONS_15 } from './weapons15.js';
/**
 * 主题球拍的**武器化**总入口（分文件分包见同目录 weapons1~4.ts）。
 *
 * 局部空间与 `drawRacketHead` 完全一致：握柄画在 x ∈ [-12, -2]（手在那里），
 * 武器的「打击部 / 甜区」围绕 (9, 0)，前后总跨度 ≈ 42，与常规拍框同量级。
 * 命中表就画武器并返回 true；没命中的皮肤返回 false，调用方退回拍框画法。
 * 只影响画面，判定（拍长与甜区）由 `constants.ts` 决定，不随皮肤变。
 */
const WEAPONS = {
    ...WEAPONS_1,
    ...WEAPONS_2,
    ...WEAPONS_3,
    ...WEAPONS_4,
    ...WEAPONS_5,
    ...WEAPONS_6,
    ...WEAPONS_7,
    ...WEAPONS_8,
    ...WEAPONS_9,
    ...WEAPONS_10,
    ...WEAPONS_11,
    ...WEAPONS_12,
    ...WEAPONS_13,
    ...WEAPONS_14,
    ...WEAPONS_15,
};
export function drawWeapon(g, now, skin) {
    const art = WEAPONS[skin];
    if (!art)
        return false;
    // 4★/5★ 武器多一层背光，让武器在球场上读得出来
    if (art.c) {
        const glowSkin = WEAPONS_4[skin] ? 0.16 : 0.12;
        g.lineStyle(11, art.c, glowSkin);
        g.strokeEllipse(9, 0, 44, 34);
    }
    art.draw(g, now, art.c, art.a);
    return true;
}
