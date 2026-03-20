import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { request as httpRequest } from 'http'

// Vite plugin that proxies /a2a-proxy/{port}/... → http://localhost:{port}/...
// This enables the Chat Playground to reach local A2A agent servers without CORS issues.
function a2aProxyPlugin() {
  return {
    name: 'a2a-dynamic-proxy',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/a2a-proxy\/(\d+)(\/.*)?$/);
        if (!match) return next();

        const port = parseInt(match[1], 10);
        const path = match[2] || '/';

        const options = {
          hostname: 'localhost',
          port,
          path,
          method: req.method,
          headers: {
            ...req.headers,
            host: `localhost:${port}`,
          },
        };

        const proxyReq = httpRequest(options, (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Proxy error: ${err.message}` }));
        });

        req.pipe(proxyReq, { end: true });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), a2aProxyPlugin()],
  base: '/ai-agents-prototype/',
})
