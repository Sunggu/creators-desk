import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { toIntlLocale } from '../core/domain/locale/locale-code';
import type { PreferencesDto } from '../core/domain/preferences.dto';
import type { UpdatePreferencesDto } from '../core/domain/update-preferences.dto';
import type { TimeZoneOption } from '../core/domain/time/time-zone-option.dto';
import type { EpochMillis } from '../core/domain/time/epoch-millis.dto';
import { nowEpochMillis } from '../core/domain/time/epoch-millis';
import { toIntlTimeZone } from '../core/domain/time/time-zone';
import { SYSTEM_TIME_ZONE } from '../core/domain/time/time-zone.dto';
import { managePreferencesUseCase } from '../infrastructure/di';
import { I18nContext } from './i18n-context';
import type { I18nContextValue } from './i18n-context.dto';
import {
  formatEpochDate,
  formatEpochDateTime,
  formatEpochDateTimePrecise,
  formatEpochTime,
  type TemporalFormatContext,
} from './format/datetime';
import { formatRelativeTo } from './format/relative-text';
import { createResourceTranslator, verifyResourceCoverage } from './resources';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [preferences, setPreferences] = useState<PreferencesDto>(() =>
    managePreferencesUseCase.getPreferences(),
  );

  const updatePreferences = useCallback((patch: UpdatePreferencesDto): PreferencesDto => {
    const next = managePreferencesUseCase.updatePreferences(patch);
    setPreferences(next);
    return next;
  }, []);

  useDocumentLanguage(preferences);
  useResourceParityCheck();

  const value = useMemo<I18nContextValue>(
    () => createI18nValue(preferences, updatePreferences),
    [preferences, updatePreferences],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function createI18nValue(
  preferences: PreferencesDto,
  updatePreferences: (patch: UpdatePreferencesDto) => PreferencesDto,
): I18nContextValue {
  const translator = createResourceTranslator(preferences.locale);
  const temporal: TemporalFormatContext = {
    locale: preferences.locale,
    timeZone: preferences.timeZone,
  };
  const intlLocale = toIntlLocale(preferences.locale);

  // Built on first call, not on mount: enumerating ~400 zones is only worth
  // paying for when the settings screen actually asks for the list.
  let timeZoneOptions: TimeZoneOption[] | null = null;

  return {
    t: translator.t,
    has: translator.has,
    locale: preferences.locale,
    timeZone: preferences.timeZone,
    resolvedTimeZone: toIntlTimeZone(preferences.timeZone),
    isSystemTimeZone: preferences.timeZone === SYSTEM_TIME_ZONE,

    updatePreferences,
    listTimeZoneOptions: () => {
      timeZoneOptions ??= managePreferencesUseCase.listTimeZoneOptions();
      return timeZoneOptions;
    },

    formatDateTime: (millis: EpochMillis) => formatEpochDateTime(millis, temporal),
    formatDate: (millis: EpochMillis) => formatEpochDate(millis, temporal),
    formatTime: (millis: EpochMillis) => formatEpochTime(millis, temporal),
    formatDateTimePrecise: (millis: EpochMillis) =>
      formatEpochDateTimePrecise(millis, temporal),
    formatRelative: (millis: EpochMillis, reference: EpochMillis = nowEpochMillis()) =>
      formatRelativeTo(millis, reference, translator.t),
    formatNumber: (value: number) => new Intl.NumberFormat(intlLocale).format(value),
  };
}

/**
 * Keeps `<html lang>` and the document title in step with the active locale.
 *
 * The `lang` attribute is what assistive technology and browser translation
 * prompts key off, so it must not stay pinned to the value in `index.html`.
 */
function useDocumentLanguage(preferences: PreferencesDto): void {
  useEffect(() => {
    document.documentElement.lang = toIntlLocale(preferences.locale);
  }, [preferences.locale]);

  useEffect(() => {
    document.title = createResourceTranslator(preferences.locale).t('app.name');
  }, [preferences.locale]);
}

/**
 * Reports bundle gaps once per session in development.
 *
 * A missing key degrades to the Korean baseline at runtime, which is correct
 * but easy to miss - this makes an incomplete translation visible immediately.
 */
function useResourceParityCheck(): void {
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const missing = verifyResourceCoverage();
    if (missing.length > 0) {
      console.warn(`[i18n] ${missing.length} untranslated resource(s):`, missing);
    }
  }, []);
}