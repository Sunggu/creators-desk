import { describe, expect, it } from 'vitest';
import type { EditorGridLayoutDto } from '../core/domain/editor-grid.dto';
import { ensureSplitTree, insertSplitIntoTree, pruneSplitTree } from './editor-split-tree';

describe('editor-split-tree', () => {
  it('builds a 3-column horizontal tree and nests a vertical row split inside a column without altering root direction', () => {
    const initial: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [{ id: 'g1', fileIds: ['f1'], activeFileId: 'f1' }],
      splitRatio: 0.5,
    };

    const tree1 = ensureSplitTree(initial);
    // Split g1 horizontally -> [g1, g2]
    const tree2 = insertSplitIntoTree(tree1, 'g1', 'g2', 'horizontal');
    // Split g2 horizontally -> [g1, g2, g3] (3 columns)
    const tree3 = insertSplitIntoTree(tree2, 'g2', 'g3', 'horizontal');

    expect(tree3.type).toBe('split');
    if (tree3.type === 'split') {
      expect(tree3.direction).toBe('horizontal');
      expect(tree3.children).toHaveLength(3);
    }

    // Now split the middle column (g2) vertically (row split) -> g4
    const tree4 = insertSplitIntoTree(tree3, 'g2', 'g4', 'vertical');

    expect(tree4.type).toBe('split');
    if (tree4.type === 'split') {
      // Root must remain horizontal (3 columns)!
      expect(tree4.direction).toBe('horizontal');
      expect(tree4.children).toHaveLength(3);
      expect(tree4.children[0]).toEqual({ type: 'leaf', groupId: 'g1' });
      expect(tree4.children[2]).toEqual({ type: 'leaf', groupId: 'g3' });

      const middleColumn = tree4.children[1];
      expect(middleColumn.type).toBe('split');
      if (middleColumn.type === 'split') {
        expect(middleColumn.direction).toBe('vertical');
        expect(middleColumn.children).toEqual([
          { type: 'leaf', groupId: 'g2' },
          { type: 'leaf', groupId: 'g4' },
        ]);
      }
    }

    // Pruning g4 collapses the nested vertical split back into a leaf
    const pruned = pruneSplitTree(tree4, new Set(['g1', 'g2', 'g3']));
    expect(pruned).toEqual(tree3);
  });
});
