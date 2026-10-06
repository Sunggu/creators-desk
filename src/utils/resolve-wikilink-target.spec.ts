import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { resolveWikilinkTarget } from './resolve-wikilink-target';

function file(id: string, name: string, type: FileNodeDto['type'] = 'file'): FileNodeDto {
  return {
    id,
    vaultId: 'v1',
    parentId: null,
    name,
    type,
    createdAt: 0,
    updatedAt: 0,
  };
}

const NODES = [
  file('1', 'Welcome.md'),
  file('2', 'Design Notes.md'),
  file('3', 'Archive', 'folder'),
];

describe('resolveWikilinkTarget', () => {
  it('matches an exact note name without the extension', () => {
    expect(resolveWikilinkTarget(NODES, 'Welcome')?.id).toBe('1');
  });

  it('matches when the link carries the .md suffix', () => {
    expect(resolveWikilinkTarget(NODES, 'Welcome.md')?.id).toBe('1');
  });

  it('matches case-insensitively', () => {
    expect(resolveWikilinkTarget(NODES, 'design notes')?.id).toBe('2');
  });

  it('ignores surrounding whitespace', () => {
    expect(resolveWikilinkTarget(NODES, '  Design Notes  ')?.id).toBe('2');
  });

  it('never resolves to a folder', () => {
    expect(resolveWikilinkTarget(NODES, 'Archive')).toBeNull();
  });

  it('returns null for an unknown or empty target', () => {
    expect(resolveWikilinkTarget(NODES, 'Missing')).toBeNull();
    expect(resolveWikilinkTarget(NODES, '   ')).toBeNull();
    expect(resolveWikilinkTarget([], 'Welcome')).toBeNull();
  });
});
