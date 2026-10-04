import { Hono } from 'hono';
import type { AppContext } from '../bindings';

export const searchRouter = new Hono<AppContext>();

searchRouter.get('/:key/search', async (c) => {
  const db = c.env?.DB;
  if (!db) return c.json({ error: 'DB binding missing' }, 503);

  const vaultKey = c.req.param('key');
  const query = c.req.query('q')?.trim();
  if (!query) {
    return c.json([]);
  }

  try {
    // D1 SQLite FTS5 search
    const ftsQuery = `
      SELECT file_id, snippet(notes_fts, 3, '<b>', '</b>', '...', 16) AS match_snippet
      FROM notes_fts
      WHERE vault_key = ? AND notes_fts MATCH ?
      ORDER BY rank
      LIMIT 30
    `;

    const { results } = await db.prepare(ftsQuery).bind(vaultKey, `"${query}"*`).all();
    return c.json(results || []);
  } catch (err) {
    console.error('FTS5 search error:', err);
    return c.json([]);
  }
});
