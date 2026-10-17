import { describe, expect, it } from 'vitest';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import {
  flattenVisibleTree,
  getAncestorFolderIds,
  isDescendantOrSelf,
  sortFileNodes,
} from './file-tree-nav';

const makeNode = (
  id: string,
  name: string,
  type: 'file' | 'folder',
  parentId: string | null = null,
): FileNodeDto => ({
  id,
  name,
  type,
  parentId,
  vaultId: 'v1',
  createdAt: 100,
  updatedAt: 100,
});

describe('file-tree-nav utilities', () => {
  describe('sortFileNodes', () => {
    it('places folders before files and sorts by natural numeric order', () => {
      const nodes: FileNodeDto[] = [
        makeNode('1', 'file-10.md', 'file'),
        makeNode('2', 'Folder B', 'folder'),
        makeNode('3', 'file-2.md', 'file'),
        makeNode('4', 'Folder A', 'folder'),
        makeNode('5', 'file-1.md', 'file'),
      ];

      const sorted = sortFileNodes(nodes);
      expect(sorted.map((n) => n.id)).toEqual(['4', '2', '5', '3', '1']);
    });

    it('performs case-insensitive comparison and does not mutate input', () => {
      const nodes: FileNodeDto[] = [
        makeNode('1', 'beta.md', 'file'),
        makeNode('2', 'Alpha.md', 'file'),
      ];
      const sorted = sortFileNodes(nodes);
      expect(sorted.map((n) => n.name)).toEqual(['Alpha.md', 'beta.md']);
      expect(nodes[0].name).toBe('beta.md');
    });
  });

  describe('flattenVisibleTree', () => {
    it('returns empty array when given no nodes', () => {
      expect(flattenVisibleTree([], new Set())).toEqual([]);
    });

    it('flattens root nodes with collapsed and expanded folders', () => {
      const nodes: FileNodeDto[] = [
        makeNode('f1', 'Doc.md', 'file', null),
        makeNode('d1', 'Folder 1', 'folder', null),
        makeNode('d1_c1', 'Child 1.md', 'file', 'd1'),
        makeNode('d1_d2', 'Subfolder', 'folder', 'd1'),
        makeNode('d1_d2_c1', 'Deep.md', 'file', 'd1_d2'),
        makeNode('d2', 'Folder 2', 'folder', null),
        makeNode('d2_c1', 'Hidden.md', 'file', 'd2'),
      ];

      // Case 1: All collapsed
      const collapsed = flattenVisibleTree(nodes, new Set());
      expect(collapsed.map((n) => n.id)).toEqual(['d1', 'd2', 'f1']);

      // Case 2: d1 expanded, d1_d2 collapsed, d2 collapsed
      const expandedD1 = flattenVisibleTree(nodes, new Set(['d1']));
      expect(expandedD1.map((n) => n.id)).toEqual(['d1', 'd1_d2', 'd1_c1', 'd2', 'f1']);

      // Case 3: d1 and d1_d2 expanded
      const expandedDeep = flattenVisibleTree(nodes, new Set(['d1', 'd1_d2']));
      expect(expandedDeep.map((n) => n.id)).toEqual([
        'd1',
        'd1_d2',
        'd1_d2_c1',
        'd1_c1',
        'd2',
        'f1',
      ]);
    });

    it('guards against infinite loops caused by cyclic references', () => {
      const cyclicNodes: FileNodeDto[] = [
        makeNode('c1', 'Cycle 1', 'folder', null),
        makeNode('c2', 'Cycle 2', 'folder', 'c1'),
      ];
      cyclicNodes[0].parentId = 'c2';

      const result = flattenVisibleTree(cyclicNodes, new Set(['c1', 'c2']));
      expect(result).toHaveLength(0);
    });
  });

  describe('getAncestorFolderIds', () => {
    const nodes: FileNodeDto[] = [
      makeNode('root_folder', 'Root Folder', 'folder', null),
      makeNode('sub_folder', 'Sub Folder', 'folder', 'root_folder'),
      makeNode('file_in_sub', 'Note.md', 'file', 'sub_folder'),
      makeNode('root_file', 'Root Note.md', 'file', null),
    ];

    it('returns empty array for invalid or root inputs', () => {
      expect(getAncestorFolderIds(nodes, null)).toEqual([]);
      expect(getAncestorFolderIds(nodes, 'non-existent')).toEqual([]);
      expect(getAncestorFolderIds(nodes, 'root_file')).toEqual([]);
      expect(getAncestorFolderIds(nodes, 'root_folder')).toEqual([]);
    });

    it('returns ancestor folder IDs up to root in bottom-up order', () => {
      expect(getAncestorFolderIds(nodes, 'file_in_sub')).toEqual([
        'sub_folder',
        'root_folder',
      ]);
      expect(getAncestorFolderIds(nodes, 'sub_folder')).toEqual(['root_folder']);
    });

    it('guards against cycles in parent hierarchy', () => {
      const cyclic: FileNodeDto[] = [
        makeNode('n1', 'Node 1', 'folder', 'n2'),
        makeNode('n2', 'Node 2', 'folder', 'n1'),
      ];
      expect(getAncestorFolderIds(cyclic, 'n1')).toEqual(['n2']);
    });
  });

  describe('isDescendantOrSelf', () => {
    const nodes: FileNodeDto[] = [
      makeNode('parent', 'Parent', 'folder', null),
      makeNode('child', 'Child', 'folder', 'parent'),
      makeNode('grandchild', 'Grandchild', 'folder', 'child'),
      makeNode('other', 'Other', 'folder', null),
    ];

    it('returns false for null target', () => {
      expect(isDescendantOrSelf(nodes, 'parent', null)).toBe(false);
    });

    it('returns true when source and target are the same node', () => {
      expect(isDescendantOrSelf(nodes, 'parent', 'parent')).toBe(true);
    });

    it('returns true when target is a child or grandchild of source', () => {
      expect(isDescendantOrSelf(nodes, 'parent', 'child')).toBe(true);
      expect(isDescendantOrSelf(nodes, 'parent', 'grandchild')).toBe(true);
    });

    it('returns false when target is not a descendant of source', () => {
      expect(isDescendantOrSelf(nodes, 'child', 'parent')).toBe(false);
      expect(isDescendantOrSelf(nodes, 'parent', 'other')).toBe(false);
      expect(isDescendantOrSelf(nodes, 'other', 'grandchild')).toBe(false);
    });

    it('handles cyclic parent references without hanging', () => {
      const cyclic: FileNodeDto[] = [
        makeNode('n1', 'Node 1', 'folder', 'n2'),
        makeNode('n2', 'Node 2', 'folder', 'n1'),
      ];
      expect(isDescendantOrSelf(cyclic, 'n1', 'n2')).toBe(true);
      expect(isDescendantOrSelf(cyclic, 'unknown', 'n2')).toBe(false);
    });
  });
});
