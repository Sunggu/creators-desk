import { describe, expect, it } from 'vitest';
import {
  describeRelativeTime,
  JUST_NOW_THRESHOLD_MILLIS,
  type RelativeTimeUnit,
} from './relative-time';
import {
  MILLIS_PER_DAY,
  MILLIS_PER_HOUR,
  MILLIS_PER_MINUTE,
  MILLIS_PER_MONTH,
  MILLIS_PER_SECOND,
  MILLIS_PER_YEAR,
} from '../../core/domain/time/epoch-millis.dto';

const NOW = Date.parse('2026-06-15T12:00:00.000Z');

const cases: Array<[number, RelativeTimeUnit, number]> = [
  [MILLIS_PER_SECOND * 30, 'second', 30],
  [MILLIS_PER_MINUTE * 3, 'minute', 3],
  [MILLIS_PER_HOUR * 5, 'hour', 5],
  [MILLIS_PER_DAY * 4, 'day', 4],
  [MILLIS_PER_MONTH * 2, 'month', 2],
  [MILLIS_PER_YEAR * 3, 'year', 3],
];

describe('describeRelativeTime', () => {
  it.each(cases)('buckets %dms past into %s', (delta, unit, value) => {
    const result = describeRelativeTime(NOW - delta, NOW);
    expect(result.unit).toBe(unit);
    expect(result.value).toBe(value);
    expect(result.isFuture).toBe(false);
    expect(result.isNow).toBe(false);
  });

  it('flags future instants instead of silently going negative', () => {
    const result = describeRelativeTime(NOW + MILLIS_PER_HOUR * 2, NOW);
    expect(result.isFuture).toBe(true);
    expect(result.unit).toBe('hour');
    expect(result.value).toBe(2);
  });

  it('collapses small gaps into "just now"', () => {
    expect(describeRelativeTime(NOW, NOW).isNow).toBe(true);
    expect(describeRelativeTime(NOW + 1_000, NOW).isNow).toBe(true);
    expect(describeRelativeTime(NOW - 1_000, NOW).isNow).toBe(true);
    expect(describeRelativeTime(NOW + JUST_NOW_THRESHOLD_MILLIS + 1, NOW).isNow).toBe(false);
  });

  it('still distinguishes a future "just now" from a past one', () => {
    const soon = describeRelativeTime(NOW + 2_000, NOW);
    expect(soon.isNow).toBe(true);
    expect(soon.isFuture).toBe(true);
  });

  it('is symmetric for past and future across every unit', () => {
    for (const [delta, unit, value] of cases) {
      expect(describeRelativeTime(NOW + delta, NOW)).toMatchObject({ unit, value, isFuture: true });
      expect(describeRelativeTime(NOW - delta, NOW)).toMatchObject({ unit, value, isFuture: false });
    }
  });

  it('floors partial buckets instead of rounding up', () => {
    const result = describeRelativeTime(NOW - MILLIS_PER_HOUR * 1.9, NOW);
    expect(result.unit).toBe('hour');
    expect(result.value).toBe(1);
  });
});