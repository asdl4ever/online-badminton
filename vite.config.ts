import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'
import { attachRelay } from './server/relay.mjs'
import { attachLobby } from './server/lobby.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // tree-shakes Vuetify down to the components actually used
    vuetify({ autoImport: true, styles: true }),
    {
      name: 'badminton-relay',
      // Mount the same WebSocket relay the production server uses, so dev and
      // preview behave identically.
      configureServer(server) {
        if (server.httpServer) {
          attachRelay(server.httpServer)
          attachLobby(server.httpServer)
        }
      },
      configurePreviewServer(server) {
        if (server.httpServer) {
          attachRelay(server.httpServer)
          attachLobby(server.httpServer)
        }
      },
    },
  ],
  // `host: true` exposes the dev server on the LAN so a phone can open it.
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
})
