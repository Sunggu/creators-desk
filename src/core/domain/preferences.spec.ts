import { describe, expect, it } from 'vitest';
import { buildTimeZoneOptions, resolvePreferences } from './preferences';
import { SYSTEM_TIME_ZONE } from './time/time-zone.dto';

/** 2026-01-02T03:04:05.000Z */
const INSTANT = Date.parse('2026-01-02T03:04:05.000Z');

describe('resolvePreferences', () => {
  it('keeps a valid pair untouched', () => {
    expect(resolvePreferences({ locale: 'en', timeZone: 'Asia/Seoul' })).toEqual({
      locale: 'en',
      timeZone: 'Asia/Seoul',
    });
  });

  it('repairs unknown or missing values instead of throwing', () => {
    expect(resolvePreferences(undefined)).toEqual({
      locale: 'ko',
      timeZone: SYSTEM_TIME_ZONE,
    });
    expect(resolvePreferences({ locale: 'fr', timeZone: 'Mars/Olympus' })).toEqual({
      locale: 'ko',
      timeZone: SYSTEM_TIME_ZONE,
    });
    expect(resolvePreferences({ timeZone: SYSTEM_TIME_ZONE })).toEqual({
      locale: 'ko',
      timeZone: SYSTEM_TIME_ZONE,
    });
  });

  it('expands a regional locale tag onto a bundle', () => {
    expect(resolvePreferences({ locale: 'ko-KR' }).locale).toBe('ko');
  });
});

describe('buildTimeZoneOptions', () => {
  it('puts the follow-the-runtime row first', () => {
    const options = buildTimeZoneOptions(INSTANT, 'Asia/Seoul');

    expect(options[0].isSystem).toBe(true);
    expect(options[0].value).toBe(SYSTEM_TIME_ZONE);
    expect(options[0].label).toContain('Asia/Seoul');
    expect(options[0].label).toContain('UTC+09:00');
  });

  it('lists real zones with their offsets, ascending', () => {
    const options = buildTimeZoneOptions(INSTANT, 'Asia/Seoul');
    const zones = options.filter((option) => !option.isSystem);

    expect(zones.length).toBeGreaterThan(10);
    expect(zones[0].label).toMatch(/UTC[+-]\d{2}:\d{2}$/);

    const offsets = zones.map((zone) => zone.offsetMinutes);
    expect(offsets).toEqual([...offsets].sort((a, b) => a - b));
  });

  it('never offers a zone the runtime cannot format with', () => {
    const options = buildTimeZoneOptions(INSTANT, 'UTC');
    for (const option of options) {
      if (option.isSystem) continue;
      expect(() => new Intl.DateTimeFormat('UTC', { timeZone: option.value })).not.toThrow();
    }
  });
});