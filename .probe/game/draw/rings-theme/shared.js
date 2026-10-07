export const TAU = Math.PI * 2;
/** 地面基准椭圆的半长轴 / 半短轴 */
export const R_RX = 24;
export const R_RY = 7;
/** 地面基准椭圆中心 y（相对 feetY 的偏移） */
export const R_DY = -3;
/** 折线描边 */
export function rline(g, pts, w, c, a = 1) {
    g.lineStyle(w, c, a);
    g.beginPath();
    g.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++)
        g.lineTo(pts[i][0], pts[i][1]);
    g.strokePath();
}
/** 多边形填充 */
export function rpoly(g, pts, c, a = 1) {
    g.fillStyle(c, a);
    g.fillPoints(pts.map(([x, y]) => ({ x, y })), true);
}
