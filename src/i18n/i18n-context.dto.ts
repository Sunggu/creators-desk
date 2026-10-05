import type { LocaleCode } from '../core/domain/locale/locale.dto';
import type { TimeZoneSetting } from '../core/domain/time/time-zone.dto';
import type { PreferencesDto } from '../core/domain/preferences.dto';
import type { UpdatePreferencesDto } from '../core/domain/update-preferences.dto';
import type { TimeZoneOption } from '../core/domain/time/time-zone-option.dto';
import type { EpochMillis } from '../core/domain/time/epoch-millis.dto';
import type { HasResourceFn, TranslateFn } from './translate-fn.dto';

/**
 * Everything the presentation layer needs to render text and time.
 *
 * All formatters are pre-bound to the active locale and time zone, so a
 * component never threads either through props - and therefore never
 * re-implements formatting.
 */
export interface I18nContextValue {
  /** Translation function. Only accepts compile-time-checked keys. */
  readonly t: TranslateFn;
  /** True when a resource exists, useful for progressive disclosure. */
  readonly has: HasResourceFn;
  readonly locale: LocaleCode;
  /** The stored preference, which may be the `'system'` sentinel. */
  readonly timeZone: TimeZoneSetting;
  /** The concrete zone in effect, with `'system'` already expanded. */
  readonly resolvedTimeZone: TimeZoneSetting;
  /** True when the stored preference is the follow-the-runtime sentinel. */
  readonly isSystemTimeZone: boolean;
  /** Merges and persists a preference patch; returns the stored result. */
  readonly updatePreferences: (patch: UpdatePreferencesDto) => PreferencesDto;
  /** Rows for the time-zone picker. Memoized - built on first call. */
  readonly listTimeZoneOptions: () => TimeZoneOption[];

  /** Absolute date + time in the configured zone. */
  readonly formatDateTime: (millis: EpochMillis) => string;
  /** Date only, in the configured zone. */
  readonly formatDate: (millis: EpochMillis) => string;
  /** Time only, in the configured zone. */
  readonly formatTime: (millis: EpochMillis) => string;
  /** Full-precision stamp, for audit-style rows. */
  readonly formatDateTimePrecise: (millis: EpochMillis) => string;
  /** Localized "3 minutes ago" / "in 3 minutes" / "just now". */
  readonly formatRelative: (millis: EpochMillis, reference?: EpochMillis) => string;
  /** Zone-aware digit grouping, e.g. `1,024`. */
  readonly formatNumber: (value: number) => string;
}