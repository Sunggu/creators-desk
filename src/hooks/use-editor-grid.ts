import { useCallback, useState } from 'react';
import type { EditorGroupDto, EditorGridLayoutDto, SplitDirection } from '../core/domain/editor-grid.dto';
import type { TabDropPosition } from '../core/domain/tab-drag.dto';
import { ensureSplitTree, insertSplitIntoTree, pruneSplitTree } from '../utils/editor-split-tree';

export const MAX_SPLIT_GROUPS = 6;

const DEFAULT_GRID_LAYOUT: EditorGridLayoutDto = {
  direction: 'horizontal',
  groups: [{ id: 'group-main', fileIds: [], activeFileId: null }],
  splitRatio: 0.5,
};

function syncTreeWithGroups(layout: EditorGridLayoutDto, groups: EditorGroupDto[]): EditorGridLayoutDto {
  const validIds = new Set(groups.map((g) => g.id));
  const nextRoot = pruneSplitTree(layout.root, validIds);
  const nextDirection = nextRoot?.type === 'split' ? nextRoot.direction : layout.direction;
  return { ...layout, direction: nextDirection, groups, root: nextRoot };
}

export function splitGroupHelper(
  layout: EditorGridLayoutDto,
  sourceGroupId: string,
  fileId: string,
  direction: SplitDirection
): EditorGridLayoutDto {
  if (!fileId) return layout;
  const newGroupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const newGroup: EditorGroupDto = {
    id: newGroupId,
    fileIds: [fileId],
    activeFileId: fileId,
  };

  if (layout.groups.length >= MAX_SPLIT_GROUPS) {
    const targetGroup = layout.groups.find((g) => g.id !== sourceGroupId) || layout.groups[1];
    const fileIds = targetGroup.fileIds.includes(fileId) ? targetGroup.fileIds : [...targetGroup.fileIds, fileId];
    return {
      ...layout,
      groups: layout.groups.map((g) => (g.id === targetGroup.id ? { ...g, fileIds, activeFileId: fileId } : g)),
    };
  }

  const currentTree = ensureSplitTree(layout);
  const nextRoot = insertSplitIntoTree(currentTree, sourceGroupId, newGroupId, direction);
  const rootDirection = nextRoot.type === 'split' ? nextRoot.direction : direction;

  return {
    ...layout,
    direction: rootDirection,
    groups: [...layout.groups, newGroup],
    splitRatio: layout.groups.length === 1 ? 0.5 : layout.splitRatio,
    root: nextRoot,
  };
}

export function closeFileInGroupHelper(layout: EditorGridLayoutDto, groupId: string, fileId: string): EditorGridLayoutDto {
  const updatedGroups = layout.groups.map((group) => {
    if (group.id !== groupId) return group;
    const fileIds = group.fileIds.filter((id) => id !== fileId);
    const activeFileId = group.activeFileId === fileId ? fileIds[fileIds.length - 1] ?? null : group.activeFileId;
    return { ...group, fileIds, activeFileId };
  });

  if (updatedGroups.length > 1 && updatedGroups.find((g) => g.id === groupId)?.fileIds.length === 0) {
    return syncTreeWithGroups(layout, updatedGroups.filter((g) => g.id !== groupId));
  }
  return { ...layout, groups: updatedGroups };
}

export function closeOtherFilesInGroupHelper(layout: EditorGridLayoutDto, groupId: string, keepFileId: string): EditorGridLayoutDto {
  return {
    ...layout,
    groups: layout.groups.map((g) => (g.id === groupId ? { ...g, fileIds: [keepFileId], activeFileId: keepFileId } : g)),
  };
}

export function setGroupViewModeHelper(layout: EditorGridLayoutDto, groupId: string, viewMode: 'edit' | 'preview'): EditorGridLayoutDto {
  return {
    ...layout,
    groups: layout.groups.map((g) => (g.id === groupId ? { ...g, viewMode } : g)),
  };
}

