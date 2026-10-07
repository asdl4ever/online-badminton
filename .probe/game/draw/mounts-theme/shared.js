export const TAU = Math.PI * 2;
/** 兽类四条腿（多款坐骑共用） */
export function legs(g, x, y, w = 6, h = 20, c = 0x3a2a1c, dxs = [-22, -8, 8, 22]) {
    g.fillStyle(c, 0.95);
    for (const dx of dxs)
        g.fillRoundedRect(x + dx - w / 2, y - h + 8, w, h, 2.5);
}
/** 多边形填充 */
export function mpoly(g, pts, c, a = 1) {
    g.fillStyle(c, a);
    g.fillPoints(pts.map(([px, py]) => ({ x: px, y: py })), true);
}
/** 一根羽毛 / 叶片：从 (bx,by) 朝 ang 方向伸出的水滴形（翼、鬃毛共用） */
export function feather(g, bx, by, ang, len, wid, c, al = 1) {
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const pts = [];
    const steps = 4;
    for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        pts.push({ x: bx + cos * len * t - sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t + cos * wid * Math.sin(t * Math.PI) });
    }
    for (let k = steps; k >= 0; k--) {
        const t = k / steps;
        pts.push({ x: bx + cos * len * t + sin * wid * Math.sin(t * Math.PI), y: by + sin * len * t - cos * wid * Math.sin(t * Math.PI) });
    }
    g.fillStyle(c, al);
    g.fillPoints(pts, true);
}
/** 一小团云雾 */
export function mist(g, x, y, r, al = 0.5) {
    g.fillStyle(0xffffff, al * 0.7);
    g.fillCircle(x - r * 0.7, y + r * 0.2, r * 0.6);
    g.fillCircle(x + r * 0.7, y + r * 0.15, r * 0.65);
    g.fillStyle(0xffffff, al);
    g.fillCircle(x, y, r * 0.8);
}
