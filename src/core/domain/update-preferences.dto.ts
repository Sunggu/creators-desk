import type { LocaleCode } from './locale/locale.dto';
import type { TimeZoneSetting } from './time/time-zone.dto';

/** Partial preference patch. Omitted fields are left untouched. */
export interface UpdatePreferencesDto {
  readonly locale?: LocaleCode;
  readonly timeZone?: TimeZoneSetting;
}