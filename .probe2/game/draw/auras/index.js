import { AURAS_1 } from './auras1.js';
import { AURAS_2 } from './auras2.js';
import { AURAS_3 } from './auras3.js';
import { AURAS_4 } from './auras4.js';
import { AURAS_5 } from './auras5.js';
import { AURAS_6 } from './auras6.js';
import { AURAS_7 } from './auras7.js';
import { AURAS_8 } from './auras8.js';
import { AURAS_9 } from './auras9.js';
import { AURAS_10 } from './auras10.js';
import { AURAS_11 } from './auras11.js';
import { AURAS_12 } from './auras12.js';
import { AURAS_13 } from './auras13.js';
import { AURAS_14 } from './auras14.js';
import { AURAS_15 } from './auras15.js';
import { AURAS_16 } from './auras16.js';
import { AURAS_17 } from './auras17.js';
;
/**
 * 主题光环的**背景特效化**总入口（分文件见 auras1~4.ts）。
 *
 * 光环不再是「环」：每款是一幅画在角色**身后的背景特效**——光柱 / 魔阵 / 帷幕 /
 * 落日 / 极光 / 银河…以 (0, 0) = 角色躯干为中心、纵跨约 ±150。
 * `drawCharacter` 本来就在画身体之前调 `drawAura`，所以这里天然在身后。
 */
const AURAS = {
    ...AURAS_1,
    ...AURAS_2,
    ...AURAS_3,
    ...AURAS_4,
    ...AURAS_5,
    ...AURAS_6,
    ...AURAS_7,
    ...AURAS_8,
    ...AURAS_9,
    ...AURAS_10,
    ...AURAS_11,
    ...AURAS_12,
    ...AURAS_13,
    ...AURAS_14,
    ...AURAS_15,
    ...AURAS_16,
    ...AURAS_17,
};
export function hasCustomAura(id) {
    return !!AURAS[id];
}
/** 画一件主题光环背景特效；(x, cy) = 角色躯干中心，color = 物品主色 */
export function drawAuraCustom(g, now, id, x, cy, color) {
    const art = AURAS[id];
    if (!art)
        return false;
    g.save();
    g.translateCanvas(x, cy);
    art.draw(g, now, art.c ?? color, art.a);
    g.restore();
    return true;
}
