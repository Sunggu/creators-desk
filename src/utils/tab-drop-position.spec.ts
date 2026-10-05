import { describe, expect, it } from 'vitest';
import { resolveTabDropPosition } from './tab-drop-position';

describe('resolveTabDropPosition', () => {
  const rect = { left: 100, width: 120 };

  it('inserts before when the pointer is in the left half of the tab', () => {
    expect(resolveTabDropPosition(100, rect)).toBe('before');
    expect(resolveTabDropPosition(159, rect)).toBe('before');
  });

  it('inserts after when the pointer is in the right half of the tab', () => {
    expect(resolveTabDropPosition(160, rect)).toBe('after');
    expect(resolveTabDropPosition(220, rect)).toBe('after');
  });

  it('falls back to after for a collapsed tab', () => {
    expect(resolveTabDropPosition(120, { left: 100, width: 0 })).toBe('after');
  });
});
