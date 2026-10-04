import type { PreferencesDto } from '../../domain/preferences.dto';

/**
 * Persistence port for presentation preferences.
 *
 * Synchronous by design: preferences are read during the first render pass and
 * a locale/time-zone flip must not wait on a network round-trip.
 *
 * The adapter decides *where* they live. The current implementation uses
 * per-device storage, since preferences are ergonomics rather than domain state
 * and must never leak into the shared database.
 */
export interface PreferencesRepository {
  get(): PreferencesDto;
  save(preferences: PreferencesDto): void;
}