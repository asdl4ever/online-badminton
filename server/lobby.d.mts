/** Type surface for the plain-JS lobby hub so vite.config.ts can import it. */
import type { Server } from 'node:http';
import type { Http2SecureServer } from 'node:http2';
import type { WebSocketServer } from 'ws';

export declare function attachLobby(
  server: Server | Http2SecureServer,
  path?: string,
): WebSocketServer;
