import { HATS_1 } from './hats1.js';
import { HATS_2 } from './hats2.js';
import { HATS_3 } from './hats3.js';
import { HATS_4 } from './hats4.js';
import { HATS_5 } from './hats5.js';
import { HATS_6 } from './hats6.js';
import { HATS_7 } from './hats7.js';
import { HATS_8 } from './hats8.js';
import { HATS_9 } from './hats9.js';
import { HATS_10 } from './hats10.js';
import { HATS_11 } from './hats11.js';
import { HATS_12 } from './hats12.js';
import { HATS_13 } from './hats13.js';
import { HATS_14 } from './hats14.js';
import { HATS_15 } from './hats15.js';
;
/**
 * 主题头饰的**逐顶独立画**总入口（分文件见 hats1~4.ts）。
 * 约定与 character.ts 的 drawHat 一致：(x, hy) = 帽沿线（hy = topY + 4），
 * 帽子往上长（y 负方向）、横跨约 x±20。
 */
const HATS = {
    ...HATS_1,
    ...HATS_2,
    ...HATS_3,
    ...HATS_4,
    ...HATS_5,
    ...HATS_6,
    ...HATS_7,
    ...HATS_8,
    ...HATS_9,
    ...HATS_10,
    ...HATS_11,
    ...HATS_12,
    ...HATS_13,
    ...HATS_14,
    ...HATS_15,
};
export function hasCustomHat(id) {
    return !!HATS[id];
}
export function drawHatCustom(g, now, id, x, hy) {
    const art = HATS[id];
    if (!art)
        return false;
    const c = art.c ?? 0xffd45c;
    g.save();
    art.draw(g, now, x, hy, c, art.a);
    g.restore();
    return true;
}
