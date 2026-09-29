/**
 * ICE configuration.
 *
 * PeerJS's built-in TURN servers (eu-0/us-0.turn.peerjs.com) are dead -- they
 * do not even resolve in DNS -- and the public Open Relay credentials no
 * longer allocate either (verified: zero relay candidates). So there is no
 * free relay to lean on, and WebRTC only works when a direct path exists.
 *
 * That is why the app falls back to its own WebSocket relay (`server/relay.mjs`)
 * when direct connectivity fails. Put a real TURN server here if you want
 * WebRTC to work across strict NATs without relaying through the app server:
 *   VITE_TURN_URL="turn:your.host:3478,turns:your.host:5349"
 *   VITE_TURN_USER=...
 *   VITE_TURN_PASS=...
 */
const env = import.meta.env;

const servers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

if (env.VITE_TURN_URL) {
  servers.push({
    urls: String(env.VITE_TURN_URL).split(','),
    username: env.VITE_TURN_USER,
    credential: env.VITE_TURN_PASS,
  });
}

export { servers as iceServers };

/**
 * `?ice=relay` forces every connection through TURN. Handy for checking that
 * the relay list actually works: run both ends with it and a Node/browser
 * pair on the same machine still has to go through the relay.
 */
export function iceTransportPolicy(): RTCIceTransportPolicy {
  try {
    return new URLSearchParams(window.location.search).get('ice') === 'relay'
      ? 'relay'
      : 'all';
  } catch {
    return 'all';
  }
}

export function rtcConfiguration(): RTCConfiguration {
  return {
    iceServers: servers,
    iceTransportPolicy: iceTransportPolicy(),
  };
}
