import { useContext } from 'react';
import { I18nContext } from './i18n-context';
import type { I18nContextValue } from './i18n-context.dto';
import type { HasResourceFn, TranslateFn } from './translate-fn.dto';

/**
 * Access to the full i18n surface: `t`, the formatters, and the preferences
 * write path.
 *
 * Throws outside `<I18nProvider>` - a missing provider is a wiring bug, and
 * failing loudly beats silently rendering every key verbatim.
 */
export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error('useI18n must be used within an <I18nProvider>');
  }
  return value;
}

/**
 * The common case: a component that only needs to render copy.
 *
 * A named alias rather than a second context, so there is a single source of
 * truth for i18n state and no risk of the two drifting apart.
 */
export function useTranslate(): TranslateFn {
  return useI18n().t;
}

/** Existence check for a resource key. */
export function useHasResource(): HasResourceFn {
  return useI18n().has;
}