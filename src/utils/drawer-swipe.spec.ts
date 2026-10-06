import { describe, expect, it } from 'vitest';
import {
  DRAWER_EDGE_ZONE_PX,
  DRAWER_SWIPE_THRESHOLD_PX,
  classifyDrawerSwipeOrigin,
  resolveDrawerSwipe,
  type DrawerSwipeSample,
} from './drawer-swipe';

const swipe = (dx: number, dy = 0): DrawerSwipeSample => ({
  startX: 200,
  startY: 400,
  endX: 200 + dx,
  endY: 400 + dy,
});

describe('classifyDrawerSwipeOrigin', () => {
  it('treats the left strip as the open zone', () => {
    expect(classifyDrawerSwipeOrigin(0)).toBe('edge');
    expect(classifyDrawerSwipeOrigin(DRAWER_EDGE_ZONE_PX)).toBe('edge');
  });

  it('treats everything to its right as content', () => {
    expect(classifyDrawerSwipeOrigin(DRAWER_EDGE_ZONE_PX + 1)).toBe('content');
    expect(classifyDrawerSwipeOrigin(360)).toBe('content');
  });
});

describe('resolveDrawerSwipe from the edge', () => {
  it('opens on a long rightward swipe', () => {
    expect(resolveDrawerSwipe(swipe(DRAWER_SWIPE_THRESHOLD_PX), 'edge')).toBe('open');
  });

  it('ignores a swipe that is too short', () => {
    expect(resolveDrawerSwipe(swipe(DRAWER_SWIPE_THRESHOLD_PX - 1), 'edge')).toBeNull();
  });

  it('ignores a leftward swipe', () => {
    expect(resolveDrawerSwipe(swipe(-120), 'edge')).toBeNull();
  });
});

describe('resolveDrawerSwipe from the drawer', () => {
  it('closes on a long leftward swipe', () => {
    expect(resolveDrawerSwipe(swipe(-DRAWER_SWIPE_THRESHOLD_PX), 'drawer')).toBe('close');
  });

  it('ignores a rightward swipe', () => {
    expect(resolveDrawerSwipe(swipe(120), 'drawer')).toBeNull();
  });
});

describe('gesture arbitration', () => {
  it('never hijacks content, so editor scrolling and selection survive', () => {
    expect(resolveDrawerSwipe(swipe(200), 'content')).toBeNull();
    expect(resolveDrawerSwipe(swipe(-200), 'content')).toBeNull();
  });

  it('rejects a mostly vertical gesture from the edge', () => {
    expect(resolveDrawerSwipe(swipe(60, 80), 'edge')).toBeNull();
  });

  it('rejects a mostly vertical gesture from the drawer', () => {
    expect(resolveDrawerSwipe(swipe(-60, 80), 'drawer')).toBeNull();
  });

  it('honours overridden thresholds', () => {
    expect(resolveDrawerSwipe(swipe(20), 'edge', { threshold: 10 })).toBe('open');
    expect(resolveDrawerSwipe(swipe(0, 20), 'edge', { threshold: 10 })).toBeNull();
  });
});