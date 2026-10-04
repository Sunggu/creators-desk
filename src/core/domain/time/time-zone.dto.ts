/**
 * A user-configurable IANA time zone identifier (e.g. `Asia/Seoul`),
 * or the {@link SYSTEM_TIME_ZONE} sentinel meaning "follow the runtime".
 */
export type TimeZoneSetting = string;

/** Sentinel that defers to the host runtime (browser / worker) time zone. */
export const SYSTEM_TIME_ZONE: TimeZoneSetting = 'system';

export const UTC_TIME_ZONE = 'UTC';

/** Offset label for the follow-the-runtime option, resolved at render time. */
export const AUTO_TIME_ZONE_LABEL = 'auto';