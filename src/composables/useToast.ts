import { ref } from 'vue';

/**
 * App-wide transient hints ("已装备" / "金币不足" / "房号已复制").
 *
 * Deliberately not the same thing as the cards in App.vue: those are
 * actionable (accept / decline a friend request) and stay until handled,
 * while these auto-dismiss and never ask for input.
 *
 * renderer lives in components/ui/AppToast.vue, mounted once in App.vue.
 * only the fields VSnackbar itself understands are used, so the queue can
 * drain these straight into <VSnackbar> without any mapping.
 */

export type ToastTone = 'info' | 'good' | 'warn' | 'bad';

export interface ToastMessage {
  text: string;
  timeout: number;
  /** lands on .v-overlay__content; the tone colours live in style.css */
  contentClass: string;
}

/** pending hints; <VSnackbarQueue> shifts the head and emits the tail back */
export const toastQueue = ref<ToastMessage[]>([]);

export function toast(text: string, tone: ToastTone = 'info', timeout = 1900): void {
  toastQueue.value.push({ text, timeout, contentClass: `app-toast--${tone}` });
}

export const toastGood = (text: string) => toast(text, 'good');
export const toastWarn = (text: string) => toast(text, 'warn');
export const toastBad = (text: string) => toast(text, 'bad');
