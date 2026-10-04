import { useCallback, useState } from 'react';
import type { EditorGroupDto, EditorGridLayoutDto, SplitDirection } from '../core/domain/editor-grid.dto';

const DEFAULT_GRID_LAYOUT: EditorGridLayoutDto = {
  direction: 'horizontal',
  groups: [{ id: 'group-main', fileIds: [], activeFileId: null }],
  splitRatio: 0.5,
};

export function splitGroupHelper(
  layout: EditorGridLayoutDto,
  sourceGroupId: string,
  fileId: string,
  direction: SplitDirection
): EditorGridLayoutDto {
  const newGroupId = `group-${Date.now()}`;
  const newGroup: EditorGroupDto = {
    id: newGroupId,
    fileIds: [fileId],
    activeFileId: fileId,
  };

  // If already split, add file to the other group
  if (layout.groups.length >= 2) {
    const targetGroup = layout.groups.find((g) => g.id !== sourceGroupId) || layout.groups[1];
    const fileIds = targetGroup.fileIds.includes(fileId) ? targetGroup.fileIds : [...targetGroup.fileIds, fileId];
    return {
      ...layout,
      groups: layout.groups.map((g) => (g.id === targetGroup.id ? { ...g, fileIds, activeFileId: fileId } : g)),
    };
  }

  return {
    direction,
    groups: [...layout.groups, newGroup],
    splitRatio: 0.5,
  };
}

export function closeFileInGroupHelper(
  layout: EditorGridLayoutDto,
  groupId: string,
  fileId: string
): EditorGridLayoutDto {
  const updatedGroups = layout.groups.map((group) => {
    if (group.id !== groupId) return group;
    const fileIds = group.fileIds.filter((id) => id !== fileId);
    let activeFileId = group.activeFileId;
    if (activeFileId === fileId) {
      activeFileId = fileIds[fileIds.length - 1] ?? null;
    }
    return { ...group, fileIds, activeFileId };
  });

  // If a split group has 0 files and there are 2 groups, collapse to 1 group
  if (updatedGroups.length > 1) {
    const target = updatedGroups.find((g) => g.id === groupId);
    if (target && target.fileIds.length === 0) {
      return {
        ...layout,
        groups: updatedGroups.filter((g) => g.id !== groupId),
      };
    }
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

  const split = useCallback((sourceGroupId: string, fileId: string, direction: SplitDirection) => {
    setLayout((prev) => splitGroupHelper(prev, sourceGroupId, fileId, direction));
  }, []);

  const closeGroup = useCallback((groupId: string) => {
    setLayout((prev) => {
      if (prev.groups.length <= 1) return prev;
      return { ...prev, groups: prev.groups.filter((g) => g.id !== groupId) };
    });
  }, []);

  const setSplitRatio = useCallback((ratio: number) => {
    setLayout((prev) => ({ ...prev, splitRatio: Math.max(0.15, Math.min(0.85, ratio)) }));
  }, []);

  return {
    layout,
    openFile,
    closeFile,
    selectFile,
    split,
    closeGroup,
    setSplitRatio,
  };
}
