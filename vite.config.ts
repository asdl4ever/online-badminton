import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { attachRelay } from './server/relay.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'badminton-relay',
      // Mount the same WebSocket relay the production server uses, so dev and
      // preview behave identically.
      configureServer(server) {
        if (server.httpServer) attachRelay(server.httpServer)
      },
      configurePreviewServer(server) {
        if (server.httpServer) attachRelay(server.httpServer)
      },
    },
  ],
  // `host: true` exposes the dev server on the LAN so a phone can open it.
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
