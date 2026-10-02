import { WebSocketServer } from 'ws';

const PING_MS = 25000;

function normaliseId(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 16);
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
 * Which screen an invite should open on. The hub only relays the label; the
 * client decides what to do with it. Anything unknown falls back to a match.
 */
const INVITE_KINDS = new Set(['match', 'map', 'fish', 'mine']);

/**
 * Screens a player can report being in ("我在玩什么"). Friends watch each other
 * (`watch`), so whenever someone's scene/room changes the hub pushes a `state`
 * line to their watchers — that is what fills the on-line friend list with
 * 「在对局中 / 在潜水 …」 and lets a friend join the very same room.
 */
const SCENES = new Set([
  'godzilla',
  'off',
  'home',
  'map',
  'match',
  'fish',
  'mine',
  'climb',
  'petshop',
  'hall',
  'farm',
  'nailong',
]);

function normaliseScene(raw) {
  return SCENES.has(raw) ? raw : 'off';
}

function normaliseRoom(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);
}

/**
 * Attaches a lightweight presence / friend / invite hub to an existing http
 * server. Unlike the match relay this socket is *long lived*: every client
 * keeps it open while the app is on screen, so friends can see who is online
 * and push an invite even when nobody is in a room yet.
 *
 * Everything here is in-memory and deliberately anonymous: there are no
 * accounts and no database. A "player id" is just a stable friend code the
 * client generated and stored locally, and friend lists live on the clients.
 * The hub never persists anything, so a restart simply means everyone is
 * offline until they reconnect.
 */
export function attachLobby(server, path = '/lobby') {
  const wss = new WebSocketServer({ noServer: true });

  /** id -> { id, name, scene, room, sockets:Set<ws>, watching:Set<id> }  (online only) */
  const users = new Map();
  /** watchedId -> Set<watcherId>; survives the watched user being offline */
  const watchersOf = new Map();

  const deliver = (id, obj) => {
    const u = users.get(id);
    if (!u) return false;
    for (const ws of u.sockets) send(ws, obj);
    return true;
  };

  /** 一个人的「在玩什么」——好友列表靠它显示，跟随也靠它 */
  const stateOf = (u) => ({ t: 'state', id: u.id, name: u.name, scene: u.scene, room: u.room });

  const notifyWatchers = (id, online) => {
    const watchers = watchersOf.get(id);
    if (!watchers) return;
    for (const w of watchers) deliver(w, { t: 'presence', id, online });
  };

  const broadcastState = (u) => {
    const watchers = watchersOf.get(u.id);
    if (!watchers) return;
    const line = stateOf(u);
    for (const w of watchers) deliver(w, line);
  };

  const register = (ws, id, name) => {
    let u = users.get(id);
    if (!u) {
      u = { id, name, scene: 'off', room: '', sockets: new Set(), watching: new Set() };
      users.set(id, u);
      u.sockets.add(ws);
      ws.lobbyUser = u;
      send(ws, { t: 'welcome', id, name });
      notifyWatchers(id, true);
      return;
    }
    // same code already online: another tab of the same browser, or the
    // connection simply raced. Attach to the same identity rather than kick.
    u.sockets.add(ws);
    ws.lobbyUser = u;
    if (name && name !== u.name) u.name = name;
    send(ws, { t: 'welcome', id: u.id, name: u.name });
  };

  const unregister = (ws) => {
    const u = ws.lobbyUser;
    if (!u) return;
    ws.lobbyUser = null;
    u.sockets.delete(ws);
    if (u.sockets.size > 0) return;

    users.delete(u.id);
    notifyWatchers(u.id, false);
    for (const t of u.watching) {
      const s = watchersOf.get(t);
      if (s) {
        s.delete(u.id);
        if (s.size === 0) watchersOf.delete(t);
      }
    }
    u.watching.clear();
  };

  const applyWatch = (ws, u, ids) => {
    const next = new Set();
    for (const raw of Array.isArray(ids) ? ids : []) {
      const id = normaliseId(raw);
      if (!id || id === u.id) continue;
      next.add(id);
      let s = watchersOf.get(id);
      if (!s) {
        s = new Set();
        watchersOf.set(id, s);
      }
      s.add(u.id);
    }
    for (const t of u.watching) {
      if (!next.has(t)) {
        const s = watchersOf.get(t);
        if (s) {
          s.delete(u.id);
          if (s.size === 0) watchersOf.delete(t);
        }
      }
    }
    u.watching = next;
    const online = [...next].filter((id) => users.has(id));
    send(ws, {
      t: 'presence-batch',
      online,
      // 顺带把每个人「在玩什么」一起给过来，省一次往返
      states: online.map((id) => stateOf(users.get(id))),
    });
  };

  wss.on('connection', (ws) => {
    ws.alive = true;
    ws.lobbyUser = null;
    ws.on('pong', () => {
      ws.alive = true;
    });

    ws.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      if (!msg || typeof msg !== 'object') return;
      const t = msg.t;

      if (t === 'hello') {
        const id = normaliseId(msg.id);
        if (!id) {
          send(ws, { t: 'error', code: 'bad-id', m: '无效的好友码' });
          return;
        }
        register(ws, id, typeof msg.name === 'string' ? msg.name.slice(0, 24) : '');
        return;
      }

      const u = ws.lobbyUser;
      if (!u) {
        send(ws, { t: 'error', code: 'not-registered', m: '请先发送 hello' });
        return;
      }

      if (t === 'watch') {
        applyWatch(ws, u, msg.ids);
        return;
      }
      if (t === 'state') {
        const scene = normaliseScene(msg.scene);
        const room = normaliseRoom(msg.room);
        if (scene === u.scene && room === u.room) return;
        u.scene = scene;
        u.room = room;
        broadcastState(u);
        return;
      }
      if (t === 'add') {
        const target = normaliseId(msg.target);
        if (!target || target === u.id) return;
        if (!deliver(target, { t: 'friend-request', from: u.id, name: u.name })) {
          send(ws, { t: 'error', code: 'offline', m: '对方不在线，暂时无法添加' });
        }
        return;
      }
      if (t === 'accept') {
        const target = normaliseId(msg.target);
        if (!target) return;
        if (!deliver(target, { t: 'friend-accepted', from: u.id, name: u.name })) {
          send(ws, { t: 'error', code: 'offline', m: '对方已离线' });
        }
        return;
      }
      if (t === 'decline') {
        const target = normaliseId(msg.target);
        if (target) deliver(target, { t: 'friend-declined', from: u.id });
        return;
      }
      if (t === 'unfriend') {
        const target = normaliseId(msg.target);
        if (target) deliver(target, { t: 'unfriended', from: u.id });
        return;
      }
      if (t === 'invite') {
        const target = normaliseId(msg.target);
        const code = String(msg.code || '')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 8);
        const kind = INVITE_KINDS.has(msg.kind) ? msg.kind : 'match';
        if (!target || !code) return;
        if (!deliver(target, { t: 'invite', from: u.id, name: u.name, code, kind })) {
          send(ws, { t: 'error', code: 'offline', m: '对方不在线，邀请未送达' });
        }
        return;
      }
    });

    ws.on('close', () => unregister(ws));
    ws.on('error', () => unregister(ws));
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
