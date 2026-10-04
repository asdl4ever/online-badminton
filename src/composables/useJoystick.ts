import { ref } from 'vue';
import {
  joystickAlwaysOn,
  joystickFreeOn,
  joystickScale,
  setJoystickAlwaysOn,
  setJoystickFreeOn,
  setJoystickScale,
} from '../game/device';

/**
 * 摇杆的全局偏好（设置 → 操作里改）：
 * - `always`：桌面端也常显摇杆；
 * - `free`：自由摇杆——本体隐藏，在左侧区域按下才出现（出现在按下点），松手消失；
 * - `scale`：摇杆大小缩放（0.7~1.5）。
 * 模块级 ref 让所有页面共享同一份状态，设置里一改，走动类页面即时生效；
 * Phaser 场景在创建时读一次，比赛那类场景下一局生效。
 */
const always = ref(joystickAlwaysOn());
const free = ref(joystickFreeOn());
const scale = ref(joystickScale());

export function useJoystickPrefs(): {
  always: typeof always;
  free: typeof free;
  scale: typeof scale;
  setAlways: (on: boolean) => void;
  setFree: (on: boolean) => void;
  setScale: (v: number) => void;
} {
  function setAlways(on: boolean): void {
    always.value = on;
    setJoystickAlwaysOn(on);
  }
  function setFree(on: boolean): void {
    free.value = on;
    setJoystickFreeOn(on);
  }
  function setScale(v: number): void {
    scale.value = v;
    setJoystickScale(v);
  }
  return { always, free, scale, setAlways, setFree, setScale };
}

/**
 * 两颗摇杆各占一边：记着「这一边现在握着哪根手指」（跨组件实例共享）。
 *
 * 大世界左右各一颗自由摇杆（走动 / 控球拍），**两指分处两半正是「一边走一边挥拍」**。
 * 但两颗摇杆是两个组件实例、互相不知道对方，第二根手指会照常冒到捏合检测那里，
 * 被当成「第二根手指 ⇒ 捏合」：`pinchActive` 一响两颗摇杆一起让位，结果是
 * **两颗自由摇杆没法同时用**。
 *
 * 所以这里共享一份登记表：另一半已经被握着时，新按下的那一下直接
 * `stopPropagation()`，不让捏合检测看到它（同一半里的两指仍然是捏合，缩放照旧）。
 */
export const joyHolding: Record<'left' | 'right', number | null> = { left: null, right: null };
