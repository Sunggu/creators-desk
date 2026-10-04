import { Hono } from 'hono';
import type { AppContext } from '../bindings';
import { getContextStorage } from '../storage/get-context-storage';

export const vaultsRouter = new Hono<AppContext>();

vaultsRouter.get('/', async (c) => {
  const { db } = getContextStorage(c);
  const results = await db.all('SELECT id, key, alias, created_at, updated_at FROM vaults ORDER BY updated_at DESC');
  const list = results.map((row) => ({
    id: row.id as string,
    key: (row.key || row.id) as string,
    alias: (row.alias || row.name || 'Untitled') as string,
    name: (row.alias || row.name || 'Untitled') as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));

  return c.json(list);
});

vaultsRouter.post('/', async (c) => {
  const { db } = getContextStorage(c);
  const body = await c.req.json<{ alias?: string; name?: string; key?: string }>();
  const rawAlias = (body.alias || body.name || '').trim();
  if (!rawAlias) {
    return c.json({ error: 'Vault alias cannot be empty' }, 400);
  }

  const now = Date.now();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `vault-${now}-${Math.random().toString(36).substring(2, 9)}`;

  const key = body.key?.trim() || `vlt_${id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)}`;

  await db.run(
    'INSERT INTO vaults (id, key, alias, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [id, key, rawAlias, now, now],
  );

  const vault = {
    id,
    key,
    alias: rawAlias,
    name: rawAlias,
    createdAt: now,
    updatedAt: now,
  };

  return c.json(vault, 201);
});

vaultsRouter.get('/:key', async (c) => {
  const { db } = getContextStorage(c);
  const keyParam = c.req.param('key');
  const row = await db.first(
    'SELECT id, key, alias, created_at, updated_at FROM vaults WHERE key = ? OR id = ? LIMIT 1',
    [keyParam, keyParam],
  );

  if (!row) {
    return c.json({ error: 'Vault not found' }, 404);
  }

  return c.json({
    id: row.id as string,
    key: (row.key || row.id) as string,
    alias: (row.alias || 'Untitled') as string,
    name: (row.alias || 'Untitled') as string,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  });
});

vaultsRouter.patch('/:key', async (c) => {
  const { db } = getContextStorage(c);
  const keyParam = c.req.param('key');
  const body = await c.req.json<{ alias?: string; name?: string }>();
  const newAlias = (body.alias || body.name || '').trim();
  if (!newAlias) {
    return c.json({ error: 'New alias cannot be empty' }, 400);
  }

  const now = Date.now();
  await db.run(
    'UPDATE vaults SET alias = ?, updated_at = ? WHERE key = ? OR id = ?',
    [newAlias, now, keyParam, keyParam],
  );

  return c.json({ key: keyParam, alias: newAlias, updatedAt: now });
});

vaultsRouter.delete('/:key', async (c) => {
  const { db } = getContextStorage(c);
  const keyParam = c.req.param('key');
  await db.run(
    'DELETE FROM vaults WHERE key = ? OR id = ?',
    [keyParam, keyParam],
  );

  return c.json({ success: true, key: keyParam });
});
