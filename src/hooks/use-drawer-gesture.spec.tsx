import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  DRAWER_EDGE_ZONE_PX,
  DRAWER_SWIPE_THRESHOLD_PX,
} from '../utils/drawer-swipe';
import { useDrawerGesture } from './use-drawer-gesture';

/**
 * Gesture routing, verified on the hook that the shell binds to.
 *
 * The zones are the point: an edge swipe may only open, a panel swipe may only
 * close, and everything else — including any gesture that begins over the
 * editor — is ignored so scrolling and text selection are never hijacked.
 */
function Harness({ onOpen, onClose }: { onOpen: () => void; onClose: () => void }) {
  const { edgeProps, panelProps } = useDrawerGesture({ onOpen, onClose });
  return (
    <>
      <div data-edge {...edgeProps} />
      <div data-panel {...panelProps} />
    </>
  );
}

function setup() {
  const onOpen = vi.fn();
  const onClose = vi.fn();
  const view = render(<Harness onOpen={onOpen} onClose={onClose} />);
  return {
    ...view,
    onOpen,
    onClose,
    edge: view.container.querySelector('[data-edge]') as HTMLElement,
    panel: view.container.querySelector('[data-panel]') as HTMLElement,
  };
}

/** `jsdom` has no `Touch` constructor, so points are passed as plain lists. */
function swipe(target: HTMLElement, startX: number, endX: number, startY = 300, endY = startY) {
  const point = (clientX: number, clientY: number) => [{ clientX, clientY }];
  fireEvent.touchStart(target, { touches: point(startX, startY), changedTouches: point(startX, startY) });
  fireEvent.touchEnd(target, { touches: [], changedTouches: point(endX, endY) });
}

describe('useDrawerGesture', () => {
  it('opens on a long rightward swipe from the left edge', () => {
    const { edge, onOpen } = setup();

    swipe(edge, 4, 4 + DRAWER_SWIPE_THRESHOLD_PX);

    expect(onOpen).toHaveBeenCalledOnce();
  });

  it('ignores a rightward swipe that starts away from the edge', () => {
    const { edge, onOpen } = setup();

    swipe(edge, DRAWER_EDGE_ZONE_PX + 40, 300);

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('never closes from the edge zone', () => {
    const { edge, onClose } = setup();

    swipe(edge, 4, -200);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on a long leftward swipe across the panel', () => {
    const { panel, onClose } = setup();

    swipe(panel, 200, 200 - DRAWER_SWIPE_THRESHOLD_PX);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('never opens from the panel zone', () => {
    const { panel, onOpen } = setup();

    swipe(panel, 100, 300);

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('ignores a mostly vertical gesture, so scrolling survives', () => {
    const { edge, panel, onOpen, onClose } = setup();

    swipe(edge, 10, 90, 300, 460);
    swipe(panel, 200, 140, 300, 460);

    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores a pinch, where a second finger is on the glass', () => {
    const { edge, onOpen } = setup();
    const two = [{ clientX: 4, clientY: 300 }, { clientX: 30, clientY: 300 }];

    fireEvent.touchStart(edge, { touches: two, changedTouches: two });
    fireEvent.touchEnd(edge, { touches: [], changedTouches: two });

    expect(onOpen).not.toHaveBeenCalled();
  });

  it('ignores a swipe shorter than the threshold', () => {
    const { edge, panel, onOpen, onClose } = setup();

    swipe(edge, 4, 4 + DRAWER_SWIPE_THRESHOLD_PX - 1);
    swipe(panel, 200, 200 - DRAWER_SWIPE_THRESHOLD_PX + 1);

    expect(onOpen).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});