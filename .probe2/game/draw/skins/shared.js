/** 地面阴影（所有皮肤通用第一步） */
export function groundShadow(g, pose, w = 52) {
    g.fillStyle(0x000000, 0.14);
    g.fillEllipse(pose.x, pose.feetY + 2, w, 10);
}
