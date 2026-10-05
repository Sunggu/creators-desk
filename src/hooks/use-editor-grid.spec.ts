import { describe, expect, it } from 'vitest';
import type { EditorGridLayoutDto } from '../core/domain/editor-grid.dto';
import {
  closeFileInGroupHelper,
  closeOtherFilesInGroupHelper,
  reorderTabsHelper,
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
    expect(reorderTabsHelper(threeFilesLayout, 'group-main', 'file-2', 'file-3', 'before').groups[0].fileIds).toEqual([
      'file-1',
      'file-2',
      'file-3',
    ]);
    expect(reorderTabsHelper(threeFilesLayout, 'group-main', 'file-2', 'file-1', 'before').groups[0].fileIds).toEqual([
      'file-2',
      'file-1',
      'file-3',
    ]);
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
});
