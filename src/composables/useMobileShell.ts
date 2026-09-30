import { useFullscreen, useMediaQuery } from '@vueuse/core';
import { onMounted, onUnmounted } from 'vue';
import { isTouchDevice } from '../game/device';

/**
 * Mobile browser chrome.
 *
 * Fullscreen and orientation lock both require a user gesture, so we arm them
 * and fire on the first tap anywhere. iOS has no orientation lock, which is
 * why the portrait prompt in style.css exists as the fallback.
 */
export function useMobileShell() {
  const isTouch = useMediaQuery('(pointer: coarse)');
  const { isSupported: fullscreenSupported, enter } = useFullscreen();

  let armed = true;

  const onPointerDown = () => {
    if (!armed || !isTouchDevice()) return;
    armed = false;
    void (async () => {
      if (fullscreenSupported.value) {
        try {
          await enter();
        } catch {
          /* user declined */
        }
      }
      try {
        const orientation = screen.orientation as ScreenOrientation & {
          lock?: (value: string) => Promise<void>;
        };
        await orientation?.lock?.('landscape');
      } catch {
        /* unsupported (iOS) */
      }
    })();
  };

  onMounted(() => window.addEventListener('pointerdown', onPointerDown, true));
  onUnmounted(() => window.removeEventListener('pointerdown', onPointerDown, true));

  return { isTouch, fullscreenSupported };
}
