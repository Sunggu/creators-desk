import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { computeNodeConnections } from './compute-node-connections';

const mockFile = (id: string, name: string, content = '', type: 'file' | 'folder' = 'file'): FileNodeDto => ({
  id,
  vaultId: 'vlt-1',
  parentId: null,
  name,
  type,
  content,
  createdAt: 1000,
  updatedAt: 1000,
});

describe('computeNodeConnections', () => {
  it('returns empty collections when activeFile is null', () => {
    const res = computeNodeConnections(null, []);
    expect(res).toEqual({ outgoing: [], backlinks: [] });
  });

  it('computes outgoing links and resolves existing vs uncreated targets', () => {
    const fileA = mockFile('1', 'Project.md', 'See [[Architecture]] and [[UnknownIdea]].');
    const fileB = mockFile('2', 'Architecture.md', 'System design.');
    const nodes = [fileA, fileB];

    const res = computeNodeConnections(fileA, nodes);

    expect(res.outgoing).toHaveLength(2);
    expect(res.outgoing[0]).toEqual({
      sourceFileId: '1',
      sourceFileName: 'Project.md',
      targetName: 'Architecture',
      targetFileId: '2',
    });
    expect(res.outgoing[1]).toEqual({
      sourceFileId: '1',
      sourceFileName: 'Project.md',
      targetName: 'UnknownIdea',
      targetFileId: null,
    });
    expect(res.backlinks).toHaveLength(0);
  });

  it('computes backlinks when other documents link to the active file', () => {
    const targetFile = mockFile('1', 'Concept.md', '# Concept');
    const sourceA = mockFile('2', 'Alpha.md', 'Mentioning [[Concept]] here.');
    const sourceB = mockFile('3', 'Beta.md', 'Reference to [[concept.md|Alias]] also.');
    const sourceC = mockFile('4', 'Gamma.md', 'Unrelated content.');
    const folder = mockFile('5', 'Notes', '', 'folder');
    const nodes = [targetFile, sourceA, sourceB, sourceC, folder];

    const res = computeNodeConnections(targetFile, nodes);

    expect(res.backlinks).toHaveLength(2);
    expect(res.backlinks.some((b) => b.sourceFileId === '2' && b.sourceFileName === 'Alpha.md')).toBe(true);
    expect(res.backlinks.some((b) => b.sourceFileId === '3' && b.sourceFileName === 'Beta.md')).toBe(true);
  });

  it('ignores self-links in backlinks', () => {
    const file = mockFile('1', 'Loop.md', 'I link to [[Loop]] myself.');
    const res = computeNodeConnections(file, [file]);
    expect(res.backlinks).toHaveLength(0);
    expect(res.outgoing).toHaveLength(1);
    expect(res.outgoing[0].targetFileId).toBe('1');
  });
});
