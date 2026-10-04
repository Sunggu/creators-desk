import { describe, expect, it } from 'vitest';
import { formatEpochDate, formatEpochDateTime, formatEpochTime } from './datetime';

const INSTANT = Date.parse('2026-01-02T03:04:05.000Z');

const SEOUL = { locale: 'ko', timeZone: 'Asia/Seoul' } as const;
const NEW_YORK = { locale: 'ko', timeZone: 'America/New_York' } as const;
const UTC = { locale: 'ko', timeZone: 'UTC' } as const;

describe('formatEpochDateTime', () => {
  it('renders the same instant differently per configured zone', () => {
    const seoul = formatEpochDateTime(INSTANT, SEOUL);
    const newYork = formatEpochDateTime(INSTANT, NEW_YORK);

    expect(seoul).not.toBe(newYork);
    expect(seoul).toContain('2026');
    expect(newYork).toContain('2026');
  });

  it('shifts the calendar day across the date line', () => {
    // 2026-01-02T03:04Z is still 2026-01-01 in New York.
    expect(formatEpochDate(INSTANT, SEOUL)).toContain('2026');
    expect(formatEpochDate(INSTANT, NEW_YORK)).toContain('2026');
    expect(formatEpochDate(INSTANT, SEOUL)).not.toBe(formatEpochDate(INSTANT, NEW_YORK));
  });

  it('renders identical output for zones with the same offset at that instant', () => {
    expect(formatEpochDateTime(INSTANT, SEOUL)).toBe(
      formatEpochDateTime(INSTANT, { locale: 'ko', timeZone: 'Asia/Tokyo' }),
    );
  });

  it('expands the system sentinel instead of throwing', () => {
    expect(() => formatEpochDateTime(INSTANT, { locale: 'ko', timeZone: 'system' })).not.toThrow();
    expect(formatEpochDateTime(INSTANT, { locale: 'ko', timeZone: 'system' }).length)
      .toBeGreaterThan(0);
  });

  it('falls back to a usable zone for an unknown preference', () => {
    expect(() => formatEpochDateTime(INSTANT, { locale: 'ko', timeZone: 'Mars/Olympus' }))
      .not.toThrow();
  });

  it('applies daylight saving at the rendered instant', () => {
    const winter = formatEpochTime(Date.parse('2026-01-15T17:00:00Z'), NEW_YORK);
    const summer = formatEpochTime(Date.parse('2026-07-15T17:00:00Z'), NEW_YORK);
    expect(winter).not.toBe(summer);
  });
});

describe('locale switching', () => {
  it('produces different copy per locale for the same instant and zone', () => {
    const korean = formatEpochDateTime(INSTANT, SEOUL);
    const english = formatEpochDateTime(INSTANT, { ...SEOUL, locale: 'en' });
    expect(korean).not.toBe(english);
  });
});

describe('UTC baseline', () => {
  it('renders the exact UTC wall clock for the UTC zone', () => {
    // 03:04:05Z stays 03:04 in UTC; Korean renders a 12-hour clock, so assert
    // on the hour rather than a zero-padded string.
    expect(formatEpochTime(INSTANT, UTC)).toContain('3:04');
    expect(formatEpochDate(INSTANT, UTC)).toContain('2026');
  });
});