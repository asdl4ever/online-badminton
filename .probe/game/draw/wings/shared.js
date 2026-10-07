export const TAU = Math.PI * 2;
/** 折线描边 */
export function wline(g, pts, w, c, a = 1) {
    g.lineStyle(w, c, a);
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++)
        g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
}
/** 多边形填充 */
export function wpoly(g, pts, c, a = 1) {
    g.fillStyle(c, a);
    g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}
