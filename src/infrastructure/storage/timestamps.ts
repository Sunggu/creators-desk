import type { EpochMillis } from '../../core/domain/time/epoch-millis.dto';

/** Any entity carrying the canonical epoch-millisecond timestamps. */
export interface TimestampedEntity {
  createdAt: EpochMillis;
  updatedAt: EpochMillis;
}

/**
 * Merges an update patch onto an existing entity, stamping `updatedAt` only
 * when the caller did not supply one.
 *
 * INVARIANT: **use cases own the timestamp.** A repository that unconditionally
 * overwrites `updatedAt` with its own `Date.now()` silently discards the value
 * the caller computed, which makes the persisted value depend on which adapter
 * happens to be active (HTTP vs IndexedDB) and makes tests non-deterministic.
 *
 * `fallbackMillis` comes from the injected {@link Clock}, never `Date.now()`
 * directly, so a test can pin time.
 */
export function applyUpdate<T extends TimestampedEntity>(
  existing: T,
  updates: Partial<T>,
  fallbackMillis: EpochMillis,
): T {
  return { ...existing, ...updates, updatedAt: updates.updatedAt ?? fallbackMillis };
}