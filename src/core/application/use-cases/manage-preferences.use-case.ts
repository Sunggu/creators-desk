import type { PreferencesDto } from '../../domain/preferences.dto';
import { resolvePreferences, buildTimeZoneOptions } from '../../domain/preferences';
import type { TimeZoneOption } from '../../domain/time/time-zone-option.dto';
import type { UpdatePreferencesDto } from '../../domain/update-preferences.dto';
import type { PreferencesRepository } from '../ports/preferences.repository';

/**
 * Read/write access to user preferences, with validation applied on the way in
 * and repair applied on the way out.
 *
 * No i18n catalog lives here: this use case deals in locale ids and zone ids
 * only, which keeps it independent of any resource bundle (Rule 3).
 */
export class ManagePreferencesUseCase {
  private readonly preferencesRepo: PreferencesRepository;

  constructor(preferencesRepo: PreferencesRepository) {
    this.preferencesRepo = preferencesRepo;
  }

  /** Current preferences, sanitized. Safe to call before any write. */
  getPreferences(): PreferencesDto {
    return resolvePreferences(this.preferencesRepo.get());
  }

  /**
   * Applies a partial patch and persists the merged result.
   * Invalid incoming values fall back to the current value instead of throwing,
   * so a stale client can never brick the settings screen.
   */
  updatePreferences(patch: UpdatePreferencesDto): PreferencesDto {
    const current = this.getPreferences();
    const merged = resolvePreferences({
      ...current,
      ...(patch.locale !== undefined ? { locale: patch.locale } : {}),
      ...(patch.timeZone !== undefined ? { timeZone: patch.timeZone } : {}),
    });
    this.preferencesRepo.save(merged);
    return merged;
  }

  /** Rows for the time-zone picker, ordered by current UTC offset. */
  listTimeZoneOptions(): TimeZoneOption[] {
    return buildTimeZoneOptions();
  }
}