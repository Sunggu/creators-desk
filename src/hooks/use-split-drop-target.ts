import { useCallback, useState } from 'react';
import { TAB_DRAG_MIME } from '../core/domain/tab-drag.dto';
import type { SplitDirection } from '../core/domain/editor-grid.dto';
import { resolveSplitDropEdge, toSplitDirection } from '../utils/split-drop-edge';
import type { SplitDropEdge } from '../utils/split-drop-edge';

interface UseSplitDropTargetOptions {
  onSplitDrop: (fileId: string, direction: SplitDirection) => void;
}

export interface SplitDropTarget {
  /** Edge the dragged tab would split against, or null when no split is armed. */
  edge: SplitDropEdge | null;
  /** Spread onto the editor pane container — never onto a covering overlay. */
  dropZoneProps: {
    onDragOver: (event: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (event: React.DragEvent<HTMLElement>) => void;
    onDrop: (event: React.DragEvent<HTMLElement>) => void;
  };
}

/**
 * Arms the split-pane drop edge from handlers bound to the editor pane itself.
 *
 * The handlers deliberately live on the pane rather than on a full-bleed
 * overlay: an absolutely positioned sibling would become the top hit-test
 * target and swallow every click, caret placement and selection inside
 * CodeMirror. Bubbling `dragover` up from the pane's children yields the same
 * split affordance while leaving the editor permanently interactive.
 *
 * Non-tab drags are ignored entirely so text/file drags keep their defaults.
 */
export function useSplitDropTarget({ onSplitDrop }: UseSplitDropTargetOptions): SplitDropTarget {
  const [edge, setEdge] = useState<SplitDropEdge | null>(null);

  const onDragOver = useCallback((event: React.DragEvent<HTMLElement>) => {
    if (!event.dataTransfer.types.includes(TAB_DRAG_MIME)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setEdge(resolveSplitDropEdge(event.clientX, event.clientY, event.currentTarget.getBoundingClientRect()));
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent<HTMLElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setEdge(null);
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (!edge || !event.dataTransfer.types.includes(TAB_DRAG_MIME)) return;
      event.preventDefault();
      const fileId = event.dataTransfer.getData(TAB_DRAG_MIME);
      setEdge(null);
      if (fileId) onSplitDrop(fileId, toSplitDirection(edge));
    },
    [edge, onSplitDrop],
  );

  return { edge, dropZoneProps: { onDragOver, onDragLeave, onDrop } };
}