export function reorderTabsHelper(
  layout: EditorGridLayoutDto,
  groupId: string,
  sourceFileId: string,
  targetFileId: string,
  position: TabDropPosition
): EditorGridLayoutDto {
  if (sourceFileId === targetFileId) return layout;
  const targetGroup = layout.groups.find((g) => g.id === groupId);
  if (!targetGroup || !targetGroup.fileIds.includes(targetFileId)) return layout;

  const fromIndex = targetGroup.fileIds.indexOf(sourceFileId);
  if (fromIndex !== -1) {
    const fileIds = [...targetGroup.fileIds];
    fileIds.splice(fromIndex, 1);
    const anchorIndex = fileIds.indexOf(targetFileId);
    fileIds.splice(position === 'before' ? anchorIndex : anchorIndex + 1, 0, sourceFileId);
    return { ...layout, groups: layout.groups.map((g) => (g.id === groupId ? { ...g, fileIds } : g)) };
  }

  const sourceGroup = layout.groups.find((g) => g.id !== groupId && g.fileIds.includes(sourceFileId));
  if (!sourceGroup) return layout;

  const sourceRemaining = sourceGroup.fileIds.filter((id) => id !== sourceFileId);
  const sourceActive = sourceGroup.activeFileId === sourceFileId
    ? sourceRemaining[sourceRemaining.length - 1] ?? null
    : sourceGroup.activeFileId;

  const anchorIndex = targetGroup.fileIds.indexOf(targetFileId);
  const targetFileIds = [...targetGroup.fileIds];
  targetFileIds.splice(position === 'before' ? anchorIndex : anchorIndex + 1, 0, sourceFileId);

  let updatedGroups = layout.groups.map((g) => {
    if (g.id === sourceGroup.id) return { ...g, fileIds: sourceRemaining, activeFileId: sourceActive };
    if (g.id === targetGroup.id) return { ...g, fileIds: targetFileIds, activeFileId: sourceFileId };
    return g;
  });

  if (updatedGroups.length > 1 && sourceRemaining.length === 0) {
    updatedGroups = updatedGroups.filter((g) => g.id !== sourceGroup.id);
    return syncTreeWithGroups(layout, updatedGroups);
  }
  return { ...layout, groups: updatedGroups };
}

export function useEditorGrid(initialLayout: EditorGridLayoutDto = DEFAULT_GRID_LAYOUT) {
  const [layout, setLayout] = useState<EditorGridLayoutDto>(initialLayout);

  const openFile = useCallback((fileId: string, targetGroupId?: string) => {
    setLayout((prev) => {
      const groupId = targetGroupId ?? prev.groups[0].id;
      return {
        ...prev,
        groups: prev.groups.map((g) => {
          if (g.id !== groupId) return g;
          const fileIds = g.fileIds.includes(fileId) ? g.fileIds : [...g.fileIds, fileId];
          return { ...g, fileIds, activeFileId: fileId };
        }),
      };
    });
  }, []);

  const closeFile = useCallback((groupId: string, fileId: string) => {
    setLayout((prev) => closeFileInGroupHelper(prev, groupId, fileId));
  }, []);

  const selectFile = useCallback((groupId: string, fileId: string) => {
    setLayout((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === groupId ? { ...g, activeFileId: fileId } : g)),
    }));
  }, []);

  const moveTab = useCallback((groupId: string, srcId: string, tgtId: string, pos: TabDropPosition) => {
    setLayout((prev) => reorderTabsHelper(prev, groupId, srcId, tgtId, pos));
  }, []);

  const split = useCallback((srcGroupId: string, fileId: string, dir: SplitDirection) => {
    setLayout((prev) => splitGroupHelper(prev, srcGroupId, fileId, dir));
  }, []);

  const closeOtherFiles = useCallback((groupId: string, keepFileId: string) => {
    setLayout((prev) => closeOtherFilesInGroupHelper(prev, groupId, keepFileId));
  }, []);

  const closeGroup = useCallback((groupId: string) => {
    setLayout((prev) =>
      prev.groups.length <= 1 ? prev : syncTreeWithGroups(prev, prev.groups.filter((g) => g.id !== groupId))
    );
  }, []);

  const setSplitRatio = useCallback((ratio: number) => {
    setLayout((prev) => ({ ...prev, splitRatio: Math.max(0.15, Math.min(0.85, ratio)) }));
  }, []);

  const setGroupViewMode = useCallback((groupId: string, viewMode: 'edit' | 'preview') => {
    setLayout((prev) => setGroupViewModeHelper(prev, groupId, viewMode));
  }, []);

  return {
    layout,
    openFile,
    closeFile,
    closeOtherFiles,
    selectFile,
    moveTab,
    split,
    closeGroup,
    setSplitRatio,
    setGroupViewMode,
  };
}

