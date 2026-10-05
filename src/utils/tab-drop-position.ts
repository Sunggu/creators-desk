import type { TabDropPosition } from '../core/domain/tab-drag.dto';

interface DropTargetRect {
  left: number;
  width: number;
}

/**
 * Resolves the insertion slot for a tab drop by comparing the pointer against
 * the horizontal midpoint of the tab under the cursor.
 */
export function resolveTabDropPosition(pointerClientX: number, rect: DropTargetRect): TabDropPosition {
  if (rect.width <= 0) return 'after';
  return pointerClientX - rect.left < rect.width / 2 ? 'before' : 'after';
}
