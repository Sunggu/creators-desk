import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { calculateTreeSelection } from './tree-selection';

describe('calculateTreeSelection utility', () => {
  const mockNodes: FileNodeDto[] = [
    { id: '1', vaultId: 'v1', parentId: null, name: 'A.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '2', vaultId: 'v1', parentId: null, name: 'B.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '3', vaultId: 'v1', parentId: null, name: 'C.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '4', vaultId: 'v1', parentId: null, name: 'D.md', type: 'file', createdAt: 0, updatedAt: 0 },
  ];

  it('selects single item on normal click', () => {
    const { nextSelectedIds, nextLastSelectedId } = calculateTreeSelection(
      new Set(),
      null,
      mockNodes[1],
      mockNodes,
      { shiftKey: false, ctrlKey: false, metaKey: false },
    );

    expect(nextSelectedIds.size).toBe(1);
    expect(nextSelectedIds.has('2')).toBe(true);
    expect(nextLastSelectedId).toBe('2');
  });

  it('toggles selection with Ctrl/Cmd key', () => {
    const initial = new Set(['1']);
    const step1 = calculateTreeSelection(
      initial,
      '1',
      mockNodes[2],
      mockNodes,
      { shiftKey: false, ctrlKey: true, metaKey: false },
    );

    expect(step1.nextSelectedIds.size).toBe(2);
    expect(step1.nextSelectedIds.has('1')).toBe(true);
    expect(step1.nextSelectedIds.has('3')).toBe(true);

    // Toggle off item 1
    const step2 = calculateTreeSelection(
      step1.nextSelectedIds,
      step1.nextLastSelectedId,
      mockNodes[0],
      mockNodes,
      { shiftKey: false, ctrlKey: true, metaKey: false },
    );
    expect(step2.nextSelectedIds.size).toBe(1);
    expect(step2.nextSelectedIds.has('1')).toBe(false);
    expect(step2.nextSelectedIds.has('3')).toBe(true);
  });

  it('selects range with Shift key', () => {
    const initial = new Set(['1']);
    const res = calculateTreeSelection(
      initial,
      '1',
      mockNodes[2], // from 1 to 3 -> items 1, 2, 3
      mockNodes,
      { shiftKey: true, ctrlKey: false, metaKey: false },
    );

    expect(res.nextSelectedIds.size).toBe(3);
    expect(res.nextSelectedIds.has('1')).toBe(true);
    expect(res.nextSelectedIds.has('2')).toBe(true);
    expect(res.nextSelectedIds.has('3')).toBe(true);
    expect(res.nextSelectedIds.has('4')).toBe(false);
  });
});
