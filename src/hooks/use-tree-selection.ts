import { useCallback, useState } from 'react';
import type { FileNodeDto } from '../core/domain/file-node.dto';
import { calculateTreeSelection } from '../utils/tree-selection';

export function useTreeSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const handleItemClick = useCallback(
    (
      clickedNode: FileNodeDto,
      flattenedVisibleNodes: FileNodeDto[],
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
        },
      );
      setSelectedIds(nextSelectedIds);
      setLastSelectedId(nextLastSelectedId);
    },
    [lastSelectedId, selectedIds],
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  return {
    selectedIds,
    setSelectedIds,
    handleItemClick,
    clearSelection,
  };
}
