import { describe, expect, it } from 'vitest';
import {
  byUpdatedAtDesc,
  floorToEpochSecond,
  isEpochMillis,
  toEpochMillis,
} from './epoch-millis';

describe('isEpochMillis', () => {
  it('accepts non-negative finite integers', () => {
    expect(isEpochMillis(0)).toBe(true);
    expect(isEpochMillis(1_700_000_000_000)).toBe(true);
  });

  it('rejects non-numbers and non-finite or negative values', () => {
    expect(isEpochMillis('1700000000000')).toBe(false);
    expect(isEpochMillis(Number.NaN)).toBe(false);
    expect(isEpochMillis(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isEpochMillis(-1)).toBe(false);
    expect(isEpochMillis(null)).toBe(false);
  });
});

describe('toEpochMillis', () => {
  it('passes canonical epoch milliseconds through unchanged', () => {
    expect(toEpochMillis(1_700_000_000_000)).toBe(1_700_000_000_000);
  });

  it('normalizes ISO strings and Date instances', () => {
    expect(toEpochMillis('2026-01-02T03:04:05.000Z')).toBe(Date.parse('2026-01-02T03:04:05.000Z'));
    expect(toEpochMillis(new Date(1_700_000_000_000))).toBe(1_700_000_000_000);
  });

  it('returns null for uninterpretable input', () => {
    expect(toEpochMillis('not-a-date')).toBeNull();
    expect(toEpochMillis(undefined)).toBeNull();
    expect(toEpochMillis({})).toBeNull();
  });
});

describe('floorToEpochSecond', () => {
  it('drops sub-second precision', () => {
    expect(floorToEpochSecond(1_700_000_000_999)).toBe(1_700_000_000_000);
    expect(floorToEpochSecond(1_700_000_000_000)).toBe(1_700_000_000_000);
  });
});

describe('byUpdatedAtDesc', () => {
  it('orders newest first regardless of locale or zone', () => {
    const rows = [{ updatedAt: 10 }, { updatedAt: 30 }, { updatedAt: 20 }];
    expect([...rows].sort(byUpdatedAtDesc)).toEqual([
      { updatedAt: 30 },
      { updatedAt: 20 },
      { updatedAt: 10 },
    ]);
  });
});