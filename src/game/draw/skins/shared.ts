import type { CharacterPose } from '../character';

/**
 * 皮肤覆盖层的共享约定。
 * painter 收到的 pose 与 `drawCharacter` 相同：x / feetY / facing / color / move。
 * 面向：+facing 为角色朝向，长尾 / 披挂类应甩向 -facing（身后）。
 */

export type SkinPainter = (g: import('phaser').GameObjects.Graphics, now: number, pose: CharacterPose) => void;

/** 地面阴影（所有皮肤通用第一步） */
export function groundShadow(g: import('phaser').GameObjects.Graphics, pose: CharacterPose, w = 52): void {
  g.fillStyle(0x000000, 0.14);
  g.fillEllipse(pose.x, pose.feetY + 2, w, 10);
}
