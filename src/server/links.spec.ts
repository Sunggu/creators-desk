import { describe, expect, it } from 'vitest';
import type { NodeConnectionsDto, NodeLinkEdgeDto } from '../core/domain/node-connection.dto';
import { app } from './app';

describe('Server Links API (/api/vaults/:key/links & /api/vaults/:key/files/:id/links)', () => {
  it('indexes wikilinks, resolves graph edges, returns backlinks, and updates targets on rename', async () => {
    // 1. Create a vault
    const vRes = await app.request('/api/vaults', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: 'Graph Vault' }),
    });
    expect(vRes.status).toBe(201);
    const vault = await vRes.json<{ key: string }>();

    // 2. Create NoteA and NoteB
    const aRes = await app.request(`/api/vaults/${vault.key}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'NoteA.md', type: 'file' }),
    });
    expect(aRes.status).toBe(201);
    const noteA = await aRes.json<{ id: string; name: string }>();

    const bRes = await app.request(`/api/vaults/${vault.key}/files`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'NoteB.md', type: 'file' }),
    });
    expect(bRes.status).toBe(201);
    const noteB = await bRes.json<{ id: string; name: string }>();

    // 3. Write [[NoteB]] inside NoteA
    const putRes = await app.request(`/api/vaults/${vault.key}/files/${noteA.id}/content`, {
      method: 'PUT',
      headers: { 'Content-Type': 'text/plain' },
      body: 'Hello world, this is a link to [[NoteB]] and also to [[UncreatedNote]].',
    });
    expect(putRes.status).toBe(200);

    // 4. Query GET /api/vaults/:key/links (entire graph)
    const graphRes = await app.request(`/api/vaults/${vault.key}/links`);
    expect(graphRes.status).toBe(200);
    const graph = await graphRes.json<{
      nodes: Array<{ id: string; name: string }>;
      links: NodeLinkEdgeDto[];
    }>();

    expect(graph.nodes.some((n) => n.id === noteA.id)).toBe(true);
    expect(graph.nodes.some((n) => n.id === noteB.id)).toBe(true);

    const edgeToB = graph.links.find((l) => l.sourceFileId === noteA.id && l.targetName === 'NoteB');
    expect(edgeToB).toBeDefined();
    expect(edgeToB?.targetFileId).toBe(noteB.id);

    const edgeToUncreated = graph.links.find((l) => l.targetName === 'UncreatedNote');
    expect(edgeToUncreated).toBeDefined();
    expect(edgeToUncreated?.targetFileId).toBeNull();

    // 5. Query GET /api/vaults/:key/files/:noteBId/links (backlinks for NoteB)
    const bLinksRes = await app.request(`/api/vaults/${vault.key}/files/${noteB.id}/links`);
    expect(bLinksRes.status).toBe(200);
    const bLinks = await bLinksRes.json<NodeConnectionsDto>();

    expect(bLinks.outgoing).toHaveLength(0);
    expect(bLinks.backlinks).toHaveLength(1);
    expect(bLinks.backlinks[0].sourceFileId).toBe(noteA.id);
    expect(bLinks.backlinks[0].sourceFileName).toBe('NoteA.md');

    // 6. Query GET /api/vaults/:key/files/:noteAId/links (outgoing for NoteA)
    const aLinksRes = await app.request(`/api/vaults/${vault.key}/files/${noteA.id}/links`);
    expect(aLinksRes.status).toBe(200);
    const aLinks = await aLinksRes.json<NodeConnectionsDto>();
    expect(aLinks.outgoing.length).toBeGreaterThanOrEqual(2);
    expect(aLinks.outgoing.some((l) => l.targetName === 'NoteB' && l.targetFileId === noteB.id)).toBe(true);

    // 7. Rename NoteB.md to NoteC.md via PATCH
    const renameRes = await app.request(`/api/vaults/${vault.key}/files/${noteB.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'NoteC.md' }),
    });
    expect(renameRes.status).toBe(200);

    // 8. Verify links table updated target_file_name from NoteB to NoteC
    const updatedGraphRes = await app.request(`/api/vaults/${vault.key}/links`);
    const updatedGraph = await updatedGraphRes.json<{ links: NodeLinkEdgeDto[] }>();
    const updatedEdge = updatedGraph.links.find((l) => l.sourceFileId === noteA.id && l.targetName === 'NoteC');
    expect(updatedEdge).toBeDefined();
    expect(updatedEdge?.targetFileId).toBe(noteB.id);

    // NoteC now receives the backlink
    const cLinksRes = await app.request(`/api/vaults/${vault.key}/files/${noteB.id}/links`);
    const cLinks = await cLinksRes.json<NodeConnectionsDto>();
    expect(cLinks.backlinks.some((l) => l.sourceFileId === noteA.id)).toBe(true);
  });
});
