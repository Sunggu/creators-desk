import { describe, expect, it } from 'vitest';
import {
  formatUtcOffset,
  getSystemTimeZone,
  getUtcOffsetMinutes,
  isSystemTimeZone,
  isValidTimeZone,
  isValidTimeZoneSetting,
  listSupportedTimeZones,
  toIntlTimeZone,
} from './time-zone';
import { SYSTEM_TIME_ZONE } from './time-zone.dto';

/** 2026-01-02T03:04:05.000Z */
const INSTANT = Date.parse('2026-01-02T03:04:05.000Z');

describe('isValidTimeZone', () => {
  it('accepts real IANA identifiers', () => {
    expect(isValidTimeZone('Asia/Seoul')).toBe(true);
    expect(isValidTimeZone('UTC')).toBe(true);
  });

  it('rejects the sentinel, because Intl cannot format with it', () => {
    expect(isValidTimeZone(SYSTEM_TIME_ZONE)).toBe(false);
  });

  it('rejects unknown zones and non-strings', () => {
    expect(isValidTimeZone('Mars/Olympus_Mons')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone(42)).toBe(false);
  });
});

describe('isValidTimeZoneSetting', () => {
  it('accepts a real zone or the sentinel', () => {
    expect(isValidTimeZoneSetting('Asia/Seoul')).toBe(true);
    expect(isValidTimeZoneSetting(SYSTEM_TIME_ZONE)).toBe(true);
    expect(isValidTimeZoneSetting('Mars/Olympus_Mons')).toBe(false);
  });
});

describe('isSystemTimeZone', () => {
  it('matches only the sentinel', () => {
    expect(isSystemTimeZone(SYSTEM_TIME_ZONE)).toBe(true);
    expect(isSystemTimeZone('Asia/Seoul')).toBe(false);
  });
});

describe('toIntlTimeZone', () => {
  it('keeps real zones and expands the sentinel to the runtime zone', () => {
    expect(toIntlTimeZone('Asia/Seoul')).toBe('Asia/Seoul');
    expect(toIntlTimeZone(SYSTEM_TIME_ZONE)).toBe(getSystemTimeZone());
  });

  it('degrades invalid or missing values to the fallback without throwing', () => {
    expect(toIntlTimeZone('Nope/Nope', 'Asia/Seoul')).toBe('Asia/Seoul');
    expect(toIntlTimeZone(null, 'Asia/Seoul')).toBe('Asia/Seoul');
    expect(toIntlTimeZone(undefined, 'Asia/Seoul')).toBe('Asia/Seoul');
    expect(toIntlTimeZone(undefined, 'Also/Nope')).toBe(getSystemTimeZone());
  });

  it('always returns something Intl can format with', () => {
    for (const candidate of [undefined, null, '', SYSTEM_TIME_ZONE, 'Nope/Nope', 'UTC']) {
      expect(() =>
        new Intl.DateTimeFormat('en-US', { timeZone: toIntlTimeZone(candidate) }),
      ).not.toThrow();
    }
  });
});

describe('getUtcOffsetMinutes', () => {
  it('reads half-hour and whole-hour offsets', () => {
    expect(getUtcOffsetMinutes(INSTANT, 'UTC')).toBe(0);
    expect(getUtcOffsetMinutes(INSTANT, 'Asia/Seoul')).toBe(540);
    expect(getUtcOffsetMinutes(INSTANT, 'Asia/Kolkata')).toBe(330);
    expect(getUtcOffsetMinutes(INSTANT, 'America/New_York')).toBe(-300);
  });

  it('tracks daylight saving transitions for the same zone', () => {
    const winter = getUtcOffsetMinutes(Date.parse('2026-01-15T12:00:00Z'), 'America/New_York');
    const summer = getUtcOffsetMinutes(Date.parse('2026-07-15T12:00:00Z'), 'America/New_York');
    expect(winter).toBe(-300);
    expect(summer).toBe(-240);
  });
});

describe('formatUtcOffset', () => {
  it('renders a signed, zero-padded offset', () => {
    expect(formatUtcOffset(0)).toBe('UTC+00:00');
    expect(formatUtcOffset(540)).toBe('UTC+09:00');
    expect(formatUtcOffset(330)).toBe('UTC+05:30');
    expect(formatUtcOffset(-300)).toBe('UTC-05:00');
  });
});

describe('listSupportedTimeZones', () => {
  it('returns zones sorted west-to-east by current offset', () => {
    const zones = listSupportedTimeZones(INSTANT);
    expect(zones.length).toBeGreaterThan(1);

    const offsets = zones.map((zone) => getUtcOffsetMinutes(INSTANT, zone));
    const sorted = [...offsets].sort((a, b) => a - b);
    expect(offsets).toEqual(sorted);
  });
});