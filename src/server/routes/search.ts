import { Hono } from 'hono';
import type { AppContext } from '../bindings';
import { getContextStorage } from '../storage/get-context-storage';

export const searchRouter = new Hono<AppContext>();

searchRouter.get('/:key/search', async (c) => {
  const { db } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const query = c.req.query('q')?.trim();
  if (!query) {
    return c.json([]);
  }

  try {
    const ftsQuery = `
      SELECT file_id, snippet(notes_fts, 3, '<b>', '</b>', '...', 16) AS match_snippet
      FROM notes_fts
      WHERE vault_key = ? AND notes_fts MATCH ?
      ORDER BY rank
      LIMIT 30
    `;

    const results = await db.all(ftsQuery, [vaultKey, `"${query}"*`]);
    return c.json(results || []);
  } catch (err) {
    console.error('FTS5 search error:', err);
    return c.json([]);
  }
});
