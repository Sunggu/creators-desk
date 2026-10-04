import { describe, expect, it } from 'vitest';
import { applyUpdate } from './timestamps';
import { FixedClock } from './system-clock';

const T0 = 1_700_000_000_000;

function entity() {
  return { id: 'node-1', createdAt: T0, updatedAt: T0 };
}

describe('applyUpdate', () => {
  it('keeps a caller-supplied updatedAt instead of overwriting it', () => {
    const updated = applyUpdate(entity(), { updatedAt: T0 + 5_000 }, T0 + 99_000);
    expect(updated.updatedAt).toBe(T0 + 5_000);
  });

  it('falls back to the clock when the caller omitted updatedAt', () => {
    const updated = applyUpdate(entity(), { id: 'node-2' }, T0 + 99_000);
    expect(updated.updatedAt).toBe(T0 + 99_000);
    expect(updated.id).toBe('node-2');
  });

  it('never mutates the original entity', () => {
    const original = entity();
    applyUpdate(original, { updatedAt: T0 + 1 }, T0);
    expect(original.updatedAt).toBe(T0);
  });

  it('leaves createdAt untouched', () => {
    const updated = applyUpdate(entity(), { updatedAt: T0 + 1 }, T0 + 1);
    expect(updated.createdAt).toBe(T0);
  });

  it('is deterministic when driven by a fixed clock', () => {
    const clock = new FixedClock(T0);
    expect(applyUpdate(entity(), {}, clock.now()).updatedAt).toBe(T0);
    clock.advance(60_000);
    expect(applyUpdate(entity(), {}, clock.now()).updatedAt).toBe(T0 + 60_000);
  });
});