import type { FileNodeDto } from '../core/domain/file-node.dto';

export interface SelectionClickEvent {
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  isSelectionMode?: boolean;
}

export function calculateTreeSelection(
  selectedIds: ReadonlySet<string>,
  lastSelectedId: string | null,
  clickedNode: FileNodeDto,
  flattenedVisibleNodes: readonly FileNodeDto[],
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

  // 2. Ctrl / Cmd key OR explicit selection mode: Toggle item in multi-selection
  if (event.ctrlKey || event.metaKey || event.isSelectionMode) {
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

  // 3. Normal click outside selection mode: Do not pollute multi-selection set,
  //    but record lastSelectedId as anchor for subsequent Shift+Click range selection.
  return {
    nextSelectedIds: new Set(),
    nextLastSelectedId: clickedNode.id,
  };
}

export function pruneStaleSelection(
  selectedIds: ReadonlySet<string>,
  validNodes: readonly FileNodeDto[],
): Set<string> {
  if (selectedIds.size === 0) return new Set();
  const validIds = new Set(validNodes.map((n) => n.id));
  const next = new Set<string>();
  for (const id of selectedIds) {
    if (validIds.has(id)) next.add(id);
  }
  return next;
}
