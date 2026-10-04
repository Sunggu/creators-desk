import type { PreferencesRepository } from '../../core/application/ports/preferences.repository';
import { resolvePreferences } from '../../core/domain/preferences';
import type { PreferencesDto } from '../../core/domain/preferences.dto';
import { SYSTEM_TIME_ZONE } from '../../core/domain/time/time-zone.dto';
import { DEFAULT_LOCALE } from '../../core/domain/locale/locale.dto';

const STORAGE_KEY = 'creators_desk_preferences';

/**
 * Per-device preferences, stored as a single JSON blob.
 *
 * Deliberately local rather than server-backed: locale and time zone are
 * ergonomics, not shared state. Putting them in the database would mean a
 * stored timestamp's *rendering* depended on a network round-trip, and would
 * need a migration on every schema change.
 *
 * Synchronous reads matter here - the first paint has to know the locale and
 * the zone, otherwise the UI would flash one zone and then correct itself.
 */
export class LocalPreferencesRepository implements PreferencesRepository {
  get(): PreferencesDto {
    return resolvePreferences(this.readRaw());
  }

  save(preferences: PreferencesDto): void {
    if (typeof window === 'undefined' || !window.localStorage) return;

    try {
      // Normalize on the way out so hand-edited or legacy values cannot
      // accumulate in storage.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resolvePreferences(preferences)));
    } catch {
      // Storage can be unavailable (private mode, quota). Preferences are not
      // critical, so a failed write must not break the session.
    }
  }

  private readRaw(): unknown {
    if (typeof window === 'undefined' || !window.localStorage) return undefined;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw === null ? undefined : JSON.parse(raw);
    } catch {
      return undefined;
    }
  }
}

export const DEFAULT_PREFERENCES: PreferencesDto = {
  locale: DEFAULT_LOCALE,
  timeZone: SYSTEM_TIME_ZONE,
};

export const localPreferencesRepository = new LocalPreferencesRepository();