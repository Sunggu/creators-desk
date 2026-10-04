import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type LocaleCode,
} from './locale.dto';

const LOCALE_SET: ReadonlySet<string> = new Set(SUPPORTED_LOCALES);

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && LOCALE_SET.has(value);
}

/**
 * Narrows an arbitrary tag to a supported locale by exact match first, then by
 * primary subtag (`ko-KR` -> `ko`). Anything unknown degrades to
 * {@link DEFAULT_LOCALE} so the UI always renders readable copy.
 */
export function resolveLocale(
  value: unknown,
  fallback: LocaleCode = DEFAULT_LOCALE,
): LocaleCode {
  if (isLocaleCode(value)) return value;
  if (typeof value === 'string') {
    const primary = value.split('-')[0];
    if (isLocaleCode(primary)) return primary;
  }
  return fallback;
}

/** BCP-47 tag handed to `Intl`, e.g. `ko-KR`. */
export function toIntlLocale(locale: LocaleCode): string {
  return locale === 'ko' ? 'ko-KR' : 'en-US';
}