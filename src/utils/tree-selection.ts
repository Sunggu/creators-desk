import type { FileNodeDto } from '../core/domain/file-node.dto';

export interface SelectionClickEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
}

export function calculateTreeSelection(
  selectedIds: Set<string>,
  lastSelectedId: string | null,
  clickedNode: FileNodeDto,
  flattenedVisibleNodes: FileNodeDto[],
  event: SelectionClickEvent,
): { nextSelectedIds: Set<string>; nextLastSelectedId: string } {
  // 1. Shift key: Range selection between lastSelectedId and clickedNode
  if (event.shiftKey && lastSelectedId) {
    const lastIdx = flattenedVisibleNodes.findIndex((n) => n.id === lastSelectedId);
    const currIdx = flattenedVisibleNodes.findIndex((n) => n.id === clickedNode.id);

    if (lastIdx !== -1 && currIdx !== -1) {
      const start = Math.min(lastIdx, currIdx);
      const end = Math.max(lastIdx, currIdx);
      const rangeIds = flattenedVisibleNodes.slice(start, end + 1).map((n) => n.id);
      return {
        nextSelectedIds: new Set([...selectedIds, ...rangeIds]),
        nextLastSelectedId: clickedNode.id,
      };
    }
  }

  // 2. Ctrl / Cmd key: Toggle multi-selection
  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedIds);
    if (next.has(clickedNode.id)) {
      next.delete(clickedNode.id);
    } else {
      next.add(clickedNode.id);
    }
    return {
      nextSelectedIds: next,
      nextLastSelectedId: clickedNode.id,
    };
  }

  // 3. Normal click: Single selection
  return {
    nextSelectedIds: new Set([clickedNode.id]),
    nextLastSelectedId: clickedNode.id,
  };
}
