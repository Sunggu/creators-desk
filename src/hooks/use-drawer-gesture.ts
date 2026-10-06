import { useCallback, useRef } from 'react';
import {
  classifyDrawerSwipeOrigin,
  resolveDrawerSwipe,
  type DrawerSwipeOrigin,
} from '../utils/drawer-swipe';

interface UseDrawerGestureOptions {
  onOpen: () => void;
  onClose: () => void;
}

interface TouchBinding {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface DrawerGestureBinding {
  /** Attach to the workspace surface: opens the drawer from the left edge. */
  edgeProps: TouchBinding;
  /** Attach to the open panel: closes the drawer by swiping left. */
  panelProps: TouchBinding;
}

interface TouchStart {
  origin: DrawerSwipeOrigin;
  startX: number;
  startY: number;
}

/** Resolves a finished gesture to an action, or `null` to leave state alone. */
function resolveTouch(start: TouchStart, e: React.TouchEvent) {
  const touch = e.changedTouches[0];
  return resolveDrawerSwipe(
    { startX: start.startX, startY: start.startY, endX: touch.clientX, endY: touch.clientY },
    start.origin,
  );
}

/**
 * Wires the drawer swipe rules to React touch events.
 *
 * Each binding owns exactly one zone, so a gesture can only do the one thing its
 * zone authorises: the edge strip opens, the panel closes, and every other
 * gesture is ignored. Nothing is `preventDefault`ed, so native scrolling, text
 * selection and the on-screen keyboard keep working.
 */
export function useDrawerGesture({ onOpen, onClose }: UseDrawerGestureOptions): DrawerGestureBinding {
  const edgeStartRef = useRef<TouchStart | null>(null);
  const panelStartRef = useRef<TouchStart | null>(null);

  // A second finger means pinch-zoom, not a swipe.
  const readSingleTouch = (e: React.TouchEvent) =>
    e.touches.length === 1
      ? { startX: e.touches[0].clientX, startY: e.touches[0].clientY }
      : null;

  const onEdgeTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = readSingleTouch(e);
    if (!touch) {
      edgeStartRef.current = null;
      return;
    }
    const origin = classifyDrawerSwipeOrigin(touch.startX);
    edgeStartRef.current = origin === 'edge' ? { origin, ...touch } : null;
  }, []);

  const onEdgeTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = edgeStartRef.current;
      edgeStartRef.current = null;
      if (!start || e.changedTouches.length === 0) return;
      if (resolveTouch(start, e) === 'open') onOpen();
    },
    [onOpen],
  );

  const onPanelTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = readSingleTouch(e);
    panelStartRef.current = touch ? { origin: 'drawer', ...touch } : null;
  }, []);

  const onPanelTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = panelStartRef.current;
      panelStartRef.current = null;
      if (!start || e.changedTouches.length === 0) return;
      if (resolveTouch(start, e) === 'close') onClose();
    },
    [onClose],
  );

  return {
    edgeProps: { onTouchStart: onEdgeTouchStart, onTouchEnd: onEdgeTouchEnd },
    panelProps: { onTouchStart: onPanelTouchStart, onTouchEnd: onPanelTouchEnd },
  };
}