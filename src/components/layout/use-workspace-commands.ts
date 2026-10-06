import { useCallback } from 'react';
import type { TabDropPosition } from '../../core/domain/tab-drag.dto';
import type { useActiveWorkspace } from '../../hooks/use-active-workspace';
import type { useEditorGrid } from '../../hooks/use-editor-grid';
import { useWikilinkNavigation } from './use-wikilink-navigation';

type ActiveWorkspace = ReturnType<typeof useActiveWorkspace>;
type EditorGrid = ReturnType<typeof useEditorGrid>;

interface UseWorkspaceCommandsOptions {
  workspace: ActiveWorkspace;
  grid: EditorGrid;
  setViewMode: (mode: 'edit' | 'preview') => void;
}

/**
 * Single place where the file tree, the tab grid and the view mode are composed
 * into actions. Both hooks own overlapping state (nodes + active file, tab
 * lists), so composing them here keeps every caller from re-deriving the sync
 * rules — the failure mode that previously left props silently unwired.
 */
export function useWorkspaceCommands({ workspace, grid, setViewMode }: UseWorkspaceCommandsOptions) {
  const openFile = useCallback(
    (fileId: string) => {
      workspace.selectFile(fileId);
      grid.openFile(fileId);
    },
    [workspace, grid],
  );

  const navigateWikilink = useWikilinkNavigation(workspace.nodes, openFile);

  /** Tabs live in the grid; the mirrored active id keeps the chrome in sync. */
  const selectTab = useCallback(
    (groupId: string, fileId: string) => {
      grid.selectFile(groupId, fileId);
      workspace.selectFile(fileId);
    },
    [grid, workspace],
  );

  const moveTab = useCallback(
    (groupId: string, sourceFileId: string, targetFileId: string, position: TabDropPosition) => {
      grid.moveTab(groupId, sourceFileId, targetFileId, position);
    },
    [grid],
  );

  const closeTabEverywhere = useCallback(
    (fileId: string) => {
      grid.layout.groups.forEach((group) => {
        if (group.fileIds.includes(fileId)) grid.closeFile(group.id, fileId);
      });
    },
    [grid],
  );

  const createNote = useCallback(async () => {
    setViewMode('edit');
    const created = await workspace.createFile();
    if (created) grid.openFile(created.id);
  }, [setViewMode, workspace, grid]);

  const deleteNode = useCallback(
    async (id: string) => {
      await workspace.deleteNode(id);
      closeTabEverywhere(id);
    },
    [workspace, closeTabEverywhere],
  );

  const deleteNodes = useCallback(
    async (ids: string[]) => {
      await workspace.deleteNodes(ids);
      ids.forEach(closeTabEverywhere);
    },
    [workspace, closeTabEverywhere],
  );

  return { openFile, navigateWikilink, selectTab, moveTab, createNote, deleteNode, deleteNodes };
}
