import { WebSocketServer } from 'ws';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_CODE = 12;
const JOIN_WINDOW_MS = 20000;
const PING_MS = 25000;

function randomCode(len = 5) {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

function send(ws, obj) {
  if (ws && ws.readyState === ws.OPEN) {
    try {
      ws.send(JSON.stringify(obj));
    } catch {
      /* raced shut */
    }
  }
}

/**
 * Attaches a tiny peer-relay to an existing http server.
 *
 * Both players dial *out* over a plain WebSocket, so it works through any NAT,
 * carrier CGNAT or firewall -- no STUN/TURN involved. The server just forwards
 * opaque frames between the two sockets in a room.
 */
export function attachRelay(server, path = '/relay') {
  const wss = new WebSocketServer({ noServer: true });
  const rooms = new Map();

  const pair = (code) => {
    const room = rooms.get(code);
    if (!room || !room.host || !room.guest) return;
    room.host.peerSocket = room.guest;
    room.guest.peerSocket = room.host;
    room.host.roomCode = code;
    room.guest.roomCode = code;
    send(room.host, { t: 'ready', code });
    send(room.guest, { t: 'ready', code });
  };

  const drop = (ws, reason) => {
    const peer = ws.peerSocket;
    if (peer && !peer.gone) {
      peer.gone = true;
      send(peer, { t: 'peer-left', reason });
      try {
        peer.close();
      } catch {
        /* ignore */
      }
    }
    const code = ws.roomCode;
    if (code) {
      const room = rooms.get(code);
      if (room) {
        if (room.host === ws) room.host = null;
        if (room.guest === ws) room.guest = null;
        if (!room.host && !room.guest) rooms.delete(code);
      }
    }
  };

  wss.on('connection', (ws) => {
    ws.alive = true;
    ws.on('pong', () => {
      ws.alive = true;
    });

    const joinTimer = setTimeout(() => {
      if (!ws.roomCode) {
        send(ws, { t: 'error', m: '没有收到加入请求' });
        ws.close();
      }
    }, JOIN_WINDOW_MS);

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;

      if (!ws.roomCode && (msg.t === 'create' || msg.t === 'join')) {
        const code = String(msg.code || '')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, MAX_CODE);
        if (!code) {
          send(ws, { t: 'error', m: '非法房间号' });
          ws.close();
          return;
        }
        let room = rooms.get(code);
        if (!room) {
          room = { host: null, guest: null };
          rooms.set(code, room);
        }
        if (msg.t === 'create') {
          if (room.host) {
            send(ws, { t: 'error', m: '房间号已被占用，请重试' });
            ws.close();
            return;
          }
          room.host = ws;
        } else {
          if (room.guest) {
            send(ws, { t: 'error', m: '这个房间里已经有对手了' });
            ws.close();
            return;
          }
          room.guest = ws;
        }
        ws.roomCode = code;
        clearTimeout(joinTimer);
        if (room.host && room.guest) pair(code);
        else send(ws, { t: 'waiting', code });
        return;
      }

      const peer = ws.peerSocket;
      if (peer && peer.readyState === peer.OPEN) {
        peer.send(raw.toString());
      }
    });

    ws.on('close', () => {
      clearTimeout(joinTimer);
      drop(ws, 'closed');
    });
    ws.on('error', () => {
      clearTimeout(joinTimer);
      drop(ws, 'error');
    });
  });

  const ping = setInterval(() => {
    for (const ws of wss.clients) {
      if (!ws.alive) {
        ws.terminate();
        continue;
      }
      ws.alive = false;
      try {
        ws.ping();
      } catch {
        /* ignore */
      }
    }
  }, PING_MS);
  wss.on('close', () => clearInterval(ping));

  server.on('upgrade', (req, socket, head) => {
    let pathname = '/';
    try {
      pathname = new URL(req.url || '/', 'http://localhost').pathname;
    } catch {
      /* ignore */
    }
    if (pathname !== path) return;
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit('connection', ws, req));
  });

  return wss;
}

export { randomCode };
