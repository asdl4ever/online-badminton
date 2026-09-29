/** Type surface for the plain-JS relay so vite.config.ts can import it. */
import type { Server } from 'node:http';
import type { Http2SecureServer } from 'node:http2';
import type { WebSocketServer } from 'ws';

export declare function attachRelay(
  server: Server | Http2SecureServer,
  path?: string,
): WebSocketServer;

export declare function randomCode(len?: number): string;
