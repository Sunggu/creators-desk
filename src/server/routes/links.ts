import { Hono } from 'hono';
import type { NodeConnectionsDto, NodeLinkEdgeDto } from '../../core/domain/node-connection.dto';
import type { AppContext } from '../bindings';
import { getContextStorage } from '../storage/get-context-storage';

export const linksRouter = new Hono<AppContext>();

interface FileRow {
  id: string;
  name: string;
  type: string;
}

interface LinkRow {
  id: string;
  source_file_id: string;
  target_file_name: string;
  target_file_id: string | null;
}

function normalizeNoteName(name: string): string {
  return name.replace(/\.md$/i, '').trim().toLowerCase();
}

linksRouter.get('/:key/links', async (c) => {
  const { db } = getContextStorage(c);
  const vaultKey = c.req.param('key');

  const files = await db.all<FileRow>(
    'SELECT id, name, type FROM file_nodes WHERE vault_key = ? AND type = ?',
    [vaultKey, 'file'],
  );
  const links = await db.all<LinkRow>(
    'SELECT id, source_file_id, target_file_name, target_file_id FROM links WHERE vault_key = ?',
    [vaultKey],
  );

  const fileById = new Map<string, string>();
  const fileByName = new Map<string, string>();
  for (const f of files) {
    fileById.set(f.id, f.name);
    fileByName.set(normalizeNoteName(f.name), f.id);
  }

  const edges: NodeLinkEdgeDto[] = links.map((l) => ({
    sourceFileId: l.source_file_id,
    sourceFileName: fileById.get(l.source_file_id) ?? '',
    targetName: l.target_file_name,
    targetFileId: fileByName.get(normalizeNoteName(l.target_file_name)) ?? l.target_file_id ?? null,
  }));

  return c.json({
    nodes: files.map((f) => ({ id: f.id, name: f.name })),
    links: edges,
    edges,
  });
});

linksRouter.get('/:key/files/:id/links', async (c) => {
  const { db } = getContextStorage(c);
  const vaultKey = c.req.param('key');
  const fileId = c.req.param('id');

  const files = await db.all<FileRow>(
    'SELECT id, name, type FROM file_nodes WHERE vault_key = ? AND type = ?',
    [vaultKey, 'file'],
  );

  const currentFile = files.find((f) => f.id === fileId);
  if (!currentFile) {
    return c.json({ error: 'File not found' }, 404);
  }

  const links = await db.all<LinkRow>(
    'SELECT id, source_file_id, target_file_name, target_file_id FROM links WHERE vault_key = ?',
    [vaultKey],
  );

  const fileById = new Map<string, string>();
  const fileByName = new Map<string, string>();
  for (const f of files) {
    fileById.set(f.id, f.name);
    fileByName.set(normalizeNoteName(f.name), f.id);
  }

  const currentBase = normalizeNoteName(currentFile.name);

  const outgoing: NodeLinkEdgeDto[] = links
    .filter((l) => l.source_file_id === fileId)
    .map((l) => ({
      sourceFileId: fileId,
      sourceFileName: currentFile.name,
      targetName: l.target_file_name,
      targetFileId: fileByName.get(normalizeNoteName(l.target_file_name)) ?? l.target_file_id ?? null,
    }));

  const backlinks: NodeLinkEdgeDto[] = links
    .filter((l) => {
      const resolvedId = fileByName.get(normalizeNoteName(l.target_file_name)) ?? l.target_file_id;
      return resolvedId === fileId || normalizeNoteName(l.target_file_name) === currentBase;
    })
    .map((l) => ({
      sourceFileId: l.source_file_id,
      sourceFileName: fileById.get(l.source_file_id) ?? '',
      targetName: l.target_file_name,
      targetFileId: fileId,
    }));

  const response: NodeConnectionsDto = { outgoing, backlinks };
  return c.json(response);
});
