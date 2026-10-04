import { describe, expect, it } from 'vitest';
import type { EditorGridLayoutDto } from '../core/domain/editor-grid.dto';
import { closeFileInGroupHelper, splitGroupHelper } from './use-editor-grid';

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
});
