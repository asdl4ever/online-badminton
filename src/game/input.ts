import Phaser from 'phaser';

export interface ControlKeys {
  left: Phaser.Input.Keyboard.Key[];
  right: Phaser.Input.Keyboard.Key[];
  jump: Phaser.Input.Keyboard.Key[];
}

function keysOf(scene: Phaser.Scene, list: string[]): Phaser.Input.Keyboard.Key[] {
  const kb = scene.input.keyboard;
  if (!kb) return [];
  return list.map((k) => kb.addKey(k, true, false));
}

export function createControls(scene: Phaser.Scene): ControlKeys {
  return {
    left: keysOf(scene, ['LEFT', 'A']),
    right: keysOf(scene, ['RIGHT', 'D']),
    jump: keysOf(scene, ['UP', 'W']),
  };
}

function down(keys: Phaser.Input.Keyboard.Key[]): boolean {
  for (const k of keys) if (k.isDown) return true;
  return false;
}

export function readControls(c: ControlKeys): { left: boolean; right: boolean; jump: boolean } {
  return {
    left: down(c.left),
    right: down(c.right),
    jump: down(c.jump),
  };
}
