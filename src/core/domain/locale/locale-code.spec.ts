import { describe, expect, it } from 'vitest';
import { isLocaleCode, resolveLocale, toIntlLocale } from './locale-code';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from './locale.dto';

describe('isLocaleCode', () => {
  it('accepts only locales with a bundle', () => {
    expect(SUPPORTED_LOCALES.every(isLocaleCode)).toBe(true);
    expect(isLocaleCode('fr')).toBe(false);
    expect(isLocaleCode(null)).toBe(false);
  });
});

describe('resolveLocale', () => {
  it('matches exactly, then falls back to the primary subtag', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('ko-KR')).toBe('ko');
    expect(resolveLocale('en-US')).toBe('en');
  });

  it('degrades unknown tags to the default locale', () => {
    expect(resolveLocale('fr-FR')).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(undefined)).toBe(DEFAULT_LOCALE);
    expect(resolveLocale(7)).toBe(DEFAULT_LOCALE);
  });
});

describe('toIntlLocale', () => {
  it('maps to a concrete BCP-47 tag for Intl', () => {
    expect(toIntlLocale('ko')).toBe('ko-KR');
    expect(toIntlLocale('en')).toBe('en-US');
  });
});