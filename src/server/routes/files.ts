import { Hono } from 'hono';
import { parseWikilinksAndTags } from '../../utils/wikilink-parser';
import type { AppContext } from '../bindings';

export const filesRouter = new Hono<AppContext>();

filesRouter.get('/:key/files', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: 'DB binding missing' }, 503);

  const vaultKey = c.req.param('key');
  const { results } = await db
    .prepare('SELECT id, vault_key, parent_id, name, type, r2_key, size, created_at, updated_at FROM file_nodes WHERE vault_key = ? ORDER BY type DESC, name ASC')
    .bind(vaultKey)
    .all();

  const nodes = (results || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    vaultId: row.vault_key as string,
    parentId: (row.parent_id as string) || null,
    name: row.name as string,
    type: row.type as 'file' | 'folder',
    r2Key: (row.r2_key as string) || null,
    size: (row.size as number) || 0,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  }));

  return c.json(nodes);
});

filesRouter.post('/:key/files', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: 'DB binding missing' }, 503);

  const vaultKey = c.req.param('key');
  const body = await c.req.json<{ name: string; type: 'file' | 'folder'; parentId?: string | null }>();

  const trimmed = body.name?.trim();
  if (!trimmed) return c.json({ error: 'Name cannot be empty' }, 400);

  const finalName = body.type === 'file' && !trimmed.endsWith('.md') ? `${trimmed}.md` : trimmed;
  const now = Date.now();
  const id = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `node-${now}-${Math.random().toString(36).substring(2, 9)}`;

  const r2Key = body.type === 'file' ? `vaults/${vaultKey}/files/${id}.md` : null;

  await db
    .prepare('INSERT INTO file_nodes (id, vault_key, parent_id, name, type, r2_key, size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, vaultKey, body.parentId || null, finalName, body.type, r2Key, 0, now, now)
    .run();

  return c.json({
    id,
    vaultId: vaultKey,
    parentId: body.parentId || null,
    name: finalName,
    type: body.type,
    r2Key,
    size: 0,
    createdAt: now,
    updatedAt: now,
  }, 201);
});

filesRouter.get('/:key/files/:id/content', async (c) => {
  const bucket = c.env?.BUCKET;
  if (!bucket) return c.json({ error: 'R2 Bucket binding missing' }, 503);

  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');
  const r2Key = `vaults/${vaultKey}/files/${fileId}.md`;

  const object = await bucket.get(r2Key);
  if (!object) return c.text('');

  const text = await object.text();
  return c.text(text);
});

filesRouter.put('/:key/files/:id/content', async (c) => {
  const { BUCKET: bucket, DB: db } = c.env || {};
  if (!bucket || !db) return c.json({ error: 'Storage bindings missing' }, 503);

  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');
  const content = await c.req.text();
  const r2Key = `vaults/${vaultKey}/files/${fileId}.md`;

  await bucket.put(r2Key, content, {
    httpMetadata: { contentType: 'text/markdown; charset=utf-8' },
  });

  const now = Date.now();
  const size = new TextEncoder().encode(content).length;

  await db
    .prepare('UPDATE file_nodes SET size = ?, updated_at = ? WHERE id = ?')
    .bind(size, now, fileId)
    .run();

  // Index FTS5 full-text search
  await db.prepare('DELETE FROM notes_fts WHERE file_id = ?').bind(fileId).run();
  await db
    .prepare('INSERT INTO notes_fts (file_id, vault_key, title, content) VALUES (?, ?, ?, ?)')
    .bind(fileId, vaultKey, fileId, content)
    .run();

  // Index Wikilinks & Backlinks
  const { links } = parseWikilinksAndTags(content);
  await db.prepare('DELETE FROM links WHERE source_file_id = ?').bind(fileId).run();
  for (const targetName of links) {
    const linkId = `${fileId}_${targetName}`;
    await db
      .prepare('INSERT INTO links (id, vault_key, source_file_id, target_file_name) VALUES (?, ?, ?, ?)')
      .bind(linkId, vaultKey, fileId, targetName)
      .run();
  }

  return c.json({ success: true, size, updatedAt: now });
});

filesRouter.delete('/:key/files/:id', async (c) => {
  const { BUCKET: bucket, DB: db } = c.env || {};
  if (!db) return c.json({ error: 'DB binding missing' }, 503);

  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');

  await db.prepare('DELETE FROM file_nodes WHERE id = ?').bind(fileId).run();
  await db.prepare('DELETE FROM notes_fts WHERE file_id = ?').bind(fileId).run();
  await db.prepare('DELETE FROM links WHERE source_file_id = ?').bind(fileId).run();

  if (bucket) {
    await bucket.delete(`vaults/${vaultKey}/files/${fileId}.md`);
  }

  return c.json({ success: true, id: fileId });
});
