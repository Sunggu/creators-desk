import { describe, expect, it } from 'vitest';
import { SPLIT_DROP_EDGE_RATIO, resolveSplitDropEdge, toSplitDirection } from './split-drop-edge';

const AREA = { left: 100, top: 200, width: 1000, height: 400 };

describe('resolveSplitDropEdge', () => {
  it('returns the right edge past the horizontal threshold', () => {
    expect(resolveSplitDropEdge(100 + AREA.width * 0.8, 200, AREA)).toBe('right');
  });

  it('returns the bottom edge past the vertical threshold', () => {
    expect(resolveSplitDropEdge(100, 200 + AREA.height * 0.8, AREA)).toBe('bottom');
  });

  it('returns null in the centre region so a plain drop keeps editor behaviour', () => {
    expect(resolveSplitDropEdge(100 + AREA.width / 2, 200 + AREA.height / 2, AREA)).toBeNull();
  });

  it('treats the threshold itself as outside the edge (strict comparison)', () => {
    const edge = 100 + AREA.width * SPLIT_DROP_EDGE_RATIO;
    expect(resolveSplitDropEdge(edge, 200, AREA)).toBeNull();
  });

  it('prefers the right edge when both axes pass their threshold', () => {
    expect(
      resolveSplitDropEdge(100 + AREA.width * 0.9, 200 + AREA.height * 0.9, AREA),
    ).toBe('right');
  });

  it('returns null for a degenerate area instead of dividing by zero', () => {
    expect(resolveSplitDropEdge(500, 400, { left: 0, top: 0, width: 0, height: 400 })).toBeNull();
    expect(resolveSplitDropEdge(500, 400, { left: 0, top: 0, width: 400, height: 0 })).toBeNull();
  });

  it('ignores pointers outside the area instead of clamping to an edge', () => {
    expect(resolveSplitDropEdge(-500, 200, AREA)).toBeNull();
    expect(resolveSplitDropEdge(100 + AREA.width + 500, 200, AREA)).toBe('right');
  });
});

describe('toSplitDirection', () => {
  it('maps the right edge to a horizontal (side-by-side) split', () => {
    expect(toSplitDirection('right')).toBe('horizontal');
  });

  it('maps the bottom edge to a vertical (stacked) split', () => {
    expect(toSplitDirection('bottom')).toBe('vertical');
  });
});
