import type React from 'react';
import { useCallback, useState } from 'react';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import {
  calculateTreeSelection,
  pruneStaleSelection,
} from '../utils/tree-selection';

export function useTreeSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);

  const isSelectionActive = isSelectionMode || selectedIds.size > 0;

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedIds(new Set());
        setLastSelectedId(null);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((nodes: readonly FileNodeDto[]) => {
    setSelectedIds(new Set(nodes.map((n) => n.id)));
    setIsSelectionMode(true);
  }, []);

  const pruneSelection = useCallback((validNodes: readonly FileNodeDto[]) => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = pruneStaleSelection(prev, validNodes);
      if (next.size === prev.size) return prev;
      return next;
    });
  }, []);

  const handleItemClick = useCallback(
    (
      clickedNode: FileNodeDto,
      flattenedVisibleNodes: readonly FileNodeDto[],
      e: React.MouseEvent,
    ) => {
      const { nextSelectedIds, nextLastSelectedId } = calculateTreeSelection(
        selectedIds,
        lastSelectedId,
        clickedNode,
        flattenedVisibleNodes,
        {
          shiftKey: e.shiftKey,
          ctrlKey: e.ctrlKey,
          metaKey: e.metaKey,
          isSelectionMode,
        },
      );
      setSelectedIds(nextSelectedIds);
      setLastSelectedId(nextLastSelectedId);
    },
    [isSelectionMode, lastSelectedId, selectedIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
    setIsSelectionMode(false);
  }, []);

  return {
    selectedIds,
    isSelectionMode,
    isSelectionActive,
    setSelectedIds,
    toggleSelectionMode,
    selectAll,
    pruneSelection,
    handleItemClick,
    clearSelection,
  };
}
