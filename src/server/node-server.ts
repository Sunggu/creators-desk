import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { app } from './app';

// Serve frontend static assets from dist
app.use('/*', serveStatic({ root: './dist' }));

// SPA fallback for client-side routing
app.get('*', serveStatic({ path: './dist/index.html' }));

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

console.log(`
  [Creators Desk] Standalone Server is running!
  Local:   http://localhost:${port}
  Network: http://${host}:${port}
  Data:    ${process.env.DATA_DIR || './data'}
`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});
