import {
  EPOCH_MILLIS_MIN,
  MILLIS_PER_SECOND,
  type EpochMillis,
} from './epoch-millis.dto';

/**
 * Type guard for the canonical temporal representation.
 * Rejects `NaN`, `Infinity`, fractional-free negatives and non-numbers.
 */
export function isEpochMillis(value: unknown): value is EpochMillis {
  return (
    typeof value === 'number' && Number.isFinite(value) && value >= EPOCH_MILLIS_MIN
  );
}

/**
 * The only sanctioned way to read the wall clock in the application.
 * Prefer injecting {@link Clock} over calling this directly so that time is
 * deterministic under test.
 */
export function nowEpochMillis(): EpochMillis {
  return Date.now();
}

/**
 * Normalizes any inbound representation (JSON number, ISO string, `Date`)
 * into canonical epoch milliseconds. Returns `null` when the input cannot be
 * interpreted, so callers decide whether to reject or fall back.
 */
export function toEpochMillis(value: unknown): EpochMillis | null {
  if (isEpochMillis(value)) return value;

  if (typeof value === 'string' || value instanceof Date) {
    const parsed = new Date(value as string | Date).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

/**
 * Drops sub-second precision. `Intl.DateTimeFormat` renders whole seconds, so
 * rounding down keeps an offset computation stable across engine differences.
 */
export function floorToEpochSecond(millis: EpochMillis): EpochMillis {
  return Math.floor(millis / MILLIS_PER_SECOND) * MILLIS_PER_SECOND;
}

/**
 * Sorts newest-first. Used by every list use case so that ordering never
 * depends on the viewer's locale or time zone.
 */
export function byUpdatedAtDesc<T extends { updatedAt: EpochMillis }>(a: T, b: T): number {
  return b.updatedAt - a.updatedAt;
}