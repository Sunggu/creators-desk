import { describe, expect, it } from 'vitest';
import type { EditorGridLayoutDto } from '../core/domain/editor-grid.dto';
import {
  closeFileInGroupHelper,
  closeOtherFilesInGroupHelper,
  reorderTabsHelper,
  setGroupViewModeHelper,
  splitGroupHelper,
} from './use-editor-grid';

describe('useEditorGrid pure helpers', () => {
  const initialLayout: EditorGridLayoutDto = {
    direction: 'horizontal',
    groups: [{ id: 'group-main', fileIds: ['file-1', 'file-2'], activeFileId: 'file-1' }],
    splitRatio: 0.5,
  };

  it('splits group horizontally and creates second group with the file', () => {
    const split = splitGroupHelper(initialLayout, 'group-main', 'file-2', 'horizontal');
    expect(split.groups).toHaveLength(2);
    expect(split.direction).toBe('horizontal');
    expect(split.groups[1].fileIds).toContain('file-2');
    expect(split.groups[1].activeFileId).toBe('file-2');
  });

  it('splits group vertically', () => {
    const split = splitGroupHelper(initialLayout, 'group-main', 'file-2', 'vertical');
    expect(split.groups).toHaveLength(2);
    expect(split.direction).toBe('vertical');
  });

  it('splits up to MAX_SPLIT_GROUPS and reuses existing group when at limit', () => {
    let layout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [{ id: 'g1', fileIds: ['f1'], activeFileId: 'f1' }],
      splitRatio: 0.5,
    };
    layout = splitGroupHelper(layout, 'g1', 'f2', 'horizontal');
    layout = splitGroupHelper(layout, 'g1', 'f3', 'vertical');
    layout = splitGroupHelper(layout, 'g1', 'f4', 'horizontal');
    layout = splitGroupHelper(layout, 'g1', 'f5', 'vertical');
    layout = splitGroupHelper(layout, 'g1', 'f6', 'horizontal');
    expect(layout.groups).toHaveLength(6);

    const atMax = splitGroupHelper(layout, 'g1', 'f7', 'horizontal');
    expect(atMax.groups).toHaveLength(6);
    expect(atMax.groups[1].fileIds).toContain('f7');
  });

  it('preserves 3-column horizontal layout when splitting one column vertically into rows', () => {
    let layout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [{ id: 'col-1', fileIds: ['f1'], activeFileId: 'f1' }],
      splitRatio: 0.5,
    };
    layout = splitGroupHelper(layout, 'col-1', 'f2', 'horizontal');
    const col2Id = layout.groups[1].id;
    layout = splitGroupHelper(layout, col2Id, 'f3', 'horizontal');
    expect(layout.groups).toHaveLength(3);
    expect(layout.direction).toBe('horizontal');

    // Split middle column vertically (into rows)
    const afterRowSplit = splitGroupHelper(layout, col2Id, 'f4', 'vertical');
    expect(afterRowSplit.groups).toHaveLength(4);
    // Root direction MUST remain horizontal (columns must not collapse into rows)
    expect(afterRowSplit.direction).toBe('horizontal');
    expect(afterRowSplit.root?.type).toBe('split');
    if (afterRowSplit.root?.type === 'split') {
      expect(afterRowSplit.root.direction).toBe('horizontal');
      expect(afterRowSplit.root.children).toHaveLength(3);
      const middleChild = afterRowSplit.root.children[1];
      expect(middleChild.type).toBe('split');
      if (middleChild.type === 'split') {
        expect(middleChild.direction).toBe('vertical');
        expect(middleChild.children).toHaveLength(2);
      }
    }
  });


  it('collapses split group when all its files are closed', () => {
    const split = splitGroupHelper(initialLayout, 'group-main', 'file-2', 'horizontal');
    const secondGroupId = split.groups[1].id;

    const afterClose = closeFileInGroupHelper(split, secondGroupId, 'file-2');
    expect(afterClose.groups).toHaveLength(1);
    expect(afterClose.groups[0].id).toBe('group-main');
  });

  it('closes all other files in group keeping target file', () => {
    const threeFilesLayout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [{ id: 'group-main', fileIds: ['file-1', 'file-2', 'file-3'], activeFileId: 'file-1' }],
      splitRatio: 0.5,
    };
    const result = closeOtherFilesInGroupHelper(threeFilesLayout, 'group-main', 'file-2');
    expect(result.groups[0].fileIds).toEqual(['file-2']);
    expect(result.groups[0].activeFileId).toBe('file-2');
  });

  it('sets group viewMode independently', () => {
    const layout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [
        { id: 'g1', fileIds: ['f1'], activeFileId: 'f1' },
        { id: 'g2', fileIds: ['f2'], activeFileId: 'f2' },
      ],
      splitRatio: 0.5,
    };
    const updated = setGroupViewModeHelper(layout, 'g2', 'preview');
    expect(updated.groups[0].viewMode).toBeUndefined();
    expect(updated.groups[1].viewMode).toBe('preview');
  });
});

