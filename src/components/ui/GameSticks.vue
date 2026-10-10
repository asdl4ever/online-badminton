<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue';
import Joystick from './Joystick.vue';
import { isTouchDevice, joystickAlwaysOn } from '../../game/device';
import { stickInput, skillInput } from '../../game/touch';
import { SKILL_BY_ID, type SkillId } from '../../game/skills';

/**
 * 各玩法页叠在 Phaser 画布上的**虚拟摇杆**（左：移动；右：球拍）+ **招式按钮**。
 *
 * 输入写进 `game/touch.ts` 的共享对象（`stickInput` / `skillInput`），场景每帧读它。
 * 招式按钮**只渲染主动招式**（`kind==='active'`）；被动装上即生效、不需要按钮。
 * 按钮下标 = 携带槽位（0/1/2 ↔ 快捷键 1/2/3）。
 */
const props = withDefaults(defineProps<{ always?: boolean; skills?: SkillId[] }>(), {
  always: false,
  skills: () => [],
});
const show = computed(() => props.always || isTouchDevice() || joystickAlwaysOn());

/** 只保留主动招式，且记住它在携带列表里的下标（对齐 skillInput.pressed） */
const activeSlots = computed(() =>
  (props.skills ?? [])
    .map((id, i) => ({ id, i }))
    .filter((s) => SKILL_BY_ID[s.id]?.kind === 'active'),
);

function setMove(x: number, y: number): void {
  stickInput.move.x = x;
  stickInput.move.y = y;
  stickInput.moveActive = x !== 0 || y !== 0;
}
function setRacket(x: number, y: number): void {
  stickInput.racket.x = x;
  stickInput.racket.y = y;
  stickInput.racketActive = x !== 0 || y !== 0;
}

function pressSkill(i: number, down: boolean): void {
  skillInput.pressed[i] = down;
}

function clear(): void {
  setMove(0, 0);
  setRacket(0, 0);
  skillInput.pressed = [false, false, false];
}

onBeforeUnmount(clear);
</script>

<template>
  <div v-if="show" class="sticks">
    <Joystick :dead-zone="0.15" @move="setMove" />
    <Joystick side="right" :dead-zone="0.15" @move="setRacket" />

    <div v-if="activeSlots.length" class="skill-btns">
      <button
        v-for="s in activeSlots"
        :key="s.id"
        class="skill-btn"
        type="button"
        @pointerdown.prevent="pressSkill(s.i, true)"
        @pointerup.prevent="pressSkill(s.i, false)"
        @pointerleave="pressSkill(s.i, false)"
        @pointercancel="pressSkill(s.i, false)"
      >
        <span class="skill-btn__icon">{{ SKILL_BY_ID[s.id].icon }}</span>
        <span class="skill-btn__name">{{ SKILL_BY_ID[s.id].name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* 覆盖层本身不吃指针事件（鼠标控球拍照旧穿透到画布），
   只有两颗摇杆本体（固定模式）或半屏热区（自由模式）可点。 */
.sticks {
  position: absolute;
  inset: 0;
  z-index: 28;
  pointer-events: none;
}

.sticks :deep(.joy),
.sticks :deep(.joy-zone) {
  pointer-events: auto;
}

/* 招式按钮：底部中间一排（避开左右两颗摇杆）。
   z-index 必须压过自由摇杆的半屏热区（`.joy-zone` 是 28），
   否则自由摇杆模式下按钮会被热区吞掉、按了只会冒摇杆。 */
.skill-btns {
  position: absolute;
  left: 50%;
  bottom: 20px;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  pointer-events: auto;
  z-index: 30;
}

.skill-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  width: 62px;
  padding: 6px 4px;
  border-radius: var(--r-md, 12px);
  border: 1px solid var(--line, #ddd);
  background: color-mix(in srgb, var(--surface, #fff) 80%, transparent);
  backdrop-filter: blur(6px);
  box-shadow: var(--e2, 0 2px 8px rgba(0, 0, 0, 0.18));
  cursor: pointer;
  user-select: none;
  touch-action: none;
}

.skill-btn:active {
  transform: scale(0.92);
}

.skill-btn__icon {
  font-size: 20px;
  line-height: 1.1;
}

.skill-btn__name {
  font-size: 10px;
  color: var(--text);
  white-space: nowrap;
}
</style>
