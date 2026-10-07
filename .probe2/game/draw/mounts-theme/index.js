import { MOUNTS_1 } from './mounts1.js';
import { MOUNTS_2 } from './mounts2.js';
import { MOUNTS_3 } from './mounts3.js';
import { MOUNTS_4 } from './mounts4.js';
import { MOUNTS_5 } from './mounts5.js';
import { MOUNTS_6 } from './mounts6.js';
import { MOUNTS_7 } from './mounts7.js';
import { MOUNTS_8 } from './mounts8.js';
import { MOUNTS_9 } from './mounts9.js';
import { MOUNTS_10 } from './mounts10.js';
import { MOUNTS_11 } from './mounts11.js';
import { MOUNTS_12 } from './mounts12.js';
import { MOUNTS_13 } from './mounts13.js';
import { MOUNTS_14 } from './mounts14.js';
/**
 * 主题坐骑的**逐款独立画**总入口（分文件见 mounts1~3.ts）。
 * 6-family 通用模板已废弃：每款按名字画成独立的坐骑（骆驼 / 骸骨战马 /
 * 魔鬼鱼 / 卡丁车 / 贡多拉 / 战车…）。
 */
const MOUNTS = {
    ...MOUNTS_1,
    ...MOUNTS_2,
    ...MOUNTS_3,
    ...MOUNTS_4,
    ...MOUNTS_5,
    ...MOUNTS_6,
    ...MOUNTS_7,
    ...MOUNTS_8,
    ...MOUNTS_9,
    ...MOUNTS_10,
    ...MOUNTS_11,
    ...MOUNTS_12,
    ...MOUNTS_13,
    ...MOUNTS_14,
};
export function hasCustomMount(id) {
    return !!MOUNTS[id];
}
export function drawMountCustom(g, now, id, pose) {
    const art = MOUNTS[id];
    if (!art)
        return false;
    const c = art.c ?? 0xffd45c;
    g.save();
    art.draw(g, now, pose.x, pose.feetY, pose.facing, c, art.a, pose);
    g.restore();
    return true;
}
