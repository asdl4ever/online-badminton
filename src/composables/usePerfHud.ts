import { ref } from 'vue';

/**
 * 「性能诊断」面板的开关（设置 → 性能诊断里改，记在本机 `bmt-perf-hud`）。
 *
 * 打开后 `App.vue` 会挂上 `components/PerfHud.vue`——**全站角落**常显一块小面板，
 * 看 fps / 最慢帧 / 掉帧次数 / 最近几次卡顿与长任务（内核见 `game/perf.ts`）。
 * 默认关：它是排查用的，平时不该占屏幕。
 */
const KEY = 'bmt-perf-hud';

function readPref(): boolean {
  try {
    return window.localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

const enabled = ref(readPref());

export function usePerfHudPref(): {
  enabled: typeof enabled;
  setEnabled: (on: boolean) => void;
} {
  function setEnabled(on: boolean): void {
    enabled.value = on;
    try {
      window.localStorage.setItem(KEY, on ? '1' : '0');
    } catch {
      /* private mode */
    }
  }
  return { enabled, setEnabled };
}
