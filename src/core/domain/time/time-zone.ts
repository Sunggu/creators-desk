import { floorToEpochSecond } from './epoch-millis';
import type { EpochMillis } from './epoch-millis.dto';
import { SYSTEM_TIME_ZONE, UTC_TIME_ZONE, type TimeZoneSetting } from './time-zone.dto';

/** True for the "follow the runtime" sentinel. */
export function isSystemTimeZone(timeZone: TimeZoneSetting): boolean {
  return timeZone === SYSTEM_TIME_ZONE;
}

/**
 * Validates an IANA identifier by round-tripping it through `Intl`.
 * `Intl` is part of ECMA-402 and therefore available in every runtime this
 * project targets (browsers, Cloudflare Workers, Node, Bun, Docker).
 */
export function isValidTimeZone(timeZone: unknown): timeZone is TimeZoneSetting {
  if (typeof timeZone !== 'string' || timeZone.length === 0) return false;
  if (isSystemTimeZone(timeZone)) return true;

  try {
    new Intl.DateTimeFormat(UTC_TIME_ZONE, { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The runtime's own zone, normalized to `UTC` when the host cannot report one. */
export function getSystemTimeZone(): TimeZoneSetting {
  try {
    const resolved = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    return resolved && resolved.length > 0 ? resolved : UTC_TIME_ZONE;
  } catch {
    return UTC_TIME_ZONE;
  }
}

/**
 * Collapses a stored preference into a concrete zone usable by `Intl`.
 * Invalid or missing values degrade to `fallback` (the runtime zone), never throw.
 */
export function resolveTimeZone(
  timeZone: TimeZoneSetting | null | undefined,
  fallback: TimeZoneSetting = SYSTEM_TIME_ZONE,
): TimeZoneSetting {
  if (isValidTimeZone(timeZone)) return timeZone as TimeZoneSetting;
  if (isValidTimeZone(fallback)) return fallback;
  return getSystemTimeZone();
}

/**
 * Offset of `timeZone` from UTC at the given instant, in minutes.
 * DST-aware: the offset is computed for that specific instant.
 */
export function getUtcOffsetMinutes(
  millis: EpochMillis,
  timeZone: TimeZoneSetting = getSystemTimeZone(),
): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: resolveTimeZone(timeZone),
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(millis));

  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((part) => part.type === type)?.value ?? NaN);

  const asUtc = Date.UTC(
    read('year'),
    read('month') - 1,
    read('day'),
    read('hour'),
    read('minute'),
    read('second'),
  );

  return Math.round((asUtc - floorToEpochSecond(millis)) / 60_000);
}

/** Human-readable offset such as `UTC+09:00`. Locale-neutral by design. */
export function formatUtcOffset(offsetMinutes: number): string {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const hours = String(Math.floor(abs / 60)).padStart(2, '0');
  const minutes = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${hours}:${minutes}`;
}

/**
 * All IANA zones supported by the runtime, ascending by current UTC offset
 * so the dropdown reads west-to-east. Falls back to `['UTC']` on runtimes
 * without `Intl.supportedValuesOf`.
 */
export function listSupportedTimeZones(atMillis: EpochMillis = Date.now()): string[] {
  const source = typeof Intl.supportedValuesOf === 'function'
    ? Intl.supportedValuesOf('timeZone')
    : [];

  const zones = source.length > 0 ? [...source] : [UTC_TIME_ZONE];

  return zones.sort((a, b) => {
    const delta = getUtcOffsetMinutes(atMillis, a) - getUtcOffsetMinutes(atMillis, b);
    return delta !== 0 ? delta : a.localeCompare(b);
  });
}