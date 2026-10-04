import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import type { AppContext } from './bindings';
import { filesRouter } from './routes/files';
import { searchRouter } from './routes/search';
import { vaultsRouter } from './routes/vaults';

export const app = new Hono<AppContext>();

// Global middleware
app.use('*', logger());
app.use('/api/*', cors());

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    name: 'creators-desk-api',
    runtime: 'universal-hono',
    timestamp: Date.now(),
  });
});

// Mount modular sub-routers
app.route('/api/vaults', vaultsRouter);
app.route('/api/vaults', filesRouter);
app.route('/api/vaults', searchRouter);
