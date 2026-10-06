import type { SplitDirection } from '../../core/domain/editor-grid.dto';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';

/** Callbacks the grid owns: every one of them is scoped to a group id. */
export interface EditorGridGroupHandlers {
  onSelectTab: (groupId: string, fileId: string) => void;
  onCloseTab: (groupId: string, fileId: string) => void;
  onCloseOtherTabs?: (groupId: string, fileId: string) => void;
  onMoveTab?: (groupId: string, sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
  onSplit: (groupId: string, fileId: string, direction: SplitDirection) => void;
  onCloseGroup: (groupId: string) => void;
}

/** The same callbacks with the group id already bound — what a single pane needs. */
export interface EditorPaneHandlers {
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  onCloseOtherTabs?: (fileId: string) => void;
  onMoveTab?: (sourceFileId: string, targetFileId: string, position: TabDropPosition) => void;
  onSplit: (fileId: string, direction: SplitDirection) => void;
  onCloseGroup: () => void;
}

/**
 * Binds a group id into every grid-level callback exactly once.
 *
 * Previously each pane re-wrote this whole block inline, so adding a callback
 * meant editing every pane and props were silently dropped. Binding it in one
 * pure, testable place keeps new features wired by construction.
 */
export function bindEditorPaneHandlers(
  groupId: string,
  handlers: EditorGridGroupHandlers,
): EditorPaneHandlers {
  return {
    onSelectTab: (fileId) => handlers.onSelectTab(groupId, fileId),
    onCloseTab: (fileId) => handlers.onCloseTab(groupId, fileId),
    onCloseOtherTabs: handlers.onCloseOtherTabs
      ? (fileId) => handlers.onCloseOtherTabs?.(groupId, fileId)
      : undefined,
    onMoveTab: handlers.onMoveTab
      ? (sourceFileId, targetFileId, position) =>
          handlers.onMoveTab?.(groupId, sourceFileId, targetFileId, position)
      : undefined,
    onSplit: (fileId, direction) => handlers.onSplit(groupId, fileId, direction),
    onCloseGroup: () => handlers.onCloseGroup(groupId),
  };
}
