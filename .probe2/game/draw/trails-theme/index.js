import { TRAILS_1 } from './trails1.js';
import { TRAILS_2 } from './trails2.js';
import { TRAILS_3 } from './trails3.js';
import { TRAILS_4 } from './trails4.js';
import { TRAILS_5 } from './trails5.js';
import { TRAILS_6 } from './trails6.js';
import { TRAILS_7 } from './trails7.js';
import { TRAILS_8 } from './trails8.js';
import { TRAILS_9 } from './trails9.js';
import { TRAILS_10 } from './trails10.js';
import { TRAILS_11 } from './trails11.js';
import { TRAILS_12 } from './trails12.js';
import { TRAILS_13 } from './trails13.js';
const TRAILS = {
    ...TRAILS_1,
    ...TRAILS_2,
    ...TRAILS_3,
    ...TRAILS_4,
    ...TRAILS_5,
    ...TRAILS_6,
    ...TRAILS_7,
    ...TRAILS_8,
    ...TRAILS_9,
    ...TRAILS_10,
    ...TRAILS_11,
    ...TRAILS_12,
    ...TRAILS_13,
};
export function hasCustomTrail(id) {
    return !!TRAILS[id];
}
export function drawTrailCustom(g, now, id, pts, fade) {
    const art = TRAILS[id];
    if (!art)
        return false;
    const ctx = { g, pts, fade, now };
    g.save();
    art.draw(ctx, art.c, art.a);
    g.restore();
    return true;
}
