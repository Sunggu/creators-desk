import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { calculateTreeSelection, pruneStaleSelection } from './tree-selection';

describe('calculateTreeSelection utility', () => {
  const mockNodes: FileNodeDto[] = [
    { id: '1', vaultId: 'v1', parentId: null, name: 'A.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '2', vaultId: 'v1', parentId: null, name: 'B.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '3', vaultId: 'v1', parentId: null, name: 'C.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '4', vaultId: 'v1', parentId: null, name: 'D.md', type: 'file', createdAt: 0, updatedAt: 0 },
  ];

  it('clears multi-selection on normal click while setting anchor', () => {
    const { nextSelectedIds, nextLastSelectedId } = calculateTreeSelection(
      new Set(['1', '3']),
      null,
      mockNodes[1],
      mockNodes,
      { shiftKey: false, ctrlKey: false, metaKey: false },
    );

    expect(nextSelectedIds.size).toBe(0);
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

    // Toggle off item 1 with metaKey
    const step2 = calculateTreeSelection(
      step1.nextSelectedIds,
      step1.nextLastSelectedId,
      mockNodes[0],
      mockNodes,
      { shiftKey: false, ctrlKey: false, metaKey: true },
    );
    expect(step2.nextSelectedIds.size).toBe(1);
    expect(step2.nextSelectedIds.has('1')).toBe(false);
    expect(step2.nextSelectedIds.has('3')).toBe(true);
  });

  it('selects range with Shift key using anchor from previous normal click', () => {
    const anchorRes = calculateTreeSelection(
      new Set(),
      null,
      mockNodes[0],
      mockNodes,
      { shiftKey: false, ctrlKey: false, metaKey: false },
    );
    expect(anchorRes.nextLastSelectedId).toBe('1');
    expect(anchorRes.nextSelectedIds.size).toBe(0);

    const rangeRes = calculateTreeSelection(
      anchorRes.nextSelectedIds,
      anchorRes.nextLastSelectedId,
      mockNodes[2],
      mockNodes,
      { shiftKey: true, ctrlKey: false, metaKey: false },
    );

    expect(rangeRes.nextSelectedIds.size).toBe(3);
    expect(rangeRes.nextSelectedIds.has('1')).toBe(true);
    expect(rangeRes.nextSelectedIds.has('2')).toBe(true);
    expect(rangeRes.nextSelectedIds.has('3')).toBe(true);
    expect(rangeRes.nextSelectedIds.has('4')).toBe(false);
    expect(rangeRes.nextLastSelectedId).toBe('3');
  });

  it('handles reverse range selection with Shift key', () => {
    const res = calculateTreeSelection(
      new Set(),
      '3',
      mockNodes[0],
      mockNodes,
      { shiftKey: true, ctrlKey: false, metaKey: false },
    );

    expect(res.nextSelectedIds.size).toBe(3);
    expect(res.nextSelectedIds.has('1')).toBe(true);
    expect(res.nextSelectedIds.has('2')).toBe(true);
    expect(res.nextSelectedIds.has('3')).toBe(true);
    expect(res.nextLastSelectedId).toBe('1');
  });
});

describe('pruneStaleSelection utility', () => {
  const validNodes: FileNodeDto[] = [
    { id: '1', vaultId: 'v1', parentId: null, name: 'A.md', type: 'file', createdAt: 0, updatedAt: 0 },
    { id: '2', vaultId: 'v1', parentId: null, name: 'B.md', type: 'file', createdAt: 0, updatedAt: 0 },
  ];

  it('returns empty set if selectedIds is empty', () => {
    expect(pruneStaleSelection(new Set(), validNodes)).toEqual(new Set());
  });

  it('removes deleted IDs and keeps existing IDs', () => {
    const selected = new Set(['1', 'stale-id-1', '2', 'stale-id-2']);
    const pruned = pruneStaleSelection(selected, validNodes);
    expect(Array.from(pruned).sort()).toEqual(['1', '2']);
  });
});