describe('reorderTabsHelper', () => {
  const threeFilesLayout: EditorGridLayoutDto = {
    direction: 'horizontal',
    groups: [{ id: 'group-main', fileIds: ['file-1', 'file-2', 'file-3'], activeFileId: 'file-1' }],
    splitRatio: 0.5,
  };

  it('moves a tab forward before the drop target', () => {
    const result = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-1', 'file-3', 'before');
    expect(result.groups[0].fileIds).toEqual(['file-2', 'file-1', 'file-3']);
  });

  it('moves a tab backward after the drop target', () => {
    const result = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-3', 'file-1', 'after');
    expect(result.groups[0].fileIds).toEqual(['file-1', 'file-3', 'file-2']);
  });

  it('handles adjacent swaps in both directions', () => {
    expect(reorderTabsHelper(threeFilesLayout, 'group-main', 'file-2', 'file-3', 'before').groups[0].fileIds).toEqual(['file-1', 'file-2', 'file-3']);
    expect(reorderTabsHelper(threeFilesLayout, 'group-main', 'file-2', 'file-1', 'before').groups[0].fileIds).toEqual(['file-2', 'file-1', 'file-3']);
  });

  it('keeps the active tab selected after reordering', () => {
    const result = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-1', 'file-3', 'after');
    expect(result.groups[0].activeFileId).toBe('file-1');
  });

  it('is a no-op when the source equals the target', () => {
    const result = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-1', 'file-1', 'after');
    expect(result.groups[0].fileIds).toEqual(['file-1', 'file-2', 'file-3']);
  });

  it('is a no-op when the source or target is not in the group', () => {
    const unknownSource = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-x', 'file-2', 'before');
    const unknownTarget = reorderTabsHelper(threeFilesLayout, 'group-main', 'file-1', 'file-x', 'before');
    expect(unknownSource.groups[0].fileIds).toEqual(['file-1', 'file-2', 'file-3']);
    expect(unknownTarget.groups[0].fileIds).toEqual(['file-1', 'file-2', 'file-3']);
  });

  it('leaves other groups untouched', () => {
    const split = splitGroupHelper(threeFilesLayout, 'group-main', 'file-3', 'horizontal');
    const result = reorderTabsHelper(split, split.groups[0].id, 'file-1', 'file-3', 'before');
    expect(result.groups[0].fileIds).toEqual(['file-2', 'file-1', 'file-3']);
    expect(result.groups[1].fileIds).toEqual(['file-3']);
  });

  it('moves a tab across panes before or after the target tab', () => {
    const twoPanesLayout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [
        { id: 'group-1', fileIds: ['file-1', 'file-2'], activeFileId: 'file-1' },
        { id: 'group-2', fileIds: ['file-3', 'file-4'], activeFileId: 'file-3' },
      ],
      splitRatio: 0.5,
    };
    const moved = reorderTabsHelper(twoPanesLayout, 'group-2', 'file-1', 'file-4', 'before');
    expect(moved.groups[0].fileIds).toEqual(['file-2']);
    expect(moved.groups[0].activeFileId).toBe('file-2');
    expect(moved.groups[1].fileIds).toEqual(['file-3', 'file-1', 'file-4']);
    expect(moved.groups[1].activeFileId).toBe('file-1');
  });

  it('collapses the source group when its last tab is moved across panes', () => {
    const twoPanesLayout: EditorGridLayoutDto = {
      direction: 'horizontal',
      groups: [
        { id: 'group-1', fileIds: ['file-1'], activeFileId: 'file-1' },
        { id: 'group-2', fileIds: ['file-2'], activeFileId: 'file-2' },
      ],
      splitRatio: 0.5,
    };
    const moved = reorderTabsHelper(twoPanesLayout, 'group-2', 'file-1', 'file-2', 'after');
    expect(moved.groups).toHaveLength(1);
    expect(moved.groups[0].id).toBe('group-2');
    expect(moved.groups[0].fileIds).toEqual(['file-2', 'file-1']);
    expect(moved.groups[0].activeFileId).toBe('file-1');
  });
});
