import { describe, expect, it, vi } from 'vitest';
import type { EditorGridGroupHandlers } from './editor-group-binding';
import { bindEditorPaneHandlers } from './editor-group-binding';

function createHandlers(): EditorGridGroupHandlers {
  return {
    onSelectTab: vi.fn(),
    onCloseTab: vi.fn(),
    onCloseOtherTabs: vi.fn(),
    onMoveTab: vi.fn(),
    onSplit: vi.fn(),
    onCloseGroup: vi.fn(),
  };
}

describe('bindEditorPaneHandlers', () => {
  it('injects the group id into every callback', () => {
    const handlers = createHandlers();
    const bound = bindEditorPaneHandlers('group-2', handlers);

    bound.onSelectTab('file-a');
    bound.onCloseTab('file-b');
    bound.onCloseOtherTabs?.('file-c');
    bound.onMoveTab?.('file-a', 'file-b', 'before');
    bound.onSplit('file-a', 'horizontal');
    bound.onCloseGroup();

    expect(handlers.onSelectTab).toHaveBeenCalledWith('group-2', 'file-a');
    expect(handlers.onCloseTab).toHaveBeenCalledWith('group-2', 'file-b');
    expect(handlers.onCloseOtherTabs).toHaveBeenCalledWith('group-2', 'file-c');
    expect(handlers.onMoveTab).toHaveBeenCalledWith('group-2', 'file-a', 'file-b', 'before');
    expect(handlers.onSplit).toHaveBeenCalledWith('group-2', 'file-a', 'horizontal');
    expect(handlers.onCloseGroup).toHaveBeenCalledWith('group-2');
  });

  it('keeps two panes fully independent', () => {
    const handlers = createHandlers();
    const left = bindEditorPaneHandlers('group-left', handlers);
    const right = bindEditorPaneHandlers('group-right', handlers);

    left.onSelectTab('file-a');
    right.onSelectTab('file-b');

    expect(handlers.onSelectTab).toHaveBeenNthCalledWith(1, 'group-left', 'file-a');
    expect(handlers.onSelectTab).toHaveBeenNthCalledWith(2, 'group-right', 'file-b');
  });

  it('omits optional callbacks when the grid does not provide them', () => {
    const bound = bindEditorPaneHandlers('group-1', {
      onSelectTab: vi.fn(),
      onCloseTab: vi.fn(),
      onSplit: vi.fn(),
      onCloseGroup: vi.fn(),
    });

    expect(bound.onCloseOtherTabs).toBeUndefined();
    expect(bound.onMoveTab).toBeUndefined();
  });
});
