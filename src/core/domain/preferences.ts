import type { EpochMillis } from './time/epoch-millis.dto';
import { nowEpochMillis } from './time/epoch-millis';
import type { TimeZoneOption } from './time/time-zone-option.dto';
import {
  formatUtcOffset,
  getSystemTimeZone,
  getUtcOffsetMinutes,
  isValidTimeZoneSetting,
  listSupportedTimeZones,
} from './time/time-zone';
import { AUTO_TIME_ZONE_LABEL, SYSTEM_TIME_ZONE } from './time/time-zone.dto';
import { DEFAULT_LOCALE } from './locale/locale.dto';
import { resolveLocale } from './locale/locale-code';
import type { PreferencesDto } from './preferences.dto';

/**
 * Coerces anything that reached storage - possibly hand-edited, possibly written
 * by an older build - into a usable preference set. Never throws.
 */
export function resolvePreferences(input: unknown): PreferencesDto {
  const source = (input ?? {}) as Partial<PreferencesDto>;

  return {
    locale: resolveLocale(source.locale, DEFAULT_LOCALE),
    timeZone: isValidTimeZoneSetting(source.timeZone) ? source.timeZone : SYSTEM_TIME_ZONE,
  };
}

/**
 * Builds the picker rows: the follow-the-runtime entry first, then every zone the
 * runtime knows, ordered west-to-east by current offset.
 */
export function buildTimeZoneOptions(
  atMillis: EpochMillis = nowEpochMillis(),
  systemTimeZone: string = getSystemTimeZone(),
): TimeZoneOption[] {
  const systemOffset = getUtcOffsetMinutes(atMillis, systemTimeZone);

  const systemOption: TimeZoneOption = {
    value: SYSTEM_TIME_ZONE,
    label: `${AUTO_TIME_ZONE_LABEL} (${systemTimeZone} ${formatUtcOffset(systemOffset)})`,
    offsetMinutes: systemOffset,
    isSystem: true,
  };

  const zones = listSupportedTimeZones(atMillis).map((zone): TimeZoneOption => {
    const offsetMinutes = getUtcOffsetMinutes(atMillis, zone);
    return {
      value: zone,
      label: `${zone} ${formatUtcOffset(offsetMinutes)}`,
      offsetMinutes,
      isSystem: false,
    };
  });

  return [systemOption, ...zones];
}