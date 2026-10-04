import type { EpochMillis } from '../../domain/time/epoch-millis.dto';

/**
 * Source of the current instant, expressed as epoch milliseconds.
 *
 * Exists so that time-dependent use cases are deterministic under test: inject
 * a fixed clock instead of monkey-patching `Date.now()`.
 */
export interface Clock {
  now(): EpochMillis;
}