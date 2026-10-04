import { Hono } from 'hono';
import { parseWikilinksAndTags } from '../../utils/wikilink-parser';
import type { AppContext } from '../bindings';
import { getContextStorage } from '../storage/get-context-storage';

export const filesRouter = new Hono<AppContext>();

filesRouter.get('/:key/files', async (c) => {
  const { db } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const results = await db.all(
    'SELECT id, vault_key, parent_id, name, type, r2_key, size, created_at, updated_at FROM file_nodes WHERE vault_key = ? ORDER BY type DESC, name ASC',
    [vaultKey],
  );

  const nodes = results.map((row) => ({
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
  const { db } = getContextStorage(c);
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

  await db.run(
    'INSERT INTO file_nodes (id, vault_key, parent_id, name, type, r2_key, size, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, vaultKey, body.parentId || null, finalName, body.type, r2Key, 0, now, now],
  );

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
  const { storage } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');
  const r2Key = `vaults/${vaultKey}/files/${fileId}.md`;

  const text = await storage.get(r2Key);
  return c.text(text ?? '');
});

filesRouter.put('/:key/files/:id/content', async (c) => {
  const { db, storage } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');
  const content = await c.req.text();
  const r2Key = `vaults/${vaultKey}/files/${fileId}.md`;

  await storage.put(r2Key, content);

  const now = Date.now();
  const size = new TextEncoder().encode(content).length;

  await db.run('UPDATE file_nodes SET size = ?, updated_at = ? WHERE id = ?', [size, now, fileId]);

  // Index FTS5 full-text search
  await db.run('DELETE FROM notes_fts WHERE file_id = ?', [fileId]);
  await db.run(
    'INSERT INTO notes_fts (file_id, vault_key, title, content) VALUES (?, ?, ?, ?)',
    [fileId, vaultKey, fileId, content],
  );

  // Index Wikilinks & Backlinks
  const { links } = parseWikilinksAndTags(content);
  await db.run('DELETE FROM links WHERE source_file_id = ?', [fileId]);
  for (const targetName of links) {
    const linkId = `${fileId}_${targetName}`;
    await db.run(
      'INSERT INTO links (id, vault_key, source_file_id, target_file_name) VALUES (?, ?, ?, ?)',
      [linkId, vaultKey, fileId, targetName],
    );
  }

  return c.json({ success: true, size, updatedAt: now });
});

filesRouter.delete('/:key/files/:id', async (c) => {
  const { db, storage } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');

  await db.run('DELETE FROM file_nodes WHERE id = ?', [fileId]);
  await db.run('DELETE FROM notes_fts WHERE file_id = ?', [fileId]);
  await db.run('DELETE FROM links WHERE source_file_id = ?', [fileId]);
  await storage.delete(`vaults/${vaultKey}/files/${fileId}.md`);

  return c.json({ success: true, id: fileId });
});
