import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

import pkg from './package.json' with { type: 'json' };

function honoDevPlugin(): Plugin {
  return {
    name: 'hono-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && (req.url.startsWith('/api') || req.url === '/api')) {
          try {
            const { app } = await server.ssrLoadModule('/src/server/app.ts');
            const { getRequestListener } = await server.ssrLoadModule('@hono/node-server');
            getRequestListener(app.fetch)(req, res);
          } catch (err) {
            next(err);
          }
        } else {
          next();
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), honoDevPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});