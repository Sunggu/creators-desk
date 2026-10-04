import type { EpochMillis } from '../../core/domain/time/epoch-millis.dto';
import {
  MILLIS_PER_DAY,
  MILLIS_PER_HOUR,
  MILLIS_PER_MINUTE,
  MILLIS_PER_MONTH,
  MILLIS_PER_SECOND,
  MILLIS_PER_YEAR,
} from '../../core/domain/time/epoch-millis.dto';

/** Coarse time bucket, matching the `time.relative.*` resource family. */
export type RelativeTimeUnit = 'second' | 'minute' | 'hour' | 'day' | 'month' | 'year';

/**
 * A relative time described structurally rather than as prose, so the string
 * itself stays translatable and the comparison stays pure.
 */
export interface RelativeTime {
  readonly unit: RelativeTimeUnit;
  readonly value: number;
  /** True when `target` lies in the future relative to `reference`. */
  readonly isFuture: boolean;
  /** True when the two instants are close enough to call "just now". */
  readonly isNow: boolean;
}

/**
 * Differences under this many milliseconds read better as "just now".
 *
 * 10s keeps the `second` bucket meaningful (10-59s renders as seconds) while
 * still avoiding "3 seconds ago" for a save that just happened.
 */
export const JUST_NOW_THRESHOLD_MILLIS = 10_000;

const UNIT_BY_MILLIS: ReadonlyArray<readonly [RelativeTimeUnit, number]> = [
  ['year', MILLIS_PER_YEAR],
  ['month', MILLIS_PER_MONTH],
  ['day', MILLIS_PER_DAY],
  ['hour', MILLIS_PER_HOUR],
  ['minute', MILLIS_PER_MINUTE],
  ['second', MILLIS_PER_SECOND],
];

/**
 * Classifies the gap between two epoch-millisecond instants.
 *
 * Pure and clock-free: pass both instants explicitly. That makes relative-time
 * assertions deterministic without freezing `Date.now()` (Rule 5), and it is
 * what allows the same function to drive a countdown and a "last saved" label.
 */
export function describeRelativeTime(
  target: EpochMillis,
  reference: EpochMillis,
): RelativeTime {
  const delta = target - reference;
  const magnitude = Math.abs(delta);
  const isFuture = delta > 0;

  if (magnitude < JUST_NOW_THRESHOLD_MILLIS) {
    return { unit: 'second', value: 0, isFuture, isNow: true };
  }

  const [unit, size] = UNIT_BY_MILLIS.find(([, threshold]) => magnitude >= threshold)!;

  return {
    unit,
    value: Math.floor(magnitude / size),
    isFuture,
    isNow: false,
  };
}