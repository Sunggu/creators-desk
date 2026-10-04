/**
 * Canonical temporal representation for the entire application.
 *
 * INVARIANT: every timestamp that is created, persisted, transported or compared
 * is expressed as **milliseconds since the Unix epoch (UTC)**. A local-time string,
 * a naive `YYYY-MM-DD HH:mm:ss` value or an offset-bearing ISO string MUST NOT be
 * stored anywhere. Local time exists only at the very edge of the system, in the
 * presentation layer, and is derived from the user's configured time zone.
 *
 * Because the epoch value is time-zone agnostic, a stored `updatedAt` renders
 * correctly for every user in any zone without any migration or rewriting.
 */
export type EpochMillis = number;

/** Lower bound of a representable timestamp. */
export const EPOCH_MILLIS_MIN = 0;

export const MILLIS_PER_SECOND = 1_000;
export const MILLIS_PER_MINUTE = 60_000;
export const MILLIS_PER_HOUR = 3_600_000;
export const MILLIS_PER_DAY = 86_400_000;

/** Approximate month/year lengths, used only for relative-time bucketing. */
export const MILLIS_PER_MONTH = 2_592_000_000;
export const MILLIS_PER_YEAR = 31_536_000_000;