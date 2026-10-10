import { ref } from 'vue';
import { useLocalStorage } from '@vueuse/core';

/**
 * 新手引导（大世界三步 coach-mark）的全局状态：
 * - `onboardingDone`：看过／跳过了就不再自动弹（本机持久化）；
 * - `onboardingForced`：设置里点「重看新手引导」时置真——老兵也能随时调出来。
 *
 * 模块级单例，设置面板世界页共享同一份，互相即时生效。
 */
export const onboardingDone = useLocalStorage('bmt-onboarding-done', false);
export const onboardingForced = ref(false);

/** 设置里「重看新手引导」调用：清掉看过标记，回大世界就会再弹一次 */
export function replayOnboarding(): void {
  onboardingDone.value = false;
  onboardingForced.value = true;
}
