import type { SplitDirection } from '../core/domain/editor-grid.dto';

export type SplitDropEdge = 'right' | 'bottom';

interface SplitDropArea {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Fraction of the width/height beyond which a drop resolves to that edge. */
export const SPLIT_DROP_EDGE_RATIO = 0.65;

/**
 * Resolves which pane edge a tab drop should split against.
 *
 * Kept pure (no DOM, no React) so the split-view feature can be verified without
 * rendering anything — and so a change to the thresholds can never silently
 * alter pointer routing behaviour.
 */
export function resolveSplitDropEdge(
  pointerClientX: number,
  pointerClientY: number,
  area: SplitDropArea,
): SplitDropEdge | null {
  if (area.width <= 0 || area.height <= 0) return null;
  const xRatio = (pointerClientX - area.left) / area.width;
  const yRatio = (pointerClientY - area.top) / area.height;
  if (xRatio > SPLIT_DROP_EDGE_RATIO) return 'right';
  if (yRatio > SPLIT_DROP_EDGE_RATIO) return 'bottom';
  return null;
}

export function toSplitDirection(edge: SplitDropEdge): SplitDirection {
  return edge === 'right' ? 'horizontal' : 'vertical';
}
