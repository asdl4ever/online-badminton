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
    // jump lives on its own keys so steering can never fire it by accident
    jump: keysOf(scene, ['SPACE', 'K', 'W']),
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

/**
 * 🥋 **招式键**（单机 / PvE 专用）：1 蓄力重杀 · 2 鱼跃救球 · 3 交叉步突进。
 * 联机不读这几个键（属性归一化，招式也只在单机生效）。
 */
export interface SkillKeys {
  charge: Phaser.Input.Keyboard.Key[];
  dive: Phaser.Input.Keyboard.Key[];
  dash: Phaser.Input.Keyboard.Key[];
}

export function createSkillKeys(scene: Phaser.Scene): SkillKeys {
  return {
    charge: keysOf(scene, ['ONE', 'NUMPAD_ONE']),
    dive: keysOf(scene, ['TWO', 'NUMPAD_TWO']),
    dash: keysOf(scene, ['THREE', 'NUMPAD_THREE']),
  };
}

export function readSkills(k: SkillKeys): { charge: boolean; dive: boolean; dash: boolean } {
  return { charge: down(k.charge), dive: down(k.dive), dash: down(k.dash) };
}
