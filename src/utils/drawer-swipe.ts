/**
 * Touch gesture rules for the mobile drawer.
 *
 * Kept pure — no DOM, no React — because the previous implementation lived
 * inside the shell as two inline handlers. That made it impossible to test and
 * let a horizontal swipe anywhere on the page (including inside CodeMirror) try
 * to open the drawer. Routing decisions now belong here, where they are pinned
 * down by `drawer-swipe.spec.ts`.
 */

export interface DrawerSwipeSample {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * Where a gesture began.
 *
 * - `edge`: the reserved strip at the left of the screen, the only place that
 *   may open the drawer.
 * - `drawer`: inside the open panel, the only place that may close it.
 * - `content`: anywhere else, which always yields no action so scrolling and
 *   text selection in the editor are never hijacked.
 */
export type DrawerSwipeOrigin = 'edge' | 'drawer' | 'content';

export type DrawerSwipeAction = 'open' | 'close';

/** Width of the left-edge open zone, in CSS pixels. */
export const DRAWER_EDGE_ZONE_PX = 40;

/** Minimum horizontal travel before a swipe counts. */
export const DRAWER_SWIPE_THRESHOLD_PX = 48;

/** A gesture must be this many times wider than it is tall to be a swipe. */
export const DRAWER_SWIPE_ASPECT = 1.2;

/** Classifies where a touch began. */
export function classifyDrawerSwipeOrigin(
  startX: number,
  edgeZone: number = DRAWER_EDGE_ZONE_PX,
): DrawerSwipeOrigin {
  return startX <= edgeZone ? 'edge' : 'content';
}

/**
 * Decides whether a finished gesture opens or closes the drawer.
 *
 * Returns `null` for "do nothing", which is the common case: every gesture that
 * is mostly vertical, too short, or that started outside the owning zone.
 */
export function resolveDrawerSwipe(
  sample: DrawerSwipeSample,
  origin: DrawerSwipeOrigin,
  thresholds: { threshold?: number; aspect?: number } = {},
): DrawerSwipeAction | null {
  if (origin === 'content') return null;

  const threshold = thresholds.threshold ?? DRAWER_SWIPE_THRESHOLD_PX;
  const aspect = thresholds.aspect ?? DRAWER_SWIPE_ASPECT;
  const dx = sample.endX - sample.startX;
  const dy = sample.endY - sample.startY;

  // Mostly-vertical travel is a scroll, never a drawer gesture.
  if (Math.abs(dy) * aspect > Math.abs(dx)) return null;

  if (origin === 'edge') return dx >= threshold ? 'open' : null;
  return dx <= -threshold ? 'close' : null;
}