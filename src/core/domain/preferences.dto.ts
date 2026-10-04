import type { LocaleCode } from './locale/locale.dto';
import type { TimeZoneSetting } from './time/time-zone.dto';

/**
 * User-owned presentation preferences.
 *
 * These are deliberately **not** persisted in the database: they are
 * per-device ergonomics, not domain state, and every timestamp they influence
 * is stored as epoch milliseconds and therefore stays zone-independent.
 */
export interface PreferencesDto {
  /** Active translation bundle. */
  readonly locale: LocaleCode;
  /**
   * Zone used to render every epoch-millisecond value. `'system'` follows the
   * runtime and is re-detected automatically.
   */
  readonly timeZone: TimeZoneSetting;
}