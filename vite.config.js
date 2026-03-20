import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ai-agents-prototype/',
  server: {
    // Proxy for local A2A agent servers (avoids CORS issues during dev).
    // Usage: enter "http://localhost:5173/a2a-proxy/10002" in the Chat Playground
    // and it will proxy to "http://localhost:10002".
    proxy: {
      '/a2a-proxy': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (path) => {
          // /a2a-proxy/10002/foo → http://localhost:10002/foo
          const match = path.match(/^\/a2a-proxy\/(\d+)(\/.*)?$/);
          if (match) return `:${match[1]}${match[2] || '/'}`;
          return path;
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            const match = req.url.match(/^\/a2a-proxy\/(\d+)/);
            if (match) {
              proxyReq.setHeader('host', `localhost:${match[1]}`);
            }
          });
        },
      },
    },
  },
})
