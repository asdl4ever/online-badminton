/**
 * Device capability checks that must stay free of heavy imports.
 *
 * This module is reached from App.vue, so it must never pull in Phaser — that
 * would drag the whole game engine into the first-load bundle.
 */
export function isTouchDevice(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get('touch');
    if (q === '1') return true;
    if (q === '0') return false;
  } catch {
    /* ignore */
  }
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

/** `?ice=relay` forces every connection through TURN. */
export function relayOnly(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('ice') === 'relay';
  } catch {
    return false;
  }
}

/** `?debug=1` shows the netcode telemetry overlay inside the canvas. */
export function debugOverlayEnabled(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('debug') === '1';
  } catch {
    return false;
  }
}
