import type { EpochMillis } from '../../core/domain/time/epoch-millis.dto';
import type { TimeZoneSetting } from '../../core/domain/time/time-zone.dto';
import { toIntlTimeZone } from '../../core/domain/time/time-zone';
import { toIntlLocale } from '../../core/domain/locale/locale-code';
import type { LocaleCode } from '../../core/domain/locale/locale.dto';

/**
 * Locale + zone pair every temporal formatter needs.
 *
 * Both inputs are *settings*, not resolved values: a `TimeZoneSetting` of
 * `'system'` is legal here and expanded at format time, which keeps callers
 * from having to remember to resolve it.
 */
export interface TemporalFormatContext {
  readonly locale: LocaleCode;
  readonly timeZone: TimeZoneSetting;
}

/**
 * Renders epoch milliseconds as an absolute date/time in the configured zone.
 *
 * This is the ONLY sanctioned path from a stored timestamp to displayed text.
 * Never call `toLocaleString()` directly on a `Date` - it would silently pin
 * the output to the host zone and ignore the user's preference.
 */
export function formatEpochDateTime(
  millis: EpochMillis,
  context: TemporalFormatContext,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  },
): string {
  return format(millis, context, options);
}

/** Date only, e.g. list rows and tooltips. */
export function formatEpochDate(
  millis: EpochMillis,
  context: TemporalFormatContext,
): string {
  return format(millis, context, { dateStyle: 'medium' });
}

/** Time only, e.g. the live clock in the status bar. */
export function formatEpochTime(
  millis: EpochMillis,
  context: TemporalFormatContext,
): string {
  return format(millis, context, { timeStyle: 'short' });
}

/** Full precision, for audit-style surfaces such as the project settings. */
export function formatEpochDateTimePrecise(
  millis: EpochMillis,
  context: TemporalFormatContext,
): string {
  return format(millis, context, {
    dateStyle: 'full',
    timeStyle: 'long',
  });
}

/** The zone currently in effect, with `system` already expanded. */
export function resolveDisplayTimeZone(context: TemporalFormatContext): TimeZoneSetting {
  return toIntlTimeZone(context.timeZone);
}

function format(
  millis: EpochMillis,
  context: TemporalFormatContext,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(toIntlLocale(context.locale), {
    ...options,
    timeZone: resolveDisplayTimeZone(context),
  }).format(new Date(millis));
}