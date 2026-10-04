import { createContext } from 'react';
import type { I18nContextValue } from './i18n-context.dto';

/**
 * Context for the i18n bundle and the user's time-zone preference.
 *
 * Kept in its own module (separate from the provider and the hooks) so that
 * `react-refresh` does not treat the provider file as a mixed-export module.
 */
export const I18nContext = createContext<I18nContextValue | null>(null);