import { describe, expect, it } from 'vitest';
import { calculateNextSizeHelper } from './use-resizable';

describe('useResizable pure helper (calculateNextSizeHelper)', () => {
  it('increases size when moving right in normal mode', () => {
    // startPos = 100, currentPos = 150 -> delta +50
    const next = calculateNextSizeHelper(150, 100, 260, {
      min: 200,
      max: 480,
      reverse: false,
    });
    expect(next).toBe(310);
  });

  it('decreases size when moving left in normal mode', () => {
    // startPos = 150, currentPos = 100 -> delta -50
    const next = calculateNextSizeHelper(100, 150, 260, {
      min: 200,
      max: 480,
      reverse: false,
    });
    expect(next).toBe(210);
  });

  it('increases size when moving left in reverse mode (right panel)', () => {
    // startPos = 500, currentPos = 450 -> rawDelta -50 -> effectiveDelta +50
    const next = calculateNextSizeHelper(450, 500, 260, {
      min: 200,
      max: 480,
      reverse: true,
    });
    expect(next).toBe(310);
  });

  it('decreases size when moving right in reverse mode (right panel)', () => {
    // startPos = 500, currentPos = 550 -> rawDelta +50 -> effectiveDelta -50
    const next = calculateNextSizeHelper(550, 500, 260, {
      min: 200,
      max: 480,
      reverse: true,
    });
    expect(next).toBe(210);
  });

  it('clamps size within min and max boundaries', () => {
    const clampedMin = calculateNextSizeHelper(-1000, 100, 260, {
      min: 200,
      max: 480,
    });
    expect(clampedMin).toBe(200);

    const clampedMax = calculateNextSizeHelper(1000, 100, 260, {
      min: 200,
      max: 480,
    });
    expect(clampedMax).toBe(480);
  });

  it('handles ratio-based resizing with containerSize', () => {
    // startSize = 0.5, containerSize = 1000, delta = 100 -> deltaRatio = 0.1 -> 0.6
    const next = calculateNextSizeHelper(200, 100, 0.5, {
      min: 0.15,
      max: 0.85,
      isRatio: true,
      containerSize: 1000,
    });
    expect(next).toBeCloseTo(0.6);
  });
});
